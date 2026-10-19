import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createEmptyGameSession } from '../game-session/data/createPrototypeSession'
import { NightWorkbench } from './NightWorkbench'

it('shows an unavailable notice without sample roles or writes when this session has no night', () => {
  const dispatchSession = vi.fn()
  render(<NightWorkbench sessionBinding={{ session: createEmptyGameSession(), dispatchSession }} onExit={() => undefined} />)
  expect(screen.getByText('当前夜序不可用')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '返回本局' })).toBeInTheDocument()
  expect(screen.queryByText('洗脑师')).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: '确认本项' })).not.toBeInTheDocument()
  expect(dispatchSession).not.toHaveBeenCalled()
})
