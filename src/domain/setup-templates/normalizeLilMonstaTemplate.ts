import type { SmartScriptPack, SetupTemplate } from '../scripts/types'

/** 只用于新配板候选；旧局的角色、选择和夜序快照保持原样。 */
export function normalizeLilMonstaTemplate(template: SetupTemplate, pack: SmartScriptPack): SetupTemplate {
  if (!template.roles.includes('lilmonsta') || !template.setupAdjustments?.some(a => a.ruleId === 'lilmonsta-extra-minion')) return template
  const replacement = pack.roles.find(role => role.team === 'townsfolk' && !template.roles.includes(role.id))
  if (!replacement) return template
  return { ...template, roles: template.roles.map(id => id === 'lilmonsta' ? replacement.id : id), bluffs: [],
    setupAdjustments: template.setupAdjustments.map(a => a.ruleId === 'lilmonsta-extra-minion' ? { ...a,
      choiceId: 'extra-minion-no-demon', compositionDelta: { minion: 1, demon: -1 },
      note: '小怪宝不占玩家座位；增加一名爪牙，恶魔由爪牙照看。https://wiki.bloodontheclocktower.com/Lil%27_Monsta',
    } : a) }
}
