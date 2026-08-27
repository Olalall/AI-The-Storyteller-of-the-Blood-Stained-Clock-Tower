import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { Dashboard } from './Dashboard'

function renderDashboard(options?: { withoutPhases?: boolean }) {
  const session = createPrototypeGameSession()
  if (options?.withoutPhases) {
    session.phaseSegments = []
    session.nightRuns = {}
    session.activeNightRunId = null
  }
  const onOpenIdentityDeal = vi.fn()
  const view = render(
    <Dashboard
      session={session}
      dispatch={vi.fn()}
      activeNode={options?.withoutPhases ? 'dusk' : 'night'}
      onEnterNight={vi.fn()}
      onEnterDay={vi.fn()}
      onOpenTimer={vi.fn()}
      onOpenSetup={vi.fn()}
      onOpenIdentityDeal={onOpenIdentityDeal}
      onOpenScriptLibrary={vi.fn()}
      onOpenPlayerStatus={vi.fn()}
      onImportSession={vi.fn()}
      onExitArchive={vi.fn()}
    />,
  )
  return { ...view, onOpenIdentityDeal }
}

describe('Dashboard focus', () => {
  beforeEach(() => window.localStorage.clear())

  it('keeps the current task and player state visible while collapsing low-frequency tools', () => {
    const { container } = renderDashboard()

    expect(screen.getByRole('heading', { name: '瓦釜雷鸣 / Catfishing' })).toHaveAttribute('title', '瓦釜雷鸣 / Catfishing')
    expect(container.querySelector('.dashboard__script-alt')).toHaveTextContent('Catfishing')
    expect(screen.getByRole('heading', { name: '继续第3夜' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '玩家状态' })).toBeVisible()
    expect(container.querySelector('.dashboard__player-summary strong')).toHaveTextContent('12人 · 存活12 · 死亡0')
    expect(container.querySelector('.dashboard__player-summary small')).toHaveTextContent('点卡核对')
    expect(container.querySelectorAll('.dashboard-player-seat > .role-disc--tiny')).toHaveLength(12)
    expect(screen.queryByRole('heading', { name: '最近记录' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '结束对局' })).not.toBeInTheDocument()

    const tools = container.querySelector('.dashboard__more-tools') as HTMLDetailsElement
    expect(tools.open).toBe(false)
    fireEvent.click(tools.querySelector('summary') as HTMLElement)
    expect(tools.open).toBe(true)
    expect(screen.getByRole('button', { name: 'AI配板与调整' })).toBeVisible()
    expect(screen.getByRole('button', { name: '进入白天' })).toBeVisible()
  })

  it('puts incomplete identity handoff ahead of starting the first night without blocking the host', () => {
    const { onOpenIdentityDeal } = renderDashboard({ withoutPhases: true })

    expect(screen.getByRole('heading', { name: '身份领取 0/12' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: '去发身份' }))
    expect(onOpenIdentityDeal).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: '已用实体牌 · 返回首夜准备' })).toBeVisible()
  })
})
