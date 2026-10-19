param(
  [Parameter(Mandatory=$true)][string]$CmsFile,
  [Parameter(Mandatory=$true)][string]$CertificateThumbprint,
  [string]$SettingsFile = 'C:\ProgramData\BotcStoryteller\secrets\ai-settings.dpapi',
  [switch]$ConfirmedConfigure
)
$ErrorActionPreference = 'Stop'
if (!$ConfirmedConfigure) { throw 'Explicit configuration authorization is required' }
. (Join-Path $PSScriptRoot 'assistant-ai-settings.ps1')
try {
  if ($CertificateThumbprint -notmatch '^[0-9A-Fa-f]{40}$') { throw 'Invalid certificate identifier' }
  $certificate = Get-Item -LiteralPath ('Cert:\LocalMachine\My\'+$CertificateThumbprint)
  if (!$certificate.HasPrivateKey -or $certificate.Subject -notlike 'CN=BOTC AI config transport *' -or $certificate.NotAfter -le (Get-Date)) { throw 'Invalid configuration transport certificate' }
  $clear = Unprotect-CmsMessage -Path $CmsFile -To $certificate
  Write-AssistantAISettings $SettingsFile $clear | ConvertTo-Json -Compress
} catch { [Console]::Error.WriteLine('Protected AI configuration installation failed; existing configuration was preserved'); exit 1 }
