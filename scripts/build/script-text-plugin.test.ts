// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { scriptTextPlugin } from './script-text-plugin'
import { scriptTextModule } from './compact-script-text'

test('watches and compacts the extracted shared role definitions as well as script packs', async () => {
  const plugin = scriptTextPlugin()
  const configure = plugin.configResolved as (config: { root: string }) => void
  configure({ root: process.cwd() })
  const watched: string[] = []
  await (plugin.buildStart as (this: { addWatchFile: (file: string) => void }) => Promise<void>).call({ addWatchFile: (file) => watched.push(file.replaceAll('\\', '/')) })
  const file = resolve('src/domain/scripts/role-library/trouble-brewing/roles.ts')
  expect(watched).toContain(file.replaceAll('\\', '/'))
  const result = (plugin.transform as (code: string, id: string) => { code: string } | null)(readFileSync(file, 'utf8'), file)
  expect(result?.code).toContain(scriptTextModule)
})
