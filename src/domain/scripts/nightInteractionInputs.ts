import type { SmartRoleDefinition } from './types'

export type NightInformationInput = { kind: 'number'; maximum?: number } | { kind: 'choice'; choices: readonly { id: string; label: string; information: string }[] }
const yesNo: NightInformationInput = { kind: 'choice', choices: [{ id: 'yes', label: '是', information: '是。' }, { id: 'no', label: '否', information: '否。' }] }
// 这里只描述记录表单，不执行技能；来源为对应角色官方规则。
export const nightInteractionInputs: Readonly<Record<string, { targetCount?: number; aiAdviceEnabled?: boolean; firstNightTargetCount?: number; otherNightTargetCount?: number; allowedTargetCounts?: number[]; roleCount?: number; firstNightRoleCount?: number; targetKind?: 'storyteller_info'; revealResult?: boolean; informationInput?: NightInformationInput; midgameInitialization?: { label: string; prompt: string; resultTemplate: string }; choiceResults?: readonly { id: string; label: string }[] }>> = {
  grandmother: { targetCount: 1, roleCount: 1, targetKind: 'storyteller_info' },
  ravenkeeper: { targetCount: 1, roleCount: 1, targetKind: 'storyteller_info' },
  clockmaker: { targetCount: 0, informationInput: { kind: 'number' } },
  shugenja: { targetCount: 0, informationInput: { kind: 'choice', choices: [
    { id: 'clockwise', label: '顺时针', information: '最近邪恶玩家位于顺时针方向。' },
    { id: 'anticlockwise', label: '逆时针', information: '最近邪恶玩家位于逆时针方向。' },
  ] } },
  general: { targetCount: 0, informationInput: { kind: 'choice', choices: [
    { id: 'good', label: '善良占优', information: '善良阵营占优。' },
    { id: 'evil', label: '邪恶占优', information: '邪恶阵营占优。' },
    { id: 'balanced', label: '势均力敌', information: '双方势均力敌。' },
  ] } },
  summoner: { firstNightTargetCount: 0, otherNightTargetCount: 1, firstNightRoleCount: 3 },
  chef: { informationInput: { kind: 'number' } },
  empath: { informationInput: { kind: 'number', maximum: 2 } },
  mathematician: { informationInput: { kind: 'number' } },
  oracle: { informationInput: { kind: 'number' } },
  towncrier: { informationInput: yesNo },
  flowergirl: { informationInput: yesNo },
  seamstress: { informationInput: yesNo },
  villageidiot: { informationInput: { kind: 'choice', choices: [{ id: 'good', label: '善良', information: '善良阵营。' }, { id: 'evil', label: '邪恶', information: '邪恶阵营。' }] } },
  // https://wiki.bloodontheclocktower.com/Librarian
  librarian: { targetCount: 2, targetKind: 'storyteller_info' },
  // https://wiki.bloodontheclocktower.com/Investigator
  investigator: { targetCount: 2, targetKind: 'storyteller_info' },
  // https://wiki.bloodontheclocktower.com/Dreamer
  dreamer: { roleCount: 2 },
  // https://wiki.bloodontheclocktower.com/Al-Hadikhia
  alhadikhia: { targetCount: 3 },
  al_hadikhia: { targetCount: 3 },
  // https://wiki.bloodontheclocktower.com/Gambler
  gambler: { revealResult: false },
  // https://wiki.bloodontheclocktower.com/Po — 模式由主持核实，不自动推算蓄力。
  po: { targetCount: 1, allowedTargetCounts: [0, 1, 3], aiAdviceEnabled: false },
  // https://wiki.bloodontheclocktower.com/Shabaloth
  shabaloth: { targetCount: 2 },
  // https://wiki.bloodontheclocktower.com/Noble
  noble: { targetCount: 3, targetKind: 'storyteller_info' },
  // https://wiki.bloodontheclocktower.com/Preacher
  preacher: { targetCount: 1 },
  // https://wiki.bloodontheclocktower.com/Chambermaid
  chambermaid: { targetCount: 2, informationInput: { kind: 'number', maximum: 2 } },
  // https://wiki.bloodontheclocktower.com/Lleech — 首夜记宿主，后续夜记攻击，各一人。
  lleech: { targetCount: 1, midgameInitialization: {
    label: '存活宿主', prompt: '中途获得痢蛭能力的当晚初始化：只选择一名存活宿主并核对寄生、中毒；这不是普通夜间攻击，不额外杀人。相关标记和中毒仍由主持确认。',
    resultTemplate: '{actor}选择{target}作为宿主；仅记录初始化选择，寄生和中毒另行确认，没有额外攻击。',
  } },
  // https://wiki.bloodontheclocktower.com/Lord_of_Typhon — 首夜确认已配好的爪牙身份，后续夜记录单一攻击目标。
  lordoftyphon: { firstNightTargetCount: 0, otherNightTargetCount: 1 },
  // https://wiki.bloodontheclocktower.com/King — 首夜只告知恶魔国王是谁，不让国王得知存活角色。
  king: { firstNightRoleCount: 0 },
  // https://wiki.bloodontheclocktower.com/High_Priestess
  highpriestess: { targetCount: 1, targetKind: 'storyteller_info' },
  // 发行方原始剧本：https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21263_10294.json
  yinyangshi: { targetCount: 0, roleCount: 4 },
  // https://wiki.bloodontheclocktower.com/Organ_Grinder — 只记录选择，不自动修改醉酒。
  organgrinder: { targetCount: 0, choiceResults: [
    { id: 'choose-drunk', label: '本夜选择醉酒，直到下个黄昏' },
    { id: 'choose-sober', label: '本夜选择保持清醒' },
  ] },
}

export function nightTargetCountForRole(role: SmartRoleDefinition, isFirstNight: boolean) {
  const spec = nightInteractionInputs[role.id]
  return (isFirstNight ? spec?.firstNightTargetCount : spec?.otherNightTargetCount) ?? spec?.targetCount ?? (role.inputKinds.includes('players') ? 2 : role.inputKinds.includes('player') ? 1 : 0)
}

export function canRevealNightResult(roleId: string) {
  return nightInteractionInputs[roleId]?.revealResult !== false
}
