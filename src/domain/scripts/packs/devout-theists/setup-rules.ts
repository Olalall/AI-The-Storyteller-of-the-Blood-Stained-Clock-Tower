import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/devout-theists.json'
const reviewedAt = '2026-07-20'

export const devoutTheistsSetupRules: readonly SetupRule[] = [
  {
    id: 'high-priestess-id-normalization',
    roleId: 'highpriestess',
    summary: 'JSON 中的 high_priestess 已归一为项目稳定 ID highpriestess。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'fang-gu-id-normalization',
    roleId: 'fanggu',
    summary: 'JSON 中的 fang_gu 已归一为项目稳定 ID fanggu。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'snitch-minion-bluffs',
    roleId: 'snitch',
    summary: '告密者：每个爪牙各得 3 个伪装；不同于普通恶魔伪装。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'marionette-neighbor-demon',
    roleId: 'marionette',
    summary: '提线木偶：玩家以为自己是善良角色；必须与恶魔相邻，恶魔知道。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'fanggu-outsider',
    roleId: 'fanggu',
    summary: '方古：开局多 1 名外来者；第一次杀死外来者会产生新邪恶方古并让旧方古死亡。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'kazali-minion-selection',
    roleId: 'kazali',
    summary: '卡扎力：首夜指定哪些玩家成为哪些爪牙，并可修正外来者数量。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'lleech-host',
    roleId: 'lleech',
    summary: '痢蛭：开局选择宿主中毒；只有宿主死亡时痢蛭才死亡。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'legion-majority-demon',
    roleId: 'legion',
    summary: '军团：多数玩家是军团，且会登记为爪牙；当前只做提醒，不自动生成多名军团。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'magician-demon-minion-info',
    roleId: 'magician',
    summary: '魔术师：只影响恶魔和爪牙互认信息，不改变真实身份或阵营。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'widow-poison',
    roleId: 'widow',
    summary: '寡妇：首夜查看魔典并选择一名玩家中毒；一名善良玩家知道寡妇在场。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
