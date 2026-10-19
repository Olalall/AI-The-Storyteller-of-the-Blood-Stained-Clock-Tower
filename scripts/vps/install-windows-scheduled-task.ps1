param(
  [string]$TaskName = "botc-storyteller-backend",
  [string]$AppDir = "C:\botc-storyteller-companion",
  [string]$NodePath = "C:\nodejs\node.exe",
  [int]$Port = 3000,
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
$healthScript = Resolve-RequiredPath (Join-Path $resolvedAppDir "scripts\vps\check-assistant-health.ps1") "Healthcheck script"

$arguments = @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", "`"$startScript`"",
  "-AppDir", "`"$resolvedAppDir`"",
  "-NodePath", "`"$resolvedNodePath`"",
  "-Port", "$Port"
) -join " "

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arguments -WorkingDirectory $resolvedAppDir
$trigger = New-ScheduledTaskTrigger -AtStartup
$recoveryTrigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 1)
$recoveryTrigger.Repetition.StopAtDurationEnd = $false
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -MultipleInstances IgnoreNew `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -StartWhenAvailable

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger @($trigger, $recoveryTrigger) `
  -Principal $principal `
  -Settings $settings `
  -Force | Out-Null

$healthArguments = "-NoProfile -ExecutionPolicy Bypass -File `"$healthScript`" -AppDir `"$resolvedAppDir`" -TaskName `"$TaskName`" -Port $Port"
$healthAction = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $healthArguments -WorkingDirectory $resolvedAppDir
$healthSettings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 1) -MultipleInstances IgnoreNew -StartWhenAvailable
Register-ScheduledTask -TaskName "$TaskName-healthcheck" -Action $healthAction -Trigger @($trigger, $recoveryTrigger) -Principal $principal -Settings $healthSettings -Force | Out-Null

Write-Host "BOTC_ASSISTANT_TASK: registered ${TaskName}"
Write-Host "BOTC_ASSISTANT_TASK: app ${resolvedAppDir}"
Write-Host "BOTC_ASSISTANT_TASK: node ${resolvedNodePath}"
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
