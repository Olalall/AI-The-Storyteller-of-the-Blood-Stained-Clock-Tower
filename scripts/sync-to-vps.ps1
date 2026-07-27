param(
  [string]$HostName = $(if ($env:BOTC_ASSISTANT_DEPLOY_HOST) { $env:BOTC_ASSISTANT_DEPLOY_HOST } else { $env:BOTC_DEPLOY_HOST }),
  [string]$User = $(if ($env:BOTC_ASSISTANT_DEPLOY_USER) { $env:BOTC_ASSISTANT_DEPLOY_USER } elseif ($env:BOTC_DEPLOY_USER) { $env:BOTC_DEPLOY_USER } else { "Administrator" }),
  [int]$SshPort = $(if ($env:BOTC_ASSISTANT_SSH_PORT) { [int]$env:BOTC_ASSISTANT_SSH_PORT } elseif ($env:BOTC_DEPLOY_SSH_PORT) { [int]$env:BOTC_DEPLOY_SSH_PORT } else { 22 }),
  [string]$RemoteDir = $(if ($env:BOTC_ASSISTANT_REMOTE_DIR) { $env:BOTC_ASSISTANT_REMOTE_DIR } else { "C:\botc-storyteller-companion" }),
  [string]$StagingDir = $(if ($env:BOTC_ASSISTANT_STAGING_DIR) { $env:BOTC_ASSISTANT_STAGING_DIR } else { "C:\botc-storyteller-companion-deploy" }),
  [int]$BackendPort = $(if ($env:BOTC_ASSISTANT_BACKEND_PORT) { [int]$env:BOTC_ASSISTANT_BACKEND_PORT } else { 3000 }),
  [switch]$Execute,
  [switch]$PlanOnly,
  [switch]$SkipPackage,
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
}

function Resolve-Tool {
  param(
    [string]$Name,
    [string]$Fallback
  )
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  if ($Fallback -and (Test-Path -LiteralPath $Fallback)) { return $Fallback }
  throw "$Name was not found. Install OpenSSH or Git for Windows."
}

function Run {
  param(
    [string]$FilePath,
    [string[]]$Arguments = @()
  )
  Write-Host "> $FilePath $($Arguments -join ' ')"
  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
  }
}

function To-ScpWindowsPath {
  param([string]$Path)
  return ($Path -replace "\\", "/")
}

Write-Step "sync plan"
$plan = [ordered]@{
  project = "botc-storyteller-companion"
  v25Touched = $false
  v25DefaultDirPreserved = "C:\botc-mvp"
  hostNamePresent = -not [string]::IsNullOrWhiteSpace($HostName)
  user = $User
  sshPort = $SshPort
  remoteDir = $RemoteDir
  stagingDir = $StagingDir
  backendPort = $BackendPort
  execute = [bool]$Execute
}
$plan | ConvertTo-Json -Depth 4

if ($PlanOnly -or -not $Execute) {
  Write-Host ""
  Write-Host "Plan only. Pass -Execute to upload and expand the package."
  exit 0
}

if ([string]::IsNullOrWhiteSpace($HostName)) {
  throw "Missing HostName. Set BOTC_ASSISTANT_DEPLOY_HOST or pass -HostName."
}

if (-not $SkipPackage) {
  Write-Step "build package"
  $packageArgs = @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "scripts/package-vps.ps1")
  if ($SkipChecks) { $packageArgs += "-SkipChecks" }
  Run "powershell.exe" $packageArgs
}

$latestPath = Join-Path (Get-Location) ".tmp-vps-sync\latest-package.json"
if (-not (Test-Path -LiteralPath $latestPath)) {
  throw "Package metadata not found: $latestPath"
}
$latest = Get-Content -LiteralPath $latestPath -Raw | ConvertFrom-Json
$zipPath = [string]$latest.zipPath
if (-not (Test-Path -LiteralPath $zipPath)) {
  throw "Package zip not found: $zipPath"
}

$ssh = Resolve-Tool "ssh.exe" "C:\Program Files\Git\usr\bin\ssh.exe"
$scp = Resolve-Tool "scp.exe" "C:\Program Files\Git\usr\bin\scp.exe"
$remote = "${User}@${HostName}"
$remoteZip = (To-ScpWindowsPath (Join-Path $StagingDir (Split-Path $zipPath -Leaf)))

Write-Step "create remote directories"
$remotePrep = "powershell -NoProfile -ExecutionPolicy Bypass -Command `"New-Item -ItemType Directory -Force -Path '$StagingDir','$RemoteDir' | Out-Null`""
Run $ssh @("-p", "$SshPort", $remote, $remotePrep)

Write-Step "upload package"
Run $scp @("-P", "$SshPort", $zipPath, "${remote}:$remoteZip")

Write-Step "expand package into isolated assistant directory"
$remoteExpand = "powershell -NoProfile -ExecutionPolicy Bypass -Command `"Expand-Archive -LiteralPath '$($remoteZip -replace '/', '\')' -DestinationPath '$RemoteDir' -Force; `$env:BOTC_BACKEND_PORT='$BackendPort'; Write-Host 'Uploaded botc-storyteller-companion to $RemoteDir. V2.5 not touched.'`""
Run $ssh @("-p", "$SshPort", $remote, $remoteExpand)

Write-Step "done"
Write-Host "Uploaded: $zipPath"
Write-Host "RemoteDir: $RemoteDir"
Write-Host "Backend start command:"
Write-Host "  `$env:BOTC_BACKEND_PORT='$BackendPort'; node $RemoteDir\dist-server\runtime.mjs"
