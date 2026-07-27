import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const reviewedAt = '2026-07-20'

export const badMoonRisingSetupRules: readonly SetupRule[] = [
  {
    id: "godfather-outsider",
    roleId: "godfather",
    summary: "教父：开局会增加或减少 1 名外来者；如果外来者今天死亡，夜晚可以额外选择一名玩家死亡。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "lunatic-fake-demon",
    roleId: "lunatic",
    summary: "疯子：以为自己是恶魔；恶魔知道疯子和他的夜晚选择。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "apprentice-first-night",
    roleId: "apprentice",
    summary: "学徒：首夜根据阵营获得镇民或爪牙能力。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
]
