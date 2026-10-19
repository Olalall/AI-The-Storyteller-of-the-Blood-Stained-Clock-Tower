import type { NightSettlementProviderRequest } from './types'

// Kept in sync with the actual script packs by kazaliTargetRoleChoices.test.ts.
export const kazaliMinionRoleIds: Readonly<Record<string, readonly string[]>> = {
  'tan-hu-se-bian': ['boomdandy', 'cerenovus', 'scarletwoman', 'widow', 'witch'],
  'yan-bu-you-zhong': ['cerenovus', 'goblin', 'scarletwoman', 'widow'],
  'sheng-dan-ye-jing-hun': ['assassin', 'fearmonger', 'guai_dao', 'wei_zheng_tian_cai', 'widow'],
  'one-in-one-out': ['harpy', 'mezepheles', 'poisoner', 'spy'],
  punchy: ['cerenovus', 'harpy', 'psychopath', 'vizier'],
  'devout-theists': ['goblin', 'marionette', 'psychopath', 'widow'],
  'wu-he-you-zhi-xiang': ['harpy', 'mezepheles', 'poisoner', 'scarletwoman', 'spy'],
  'xin-kou-ci-huang': ['boffin', 'poisoner', 'psychopath', 'scarletwoman'],
  'wu-yin-cang-sheng': ['gudiao', 'harpy', 'mezepheles', 'pithag'],
  'ku-mu-feng-chun': ['harpy', 'pithag', 'poisoner', 'witch'],
  'bai-zhou-wei-shi': ['gudiao', 'mezepheles', 'psychopath', 'scarletwoman'],
  'ji-meng-ta-xiang': ['assassin', 'cerenovus', 'ganshiren', 'gudiao'],
  'nuo-fu-jiu-xing': ['goblin', 'harpy', 'humeiniang', 'psychopath'],
}

export function missingKazaliTargetRoleChoices(input: NightSettlementProviderRequest): string[] {
  const count = input.wakeItem.targetRoleChoiceCount
  const choices = input.draft.targetRoleChoices
  if (input.wakeItem.roleId === 'kazali' && (!input.nightType || input.nightType === 'first' && count === undefined)) {
    return ['卡扎力请求缺少当前昼夜或首夜配对规格；请刷新页面并重新核对本项，不能沿用旧表单。']
  }
  if (count === undefined && choices === undefined) return []
  const expectedCount = input.playerCount <= 9 ? 1 : input.playerCount <= 12 ? 2 : 3
  if (input.wakeItem.roleId !== 'kazali' || input.nightType !== 'first' || count !== expectedCount) {
    return ['爪牙配对只用于卡扎力初始首夜，并须按玩家人数选择 1 / 2 / 3 组。']
  }
  const minions = kazaliMinionRoleIds[input.scriptId]
  if (!minions) return ['服务器未核实本板的卡扎力爪牙候选；请先核对剧本。']
  if (!choices || choices.length !== count || choices.some(choice => !choice.seatId || !choice.roleId)) {
    return [`请补齐 ${count} 组“玩家 → 爪牙角色”，每组都要选择玩家和角色。`]
  }
  if (choices.some(choice => !Number.isInteger(choice.seatId) || choice.seatId < 1 || choice.seatId > input.playerCount)) {
    return ['爪牙配对中存在不属于本局的座位。']
  }
  if (new Set(choices.map(choice => choice.seatId)).size !== count) return ['每组必须选择不同玩家。']
  if (new Set(choices.map(choice => choice.roleId)).size !== count) return ['每组必须选择不同爪牙角色。']
  if (choices.some(choice => !minions.includes(choice.roleId))) return ['只能选择本板内已核实的爪牙角色。']
  if (input.draft.targets.length !== count || choices.some((choice, index) => input.draft.targets[index] !== choice.seatId)) {
    return ['配对玩家与本步目标记录不一致；请重新核对。']
  }
  if (choices.some(choice => choice.roleId === 'marionette'
    && Math.min(Math.abs(choice.seatId - input.wakeItem.seatId), input.playerCount - Math.abs(choice.seatId - input.wakeItem.seatId)) !== 1)) {
    return ['提线木偶必须与恶魔相邻；请核对座位和相克。']
  }
  return []
}
