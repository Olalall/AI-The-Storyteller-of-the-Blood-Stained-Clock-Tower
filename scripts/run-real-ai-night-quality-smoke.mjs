import { spawnSync } from 'node:child_process'

const required = ['BOTC_AI_BASE_URL', 'BOTC_AI_MODEL', 'BOTC_AI_API_KEY']
const missing = required.filter((name) => !process.env[name]?.trim())

if (missing.length) {
  console.error(`Missing ${missing.join(', ')}. Set them in your shell or server secret store before running live AI smoke.`)
  process.exit(1)
}

process.env.BOTC_RUN_REAL_AI_NIGHT_QUALITY_SMOKE = '1'

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(command, [
  'vitest',
  'run',
  'server/ai/nightSettlementProvider.live.test.ts',
  '--reporter=verbose',
], {
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
