import type {
  NightWorkbenchState,
  RoleChangeEvent,
  RoleChangeReason,
  RoleSnapshot,
  WakeItem,
} from '../types'

export function roleSnapshotFromWakeItem(item: WakeItem): RoleSnapshot {
  return {
    id: item.roleId,
    name: item.roleName,
    initial: item.roleInitial,
    iconPath: item.iconPath,
  }
}

export function latestRoleChange(events: RoleChangeEvent[], seatId: number) {
  return events.filter((event) => event.seatId === seatId).at(-1)
}

export function currentRoleForItem(item: WakeItem, events: RoleChangeEvent[]) {
  // 系统步骤卡挂在爪牙/恶魔座位上只是为了有个锚点；它不是那名玩家的角色，
  // 换角事件不能把「爪牙信息」改名成新角色。
  if (item.systemStep) return roleSnapshotFromWakeItem(item)
  return latestRoleChange(events, item.seatId)?.toRole ?? roleSnapshotFromWakeItem(item)
}

export function appendRoleChange(
  state: NightWorkbenchState,
  item: WakeItem,
  toRole: RoleSnapshot,
  reason: RoleChangeReason,
): NightWorkbenchState {
  const fromRole = currentRoleForItem(item, state.roleChangeEvents)
  if (fromRole.id === toRole.id) return { ...state, lastNotice: '新角色与当前角色相同，未做更改' }

  const revision = state.roleChangeEvents.filter((event) => event.seatId === item.seatId).length + 1
  const event: RoleChangeEvent = {
    id: `${state.nightRunId}-seat-${item.seatId}-role-${revision}`,
    seatId: item.seatId,
    revision,
    changedAt: new Date().toISOString(),
    nightRunId: state.nightRunId,
    originNightRunId: state.nightRunId,
    phaseLabel: state.nightLabel,
    fromRole,
    toRole: structuredClone(toRole),
    reason,
    confirmedBy: 'storyteller',
  }

  return {
    ...state,
    revision: state.revision + 1,
    roleChangeEvents: [...state.roleChangeEvents, event],
    lastNotice: `${item.seatId}号角色已改为${toRole.name}；本夜队列未自动调整`,
  }
}

export const roleChangeReasonLabel: Record<RoleChangeReason, string> = {
  gameplay: '对局内变更',
  entry_correction: '纠正录入',
  other: '其他',
}
