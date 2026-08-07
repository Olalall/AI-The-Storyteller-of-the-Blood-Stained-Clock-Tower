import { describe, expect, it } from 'vitest'
import { normalizeRoleId, roleSnapshotsForScript, roleTeamByIdForScript } from '../../domain/scripts'
import { createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { createNextNightRun } from '../game-session/state/createNextNightRun'
import { createSmartScriptSetupCandidates } from '../setup/smartScriptSetupCandidates'
import type { SetupSeatProfile } from '../setup/types'
import type { GameSessionState } from '../game-session/types'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from './state/nightWorkbenchReducer'
import { emptyWakeDraft, outcomeReady } from './state/projectWakeDraft'
import type { NightWorkbenchState, WakeItem } from './types'

/**
 * reducer 现在要求调用方给时间戳。这里固定成一个常量正是想要的效果：
 * 同一组 (state, action) 必须每次跑出同一个 state，写死时间才测得出这一点。
 */
const AT = '2026-08-04T02:00:00.000Z'

function reduce(state: NightWorkbenchState, intent: NightWorkbenchIntent): NightWorkbenchState {
  return nightWorkbenchReducer(state, { ...intent, at: AT })
}

function makeProfiles(playerCount: number): SetupSeatProfile[] {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' : index % 3 === 0 ? 'veteran' : 'regular',
  }))
}

/** 一局已确认配板、还没进过夜的对局。 */
function confirmedSession(playerCount: number, scriptId = 'trouble-brewing'): GameSessionState {
  const profiles = makeProfiles(playerCount)
  const session = createSmartScriptSetupSession(scriptId, '2026-08-04T00:00:00.000Z', {
    playerCount,
    seats: profiles,
  })
  const candidate = createSmartScriptSetupCandidates(scriptId, profiles, { seed: `${scriptId}-${playerCount}` })[0]
  return {
    ...session,
    timeline: [{
      id: 'setup-entry',
      kind: 'setup_confirmed' as const,
      segmentId: null,
      createdAt: '2026-08-04T00:01:00.000Z',
      confirmedBy: 'storyteller' as const,
      setup: {
        id: 'setup-1',
        confirmedAt: '2026-08-04T00:01:00.000Z',
        draft: {
          candidateId: candidate.id,
          revision: 1,
          assignments: candidate.assignments,
          demonBluffs: candidate.demonBluffs,
          setupRuleSelections: candidate.setupRuleSelections,
          setupRulePackVersion: candidate.setupRulePackVersion,
          updatedAt: '2026-08-04T00:01:00.000Z',
        },
      },
    }],
  }
}

function roleFor(scriptId: string, roleId: string) {
  const role = roleSnapshotsForScript(scriptId).find((candidate) => candidate.id === roleId)
  if (!role) throw new Error(`${roleId} is missing from ${scriptId}`)
  return role
}

function nightQueueItemFor(scriptId: string, roleId: string, nightType: 'first' | 'other' = 'first') {
  const session = confirmedSession(12, scriptId)
  const setup = session.timeline[0]
  if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
  const assignments = setup.setup.draft.assignments.map((assignment, index) => (
    index === 0 ? { ...assignment, role: roleFor(scriptId, roleId) } : assignment
  ))
  const run = createNextNightRun({
    ...session,
    phaseSegments: nightType === 'other'
      ? [{ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT }]
      : [],
    timeline: [{
      ...setup,
      setup: {
        ...setup.setup,
        draft: {
          ...setup.setup.draft,
          assignments,
        },
      },
    }],
  })
  const item = run?.queue.find((candidate) => candidate.roleId === roleId)
  if (!item) throw new Error(`${roleId} did not wake in ${scriptId}/${nightType}`)
  return item
}

function firstNightQueue(playerCount = 12) {
  const run = createNextNightRun(confirmedSession(playerCount))
  if (!run) throw new Error('fixture is incomplete')
  return run
}

function otherNightQueueWithRole(scriptId: string, roleId: string) {
  const session = confirmedSession(12, scriptId)
  const setup = session.timeline[0]
  if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
  const role = roleFor(scriptId, roleId)
  const assignments = setup.setup.draft.assignments.map((assignment, index) => index === 0
    ? { ...assignment, role }
    : assignment)

  const run = createNextNightRun({
    ...session,
    phaseSegments: [{
      id: 'segment-night-1',
      kind: 'night',
      sequence: 1,
      label: '第一夜',
      createdAt: AT,
      closedAt: AT,
    }],
    timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
  })
  if (!run) throw new Error(`${scriptId}/${roleId} fixture did not create a night queue`)
  return run.queue
}

function otherNightOutcomeIds(scriptId: string, roleId: string) {
  const canonicalRoleId = normalizeRoleId(roleId)
  const item = otherNightQueueWithRole(scriptId, roleId)
    .find((entry) => normalizeRoleId(entry.roleId) === canonicalRoleId)
  if (!item) throw new Error(`${scriptId}/${roleId} did not wake on other night`)
  return item.outcomeOptions.map((option) => option.id)
}

function workbenchState(queue: WakeItem[]): NightWorkbenchState {
  return {
    nightRunId: 'trouble-brewing-night-1',
    scriptId: 'trouble-brewing',
    nightLabel: '第1夜',
    nightType: 'first',
    playerCount: 12,
    revision: 0,
    knowledgeVersion: 'test',
    queue,
    seatSnapshots: {},
    activeCursorId: queue[0].id,
    previewEntryId: queue[0].id,
    drafts: {},
    privacyShielded: false,
    dimmed: false,
    aiAdviceLog: {},
    correctionItemId: null,
    confirmedRecords: {},
    roleChangeEvents: [],
    lastNotice: '',
  }
}

describe('首夜系统步骤卡', () => {
  it('builds three-target contracts for Noble and Al-Hadikhia instead of the generic two-player default', () => {
    const noble = nightQueueItemFor('an-du-chen-cang', 'noble')
    const alhadikhia = nightQueueItemFor('bing-gong-ban-shi', 'alhadikhia', 'other')

    expect(noble.targetCount).toBe(3)
    expect(noble.minimumTargetCount).toBeUndefined()
    expect(alhadikhia.targetCount).toBe(3)
    expect(alhadikhia.minimumTargetCount).toBeUndefined()
  })

  it('builds ranged target contracts for Dian Yu Zhang, Tao Tie and one-or-three target roles', () => {
    const dianyuzhang = nightQueueItemFor('gui-jue-yi-xiang', 'dianyuzhang')
    const taotie = nightQueueItemFor('gui-jue-yi-xiang', 'taotie', 'other')
    const wanJunZhiLi = nightQueueItemFor('ming-ding-zai-huo', 'wan_jun_zhi_li', 'other')

    expect(dianyuzhang.targetCount).toBe(3)
    expect(dianyuzhang.minimumTargetCount).toBe(1)
    expect(taotie.targetCount).toBe(12)
    expect(taotie.minimumTargetCount).toBe(0)
    expect(wanJunZhiLi.targetCount).toBe(3)
    expect(wanJunZhiLi.minimumTargetCount).toBe(1)
    expect(wanJunZhiLi.outcomeOptions.some((option) => option.targetCounts?.includes(1))).toBe(true)
    expect(wanJunZhiLi.outcomeOptions.some((option) => option.targetCounts?.includes(3))).toBe(true)
    expect(wanJunZhiLi.outcomeOptions.every((option) => !option.targetCounts?.includes(2))).toBe(true)

    const twoTargets = { ...emptyWakeDraft(), targets: [1, 2] }
    expect(wanJunZhiLi.outcomeOptions
      .filter((option) => option.requiredInputs.includes('targets'))
      .some((option) => outcomeReady(option, wanJunZhiLi, twoTargets))).toBe(false)
  })

  it('puts 爪牙信息 and 恶魔信息 at the head of the first night and renumbers the rest', () => {
    const run = firstNightQueue()

    expect(run.nightType).toBe('first')
    expect(run.queue.slice(0, 2).map((item) => item.roleName)).toEqual(['爪牙信息', '恶魔信息'])
    expect(run.queue.map((item) => item.orderIndex)).toEqual(run.queue.map((_item, index) => index + 1))
    expect(run.activeCursorId).toBe(run.queue[0].id)
    expect(run.queue.slice(2).every((item) => !item.systemStep)).toBe(true)
  })

  it('lists every minion seat read-only and never turns them into targets', () => {
    const session = confirmedSession(12)
    const run = createNextNightRun(session)
    const teamById = roleTeamByIdForScript('trouble-brewing')
    const setup = session.timeline[0]
    if (!run || setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const minionSeats = setup.setup.draft.assignments
      .filter((assignment) => teamById[assignment.role.id] === 'minion')
      .map((assignment) => assignment.seatId)

    for (const item of run.queue.slice(0, 2)) {
      expect(item.targetCount).toBe(0)
      expect(item.roleChoices).toBeUndefined()
      expect(item.systemStep?.minionLabels).toHaveLength(minionSeats.length)
      for (const seatId of minionSeats) {
        expect(item.systemStep?.minionLabels.some((label) => label.startsWith(`${seatId}号`))).toBe(true)
      }
    }
    expect(run.queue[0].systemStep?.infoTokens).toEqual(['他是恶魔'])
    expect(run.queue[1].systemStep?.infoTokens).toEqual(['他们是你的爪牙', '这些角色不在场'])
  })

  it('offers only good roles that are not in play as demon bluffs', () => {
    const session = confirmedSession(12)
    const run = createNextNightRun(session)
    const setup = session.timeline[0]
    if (!run || setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript('trouble-brewing')
    const inPlay = new Set(setup.setup.draft.assignments.map((assignment) => assignment.role.id))
    const choices = run.queue[1].systemStep?.bluffChoices ?? []

    expect(run.queue[1].systemStep?.bluffCount).toBe(3)
    expect(choices.length).toBeGreaterThan(0)
    for (const choice of choices) {
      expect(inPlay.has(choice.id)).toBe(false)
      expect(['townsfolk', 'outsider']).toContain(teamById[choice.id])
    }
    // 配板时预设的三张只当提示，不限制可选范围。
    expect(choices.some((choice) => choice.suggested)).toBe(true)
  })

  it('skips both steps below seven players', () => {
    // 智能板子配板本身就不接受 7 人以下，这里只钉住《规则概要》二.2 的人数门本身。
    const sixPlayers = createNextNightRun({ ...confirmedSession(12), playerCount: 6 })
    expect(sixPlayers?.queue.some((item) => item.systemStep)).toBe(false)
  })

  it('skips both steps when 罂粟种植者 is in play', () => {
    const session = confirmedSession(12)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const [first, ...rest] = setup.setup.draft.assignments
    const withPoppyGrower = {
      ...session,
      timeline: [{
        ...setup,
        setup: {
          ...setup.setup,
          draft: {
            ...setup.setup.draft,
            assignments: [
              { ...first, role: { id: 'poppygrower', name: '罂粟种植者', initial: '罂', iconPath: '' } },
              ...rest,
            ],
          },
        },
      }],
    }

    expect(createNextNightRun(withPoppyGrower)?.queue.some((item) => item.systemStep)).toBe(false)
  })

  it('also recognizes the poppy_grower id alias used by imported packs', () => {
    const session = confirmedSession(12)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const [first, ...rest] = setup.setup.draft.assignments
    const withImportedAlias = {
      ...session,
      timeline: [{
        ...setup,
        setup: {
          ...setup.setup,
          draft: {
            ...setup.setup.draft,
            assignments: [
              { ...first, role: { id: 'poppy_grower', name: '罂粟种植者', initial: '罂', iconPath: '' } },
              ...rest,
            ],
          },
        },
      }],
    }

    const queue = createNextNightRun(withImportedAlias)?.queue ?? []

    expect(queue.length).toBeGreaterThan(0)
    expect(queue.map((item) => item.roleId)).not.toContain('system-minion-info')
    expect(queue.map((item) => item.roleId)).not.toContain('system-demon-info')
  })

  it('excludes the Marionette from both evil-information lists', () => {
    const scriptId = 'lunar-eclipse'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript(scriptId)
    const minionIndex = setup.setup.draft.assignments.findIndex((assignment) => (
      teamById[assignment.role.id] === 'minion'
    ))
    const marionette = roleFor(scriptId, 'marionette')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => (
      index === minionIndex ? { ...assignment, role: marionette } : assignment
    ))
    const withMarionette = {
      ...session,
      timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
    }
    const run = createNextNightRun(withMarionette)
    const infoSteps = run?.queue.filter((item) => item.systemStep) ?? []
    const marionetteStep = run?.queue.find((item) => item.roleId === 'marionette')
    const marionetteSeat = assignments[minionIndex].seatId
    const demonSeat = assignments.find((assignment) => teamById[assignment.role.id] === 'demon')?.seatId

    expect(infoSteps.map((item) => item.roleId)).toEqual(['system-demon-info'])
    expect(infoSteps[0].systemStep?.minionLabels).toEqual([])
    expect(infoSteps[0].playerLabel).not.toContain(`${marionetteSeat}号`)
    expect(marionetteStep?.seatId).toBe(demonSeat)
    expect(marionetteStep?.seatId).not.toBe(marionetteSeat)
  })

  it('places Demon info after the Lunatic according to the official first-night sheet', () => {
    const scriptId = 'an-du-chen-cang'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript(scriptId)
    const goodIndex = setup.setup.draft.assignments.findIndex((assignment) => (
      ['townsfolk', 'outsider'].includes(teamById[assignment.role.id])
    ))
    const assignments = setup.setup.draft.assignments.map((assignment, index) => (
      index === goodIndex ? { ...assignment, role: roleFor(scriptId, 'lunatic') } : assignment
    ))
    const withLunatic = {
      ...session,
      timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
    }
    const ids = createNextNightRun(withLunatic)?.queue.map((item) => item.roleId) ?? []

    const relevantIds = ids.filter((id) => [
      'system-minion-info',
      'lunatic',
      'system-demon-info',
      'snake_charmer',
    ].includes(id))

    expect(relevantIds[0]).toBe('system-minion-info')
    expect(relevantIds.at(-1)).toBe('snake_charmer')
    expect(relevantIds.at(-2)).toBe('system-demon-info')
    expect(relevantIds.slice(1, -2).every((id) => id === 'lunatic')).toBe(true)
    expect(relevantIds.filter((id) => id === 'lunatic').length).toBeGreaterThan(0)
  })

  it('creates one wake item for every in-play Village Idiot', () => {
    const scriptId = 'hu-yan-luan-yu'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript(scriptId)
    const goodIndexes = setup.setup.draft.assignments
      .map((assignment, index) => ({ index, team: teamById[assignment.role.id] }))
      .filter(({ team }) => ['townsfolk', 'outsider'].includes(team))
      .slice(0, 2)
      .map(({ index }) => index)
    const villageIdiot = roleFor(scriptId, 'villageidiot')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => (
      goodIndexes.includes(index) ? { ...assignment, role: villageIdiot } : assignment
    ))
    const withTwoVillageIdiots = {
      ...session,
      timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
    }
    const villageIdiots = createNextNightRun(withTwoVillageIdiots)?.queue
      .filter((item) => item.roleId === 'villageidiot') ?? []

    expect(villageIdiots).toHaveLength(2)
    expect(new Set(villageIdiots.map((item) => item.id)).size).toBe(2)
    expect(villageIdiots.map((item) => item.seatId).sort((a, b) => a - b)).toEqual(
      goodIndexes.map((index) => assignments[index].seatId).sort((a, b) => a - b),
    )
  })

  it('skips both steps on later nights', () => {
    const session = confirmedSession(12)
    const withFirstNight = {
      ...session,
      phaseSegments: [{
        id: 'segment-night-1',
        kind: 'night' as const,
        sequence: 1,
        label: '第1夜',
        createdAt: '2026-08-04T00:02:00.000Z',
        closedAt: '2026-08-04T00:30:00.000Z',
      }],
    }
    const secondNight = createNextNightRun(withFirstNight)
    expect(secondNight?.nightType).toBe('other')
    expect(secondNight?.queue.some((item) => item.systemStep)).toBe(false)
  })

  it('keeps generated night outcomes aligned with local AI recommendation ids', () => {
    expect(nightQueueItemFor('bad-moon-rising', 'gambler', 'other').outcomeOptions.map((option) => option.id)).toEqual(expect.arrayContaining(['correct', 'wrong', 'no-effect']))
    expect(otherNightOutcomeIds('an-du-chen-cang', 'snake_charmer')).toEqual(expect.arrayContaining(['swap', 'miss', 'no-effect']))
    expect(otherNightOutcomeIds('an-du-chen-cang', 'fang_gu')).toEqual(expect.arrayContaining(['convert', 'kill', 'no-effect']))
    expect(otherNightOutcomeIds('sects-and-violets', 'pithag')).toEqual(expect.arrayContaining(['changed', 'already-in-play', 'no-effect']))
  })
})

describe('说书人登记快照', () => {
  it('requires Balloonist target and displayed role type before confirmation', () => {
    const item: WakeItem = {
      ...firstNightQueue().queue.find((entry) => !entry.systemStep)!,
      id: 'balloonist-test',
      roleId: 'balloonist',
      roleName: '气球驾驶员',
      seatId: 1,
      targetCount: 1,
      applicability: 'applicable',
      roleChoices: undefined,
      roleLabel: undefined,
      registrationSpec: {
        kind: 'role_type',
        label: '本夜展示类型',
        choices: [
          { id: 'townsfolk', label: '镇民' },
          { id: 'outsider', label: '外来者' },
          { id: 'minion', label: '爪牙' },
          { id: 'demon', label: '恶魔' },
        ],
      },
      outcomeOptions: [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}记录：{targets}。' }],
    }
    let state = workbenchState([item])
    state = { ...state, activeCursorId: item.id, previewEntryId: item.id }
    state = reduce(state, { type: 'target', seatId: 4 })
    state = reduce(state, { type: 'outcome', outcomeId: 'record' })
    expect(state.drafts[item.id].outcomeId).toBe('')

    state = reduce(state, { type: 'registration-choice', value: 'outsider' })
    state = reduce(state, { type: 'outcome', outcomeId: 'record' })
    state = reduce(state, { type: 'confirm', advance: false })
    expect(state.confirmedRecords[item.id]?.at(-1)?.snapshot.registration).toEqual({
      kind: 'role_type', seatId: 4, value: 'outsider',
    })
    expect(state.confirmedRecords[item.id]?.at(-1)?.snapshot.playerChoice).toContain('本夜展示类型：外来者')
  })

  it('reads Balloonist history only from the latest effective confirmed snapshot', () => {
    const scriptId = 'an-du-chen-cang'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const balloonist = roleFor(scriptId, 'balloonist')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => index === 0
      ? { seatId: assignment.seatId, role: balloonist }
      : assignment)
    const actorSeatId = assignments[0].seatId
    const priorSnapshot = {
      kind: 'role_type' as const,
      seatId: 4,
      value: 'outsider' as const,
    }
    const run = createNextNightRun({
      ...session,
      phaseSegments: [{ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT }],
      timeline: [
        { ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } },
        {
          id: 'balloonist-night-1', kind: 'night_action', segmentId: 'night-1', createdAt: AT,
          confirmedBy: 'storyteller',
          nightRunId: 'night-1', wakeItemId: 'night-1-balloonist', actorSeatId, roleId: 'balloonist',
          summary: '已登记', details: [], record: { revision: 1, snapshot: { ...({ targets: [], roleChoice: '', outcomeId: '', playerChoice: '', storytellerResult: '', informationGiven: '', draftRevision: 0 }), registration: priorSnapshot } },
        },
      ],
    })
    const item = run?.queue.find((entry) => entry.roleId === 'balloonist')
    expect(item?.previousRegistration).toEqual(priorSnapshot)
    expect(item?.history).toContain('上一夜登记：外来者（4号）')
  })

  it('projects the confirmed Moonchild day alignment as a death candidate without changing life', () => {
    const scriptId = 'bad-moon-rising'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const moonchild = roleFor(scriptId, 'moonchild')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => index === 0
      ? { seatId: assignment.seatId, role: moonchild }
      : assignment)
    const actorSeatId = assignments[0].seatId
    const targetRole = assignments[4].role
    const run = createNextNightRun({
      ...session,
      phaseSegments: [
        { id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: AT, closedAt: AT },
        { id: 'day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: AT, closedAt: AT },
      ],
      timeline: [
        { ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } },
        {
          id: 'moonchild-choice', kind: 'day_action', category: 'skill', segmentId: 'day-1', createdAt: AT,
          confirmedBy: 'storyteller', actorSeatId, targetSeatIds: [5], summary: '月之子选择5号', details: [],
          skillContext: {
            abilityRole: moonchild,
            actor: { seatId: actorSeatId, actualRole: moonchild },
            claimedRole: moonchild,
            targets: [{ seatId: 5, actualRole: targetRole, registration: { kind: 'alignment', seatId: 5, value: 'good' } }],
            outcome: { kind: 'applied' },
          },
        },
      ],
    })
    const item = run?.queue.find((entry) => entry.roleId === 'moonchild')
    expect(item).toMatchObject({
      targetCount: 0,
      previousRegistration: { kind: 'alignment', seatId: 5, value: 'good' },
      outcomeOptions: [{ id: 'death-candidate' }],
    })
    expect(session.timeline.some((entry) => entry.kind === 'player_state_changed')).toBe(false)
  })
})

describe('角色投递与玩家决定', () => {
  it('delivers Damsel information to every eligible Minion, not to the Damsel or Marionette', () => {
    const scriptId = 'chou-hai-ni-xing'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript(scriptId)
    const goodIndex = setup.setup.draft.assignments.findIndex((assignment) => (
      ['townsfolk', 'outsider'].includes(teamById[assignment.role.id])
    ))
    const minionIndex = setup.setup.draft.assignments.findIndex((assignment) => teamById[assignment.role.id] === 'minion')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => {
      if (index === goodIndex) return { ...assignment, role: roleFor(scriptId, 'damsel') }
      if (index === minionIndex) return { ...assignment, role: roleFor(scriptId, 'marionette') }
      return assignment
    })
    const withDamsel = {
      ...session,
      timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
    }
    const item = createNextNightRun(withDamsel)?.queue.find((entry) => entry.roleId === 'system-audience-damsel')
    const damselSeat = assignments[goodIndex].seatId
    const marionetteSeat = assignments[minionIndex].seatId
    const eligibleMinionSeats = assignments
      .filter((assignment) => teamById[assignment.role.id] === 'minion' && assignment.role.id !== 'marionette')
      .map((assignment) => assignment.seatId)

    expect(item?.systemStep?.kind).toBe('audience_notice')
    expect(item?.seatId).not.toBe(damselSeat)
    expect(item?.systemStep?.recipientLabels).toHaveLength(eligibleMinionSeats.length)
    expect(item?.systemStep?.recipientLabels?.some((label) => label.startsWith(`${marionetteSeat}号`))).toBe(false)
    expect(item?.systemStep?.checks).toHaveLength(eligibleMinionSeats.length)
    expect(item?.targetCount).toBe(0)
    expect(item?.systemStep?.sensitive).toBe(true)

    const poisonedDamsel = {
      ...withDamsel,
      initialPlayerStates: {
        ...withDamsel.initialPlayerStates,
        [damselSeat]: { ...withDamsel.initialPlayerStates[damselSeat], poisoned: true },
      },
    }
    const poisonedItem = createNextNightRun(poisonedDamsel)?.queue.find((entry) => entry.roleId === 'system-audience-damsel')
    expect(poisonedItem?.applicability).toBe('needs_review')
    expect(poisonedItem?.status.impairments).toContain('poisoned')
    expect(poisonedItem?.reason).toContain('先由说书人确认其能力是否有效')
  })

  it('creates a reviewable no-op Damsel notice when the only Minion is the Marionette', () => {
    const scriptId = 'chou-hai-ni-xing'
    const session = confirmedSession(7, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript(scriptId)
    const goodIndex = setup.setup.draft.assignments.findIndex((assignment) => (
      ['townsfolk', 'outsider'].includes(teamById[assignment.role.id])
    ))
    const minionIndex = setup.setup.draft.assignments.findIndex((assignment) => teamById[assignment.role.id] === 'minion')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => {
      if (index === goodIndex) return { ...assignment, role: roleFor(scriptId, 'damsel') }
      if (index === minionIndex) return { ...assignment, role: roleFor(scriptId, 'marionette') }
      return assignment
    })
    const withDamsel = {
      ...session,
      timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
    }
    const item = createNextNightRun(withDamsel)?.queue.find((entry) => entry.roleId === 'system-audience-damsel')

    expect(item?.seatId).toBe(0)
    expect(item?.playerLabel).toContain('无需通知')
    expect(item?.systemStep?.recipientLabels).toEqual([])
    expect(item?.systemStep?.checks).toEqual([])
  })

  it('records the Organ Grinder choice as the result and disables AI advice', () => {
    const scriptId = 'xin-ren-shi-lian'
    const session = confirmedSession(12, scriptId)
    const setup = session.timeline[0]
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture is incomplete')
    const teamById = roleTeamByIdForScript(scriptId)
    const minionIndex = setup.setup.draft.assignments.findIndex((assignment) => teamById[assignment.role.id] === 'minion')
    const assignments = setup.setup.draft.assignments.map((assignment, index) => (
      index === minionIndex ? { ...assignment, role: roleFor(scriptId, 'organ_grinder') } : assignment
    ))
    const withOrganGrinder = {
      ...session,
      timeline: [{ ...setup, setup: { ...setup.setup, draft: { ...setup.setup.draft, assignments } } }],
    }
    const item = createNextNightRun(withOrganGrinder)?.queue.find((entry) => entry.roleId === 'organ_grinder')
    if (!item) throw new Error('Organ Grinder wake item is missing')

    expect(item.targetCount).toBe(0)
    expect(item.roleChoices).toBeUndefined()
    expect(item.outcomeOptions.map((option) => option.label)).toEqual(['醉酒至下个黄昏', '保持清醒'])
    expect(item.aiAdviceEnabled).toBe(false)

    let state = { ...workbenchState([item]), activeCursorId: item.id, previewEntryId: item.id }
    state = reduce(state, { type: 'outcome', outcomeId: 'yes' })
    state = reduce(state, { type: 'confirm', advance: false })
    const record = state.confirmedRecords[item.id]?.at(-1)
    expect(record?.snapshot.storytellerResult).toContain('仅记录选择，不自动改变醉酒状态')
  })
})

describe('系统步骤卡的记录', () => {
  it('blocks the record until the checklist and all three bluffs are set', () => {
    const run = firstNightQueue()
    const demonInfo = run.queue[1]
    const choices = demonInfo.systemStep?.bluffChoices ?? []
    let state = workbenchState(run.queue)
    state = { ...state, activeCursorId: demonInfo.id, previewEntryId: demonInfo.id }

    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[demonInfo.id]?.outcomeId ?? '').toBe('')

    state = reduce(state, { type: 'system-check', checkId: 'pointed-minions' })
    state = reduce(state, { type: 'system-bluff', roleId: choices[0].id })
    state = reduce(state, { type: 'system-bluff', roleId: choices[1].id })
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[demonInfo.id]?.outcomeId ?? '').toBe('')

    state = reduce(state, { type: 'system-bluff', roleId: choices[2].id })
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[demonInfo.id]?.outcomeId).toBe('given')
  })

  it('writes the three bluffs into a night_action snapshot that stays reviewable', () => {
    const run = firstNightQueue()
    const demonInfo = run.queue[1]
    const choices = demonInfo.systemStep?.bluffChoices ?? []
    let state = workbenchState(run.queue)
    state = { ...state, activeCursorId: demonInfo.id, previewEntryId: demonInfo.id }

    state = reduce(state, { type: 'system-check', checkId: 'pointed-minions' })
    for (const choice of choices.slice(0, 3)) {
      state = reduce(state, { type: 'system-bluff', roleId: choice.id })
    }
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    state = reduce(state, { type: 'confirm', advance: false })

    const record = state.confirmedRecords[demonInfo.id]?.at(-1)
    expect(record).toBeDefined()
    expect(record?.snapshot.bluffRoleIds).toEqual(choices.slice(0, 3).map((choice) => choice.id))
    for (const choice of choices.slice(0, 3)) {
      expect(record?.snapshot.storytellerResult).toContain(choice.label)
    }
    expect(record?.snapshot.storytellerResult).toContain('恶魔信息')
    expect(record?.snapshot.playerChoice).toContain('不在场善良角色')
  })

  it('drops the outcome again when a check is undone, so no empty record can be confirmed', () => {
    const run = firstNightQueue()
    const minionInfo = run.queue[0]
    let state = workbenchState(run.queue)

    state = reduce(state, { type: 'system-check', checkId: 'pointed-demon' })
    state = reduce(state, { type: 'outcome', outcomeId: 'given' })
    expect(state.drafts[minionInfo.id]?.storytellerResult).toContain('爪牙信息')

    state = reduce(state, { type: 'system-check', checkId: 'pointed-demon' })
    expect(state.drafts[minionInfo.id]?.outcomeId).toBe('')
    state = reduce(state, { type: 'confirm', advance: false })
    expect(state.confirmedRecords[minionInfo.id]).toBeUndefined()
  })

  it('never lets a role change rename a system step', () => {
    const run = firstNightQueue()
    let state = workbenchState(run.queue)

    state = reduce(state, {
      type: 'change-role',
      role: { id: 'chef', name: '厨师', initial: '厨', iconPath: '' },
      reason: 'gameplay',
    })

    expect(state.roleChangeEvents).toHaveLength(0)
    expect(state.queue[0].roleName).toBe('爪牙信息')
  })
})
