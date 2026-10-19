import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../features/game-session/data/createPrototypeSession'
import { gameSessionReducer } from '../features/game-session/state/sessionReducer'
import { useDeckNavigation } from './useDeckNavigation'
import type { AppOverlayState } from './useAppOverlays'
import type { GameSessionState } from '../features/game-session/types'

const NOW = '2026-08-06T18:00:00.000Z'
const overlays = {
  setSetupScriptId: vi.fn(), setSetupOpen: vi.fn(), closeAll: vi.fn(),
} as unknown as AppOverlayState

function openDay(session: GameSessionState) {
  return gameSessionReducer(session, { type: 'open-phase-segment', phaseKind: 'day', createdAt: NOW })
}
function closeDay(session: GameSessionState) {
  return gameSessionReducer(session, { type: 'close-open-segment', phaseKind: 'day', closedAt: NOW })
}

describe('白天关掉之后视图跟到黄昏', () => {
  it('lands on dusk once the day segment closes', () => {
    // 此前：段落在数据层关了、轨道也变成「黄昏（建议下一步）」，但持有的节点仍是 day，
    // 于是渲染出一张全新的空白天——看起来像刚才那一天没保存，而且再没有入口走到黄昏。
    let session = openDay(createPrototypeGameSession())
    const { result, rerender } = renderHook(
      ({ s }) => useDeckNavigation(s, vi.fn(), overlays, vi.fn()),
      { initialProps: { s: session } },
    )
    act(() => result.current.enterDay())
    expect(result.current.deckNode).toBe('day')

    session = closeDay(session)
    rerender({ s: session })

    expect(result.current.deckNode).toBe('dusk')
  })

  it('stays on the day while the day segment is still open', () => {
    // 反面锚点：没有它的话，上面那条对任何实现都成立（比如「永远返回 dusk」）。
    const session = openDay(createPrototypeGameSession())
    const { result, rerender } = renderHook(
      ({ s }) => useDeckNavigation(s, vi.fn(), overlays, vi.fn()),
      { initialProps: { s: session } },
    )
    act(() => result.current.enterDay())
    rerender({ s: session })

    expect(result.current.deckNode).toBe('day')
  })

  it('does not hijack the night close, which goes to dawn instead of dusk', () => {
    // 夜晚走的是 onCloseNight 显式回调。若这里的兜底把夜晚也管上，
    // 关闭本夜会直接跳过黎明播报——而黎明是「只报生死、不报原因」的那一步。
    const session = createPrototypeGameSession()
    const { result, rerender } = renderHook(
      ({ s }) => useDeckNavigation(s, vi.fn(), overlays, vi.fn()),
      { initialProps: { s: session } },
    )
    act(() => result.current.setDeckNode('dawn'))
    rerender({ s: session })

    expect(result.current.deckNode).toBe('dawn')
  })
})
