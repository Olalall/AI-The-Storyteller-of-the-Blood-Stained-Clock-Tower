import { ArrowLeft } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import './leave-workbench-notice.css'

interface LeaveWorkbenchNoticeProps {
  title: string
  description: string
  onStay: () => void
  onLeave: () => void
}

/** 仅提示可恢复的工作台草稿；确认返回不写任何对局事实。 */
export function LeaveWorkbenchNotice({ title, description, onStay, onLeave }: LeaveWorkbenchNoticeProps) {
  return (
    <section className="leave-workbench-notice" aria-live="polite">
      <div><strong>{title}</strong><span>{description}</span></div>
      <div>
        <Button variant="ghost" compact onClick={onStay}>继续处理</Button>
        <Button variant="secondary" compact onClick={onLeave}><ArrowLeft aria-hidden="true" />返回本局</Button>
      </div>
    </section>
  )
}
