import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { GameSessionState, PlayerState, TimelineEntry } from '../../game-session/types'
import { DawnHandoff } from './DawnHandoff'

const nightStart = '2026-08-04T21:00:00.000Z'
const duringNight = '2026-08-04T21:20:00.000Z'

const alive: PlayerState = { life: 'alive', poisoned: false, drunk: false, markers: [] }
const dead: PlayerState = { life: 'dead', poisoned: false, drunk: false, markers: [] }

function stateChange(seatId: number, after: PlayerState): TimelineEntry {
  return {
    kind: 'player_state_changed',
    id: `chg-${seatId}`,
    segmentId: 'night-2',
    createdAt: duringNight,
    confirmedBy: 'storyteller',
    seatId,
    before: after.life === 'dead' ? alive : dead,
    after,
    reason: '夜间结算',
  }
}

function deathFlaggedRecord(id: string, targets: number[]): TimelineEntry {
  return {
    kind: 'night_action',
    id,
    segmentId: 'night-2',
    createdAt: duringNight,
    confirmedBy: 'storyteller',
    nightRunId: 'run-2',
    wakeItemId: `wake-${id}`,
    summary: '恶魔袭击',
    details: [],
    record: {
      revision: 1,
      snapshot: {
        targets,
        roleChoice: 'imp',
        outcomeId: 'kill',
        playerChoice: '',
        storytellerResult: '目标死亡',
        informationGiven: '',
        draftRevision: 1,
      },
    },
  }
}

/** initialStates 决定黄昏那一刻的快照，差分基准就是它加上夜晚开始前的状态变更。 */
function makeSession(timeline: TimelineEntry[], initialStates: Record<number, PlayerState> = {}): GameSessionState {
  const seatIds = [1, 2, 3]
  return {
    schemaVersion: 1,
    id: 'session-1',
    scriptId: 'trouble-brewing',
    playerCount: seatIds.length,
    knowledgeVersion: 'test',
    seats: Object.fromEntries(seatIds.map((seatId) => [
      seatId,
      { seatId, label: `${seatId}号`, nickname: `玩家${seatId}`, experience: 'regular' as const },
    ])),
    initialPlayerStates: Object.fromEntries(seatIds.map((seatId) => [
      seatId,
      { ...(initialStates[seatId] ?? alive), markers: [] },
    ])),
    phaseSegments: [
      { id: 'night-2', kind: 'night', sequence: 2, label: '第2夜', createdAt: nightStart, closedAt: '2026-08-04T21:40:00.000Z' },
    ],
    timeline,
    dayVoteDraft: null,
    dayActionDraft: null,
    setupDraft: null,
    nightRuns: {},
    activeNightRunId: null,
  }
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') Object.values(value).forEach(deepFreeze)
  return Object.freeze(value)
}

function renderCard(session: GameSessionState, overrides: Partial<Parameters<typeof DawnHandoff>[0]> = {}) {
  const onStartDay = vi.fn()
  const onOpenPlayerStatus = vi.fn()
  render(
    <DawnHandoff
      session={session}
      nightSegmentId="night-2"
      dayLabel="第3天"
      onStartDay={onStartDay}
      onOpenPlayerStatus={onOpenPlayerStatus}
      {...overrides}
    />,
  )
  return { onStartDay, onOpenPlayerStatus }
}

describe('DawnHandoff', () => {
  it('reads out the seats whose life state actually changed during the night', async () => {
    const user = userEvent.setup()
    const { onStartDay } = renderCard(makeSession([stateChange(3, dead), stateChange(1, alive)], { 1: dead }))

    const diedGroup = screen.getByRole('region', { name: '本夜死亡' })
    expect(within(diedGroup).getByText('3')).toBeInTheDocument()
    expect(within(diedGroup).getByText('玩家3')).toBeInTheDocument()
    expect(within(diedGroup).getByText('死亡')).toBeInTheDocument()

    const revivedGroup = screen.getByRole('region', { name: '本夜复活' })
    expect(within(revivedGroup).getByText('1')).toBeInTheDocument()
    expect(within(revivedGroup).getByText('复活')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '已宣布睁眼 · 进入第3天' }))
    expect(onStartDay).toHaveBeenCalledTimes(1)
  })

  it('still tells the storyteller to announce the wake-up when nobody changed', () => {
    renderCard(makeSession([]))

    expect(screen.getByText('本夜无人死亡')).toBeInTheDocument()
    expect(screen.getByText('仍要照常宣布睁眼，并当众说明本夜没有生死变化。')).toBeInTheDocument()
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('hints — never asserts — when death-flagged records have no matching state update', async () => {
    const user = userEvent.setup()
    const session = makeSession([deathFlaggedRecord('rec-1', [2]), deathFlaggedRecord('rec-2', [3])])
    const { onOpenPlayerStatus } = renderCard(session)

    const hint = screen.getByRole('note')
    expect(within(hint).getByText('本夜有 2 项记录标注了死亡类结果，但玩家状态未更新')).toBeInTheDocument()
    // 提示条不得把这些座位写进死亡播报区。
    expect(screen.getByText('本夜无人死亡')).toBeInTheDocument()

    await user.click(within(hint).getByRole('button', { name: '去更新状态' }))
    expect(onOpenPlayerStatus).toHaveBeenCalledWith(1)
  })

  it('drops the hint once the flagged seat has a real state update', () => {
    renderCard(makeSession([stateChange(2, dead), deathFlaggedRecord('rec-1', [2])]))

    expect(screen.queryByRole('note')).not.toBeInTheDocument()
  })

  it('never mutates the session or persists anything while rendering and acting', async () => {
    const user = userEvent.setup()
    window.localStorage.clear()
    const session = deepFreeze(makeSession([stateChange(3, dead), deathFlaggedRecord('rec-1', [2])]))
    const before = JSON.stringify(session)

    const { onStartDay, onOpenPlayerStatus } = renderCard(session)
    await user.click(screen.getByRole('button', { name: '去更新状态' }))
    await user.click(screen.getByRole('button', { name: '已宣布睁眼 · 进入第3天' }))

    expect(JSON.stringify(session)).toBe(before)
    expect(window.localStorage.length).toBe(0)
    expect(onStartDay).toHaveBeenCalledTimes(1)
    expect(onOpenPlayerStatus).toHaveBeenCalledTimes(1)
  })
})
