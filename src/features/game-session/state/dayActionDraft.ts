import type { DayActionDraft, DayActionSkillDraft } from '../types'

export function createDayActionSkillDraft(): DayActionSkillDraft {
  return {
    actorSeatId: null,
    actorActualRoleId: '',
    abilityRoleId: '',
    claimedRoleId: '',
    targetSeatIds: [],
    targetActualRoleIds: {},
    targetAlignments: {},
    outcomeKind: null,
    outcomeNote: '',
  }
}

export function createDayActionDraft(): DayActionDraft {
  return {
    category: 'skill',
    skill: createDayActionSkillDraft(),
    publicEvent: {
      targetSeatIds: [],
      note: '',
    },
  }
}

export function cloneDayActionDraft(draft: DayActionDraft): DayActionDraft {
  return {
    ...draft,
    skill: {
      ...draft.skill,
      targetSeatIds: [...draft.skill.targetSeatIds],
      targetActualRoleIds: { ...draft.skill.targetActualRoleIds },
      targetAlignments: { ...(draft.skill.targetAlignments ?? {}) },
    },
    publicEvent: {
      ...draft.publicEvent,
      targetSeatIds: [...draft.publicEvent.targetSeatIds],
    },
  }
}

/** 确认一类白天记录时，只移除已确认的那一类输入，避免切换标签后的另一类草稿被静默丢弃。 */
export function clearRecordedDayActionDraft(
  draft: DayActionDraft | null,
  category: DayActionDraft['category'],
): DayActionDraft | null {
  if (!draft) return null
  const next = cloneDayActionDraft(draft)
  if (category === 'skill') next.skill = createDayActionSkillDraft()
  else next.publicEvent = { targetSeatIds: [], note: '' }

  const remainingKinds = dayActionDraftContentKinds(next)
  return remainingKinds.length ? { ...next, category: remainingKinds[0] } : null
}

/** 只有实际填写过的输入才会阻止返回工作台。 */
export function dayActionDraftContentKinds(draft: DayActionDraft | null | undefined) {
  if (!draft) return [] as const
  const { skill, publicEvent } = draft
  const hasSkill = skill.actorSeatId !== null ||
    Boolean(skill.actorActualRoleId) ||
    Boolean(skill.abilityRoleId) ||
    Boolean(skill.claimedRoleId) ||
    skill.targetSeatIds.length > 0 ||
    Object.keys(skill.targetActualRoleIds).length > 0 ||
    Object.keys(skill.targetAlignments ?? {}).length > 0 ||
    skill.outcomeKind !== null ||
    Boolean(skill.outcomeNote.trim())
  const hasPublicEvent = publicEvent.targetSeatIds.length > 0 || Boolean(publicEvent.note.trim())
  return [
    ...(hasSkill ? ['skill' as const] : []),
    ...(hasPublicEvent ? ['public_event' as const] : []),
  ]
}

/** 只有实际填写过的输入才会阻止返回工作台。 */
export function hasDayActionDraftContent(draft: DayActionDraft | null | undefined) {
  return dayActionDraftContentKinds(draft).length > 0
}
