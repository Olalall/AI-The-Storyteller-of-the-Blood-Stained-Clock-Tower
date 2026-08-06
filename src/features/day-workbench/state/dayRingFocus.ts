/**
 * 白天这一步「指向哪儿」的共享焦点。
 *
 * 魔典模式下白天被拆成了两块屏：环在上（点座位），单列步骤序列在抽屉里（选槽位、落账）。
 * 文档对提名的原话是「选人 = 点环，落到**抽屉分段当前指向的槽**」——也就是说
 * 这两块必须共用同一个「当前指向」，否则环上点一下会落进说书人没看着的那个槽。
 *
 * 为什么做成 context 而不是把 state 提到 App 层：
 * 纯记录模式下 DayWorkbench 是独立全屏页，没有环，也就没有第二个读者。
 * 强行把它的两个 UI 态提到上面，等于让一个只在魔典模式下存在的耦合污染两条路径。
 * 所以这里给的是「有 Provider 就共享、没有就退回组件本地」——
 * 纯记录模式一行代码都不用改，行为逐像素不变。
 *
 * 这里存的两样东西都是**易失 UI 态**，绝不进 session：
 * 「现在指着提名人还是被提名人」「说书人手动回退到了哪一步」都不是对局事实。
 */
import { createContext, useContext, useMemo, useState } from 'react'
import type { DayStep } from './dayStep'

export type NominationTarget = 'nominator' | 'nominee'

export interface DayRingFocus {
  /** 提名分段当前指着哪个槽。环上与抽屉里点座位都落进这个槽。 */
  nominationTarget: NominationTarget
  setNominationTarget: (target: NominationTarget) => void
  /** 说书人手动回退到的那一步；null = 按进度推导。 */
  stepOverride: DayStep | null
  setStepOverride: (step: DayStep | null) => void
  /**
   * 白天这一屏唯一的写入闸门，由 DayWorkbench 算好后广播上来。
   *
   * 环必须读**同一个**闸门：处决确认条挂着的时候，抽屉里的座位网格是 disabled 的，
   * 而环如果还能点，说书人就能在读那句「确认处决5号？」的同时把票型改掉，
   * 于是他确认的那条暂列结果与他眼前的票型对不上。
   */
  writeLocked: boolean
  setWriteLocked: (locked: boolean) => void
}

/** Provider 单独成一个文件（DayRingFocusProvider.tsx），这里只放 context 与 hook。 */
export const DayRingFocusContext = createContext<DayRingFocus | null>(null)

export function useLocalDayRingFocus(): DayRingFocus {
  const [nominationTarget, setNominationTarget] = useState<NominationTarget>('nominator')
  const [stepOverride, setStepOverride] = useState<DayStep | null>(null)
  const [writeLocked, setWriteLocked] = useState(false)
  return useMemo(
    () => ({ nominationTarget, setNominationTarget, stepOverride, setStepOverride, writeLocked, setWriteLocked }),
    [nominationTarget, stepOverride, writeLocked],
  )
}

/**
 * 有 Provider 用共享的，没有用自己的。
 * 两条分支都无条件调用了同一组 hook，所以挂载后 Provider 的有无不会改变 hook 顺序——
 * 真的换了（切模式重挂）时组件本来就是新的一棵树。
 */
export function useDayRingFocus(): DayRingFocus {
  const shared = useContext(DayRingFocusContext)
  const local = useLocalDayRingFocus()
  return shared ?? local
}
