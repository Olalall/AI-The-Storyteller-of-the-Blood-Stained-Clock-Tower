import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DayTimerReadout } from './DayTimerReadout'

describe('DayTimerReadout', () => {
  it('puts the clock, the phase name and the nomination gate in one glance', () => {
    // 文档给核的规格就是这三样：mm:ss 大字 + 阶段名 + 「可开始提名」状态。
    // 说书人在白天是用余光看核的，三样里少任何一样都要低头去抽屉里找。
    render(<DayTimerReadout timer={{ remainingSeconds: 185, phaseName: '私聊', nominationsOpen: true }} />)

    expect(screen.getByText('03:05')).toBeVisible()
    expect(screen.getByText('私聊')).toBeVisible()
    expect(screen.getByText('可开始提名')).toBeVisible()
  })

  it('keeps counting into overtime and says so out loud', () => {
    // 夹回 00:00 会让「刚好到点」与「超了三分钟」长得一样，而说书人的动作完全不同。
    const { container } = render(<DayTimerReadout timer={{ remainingSeconds: -65 }} />)

    expect(screen.getByText('-01:05')).toBeVisible()
    expect(container.querySelector('.grimoire-core__clock')).toHaveAttribute('data-overtime', 'true')
  })

  it('refuses to print 00:00 when there is no clock at all', () => {
    // 「没有计时源」与「计时归零」是两件事；把前者显示成 00:00 会让说书人以为时间到了，
    // 然后去催一场根本没开始计时的讨论。
    const { container } = render(<DayTimerReadout timer={{ remainingSeconds: null }} />)

    expect(container.querySelector('.grimoire-core__clock')).toHaveAttribute('data-empty', 'true')
    expect(screen.getByText('没有计时数据')).toBeInTheDocument()
  })

  it('says it does not know rather than guessing the nomination gate', () => {
    // 提名开没开是说书人排的日程，不是工具算得出的判定。没记过就写「—」；
    // 猜一个「尚不可提名」出来，说书人会照着它拦下一次合法提名。
    render(<DayTimerReadout timer={{ remainingSeconds: 60, nominationsOpen: null }} />)
    expect(screen.getByText('可开始提名 —')).toBeVisible()
  })

  it('states the closed gate when the storyteller actually recorded it', () => {
    render(<DayTimerReadout timer={{ remainingSeconds: 60, nominationsOpen: false }} />)
    expect(screen.getByText('尚不可提名')).toBeVisible()
  })

  it('marks a missing phase name instead of leaving a hole', () => {
    // 白天工作台的旧 timer 卡在超时后有渲染空洞；核里不允许再出现一次。
    const { container } = render(<DayTimerReadout timer={{ remainingSeconds: 60 }} />)
    expect(container.querySelector('.grimoire-core__timer-phase')).toHaveAttribute('data-empty', 'true')
  })

  it('carries no start, pause or reset key', () => {
    // 控制键在抽屉 peek 档的横条上。核是观察面——把开始/暂停放进环中央，
    // 等于在说书人最常扫视的位置放三个不可撤销的误触点。
    const { container } = render(<DayTimerReadout timer={{ remainingSeconds: 60, phaseName: '公聊' }} />)
    expect(container.querySelector('button')).toBeNull()
  })
})
