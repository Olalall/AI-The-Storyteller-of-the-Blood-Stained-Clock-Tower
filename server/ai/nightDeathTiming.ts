import { getComplexRoleKnowledge } from '../../src/domain/role-knowledge/complexRoleKnowledge'
import type { NightSettlementAdviceDraft, NightSettlementProviderRequest } from './types'

// shortcut: 仅检查明确的黎明死亡表述，复现其他矛盾措辞时再扩充。
export function assertsDawnDeath(text: string) {
  return text.split(/[，,。；;\n]|而是|但是|但|\bbut\b/i).some((clause) => {
    if (/不能|不得|不要|不应|并非|而非|不是|不可|\b(?:not|never)\b/i.test(clause)) return false
    if (/(?:黎明|天亮|清晨).{0,6}(?:公布|公开|宣布|宣告|告知)|dawn.{0,12}announc/i.test(clause) && !/结算|标记|执行/.test(clause)) return false
    return /(?:黎明|天亮|清晨).{0,16}(?:死亡|死去|被杀)|(?:死亡|死去|被杀).{0,12}(?:推迟|延迟|拖|等|留)到?(?:黎明|天亮|清晨)|\b(?:die|dies|death|killed)\b.{0,16}\b(?:at|until)\s+dawn\b/i.test(clause)
  })
}

export function violatesNightDeathTiming(input: NightSettlementProviderRequest, draft: NightSettlementAdviceDraft) {
  if (getComplexRoleKnowledge(input.wakeItem.roleId)?.nightDeathTiming !== 'at-action') return false
  return assertsDawnDeath([draft.summary, ...draft.ruleFacts, ...draft.journalDrafts, ...draft.playerMessageDrafts,
    ...draft.stateChangeDrafts.map((item) => item.text), ...draft.warnings, ...draft.authorityWarnings, draft.disclaimer].join('\n'))
}
