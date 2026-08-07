import { describe, expect, it } from 'vitest'
import {
  CORE_PENDING_LABEL,
  CORE_UNKNOWN,
  clockReadout,
  voteTallyReadout,
} from './corePhase'

describe('clockReadout', () => {
  it('pads both halves so the clock never changes width', () => {
    // 不补零时 3:5 与 13:45 宽度不同，核里的大字会在每一秒左右横跳，
    // 而说书人是用余光看这个数的——跳动比读不清更糟。
    expect(clockReadout(185).text).toBe('03:05')
    expect(clockReadout(0).text).toBe('00:00')
  })

  it('keeps counting past the deadline instead of clamping to zero', () => {
    // 夹回 00:00 会让「刚好到点」和「超了三分钟」长得一模一样，
    // 而这两种情况说书人的动作完全不同：一个催场，一个直接收。
    const overtime = clockReadout(-185)

    expect(overtime.text).toBe('-03:05')
    expect(overtime.overtime).toBe(true)
    expect(clockReadout(1).overtime).toBe(false)
  })

  it('says it has no clock rather than printing 00:00 or NaN', () => {
    // 「没有计时源」与「计时归零」是两回事；把前者显示成 00:00 会让说书人以为时间到了。
    expect(clockReadout(null).text).toBe(CORE_UNKNOWN)
    expect(clockReadout(Number.NaN).text).toBe(CORE_UNKNOWN)
    expect(clockReadout(Number.POSITIVE_INFINITY).text).toBe(CORE_UNKNOWN)
  })

  it('counts minutes past 60 instead of rolling over into hours', () => {
    // 白天讨论时长可以超过一小时；滚成 01:00:00 会让 mm:ss 的读法在最需要它时失效。
    expect(clockReadout(3725).text).toBe('62:05')
  })
})

describe('voteTallyReadout', () => {
  it('reports the shortfall and stops at zero once the threshold is met', () => {
    // 负数会被读成「超了几票」，那是另一件事；说书人要的是「还差几票」。
    expect(voteTallyReadout(2, 5).gap).toBe(3)
    expect(voteTallyReadout(5, 5).gap).toBe(0)
    expect(voteTallyReadout(7, 5).gap).toBe(0)
  })

  it('returns three numbers and no verdict at all', () => {
    // 裁决 10：三个算式只出现在渲染路径。多出任何一个 passed / onTheBlock 字段，
    // 都是把「达标」变成「裁定」的第一步——下一个 commit 就会有人拿它自动暂列。
    expect(Object.keys(voteTallyReadout(5, 5)).sort()).toEqual(['gap', 'raised', 'threshold'])
  })

  it('passes the raised and threshold numbers through untouched', () => {
    // 核不许「修正」说书人手改过的门槛：门槛是裁量，不是算出来的。
    expect(voteTallyReadout(0, 1)).toEqual({ raised: 0, threshold: 1, gap: 1 })
  })
})

describe('CORE_PENDING_LABEL', () => {
  it('names the unit of work of the current phase', () => {
    // 「本阶段待处理」两种语境下都对，但说书人得先想一下现在是哪个阶段才能读懂它。
    expect(CORE_PENDING_LABEL.night).toBe('本夜待处理')
    expect(CORE_PENDING_LABEL['day-vote']).toBe('本白天待处理')
    expect(CORE_PENDING_LABEL.idle).toBe('本阶段待处理')
  })
})
