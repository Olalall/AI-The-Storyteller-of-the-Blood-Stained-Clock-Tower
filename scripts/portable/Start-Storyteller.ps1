param(
  [int]$Port = 8787,
  [switch]$SkipBrowser,
  [switch]$ReconfigureAI
)

$ErrorActionPreference = 'Stop'
$appDir = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$runtime = Join-Path $appDir 'dist-server\runtime.mjs'
$staticDir = Join-Path $appDir 'dist'
$envFile = Join-Path $appDir '.env'
$archiveFile = Join-Path $appDir 'data\archives\archives.json'
$bundledNode = Join-Path $appDir 'runtime\node\node.exe'

function Fail([string]$message) {
  Write-Host "`n启动失败：$message" -ForegroundColor Red
  Write-Host '按回车退出。'
  [void](Read-Host)
  exit 1
}

function Read-DotEnv([string]$path) {
  $values = @{}
  if (-not (Test-Path -LiteralPath $path)) { return $values }
  foreach ($line in Get-Content -LiteralPath $path -Encoding UTF8) {
    if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#')) { continue }
    $parts = $line -split '=', 2
    if ($parts.Count -ne 2) { continue }
    $key = $parts[0].Trim()
    $value = $parts[1].Trim()
    if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
      $value = $value.Substring(1, $value.Length - 2)
    }
    $values[$key] = $value
  }
  return $values
}

function Write-DotEnv([hashtable]$values) {
  $lines = @(
    '# 本机配置，仅供当前便捷包使用。不要提交到 GitHub。',
    "BOTC_BACKEND_HOST=127.0.0.1",
    "BOTC_BACKEND_PORT=$Port",
    'BOTC_STATIC_DIR=dist',
    'BOTC_ARCHIVE_DATA_FILE=data/archives/archives.json',
    "BOTC_AI_ENABLED=$($values.BOTC_AI_ENABLED)",
    "BOTC_AI_PROVIDER=$($values.BOTC_AI_PROVIDER)",
    "BOTC_AI_BASE_URL=$($values.BOTC_AI_BASE_URL)",
    "BOTC_AI_MODEL=$($values.BOTC_AI_MODEL)",
    "BOTC_AI_API_KEY=$($values.BOTC_AI_API_KEY)",
    'BOTC_AI_TIMEOUT_MS=30000',
    'BOTC_AI_MAX_CONTEXT_TOKENS=12000'
  )
  Set-Content -LiteralPath $envFile -Value $lines -Encoding UTF8
}

function Configure-AI([hashtable]$values) {
  Write-Host "`nAI 配置（可跳过，跳过后仍可使用记录、夜序和投票）" -ForegroundColor Cyan
  $answer = Read-Host '现在配置 AI 吗？(Y/N)'
  if ($answer -notmatch '^(y|yes|是)$') {
    $values.BOTC_AI_ENABLED = 'false'
    $values.BOTC_AI_PROVIDER = 'openai-compatible'
    $values.BOTC_AI_BASE_URL = ''
    $values.BOTC_AI_MODEL = ''
    $values.BOTC_AI_API_KEY = ''
    return
  }

  $baseUrl = Read-Host '接入地址（例如 https://api.example.com/v1）'
  $model = Read-Host '模型名称'
  $secureKey = Read-Host 'API Key（输入时不会回显）' -AsSecureString
  $key = [System.Net.NetworkCredential]::new('', $secureKey).Password
  if ([string]::IsNullOrWhiteSpace($baseUrl) -or [string]::IsNullOrWhiteSpace($model) -or [string]::IsNullOrWhiteSpace($key)) {
    Fail 'AI 配置不完整。重新运行脚本，或选择跳过 AI。'
  }
  $values.BOTC_AI_ENABLED = 'true'
  $values.BOTC_AI_PROVIDER = 'openai-compatible'
  $values.BOTC_AI_BASE_URL = $baseUrl.Trim()
  $values.BOTC_AI_MODEL = $model.Trim()
  $values.BOTC_AI_API_KEY = $key
}

$nodePath = if (Test-Path -LiteralPath $bundledNode) {
  $bundledNode
} else {
  $systemNode = Get-Command node -ErrorAction SilentlyContinue
  if ($systemNode) { $systemNode.Source } else { $null }
}
if (-not $nodePath) {
  Fail '未找到内置运行环境。请下载 GitHub Release 的 Windows 便捷包，或安装 Node.js 20 LTS。'
}
$nodeVersion = (& $nodePath --version).Trim()
if ($nodeVersion -notmatch '^v(\d+)' -or [int]$Matches[1] -lt 20) { Fail "当前 Node.js 为 $nodeVersion，需要 Node.js 20 LTS 或更高版本。" }

if (-not (Test-Path -LiteralPath $runtime) -or -not (Test-Path -LiteralPath $staticDir)) {
  $sourcePackage = Join-Path $appDir 'package.json'
  if (-not (Test-Path -LiteralPath $sourcePackage)) {
    Fail "便捷包不完整。请下载 GitHub Release 中的 botc-storyteller-companion-windows-*.zip，不要下载源码 ZIP。"
  }

  $npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if (-not $npm) { Fail '检测到源码目录，但未找到 npm。请安装 Node.js 20 LTS，或直接下载 GitHub Release 便捷包。' }
  Write-Host "`n检测到这是源码目录，不是已构建便捷包。" -ForegroundColor Yellow
  $buildAnswer = Read-Host '现在自动安装依赖并构建吗？(Y/N)'
  if ($buildAnswer -notmatch '^(y|yes|是)$') {
    Fail '未构建。若不想使用命令行，请下载 GitHub Release 的 Windows 便捷包。'
  }
  Set-Location $appDir
  & $npm.Source install
  if ($LASTEXITCODE -ne 0) { Fail 'npm install 失败。请检查网络后重试。' }
  & $npm.Source run build
  if ($LASTEXITCODE -ne 0) { Fail '前端构建失败。' }
  & $npm.Source run build:backend
  if ($LASTEXITCODE -ne 0) { Fail '后端构建失败。' }
}

if (-not (Test-Path -LiteralPath $runtime) -or -not (Test-Path -LiteralPath $staticDir)) {
  Fail '构建完成但缺少 dist 或 dist-server。请重新运行，或下载 GitHub Release 便捷包。'
}

$values = Read-DotEnv $envFile
if ($ReconfigureAI -or -not (Test-Path -LiteralPath $envFile)) {
  Configure-AI $values
  Write-DotEnv $values
  Write-Host "配置已保存到本机 .env（不会包含在 GitHub 便捷包中）。" -ForegroundColor DarkGray
}

foreach ($entry in $values.GetEnumerator()) {
  [Environment]::SetEnvironmentVariable($entry.Key, [string]$entry.Value, 'Process')
}
[Environment]::SetEnvironmentVariable('BOTC_BACKEND_HOST', '127.0.0.1', 'Process')
[Environment]::SetEnvironmentVariable('BOTC_BACKEND_PORT', [string]$Port, 'Process')
[Environment]::SetEnvironmentVariable('BOTC_STATIC_DIR', 'dist', 'Process')
[Environment]::SetEnvironmentVariable('BOTC_ARCHIVE_DATA_FILE', 'data/archives/archives.json', 'Process')
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $archiveFile) | Out-Null

Write-Host "`n钟楼说书人副驾驶正在启动…" -ForegroundColor Cyan
Write-Host "浏览器地址：http://127.0.0.1:$Port"
Write-Host '关闭此窗口将停止服务。'
if (-not $SkipBrowser) { Start-Process "http://127.0.0.1:$Port" }
Set-Location $appDir
& $nodePath $runtime
if ($LASTEXITCODE -ne 0) { Fail "后端退出，退出码 $LASTEXITCODE。" }
