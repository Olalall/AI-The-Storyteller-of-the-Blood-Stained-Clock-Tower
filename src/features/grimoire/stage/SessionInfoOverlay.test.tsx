import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../game-session/types'
import { SessionInfoOverlay } from './SessionInfoOverlay'

function renderOverlay(session: GameSessionState, overrides: { onOpenScriptLibrary?: () => void; dispatch?: () => void } = {}) {
  const onOpenChange = vi.fn()
  const onOpenScriptLibrary = overrides.onOpenScriptLibrary ?? vi.fn()
  const dispatch = overrides.dispatch ?? vi.fn()
  render(
    <SessionInfoOverlay
      open
      onOpenChange={onOpenChange}
      session={session}
      dispatch={dispatch}
      onOpenScriptLibrary={onOpenScriptLibrary}
    />,
  )
  return { onOpenChange, onOpenScriptLibrary, dispatch }
}

describe('SessionInfoOverlay', () => {
  it('states what this session is: script, seats, knowledge version', () => {
    const session = createPrototypeGameSession()
    renderOverlay(session)

    expect(screen.getByText('12人')).toBeVisible()
    expect(screen.getByText(session.knowledgeVersion)).toBeVisible()
  })

  it('keeps 切换板子 locked once the session has records', async () => {
    // 换板子会让这一局的记录对不上剧本，而这一层没有任何撤销。
    const onOpenScriptLibrary = vi.fn()
    renderOverlay(createPrototypeGameSession(), { onOpenScriptLibrary })

    const button = screen.getByRole('button', { name: '切换板子' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onOpenScriptLibrary).not.toHaveBeenCalled()
    expect(screen.getByRole('note')).toBeVisible()
  })

  it('opens the script library on a blank session and closes itself on the way out', async () => {
    const { onOpenChange, onOpenScriptLibrary } = renderOverlay(createEmptyGameSession())

    await userEvent.click(screen.getByRole('button', { name: '切换板子' }))

    expect(onOpenScriptLibrary).toHaveBeenCalledOnce()
    // 留着浮层不关，剧本库会开在它下面，返回时说书人回到的是一张已经过时的本局信息。
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('carries the only mode switch entry the grimoire has (裁决 7)', async () => {
    const dispatch = vi.fn()
    renderOverlay({ ...createEmptyGameSession(), hostingMode: 'record' }, { dispatch })

    await userEvent.click(screen.getByRole('radio', { name: /没有实体魔典/ }))

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'set-hosting-mode', mode: 'grimoire' }))
  })
})
