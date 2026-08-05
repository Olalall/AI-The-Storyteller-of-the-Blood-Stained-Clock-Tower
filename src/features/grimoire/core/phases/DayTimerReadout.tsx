/**
 * 白天计时态：核中央放 mm:ss 大字 + 阶段名 + 「可开始提名」状态。
 *
 * 环导轨本身充当进度弧（另一批），所以核这里不再画第二条进度条——
 * 同一件事画两遍，说书人会去比对两者是否一致，那是纯粹的浪费。
 *
 * 这里不放开始/暂停/重置：它们在抽屉 peek 档的横条上。核是观察面。
 */
import { StatusBadge } from '../../../../components/ui/StatusBadge'
import { CORE_PHASE_LABEL, CORE_UNKNOWN, clockReadout, type GrimoireDayTimer } from '../corePhase'

interface DayTimerReadoutProps {
  timer: GrimoireDayTimer
}

export function DayTimerReadout({ timer }: DayTimerReadoutProps) {
  const clock = clockReadout(timer.remainingSeconds)
  const open = timer.nominationsOpen ?? null

  return (
    <div className="grimoire-core__timer" role="group" aria-label={CORE_PHASE_LABEL['day-timer']}>
      <p
        className="grimoire-core__clock"
        data-overtime={clock.overtime}
        data-empty={clock.text === CORE_UNKNOWN}
      >
        {clock.text}
        {clock.overtime ? <span className="ui-visually-hidden">已超时</span> : null}
        {clock.text === CORE_UNKNOWN ? <span className="ui-visually-hidden">没有计时数据</span> : null}
      </p>
      <p className="grimoire-core__timer-meta">
        <span className="grimoire-core__timer-phase" data-empty={!timer.phaseName}>
          {timer.phaseName || CORE_UNKNOWN}
        </span>
        {/* 提名状态是说书人排的日程，不是工具算出来的判定；没记过就写「—」，不猜「还不能提名」。 */}
        <StatusBadge tone={open === true ? 'success' : 'neutral'} size="sm">
          {open === null ? `可开始提名 ${CORE_UNKNOWN}` : open ? '可开始提名' : '尚不可提名'}
        </StatusBadge>
      </p>
    </div>
  )
}
