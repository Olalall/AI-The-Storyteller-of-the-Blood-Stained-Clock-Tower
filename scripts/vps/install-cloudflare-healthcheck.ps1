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
$publicUri = $null
if (-not [uri]::TryCreate($PublicUrl, [UriKind]::Absolute, [ref]$publicUri) -or $publicUri.Scheme -ne "https" -or $publicUri.UserInfo -or $publicUri.Query -or $publicUri.Fragment -or $publicUri.AbsolutePath -ne "/") {
  throw "PublicUrl must be an HTTPS root URL without credentials, query or fragment"
}
$resolvedAppDir = (Resolve-Path -LiteralPath $AppDir).Path
$scriptPath = (Resolve-Path -LiteralPath (Join-Path $resolvedAppDir "scripts\vps\check-cloudflare-tunnel.ps1")).Path
$service = Get-CimInstance -ClassName Win32_Service -Filter "Name='$ServiceName'" -Property Name, State, StartMode, ProcessId -ErrorAction Stop
if (-not $service) { throw "Cloudflare tunnel service '$ServiceName' is not installed; install the service separately first" }
$mainTask = Get-ScheduledTask -TaskName $TaskName -TaskPath "\" -ErrorAction Stop
if ($mainTask.Actions.Count -ne 1 -or [string]::IsNullOrWhiteSpace($mainTask.Actions[0].WorkingDirectory) -or (Resolve-Path -LiteralPath $mainTask.Actions[0].WorkingDirectory).Path.TrimEnd('\') -ine $resolvedAppDir.TrimEnd('\')) { throw "Main task WorkingDirectory does not match AppDir" }

$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -AppDir `"$resolvedAppDir`" -TaskName `"$TaskName`" -ServiceName `"$ServiceName`" -Port $Port -PublicUrl `"$($publicUri.GetLeftPart([UriPartial]::Authority))/`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arguments -WorkingDirectory $resolvedAppDir
$bootTrigger = New-ScheduledTaskTrigger -AtStartup
$repeatTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$repeatTrigger.Repetition.StopAtDurationEnd = $false
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 3) -MultipleInstances IgnoreNew -StartWhenAvailable
Register-ScheduledTask -TaskName "$TaskName-tunnel-healthcheck" -Action $action -Trigger @($bootTrigger, $repeatTrigger) -Principal $principal -Settings $settings -Force | Out-Null
Write-Host "BOTC_TUNNEL_HEALTHCHECK: registered $TaskName-tunnel-healthcheck"
