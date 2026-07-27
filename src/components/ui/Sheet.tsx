import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'
import './ui.css'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  trigger?: ReactNode
  contentClassName?: string
  presentation?: 'sheet' | 'page'
  layer?: 'default' | 'nested'
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  contentClassName = '',
  presentation = 'sheet',
  layer = 'default',
  children,
}: PropsWithChildren<SheetProps>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className={`sheet-overlay sheet-overlay--${layer}`} />
        <Dialog.Content className={`sheet-content sheet-content--${presentation} sheet-content--${layer} ${contentClassName}`} data-presentation={presentation}>
          <header className="sheet-header">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              <Dialog.Description>{description}</Dialog.Description>
            </div>
            <Dialog.Close className="sheet-close" aria-label={`关闭${title}`}>
              <X aria-hidden="true" />
            </Dialog.Close>
          </header>
          <div className="sheet-body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
