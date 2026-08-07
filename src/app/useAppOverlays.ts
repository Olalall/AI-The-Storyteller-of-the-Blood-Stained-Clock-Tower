/**
 * 全局面板的开关状态。
 *
 * 这些标记刻意各自独立而不是收成一个「当前打开哪个」的枚举：剧本库选完剧本会直接
 * 接着打开配板，收尾页与配板也可能同时挂着。用单值枚举表达会在这些链路上互相顶掉。
 */
import { useState } from 'react'
import type { ScriptId } from '../domain/scripts'

export type GameEndMode = 'end' | 'review'

export interface AppOverlayState {
  timerOpen: boolean
  setTimerOpen: (open: boolean) => void
  recordsOpen: boolean
  setRecordsOpen: (open: boolean) => void
  setupOpen: boolean
  setSetupOpen: (open: boolean) => void
  identityDealOpen: boolean
  setIdentityDealOpen: (open: boolean) => void
  gameEndOpen: boolean
  setGameEndOpen: (open: boolean) => void
  gameEndMode: GameEndMode
  scriptLibraryOpen: boolean
  setScriptLibraryOpen: (open: boolean) => void
  setupScriptId: ScriptId
  setSetupScriptId: (scriptId: ScriptId) => void
  playerStatusSeatId: number | null
  setPlayerStatusSeatId: (seatId: number | null) => void
  openGameEnd: (mode?: GameEndMode) => void
  /** 重开一局时统一收干净，避免上一局的面板残留在新对局上。 */
  closeAll: () => void
}

export function useAppOverlays(): AppOverlayState {
  const [timerOpen, setTimerOpen] = useState(false)
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const [identityDealOpen, setIdentityDealOpen] = useState(false)
  const [gameEndOpen, setGameEndOpen] = useState(false)
  const [gameEndMode, setGameEndMode] = useState<GameEndMode>('end')
  const [scriptLibraryOpen, setScriptLibraryOpen] = useState(false)
  const [setupScriptId, setSetupScriptId] = useState<ScriptId>('catfishing')
  const [playerStatusSeatId, setPlayerStatusSeatId] = useState<number | null>(null)

  return {
    timerOpen,
    setTimerOpen,
    recordsOpen,
    setRecordsOpen,
    setupOpen,
    setSetupOpen,
    identityDealOpen,
    setIdentityDealOpen,
    gameEndOpen,
    setGameEndOpen,
    gameEndMode,
    scriptLibraryOpen,
    setScriptLibraryOpen,
    setupScriptId,
    setSetupScriptId,
    playerStatusSeatId,
    setPlayerStatusSeatId,
    openGameEnd: (mode = 'end') => {
      setGameEndMode(mode)
      setGameEndOpen(true)
    },
    closeAll: () => {
      setIdentityDealOpen(false)
      setGameEndOpen(false)
      setScriptLibraryOpen(false)
      setPlayerStatusSeatId(null)
    },
  }
}
