param([Parameter(Mandatory=$true)][string]$NodePath,[Parameter(Mandatory=$true)][string]$ScratchPath)
$ErrorActionPreference = 'Stop'
$repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
. (Join-Path $repository 'scripts\vps\assistant-ai-settings.ps1')
Disable-AssistantAISettings
$scratch = [IO.Path]::GetFullPath($ScratchPath)
$allowed = [IO.Path]::GetFullPath((Join-Path $repository '.tmp')).TrimEnd('\')+'\'
if (!$scratch.StartsWith($allowed,[StringComparison]::OrdinalIgnoreCase)) { throw 'Test scratch must remain in repository .tmp' }
New-Item -ItemType Directory -Path $scratch -Force | Out-Null
Set-AssistantPrivateAcl $scratch -Directory
$path = Join-Path $scratch 'secrets\ai-settings.dpapi'
$fakeApi = 'FAKE-ONLY-API-CREDENTIAL'
$valid = @{BOTC_AI_ENABLED='true';BOTC_AI_PROVIDER='openai-compatible';BOTC_AI_BASE_URL='https://provider.example.test/v1';BOTC_AI_MODEL='test-model';BOTC_AI_API_KEY=$fakeApi;BOTC_AI_ACCESS_SECRET=('S'*40);BOTC_AI_PUBLIC_ORIGIN='https://botc.example.test';BOTC_AI_TIMEOUT_MS='90000';BOTC_AI_MAX_CONTEXT_TOKENS='12000'}
$checks = 0
function Expect-Rejected([scriptblock]$Action) {
  $rejected = $false
  try { $null = & $Action } catch { $rejected = $true }
  if (!$rejected) { throw 'Expected private configuration operation to be rejected' }
}
$receipt = Write-AssistantAISettings $path ($valid | ConvertTo-Json -Compress)
if (!$receipt.Installed -or $receipt.BackupCreated) { throw 'Initial installation failed' }; $checks++
if ([IO.File]::ReadAllText($path).Contains($fakeApi)) { throw 'Secret was written in plaintext' }; $checks++
$read = Read-AssistantAISettings $path
foreach ($name in $valid.Keys) { if ($read[$name] -cne $valid[$name]) { throw 'DPAPI configuration differs' } }; $checks++
Import-AssistantAISettings $path
if ($env:BOTC_AI_API_KEY -cne $fakeApi -or $env:BOTC_AI_ACCESS_SECRET.Length -ne 40) { throw 'Process environment injection failed' }; $checks++
foreach ($patch in @(@{NODE_OPTIONS='--inspect'},@{BOTC_AI_ACCESS_SECRET='short'},@{BOTC_AI_PUBLIC_ORIGIN='https://public.example.test/path'},@{BOTC_AI_BASE_URL='https://user:secret@provider.example.test/v1'},@{BOTC_AI_TIMEOUT_MS='0'},@{BOTC_AI_API_KEY=1})) {
  $bad = $valid.Clone(); foreach ($key in $patch.Keys) { $bad[$key]=$patch[$key] }
  $before = [IO.File]::ReadAllText($path)
  Expect-Rejected { Write-AssistantAISettings $path ($bad | ConvertTo-Json -Compress) }
  if ([IO.File]::ReadAllText($path) -cne $before) { throw 'Rejected configuration replaced existing file' }; $checks++
}
foreach ($json in @('{bad','null','[]','"string"')) { Expect-Rejected { ConvertTo-AssistantAISettings $json }; $checks++ }
$next = $valid.Clone(); $next.BOTC_AI_MODEL='fake-next-model'
$next.BOTC_AI_PUBLIC_ACCESS='true'
$receipt = Write-AssistantAISettings $path ($next | ConvertTo-Json -Compress)
$publicRead = Read-AssistantAISettings $path
if ($publicRead.BOTC_AI_PUBLIC_ACCESS -cne 'true' -or $publicRead.BOTC_AI_API_KEY -cne $fakeApi -or $publicRead.BOTC_AI_ACCESS_SECRET -cne $valid.BOTC_AI_ACCESS_SECRET) { throw 'Public AI update changed private credentials' }; $checks++
$invalidPublic = $next.Clone(); $invalidPublic.BOTC_AI_PUBLIC_ACCESS='yes'
Expect-Rejected { ConvertTo-AssistantAISettings ($invalidPublic | ConvertTo-Json -Compress) }; $checks++
$backup = @(Get-ChildItem -LiteralPath (Split-Path -Parent $path) -Filter '*.previous.dpapi')
if (!$receipt.BackupCreated -or $backup.Count -ne 1 -or (Read-AssistantAISettings $backup[0].FullName).BOTC_AI_MODEL -cne $valid.BOTC_AI_MODEL -or (Read-AssistantAISettings $path).BOTC_AI_MODEL -cne $next.BOTC_AI_MODEL) { throw 'Atomic update or encrypted backup failed' }; $checks++
$originalAcl = Get-Acl -LiteralPath $path
$unsafeAcl = Get-Acl -LiteralPath $path
[void]$unsafeAcl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new('S-1-5-32-545'),'Read','Allow'))
Set-Acl -LiteralPath $path -AclObject $unsafeAcl
Expect-Rejected { Read-AssistantAISettings $path }; $checks++
Import-AssistantAISettings $path 3>$null
if ($env:BOTC_AI_ENABLED -cne 'false' -or $env:BOTC_AI_API_KEY -or $env:BOTC_AI_ACCESS_SECRET -or $env:BOTC_AI_PUBLIC_ACCESS) { throw 'Unsafe ACL did not disable AI' }; $checks++
Set-Acl -LiteralPath $path -AclObject $originalAcl
$app = Join-Path $scratch 'app'
New-Item -ItemType Directory -Path (Join-Path $app 'dist-server') -Force | Out-Null
@'
const expected = process.env.BOTC_TEST_EXPECT;
const loaded = process.env.BOTC_AI_ENABLED === 'true' && process.env.BOTC_AI_API_KEY === 'FAKE-ONLY-API-CREDENTIAL' && process.env.BOTC_AI_ACCESS_SECRET === 'S'.repeat(40) && process.env.BOTC_AI_PUBLIC_ORIGIN === 'https://botc.example.test';
const disabled = process.env.BOTC_AI_ENABLED === 'false' && !process.env.BOTC_AI_API_KEY && !process.env.BOTC_AI_ACCESS_SECRET;
if (expected === 'loaded' ? !loaded : !disabled) { console.error('STARTUP_PROBE_FAILED'); process.exit(1); }
console.log('STARTUP_PROBE_OK');
'@ | Set-Content -LiteralPath (Join-Path $app 'dist-server\runtime.mjs') -Encoding UTF8
$start = Join-Path $repository 'scripts\vps\start-assistant.ps1'
foreach ($mode in @('loaded','corrupt','missing')) {
  $env:BOTC_TEST_EXPECT=if ($mode -eq 'loaded') { 'loaded' } else { 'disabled' }
  $settingsPath=$path
  if ($mode -eq 'corrupt') { [IO.File]::WriteAllText($path,'broken DPAPI'); $env:BOTC_AI_ENABLED='true'; $env:BOTC_AI_API_KEY=$fakeApi; $env:BOTC_AI_ACCESS_SECRET='S'*40 }
  if ($mode -eq 'missing') { Disable-AssistantAISettings; $settingsPath=Join-Path $scratch 'does-not-exist.dpapi' }
  $output = (& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $start -AppDir $app -NodePath $NodePath -AISettingsFile $settingsPath 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0 -or $output.Contains($fakeApi)) { throw 'Actual startup process failed or leaked credentials' }; $checks++
}
$log = [IO.File]::ReadAllText((Join-Path $app 'logs\runtime.log')).Replace([string][char]0,'')
if ($log.Contains($fakeApi) -or $log.Contains('S'*40) -or ([regex]::Matches($log,'STARTUP_PROBE_OK')).Count -ne 3) { throw 'Startup log leaked credentials or did not run all probes' }; $checks++
Disable-AssistantAISettings
@{Passed=$true;Checks=$checks;FakeCredentialsOnly=$true;ProductionChanged=$false;PowerShell=$PSVersionTable.PSVersion.ToString()} | ConvertTo-Json -Compress
