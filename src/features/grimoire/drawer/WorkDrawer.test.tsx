import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WorkDrawer } from './WorkDrawer'

describe('WorkDrawer', () => {
  it('keeps the gesture contract on screen at every detent', async () => {
    // 暗光下说书人只有余裕记「点下去 = 做当前这一步」，这一行不能被档位推出视野。
    render(<WorkDrawer gestureContract="点座位 = 选目标">内容</WorkDrawer>)

    expect(screen.getByText('点座位 = 选目标')).toBeVisible()
    await userEvent.click(screen.getByRole('slider'))
    expect(screen.getByText('点座位 = 选目标')).toBeVisible()
  })

  it('cycles peek → half → full → peek on tap', async () => {
    const onDetentChange = vi.fn()
    render(<WorkDrawer gestureContract="x" onDetentChange={onDetentChange}>内容</WorkDrawer>)
    const handle = screen.getByRole('slider')

    await userEvent.click(handle)
    await userEvent.click(handle)
    await userEvent.click(handle)

    expect(onDetentChange.mock.calls.map(([d]) => d)).toEqual(['half', 'full', 'peek'])
  })

  it('reaches every detent from the keyboard, not just the tap accelerator', async () => {
    render(<WorkDrawer gestureContract="x">内容</WorkDrawer>)
    const handle = screen.getByRole('slider')
    handle.focus()

    await userEvent.keyboard('{ArrowUp}')
    expect(handle).toHaveAttribute('aria-valuetext', '半屏')
    await userEvent.keyboard('{ArrowUp}')
    expect(handle).toHaveAttribute('aria-valuetext', '全屏')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(handle).toHaveAttribute('aria-valuetext', '窥视')
  })

  it('announces the current detent to a screen reader', () => {
    render(<WorkDrawer gestureContract="x" detent="half">内容</WorkDrawer>)
    const handle = screen.getByRole('slider')

    expect(handle).toHaveAttribute('aria-valuenow', '1')
    expect(handle).toHaveAttribute('aria-valuemax', '2')
    expect(handle).toHaveAttribute('aria-valuetext', '半屏')
  })

  it('takes the detent from its owner when controlled', async () => {
    const onDetentChange = vi.fn()
    render(<WorkDrawer gestureContract="x" detent="peek" onDetentChange={onDetentChange}>内容</WorkDrawer>)

    await userEvent.click(screen.getByRole('slider'))

    // 受控时自己不许改档，只报告意图——否则父层状态与显示会分叉。
    expect(onDetentChange).toHaveBeenCalledExactlyOnceWith('half')
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '窥视')
  })

  it('takes the drawer body out of the tab order while only peeking', () => {
    const { container, rerender } = render(
      <WorkDrawer gestureContract="x" detent="peek"><button type="button">确认</button></WorkDrawer>,
    )
    expect(container.querySelector('.work-drawer__body')).toHaveAttribute('inert')

    rerender(<WorkDrawer gestureContract="x" detent="half"><button type="button">确认</button></WorkDrawer>)
    expect(container.querySelector('.work-drawer__body')).not.toHaveAttribute('inert')
  })
})
