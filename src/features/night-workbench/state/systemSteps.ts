import type { SystemStepSpec, WakeDraft, WakeItem } from '../types'

/**
 * 首夜「爪牙信息 / 恶魔信息」的判定与文案。
 * 这两张卡没有单一行动者：座位名单只是只读文案，指认动作只留勾选痕迹。
 */
export function isSystemStep(item: WakeItem): boolean {
  return Boolean(item.systemStep)
}

/** 底栏与轮播里的短标签。系统步骤没有可称呼的座位号，改用步骤名。 */
export function wakeShortLabel(item: WakeItem, concealed = false): string {
  if (item.systemStep) return concealed && item.systemStep.sensitive ? '系统步骤' : item.roleName
  return `${item.seatId}号`
}

export function systemStepChecks(draft: WakeDraft): string[] {
  return draft.systemChecks ?? []
}

export function systemStepBluffs(draft: WakeDraft): string[] {
  return draft.bluffRoleIds ?? []
}

/** 已选伪装的角色名，按点击顺序；未选到位时返回空串。 */
export function bluffLabels(step: SystemStepSpec, draft: WakeDraft): string {
  const choices = step.bluffChoices ?? []
  return systemStepBluffs(draft)
    .map((roleId) => choices.find((choice) => choice.id === roleId)?.label ?? '')
    .filter(Boolean)
    .join('、')
}

/** 还差什么才能记录本步骤；空串表示可以选结果了。 */
export function systemStepMissingReason(item: WakeItem, draft: WakeDraft): string {
  const step = item.systemStep
  if (!step) return ''
  const checked = systemStepChecks(draft)
  const pending = step.checks.find((check) => !checked.includes(check.id))
  if (pending) return `勾选「${pending.label}」`
  const bluffCount = step.bluffCount ?? 0
  if (bluffCount && systemStepBluffs(draft).length !== bluffCount) {
    return `选${bluffCount}个不在场善良角色`
  }
  return ''
}
