import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../features/game-session/data/createPrototypeSession'
import { AppPhaseTrack } from './AppPhaseTrack'

it('keeps records and the current view visible while moving teaching and game end into more actions', () => {
  const onOpenGameEnd = vi.fn()
  render(
    <AppPhaseTrack
      session={createPrototypeGameSession()}
      activeNode="night"
      inArchive={false}
      onOpenRecords={vi.fn()}
      onToggleArchive={vi.fn()}
      onOpenGameEnd={onOpenGameEnd}
    />,
  )

  expect(screen.getByRole('button', { name: /本局记录/ })).toBeVisible()
  expect(screen.getByRole('button', { name: '本局' })).toBeVisible()
  expect(screen.getByRole('list', { name: '阶段进度，可左右滑动' }).querySelector('[aria-current="step"]')).toHaveTextContent('夜第3夜')
  fireEvent.click(screen.getByRole('button', { name: '更多' }))
  expect(screen.getByRole('heading', { name: '更多主持功能' })).toBeVisible()
  expect(screen.getByRole('button', { name: '新手教学' })).toBeVisible()
  fireEvent.click(screen.getByRole('button', { name: '收尾与复盘' }))
  expect(onOpenGameEnd).toHaveBeenCalledOnce()
  expect(screen.queryByRole('heading', { name: '更多主持功能' })).not.toBeInTheDocument()
})
