import { describe, expect, it } from 'vitest'
import { projectDayExecutionMark } from './executionMark'
import type { TimelineEntry } from '../../game-session/types'

function execution(id: string, seatId: number, at: string, causedDeath?: boolean): TimelineEntry {
  return {
    id,
    kind: 'execution',
    segmentId: 'day-1',
    createdAt: at,
    confirmedBy: 'storyteller',
    executedSeatId: seatId,
    ...(causedDeath === undefined ? {} : { causedDeath }),
  }
}

const noExecution: TimelineEntry = {
  id: 'no-exec-1',
  kind: 'no_execution',
  segmentId: 'day-1',
  createdAt: '2026-07-13T10:00:00.000Z',
  confirmedBy: 'storyteller',
}

describe('「本日处决」角标', () => {
  it('落了账才出角标', () => {
    expect(projectDayExecutionMark([execution('e1', 5, '2026-07-13T10:00:00.000Z')], 'day-1'))
      .toEqual({ seatId: 5, causedDeath: true })
  })

  it('无处决不是处决', () => {
    expect(projectDayExecutionMark([noExecution], 'day-1')).toBeNull()
  })

  it('弄臣这类「被处决但没死」照样挂角标，causedDeath 如实为 false', () => {
    // 环上的帷幕跟着 life 走；这里只回答「今天处决过谁」，不回答「他死了没有」。
    expect(projectDayExecutionMark([execution('e1', 5, '2026-07-13T10:00:00.000Z', false)], 'day-1'))
      .toEqual({ seatId: 5, causedDeath: false })
  })

  it('别的白天段的处决不会漏到今天', () => {
    expect(projectDayExecutionMark([execution('e1', 5, '2026-07-13T10:00:00.000Z')], 'day-2')).toBeNull()
    expect(projectDayExecutionMark([execution('e1', 5, '2026-07-13T10:00:00.000Z')], null)).toBeNull()
  })

  it('被更正掉的那条处决不再挂在原来的座位上', () => {
    // 说书人改完记录抬眼一看角标还在 5 号身上，是这条投影最容易犯的错。
    const corrected = execution('e1', 5, '2026-07-13T10:00:00.000Z')
    const correction: TimelineEntry = {
      ...execution('e2', 9, '2026-07-13T10:05:00.000Z'),
      correctionOf: 'e1',
    }

    expect(projectDayExecutionMark([corrected, correction], 'day-1')).toEqual({ seatId: 9, causedDeath: true })
  })

  it('同一段里出现两条结论时以时间靠后的为准', () => {
    const entries = [
      execution('e1', 5, '2026-07-13T10:00:00.000Z'),
      { ...noExecution, id: 'no-exec-2', createdAt: '2026-07-13T10:09:00.000Z' },
    ]
    expect(projectDayExecutionMark(entries, 'day-1')).toBeNull()
  })

  it('缺席位号的残缺处决记录宁可不画，也不画到 undefined 号座位上', () => {
    const broken: TimelineEntry = {
      id: 'e1',
      kind: 'execution',
      segmentId: 'day-1',
      createdAt: '2026-07-13T10:00:00.000Z',
      confirmedBy: 'storyteller',
    }
    expect(projectDayExecutionMark([broken], 'day-1')).toBeNull()
  })
})
