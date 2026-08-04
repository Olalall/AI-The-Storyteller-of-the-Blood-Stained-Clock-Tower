import type { ReactNode } from 'react'
import { SessionRecoveryNotice } from '../features/game-session/components/SessionRecoveryNotice'
import './app-frame.css'

interface AppFrameProps {
  rail?: ReactNode
  children: ReactNode
}

export function AppFrame({ rail, children }: AppFrameProps) {
  return (
    <div className="app-frame" data-has-rail={Boolean(rail)}>
      <SessionRecoveryNotice />
      <div className="app-frame__body">
        {rail ? <aside className="app-frame__rail">{rail}</aside> : null}
        <div className="app-frame__workspace">{children}</div>
      </div>
    </div>
  )
}
