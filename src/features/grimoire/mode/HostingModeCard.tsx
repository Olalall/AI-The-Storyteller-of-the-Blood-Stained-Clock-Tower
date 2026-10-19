/**
 * 首次引导卡「你的魔典放在哪里」。
 *
 * 问的是**桌上有没有实体魔典**，不是屏幕多宽。所以窄屏也照问：
 * 隐藏它会让模式静默取默认值，等说书人换到平板上，就会看见一张自己从没同意过的电子魔典。
 * 窄屏只是补一句「这台设备上会排成列表」——退化的是渲染，不是这局的性质。
 *
 * 选择只写进 session 当出处元数据。它不改变任何行为：两种模式下记录、确认、
 * 归档走的是同一条路径，区别只在屏幕上多不多一张环。
 */
import { BookOpenText, NotebookPen } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { Card } from '../../../components/ui/Card'
import type { HostingMode } from '../../game-session/types'
import './hosting-mode-card.css'

interface HostingModeCardProps {
  /** 已经选过就显示当前选择；未选过时两个选项等价呈现，不预选。 */
  value?: HostingMode
  onSelect: (mode: HostingMode) => void
  /** 逻辑宽度不足以画环的设备上补一句说明。 */
  narrow?: boolean
  /** 首次开局页已经提供标题时，只渲染选择项，避免卡片套卡片和重复说明。 */
  embedded?: boolean
  /** 页面刚切换时短暂阻止上一屏的双击落到选择项。 */
  disabled?: boolean
}

const OPTIONS: readonly { mode: HostingMode; title: string; detail: string; icon: typeof NotebookPen }[] = [
  {
    mode: 'record',
    title: '桌上有实体魔典',
    detail: '工具只做记录：夜间顺序、票型、时间轴与复盘。身份和标记仍摆在你面前的板子上。',
    icon: NotebookPen,
  },
  {
    mode: 'grimoire',
    title: '没有实体魔典',
    detail: '屏幕上多一张座位环，身份与标记都在上面。默认盖着，需要一次长按才揭示。',
    icon: BookOpenText,
  },
]

export function HostingModeCard({ value, onSelect, narrow = false, embedded = false, disabled = false }: HostingModeCardProps) {
  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, mode: HostingMode) {
    const currentIndex = OPTIONS.findIndex((option) => option.mode === mode)
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % OPTIONS.length
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + OPTIONS.length) % OPTIONS.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = OPTIONS.length - 1
    if (nextIndex === undefined) return
    event.preventDefault()
    onSelect(OPTIONS[nextIndex].mode)
    const options = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    options?.[nextIndex]?.focus()
  }

  const content = (
    <>
      <p className="hosting-mode-card__lede">
        两种都能记完整一局，随时可以改。这只决定屏幕上要不要多一张座位环。
      </p>
      <div className="hosting-mode-card__options" role="radiogroup" aria-label="主持模式">
        {OPTIONS.map(({ mode, title, detail, icon: Icon }) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={value === mode}
            disabled={disabled}
            tabIndex={value ? (value === mode ? 0 : -1) : (mode === OPTIONS[0].mode ? 0 : -1)}
            className={`hosting-mode-card__option ${value === mode ? 'is-selected' : ''}`}
            onClick={() => onSelect(mode)}
            onKeyDown={(event) => handleOptionKeyDown(event, mode)}
          >
            <Icon className="hosting-mode-card__icon" aria-hidden="true" />
            <strong>{title}</strong>
            <small>{detail}</small>
          </button>
        ))}
      </div>
      {narrow ? (
        <p className="hosting-mode-card__narrow-note" role="note">
          这台设备的屏幕画不下座位环，选了「没有实体魔典」也会排成列表；换到平板上会自动变回环。
        </p>
      ) : null}
    </>
  )

  if (embedded) return <div className="hosting-mode-card hosting-mode-card--embedded">{content}</div>

  return (
    <Card
      as="div"
      className="hosting-mode-card"
      eyebrow="开始之前"
      eyebrowTone="info"
      title="你的魔典放在哪里？"
    >
      {content}
    </Card>
  )
}
