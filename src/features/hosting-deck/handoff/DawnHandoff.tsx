import { AlertTriangle, Eye, HeartPulse, Skull, Timer } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { StickyActionBar } from '../../../components/ui/StickyActionBar'
import { projectDawnReport, type DawnLifeChange } from '../../game-session/state/projectDawnReport'
import type { GameSessionState } from '../../game-session/types'
import './dawn-handoff.css'

export interface DawnHandoffProps {
  session: GameSessionState
  /** 刚结束的那一夜；差分基准是它开始的那一刻（黄昏快照）。 */
  nightSegmentId: string
  dayLabel: string
  onStartDay: () => void
  onOpenPlayerStatus: (seatId: number) => void
}

const titleId = 'dawn-handoff-title'

function ChangeList({ changes, emptyText }: { changes: readonly DawnLifeChange[]; emptyText: string }) {
  if (changes.length === 0) {
    return <p className="dawn-handoff__none">{emptyText}</p>
  }
  return (
    <ul className="dawn-handoff__list">
      {changes.map((change) => (
        <li className="dawn-handoff__change" key={`${change.kind}-${change.seatId}`}>
          <span className="dawn-handoff__seat">{change.seatId}</span>
          <span className="dawn-handoff__seat-unit">号</span>
          <span className="dawn-handoff__nickname">{change.nickname || '未填昵称'}</span>
          {change.kind === 'died' ? (
            <StatusBadge tone="danger"><Skull aria-hidden="true" />死亡</StatusBadge>
          ) : (
            <StatusBadge tone="success"><HeartPulse aria-hidden="true" />复活</StatusBadge>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * 黎明播报卡：只把主控投影器算好的「黄昏 → 现在」生死差分念出来。
 *
 * 两条不可退让的约束：
 * 1. 死亡名单只来自 projectDawnReport 的 changes（说书人手动改过的状态）。
 *    这里绝不扫 timeline 由夜间确认记录反推谁死了——那是产品明确排除的自动结算。
 * 2. 本组件不 dispatch、不写 session；推进白天只经由 onStartDay 回调。
 */
export function DawnHandoff({
  session,
  nightSegmentId,
  dayLabel,
  onStartDay,
  onOpenPlayerStatus,
}: DawnHandoffProps) {
  const report = useMemo(() => projectDawnReport(session, nightSegmentId), [session, nightSegmentId])
  const died = report.changes.filter((change) => change.kind === 'died')
  const revived = report.changes.filter((change) => change.kind === 'revived')
  const nightLabel = session.phaseSegments.find((segment) => segment.id === nightSegmentId)?.label ?? '本夜'
  // 提示条只有条数、没有座位：投影器刻意不给座位，免得读成「这几个人死了」。
  // 因此跳转落在最小座位号，由说书人自己在玩家状态页翻到要改的那个座位。
  const firstSeatId = Object.keys(session.seats).map(Number).sort((left, right) => left - right)[0] ?? 1

  return (
    <div className="dawn-handoff">
      <Card
        className="dawn-handoff__card"
        eyebrow={`黎明 · ${nightLabel}结束`}
        eyebrowTone="info"
        title="宣布本夜的生死变化"
        titleId={titleId}
        aria-labelledby={titleId}
      >
        <p className="dawn-handoff__guard">
          <Eye aria-hidden="true" />
          只报生死，不报原因
        </p>

        {report.changes.length === 0 ? (
          <EmptyState
            title="本夜无人死亡"
            description="仍要照常宣布睁眼，并当众说明本夜没有生死变化。"
          />
        ) : (
          <div className="dawn-handoff__groups">
            <section className="dawn-handoff__group" aria-labelledby="dawn-handoff-died">
              <h3 className="dawn-handoff__group-title" id="dawn-handoff-died">本夜死亡</h3>
              <ChangeList changes={died} emptyText="本夜无人死亡" />
            </section>
            <section className="dawn-handoff__group" aria-labelledby="dawn-handoff-revived">
              <h3 className="dawn-handoff__group-title" id="dawn-handoff-revived">本夜复活</h3>
              <ChangeList changes={revived} emptyText="本夜无人复活" />
            </section>
          </div>
        )}

        {report.unappliedDeathHints > 0 ? (
          <div className="dawn-handoff__hint" role="note">
            <AlertTriangle aria-hidden="true" />
            <div className="dawn-handoff__hint-text">
              <strong>本夜有 {report.unappliedDeathHints} 项记录标注了死亡类结果，但玩家状态未更新</strong>
              <span>这只是提醒去核对，不代表这些玩家已经死亡；状态仍需说书人手动修改。</span>
            </div>
            <Button variant="secondary" compact onClick={() => onOpenPlayerStatus(firstSeatId)}>
              去更新状态
            </Button>
          </div>
        ) : null}

        <p className="dawn-handoff__wait">
          <Timer aria-hidden="true" />
          等五到十秒再开口，让夜晚彻底结束。
          <span className="dawn-handoff__wait-bar" aria-hidden="true" />
        </p>
      </Card>

      <StickyActionBar>
        <span className="dawn-handoff__bar-note">{nightLabel}已结束</span>
        <Button variant="primary" onClick={onStartDay}>已宣布睁眼 · 进入{dayLabel}</Button>
      </StickyActionBar>
    </div>
  )
}
