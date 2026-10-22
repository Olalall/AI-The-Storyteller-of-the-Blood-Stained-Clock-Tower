import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import sources from '../../../dev-docs/script-import-work/wiki-batch-06/sources.json' with { type: 'json' }
import { smartScriptPacks } from './allPacks'
import { smartScriptRegistry } from './catalog'
import { getSmartScriptPack } from './index'
import { normalizeImportedPack } from './normalizeImportedPack'
import type { ReferencedScriptDefinition } from './referencedScriptPack'
import type { PlayerCount } from './types'
import officialNightSheet from '../../features/night-workbench/data/official/nightsheet.json'
import { createSmartScriptSetupSession } from '../../features/game-session/data/createPrototypeSession'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from '../../features/setup/smartScriptSetupCandidates'
import { createSetupDraftFromCandidate } from '../../features/setup/setupDraft'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { createSmartScriptNightQueue } from '../../features/game-session/state/createNextNightRun'
import { projectCurrentAssignments } from '../../features/game-session/state/projectors'
import { parseSessionBackup } from '../../services/session/sessionBackup'

const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const file = (id: string, name: string) => readFileSync(resolve('src/domain/scripts/packs', id, name))
const counts = [7, 8, 9, 10, 11, 12, 13, 14, 15] as const
const minimum = [3, 2, 2, 3, 2, 3, 2, 2, 3]
const at = '2026-10-21T00:00:00.000Z'
for (const row of sources.boards) {
  const pack = smartScriptPacks.find((pack) => pack.scriptId === row.scriptId)
  if (pack && !smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
}

describe('batch 06 reuses existing definitions and validates each board separately', () => {
  it('has nineteen new combinations and fifty explicit current jinxes', () => {
    expect(sources.boards).toHaveLength(19)
    expect(new Set(sources.boards.map((row) => row.scriptId)).size).toBe(19)
    expect(sources.boards.reduce((sum, row) => sum + row.roleCount, 0)).toBe(478)
    expect(sources.boards.reduce((sum, row) => sum + row.jinxCount, 0)).toBe(50)
    expect(sources.heldCandidates).toHaveLength(1)
  })

  for (const row of sources.boards) {
    it(`${row.scriptId} preserves source bytes, metadata and every shared role pin`, () => {
      const pack = getSmartScriptPack(row.scriptId)
      const definition = JSON.parse(file(row.scriptId, 'definition.json').toString()) as ReferencedScriptDefinition
      const lock = JSON.parse(file(row.scriptId, 'source-lock.json').toString())
      const raw = file(row.scriptId, 'source.json'), parsed = JSON.parse(raw.toString().replace(/^\uFEFF/, ''))
      expect(sha(raw)).toBe(row.rawJsonSha256)
      expect(lock.rawJsonSha256).toBe(row.rawJsonSha256)
      expect(lock.rawJsonByteLength).toBe(raw.length)
      expect(definition.source.contentHash).toBe(`sha256:${row.rawJsonSha256}`)
      expect(lock.authorMetadata).toEqual(parsed.find((entry: { id?: string }) => entry.id === '_meta') ?? null)
      expect(pack.roles).toHaveLength(row.roleCount)
      expect(definition.knowledgeStatus).toBe('confirmed')
      expect(definition.roleRefs).toHaveLength(row.roleCount)
      for (const ref of definition.roleRefs) {
        if (typeof ref === 'string') throw new Error('This batch requires explicit source and version pins')
        expect(ref.sourceId).not.toBe(row.scriptId)
        const origin = smartScriptPacks.find((source) => source.scriptId === ref.sourceId)!
        expect(origin?.source.contentHash).toBe(ref.sourceVersion)
        expect(normalizeImportedPack(origin).roles.find((role) => role.id === ref.id)).toEqual(pack.roles.find((role) => role.id === ref.id))
        expect(definition.roleDefinitionHashes?.[ref.id]).toMatch(/^sha256:[a-f0-9]{64}$/)
      }
      for (const phase of ['firstNight', 'otherNight'] as const) {
        expect(pack.nightOrders[phase].map((entry) => entry.roleId)).toEqual(officialNightSheet[phase].filter((id) => pack.roles.some((role) => role.id === id)))
      }
      expect(lock.authorRuleEntries).toEqual(parsed.filter((entry: { team?: string }) => entry.team === 'a jinxed'))
      expect(lock.authorRuleEntries).toHaveLength(row.authorRuleCount)
      expect(lock.authorRuleReviewCompleted).toBe(true)
      expect(lock.roleAliases.every((alias: { aliasReviewed?: boolean; abilityTextReviewed?: boolean }) => alias.aliasReviewed && alias.abilityTextReviewed)).toBe(true)
      expect(lock.currentJinxes).toHaveLength(row.jinxCount)
      for (const pair of lock.currentJinxes) {
        expect(pack.setupRules.find((rule) => rule.id === `${pair.roleId}-${pair.withRoleId}-jinx`)).toMatchObject({ summary: pair.reason, knowledgeStatus: 'confirmed' })
      }
    })

    it(`${row.scriptId} opens all 22 templates for all counts, both seat mixes and both seeds`, () => {
      const pack = getSmartScriptPack(row.scriptId)
      expect(pack.setupTemplates).toHaveLength(22)
      expect(new Set(pack.setupTemplates.map((t) => JSON.stringify([t.playerCount, [...t.roles].sort()]))).size).toBe(22)
      for (const [index, count] of counts.entries()) for (const mixed of [false, true]) for (const seed of ['first', 'second']) {
        const empty = createSmartScriptSetupSession(row.scriptId, at, { playerCount: count as PlayerCount })
        const profiles = Object.values(empty.seats).map((seat, index) => ({ ...seat,
          experience: mixed ? index % 3 === 0 ? 'new' as const : index % 3 === 1 ? 'veteran' as const : 'regular' as const : 'regular' as const }))
        const candidates = createSmartScriptSetupCandidates(row.scriptId, profiles, { count: 100, seed })
        expect(candidates).toHaveLength(minimum[index])
        expect(candidates.map((candidate) => candidate.id).sort()).toEqual(pack.setupTemplates.filter((t) => t.playerCount === count).map((t) => t.templateId).sort())
        for (const candidate of candidates) {
          expect(evaluateSmartScriptSetup(row.scriptId, candidate.assignments, candidate.demonBluffs,
            profiles.map((profile) => profile.seatId), candidate.setupRuleSelections).checks.filter((check) => !check.passed)).toEqual([])
          if (mixed || seed !== 'first') continue
          const draft = gameSessionReducer(empty, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, at) })
          const confirmed = gameSessionReducer(draft, { type: 'confirm-setup', id: candidate.id, confirmedAt: at })
          expect(projectCurrentAssignments(confirmed)).toEqual(candidate.assignments)
          for (const sequence of [1, 2]) {
            const orders = sequence === 1 ? pack.nightOrders.firstNight : pack.nightOrders.otherNight
            const expected = orders.flatMap((order) => {
              const actors = candidate.assignments.filter(entry => entry.role.id === order.roleId)
              return order.roleId === 'snitch' && actors.length
                ? candidate.assignments.filter(a => a.role.id !== 'marionette' && pack.roles.find(r => r.id === a.role.id)?.team === 'minion').map(()=>'snitch')
                : actors.map(()=>order.roleId)
            })
            const queue = createSmartScriptNightQueue(confirmed, candidate.assignments, confirmed.initialPlayerStates, `night-${sequence}`, sequence)
            expect(queue.filter((entry) => !entry.id.includes('-pretend-')).map((entry) => entry.systemStep?.kind === 'audience_notice'
              ? entry.roleId.replace(/^system-audience-/, '') : entry.roleId)).toEqual(expected)
          }
          expect(parseSessionBackup(JSON.stringify(confirmed))).toEqual(confirmed)
        }
      }
    })
  }
})
