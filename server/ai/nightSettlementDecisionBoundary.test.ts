import { describe,expect,it } from 'vitest'
import { roleKnowledgeForAI } from '../../src/domain/role-knowledge'
import { buildNightSettlementProviderMessages } from './nightSettlementPromptBuilder'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import type { NightSettlementProviderRequest } from './types'

const complete=(extra:object={})=>({status:'answer',recommendedOutcomeId:'record',confidence:'high',summary:'待说书人确认的草稿。',missing:[],warnings:[],ruleFacts:[],journalDrafts:[],playerMessageDrafts:[],stateChangeDrafts:[],authorityWarnings:['说书人单独确认后才能写入权威状态。'],...extra})
const pending=(missing:string[])=>complete({status:'needs_input',recommendedOutcomeId:undefined,missing})
function request(roleId:string):NightSettlementProviderRequest{
  const seatId=roleId==='summoner'?8:roleId==='eviltwin'?9:10,status={life:'alive',impairments:[],markers:[]}
  return {scriptId:roleId==='eviltwin'?'sects-and-violets':'a-grimm-chorus',knowledgeVersion:'decision-boundary-regression',nightRunId:'boundary-'+roleId,phaseLabel:'第3夜',playerCount:10,
    wakeItem:{id:'wake-'+roleId,orderIndex:1,seatId,playerLabel:`${seatId}号`,roleId,roleName:roleId,ability:roleKnowledgeForAI(roleId)!.reminders[0],storytellerPrompt:'核对已确认事实，生成本项草稿。',targetCount:roleId==='ojo'?0:1,status},
    currentActor:{seatId,playerLabel:`${seatId}号`,roleId,roleName:roleId,status},
    selectedTargets:roleId==='ojo'?[]:[{seatId:roleId==='summoner'?7:1,playerLabel:roleId==='summoner'?'7号':'1号',roleId:roleId==='summoner'?'cannibal':'snakecharmer',roleName:roleId==='summoner'?'食人族':'舞蛇人',status}],
    draft:{targets:roleId==='ojo'?[]:[roleId==='summoner'?7:1],roleChoice:roleId==='summoner'?'po':roleId==='ojo'?'fisherman':'',outcomeId:'',playerChoice:'',draftRevision:1,storytellerContext:roleId==='summoner'?'第3夜健康召唤师8，开局及当前均无恶魔，已确认选择存活健康善良的7号成为邪恶珀，无相克和其他干扰。此前7号未有珀能力或作空刀选择。':roleId==='eviltwin'?'恶魔已死亡且没有继任或其他胜负阻碍；当前9号邪恶双子与1号善良双子均活，9号健康有能力，双方阵营已核实。':'奥赫健康，选择不在场渔夫；主持尚未选择替代死亡目标。'},
    availableOutcomes:[{id:'record',label:'记录结果',ready:true,requiredInputs:[]}],roleKnowledge:roleKnowledgeForAI(roleId)}
}
function boundaryErrors(value:Record<string,any>,kind:'complete'|'unknown-host-choice'){
  const errors=[]
  if(kind==='complete'){
    if(value.status!=='answer'||value.recommendedOutcomeId!=='record')errors.push('complete facts must yield an unconfirmed answer draft')
    if(value.missing?.length)errors.push('execution permission is not a missing game fact')
    if(!value.authorityWarnings?.length)errors.push('manual confirmation belongs in authority warnings')
  }else if(value.status!=='needs_input'||!value.missing?.length||value.recommendedOutcomeId||value.playerMessageDrafts?.length)errors.push('unknown host discretion must still block an applicable answer')
  return errors
}
function twinErrors(value:Record<string,any>){
  const text=[value.summary,...value.ruleFacts??[],...value.warnings??[],...value.stateChangeDrafts??[]].join('\n').replace(/(?:不能|不得|不要|并非|不是)[^。\n]{0,80}(?:必须|只有)[^。\n]{0,80}/g,'')
  return /(?:必须|只有|只能).{0,12}处决.{0,16}(?:邪恶双子|9号).{0,16}(?:才能|方能)|必须处决9号.{0,25}才能/.test(text)?['execution is not the only way to remove the both-living block']:[]
}
async function throughProvider(input:NightSettlementProviderRequest,answer:object){
  const original=structuredClone(input);let sent:Record<string,any>|undefined
  const provider=createOpenAICompatibleNightSettlementProvider({baseUrl:'https://offline-model.example.test/v1',model:'offline-test',apiKey:'offline-test-only',timeoutSeconds:1,
    fetcher:async(_url,init)=>{sent=JSON.parse(String(init?.body));return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(answer)}}]}),{status:200})}})
  const result=await provider.generateNightSettlementAdvice(input)
  expect(input).toEqual(original)
  const prompt=JSON.parse(sent!.messages[1].content)
  expect(prompt.input).toEqual(original)
  expect(prompt.constraints).toEqual(expect.arrayContaining([expect.stringMatching(/仅剩说书人点击确认.*answer.*不属于 missing.*authorityWarnings/)]))
  return result.draft
}

describe('night decisions separate complete facts, execution permission and victory conditions',()=>{
  it('returns a pending host-confirmed Summoner change as answer and retains the real 007 failure',async()=>{
    const good=complete({summary:'7号成为邪恶珀，同夜可在合法时点行动，不向爪牙互告。',stateChangeDrafts:['7号身份改为珀、阵营改为邪恶，待主持确认。']})
    const old007=pending(['需说书人确认执行7号玩家的角色变更（食人族 -> 珀）及阵营变更（善良 -> 邪恶）'])
    expect(boundaryErrors(good,'complete')).toEqual([])
    expect(boundaryErrors(old007,'complete')).toContain('execution permission is not a missing game fact')
    expect(boundaryErrors(await throughProvider(request('summoner'),good),'complete')).toEqual([])
  })
  it('does not turn an unknown Ojo discretion into a complete result just because record is ready',async()=>{
    const good=pending(['说书人需选择替代死亡目标'])
    expect(boundaryErrors(await throughProvider(request('ojo'),good),'unknown-host-choice')).toEqual([])
    expect(boundaryErrors(complete({stateChangeDrafts:['随机选择1号死亡。']}),'unknown-host-choice')).toContain('unknown host discretion must still block an applicable answer')
  })
  it('sends reviewed Twin knowledge and rejects the real 004 unique-execution assertion',async()=>{
    const good=complete({summary:'双子均活且能力有效，恶魔已死仍继续；可通过使双活条件解除再核胜负，不能将处决邪恶双子写成唯一途径。'})
    const old004=complete({summary:'双子双活，恶魔已死仍继续。',warnings:['善良阵营必须处决9号（邪恶双子）才能破除封锁并达成胜利条件。']})
    const input=request('eviltwin'),messages=buildNightSettlementProviderMessages(input),prompt=JSON.parse(messages[1].content)
    expect(prompt.input.roleKnowledge).toEqual(roleKnowledgeForAI('eviltwin'))
    expect(prompt.input.roleKnowledge.reminders).toEqual(expect.arrayContaining([expect.stringMatching(/不要求必须处决邪恶双子/)]))
    expect(twinErrors(old004)).toContain('execution is not the only way to remove the both-living block')
    expect(twinErrors(await throughProvider(input,good))).toEqual([])
  })
  it('allows an ordinary death to remove the Twin both-living block without inventing an execution',async()=>{
    const input=request('eviltwin')
    input.currentActor!.status={life:'dead',impairments:[],markers:[]}
    input.draft.storytellerContext='恶魔已死；9号邪恶双子刚因非处决来源普通死亡，无保留能力/复活等特例；1号善良双子仍活，无其他获胜阻碍。9号从未被处决。'
    const good=complete({summary:'9号死亡，双活阻碍解除；其能力失效且无其他阻碍，待主持确认善良获胜。'})
    const result=await throughProvider(input,good)
    expect(boundaryErrors(result,'complete')).toEqual([])
    expect(twinErrors(result)).toEqual([])
    expect(result.summary).toContain('双活阻碍解除')
  })
  it('does not block the Demon when a Lycanthrope good target survives protection (real 019)',async()=>{
    const input=request('ojo'),status={life:'alive',impairments:[],markers:[]}
    input.scriptId='lunar-eclipse';input.playerCount=8;input.phaseLabel='第2夜'
    input.wakeItem={...input.wakeItem,id:'lycan-protection',seatId:3,playerLabel:'3号',roleId:'lycanthrope',roleName:'半兽人',ability:'Each night*, choose an alive player. If good, they die & the Demon doesn’t kill tonight. One good player registers as evil.',targetCount:1}
    input.currentActor={seatId:3,playerLabel:'3号',roleId:'lycanthrope',roleName:'半兽人',status}
    input.selectedTargets=[{seatId:2,playerLabel:'2号',roleId:'innkeeper',roleName:'旅店老板',status,roleKnowledge:roleKnowledgeForAI('innkeeper')}]
    input.roleKnowledge=roleKnowledgeForAI('lycanthrope')
    input.draft={...input.draft,targets:[2],roleChoice:'',storytellerContext:'健康半兽人3选择善良2；2不是误登记者，受有效旅店保护而存活，未因本次攻击死亡，无其他干扰。'}
    const good=complete({summary:'2号因保护存活，半兽人没有真正杀死善良目标，恶魔本夜仍可杀人。',stateChangeDrafts:['2保持存活；后续恶魔攻击仍按正常条件核对。']})
    const old019=complete({summary:'恶魔停刀的前提是半兽人选择了善良玩家，无论该玩家是否因保护免于死亡，今晚恶魔均不杀人。',stateChangeDrafts:['后续恶魔行动轮次标记为停刀。']})
    const isCorrect=(d:Record<string,any>)=>/恶魔.{0,10}仍可杀人/.test(d.summary)&&!/标记为停刀/.test(d.stateChangeDrafts.join(' '))
    expect(isCorrect(old019)).toBe(false)
    expect(isCorrect(await throughProvider(input,good))).toBe(true)
    expect(input.roleKnowledge!.reminders).toEqual(expect.arrayContaining([expect.stringMatching(/确实杀死善良目标.*保护没有死亡.*恶魔仍可杀人/)]))
    const killed=complete({summary:'半兽人成功杀死善良目标2，本夜恶魔不能杀人，但仍照常唤醒选择。'})
    input.draft.storytellerContext='健康半兽人3选择仍存活的善良2；2不是误登记者，没有保护、替死、相克或其他干扰。'
    const resolved=await throughProvider(input,killed)
    expect(resolved.summary).toContain('恶魔不能杀人')
    expect(boundaryErrors(resolved,'complete')).toEqual([])
  })
  it('keeps a determined local Lleech death draft despite unasked global victory questions (real 022)',async()=>{
    const input=request('ojo'),status={life:'alive',impairments:[],markers:[]}
    input.scriptId='devout-theists'
    input.wakeItem={...input.wakeItem,id:'lleech-recovery',roleId:'lleech',roleName:'痢蛭',ability:roleKnowledgeForAI('lleech')!.reminders[0],targetCount:1}
    input.currentActor={seatId:10,playerLabel:'10号',roleId:'lleech',roleName:'痢蛭',status}
    input.selectedTargets=[{seatId:7,playerLabel:'7号',roleId:'fisherman',roleName:'渔夫',status}]
    input.roleKnowledge=roleKnowledgeForAI('lleech')
    input.draft={...input.draft,targets:[7],roleChoice:'',storytellerContext:'10痢蛭曾醉酒失去能力，期间其唯一宿主1死亡。现在10恢复健康、宿主仍死，没有其他保护/替死/相克。本题只核对痢蛭恢复后的生存和7号攻击草稿是否适用。'}
    const old022=pending(['请说书人确认10号痢蛭是否因宿主1号死亡而立即死亡','请核实场上是否存在使游戏继续的其他特殊角色或恶魔继承机制，以决定是否直接宣布游戏结束'])
    const good=complete({summary:'恢复能力瞬间10号痢蛭因宿主已死而死亡，7号攻击不适用。',stateChangeDrafts:['10号立即死亡，待说书人确认。'],authorityWarnings:['死亡待主持单独确认；若需判整局胜负，再核对其他存续或继任条件，本项未直接宣布终局。']})
    expect(boundaryErrors(old022,'complete')).toContain('execution permission is not a missing game fact')
    const prompt=JSON.parse(buildNightSettlementProviderMessages(input)[1].content)
    expect(prompt.constraints).toEqual(expect.arrayContaining([expect.stringMatching(/本项局部后果已确定.*全局胜负.*authorityWarnings/)]))
    expect(prompt.constraints).not.toContain('不要自动判定死亡、身份变化或阵营变化')
    expect(boundaryErrors(await throughProvider(input,good),'complete')).toEqual([])
    // A task that actually asks for an unknown global victory decision remains incomplete.
    expect(boundaryErrors(pending(['需核实其他存续或继任条件，才能判全局胜负']),'unknown-host-choice')).toEqual([])
  })
  it('keeps Riot ability death distinct from execution in all draft fields (real 046)',async()=>{
    const input=request('riot')
    input.scriptId='quick-maths';input.playerCount=12
    input.wakeItem={...input.wakeItem,seatId:12,playerLabel:'12号',targetCount:0}
    input.currentActor={...input.currentActor!,seatId:12,playerLabel:'12号'}
    input.selectedTargets=[]
    input.draft={...input.draft,targets:[],storytellerContext:'第3夜健康暴乱12；当前邪恶爪牙10和11均活，明天开始第3日提名。无相克或其他干扰。核对提名链。'}
    const old046=complete({summary:'第3天爪牙变成暴乱，被提名者死亡并立即提名。',ruleFacts:['角色转变的时点为第3天（白天开始/黎明结算时），而非第3夜夜间立即变更。'],authorityWarnings:['需由说书人核对明日提名规则：第3天任何被提名者立即处决/死亡（无需投票），且被提名者必须立即提名另一名存活玩家。']})
    const good=complete({summary:'第3天爪牙变成暴乱；被提名者因暴乱能力立即死亡并立即提名存活玩家。',ruleFacts:['第3夜唤醒爪牙告知成为暴乱，可以当夜替换标记，也可在第3日稍后提名阶段替换。','这是技能死亡，不是处决，不触发仅在处决时生效的能力。'],authorityWarnings:['说书人逐步确认换角、技能死亡及提名链，不进行普通投票处决。']})
    const isCorrect=(value:Record<string,any>)=>{
      const text=JSON.stringify(value)
      return /技能死亡.{0,12}不是处决/.test(text)&&!/被提名者立即处决|处决\/死亡|而非第3夜夜间|只能.{0,10}黎明/.test(text)
    }
    expect(isCorrect(old046)).toBe(false)
    const prompt=JSON.parse(buildNightSettlementProviderMessages(input)[1].content)
    expect(prompt.input.roleKnowledge.reminders).toEqual(expect.arrayContaining([expect.stringMatching(/不是处决.*不触发仅在处决时生效/)]))
    expect(prompt.input.roleKnowledge.reminders).toEqual(expect.arrayContaining([expect.stringMatching(/第3夜逐个唤醒爪牙.*当夜替换.*第3日稍后/)]))
    expect(isCorrect({...good,ruleFacts:[...good.ruleFacts,'而非第3夜夜间立即变更。']})).toBe(false)
    const normalized=await throughProvider(input,good)
    expect(boundaryErrors(normalized,'complete')).toEqual([])
    expect(isCorrect(normalized)).toBe(true)
  })
  it('does not invent an all-evil-survivors Riot ending and keeps final Demon death precedence (real 056)',async()=>{
    const input=request('riot')
    input.selectedTargets=[];input.draft.targets=[]
    input.draft.storytellerContext='常规第3日健康暴乱提名链，无相克或其他胜负来源。核对3名暴乱全活时是否已终局，以及下一次最后暴乱死亡后恰好只剩2名非恶魔活人的胜负。'
    const old056=complete({ruleFacts:['若所有存活玩家均为暴乱，则邪恶获胜。'],authorityWarnings:['全场暴乱全部死亡或仅剩暴乱存活时的全局胜负，须由说书人根据白天最终局面权威确认。']})
    const good=complete({summary:'3名暴乱仍活时继续提名链；最后暴乱死亡后只剩2名非恶魔活人仍善良获胜。',ruleFacts:['全部暴乱死亡的善良胜利优先于同时只剩2名活人的条件；仍有暴乱且仅剩2名玩家存活时邪恶获胜。']})
    const invalid=(d:Record<string,any>)=>/所有存活玩家均为暴乱.{0,12}邪恶获胜|仅剩暴乱存活时的全局胜负/.test(JSON.stringify(d))
    expect(invalid(old056)).toBe(true)
    expect(invalid(await throughProvider(input,old056))).toBe(true)
    const normalized=await throughProvider(input,good)
    expect(invalid(normalized)).toBe(false)
    expect(normalized.summary).toContain('最后暴乱死亡后只剩2名非恶魔活人仍善良获胜')
    const actual=JSON.parse(buildNightSettlementProviderMessages(input)[1].content)
    expect(actual.input.roleKnowledge.reminders).toHaveLength(3)
    expect(actual.input.roleKnowledge.reminders.join(' ')).toMatch(/3名及以上存活时.*不能.*全部是邪恶或暴乱/)
  })
})
