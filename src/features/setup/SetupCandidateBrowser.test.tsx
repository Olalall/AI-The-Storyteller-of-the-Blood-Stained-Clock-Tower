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

  it('shows a concise Chinese recommendation without applying a setup candidate', async () => {
    const user = userEvent.setup()
    saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
    const fetchMock = vi.fn(async () => jsonResponse({
      accepted: true,
      data: {
        draft: {
          provider: 'openai-compatible',
          confidence: 'medium',
          draftOnly: true,
          recommendedCandidateIds: ['setup-b', 'setup-a'],
          warnings: ['High-risk effects need confirmation.'],
          reasons: ['This setup is better for veteran players.'],
          disclaimer: 'AI 只给草稿。',
        },
      },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const { onUseCandidate, onPreviewMicroAdjustment } = renderBrowser()

    await user.click(screen.getByRole('button', { name: '生成推荐' }))

    expect(await screen.findByText('智能首选')).toBeInTheDocument()
    const adviceStrip = screen.getByRole('status', { name: '推荐结果' })
    expect(within(adviceStrip).getByText('推荐组合')).toBeInTheDocument()
    expect(within(adviceStrip).getAllByText('戏剧反转').length).toBeGreaterThan(0)
    expect(within(adviceStrip).getByText('身份变化更明显。')).toBeInTheDocument()
    expect(screen.queryByText(/High-risk|This setup/)).not.toBeInTheDocument()
    expect(screen.queryByText('质量提示')).not.toBeInTheDocument()
    expect(await screen.findByText('推荐已生成')).toBeInTheDocument()
    const refreshButton = screen.getByRole('button', { name: '重新推荐' })
    expect(refreshButton).toBeEnabled()
    await user.click(refreshButton)
    expect(await screen.findByText('推荐已更新（第2次）')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(onUseCandidate).not.toHaveBeenCalled()
    expect(onPreviewMicroAdjustment).not.toHaveBeenCalled()
  })
})
