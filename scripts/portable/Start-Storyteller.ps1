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

if (-not (Test-Path -LiteralPath $runtime)) { Fail "缺少 $runtime，请从 GitHub Release 下载完整便捷包。" }
if (-not (Test-Path -LiteralPath $staticDir)) { Fail "缺少 $staticDir，请从 GitHub Release 下载完整便捷包。" }

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { Fail '未找到 Node.js。请安装 Node.js 20 LTS 或更高版本，再重新运行。' }
$nodeVersion = (& node --version).Trim()
if ($nodeVersion -notmatch '^v(\d+)' -or [int]$Matches[1] -lt 20) { Fail "当前 Node.js 为 $nodeVersion，需要 Node.js 20 LTS 或更高版本。" }

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
& $node.Source $runtime
if ($LASTEXITCODE -ne 0) { Fail "后端退出，退出码 $LASTEXITCODE。" }
