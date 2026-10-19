import { useReducer } from 'react'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession, createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { createNextNightRun } from '../game-session/state/createNextNightRun'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../game-session/state/projectors'
import { createNightWorkbenchCommit, sessionInitialNightState } from './state/gameSessionAdapter'
import { useNightWorkbench } from './state/useNightWorkbench'
import { nightWorkbenchReducer } from './state/nightWorkbenchReducer'
import { applyOutcome, emptyWakeDraft, outcomeReady } from './state/projectWakeDraft'
import { projectWakePlayerStatus } from './state/projectWakePlayerStatus'
import { getSmartScriptPack, roleSnapshotsForScript } from '../../domain/scripts'
import { createNightResultAdvice, createNightResultAdviceAsync } from '../../services/ai'
import { NightWorkbench } from './NightWorkbench'
import { canConfirmDraft } from './state/workbenchGuards'
import { parseSessionBackup } from '../../services/session/sessionBackup'

vi.mock('../../services/ai', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../services/ai')>(),
  createNightResultAdviceAsync: vi.fn(),
}))

function cleanActiveSession() {
  const session = createPrototypeGameSession()
  session.timeline = session.timeline.filter((entry) => entry.kind === 'setup_confirmed')
  const run = session.nightRuns[session.activeNightRunId!]
  run.queue = run.queue.map((item) => ({ ...item, progress: 'pending', status: { life: 'alive', impairments: [], markers: [] } }))
  const gambler = run.queue.find((item) => item.roleId === 'gambler')!
  run.activeCursorId = run.previewEntryId = gambler.id
  run.drafts = { [gambler.id]: applyOutcome(gambler, { ...emptyWakeDraft(), targets: [9], roleChoice: 'lunatic', draftRevision: 1 }, 'correct') }
  return session
}

describe('night core safety regression', () => {
  it('handles delayed AI on the latest state without overwriting a later target edit', () => {
    const { result } = renderHook(() => {
      const [session, dispatchSession] = useReducer(gameSessionReducer, cleanActiveSession())
      return useNightWorkbench({ session, dispatchSession })!
    })
    const staleDispatch = result.current.dispatch
    const oldAdvice = createNightResultAdvice({ state: result.current.state, item: result.current.current, draft: result.current.draft })!
    act(() => result.current.dispatch({ type: 'target', seatId: 4 }))
    expect(result.current.draft.targets).toEqual([4])
    act(() => staleDispatch({ type: 'apply-ai-advice', advice: oldAdvice }))
    expect(result.current.draft.targets).toEqual([4])
    expect(result.current.state.lastNotice).toContain('失效')
  })

  it('keeps confirmed records and cursor intact when an earlier AI request returns', () => {
    const { result } = renderHook(() => {
      const [session, dispatchSession] = useReducer(gameSessionReducer, cleanActiveSession())
      return useNightWorkbench({ session, dispatchSession })!
    })
    const staleDispatch = result.current.dispatch
    const originalId = result.current.current.id
    const oldAdvice = createNightResultAdvice({ state: result.current.state, item: result.current.current, draft: result.current.draft })!
    act(() => result.current.dispatch({ type: 'confirm', advance: true }))
    const confirmedCursor = result.current.state.activeCursorId
    expect(result.current.state.activeCursorId).not.toBe(originalId)
    expect(result.current.state.queue.find((item) => item.id === originalId)?.progress).toBe('confirmed')
    act(() => staleDispatch({ type: 'apply-ai-advice', advice: oldAdvice }))
    expect(result.current.state.activeCursorId).toBe(confirmedCursor)
    expect(result.current.state.queue.find((item) => item.id === originalId)?.progress).toBe('confirmed')
    expect(result.current.state.confirmedRecords[originalId]).toHaveLength(1)
    expect(result.current.canConfirm).toBe(false)
  })

  it('lets the storyteller continue during AI generation and ignores the delayed response after confirmation', async () => {
    let finish: (() => void) | undefined
    let initialRevision: number | undefined
    vi.mocked(createNightResultAdviceAsync).mockImplementation((input) => new Promise((resolve) => {
      initialRevision = input.state.revision
      finish = () => resolve(createNightResultAdvice(input))
    }))
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, cleanActiveSession())
      return <><NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
        <output aria-label="audit-current-run">{JSON.stringify(session.nightRuns[session.activeNightRunId!])}</output></>
    }
    render(<Harness />)
    const read = () => JSON.parse(screen.getByLabelText('audit-current-run').textContent!)
    const originalId = read().activeCursorId
    await userEvent.click(screen.getByRole('button', { name: 'AI推荐' }))
    expect(screen.getByRole('button', { name: 'AI推荐中' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '选择4号玩家' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '确认并下一位' })).toBeEnabled()
    await userEvent.click(screen.getByRole('button', { name: '确认并下一位' }))
    expect(read().activeCursorId).not.toBe(originalId)
    const confirmedCursor = read().activeCursorId
    expect(read().revision).toBeGreaterThan(initialRevision!)
    await act(async () => finish!())
    await waitFor(() => expect(read().activeCursorId).toBe(confirmedCursor))
    expect(read().queue.find((item: { id: string }) => item.id === originalId).progress).toBe('confirmed')
    expect(screen.getByRole('button', { name: '确认并下一位' })).toBeDisabled()
  })

  it('uses the actual Catfishing first-night sheet while retaining the role-specific interaction', () => {
    const session = cleanActiveSession()
    session.phaseSegments = []
    session.nightRuns = {}
    session.activeNightRunId = null
    const setup = session.timeline.find((entry) => entry.kind === 'setup_confirmed')!
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture')
    setup.setup.draft.assignments[1].role = roleSnapshotsForScript('catfishing').find((role) => role.id === 'chef')!
    const run = createNextNightRun(session)!
    expect(run.nightType).toBe('first')
    expect(run.queue.some((item) => item.roleId === 'gambler')).toBe(false)
    expect(run.queue.some((item) => item.roleId === 'fanggu')).toBe(false)
    expect(run.queue.some((item) => item.roleId === 'chef')).toBe(true)
    const inPlay = new Set(projectCurrentAssignments(session).map((assignment) => assignment.role.id))
    expect(run.queue.map((item) => item.roleId)).toEqual(getSmartScriptPack('catfishing').nightOrders.firstNight.filter((entry) => inPlay.has(entry.roleId)).map((entry) => entry.roleId))
    expect(run.queue.find((item) => item.roleId === 'cerenovus')?.outcomeOptions.map((option) => option.id)).toContain('applied')
  })

  it('does not reveal a Gambler result, including private text left by a legacy save', () => {
    const initial = cleanActiveSession()
    const run = initial.nightRuns[initial.activeNightRunId!]
    run.drafts[run.activeCursorId].informationGiven = '猜测正确。'
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, initial)
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    expect(screen.queryByRole('button', { name: '展示信息' })).not.toBeInTheDocument()
    expect(screen.queryByText('告知玩家')).not.toBeInTheDocument()
    const item = run.queue.find((entry) => entry.roleId === 'gambler')!
    expect(applyOutcome(item, run.drafts[item.id], 'correct').informationGiven).toBe('')
    expect(applyOutcome(item, run.drafts[item.id], 'wrong').informationGiven).toBe('')
    expect(run.drafts[item.id].informationGiven).toBe('猜测正确。')
  })

  it('projects current poison into the actor context and invalidates the earlier healthy advice', () => {
    const session = cleanActiveSession()
    const beforeState = sessionInitialNightState({ session, dispatchSession: () => {} })!
    const item = beforeState.queue.find((entry) => entry.roleId === 'gambler')!
    const draft = { ...beforeState.drafts[item.id], roleChoice: 'balloonist' }
    const beforeAdvice = createNightResultAdvice({ state: beforeState, item, draft })!
    expect(beforeAdvice.recommendedOutcomeId).toBe('wrong')
    const before = projectCurrentPlayerStates(session)[6]
    const changed = gameSessionReducer(session, {
      type: 'confirm-player-state-change', seatId: 6, expectedBefore: before, after: { ...before, poisoned: true },
      segmentId: null, entryId: 'audit-poison', confirmedAt: '2026-10-16T00:00:00.000Z', reason: '当夜毒醉核对',
    })
    const state = sessionInitialNightState({ session: changed, dispatchSession: () => {} })!
    const current = state.queue.find((entry) => entry.roleId === 'gambler')!
    expect(projectWakePlayerStatus(changed, current).impairments).toContain('poisoned')
    expect(current.status.impairments).toContain('poisoned')
    expect(state.revision).toBe(beforeState.revision)
    expect(state.contextKey).not.toBe(beforeState.contextKey)
    state.drafts[current.id] = draft
    const next = nightWorkbenchReducer(state, { type: 'apply-ai-advice', advice: beforeAdvice })
    expect(next.drafts[current.id]).toEqual(draft)
    expect(next.lastNotice).toContain('失效')
    expect(createNightResultAdvice({ state, item: current, draft })?.recommendedOutcomeId).toBe('no-effect')
  })

  it('records a Philosopher no-action choice without inventing an ability or target', () => {
    const session = cleanActiveSession()
    const item = session.nightRuns[session.activeNightRunId!].queue.find((entry) => entry.roleId === 'philosopher')!
    const hold = item.outcomeOptions.find((entry) => entry.id === 'hold')!
    expect(hold.requiredInputs).toEqual([])
    expect(outcomeReady(hold, item, emptyWakeDraft())).toBe(true)
    expect(outcomeReady(hold, item, { ...emptyWakeDraft(), roleChoice: item.roleChoices![0].id })).toBe(true)
    const applied = applyOutcome(item, { ...emptyWakeDraft(), roleChoice: item.roleChoices![0].id }, hold.id)
    expect(applied.roleChoice).toBe('')
    expect(applied.targets).toEqual([])
    expect(applied.playerChoice).toBe('')
  })

  it('does not let preview applicability controls change another player', async () => {
    const initial = cleanActiveSession()
    const run = initial.nightRuns[initial.activeNightRunId!]
    const preview = run.queue.find((item) => item.roleId === 'snakecharmer')!
    preview.applicability = 'needs_review'
    preview.status.life = 'dead'
    run.previewEntryId = preview.id
    const activeId = run.activeCursorId
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, initial)
      return <><NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
        <output aria-label="audit-preview-run">{JSON.stringify(session.nightRuns[session.activeNightRunId!])}</output></>
    }
    render(<Harness />)
    const read = () => JSON.parse(screen.getByLabelText('audit-preview-run').textContent!)
    expect(screen.getByRole('button', { name: '不适用' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: '不适用' }))
    expect(read().queue.find((item: { id: string }) => item.id === activeId).progress).toBe('pending')
    expect(read().queue.find((item: { id: string }) => item.id === preview.id).applicability).toBe('needs_review')
    const state = sessionInitialNightState({ session: initial, dispatchSession: () => {} })!
    expect(nightWorkbenchReducer(state, { type: 'resolve-applicability', value: 'not_applicable' })).toBe(state)
  })

  it('records all three Al-Hadikhia targets in their chosen order', () => {
    const pack = getSmartScriptPack('wang-bu-jian-wang')
    const session = createSmartScriptSetupSession(pack.scriptId, '2026-10-16T00:00:00.000Z', { playerCount: 12 })
    const prototypeSetup = cleanActiveSession().timeline[0]
    if (prototypeSetup.kind !== 'setup_confirmed') throw new Error('fixture')
    const setup = structuredClone(prototypeSetup)
    const template = pack.setupTemplates.find((entry) => entry.playerCount === 12 && entry.roles.includes('alhadikhia'))!
    const roles = roleSnapshotsForScript(pack.scriptId)
    setup.setup.draft.assignments = template.roles.map((id, index) => ({ seatId: index + 1, role: roles.find((role) => role.id === id)! }))
    session.timeline = [setup]
    session.phaseSegments = [{ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: '2026-10-15T00:00:00Z', closedAt: '2026-10-15T00:01:00Z' }]
    const run = createNextNightRun(session)!
    const item = run.queue.find((entry) => entry.roleId === 'alhadikhia')!
    expect(item.targetCount).toBe(3)
    run.activeCursorId = run.previewEntryId = item.id
    session.nightRuns = { [run.id]: run }; session.activeNightRunId = run.id
    item.targetCount = 2
    const legacy = JSON.stringify(session)
    let state = sessionInitialNightState({ session, dispatchSession: () => {} })!
    expect(state.queue.find((entry) => entry.id === item.id)?.targetCount).toBe(3)
    expect(JSON.stringify(session)).toBe(legacy)
    for (const seatId of [1, 2, 3]) state = nightWorkbenchReducer(state, { type: 'target', seatId })
    expect(state.drafts[item.id].targets).toEqual([1, 2, 3])
  })

  it('uses the same sequence for night type, queue and phase after opening day 1 first', () => {
    const session = createSmartScriptSetupSession('trouble-brewing', '2026-10-16T00:00:00Z', { playerCount: 12 })
    const setup = structuredClone(cleanActiveSession().timeline[0])
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture')
    const roles = roleSnapshotsForScript('trouble-brewing')
    setup.setup.draft.assignments = ['washerwoman', 'librarian', 'investigator', 'chef', 'empath', 'fortuneteller', 'undertaker', 'drunk', 'butler', 'poisoner', 'scarletwoman', 'imp'].map((id, index) => ({ seatId: index + 1, role: roles.find((role) => role.id === id)! }))
    session.timeline = [setup]
    const day = gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: '2026-10-16T00:01:00Z' })
    const next = gameSessionReducer(day, { type: 'start-next-night-run' })
    const opened = gameSessionReducer(next, { type: 'open-phase-segment', phaseKind: 'night', createdAt: '2026-10-16T00:02:00Z' })
    const run = opened.nightRuns[opened.activeNightRunId!]!
    expect(run.nightType).toBe('other')
    expect(opened.phaseSegments.find((segment) => segment.id === run.phaseSegmentId)?.label).toBe('第2夜')
    expect(run.queue.some((item) => item.roleId === 'washerwoman')).toBe(false)
    expect(run.queue.some((item) => item.roleId === 'imp')).toBe(true)
  })

  it('rejects a stale complete-run commit at the session boundary, including a status-only context change', () => {
    const session = cleanActiveSession()
    const binding = { session, dispatchSession: () => {} }
    const projected = sessionInitialNightState(binding)!
    const oldCommit = createNightWorkbenchCommit(nightWorkbenchReducer(projected, { type: 'target', seatId: 4 }), binding)
    const edited = gameSessionReducer(session, { type: 'night-workbench-action', nightRunId: projected.nightRunId, expectedWakeItemId: projected.previewEntryId, expectedActiveCursorId: projected.activeCursorId, action: { type: 'target', seatId: 3 } })
    expect(gameSessionReducer(edited, oldCommit)).toBe(edited)
    const before = projectCurrentPlayerStates(session)[6]
    const poisoned = gameSessionReducer(session, {
      type: 'confirm-player-state-change', seatId: 6, expectedBefore: before,
      after: { ...before, poisoned: true }, segmentId: null,
      entryId: 'night-commit-context-change', confirmedAt: '2026-10-16T00:00:00Z', reason: '当夜中毒',
    })
    expect(poisoned.nightRuns[projected.nightRunId].revision).toBe(session.nightRuns[projected.nightRunId].revision)
    expect(gameSessionReducer(poisoned, oldCommit)).toBe(poisoned)
    const anotherSession = { ...session, id: `${session.id}-new-game` }
    expect(gameSessionReducer(anotherSession, oldCommit)).toBe(anotherSession)
    const newContext = sessionInitialNightState({ session: anotherSession, dispatchSession: () => {} })!
    const oldAdvice = createNightResultAdvice({ state: projected, item: projected.queue.find((entry) => entry.id === projected.activeCursorId)!, draft: projected.drafts[projected.activeCursorId] })!
    expect(nightWorkbenchReducer(newContext, { type: 'apply-ai-advice', advice: oldAdvice }).lastNotice).toContain('失效')
  })

  it('keeps an adopted AI draft but requires a new storyteller choice after the authoritative context changes', () => {
    const session = cleanActiveSession()
    const initial = sessionInitialNightState({ session, dispatchSession: () => {} })!
    const item = initial.queue.find((entry) => entry.id === initial.activeCursorId)!
    const advice = createNightResultAdvice({ state: initial, item, draft: initial.drafts[item.id] })!
    const adopted = gameSessionReducer(session, { type: 'night-workbench-action', nightRunId: initial.nightRunId, expectedWakeItemId: item.id, expectedActiveCursorId: item.id, action: { type: 'apply-ai-advice', advice } })
    const ready = sessionInitialNightState({ session: adopted, dispatchSession: () => {} })!
    expect(canConfirmDraft(ready, ready.queue.find((entry) => entry.id === item.id)!, ready.drafts[item.id])).toBe(true)
    expect(adopted.nightRuns[initial.nightRunId]).not.toHaveProperty('contextKey')
    expect(parseSessionBackup(JSON.stringify(adopted))).toEqual(adopted)
    const before = projectCurrentPlayerStates(adopted)[6]
    const changed = gameSessionReducer(adopted, {
      type: 'confirm-player-state-change', seatId: 6, expectedBefore: before, after: { ...before, drunk: true },
      segmentId: null, entryId: 'night-adopted-draft-context', confirmedAt: '2026-10-16T00:00:00Z', reason: '当前醉酒',
    })
    const stale = sessionInitialNightState({ session: changed, dispatchSession: () => {} })!
    expect(stale.drafts[item.id]).toEqual(ready.drafts[item.id])
    expect(canConfirmDraft(stale, stale.queue.find((entry) => entry.id === item.id)!, stale.drafts[item.id])).toBe(false)
    const unconfirmed = gameSessionReducer(changed, { type: 'night-workbench-action', nightRunId: initial.nightRunId, expectedWakeItemId: item.id, expectedActiveCursorId: item.id, action: { type: 'confirm', advance: true } })
    expect(unconfirmed.timeline).toBe(changed.timeline)
    expect(unconfirmed.nightRuns[initial.nightRunId].activeCursorId).toBe(item.id)
    const manual = gameSessionReducer(unconfirmed, { type: 'night-workbench-action', nightRunId: initial.nightRunId, expectedWakeItemId: item.id, expectedActiveCursorId: item.id, action: { type: 'outcome', outcomeId: 'no-effect' } })
    const manualState = sessionInitialNightState({ session: manual, dispatchSession: () => {} })!
    expect(manualState.drafts[item.id].outputSource).toMatchObject({ kind: 'preset', modifiedFromAI: { adviceId: advice.adviceId } })
    expect(canConfirmDraft(manualState, manualState.queue.find((entry) => entry.id === item.id)!, manualState.drafts[item.id])).toBe(true)
    const confirmed = gameSessionReducer(manual, { type: 'night-workbench-action', nightRunId: initial.nightRunId, expectedWakeItemId: item.id, expectedActiveCursorId: item.id, action: { type: 'confirm', advance: false } })
    expect(confirmed.timeline).toHaveLength(changed.timeline.length + 1)
    expect(parseSessionBackup(JSON.stringify(confirmed))).toEqual(confirmed)
  })

  it('does not rebuild an existing night or accept delayed workbench actions after closure', () => {
    const session = cleanActiveSession()
    const before = JSON.stringify(session)
    expect(gameSessionReducer(session, { type: 'start-next-night-run' })).toBe(session)
    expect(JSON.stringify(session)).toBe(before)
    const closed = gameSessionReducer(session, { type: 'close-active-night-run', nightRunId: session.activeNightRunId!, closedAt: '2026-10-16T00:00:00Z' })
    const run = session.nightRuns[session.activeNightRunId!]
    expect(gameSessionReducer(closed, { type: 'night-workbench-action', nightRunId: run.id, expectedWakeItemId: run.previewEntryId, expectedActiveCursorId: run.activeCursorId, action: { type: 'target', seatId: 4 } })).toBe(closed)
  })
})


