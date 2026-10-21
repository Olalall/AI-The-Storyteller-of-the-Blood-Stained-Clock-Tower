import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { performance } from 'node:perf_hooks'
import { createTypescriptLoader } from './build/load-typescript.mjs'
import { prepareScriptPack, projectContext, writePreparedScript } from './prepare-script-pack.mjs'
import { fillTemplateGaps } from './prepare-script-templates.mjs'
import { verifyPreparedScript } from './verify-script-batch.mjs'
import { splitScriptSource } from './scout-clocktower-wiki.mjs'

const sha = (value) => createHash('sha256').update(value).digest('hex')
const milliseconds = (start) => Math.round((performance.now() - start) * 1000) / 1000
const readJson = (bytes, label) => {
  try { return JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/, '')) } catch { throw new Error(`${label}不是有效JSON。`) }
}

export function createBatchContext(root) {
  const start = performance.now(), load = createTypescriptLoader()
  const context = projectContext(root, load)
  return { ...context, load, module: (file) => resolve(root, file), contextLoadMs: milliseconds(start),
    officialIds: load(resolve(root, 'src/domain/scripts/officialRoleIds.ts')).officialRoleIds,
    nightSheet: load(resolve(root, 'src/features/night-workbench/data/official/nightsheet.json')) }
}

function checkedSource(input, directory, context) {
  const name = input.sourceFile
  if (typeof name !== 'string' || !name || isAbsolute(name) || /^[a-z]:/i.test(name) || name.split(/[\\/]/).includes('..')) throw new Error('原文路径必须位于批次清单目录内。')
  const path = resolve(directory, name), relativePath = relative(realpathSync(directory), realpathSync(path))
  if (relativePath === '..' || relativePath.startsWith('..' + sep) || isAbsolute(relativePath)) throw new Error('原文路径不能经链接跳出清单目录。')
  if (!statSync(path).isFile() || statSync(path).size > 2 * 1024 * 1024) throw new Error('原文必须为不超过2MiB的文件。')
  const bytes = readFileSync(path)
  if (input.source?.contentHash !== 'sha256:' + sha(bytes)) throw new Error('原文字节与来源哈希不一致。')
  const raw = readJson(bytes, '原文')
  if (!Array.isArray(raw) || raw.filter((role) => role?.id === '_meta').length > 1) throw new Error('原文必须为单一元数据的角色数组。')
  const { roles: entries, rules: authorRuleEntries } = splitScriptSource(raw)
  if (!entries.length || entries.length !== input.roleRefs?.length) throw new Error('原文角色数量与声明引用数量不一致。')
  const aliases = entries.map((entry, index) => {
    const original = typeof entry === 'string' ? { id: entry } : entry
    if (!original || typeof original.id !== 'string') throw new Error('原文角色缺少稳定ID或已核对的别名。')
    const resolved = context.library.resolve(input.roleRefs[index]), roleId = context.normalizeRoleId(resolved.role.id)
    if (context.library.variants(original.id).length && context.normalizeRoleId(original.id) !== roleId) throw new Error('原文的已知角色ID与引用不一致。')
    const team = original.team === 'traveller' ? 'traveler' : original.team
    if (team && team !== resolved.role.team) throw new Error('原文角色类型与共享定义冲突；须单独核对版本。')
    return { rawId: original.id, rawName: original.name ?? null, rawTeam: original.team ?? null, roleId,
      sourceId: resolved.sourceId, sourceVersion: resolved.sourceVersion,
      rawAbilitySha256: typeof original.ability === 'string' ? sha(original.ability) : null,
      resolvedAbilitySha256: sha(resolved.role.abilityText),
      aliasReviewRequired: context.normalizeRoleId(original.id) !== roleId,
      abilityTextReviewRequired: typeof original.ability !== 'string' || original.ability !== resolved.role.abilityText }
  })
  const metadata = raw.find((role) => role?.id === '_meta') ?? null
  return { bytes, lock: { sourceUrl: input.source.url, rawJsonSha256: sha(bytes), rawJsonByteLength: bytes.length,
    reviewedAt: input.source.verifiedAt, roleAliases: aliases, authorMetadata: metadata,
    authorRuleEntries,
    authorSpecialRules: [...(Array.isArray(metadata?.state) ? metadata.state : []), ...(Array.isArray(metadata?.states) ? metadata.states : []), ...authorRuleEntries],
    knowledgeStatus: 'needs-review', automaticApproval: false } }
}

function checkOfficialOrders(definition, context) {
  const ids = new Set(definition.roleRefs.map((reference) => reference.id))
  if (definition.roleRefs.some((reference) => !context.officialIds.has(reference.id))) return false
  for (const phase of ['firstNight', 'otherNight']) {
    const expected = context.nightSheet[phase].filter((id) => ids.has(id))
    if (JSON.stringify(definition.nightOrders[phase].map((entry) => entry.roleId)) !== JSON.stringify(expected)) throw new Error('夜序与项目已核官方夜表不一致；不能静默漏项或改序。')
  }
  return true
}

export function prepareScriptBatch(manifest, directory, context) {
  const start = performance.now()
  if (!Array.isArray(manifest?.scripts) || !manifest.scripts.length) throw new Error('批次必须含非空scripts数组。')
  const seenIds = new Set(), seenHashes = new Set()
  for (const input of manifest.scripts) {
    if (!input || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.scriptId) || input.scriptId.length > 80) throw new Error('批次板子ID不合法。')
    if (seenIds.has(input.scriptId)) throw new Error('批次含重复板子ID。')
    if (context.packs.some((pack) => pack.scriptId === input.scriptId)) throw new Error('批次含已注册板子；不会覆盖。')
    if (context.packs.some((pack) => pack.source.contentHash === input.source?.contentHash)) throw new Error('批次原文已经注册；须先核对板子版本。')
    if (seenHashes.has(input.source?.contentHash)) throw new Error('批次含重复原文哈希；请先核对是否重复板子。')
    seenIds.add(input.scriptId); seenHashes.add(input.source?.contentHash)
  }
  const prepared = [], scripts = [], roleGroups = new Map()
  let productionCandidatesChecked = 0, nightQueuesChecked = 0
  for (const input of manifest.scripts) {
    const itemStart = performance.now()
    try {
      const source = checkedSource(input, directory, context)
      if (input.intakeReview !== undefined) {
        const review = input.intakeReview
        if (review?.required !== true || !Array.isArray(review.pendingRoleReviewKeys)
          || review.pendingRoleReviewKeys.length > input.roleRefs.length
          || review.pendingRoleReviewKeys.some((key) => typeof key !== 'string' || !/^[a-f0-9]{64}$/.test(key))) throw new Error('角色复核依赖必须明确保留，不能自动关闭或写成无效引用。')
        source.lock.intakeReview = review
      }
      const pack = input.fillTemplateGaps ? fillTemplateGaps(input, context) : prepareScriptPack(input, context)
      const officialOrdersChecked = checkOfficialOrders(pack.definition, context)
      const verification = pack.report.missingTemplateCounts.length ? null : verifyPreparedScript(pack, context)
      const row = { scriptId: input.scriptId, displayName: input.displayName, automaticChecksPassed: Boolean(verification),
        reviewRequired: true, registered: false, templateCount: pack.report.templateCount, missingTemplateCounts: pack.report.missingTemplateCounts,
        officialOrdersChecked, ...(verification ?? {}), prepareAndVerifyMs: milliseconds(itemStart) }
      source.lock.roleAliases.forEach((alias) => {
        const key = JSON.stringify([alias.roleId, pack.definition.roleDefinitionHashes[alias.roleId], alias.rawAbilitySha256, alias.rawTeam])
        const group = roleGroups.get(key) ?? { roleId: alias.roleId, definitionHash: pack.definition.roleDefinitionHashes[alias.roleId],
          rawAbilitySha256: alias.rawAbilitySha256, abilityTextReviewRequired: alias.abilityTextReviewRequired,
          aliasReviewRequired: alias.aliasReviewRequired, scriptIds: [] }
        group.aliasReviewRequired ||= alias.aliasReviewRequired
        group.scriptIds.push(input.scriptId); roleGroups.set(key, group)
      })
      productionCandidatesChecked += verification?.candidateCount ?? 0
      nightQueuesChecked += verification?.nightQueueCount ?? 0
      prepared.push({ pack, source, row }); scripts.push(row)
    } catch (error) {
      scripts.push({ scriptId: input.scriptId, automaticChecksPassed: false, reviewRequired: true, registered: false,
        error: error.message, prepareAndVerifyMs: milliseconds(itemStart) })
    }
  }
  return { prepared, report: { status: 'drafts-await-human-rule-and-combination-review',
    automaticChecksPassed: scripts.every((row) => row.automaticChecksPassed), registered: false, reviewRequired: true,
    liveAiExecuted: false, browserExecuted: false, sourceFilesChecked: prepared.length,
    contextLoadMs: context.contextLoadMs, prepareAndVerifyMs: milliseconds(start), scripts,
    productionCandidatesChecked, nightQueuesChecked, roleReviewGroups: [...roleGroups.values()],
    boardSpecificChecksRequired: ['来源与作者特殊规则', '角色版本与全部技能', '首夜和后夜', '人数/伪装/配座', '相克与角色变化', '高风险实际AI与浏览器抽测'],
    reviewGroupingIsCoverageProof: false } }
}

export function writeScriptBatch(output, result, context) {
  if (existsSync(output)) throw new Error('批次输出已存在；不会覆盖。')
  const start = performance.now()
  mkdirSync(output, { recursive: true })
  for (const item of result.prepared) {
    const directory = resolve(output, item.pack.definition.scriptId)
    writePreparedScript(directory, item.pack, context)
    writeFileSync(resolve(directory, 'source.json'), item.source.bytes, { flag: 'wx' })
    writeFileSync(resolve(directory, 'source-lock.json'), JSON.stringify(item.source.lock, null, 2) + '\n', { flag: 'wx' })
  }
  result.report.writeMs = milliseconds(start)
  writeFileSync(resolve(output, 'batch-review.json'), JSON.stringify(result.report, null, 2) + '\n', { flag: 'wx' })
}

function main() {
  const start = performance.now(), [manifestFile, output, ...extra] = process.argv.slice(2)
  if (!manifestFile || !output || extra.length) throw new Error('用法：npm run prepare:scripts -- 批次清单JSON 新输出目录')
  if (statSync(manifestFile).size > 8 * 1024 * 1024) throw new Error('批次清单超过8MiB。')
  if (existsSync(output)) throw new Error('批次输出已存在；不会覆盖。')
  const manifest = readJson(readFileSync(manifestFile), '批次清单')
  const context = createBatchContext(fileURLToPath(new URL('..', import.meta.url)))
  const result = prepareScriptBatch(manifest, dirname(resolve(manifestFile)), context)
  result.report.elapsedBeforeWriteMs = milliseconds(start)
  writeScriptBatch(resolve(output), result, context)
  console.log(JSON.stringify({ scripts: result.report.scripts.length, prepared: result.prepared.length,
    automaticChecksPassed: result.report.automaticChecksPassed, registered: false, reviewRequired: true,
    productionCandidatesChecked: result.report.productionCandidatesChecked, roleReviewGroups: result.report.roleReviewGroups.length,
    totalMs: milliseconds(start) }))
  if (!result.report.automaticChecksPassed) process.exitCode = 2
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
