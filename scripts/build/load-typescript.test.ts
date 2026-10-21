import { expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createTypescriptLoader } from './load-typescript.mjs'

it('loads trusted guard modules with an empty offline build environment without editing strings', () => {
  const root = mkdtempSync(join(tmpdir(), 'botc-offline-import-meta-')), file = join(root, 'guard.ts')
  try {
    writeFileSync(file, `export const env = import.meta.env; export const url = import.meta.url; export const text = 'import.meta.env';`)
    const result = createTypescriptLoader()(file)
    expect(result.env).toEqual({})
    expect(result.url).toBe(pathToFileURL(file).href)
    expect(result.text).toBe('import.meta.env')
  } finally { rmSync(root, { recursive: true, force: true }) }
})
