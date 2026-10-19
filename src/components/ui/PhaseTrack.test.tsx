import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { PhaseTrackNode } from '../../features/game-session/state/projectPhaseTrack'
import { PhaseTrack } from './PhaseTrack'

const nodes: readonly PhaseTrackNode[] = [
  { id: 'dusk', label: '黄昏', status: 'done' },
  { id: 'night', label: '夜', status: 'done', segmentLabel: '第3夜' },
  { id: 'dawn', label: '黎明', status: 'done' },
  { id: 'day', label: '白天', status: 'open', segmentLabel: '第3天' },
  { id: 'vote', label: '提名投票', status: 'open' },
  { id: 'execution', label: '处决', status: 'suggest' },
]

it('marks the explicit current stage and keeps the horizontal rail keyboard-scrollable', () => {
  render(<PhaseTrack nodes={nodes} currentNodeId="vote" />)

  const list = screen.getByRole('list', { name: '阶段进度，可左右滑动' })
  expect(list.querySelector('[aria-current="step"]')).toHaveTextContent('提名投票')

  const scrollTo = vi.fn()
  Object.defineProperties(list, {
    clientWidth: { configurable: true, value: 300 },
    scrollWidth: { configurable: true, value: 640 },
    scrollLeft: { configurable: true, value: 0 },
    scrollTo: { configurable: true, value: scrollTo },
  })
  fireEvent.keyDown(list, { key: 'End' })
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 640, behavior: 'auto' })
  fireEvent.keyDown(list, { key: 'Home' })
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: 'auto' })
})
