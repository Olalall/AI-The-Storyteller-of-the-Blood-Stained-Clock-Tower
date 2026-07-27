import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createGameArchiveRecord } from '../../services/archive'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { GameAIReviewPanel } from './GameAIReviewPanel'

function archiveFixture() {
  return createGameArchiveRecord({
    session: createPrototypeGameSession(),
    winner: 'good',
    archiveId: 'review-panel-test',
    archivedAt: '2026-07-27T00:00:00.000Z',
  })
}

describe('GameAIReviewPanel', () => {
  it('shows full review and player key event drafts without claiming authority', async () => {
    render(<GameAIReviewPanel archive={archiveFixture()} />)

    expect(screen.getByText('AI复盘草稿')).toBeInTheDocument()
    expect(screen.getByText('关键转折')).toBeInTheDocument()
    expect(screen.getByText(/配板与身份/)).toBeInTheDocument()
    expect(screen.getByText(/非客观评分/)).toBeInTheDocument()
  })
})
