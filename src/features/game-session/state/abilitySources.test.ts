import { describe, expect, it } from 'vitest'
import { abilityFixture } from './abilityChanges.test-support'
import { projectAbilityGrants } from './abilityChanges'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { gameSessionReducer } from './sessionReducer'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import type { GameSessionState } from '../types'
import type { GameSessionAction } from './sessionActions'
import { parseSessionBackup } from '../../../services/session/sessionBackup'
import { roleTeamByIdForScript } from '../../../domain/scripts'

function change(session: GameSessionState, sourceRoleId: string, roleId: string | null, overrides: Partial<Extract<GameSessionAction, {type:'confirm-ability-change'}>> = {}) {
  const assignments = projectCurrentAssignments(session), source = assignments.find(a => a.role.id === sourceRoleId)!
  const actor = sourceRoleId === 'boffin' ? assignments.find(a => roleTeamByIdForScript(session.scriptId)[a.role.id] === 'demon')! : source
  return gameSessionReducer(session, { type: 'confirm-ability-change', sourceSeatId: source.seatId, sourceRoleId, seatId: actor.seatId,
    expectedRoleId: actor.role.id, roleId, timing:'tonight', reason:'主持确认本次条件、相克、能力有效及发动时点。', id:`ability-${session.timeline.length}`,
    expectedContextKey:nightContextKey(session), confirmedAt:new Date().toISOString(), ...overrides })
}
function stateChange(session: GameSessionState, seatId: number, after: Partial<ReturnType<typeof projectCurrentPlayerStates>[number]>) {
  const before = projectCurrentPlayerStates(session)[seatId]
  return gameSessionReducer(session,{type:'confirm-player-state-change',seatId,expectedBefore:before,after:{...before,...after},segmentId:null,
    entryId:`status-${session.timeline.length}`,confirmedAt:new Date().toISOString(),reason:'回归：主持确认状态'})
}
describe('gained ability source conditions and lifetime', () => {
  it('Alchemist duplicates an in-play Poisoner without becoming a Minion or cancelling that Poisoner', () => {
    const before = abilityFixture('alchemist','poisoner',true), session = change(before,'alchemist','poisoner')
    expect(projectAbilityGrants(session)).toHaveLength(1)
    expect(projectCurrentAssignments(session)).toEqual(projectCurrentAssignments(before))
    expect(projected(session).queue.filter(i => i.roleId === 'poisoner' && i.applicability !== 'not_applicable')).toHaveLength(2)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })
  it('Boffin preserves the Demon attack and adds the good ability, source impairment requires review', () => {
    let session = abilityFixture('boffin','fortuneteller')
    const before = projected(session).queue.filter(i => !i.systemStep && i.roleId !== 'boffin')
    session = change(session,'boffin','fortuneteller')
    const grant = projectAbilityGrants(session)[0]
    expect(grant).toBeDefined()
    expect(projected(session).queue.filter(i => !i.abilitySource && !i.systemStep && i.roleId !== 'boffin').map(i=>({...i,orderIndex:0}))).toEqual(before.map(i=>({...i,orderIndex:0})))
    expect(projected(session).queue.some(i => i.abilitySource && i.roleId === 'fortuneteller')).toBe(true)
    session = stateChange(session,grant.sourceSeatId,{poisoned:true})
    expect(projected(session).queue.find(i => i.abilitySource)?.applicability).toBe('needs_review')
    session = stateChange(session,grant.sourceSeatId,{poisoned:false})
    expect(projected(session).queue.find(i => i.abilitySource)?.applicability).toBe('applicable')
  })
  it('Pixie information does not grant anything until a marked death and explicit madness confirmation', () => {
    let session = abilityFixture('pixie','fortuneteller',true)
    expect(change(session,'pixie','fortuneteller')).toBe(session)
    const item = projected(session).queue.find(i => i.roleId === 'pixie')!
    session = actNight(actNight(session,{type:'preview',id:item.id}),{type:'activate-preview'})
    session = actNight(session,{type:'role-choice',roleId:'fortuneteller'})
    session = actNight(session,{type:'outcome',outcomeId:'record'})
    session = actNight(session,{type:'confirm',advance:true})
    expect(projectAbilityGrants(session)).toEqual([])
    const target = projectCurrentAssignments(session).find(a => a.role.id === 'fortuneteller')!
    expect(change(session,'pixie','fortuneteller',{triggerSeatId:target.seatId})).toBe(session)
    session = stateChange(session,target.seatId,{life:'dead'})
    session = change(session,'pixie','fortuneteller',{triggerSeatId:target.seatId})
    expect(projectAbilityGrants(session)).toHaveLength(1)
    expect(projected(session).queue.some(i => i.abilitySource && i.roleId === 'fortuneteller')).toBe(true)
    expect(parseSessionBackup(JSON.stringify(session))).toEqual(session)
  })
  it('Cannibal needs a killed executee, loses the old ability on the next killed execution, and keeps evidence', () => {
    let session = abilityFixture('cannibal','fortuneteller')
    expect(change(session,'cannibal','fortuneteller')).toBe(session)
    const appendExecution = (id:string,causedDeath:boolean) => { session = {...session,timeline:[...session.timeline,{kind:'execution',id,segmentId:null,createdAt:new Date().toISOString(),confirmedBy:'storyteller',executedSeatId:1,causedDeath}]} }
    appendExecution('surviving-execution',false)
    expect(change(session,'cannibal','fortuneteller')).toBe(session)
    appendExecution('killed-execution',true)
    session = change(session,'cannibal','fortuneteller')
    expect(projectAbilityGrants(session)).toHaveLength(1)
    appendExecution('next-killed-execution',true)
    expect(projectAbilityGrants(session)).toEqual([])
    expect(projected(session).queue.find(i => i.abilitySource)?.applicability).toBe('not_applicable')
    expect(session.timeline.some(e=>e.kind==='ability_changed'&&e.sourceEntryId==='killed-execution')).toBe(true)
  })
})
