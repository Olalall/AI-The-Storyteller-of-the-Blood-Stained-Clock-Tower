import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../data/createPrototypeSession'
import { gameSessionReducer } from './sessionReducer'

type Session = ReturnType<typeof createPrototypeGameSession>

function setMode(session: Session, mode: 'record' | 'grimoire', changedAt: string) {
  return gameSessionReducer(session, { type: 'set-hosting-mode', mode, changedAt, phaseLabel: '第3夜' })
}

describe('hostingMode 是出处元数据，不是行为开关', () => {
  it('records the mode so an archive can be replayed honestly', () => {
    // 不记的话，跨模式回看会把纯记录局渲染成一张看起来很完整、实则大半没人录过的魔典。
    const next = setMode(createPrototypeGameSession(), 'grimoire', '2026-08-05T20:00:00.000Z')

    expect(next.hostingMode).toBe('grimoire')
    expect(next.hostingModeHistory).toEqual([
      { mode: 'grimoire', changedAt: '2026-08-05T20:00:00.000Z', phaseLabel: '第3夜' },
    ])
  })

  it('appends every switch instead of overwriting the last one', () => {
    const once = setMode(createPrototypeGameSession(), 'grimoire', '2026-08-05T20:00:00.000Z')
    const twice = setMode(once, 'record', '2026-08-05T21:00:00.000Z')

    expect(twice.hostingModeHistory).toHaveLength(2)
    expect(twice.hostingMode).toBe('record')
  })

  it('is a no-op when the mode did not actually change', () => {
    const once = setMode(createPrototypeGameSession(), 'grimoire', '2026-08-05T20:00:00.000Z')
    expect(setMode(once, 'grimoire', '2026-08-05T22:00:00.000Z')).toBe(once)
  })

  it('changes nothing else about the session', () => {
    const before = createPrototypeGameSession()
    const after = setMode(before, 'grimoire', '2026-08-05T20:00:00.000Z')

    const { hostingMode: _m, hostingModeHistory: _h, ...rest } = after
    expect(rest).toEqual({ ...before, hostingMode: undefined, hostingModeHistory: undefined })
  })

  it('never lands in the timeline — it is a tool fact, not a game fact', () => {
    // 进 timeline 会强迫七处非穷尽 switch 为一个非对局条目开分支，还会污染「本局记录 N」。
    const after = setMode(createPrototypeGameSession(), 'grimoire', '2026-08-05T20:00:00.000Z')
    expect(after.timeline).toEqual(createPrototypeGameSession().timeline)
  })

  it('defaults to undefined so old archives stay valid', () => {
    expect(createPrototypeGameSession().hostingMode).toBeUndefined()
  })
})
