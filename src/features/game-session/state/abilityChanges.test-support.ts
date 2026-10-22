import { smartScriptRegistry } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { createSmartScriptSetupCandidates } from '../../setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../setup/setupDraft'
import { gameSessionReducer } from './sessionReducer'

export function abilityFixture(sourceId: string, abilityId: string, requireInPlay = false, playerCount?: number) {
  for (const pack of smartScriptRegistry.all().filter(p => p.roles.some(r => r.id === sourceId) && p.roles.some(r => r.id === abilityId))) {
    const template = pack.setupTemplates.find(t => (playerCount === undefined || t.playerCount === playerCount) && t.roles.includes(sourceId)
      && (sourceId !== 'snitch' || t.roles.some(id=>pack.roles.find(r=>r.id===id)?.team==='minion'))
      && (requireInPlay ? t.roles.includes(abilityId) : !t.roles.includes(abilityId)))
    if (!template) continue
    const at = '2026-10-22T00:00:00.000Z'
    let session = createSmartScriptSetupSession(pack.scriptId, at, { playerCount: template.playerCount })
    const candidate = createSmartScriptSetupCandidates(pack.scriptId, Object.values(session.seats), { seed: 'ability-regression', count: 100 })
      .find(c => c.id === template.templateId)!
    session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
    session = gameSessionReducer(session, { type: 'confirm-setup', id: 'ability-setup', confirmedAt: at })
    session = gameSessionReducer(session, { type: 'start-next-night-run' })
    return session
  }
  throw new Error(`No legal ability fixture for ${sourceId}/${abilityId}`)
}
