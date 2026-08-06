/**
 * 环需要知道的全部夜间事实，一次投影出来。
 *
 * 这里一处写入都没有，与 stage/corePhaseSources 同一个理由：
 * 环是观察面，喂给它的东西只走渲染路径。真正的写入仍然只有一条——
 * 抽屉里那台夜间工作台的 `target` 意图与底栏「确认本项」。
 *
 * 为什么投影而不是把状态从 NightWorkbench 里提上来：
 * `sessionInitialNightState` 已经证明夜间工作台的全部状态都是 session 的纯投影
 * （它每次渲染都现算一份，不持有本地权威）。既然如此，环再投影一份读到的是同一份事实，
 * 不会出现「环上选了目标而抽屉不知道」。反过来把状态提到 GrimoireStage 会多一条
 * 组件树里的状态通路，而那条通路在纯记录模式下没有任何东西喂它。
 *
 * 这里刻意只读 NightRunState 的六个字段，不走 sessionInitialNightState：
 * 后者还要投影全座位快照与确认记录（要走一遍整条 timeline），而环一个都不用。
 */
import { deriveWorkbenchMode, isReadOnlyMode } from '../../night-workbench/state/workbenchMode'
import { nightRingBadges, type NightSeatBadge } from './nightRingCursor'
import type { NightTargetContext } from './nightTargetTap'
import type { GameSessionState } from '../../game-session/types'

export interface NightRingProjection {
  /** 座位 → 夜序角标。没有角标的座位不在表里。 */
  badges: ReadonlyMap<number, NightSeatBadge>
  /** 点座位时要用的上下文，同时喂给环上的提示语与抽屉里那行回显。 */
  target: NightTargetContext
  /** 已选目标 → 它是第几个（1 起）。多目标项要靠序号回显，不然两枚描边分不出先后。 */
  targetOrdinalBySeat: ReadonlyMap<number, number>
  /** 当前项坐在哪。null = 光标 id 在队列里找不到，此时不打焦点环。 */
  focusSeatId: number | null
  /** 抽屉此刻显示的那一项的 id。调用方要用它给「已选」那行做 key。 */
  focusItemId: string
}

export function projectNightRing(session: GameSessionState): NightRingProjection | null {
  const run = session.activeNightRunId ? session.nightRuns[session.activeNightRunId] : undefined
  if (!run || run.queue.length === 0) return null

  const current = run.queue.find((item) => item.id === run.previewEntryId)
  const badges = nightRingBadges({ queue: run.queue, focusItemId: run.previewEntryId })

  // 没有当前项就没有目标可点，但 ✓ 与「缓」照样该画出来——那两枚不依赖光标。
  if (!current) {
    return {
      badges,
      target: { targetCount: 0, targets: [], readOnly: true },
      targetOrdinalBySeat: new Map(),
      focusSeatId: null,
      focusItemId: run.previewEntryId,
    }
  }

  // 与抽屉里那张卡共用同一个只读闸门：预览别的项、已确认、已暂缓时环上点不动，
  // 这与 CurrentWakeCard 的 fieldset disabled 是同一个判据，不是第二份。
  const readOnly = isReadOnlyMode(deriveWorkbenchMode(run, current))
  const targets = run.drafts[current.id]?.targets ?? []

  return {
    badges,
    target: {
      targetCount: current.targetCount,
      targetLabel: current.targetLabel,
      targets,
      readOnly,
    },
    targetOrdinalBySeat: new Map(targets.map((seatId, index) => [seatId, index + 1])),
    focusSeatId: current.seatId,
    focusItemId: current.id,
  }
}
