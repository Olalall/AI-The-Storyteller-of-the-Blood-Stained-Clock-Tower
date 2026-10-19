import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { parseSessionBackup } from './sessionBackup'
import { gameSessionStorageKey } from './localSessionAdapter'

function mergedBackup() {
  const session = createPrototypeGameSession()
  session.hostingMode = 'grimoire'
  session.hostingModeHistory = [{ mode: 'grimoire', changedAt: '2026-10-19T00:00:00Z', phaseLabel: '开局前' }]
  const run = session.nightRuns[session.activeNightRunId!]
  const item = run.queue.find((wake) => wake.id === run.activeCursorId)!
  item.minimumTargetCount = 0
  item.registrationSpec = { kind: 'role_type', label: '展示类型', choices: [{ id: 'demon', label: '恶魔' }] }
  item.previousRegistration = { kind: 'role_type', seatId: 2, value: 'townsfolk' }
  item.forbiddenRegistrationValues = ['townsfolk']
  item.historicalContext = { kind: 'balloonist_role_type', status: 'ready', seatIds: [2], summary: '上一夜记录' }
  run.drafts[item.id] = { ...emptyWakeDraft(), targets: [1], registration: { kind: 'role_type', seatId: 1, value: 'demon' }, systemChecks: ['shown'], bluffRoleIds: ['chef'] }
  run.queue.push({ ...item, id: 'empty-audience', seatId: 0, roleId: 'system-audience-damsel', targetCount: 0,
    systemStep: { kind: 'audience_notice', minionLabels: [], demonLabel: '', infoTokens: ['角色在场'], checks: [], recipientLabels: [] } })
  run.aiAdviceLog['merged-advice'] = { id: 'merged-advice', adviceId: 'merged-advice', kind: 'result', nightRunId: run.id, wakeItemId: item.id,
    contextRevision: run.revision, sourceDraftRevision: 0, knowledgeVersion: run.knowledgeVersion, status: 'answer', summary: '人工确认', facts: [], missing: [], journalDrafts: [], playerMessageDrafts: [], authorityWarnings: [], confidence: 'low',
    stateChangeDrafts: [{ text: '核对1号是否死亡', seatId: 1, change: { field: 'life', to: 'dead' } }] }
  const state = session.initialPlayerStates[1]
  session.timeline.push({ id: 'new-op', kind: 'player_state_changed', segmentId: null, createdAt: '2026-10-19T00:00:00Z', confirmedBy: 'storyteller', seatId: 1,
    before: state, after: { ...state, markers: [{ id: 'marker', label: '人工标记', sourceRoleId: 'monk', placedInSegmentId: null }] }, reason: '显式加标记',
    ops: [{ op: 'token_added', seatId: 1, token: { id: 'marker', label: '人工标记', sourceRoleId: 'monk', placedInSegmentId: null } }], origin: 'grimoire' })
  return session
}

describe('merged session backup boundary', () => {
  it('preserves new optional provenance, empty audience, registrations and structured AI suggestions exactly', () => {
    const session = mergedBackup()
    const raw = JSON.stringify(session)
    expect(JSON.stringify(parseSessionBackup(raw))).toBe(raw)
  })

  it('keeps old backups readable when every new optional field is absent', () => {
    const raw = JSON.stringify(createPrototypeGameSession())
    expect(JSON.stringify(parseSessionBackup(raw))).toBe(raw)
  })

  it.each([
    { minimumTargetCount: -1 },
    { minimumTargetCount: 16 },
    { previousRegistration: { kind: 'alignment', seatId: 1, value: 'demon' } },
    { historicalContext: { kind: 'unknown', status: 'ready', seatIds: [], summary: '' } },
    { systemStep: { kind: 'demon_info', minionLabels: [], demonLabel: '', infoTokens: [], checks: [], bluffCount: '3' } },
  ])('rejects malformed optional night metadata before replacing the current save: %j', (patch) => {
    const session = mergedBackup(), run = session.nightRuns[session.activeNightRunId!]
    Object.assign(run.queue[0], patch)
    localStorage.setItem(gameSessionStorageKey, 'current-game-is-untouched')
    expect(() => parseSessionBackup(JSON.stringify(session))).toThrow()
    expect(localStorage.getItem(gameSessionStorageKey)).toBe('current-game-is-untouched')
  })

  it('accepts legacy plain-text suggestions, but rejects malformed executable-looking structured data', () => {
    const session = mergedBackup()
    const log = session.nightRuns[session.activeNightRunId!].aiAdviceLog
    Object.assign(log['merged-advice'], { stateChangeDrafts: ['旧版只读建议'] })
    const raw = JSON.stringify(session)
    expect(JSON.stringify(parseSessionBackup(raw))).toBe(raw)
    Object.assign(log['merged-advice'], { stateChangeDrafts: [{ text: '不合法字段', seatId: 1, change: { field: 'script', to: 'other' } }] })
    expect(() => parseSessionBackup(JSON.stringify(session))).toThrow()
    Object.assign(log['merged-advice'], { stateChangeDrafts: [] })
    Object.assign(session.timeline.at(-1)!, { ops: [{ op: 'life_set', seatId: 1, life: 'invalid' }] })
    expect(() => parseSessionBackup(JSON.stringify(session))).toThrow()
  })

  it('only allows seat zero for an explicitly empty audience notice', () => {
    const session = mergedBackup(), run = session.nightRuns[session.activeNightRunId!]
    run.queue.at(-1)!.systemStep!.recipientLabels = ['1号']
    expect(() => parseSessionBackup(JSON.stringify(session))).toThrow()
  })
})
