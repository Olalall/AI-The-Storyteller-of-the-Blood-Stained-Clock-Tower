import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  defaultArchiveRuntimeSettings,
  gameArchiveStorageKey,
  resetArchiveRuntimeSettings,
  saveArchiveRuntimeSettings,
} from '../../services/archive'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { GameEndSheet } from './GameEndSheet'

function renderGameEndSheet(onResetGame = vi.fn()) {
  render(
    <GameEndSheet
      open
      onOpenChange={() => undefined}
      session={createPrototypeGameSession()}
      onResetGame={onResetGame}
    />,
  )
  return { onResetGame }
}

describe('GameEndSheet safety boundary', () => {
  beforeEach(() => {
    window.localStorage.clear()
    resetArchiveRuntimeSettings()
    vi.unstubAllGlobals()
  })

  it('does not reset the game before a current archive is saved', () => {
    const { onResetGame } = renderGameEndSheet()
    const resetStep = screen.getByLabelText('结束对局步骤').querySelector('.game-end__finish-step--danger')!

    fireEvent.click(within(resetStep as HTMLElement).getByLabelText('我已保存本局，确认重置游戏'))
    const resetButton = within(resetStep as HTMLElement).getByRole('button', { name: '重置游戏' })
    expect(resetButton).toBeDisabled()
    fireEvent.click(resetButton)

    expect(onResetGame).not.toHaveBeenCalled()
    expect(window.localStorage.getItem(gameArchiveStorageKey)).toBeNull()
  })

  it('allows reset only after the storyteller saves the archive and confirms reset', async () => {
    const { onResetGame } = renderGameEndSheet()

    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    await screen.findByText('本局已保存到本机浏览器')
    const resetStep = screen.getByLabelText('结束对局步骤').querySelector('.game-end__finish-step--danger')!
    fireEvent.click(within(resetStep as HTMLElement).getByLabelText('我已保存本局，确认重置游戏'))
    fireEvent.click(within(resetStep as HTMLElement).getByRole('button', { name: '重置游戏' }))

    expect(onResetGame).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem(gameArchiveStorageKey)).toContain('Catfishing / 瓦釜雷鸣')
  })

  it('falls back to a local archive when the configured HTTP runtime is unavailable', async () => {
    const { onResetGame } = renderGameEndSheet()
    saveArchiveRuntimeSettings({ ...defaultArchiveRuntimeSettings, mode: 'http' })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))

    fireEvent.click(screen.getByRole('button', { name: '保存本局' }))
    await screen.findByText('本地后端不可用，已保存到本机浏览器')

    const resetStep = screen.getByLabelText('结束对局步骤').querySelector('.game-end__finish-step--danger')!
    fireEvent.click(within(resetStep as HTMLElement).getByLabelText('我已保存本局，确认重置游戏'))
    fireEvent.click(within(resetStep as HTMLElement).getByRole('button', { name: '重置游戏' }))

    expect(onResetGame).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem(gameArchiveStorageKey)).toContain('Catfishing / 瓦釜雷鸣')
  })
})
