import type { SetupRule } from '../../types'

const scriptSourceUrl = 'https://botcscripts.com/script/1945/1.0.2/download'
const officialRolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const reviewedAt = '2026-07-21'

export const everyoneCanPlaySetupRules: readonly SetupRule[] = [
  {
    id: 'baron-outsiders',
    roleId: 'baron',
    summary: '男爵在场时增加 2 名外来者，通常替换 2 名镇民；模板必须显式记录人数修正。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'drunk-cover',
    roleId: 'drunk',
    summary: '酒鬼以为自己是一个不在场镇民；身份交接和日志只能由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'fortuneteller-red-herring',
    roleId: 'fortuneteller',
    summary: '占卜师需要 1 名善良玩家作为红鲱鱼；这是说书人记录项，不自动分配。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'devilsadvocate-protection',
    roleId: 'devilsadvocate',
    summary: '魔鬼代言人保护目标是否处决不死，必须由说书人在日终确认。',
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
    id: 'saint-moonchild-mayor-risk',
    summary: '圣徒、月之子、镇长都可能影响处决、死亡或胜负；AI 只做核对提醒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [officialRolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
