import { CalendarClock } from 'lucide-react'
import type { DayFacts } from '../../game-session/state/projectDayFacts'

interface DayFactsBarProps {
  facts: DayFacts | null | undefined
}

/**
 * 回溯型角色专用的「今天发生了什么」只读事实条。
 *
 * 它存在的理由是省掉一次跨视图跳转：现在要查今天处决了谁，必须退出夜间 →
 * 开日记 → 翻当天 → 记住 → 关掉 → 找回原位，牌桌上要五六秒。
 *
 * 硬约束：只陈述客观事实，不出现任何建议动词。说书人可能因为红鲱鱼、
 * 登记异常或中毒醉酒得出与字面事实不同的结论，工具替他推一步就越界了。
 * 调用方负责在遮蔽态下不渲染本组件（秘密内容不能只靠 CSS 隐藏）。
 */
export function DayFactsBar({ facts }: DayFactsBarProps) {
  if (!facts) return null
  const hasAnything = facts.execution || facts.nominations.length || facts.publicEvents.length
  if (!hasAnything) return null

  return (
    <section className="wake-day-facts" aria-label={`${facts.dayLabel ?? '今天'}发生的事实`}>
      <div className="wake-day-facts__title"><CalendarClock aria-hidden="true" />{facts.dayLabel ?? '今天'}</div>
      <dl>
        {facts.execution ? <div><dt>处决</dt><dd>{facts.execution}</dd></div> : null}
        {facts.nominations.length ? <div><dt>提名</dt><dd>{facts.nominations.join('、')}</dd></div> : null}
        {facts.publicEvents.length ? <div><dt>公开事件</dt><dd>{facts.publicEvents.join('；')}</dd></div> : null}
      </dl>
    </section>
  )
}
