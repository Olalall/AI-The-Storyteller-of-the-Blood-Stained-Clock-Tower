import { beforeAll, describe, expect, it } from 'vitest'
import { createBatchContext } from './prepare-script-batch.mjs'
import { fillTemplateGaps } from './prepare-script-templates.mjs'
let context: ReturnType<typeof createBatchContext>
beforeAll(() => { context = createBatchContext(process.cwd()) }, 30000)
const common = ['chef','empath','fortuneteller','monk','soldier','washerwoman','librarian','investigator','undertaker','ravenkeeper','slayer','mayor','savant','dreamer','seamstress','oracle','drunk','recluse','saint','butler','mutant','klutz','poisoner','spy','witch','baron','godfather','scarletwoman','imp']
function prepare(roleId: string) {
  const source = { summoner:'ye-jing-geng-shen', kazali:'bai-zhou-wei-shi', legion:'bao-meng-mi-tuan', lordoftyphon:'yi-zhi-du-xiu', lilmonsta:'bao-meng-mi-tuan' }[roleId]!
  const refs = [...common, roleId].map(id => {
    const resolved = id === roleId ? context.library.resolve({ id, sourceId: source }) : context.library.resolve(id)
    return { id, sourceId: resolved.sourceId, sourceVersion: resolved.sourceVersion }
  })
  return fillTemplateGaps({ scriptId: 'special-fixture-'+roleId, displayName: roleId,
    source:{ url:'https://scripts.example.org/fixture',contentHash:'sha256:'+'f'.repeat(64),verifiedAt:'2026-10-21' },
    roleRefs:refs, fillTemplateGaps:true,
    nightOrders:Object.fromEntries(['firstNight','otherNight'].map(phase=>[phase,context.nightSheet[phase].filter(id=>refs.some(ref=>ref.id===id)).map((roleId,index)=>({roleId,order:index+1,knowledgeStatus:'confirmed'}))])) }, context)
}
describe('batch templates keep each special opening and production count contracts', () => {
  it.each(['kazali','summoner','legion','lordoftyphon','lilmonsta'])('%s has a legal special opening for every supported count', roleId => {
    const result=prepare(roleId), pack=context.createReferencedScriptPack(result.definition,context.library)
    expect(result.report.missingTemplateCounts).toEqual([])
    for(const count of result.definition.playerCounts){
      const templates=result.definition.setupTemplates.filter(t=>t.playerCount===count)
      expect(templates.length).toBeGreaterThanOrEqual(2)
      const special=templates.filter(t=>roleId==='lilmonsta'
        ? t.setupAdjustments?.some(a=>pack.setupRules.find(r=>r.id===a.ruleId)?.roleId===roleId)
        : t.roles.includes(roleId))
      expect(special.length, String(count)).toBeGreaterThan(0)
      for(const t of templates){
        expect(context.templateRoleSelectionValid(pack,t)).toBe(true)
        expect(context.validateTemplateComposition(context.normalizeImportedPack(pack),t).valid).toBe(true)
        expect(t.verified).toBe(false)
      }
      for(const t of special){
        const teams=t.roles.map(id=>pack.roles.find(r=>r.id===id)!.team)
        if(roleId==='kazali')expect(teams.filter(t=>t==='minion')).toHaveLength(0)
        if(roleId==='summoner'||roleId==='lilmonsta')expect(teams.filter(t=>t==='demon')).toHaveLength(0)
        if(roleId==='summoner'||roleId==='lilmonsta')expect(t.roles).not.toContain('marionette')
        if(roleId==='legion'){
          expect(t.roles.filter(id=>id==='legion').length).toBeGreaterThan(count/2)
          expect(t.repeatableRoles).toEqual(['legion'])
        }
        if(roleId==='lilmonsta')expect(t.bluffs).toEqual([])
      }
    }
    expect(result.definition.knowledgeStatus).toBe('needs-review')
  },30000)
})
