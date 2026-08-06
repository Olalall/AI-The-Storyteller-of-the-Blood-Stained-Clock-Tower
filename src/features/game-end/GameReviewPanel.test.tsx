import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createGameArchiveRecord } from '../../services/archive'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../game-session/state/projectors'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { GameReviewPanel } from './GameReviewPanel'
import type { GameSessionState } from '../game-session/types'

function archiveOf(session: GameSessionState, archiveId: string) {
  return createGameArchiveRecord({ session, winner: 'good', archiveId, archivedAt: '2026-02-03T10:00:00.000Z' })
}

function killSeatFive(session: GameSessionState): GameSessionState {
  const before = projectCurrentPlayerStates(session)[5]
  return gameSessionReducer(session, {
    type: 'confirm-player-state-change',
    seatId: 5,
    expectedBefore: before,
    after: { ...before, life: 'dead' },
    segmentId: null,
    entryId: 'died-1',
    confirmedAt: '2026-02-03T09:00:00.000Z',
    reason: '被恶魔杀死',
  })
}

function renderPanel(archive: ReturnType<typeof archiveOf>) {
  render(
    <GameReviewPanel
      archives={[archive]}
      selectedArchive={archive}
      onSelectArchive={vi.fn()}
      onExportArchive={vi.fn()}
      onStartArchive={vi.fn()}
    />,
  )
}

describe('归档摘要不许把「没录过」讲成「没死过」', () => {
  it('replaces alive/dead with 未录入 when the game never recorded a state change', () => {
    // 建局初值是全员存活，一次 player_state_changed 都没有时，
    // projectCurrentPlayerStates 会原样把它返回来——于是一局死了六个人、
    // 生死全记在实体魔典上的对局，会在战绩里显示「存活 12 / 死亡 0」。
    renderPanel(archiveOf(createPrototypeGameSession(), 'never-recorded'))

    expect(screen.getByText('存活').parentElement).toHaveTextContent('存活未录入')
    expect(screen.getByText('死亡').parentElement).toHaveTextContent('死亡未录入')
    // 玩家数 12 是配板事实，照常显示——被遮住的只有那两个假装是结果的数字。
    expect(screen.getByText('玩家').parentElement).toHaveTextContent('玩家12')
    expect(screen.getByRole('note')).toHaveTextContent('生死以说书人当时的实体魔典为准')
  })

  it('shows the real numbers once the storyteller recorded anything', () => {
    renderPanel(archiveOf(killSeatFive(createPrototypeGameSession()), 'recorded'))

    expect(screen.queryByText('未录入')).not.toBeInTheDocument()
    expect(screen.queryByRole('note')).not.toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})

describe('归档列表与详情都说得出这局当时是怎么主持的', () => {
  it('tags a session that never opened the grimoire as 笔录局', () => {
    renderPanel(archiveOf(createPrototypeGameSession(), 'record-game'))

    expect(screen.getByLabelText('本局主持模式')).toHaveTextContent('笔录局')
  })

  it('spells out when a mixed game switched over', () => {
    const session: GameSessionState = {
      ...createPrototypeGameSession(),
      hostingMode: 'grimoire',
      hostingModeHistory: [
        { mode: 'record', changedAt: '2026-02-03T08:00:00.000Z', phaseLabel: '开局前' },
        { mode: 'grimoire', changedAt: '2026-02-03T09:30:00.000Z', phaseLabel: '第3夜' },
      ],
    }

    renderPanel(archiveOf(session, 'mixed-game'))

    expect(screen.getByLabelText('本局主持模式')).toHaveTextContent('混合 · 第3夜起开魔典')
  })
})
