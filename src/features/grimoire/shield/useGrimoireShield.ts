/**
 * 遮蔽级别的运行时控制。
 *
 * 设计前提是「说书人会忘」：忘了盖上就把设备转过去、忘了自己还停在 L2 就去接水。
 * 所以每一条自动落回都不是便利功能而是安全网——页面隐藏、失焦、无操作超时
 * 一律回到 L1，且**永不自动升到 L2**。
 *
 * 揭示（L1 → L2）刻意要两段：长按 600ms，或点一下再确认。单击即揭示会让
 * 一次误触在满桌人面前掀开整局。
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_SHIELD_LEVEL,
  L2_IDLE_FALLBACK_MS,
  levelAfterBlindCover,
  levelAfterIdle,
  type ShieldLevel,
} from './shieldLevel'

/** 长按揭示的时长。短于这个数会被袖子和口袋触发。 */
export const REVEAL_HOLD_MS = 600

export interface GrimoireShield {
  level: ShieldLevel
  /** 双指点画布：立刻全遮蔽，不给确认、不给动画。 */
  coverNow: () => void
  /** 恢复只认单指点大按钮——避免慌乱中同一个手势又把它掀开。 */
  uncover: () => void
  /** 长按开始/结束。松手时若未满 600ms 则不揭示。 */
  beginReveal: () => void
  cancelReveal: () => void
  /** 已按住的比例 0–1，供把手画环形进度。 */
  revealProgress: number
  /** 主动落回 L1，例如把设备递给玩家之前。 */
  conceal: () => void
  /** 任何交互都算「还在用」，用来推迟 L2 的自动落回。 */
  noteActivity: () => void
}

export function useGrimoireShield(initial: ShieldLevel = DEFAULT_SHIELD_LEVEL): GrimoireShield {
  const [level, setLevel] = useState<ShieldLevel>(initial)
  const [revealProgress, setRevealProgress] = useState(0)
  const holdTimer = useRef<number | null>(null)
  const holdFrame = useRef<number | null>(null)
  const idleTimer = useRef<number | null>(null)

  const clearHold = useCallback(() => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    if (holdFrame.current !== null) window.clearInterval(holdFrame.current)
    holdTimer.current = null
    holdFrame.current = null
    setRevealProgress(0)
  }, [])

  const coverNow = useCallback(() => {
    clearHold()
    setLevel(levelAfterBlindCover())
  }, [clearHold])

  const uncover = useCallback(() => setLevel(DEFAULT_SHIELD_LEVEL), [])
  const conceal = useCallback(() => {
    clearHold()
    setLevel((current) => (current === 'L2' ? DEFAULT_SHIELD_LEVEL : current))
  }, [clearHold])

  const beginReveal = useCallback(() => {
    clearHold()
    const startedAt = performance.now()
    holdFrame.current = window.setInterval(() => {
      setRevealProgress(Math.min(1, (performance.now() - startedAt) / REVEAL_HOLD_MS))
    }, 50)
    holdTimer.current = window.setTimeout(() => {
      clearHold()
      setLevel('L2')
    }, REVEAL_HOLD_MS)
  }, [clearHold])

  const noteActivity = useCallback(() => {
    if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
    idleTimer.current = null
    if (level !== 'L2') return
    idleTimer.current = window.setTimeout(() => setLevel(levelAfterIdle('L2')), L2_IDLE_FALLBACK_MS)
  }, [level])

  // 进入 L2 就开始计时；退出 L2 就把计时撤掉。
  useEffect(() => {
    if (level !== 'L2') {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      idleTimer.current = null
      return
    }
    idleTimer.current = window.setTimeout(() => setLevel(levelAfterIdle('L2')), L2_IDLE_FALLBACK_MS)
    return () => {
      if (idleTimer.current !== null) window.clearTimeout(idleTimer.current)
      idleTimer.current = null
    }
  }, [level])

  // 切到别的应用、锁屏、切标签页——设备离开视线的那一刻就该落回。
  useEffect(() => {
    const fallBack = () => setLevel((current) => levelAfterIdle(current))
    const onVisibility = () => { if (document.visibilityState === 'hidden') fallBack() }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', fallBack)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', fallBack)
    }
  }, [])

  useEffect(() => clearHold, [clearHold])

  return {
    level,
    coverNow,
    uncover,
    beginReveal,
    cancelReveal: clearHold,
    revealProgress,
    conceal,
    noteActivity,
  }
}
