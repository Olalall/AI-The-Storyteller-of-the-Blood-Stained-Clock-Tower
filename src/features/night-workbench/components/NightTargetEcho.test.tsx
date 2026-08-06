import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NightTargetEcho } from './NightTargetEcho'

function renderEcho(props: Partial<Parameters<typeof NightTargetEcho>[0]> = {}) {
  const onTarget = vi.fn()
  const view = render(
    <NightTargetEcho
      playerCount={12}
      selfSeatId={10}
      targetLabel="玩家"
      targetCount={1}
      targets={[]}
      disabled={false}
      onTarget={onTarget}
      {...props}
    />,
  )
  return { ...view, onTarget }
}

describe('抽屉里的目标回显', () => {
  it('没选时告诉说书人去环上点，并写明死人也能选', () => {
    renderEcho()
    expect(screen.getByText(/点环上的座位选玩家/)).toBeTruthy()
    expect(screen.getByText(/死亡座位照样可以选/)).toBeTruthy()
  })

  it('选了就回显「已选：N号」，✕ 走的是同一个 onTarget', async () => {
    const { onTarget } = renderEcho({ targets: [5] })
    expect(screen.getByText('已选：5号')).toBeTruthy()

    await userEvent.click(screen.getByRole('button', { name: '取消选择5号' }))

    // ✕ 不是第二条撤销路径：它 dispatch 的是与点环、点号码网格完全相同的那一条。
    expect(onTarget).toHaveBeenCalledWith(5)
  })

  it('多目标项按点击顺序逐个回显，并说明还差几个', () => {
    renderEcho({ targetCount: 3, targets: [4, 9] })
    expect(screen.getByText('已选：4号')).toBeTruthy()
    expect(screen.getByText('已选：9号')).toBeTruthy()
    expect(screen.getByText(/还差 1 个玩家/)).toBeTruthy()
  })

  it('选满了就不再说还差几个', () => {
    renderEcho({ targetCount: 2, targets: [4, 9] })
    expect(screen.queryByText(/还差/)).toBeNull()
  })
})

describe('号码网格是无障碍通道，不是可选项', () => {
  it('折叠着但恒在，且每个座位都在里面', () => {
    const { container } = renderEcho()
    const details = container.querySelector('details')

    expect(details).not.toBeNull()
    // 折叠：环才是主选择面，抽屉里不再摆一张 6 列网格。
    expect(details?.hasAttribute('open')).toBe(false)
    // 但 12 个座位都实实在在在 DOM 里——读屏与键盘用户走的就是这条路，
    // 若靠 open 时才渲染，Tab 过去会发现里面是空的。
    expect(within(details as HTMLElement).getAllByRole('button')).toHaveLength(12)
  })

  it('已选座位在网格里也是选中态，两处不各自发明一套选中语义', () => {
    renderEcho({ targets: [5] })
    expect(screen.getByRole('button', { name: /选择5号玩家/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /选择6号玩家/ }).getAttribute('aria-pressed')).toBe('false')
  })

  it('点网格里的座位与点环产生同一次调用', async () => {
    const { onTarget } = renderEcho()
    await userEvent.click(screen.getByRole('button', { name: /选择7号玩家/ }))
    expect(onTarget).toHaveBeenCalledWith(7)
  })

  it('只读时整块都点不动，包括那条无障碍通道', async () => {
    const { onTarget } = renderEcho({ targets: [5], disabled: true })

    await userEvent.click(screen.getByRole('button', { name: /选择7号玩家/ }))
    await userEvent.click(screen.getByRole('button', { name: '取消选择5号' }))

    // 只读由自上而下的一个 disabled 强制（fieldset），不是每颗按钮各自判断。
    expect(onTarget).not.toHaveBeenCalled()
  })
})
