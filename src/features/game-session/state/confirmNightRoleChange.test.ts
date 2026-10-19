// Regression for explicit character changes, night scheduling, and append-only history.
import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { changedRoleNightItems, hasUnsyncedRoleChange } from './confirmNightRoleChange'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import type { GameSessionAction } from './sessionActions'
import type { GameSessionState } from '../types'
import { createNightWorkbenchCommit, nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { actNight, informationSession, projected } from '../../night-workbench/state/nightInformation.test-support'
import { nightWorkbenchReducer } from '../../night-workbench/state/nightWorkbenchReducer'
import { emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { canConfirmDraft } from '../../night-workbench/state/workbenchGuards'
import { parseSessionBackup } from '../../../services/session/sessionBackup'

const at = '2026-10-18T00:00:00.000Z'
let serial = 1
const tick = () => new Date(Date.parse(at) + serial++ * 1000).toISOString()
type Change = Extract<GameSessionAction, { type: 'confirm-night-role-change' }>

function focus(session: GameSessionState, id: string) {
  return actNight(actNight(session, { type: 'preview', id }), { type: 'activate-preview' })
}

function command(session: GameSessionState, seatId: number, roleId: string, id: string, timing: Change['timing'] = 'tonight'): Change {
  const run = session.nightRuns[session.activeNightRunId!]
  const latest = session.timeline.filter((entry) => entry.kind === 'setup_changed' && entry.seatId === seatId).map((entry) => Date.parse(entry.createdAt))
  const confirmedAt = new Date(Math.max(Date.parse(tick()), ...latest.map((time) => time + 1000))).toISOString()
  return { type: 'confirm-night-role-change', nightRunId: run.id, seatId, roleId, id, timing,
    expectedRoleId: projectCurrentAssignments(session).find((entry) => entry.seatId === seatId)!.role.id,
    expectedContextKey: nightContextKey(session), expectedRevision: run.revision, confirmedAt, reason: 'gameplay' }
}

function nextNight(session: GameSessionState) {
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'night', createdAt: tick() })
  for (const item of projected(session).queue.filter((entry) => entry.progress !== 'confirmed')) {
    session = actNight(session, { type: 'skip-item', id: item.id, reason: '隔离场景不模拟其它首夜技能。' })
  }
  session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: tick() })
  session = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: tick() })
  session = gameSessionReducer(session, { type: 'confirm-day-no-execution', daySegmentId: session.phaseSegments.at(-1)!.id, entryId: `no-execution-${serial}`, confirmedAt: tick() })
  session = gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: tick() })
  return gameSessionReducer(session, { type: 'start-next-night-run' })
}

function opening(fangGu = false, first = false) {
  const scriptId = 'sects-and-violets', snapshots = roleSnapshotsForScript(scriptId)
  const ids = ['snakecharmer', 'savant', 'dreamer', 'seamstress', 'philosopher', 'flowergirl', fangGu ? 'mutant' : 'oracle', 'barber', 'sweetheart', 'witch', 'pithag', fangGu ? 'fanggu' : 'vortox']
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: 12 })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: {
    candidateId: 'explicit-night-character-change', revision: 1, updatedAt: at,
    assignments: ids.map((id, index) => ({ seatId: index + 1, role: { ...snapshots.find((role) => role.id === id)! } })),
    demonBluffs: ['clockmaker', 'artist', 'towncrier'].map((id) => ({ ...snapshots.find((role) => role.id === id)! })),
  } })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'role-change-setup', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  return first ? session : nextNight(session)
}

function activeSeat(session: GameSessionState, seatId: number) {
  return projected(session).queue.filter((item) => item.seatId === seatId && item.progress !== 'not_applicable')
}

describe('explicit same-night character changes: acceptance draft', () => {
  it('adds the future Mathematician wake after a Pit-Hag change, without rebuilding history', () => {
    const before = opening(), oldTimeline = structuredClone(before.timeline)
    const after = gameSessionReducer(before, command(before, 2, 'mathematician', 'pit-hag-math'))
    expect(projectCurrentAssignments(after).find((entry) => entry.seatId === 2)?.role.id).toBe('mathematician')
    const queue = projected(after).queue, math = queue.find((item) => item.seatId === 2 && item.roleId === 'mathematician')!
    expect(math).toMatchObject({ progress: 'pending', applicability: 'applicable' })
    expect(math.id).toContain('pit-hag-math')
    expect(queue.indexOf(math)).toBeGreaterThan(queue.findIndex((item) => item.roleId === 'pithag'))
    expect(after.timeline.slice(0, oldTimeline.length)).toEqual(oldTimeline)
    expect(projectCurrentPlayerStates(after)).toEqual(projectCurrentPlayerStates(before))
  })

  it('moves the unspent Demon ability to the new Snake Charmer actor and blocks the former Demon form', () => {
    let session = opening()
    const beforeStates = projectCurrentPlayerStates(session)
    const oldDemon = projected(session).queue.find((item) => item.seatId === 12 && item.roleId === 'vortox')!
    session = gameSessionReducer(session, command(session, 1, 'vortox', 'snake-charmer-new-demon'))
    session = gameSessionReducer(session, command(session, 12, 'snakecharmer', 'snake-charmer-old-demon', 'later'))
    expect(activeSeat(session, 1).some((item) => item.roleId === 'vortox' && item.progress === 'pending')).toBe(true)
    expect(projected(session).queue.find((item) => item.id === oldDemon.id)).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    session = focus(session, oldDemon.id)
    session = actNight(actNight(session, { type: 'target', seatId: 4 }), { type: 'outcome', outcomeId: 'record' })
    const state = projected(session)
    expect(canConfirmDraft(state, state.queue.find((item) => item.id === oldDemon.id)!, state.drafts[oldDemon.id] ?? emptyWakeDraft())).toBe(false)
    expect(activeSeat(session, 12)).toHaveLength(0)
    expect(projectCurrentPlayerStates(session)).toEqual(beforeStates)
    expect(session.timeline.filter((entry) => entry.kind === 'player_state_changed')).toHaveLength(0)
  })

  it('stops Barber after a Fang Gu jump without offering the new Fang Gu an extra attack', () => {
    const before = opening(true), beforeStates = projectCurrentPlayerStates(before)
    const oldBarber = projected(before).queue.find((item) => item.seatId === 8 && item.roleId === 'barber')!
    const after = gameSessionReducer(before, command(before, 8, 'fanggu', 'fang-gu-jump', 'later'))
    expect(projectCurrentAssignments(after).find((entry) => entry.seatId === 8)?.role.id).toBe('fanggu')
    expect(projected(after).queue.find((item) => item.id === oldBarber.id)).toMatchObject({ progress: 'not_applicable', applicability: 'not_applicable' })
    expect(activeSeat(after, 8)).toHaveLength(0)
    expect(projectCurrentPlayerStates(after)).toEqual(beforeStates)
    expect(projectCurrentPlayerStates(after)[12].life).toBe('alive') // Death and alignment are separate host confirmations.
    expect(parseSessionBackup(JSON.stringify(after))).toEqual(after)
  })

  it('preserves confirmed history and drafts through multiple changes back to the same character, using fresh IDs', () => {
    let session = opening()
    const original = projected(session).queue.find((item) => item.seatId === 1 && item.roleId === 'snakecharmer')!
    session = focus(session, original.id)
    session = actNight(session, { type: 'storyteller-context', value: '旧轮次已核对；只留记录，不改状态。' })
    session = actNight(actNight(session, { type: 'target', seatId: 2 }), { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const timeline = structuredClone(session.timeline), draft = structuredClone(projected(session).drafts[original.id])
    session = gameSessionReducer(session, command(session, 1, 'vortox', 'change-vortox-a'))
    const demonA = activeSeat(session, 1).find((item) => item.roleId === 'vortox')!
    session = gameSessionReducer(session, command(session, 1, 'snakecharmer', 'change-snakecharmer-b'))
    const snakeB = activeSeat(session, 1).find((item) => item.roleId === 'snakecharmer' && item.progress !== 'confirmed')!
    session = gameSessionReducer(session, command(session, 1, 'vortox', 'change-vortox-c'))
    const demonC = activeSeat(session, 1).find((item) => item.roleId === 'vortox')!
    expect(new Set([original.id, demonA.id, snakeB.id, demonC.id]).size).toBe(4)
    expect(projected(session).queue.find((item) => item.id === original.id)?.progress).toBe('confirmed')
    expect(projected(session).queue.find((item) => item.id === demonA.id)?.progress).toBe('not_applicable')
    expect(projected(session).queue.find((item) => item.id === snakeB.id)?.progress).toBe('not_applicable')
    expect(projected(session).drafts[original.id]).toEqual(draft)
    expect(session.timeline.slice(0, timeline.length)).toEqual(timeline)
    expect(projectCurrentAssignments(session).find((entry) => entry.seatId === 1)?.role.id).toBe('vortox')
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('offers a first-night-only Chef information wake when gained on a later night, without replaying existing Chef history', () => {
    let session = informationSession('chef')
    session = gameSessionReducer(session, command(session, 4, 'savant', 'retire-original-chef', 'later'))
    session = nextNight(session)
    const before = structuredClone(session), firstRunId = Object.keys(session.nightRuns)[0]
    session = gameSessionReducer(session, command(session, 1, 'chef', 'new-chef-on-later-night'))
    expect(projected(session).nightType).toBe('other')
    const chef = activeSeat(session, 1).find((item) => item.roleId === 'chef')!
    expect(chef).toMatchObject({ targetCount: 0, progress: 'pending' })
    expect(chef.id).toContain('new-chef-on-later-night')
    expect(session.nightRuns[firstRunId]).toEqual(before.nightRuns[firstRunId])
    expect(projectCurrentPlayerStates(session)).toEqual(projectCurrentPlayerStates(before))
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('does not manufacture an every-night-star attack on the first night or a wake for a day-only role', () => {
    const first = opening(false, true)
    expect(changedRoleNightItems(first, 2, 'vortox', 'first-vortox')).toHaveLength(0)
    expect(gameSessionReducer(first, command(first, 2, 'vortox', 'first-vortox'))).toBe(first)
    const later = opening()
    expect(changedRoleNightItems(later, 2, 'artist', 'day-only-artist')).toHaveLength(0)
    expect(gameSessionReducer(later, command(later, 2, 'artist', 'day-only-artist'))).toBe(later)
    expect(gameSessionReducer(later, command(later, 2, 'artist', 'day-only-artist-later', 'later'))).not.toBe(later)
  })

  it('keeps manual alignment, life, poison, drunkenness and persistent markers unchanged', () => {
    let session = opening()
    const old = projectCurrentPlayerStates(session)[2]
    session = gameSessionReducer(session, { type: 'confirm-player-state-change', seatId: 2, expectedBefore: old,
      after: { ...old, poisoned: true, drunk: true, markers: [{ id: 'manual-alignment', label: '当前善良阵营' }, { id: 'old-duration', label: '持续效果待主持核对' }] },
      segmentId: null, entryId: 'persistent-state', confirmedAt: tick(), reason: '隔离确认既有状态。' })
    const beforeStates = projectCurrentPlayerStates(session), beforeInitial = structuredClone(session.initialPlayerStates)
    const after = gameSessionReducer(session, command(session, 2, 'vortox', 'good-demon-role-only'))
    expect(projectCurrentPlayerStates(after)).toEqual(beforeStates)
    expect(after.initialPlayerStates).toEqual(beforeInitial)
    expect(after.timeline.filter((entry) => entry.kind === 'player_state_changed')).toEqual(session.timeline.filter((entry) => entry.kind === 'player_state_changed'))
  })

  it('rejects stale, cross-script, invalid-seat, duplicate and privacy-shielded commands without a partial write', () => {
    const before = opening(), valid = command(before, 2, 'mathematician', 'guarded-change')
    const variants: Partial<Change>[] = [{ expectedRoleId: 'artist' }, { expectedContextKey: 'stale' }, { expectedRevision: -1 },
      { nightRunId: 'different-night' }, { seatId: 16 }, { roleId: 'imp' }, { id: '' }, { confirmedAt: 'invalid' }]
    for (const fields of variants) expect(gameSessionReducer(before, { ...valid, ...fields })).toBe(before)
    const shielded = actNight(before, { type: 'set-privacy', shielded: true })
    expect(gameSessionReducer(shielded, command(shielded, 2, 'mathematician', 'privacy-refused'))).toBe(shielded)
    const after = gameSessionReducer(before, valid)
    expect(gameSessionReducer(after, valid)).toBe(after)
    const freshDuplicate = { ...command(after, 2, 'artist', valid.id, 'later') }
    expect(gameSessionReducer(after, freshDuplicate)).toBe(after)
  })

  it('rejects closed nights and an in-progress diary correction', () => {
    let session = opening()
    const original = projected(session).queue.find((item) => item.roleId === 'snakecharmer')!
    session = focus(session, original.id)
    session = actNight(actNight(session, { type: 'target', seatId: 2 }), { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const correcting = actNight(session, { type: 'begin-correction' })
    expect(projected(correcting).correctionItemId).toBe(original.id)
    expect(gameSessionReducer(correcting, command(correcting, 2, 'mathematician', 'correction-refused'))).toBe(correcting)
    session = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: tick() })
    expect(session.phaseSegments.find((phase) => phase.id === session.nightRuns[session.activeNightRunId!].phaseSegmentId)?.closedAt).toBeTruthy()
    expect(gameSessionReducer(session, command(session, 2, 'mathematician', 'closed-refused'))).toBe(session)
  })

  it('orders same-millisecond changes by confirmation, keeps queue and projection aligned, and rejects backdating', () => {
    const before = opening(), first = command(before, 2, 'mathematician', 'z-earlier-change')
    const middle = gameSessionReducer(before, first)
    const second = { ...command(middle, 2, 'dreamer', 'a-later-change'), confirmedAt: first.confirmedAt }
    const after = gameSessionReducer(middle, second)
    const entries = after.timeline.filter((entry) => entry.id === first.id || entry.id === second.id)
    expect(entries).toHaveLength(2)
    expect(entries[1].createdAt > entries[0].createdAt).toBe(true)
    expect(projectCurrentAssignments(after).find((entry) => entry.seatId === 2)?.role.id).toBe('dreamer')
    expect(activeSeat(after, 2).map((item) => item.roleId)).toEqual(['dreamer'])
    expect(gameSessionReducer(after, { ...command(after, 2, 'artist', 'backdated-change', 'later'), confirmedAt: first.confirmedAt })).toBe(after)
    expect(parseSessionBackup(JSON.stringify(after))).toEqual(after)
  })

  it('lets an old current-night role-change record explicitly synchronize once without reopening old skill forms', () => {
    let session = opening()
    const oldItem = projected(session).queue.find((item) => item.seatId === 3 && item.roleId === 'dreamer')!
    session = focus(session, oldItem.id)
    session = actNight(session, { type: 'change-role', role: roleSnapshotsForScript(session.scriptId).find((role) => role.id === 'mathematician')!, reason: 'gameplay' })
    expect(projectCurrentAssignments(session).find((entry) => entry.seatId === 3)?.role.id).toBe('mathematician')
    expect(hasUnsyncedRoleChange(session, 3)).toBe(true)
    const timeline = structuredClone(session.timeline)
    session = gameSessionReducer(session, command(session, 3, 'mathematician', 'synchronize-legacy-change'))
    expect(hasUnsyncedRoleChange(session, 3)).toBe(false)
    expect(session.timeline.slice(0, timeline.length)).toEqual(timeline)
    expect(projected(session).queue.find((item) => item.id === oldItem.id)?.progress).toBe('not_applicable')
    expect(activeSeat(session, 3).map((item) => item.roleId)).toEqual(['mathematician'])
    expect(gameSessionReducer(session, command(session, 3, 'mathematician', 'duplicate-legacy-sync'))).toBe(session)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('rejects a direct commit of the old Demon skill even if the caller refreshes context and revision', () => {
    let session = opening()
    const oldDemon = projected(session).queue.find((item) => item.roleId === 'vortox')!
    session = focus(session, oldDemon.id)
    let local = projected(session)
    local = nightWorkbenchReducer(local, { at: '2026-10-19T00:00:00.000Z', type: 'target', seatId: 2 })
    local = nightWorkbenchReducer(local, { at: '2026-10-19T00:00:00.000Z', type: 'outcome', outcomeId: 'record' })
    local = nightWorkbenchReducer(local, { at: '2026-10-19T00:00:00.000Z', type: 'confirm', advance: false })
    expect(Object.values(local.confirmedRecords).flat()).toHaveLength(1)
    const after = gameSessionReducer(session, command(session, 12, 'snakecharmer', 'old-demon-stopped', 'later'))
    const staleCommit = createNightWorkbenchCommit(local, { session: after, dispatchSession: () => {} })
    expect(gameSessionReducer(after, staleCommit)).toBe(after)
  })

  it('keeps the source board night order as the timing reference rather than a global role order', () => {
    const before = opening(), after = gameSessionReducer(before, command(before, 2, 'mathematician', 'order-contract'))
    const ranks = new Map(getSmartScriptPack(before.scriptId).nightOrders.otherNight.map((entry) => [entry.roleId, entry.order]))
    const ordered = projected(after).queue.filter((item) => item.progress !== 'not_applicable').map((item) => ranks.get(item.roleId)!)
    expect(ordered).toEqual(ordered.toSorted((a, b) => a - b))
  })
})
