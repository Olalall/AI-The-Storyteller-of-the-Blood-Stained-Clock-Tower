import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import './ui.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  compact?: boolean
}

export function Button({
  variant = 'secondary',
  compact = false,
  className = '',
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={`ui-button ui-button--${variant} ${compact ? 'ui-button--compact' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
