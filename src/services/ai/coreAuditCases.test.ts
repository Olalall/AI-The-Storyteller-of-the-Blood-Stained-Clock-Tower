import {it,expect} from 'vitest'
import {coreAuditCases} from './coreAuditCases.test-support'
import {captureNightQualityRequest} from './nightSettlementQualityCases.test-support'
import {isNightSettlementRequest} from '../../../server/ai/aiRequestValidators'

it.each(coreAuditCases)('$id reaches the actual HTTP adapter with a valid, ready contract',async testCase=>{
  const input=testCase.makeInput(),before=JSON.stringify(input),request=await captureNightQualityRequest(input)
  expect(isNightSettlementRequest(request)).toBe(true)
  expect(request.availableOutcomes.find(o=>o.id===testCase.outcome)?.ready).toBe(true)
  expect(JSON.stringify(input)).toBe(before)
})
