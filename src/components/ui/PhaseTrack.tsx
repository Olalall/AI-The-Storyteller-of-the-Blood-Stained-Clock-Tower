import type { ReactNode } from 'react'
import type { PhaseTrackNode } from '../../features/game-session/state/projectPhaseTrack'
import './ui.css'

interface PhaseTrackProps {
  nodes: readonly PhaseTrackNode[]
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
export function PhaseTrack({ nodes, actions }: PhaseTrackProps) {
  return (
    <nav className="ui-phase-track" aria-label="主持阶段">
      <ol className="ui-phase-track__nodes">
        {nodes.map((node) => (
          <li key={node.id} className={`ui-phase-node ui-phase-node--${node.status}`}>
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
