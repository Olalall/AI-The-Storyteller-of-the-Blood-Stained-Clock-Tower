import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SeatButton } from './SeatButton'

describe('SeatButton 状态语义', () => {
  it('dead 同时给出虚线描边、Skull 图标与可访问名中的“已死亡”', () => {
    render(<SeatButton seat={3} dead aria-label="记录3号举手" />)
    const button = screen.getByRole('button', { name: '记录3号举手（已死亡）' })
    expect(button.className).toContain('seat-button--dead')
    expect(button.querySelector('.seat-button__dead svg')).not.toBeNull()
  })

  it('self 显示“本人”角标并写进可访问名，不影响可点击性', () => {
    render(<SeatButton seat={5} self />)
    const button = screen.getByRole('button', { name: '选择5号（本人）' })
    expect(button).toBeEnabled()
    expect(button.querySelector('.seat-button__self')?.textContent).toBe('本人')
  })

  it('subdued 只是低强调：不加死亡语义、不改可访问名、不禁用', () => {
    render(<SeatButton seat={7} subdued />)
    const button = screen.getByRole('button', { name: '选择7号' })
    expect(button.className).toContain('seat-button--subdued')
    expect(button.className).not.toContain('seat-button--dead')
    expect(button.querySelector('.seat-button__dead')).toBeNull()
    expect(button).toBeEnabled()
  })

  it('死亡座位仍可被选中，勾选与死亡标记同时存在', () => {
    render(<SeatButton seat={2} dead selected />)
    const button = screen.getByRole('button', { name: '选择2号（已死亡）' })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(button.querySelector('.seat-button__check')).not.toBeNull()
    expect(button.querySelector('.seat-button__dead')).not.toBeNull()
  })
})
