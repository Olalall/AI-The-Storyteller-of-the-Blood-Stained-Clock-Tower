import {describe,it,expect} from 'vitest'
import {coreAuditCases} from '../../src/services/ai/coreAuditCases.test-support'
import {captureNightQualityRequest} from '../../src/services/ai/nightSettlementQualityCases.test-support'
import {isNightSettlementRequest} from './aiRequestValidators'
import {createOpenAICompatibleNightSettlementProvider} from './nightSettlementProvider'

describe.skipIf(process.env.BOTC_RUN_CORE_AUDIT_LIVE!=='1')('real AI core audit fixes',()=>{
  it.concurrent.each(coreAuditCases)('$id',async testCase=>{
    const input=testCase.makeInput(),before=JSON.stringify(input),request=await captureNightQualityRequest(input)
    expect(isNightSettlementRequest(request)).toBe(true)
    const started=performance.now();let passed=false,status='provider_error',outcome:string|undefined
    try{
      const provider=createOpenAICompatibleNightSettlementProvider({baseUrl:process.env.BOTC_AI_BASE_URL!,apiKey:process.env.BOTC_AI_API_KEY!,model:process.env.BOTC_AI_MODEL!,timeoutSeconds:90,
        fetcher:async(url,init)=>{try{const response=await fetch(url,init);console.info(JSON.stringify({caseId:testCase.id,upstreamStatus:response.status}));return response}
          catch(error){console.info(JSON.stringify({caseId:testCase.id,networkError:error instanceof Error?error.name:'unknown',causeCode:(error as {cause?:{code?:string}})?.cause?.code}));throw error}},
      })
      const draft=(await provider.generateNightSettlementAdvice(request)).draft
      status=draft.status;outcome=draft.recommendedOutcomeId
      expect(draft.provider).toBe('openai-compatible');expect(draft.draftOnly).toBe(true)
      expect(draft.status).toBe('answer');expect(draft.recommendedOutcomeId).toBe(testCase.outcome)
      expect([...draft.journalDrafts,...draft.playerMessageDrafts,...draft.stateChangeDrafts.map(x=>typeof x==='string'?x:x.text)].join(' ')).not.toMatch(/已经写入|已修改状态|自动变为邪恶/)
      expect(JSON.stringify(input)).toBe(before);passed=true
    }finally{console.info(JSON.stringify({caseId:testCase.id,playerCount:input.state.playerCount,status,outcome,passed,elapsedMs:Math.round(performance.now()-started)}))}
  },120_000)
})
