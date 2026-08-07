import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DeckBody } from './DeckBody'
import { DiscussionTimerProvider } from '../features/day-workbench/state/discussionTimer'
import { createEmptyGameSession, createPrototypeGameSession } from '../features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../features/game-session/types'

/** jsdom 没有 ResizeObserver；魔典画布靠它实测舞台尺寸，没有替身时环画不出来。 */
function stubResizeObserver() {
  const original = globalThis.ResizeObserver
  class Stub {
    // 不用参数属性：tsconfig 开了 erasableSyntaxOnly，那个语法要生成运行时代码。
    private readonly callback: ResizeObserverCallback
    constructor(callback: ResizeObserverCallback) { this.callback = callback }
    observe(target: Element) {
      this.callback(
        [{ target, contentRect: { width: 900, height: 900 } } as unknown as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = Stub as unknown as typeof ResizeObserver
  return () => { globalThis.ResizeObserver = original }
}

function renderDeck(session: GameSessionState) {
  return render(
    <DiscussionTimerProvider sessionId={session.id}>
      <DeckBody
        session={session}
        dispatch={vi.fn()}
        deckNode="dusk"
        onDeckNodeChange={vi.fn()}
        hasStarted={session.playerCount > 0}
        nightBinding={{ session, dispatchSession: vi.fn() }}
        onStartNight={vi.fn()}
        onStartDay={vi.fn()}
        onExitToArchive={vi.fn()}
        onOpenSetup={vi.fn()}
        onOpenScriptLibrary={vi.fn()}
        onOpenTimer={vi.fn()}
        onOpenRecords={vi.fn()}
        onOpenPlayerStatus={vi.fn()}
      />
    </DiscussionTimerProvider>,
  )
}

describe('DeckBody hosting mode switch', () => {
  let restore = () => {}
  beforeEach(() => { restore = stubResizeObserver() })
  afterEach(() => restore())

  it('leaves the record-mode path completely untouched', () => {
    // G1 验收②：关闭魔典模式后纯记录路径与 G1 之前逐像素一致。
    // 这里守的是它的结构前提——记录模式下环、遮蔽栏、抽屉一个都不许出现在 DOM 里。
    const { container } = renderDeck(createPrototypeGameSession())

    expect(screen.getByText('黄昏 · 交接')).toBeVisible()
    expect(container.querySelector('.grimoire-stage')).toBeNull()
    expect(container.querySelector('.grimoire-canvas')).toBeNull()
    expect(container.querySelector('.work-drawer')).toBeNull()
  })

  it('renders the same handoff card inside the drawer once the grimoire is on', () => {
    const { container } = renderDeck({ ...createPrototypeGameSession(), hostingMode: 'grimoire' })

    // 同一张卡，只是换了容器：换成第二份实现的话这一条会红。
    expect(screen.getByText('黄昏 · 交接')).toBeVisible()
    expect(container.querySelector('.grimoire-canvas')).not.toBeNull()
    expect(container.querySelector('.work-drawer')?.contains(screen.getByText('黄昏 · 交接'))).toBe(true)
  })

  it('does not raise a ring before the board is configured', () => {
    // 空局的环上一个座位都没有，而此刻唯一该做的事是配板。
    const { container } = renderDeck({ ...createEmptyGameSession(), hostingMode: 'grimoire' })

    expect(container.querySelector('.grimoire-canvas')).toBeNull()
    expect(screen.getByText('你的魔典放在哪里？')).toBeVisible()
  })
})
