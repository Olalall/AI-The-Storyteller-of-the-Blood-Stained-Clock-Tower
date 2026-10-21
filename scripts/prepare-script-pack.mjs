import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createTypescriptLoader } from './build/load-typescript.mjs'
import { roleDefinitionHashes } from './build/role-definition-pins.mjs'

const minimumTemplates = { 7: 3, 8: 2, 9: 2, 10: 3, 11: 2, 12: 3, 13: 2, 14: 2, 15: 3 }

export function projectContext(root, load = createTypescriptLoader()) {
  const scriptRoot = resolve(root, 'src/domain/scripts')
  const { smartScriptPacks: packs } = load(resolve(scriptRoot, 'allPacks.ts'))
  const { createRoleDefinitionLibrary } = load(resolve(scriptRoot, 'roleDefinitionLibrary.ts'))
  const { confirmedRoleFactsList } = load(resolve(scriptRoot, 'role-facts.ts'))
  const { resolveCharacterIconPath } = load(resolve(scriptRoot, 'roleIconPaths.ts'))
  const { createReferencedScriptPack } = load(resolve(scriptRoot, 'referencedScriptPack.ts'))
  const { normalizeImportedPack } = load(resolve(scriptRoot, 'normalizeImportedPack.ts'))
  const { validateTemplateComposition } = load(resolve(root, 'src/domain/setup-templates/composition.ts'))
  const { normalizeRoleId } = load(resolve(scriptRoot, 'roleId.ts'))
  const { templateRoleSelectionValid } = load(resolve(scriptRoot, 'templateRoleSelection.ts'))
  const referencedPackIds = new Set()
  const originModules = new Map([...readFileSync(resolve(scriptRoot, 'allPacks.ts'), 'utf8')
    .matchAll(/import \{ (\w+) \} from '(\.\/packs\/[^']+)'/g)].flatMap(([, symbol, path]) => {
      const pack = load(resolve(scriptRoot, path, 'index.ts'))[symbol]
      const definitionPath = resolve(scriptRoot, path, 'definition.json')
      if (existsSync(definitionPath) && Array.isArray(JSON.parse(readFileSync(definitionPath, 'utf8')).roleRefs)) {
        referencedPackIds.add(pack.scriptId)
        return []
      }
      const group = basename(path), module = load(resolve(scriptRoot, 'role-library', group, 'roles.ts'))
      const roleExport = Object.keys(module).find((name) => name.endsWith('Roles') && Array.isArray(module[name])
        && module[name].every((entry) => entry && typeof entry.id === 'string'))
      if (!roleExport) throw new Error('Missing role-library export: ' + group)
      return [[pack.scriptId, { group, roleExport }]]
    }))
  const sources = packs.filter((pack) => !referencedPackIds.has(pack.scriptId))
    .map((pack) => ({ sourceId: pack.scriptId, sourceVersion: pack.source.contentHash, roles: pack.roles }))
  const preferred = confirmedRoleFactsList().map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) }))
  const library = createRoleDefinitionLibrary(sources, preferred)
  return { packs, library, createReferencedScriptPack, normalizeImportedPack, validateTemplateComposition, templateRoleSelectionValid, normalizeRoleId, originModules }
}

export function prepareScriptPack(input, context) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.roleRefs)) throw new Error('输入必须含角色引用 roleRefs。')
  const { library, createReferencedScriptPack, normalizeImportedPack, validateTemplateComposition, normalizeRoleId } = context
  const resolved = input.roleRefs.map((ref) => {
    try { return library.resolve(ref) } catch (error) {
      const id = typeof ref === 'string' ? ref : ref?.id
      const variants = typeof id === 'string' ? library.variants(id).map(({ sourceId, sourceVersion }) => ({ sourceId, sourceVersion })) : []
      throw new Error(error.message + (variants.length ? '；已知来源：' + JSON.stringify(variants) : ''))
    }
  })
  const definition = {
    scriptId: input.scriptId, displayName: input.displayName, source: input.source,
    playerCounts: input.playerCounts ?? Object.keys(minimumTemplates).map(Number),
    roleRefs: resolved.map(({ role, sourceId, sourceVersion }) => ({ id: normalizeRoleId(role.id), sourceId, sourceVersion })),
    setupTemplates: [], setupRules: input.setupRules ?? [], knowledgeStatus: 'needs-review',
    ...(input.nightOrders ? { nightOrders: input.nightOrders } : {}),
    ...(input.demonBluffPolicy ? { demonBluffPolicy: input.demonBluffPolicy } : {}),
  }
  const pack = createReferencedScriptPack(definition, library)
  definition.roleDefinitionHashes = roleDefinitionHashes(pack.roles)
  const roleIds = new Set(pack.roles.map((role) => role.id))
  if (input.templateSources !== undefined && (!Array.isArray(input.templateSources)
    || input.templateSources.some((id) => !context.packs.some((source) => source.scriptId === id)))) {
    throw new Error('模板来源包含未知板子。')
  }
  const eligible = input.setupTemplates
    ? input.setupTemplates.map((template) => ({ template, sourceId: 'provided' }))
    : context.packs.filter((source) => !input.templateSources || input.templateSources.includes(source.scriptId))
      .flatMap((source) => source.setupTemplates.map((template) => ({ template, sourceId: source.scriptId })))
  const counts = new Map(), templates = [], seen = new Set()
  for (const { template, sourceId } of eligible) {
    if (!definition.playerCounts.includes(template.playerCount)
      || (counts.get(template.playerCount) ?? 0) >= minimumTemplates[template.playerCount]) continue
    const roles = template.roles.map(normalizeRoleId), bluffs = template.bluffs.map(normalizeRoleId)
    if ([...roles, ...bluffs].some((id) => !roleIds.has(id)) || new Set(bluffs).size !== 3 || bluffs.some((id) => roles.includes(id))) continue
    const key = JSON.stringify([template.playerCount, roles, bluffs, template.setupAdjustments ?? []])
    if (seen.has(key)) continue
    const candidate = { ...template, scriptId: definition.scriptId, templateId: definition.scriptId + '-candidate-' + (templates.length + 1),
      roles, bluffs, verified: false, notes: [...template.notes, '复用模板来源：' + sourceId + '；仍需核对本板特殊规则与组合。'] }
    if (!context.templateRoleSelectionValid(pack, candidate) || !validateTemplateComposition(normalizeImportedPack(pack), candidate).valid) continue
    seen.add(key); templates.push(candidate); counts.set(template.playerCount, (counts.get(template.playerCount) ?? 0) + 1)
  }
  definition.setupTemplates = templates
  definition.nightOrders = pack.nightOrders
  const final = createReferencedScriptPack(definition, library)
  const missing = definition.playerCounts.flatMap((count) => (counts.get(count) ?? 0) < minimumTemplates[count]
    ? [{ playerCount: count, missing: minimumTemplates[count] - (counts.get(count) ?? 0) }] : [])
  const report = { status: 'draft-needs-review', registered: false, roleCount: final.roles.length,
    roles: definition.roleRefs, templateCount: templates.length, missingTemplateCounts: missing,
    needsRuleReview: true, needsCombinationReview: true, sourceHashPreserved: definition.source.contentHash }
  return { definition, report }
}

export function writePreparedScript(output, prepared, context) {
  output = resolve(output)
  if (existsSync(output)) throw new Error('输出目录已存在；不会覆盖已有板子或草稿。')
  const origins = [...new Map(prepared.definition.roleRefs.map((ref) => [ref.sourceId, ref.sourceVersion])).entries()]
  const imports = origins.map(([id], index) => {
    const origin = context.originModules.get(id)
    if (!origin || !/^[a-z0-9-]+$/.test(origin.group) || !/^\w+$/.test(origin.roleExport)) throw new Error('角色来源不能生成安全导入。')
    return "import { " + origin.roleExport + " as source" + index + " } from '../../role-library/" + origin.group + "/roles'"
  })
  const sources = origins.map(([sourceId, sourceVersion], index) => '{ sourceId: ' + JSON.stringify(sourceId)
    + ', sourceVersion: ' + JSON.stringify(sourceVersion) + ', roles: source' + index
    + '.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }')
  const symbol = 'prepared' + prepared.definition.scriptId.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join('') + 'SmartScriptPack'
  const code = ["import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'",
    "import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'",
    "import { resolveCharacterIconPath } from '../../roleIconPaths'",
    "import definition from './definition.json' with { type: 'json' }", ...imports,
    'const library = createRoleDefinitionLibrary([' + sources.join(',\n') + '])',
    'export const ' + symbol + ' = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)', ''].join('\n')
  mkdirSync(output, { recursive: true })
  writeFileSync(resolve(output, 'definition.json'), JSON.stringify(prepared.definition, null, 2) + '\n', { flag: 'wx' })
  writeFileSync(resolve(output, 'review.json'), JSON.stringify(prepared.report, null, 2) + '\n', { flag: 'wx' })
  writeFileSync(resolve(output, 'index.ts'), code, { flag: 'wx' })
  return { ...prepared.report, exportName: symbol }
}

function main() {
  const [input, output, ...extra] = process.argv.slice(2)
  if (!input || !output || extra.length) throw new Error('用法：npm run prepare:script -- 输入JSON 输出新目录')
  const inputPath = resolve(input)
  if (statSync(inputPath).size > 2 * 1024 * 1024) throw new Error('输入JSON超过2MiB。')
  const context = projectContext(resolve(fileURLToPath(new URL('..', import.meta.url))))
  const prepared = prepareScriptPack(JSON.parse(readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '')), context)
  console.log(JSON.stringify(writePreparedScript(output, prepared, context)))
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main() } catch (error) { console.error(error.message); process.exitCode = 1 }
}
