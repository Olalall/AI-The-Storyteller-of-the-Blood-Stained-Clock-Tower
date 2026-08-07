import type { RoleSnapshot } from '../night-workbench/types'
import type { DaySkillContext, DaySkillOutcomeKind } from './types'

export const daySkillOutcomeLabels: Record<DaySkillOutcomeKind, string> = {
  no_effect: '无事发生',
  applied: '技能生效',
  custom: '其他结果',
}

export function cloneRoleSnapshot(role: RoleSnapshot | null | undefined) {
  return role ? { ...role } : null
}

export function outcomeLabel(context: DaySkillContext | undefined) {
  if (!context) return '结果未记录'
  if (context.outcome.kind === 'custom') return context.outcome.note?.trim() || daySkillOutcomeLabels.custom
  return daySkillOutcomeLabels[context.outcome.kind]
}

export function participantLabel(seatId: number, role: RoleSnapshot | null | undefined) {
  return `${seatId}号（${role?.name ?? '当时身份未记录'}）`
}

function registrationLabel(context: DaySkillContext['targets'][number]) {
  if (context.registration?.kind !== 'alignment') return ''
  return `，选择时${context.registration.value === 'good' ? '善良' : '邪恶'}`
}

export function formatDaySkillSummary(context: DaySkillContext | undefined, fallbackActorSeatId: number | null, fallbackTargetSeatIds: readonly number[]) {
  if (!context?.actor || !context.abilityRole) {
    return `${fallbackActorSeatId ?? '未选'}号发动白天技能${fallbackTargetSeatIds.length ? ` → ${fallbackTargetSeatIds.join('、')}号` : ''}`
  }

  const actor = participantLabel(context.actor.seatId, context.actor.actualRole)
  const claim = context.claimedRole ? `称${context.claimedRole.name}` : ''
  const targets = context.targets.length
    ? context.targets.map((target) => `${participantLabel(target.seatId, target.actualRole)}${registrationLabel(target)}`).join('、')
    : '无目标'
  return `${context.abilityRole.name} · ${actor}${claim} → ${targets} · ${outcomeLabel(context)}`
}

export function formatDaySkillDetails(context: DaySkillContext | undefined, fallbackActorSeatId: number | null, fallbackTargetSeatIds: readonly number[]) {
  if (!context) {
    return [
      fallbackActorSeatId ? `发动者：${fallbackActorSeatId}号` : '',
      fallbackTargetSeatIds.length ? `目标：${fallbackTargetSeatIds.join('、')}号` : '',
      '当时身份与结果未记录（旧记录）',
    ].filter(Boolean)
  }

  return [
    context.abilityRole ? `按此技能结算：${context.abilityRole.name}` : '按此技能结算：未记录',
    context.actor ? `发动者（实际）：${participantLabel(context.actor.seatId, context.actor.actualRole)}` : '发动者（实际）：未记录',
    context.claimedRole ? `公开声称：${context.claimedRole.name}` : '',
    context.targets.length ? `目标（实际）：${context.targets.map((target) => participantLabel(target.seatId, target.actualRole)).join('、')}` : '目标（实际）：无目标',
    context.targets.some((target) => target.registration?.kind === 'alignment')
      ? `选择时阵营：${context.targets.map((target) => `${target.seatId}号${target.registration?.value === 'good' ? '善良' : '邪恶'}`).join('、')}`
      : '',
    `结果：${outcomeLabel(context)}`,
  ].filter(Boolean)
}
