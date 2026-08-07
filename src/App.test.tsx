import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { gameArchiveStorageKey } from './services/archive'
import { gameSessionStorageKey } from './services/session'
import { createPrototypeGameSession } from './features/game-session/data/createPrototypeSession'
import { setupRosterMemoryKey } from './features/setup/setupRosterMemory'
import { identityDealReceiptsStorageKey } from './services/identity-deal'
import type { GameArchiveRecord } from './services/archive'
import type { GameSessionState } from './features/game-session/types'

function storedSession() {
  return JSON.parse(window.localStorage.getItem(gameSessionStorageKey) ?? '{}') as GameSessionState
}

function storedArchives() {
  return JSON.parse(window.localStorage.getItem(gameArchiveStorageKey) ?? '[]') as GameArchiveRecord[]
}

describe('App game reset flow', () => {
  beforeEach(() => window.localStorage.clear())

  it('archives the current session and then resets the active game to a blank new session', async () => {
    const dirtySession = createPrototypeGameSession()
    dirtySession.seats[1] = { ...dirtySession.seats[1], nickname: '待清除昵称' }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(dirtySession))

    const { container } = render(<App />)
    await waitFor(() => expect(window.localStorage.getItem(setupRosterMemoryKey)).toContain('待清除昵称'))
    window.localStorage.setItem(identityDealReceiptsStorageKey(dirtySession.id), JSON.stringify({ 1: '2026-07-19T00:00:00.000Z' }))

    // 主持台是默认视图，「结束对局」入口在档案页；先用轨道右端的「本局」进去。
    fireEvent.click(screen.getByRole('button', { name: '本局' }))
    fireEvent.click(container.querySelector('.dashboard__end-entry') as HTMLButtonElement)
    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    await screen.findByText('本局已保存到本机浏览器')
    const resetStep = screen.getByLabelText('结束对局步骤').querySelector('.game-end__finish-step--danger')!
    fireEvent.click(within(resetStep as HTMLElement).getByLabelText('我已保存本局，确认重置游戏'))
    fireEvent.click(within(resetStep as HTMLElement).getByRole('button', { name: '重置游戏' }))

    await waitFor(() => expect(screen.queryByText('结束与复盘')).not.toBeInTheDocument())
    await waitFor(() => {
      const session = storedSession()
      expect(session.playerCount).toBe(0)
      expect(session.seats).toEqual({})
      expect(session.initialPlayerStates).toEqual({})
      expect(session.timeline).toEqual([])
      expect(session.phaseSegments).toEqual([])
      expect(session.nightRuns).toEqual({})
      expect(session.activeNightRunId).toBeNull()
      expect(session.dayVoteDraft).toBeNull()
      expect(session.dayActionDraft).toBeNull()
    })
    expect(screen.getByRole('heading', { name: 'AI配板与调整' })).toBeInTheDocument()
    expect(screen.getByText('选择人数')).toBeInTheDocument()
    expect(screen.getByLabelText('开局板子')).toHaveValue(dirtySession.scriptId)
    expect(window.localStorage.getItem(identityDealReceiptsStorageKey(dirtySession.id))).toBeNull()

    const archives = storedArchives()
    expect(archives).toHaveLength(1)
    expect(archives[0].session.seats[1].nickname).toBe('待清除昵称')
  })

  it('can start a 7 player setup shell after reset by reusing only nickname and experience', async () => {
    const previousSession = createPrototypeGameSession()
    previousSession.seats[1] = { ...previousSession.seats[1], nickname: '上一局1号', experience: 'veteran' }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(previousSession))

    const { container } = render(<App />)
    await waitFor(() => expect(window.localStorage.getItem(setupRosterMemoryKey)).toContain('上一局1号'))
    // 主持台是默认视图，「结束对局」入口在档案页；先用轨道右端的「本局」进去。
    fireEvent.click(screen.getByRole('button', { name: '本局' }))
    fireEvent.click(container.querySelector('.dashboard__end-entry') as HTMLButtonElement)
    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    await screen.findByText('本局已保存到本机浏览器')
    const resetStep = screen.getByLabelText('结束对局步骤').querySelector('.game-end__finish-step--danger')!
    fireEvent.click(within(resetStep as HTMLElement).getByLabelText('我已保存本局，确认重置游戏'))
    fireEvent.click(within(resetStep as HTMLElement).getByRole('button', { name: '重置游戏' }))
    await waitFor(() => expect(storedSession().playerCount).toBe(0))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'AI配板与调整' })).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('开局板子'), { target: { value: 'trouble-brewing' } })
    fireEvent.click(screen.getByRole('button', { name: '7人' }))
    expect(screen.getByLabelText('1号昵称')).toHaveValue('上一局1号')
    expect(screen.getByLabelText('1号经验')).toHaveValue('veteran')
    expect(screen.getByLabelText('7号经验')).toHaveValue('veteran')
    fireEvent.click(screen.getByRole('button', { name: '开始配板' }))

    await waitFor(() => {
      const session = storedSession()
      expect(session.playerCount).toBe(7)
      expect(session.scriptId).toBe('trouble-brewing')
      expect(session.timeline).toEqual([])
      expect(session.phaseSegments).toEqual([])
      expect(session.seats[1]).toMatchObject({ nickname: '上一局1号', experience: 'veteran' })
    })
    expect(screen.getByText('角色组合')).toBeInTheDocument()
  })
})
