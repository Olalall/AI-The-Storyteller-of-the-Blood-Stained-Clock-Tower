import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../game-session/types'
import { hostingPhaseLabel, needsDowngradeHandoff } from './hostingModeSwitch'

function withSegments(segments: GameSessionState['phaseSegments']): GameSessionState {
  return { ...createPrototypeGameSession(), phaseSegments: segments }
}

describe('needsDowngradeHandoff', () => {
  it('stops the one direction that can silently lose state — grimoire back to record', () => {
    // 数据层降级是安全的，风险是认知性的：说书人切回去后仍以为工具在替他记，
    // 于是实体魔典和工具两边都空。没有这道摩擦，那次切换只是一次点击。
    expect(needsDowngradeHandoff('grimoire', 'record')).toBe(true)
  })

  it('lets the upgrade through with zero friction', () => {
    expect(needsDowngradeHandoff('record', 'grimoire')).toBe(false)
  })

  it('does not ask for a handoff when no mode was ever chosen', () => {
    // 从未选过 = 一直是纯记录，环上没有任何东西需要交接。
    expect(needsDowngradeHandoff(undefined, 'record')).toBe(false)
  })
})

describe('hostingPhaseLabel', () => {
  it('names the open segment so the archive can replay when the mode changed', () => {
    const label = hostingPhaseLabel(withSegments([
      { id: 'n1', kind: 'night', sequence: 1, label: '第1夜', createdAt: '2026-01-01T20:00:00.000Z', closedAt: '2026-01-01T21:00:00.000Z' },
      { id: 'd1', kind: 'day', sequence: 1, label: '第1天', createdAt: '2026-01-01T21:00:00.000Z' },
    ]))
    expect(label).toBe('第1天')
  })

  it('places a switch made between segments instead of leaving it blank', () => {
    // 黄昏时没有开放的段。写空字符串的话，归档回看会显示「模式变更于（）」。
    const label = hostingPhaseLabel(withSegments([
      { id: 'n1', kind: 'night', sequence: 1, label: '第1夜', createdAt: '2026-01-01T20:00:00.000Z', closedAt: '2026-01-01T21:00:00.000Z' },
    ]))
    expect(label).toBe('第1夜后')
  })

  it('falls back to 开局前 before any segment exists', () => {
    expect(hostingPhaseLabel(withSegments([]))).toBe('开局前')
  })
})
