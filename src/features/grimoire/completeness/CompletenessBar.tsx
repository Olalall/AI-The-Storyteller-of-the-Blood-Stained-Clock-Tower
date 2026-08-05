/**
 * 魔典完整度提示条。
 *
 * 它不是进度条也不是催办：说书人完全可以整局都不在工具里录身份。
 * 它的职责只有一个——**不让屏幕上的空魔典看起来像一局没发生过的对局**。
 * 所以文案永远说清楚「工具知道什么」而不是「你还差什么没做」。
 */
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { completenessNotice, type GrimoireCompleteness } from './grimoireCompleteness'
import './completeness-bar.css'

interface CompletenessBarProps {
  completeness: GrimoireCompleteness
  onOpenSetup: () => void
  onOpenStateEntry: () => void
}

const ICON = { warning: AlertTriangle, info: Info, success: CheckCircle2 }

export function CompletenessBar({ completeness, onOpenSetup, onOpenStateEntry }: CompletenessBarProps) {
  const notice = completenessNotice(completeness)
  const Icon = ICON[notice.tone]

  return (
    <p className={`completeness-bar completeness-bar--${notice.tone}`} role="status">
      <Icon className="completeness-bar__icon" aria-hidden="true" />
      <span className="completeness-bar__message">{notice.message}</span>
      {notice.action ? (
        <Button
          variant="ghost"
          compact
          onClick={notice.action === 'setup' ? onOpenSetup : onOpenStateEntry}
        >
          {notice.actionLabel}
        </Button>
      ) : null}
    </p>
  )
}
