import { describe, expect, it } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import {
  completenessNotice,
  grimoireCoverage,
  projectGrimoireCompleteness,
} from './grimoireCompleteness'

describe('projectGrimoireCompleteness', () => {
  it('reports nothing known about a session that never reached setup', () => {
    const completeness = projectGrimoireCompleteness(createEmptyGameSession())
    expect(completeness).toMatchObject({ seatsWithRole: 0, totalSeats: 0 })
  })

  it('counts the seats the tool actually knows a role for', () => {
    const completeness = projectGrimoireCompleteness(createPrototypeGameSession())
    expect(completeness.totalSeats).toBe(12)
    expect(completeness.seatsWithRole).toBe(12)
  })

  it('ignores stale assignments left behind by a shrunken player count', () => {
    const session = { ...createPrototypeGameSession(), playerCount: 8 }
    expect(projectGrimoireCompleteness(session).seatsWithRole).toBe(8)
  })
})

describe('grimoireCoverage', () => {
  it('stays none when the tool knows no roles, however many markers exist', () => {
    // 标记记得再多也补不上「不知道谁是什么」——AI 的上下文级别必须用同一套判据，
    // 否则会因为 stateChangeCount 大于 0 就误升到 standard。
    const coverage = grimoireCoverage({ seatsWithRole: 0, totalSeats: 12, stateChangeCount: 9, markerCount: 4 })
    expect(coverage).toBe('none')
  })

  it('is partial until every seat has a role', () => {
    expect(grimoireCoverage({ seatsWithRole: 11, totalSeats: 12, stateChangeCount: 0, markerCount: 0 })).toBe('partial')
    expect(grimoireCoverage({ seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 0 })).toBe('full')
  })
})

describe('completenessNotice', () => {
  it('never claims the identities are complete when the board was dealt on the table', () => {
    // 这是这块存在的全部理由：不分两个维度的话，这句话会变成
    // 「12 个座位身份齐全，只是还没录标记」——一句彻头彻尾的谎话。
    const notice = completenessNotice({ seatsWithRole: 0, totalSeats: 12, stateChangeCount: 5, markerCount: 2 })

    expect(notice.message).toContain('没有在工具里配过板')
    expect(notice.message).not.toContain('齐全')
    expect(notice.tone).toBe('warning')
  })

  it('points a missing-identity session at setup, not at state entry', () => {
    const notice = completenessNotice({ seatsWithRole: 0, totalSeats: 12, stateChangeCount: 5, markerCount: 0 })
    expect(notice.action).toBe('setup')
  })

  it('names how many seats are still missing a role', () => {
    const notice = completenessNotice({ seatsWithRole: 9, totalSeats: 12, stateChangeCount: 0, markerCount: 0 })
    expect(notice.message).toContain('3 个还没有身份')
    expect(notice.action).toBe('setup')
  })

  it('points a complete-but-unmarked board at state entry', () => {
    const notice = completenessNotice({ seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 0 })
    expect(notice.message).toContain('标记还没录过')
    expect(notice.action).toBe('state')
  })

  it('treats markers alone as evidence the grimoire is in use', () => {
    const notice = completenessNotice({ seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 3 })
    expect(notice.tone).toBe('success')
  })

  it('asks for a board before anything else when there are no seats', () => {
    const notice = completenessNotice({ seatsWithRole: 0, totalSeats: 0, stateChangeCount: 0, markerCount: 0 })
    expect(notice.action).toBe('setup')
    expect(notice.message).toContain('还没有座位')
  })
})
