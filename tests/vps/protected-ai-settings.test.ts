import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { promisify } from 'node:util'
import { expect, it } from 'vitest'

const execute = promisify(execFile)
const elevated = process.platform === 'win32' && (await execute('powershell.exe', [
  '-NoProfile', '-Command', '[Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)',
], { windowsHide: true })).stdout.trim() === 'True'

it.skipIf(!elevated)('loads protected AI settings across real Windows startup processes and fails closed', async () => {
  const result = await execute('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'tests/vps/protected-ai-settings.ps1',
    '-NodePath', process.execPath, '-ScratchPath', path.resolve('.tmp', `vps-ai-config-test-${randomUUID()}`),
  ], { windowsHide: true, timeout: 30000, maxBuffer: 100000 })
  const report = JSON.parse(result.stdout.trim())
  expect(report).toMatchObject({ Passed: true, FakeCredentialsOnly: true, ProductionChanged: false })
  expect(report.Checks).toBeGreaterThanOrEqual(20)
}, 35000)
