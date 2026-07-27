import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const reviewedAt = '2026-07-20'

export const troubleBrewingSetupRules: readonly SetupRule[] = [
  {
    id: "baron-outsiders",
    roleId: "baron",
    summary: "男爵：+2 外来者，通常替换 2 名镇民。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "drunk-cover",
    roleId: "drunk",
    summary: "酒鬼：以为自己是某个镇民，但实际是外来者且能力无效。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
  {
    id: "fortuneteller-red-herring",
    roleId: "fortuneteller",
    summary: "占卜师：开局指定 1 名善良玩家作为红鲱鱼，可能被登记为恶魔。",
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl],
    reviewedAt,
  },
]
