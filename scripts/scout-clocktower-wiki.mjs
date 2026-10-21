import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const source = 'https://kkovo550.github.io/clocktower-wiki/'
const resources = [
  ['catalog.js', 'script_lib/assets/data/catalog.js', 2 * 1024 * 1024],
  ['scripts-full.js', 'script_lib/assets/scripts-full.js', 32 * 1024 * 1024],
]
const sha256 = (text) => createHash('sha256').update(text).digest('hex')

export function splitScriptSource(raw) {
  if (!Array.isArray(raw)) throw new Error('原文必须为角色数组。')
  const rules = raw.filter((entry) => entry?.team === 'a jinxed')
  if (rules.some((entry) => ['id', 'name', 'ability'].some((field) => typeof entry[field] !== 'string' || !entry[field].trim()))) {
    throw new Error('相克附注缺少ID、名称或完整规则；不能作为角色或静默丢弃。')
  }
  return { roles: raw.filter((entry) => typeof entry === 'string' || entry?.id !== '_meta' && entry?.team !== 'a jinxed'), rules }
}

export function parseAssignments(text, names) {
  const result = {}
  for (const line of text.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('//')) continue
    const hit = line.match(/^(?:var |window\.)([A-Z_]+)=(.*);$/)
    if (!hit || !names.includes(hit[1]) || Object.hasOwn(result, hit[1])) throw new Error('Unexpected source statement')
    result[hit[1]] = JSON.parse(hit[2])
  }
  if (names.some((name) => !Object.hasOwn(result, name))) throw new Error('Incomplete source assignments')
  return result
}

export function collectCandidates(catalogText, fullText) {
  const c = parseAssignments(catalogText, ['LIBRARY_BUILD', 'CHARS', 'SCRIPTS', 'CATS'])
  const f = parseAssignments(fullText, ['SCRIPT_FULL_BUILD', 'SCRIPT_FULL'])
  if (!/^[a-f0-9]{64}$/.test(c.LIBRARY_BUILD) || c.LIBRARY_BUILD !== f.SCRIPT_FULL_BUILD) throw new Error('Source build mismatch')
  if (![c.CHARS, c.SCRIPTS, c.CATS, f.SCRIPT_FULL].every(Array.isArray) || !c.SCRIPTS.length || c.SCRIPTS.length !== f.SCRIPT_FULL.length) throw new Error('Source array length mismatch')
  const rows = c.SCRIPTS.map((entry, index) => {
    if (!Array.isArray(entry) || typeof entry[0] !== 'string' || !Array.isArray(entry[5])) throw new Error(`Malformed catalog entry ${index}`)
    const resource = f.SCRIPT_FULL[index]
    const raw = resource?.t
    let status = 'candidate-needs-original-json', parseError = '', roleCount = null
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw.replace(/^\uFEFF/, ''))
        if (!Array.isArray(parsed)) throw new Error('Expected JSON array')
        roleCount = parsed.filter((role) => typeof role === 'string' || (role && role.id !== '_meta')).length
        status = 'candidate-needs-rule-review'
      } catch (error) { status = 'candidate-bad-original-json'; parseError = error.message.slice(0, 240) }
    }
    return { index, name: entry[0], author: entry[1] || '', category: entry[2] || '', sourcePathOrUrl: entry[3] || '',
      format: entry[6] || '', versionLabel: entry[9] || '', familyKey: entry[12]?.family || '',
      contentKey: entry[12]?.content || '', originalResourceKey: entry[12]?.original || '',
      rawFileName: resource?.f || '', rawJsonSha256: typeof raw === 'string' && raw.trim() ? sha256(raw) : '',
      rawRoleCount: roleCount, status, parseError,
    }
  })
  return { source, sourceBuild: c.LIBRARY_BUILD, entries: rows.length,
    familyGroups: new Set(rows.map((r) => r.familyKey || `entry:${r.index}`)).size,
    contentVersions: new Set(rows.map((r) => r.contentKey || `entry:${r.index}`)).size,
    statusCounts: rows.reduce((counts, row) => { counts[row.status] = (counts[row.status] || 0) + 1; return counts }, {}),
    fetchedExternalLinks: false, downloadedImages: false, sourceKeysAreOpaque: true, rows,
  }
}

async function download(relative, maxBytes) {
  const url = new URL(relative, source)
  if (url.origin !== new URL(source).origin) throw new Error('Only fixed same-origin resources are allowed')
  const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(45_000) })
  if (!response.ok || !response.body) throw new Error(`Source request failed (${response.status})`)
  if (Number(response.headers.get('content-length')) > maxBytes) throw new Error('Source exceeds size limit')
  const chunks = []
  let length = 0
  for await (const chunk of response.body) {
    length += chunk.length
    if (length > maxBytes) { await response.body.cancel().catch(() => {}); throw new Error('Source exceeds size limit') }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function candidatesCsv(rows) {
  const keys = Object.keys(rows[0])
  const cell = (value) => {
    const text = String(value ?? '')
    // 来源名称只能作为文字显示，不能在表格软件里执行公式。
    const literal = /^[\s]*[=+\-@]|^[\t\r\n]/.test(text) ? `'${text}` : text
    return `"${literal.replaceAll('"', '""')}"`
  }
  return '\uFEFF' + keys.join(',') + '\n' + rows.map((row) => keys.map((key) => cell(row[key])).join(',')).join('\n') + '\n'
}

async function main() {
  const args = process.argv.slice(2)
  const value = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3)
  if (args.includes('--help')) {
    console.log('node scripts/scout-clocktower-wiki.mjs --cache=DIR --out=DIR [--fetch]\nOffline by default. --fetch refreshes the two fixed same-origin source files. No external links/images or registry writes.')
    return
  }
  if (args.some((arg) => arg !== '--fetch' && !/^--(?:cache|out)=.+/.test(arg))) throw new Error('Unknown argument')
  const cacheDir = resolve(value('cache') || '.tmp/clocktower-wiki-cache')
  const outputDir = resolve(value('out') || '.tmp/clocktower-wiki-candidates')
  const texts = []
  for (const [name, relative, maxBytes] of resources) {
    const text = args.includes('--fetch') ? await download(relative, maxBytes) : await readFile(resolve(cacheDir, name), 'utf8')
    if (Buffer.byteLength(text) > maxBytes) throw new Error(`${name} exceeds size limit`)
    texts.push(text)
  }
  const report = collectCandidates(...texts)
  await mkdir(outputDir, { recursive: true })
  if (args.includes('--fetch')) {
    await mkdir(cacheDir, { recursive: true })
    for (const [index, [name]] of resources.entries()) await writeFile(resolve(cacheDir, name), texts[index])
  }
  const { rows, ...summary } = report
  summary.generatedAt = new Date().toISOString()
  summary.cacheDir = cacheDir
  summary.files = resources.map(([name, relative], i) => ({ name, sourceUrl: new URL(relative, source).href, bytes: Buffer.byteLength(texts[i]), sha256: sha256(texts[i]) }))
  await writeFile(resolve(outputDir, 'source-candidates.csv'), candidatesCsv(rows))
  await writeFile(resolve(outputDir, 'source-summary.json'), JSON.stringify(summary, null, 2) + '\n')
  console.log(JSON.stringify({ entries: report.entries, familyGroups: report.familyGroups, contentVersions: report.contentVersions, statusCounts: report.statusCounts, outputDir }))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main().catch((error) => { console.error(error.message); process.exitCode = 1 })
