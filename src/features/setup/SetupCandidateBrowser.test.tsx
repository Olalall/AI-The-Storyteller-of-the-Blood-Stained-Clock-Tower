import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultArchiveRuntimeSettings, resetArchiveRuntimeSettings, saveArchiveRuntimeSettings } from '../../services/archive'
import { SetupCandidateBrowser } from './SetupCandidateBrowser'
import type { SetupPrototypeCandidate } from './types'

function candidates(): SetupPrototypeCandidate[] {
  return [
    {
      id: 'setup-a',
      title: '耐玩均衡',
      style: 'balanced',
      scriptId: 'catfishing',
      playerCount: 12,
      knowledgeVersion: 'test-v1',
      assignments: [
        { seatId: 1, role: { id: 'investigator', name: '调查员', initial: '调', iconPath: '' } },
      ],
      demonBluffs: [],
      rationale: {
        summary: '信息源分散，适合稳定开局。',
        pace: 'steady',
        playerFit: '适合标准桌。',
        risk: '留意毒醉。',
      },
      source: 'prototype',
      legalityChecks: [],
    },
    {
      id: 'setup-b',
      title: '戏剧反转',
      style: 'reversal',
      scriptId: 'catfishing',
      playerCount: 12,
      knowledgeVersion: 'test-v1',
      assignments: [
        { seatId: 2, role: { id: 'snake_charmer', name: '舞蛇人', initial: '舞', iconPath: '' } },
      ],
      demonBluffs: [],
      rationale: {
        summary: '身份变化更明显。',
        pace: 'swingy',
        playerFit: '适合熟练座。',
        risk: '核对身份交换。',
      },
      source: 'prototype',
      legalityChecks: [],
    },
  ]
}

function renderBrowser(onUseCandidate = vi.fn(), onPreviewMicroAdjustment = vi.fn()) {
  render(
    <SetupCandidateBrowser
      scriptId="catfishing"
      scriptName="Catfishing / 瓦釜雷鸣"
      knowledgeVersion="test-v1"
      playerCount={12}
      seats={[
        { seatId: 1, nickname: '玩家1', experience: 'regular' },
        { seatId: 2, nickname: '玩家2', experience: 'veteran' },
      ]}
      candidates={candidates()}
      onUseCandidate={onUseCandidate}
      onPreviewMicroAdjustment={onPreviewMicroAdjustment}
    />,
  )
  return { onUseCandidate, onPreviewMicroAdjustment }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('SetupCandidateBrowser AI advice presentation', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetArchiveRuntimeSettings()
    vi.unstubAllGlobals()
  })

  it('shows the AI top pick without applying a setup candidate', async () => {
    const user = userEvent.setup()
    saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({
      accepted: true,
      data: {
        draft: {
          provider: 'openai-compatible',
          confidence: 'medium',
          draftOnly: true,
          recommendedCandidateIds: ['setup-b', 'setup-a'],
          warnings: ['先核对身份交换。'],
          reasons: ['熟练座更多，反转局更适合本桌。'],
          disclaimer: 'AI 只给草稿。',
        },
      },
    })))
    const { onUseCandidate, onPreviewMicroAdjustment } = renderBrowser()

    await user.click(screen.getByRole('button', { name: 'AI推荐' }))

    expect(await screen.findByText('AI首选')).toBeInTheDocument()
    const adviceStrip = screen.getByRole('status')
    expect(within(adviceStrip).getByText('首选')).toBeInTheDocument()
    expect(within(adviceStrip).getAllByText('戏剧反转').length).toBeGreaterThan(0)
    expect(within(adviceStrip).getByText('熟练座更多，反转局更适合本桌。')).toBeInTheDocument()
    expect(within(adviceStrip).getByText('先核对身份交换。')).toBeInTheDocument()
    expect(within(adviceStrip).getByText('平衡分析')).toBeInTheDocument()
    expect(within(adviceStrip).getByText('微调建议')).toBeInTheDocument()
    await user.click(within(adviceStrip).getAllByRole('button', { name: '预览调整' })[0])
    const setupCards = screen.getAllByRole('article')
    expect(within(setupCards[0]).getByText('戏剧反转')).toBeInTheDocument()
    expect(within(setupCards[0]).getByText('质量提示')).toBeInTheDocument()
    expect(within(setupCards[0]).getByText('高反转')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新推荐' })).toBeEnabled()
    expect(onUseCandidate).not.toHaveBeenCalled()
    expect(onPreviewMicroAdjustment).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ candidateId: expect.any(String) }))
  })
})
