import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, smartScriptRegistry } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { createSmartScriptSetupCandidates } from '../../setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { gameSessionReducer } from './sessionReducer'
import { projectCurrentAssignments, projectCurrentPlayerStates } from './projectors'
import { sessionBackupSchema } from '../../../services/session/sessionBackupSchema'
import { actNight, projected } from '../../night-workbench/state/nightInformation.test-support'
import { hasLilMonstaOpening } from './lilMonstaNight'
import { changedRoleNightItems } from './confirmNightRoleChange'

const at='2026-10-21T00:00:00.000Z', id='lilmonsta-opening-regression'
const origin=getSmartScriptPack('bao-meng-mi-tuan')
const roles=[...origin.roles.filter(r=>r.team==='townsfolk'&&!r.research?.setupImpact.length&&r.id!=='amnesiac').slice(0,5).map(r=>r.id),
  ...origin.roles.filter(r=>r.team==='minion'&&!['baron','godfather','summoner','marionette'].includes(r.id)).slice(0,2).map(r=>r.id)]
const rule={id:'lilmonsta-extra-minion',roleId:'lilmonsta',knowledgeStatus:'confirmed' as const,summary:'小怪宝不占座位，增加一名爪牙。'}
const template={templateId:id+'-7',scriptId:id,playerCount:7 as const,style:'balanced' as const,roles,bluffs:[],verified:true,notes:['隔离回归。'],
  setupAdjustments:[{ruleId:rule.id,choiceId:'extra-minion-no-demon',compositionDelta:{minion:1,demon:-1}}]}
smartScriptRegistry.register({...origin,scriptId:id,playerCounts:[7],setupRules:[rule],setupTemplates:[template]})
function fixture(){
 let session=createSmartScriptSetupSession(id,at,{playerCount:7})
 const candidate=createSmartScriptSetupCandidates(id,Object.values(session.seats))[0]
 expect(candidate.demonBluffs).toEqual([])
 session=gameSessionReducer(session,{type:'set-setup-draft',draft:createSetupDraftFromCandidate(candidate,at)})
 session=gameSessionReducer(session,{type:'confirm-setup',id:'lil-confirmed',confirmedAt:at})
 expect(session.timeline.some(e=>e.kind==='setup_confirmed')).toBe(true)
 return gameSessionReducer(session,{type:'start-next-night-run'})
}
function focus(session:ReturnType<typeof fixture>,step:'babysitter'|'death'){
 const item=projected(session).queue.find(i=>i.lilMonstaStep===step)!
 return actNight(actNight(session,{type:'preview',id:item.id}),{type:'activate-preview'})
}
describe('non-seated Lil Monsta records',()=>{
 it('does not create extra non-seated holder or death steps when only one changed player is projected',()=>{
  const s=fixture(),assignment=projectCurrentAssignments(s).find(a=>a.role.id!=='lilmonsta')!
  const items=changedRoleNightItems(s,assignment.seatId,assignment.role.id,'one-player-role-change')
  expect(items.some(item=>item.lilMonstaStep)).toBe(false)
  expect(projected(s).queue.filter(item=>item.lilMonstaStep)).toHaveLength(1)
 })
 it('uses zero bluffs and a real no-demon bag without ordinary demon/minion information',()=>{
  const s=fixture(),q=projected(s).queue,items=q.filter(i=>i.lilMonstaStep)
  expect(items.map(i=>i.lilMonstaStep)).toEqual(['babysitter'])
  expect(q.filter(i=>i.systemStep?.kind==='minion_info'||i.systemStep?.kind==='demon_info')).toEqual([])
  expect(items[0].seatId).toBe(0)
  expect(hasLilMonstaOpening(s,projectCurrentAssignments(s))).toBe(true)
  expect(hasLilMonstaOpening({...s,timeline:[]},projectCurrentAssignments(s))).toBe(false)
  expect(sessionBackupSchema(JSON.parse(JSON.stringify(s)))).toBe(true)
 })
 it('records a good babysitter without changing their role, alignment or life, and preserves the record on reload',()=>{
  let s=focus(fixture(),'babysitter')
  const before=JSON.stringify({assignments:projectCurrentAssignments(s),states:projectCurrentPlayerStates(s)})
  s=actNight(actNight(s,{type:'target',seatId:1}),{type:'outcome',outcomeId:'record'})
  s=actNight(s,{type:'confirm',advance:false})
  const action=s.timeline.find(e=>e.kind==='night_action'&&e.roleId==='lilmonsta')
  expect(action?.kind).toBe('night_action')
  expect(action?.kind==='night_action'&&action.record.snapshot.targets).toEqual([1])
  expect(JSON.stringify({assignments:projectCurrentAssignments(s),states:projectCurrentPlayerStates(s)})).toBe(before)
  expect(action?.kind==='night_action'&&action.summary).not.toContain('0号')
  expect(sessionBackupSchema(JSON.parse(JSON.stringify(s)))).toBe(true)
  const after=actNight(s,{type:'change-role',role:projectCurrentAssignments(s)[0].role,reason:'gameplay'})
  expect(projectCurrentAssignments(after)).toEqual(projectCurrentAssignments(s))
 })
 it('creates separate holder and optional death steps on later nights, with no extra first-night death',()=>{
  let s=fixture()
  for(const i of projected(s).queue)s=actNight(s,{type:'skip-item',id:i.id,reason:'隔离测试跳过其余能力。'})
  s=gameSessionReducer(s,{type:'open-phase-segment',phaseKind:'night',createdAt:at})
  s=gameSessionReducer(s,{type:'close-active-night-run',nightRunId:s.activeNightRunId!,closedAt:at})
  s=gameSessionReducer(s,{type:'open-phase-segment',phaseKind:'day',createdAt:at})
  s=gameSessionReducer(s,{type:'confirm-day-no-execution',daySegmentId:s.phaseSegments.at(-1)!.id,entryId:'lil-no-execution',confirmedAt:at})
  s=gameSessionReducer(s,{type:'close-open-segment',phaseKind:'day',closedAt:at})
  s=gameSessionReducer(s,{type:'start-next-night-run'})
  expect(projected(s).queue.filter(i=>i.lilMonstaStep).map(i=>i.lilMonstaStep)).toEqual(['babysitter','death'])
  s=focus(s,'death')
  const before=projectCurrentPlayerStates(s)
  s=actNight(actNight(s,{type:'outcome',outcomeId:'hold'}),{type:'confirm',advance:false})
  expect(s.timeline.filter(e=>e.kind==='night_action'&&e.roleId==='lilmonsta')).toHaveLength(1)
  expect(projectCurrentPlayerStates(s)).toEqual(before)
 })
})
