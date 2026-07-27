import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
import { useGameSession } from '../game-session/state/useGameSession'
import type { GameSessionState } from '../game-session/types'
import { NightWorkbench } from './NightWorkbench'

function NightHarness() {
  const { session, dispatch } = useGameSession()
  const sessionBinding = useMemo(() => ({ session, dispatchSession: dispatch }), [session, dispatch])
  return <NightWorkbench sessionBinding={sessionBinding} onExit={() => undefined} />
}

function storedSession() {
  return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
}

describe('NightCloseFooter', () => {
  beforeEach(() => window.localStorage.clear())

  it('ends the current night only after explicit confirmation', async () => {
    const user = userEvent.setup()
    render(<NightHarness />)

    await user.click(screen.getByRole('button', { name: '检查并关闭' }))
    expect(screen.getByText('关闭第3夜？')).toBeInTheDocument()
    expect(storedSession().phaseSegments.find((segment) => segment.id === 'night-3')?.closedAt).toBeUndefined()
    await user.click(screen.getByRole('button', { name: '确认关闭' }))
    await waitFor(() => expect(storedSession().phaseSegments.find((segment) => segment.id === 'night-3')?.closedAt).toBeTruthy())
  })
})
