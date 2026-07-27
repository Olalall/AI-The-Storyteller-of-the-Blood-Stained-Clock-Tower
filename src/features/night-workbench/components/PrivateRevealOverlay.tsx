import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '../../../components/ui/Button'

interface PrivateRevealOverlayProps {
  open: boolean
  information: string
  onOpenChange: (open: boolean) => void
}

export function PrivateRevealOverlay({ open, information, onOpenChange }: PrivateRevealOverlayProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="private-reveal-overlay" />
        <Dialog.Content
          className="private-reveal"
          aria-describedby={undefined}
          onPointerDownOutside={(event) => event.preventDefault()}
        >
          <Dialog.Title>请查看信息</Dialog.Title>
          <p className="private-reveal__information">{information}</p>
          <Dialog.Close asChild>
            <Button variant="primary">收起并遮蔽</Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
