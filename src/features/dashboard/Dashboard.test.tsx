import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptyGameSession, createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { Dashboard } from './Dashboard'

describe('live Dashboard after main integration', () => {
  beforeEach(() => window.localStorage.clear())
  it('keeps phase entry, players and recent records without modifying the game while browsing', () => {
    const session = createPrototypeGameSession()
    const before = JSON.stringify(session)
    const onEnterNight = vi.fn()
    const onEnterDay = vi.fn()
    render(<Dashboard session={session} dispatch={vi.fn()} onEnterNight={onEnterNight} onEnterDay={onEnterDay} onOpenTimer={vi.fn()} onOpenSetup={vi.fn()} onOpenIdentityDeal={vi.fn()} onOpenScriptLibrary={vi.fn()} onOpenPlayerStatus={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '瓦釜雷鸣 / Catfishing' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '玩家状态' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '最近记录' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: /进入夜晚/ }))
    fireEvent.click(screen.getByRole('button', { name: /进入白天/ }))
    expect(onEnterNight).toHaveBeenCalledOnce()
    expect(onEnterDay).toHaveBeenCalledOnce()
    expect(JSON.stringify(session)).toBe(before)
  })
  it('opens setup without creating a phase or loading a demonstration game', () => {
    const session = createEmptyGameSession()
    const onOpenSetup = vi.fn()
    render(<Dashboard session={session} dispatch={vi.fn()} onEnterNight={vi.fn()} onEnterDay={vi.fn()} onOpenTimer={vi.fn()} onOpenSetup={onOpenSetup} onOpenIdentityDeal={vi.fn()} onOpenScriptLibrary={vi.fn()} onOpenPlayerStatus={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '智能配板与调整' }))
    expect(onOpenSetup).toHaveBeenCalledOnce()
    expect(session.playerCount).toBe(0)
    expect(session.phaseSegments).toEqual([])
  })
})
