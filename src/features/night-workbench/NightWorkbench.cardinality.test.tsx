import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useReducer } from 'react'
import { describe, expect, it } from 'vitest'
import { gameSessionReducer } from '../game-session/state/sessionReducer'
import { NightWorkbench } from './NightWorkbench'
import { cardinalitySession } from './state/nightCardinality.test-support'
import { projected } from './state/nightInformation.test-support'

describe('night cardinality UI', () => {
  it('requires the host to choose Po mode and keeps three ordered choices before changing to zero', async () => {
    let latest = cardinalitySession('bad-moon-rising', 'po', 8, true)
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    const user = userEvent.setup()
    expect(screen.getByRole('button', { name: 'AI推荐' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: '选择1号玩家' })).toBeNull()
    await user.click(screen.getByRole('button', { name: '选择3名玩家' }))
    for (const seat of [1, 2, 3]) await user.click(screen.getByRole('button', { name: new RegExp(`^选择${seat}号玩家`) }))
    let state = projected(latest)
    expect(state.drafts[state.activeCursorId].targets).toEqual([1, 2, 3])
    await user.click(screen.getByRole('button', { name: '不选目标' }))
    state = projected(latest)
    expect(state.drafts[state.activeCursorId]).toMatchObject({ targets: [], targetCountChoice: 0 })
    expect(screen.queryByRole('button', { name: '选择1号玩家' })).toBeNull()
    await user.click(screen.getByRole('button', { name: '记录结果' }))
    expect(screen.getByRole('button', { name: '确认本项' })).toBeEnabled()
    expect(screen.getByText(/珀记录：不选择玩家/)).toBeInTheDocument()
  })

  it('keeps every Noble information seat visibly selected', async () => {
    let latest = cardinalitySession('zui-ge-luan-wu', 'noble', 7)
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    const user = userEvent.setup()
    for (const seat of [1, 2, 3]) await user.click(screen.getByRole('button', { name: new RegExp(`^选择${seat}号玩家`) }))
    for (const seat of [1, 2, 3]) expect(screen.getByRole('button', { name: new RegExp(`^选择${seat}号玩家`) })).toHaveAttribute('aria-pressed', 'true')
    const state = projected(latest)
    expect(state.drafts[state.activeCursorId].targets).toEqual([1, 2, 3])
  })

  it('shows four distinct role slots and requires two good and two evil choices', async () => {
    let latest = cardinalitySession('ji-meng-ta-xiang', 'yinyangshi', 7)
    function Harness() {
      const [session, dispatchSession] = useReducer(gameSessionReducer, latest)
      latest = session
      return <NightWorkbench sessionBinding={{ session, dispatchSession }} onExit={() => {}} />
    }
    render(<Harness />)
    const user = userEvent.setup()
    for (const [group, role] of [[/^善良角色/, '筑梦师'], [/^邪恶角色/, '刺客'], [/^第二个善良角色/, '共情者']] as const) {
      await user.click(within(screen.getByRole('group', { name: group })).getByRole('button', { name: role }))
    }
    expect(screen.getByRole('button', { name: '记录结果' })).toBeDisabled()
    await user.click(within(screen.getByRole('group', { name: /^第二个邪恶角色/ })).getByRole('button', { name: '洗脑师' }))
    expect(screen.getByRole('button', { name: '记录结果' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: '记录结果' }))
    await user.click(screen.getByRole('button', { name: '确认本项' }))
    const state = projected(latest)
    expect(state.confirmedRecords[state.activeCursorId].at(-1)?.snapshot).toMatchObject({
      roleChoice: 'dreamer', secondRoleChoice: 'assassin', additionalRoleChoices: ['empath', 'cerenovus'],
      informationGiven: '筑梦师 / 刺客 / 共情者 / 洗脑师',
    })
  })
})
