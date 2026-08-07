import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl =
  'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUQU4DMQxFr4K8nhPMDnWBuAIIIU/iSdwm9sjOUCrE3VFFBUvMMtbzj/X95ecP4AwzvHYaCBPgPqoazPBEw2ECwU4ww/3dg3Hvd4eqtl/rS1PNPtAeOxY6qBmlwSowg8q3jrragHnF5jTBuGxXoXVvDT6n26+FhAwbTFCq+i+8sQjl2/OHfuPWsBBn1hFsGXqWZEwW5FnkRLSF+YJ9aWGa3tUSe3R47ELOmIK4cKnjjCPVjhLs8YaX8PgreyX7h7i2HLe+s/gwioYhoQgv4exk7B7WzrbLKZoAbdSD7KaNBycOO1g0rzhq2EPfe1cJ4+iO7hzeZ0JrNM4aj8AFS8EFl6VR1KP9dMIgq0cNOx89GJVpDbIVrYUv0XHPJerBQqVgeOcJNyqKfw3y8gXT+fIa6wUAAA=='
const reviewedAt = '2026-07-20'

export const aGrimmChorusSetupRules: readonly SetupRule[] = [
  {
    id: 'village-idiot-extra',
    roleId: 'villageidiot',
    summary: '村夫：可加入 0-2 名额外村夫；若有额外村夫，其中 1 名额外村夫醉酒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'godfather-outsider',
    roleId: 'godfather',
    summary: '教父：开局会增加或减少 1 名外来者；若今天有外来者死亡，夜晚可以额外杀人。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'summoner-no-demon',
    roleId: 'summoner',
    summary: '召唤师：开局无恶魔；第 3 夜选择一名玩家成为邪恶恶魔。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'damsel-minion-guess',
    roleId: 'damsel',
    summary: '落难少女：爪牙知道其在场；爪牙公开猜中一次后善良阵营失败。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'yaggababble-secret-phrase',
    roleId: 'yaggababble',
    summary: '牙噶巴卜：开局得知暗号；当天公开说出次数由说书人记录，可能造成死亡。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'traveler-template-exclusion',
    summary: '旅行者：本阶段只作为扩展角色事实保留，不进入 7-15 人常规模板或恶魔伪装。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
