import { execFileSync } from 'node:child_process'

const rgGlobs = [
  '--hidden',
  '--glob', '!node_modules/**',
  '--glob', '!dist/**',
  '--glob', '!dist-server/**',
  '--glob', '!package-lock.json',
  '--glob', '!scripts/public-release-audit.mjs',
  '--glob', '!.git/**',
]

const regexChecks = [
  {
    name: 'real-looking API keys',
    pattern: 'sk-yse|sk-[A-Za-z0-9]{24,}',
    allowed: [
      'sk-provider-secret-should-not-leak',
      'sk-test-secret-should-not-leak',
      'sk-route-secret-should-not-leak',
      'sk-night-provider-secret',
      'sk-setup-provider-secret',
      'sk-review-provider-secret',
      'sk-test-not-saved',
      'sk-should-not-persist',
      'sk-temporary-live-test',
      'sk-...',
    ],
  },
]

const fixedChecks = [
  { name: 'local personal path/name', token: 'private-user' },
  { name: 'wechat id', token: 'wxid_' },
  { name: 'local user path', token: '<private-workspace>' },
  { name: 'local user path', token: '<private-workspace>' },
  { name: 'local workspace path', token: 'D:\\\u6587\u6863' },
  { name: 'local F drive path', token: 'F:\\' },
]

function runRg(pattern) {
  try {
    return execFileSync('rg', ['-n', ...rgGlobs, pattern, '.'], { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean)
  } catch (error) {
    if (error.status === 1) return []
    throw error
  }
}

function runFixed(token) {
  try {
    return execFileSync('rg', ['-n', '-F', ...rgGlobs, token, '.'], { encoding: 'utf8' })
      .split(/\r?\n/)
      .filter(Boolean)
  } catch (error) {
    if (error.status === 1) return []
    throw error
  }
}

let failed = false
for (const check of regexChecks) {
  const hits = runRg(check.pattern)
    .filter((line) => !check.allowed.some((token) => line.includes(token)))
  if (hits.length) {
    failed = true
    console.error(`\n[public-audit] ${check.name} needs review:`)
    for (const hit of hits.slice(0, 80)) console.error(`  ${hit}`)
    if (hits.length > 80) console.error(`  ... ${hits.length - 80} more`)
  }
}

for (const check of fixedChecks) {
  const hits = runFixed(check.token)
  if (hits.length) {
    failed = true
    console.error(`\n[public-audit] ${check.name} needs review (${check.token}):`)
    for (const hit of hits.slice(0, 80)) console.error(`  ${hit}`)
    if (hits.length > 80) console.error(`  ... ${hits.length - 80} more`)
  }
}

const binaryAssetHits = runRg('public/assets/(characters/.*\\.webp|community/.*\\.(png|jpg|jpeg|webp|gif))')
if (binaryAssetHits.length) {
  console.warn('\n[public-audit] asset references found. This is OK for source references, but binary assets should stay ignored or move to optional packs.')
}

if (failed) {
  console.error('\n[public-audit] failed')
  process.exit(1)
}

console.log('[public-audit] passed')
