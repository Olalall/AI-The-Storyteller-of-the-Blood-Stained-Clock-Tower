import type { PropsWithChildren } from 'react'
import './ui.css'

export function StickyActionBar({ children }: PropsWithChildren) {
  return <footer className="sticky-action-bar">{children}</footer>
}
