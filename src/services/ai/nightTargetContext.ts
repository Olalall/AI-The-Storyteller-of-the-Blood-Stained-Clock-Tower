import type { NightWorkbenchState, WakeDraft, WakeItem } from '../../features/night-workbench/types'

export interface NightSelectedTargetContext {
  seatId: number
  playerLabel: string
  roleId: string
  roleName: string
  status: {
    life: string
    impairments: string[]
    markers: string[]
  }
}

function latestRoleChange(state: NightWorkbenchState, seatId: number) {
  return state.roleChangeEvents.filter((event) => event.seatId === seatId).at(-1)
}

function targetFromWakeItem(entry: WakeItem): NightSelectedTargetContext {
  return {
    seatId: entry.seatId,
    playerLabel: entry.playerLabel,
    roleId: entry.roleId,
    roleName: entry.roleName,
    status: {
      life: entry.status.life,
      impairments: [...entry.status.impairments],
      markers: entry.status.markers.map((marker) => marker.label),
    },
  }
}

export function selectedNightTargetsForAI(
  state: NightWorkbenchState,
  draft: WakeDraft,
): NightSelectedTargetContext[] {
  const queueBySeatId = new Map(state.queue.map((entry) => [entry.seatId, entry]))
  return draft.targets
    .map((seatId) => {
      const snapshot = state.seatSnapshots[seatId]
      if (!snapshot) {
        const queueItem = queueBySeatId.get(seatId)
        return queueItem ? targetFromWakeItem(queueItem) : null
      }
      const role = latestRoleChange(state, seatId)?.toRole ?? snapshot.role
      if (!role) return null
      return {
        seatId,
        playerLabel: snapshot.playerLabel,
        roleId: role.id,
        roleName: role.name,
        status: {
          life: snapshot.status.life,
          impairments: [...snapshot.status.impairments],
          markers: snapshot.status.markers.map((marker) => marker.label),
        },
      }
    })
    .filter((entry): entry is NightSelectedTargetContext => Boolean(entry))
}

function impairmentLabel(value: string) {
  if (value === 'poisoned') return '中毒'
  if (value === 'drunk') return '醉酒'
  return value
}

function lifeLabel(value: string) {
  if (value === 'alive') return '存活'
  if (value === 'dead') return '死亡'
  return value
}

function statusText(status: { life: string; impairments: readonly string[]; markers: readonly string[] }) {
  return [
    lifeLabel(status.life),
    ...status.impairments.map(impairmentLabel),
    ...status.markers,
  ].filter(Boolean).join(' / ')
}

export function nightStatusFactsForAI(
  item: WakeItem,
  selectedTargets: readonly NightSelectedTargetContext[],
): string[] {
  return [
    `发动者：${item.seatId}号${item.roleName}，状态：${statusText({
      life: item.status.life,
      impairments: item.status.impairments,
      markers: item.status.markers.map((marker) => marker.label),
    })}`,
    ...selectedTargets.map((target) =>
      `目标：${target.seatId}号${target.roleName}，状态：${statusText(target.status)}`),
  ]
}
