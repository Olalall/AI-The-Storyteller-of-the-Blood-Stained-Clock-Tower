import { expect, it } from 'vitest'
import { evaluateSetupRules, hasBlockingSetupIssue } from './setupRuleEvaluator'
import type { ScriptSetupRulePack } from './types'

it('counts in-play Baron plus an Alchemist-Baron as two separate +2 Outsider setup sources', () => {
  const ids = ['alchemist', 'outsider-a', 'outsider-b', 'outsider-c', 'outsider-d', 'baron', 'demon']
  const teamForRole = { alchemist: 'townsfolk', 'outsider-a': 'outsider', 'outsider-b': 'outsider', 'outsider-c': 'outsider', 'outsider-d': 'outsider', baron: 'minion', demon: 'demon' } as const
  const assignments = ids.map((id, index) => ({ seatId: index + 1, role: { id, name: id, initial: id[0], iconPath: '' } }))
  const rulePack: ScriptSetupRulePack = { scriptId: 'synthetic', version: '1',
    baseDistributionByPlayerCount: { 7: { townsfolk: 5, outsider: 0, minion: 1, demon: 1 } },
    modifiers: [{ id: 'baron-outsiders', roleId: 'baron', label: '男爵人数修正', choices: [{ id: 'add-two', label: '+2外来者', delta: { townsfolk: -2, outsider: 2 } }], requiresStorytellerChoice: false, source: 'https://wiki.bloodontheclocktower.com/Alchemist' }],
    conflicts: [], demonBluffPolicy: { count: 0, eligibleTeam: 'townsfolk', requireNotInPlay: true } }
  const input = { assignments, demonBluffs: [], expectedSeatIds: ids.map((_, i) => i + 1), playerCount: 7, teamForRole, rulePack, selections: [{ ruleId: 'baron-outsiders', choiceId: 'add-two' }] }
  expect(hasBlockingSetupIssue(evaluateSetupRules(input))).toBe(true)
  const report = evaluateSetupRules({ ...input, additionalModifierRoleIds: ['baron'] })
  expect(report.expectedCounts).toEqual({ townsfolk: 1, outsider: 4, minion: 1, demon: 1 })
  expect(hasBlockingSetupIssue(report)).toBe(false)
  expect(new Set(report.checks.map(c => c.id)).size).toBe(report.checks.length)
})
