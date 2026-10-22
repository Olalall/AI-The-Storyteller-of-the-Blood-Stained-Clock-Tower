import { expect, it } from 'vitest'
import { smartScriptPacks as sourcePacks } from '../../domain/scripts/allPacks'
import type { SmartScriptPack } from '../../domain/scripts'
import { getSmartScriptPack, roleSnapshotsForScript, scriptManifest } from '../../domain/scripts'
import { createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { projectCurrentAssignments } from '../game-session/state/projectors'
import { parseSessionBackup } from '../../services/session/sessionBackup'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from './smartScriptSetupCandidates'
import { hasHereticConflict } from '../../domain/setup-templates/normalizeHereticTemplate'
const originalPacks: readonly SmartScriptPack[] = sourcePacks

it('every visible candidate avoids hard Heretic conflicts, including manually edited new drafts', () => {
  for (const source of originalPacks.filter(p=>p.roles.some(r=>r.id==='heretic'))) {
    const pack=getSmartScriptPack(source.scriptId)
    expect(pack.setupTemplates.every(t=>!hasHereticConflict(t.roles)),source.scriptId).toBe(true)
    const bad=source.setupTemplates.find(t=>hasHereticConflict(t.roles))
    if(!bad)continue
    const snapshots=roleSnapshotsForScript(pack.scriptId),assignments=bad.roles.map((id,index)=>({seatId:index+1,role:snapshots.find(r=>r.id===id)!}))
    const report=evaluateSmartScriptSetup(pack.scriptId,assignments,[],assignments.map(a=>a.seatId),bad.setupAdjustments?.flatMap(a=>a.choiceId?[{ruleId:a.ruleId,choiceId:a.choiceId}]:[])??[])
    expect(report.checks.some(c=>c.id.startsWith('conflict-heretic-')&&c.status==='fail')).toBe(true)
  }
  expect(scriptManifest.find(p=>p.scriptId==='wiki-221e26eff16e4ac4')?.playerCounts).not.toContain(15)
})

it.each(['si-zui-chan-hui-ri','wiki-221e26eff16e4ac4'])('preserves already confirmed legacy %s games and restores every stored assignment byte-for-byte', id => {
  const source=originalPacks.find(p=>p.scriptId===id)!,template=source.setupTemplates.find(t=>t.playerCount===15)!
  const session=createSmartScriptSetupSession('catfishing','2026-10-21T00:00:00Z',{playerCount:15}),snapshots=roleSnapshotsForScript(id)
  session.scriptId=id;session.nightRuns={};session.activeNightRunId=null;session.phaseSegments=[]
  session.timeline=[{kind:'setup_confirmed',id:'legacy-setup',segmentId:null,createdAt:'2026-10-21T00:00:00Z',confirmedBy:'storyteller',setup:{id:'legacy-setup',confirmedAt:'2026-10-21T00:00:00Z',draft:{
    candidateId:template.templateId,revision:1,updatedAt:'2026-10-21T00:00:00Z',assignments:template.roles.map((roleId,index)=>({seatId:index+1,role:{...snapshots.find(r=>r.id===roleId)!}})),
    demonBluffs:template.bluffs.map(roleId=>({...snapshots.find(r=>r.id===roleId)!})),setupRuleSelections:template.setupAdjustments?.flatMap(a=>a.choiceId?[{ruleId:a.ruleId,choiceId:a.choiceId}]:[])??[],
  }}}]
  const original=JSON.stringify(session),restored=parseSessionBackup(original)
  expect(JSON.stringify(restored)).toBe(original)
  expect(projectCurrentAssignments(restored).map(a=>a.role.id)).toEqual(template.roles)
  if(id==='si-zui-chan-hui-ri'){
    expect(projectCurrentAssignments(restored).some(a=>a.role.id==='lilmonsta')).toBe(true)
    const candidates=createSmartScriptSetupCandidates(id,Object.values(session.seats))
    expect(candidates.every(c=>c.assignments.every(a=>a.role.id!=='lilmonsta')&&c.demonBluffs.length===0)).toBe(true)
  }
})
