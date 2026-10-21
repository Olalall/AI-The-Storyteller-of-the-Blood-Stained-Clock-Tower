import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { collectCandidates, parseAssignments, splitScriptSource } from './scout-clocktower-wiki.mjs'
import { createBatchContext } from './prepare-script-batch.mjs'
import { createRoleReuseIndex, roleReviewKey, sha256 } from './build/script-role-reuse.mjs'
import { ordinaryTemplateExcludedRoles } from './prepare-script-templates.mjs'
import { intakeRoleId } from './build/intake-role-id.mjs'

/** Plan all records once. Every manifest entry remains an unregistered draft requiring board review. */
export function planScriptIntake(catalogText, fullText, context, reuse, limit = 100) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 2000) throw new Error('批次数量必须为1至2000的整数。')
  const catalog = collectCandidates(catalogText, fullText)
  const full = parseAssignments(fullText, ['SCRIPT_FULL_BUILD', 'SCRIPT_FULL']).SCRIPT_FULL
  const registered = new Set(context.packs.map((pack) => pack.source.contentHash.replace(/^sha256:/, '')))
  const nameKey = (name) => name.normalize('NFKC').replace(/\s+/g, '').replace(/v\d+(?:\.\d+)*$/i, '')
  const groups = new Map(), seen = new Set(), rows = [], inputs = []
  for (const row of catalog.rows) {
    const result = { ...row, registered: registered.has(row.rawJsonSha256), boardReviewRequired: true, published: false }
    rows.push(result)
    if (row.status !== 'candidate-needs-rule-review') continue
    const sourceText = full[row.index].t, raw = JSON.parse(sourceText.replace(/^\uFEFF/, ''))
    const metadata = raw.filter((role) => role?.id === '_meta')
    let entries
    try {
      const split = splitScriptSource(raw)
      entries = split.roles
      result.authorRuleEntries = split.rules
      result.authorRuleReviewRequired = split.rules.length > 0
    } catch { result.hold = 'invalid-author-rule-entry'; continue }
    if (metadata.length > 1 || !entries.length || entries.length > 150 || entries.some((entry) => {
      const id = typeof entry === 'string' ? entry : !Array.isArray(entry) && entry?.id
      return typeof id !== 'string' || !id.trim() || id.length > 256
    })) { result.hold = 'invalid-roster-or-metadata'; continue }
    result.authorMetadata = metadata[0] ?? null
    result.roleGroups = entries.map((entry) => {
      let resolution
      try { resolution = reuse.resolve(entry) } catch { resolution = { status: 'invalid-role-reference', reusable: false } }
      const key = sha256(JSON.stringify({ role: roleReviewKey(entry, resolution.reference?.id ?? resolution.roleId ?? '@unresolved-source-text'),
        status: resolution.status, definitionHash: resolution.definitionHash ?? null }))
      if (!groups.has(key)) groups.set(key, { key, raw: entry, ...resolution, sourceIndices: [], sourceRoleIds: [] })
      groups.get(key).sourceIndices.push(row.index)
      groups.get(key).sourceRoleIds.push(typeof entry === 'string' ? entry : entry.id)
      return key
    })
    const roles = result.roleGroups.map((key) => groups.get(key))
    result.rolesReusable = roles.every((role) => role.reusable)
    result.roleReferenceCandidatesComplete = roles.every((role) => role.reference)
    result.pendingRoleReviewKeys = result.roleGroups.filter((key) => !groups.get(key).reusable)
    if (result.registered) { result.hold = 'already-registered-source'; continue }
    if (seen.has(row.rawJsonSha256)) { result.hold = 'duplicate-original'; continue }
    seen.add(row.rawJsonSha256)
    const named = context.packs.filter((pack) => nameKey(pack.displayName) === nameKey(row.name))
    if (named.length) { result.existingPackIds = named.map((pack) => pack.scriptId); result.hold = 'existing-name-version-review'; continue }
    if (!result.roleReferenceCandidatesComplete) { result.hold = 'role-review'; continue }
    const refs = roles.map((role) => role.reference), ids = refs.map((ref) => ref.id)
    if (new Set(ids).size !== ids.length) { result.hold = 'duplicate-canonical-role'; continue }
    const sameRoster = context.packs.filter((pack) => pack.roles.length === ids.length && pack.roles.every((role) => ids.includes(intakeRoleId(role.id, context.normalizeRoleId))))
    if (sameRoster.length) { result.existingPackIds = sameRoster.map((pack) => pack.scriptId); result.hold = 'existing-roster-review'; continue }
    if (ids.some((id) => !context.officialIds.has(id))) { result.hold = 'custom-night-order-review'; continue }
    result.specialOpeningReviewRequired = ids.some((id) => ordinaryTemplateExcludedRoles.has(id))
    const scriptId = 'wiki-' + row.rawJsonSha256.slice(0, 16)
    if (context.packs.some((pack) => pack.scriptId === scriptId) || inputs.some((entry) => entry.scriptId === scriptId)) throw new Error('草稿ID冲突，不能覆盖。')
    const input = { scriptId, displayName: row.name, sourceFile: 'sources/' + scriptId + '.json',
      source: { url: catalog.source, author: row.author, version: `库记录${row.index} / build ${catalog.sourceBuild} / 当前规则适配草稿`,
        contentHash: 'sha256:' + row.rawJsonSha256, verifiedAt: new Date().toISOString().slice(0, 10) },
      roleRefs: refs, fillTemplateGaps: true, intakeReview: { required: true, pendingRoleReviewKeys: result.pendingRoleReviewKeys } }
    try {
      const pack = context.createReferencedScriptPack({ ...input, playerCounts: [7, 8, 9, 10, 11, 12, 13, 14, 15], setupRules: [], setupTemplates: [], knowledgeStatus: 'needs-review' }, reuse.library)
      input.nightOrders = pack.nightOrders
    } catch { result.hold = 'explicit-night-order-review'; continue }
    result.manifestEligible = true
    if (inputs.length >= limit) continue
    inputs.push(input); result.selectedDraftId = scriptId
  }
  const roleGroups = [...groups.values()].map((group) => ({ ...group, sourceIndices: [...new Set(group.sourceIndices)], sourceRoleIds: [...new Set(group.sourceRoleIds)] }))
  return { report: { sourceBuild: catalog.sourceBuild, entries: rows.length, families: catalog.familyGroups,
    fullOriginals: rows.filter((row) => row.status === 'candidate-needs-rule-review').length,
    registeredSources: rows.filter((row) => row.registered).length,
    reusableRoleRecords: rows.filter((row) => row.rolesReusable && !row.registered).length,
    recordsWithCompleteReferenceCandidates: rows.filter((row) => row.roleReferenceCandidatesComplete && !row.registered).length,
    manifestEligible: rows.filter((row) => row.manifestEligible).length, selectedDrafts: inputs.length,
    roleOccurrences: rows.reduce((sum, row) => sum + (row.roleGroups?.length ?? 0), 0), uniqueRoleReviews: roleGroups.length,
    pendingRoleReviews: roleGroups.filter((group) => !group.reusable).length,
    reusableSourceProofs: reuse.verifiedSources, invalidSourceProofs: reuse.invalidProofs, staleRoleMappings: reuse.staleRoleMappings,
    holds: rows.reduce((counts, row) => { const reason = row.hold ?? row.status; counts[reason] = (counts[reason] ?? 0) + 1; return counts }, {}),
    automaticRuleApproval: false, registered: false, browserExecuted: false, liveAiExecuted: false, rows },
    roleGroups, manifest: { scripts: inputs }, full }
}

export function writeIntakePlan(output, plan) {
  if (existsSync(output)) throw new Error('计划输出目录已存在；不会覆盖。')
  mkdirSync(resolve(output, 'sources'), { recursive: true })
  for (const input of plan.manifest.scripts) {
    const row = plan.report.rows.find((entry) => entry.selectedDraftId === input.scriptId)
    const bytes = Buffer.from(plan.full[row.index].t, 'utf8')
    if (sha256(bytes) !== row.rawJsonSha256) throw new Error('原文字节发生变化。')
    writeFileSync(resolve(output, input.sourceFile), bytes, { flag: 'wx' })
  }
  for (const [name, value] of [['intake-plan', plan.report], ['role-review-groups', plan.roleGroups], ['batch', plan.manifest]]) {
    writeFileSync(resolve(output, name + '.json'), JSON.stringify(value, null, 2) + '\n', { flag: 'wx' })
  }
}

function main() {
  const [cache, output, count = '100', ...extra] = process.argv.slice(2)
  if (!cache || !output || extra.length) throw new Error('用法：npm run plan:scripts -- 已锁定缓存目录 新输出目录 [批次数量，默认100]')
  if (existsSync(output)) throw new Error('计划输出目录已存在；不会覆盖。')
  const texts = ['catalog.js', 'scripts-full.js'].map((name, index) => {
    const bytes = readFileSync(resolve(cache, name))
    if (bytes.length > [2, 32][index] * 1024 * 1024) throw new Error('锁定来源文件超过大小限制。')
    return bytes.toString('utf8')
  })
  const root = fileURLToPath(new URL('..', import.meta.url)), context = createBatchContext(root)
  const plan = planScriptIntake(...texts, context, createRoleReuseIndex(root, context), Number(count))
  writeIntakePlan(resolve(output), plan)
  const { rows: _rows, ...summary } = plan.report
  console.log(JSON.stringify(summary))
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
