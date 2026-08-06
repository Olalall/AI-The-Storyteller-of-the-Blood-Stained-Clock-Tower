/**
 * 模式切换的唯一实现，两个入口共用（core 顶行的本局信息浮层 / 档案页的主持设置）。
 *
 * 它把「选哪个模式」和「降级要先过交接卡」焊在一起。分开写的话，两个入口里
 * 迟早有一个只 dispatch 不弹卡——而那一次正好是说书人以为工具还在替他记的那一次。
 */
import { useState } from 'react'
import { DowngradeHandoffCard } from '../mode/DowngradeHandoffCard'
import { HostingModeCard } from '../mode/HostingModeCard'
import { projectDowngradeSummary } from '../mode/downgradeSummary'
import { hostingPhaseLabel, needsDowngradeHandoff } from './hostingModeSwitch'
import type { GameSessionAction } from '../../game-session/state/sessionActions'
import type { GameSessionState, HostingMode } from '../../game-session/types'

interface HostingModeSectionProps {
  session: GameSessionState
  dispatch: (action: GameSessionAction) => void
  /** 逻辑宽度不足以画环时补一句说明，透传给引导卡。 */
  narrow?: boolean
  /** 切换落账后的回调，例如把浮层关掉。留在魔典模式时不触发。 */
  onSwitched?: (mode: HostingMode) => void
}

export function HostingModeSection({ session, dispatch, narrow = false, onSwitched }: HostingModeSectionProps) {
  const [pendingDowngrade, setPendingDowngrade] = useState(false)

  function commit(mode: HostingMode) {
    dispatch({
      type: 'set-hosting-mode',
      mode,
      changedAt: new Date().toISOString(),
      phaseLabel: hostingPhaseLabel(session),
    })
    setPendingDowngrade(false)
    onSwitched?.(mode)
  }

  function select(mode: HostingMode) {
    if (mode === session.hostingMode) return
    if (needsDowngradeHandoff(session.hostingMode, mode)) {
      setPendingDowngrade(true)
      return
    }
    commit(mode)
  }

  if (pendingDowngrade) {
    return (
      <DowngradeHandoffCard
        summary={projectDowngradeSummary(session)}
        onStay={() => setPendingDowngrade(false)}
        onConfirm={() => commit('record')}
      />
    )
  }

  return <HostingModeCard value={session.hostingMode} onSelect={select} narrow={narrow} />
}
