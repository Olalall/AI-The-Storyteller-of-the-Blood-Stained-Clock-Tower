# Private configuration is decrypted only in the startup/configuration process.
# Never write the returned values, provider responses or exceptions to a log.
Import-Module (Join-Path $PSHOME 'Modules\Microsoft.PowerShell.Security\Microsoft.PowerShell.Security.psd1') -ErrorAction Stop
$script:AssistantAISettingNames = @(
  'BOTC_AI_ENABLED','BOTC_AI_PROVIDER','BOTC_AI_BASE_URL','BOTC_AI_MODEL',
  'BOTC_AI_API_KEY','BOTC_AI_TIMEOUT_MS','BOTC_AI_MAX_CONTEXT_TOKENS',
  'BOTC_AI_ACCESS_SECRET','BOTC_AI_PUBLIC_ORIGIN'
)

function ConvertTo-AssistantAISettings([string]$Json) {
  try { $parsed = $Json | ConvertFrom-Json -ErrorAction Stop } catch { throw 'Invalid protected AI configuration JSON' }
  if ($null -eq $parsed -or $parsed -isnot [pscustomobject]) { throw 'Protected AI configuration must be an object' }
  $settings = @{}
  foreach ($property in $parsed.PSObject.Properties) {
    if ($property.Name -cnotin $script:AssistantAISettingNames -or $property.Value -isnot [string]) { throw 'Unknown or invalid protected AI setting' }
    $settings[$property.Name] = $property.Value.Trim()
  }
  if ($settings.BOTC_AI_ENABLED -cnotin @('true','false')) { throw 'Invalid protected AI enabled flag' }
  foreach ($name in $settings.Keys) { if ($settings[$name].Length -gt 8192) { throw 'Protected AI setting exceeds limit' } }
  if ($settings.BOTC_AI_ACCESS_SECRET.Length -gt 256) { throw 'AI access secret exceeds login limit' }
  foreach ($name in @('BOTC_AI_BASE_URL','BOTC_AI_PUBLIC_ORIGIN')) {
    if (!$settings[$name]) { continue }
    $uri = $null
    if (![Uri]::TryCreate($settings[$name], [UriKind]::Absolute, [ref]$uri) -or
      $uri.Scheme -notin @('http','https') -or $uri.UserInfo -or $uri.Query -or $uri.Fragment) { throw 'Invalid protected AI URL' }
    if ($uri.Scheme -ne 'https' -and !$uri.IsLoopback) { throw 'Protected AI URL must use HTTPS or loopback' }
    if ($name -eq 'BOTC_AI_PUBLIC_ORIGIN' -and $uri.AbsolutePath -ne '/') { throw 'AI public origin must not contain a path' }
  }
  foreach ($item in @(@('BOTC_AI_TIMEOUT_MS',1000,180000),@('BOTC_AI_MAX_CONTEXT_TOKENS',1000,2000000))) {
    if (!$settings[$item[0]]) { continue }
    $value = 0L
    if (![long]::TryParse($settings[$item[0]], [ref]$value) -or $value -lt $item[1] -or $value -gt $item[2]) { throw 'Invalid protected AI numeric setting' }
  }
  if ($settings.BOTC_AI_ENABLED -eq 'true') {
    if ($settings.BOTC_AI_PROVIDER -cne 'openai-compatible' -or !$settings.BOTC_AI_BASE_URL -or !$settings.BOTC_AI_MODEL -or
      !$settings.BOTC_AI_API_KEY -or !$settings.BOTC_AI_PUBLIC_ORIGIN -or $settings.BOTC_AI_ACCESS_SECRET.Length -lt 32) { throw 'Enabled AI requires complete server configuration and an access secret of at least 32 characters' }
  }
  return $settings
}

function Set-AssistantPrivateAcl([string]$Path, [switch]$Directory) {
  $admins = [Security.Principal.SecurityIdentifier]::new('S-1-5-32-544')
  $system = [Security.Principal.SecurityIdentifier]::new('S-1-5-18')
  $acl = if ($Directory) { [Security.AccessControl.DirectorySecurity]::new() } else { [Security.AccessControl.FileSecurity]::new() }
  $acl.SetAccessRuleProtection($true, $false)
  $acl.SetOwner($admins)
  foreach ($sid in @($admins,$system)) {
    $rule = if ($Directory) {
      [Security.AccessControl.FileSystemAccessRule]::new($sid, 'FullControl', 'ContainerInherit,ObjectInherit', 'None', 'Allow')
    } else { [Security.AccessControl.FileSystemAccessRule]::new($sid, 'FullControl', 'Allow') }
    [void]$acl.AddAccessRule($rule)
  }
  Set-Acl -LiteralPath $Path -AclObject $acl -ErrorAction Stop
}

function Assert-AssistantPrivateAcl([string]$Path) {
  $acl = Get-Acl -LiteralPath $Path -ErrorAction Stop
  $trusted = @('S-1-5-32-544','S-1-5-18')
  if (!$acl.AreAccessRulesProtected -or $acl.GetOwner([Security.Principal.SecurityIdentifier]).Value -notin $trusted) { throw 'Protected AI file must have a trusted owner and private ACL' }
  foreach ($rule in $acl.GetAccessRules($true,$true,[Security.Principal.SecurityIdentifier])) {
    if ($rule.AccessControlType -eq 'Allow' -and $rule.IdentityReference.Value -notin $trusted) { throw 'Protected AI file is accessible to an untrusted identity' }
  }
}

function Read-AssistantAISettings([string]$Path) {
  Assert-AssistantPrivateAcl $Path
  Add-Type -AssemblyName System.Security
  try {
    $bytes = [Convert]::FromBase64String([IO.File]::ReadAllText($Path))
    $clear = [Security.Cryptography.ProtectedData]::Unprotect($bytes, $null, [Security.Cryptography.DataProtectionScope]::LocalMachine)
  } catch { throw 'Cannot decrypt protected AI configuration' }
  return ConvertTo-AssistantAISettings ([Text.Encoding]::UTF8.GetString($clear))
}

function Write-AssistantAISettings([string]$Path, [string]$Json) {
  $settings = ConvertTo-AssistantAISettings $Json
  Add-Type -AssemblyName System.Security
  $full = [IO.Path]::GetFullPath($Path)
  $directory = [IO.Path]::GetDirectoryName($full)
  New-Item -ItemType Directory -Path $directory -Force -ErrorAction Stop | Out-Null
  Set-AssistantPrivateAcl $directory -Directory
  $temporary = Join-Path $directory ('ai-settings-'+[guid]::NewGuid().ToString('N')+'.new')
  $bytes = [Text.Encoding]::UTF8.GetBytes(($settings | ConvertTo-Json -Compress))
  $protected = [Security.Cryptography.ProtectedData]::Protect($bytes, $null, [Security.Cryptography.DataProtectionScope]::LocalMachine)
  [IO.File]::WriteAllText($temporary,[Convert]::ToBase64String($protected),[Text.Encoding]::ASCII)
  Set-AssistantPrivateAcl $temporary
  $verified = Read-AssistantAISettings $temporary
  if ($verified.Count -ne $settings.Count) { throw 'Protected AI verification failed' }
  $backup = $null
  if (Test-Path -LiteralPath $full) {
    Assert-AssistantPrivateAcl $full
    $backup = Join-Path $directory ('ai-settings-'+[guid]::NewGuid().ToString('N')+'.previous.dpapi')
    [IO.File]::Replace($temporary,$full,$backup)
  } else { Move-Item -LiteralPath $temporary -Destination $full -ErrorAction Stop }
  Assert-AssistantPrivateAcl $full
  return @{ Installed=$true; Enabled=($settings.BOTC_AI_ENABLED -eq 'true'); BackupCreated=($null -ne $backup) }
}

function Disable-AssistantAISettings {
  foreach ($name in $script:AssistantAISettingNames) { [Environment]::SetEnvironmentVariable($name,$null,'Process') }
  [Environment]::SetEnvironmentVariable('BOTC_AI_ENABLED','false','Process')
}

function Import-AssistantAISettings([string]$Path) {
  try {
    if (!(Test-Path -LiteralPath $Path -ErrorAction Stop)) { return }
    $settings = Read-AssistantAISettings $Path
    foreach ($name in $script:AssistantAISettingNames) { [Environment]::SetEnvironmentVariable($name,$settings[$name],'Process') }
  } catch {
    Disable-AssistantAISettings
    # Manual hosting remains available even if encrypted AI settings are damaged.
    Write-Warning 'Protected AI settings unavailable; AI disabled. Manual hosting remains available.'
  }
}
