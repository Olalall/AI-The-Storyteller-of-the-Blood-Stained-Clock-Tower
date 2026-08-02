param(
  [string]$OutputDir = 'release',
  [string]$NodeVersion = '24.18.0',
  [switch]$SkipNodeRuntime,
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
Copy-Item scripts\portable\Install-CharacterAssets.ps1 (Join-Path $stage 'scripts\portable\Install-CharacterAssets.ps1') -Force
Copy-Item scripts\portable\Install-Character-Assets.cmd (Join-Path $stage 'scripts\portable\Install-Character-Assets.cmd') -Force
Copy-Item Start-Storyteller.cmd (Join-Path $stage 'Start-Storyteller.cmd') -Force
Copy-Item Install-Character-Assets.cmd (Join-Path $stage 'Install-Character-Assets.cmd') -Force
Copy-Item README.md (Join-Path $stage 'README.md') -Force
Copy-Item THIRD_PARTY_NOTICES.md (Join-Path $stage 'THIRD_PARTY_NOTICES.md') -Force
Copy-Item docs\QUICK_START_WINDOWS.md (Join-Path $stage 'QUICK_START_WINDOWS.md') -Force
Copy-Item .env.example (Join-Path $stage '.env.example') -Force
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'asset-packs\characters'), (Join-Path $stage 'asset-packs\community') | Out-Null
Copy-Item public\assets\characters\source-manifest.json (Join-Path $stage 'asset-packs\characters\source-manifest.json') -Force
Copy-Item public\assets\community\source-manifest.json (Join-Path $stage 'asset-packs\community\source-manifest.json') -Force

# The source repository keeps third-party binary art as an optional local pack.
# Do not redistribute it inside the public convenience package.
foreach ($optionalAssetDir in @('dist\assets\characters', 'dist\assets\community')) {
  $assetPath = Join-Path $stage $optionalAssetDir
  if (Test-Path -LiteralPath $assetPath) { Remove-Item -LiteralPath $assetPath -Recurse -Force }
}

if (-not $SkipNodeRuntime) {
  $nodeArchiveName = "node-v$NodeVersion-win-x64.zip"
  $nodeBaseUrl = "https://nodejs.org/dist/v$NodeVersion"
  $cacheDir = Join-Path $root '.tmp-portable\cache'
  $nodeArchive = Join-Path $cacheDir $nodeArchiveName
  $nodeChecksums = Join-Path $cacheDir "SHASUMS256-v$NodeVersion.txt"
  $nodeExpand = Join-Path $root ".tmp-portable\node-expand-v$NodeVersion"
  $nodeSource = Join-Path $nodeExpand "node-v$NodeVersion-win-x64"
  $nodeRuntime = Join-Path $stage 'runtime\node'

  New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null
  if (-not (Test-Path -LiteralPath $nodeArchive)) {
    Invoke-WebRequest -Uri "$nodeBaseUrl/$nodeArchiveName" -OutFile $nodeArchive
  }
  Invoke-WebRequest -Uri "$nodeBaseUrl/SHASUMS256.txt" -OutFile $nodeChecksums

  $checksumLine = Get-Content -LiteralPath $nodeChecksums |
    Where-Object { $_ -match "\s+$([regex]::Escape($nodeArchiveName))$" } |
    Select-Object -First 1
  if (-not $checksumLine) { throw "Node.js 官方校验文件中缺少 $nodeArchiveName。" }
  $expectedHash = ($checksumLine -split '\s+')[0].ToUpperInvariant()
  $actualHash = (Get-FileHash -LiteralPath $nodeArchive -Algorithm SHA256).Hash.ToUpperInvariant()
  if ($actualHash -ne $expectedHash) {
    Remove-Item -LiteralPath $nodeArchive -Force
    throw "Node.js 运行时 SHA-256 校验失败。期望 $expectedHash，实际 $actualHash。"
  }

  if (Test-Path -LiteralPath $nodeExpand) { Remove-Item -LiteralPath $nodeExpand -Recurse -Force }
  Expand-Archive -LiteralPath $nodeArchive -DestinationPath $nodeExpand -Force
  New-Item -ItemType Directory -Force -Path $nodeRuntime | Out-Null
  Copy-Item (Join-Path $nodeSource 'node.exe') (Join-Path $nodeRuntime 'node.exe') -Force
  Copy-Item (Join-Path $nodeSource 'LICENSE') (Join-Path $nodeRuntime 'LICENSE') -Force
}

$manifest = [ordered]@{
  project = 'botc-storyteller-companion'
  product = '钟楼说书人副驾驶'
  packageType = 'windows-portable-launcher'
  createdAt = (Get-Date).ToString('o')
  bundledNodeVersion = if ($SkipNodeRuntime) { $null } else { $NodeVersion }
  nodeRequirement = if ($SkipNodeRuntime) { 'Node.js 20 LTS or newer' } else { 'Bundled; no separate installation required' }
  defaultUrl = 'http://127.0.0.1:8787'
  ai = 'optional; configured locally by Start-Storyteller.ps1'
  characterAssets = 'optional; official and community role art downloaded from original sources after explicit user confirmation'
  secretsIncluded = $false
  v25Boundary = 'V2.5 is not included or modified.'
  entry = 'scripts\portable\Start-Storyteller.ps1'
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $stage 'PORTABLE_MANIFEST.json') -Encoding UTF8

$zip = Join-Path $output 'botc-storyteller-companion-windows-portable.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -Force
$hash = (Get-FileHash $zip -Algorithm SHA256).Hash
[ordered]@{ ok = $true; zipPath = $zip; sha256 = $hash; sizeMB = [math]::Round((Get-Item $zip).Length / 1MB, 2); secretsIncluded = $false } |
  ConvertTo-Json | Tee-Object (Join-Path $output 'latest-portable-package.json')
