import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupSession } from '../../game-session/data/createPrototypeSession'
import { roleSnapshotsForScript } from '../../../domain/scripts'
import { gameSessionReducer } from '../../game-session/state/sessionReducer'
import { savantInformation } from './savantInformation'

const at = '2026-10-01T12:00:00.000Z'
function fixture() {
  const base = createSmartScriptSetupSession('shuo-shu-ren-zhi-nu', at, { playerCount: 7, seats: [] })
  const roles = roleSnapshotsForScript(base.scriptId)
  const ids = ['savant', 'poppygrower', 'monk', 'magician', 'mathematician', 'cerenovus', 'vortex']
  return gameSessionReducer({ ...base, setupDraft: { candidateId: 'synthetic', revision: 1, assignments: ids.map((id, i) => ({ seatId: i + 1, role: roles.find(r => r.id === id)! })), demonBluffs: [], updatedAt: at } },
    { type: 'confirm-setup', id: 'setup', confirmedAt: at })
}
describe('博学者信息候选', () => {
  it('builds two false statements with separate evidence under active Vortox, even if Savant is poisoned', () => {
    const session = fixture()
    session.initialPlayerStates[1].poisoned = true
    const result = savantInformation(session, 1)
    expect(result.mode).toBe('vortox')
    expect(result.pairs.length).toBeGreaterThan(1)
    for (const pair of result.pairs) {
      expect(pair.statements.map(s => s.truth)).toEqual([false, false])
      expect(pair.statements[0].family).not.toBe(pair.statements[1].family)
      expect(pair.statements.every(s => Boolean(s.evidence))).toBe(true)
    }
  })
  it.each(['dead', 'drunk', 'poisoned'])('returns one true and one false if Vortox is %s', impairment => {
    const session = fixture()
    if (impairment === 'dead') session.initialPlayerStates[7].life = 'dead'
    else session.initialPlayerStates[7][impairment as 'drunk' | 'poisoned'] = true
    const result = savantInformation(session, 1)
    expect(result.mode).toBe('normal')
    expect(result.pairs.every(p => p.statements.filter(s => s.truth).length === 1)).toBe(true)
  })
})
