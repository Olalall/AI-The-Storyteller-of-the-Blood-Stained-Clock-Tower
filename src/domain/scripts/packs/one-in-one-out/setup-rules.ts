import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl =
  'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWSQU7EMAxFr1J53RN0CSvEggMghEzrJqaJHTnOoBnE3RFiBEvMMtLzj/N%2BHt%2BBN1jguZIjzIDDsxoscIOmMp1Upvsy%2FAIzCFaCBR6EJpZJhSYdDjO8FNWtO9pdxUS3akarswosoPIdqV3NYdmxdJrBz%2B0raB%2BlwMd8XaA7vaFtMEPK2n%2FhxiK0XY8%2F9CGcsgfhzCk3Y%2BpOvQdnTlwKJuKNNXpNFzxozWiVLDiyq%2FkQciolPKOGa6EgXFWOIIpVqDOu0dW5Z7KKErVDWLtbvIH9PyJXFOEXLFGHyaIGk2r0iUZrGT0avNkId9OUu0rYRkZr52gvYbLShVqmQtEGD7xg4SDMtUXLe9XwF5KURlgEG7vufFL7S8nTJ74mOs83BQAA'
const reviewedAt = '2026-07-20'

export const oneInOneOutSetupRules: readonly SetupRule[] = [
  {
    id: 'village-idiot-extra',
    roleId: 'villageidiot',
    summary: '村夫：可加入 0-2 名额外村夫；若有额外村夫，其中 1 名额外村夫醉酒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'ogre-alignment',
    roleId: 'ogre',
    summary: '食人魔：首夜选择后变成目标阵营，即使醉酒或中毒也会发生；玩家不知道结果。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'mezepheles-turns-evil',
    roleId: 'mezepheles',
    summary: '灵言师：首个说出暗号的善良玩家当晚变邪恶；受象牙之灵额外邪恶限制。',
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
    id: 'fanggu-outsider',
    roleId: 'fanggu',
    summary: '方古：+1 外来者；首次被方古夜晚杀死的外来者会变成邪恶方古，原方古死亡。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'spirit-of-ivory-extra-evil-limit',
    roleId: 'spiritofivory',
    summary: '象牙之灵：额外邪恶玩家不能超过 1 名；它是传奇角色，不进入座位池。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
