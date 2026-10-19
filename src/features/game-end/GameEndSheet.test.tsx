import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as archive from '../../services/archive'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { GameEndSheet, type GameEndMode } from './GameEndSheet'

function renderGameEndSheet(mode: GameEndMode = 'reset') {
  const session = createPrototypeGameSession()
  const onResetGame = vi.fn(async () => undefined)
  const onOpenChange = vi.fn()
  const props = { open: true, session, onResetGame, onOpenChange, initialMode: mode }
  return { ...render(<GameEndSheet {...props} />), props, onResetGame, onOpenChange, session }
}

const confirm = () => screen.getByRole('button', { name: '确认重置并开新局' })
const saved = () => JSON.parse(localStorage.getItem(archive.gameArchiveStorageKey) ?? '[]')

function captureDownloads() {
  const createObjectURL = vi.fn((_blob: Blob) => 'blob:game-end-test')
  const revokeObjectURL = vi.fn()
  vi.stubGlobal('URL', class extends URL { static createObjectURL = createObjectURL; static revokeObjectURL = revokeObjectURL })
  const filenames: string[] = []
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { filenames.push(this.download) })
  return { createObjectURL, filenames }
}

async function blobText(blob: Blob) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsText(blob)
  })
}

describe('separate save and reset flows', () => {
  beforeEach(() => {
    window.localStorage.clear()
    archive.resetArchiveRuntimeSettings()
    archive.resetAsyncArchiveAdapter()
    vi.unstubAllGlobals()
  })
  afterEach(() => vi.restoreAllMocks())

  it('saving retains the current game and has no reset controls', async () => {
    const { session, onResetGame } = renderGameEndSheet('save')
    const before = JSON.stringify(session)
    expect(screen.queryByRole('button', { name: '确认重置并开新局' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    await screen.findByText('本局已保存到本机浏览器')
    expect(saved()[0].session).toEqual(session)
    expect(JSON.stringify(session)).toBe(before)
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it('opening or cancelling reset neither archives nor clears the current game', () => {
    const { onResetGame, onOpenChange } = renderGameEndSheet()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '保存本局' })).not.toBeInTheDocument()
    expect(screen.getByText('自动留档成功后，才会清空当前局')).toBeInTheDocument()
    expect(onResetGame).not.toHaveBeenCalled()
    expect(saved()).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: '暂不重置' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it('supports keyboard switching between save and history without changing the game', () => {
    const { onResetGame } = renderGameEndSheet('save')
    fireEvent.keyDown(screen.getByRole('tab', { name: '保存本局' }), { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: '历史复盘' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: '历史复盘' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(screen.getByRole('tab', { name: '历史复盘' }), { key: 'Home' })
    expect(screen.getByRole('tab', { name: '保存本局' })).toHaveFocus()
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it('explicit confirmation archives the exact current session before resetting', async () => {
    const { session, onResetGame } = renderGameEndSheet()
    fireEvent.click(confirm())
    await waitFor(() => expect(onResetGame).toHaveBeenCalledExactlyOnceWith(session))
    expect(saved()).toHaveLength(1)
    expect(saved()[0].session).toEqual(session)
    expect(saved()[0].winner).toBe('undecided')
  })

  it('does not declare an unsaved winner choice when opening reset', async () => {
    const { rerender, props, onResetGame, session } = renderGameEndSheet('save')
    fireEvent.click(screen.getByRole('radio', { name: /善良获胜/ }))
    rerender(<GameEndSheet {...props} initialMode="reset" />)
    fireEvent.click(confirm())
    await waitFor(() => expect(onResetGame).toHaveBeenCalledExactlyOnceWith(session))
    expect(saved()[0].winner).toBe('undecided')
  })

  it('uses a local archive when the configured HTTP runtime is unavailable', async () => {
    archive.saveArchiveRuntimeSettings({ ...archive.defaultArchiveRuntimeSettings, mode: 'http' })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    const { session, onResetGame } = renderGameEndSheet()
    fireEvent.click(confirm())
    await waitFor(() => expect(onResetGame).toHaveBeenCalledExactlyOnceWith(session))
    expect(saved()[0].session).toEqual(session)
  })

  it('does not reset if automatic archive storage fails', async () => {
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === archive.gameArchiveStorageKey) throw new DOMException('Full', 'QuotaExceededError')
      original.call(this, key, value)
    })
    const { onResetGame } = renderGameEndSheet()
    fireEvent.click(confirm())
    await screen.findByText(/保存失败，当前局未归档/)
    expect(onResetGame).not.toHaveBeenCalled()
    expect(confirm()).toBeEnabled()
  })

  it.each(['deleted', 'outdated'])('rejects a %s archive, then creates a fresh verified archive on confirmation', async (failure) => {
    const { rerender, props, onResetGame, session } = renderGameEndSheet('save')
    const before = JSON.stringify(session)
    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    await screen.findByText('本局已保存到本机浏览器')
    const previousArchive = saved()[0]
    localStorage.setItem(archive.gameArchiveStorageKey, JSON.stringify(failure === 'deleted' ? [] : [{ ...previousArchive, session: { ...session, timeline: [] } }]))
    rerender(<GameEndSheet {...props} initialMode="reset" />)
    fireEvent.click(confirm())
    await screen.findByText('归档校验失败或当前局已有变化，当前局未重置。再次确认会重新留档并核对。')
    expect(onResetGame).not.toHaveBeenCalled()
    expect(JSON.stringify(session)).toBe(before)
    fireEvent.click(confirm())
    await waitFor(() => expect(onResetGame).toHaveBeenCalledExactlyOnceWith(session))
    expect(saved().some((record: archive.GameArchiveRecord) => record.id !== previousArchive.id && JSON.stringify(record.session) === before)).toBe(true)
  })

  it.each(['save', 'reset'] as const)('exports a complete current-session backup after %s archive storage fails without retrying storage', async (mode) => {
    const download = captureDownloads()
    const original = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === archive.gameArchiveStorageKey) throw new DOMException('Full', 'QuotaExceededError')
      original.call(this, key, value)
    })
    const archiveRequest = vi.spyOn(archive, 'archiveGameAsync')
    const { session, onResetGame } = renderGameEndSheet(mode)
    fireEvent.click(mode === 'save' ? screen.getByRole('button', { name: '保存本局' }) : confirm())
    await screen.findByText(/保存失败，当前局未归档/)
    const callsBeforeExport = archiveRequest.mock.calls.length
    fireEvent.click(screen.getByRole('button', { name: '导出当前对局' }))
    expect(screen.getByRole('status')).toHaveTextContent('当前对局备份已导出')
    expect(download.filenames).toHaveLength(1)
    expect(download.filenames[0]).toMatch(/^botc-session-.*\.json$/)
    expect(JSON.parse(await blobText(download.createObjectURL.mock.calls[0][0]))).toEqual(session)
    expect(archiveRequest).toHaveBeenCalledTimes(callsBeforeExport)
    expect(saved()).toEqual([])
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it.each([false, true])('shows backend fallback on the history page with local archives=%s', async (hasArchive) => {
    if (hasArchive) archive.archiveGame({ commandId: 'existing-local', session: createPrototypeGameSession(), winner: 'undecided' })
    archive.saveArchiveRuntimeSettings({ ...archive.defaultArchiveRuntimeSettings, mode: 'http' })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    const { onResetGame } = renderGameEndSheet('review')
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('本地后端不可用，已显示本机归档'))
    expect(screen.getByRole('tab', { name: '历史复盘' })).toHaveAttribute('aria-selected', 'true')
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it('exports the selected historical archive and shows its result without leaving history', async () => {
    const download = captureDownloads()
    const historical = archive.archiveGame({ commandId: 'history-download', session: createPrototypeGameSession(), winner: 'good' }).archive
    const { onResetGame } = renderGameEndSheet('review')
    fireEvent.click(await screen.findByRole('button', { name: '导出这局' }))
    expect(screen.getByRole('status')).toHaveTextContent('归档JSON已导出')
    expect(screen.getByRole('tab', { name: '历史复盘' })).toHaveAttribute('aria-selected', 'true')
    expect(download.filenames).toEqual([`botc-archive-${historical.id}.json`])
    expect(JSON.parse(await blobText(download.createObjectURL.mock.calls[0][0]))).toEqual(historical)
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it.each(['save', 'review'] as const)('shows a download failure on the %s page without changing records', async (mode) => {
    const download = captureDownloads()
    download.createObjectURL.mockImplementationOnce(() => { throw new Error('download unavailable') })
    archive.archiveGame({ commandId: 'download-failure', session: createPrototypeGameSession(), winner: 'good' })
    const before = localStorage.getItem(archive.gameArchiveStorageKey)
    const { onResetGame } = renderGameEndSheet(mode)
    fireEvent.click(await screen.findByRole('button', { name: mode === 'save' ? '导出当前对局' : '导出这局' }))
    expect(screen.getByRole('status')).toHaveTextContent('导出失败，请重试。当前对局和已保存归档未改变。')
    expect(localStorage.getItem(archive.gameArchiveStorageKey)).toBe(before)
    expect(onResetGame).not.toHaveBeenCalled()
  })

  it('labels the reset cancellation as returning to script selection when a next script is selected', () => {
    const { rerender, props, onOpenChange, onResetGame } = renderGameEndSheet()
    rerender(<GameEndSheet {...props} nextScriptLabel="言不由衷" />)
    fireEvent.click(screen.getByRole('button', { name: '返回选板' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onResetGame).not.toHaveBeenCalled()
    expect(saved()).toEqual([])
  })

  it('keeps confirmation busy and non-dismissible until its single archive completes', async () => {
    let finish!: (value: ReturnType<typeof archive.archiveGame>) => void
    vi.spyOn(archive, 'archiveGameAsync').mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
    const { session, onResetGame, onOpenChange } = renderGameEndSheet()
    const button = confirm()
    fireEvent.click(button)
    expect(screen.getByRole('button', { name: '正在留档并重置…' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: '关闭重置游戏' })).not.toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    fireEvent.click(button)
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(onResetGame).not.toHaveBeenCalled()
    await act(async () => finish(archive.archiveGame({ commandId: 'delayed', session, winner: 'undecided' })))
    expect(onResetGame).toHaveBeenCalledExactlyOnceWith(session)
  })

  it('rejects a stale confirmation when the session changes during automatic saving', async () => {
    let finish!: (value: ReturnType<typeof archive.archiveGame>) => void
    vi.spyOn(archive, 'archiveGameAsync').mockImplementationOnce(() => new Promise((resolve) => { finish = resolve }))
    const { rerender, props, session, onResetGame } = renderGameEndSheet()
    fireEvent.click(confirm())
    const changed = { ...session, seats: { ...session.seats, 1: { ...session.seats[1], nickname: '新内容' } } }
    rerender(<GameEndSheet {...props} session={changed} />)
    await act(async () => finish(archive.archiveGame({ commandId: 'old-version', session, winner: 'undecided' })))
    expect(onResetGame).not.toHaveBeenCalled()
    expect(screen.getByText('当前局已有变化，请重新确认重置；当前局未重置。')).toBeInTheDocument()
    expect(saved()[0].session).toEqual(session)
    expect(changed.seats[1].nickname).toBe('新内容')
  })

  it('shows a reset persistence failure without closing the confirmation', async () => {
    const { onResetGame, onOpenChange } = renderGameEndSheet()
    onResetGame.mockRejectedValueOnce(new Error('存储空间不足'))
    fireEvent.click(confirm())
    await screen.findByText('重置未完成：存储空间不足 当前局未清空。')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(confirm()).toBeEnabled()
    expect(saved()).toHaveLength(1)
  })
})
