import type { SetupRule } from '../../types'

const scriptSourceUrl = 'https://www.botcscripts.com/script/2378/1.0.0/download'
const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const reviewedAt = '2026-07-21'

export const churchOfSpiesSetupRules: readonly SetupRule[] = [
  {
    id: 'baron-outsiders',
    roleId: 'baron',
    summary: '男爵会让本局增加 2 名外来者；模板必须显式记录人数修正。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'cultleader-alignment-change',
    roleId: 'cultleader',
    summary: '异教领袖夜晚可能变成相邻存活玩家的阵营；邪教胜利和阵营变化必须由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'pixie-madness-ability',
    roleId: 'pixie',
    summary: '小精灵知道一个在场镇民；疯狂和获得能力只做提醒，不自动给能力。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'highpriestess-storyteller-call',
    roleId: 'highpriestess',
    summary: '女祭司信息是说书人判断“最该交流的人”；AI 只能给候选草稿。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'exorcist-demon-block',
    roleId: 'exorcist',
    summary: '驱魔人命中恶魔时，恶魔今晚不发动且不知道是谁选中自己；工具只提醒，不自动改夜序。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'marionette-hidden-evil',
    roleId: 'marionette',
    summary: '提线木偶是邪恶方但以为自己是善良角色；身份交接和记录必须防止误公开。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'spy-registers-falsely',
    roleId: 'spy',
    summary: '间谍可查看魔典且可能登记为善良、镇民或外来者；登记结果由说书人裁量。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'nodashii-neighbor-poisoning',
    roleId: 'nodashii',
    summary: '诺-达鲺会让相邻镇民中毒；这是说书人状态核对项，不自动写入玩家状态。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'po-charge-and-three-kill',
    roleId: 'po',
    summary: '珀可以蓄力并在次夜选择三名玩家死亡；蓄力、击杀和死亡必须由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'pukka-poison-death-chain',
    roleId: 'pukka',
    summary: '普卡的中毒和次夜死亡有延迟链路；工具只提醒，不自动标中毒、死亡或解除中毒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
