import { describe, expect, it } from 'vitest'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { createSmartScriptSetupCandidates } from '../../setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { gameSessionReducer } from './sessionReducer'
import { createSmartScriptNightQueue } from './createNextNightRun'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { nightContextKey } from '../../night-workbench/state/gameSessionAdapter'
const at='2026-10-21T00:00:00.000Z'
function fixture(){
 let s=createSmartScriptSetupSession('yi-zhi-du-xiu',at,{playerCount:15})
 const candidate=createSmartScriptSetupCandidates(s.scriptId,Object.values(s.seats),{count:100}).find(c=>c.assignments.filter(a=>a.role.id==='legion').length>7)!
 s=gameSessionReducer(s,{type:'set-setup-draft',draft:createSetupDraftFromCandidate(candidate,at)})
 s=gameSessionReducer(s,{type:'confirm-setup',id:'legion-group-setup',confirmedAt:at})
 return gameSessionReducer(s,{type:'start-next-night-run'})
}
function laterFixture(){
 let s=fixture()
 for(const item of projected(s).queue)s=actNight(s,{type:'skip-item',id:item.id,reason:'隔离回归，跳过其余步骤。'})
 s=gameSessionReducer(s,{type:'open-phase-segment',phaseKind:'night',createdAt:at})
 s=gameSessionReducer(s,{type:'close-active-night-run',nightRunId:s.activeNightRunId!,closedAt:at})
 s=gameSessionReducer(s,{type:'open-phase-segment',phaseKind:'day',createdAt:at})
 s=gameSessionReducer(s,{type:'confirm-day-no-execution',daySegmentId:s.phaseSegments.at(-1)!.id,entryId:'legion-no-exec',confirmedAt:at})
 s=gameSessionReducer(s,{type:'close-open-segment',phaseKind:'day',closedAt:at})
 return gameSessionReducer(s,{type:'start-next-night-run'})
}
function change(s:ReturnType<typeof fixture>,seatId:number,roleId:string){
 const run=s.nightRuns[s.activeNightRunId!]
 return gameSessionReducer(s,{type:'confirm-night-role-change',nightRunId:run.id,expectedRevision:run.revision,expectedContextKey:nightContextKey(s),
  seatId,expectedRoleId:projectCurrentAssignments(s).find(a=>a.seatId===seatId)!.role.id,roleId,timing:'tonight',reason:'gameplay',id:'legion-role-change',confirmedAt:'2026-10-21T00:00:01.000Z'})
}
describe('Legion is one storyteller action for the group',()=>{
 it('introduces every Legion together instead of naming one as the only Demon',()=>{
  const s=fixture(),legion=projectCurrentAssignments(s).filter(a=>a.role.id==='legion')
  const info=projected(s).queue.find(i=>i.systemStep?.kind==='demon_info')!
  expect(info.playerLabel).toContain('全体军团')
  for(const actor of legion)expect(info.systemStep?.demonLabel).toContain(actor.seatId+'号')
  expect(info.systemStep?.checks).toContainEqual({id:'legion-recognized',label:'已共同唤醒全体军团并完成互认'})
 })
 it('has one optional death per later night, including when the first assigned Legion is dead',()=>{
  const s=fixture(),assignments=projectCurrentAssignments(s),states=projectCurrentPlayerStates(s)
  const first=assignments.find(a=>a.role.id==='legion')!
  const before=JSON.stringify(s)
  states[first.seatId]={...states[first.seatId],life:'dead'}
  const queue=createSmartScriptNightQueue(s,assignments,states,'legion-later',2).filter(i=>i.roleId==='legion')
  expect(queue).toHaveLength(1)
  expect(queue[0].seatId).not.toBe(first.seatId)
  expect(queue[0].playerLabel).toContain('全体军团')
  expect(queue[0].outcomeOptions.find(o=>o.id==='hold')?.requiredInputs).toEqual([])
  expect(JSON.stringify(s)).toBe(before)
 })
 it('records no death once without changing any player state',()=>{
  let s=laterFixture()
  const item=projected(s).queue.find(i=>i.roleId==='legion')!,states=JSON.stringify(projectCurrentPlayerStates(s))
  s=actNight(actNight(s,{type:'preview',id:item.id}),{type:'activate-preview'})
  s=actNight(actNight(s,{type:'outcome',outcomeId:'hold'}),{type:'confirm',advance:false})
  expect(s.timeline.filter(e=>e.kind==='night_action'&&e.roleId==='legion')).toHaveLength(1)
  expect(JSON.stringify(projectCurrentPlayerStates(s))).toBe(states)
 })
 it('joins an existing Legion group without adding a second death opportunity',()=>{
  const s=laterFixture(),good=projectCurrentAssignments(s).find(a=>a.role.id!=='legion')!
  const next=change(s,good.seatId,'legion')
  expect(next.timeline).toHaveLength(s.timeline.length+1)
  expect(projectCurrentAssignments(next).find(a=>a.seatId===good.seatId)?.role.id).toBe('legion')
  expect(projected(next).queue.filter(i=>i.roleId==='legion'&&i.progress!=='not_applicable')).toHaveLength(1)
  expect(projectCurrentPlayerStates(next)).toEqual(projectCurrentPlayerStates(s))
 })
 it('keeps a completed collective action completed when another Legion joins',()=>{
  let s=laterFixture()
  const item=projected(s).queue.find(i=>i.roleId==='legion')!
  s=actNight(actNight(s,{type:'preview',id:item.id}),{type:'activate-preview'})
  s=actNight(actNight(s,{type:'outcome',outcomeId:'hold'}),{type:'confirm',advance:false})
  const good=projectCurrentAssignments(s).find(a=>a.role.id!=='legion')!,next=change(s,good.seatId,'legion')
  expect(next.timeline).toHaveLength(s.timeline.length+1)
  expect(projected(next).queue.filter(i=>i.roleId==='legion'&&i.progress!=='not_applicable')).toHaveLength(1)
  expect(projected(next).queue.find(i=>i.id===item.id)?.progress).toBe('confirmed')
 })
 it('keeps the remaining Legion group actionable after its anchor changes role',()=>{
  const s=laterFixture(),item=projected(s).queue.find(i=>i.roleId==='legion')!,good=projectCurrentAssignments(s).find(a=>a.role.id!=='legion')!
  let next=change(s,item.seatId,good.role.id)
  const group=projected(next).queue.filter(i=>i.roleId==='legion'&&i.progress!=='not_applicable')
  expect(next.timeline).toHaveLength(s.timeline.length+1)
  expect(group).toHaveLength(1);expect(group[0].seatId).not.toBe(item.seatId)
  next=actNight(actNight(next,{type:'preview',id:group[0].id}),{type:'activate-preview'})
  next=actNight(actNight(next,{type:'outcome',outcomeId:'hold'}),{type:'confirm',advance:false})
  expect(next.timeline.filter(e=>e.kind==='night_action'&&e.roleId==='legion')).toHaveLength(1)
 })
})
