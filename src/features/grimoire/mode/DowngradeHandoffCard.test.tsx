import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DowngradeHandoffCard } from './DowngradeHandoffCard'

const SUMMARY = {
  groups: [
    { label: '死亡', seats: ['4号', '7号'] },
    { label: '标记', seats: ['5号「僧侣保护」'] },
  ],
  isEmpty: false,
}

describe('DowngradeHandoffCard', () => {
  it('makes staying the primary action, not switching away', () => {
    // 这张卡出现的时刻，说书人多半只是想关掉那张环，
    // 并没有想清楚状态从此归谁管。
    render(<DowngradeHandoffCard summary={SUMMARY} onStay={vi.fn()} onConfirm={vi.fn()} />)

    const stay = screen.getByRole('button', { name: '留在魔典模式' })
    expect(stay.className).toContain('ui-button--primary')
  })

  it('shows every seat the storyteller has to copy across', () => {
    render(<DowngradeHandoffCard summary={SUMMARY} onStay={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByText('4号 · 7号')).toBeVisible()
    expect(screen.getByText('5号「僧侣保护」')).toBeVisible()
  })

  it('promises the data is kept, not deleted', () => {
    render(<DowngradeHandoffCard summary={SUMMARY} onStay={vi.fn()} onConfirm={vi.fn()} />)
    expect(screen.getByText(/不会删/)).toBeVisible()
  })

  it('still asks for confirmation when there is nothing to copy', () => {
    render(<DowngradeHandoffCard summary={{ groups: [], isEmpty: true }} onStay={vi.fn()} onConfirm={vi.fn()} />)

    expect(screen.getByRole('button', { name: '已抄好，切回纯记录' })).toBeVisible()
    expect(screen.queryByRole('button', { name: /复制清单/ })).toBeNull()
  })

  it('only switches on the explicit confirmation', async () => {
    const onConfirm = vi.fn()
    const onStay = vi.fn()
    render(<DowngradeHandoffCard summary={SUMMARY} onStay={onStay} onConfirm={onConfirm} />)

    await userEvent.click(screen.getByRole('button', { name: '已抄好，切回纯记录' }))

    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onStay).not.toHaveBeenCalled()
  })

  it('does not report a copy that never happened', async () => {
    // 剪贴板被拒时清单仍在屏幕上，照着抄即可——但绝不能谎称已复制。
    vi.stubGlobal('navigator', { clipboard: { writeText: () => Promise.reject(new Error('denied')) } })
    render(<DowngradeHandoffCard summary={SUMMARY} onStay={vi.fn()} onConfirm={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: /复制清单/ }))

    expect(screen.getByRole('button', { name: /复制清单/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: '已复制' })).toBeNull()
    vi.unstubAllGlobals()
  })
})
