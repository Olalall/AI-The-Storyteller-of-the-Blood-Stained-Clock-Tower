import { useReducer } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getSmartScriptPack, roleSnapshotsForScript } from '../../domain/scripts'
import { createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { projectCurrentAssignments } from '../game-session/state/projectors'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate, replaceDraftRole } from '../setup/setupDraft'
import { SetupPanel } from '../setup/SetupPanel'
import { IdentityDealSheet } from './IdentityDealSheet'
import { identityRoleChoices, playerFacingIdentity, receiptMatchesCurrentIdentity } from './identityProjection'
import { parseSessionBackup } from '../../services/session/sessionBackup'

const at = '2026-10-16T00:00:00Z'
const profiles = Array.from({ length: 12 }, (_, index) => ({ seatId: index + 1, experience: 'regular' as const }))
function fixture(scriptId: string, roleId?: string) {
  const candidate = createSmartScriptSetupCandidates(scriptId, profiles, { seed: 'core-identity', count: 100 }).find((item) => !roleId || item.assignments.some((assignment) => assignment.role.id === roleId))!
  expect(candidate).toBeTruthy()
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: 12, seats: profiles })
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
  return gameSessionReducer(session, { type: 'confirm-setup', id: 'core-setup', confirmedAt: at })
}

describe('core setup and private identity regressions', () => {
  beforeEach(() => localStorage.clear())

  it('uses current confirmed assignments after a pre-deal adjustment, and invalidates the old receipt', () => {
    let session = fixture('trouble-brewing')
    const [first, second] = projectCurrentAssignments(session)
    session = gameSessionReducer(session, { type: 'append-setup-change', id: 'swap-first', createdAt: '2026-10-16T00:10:00Z', seatId: first.seatId, fromRole: first.role, toRole: second.role, reason: '发身份前交换' })
    expect(receiptMatchesCurrentIdentity(session, first.seatId, '2026-10-16T00:05:00Z')).toBe(false)
    expect(receiptMatchesCurrentIdentity(session, first.seatId, '2026-10-16T00:15:00Z')).toBe(true)
    render(<IdentityDealSheet open onOpenChange={() => undefined} session={session} />)
    fireEvent.click(screen.getByRole('button', { name: '打开单人展示' }))
    const privateView = screen.getByLabelText('1号单人身份展示')
    fireEvent.click(within(privateView).getByRole('button', { name: '显示身份' }))
    expect(within(privateView).getByText(second.role.name)).toBeInTheDocument()
    expect(within(privateView).queryByText(first.role.name)).not.toBeInTheDocument()
  })

  it.each(['drunk', 'lunatic', 'marionette'])('does not invent or reveal a %s identity without storyteller confirmation', (roleId) => {
    const script = roleId === 'marionette' ? 'lunar-eclipse' : 'catfishing'
    const session = fixture(script, roleId)
    const assignments = projectCurrentAssignments(session)
    const actor = assignments.find((item) => item.role.id === roleId)!
    expect(playerFacingIdentity(session, actor.seatId).role).toBeNull()
    const shown = identityRoleChoices(script, roleId, assignments)[0]
    expect(shown).toBeTruthy()
    const confirmed = gameSessionReducer(session, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: roleId, shownRoleId: shown.id, confirmedAt: at })
    expect(projectCurrentAssignments(confirmed)).toEqual(assignments)
    const restored = parseSessionBackup(JSON.stringify(confirmed))
    expect(playerFacingIdentity(restored, actor.seatId).role?.id).toBe(shown.id)
    const stale = gameSessionReducer(confirmed, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: 'wrong-role', shownRoleId: shown.id, confirmedAt: at })
    expect(stale).toBe(confirmed)
    const invalid = gameSessionReducer(confirmed, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: roleId, shownRoleId: roleId, confirmedAt: at })
    expect(invalid).toBe(confirmed)
  })

  it('requires confirming the Marionette shown role before the private view can open', () => {
    const initial = fixture('lunar-eclipse', 'marionette')
    const seat = projectCurrentAssignments(initial).find((item) => item.role.id === 'marionette')!
    const shown = identityRoleChoices(initial.scriptId, 'marionette', projectCurrentAssignments(initial))[0]
    function Harness() {
      const [session, dispatch] = useReducer(gameSessionReducer, initial)
      return <IdentityDealSheet open onOpenChange={() => undefined} session={session} dispatch={dispatch} />
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${seat.seatId}号 `) }))
    expect(screen.getByRole('button', { name: '打开单人展示' })).toBeDisabled()
    fireEvent.change(screen.getByLabelText(`${seat.seatId}号对外身份`), { target: { value: shown.id } })
    fireEvent.click(screen.getByRole('button', { name: '确认对外身份' }))
    fireEvent.click(screen.getByRole('button', { name: '打开单人展示' }))
    const privateView = screen.getByLabelText(`${seat.seatId}号单人身份展示`)
    fireEvent.click(within(privateView).getByRole('button', { name: '显示身份' }))
    expect(within(privateView).getByText(shown.name)).toBeInTheDocument()
    expect(within(privateView).queryByText(seat.role.name)).not.toBeInTheDocument()
  })

  it('keeps a confirmed shown identity when a different seat later becomes that character', () => {
    let session = fixture('catfishing', 'drunk')
    const assignments = projectCurrentAssignments(session)
    const actor = assignments.find((item) => item.role.id === 'drunk')!
    const other = assignments.find((item) => item.seatId !== actor.seatId)!
    const shown = identityRoleChoices(session.scriptId, 'drunk', assignments)[0]
    session = gameSessionReducer(session, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: 'drunk', shownRoleId: shown.id, confirmedAt: at })
    session = gameSessionReducer(session, { type: 'append-setup-change', id: 'other-becomes-shown', createdAt: '2026-10-16T00:10:00Z', seatId: other.seatId, fromRole: other.role, toRole: shown, reason: '其他玩家角色变化' })
    expect(playerFacingIdentity(session, actor.seatId).role?.id).toBe(shown.id)
    expect(receiptMatchesCurrentIdentity(session, actor.seatId, '2026-10-16T00:05:00Z')).toBe(true)
  })

  it('requires a new shown identity confirmation after the actual role changes away and returns', () => {
    let session = fixture('catfishing', 'drunk')
    const assignments = projectCurrentAssignments(session)
    const actor = assignments.find((item) => item.role.id === 'drunk')!
    const other = assignments.find((item) => item.seatId !== actor.seatId)!
    const shown = identityRoleChoices(session.scriptId, 'drunk', assignments)[0]
    session = gameSessionReducer(session, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: 'drunk', shownRoleId: shown.id, confirmedAt: at })
    session = gameSessionReducer(session, { type: 'append-setup-change', id: 'away', createdAt: '2026-10-16T00:10:00Z', seatId: actor.seatId, fromRole: actor.role, toRole: other.role, reason: '变更身份' })
    session = gameSessionReducer(session, { type: 'append-setup-change', id: 'back', createdAt: '2026-10-16T00:20:00Z', seatId: actor.seatId, fromRole: other.role, toRole: actor.role, reason: '恢复身份' })
    expect(playerFacingIdentity(session, actor.seatId).role).toBeNull()
    expect(receiptMatchesCurrentIdentity(session, actor.seatId, '2026-10-16T00:05:00Z')).toBe(false)
    session = gameSessionReducer(session, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: 'drunk', shownRoleId: shown.id, confirmedAt: '2026-10-16T00:25:00Z' })
    expect(playerFacingIdentity(session, actor.seatId).role?.id).toBe(shown.id)
  })

  it('allows a Marionette to be shown a legal unused Outsider, while the Drunk still requires a Townsfolk', () => {
    const session = fixture('lunar-eclipse', 'marionette')
    const assignments = projectCurrentAssignments(session)
    const actor = assignments.find((item) => item.role.id === 'marionette')!
    const outsiders = new Set(getSmartScriptPack(session.scriptId).roles.filter((role) => role.team === 'outsider').map((role) => role.id))
    const shown = identityRoleChoices(session.scriptId, 'marionette', assignments).find((role) => outsiders.has(role.id))!
    expect(shown).toBeTruthy()
    const confirmed = gameSessionReducer(session, { type: 'confirm-identity-presentation', seatId: actor.seatId, actualRoleId: 'marionette', shownRoleId: shown.id, confirmedAt: at })
    expect(playerFacingIdentity(confirmed, actor.seatId).role?.id).toBe(shown.id)
    expect(identityRoleChoices(session.scriptId, 'drunk', assignments).some((role) => outsiders.has(role.id))).toBe(false)
  })

  it('does not apply a removed Baron setup modifier before the first confirmation', () => {
    const initial = fixture('trouble-brewing', 'baron')
    const setup = initial.timeline.find((entry) => entry.kind === 'setup_confirmed')!
    if (setup.kind !== 'setup_confirmed') throw new Error('fixture')
    const draft = setup.setup.draft
    const baron = draft.assignments.find((item) => item.role.id === 'baron')!
    const inPlay = new Set(draft.assignments.map((item) => item.role.id))
    const minions = new Set(getSmartScriptPack('trouble-brewing').roles.filter((role) => role.team === 'minion').map((role) => role.id))
    const replacement = roleSnapshotsForScript('trouble-brewing').find((role) => minions.has(role.id) && !inPlay.has(role.id))!
    const changed = replaceDraftRole(draft, baron.seatId, replacement, at)
    const report = evaluateSmartScriptSetup('trouble-brewing', changed.assignments, changed.demonBluffs, profiles.map((seat) => seat.seatId), changed.setupRuleSelections)
    expect(report.actualCounts.outsider).toBe(4)
    expect(report.expectedCounts?.outsider).toBe(2)
    expect(report.checks.some((check) => check.status === 'fail')).toBe(true)
    expect(report.activeSelections.some((selection) => selection.ruleId.includes('baron'))).toBe(false)
    expect(draft.assignments.some((item) => item.role.id === 'baron')).toBe(true)
    const postSetup = evaluateSmartScriptSetup('trouble-brewing', changed.assignments, changed.demonBluffs, profiles.map((seat) => seat.seatId), changed.setupRuleSelections, changed.repeatableRoleIds, draft.assignments.map((assignment) => assignment.role.id))
    expect(postSetup.expectedCounts?.outsider).toBe(4)
    expect(postSetup.checks.some((check) => check.status === 'fail')).toBe(false)
  })

  it('makes already confirmed demon bluffs explicitly read-only instead of silently discarding edits', () => {
    const session = fixture('trouble-brewing')
    const dispatch = vi.fn()
    render(<SetupPanel open session={session} dispatch={dispatch} onOpenChange={() => undefined} setupScriptId={session.scriptId} onSetupScriptChange={() => undefined} />)
    expect(screen.getAllByRole('combobox')).toHaveLength(3)
    for (const selector of screen.getAllByRole('combobox')) expect(selector).toBeDisabled()
    expect(screen.getByText('伪装已保存在开局记录中；本局调整不再修改这份已确认信息。')).toBeInTheDocument()
  })
})
