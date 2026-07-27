import { describe, expect, it } from 'vitest'
import { roleTeamByIdForScript, type ScriptId } from '../../domain/scripts'
import { createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { createNextNightRun } from '../game-session/state/createNextNightRun'
import { createSmartScriptSetupCandidates, evaluateSmartScriptSetup } from './smartScriptSetupCandidates'
import type { SetupSeatProfile, SetupTeam } from './types'

function makeProfiles(playerCount: number): SetupSeatProfile[] {
  return Array.from({ length: playerCount }, (_value, index) => ({
    seatId: index + 1,
    experience: index % 4 === 0 ? 'new' : index % 3 === 0 ? 'veteran' : 'regular',
  }))
}

const profiles: SetupSeatProfile[] = makeProfiles(12)

const firstBatchScriptIds = [
  'trouble-brewing',
  'bad-moon-rising',
  'sects-and-violets',
  'one-in-one-out',
  'a-grimm-chorus',
  'hide-and-seek',
  'lunar-eclipse',
  'punchy',
  'quick-maths',
  'devout-theists',
] as const

const playablePlayerCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15] as const

const firstBatchScriptPlayerCountCases = firstBatchScriptIds.flatMap((scriptId) =>
  playablePlayerCounts.map((playerCount) => ({ scriptId, playerCount })),
)

function assertPlayableCandidates(
  scriptId: ScriptId,
  seatProfiles: readonly SetupSeatProfile[],
  minCandidateCount = 2,
) {
  const candidates = createSmartScriptSetupCandidates(scriptId, seatProfiles, {
    seed: `${scriptId}-${seatProfiles.length}-stable`,
  })

  expect(candidates.length).toBeGreaterThanOrEqual(minCandidateCount)
  expect(candidates.length).toBeLessThanOrEqual(3)
  expect(candidates.every((candidate) => candidate.scriptId === scriptId)).toBe(true)
  expect(candidates.every((candidate) => candidate.assignments.length === seatProfiles.length)).toBe(true)
  expect(candidates.every((candidate) => candidate.demonBluffs.length === 3)).toBe(true)

  const teamByRoleId = roleTeamByIdForScript(scriptId) as Readonly<Record<string, SetupTeam>>
  for (const candidate of candidates) {
    const inPlay = new Set(candidate.assignments.map((assignment) => assignment.role.id))
    expect(candidate.demonBluffs.every((role) => teamByRoleId[role.id] === 'townsfolk' && !inPlay.has(role.id))).toBe(true)
    expect(evaluateSmartScriptSetup(
      scriptId,
      candidate.assignments,
      candidate.demonBluffs,
      seatProfiles.map((profile) => profile.seatId),
      candidate.setupRuleSelections,
      candidate.repeatableRoleIds,
    ).checks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
  }
}

describe('smart script setup candidates', () => {
  it.each(firstBatchScriptIds)('generates playable setup candidates for %s', (scriptId) => {
    assertPlayableCandidates(scriptId, profiles, 3)
  })

  it.each(firstBatchScriptPlayerCountCases)('generates legal setup candidates for $scriptId / $playerCount players', ({ scriptId, playerCount }) => {
    assertPlayableCandidates(scriptId, makeProfiles(playerCount))
  })

  it('supports Riot templates with explicit repeatable role slots', () => {
    const candidates = createSmartScriptSetupCandidates('xian-xiang-huan-sheng', makeProfiles(12), {
      seed: 'riot-repeatable-12',
    })

    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates[0].repeatableRoleIds).toContain('riot')
    expect(candidates[0].assignments.filter((assignment) => assignment.role.id === 'riot').length).toBeGreaterThan(1)
    expect(candidates[0].legalityChecks.some((check) => check.status === 'fail' || check.status === 'needs_choice')).toBe(false)
  })

  it('creates a generic night queue for official basic scripts instead of falling back to Catfishing', () => {
    const session = createSmartScriptSetupSession('trouble-brewing', '2026-07-20T00:00:00.000Z', {
      playerCount: 12,
      seats: profiles,
    })
    const candidate = createSmartScriptSetupCandidates('trouble-brewing', profiles, { seed: 'tb-night' })[0]
    const confirmedSession = {
      ...session,
      timeline: [{
        id: 'setup-entry',
        kind: 'setup_confirmed' as const,
        segmentId: null,
        createdAt: '2026-07-20T00:01:00.000Z',
        confirmedBy: 'storyteller' as const,
        setup: {
          id: 'setup-1',
          confirmedAt: '2026-07-20T00:01:00.000Z',
          draft: {
            candidateId: candidate.id,
            revision: 1,
            assignments: candidate.assignments,
            demonBluffs: candidate.demonBluffs,
            setupRuleSelections: candidate.setupRuleSelections,
            setupRulePackVersion: candidate.setupRulePackVersion,
            updatedAt: '2026-07-20T00:01:00.000Z',
          },
        },
      }],
    }

    const run = createNextNightRun(confirmedSession)

    expect(run?.scriptId).toBe('trouble-brewing')
    expect(run?.nightType).toBe('first')
    expect(run?.queue.length).toBeGreaterThan(0)
    expect(run?.queue.every((item) => item.id.startsWith('trouble-brewing-night-1-'))).toBe(true)
  })
})
