import { DayRingFocusProvider } from '../day-workbench/state/DayRingFocusProvider'
import { GrimoireStageBody, type GrimoireStageProps } from './GrimoireStage'

/**
 * 环与抽屉必须包在同一个 DayRingFocusProvider 里。
 *
 * 白天在魔典模式下被拆成两块屏：环在上（点座位），单列步骤序列在抽屉里（选槽位、落账）。
 * 文档对提名的原话是「选人 = 点环，落到**抽屉分段当前指向的槽**」——两块共用一个指向。
 * 不包的话，useDayRingFocus 会各自退回组件本地 state：环上点一下落进一个没人读的槽，
 * 抽屉里的槽纹丝不动，而且两边都不报错。
 */
export function GrimoireStage(props: GrimoireStageProps) {
  return (
    <DayRingFocusProvider>
      <GrimoireStageBody {...props} />
    </DayRingFocusProvider>
  )
}
