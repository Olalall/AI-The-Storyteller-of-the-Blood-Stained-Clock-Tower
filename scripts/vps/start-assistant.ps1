param(
  [string]$AppDir = "C:\botc-storyteller-companion",
  [string]$NodePath = "C:\nodejs\node.exe",
  [string]$HostName = "127.0.0.1",
  [int]$Port = 3000,
  [string]$StaticDir = "dist",
  [string]$ArchiveDataFile = "data\archives\archives.json",
  [string]$LogDir = "logs",
  [switch]$AllowPublicBind
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
$runtimePath = Resolve-RequiredPath (Join-Path $resolvedAppDir "dist-server\runtime.mjs") "Runtime"
$resolvedLogDir = Join-Path $resolvedAppDir $LogDir
$resolvedArchiveFile = Join-Path $resolvedAppDir $ArchiveDataFile
$resolvedArchiveDir = Split-Path -Parent $resolvedArchiveFile

$localHosts = @('127.0.0.1', 'localhost', '::1')
if (($localHosts -notcontains $HostName) -and -not $AllowPublicBind) {
  throw "Public binding is disabled by default. Pass -AllowPublicBind only when a protected reverse proxy or access control is configured."
}
New-Item -ItemType Directory -Force -Path $resolvedLogDir, $resolvedArchiveDir | Out-Null

$env:BOTC_BACKEND_HOST = $HostName
$env:BOTC_BACKEND_PORT = [string]$Port
$env:BOTC_STATIC_DIR = $StaticDir
$env:BOTC_ARCHIVE_DATA_FILE = $ArchiveDataFile

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$startupLine = "[${timestamp}] starting botc-storyteller-companion on ${HostName}:${Port} with ${resolvedNodePath}"
$startupLine | Out-File -LiteralPath (Join-Path $resolvedLogDir "runtime.log") -Append -Encoding UTF8

if ($AllowPublicBind -and ($localHosts -notcontains $HostName)) {
  "[${timestamp}] WARNING: public bind explicitly enabled; protect this port with reverse-proxy authentication and firewall rules." | Out-File -LiteralPath (Join-Path $resolvedLogDir "runtime.log") -Append -Encoding UTF8
}

Set-Location $resolvedAppDir
& $resolvedNodePath $runtimePath *>> (Join-Path $resolvedLogDir "runtime.log")
