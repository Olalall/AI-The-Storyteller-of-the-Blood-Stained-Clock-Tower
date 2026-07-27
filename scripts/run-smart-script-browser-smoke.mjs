import { spawn } from 'node:child_process'

const command = process.execPath
const args = ['node_modules/@playwright/test/cli.js', 'test', 'tests/e2e/bulk-smart-scripts.spec.ts', ...process.argv.slice(2)]

const child = spawn(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    BOTC_RUN_BULK_SCRIPT_SMOKE: '1',
  },
})

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`bulk smart script smoke stopped by ${signal}`)
    process.exit(1)
  }
  process.exit(code ?? 1)
})
