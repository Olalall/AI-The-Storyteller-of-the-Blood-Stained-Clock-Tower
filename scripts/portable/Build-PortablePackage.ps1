param(
  [string]$OutputDir = 'release',
  [switch]$SkipChecks
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $root

function Run([string]$file, [string[]]$Arguments) {
  & $file @Arguments
  if ($LASTEXITCODE -ne 0) { throw "命令失败：$file $($Arguments -join ' ')" }
}

if (-not $SkipChecks) {
  Run 'npm.cmd' @('run', 'check')
  Run 'npm.cmd' @('run', 'smoke:backend')
  Run 'npm.cmd' @('run', 'audit:public')
}
Run 'npm.cmd' @('run', 'build')
Run 'npm.cmd' @('run', 'build:backend')

$stage = Join-Path $root '.tmp-portable\package'
$output = Join-Path $root $OutputDir
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage, $output | Out-Null

Copy-Item dist (Join-Path $stage 'dist') -Recurse -Force
Copy-Item dist-server (Join-Path $stage 'dist-server') -Recurse -Force
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'scripts\portable') | Out-Null
Copy-Item scripts\portable\Start-Storyteller.ps1 (Join-Path $stage 'scripts\portable\Start-Storyteller.ps1') -Force
Copy-Item scripts\portable\Start-Storyteller.cmd (Join-Path $stage 'scripts\portable\Start-Storyteller.cmd') -Force
Copy-Item Start-Storyteller.cmd (Join-Path $stage 'Start-Storyteller.cmd') -Force
Copy-Item README.md (Join-Path $stage 'README.md') -Force
Copy-Item THIRD_PARTY_NOTICES.md (Join-Path $stage 'THIRD_PARTY_NOTICES.md') -Force
Copy-Item docs\QUICK_START_WINDOWS.md (Join-Path $stage 'QUICK_START_WINDOWS.md') -Force
Copy-Item .env.example (Join-Path $stage '.env.example') -Force

# The source repository keeps third-party binary art as an optional local pack.
# Do not redistribute it inside the public convenience package.
foreach ($optionalAssetDir in @('dist\assets\characters', 'dist\assets\community')) {
  $assetPath = Join-Path $stage $optionalAssetDir
  if (Test-Path -LiteralPath $assetPath) { Remove-Item -LiteralPath $assetPath -Recurse -Force }
}

$manifest = [ordered]@{
  project = 'botc-storyteller-companion'
  product = '钟楼说书人副驾驶'
  packageType = 'windows-portable-launcher'
  createdAt = (Get-Date).ToString('o')
  nodeRequirement = 'Node.js 20 LTS or newer'
  defaultUrl = 'http://127.0.0.1:8787'
  ai = 'optional; configured locally by Start-Storyteller.ps1'
  secretsIncluded = $false
  v25Boundary = 'V2.5 is not included or modified.'
  entry = 'scripts\portable\Start-Storyteller.ps1'
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $stage 'PORTABLE_MANIFEST.json') -Encoding UTF8

$version = (Get-Content package.json -Raw | ConvertFrom-Json).version
$zip = Join-Path $output "botc-storyteller-companion-windows-$version.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -Force
$hash = (Get-FileHash $zip -Algorithm SHA256).Hash
[ordered]@{ ok = $true; zipPath = $zip; sha256 = $hash; sizeMB = [math]::Round((Get-Item $zip).Length / 1MB, 2); secretsIncluded = $false } |
  ConvertTo-Json | Tee-Object (Join-Path $output 'latest-portable-package.json')
