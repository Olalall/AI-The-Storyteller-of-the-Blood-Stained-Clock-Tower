import { useState } from 'react'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BeginnerTutorialSheet } from './BeginnerTutorialSheet'

describe('BeginnerTutorialSheet', () => {
  it('walks through the complete six-step flow with numbered screenshot callouts', () => {
    const onOpenChange = vi.fn()
    render(<BeginnerTutorialSheet open onOpenChange={onOpenChange} />)

    expect(screen.getByRole('heading', { name: '新手教程' })).toBeInTheDocument()
    expect(screen.getByText('第 1 步，共 6 步')).toBeInTheDocument()
    const flow = screen.getByRole('list', { name: '一局流程' })
    expect(within(flow).getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByText('需要换剧本时点击“切换板子”；不换可直接进入下一项。')).toBeInTheDocument()
    expect(document.querySelectorAll('.beginner-tutorial__focus-box')).toHaveLength(2)

    for (let step = 1; step < 6; step += 1) {
      fireEvent.click(screen.getByRole('button', { name: '下一步' }))
    }

    expect(screen.getByText('第 6 步，共 6 步')).toBeInTheDocument()
    expect(screen.getByText('回到首页点“重置游戏”，声明胜方并保存本局后才能清空。')).toBeInTheDocument()
    expect(document.querySelectorAll('.beginner-tutorial__focus-box')).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: '完成教程' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('uses its trigger so closing returns focus to the tutorial entry', async () => {
    function Harness() {
      const [open, setOpen] = useState(false)
      return <BeginnerTutorialSheet open={open} onOpenChange={setOpen} trigger={<button type="button">新手教程</button>} />
    }

    render(<Harness />)
    const trigger = screen.getByRole('button', { name: '新手教程' })
    fireEvent.click(trigger)
    fireEvent.click(screen.getByRole('button', { name: '关闭新手教程' }))
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})
