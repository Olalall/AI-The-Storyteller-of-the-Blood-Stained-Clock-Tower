/**
 * 魔典完整度提示条。
 *
 * 它不是进度条也不是催办：说书人完全可以整局都不在工具里录身份。
 * 它的职责只有一个——**不让屏幕上的空魔典看起来像一局没发生过的对局**。
 * 所以文案永远说清楚「工具知道什么」而不是「你还差什么没做」。
 *
 * 三个控件而不是一个（文档第 675 行）：两个主张放左边跟着句子走，
 * 「不再提示」推到右端。把它和「先这样」并排会让两个后果完全不同的键
 * 长得一样宽、挨在一起——一个是这次不管，一个是从此不说。
 */
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import {
  completenessNotice,
  type CompletenessActionId,
  type GrimoireCompleteness,
} from './grimoireCompleteness'
import './completeness-bar.css'

interface CompletenessBarProps {
  completeness: GrimoireCompleteness
  /** 身份缺失时的补救入口（SetupPanel）。 */
  onOpenSetup: () => void
  /** 「逐条核对」：打开本局记录，让说书人对着记录逐条补状态。 */
  onReview: () => void
  /** 「先这样，边走边补」：只对当前这一份欠账闭嘴。 */
  onDefer: () => void
  /** 「不再提示」：整条提示条此后不再出现。 */
  onSilence: () => void
}

const ICON = { warning: AlertTriangle, info: Info, success: CheckCircle2 }

export function CompletenessBar({ completeness, onOpenSetup, onReview, onDefer, onSilence }: CompletenessBarProps) {
  const notice = completenessNotice(completeness)
  const Icon = ICON[notice.tone]
  const handlers: Record<CompletenessActionId, () => void> = {
    setup: onOpenSetup,
    review: onReview,
    defer: onDefer,
    silence: onSilence,
  }

  return (
    <div className={`completeness-bar completeness-bar--${notice.tone}`} role="status">
      <Icon className="completeness-bar__icon" aria-hidden="true" />
      <p className="completeness-bar__message">
        {notice.message}
        {/* 破折号后半句是具体数字，与主句同段而不是另起一行：说书人读的是一句话。 */}
        {notice.detail ? <span className="completeness-bar__detail"> —— {notice.detail}</span> : null}
      </p>
      {notice.actions.map((action) => (
        <Button
          key={action.id}
          variant={action.id === 'review' ? 'secondary' : 'ghost'}
          compact
          className={`completeness-bar__action completeness-bar__action--${action.id}`}
          onClick={handlers[action.id]}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}
