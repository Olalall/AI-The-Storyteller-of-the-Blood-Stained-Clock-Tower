import { describe, expect, it } from 'vitest'
import { cardinalitySession, nextCardinalityNight } from '../../night-workbench/state/nightCardinality.test-support'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { gameSessionReducer } from './sessionReducer'
import { projectAbilityGrants } from './abilityChanges'
import { projectCurrentAssignments } from './projectors'
import type { GameSessionAction } from './sessionActions'
import type { GameSessionState } from '../types'
import { parseSessionBackup } from '../../../services/session/sessionBackup'

type Change = Extract<GameSessionAction, { type: 'confirm-ability-change' }>
function grant(session: GameSessionState, roleId: string | null, overrides: Partial<Change> = {}) {
  const actor = projectCurrentAssignments(session).find(a => a.role.id === 'philosopher')!
  return gameSessionReducer(session, { type: 'confirm-ability-change', sourceSeatId: actor.seatId, sourceRoleId: actor.role.id,
    seatId: actor.seatId, expectedRoleId: actor.role.id, roleId, timing: 'tonight', reason: '主持核对能力有效、发动时点与持续效果。',
    expectedContextKey: nightContextKey(session), confirmedAt: new Date().toISOString(), id: `grant-${session.timeline.length}`, ...overrides })
}
function abilityItem(session: GameSessionState, roleId = 'fortuneteller') { return projected(session).queue.find(item => item.roleId === roleId && item.abilitySource) }

describe('confirmed gained abilities retain identity and join production night queues', () => {
  it('Philosopher gains Fortune Teller in the audited board, can record tonight, and retains it next night', () => {
    let session = cardinalitySession('chou-shen-na-ji', 'philosopher', 13)
    const original = structuredClone(projectCurrentAssignments(session)), timeline = structuredClone(session.timeline)
    session = grant(session, 'fortuneteller')
    expect(projectAbilityGrants(session)).toHaveLength(1)
    expect(projectCurrentAssignments(session)).toEqual(original)
    expect(session.timeline.slice(0, timeline.length)).toEqual(timeline)
    const item = abilityItem(session)!
    expect(item).toBeDefined()
    expect(item.abilitySource?.actorRole.id).toBe('philosopher')
    const firstQueue=projected(session).queue
    expect(firstQueue.findIndex(i=>i.roleId==='system-demon-info')).toBeLessThan(firstQueue.findIndex(i=>i.id===item.id))
    expect(firstQueue.findIndex(i=>i.roleId==='washerwoman')).toBeLessThan(firstQueue.findIndex(i=>i.id===item.id))
    session = actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'target', seatId: 2 })
    session = actNight(session, { type: 'outcome', outcomeId: 'yes' })
    session = actNight(session, { type: 'confirm', advance: true })
    expect(session.timeline.some(e => e.kind === 'night_action' && e.wakeItemId === item.id)).toBe(true)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    session = nextCardinalityNight(session, 'fortuneteller')
    expect(abilityItem(session)).toBeDefined()
    expect(projected(session).queue.filter(i => i.roleId === 'philosopher').every(i => i.applicability === 'not_applicable')).toBe(true)
  })
  it('first-night-only gained information runs once, while revocation keeps existing records and drafts', () => {
    let session = grant(cardinalitySession('chou-shen-na-ji', 'philosopher', 13, true), 'washerwoman')
    expect(abilityItem(session, 'washerwoman')).toBeDefined()
    const before = structuredClone(session.nightRuns[session.activeNightRunId!])
    session = grant(session, null)
    expect(projectAbilityGrants(session)).toEqual([])
    expect(abilityItem(session, 'washerwoman')?.applicability).toBe('not_applicable')
    expect(session.nightRuns[session.activeNightRunId!].drafts).toEqual(before.drafts)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
    expect(projected(session).queue.filter(i=>i.roleId==='philosopher').every(i=>i.applicability==='not_applicable')).toBe(true)
  })
  it('rejects stale context, wrong actor, evil Philosopher choices, and duplicate confirmation', () => {
    const session = cardinalitySession('chou-shen-na-ji', 'philosopher', 13)
    expect(grant(session, 'imp')).toBe(session)
    expect(grant(session, 'fortuneteller', { expectedRoleId: 'imp' })).toBe(session)
    expect(grant(session, 'fortuneteller', { expectedContextKey: 'stale' })).toBe(session)
    const changed = grant(session, 'fortuneteller', { id: 'once' })
    expect(grant(changed, 'fortuneteller', { id: 'once' })).toBe(changed)
  })
})
