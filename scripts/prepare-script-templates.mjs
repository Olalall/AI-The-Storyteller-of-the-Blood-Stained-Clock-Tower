import { minimumTemplates, prepareScriptPack } from './prepare-script-pack.mjs'
import { openingTemplateSelection, specialOpeningRoleIds } from './build/script-opening-templates.mjs'

const rotate = (items, seed) => items.length ? [...items.slice(seed % items.length), ...items.slice(0, seed % items.length)] : []
export const ordinaryTemplateExcludedRoles = specialOpeningRoleIds

/** Reuse confirmed count choices; the existing domain validator remains authoritative. */
export function fillTemplateGaps(input, context) {
  const initial = prepareScriptPack({ ...input, setupTemplates: input.setupTemplates ?? [] }, context)
  const pack = context.createReferencedScriptPack(initial.definition, context.library)
  const { inferModifierRoleId } = context.load(context.module('src/domain/setup-templates/setupCountChanges.ts'))
  const { expectedCompositionForTemplate } = context.load(context.module('src/domain/setup-templates/composition.ts'))
  const choices = new Map()
  for (const source of context.packs) for (const template of source.setupTemplates.filter((entry) => entry.verified)) {
    for (const adjustment of template.setupAdjustments ?? []) {
      const roleId = inferModifierRoleId(adjustment.ruleId, source)
      const rule = source.setupRules.find((entry) => entry.id === adjustment.ruleId)
      if (!roleId || !template.roles.includes(roleId) || rule?.knowledgeStatus !== 'confirmed' || !adjustment.choiceId) continue
      const key = JSON.stringify(adjustment.compositionDelta)
      const known = choices.get(roleId) ?? new Map()
      const sharedRule = input.setupRules?.find((entry) => entry.roleId === roleId && entry.knowledgeStatus === 'confirmed')
        ?? known.values().next().value?.rule ?? rule
      if (!known.has(key)) known.set(key, { rule: sharedRule,
        adjustment: { ...adjustment, ruleId: sharedRule.id, choiceId: `count-choice-${known.size + 1}`,
          note: `${sharedRule.summary}；人数选项来源：${source.scriptId}/${adjustment.ruleId}/${adjustment.choiceId}。` },
        sourceId: `${source.scriptId}/${adjustment.ruleId}/${adjustment.choiceId}` })
      choices.set(roleId, known)
    }
  }
  const templates = [...initial.definition.setupTemplates], rules = [...initial.definition.setupRules]
  const seen = new Set(templates.map((template) => JSON.stringify([template.playerCount, [...template.roles].sort()])))
  const pool = (team) => pack.roles.filter((role) => role.team === team).map((role) => role.id)
  const modes = [...specialOpeningRoleIds].filter((id) => pack.roles.some((role) => role.id === id))
  if (pack.roles.some((role) => role.team === 'demon' && !specialOpeningRoleIds.has(role.id))) modes.push('ordinary')
  if (!modes.length) return initial
  const townsfolk = pack.roles.filter((role) => role.team === 'townsfolk' && (!role.research?.setupImpact.length || role.id === 'balloonist')
    && role.id !== 'amnesiac').map((role) => role.id)
  for (const [countText, minimum] of Object.entries(minimumTemplates)) {
    const wanted = Math.max(minimum, modes.length)
    const count = Number(countText)
    if (!initial.definition.playerCounts.includes(count)) continue
    for (let seed = 0; seed < 400 && templates.filter((entry) => entry.playerCount === count).length < wanted; seed++) {
      const opening = openingTemplateSelection(modes[seed % modes.length], pack, count, Math.floor(seed / modes.length), choices, context)
      if (!opening) continue
      const { evil, facts } = opening
      const additions = facts.map((fact) => fact.rule).filter((rule) => !rules.some((entry) => entry.id === rule.id))
      const checkPack = { ...pack, setupRules: [...rules, ...additions] }
      const setupAdjustments = facts.map((fact) => fact.adjustment)
      const composition = opening.outsiders === undefined
        ? expectedCompositionForTemplate({ playerCount: count, roles: evil, setupAdjustments }, checkPack)
        : { townsfolk:count - evil.length - opening.outsiders, outsider:opening.outsiders }
      const selected = [...evil, ...rotate(townsfolk, count + seed * 3).slice(0, composition.townsfolk),
        ...rotate(pool('outsider'), count + seed).slice(0, composition.outsider)]
      const bluffs = rotate([...pool('townsfolk'), ...pool('outsider')].filter((id) => !selected.includes(id)), seed).slice(0, opening.bluffCount)
      const key = JSON.stringify([count, [...selected].sort()])
      if (composition.townsfolk < 0 || composition.outsider < 0 || selected.length !== count
        || bluffs.length !== opening.bluffCount || seen.has(key)) continue
      const template = { templateId: `${input.scriptId}-${count}-draft-${templates.length + 1}`, scriptId: input.scriptId,
        playerCount: count, style: ['balanced', 'long-game', 'chaos'][seed % 3], roles: selected, bluffs,
        setupAdjustments, ...(opening.repeatableRoles ? { repeatableRoles:opening.repeatableRoles } : {}), verified: false, notes: ['批量配板草稿；角色组合与平衡性仍需核对。',
          ...(selected.includes('balloonist') ? ['气球驾驶员采用当前能力允许的+0外来者选项；原文固定+1的旧规则不适用于本候选。'] : []),
          ...facts.map((fact) => `人数修正复用已验证来源：${fact.sourceId}/${fact.rule.id}。`)] }
      if (!context.templateRoleSelectionValid(checkPack, template)
        || !context.validateTemplateComposition(context.normalizeImportedPack(checkPack), template).valid) continue
      rules.push(...additions); seen.add(key); templates.push(template)
    }
  }
  return prepareScriptPack({ ...input, setupRules: rules, setupTemplates: templates }, context)
}
