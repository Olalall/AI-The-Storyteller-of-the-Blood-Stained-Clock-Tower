import { describe, expect, it } from 'vitest'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { emptyWakeDraft } from './projectWakeDraft'
import { canConfirmDraft } from './workbenchGuards'
import { actNight, projected } from './nightInformation.test-support'
import { cardinalitySession, nextCardinalityNight } from './nightCardinality.test-support'

function current(session: ReturnType<typeof cardinalitySession>) {
  const state = projected(session), item = state.queue.find((entry) => entry.id === state.activeCursorId)!
  return { state, item, draft: state.drafts[item.id] ?? emptyWakeDraft() }
}

describe('Po confirmed history controls the actual session contract', () => {
  it('allows only zero or one target on a known first action and cannot record a charge with a target', () => {
    let session = cardinalitySession('bad-moon-rising', 'po', 8, true)
    expect(current(session).item.historicalContext?.status).toBe('clear')
    expect(current(session).item.allowedTargetCounts).toEqual([0, 1])
    session = actNight(session, { type: 'target-count-choice', count: 3 })
    expect(current(session).draft.targetCountChoice).toBeUndefined()
    session = actNight(session, { type: 'target-count-choice', count: 1 })
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-charge' })
    expect(current(session).draft.outcomeId).toBe('')
    session = actNight(session, { type: 'outcome', outcomeId: 'po-attack' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
  })

  it.each(['po-charge', 'record'])('confirmed %s zero choice requires three ordered targets on the next night, then consumes the charge', (outcomeId) => {
    let session = cardinalitySession('bad-moon-rising', 'po', 8, true)
    const authority = projectCurrentPlayerStates(session)
    session = actNight(session, { type: 'target-count-choice', count: 0 })
    session = actNight(session, { type: 'outcome', outcomeId })
    session = actNight(session, { type: 'confirm', advance: false })
    const charge = session.timeline.filter((entry) => entry.kind === 'night_action').at(-1)!
    expect(charge.record.snapshot).toMatchObject({ outcomeId, targetCountChoice: 0, targets: [] })
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    session = nextCardinalityNight(session, 'po')
    expect(current(session).item.historicalContext?.status).toBe('ready')
    expect(current(session).item).toMatchObject({ targetCount: 3, minimumTargetCount: 3, aiAdviceEnabled: false })
    expect(current(session).item.allowedTargetCounts).toBeUndefined()
    expect(current(session).item.outcomeOptions.map((option) => option.id)).toEqual(['po-rampage'])
    const timeline = structuredClone(session.timeline)
    for (const count of [0, 1]) session = actNight(session, { type: 'target-count-choice', count })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-charge' })
    expect(current(session).draft.outcomeId).toBe('')
    for (const seatId of [3, 1]) session = actNight(session, { type: 'target', seatId })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-rampage' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(false)
    session = actNight(session, { type: 'target', seatId: 2 })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-rampage' })
    expect(canConfirmDraft(current(session).state, current(session).item, current(session).draft)).toBe(true)
    expect(session.timeline).toEqual(timeline)
    expect(current(session).draft.targets).toEqual([3, 1, 2])
    session = actNight(session, { type: 'confirm', advance: false })
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    expect(projectCurrentPlayerStates(session)).toEqual(authority)
    expect(session.timeline.find((entry) => entry.id === charge.id)).toEqual(charge)
    session = nextCardinalityNight(session, 'po')
    expect(current(session).item.historicalContext?.status).toBe('clear')
    expect(current(session).item.allowedTargetCounts).toEqual([0, 1])
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('leaves missing history for explicit host verification and does not infer charge from a skipped night', () => {
    const session = nextCardinalityNight(cardinalitySession('bad-moon-rising', 'po', 8, true), 'po')
    expect(current(session).item.historicalContext?.status).toBe('missing')
    expect(current(session).item.allowedTargetCounts).toEqual([0, 1, 3])
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('discards a stale zero mode only from an unconfirmed legacy charged draft, preserving its original history', () => {
    let session = cardinalitySession('bad-moon-rising', 'po', 8, true)
    session = actNight(session, { type: 'target-count-choice', count: 0 })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const charge = structuredClone(session.timeline.filter((entry) => entry.kind === 'night_action').at(-1)!)
    session = nextCardinalityNight(session, 'po')
    const run = session.nightRuns[session.activeNightRunId!]
    const item = run.queue.find((entry) => entry.roleId === 'po')!
    Object.assign(item, { targetCount: 1, minimumTargetCount: 0, allowedTargetCounts: [0, 1, 3] })
    item.outcomeOptions.push({ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}记录：{targets}。' })
    run.drafts[item.id] = {
      ...emptyWakeDraft(), targetCountChoice: 0, outcomeId: 'record', storytellerResult: '旧的待确认零人结果',
      outputSource: { kind: 'preset', templateId: 'record', specVersion: item.interactionVersion },
    }
    session = parseSessionBackup(JSON.stringify(session))
    const original = structuredClone(session)
    expect(current(session).draft).toMatchObject({ targets: [], outcomeId: '', storytellerResult: '' })
    expect(current(session).draft.targetCountChoice).toBeUndefined()
    expect(session).toEqual(original)
    for (const seatId of [3, 1, 2]) session = actNight(session, { type: 'target', seatId })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-rampage' })
    session = actNight(session, { type: 'confirm', advance: false })
    expect(session.timeline.filter((entry) => entry.kind === 'night_action').at(-1)!.record.snapshot.targetCountChoice).toBeUndefined()
    expect(session.timeline.find((entry) => entry.id === charge.id)).toEqual(charge)
    session = nextCardinalityNight(session, 'po')
    expect(current(session).item.historicalContext?.status).toBe('clear')
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })

  it('an explicit no-action record does not create or consume a charge', () => {
    let session = cardinalitySession('bad-moon-rising', 'po', 8, true)
    session = actNight(session, { type: 'target-count-choice', count: 0 })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-no-action' })
    session = actNight(session, { type: 'confirm', advance: false })
    session = nextCardinalityNight(session, 'po')
    expect(current(session).item.historicalContext?.status).toBe('missing')
    session = actNight(session, { type: 'target-count-choice', count: 0 })
    session = actNight(session, { type: 'outcome', outcomeId: 'po-charge' })
    session = actNight(session, { type: 'confirm', advance: false })
    session = nextCardinalityNight(session, 'po')
    expect(current(session).item.historicalContext?.status).toBe('ready')
    session = nextCardinalityNight(session, 'po')
    expect(current(session).item.historicalContext?.status).toBe('ready')
    expect(current(session).item.allowedTargetCounts).toBeUndefined()
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })
})
