import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { GameSessionState, PlayerSeat, PlayerState, TimelineEntry } from '../../game-session/types'
import { DuskHandoff } from './DuskHandoff'

function seats(count: number): Record<number, PlayerSeat> {
  return Object.fromEntries(Array.from({ length: count }, (_value, index) => [index + 1, {
    seatId: index + 1,
    label: `${index + 1}号`,
    nickname: `玩家${index + 1}`,
    experience: 'regular' as const,
  }])) as Record<number, PlayerSeat>
}

function playerStates(count: number, overrides: Record<number, Partial<PlayerState>> = {}): Record<number, PlayerState> {
  return Object.fromEntries(Array.from({ length: count }, (_value, index) => [index + 1, {
    life: 'alive' as const,
    poisoned: false,
    drunk: false,
    markers: [],
    ...overrides[index + 1],
  }])) as Record<number, PlayerState>
}

function createSession(overrides: Partial<GameSessionState> = {}): GameSessionState {
  return {
    schemaVersion: 1,
    id: 'session-dusk-test',
    scriptId: 'catfishing',
    playerCount: 8,
    knowledgeVersion: 'test-1',
    seats: seats(8),
    initialPlayerStates: playerStates(8),
    phaseSegments: [],
    timeline: [],
    dayVoteDraft: null,
    dayActionDraft: null,
    setupDraft: null,
    nightRuns: {},
    activeNightRunId: null,
    ...overrides,
  }
}

const closedDay2 = {
  id: 'day-2',
  kind: 'day' as const,
  sequence: 2,
  label: '第2天',
  createdAt: '2026-08-04T10:00:00.000Z',
  closedAt: '2026-08-04T11:00:00.000Z',
}

function executedDaySession(extra: Partial<GameSessionState> = {}): GameSessionState {
  const timeline: TimelineEntry[] = [
    {
      id: 'vote-1',
      kind: 'vote_round',
      segmentId: 'day-2',
      createdAt: '2026-08-04T10:20:00.000Z',
      confirmedBy: 'storyteller',
      roundId: 'round-1',
      nominatorSeatId: 3,
      nomineeSeatId: 7,
      threshold: 4,
      raisedSeatIds: [1, 2, 3, 5],
      ghostVoteSeatIds: [],
    },
    {
      id: 'execution-1',
      kind: 'execution',
      segmentId: 'day-2',
      createdAt: '2026-08-04T10:40:00.000Z',
      confirmedBy: 'storyteller',
      executedSeatId: 7,
      causedDeath: true,
    },
  ]
  return createSession({ phaseSegments: [closedDay2], timeline, ...extra })
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

describe('DuskHandoff 只读交接卡', () => {
  it('渲染只读：不改 session，也不在渲染时触发推进回调', () => {
    const session = deepFreeze(executedDaySession())
    const before = JSON.stringify(session)
    const onStartNight = vi.fn()

    render(<DuskHandoff session={session} nightLabel="第3夜" isFirstNight={false} onStartNight={onStartNight} />)

    expect(onStartNight).not.toHaveBeenCalled()
    expect(JSON.stringify(session)).toBe(before)
  })

  it('勾选清单不写 session，离开本卡即丢弃勾选状态', async () => {
    const user = userEvent.setup()
    const session = deepFreeze(executedDaySession())
    const before = JSON.stringify(session)

    const view = render(<DuskHandoff session={session} nightLabel="第3夜" isFirstNight={false} onStartNight={() => undefined} />)
    const boxes = screen.getAllByRole('checkbox')
    expect(boxes.length).toBeGreaterThan(0)
    for (const box of boxes) await user.click(box)

    expect(screen.getAllByRole('checkbox').every((box) => (box as HTMLInputElement).checked)).toBe(true)
    expect(JSON.stringify(session)).toBe(before)

    view.unmount()
    render(<DuskHandoff session={session} nightLabel="第3夜" isFirstNight={false} onStartNight={() => undefined} />)
    expect(screen.getAllByRole('checkbox').every((box) => !(box as HTMLInputElement).checked)).toBe(true)
    expect(JSON.stringify(session)).toBe(before)
  })

  it('清单用「请核对」而不是「已处理」措辞', () => {
    render(<DuskHandoff session={executedDaySession()} nightLabel="第3夜" isFirstNight={false} onStartNight={() => undefined} />)
    for (const box of screen.getAllByRole('checkbox')) {
      expect(box.closest('label')?.textContent ?? '').toContain('请核对')
    }
    expect(screen.queryByText(/已处理/)).toBeNull()
  })

  it('首夜：没有上一白天时显示开局文案，并提示翻到首夜一面', () => {
    render(<DuskHandoff session={createSession()} nightLabel="第1夜" isFirstNight={true} onStartNight={() => undefined} />)

    expect(screen.getByText('首夜之前没有白天')).toBeInTheDocument()
    expect(screen.getByText(/夜序表已翻到「首夜」一面/)).toBeInTheDocument()
    expect(screen.queryByText(/夜序表已翻到「其他夜」一面/)).toBeNull()
    expect(screen.getByRole('button', { name: '开始第1夜' })).toBeInTheDocument()
  })

  it('非首夜：回执上一白天的处决结论与票数门槛，并提示翻到其他夜一面', () => {
    render(<DuskHandoff session={executedDaySession()} nightLabel="第3夜" isFirstNight={false} onStartNight={() => undefined} />)

    expect(screen.getByText('第2天')).toBeInTheDocument()
    expect(screen.getByText('处决 7号 · 玩家7')).toBeInTheDocument()
    expect(screen.getByText('4票 / 门槛4票')).toBeInTheDocument()
    expect(screen.getByText(/夜序表已翻到「其他夜」一面/)).toBeInTheDocument()
    expect(screen.queryByText('首夜之前没有白天')).toBeNull()
  })

  it('上一白天记的是无处决时回执无处决与最高票', () => {
    const session = createSession({
      phaseSegments: [closedDay2],
      timeline: [
        {
          id: 'vote-1',
          kind: 'vote_round',
          segmentId: 'day-2',
          createdAt: '2026-08-04T10:20:00.000Z',
          confirmedBy: 'storyteller',
          roundId: 'round-1',
          nominatorSeatId: 3,
          nomineeSeatId: 7,
          threshold: 4,
          raisedSeatIds: [1, 2],
          ghostVoteSeatIds: [],
        },
        {
          id: 'no-execution-1',
          kind: 'no_execution',
          segmentId: 'day-2',
          createdAt: '2026-08-04T10:40:00.000Z',
          confirmedBy: 'storyteller',
        },
      ],
    })
    render(<DuskHandoff session={session} nightLabel="第3夜" isFirstNight={false} onStartNight={() => undefined} />)

    expect(screen.getByText('无处决')).toBeInTheDocument()
    expect(screen.getByText('这一天没有人被处决')).toBeInTheDocument()
    expect(screen.getByText('1轮投票 · 最高 2票 / 门槛4票')).toBeInTheDocument()
  })

  it('到期候选来自当前状态投影，只列候选不自动清除', () => {
    const session = executedDaySession({
      initialPlayerStates: playerStates(8, { 4: { poisoned: true }, 6: { markers: [{ id: 'm1', label: '僧侣保护' }] } }),
    })
    render(<DuskHandoff session={session} nightLabel="第3夜" isFirstNight={false} onStartNight={() => undefined} />)

    expect(screen.getByText('4号 · 玩家4 · 中毒')).toBeInTheDocument()
    expect(screen.getByText('6号 · 玩家6 · 僧侣保护')).toBeInTheDocument()
  })

  it('主动作只调用 onStartNight，一次点击一次回调', async () => {
    const user = userEvent.setup()
    const session = deepFreeze(executedDaySession())
    const before = JSON.stringify(session)
    const onStartNight = vi.fn()

    render(<DuskHandoff session={session} nightLabel="第3夜" isFirstNight={false} onStartNight={onStartNight} />)
    await user.click(screen.getByRole('button', { name: '开始第3夜' }))

    expect(onStartNight).toHaveBeenCalledTimes(1)
    expect(JSON.stringify(session)).toBe(before)
  })
})
