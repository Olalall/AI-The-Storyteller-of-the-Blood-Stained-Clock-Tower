import type { AbilityInputKind, NightOrderEntry, RoleId, RoleTeam, SmartRoleDefinition, SmartScriptPack } from './types'
import { normalizeRoleId } from './roleId'
import { officialRoleIds } from './officialRoleIds'
import { resolveCharacterIconPath } from './roleIconPaths'
import officialNightSheet from '../../features/night-workbench/data/official/nightsheet.json' with { type: 'json' }

function isCustomRoleDefinition(role: SmartRoleDefinition) {
  const officialName = role.officialName?.trim().toLowerCase()
  return officialName === 'custom' || officialName === '自定义'
}

function isAcrobatNeighborVariant(role: SmartRoleDefinition) {
  return normalizeRoleId(role.id) === 'acrobat' && /(邻近|neighbor|neighbour)/i.test(role.abilityText)
}

function roleSourceKind(role: SmartRoleDefinition) {
  return isCustomRoleDefinition(role) || !officialRoleIds.has(normalizeRoleId(role.id))
    ? 'community-or-custom' as const
    : 'official-catalog' as const
}

/**
 * 官方资料中的特殊分类不能被导入脚本的旧阵营字段覆盖。
 * 只修正明确对应官方角色的记录；标记为 custom 的社区同名角色保留原始分类。
 */
function canonicalRoleTeam(role: SmartRoleDefinition): RoleTeam {
  if (isCustomRoleDefinition(role)) return role.team
  const roleId = normalizeRoleId(role.id)
  if (roleId === 'acrobat') return isAcrobatNeighborVariant(role) ? role.team : 'townsfolk'
  if (roleId === 'stormcatcher') return 'loric'
  return role.team
}

const damselDelivery = {
  kind: 'audience_notice',
  audience: { team: 'minion', excludeRoleIds: ['marionette'] },
  mode: 'sequential',
  infoToken: '落难少女',
  sensitive: true,
} as const

const organGrinderNote = '唤醒街头风琴手，让他选择自己是否醉酒直到下个黄昏；只记录选择，不自动改变醉酒状态。'
const canonicalRoleInputKinds: Readonly<Record<RoleId, readonly AbilityInputKind[]>> = {
  acrobat: ['player'],
  exorcist: ['player'],
  devilsadvocate: ['player'],
  pukka: ['player'],
  yanluo: ['player'],
  po: ['player'],
  godfather: ['player'],
  imp: ['player'],
  vigormortis: ['player'],
  widow: ['player'],
  fanggu: ['player'],
  nodashii: ['player'],
  poisoner: ['player'],
  snakecharmer: ['player'],
  vortox: ['player'],
  vortex: ['player'],
  assassin: ['player'],
  ravenkeeper: ['player'],
  monk: ['player'],
  butler: ['player'],
  professor: ['player'],
  sailor: ['player'],
  zombuul: ['player'],
  lycanthrope: ['player'],
  preacher: ['player'],
  witch: ['player'],
  nightwatchman: ['player'],
  ogre: ['player'],
  lleech: ['player'],
  villageidiot: ['player'],
  highpriestess: ['player'],
  balloonist: ['player'],
  miao_si: ['player'],
  ming_jiao: ['player'],
  mo_gan_na: ['player'],
  nian_gu_mo: ['player'],
  qian_pan: ['player'],
  qianmianren: ['player'],
  qiao_zha_fan: ['player'],
  qing_yi_lou: ['player'],
  qiong_qi: ['player'],
  ren_zhi_xian_sheng: ['player'],
  ri_yue_shen_jiao: ['player'],
  san_wei_zhi_li: ['player'],
  shu_shi: ['player'],
  si_zhi_wo: ['player'],
  taowu: ['player'],
  tian_long_jiao: ['player'],
  tian_xuan_zhi_zi: ['player'],
  wang_zi: ['player'],
  wen_yi_zhi_yuan: ['player'],
  ye_yan: ['player'],
  xue_zhi_nv: ['player'],
  yi_xiang_ren: ['player'],
  you_ling: ['player'],
  you_xia: ['player'],
  yu_jing: ['player'],
  zong_huo_kuang: ['player'],
  zu_zhang: ['player'],
  shabaloth: ['players'],
  seamstress: ['players'],
  fortuneteller: ['players'],
  barber: ['players'],
  noble: ['players'],
  alhadikhia: ['players'],
  innkeeper: ['players'],
  chambermaid: ['players', 'number'],
  harpy: ['players'],
  dianyuzhang: ['players'],
  taotie: ['players'],
  pu_ren: ['players'],
  tian_ji_ge: ['players'],
  tou_ming_ren: ['players'],
  wu_ling_jun: ['players'],
  xi_mo_ren: ['players'],
  yi_zhen_huang_liang: ['players'],
  zou_si_fan: ['players'],
  shuangtoujiao: ['players'],
  baojun: ['players'],
  zhi_shi_fen_zi: ['players'],
  wan_jun_zhi_li: ['players'],
  shi_mo: ['players', 'role'],
  gambler: ['player', 'role'],
  cerenovus: ['player', 'role'],
  pithag: ['player', 'role'],
  summoner: ['player', 'role'],
  huntsman: ['player', 'role'],
  mei_shu_guan_zhang: ['player', 'role'],
  wu_ming: ['player', 'role'],
  wu_shi: ['player', 'role'],
  xie_shu_shi: ['player', 'role'],
  investigator: ['players', 'role'],
  librarian: ['players', 'role'],
  washerwoman: ['players', 'role'],
}

function normalizeInputKinds(role: SmartRoleDefinition): readonly AbilityInputKind[] {
  const roleId = normalizeRoleId(role.id)
  if (roleId === 'organgrinder') return ['boolean']
  if (roleId === 'acrobat' && isAcrobatNeighborVariant(role)) return role.inputKinds
  return canonicalRoleInputKinds[roleId] ?? inferInputKindsFromAbility(role) ?? role.inputKinds
}

function inferInputKindsFromAbility(role: SmartRoleDefinition): readonly AbilityInputKind[] | undefined {
  if (role.inputKinds.some((kind) => kind !== 'none')) return undefined
  const text = role.abilityText
  const choosesPlayer = /(选择|选中).{0,28}(玩家|目标)/.test(text)
  const learnsSpecificPlayers = /得知.{0,12}(一名|1名|两名|2名|二名|三名|3名).{0,12}玩家/.test(text)
  const pluralPlayer = /(两名|2名|二名|三名|3名|任意名|任意数量|若干|至少三名|最多.{0,4}名|至多.{0,4}名).{0,12}(玩家|目标)/.test(text)
  const choosesRole = /(选择|猜测|得知|查看).{0,24}(角色|镇民|外来者|爪牙|恶魔)/.test(text)
  const kinds: AbilityInputKind[] = []

  if (choosesPlayer || learnsSpecificPlayers) kinds.push(pluralPlayer ? 'players' : 'player')
  if (choosesRole) kinds.push('role')

  return kinds.length ? kinds : undefined
}

function insertNightOrder(
  entries: readonly NightOrderEntry[],
  entry: NightOrderEntry,
  nightType: 'firstNight' | 'otherNight',
) {
  const withoutDuplicate = entries.filter((candidate) => normalizeRoleId(candidate.roleId) !== normalizeRoleId(entry.roleId))
  const officialOrder = new Map(officialNightSheet[nightType].map((roleId, index) => [roleId, index]))
  const entryOrder = officialOrder.get(normalizeRoleId(entry.roleId))
  const insertionIndex = entryOrder === undefined ? -1 : withoutDuplicate.findIndex((candidate) => {
    const candidateOrder = officialOrder.get(normalizeRoleId(candidate.roleId))
    return candidateOrder !== undefined && candidateOrder > entryOrder
  })
  if (insertionIndex === -1) return [...withoutDuplicate, entry]
  return [...withoutDuplicate.slice(0, insertionIndex), entry, ...withoutDuplicate.slice(insertionIndex)]
}

function enrichNightOrders(pack: SmartScriptPack) {
  const hasOrganGrinder = pack.roles.some((role) => normalizeRoleId(role.id) === 'organgrinder')
  const withDamselDelivery = pack.nightOrders.firstNight.map((entry) => (
    normalizeRoleId(entry.roleId) === 'damsel' && !entry.delivery
      ? { ...entry, delivery: damselDelivery }
      : entry
  ))
  if (!hasOrganGrinder) {
    return { firstNight: withDamselDelivery, otherNight: pack.nightOrders.otherNight }
  }
  const organRoleId = pack.roles.find((role) => normalizeRoleId(role.id) === 'organgrinder')?.id ?? 'organgrinder'
  return {
    firstNight: insertNightOrder(withDamselDelivery, {
      roleId: organRoleId,
      order: 39,
      note: organGrinderNote,
      knowledgeStatus: 'confirmed',
    }, 'firstNight'),
    otherNight: insertNightOrder(pack.nightOrders.otherNight, {
      roleId: organRoleId,
      order: 25,
      note: organGrinderNote,
      knowledgeStatus: 'confirmed',
    }, 'otherNight'),
  }
}

function alignKnownNightOrder(
  entries: readonly NightOrderEntry[],
  nightType: 'firstNight' | 'otherNight',
  roles: readonly SmartRoleDefinition[],
) {
  const officialOrder = new Map(officialNightSheet[nightType].map((roleId, index) => [roleId, index]))
  const knownEntries = entries
    .filter((entry) => officialOrder.has(normalizeRoleId(entry.roleId)))
    .sort((left, right) => (
      officialOrder.get(normalizeRoleId(left.roleId))! - officialOrder.get(normalizeRoleId(right.roleId))!
    ))
  let knownIndex = 0
  const aligned = entries.map((entry) => officialOrder.has(normalizeRoleId(entry.roleId))
    ? knownEntries[knownIndex++]
    : entry)
  return aligned.map((entry, index) => ({
    ...entry,
    order: index + 1,
    note: normalizeNightOrderNote(entry.note, entry.roleId, roles),
  }))
}

function normalizeNightOrderNote(note: string | undefined, roleId: RoleId, roles: readonly SmartRoleDefinition[]) {
  const canonicalId = normalizeRoleId(roleId)
  const role = roles.find((candidate) => normalizeRoleId(candidate.id) === canonicalId)
  if (role && !isCustomRoleDefinition(role)) {
    if (canonicalId === 'balloonist') return '首夜告知任意一名玩家；后夜告知一名与前一晚所知玩家角色类型不同的玩家。登记及毒醉影响由说书人确认。'
    if (canonicalId === 'butler' && !note?.includes('流放表决不受主人限制')) return `${note ?? ''} 流放表决不受主人限制，管家可自由参与表决。`.trim()
  }
  if (note === 'Source first-night wake reminder.') {
    return '按来源记录的首夜唤醒提醒；具体动作以该角色技能和说书人确认结果为准。'
  }
  if (note === 'Source other-night wake reminder.') {
    return '按来源记录的其他夜晚唤醒提醒；具体动作以该角色技能和说书人确认结果为准。'
  }
  return note
}

export function normalizeImportedPack(pack: SmartScriptPack): SmartScriptPack {
  const nightOrders = enrichNightOrders(pack)
  return {
    ...pack,
    roles: pack.roles.map((role) => ({
      ...role,
      team: canonicalRoleTeam(role),
      iconPath: resolveCharacterIconPath(role),
      inputKinds: normalizeInputKinds(role),
      sourceKind: roleSourceKind(role),
    })),
    nightOrders: {
      firstNight: alignKnownNightOrder(nightOrders.firstNight, 'firstNight', pack.roles),
      otherNight: alignKnownNightOrder(nightOrders.otherNight, 'otherNight', pack.roles),
    },
  }
}
