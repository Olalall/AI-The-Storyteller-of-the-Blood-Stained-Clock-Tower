import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleAbilityForScript } from '../../domain/scripts'
import { buildNightSettlementRequest } from './contextBuilder'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import { parseSessionBackup } from '../session/sessionBackup'
import { createSmartScriptSetupSession } from '../../features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { playerFacingIdentity } from '../../features/identity-deal/identityProjection'
import { createSetupDraftFromCandidate } from '../../features/setup/setupDraft'
import { createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { actNight, projected } from '../../features/night-workbench/state/nightInformation.test-support'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'

const at = '2026-10-16T13:00:00.000Z'

function sessionWithRole(scriptId: string, roleId: string) {
  const template = getSmartScriptPack(scriptId).setupTemplates.find((entry) => entry.roles.includes(roleId))!
  let session = createSmartScriptSetupSession(scriptId, at, { playerCount: template.playerCount })
  const candidate = createSmartScriptSetupCandidates(scriptId, Object.values(session.seats), { count: 99, seed: 'investigator-copy' })
    .find((entry) => entry.id === template.templateId)!
  expect(candidate).toBeDefined()
  session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
  session = gameSessionReducer(session, { type: 'confirm-setup', id: 'ability-copy-setup', confirmedAt: at })
  session = gameSessionReducer(session, { type: 'start-next-night-run' })
  const item = projected(session).queue.find((entry) => entry.roleId === roleId)!
  return actNight(actNight(session, { type: 'preview', id: item.id }), { type: 'activate-preview' })
}

describe('current Investigator ability through real identity, queue and AI projections', () => {
  it.each(['mu-hou-cao-kong', 'trouble-brewing'])('%s removes the non-official no-Minion branch without changing Librarian', async (scriptId) => {
    // https://wiki.bloodontheclocktower.com/Investigator — two players and one particular Minion.
    for (const roleId of ['investigator', 'librarian']) {
      const session = sessionWithRole(scriptId, roleId)
      const state = projected(session), item = state.queue.find((entry) => entry.roleId === roleId)!
      const ability = roleAbilityForScript(scriptId, roleId)
      expect(playerFacingIdentity(session, item.seatId).ability).toBe(ability)
      expect(item.ability).toBe(ability)
      const input = { state, item, draft: emptyWakeDraft() }
      expect(buildNightSettlementRequest(input).context.wakeItem.ability).toBe(ability)
      let capturedAbility: string | undefined
      await createNightResultAdviceAsync(input, {
        runtimeSettings: { mode: 'http', baseUrl: 'https://example.invalid', timeoutMs: 2000 },
        fetcher: async (_url, init) => {
          capturedAbility = JSON.parse(String(init?.body)).wakeItem.ability
          return new Response('{}', { status: 401 })
        },
      })
      expect(capturedAbility).toBe(ability)
      if (roleId === 'investigator') {
        expect(ability).toContain('两名玩家中有一名是某个爪牙')
        expect(ability).not.toMatch(/没有爪牙|无爪牙/)
      } else {
        expect(ability).toContain('若无外来者，可得知没有外来者')
      }
    }
  })

  it('preserves saved old queue text and confirmed snapshots instead of rewriting history', () => {
    let session = sessionWithRole('mu-hou-cao-kong', 'investigator')
    const run = session.nightRuns[session.activeNightRunId!]
    const item = run.queue.find((entry) => entry.roleId === 'investigator')!
    item.ability = '首夜得知两名玩家中有一名是某个爪牙（或者你会得知没有爪牙在场）。'
    session = actNight(session, { type: 'target', seatId: 1 })
    session = actNight(session, { type: 'target', seatId: 2 })
    session = actNight(session, { type: 'role-choice', roleId: 'poisoner' })
    session = actNight(session, { type: 'outcome', outcomeId: 'record' })
    session = actNight(session, { type: 'confirm', advance: false })
    const state = projected(session)
    expect(state.confirmedRecords[item.id]).toHaveLength(1)
    const before = JSON.stringify(session), restored = parseSessionBackup(before)
    expect(JSON.stringify(restored)).toBe(before)
    expect(projected(restored).queue.find((entry) => entry.id === item.id)?.ability).toContain('没有爪牙')
    expect(projected(restored).confirmedRecords[item.id]).toEqual(state.confirmedRecords[item.id])
    expect(roleAbilityForScript('mu-hou-cao-kong', 'investigator')).not.toContain('没有爪牙')
  })
})
