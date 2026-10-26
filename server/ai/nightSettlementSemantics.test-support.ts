import { roleKnowledgeForAI } from '../../src/domain/role-knowledge/complexRoleKnowledge'
import type { NightSettlementProviderRequest } from './types'
import { assertsDawnDeath } from './nightDeathTiming'

export type NightSemanticCaseId = 'alhad-pending' | 'imp-timing' | 'pukka-drunk' | 'private-copy'
  | 'pithag-unverified' | 'unknown-alignment' | 'banshee-votes' | 'changed-actor' | 'dreamer-dead-target'

type CaseDefinition = { id: NightSemanticCaseId; roleId: string; seatId: number; context: string; targets?: [number, string][]; targetLife?: 'alive' | 'dead'; roles?: [string, string] }
const definitions: CaseDefinition[] = [
  { id: 'alhad-pending', roleId: 'alhadikhia', seatId: 15, targets: [[6, 'banshee'], [7, 'librarian'], [8, 'fisherman']], context: '第2夜，恶魔健康清醒，选择顺序6、7、8。尚未公布任何目标或收集任何秘密生死选择；未核实所有保护。不能预先宣布完整名单或判定最终生死。' },
  { id: 'imp-timing', roleId: 'imp', seatId: 7, targets: [[5, 'slayer']], context: '第2夜，当前是小恶魔行动时点；7健康清醒，选5。主持已核实5存活，无保护、替死、相克或其他死亡阻碍，不是自杀。后面还有共情者行动。' },
  { id: 'pukka-drunk', roleId: 'pukka', seatId: 10, targets: [[7, 'flowergirl']], context: '第3夜：第2夜普卡健康并成功毒中4；4仍存活，没有其他毒源。当前普卡被水手致醉，持续到黄昏；本夜选7。需区分4的当前毒效、保留的追踪标记及普卡清醒后的恢复；不应让7中毒或使4今晚死亡。' },
  { id: 'private-copy', roleId: 'empath', seatId: 3, context: '第3夜：主持已确认共情者3中毒，照常假装其有能力；本次主持已决定给玩家数字1。这个数值已确认，无需猜测邻座。中毒与信息生成原因只供主持核对，不能给玩家看。' },
  { id: 'pithag-unverified', roleId: 'pithag', seatId: 10, targets: [[3, 'dreamer']], context: '第2夜：麻脸巫婆健康，选3并选择气球驾驶员。主持尚未核实气球驾驶员是否已在场，没有完整在场集合；只知道3当前是筑梦师。' },
  { id: 'unknown-alignment', roleId: 'snakecharmer', seatId: 4, targets: [[10, 'imp']], context: '第2夜：4健康清醒舞蛇人选10，10为存活真小恶魔，无其他干扰。双方都经历过未提供详情的阵营变化，当前阵营尚未核实，不能按角色类型推断。' },
  { id: 'banshee-votes', roleId: 'alhadikhia', seatId: 15, targets: [[6, 'banshee'], [7, 'librarian'], [8, 'fisherman']], context: '第2夜：恶魔健康清醒，按6、7、8依次公布并在公布下一人前收集选择。6选死，7/8选活；三人原先都活，无毒醉、保护、替死或相克。6是真实报丧女妖，死亡来源是本次恶魔。请给完整结算，明确其每天提名次数、对每轮提名的票数与普通死亡票关系，不能只对自己提名投票。' },
  { id: 'changed-actor', roleId: 'gambler', seatId: 3, targets: [[7, 'flowergirl']], context: '本夜3已由说书人确认从赌徒变为艺术家，当前真实身份以currentActor为准；旧赌徒唤醒项只是原队列快照，不要继续按猜错让3死亡。' },
  { id: 'dreamer-dead-target', roleId: 'dreamer', seatId: 3, targets: [[7, 'poisoner']], targetLife: 'dead', roles: ['chef', 'poisoner'], context: '第2夜：健康清醒筑梦师3选择已死亡的7号，7实际角色是投毒者，不是旅行者。无注册异常、强制假信息或其他干扰。主持已确认给出厨师（善良镇民）和投毒者（邪恶爪牙）两个候选角色；一善一恶且一个为真，目标不是本人。请保留玩家不知道哪个角色为真的信息结构。' },
]

function makeInput(definition: CaseDefinition): NightSettlementProviderRequest {
  const { id, roleId, seatId, context } = definition
  const selectedTargets = (definition.targets ?? []).map(([targetSeat, targetRole]) => ({
    seatId: targetSeat, playerLabel: `${targetSeat}号`, roleId: targetRole, roleName: targetRole,
    status: { life: definition.targetLife ?? 'alive', impairments: [] as string[], markers: [] as string[] },
    roleKnowledge: roleKnowledgeForAI(targetRole),
  }))
  const status = { life: 'alive', impairments: id === 'pukka-drunk' ? ['drunk'] : id === 'private-copy' ? ['poisoned'] : [], markers: [] as string[] }
  return {
    scriptId: ['alhad-pending', 'banshee-votes'].includes(id) ? 'wang-bu-jian-wang' : 'catfishing',
    knowledgeVersion: 'semantic-regression/2026-10-16', nightRunId: `semantic-${id}`, phaseLabel: id === 'pukka-drunk' || id === 'private-copy' ? '第3夜' : '第2夜', playerCount: 15,
    wakeItem: { id, seatId, orderIndex: 1, playerLabel: `${seatId}号`, roleId, roleName: roleId,
      ability: roleKnowledgeForAI(roleId)?.reminders[0] ?? roleId, storytellerPrompt: '记录选择，核对条件后由说书人确认。',
      targetCount: selectedTargets.length, ...(definition.roles ? { roleCount: 2 as const } : {}), status },
    currentActor: { seatId, playerLabel: `${seatId}号`, roleId: id === 'changed-actor' ? 'artist' : roleId, roleName: id === 'changed-actor' ? '艺术家' : roleId, status },
    draft: { targets: selectedTargets.map((target) => target.seatId), roleChoice: definition.roles?.[0] ?? (id === 'pithag-unverified' || id === 'changed-actor' ? 'balloonist' : ''), ...(definition.roles ? { secondRoleChoice: definition.roles[1] } : {}), outcomeId: '', playerChoice: '', draftRevision: 1, storytellerContext: context },
    availableOutcomes: [{ id: 'record', label: '记录结果', ready: true, requiredInputs: [] }],
    selectedTargets, statusFacts: [`发动者${seatId}号，${status.impairments.join('、') || '健康清醒'}`],
    roleKnowledge: roleKnowledgeForAI(roleId),
  }
}

export const nightSemanticCases = definitions.map((definition) => ({
  id: definition.id, makeInput: () => makeInput(definition),
}))

// 仅供离线正反例与显式授权的真实回归使用，不参与生产结算或自动修改状态。
export function auditNightAdvice(caseId: NightSemanticCaseId, value: unknown): string[] {
  const draft = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const strings = (key: string): string[] => Array.isArray(draft[key]) ? draft[key].map((entry: unknown) => typeof entry === 'string' ? entry : key === 'stateChangeDrafts' && entry && typeof entry === 'object' && 'text' in entry ? String(entry.text) : '').filter(Boolean) : []
  const text = ['summary', 'ruleFacts', 'warnings', 'journalDrafts', 'stateChangeDrafts', 'authorityWarnings']
    .flatMap((key) => typeof draft[key] === 'string' ? [draft[key] as string] : strings(key)).join('\n')
  const players = strings('playerMessageDrafts')
  const missing = strings('missing')
  const errors: string[] = []
  const require = (ok: boolean, message: string) => { if (!ok) errors.push(message) }
  const needsInput = ['alhad-pending', 'pithag-unverified', 'unknown-alignment', 'changed-actor'].includes(caseId)
  require(draft.status === (needsInput ? 'needs_input' : 'answer'), `status should be ${needsInput ? 'needs_input' : 'answer'}`)
  if (needsInput) {
    require(missing.length > 0, 'missing must explain the unresolved game condition')
    require(!draft.recommendedOutcomeId, 'unresolved conditions must not recommend an applicable outcome')
    require(players.length === 0, 'unresolved conditions must not produce unconditional player copy')
  } else require(draft.recommendedOutcomeId === 'record', 'must use the offered ready outcome')
  if (caseId === 'alhad-pending') {
    require(/秘密|选择|决定/.test(missing.join(' ')), 'must ask for secret choices')
    require(!/(?:6|7|8)号.{0,8}(?:已经死亡|已死亡|确定死亡)/.test(text), 'must not invent final deaths')
  }
  if (caseId === 'imp-timing') {
    require(/行动时|行动点|当夜|本夜|立即/.test(strings('stateChangeDrafts').join(' ')), 'death draft must identify the night action timing')
    require(!assertsDawnDeath(text), 'must not defer actual death until dawn')
  }
  if (caseId === 'pukka-drunk') {
    require(/暂时失效|不再因普卡中毒|暂时健康|普卡毒.{0,6}失效/.test(text), 'must distinguish temporarily inactive Pukka poison from tracking marker')
    require(/追踪|保留.{0,6}标记/.test(text) && /恢复|重新中毒/.test(text), 'must retain the old target link for sober recovery')
    const assertions = text.replace(/(?:不能|不得|不要|不可)(?:写成|说成|表述为)[^。\n]{0,60}/g, '')
    require(!/暂不恢复健康|不会恢复健康|亦不恢复|也不恢复|仍受普卡毒/.test(assertions), 'must not preserve active Pukka poison while its source is drunk')
  }
  if (caseId === 'private-copy') {
    require(players.length > 0 && players.some((entry) => /1|一/.test(entry)), 'must provide the storyteller-confirmed number')
    require(players.every((entry) => !/中毒|醉酒|说书人|主持|假信息|虚假|待填|核对/.test(entry)), 'player copy must not contain secret impairment or moderator notes')
  }
  if (caseId === 'pithag-unverified') require(/在场|角色集合/.test(missing.join(' ')), 'must ask whether the chosen character is already in play')
  if (caseId === 'unknown-alignment') {
    require(/阵营/.test(missing.join(' ')), 'must ask for current alignments')
    require(!/[4４]号.{0,18}(?:变为|变成|成为|改为).{0,6}邪恶|10号.{0,18}(?:变为|变成|成为|改为).{0,6}善良/.test(text), 'must not assign alignments from character types')
  }
  if (caseId === 'banshee-votes') {
    require(/6号.{0,18}死亡/.test(text) && /7号.{0,12}存活|7.{0,4}8.{0,12}存活/.test(text) && /8号.{0,12}存活|7.{0,4}8.{0,12}存活/.test(text), 'must resolve 6 dead and 7/8 alive')
    const rights = strings('stateChangeDrafts').join(' ')
    require(/每[天日].{0,12}(?:两次|2次).{0,4}提名|每[天日].{0,12}提名.{0,6}(?:两次|2次)/.test(rights), 'state marker must say two nominations per day')
    require(/每(?:一?轮|次提名|次投票).{0,18}(?:两票|2票|两次|2次)/.test(rights), 'state marker must say two votes per nomination, not per day')
    require(/(?:不.{0,12}(?:消耗|需要)|无需|不用|不必).{0,8}(?:死亡票|鬼票)|(?:死亡票|鬼票).{0,6}(?:不消耗|无需)/.test(text), 'must explain that awakened voting does not spend a ghost vote')
  }
  if (caseId === 'changed-actor') {
    require(/已.{0,8}(?:变|改)|艺术家|旧.{0,6}(?:技能|唤醒)/.test(missing.join(' ') + text), 'must explain that the old wake ability is no longer applicable')
    require(!/3号.{0,12}(?:应|将|需).{0,5}死亡/.test(strings('stateChangeDrafts').join(' ')), 'must not execute the stale Gambler ability')
    require(/白天|日间|合法.{0,8}(?:昼夜|时点)|新能力.{0,12}(?:时点|时机|昼夜)/.test(missing.join(' ') + text), 'must check the new ability phase instead of inheriting the old night wake')
    const claims = (text + '\n' + missing.join(' ')).split(/[。；，\n]/)
      .filter((clause) => !/(?:不能|不可|不得|不要|不应).{0,20}公开/.test(clause)).join('\n')
    require(!/公开[^。；\n]{0,20}(?:提问|询问)/.test(claims), 'must not invent public questioning for the new Artist ability')
  }
  if (caseId === 'dreamer-dead-target') {
    const playerText = players.join(' ')
    require(/厨师|chef/i.test(playerText) && /投毒者|poisoner/i.test(playerText) && /或|其中一个|二者之一|两者之一/.test(playerText), 'must give the two candidate roles without revealing which is true')
    require(!/中毒|醉酒|真实角色|实际.{0,5}投毒者|主持|核对/.test(playerText), 'Dreamer player copy must not reveal the true role or moderator facts')
    const assertions = (text + '\n' + playerText)
      .replace(/(?:不能|不得|不要|不可)(?:凭空|自行|额外)?(?:添加|加上|写成|声称|断言)[^。\n]{0,60}/g, '')
      .replace(/(?:没有|并无|不存在)(?:只能|仅能|必须|仅限)[^。；\n]{0,24}/g, '')
    require(!/(?:只能|仅能|必须|仅限)[^。；\n]{0,12}(?:存活|活着|活人)|(?:不能|不可|不得).{0,8}(?:选择|选取).{0,8}(?:死者|死亡|已死)|(?:死者|死亡目标|已死目标).{0,8}(?:无效|不合法)/.test(assertions), 'must not invent an alive-only targeting restriction or reject the dead target')
  }
  return errors
}
