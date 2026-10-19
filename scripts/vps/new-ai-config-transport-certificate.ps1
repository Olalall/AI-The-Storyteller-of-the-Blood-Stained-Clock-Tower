param([switch]$ConfirmedConfigure)
$ErrorActionPreference = 'Stop'
if (!$ConfirmedConfigure) { throw 'Explicit configuration authorization is required' }
try {
  $certificate = New-SelfSignedCertificate -Type DocumentEncryptionCert -Subject ('CN=BOTC AI config transport '+[guid]::NewGuid().ToString('N')) -CertStoreLocation 'Cert:\LocalMachine\My' -KeyExportPolicy NonExportable -KeyLength 3072 -NotAfter (Get-Date).AddHours(2)
  @{Thumbprint=$certificate.Thumbprint;ExpiresUtc=$certificate.NotAfter.ToUniversalTime().ToString('o');PublicCertificate=[Convert]::ToBase64String($certificate.Export([Security.Cryptography.X509Certificates.X509ContentType]::Cert))} | ConvertTo-Json -Compress
} catch { [Console]::Error.WriteLine('AI configuration transport certificate creation failed'); exit 1 }
