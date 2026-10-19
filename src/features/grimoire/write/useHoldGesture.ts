/**
 * 长按加速器。
 *
 * 「加速器」这三个字是本文件的全部立场：长按永远只是**第二条**路。
 * 设计系统禁止隐藏式长按——键盘用户与读屏用户根本发不出这个手势，
 * 触摸用户也没有任何视觉线索知道它存在。所以每一处用它的地方，
 * 都必须另有一条点得到、Tab 得到的等价入口；这个 hook 只负责把手势做对：
 *
 * - 按住期间持续回报 0–1 的进度，供调用方画环形填充。没有进度反馈的长按，
 *   在「已经按住了吗」和「按坏了吗」之间没有区别，人会松手重来。
 * - 达时后 onHold 只触发一次，且把随后浏览器补发的那一下 click 吃掉——
 *   不吃掉的话，「长按打开浮层」会在松手瞬间被「单击选中目标」再走一遍。
 * - 中途移出、取消、卸载一律清干净。定时器漏一个，浮层就会在说书人
 *   已经去点别处之后凭空弹出来。
 */
import { useCallback, useEffect, useRef, useState } from 'react'

/** 进度刷新间隔。50ms 够画满一圈 8 帧，又不至于在 20 个座位上一起跑成掉帧源。 */
const PROGRESS_TICK_MS = 50

export interface HoldGesture {
  /** 已按住的比例 0–1。 */
  progress: number
  onPointerDown: () => void
  onPointerUp: () => void
  onPointerLeave: () => void
  onPointerCancel: () => void
  /**
   * 把调用方自己的 onClick 包一层：长按已经触发过时吞掉这一下。
   * 传 undefined 会得到 undefined，好让调用方原样透传给不需要点击的元素。
   */
  wrapClick: <T extends (...args: never[]) => void>(handler: T | undefined) => T | undefined
}

export function useHoldGesture(holdMs: number, onHold: (() => void) | undefined): HoldGesture {
  const [progress, setProgress] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null)
  /** 本次按压是否已经达时。松手后由紧随其后的 click 读取并复位。 */
  const fired = useRef(false)

  const clear = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current)
    if (ticker.current !== null) clearInterval(ticker.current)
    timer.current = null
    ticker.current = null
    setProgress(0)
  }, [])

  const onPointerDown = useCallback(() => {
    if (!onHold) return
    clear()
    fired.current = false
    const startedAt = Date.now()
    ticker.current = setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startedAt) / holdMs))
    }, PROGRESS_TICK_MS)
    timer.current = setTimeout(() => {
      clear()
      fired.current = true
      onHold()
    }, holdMs)
  }, [clear, holdMs, onHold])

  const wrapClick = useCallback(<T extends (...args: never[]) => void>(handler: T | undefined) => {
    if (!handler) return undefined
    return ((...args: never[]) => {
      // 达时之后浏览器仍会补一个 click。不吃掉它，长按与单击两种语义会在同一次手势里都跑一遍。
      if (fired.current) {
        fired.current = false
        return
      }
      handler(...args)
    }) as T
  }, [])

  useEffect(() => clear, [clear])

  return {
    progress,
    onPointerDown,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    wrapClick,
  }
}
