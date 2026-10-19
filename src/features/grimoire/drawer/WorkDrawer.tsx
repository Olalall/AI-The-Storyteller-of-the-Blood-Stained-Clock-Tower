/**
 * 底部工作抽屉：peek / half / full 三档，抽屉内容由调用方决定。
 *
 * 三档的取值都由 workDrawerHeightPx 一处算出，CSS 里不再各写一遍：
 * - peek 恒定 96px——环的下半弧被遮住的部分因此永远不超过 96px（Mac 宽而矮，这是硬约束）；
 * - full 恒为 视口高 − 48px，把顶部阶段轨道留出来，其余尺寸与 presentation="page" 一致（铺满宽度、无圆角边距）；
 * - half 取 46dvh，并被 240px 下限与 full 上限夹住。
 *
 * 把手同时支持拖动与点击循环，键盘用上下箭头切档（role="slider" 让读屏播报当前档位）。
 * 抽屉本体不 dispatch 任何东西：档位变化只回调给调用方，画布内的状态编辑仍走 PlayerStatusSheet。
 */
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Button } from '../../../components/ui/Button'
import {
  DETENT_LABEL,
  PEEK_SLOT_MIN_HEIGHT,
  WORK_DRAWER_DETENTS,
  WORK_DRAWER_PEEK_HEIGHT,
  heightCssFor,
  nearestDetent,
  shiftDetent,
  workDrawerHeightPx,
  type WorkDrawerDetent,
  type WorkDrawerPeekSlotKind,
} from './detents'
import './work-drawer.css'

/** peek 档的占用者。它在 body 之外，因为 peek 档下 body 是 inert 的，而这两位正是那一档唯一能按的东西。 */
export interface WorkDrawerPeekSlot {
  kind: WorkDrawerPeekSlotKind
  /** 读屏播报名，例如「确认 5号 状态」。 */
  label: string
  content: ReactNode
}

export interface WorkDrawerProps {
  /**
   * 抽屉顶部常驻的手势契约，明写此刻点座位会发生什么，例如「点座位 = 选目标」。
   * 暗光下说书人只有余裕记「点下去 = 做当前这一步」。
   */
  gestureContract: string
  /** 受控档位。不传则组件自己管，仍会回调 onDetentChange。 */
  detent?: WorkDrawerDetent
  defaultDetent?: WorkDrawerDetent
  onDetentChange?: (detent: WorkDrawerDetent) => void
  /** 抽屉自身的可访问名，例如「夜间步骤台」。 */
  label?: string
  /** peek 档的占用者；不传时这一档只有把手与手势契约。 */
  peekSlot?: WorkDrawerPeekSlot
  className?: string
  children?: ReactNode
}

export function WorkDrawer({
  gestureContract,
  detent: controlledDetent,
  defaultDetent = 'peek',
  onDetentChange,
  label = '工作抽屉',
  peekSlot,
  className = '',
  children,
}: WorkDrawerProps) {
  const [uncontrolled, setUncontrolled] = useState<WorkDrawerDetent>(defaultDetent)
  const detent = controlledDetent ?? uncontrolled
  const [dragHeight, setDragHeight] = useState<number | null>(null)
  const dragOrigin = useRef<{ pointerY: number; height: number } | null>(null)
  /** 一次真实拖动之后浏览器仍会补一个 click，别让它再把档位往前推一格。 */
  const suppressClick = useRef(false)

  const commit = useCallback((next: WorkDrawerDetent) => {
    if (controlledDetent === undefined) setUncontrolled(next)
    if (next !== detent) onDetentChange?.(next)
  }, [controlledDetent, detent, onDetentChange])

  const viewportHeight = () => (typeof window === 'undefined' ? 0 : window.innerHeight)

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = event.key === 'ArrowUp' ? shiftDetent(detent, 1)
      : event.key === 'ArrowDown' ? shiftDetent(detent, -1)
        : event.key === 'Home' ? WORK_DRAWER_DETENTS[0]
          : event.key === 'End' ? WORK_DRAWER_DETENTS[WORK_DRAWER_DETENTS.length - 1]
            : null
    if (!next) return
    event.preventDefault()
    commit(next)
  }

  // 点击循环：peek → half → full → peek。把手是加速器，不是唯一入口——键盘同样能到每一档。
  const handleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    const index = WORK_DRAWER_DETENTS.indexOf(detent)
    commit(WORK_DRAWER_DETENTS[(index + 1) % WORK_DRAWER_DETENTS.length])
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    dragOrigin.current = { pointerY: event.clientY, height: workDrawerHeightPx(detent, viewportHeight()) }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onMove = (event: globalThis.PointerEvent) => {
      const origin = dragOrigin.current
      if (!origin) return
      const moved = origin.pointerY - event.clientY
      if (Math.abs(moved) < 4) return
      setDragHeight(Math.min(
        workDrawerHeightPx('full', window.innerHeight),
        Math.max(WORK_DRAWER_PEEK_HEIGHT, origin.height + moved),
      ))
    }
    const onUp = () => {
      const origin = dragOrigin.current
      if (!origin) return
      const height = dragHeight
      dragOrigin.current = null
      setDragHeight(null)
      // 没超过 4px 抖动阈值时按点击处理，交给 onClick，不在这里改档。
      if (height === null) return
      suppressClick.current = true
      commit(nearestDetent(height, window.innerHeight))
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [commit, dragHeight])

  const index = WORK_DRAWER_DETENTS.indexOf(detent)

  return (
    <aside
      className={`work-drawer ${className}`.trim()}
      data-detent={detent}
      data-dragging={dragHeight !== null}
      style={{ height: dragHeight !== null ? `${dragHeight}px` : heightCssFor(detent) }}
      aria-label={label}
    >
      <div className="work-drawer__top">
        <Button
          type="button"
          variant="ghost"
          className="work-drawer__handle"
          role="slider"
          aria-label="工作抽屉高度"
          aria-valuemin={0}
          aria-valuemax={WORK_DRAWER_DETENTS.length - 1}
          aria-valuenow={index}
          aria-valuetext={DETENT_LABEL[detent]}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
        >
          <span className="work-drawer__grip" aria-hidden="true" />
          <span className="work-drawer__detent-text">{DETENT_LABEL[detent]}</span>
        </Button>
        {/* 手势契约常驻：档位再矮也不能把这一行推出视野。 */}
        <p className="work-drawer__contract" role="status">{gestureContract}</p>
      </div>
      {peekSlot ? (
        // 刻意在 body 之外：peek 档下 body 是 inert 的，而这条横条正是那一档唯一要按的东西。
        <div
          className="work-drawer__peek-slot"
          data-slot={peekSlot.kind}
          role="group"
          aria-label={peekSlot.label}
          style={{ minHeight: PEEK_SLOT_MIN_HEIGHT[peekSlot.kind] || undefined }}
        >
          {peekSlot.content}
        </div>
      ) : null}
      <div className="work-drawer__body" inert={detent === 'peek' || undefined}>
        {children}
      </div>
    </aside>
  )
}
