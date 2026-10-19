param(
  [Parameter(Mandatory=$true)][string]$PublicCertificateFile,
  [Parameter(Mandatory=$true)][string]$ExpectedThumbprint,
  [Parameter(Mandatory=$true)][string]$PrivateSettingsFile,
  [Parameter(Mandatory=$true)][string]$OutputCmsFile
)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'assistant-ai-settings.ps1')
try {
  $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new([IO.File]::ReadAllBytes($PublicCertificateFile))
  if ($certificate.Thumbprint -cne $ExpectedThumbprint -or $certificate.HasPrivateKey -or $certificate.NotAfter -le (Get-Date)) { throw 'Invalid transport certificate' }
  $clear = [IO.File]::ReadAllText($PrivateSettingsFile)
  $null = ConvertTo-AssistantAISettings $clear
  $envelope = Protect-CmsMessage -To $certificate -Content $clear
  [IO.File]::WriteAllText([IO.Path]::GetFullPath($OutputCmsFile),$envelope,[Text.Encoding]::ASCII)
  @{Encrypted=$true;Thumbprint=$certificate.Thumbprint;Bytes=(Get-Item -LiteralPath $OutputCmsFile).Length} | ConvertTo-Json -Compress
} catch { [Console]::Error.WriteLine('AI configuration encryption failed; no plaintext was emitted'); exit 1 }
finally { if ($certificate) { $certificate.Dispose() } }
