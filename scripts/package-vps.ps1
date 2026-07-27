param(
  [string]$OutputDir = ".tmp-vps-sync",
  [switch]$SkipBuild,
  [switch]$SkipChecks
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message"
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

function Copy-RequiredPath {
  param(
    [string]$Source,
    [string]$Destination
  )
  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Required package path is missing: $Source"
  }
  Copy-Item -LiteralPath $Source -Destination $Destination -Recurse -Force
}

$root = (Get-Location).Path
$outputPath = Join-Path $root $OutputDir
$stagePath = Join-Path $outputPath "package"

if (-not $SkipChecks) {
  Write-Step "local verification"
  Run "npm.cmd" @("run", "check")
  Run "npm.cmd" @("run", "smoke:backend")
}

if (-not $SkipBuild) {
  Write-Step "build frontend and backend"
  foreach ($buildDir in @("dist", "dist-server")) {
    if (Test-Path -LiteralPath $buildDir) {
      Remove-Item -LiteralPath $buildDir -Recurse -Force
    }
  }
  Run "npm.cmd" @("run", "build")
  Run "npm.cmd" @("run", "build:backend")
}

Write-Step "prepare package directory"
if (Test-Path -LiteralPath $stagePath) {
  Remove-Item -LiteralPath $stagePath -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $stagePath | Out-Null

Copy-RequiredPath "dist" (Join-Path $stagePath "dist")
Copy-RequiredPath "dist-server" (Join-Path $stagePath "dist-server")
Copy-RequiredPath "package.json" (Join-Path $stagePath "package.json")
Copy-RequiredPath "package-lock.json" (Join-Path $stagePath "package-lock.json")
Copy-RequiredPath "README.md" (Join-Path $stagePath "README.md")
Copy-RequiredPath "THIRD_PARTY_NOTICES.md" (Join-Path $stagePath "THIRD_PARTY_NOTICES.md")
Copy-RequiredPath "dev-docs\VPS_DEPLOYMENT_PREP.md" (Join-Path $stagePath "VPS_DEPLOYMENT_PREP.md")

$manifest = [ordered]@{
  project = "botc-storyteller-companion"
  product = "钟楼说书人副驾驶"
  createdAt = (Get-Date).ToString("o")
  sourcePath = $root
  defaultBackendPort = 8787
  defaultRemoteDir = "C:\botc-storyteller-companion"
  defaultStagingDir = "C:\botc-storyteller-companion-deploy"
  v25Boundary = "V2.5 is preserved separately and is not touched by this package."
  entry = @{
    frontend = "dist"
    backend = "dist-server\runtime.mjs"
    healthz = "/healthz"
  }
}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $stagePath "DEPLOYMENT_MANIFEST.json") -Encoding UTF8

Write-Step "compress package"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipPath = Join-Path $outputPath "botc-storyteller-companion-$timestamp.zip"
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}
$sourcePattern = Join-Path $stagePath "*"
Compress-Archive -Path $sourcePattern -DestinationPath $zipPath -Force

$hash = Get-FileHash -LiteralPath $zipPath -Algorithm SHA256
$info = Get-Item -LiteralPath $zipPath
$result = [ordered]@{
  ok = $true
  zipPath = $zipPath
  sizeMB = [math]::Round($info.Length / 1MB, 2)
  sha256 = $hash.Hash
  packageDir = $stagePath
}
$result | ConvertTo-Json -Depth 4 | Tee-Object -FilePath (Join-Path $outputPath "latest-package.json")
