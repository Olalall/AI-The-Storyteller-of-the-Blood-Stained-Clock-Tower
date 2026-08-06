import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GrimoireStage } from './GrimoireStageHost'
import { DiscussionTimerProvider } from '../day-workbench/state/discussionTimer'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import type { GameSessionState, TimelineEntry } from '../game-session/types'
import type { DeckNode } from '../hosting-deck/deckNode'

/** jsdom 没有 ResizeObserver，也不做布局；用一个能立刻回报固定尺寸的替身喂给画布。 */
function stubResizeObserver(width: number, height: number) {
  const original = globalThis.ResizeObserver
  class Stub {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ target, contentRect: { width, height } } as unknown as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      )
    }
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = Stub as unknown as typeof ResizeObserver
  return () => { globalThis.ResizeObserver = original }
}

function renderStage(session: GameSessionState, node: DeckNode = 'dusk') {
  const spies = {
    dispatch: vi.fn(),
    onOpenSetup: vi.fn(),
    onOpenScriptLibrary: vi.fn(),
    onOpenRecords: vi.fn(),
    onOpenPlayerStatus: vi.fn(),
  }
  render(
    <DiscussionTimerProvider sessionId={session.id}>
      <GrimoireStage session={session} deckNode={node} {...spies}>
        <p>抽屉里的工作台</p>
      </GrimoireStage>
    </DiscussionTimerProvider>,
  )
  return spies
}

/** 一局纯记录模式主持过、切到魔典时状态一笔都没录的对局。 */
function switchedMidGame(): GameSessionState {
  const base = createPrototypeGameSession()
  const nightAction = (id: string, createdAt: string, result: string, targets: number[]): TimelineEntry => ({
    id,
    kind: 'night_action',
    segmentId: 'night-1',
    createdAt,
    confirmedBy: 'storyteller',
    nightRunId: 'run-1',
    wakeItemId: `item-${id}`,
    summary: result,
    details: [],
    record: {
      revision: 1,
      snapshot: { targets, roleChoice: '', outcomeId: 'o', playerChoice: '', storytellerResult: result, informationGiven: '', draftRevision: 1 },
    },
  })
  return {
    ...base,
    hostingMode: 'grimoire',
    phaseSegments: [{ id: 'night-1', kind: 'night', sequence: 1, label: '第1夜', createdAt: '2026-01-01T20:00:00.000Z' }],
    timeline: [
      ...base.timeline.filter((entry) => entry.kind === 'setup_confirmed'),
      nightAction('n1', '2026-01-01T20:10:00.000Z', '3号死亡', [3]),
      nightAction('n2', '2026-01-01T20:20:00.000Z', '5号中毒', [5]),
    ],
  }
}

describe('GrimoireStage', () => {
  let restore = () => {}
  beforeEach(() => { restore = stubResizeObserver(900, 900) })
  afterEach(() => restore())

  it('puts the existing workbench in the drawer instead of replacing it', () => {
    // 「魔典复用纯记录模式的页」这条合同的执行点：宿主只换容器，页照常出现。
    renderStage(createPrototypeGameSession())
    expect(screen.getByText('抽屉里的工作台')).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: '黄昏交接' })).toBeInTheDocument()
  })

  it('opens the seat action bar on an idle tap and still dispatches nothing', async () => {
    // G2 把环变成可写面，但「点一下就改」那条路仍然不存在：
    // 单击只打开六格浮层，六格里没有一格会 dispatch。
    const spies = renderStage(createPrototypeGameSession())

    await userEvent.click(screen.getByRole('button', { name: /^7号/ }))

    expect(screen.getByRole('group', { name: '7号 座位操作' })).toBeVisible()
    expect(spies.dispatch).not.toHaveBeenCalled()
  })

  it('keeps the existing seat sheet reachable as the sixth cell', async () => {
    // 六格里的「座位卡」是完整 PlayerStatusSheet 的入口。魔典没有把它替换掉，
    // 只是把它从「点座位的唯一后果」降级成六选一。
    const spies = renderStage(createPrototypeGameSession())

    await userEvent.click(screen.getByRole('button', { name: /^7号/ }))
    await userEvent.click(screen.getByRole('button', { name: '座位卡' }))

    expect(spies.onOpenPlayerStatus).toHaveBeenCalledWith(7)
    expect(spies.dispatch).not.toHaveBeenCalled()
  })

  it('hangs the only mode-switch entry off the core identity row (裁决 7)', async () => {
    renderStage(createPrototypeGameSession())

    await userEvent.click(screen.getByRole('button', { name: /本局信息/ }))

    expect(screen.getByRole('dialog', { name: '本局信息' })).toBeVisible()
    expect(screen.getByRole('radio', { name: /桌上有实体魔典/ })).toBeVisible()
  })

  it('states the real backlog when a record-mode game is switched over mid-play', () => {
    renderStage(switchedMidGame())
    // 数的是欠账而不是已落账的变更数：后者此刻是 0，填进去就成了「有 0 条记录可能涉及状态变化」。
    expect(screen.getByText(/从第1夜到现在有 2 条记录可能涉及状态变化/)).toBeVisible()
  })

  it('sends 逐条核对 to the backfill cards rather than dumping the raw record list', async () => {
    // 旧落点是本局记录——那是让说书人自己对着整条时间线找哪几笔没记，
    // 「约 1 分钟」根本不够，实际结果是他看两眼就退出去了。
    const spies = renderStage(switchedMidGame())

    await userEvent.click(screen.getByRole('button', { name: '逐条核对（约 1 分钟）' }))

    expect(screen.getByRole('region', { name: '逐条核对' })).toBeVisible()
    expect(spies.onOpenRecords).not.toHaveBeenCalled()
    expect(spies.onOpenSetup).not.toHaveBeenCalled()
  })

  it('keeps 不再提示 quiet for the rest of the session', async () => {
    renderStage(switchedMidGame())

    await userEvent.click(screen.getByRole('button', { name: '不再提示' }))

    expect(screen.queryByText(/条记录可能涉及状态变化/)).toBeNull()
  })

  it('feeds the day clock into the core instead of leaving it as 「—」', () => {
    // 相位数据源没接上时核不会报错，它会安静地画一个「—」。这条盯的就是那个安静的失败。
    renderStage({ ...createPrototypeGameSession(), hostingMode: 'grimoire' }, 'day')

    const timer = screen.getByRole('group', { name: '白天计时' })
    expect(timer).toHaveTextContent('15:00')
    expect(timer).toHaveTextContent('私聊')
  })

  it('feeds 举手 / 门槛 / 差 into the core once a round draft exists', () => {
    const base = createPrototypeGameSession()
    const voting: GameSessionState = {
      ...base,
      hostingMode: 'grimoire',
      dayVoteDraft: { segmentId: 'day-pending', nominatorSeatId: 1, nomineeSeatId: 4, threshold: 6, raisedSeatIds: [2, 3], ghostVoteSeatIds: [] },
    }
    renderStage(voting, 'day')

    const tally = screen.getByRole('group', { name: '计票' })
    expect(tally).toHaveTextContent('举手')
    expect(tally).toHaveTextContent('6')
    // 差 X = 门槛 6 − 举手 2。它只出现在渲染路径上，永远不进任何 payload。
    expect(tally).toHaveTextContent('4')
  })

  it('reports the dawn roll call as seat numbers only', () => {
    const base = createPrototypeGameSession()
    const session: GameSessionState = {
      ...base,
      hostingMode: 'grimoire',
      phaseSegments: [{ id: 'night-9', kind: 'night', sequence: 9, label: '第9夜', createdAt: '2026-01-01T20:00:00.000Z' }],
      timeline: [
        ...base.timeline.filter((entry) => entry.kind === 'setup_confirmed'),
        {
          id: 's1',
          kind: 'player_state_changed',
          segmentId: 'night-9',
          createdAt: '2026-01-01T20:30:00.000Z',
          confirmedBy: 'storyteller',
          seatId: 6,
          before: { life: 'alive', poisoned: false, drunk: false, markers: [] },
          after: { life: 'dead', poisoned: false, drunk: false, markers: [] },
          reason: '说书人裁定',
        },
      ],
    }
    renderStage(session, 'dawn')

    const roll = screen.getByRole('group', { name: '黎明播报' })
    expect(roll).toHaveTextContent('6')
    // 黎明的护栏是「只报生死，不报原因」——核是全场最容易被瞄到的一块。
    expect(roll).not.toHaveTextContent('恶魔')
  })

  it('starts shielded at L1 so no role name is on screen before anyone asked', () => {
    // 默认掀开等于「递给玩家看之前必须记得盖上」，那是一个迟早会忘的动作。
    const session = createPrototypeGameSession()
    const { container } = render(
      <DiscussionTimerProvider sessionId={session.id}>
        <GrimoireStage
          session={session}
          dispatch={vi.fn()}
          deckNode="dusk"
          onOpenSetup={vi.fn()}
          onOpenScriptLibrary={vi.fn()}
          onOpenRecords={vi.fn()}
          onOpenPlayerStatus={vi.fn()}
        >
          <p>抽屉里的工作台</p>
        </GrimoireStage>
      </DiscussionTimerProvider>,
    )

    expect(container.querySelector('[data-shield="L1"]')).not.toBeNull()
    for (const assignment of session.timeline.flatMap((entry) => entry.kind === 'setup_confirmed' ? entry.setup.draft.assignments : [])) {
      expect(container.textContent).not.toContain(assignment.role.name)
    }
  })
})
