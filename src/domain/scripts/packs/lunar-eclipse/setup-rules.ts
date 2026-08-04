import type { SetupRule } from '../../types'

const rolesSourceUrl = 'https://release.botc.app/resources/data/roles.json'
const scriptSourceUrl =
  'https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUTU7EMAyFr4K87gm6RbNA4gYIIbdxU2sSO3Lcig7i7mhgBEs8y0jPv+9zXj6AE4zwVskRBsDNVzUY4XRmgQEEK8EIz5ugPZzmwq0TDDAV1dQd7alipkc1o9lZBUZQ+UmjXc1hXLB0GsCPds2zbKXA53Armg0lVfWVDAbIq%2Fa%2FgMYilG7P34jG70xBbUcuGk08r1gnsoqcghEVfaWKzjOjBGNY5EzUwuOWY0bx1bTFh95RPChGc%2B5RsRMWTEd4O%2FmexVQ84lahCE9YgvKsGu1iQpvi3mxyNT8K7na5FKrYPVwga1rwjttItHPpmHad0cO8tKij2Dv2znFHjVXIw52IJuwrc1B%2B0TptWxSCnbNa1SvvcRa4f3%2BJEfWKVjR8dq0ZifMcXc1EOWMUg123FCa%2BNzZ2XXhX%2Bw%2BE1y%2BQsqpnLAYAAA%3D%3D'
const reviewedAt = '2026-07-20'

export const lunarEclipseSetupRules: readonly SetupRule[] = [
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
    summary: '亡骨魔：-1 外来者；杀死爪牙后该爪牙保留能力并让相邻一名镇民中毒。',
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
    id: 'magician-info-mask',
    roleId: 'magician',
    summary: '魔术师：影响恶魔与爪牙开局互认信息，但不改变真实身份或阵营。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'lunatic-fake-demon',
    roleId: 'lunatic',
    summary: '疯子：以为自己是恶魔；真正恶魔知道疯子是谁以及疯子夜晚选择。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'lycanthrope-demon-block',
    roleId: 'lycanthrope',
    summary: '半兽人：若夜晚选中善良玩家，目标死亡且恶魔今晚不杀人；一名善良玩家登记为邪恶。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
  {
    id: 'puzzlemaster-drunk',
    roleId: 'puzzlemaster',
    summary: '解谜大师：有 1 名玩家醉酒；每局一次猜醉酒玩家，猜对得知恶魔，猜错得假信息。',
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
  {
    id: 'traveler-fabled-template-exclusion',
    summary: '旅行者和传奇角色保留角色事实与夜序信息，但不进入 7-15 人常规座位模板和恶魔伪装。',
    knowledgeStatus: 'confirmed',
    sourceUrls: [rolesSourceUrl, scriptSourceUrl],
    reviewedAt,
  },
]
