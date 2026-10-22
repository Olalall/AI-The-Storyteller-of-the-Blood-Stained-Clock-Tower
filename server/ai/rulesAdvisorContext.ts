import { loadSmartScriptPack, roleAbilityForScript, scriptKnowledgeVersion } from '../../src/domain/scripts'
import { roleKnowledgeForAI } from '../../src/domain/role-knowledge'
import type { RulesAdvisorRequest, RulesAdvisorSource } from '../../src/services/ai/rulesAdvisorTypes'
import { AIProviderError } from './aiProviderClient'

export async function rulesAdvisorContext(input: RulesAdvisorRequest) {
  const pack = await loadSmartScriptPack(input.scriptId).catch(() => { throw new AIProviderError('BAD_REQUEST', 400) })
  const focused = input.roleId ? pack.roles.find(role => role.id === input.roleId) : undefined
  if (input.roleId && !focused) throw new AIProviderError('BAD_REQUEST', 400)
  const sources: RulesAdvisorSource[] = []
  function sourceId(url: string | undefined, title: string) {
    if (!url) return undefined
    try { if (!['https:', 'http:'].includes(new URL(url).protocol)) return undefined } catch { return undefined }
    const existing = sources.find(s => s.url === url)
    if (existing) { if (existing.title !== title) existing.title = '共享角色与板子资料'; return existing.id }
    const id = `S${sources.length + 1}`
    sources.push({ id, title, url })
    return id
  }
  const scriptSource = sourceId(pack.source.url, `${pack.displayName} · 板子来源`)
  const statesSource = sourceId('https://wiki.bloodontheclocktower.com/States', '通用规则 · 状态')
  const questions = [input.question, ...input.history.map(turn => turn.question)].join('\n').toLowerCase()
  const roles = pack.roles.map(role => {
    const detailed = role.id === focused?.id || [role.name, role.officialName, role.id].some(name => name && questions.includes(name.toLowerCase()))
    const research = role.research
    const reminders = detailed ? roleKnowledgeForAI(role.id) : undefined
    return {
      id: role.id, name: role.name, team: role.team, ability: roleAbilityForScript(pack.scriptId, role.id),
      knowledgeStatus: role.knowledgeStatus, sourceKind: role.sourceKind ?? '未标注',
      edition: role.research?.edition, sourceIds: [...(role.research?.sourceUrls.slice(0, 3) ?? []), ...(reminders?.sourceUrls ?? [])].map(url => sourceId(url, `${role.name} · 规则资料`)),
      ...(research ? { research: { reviewedAt: research.reviewedAt, setupImpact: research.setupImpact.slice(0, 3),
        possibleOutcomes: research.possibleOutcomes.slice(0, detailed ? 4 : 1), highRiskNotes: research.highRiskNotes.slice(0, detailed ? 5 : 2),
        identityChanges: research.identityChanges.slice(0, detailed ? 3 : 1), teamChanges: research.teamChanges.slice(0, detailed ? 3 : 1) },
        ...(reminders ? { reminders } : {}) } : {}),
    }
  })
  return {
    sources,
    knowledgeVersion: scriptKnowledgeVersion(pack),
    scopeLabel: `${pack.displayName} · ${focused?.name ?? '全板'}`,
    context: {
      scriptName: pack.displayName, source: { ...pack.source, sourceId: scriptSource },
      knowledgeStatus: pack.knowledgeStatus, focusedRoleId: focused?.id, roles,
      nightOrders: pack.nightOrders, setupRules: pack.setupRules,
      generalRules: { sourceId: statesSource, reviewedAt: '2026-10-22', facts: [
        '醉酒和中毒使能力无效，但通常仍按正常时点唤醒、收集选择或给信息；不能仅因毒醉而跳过唤醒。明确禁止唤醒的其他能力需另行核对。',
        '角色、阵营、生死、毒醉是分别核对的事实；换角色不自动换阵营或清除毒醉。处决不等于死亡，死亡玩家不能再次真正死亡。',
      ] },
      sources,
    },
  }
}
