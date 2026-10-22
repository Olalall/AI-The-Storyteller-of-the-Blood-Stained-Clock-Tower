import { abilityFixture } from '../../features/game-session/state/abilityChanges.test-support'
import { cardinalitySession, nextCardinalityNight } from '../../features/night-workbench/state/nightCardinality.test-support'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { projectCurrentAssignments, projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { roleTeamByIdForScript } from '../../domain/scripts'
import { nightContextKey } from '../../features/night-workbench/state/gameSessionAdapter'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { lleechFirstNightFixture } from '../../features/game-session/state/lleechInitial.test-support'
import type { CreateNightResultAdviceInput } from './types'
import type { GameSessionState } from '../../features/game-session/types'

function gained(sourceRoleId: string, roleId: string): CreateNightResultAdviceInput {
  let session=sourceRoleId==='philosopher'?cardinalitySession('chou-shen-na-ji','philosopher',13):abilityFixture(sourceRoleId,roleId,sourceRoleId==='pixie'||sourceRoleId==='alchemist')
  const assignments=projectCurrentAssignments(session),source=assignments.find(a=>a.role.id===sourceRoleId)!
  let triggerSeatId:number|undefined
  if(sourceRoleId==='pixie'){
    const wake=projected(session).queue.find(i=>i.roleId==='pixie')!
    session=actNight(actNight(session,{type:'preview',id:wake.id}),{type:'activate-preview'})
    session=actNight(session,{type:'role-choice',roleId});session=actNight(session,{type:'outcome',outcomeId:'record'});session=actNight(session,{type:'confirm',advance:true})
    triggerSeatId=assignments.find(a=>a.role.id===roleId)!.seatId
    const before=projectCurrentPlayerStates(session)[triggerSeatId]
    session=gameSessionReducer(session,{type:'confirm-player-state-change',seatId:triggerSeatId,expectedBefore:before,after:{...before,life:'dead'},entryId:'pixie-trigger',segmentId:null,reason:'隔离夹具：主持确认被标记玩家死亡且疯狂达标',confirmedAt:new Date().toISOString()})
  }
  if(sourceRoleId==='cannibal')session={...session,timeline:[...session.timeline,{kind:'execution',id:'cannibal-lunch',executedSeatId:2,causedDeath:true,confirmedBy:'storyteller',segmentId:null,createdAt:new Date().toISOString()}]}
  const actor=sourceRoleId==='boffin'?assignments.find(a=>roleTeamByIdForScript(session.scriptId)[a.role.id]==='demon')!:source
  session=gameSessionReducer(session,{type:'confirm-ability-change',sourceSeatId:source.seatId,sourceRoleId,seatId:actor.seatId,expectedRoleId:actor.role.id,roleId,triggerSeatId,timing:'tonight',reason:'主持确认获得能力有效；已核对相克、持续效果、死亡或处决与使用时点。',id:'live-gained',expectedContextKey:nightContextKey(session),confirmedAt:new Date().toISOString()})
  const state=projected(session),item=state.queue.find(i=>i.abilitySource)!
  if(!item)throw new Error('Live fixture needs an actual gained ability wake')
  const demon=assignments.find(a=>roleTeamByIdForScript(session.scriptId)[a.role.id]==='demon')!.seatId
  const draft={...emptyWakeDraft(),targets:roleId==='fortuneteller'?[demon,demon===1?2:1]:[2],storytellerContext:roleId==='fortuneteller'
    ? '主持已确认该获得能力有效、当前清醒健康，所选两名玩家中有一名有效登记为恶魔；没有影响本次信息的额外相克。真实身份不变，不处理死亡。'
    : '主持确认炼金术士本次获得的投毒者能力有效且当前清醒健康；可以选择当前目标。只生成待确认中毒草稿，不改变真实身份或阵营。'}
  return{state,item,draft}
}
function lleech(initial:boolean):CreateNightResultAdviceInput{
  let session:GameSessionState=nextCardinalityNight(nextCardinalityNight(lleechFirstNightFixture(),'vortox'),'vortox')
  const run=session.nightRuns[session.activeNightRunId!]
  session=gameSessionReducer(session,{type:'confirm-night-role-change',nightRunId:run.id,seatId:12,expectedRoleId:'vortox',roleId:'lleech',timing:'initial-and-tonight',reason:'gameplay',id:'live-lleech',expectedContextKey:nightContextKey(session),expectedRevision:run.revision,confirmedAt:new Date().toISOString()})
  if(!initial){
    const wake=projected(session).queue.find(i=>i.roleId==='lleech'&&i.abilityPhase==='initial')!
    session=actNight(actNight(session,{type:'preview',id:wake.id}),{type:'activate-preview'})
    session=actNight(session,{type:'target',seatId:1});session=actNight(session,{type:'outcome',outcomeId:'record-initialization'});session=actNight(session,{type:'confirm',advance:true})
  }
  const state=projected(session),item=state.queue.find(i=>i.roleId==='lleech'&&Boolean(i.abilityPhase)===initial)!
  return{state,item,draft:{...emptyWakeDraft(),targets:[initial?1:2],storytellerContext:initial?'第3夜中途新建痢蛭；本项只初始化1号存活宿主，主持已核对合法时点，无额外攻击。':'第3夜新痢蛭已由主持单独确认存活宿主；本项是尚未经过的普通攻击时点，旧恶魔没有行动；选择2号仅生成死亡候选，不给攻击目标额外中毒。'}}
}
function summoner():CreateNightResultAdviceInput{
  const session=abilityFixture('summoner','summoner',true),state=projected(session),item=state.queue.find(i=>i.roleId==='summoner')!
  const ids=item.roleChoices!.slice(0,3).map(r=>r.id)
  return{state,item,draft:{...emptyWakeDraft(),roleChoice:ids[0],secondRoleChoice:ids[1],additionalRoleChoices:[ids[2]],storytellerContext:'首夜只告知这三个不在场善良角色作为伪装，不选择玩家或召唤恶魔。'}}
}
export const coreAuditCases=[
  ...['philosopher','alchemist','boffin','pixie','cannibal'].map(source=>({id:`gained-${source}`,makeInput:()=>gained(source,source==='alchemist'?'poisoner':'fortuneteller'),outcome:source==='alchemist'?'record':'yes'})),
  {id:'lleech-initial',makeInput:()=>lleech(true),outcome:'record-initialization'},
  {id:'lleech-attack',makeInput:()=>lleech(false),outcome:'record'},
  {id:'summoner-first-bluffs',makeInput:summoner,outcome:'record'},
]
