import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import type { PhaseTrackNode } from '../../features/game-session/state/projectPhaseTrack'
import './ui.css'

interface PhaseTrackProps {
  nodes: readonly PhaseTrackNode[]
  /** 当前实际停留的阶段。不能从 open 猜，因为夜晚和白天允许同时开放。 */
  currentNodeId?: PhaseTrackNode['id']
  /** 右端常驻入口，通常是「本局记录 N」与「收尾」。 */
  actions?: ReactNode
}

const STATUS_TEXT: Record<PhaseTrackNode['status'], string> = {
  done: '已完成',
  open: '进行中',
  suggest: '建议下一步',
  idle: '未开始',
}

/**
 * 常驻阶段轨道：说书人抬头 0.5 秒只需回答「现在在哪一步、下一步是什么」。
 *
 * 它只显示状态，不推进相位——点节点不会创建或关闭记录段。「建议下一步」是提示
 * 而非权威指针，因为白天段与夜晚段允许同时开放，说书人可以按现场情况自由补记。
 * 状态用文字 + 形状 + 颜色三重表达，不能只靠颜色。
 */
export function PhaseTrack({ nodes, currentNodeId, actions }: PhaseTrackProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const currentRef = useRef<HTMLLIElement>(null)

  useLayoutEffect(() => {
    const list = listRef.current
    const current = currentRef.current
    if (!list || !current) return

    const revealCurrent = () => {
      const listRect = list.getBoundingClientRect()
      const nodeRect = current.getBoundingClientRect()
      if (nodeRect.left >= listRect.left && nodeRect.right <= listRect.right) return
      if (typeof list.scrollTo !== 'function') return

      const centeredLeft = list.scrollLeft
        + nodeRect.left
        - listRect.left
        - (listRect.width - nodeRect.width) / 2
      list.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'auto' })
    }

    revealCurrent()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(revealCurrent)
    observer.observe(list)
    observer.observe(current)
    return () => observer.disconnect()
  }, [currentNodeId])

  function handleTrackKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    const list = listRef.current
    if (!list || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const page = list.clientWidth * 0.7
    const left = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? list.scrollWidth
        : list.scrollLeft + (event.key === 'ArrowLeft' ? -page : page)
    list.scrollTo?.({ left: Math.max(0, left), behavior: 'auto' })
  }

  return (
    <nav className="ui-phase-track" aria-label="主持阶段">
      <ol
        ref={listRef}
        className="ui-phase-track__nodes"
        aria-label="阶段进度，可左右滑动"
        tabIndex={0}
        onKeyDown={handleTrackKeyDown}
      >
        {nodes.map((node) => (
          <li
            key={node.id}
            ref={node.id === currentNodeId ? currentRef : undefined}
            className={`ui-phase-node ui-phase-node--${node.status}`}
            aria-current={node.id === currentNodeId ? 'step' : undefined}
          >
            <span className="ui-phase-node__dot" aria-hidden="true" />
            <span className="ui-phase-node__label">{node.label}</span>
            {node.segmentLabel ? <span className="ui-phase-node__segment">{node.segmentLabel}</span> : null}
            <span className="ui-visually-hidden">（{STATUS_TEXT[node.status]}）</span>
          </li>
        ))}
      </ol>
      {actions ? <div className="ui-phase-track__actions">{actions}</div> : null}
    </nav>
  )
}
