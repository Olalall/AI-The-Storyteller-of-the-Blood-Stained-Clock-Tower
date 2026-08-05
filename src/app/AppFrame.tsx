import type { ReactNode } from 'react'
import { SessionRecoveryNotice } from '../features/game-session/components/SessionRecoveryNotice'
import './app-frame.css'

interface AppFrameProps {
  rail?: ReactNode
  /** 常驻阶段轨道；全局唯一，挂在所有工作台之上。 */
  phaseTrack?: ReactNode
  children: ReactNode
}

export function AppFrame({ rail, phaseTrack, children }: AppFrameProps) {
  return (
    <div className="app-frame" data-has-rail={Boolean(rail)}>
      <SessionRecoveryNotice />
      {phaseTrack}
      <div className="app-frame__body">
        {rail ? <aside className="app-frame__rail">{rail}</aside> : null}
        <div className="app-frame__workspace">{children}</div>
      </div>
    </div>
  )
}
