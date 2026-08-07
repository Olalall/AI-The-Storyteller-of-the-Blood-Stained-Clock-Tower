import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { HostingModeCard } from './HostingModeCard'

describe('HostingModeCard', () => {
  it('presents both modes without pre-selecting either', () => {
    // 预选等于替说书人回答了一个只有他知道答案的问题（桌上到底有没有实体魔典）。
    render(<HostingModeCard onSelect={vi.fn()} />)

    for (const option of screen.getAllByRole('radio')) {
      expect(option).toHaveAttribute('aria-checked', 'false')
    }
  })

  it('reports the chosen mode', async () => {
    const onSelect = vi.fn()
    render(<HostingModeCard onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('radio', { name: /没有实体魔典/ }))

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('grimoire')
  })

  it('shows which mode is already in effect', () => {
    render(<HostingModeCard value="record" onSelect={vi.fn()} />)

    expect(screen.getByRole('radio', { name: /桌上有实体魔典/ })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: /没有实体魔典/ })).toHaveAttribute('aria-checked', 'false')
  })

  it('still asks the question on a narrow screen, and says what will degrade', () => {
    // 问的是桌上有没有实体魔典，不是屏幕多宽。隐藏它会让模式静默取默认值，
    // 换到平板上就会看见一张自己从没同意过的电子魔典。
    render(<HostingModeCard onSelect={vi.fn()} narrow />)

    expect(screen.getAllByRole('radio')).toHaveLength(2)
    expect(screen.getByRole('note')).toHaveTextContent('排成列表')
  })

  it('says nothing about degradation when the screen can draw the ring', () => {
    render(<HostingModeCard onSelect={vi.fn()} />)
    expect(screen.queryByRole('note')).toBeNull()
  })

  it('tells the storyteller the choice is reversible', () => {
    // 不可逆的印象会让人在这一步卡住，而这个选择本来每局甚至局中都可以改。
    render(<HostingModeCard onSelect={vi.fn()} />)
    expect(screen.getByText(/随时可以改/)).toBeVisible()
  })
})
