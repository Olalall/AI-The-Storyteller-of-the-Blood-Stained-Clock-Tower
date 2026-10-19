import { describe, expect, it } from 'vitest'
import { candidatesCsv, collectCandidates, parseAssignments } from './scout-clocktower-wiki.mjs'

const build = 'a'.repeat(64)
const row = (format = 'json') => ['Example', 'Author', 'Group', format === 'url' ? 'https://example.com/script' : 'Example.json', 1, [0], format, '', '', '', [], {}, { family: 'opaque-family', content: 'opaque-version', original: 'opaque-resource' }]
const catalog = (rows = [row()]) => `// Generated data\nvar LIBRARY_BUILD=${JSON.stringify(build)};\nvar CHARS=[["Role","townsfolk",""]];\nvar SCRIPTS=${JSON.stringify(rows)};\nvar CATS=[];`
const full = (scripts: unknown[], version = build) => `window.SCRIPT_FULL_BUILD=${JSON.stringify(version)};\nwindow.SCRIPT_FULL=${JSON.stringify(scripts)};`

describe('clocktower wiki source collector', () => {
  it('exports untrusted titles as spreadsheet text while retaining quotes and newlines', () => {
    const output = candidatesCsv([{ name: '=1+1', author: ' +2', description: 'a,"b"\nc' }])
    expect(output).toContain('"\'=1+1","\' +2","a,""b""\nc"')
    expect(candidatesCsv([{ name: '@SUM(1)', author: '\t42' }])).toContain('"\'@SUM(1)","\'\t42"')
  })
  it('rejects executable tails and unexpected assignments without evaluating them', () => {
    expect(() => parseAssignments('var DATA=[];globalThis.executed=true;', ['DATA'])).toThrow()
    expect(() => parseAssignments('var DATA=[];\nprocess.exit();', ['DATA'])).toThrow()
  })
  it('rejects mismatched builds and array lengths', () => {
    expect(() => collectCandidates(catalog(), full([null], 'b'.repeat(64)))).toThrow('build mismatch')
    expect(() => collectCandidates(catalog(), full([]))).toThrow('length mismatch')
  })
  it('keeps bad JSON and URL-only entries as candidates instead of fetching or dropping them', () => {
    const report = collectCandidates(catalog([row(), row('url')]), full([{ f: 'bad.json', t: '{broken' }, null]))
    expect(report.rows.map((r: { status: string }) => r.status)).toEqual(['candidate-bad-original-json', 'candidate-needs-original-json'])
    expect(report.rows[1].sourcePathOrUrl).toBe('https://example.com/script')
    expect(report.fetchedExternalLinks).toBe(false)
  })
  it('parses valid raw arrays and hashes original text independently of opaque keys', () => {
    const report = collectCandidates(catalog(), full([{ f: 'ok.json', t: '["washerwoman"]' }]))
    expect(report.rows[0].status).toBe('candidate-needs-rule-review')
    expect(report.rows[0].rawJsonSha256).toMatch(/^[a-f0-9]{64}$/)
    expect(report.rows[0].originalResourceKey).toBe('opaque-resource')
    expect(report.rows[0].rawRoleCount).toBe(1)
  })
})
