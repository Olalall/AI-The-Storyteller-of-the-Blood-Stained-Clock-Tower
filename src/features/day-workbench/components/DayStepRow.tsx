import { Check, Pencil } from 'lucide-react'

interface DayStepRowProps {
  index: number
  title: string
  summary: string
  done: boolean
  onEdit: () => void
  disabled?: boolean
}

/**
 * 折叠态的步骤摘要条。
 *
 * 必须让「还能改上一步」显而易见：整行可点、带铅笔图标、44px 触控高度。
 * 点它只切换展开的步骤，不动任何已填内容——回退编辑不得清空后续步骤。
 */
export function DayStepRow({ index, title, summary, done, onEdit, disabled = false }: DayStepRowProps) {
  return (
    <button
      type="button"
      className={`day-step-row ${done ? 'is-done' : ''}`}
      onClick={onEdit}
      disabled={disabled}
      aria-label={`回到步骤${index}：${title}`}
    >
      <span className="day-step-row__index">{done ? <Check aria-hidden="true" /> : index}</span>
      <span className="day-step-row__title">{title}</span>
      <span className="day-step-row__summary">{summary}</span>
      {!disabled ? <Pencil className="day-step-row__pencil" aria-hidden="true" /> : null}
    </button>
  )
}
