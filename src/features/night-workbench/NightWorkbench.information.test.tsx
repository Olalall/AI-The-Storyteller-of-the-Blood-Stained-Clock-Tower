import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it } from 'vitest'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import type { GameSessionState } from '../game-session/types'
import { NightWorkbench } from './NightWorkbench'
import { informationSession, projected } from './state/nightInformation.test-support'
import { parseSessionBackup } from '../../services/session/sessionBackup'

describe('night information UI', () => {
  it('keeps both information seats selected on the real workbench', async () => {
    let latest = informationSession('librarian')
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '选择10号玩家' }))
    await user.click(screen.getByRole('button', { name: '选择1号玩家' }))
    const state = projected(latest)
    expect(state.drafts[state.activeCursorId].targets).toEqual([10, 1])
    expect(screen.getByRole('button', { name: '选择10号玩家' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '选择1号玩家' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('separates good/evil choices and saves verified facts only on the explicit save action', async () => {
    let latest: GameSessionState = informationSession()
    const originalTimeline = structuredClone(latest.timeline)
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    const user = userEvent.setup()
    render(<Harness />)
    await user.click(screen.getByRole('button', { name: '选择12号玩家' }))
    await user.click(within(screen.getByRole('group', { name: /善良角色/ })).getByRole('button', { name: '将军' }))
    expect(screen.getByRole('button', { name: '记录结果' })).toBeDisabled()
    expect(screen.getByText(/选一善一恶两个角色/)).toBeInTheDocument()
    expect(within(screen.getByRole('group', { name: /善良角色/ })).queryByRole('button', { name: '投毒者' })).toBeNull()
    await user.click(within(screen.getByRole('group', { name: /邪恶角色/ })).getByRole('button', { name: '投毒者' }))
    expect(screen.getByRole('button', { name: '记录结果' })).toBeEnabled()
    await user.click(screen.getByText('补充已核对事实（可选）'))
    await user.type(screen.getByRole('textbox', { name: '说书人已核对的事实' }), '12号当前邪恶，已核对无误登记。')
    expect(screen.getByText('未保存，尚未用于AI')).toBeInTheDocument()
    let state = projected(latest)
    expect(state.drafts[state.activeCursorId].storytellerContext).toBeUndefined()
    await user.click(screen.getByRole('button', { name: '保存补充事实' }))
    state = projected(latest)
    expect(state.drafts[state.activeCursorId]).toMatchObject({ roleChoice: 'general', secondRoleChoice: 'poisoner', storytellerContext: '12号当前邪恶，已核对无误登记。' })
    expect(latest.timeline).toEqual(originalTimeline)
    await user.click(screen.getByRole('button', { name: '记录结果' }))
    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    expect(screen.getAllByText('将军 / 投毒者').length).toBeGreaterThan(0)
  })

  it('shows saved facts after confirming with a different unsaved edit, and stays consistent after reload', async () => {
    let latest = informationSession()
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    const user = userEvent.setup()
    const view = render(<Harness />)
    await user.click(screen.getByRole('button', { name: '选择12号玩家' }))
    await user.click(within(screen.getByRole('group', { name: /善良角色/ })).getByRole('button', { name: '将军' }))
    await user.click(within(screen.getByRole('group', { name: /邪恶角色/ })).getByRole('button', { name: '投毒者' }))
    await user.click(screen.getByText('补充已核对事实（可选）'))
    await user.type(screen.getByRole('textbox', { name: '说书人已核对的事实' }), '保存A：12号当前邪恶。')
    await user.click(screen.getByRole('button', { name: '保存补充事实' }))
    await user.click(screen.getByText('补充已核对事实（可选） · 已保存'))
    const field = screen.getByRole('textbox', { name: '说书人已核对的事实' })
    await user.clear(field)
    await user.type(field, '未保存B：12号当前善良。')
    expect(screen.getByText('未保存，尚未用于AI')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '记录结果' }))
    await user.click(screen.getByRole('button', { name: '确认本项' }))
    const state = projected(latest)
    expect(state.confirmedRecords[state.activeCursorId].at(-1)?.snapshot.storytellerContext).toBe('保存A：12号当前邪恶。')
    expect(screen.getByRole('textbox', { name: '说书人已核对的事实' })).toHaveValue('保存A：12号当前邪恶。')
    expect(screen.getByRole('textbox', { name: '说书人已核对的事实' })).toBeDisabled()
    expect(screen.queryByDisplayValue('未保存B：12号当前善良。')).toBeNull()
    view.unmount()
    latest = parseSessionBackup(JSON.stringify(latest))
    render(<Harness />)
    expect(screen.getByRole('textbox', { name: '说书人已核对的事实' })).toHaveValue('保存A：12号当前邪恶。')
    expect(screen.getByRole('textbox', { name: '说书人已核对的事实' })).toBeDisabled()
    expect(screen.queryByDisplayValue('未保存B：12号当前善良。')).toBeNull()
  })
})
