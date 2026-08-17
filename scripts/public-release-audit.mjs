import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const regexChecks = [
  {
    /**
     * 裁决 11 第三条：仓库内不得出现 botc.games / cdn.botc.games 的资源 URL。
     * 魔典的视觉参考了 botc.games，但参考的只是散文化的几何描述——一旦仓库里出现它的资源 URL，
     * 就说明有人在运行时拉它的素材，那既是许可问题，也是「本工具不依赖任何第三方素材」这条保证的破口。
     *
     * 刻意只匹配 URL 形态而不是裸词：设计文档里必须能讨论 botc.games（它是本项目的视觉参考来源），
     * 把提及也判违规会逼着作者不写下参考了什么，那正好丢掉了最该留档的信息。
     */
    name: 'botc.games resource URL',
    pattern: '(https?:)?//(cdn\\.)?botc\\.games/',
    allowed: [],
  },
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
  { name: 'local personal path/name', token: '\u6881\u535a\u5ef6' },
  { name: 'wechat id', token: 'wxid_' },
  { name: 'local user path', token: 'C:/Users/Administrator' },
  { name: 'local user path', token: 'C:\\Users\\Administrator' },
  { name: 'local workspace path', token: 'D:\\\u6587\u6863' },
  { name: 'local F drive path', token: 'F:\\' },
]

const EXCLUDED_FILES = new Set(['package-lock.json', 'scripts/public-release-audit.mjs'])

/**
 * 扫描面 = Git 已跟踪文件 + 尚未跟踪但未被 .gitignore 排除的文件。
 *
 * 发布前的新文件通常还没提交；只扫 git ls-files 会让真正准备进入 Release 的新文件
 * 落在门禁之外。使用 --cached --others --exclude-standard 可覆盖拟发布文件，同时继续
 * 排除 node_modules、构建产物和本地素材包。
 *
 * 本仓的 public/assets 下
 * 有大量本地下载的、被 .gitignore 排除的角色图。用目录遍历会把它们当文本读，
 * 于是 JPEG 的字节流里凑巧出现的 "F:\\" 会被报成「本地路径泄露」——
 * 一次全是假阳性的发布闸门，比没有闸门更糟：它会训练人忽略它。
 */
function publishableTextFiles() {
  return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter((file) => file && !EXCLUDED_FILES.has(file) && !BINARY_EXTENSIONS.test(file))
}

// git 跟踪的二进制（图标、字体）同样不该被当文本扫。
const BINARY_EXTENSIONS = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|zip|gz|mp4|wasm)$/i

function scanWithNode(matcher) {
  const hits = []
  for (const file of publishableTextFiles()) {
    let text
    try {
      text = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    text.split(/\r?\n/).forEach((line, index) => {
      if (matcher(line)) hits.push(`${file}:${index + 1}:${line}`)
    })
  }
  return hits
}

function runRg(pattern) {
  const regex = new RegExp(pattern)
  return scanWithNode((line) => regex.test(line))
}

function runFixed(token) {
  return scanWithNode((line) => line.includes(token))
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

// 裁决 11 第一条：内联 data URI 可以绕过 .gitignore 把二进制素材偷渡进仓库。
// 2KB 是判据：图标类占位（小 SVG、1px 透明 png）在这个量级以下，真素材一定超。
const DATA_URI_LIMIT_BYTES = 2048
const dataUriHits = runRg('data:image/[a-zA-Z+]+;base64,[A-Za-z0-9+/=]{2048,}')
if (dataUriHits.length) {
  failed = true
  console.error(`\n[public-audit] inline data:image over ${DATA_URI_LIMIT_BYTES}B needs review:`)
  for (const hit of dataUriHits.slice(0, 20)) console.error(`  ${hit.slice(0, 160)}...`)
}

// 裁决 11 第二条：source-manifest 字段完整性。
// 缺字段的清单等于「我们不知道这个素材从哪来」——那正是它存在的唯一理由。
const manifestChecks = [
  {
    file: 'public/assets/characters/source-manifest.json',
    top: ['version', 'generatedAt', 'scope', 'notice', 'sources'],
    // 每个素材都要能回答：从哪来、什么类型、内容是否可校验、多大。
    perAsset: ['roleId', 'kind', 'url', 'sha256', 'bytes', 'mediaType'],
  },
  {
    file: 'public/assets/community/source-manifest.json',
    top: ['source', 'retrievedAt', 'usage', 'sha256', 'policy'],
    perAsset: null,
  },
]

for (const check of manifestChecks) {
  let manifest
  try {
    manifest = JSON.parse(readFileSync(check.file, 'utf8'))
  } catch (error) {
    failed = true
    console.error(`\n[public-audit] source manifest unreadable: ${check.file} (${error.message})`)
    continue
  }
  const missingTop = check.top.filter((key) => manifest[key] === undefined)
  if (missingTop.length) {
    failed = true
    console.error(`\n[public-audit] ${check.file} missing top-level fields: ${missingTop.join(', ')}`)
  }
  if (!check.perAsset) continue
  const assets = manifest.assets ?? {}
  const incomplete = Object.entries(assets)
    .filter(([, entry]) => check.perAsset.some((key) => entry?.[key] === undefined))
    .map(([name, entry]) => `${name} (missing ${check.perAsset.filter((key) => entry?.[key] === undefined).join('/')})`)
  if (incomplete.length) {
    failed = true
    console.error(`\n[public-audit] ${check.file} has ${incomplete.length} incomplete asset entries:`)
    for (const line of incomplete.slice(0, 20)) console.error(`  ${line}`)
    if (incomplete.length > 20) console.error(`  ... ${incomplete.length - 20} more`)
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
