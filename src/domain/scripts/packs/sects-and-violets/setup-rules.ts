import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const reviewedAt = '2026-07-20'

export const sectsAndVioletsSetupRules: readonly SetupRule[] = [
  {
    id: "fanggu-outsider",
    roleId: "fanggu",
    summary: "方古：+1 外来者；首次被方古夜晚杀死的外来者会变成邪恶方古，原方古死亡。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "vigormortis-outsider",
    roleId: "vigormortis",
    summary: "亡骨魔：-1 外来者；被他杀死的爪牙保留能力并让相邻镇民中毒。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "evil-twin-pair",
    roleId: "eviltwin",
    summary: "镜像双子：建立一对阵营相反的双子；善良双子被处决时邪恶获胜。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "snakecharmer-swap",
    roleId: "snakecharmer",
    summary: "舞蛇人：选择恶魔时交换角色和阵营；原恶魔成为中毒的舞蛇人。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
]
