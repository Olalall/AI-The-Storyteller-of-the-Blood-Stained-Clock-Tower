import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PlayerStatusBar } from './PlayerStatusBar'

describe('PlayerStatusBar', () => {
  it('distinguishes life, poison, drunkenness and named markers with icons and text', () => {
    render(
      <PlayerStatusBar
        playerLabel="3号玩家"
        status={{
          life: 'dead',
          impairments: ['drunk', 'poisoned'],
          markers: [{ id: 'red-herring', label: '红鲱鱼' }],
        }}
      />,
    )

    const statusBar = screen.getByRole('region', { name: '3号玩家状态' })
    expect(within(statusBar).getByText('死亡')).toBeInTheDocument()
    expect(within(statusBar).getByText('中毒')).toBeInTheDocument()
    expect(within(statusBar).getByText('醉酒')).toBeInTheDocument()
    expect(within(statusBar).getByText('标记：红鲱鱼')).toBeInTheDocument()
    expect(statusBar.querySelectorAll('svg')).toHaveLength(4)
  })
})
