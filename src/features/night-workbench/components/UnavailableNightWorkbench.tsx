import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'

export function UnavailableNightWorkbench({ onExit }: { onExit: () => void }) {
  return <main className="night-workbench" aria-label="夜间工作台不可用">
    <EmptyState title="当前夜序不可用" description="请先确认本局配板；已有夜序资料不完整时，请从有效备份恢复。">
      <Button onClick={onExit}>返回本局</Button>
    </EmptyState>
  </main>
}
