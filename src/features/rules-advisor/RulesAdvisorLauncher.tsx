import { useRef, useState } from 'react'
import { MessagesSquare } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { RulesAdvisorSheet } from '../../app/deferredFeatures'

export function RulesAdvisorLauncher({ scriptId, concealed }: { scriptId: string; concealed: boolean }) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLSpanElement>(null)
  function changeOpen(next: boolean) {
    setOpen(next)
    if (!next) requestAnimationFrame(() => trigger.current?.querySelector('button')?.focus())
  }
  return <>
    <span ref={trigger}><Button variant="ghost" compact aria-label="规则问答" title={concealed ? '遮蔽中，请先退出遮蔽再使用问答' : '询问板子和角色规则'} disabled={concealed} onClick={() => setOpen(true)}><MessagesSquare aria-hidden="true" />问答</Button></span>
    <RulesAdvisorSheet open={open} onOpenChange={changeOpen} initialScriptId={scriptId} concealed={concealed} />
  </>
}
