import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { gameArchiveStorageKey } from './services/archive'
import { gameSessionStorageKey } from './services/session'
import { createEmptyGameSession, createPrototypeGameSession, createSmartScriptSetupSession } from './features/game-session/data/createPrototypeSession'
import { createSetupDraftFromCandidate, createSmartScriptSetupCandidates } from './features/setup'
import { gameSessionReducer } from './features/game-session/state/sessionReducer'
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

describe('App night entry', () => {
  beforeEach(() => window.localStorage.clear())

  it('opens the current script setup without creating a night when setup is not confirmed', async () => {
    const session = createSmartScriptSetupSession('trouble-brewing')
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '进入夜晚' }))

    expect(await screen.findByText('请先确认本局配板，再进入夜晚。')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: '智能配板与调整' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('dialog', { name: '智能配板与调整' })).toHaveAccessibleDescription('暗流涌动 · 确认配板后可进入夜晚。'))
    expect(screen.queryByText('夜间工作台')).not.toBeInTheDocument()
    expect(storedSession().phaseSegments).toEqual([])
    expect(storedSession().nightRuns).toEqual({})
    expect(storedSession().timeline).toEqual([])
  })

  it('stops on a missing active run and preserves the existing session for recovery', async () => {
    const session = createPrototypeGameSession()
    session.activeNightRunId = 'missing-night'
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))
    render(<App />)
    await waitFor(() => expect(window.localStorage.getItem(gameSessionStorageKey)).not.toBeNull())
    fireEvent.click(screen.getByRole('button', { name: /进入夜晚/ }))

    expect(await screen.findByText('当前夜序资料不完整，无法打开。请检查本局备份或恢复有效存档。')).toBeInTheDocument()
    expect(screen.queryByText('夜间工作台')).not.toBeInTheDocument()
    expect(storedSession().activeNightRunId).toBe('missing-night')
    expect(storedSession().nightRuns).toEqual(session.nightRuns)
    expect(storedSession().phaseSegments).toEqual(session.phaseSegments)
  })

  it('creates the first night from this script confirmed setup rather than the demo', async () => {
    let session = createSmartScriptSetupSession('trouble-brewing', undefined, { playerCount: 7 })
    const profiles = Object.values(session.seats).map((seat) => ({ seatId: seat.seatId, experience: seat.experience ?? 'regular' }))
    const candidate = createSmartScriptSetupCandidates(session.scriptId, profiles, { seed: 'night-entry-regression' })[0]
    session = gameSessionReducer(session, { type: 'set-setup-draft', draft: createSetupDraftFromCandidate(candidate, new Date().toISOString()) })
    session = gameSessionReducer(session, { type: 'confirm-setup', id: 'own-setup', confirmedAt: new Date().toISOString() })
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))
    render(<App />)
    await userEvent.setup().click(screen.getByRole('button', { name: '进入夜晚' }))

    expect(await screen.findByRole('heading', { name: '第1夜' })).toBeInTheDocument()
    expect(screen.getByText('暗流涌动 / Trouble Brewing · 7人')).toBeInTheDocument()
    expect(screen.queryByText('Catfishing · 12人')).not.toBeInTheDocument()
    const saved = storedSession()
    expect(saved.nightRuns[saved.activeNightRunId!].scriptId).toBe('trouble-brewing')
    expect(saved.phaseSegments).toHaveLength(1)
    expect(saved.timeline).toEqual(session.timeline)
  })
})

describe('App phase entry feedback', () => {
  beforeEach(() => window.localStorage.clear())

  it.each(['白天', '夜晚'] as const)('keeps an empty game unchanged and explains the %s setup redirect inside the open panel', async (phase) => {
    const session = createEmptyGameSession()
    localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))
    render(<App />)
    await userEvent.setup().click(screen.getByRole('button', { name: '智能配板与调整' }))
    fireEvent.change(await screen.findByLabelText('开局板子'), { target: { value: 'trouble-brewing' } })
    await waitFor(() => expect(screen.getByLabelText('开局板子')).toHaveValue('trouble-brewing'))
    await userEvent.setup().click(screen.getByRole('button', { name: '关闭智能配板与调整' }))
    await userEvent.setup().click(screen.getByRole('button', { name: `进入${phase}` }))
    const setup = await screen.findByRole('dialog', { name: '智能配板与调整' })
    expect(within(setup).getByText(`请先确认本局配板，再进入${phase}。`).closest('[role="status"]')).toBeVisible()
    expect(within(setup).getByLabelText('开局板子')).toHaveValue('trouble-brewing')
    expect(storedSession()).toEqual(session)
    await userEvent.setup().click(within(setup).getByRole('button', { name: '7人' }))
    await userEvent.setup().click(within(setup).getByRole('button', { name: '开始配板' }))
    await waitFor(() => expect(storedSession().playerCount).toBe(7))
    expect(storedSession().phaseSegments).toEqual([])
    expect(storedSession().timeline).toEqual([])
    expect(within(setup).queryByText(`请先确认本局配板，再进入${phase}。`)).not.toBeInTheDocument()
  })

  it('returns from reset-switch to choosing scripts without losing the current game or leaking the old target into ordinary reset', async () => {
    const session = createPrototypeGameSession()
    localStorage.setItem(gameSessionStorageKey, JSON.stringify(session))
    render(<App />)
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: '切换板子' }))
    const card = (await screen.findByRole('heading', { name: '暗度陈仓' })).closest('article')!
    await user.click(within(card).getByRole('button', { name: '切换到此板子' }))
    await user.click(screen.getByRole('button', { name: '前往重置确认' }))
    await user.click(await screen.findByRole('button', { name: '返回选板' }))
    const library = await screen.findByRole('dialog', { name: '切换板子' })
    expect(storedSession()).toEqual(session)
    expect(storedArchives()).toEqual([])
    await user.click(within(library).getByRole('button', { name: '关闭切换板子' }))
    await user.click(screen.getByRole('button', { name: '重置游戏' }))
    const reset = await screen.findByRole('dialog', { name: '重置游戏' })
    expect(within(reset).getByRole('button', { name: '暂不重置' })).toBeInTheDocument()
    expect(within(reset).queryByText('完成后进入“暗度陈仓”的新局配板。')).not.toBeInTheDocument()
  })
})

describe('App game reset flow', () => {
  beforeEach(() => window.localStorage.clear())

  it('finishes a saved reset even when old identity receipt cleanup fails', async () => {
    const previous = createPrototypeGameSession()
    localStorage.setItem(gameSessionStorageKey, JSON.stringify(previous))
    const receiptKey = identityDealReceiptsStorageKey(previous.id)
    localStorage.setItem(receiptKey, '{}')
    const remove = Storage.prototype.removeItem
    const cleanup = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(function (this: Storage, key) {
      if (key === receiptKey) throw new DOMException('Unavailable', 'SecurityError')
      remove.call(this, key)
    })
    try {
      render(<App />)
      await userEvent.setup().click(await screen.findByRole('button', { name: '重置游戏' }))
      fireEvent.click(await screen.findByRole('button', { name: '确认重置并开新局' }))
      const setup = await screen.findByRole('dialog', { name: '智能配板与调整' })
      expect(within(setup).getByText('本局已重置，记录已归档。请选择人数，开始新局。')).toBeInTheDocument()
      expect(storedSession().playerCount).toBe(0)
      expect(storedSession().id).not.toBe(previous.id)
      expect(storedArchives()[0].session).toEqual(previous)
      expect(localStorage.getItem(receiptKey)).toBe('{}')
    } finally { cleanup.mockRestore() }
  })

  it('archives the current session and then resets the active game to a blank new session', async () => {
    const dirtySession = createPrototypeGameSession()
    dirtySession.seats[1] = { ...dirtySession.seats[1], nickname: '待清除昵称' }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(dirtySession))

    render(<App />)
    await waitFor(() => expect(window.localStorage.getItem(setupRosterMemoryKey)).toContain('待清除昵称'))
    window.localStorage.setItem(identityDealReceiptsStorageKey(dirtySession.id), JSON.stringify({ 1: '2026-07-19T00:00:00.000Z' }))

    fireEvent.click(screen.getByRole('button', { name: '重置游戏' }))
    const resetDialog = await screen.findByRole('dialog', { name: '重置游戏' })
    expect(within(resetDialog).queryByRole('button', { name: '保存本局' })).not.toBeInTheDocument()
    expect(within(resetDialog).queryByRole('checkbox')).not.toBeInTheDocument()
    fireEvent.click(within(resetDialog).getByRole('button', { name: '确认重置并开新局' }))

    await waitFor(() => expect(screen.queryByRole('dialog', { name: '重置游戏' })).not.toBeInTheDocument())
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
      expect(session.setupDraft).toBeNull()
      expect(session.id).not.toBe(dirtySession.id)
    })
    await screen.findByLabelText('开局板子')
    expect(screen.getByRole('heading', { name: '智能配板与调整' })).toBeInTheDocument()
    expect(screen.getByText('选择人数')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog', { name: '智能配板与调整' })).getByText('本局已重置，记录已归档。请选择人数，开始新局。')).toBeInTheDocument()
    expect(screen.getByLabelText('开局板子')).toHaveValue(dirtySession.scriptId)
    expect(window.localStorage.getItem(identityDealReceiptsStorageKey(dirtySession.id))).toBeNull()

    const archives = storedArchives()
    expect(archives).toHaveLength(1)
    expect(archives[0].session.seats[1].nickname).toBe('待清除昵称')
    expect(archives[0].session).toEqual(dirtySession)
  })

  it('can start a 7 player setup shell after reset by reusing only nickname and experience', async () => {
    const previousSession = createPrototypeGameSession()
    previousSession.seats[1] = { ...previousSession.seats[1], nickname: '上一局1号', experience: 'veteran' }
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(previousSession))

    render(<App />)
    await waitFor(() => expect(window.localStorage.getItem(setupRosterMemoryKey)).toContain('上一局1号'))
    fireEvent.click(screen.getByRole('button', { name: '重置游戏' }))
    fireEvent.click(await screen.findByRole('button', { name: '确认重置并开新局' }))
    await waitFor(() => expect(storedSession().playerCount).toBe(0))

    await screen.findByLabelText('开局板子')
    fireEvent.change(screen.getByLabelText('开局板子'), { target: { value: 'trouble-brewing' } })
    await waitFor(() => expect(screen.getByLabelText('开局板子')).toHaveValue('trouble-brewing'))
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

  it('keeps a requested board switch explicit and applies it only after confirmed archive and reset', async () => {
    const currentSession = createPrototypeGameSession()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(currentSession))
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '切换板子' }))
    const targetCard = (await screen.findByRole('heading', { name: '暗度陈仓' })).closest('article')
    fireEvent.click(within(targetCard as HTMLElement).getByRole('button', { name: '切换到此板子' }))
    fireEvent.click(screen.getByRole('button', { name: '前往重置确认' }))

    expect(await screen.findByText('完成后进入“暗度陈仓”的新局配板。')).toBeInTheDocument()
    expect(storedSession()).toEqual(currentSession)
    expect(storedArchives()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: '确认重置并开新局' }))

    await waitFor(() => expect(screen.getByLabelText('开局板子')).toHaveValue('an-du-chen-cang'))
    expect(storedSession().playerCount).toBe(0)
    expect(storedArchives()).toHaveLength(1)
    expect(storedArchives()[0].session).toEqual(currentSession)
  })

  it('saves from its own entry without resetting or opening the new-game setup', async () => {
    const currentSession = createPrototypeGameSession()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(currentSession))
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    const saveDialog = await screen.findByRole('dialog', { name: '保存本局' })
    expect(within(saveDialog).queryByRole('button', { name: '确认重置并开新局' })).not.toBeInTheDocument()
    fireEvent.click(within(saveDialog).getByRole('button', { name: '保存本局' }))
    await within(saveDialog).findByText('本局已保存到本机浏览器')
    expect(storedArchives()).toHaveLength(1)
    expect(storedArchives()[0].session).toEqual(currentSession)
    expect(storedSession()).toEqual(currentSession)
    fireEvent.click(within(saveDialog).getByRole('button', { name: '关闭保存本局' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: '保存本局' })).not.toBeInTheDocument())
    expect(screen.queryByRole('dialog', { name: '智能配板与调整' })).not.toBeInTheDocument()
    expect(storedSession()).toEqual(currentSession)
  })

  it('cancels reset without archiving, clearing the current session, or deleting identity receipts', async () => {
    const currentSession = createPrototypeGameSession()
    window.localStorage.setItem(gameSessionStorageKey, JSON.stringify(currentSession))
    const receipts = JSON.stringify({ 1: '2026-07-19T00:00:00.000Z' })
    window.localStorage.setItem(identityDealReceiptsStorageKey(currentSession.id), receipts)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '重置游戏' }))
    const resetDialog = await screen.findByRole('dialog', { name: '重置游戏' })
    expect(within(resetDialog).getByText('自动留档成功后，才会清空当前局')).toBeInTheDocument()
    expect(within(resetDialog).queryByRole('radiogroup', { name: '胜方' })).not.toBeInTheDocument()
    fireEvent.click(within(resetDialog).getByRole('button', { name: '暂不重置' }))

    await waitFor(() => expect(screen.queryByRole('dialog', { name: '重置游戏' })).not.toBeInTheDocument())
    expect(storedSession()).toEqual(currentSession)
    expect(storedArchives()).toEqual([])
    expect(window.localStorage.getItem(identityDealReceiptsStorageKey(currentSession.id))).toBe(receipts)
    expect(screen.queryByRole('dialog', { name: '智能配板与调整' })).not.toBeInTheDocument()
  })
})
