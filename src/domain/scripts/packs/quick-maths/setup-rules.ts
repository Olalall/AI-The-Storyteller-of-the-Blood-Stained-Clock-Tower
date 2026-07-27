import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/quick-maths.json'
const reviewedAt = '2026-07-20'

export const quickMathsSetupRules: readonly SetupRule[] = [
  {
    id: 'snitch-minion-bluffs',
    roleId: 'snitch',
    summary: '告密者：每个爪牙各得 3 个伪装；不同于普通恶魔伪装。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'xaan-outsider-night',
    roleId: 'xaan',
    summary: '扎恩：外来者数量为 X；第 X 夜所有镇民中毒到黄昏。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'marionette-neighbor-demon',
    roleId: 'marionette',
    summary: '提线木偶：玩家以为自己是善良角色；必须与恶魔相邻，恶魔知道其身份。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'boffin-demon-good-ability',
    roleId: 'boffin',
    summary: '博芬：恶魔获得一个不在场善良角色能力；恶魔和博芬都知道该能力。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'riot-day-three-chain',
    roleId: 'riot',
    summary: '暴乱：第 3 天爪牙变成暴乱；被提名者死亡并立即提名存活玩家；胜负不自动判定。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'alsaahir-public-win',
    roleId: 'alsaahir',
    summary: '阿尔萨希尔：每天若公开完整猜中哪些玩家是爪牙和恶魔，善良胜利；必须由说书人确认。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
