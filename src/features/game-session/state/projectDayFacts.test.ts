import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'
import { RETROSPECTIVE_ROLE_IDS, projectDayFacts, shouldShowDayFacts } from './projectDayFacts'

type Session = ReturnType<typeof createPrototypeGameSession>

function dayWith(entries: unknown[]): Session {
  const base = { ...createPrototypeGameSession(), phaseSegments: [], timeline: [] } as Session
  const opened = gameSessionReducer(base, {
    type: 'open-phase-segment', phaseKind: 'day', createdAt: '2026-08-05T09:00:00.000Z',
  })
  const dayId = opened.phaseSegments.find((segment) => segment.kind === 'day')!.id
  return {
    ...opened,
    timeline: entries.map((entry, index) => ({
      segmentId: dayId,
      createdAt: `2026-08-05T09:0${index + 1}:00.000Z`,
      confirmedBy: 'storyteller',
      ...(entry as object),
    })),
  } as Session
}

describe('projectDayFacts', () => {
  it('returns null before any day has happened', () => {
    const blank = { ...createPrototypeGameSession(), phaseSegments: [], timeline: [] } as Session
    expect(projectDayFacts(blank)).toBeNull()
  })

  it('reports the execution, its outcome and the nominations', () => {
    const facts = projectDayFacts(dayWith([
      { id: 'v1', kind: 'vote_round', roundId: 'r1', nominatorSeatId: 3, nomineeSeatId: 7, threshold: 6, raisedSeatIds: [1, 2, 3], ghostVoteSeatIds: [] },
      { id: 'e1', kind: 'execution', executedSeatId: 7, causedDeath: true },
    ]))

    expect(facts?.execution).toContain('7号')
    expect(facts?.execution).toContain('造成死亡')
    expect(facts?.nominations).toEqual(['3→7'])
  })

  it('distinguishes an execution that did not cause death', () => {
    const facts = projectDayFacts(dayWith([
      { id: 'e1', kind: 'execution', executedSeatId: 7, causedDeath: false },
    ]))
    expect(facts?.execution).toContain('未造成死亡')
  })

  it('states facts only — no advice verbs that would pre-judge the settlement', () => {
    // 说书人可能因为红鲱鱼、登记异常或中毒醉酒得出与字面事实不同的结论；
    // 事实条一旦出现「应该/建议/需要」就等于替他推了一步。
    const facts = projectDayFacts(dayWith([
      { id: 'v1', kind: 'vote_round', roundId: 'r1', nominatorSeatId: 3, nomineeSeatId: 7, threshold: 6, raisedSeatIds: [1], ghostVoteSeatIds: [] },
      { id: 'e1', kind: 'execution', executedSeatId: 7, causedDeath: true },
      { id: 'd1', kind: 'day_action', category: 'public_event', actorSeatId: 2, targetSeatIds: [], summary: '2号公开宣称自己是猎手', details: [] },
    ]))
    const text = JSON.stringify(facts)
    for (const verb of ['应该', '建议', '需要', '推荐', '可以看']) {
      expect(text, verb).not.toContain(verb)
    }
  })

  it('keeps the retrospective role list aligned with the wiki', () => {
    for (const roleId of ['undertaker', 'juggler', 'gossip', 'flowergirl', 'towncrier', 'moonchild']) {
      expect(RETROSPECTIVE_ROLE_IDS.has(roleId), roleId).toBe(true)
    }
    // 非回溯型角色不得混进来，否则每张卡都会挂一条无关事实条。
    for (const roleId of ['washerwoman', 'imp', 'poisoner', 'monk']) {
      expect(RETROSPECTIVE_ROLE_IDS.has(roleId), roleId).toBe(false)
    }
  })

  it('never mutates the session', () => {
    const session = dayWith([{ id: 'e1', kind: 'execution', executedSeatId: 7, causedDeath: true }])
    const snapshot = JSON.stringify(session)
    projectDayFacts(session)
    expect(JSON.stringify(session)).toBe(snapshot)
  })
})

describe('事实条的显示条件', () => {
  const facts = { dayLabel: '第3天', execution: '7号 · 造成死亡', nominations: ['3→7'], publicEvents: [] }

  it('shows only for retrospective roles', () => {
    expect(shouldShowDayFacts('undertaker', false, facts)).toBe(true)
    expect(shouldShowDayFacts('washerwoman', false, facts)).toBe(false)
  })

  it('never renders while the grimoire is shielded', () => {
    // 遮蔽态优先于一切：秘密内容必须整块不进 DOM，不能只靠 CSS 隐藏。
    expect(shouldShowDayFacts('undertaker', true, facts)).toBe(false)
  })

  it('stays hidden when there is nothing factual to show', () => {
    expect(shouldShowDayFacts('undertaker', false, null)).toBe(false)
    expect(shouldShowDayFacts('undertaker', false, {
      dayLabel: '第3天', execution: null, nominations: [], publicEvents: [],
    })).toBe(false)
  })
})
