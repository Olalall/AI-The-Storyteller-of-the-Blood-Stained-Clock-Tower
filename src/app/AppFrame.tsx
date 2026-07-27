import type { ReactNode } from 'react'
import './app-frame.css'

interface AppFrameProps {
  rail?: ReactNode
  children: ReactNode
}

export function AppFrame({ rail, children }: AppFrameProps) {
  return (
    <div className="app-frame" data-has-rail={Boolean(rail)}>
      <div className="app-frame__body">
        {rail ? <aside className="app-frame__rail">{rail}</aside> : null}
        <div className="app-frame__workspace">{children}</div>
      </div>
    </div>
  )
}
