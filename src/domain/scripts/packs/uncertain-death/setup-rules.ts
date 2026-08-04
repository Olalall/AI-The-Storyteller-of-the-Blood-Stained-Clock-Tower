import type { SetupRule } from '../../types'

const scriptSourceUrl = 'https://www.botcscripts.com/script/68/1.0.1/download'
const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const reviewedAt = '2026-07-21'

export const uncertainDeathSetupRules: readonly SetupRule[] = [
  {
    id: 'godfather-outsider-adjustment',
    roleId: 'godfather',
    summary: '教父会让本局外来者数量加减 1；模板必须显式记录人数修正，额外击杀由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'lunatic-fake-demon-info',
    roleId: 'lunatic',
    summary: '疯子以为自己是恶魔；假恶魔信息、假爪牙和夜晚结果只作为说书人草稿，不自动生成完整假局面。',
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
    id: 'pukka-poison-death-chain',
    roleId: 'pukka',
    summary: '普卡的中毒和次夜死亡有延迟链路；工具只提醒，不自动标中毒、死亡或解除中毒。',
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
    id: 'scarletwoman-demon-transfer',
    roleId: 'scarletwoman',
    summary: '红唇女郎只在规则条件满足时可能成为新恶魔；不能由工具自动换身份。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'sweetheart-death-drunk',
    roleId: 'sweetheart',
    summary: '心上人死亡后可能让一名玩家醉酒；目标由说书人选择和记录。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'recluse-misregister',
    roleId: 'recluse',
    summary: '陌客可能被当作邪恶阵营或爪牙/恶魔；AI 只能提示可能性，不自动裁定。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
