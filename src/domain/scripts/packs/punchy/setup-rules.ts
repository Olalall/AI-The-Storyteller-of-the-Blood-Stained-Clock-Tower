import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl = 'https://botc-script-viewer.sthom.kiwi/carousel/punchy/punchy.json'
const reviewedAt = '2026-07-20'

export const punchySetupRules: readonly SetupRule[] = [
  {
    id: 'balloonist-outsider',
    roleId: 'balloonist',
    summary: '气球驾驶员：可增加 0 或 1 名外来者；若增加，通常替换 1 名镇民。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'huntsman-damsel',
    roleId: 'huntsman',
    summary: '巡山人：开局加入落难少女；若巡山人夜晚选中落难少女，目标变成一个不在场镇民。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'kazali-minion-selection',
    roleId: 'kazali',
    summary: '卡扎力：开局指定哪些玩家成为哪些爪牙；外来者数量可被修正。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'vigormortis-outsider',
    roleId: 'vigormortis',
    summary: '亡骨魔：-1 外来者；杀死爪牙后该爪牙保留能力并让相邻一名镇民中毒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'alchemist-minion-ability',
    roleId: 'alchemist',
    summary: '炼金术士：开局获得一个爪牙能力；只作为善良角色能力提醒，不自动执行对应爪牙状态机。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'spirit-of-ivory-extra-evil',
    roleId: 'spiritofivory',
    summary: '圣洁之魂：额外邪恶玩家不能超过 1 名；作为传奇规则约束，不进入座位身份。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
