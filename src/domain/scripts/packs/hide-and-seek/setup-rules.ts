import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl =
  'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACo2Tu07FMAxAf%2BXKc7%2BgKwssLGwghNzGbU0TO3Kc8hL%2Fji5cwYjHJMdHfuXhAzjBCE%2BFHGEA7L6pwQi3aMLCKCeUdLrH6fwqWAhGuOZE39d3RDsMMGXV1BztpuBKV2pGs7MKjKDyI9Wm5jAumBsN4G%2F17Fl6zvA5XFIQnTLBAOum7Q%2BtLELpcvxlM0%2BGxihBvvIrR93VCOeNLIi7vshsHObVcA7X2SWROe5hezLCEqYbYWlu1FowAM25eRDeungr4RkZHiQ7UQ2nf7CtHNUnLI1yuI1d9iBbuqNEe7KqRhNeNS3o8UUs9E51o0zRYVblphL2z2QkevSwvu87hie5qhU9b1cwgkuNfrhn%2FYd8%2FAKDMcBoBgUAAA%3D%3D'
const reviewedAt = '2026-07-20'

export const hideAndSeekSetupRules: readonly SetupRule[] = [
  {
    id: 'huntsman-adds-damsel',
    roleId: 'huntsman',
    summary: '猎人：开局加入落难少女，通常以 1 名外来者替换 1 名镇民；选中落难少女时可让其变为不在场镇民。',
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
    id: 'vigormortis-outsider',
    roleId: 'vigormortis',
    summary: '维格莫提斯：-1 外来者；杀死爪牙后该爪牙保留能力并让相邻一名镇民中毒。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'pixie-in-play-townfolk',
    roleId: 'pixie',
    summary: '小精灵：开局得知一个在场镇民；若保持疯狂且该角色死亡，可能获得其能力。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'mezepheles-turns-evil',
    roleId: 'mezepheles',
    summary: '灵言师：首个说出暗号的善良玩家会在当晚变为邪恶。',
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
]
