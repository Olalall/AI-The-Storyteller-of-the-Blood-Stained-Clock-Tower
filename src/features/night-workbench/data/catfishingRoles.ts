import type { RoleSnapshot } from '../types'

export const catfishingRoleChoices = [
  { id: 'investigator', label: '调查员' },
  { id: 'chef', label: '厨师' },
  { id: 'grandmother', label: '祖母' },
  { id: 'balloonist', label: '气球驾驶员' },
  { id: 'dreamer', label: '筑梦师' },
  { id: 'fortuneteller', label: '占卜师' },
  { id: 'snakecharmer', label: '舞蛇人' },
  { id: 'gambler', label: '赌徒' },
  { id: 'savant', label: '博学者' },
  { id: 'philosopher', label: '哲学家' },
  { id: 'ravenkeeper', label: '守鸦人' },
  { id: 'amnesiac', label: '失忆者' },
  { id: 'cannibal', label: '食人族' },
  { id: 'drunk', label: '酒鬼' },
  { id: 'recluse', label: '陌客' },
  { id: 'sweetheart', label: '心上人' },
  { id: 'mutant', label: '畸形秀演员' },
  { id: 'lunatic', label: '疯子' },
  { id: 'godfather', label: '教父' },
  { id: 'cerenovus', label: '洗脑师' },
  { id: 'pithag', label: '麻脸巫婆' },
  { id: 'widow', label: '寡妇' },
  { id: 'imp', label: '小恶魔' },
  { id: 'vigormortis', label: '亡骨魔' },
  { id: 'fanggu', label: '方古' },
  { id: 'apprentice', label: '学徒' },
  { id: 'barista', label: '咖啡师' },
  { id: 'beggar', label: '乞丐' },
  { id: 'bonecollector', label: '集骨者' },
  { id: 'harlot', label: '流莺' },
]

const catfishingGoodRoleIds = new Set([
  'investigator',
  'chef',
  'grandmother',
  'balloonist',
  'dreamer',
  'fortuneteller',
  'snakecharmer',
  'gambler',
  'savant',
  'philosopher',
  'ravenkeeper',
  'amnesiac',
  'cannibal',
  'drunk',
  'recluse',
  'sweetheart',
  'mutant',
  'lunatic',
])
export const catfishingGoodRoleChoices = catfishingRoleChoices.filter((role) => catfishingGoodRoleIds.has(role.id))

export const catfishingRoleSnapshots: RoleSnapshot[] = catfishingRoleChoices.map((role) => ({
  id: role.id,
  name: role.label,
  initial: role.label.slice(0, 1),
  iconPath: `/assets/characters/${role.id}.webp`,
}))

