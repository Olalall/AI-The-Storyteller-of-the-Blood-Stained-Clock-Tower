param(
  [Parameter(Mandatory = $true)]
  [string]$PublicUrl,
  [string]$AppDir = "C:\botc-storyteller-companion",
  [ValidatePattern('^[A-Za-z0-9_.-]+$')]
  [string]$TaskName = "botc-storyteller-backend",
  [ValidatePattern('^[A-Za-z0-9_.-]+$')]
  [string]$ServiceName = "Cloudflared",
  [ValidateRange(1, 65535)]
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
Add-Type -AssemblyName System.ServiceProcess
$publicUri = $null
if (-not [uri]::TryCreate($PublicUrl, [UriKind]::Absolute, [ref]$publicUri) -or $publicUri.Scheme -ne "https" -or $publicUri.UserInfo -or $publicUri.Query -or $publicUri.Fragment -or $publicUri.AbsolutePath -ne "/") {
  throw "PublicUrl must be an HTTPS root URL without credentials, query or fragment"
}
$publicBase = $publicUri.GetLeftPart([UriPartial]::Authority)
$resolvedAppDir = (Resolve-Path -LiteralPath $AppDir).Path
$logDir = Join-Path $resolvedAppDir "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$statePath = Join-Path $logDir "cloudflare-healthcheck-state.json"
$logPath = Join-Path $logDir "cloudflare-healthcheck.log"
$state = [ordered]@{ failureCount = 0; lastRecoveryAtUtc = $null; recoveryAttemptsUtc = @(); pendingRecovery = $null; checkedAt = $null; outcome = "starting"; serviceState = $null; readyStatus = $null; readyConnections = $null }

function Save-Check {
  param([string]$Outcome)
  $state.checkedAt = [DateTimeOffset]::UtcNow.ToString("o")
  $state.outcome = $Outcome
  $state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath "$statePath.tmp" -Encoding UTF8
  Move-Item -LiteralPath "$statePath.tmp" -Destination $statePath -Force
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value "$($state.checkedAt) $Outcome failures=$($state.failureCount) service=$($state.serviceState) ready=$($state.readyStatus) connections=$($state.readyConnections) attempts=$($state.recoveryAttemptsUtc.Count)"
}

function Get-MainTask {
  $task = Get-ScheduledTask -TaskName $TaskName -TaskPath "\" -ErrorAction Stop
  if ($task.Actions.Count -ne 1 -or [string]::IsNullOrWhiteSpace($task.Actions[0].WorkingDirectory)) { throw "Main task action is not eligible" }
  if ((Resolve-Path -LiteralPath $task.Actions[0].WorkingDirectory).Path.TrimEnd('\') -ine $resolvedAppDir.TrimEnd('\')) { throw "Main task directory does not match AppDir" }
  return $task
}

function Get-TunnelService {
  $service = Get-CimInstance -ClassName Win32_Service -Filter "Name='$ServiceName'" -Property Name, State, StartMode, ProcessId -ErrorAction Stop
  if (-not $service) { throw "Tunnel service is not installed" }
  $state.serviceState = $service.State
  return $service
}

function Get-TunnelProcess {
  param($Service)
  if ($Service.ProcessId -le 0) { return $null }
  $process = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=$($Service.ProcessId)" -Property ProcessId, Name, CreationDate -ErrorAction Stop
  if ($process.Name -ine "cloudflared.exe" -or -not $process.CreationDate) { return $null }
  return $process
}

function Test-Site {
  param([string]$BaseUrl, [switch]$Public)
  try {
    $suffix = if ($Public) { "?_botc_tunnel_check=$([guid]::NewGuid().ToString('N'))" } else { "" }
    $headers = @{ "Cache-Control" = "no-cache, no-store"; Pragma = "no-cache" }
    $health = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/healthz$suffix" -Headers $headers -TimeoutSec 5 -MaximumRedirection 0
    $body = $health.Content | ConvertFrom-Json
    if ($health.StatusCode -ne 200 -or $body.ok -isnot [bool] -or -not $body.ok -or $body.service -cne "botc-storyteller-backend") { return $false }
    $page = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/$suffix" -Headers $headers -TimeoutSec 5 -MaximumRedirection 0
    return ($page.StatusCode -eq 200 -and $page.Content -match '<div\b[^>]*\bid\s*=\s*["'']root["'']')
  } catch { return $false }
}

function Read-Ready {
  param($Service)
  if ($Service.ProcessId -le 0) { return }
  $listeners = @(Get-NetTCPConnection -State Listen -OwningProcess $Service.ProcessId -ErrorAction SilentlyContinue | Where-Object { $_.LocalAddress -in @("127.0.0.1", "::1") } | Sort-Object LocalAddress, LocalPort -Unique | Select-Object -First 2)
  foreach ($listener in $listeners) {
    $address = if ($listener.LocalAddress -eq "::1") { "[::1]" } else { "127.0.0.1" }
    try {
      $ready = Invoke-WebRequest -UseBasicParsing -Uri "http://${address}:$($listener.LocalPort)/ready" -TimeoutSec 3 -MaximumRedirection 0
      $state.readyStatus = [int]$ready.StatusCode
      try {
        $body = $ready.Content | ConvertFrom-Json
        if (($body.readyConnections -is [int] -or $body.readyConnections -is [long]) -and $body.readyConnections -ge 0) { $state.readyConnections = $body.readyConnections }
      } catch {}
      if ($ready.StatusCode -eq 200) { return }
    } catch {
      $state.readyStatus = "unavailable"
      if ($_.Exception.Response) { $state.readyStatus = [int]$_.Exception.Response.StatusCode }
    }
  }
}

function Get-RecoveryService {
  $task = Get-MainTask
  $service = Get-TunnelService
  if (-not $task.Settings.Enabled -or $task.State -eq "Disabled" -or $service.StartMode -eq "Disabled") {
    $state.failureCount = 0; Save-Check "skipped-maintenance"; return $null
  }
  return $service
}

function Complete-Recovery {
  param($Service, [switch]$Resume)
  $Service = Get-RecoveryService
  if (-not $Service) { return }
  if ($Service.State -ne "Stopped") {
    $process = Get-TunnelProcess $Service
    $pending = $state.pendingRecovery
    if (-not $pending -or -not $process -or $Service.ProcessId -ne $pending.processId -or $process.CreationDate.ToUniversalTime().ToString("o") -ne $pending.createdAtUtc) { $state.pendingRecovery = $null; Save-Check "service-identity-changed"; return }
    $controller = New-Object -TypeName System.ServiceProcess.ServiceController -ArgumentList $ServiceName
    if (-not $Resume) {
      try { $controller.Stop() } catch { Save-Check "stop-request-$($_.Exception.GetType().Name)" }
    }
    try { $controller.WaitForStatus([System.ServiceProcess.ServiceControllerStatus]::Stopped, [TimeSpan]::FromSeconds(10)) } catch {}
    $service = Get-RecoveryService
    if (-not $service) { return }
    if ($service.State -ne "Stopped") {
      $process = Get-TunnelProcess $service
      $pending = $state.pendingRecovery
      if (-not $pending -or -not $process -or $service.ProcessId -ne $pending.processId -or $process.CreationDate.ToUniversalTime().ToString("o") -ne $pending.createdAtUtc) {
        $state.pendingRecovery = $null; Save-Check "service-identity-changed"; return
      }
      $service = Get-RecoveryService
      if (-not $service) { return }
      $process = Get-TunnelProcess $service
      if (-not $process -or $service.ProcessId -ne $pending.processId -or $process.CreationDate.ToUniversalTime().ToString("o") -ne $pending.createdAtUtc) { Save-Check "service-identity-changed"; return }
      Stop-Process -Id $pending.processId -Force -ErrorAction Stop
      try { $controller.WaitForStatus([System.ServiceProcess.ServiceControllerStatus]::Stopped, [TimeSpan]::FromSeconds(10)) } catch {}
    }
  }
  $service = Get-RecoveryService
  if (-not $service) { return }
  if ($service.State -eq "Running") { $state.pendingRecovery = $null; Save-Check "already-recovered"; return }
  if ($service.State -ne "Stopped") { Save-Check "recovery-pending"; return }
  $controller = New-Object -TypeName System.ServiceProcess.ServiceController -ArgumentList $ServiceName
  $controller.Start()
  $controller.WaitForStatus([System.ServiceProcess.ServiceControllerStatus]::Running, [TimeSpan]::FromSeconds(10))
  $state.pendingRecovery = $null
  Save-Check "recovered"
}

try {
  if (Test-Path -LiteralPath $statePath) {
    try {
      $stored = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
      if (($stored.failureCount -isnot [int] -and $stored.failureCount -isnot [long]) -or $stored.failureCount -lt 0 -or $stored.failureCount -gt 3 -or $stored.recoveryAttemptsUtc -isnot [array] -or $stored.recoveryAttemptsUtc.Count -gt 3 -or $stored.PSObject.Properties.Name -notcontains "lastRecoveryAtUtc") { throw "Invalid state" }
      if ($stored.lastRecoveryAtUtc) { [void][DateTimeOffset]::Parse($stored.lastRecoveryAtUtc) }
      foreach ($attempt in $stored.recoveryAttemptsUtc) { [void][DateTimeOffset]::Parse($attempt) }
      if ($stored.pendingRecovery) {
        if ($stored.pendingRecovery.serviceName -cne $ServiceName -or $stored.pendingRecovery.processId -le 0) { throw "Invalid pending identity" }
        [void][DateTimeOffset]::Parse($stored.pendingRecovery.createdAtUtc)
        [void][DateTimeOffset]::Parse($stored.pendingRecovery.requestedAtUtc)
      }
      $state.failureCount = $stored.failureCount
      $state.lastRecoveryAtUtc = $stored.lastRecoveryAtUtc
      $state.recoveryAttemptsUtc = @($stored.recoveryAttemptsUtc | Where-Object { [DateTimeOffset]::Parse($_) -gt [DateTimeOffset]::UtcNow.AddHours(-1) })
      $state.pendingRecovery = $stored.pendingRecovery
    } catch {
      $state.lastRecoveryAtUtc = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Check "state-reset-cooldown"
    }
  }
  $service = Get-RecoveryService
  if (-not $service) { return }
  if (-not (Test-Site "http://127.0.0.1:$Port")) { $state.failureCount = 0; Save-Check "local-unhealthy"; return }
  $publicHealthy = Test-Site $publicBase -Public
  Read-Ready $service
  if ($publicHealthy) { $state.failureCount = 0; $state.pendingRecovery = $null; Save-Check "healthy"; return }
  $resume = $false
  $process = Get-TunnelProcess $service
  if ($state.pendingRecovery) {
    $pendingAge = ([DateTimeOffset]::UtcNow - [DateTimeOffset]::Parse($state.pendingRecovery.requestedAtUtc)).TotalSeconds
    if ($pendingAge -ge 0 -and $pendingAge -lt 300) {
      $resume = $service.State -eq "Stopped" -or ($service.State -match '^Stop\s?Pending$' -and $process -and $service.ProcessId -eq $state.pendingRecovery.processId -and $process.CreationDate.ToUniversalTime().ToString("o") -eq $state.pendingRecovery.createdAtUtc)
    }
  }
  if ($service.State -match "Pending" -and -not $resume) { $state.failureCount = 0; Save-Check "skipped-service-pending"; return }
  if ($service.State -eq "Running" -and $process) {
    $age = ([DateTime]::UtcNow - $process.CreationDate.ToUniversalTime()).TotalSeconds
    if ($age -ge 0 -and $age -lt 60) { $state.failureCount = 0; Save-Check "startup-grace"; return }
  }
  if (-not $resume) {
    $state.failureCount = [Math]::Min(3, $state.failureCount + 1)
    if ($state.failureCount -lt 3) { Save-Check "public-unhealthy"; return }
    if ($state.lastRecoveryAtUtc -and [DateTimeOffset]::UtcNow -lt ([DateTimeOffset]::Parse($state.lastRecoveryAtUtc)).AddMinutes(5)) { Save-Check "cooldown"; return }
    if ($state.recoveryAttemptsUtc.Count -ge 3) { Save-Check "hourly-budget"; return }
    if ($service.State -eq "Running" -and -not $process) { Save-Check "process-identity-unavailable"; return }
    $now = [DateTimeOffset]::UtcNow.ToString("o")
    $state.lastRecoveryAtUtc = $now
    $state.recoveryAttemptsUtc = @($state.recoveryAttemptsUtc) + @($now)
    $state.failureCount = 0
    if ($process) { $state.pendingRecovery = @{ serviceName = $ServiceName; processId = $process.ProcessId; createdAtUtc = $process.CreationDate.ToUniversalTime().ToString("o"); requestedAtUtc = $now } }
    Save-Check "recovery-requested"
  }
  if (-not (Test-Site "http://127.0.0.1:$Port")) { $state.failureCount = 0; Save-Check "local-unhealthy-before-recovery"; return }
  $service = Get-RecoveryService
  if ($service) { Complete-Recovery $service -Resume:$resume }
} catch {
  $errorType = $_.Exception.GetType().Name
  Save-Check "error-$errorType"
  Write-Error "Tunnel healthcheck failed ($errorType)" -ErrorAction Continue
  exit 1
}
