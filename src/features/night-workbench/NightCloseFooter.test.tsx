import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useMemo } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession, gameSessionStorageKey } from '../game-session/data/createPrototypeSession'
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


/**
 * 默认落地已改为空对局（首次打开显示入口界面），而这些用例测的是工作台本身，
 * 需要一局进行中的对局做夹具，所以显式播种。
 */
function seedPrototypeSession() {
  window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(createPrototypeGameSession()))
}

describe('NightCloseFooter', () => {
  beforeEach(() => { window.localStorage.clear(); seedPrototypeSession() })

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
