/**
 * 白天时序的第 1 步：选提名人与被提名人。
 *
 * 折叠态是一条可点摘要条而不是被隐藏掉——「还能改上一步」必须一眼可见，
 * 否则说书人点错座位后会以为只能重开一轮。
 */
import { Card } from '../../../components/ui/Card'
import { SeatButton } from '../../../components/ui/SeatButton'
import { DayStepRow } from './DayStepRow'
import type { NominationTarget } from '../state/dayRingFocus'
import type { DayVoteDraft, GameSessionState, PlayerState } from '../../game-session/types'
import { nominationIssues } from '../state/nominationRules'
import { NominationExceptionField } from './NominationExceptionField'

// 类型的家在 dayRingFocus——环与抽屉共用同一个「当前指向哪个槽」，
// 它不再是这张卡片私有的概念。这里只做转出口，免得既有调用方全部改 import。
export type { NominationTarget }

interface NominationStepProps {
  session: GameSessionState
  onChange: (update: (current: DayVoteDraft) => DayVoteDraft) => void
  collapsed: boolean
  draft: DayVoteDraft
  /**
   * 唯一的写入闸门，由 DayWorkbench 算好后自上而下传。本组件不得自己推导它——
   * 与夜间工作台同一条硬规则：任何只读态都靠一个 readOnly prop 强制，不靠自觉。
   */
  readOnly: boolean
  playerCount: number
  playerStates: Record<number, PlayerState>
  target: NominationTarget
  onChangeTarget: (target: NominationTarget) => void
  onSelectSeat: (seatId: number) => void
  onExpand: () => void
}

export function NominationStep({
  session,
  onChange,
  collapsed,
  draft,
  readOnly,
  playerCount,
  playerStates,
  target,
  onChangeTarget,
  onSelectSeat,
  onExpand,
}: NominationStepProps) {
  const nominationReady = draft.nominatorSeatId !== null && draft.nomineeSeatId !== null

  if (collapsed) {
    return (
      <DayStepRow
        index={1}
        title="提名"
        summary={nominationReady ? `${draft.nominatorSeatId}号提名 ${draft.nomineeSeatId}号` : '未选'}
        done={nominationReady}
        disabled={readOnly}
        onEdit={onExpand}
      />
    )
  }

  const selectedSeatId = target === 'nominator' ? draft.nominatorSeatId : draft.nomineeSeatId
  const targetLabel = target === 'nominator' ? '提名人' : '被提名人'

  return (
    <Card className="day-card--nomination" eyebrow="步骤 1" eyebrowTone="info" title="选择提名" titleId="nomination-title" aria-labelledby="nomination-title">
      <div className="day-selection-tabs" role="tablist" aria-label="选择提名对象">
        <button type="button" disabled={readOnly} role="tab" aria-selected={target === 'nominator'} className={target === 'nominator' ? 'is-active' : ''} onClick={() => onChangeTarget('nominator')}>提名人 · {draft.nominatorSeatId ? `${draft.nominatorSeatId}号` : '未选'}</button>
        <button type="button" disabled={readOnly} role="tab" aria-selected={target === 'nominee'} className={target === 'nominee' ? 'is-active' : ''} onClick={() => onChangeTarget('nominee')}>被提名人 · {draft.nomineeSeatId ? `${draft.nomineeSeatId}号` : '未选'}</button>
      </div>
      <div className="day-seat-grid" aria-label="提名座位">
        {Array.from({ length: playerCount }, (_value, index) => {
          const seatId = index + 1
          const blocked = draft.nominationExceptionReason === undefined ? nominationIssues(session, { segmentId: draft.segmentId, nominatorSeatId: target === 'nominator' ? seatId : null, nomineeSeatId: target === 'nominee' ? seatId : null })[0] : undefined
          return <SeatButton key={seatId} seat={seatId} disabled={readOnly || Boolean(blocked)} title={blocked} selected={seatId === selectedSeatId} dead={playerStates[seatId]?.life === 'dead'} onClick={() => onSelectSeat(seatId)} aria-label={`选择${seatId}号为${targetLabel}`} />
        })}
      </div>
      <NominationExceptionField session={session} draft={draft} onChange={onChange} disabled={readOnly} />
      <p className="day-disabled-reason">常规提名须由存活玩家发起；每人每天只能提名一次、被提名一次。特殊能力请勾选并填写依据。</p>
    </Card>
  )
}
