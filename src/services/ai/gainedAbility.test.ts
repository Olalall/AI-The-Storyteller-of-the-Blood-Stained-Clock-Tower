import { expect, it } from 'vitest'
import { abilityFixture } from '../../features/game-session/state/abilityChanges.test-support'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { projectCurrentAssignments } from '../../features/game-session/state/projectors'
import { nightContextKey } from '../../features/night-workbench/state/gameSessionAdapter'
import { projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import { buildNightSettlementRequest } from './contextBuilder'
import { captureNightQualityRequest } from './nightSettlementQualityCases.test-support'
import { isNightSettlementRequest } from '../../../server/ai/aiRequestValidators'

it('AI receives actual Alchemist identity separately from the gained Poisoner ability, including the real HTTP payload', async () => {
  const before = abilityFixture('alchemist','poisoner',true), actor = projectCurrentAssignments(before).find(a=>a.role.id==='alchemist')!
  const session = gameSessionReducer(before,{type:'confirm-ability-change',sourceSeatId:actor.seatId,sourceRoleId:'alchemist',seatId:actor.seatId,
    expectedRoleId:'alchemist',roleId:'poisoner',timing:'tonight',reason:'主持确认获得爪牙能力',id:'alchemist-poisoner',
    expectedContextKey:nightContextKey(before),confirmedAt:'2026-10-22T01:00:00Z'})
  const state=projected(session),item=state.queue.find(i=>i.abilitySource)!
  const request=buildNightSettlementRequest({state,item,draft:emptyWakeDraft()})
  expect(request.context.currentActor?.roleId).toBe('alchemist')
  expect(request.context.wakeItem.roleId).toBe('poisoner')
  expect(request.context.wakeItem.abilitySource?.sourceRoleId).toBe('alchemist')
  const payload = await captureNightQualityRequest({state,item,draft:{...emptyWakeDraft(),targets:[2]}})
  expect(payload.wakeItem.abilitySource).toEqual(item.abilitySource)
  expect(payload.currentActor?.roleId).toBe('alchemist')
  expect(isNightSettlementRequest(payload)).toBe(true)
  expect(isNightSettlementRequest({...payload,wakeItem:{...payload.wakeItem,abilitySource:{...payload.wakeItem.abilitySource,sourceSeatId:0}}})).toBe(false)
})

it('the Summoner first-night HTTP contract accepts exactly three recorded roles without a target', async () => {
  const session=abilityFixture('summoner','summoner',true),state=projected(session),item=state.queue.find(i=>i.roleId==='summoner')!
  const ids=item.roleChoices!.slice(0,3).map(r=>r.id)
  const payload=await captureNightQualityRequest({state,item,draft:{...emptyWakeDraft(),roleChoice:ids[0],secondRoleChoice:ids[1],additionalRoleChoices:[ids[2]]}})
  expect(payload.wakeItem.roleCount).toBe(3)
  expect(payload.wakeItem.targetCount).toBe(0)
  expect(payload.availableOutcomes.find(o=>o.id==='record')?.ready).toBe(true)
  expect(isNightSettlementRequest(payload)).toBe(true)
})
