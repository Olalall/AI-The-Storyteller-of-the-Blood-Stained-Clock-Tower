import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const audit = resolve('scripts/public-release-audit.mjs')
const roots: string[] = []

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'botc-public-audit-'))
  roots.push(root)
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  function file(path: string, text: string) {
    const target = join(root, path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, text)
  }
  file('public/assets/characters/source-manifest.json', JSON.stringify({ version: 1, generatedAt: '', scope: '', notice: '', sources: [], assets: {} }))
  file('public/assets/community/source-manifest.json', JSON.stringify({ source: '', retrievedAt: '', usage: '', sha256: '', policy: '' }))
  return {
    file,
    track(path: string) { execFileSync('git', ['add', '--', path], { cwd: root }) },
    run() {
      const result = spawnSync(process.execPath, [audit], { cwd: root, encoding: 'utf8' })
      return { status: result.status, output: result.stdout + result.stderr }
    },
  }
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('public release privacy audit', { timeout: 15000 }, () => {
  it.each([true, false])('checks tracked=%s text and never prints the matched value', (tracked) => {
    const f = fixture()
    const credential = `sk-${'Q'.repeat(32)}`
    f.file('candidate.txt', `key=${credential}`)
    if (tracked) f.track('candidate.txt')
    const result = f.run()
    expect(result.status).toBe(1)
    expect(result.output).toContain('candidate.txt:1')
    expect(result.output).not.toContain(credential)
  })

  it('does not scan ignored private files', () => {
    const f = fixture()
    f.file('.gitignore', '.env\n')
    f.file('.env', `API_KEY=sk-${'Q'.repeat(32)}`)
    expect(f.run().status).toBe(0)
  })

  it('an allowed fixture key cannot hide a different credential on the same line', () => {
    const f = fixture()
    const credential = `sk-${'R'.repeat(32)}`
    f.file('candidate.txt', `sk-provider-secret-should-not-leak ${credential}`)
    const result = f.run()
    expect(result.status).toBe(1)
    expect(result.output).not.toContain(credential)
  })

  it('reports personal home paths and cloud IDs without echoing them', () => {
    const f = fixture()
    const home = ['C:', 'Users', 'audit-person', 'work'].join('/')
    const instance = 'lhins-' + 'synthetic123'
    f.file('candidate.txt', `${home}\n${instance}`)
    const result = f.run()
    expect(result.status).toBe(1)
    expect(result.output).toContain('candidate.txt:1')
    expect(result.output).toContain('candidate.txt:2')
    expect(result.output).not.toContain(home)
    expect(result.output).not.toContain(instance)
  })

  it('accepts reserved examples and loopback URLs', () => {
    const f = fixture()
    f.file('candidate.md', 'https://api.example.com/v1\nhttp://127.0.0.1:8787\nhttps://192.0.2.4/\nhttps://198.51.100.2/\nhttps://203.0.113.1/')
    expect(f.run().status).toBe(0)
  })

  it('rejects an unpublished API configuration URL without echoing it', () => {
    const f = fixture()
    const endpoint = 'https://not-an-example-provider.com/v1'
    f.file('candidate.env', `BOTC_AI_BASE_URL=${endpoint}`)
    const result = f.run()
    expect(result.status).toBe(1)
    expect(result.output).toContain('candidate.env:1')
    expect(result.output).not.toContain(endpoint)
  })

  it('accepts reserved API examples and generic supplier documentation', () => {
    const f = fixture()
    f.file('candidate.env', 'BOTC_AI_BASE_URL=https://api.example.com/v1\nbaseUrl=https://api.openai.com/v1')
    expect(f.run().status).toBe(0)
  })
})
