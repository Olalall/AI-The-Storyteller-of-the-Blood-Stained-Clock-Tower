import type { SetupRule } from '../../types'

const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://www.botcscripts.com/script/2128/1.2.0/download'
const reviewedAt = '2026-07-21'

export const insanityAndIntuitionSetupRules: readonly SetupRule[] = [
  {
    id: 'fanggu-outsider',
    roleId: 'fanggu',
    summary: '方古会增加 1 名外来者；首次杀死外来者会产生新邪恶方古并让旧方古死亡。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'vigormortis-outsider',
    roleId: 'vigormortis',
    summary: '维格莫提斯会减少 1 名外来者；杀死爪牙后的保留能力和中毒邻座只做提醒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'poppygrower-evil-info',
    roleId: 'poppygrower',
    summary: '罂粟种植者隐藏邪恶方互认；死亡当晚互认信息必须由说书人手动告知。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'plaguedoctor-storyteller-minion',
    roleId: 'plaguedoctor',
    summary: '瘟疫医生死亡后说书人获得一个爪牙能力；能力选择和使用不自动结算。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'boomdandy-mass-death',
    roleId: 'boomdandy',
    summary: '爆炸花花公子被处决会造成大量死亡和倒计时指认；必须人工逐项确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'puzzlemaster-drunk',
    roleId: 'puzzlemaster',
    summary: '解谜大师会让 1 名玩家醉酒；猜测结果和真假信息必须由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'lunatic-fake-demon',
    roleId: 'lunatic',
    summary: '疯子以为自己是恶魔；假恶魔信息与假选择需要单独记录，不能写成真实击杀。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'nodashii-neighbor-poisoning',
    roleId: 'nodashii',
    summary: '诺达鲺让相邻镇民中毒；相邻范围和中毒状态只做核对提醒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'preacher-minion-block',
    roleId: 'preacher',
    summary: '传教士命中爪牙时，该爪牙得知自己失去能力；工具不自动禁用角色。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'harpy-madness',
    roleId: 'harpy',
    summary: '鹰身女妖指定一名玩家疯狂地证明另一名玩家邪恶；疯狂惩罚由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
