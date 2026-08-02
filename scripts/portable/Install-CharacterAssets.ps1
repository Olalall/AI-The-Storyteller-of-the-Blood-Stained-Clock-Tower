param(
  [switch]$AcceptPolicy
)

$ErrorActionPreference = 'Stop'
$appDir = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$cccUrl = 'https://release.botc.app/resources/community/ccc-sleeve.png'
$cccSha256 = '748B411B3705FF9D15CE29299EB2E7CE06AE93CA012AC7724B7716E235B24C34'
$manifestCandidates = @(
  (Join-Path $appDir 'asset-packs\characters\source-manifest.json'),
  (Join-Path $appDir 'public\assets\characters\source-manifest.json')
)
$manifestPath = $manifestCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
$isPortable = Test-Path -LiteralPath (Join-Path $appDir 'asset-packs\characters\source-manifest.json')
$characterDir = if ($isPortable) { Join-Path $appDir 'dist\assets\characters' } else { Join-Path $appDir 'public\assets\characters' }
$communityDir = if ($isPortable) { Join-Path $appDir 'dist\assets\community' } else { Join-Path $appDir 'public\assets\community' }
$receiptPath = Join-Path $appDir 'data\asset-packs\characters.json'
$tempDir = Join-Path $appDir '.asset-download'

function Fail([string]$message) {
  Write-Host "`n素材安装失败：$message" -ForegroundColor Red
  exit 1
}

function File-Hash([string]$path) {
  return (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToUpperInvariant()
}

function Download-Verified([string]$url, [string]$destination, [string]$expectedHash) {
  if ((Test-Path -LiteralPath $destination) -and (File-Hash $destination) -eq $expectedHash) { return $false }
  $tempFile = Join-Path $tempDir ([IO.Path]::GetRandomFileName())
  Invoke-WebRequest -Uri $url -OutFile $tempFile -UseBasicParsing
  $actualHash = File-Hash $tempFile
  if ($actualHash -ne $expectedHash) {
    Remove-Item -LiteralPath $tempFile -Force
    throw "校验失败：$url`n期望 $expectedHash`n实际 $actualHash"
  }
  Move-Item -LiteralPath $tempFile -Destination $destination -Force
  return $true
}

if (-not $manifestPath) { Fail '缺少角色素材来源清单，请重新下载完整便捷包。' }

if (-not $AcceptPolicy) {
  Write-Host "`n角色图标素材安装" -ForegroundColor Cyan
  Write-Host '来源：The Pandemonium Institute Toolmaker Resources、GStone 与对应社区角色作者'
  Write-Host '条款：https://bloodontheclocktower.com/pages/community-created-content-policy'
  Write-Host '当前清单：718 个角色图标，下载量约 102 MB。'
  Write-Host '每个素材都从来源地址下载并校验 SHA-256；本项目不在 Git/便携包中重新分发这些二进制素材。'
  Write-Host '本项目是非官方、非商业的社区辅助工具；官方及第三方素材权利仍属于各自权利人。'
  $answer = Read-Host '我已阅读并同意安装官方及第三方角色素材 (Y/N)'
  if ($answer -notmatch '^(y|yes|是)$') {
    Write-Host '已取消，不会下载任何素材。'
    exit 2
  }
}

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.version -ne 2) { Fail '角色素材来源清单版本不受支持，请重新下载完整便捷包。' }

New-Item -ItemType Directory -Force -Path $characterDir, $communityDir, $tempDir, (Split-Path -Parent $receiptPath) | Out-Null
$downloaded = 0
$verified = 0
$officialCount = 0
$communityCount = 0
$total = @($manifest.assets.PSObject.Properties).Count
$position = 0

try {
  foreach ($asset in $manifest.assets.PSObject.Properties) {
    $position += 1
    $entry = $asset.Value
    $id = [string]$entry.roleId
    $url = [string]$entry.url
    $expectedHash = ([string]$entry.sha256).Replace('sha256:', '').ToUpperInvariant()
    if ($entry.kind -eq 'official') { $officialCount += 1 } else { $communityCount += 1 }
    $destination = Join-Path $characterDir $asset.Name
    Write-Progress -Activity '安装角色图标' -Status "$position / $total · $id" -PercentComplete (($position / $total) * 100)
    if (Download-Verified $url $destination $expectedHash) { $downloaded += 1 } else { $verified += 1 }
  }

  $cccDestination = Join-Path $communityDir 'ccc-sleeve.png'
  if (Download-Verified $cccUrl $cccDestination $cccSha256) { $downloaded += 1 } else { $verified += 1 }
  Write-Progress -Activity '安装角色图标' -Completed

  $receipt = [ordered]@{
    installedAt = (Get-Date).ToString('o')
    source = 'https://release.botc.app/resources/'
    communitySource = 'https://clocktower.gstonegames.com/'
    policy = 'https://bloodontheclocktower.com/pages/community-created-content-policy'
    manifest = $manifestPath
    assets = $total
    officialAssets = $officialCount
    communityAssets = $communityCount
    downloaded = $downloaded
    alreadyVerified = $verified
    cccLogo = 'assets/community/ccc-sleeve.png'
  }
  $receipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $receiptPath -Encoding UTF8
  Write-Host "`n角色素材已就绪：$officialCount 个官方角色图标 + $communityCount 个第三方角色图标 + CCC 标识。" -ForegroundColor Green
  Write-Host '重新打开或刷新应用后生效。'
} catch {
  Fail $_.Exception.Message
} finally {
  if (Test-Path -LiteralPath $tempDir) {
    Get-ChildItem -LiteralPath $tempDir -File -ErrorAction SilentlyContinue | Remove-Item -Force
  }
}
