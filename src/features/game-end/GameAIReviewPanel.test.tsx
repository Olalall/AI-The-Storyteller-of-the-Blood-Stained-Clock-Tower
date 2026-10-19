import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createGameArchiveRecord, saveArchiveRuntimeSettings } from '../../services/archive'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { createGameReviewDraftAsync } from '../../services/ai'
import { GameAIReviewPanel } from './GameAIReviewPanel'

vi.mock('../../services/ai', async (importOriginal) => ({
  ...await importOriginal<typeof import('../../services/ai')>(),
  createGameReviewDraftAsync: vi.fn(),
}))
function archiveFixture(id = 'review-panel-test') {
  return createGameArchiveRecord({ session: createPrototypeGameSession(), winner: 'good', archiveId: id })
}

describe('GameAIReviewPanel', () => {
  beforeEach(() => { vi.clearAllMocks(); window.localStorage.clear() })

  it('shows facts and missing context first; entertainment is opt-in and never requests AI or edits the archive', async () => {
    const archive = archiveFixture()
    const before = JSON.stringify(archive)
    const { rerender } = render(<GameAIReviewPanel archive={archive} />)
    expect(screen.getByRole('list', { name: '关键事件与依据' })).toBeInTheDocument()
    expect(screen.getByText('缺失信息')).toBeInTheDocument()
    expect(screen.queryByText('玩家评分草稿')).not.toBeInTheDocument()
    expect(createGameReviewDraftAsync).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: '生成 AI 解读' })).not.toBeInTheDocument()
    expect(screen.getByText(/当前使用本地记录，尚未连接后端 AI/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '展开娱乐评分与吐槽' }))
    expect(screen.getByText('玩家评分草稿')).toBeInTheDocument()
    expect(screen.getByText('娱乐排行')).toBeInTheDocument()
    expect(createGameReviewDraftAsync).not.toHaveBeenCalled()
    expect(JSON.stringify(archive)).toBe(before)
    rerender(<GameAIReviewPanel archive={archiveFixture('another-archive')} />)
    expect(screen.queryByText('玩家评分草稿')).not.toBeInTheDocument()
  })

  it('only sends review excerpts after the explicit generation action', async () => {
    saveArchiveRuntimeSettings({ mode: 'http', baseUrl: 'https://backend.example.test', timeoutMs: 2000 })
    const archive = archiveFixture()
    const { createGameReviewDraft } = await import('../../services/ai')
    vi.mocked(createGameReviewDraftAsync).mockResolvedValue({
      ...createGameReviewDraft(archive),
      interpretations: [{ recordIds: ['known-record'], explanation: '待核对解释' }],
    })
    render(<GameAIReviewPanel archive={archive} />)
    expect(screen.getByText(/发给配置的 AI 服务/)).toBeInTheDocument()
    expect(createGameReviewDraftAsync).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: '生成 AI 解读' }))
    expect(createGameReviewDraftAsync).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('待核对解释')).toBeInTheDocument()
    expect(screen.queryByText('玩家评分草稿')).not.toBeInTheDocument()
  })
})
