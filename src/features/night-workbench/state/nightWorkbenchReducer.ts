import type { AIResultAdvice, NightWorkbenchState, RoleChangeReason, RoleSnapshot, WakeDraft, WakeItem } from '../types'
import { applyAIResultAdvice } from './aiResultAdvice'
import { applyDefaultOutcome, applyOutcome, emptyWakeDraft, invalidateOutcome } from './projectWakeDraft'
import { advanceFrom, updatePreviewDraft } from './nightWorkbenchDrafts'
import { appendRoleChange } from './roleChanges'
import { canConfirmDraft, canEditItem } from './workbenchGuards'

/**
 * 组件只描述「做什么」，不带时间。
 *
 * 时间戳从 reducer 里搬出去是为了让 reducer 重新变回纯函数：原先 confirm / 草稿更新 / 换角
 * 三处直接调 `new Date()`，同一组 (state, action) 每次跑出来的结果都不一样，
 * 归档没法忠实回放，而不变量单测又恰好建立在「reducer 是纯函数」这个前提上。
 */
export type NightWorkbenchIntent =
  | { type: 'preview'; id: string }
  | { type: 'return-current' }
  | { type: 'target'; seatId: number }
  | { type: 'role-choice'; roleId: string }
  | { type: 'registration-choice'; value: string }
  | { type: 'system-check'; checkId: string }
  | { type: 'system-bluff'; roleId: string }
  | { type: 'outcome'; outcomeId: string }
  | { type: 'confirm'; advance: boolean }
  | { type: 'defer' }
  | { type: 'advance' }
  | { type: 'activate-preview' }
  | { type: 'resume' }
  | { type: 'begin-correction' }
  | { type: 'cancel-correction' }
  | { type: 'resolve-applicability'; value: 'applicable' | 'not_applicable' }
  | { type: 'toggle-privacy' }
  | { type: 'set-privacy'; shielded: boolean }
  | { type: 'toggle-dim' }
  | { type: 'apply-ai-advice'; advice: AIResultAdvice | null }
  | { type: 'change-role'; role: RoleSnapshot; reason: RoleChangeReason }
  | { type: 'clear-draft' }

/**
 * reducer 的输入：意图 + 调用方生成的时间戳。
 *
 * `at` 挂在所有 action 上而不是只挂需要写时间的那几条，是刻意的：只要有一条 action 不带 `at`，
 * 下一个在它里面加时间字段的人就会顺手写 `new Date()`，纯函数保证在那一刻悄悄失效。
 * 回放时把归档里记下来的 `at` 原样传回来，就能得到与当初逐字节相同的结果。
 */
export type NightWorkbenchAction = NightWorkbenchIntent & { at: string }

function applyAIAdviceToState(
  state: NightWorkbenchState,
  item: WakeItem,
  draft: WakeDraft,
  advice: AIResultAdvice | null,
  at: string,
) {
  if (!advice) return { ...state, lastNotice: '当前角色暂无AI结算建议' }
  if (advice.status === 'needs_input') {
    return {
      ...state,
      aiAdviceLog: { ...state.aiAdviceLog, [advice.id]: advice },
      lastNotice: `AI建议需要补充：${advice.missing.join('、') || '先完成本项选择'}`,
    }
  }
  const appliedDraft = applyAIResultAdvice(state, item, draft, advice)
  if (!appliedDraft) return { ...state, lastNotice: 'AI建议已失效' }
  const next = updatePreviewDraft(state, at, () => appliedDraft)
  if (next === state) return state
  return {
    ...next,
    aiAdviceLog: { ...state.aiAdviceLog, [advice.id]: advice },
    lastNotice: 'AI建议已填入草稿，等待确认本项',
  }
}

export function nightWorkbenchReducer(state: NightWorkbenchState, action: NightWorkbenchAction): NightWorkbenchState {
  switch (action.type) {
    case 'preview':
      return { ...state, previewEntryId: action.id, lastNotice: '' }
    case 'return-current': {
      const active = state.queue.find((item) => item.id === state.activeCursorId)
      return {
        ...state,
        previewEntryId: state.activeCursorId,
        lastNotice: active ? `已回到${active.playerLabel}` : '已回到正在处理的角色',
      }
    }
    case 'target': {
      if (!Number.isInteger(action.seatId) || action.seatId < 1 || action.seatId > state.playerCount) return state
      const item = state.queue.find((item) => item.id === state.previewEntryId)
      if (!item || !canEditItem(state, item) || item.targetCount <= 0) return state
      if (item.forbiddenTargetSeatIds?.includes(action.seatId)
        && !state.drafts[state.previewEntryId]?.targets.includes(action.seatId)) {
        return { ...state, lastNotice: `${action.seatId}号是上一夜目标，本夜不能重复选择` }
      }
      return updatePreviewDraft(state, action.at, (draft, item) => {
        const exists = draft.targets.includes(action.seatId)
        const without = draft.targets.filter((id) => id !== action.seatId)
        const targets = exists ? without : [...without, action.seatId].slice(-item.targetCount)
        return applyDefaultOutcome(item, invalidateOutcome(item, { ...draft, targets, registration: undefined }))
      })
    }
    case 'role-choice':
      return updatePreviewDraft(state, action.at, (draft, item) => {
        const roleChoice = draft.roleChoice === action.roleId ? '' : action.roleId
        return applyDefaultOutcome(item, invalidateOutcome(item, { ...draft, roleChoice }))
      })
    case 'registration-choice':
      if (state.queue.find((item) => item.id === state.previewEntryId)?.forbiddenRegistrationValues?.includes(action.value as NonNullable<WakeDraft['registration']>['value'])
        && state.drafts[state.previewEntryId]?.registration?.value !== action.value) {
        return { ...state, lastNotice: '本夜登记不能与上一夜展示类型相同；如因醉酒或中毒需要例外，请改为人工记录。' }
      }
      return updatePreviewDraft(state, action.at, (draft, item) => {
        const spec = item.registrationSpec
        const seatId = draft.targets[0]
        const choice = spec?.choices.find((candidate) => candidate.id === action.value)
        if (!spec || !seatId || !choice) return draft
        const registration = draft.registration?.value === choice.id
          ? undefined
          : { kind: spec.kind, seatId, value: choice.id as NonNullable<WakeDraft['registration']>['value'] }
        return applyDefaultOutcome(item, invalidateOutcome(item, { ...draft, registration }))
      })
    case 'system-check':
      return updatePreviewDraft(state, action.at, (draft, item) => {
        if (!item.systemStep?.checks.some((check) => check.id === action.checkId)) return draft
        const checked = draft.systemChecks ?? []
        const systemChecks = checked.includes(action.checkId)
          ? checked.filter((id) => id !== action.checkId)
          : [...checked, action.checkId]
        return invalidateOutcome(item, { ...draft, systemChecks })
      })
    case 'system-bluff':
      return updatePreviewDraft(state, action.at, (draft, item) => {
        const bluffCount = item.systemStep?.bluffCount ?? 0
        if (!bluffCount || !item.systemStep?.bluffChoices?.some((choice) => choice.id === action.roleId)) return draft
        const selected = draft.bluffRoleIds ?? []
        const bluffRoleIds = selected.includes(action.roleId)
          ? selected.filter((id) => id !== action.roleId)
          : [...selected, action.roleId].slice(-bluffCount)
        return invalidateOutcome(item, { ...draft, bluffRoleIds })
      })
    case 'outcome':
      return updatePreviewDraft(state, action.at, (draft, item) => {
        if (!action.outcomeId || draft.outcomeId === action.outcomeId) {
          return {
            ...draft,
            outcomeId: '',
            storytellerResult: '',
            informationGiven: '',
            outputSource: undefined,
          }
        }
        return applyOutcome(item, draft, action.outcomeId)
      })
    case 'confirm': {
      if (state.previewEntryId !== state.activeCursorId) return state
      const draft = state.drafts[state.activeCursorId] ?? emptyWakeDraft()
      const item = state.queue.find((entry) => entry.id === state.activeCursorId)
      if (!item || !canConfirmDraft(state, item, draft)) return { ...state, lastNotice: '当前草稿不能确认' }
      const priorRecords = state.confirmedRecords[state.activeCursorId] ?? []
      const previous = priorRecords.at(-1)
      const recordRevision = (previous?.revision ?? 0) + 1
      const record = {
        id: `${state.activeCursorId}-record-${recordRevision}`,
        wakeItemId: state.activeCursorId,
        revision: recordRevision,
        confirmedAt: action.at,
        correctionOf: state.correctionItemId ? previous?.id : undefined,
        snapshot: structuredClone(draft),
      }
      const queue = state.queue.map((item) =>
        item.id === state.activeCursorId ? { ...item, progress: 'confirmed' as const } : item,
      )
      const confirmedState = {
        ...state,
        queue,
        revision: state.revision + 1,
        confirmedRecords: { ...state.confirmedRecords, [state.activeCursorId]: [...priorRecords, record] },
        correctionItemId: null,
        lastNotice: previous ? '更正记录已追加，原记录仍然保留' : '记录已确认，夜间光标未移动',
      }
      return action.advance ? advanceFrom(confirmedState) : confirmedState
    }
    case 'defer': {
      if (state.previewEntryId !== state.activeCursorId) return state
      const queue = state.queue.map((item) =>
        item.id === state.activeCursorId
          ? { ...item, progress: 'deferred' as const, reason: item.reason ?? '说书人选择稍后处理' }
          : item,
      )
      return { ...state, queue, revision: state.revision + 1, lastNotice: '已暂缓本项，夜间光标未移动' }
    }
    case 'advance':
      return advanceFrom(state)
    case 'activate-preview': {
      const preview = state.queue.find((item) => item.id === state.previewEntryId)
      if (!preview) return state
      return {
        ...state,
        activeCursorId: preview.id,
        correctionItemId: null,
        lastNotice: `处理位置已切换到${preview.playerLabel}`,
      }
    }
    case 'resume': {
      const queue = state.queue.map((item) =>
        item.id === state.activeCursorId && item.progress === 'deferred'
          ? { ...item, progress: state.drafts[item.id] ? 'draft' as const : 'pending' as const }
          : item,
      )
      return { ...state, queue, lastNotice: '已恢复处理本项' }
    }
    case 'begin-correction': {
      const latest = state.confirmedRecords[state.activeCursorId]?.at(-1)
      if (!latest) return { ...state, lastNotice: '缺少原确认快照，不能开始更正' }
      return {
        ...state,
        correctionItemId: state.activeCursorId,
        drafts: { ...state.drafts, [state.activeCursorId]: structuredClone(latest.snapshot) },
        lastNotice: '正在追加更正；原确认记录不会被覆盖',
      }
    }
    case 'cancel-correction': {
      if (state.previewEntryId !== state.activeCursorId || state.correctionItemId !== state.activeCursorId) return state
      const latest = state.confirmedRecords[state.activeCursorId]?.at(-1)
      if (!latest) return { ...state, lastNotice: '缺少原确认快照，不能放弃更正' }
      return {
        ...state,
        correctionItemId: null,
        drafts: { ...state.drafts, [state.activeCursorId]: structuredClone(latest.snapshot) },
        lastNotice: '已放弃本次更正，原记录未变化',
      }
    }
    case 'resolve-applicability': {
      const queue = state.queue.map((item) =>
        item.id === state.activeCursorId
          ? {
              ...item,
              applicability: action.value,
              progress: action.value === 'not_applicable' ? 'not_applicable' as const : item.progress,
              reason: action.value === 'not_applicable' ? '说书人确认本夜不适用' : item.reason,
            }
          : item,
      )
      return { ...state, queue, revision: state.revision + 1, lastNotice: action.value === 'applicable' ? '已确认本夜适用' : '已标记本夜不适用' }
    }
    case 'toggle-privacy':
      return { ...state, privacyShielded: !state.privacyShielded }
    case 'set-privacy':
      return state.privacyShielded === action.shielded ? state : { ...state, privacyShielded: action.shielded }
    case 'toggle-dim':
      return { ...state, dimmed: !state.dimmed }
    case 'apply-ai-advice': {
      const item = state.queue.find((entry) => entry.id === state.previewEntryId)
      if (!item || !canEditItem(state, item)) return state
      const draft = state.drafts[item.id] ?? emptyWakeDraft()
      return applyAIAdviceToState(state, item, draft, action.advice, action.at)
    }
    case 'change-role': {
      if (state.previewEntryId !== state.activeCursorId || state.correctionItemId) return state
      const item = state.queue.find((entry) => entry.id === state.activeCursorId)
      const draft = state.drafts[state.activeCursorId]
      if (item?.systemStep) return { ...state, lastNotice: '系统步骤没有角色可换' }
      if (!item || (draft?.updatedAt && item.progress !== 'confirmed')) {
        return { ...state, lastNotice: '请先完成或清空当前草稿，再更换角色' }
      }
      return appendRoleChange(state, item, action.role, action.reason, action.at)
    }
    case 'clear-draft': {
      if (state.previewEntryId !== state.activeCursorId || state.correctionItemId) return state
      const item = state.queue.find((entry) => entry.id === state.activeCursorId)
      const draft = state.drafts[state.activeCursorId]
      if (!item || !draft?.updatedAt || ['confirmed', 'deferred', 'not_applicable'].includes(item.progress)) return state
      const drafts = { ...state.drafts }
      delete drafts[item.id]
      const queue = state.queue.map((entry) => entry.id === item.id ? { ...entry, progress: 'pending' as const } : entry)
      return { ...state, queue, drafts, revision: state.revision + 1, lastNotice: '未完成草稿已清空' }
    }
  }
}


