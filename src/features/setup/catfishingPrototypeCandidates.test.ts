import { describe, expect, it } from 'vitest'
import {
  catfishingPrototypeSeatProfiles,
  catfishingRoleTeamById,
  createCatfishingPrototypeCandidates,
  createSetupDraftFromCandidate,
  evaluateCatfishingSetup,
  hasBlockingSetupIssue,
  replaceDraftDemonBluff,
  selectSetupRuleChoice,
  validateCatfishingSetup,
} from './index'
import type { SetupTeam } from './types'

function twelveCandidate(candidateId: string) {
  const candidate = createCatfishingPrototypeCandidates(catfishingPrototypeSeatProfiles, { seed: 'stable-test' })
    .find((item) => item.id === candidateId)
  if (!candidate) throw new Error(`missing candidate: ${candidateId}`)
  return candidate
}

describe('Catfishing 7-15人配板候选', () => {
  it('生成三套合法且明确标记为 prototype 的12人候选', () => {
    const candidates = createCatfishingPrototypeCandidates(catfishingPrototypeSeatProfiles, { seed: '12-stable' })

    expect(candidates).toHaveLength(3)
    expect(new Set(candidates.map((candidate) => candidate.title))).toEqual(new Set([
      '耐玩均衡',
      '全员参与',
      '戏剧反转',
    ]))
    expect(new Set(candidates.map((candidate) => candidate.style))).toEqual(new Set([
      'balanced',
      'participation',
      'reversal',
    ]))

    candidates.forEach((candidate) => {
      expect(candidate.source).toBe('prototype')
      expect(candidate.scriptId).toBe('catfishing')
      expect(candidate.playerCount).toBe(12)
      expect(candidate.assignments).toHaveLength(12)
      expect(new Set(candidate.assignments.map((assignment) => assignment.seatId)).size).toBe(12)
      expect(new Set(candidate.assignments.map((assignment) => assignment.role.id)).size).toBe(12)
      expect(candidate.legalityChecks.every((check) => check.passed)).toBe(true)
      expect(candidate.rationale.summary).not.toBe('')
      expect(candidate.rationale.playerFit).not.toBe('')
      expect(candidate.rationale.risk).not.toBe('')

      const teamCounts: Record<SetupTeam, number> = {
        townsfolk: 0,
        outsider: 0,
        minion: 0,
        demon: 0,
      }
      const inPlay = new Set(candidate.assignments.map((assignment) => assignment.role.id))
      candidate.assignments.forEach((assignment) => {
        teamCounts[catfishingRoleTeamById[assignment.role.id]] += 1
      })
      const report = evaluateCatfishingSetup(
        candidate.assignments,
        candidate.demonBluffs,
        undefined,
        candidate.setupRuleSelections,
      )
      expect(teamCounts).toEqual(report.expectedCounts)
      expect(hasBlockingSetupIssue(report)).toBe(false)
      expect(candidate.demonBluffs).toHaveLength(3)
      expect(new Set(candidate.demonBluffs.map((role) => role.id)).size).toBe(3)
      candidate.demonBluffs.forEach((role) => {
        expect(catfishingRoleTeamById[role.id]).toBe('townsfolk')
        expect(inPlay.has(role.id)).toBe(false)
      })
      expect(candidate.demonBluffAdvice?.items.map((item) => item.role.id)).toEqual(candidate.demonBluffs.map((role) => role.id))
    })
  })

  it('将外来者修正纳入候选人数，而不是固定按12人7/2/2/1放行', () => {
    const candidates = createCatfishingPrototypeCandidates(catfishingPrototypeSeatProfiles, { seed: 'modifier-stable' })
    const balanced = candidates.find((candidate) => candidate.id === 'catfishing-12-balanced-prototype')!
    const participation = candidates.find((candidate) => candidate.id === 'catfishing-12-participation-prototype')!
    const reversal = candidates.find((candidate) => candidate.id === 'catfishing-12-reversal-prototype')!

    const balancedReport = evaluateCatfishingSetup(
      balanced.assignments,
      balanced.demonBluffs,
      undefined,
      balanced.setupRuleSelections,
    )
    const participationReport = evaluateCatfishingSetup(
      participation.assignments,
      participation.demonBluffs,
      undefined,
      participation.setupRuleSelections,
    )
    const reversalReport = evaluateCatfishingSetup(
      reversal.assignments,
      reversal.demonBluffs,
      undefined,
      reversal.setupRuleSelections,
    )

    expect(balancedReport.expectedCounts).toEqual({ townsfolk: 7, outsider: 2, minion: 2, demon: 1 })
    expect(participationReport.expectedCounts).toEqual({ townsfolk: 8, outsider: 1, minion: 2, demon: 1 })
    expect(reversalReport.expectedCounts).toEqual({ townsfolk: 6, outsider: 3, minion: 2, demon: 1 })
    expect(participationReport.activeSelections).toContainEqual({ ruleId: 'vigormortis-outsider', choiceId: 'remove-outsider' })
    expect(reversalReport.activeSelections).toContainEqual({ ruleId: 'fanggu-outsider', choiceId: 'add-outsider' })
  })

  it('改变需要说书人选择的人数修正时，只报告缺口，不替换草稿角色', () => {
    const candidate = twelveCandidate('catfishing-12-balanced-prototype')
    const draft = createSetupDraftFromCandidate(candidate, '2026-07-14T10:00:00.000Z')
    const changed = selectSetupRuleChoice(
      draft,
      'balloonist-outsider',
      'no-extra-outsider',
      '2026-07-14T10:01:00.000Z',
    )
    const report = evaluateCatfishingSetup(
      changed.assignments,
      changed.demonBluffs,
      undefined,
      changed.setupRuleSelections,
    )

    expect(report.expectedCounts).toEqual({ townsfolk: 8, outsider: 1, minion: 2, demon: 1 })
    expect(report.actualCounts).toEqual({ townsfolk: 7, outsider: 2, minion: 2, demon: 1 })
    expect(hasBlockingSetupIssue(report)).toBe(true)
    expect(changed.assignments).toEqual(draft.assignments)
  })

  it('伪装手动替换后重新校验，不会沿用候选建议当作事实', () => {
    const candidate = twelveCandidate('catfishing-12-balanced-prototype')
    const draft = createSetupDraftFromCandidate(candidate, '2026-07-14T10:00:00.000Z')
    const inPlayRole = draft.assignments[0].role
    const changed = replaceDraftDemonBluff(draft, 0, inPlayRole, '2026-07-14T10:01:00.000Z')
    const report = evaluateCatfishingSetup(
      changed.assignments,
      changed.demonBluffs,
      undefined,
      changed.setupRuleSelections,
    )

    expect(report.checks.find((item) => item.summary === '恶魔伪装可用')?.passed).toBe(false)
  })

  it('按座位经验分配复杂角色且不修改输入画像', () => {
    const input = catfishingPrototypeSeatProfiles.map((profile) => ({ ...profile }))
    const before = structuredClone(input)
    const candidates = createCatfishingPrototypeCandidates(input, { seed: 'experience-stable' })

    expect(input).toEqual(before)
    expect(candidates[0].rationale.playerFit).toContain('3个新手座')
    expect(candidates[0].rationale.playerFit).toContain('4个熟练座')
  })

  it('拒绝标准范围外或重复的座位画像', () => {
    expect(() => createCatfishingPrototypeCandidates(
      catfishingPrototypeSeatProfiles.slice(0, 6),
    )).toThrow('Catfishing 开局需要 7—15 人')

    const duplicated = catfishingPrototypeSeatProfiles.map((profile) => ({ ...profile }))
    duplicated[11].seatId = 1
    expect(() => createCatfishingPrototypeCandidates(duplicated)).toThrow('座位必须为 1 至 12 号')
  })

  it('支持7人和15人的已核对模板候选', () => {
    const sevenSeats = Array.from({ length: 7 }, (_value, index) => ({ seatId: index + 1, experience: 'regular' as const }))
    const fifteenSeats = Array.from({ length: 15 }, (_value, index) => ({ seatId: index + 1, experience: 'regular' as const }))

    const sevenCandidates = createCatfishingPrototypeCandidates(sevenSeats, { seed: '7-stable' })
    const fifteenCandidates = createCatfishingPrototypeCandidates(fifteenSeats, { seed: '15-stable' })

    expect(sevenCandidates).toHaveLength(3)
    expect(fifteenCandidates).toHaveLength(3)
    expect(sevenCandidates.every((candidate) => candidate.playerCount === 7)).toBe(true)
    expect(fifteenCandidates.every((candidate) => candidate.playerCount === 15)).toBe(true)
    expect(sevenCandidates.every((candidate) => candidate.legalityChecks.every((check) => check.passed))).toBe(true)
    expect(fifteenCandidates.every((candidate) => candidate.legalityChecks.every((check) => check.passed))).toBe(true)
  })

  it('??8????????????????', () => {
    const eightSeats = Array.from({ length: 8 }, (_value, index) => ({ seatId: index + 1, experience: 'regular' as const }))

    const candidates = createCatfishingPrototypeCandidates(eightSeats, { seed: '8-stable' })

    expect(candidates).toHaveLength(3)
    expect(candidates.every((candidate) => candidate.playerCount === 8)).toBe(true)
    expect(candidates.every((candidate) => candidate.legalityChecks.every((check) => check.passed))).toBe(true)
  })

  it('按本局座位集合校验草稿，而不是只校验座位数量', () => {
    const candidate = twelveCandidate('catfishing-12-balanced-prototype')
    const assignments = candidate.assignments.map((assignment) => ({
      seatId: assignment.seatId === 12 ? 13 : assignment.seatId,
      role: { ...assignment.role },
    }))
    const expectedSessionSeats = Array.from({ length: 12 }, (_value, index) => index + 1)
    const shiftedSessionSeats = [...Array.from({ length: 11 }, (_value, index) => index + 1), 13]

    const normalSeatCheck = validateCatfishingSetup(assignments, candidate.demonBluffs, expectedSessionSeats)
      .find((check) => check.id === 'seats')
    const shiftedSeatCheck = validateCatfishingSetup(assignments, candidate.demonBluffs, shiftedSessionSeats)
      .find((check) => check.id === 'seats')

    expect(normalSeatCheck?.passed).toBe(false)
    expect(shiftedSeatCheck?.passed).toBe(true)
  })

  it('从候选创建互不共享引用的可编辑草稿', () => {
    const candidate = twelveCandidate('catfishing-12-balanced-prototype')
    const updatedAt = '2026-07-13T12:00:00.000Z'
    const draft = createSetupDraftFromCandidate(candidate, updatedAt)
    const originalRoleName = candidate.assignments[0].role.name
    const originalBluffName = candidate.demonBluffs[0].name

    expect(draft.candidateId).toBe(candidate.id)
    expect(draft.revision).toBe(1)
    expect(draft.updatedAt).toBe(updatedAt)
    expect(draft.assignments).toEqual(candidate.assignments)
    expect(draft.demonBluffs).toEqual(candidate.demonBluffs)

    draft.assignments[0].role.name = '手动调整角色'
    draft.demonBluffs[0].name = '手动调整伪装'
    expect(candidate.assignments[0].role.name).toBe(originalRoleName)
    expect(candidate.demonBluffs[0].name).toBe(originalBluffName)
  })
})
