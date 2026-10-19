param(
  [ValidatePattern('^[^\\/*?\[\]\r\n]+$')]
  [string]$TaskName = "botc-storyteller-backend",
  [string]$AppDir = "C:\botc-storyteller-companion",
  [ValidateRange(1, 65535)]
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$resolvedAppDir = (Resolve-Path -LiteralPath $AppDir).Path
$logDir = Join-Path $resolvedAppDir "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$statePath = Join-Path $logDir "healthcheck-state.json"
$logPath = Join-Path $logDir "healthcheck.log"
$state = [ordered]@{ failureCount = 0; lastRestartAtUtc = $null; checkedAt = $null; outcome = "starting" }

function Save-Check {
  param([string]$Outcome)
  $state.checkedAt = [DateTimeOffset]::UtcNow.ToString("o")
  $state.outcome = $Outcome
  $state | ConvertTo-Json | Set-Content -LiteralPath "$statePath.tmp" -Encoding UTF8
  Move-Item -LiteralPath "$statePath.tmp" -Destination $statePath -Force
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value "$($state.checkedAt) $Outcome failures=$($state.failureCount)"
}

function Get-MainTask {
  $task = Get-ScheduledTask -TaskName $TaskName -TaskPath "\" -ErrorAction Stop
  if ($task.Actions.Count -ne 1 -or [string]::IsNullOrWhiteSpace($task.Actions[0].WorkingDirectory)) {
    throw "Main task must have one action with an explicit WorkingDirectory"
  }
  $workingDir = (Resolve-Path -LiteralPath $task.Actions[0].WorkingDirectory).Path
  if ($workingDir.TrimEnd('\') -ine $resolvedAppDir.TrimEnd('\')) { throw "Main task WorkingDirectory does not match AppDir" }
  return $task
}

function Test-HttpHealth {
  try {
    $health = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/healthz" -TimeoutSec 5 -MaximumRedirection 0
    $body = $health.Content | ConvertFrom-Json
    if ($health.StatusCode -ne 200 -or $body.ok -isnot [bool] -or -not $body.ok -or $body.service -cne "botc-storyteller-backend") { return $false }
    $page = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$Port/" -TimeoutSec 5 -MaximumRedirection 0
    return ($page.StatusCode -eq 200 -and $page.Content -match '<div\b[^>]*\bid\s*=\s*["'']root["'']')
  } catch { return $false }
}

try {
  if (Test-Path -LiteralPath $statePath) {
    try {
      $stored = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
      if (($stored.failureCount -isnot [int] -and $stored.failureCount -isnot [long]) -or $stored.failureCount -lt 0 -or $stored.failureCount -gt 3 -or $stored.PSObject.Properties.Name -notcontains "lastRestartAtUtc") {
        throw "Invalid healthcheck state"
      }
      if ($null -ne $stored.lastRestartAtUtc) { [void][DateTimeOffset]::Parse($stored.lastRestartAtUtc) }
      $state.failureCount = $stored.failureCount
      $state.lastRestartAtUtc = $stored.lastRestartAtUtc
    } catch {
      $state.lastRestartAtUtc = [DateTimeOffset]::UtcNow.ToString("o")
      Save-Check "state-reset-cooldown"
    }
  }

  $task = Get-MainTask
  if (-not $task.Settings.Enabled -or $task.State -eq "Disabled") {
    $state.failureCount = 0; Save-Check "skipped-disabled"; return
  }
  if ($task.State -ne "Running") {
    $state.failureCount = 0; Save-Check "skipped-not-running"; return
  }
  $runtimePath = [regex]::Escape((Join-Path $resolvedAppDir "dist-server\runtime.mjs"))
  $runtimeArgument = '(?:^|\s)(?:"' + $runtimePath + '"|' + $runtimePath + ')(?=\s|$)'
  foreach ($nodeProcess in (Get-CimInstance -ClassName Win32_Process -Filter "Name='node.exe'" -ErrorAction Stop)) {
    if ($nodeProcess.CommandLine -notmatch $runtimeArgument -or -not $nodeProcess.CreationDate) { continue }
    $nodeAge = ([DateTime]::UtcNow - $nodeProcess.CreationDate.ToUniversalTime()).TotalSeconds
    if ($nodeAge -ge 0 -and $nodeAge -lt 60) {
      $state.failureCount = 0; Save-Check "startup-grace"; return
    }
  }
  if (Test-HttpHealth) {
    $state.failureCount = 0; Save-Check "healthy"; return
  }
  $state.failureCount = [Math]::Min(3, $state.failureCount + 1)
  if ($state.failureCount -lt 3) { Save-Check "unhealthy"; return }
  if ($state.lastRestartAtUtc -and [DateTimeOffset]::UtcNow -lt ([DateTimeOffset]::Parse($state.lastRestartAtUtc)).AddMinutes(5)) {
    Save-Check "cooldown"; return
  }

  $state.lastRestartAtUtc = [DateTimeOffset]::UtcNow.ToString("o")
  $state.failureCount = 0
  Save-Check "restart-requested"
  $task = Get-MainTask
  if (-not $task.Settings.Enabled -or $task.State -eq "Disabled") { Save-Check "skipped-disabled"; return }
  if ($task.State -ne "Running") { Save-Check "skipped-not-running"; return }
  Stop-ScheduledTask -TaskName $TaskName -TaskPath "\" -ErrorAction Stop
  $stopDeadline = (Get-Date).AddSeconds(10)
  while ($true) {
    $task = Get-MainTask
    if (-not $task.Settings.Enabled -or $task.State -eq "Disabled") { Save-Check "skipped-disabled"; return }
    $listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    if ($task.State -ne "Running" -and $listeners.Count -eq 0) { break }
    if (Test-HttpHealth) { Save-Check "recovered-during-stop"; return }
    if ((Get-Date) -ge $stopDeadline) { Save-Check "stop-timeout"; return }
    Start-Sleep -Seconds 1
  }
  $task = Get-MainTask
  if (-not $task.Settings.Enabled -or $task.State -eq "Disabled") { Save-Check "skipped-disabled"; return }
  if ($task.State -eq "Running") { Save-Check "already-running"; return }
  Start-ScheduledTask -TaskName $TaskName -TaskPath "\" -ErrorAction Stop
  Save-Check "restarted"
} catch {
  $reason = ($_.Exception.Message -replace '[\r\n]+', ' ')
  Add-Content -LiteralPath $logPath -Encoding UTF8 -Value "$([DateTimeOffset]::UtcNow.ToString('o')) error type=$($_.Exception.GetType().Name) reason=$($reason.Substring(0, [Math]::Min(200, $reason.Length)))"
  Save-Check "error"
  throw
}
