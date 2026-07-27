import type { PropsWithChildren } from 'react'
import './ui.css'

export type BadgeTone = 'neutral' | 'current' | 'success' | 'warning' | 'danger' | 'info'

export function StatusBadge({ tone = 'neutral', children }: PropsWithChildren<{ tone?: BadgeTone }>) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>
}
