import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DayRingOverlay } from './DayRingOverlay'
import { SATELLITE_MAX_CHIP, solveRingLayout } from '../layout/ellipseRing'
import type { VoteRingBadge } from './voteRingBadges'

const SEAT_IDS = Array.from({ length: 12 }, (_value, index) => index + 1)
const LAYOUT = solveRingLayout({ seatCount: 12, stageWidth: 900, stageHeight: 640 })

function renderOverlay(overrides: Partial<Parameters<typeof DayRingOverlay>[0]> = {}) {
  return render(
    <DayRingOverlay
      layout={LAYOUT}
      seatIds={SEAT_IDS}
      shield="L1"
      nominatorSeatId={1}
      nomineeSeatId={4}
      emphasis="active"
      badges={[]}
      execution={null}
      onConfirmGhostVote={() => {}}
      {...overrides}
    />,
  )
}

const raised = (seatId: number, order: number, ghostVote: VoteRingBadge['ghostVote'] = 'none'): VoteRingBadge =>
  ({ seatId, order, ghostVote })

describe('白天叠加层', () => {
  it('环上只画一条连线，就是这一次提名', () => {
    // 「环上唯一一处连线」是硬规矩：多一条，环就从局面图变成了关系图。
    const { container } = renderOverlay()
    expect(container.querySelectorAll('path')).toHaveLength(1)
    expect(container.querySelectorAll('polygon')).toHaveLength(2)
    expect(container.querySelector('[data-role="nominator"]')).not.toBeNull()
    expect(container.querySelector('[data-role="nominee"]')).not.toBeNull()
  })

  it('只选了提名人时不画线，只留起点三角', () => {
    const { container } = renderOverlay({ nomineeSeatId: null })
    expect(container.querySelectorAll('path')).toHaveLength(0)
    expect(container.querySelectorAll('polygon')).toHaveLength(1)
  })

  it('举手打卡长出 ✋ + 「举」+ 序号，三重编码', () => {
    const { container } = renderOverlay({ badges: [raised(6, 1), raised(2, 2)] })
    const punches = container.querySelectorAll('.day-ring-overlay__punch')

    expect(punches).toHaveLength(2)
    expect(punches[0].textContent).toContain('举')
    expect(punches[0].textContent).toContain('1')
    expect(punches[0].querySelector('svg')).not.toBeNull()
    // 序号是唱票序号，不是座位号：6 号排第 1，2 号排第 2。
    expect(punches[1].textContent).toContain('2')
  })

  it('死亡票 chip 是 44px 且独占卫星弧，活人举手不长它', () => {
    const { container } = renderOverlay({ badges: [raised(7, 1, 'unconfirmed'), raised(2, 2)] })
    const chips = container.querySelectorAll('.day-ring-overlay__ghost-vote')

    expect(chips).toHaveLength(1)
    expect(chips[0].getAttribute('data-seat-id')).toBe('7')
    // 44px 不是装饰：幽灵票一局只有一张、按下去不可逆，必须大到不会点错。
    expect((chips[0] as HTMLElement).style.width).toBe(`${SATELLITE_MAX_CHIP}px`)
    expect((chips[0] as HTMLElement).style.height).toBe(`${SATELLITE_MAX_CHIP}px`)
  })

  it('点死亡票 chip 只报给回调，不自己改任何东西', async () => {
    const onConfirmGhostVote = vi.fn()
    renderOverlay({ badges: [raised(7, 1, 'unconfirmed')], onConfirmGhostVote })

    await userEvent.click(screen.getByRole('button', { name: /7号 死亡票未标记/ }))
    expect(onConfirmGhostVote).toHaveBeenCalledExactlyOnceWith(7)
  })

  it('只读时 chip 变禁用，而不是消失——票还在，只是此刻改不了', async () => {
    renderOverlay({ badges: [raised(7, 1, 'confirmed')], onConfirmGhostVote: null })
    const chip = screen.getByRole('button', { name: /7号 死亡票已标记/ })

    expect(chip).toBeDisabled()
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })

  it('L0 下整层不进 DOM，不是视觉遮住', () => {
    const { container } = renderOverlay({ shield: 'L0', badges: [raised(7, 1, 'unconfirmed')] })
    expect(container.querySelector('.day-ring-overlay')).toBeNull()
    expect(container.textContent).toBe('')
  })

  it('窄屏退化成网格时整层不渲染——没有环就没有弧与卫星位', () => {
    const grid = solveRingLayout({ seatCount: 20, stageWidth: 320, stageHeight: 380 })
    expect(grid.mode).toBe('grid')

    const { container } = renderOverlay({ layout: grid, badges: [raised(7, 1, 'unconfirmed')] })
    expect(container.querySelector('.day-ring-overlay')).toBeNull()
  })

  it('处决落账后挂「本日处决」角标，且不自己补一层帷幕', () => {
    // 帷幕跟着 life 走（GrimoireSeat 已经画了）。这里再盖一层，
    // 对弄臣这类被处决却活着的人就是在环上说假话。
    const { container } = renderOverlay({ execution: { seatId: 9, causedDeath: false } })
    const badge = container.querySelector('.day-ring-overlay__execution')

    expect(badge?.textContent).toContain('本日处决')
    expect(badge?.getAttribute('data-seat-id')).toBe('9')
    expect(badge?.getAttribute('data-caused-death')).toBe('false')
    expect(container.querySelectorAll('[class*="shroud"]')).toHaveLength(0)
  })

  it('给读屏留一句话，说清谁提名了谁、谁举了手', () => {
    renderOverlay({ badges: [raised(6, 1)], execution: { seatId: 9, causedDeath: true } })
    expect(screen.getByText(/1号提名4号；环上已打卡1只手：6号；9号本日被处决/)).toBeTruthy()
  })

  it('不在环上的座位号不会把整层带崩', () => {
    const { container } = renderOverlay({
      nominatorSeatId: 99,
      badges: [raised(99, 1, 'unconfirmed')],
      execution: { seatId: 99, causedDeath: true },
    })
    expect(container.querySelector('.day-ring-overlay')).not.toBeNull()
    expect(container.querySelectorAll('.day-ring-overlay__punch')).toHaveLength(0)
  })
})
