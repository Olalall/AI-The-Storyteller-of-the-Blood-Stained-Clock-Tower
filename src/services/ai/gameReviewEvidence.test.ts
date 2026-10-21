import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../archive'
import { createLocalGameReviewDraft } from './gameReviewProjection'
import { gameReviewEvidence, keyGameReviewEvidence, reviewEvidenceExcerpts, reviewModelMissing, validReviewInterpretations } from './gameReviewEvidence'

function fixture() {
  const session = createPrototypeGameSession()
  const base = { segmentId: 'night-3', confirmedBy: 'storyteller' as const }
  session.timeline = [
    ...Array.from({ length: 8 }, (_, index) => ({
      ...base, id: `early-${index}`, kind: 'day_action' as const, category: 'public_event' as const,
      actorSeatId: null, targetSeatIds: [12], summary: '12号公开事件', details: [], createdAt: `2026-07-13T00:0${index}:00Z`,
    })),
    { ...base, id: 'original-11', kind: 'day_action', category: 'public_event', actorSeatId: null,
      targetSeatIds: [11], summary: '11号原记录', details: [], createdAt: '2026-07-13T01:00:00Z' },
    { ...base, id: 'corrected-11', kind: 'day_action', category: 'public_event', actorSeatId: null,
      targetSeatIds: [11], summary: '11号更正事实', details: [], correctionOf: 'original-11', correctionReason: '原先写错',
      createdAt: '2026-07-13T02:00:00Z' },
    { ...base, id: 'execution-12', kind: 'execution', executedSeatId: 12, causedDeath: false, createdAt: '2026-07-13T03:00:00Z' },
  ]
  return createGameArchiveRecord({ session, winner: 'good' })
}

describe('review evidence projection', () => {
  it('reconstructs corrections from an old archive whose summary missed withdrawn votes', () => {
    const archive = fixture()
    archive.summary.corrections = 0
    expect(createLocalGameReviewDraft(archive).evaluation.correction).toContain('1条更正（含撤销）')
    expect(archive.summary.corrections).toBe(0)
  })
  it('prioritizes later corrections and execution, retaining original facts and exact structural seats', () => {
    const archive = fixture()
    const before = JSON.stringify(archive)
    const evidence = keyGameReviewEvidence(archive)
    expect(evidence.map((item) => item.recordId)).toEqual(expect.arrayContaining(['original-11', 'corrected-11', 'execution-12']))
    expect(evidence.find((item) => item.recordId === 'original-11')?.superseded).toBe(true)
    expect(evidence.find((item) => item.recordId === 'corrected-11')).toMatchObject({ correctionOf: 'original-11', seatIds: [11] })
    expect(evidence.find((item) => item.recordId === 'execution-12')?.details).toContain('本次处决未造成死亡')
    const draft = createLocalGameReviewDraft(archive)
    expect(draft.playerScores.find((player) => player.seatId === 1)?.keyEvents).toEqual([])
    expect(draft.playerScores.find((player) => player.seatId === 11)).toMatchObject({ activity: 1 })
    expect(draft.playerScores.find((player) => player.seatId === 11)?.keyEvents.join()).toContain('corrected-11')
    expect(JSON.stringify(archive)).toBe(before)
  })

  it('rejects invented, mixed or superseded citations instead of silently repairing them', () => {
    const archive = fixture()
    const evidence = gameReviewEvidence(archive)
    expect(validReviewInterpretations([
      { recordIds: ['corrected-11'], explanation: '需要核对现场。' },
      { recordIds: ['made-up'], explanation: '伪造引用' },
      { recordIds: ['corrected-11', 'made-up'], explanation: '混合引用' },
      { recordIds: ['original-11'], explanation: '过期现状' },
      { recordIds: [], explanation: '无依据' },
      null,
    ], evidence)).toEqual([{ recordIds: ['corrected-11'], explanation: '需要核对现场。' }])
  })

  it('does not turn an empty log or absence of corrections into a competence judgment', () => {
    const archive = fixture()
    archive.session.timeline = []
    archive.timeline = []
    archive.summary.records = 0
    archive.summary.corrections = 0
    const draft = createLocalGameReviewDraft(archive)
    expect(draft.keyEvents).toEqual([])
    expect(draft.interpretations).toEqual([])
    expect(draft.evaluation.correction).not.toContain('稳定性较好')
    expect(draft.missing.join()).toContain('不能据此判断玩家能力')
  })

  it('ignores unknown future timeline kinds without failing a legacy archive review', () => {
    const archive = fixture()
    archive.session.timeline.push({ kind: 'future_action', id: 'future-record' } as unknown as typeof archive.session.timeline[number])
    expect(() => gameReviewEvidence(archive)).not.toThrow()
    expect(gameReviewEvidence(archive).some((entry) => entry.recordId === 'future-record')).toBe(false)
  })

  it('bounds model excerpts and output without truncating local facts or accepting an omitted record ID', () => {
    const longFact = '长备注'.repeat(1000)
    const evidence = Array.from({ length: 30 }, (_, index) => ({
      recordId: `record-${index}`, fact: longFact, phaseLabel: '第1夜', details: Array(20).fill(longFact),
      seatIds: [11], superseded: index < 29, correctionOf: index ? `record-${index - 1}` : undefined,
    }))
    const sent = reviewEvidenceExcerpts(evidence)
    expect(sent).toHaveLength(12)
    expect(sent.at(-1)?.fact).toHaveLength(600)
    expect(sent.at(-1)?.details).toHaveLength(6)
    expect(sent.at(-1)?.details[0]).toHaveLength(300)
    expect(evidence[0].fact).toBe(longFact)
    const explanations = validReviewInterpretations([
      { recordIds: ['record-0'], explanation: '没有发送的记录' },
      ...Array.from({ length: 20 }, () => ({ recordIds: ['record-29'], explanation: longFact })),
    ], sent)
    expect(explanations).toHaveLength(6)
    expect(explanations[0].explanation).toHaveLength(1200)
    expect(reviewModelMissing(Array(30).fill(longFact))).toHaveLength(8)
    expect(reviewModelMissing([longFact])[0]).toHaveLength(400)
  })
  it('shows withdrawn and adjusted vote evidence but never uses withdrawn votes as current AI support or activity', () => {
    const archive = fixture()
    archive.session.timeline = [
      { id: 'withdrawn', kind: 'vote_round', roundId: 'round', segmentId: 'night-3', createdAt: '2026-10-16T00:00:00Z', confirmedBy: 'storyteller', nominatorSeatId: 1, nomineeSeatId: 2, threshold: 4, raisedSeatIds: [1], ghostVoteSeatIds: [], voided: true, voteAdjustment: { count: 2, reason: '额外票' } },
      { id: 'special', kind: 'execution', executedSeatId: 3, causedDeath: false, exceptionReason: '特殊能力即时处决', segmentId: 'night-3', createdAt: '2026-10-16T00:01:00Z', confirmedBy: 'storyteller' },
    ]
    const evidence = gameReviewEvidence(archive)
    expect(evidence.find((entry) => entry.recordId === 'withdrawn')).toMatchObject({ voided: true, fact: '已撤销：1号提名2号 · 3票' })
    expect(evidence.find((entry) => entry.recordId === 'special')?.details).toContain('特殊处决原因：特殊能力即时处决')
    expect(validReviewInterpretations([{ recordIds: ['withdrawn'], explanation: '已经撤销不能作为现状' }], evidence)).toEqual([])
    expect(createLocalGameReviewDraft(archive).playerScores.find((player) => player.seatId === 1)?.activity).toBe(0)
  })
})
