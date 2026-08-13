param(
  [string]$TaskName = "botc-storyteller-backend",
  [string]$AppDir = "C:\botc-storyteller-companion",
  [string]$NodePath = "C:\nodejs\node.exe",
  [string]$HostName = "127.0.0.1",
  [int]$Port = 3000,
  [switch]$AllowPublicBind,
  [switch]$StartNow
)

$ErrorActionPreference = "Stop"

function Resolve-RequiredPath {
  param(
    [string]$Path,
    [string]$Label
  )
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label not found: $Path"
  }
  return (Resolve-Path -LiteralPath $Path).Path
}

$resolvedAppDir = Resolve-RequiredPath $AppDir "AppDir"
$resolvedNodePath = Resolve-RequiredPath $NodePath "NodePath"
$startScript = Resolve-RequiredPath (Join-Path $resolvedAppDir "scripts\vps\start-assistant.ps1") "Start script"

$localHosts = @('127.0.0.1', 'localhost', '::1')
if (($localHosts -notcontains $HostName) -and -not $AllowPublicBind) {
  throw "Public binding requires -AllowPublicBind. Keep the default local-only binding unless this VPS is intentionally public."
}

$arguments = @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$startScript`"",
  "-AppDir", "`"$resolvedAppDir`"",
  "-NodePath", "`"$resolvedNodePath`"",
  "-HostName", "`"$HostName`"",
  "-Port", "$Port"
) -join " "

if ($AllowPublicBind) {
  $arguments += " -AllowPublicBind"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arguments -WorkingDirectory $resolvedAppDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Days 30) `
  -MultipleInstances IgnoreNew `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Force | Out-Null

Write-Host "BOTC_ASSISTANT_TASK: registered ${TaskName}"
Write-Host "BOTC_ASSISTANT_TASK: app ${resolvedAppDir}"
Write-Host "BOTC_ASSISTANT_TASK: node ${resolvedNodePath}"
Write-Host "BOTC_ASSISTANT_TASK: host ${HostName}"
Write-Host "BOTC_ASSISTANT_TASK: port ${Port}"

if ($StartNow) {
  Start-ScheduledTask -TaskName $TaskName
  Start-Sleep -Seconds 5
  $health = curl.exe -s "http://127.0.0.1:${Port}/healthz"
  Write-Host "BOTC_ASSISTANT_TASK: health ${health}"
  if ($health -notmatch '"ok"\s*:\s*true') {
    throw "health check failed after StartNow"
  }
}
