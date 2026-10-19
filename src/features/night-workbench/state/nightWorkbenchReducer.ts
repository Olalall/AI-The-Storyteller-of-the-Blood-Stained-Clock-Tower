import type { AIResultAdvice, NightWorkbenchState, RoleChangeReason, RoleSnapshot, WakeDraft, WakeItem } from '../types'
import { applyAIResultAdvice, createAIResultAdvice, isCurrentAIAdvice } from './aiResultAdvice'
import { applyDefaultOutcome, applyOutcome, emptyWakeDraft, invalidateOutcome, selectedTargetCount, targetCountChosen } from './projectWakeDraft'
import { advanceFrom, updatePreviewDraft } from './nightWorkbenchDrafts'
import { appendRoleChange } from './roleChanges'
import { canConfirmDraft, canEditItem } from './workbenchGuards'

export type NightWorkbenchAction =
  | { type: 'preview'; id: string }
  | { type: 'skip-item'; id: string; reason: string }
  | { type: 'return-current' }
  | { type: 'target'; seatId: number }
  | { type: 'target-role-choice'; index: number; seatId?: number; roleId?: string }
  | { type: 'target-count-choice'; count: number }
  | { type: 'role-choice'; roleId: string }
  | { type: 'second-role-choice'; roleId: string }
  | { type: 'additional-role-choice'; index: 0 | 1; roleId: string }
  | { type: 'storyteller-context'; value: string }
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
  | { type: 'use-ai-result' }
  | { type: 'apply-ai-advice'; advice: AIResultAdvice | null }
  | { type: 'change-role'; role: RoleSnapshot; reason: RoleChangeReason }
  | { type: 'clear-draft' }

function applyAIAdviceToState(
  state: NightWorkbenchState,
  item: WakeItem,
  draft: WakeDraft,
  advice: AIResultAdvice | null,
) {
  if (!advice) return { ...state, lastNotice: '当前角色暂无AI结算建议' }
  if (!isCurrentAIAdvice(state, item, draft, advice)) return { ...state, lastNotice: 'AI建议已失效' }
  if (advice.status === 'needs_input') {
    return {
      ...state,
      aiAdviceLog: { ...state.aiAdviceLog, [advice.id]: advice },
      lastNotice: `AI建议需要补充：${advice.missing.join('、') || '先完成本项选择'}`,
    }
  }
  const appliedDraft = applyAIResultAdvice(state, item, draft, advice)
  if (!appliedDraft) return { ...state, lastNotice: 'AI建议已失效' }
  const next = updatePreviewDraft(state, () => appliedDraft)
  if (next === state) return state
  return {
    ...next,
    aiAdviceLog: { ...state.aiAdviceLog, [advice.id]: advice },
    lastNotice: 'AI建议已填入草稿，等待确认本项',
  }
}

export function nightWorkbenchReducer(state: NightWorkbenchState, action: NightWorkbenchAction): NightWorkbenchState {
  switch (action.type) {
    case 'skip-item': {
      const item = state.queue.find((entry) => entry.id === action.id)
      if (!item || ['confirmed', 'not_applicable', 'skipped'].includes(item.progress) || state.correctionItemId || !action.reason.trim()) return state
      return { ...state, queue: state.queue.map((entry) => entry.id === item.id ? { ...entry, progress: 'skipped' as const, reason: action.reason.trim().slice(0, 200) } : entry), revision: state.revision + 1, lastNotice: '已记录本夜不处理的原因；草稿仍保留' }
    }
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
    case 'target-count-choice':
      return updatePreviewDraft(state, (draft, item) => {
        if (!canEditItem(state, item) || !item.allowedTargetCounts?.includes(action.count) || action.count === draft.targetCountChoice) return draft
        return invalidateOutcome(item, { ...draft, targetCountChoice: action.count, targets: action.count === 0 ? [] : draft.targets.slice(-action.count) })
      })
    case 'target-role-choice':
      return updatePreviewDraft(state, (draft, item) => {
        const count = item.targetRoleChoiceCount
        if (!count || !canEditItem(state, item) || !Number.isInteger(action.index) || action.index < 0 || action.index >= count) return draft
        if (action.seatId !== undefined && (!Number.isInteger(action.seatId) || action.seatId < 0 || action.seatId > state.playerCount)) return draft
        if (action.roleId !== undefined && action.roleId !== '' && !item.roleChoices?.some((role) => role.id === action.roleId)) return draft
        const targetRoleChoices = Array.from({ length: count }, (_, index) => ({ ...(draft.targetRoleChoices?.[index] ?? { seatId: 0, roleId: '' }) }))
        const current = targetRoleChoices[action.index]
        const selected = { seatId: action.seatId ?? current.seatId, roleId: action.roleId ?? current.roleId }
        if ((current.seatId === selected.seatId && current.roleId === selected.roleId) || targetRoleChoices.some((choice, index) => index !== action.index &&
          ((selected.seatId > 0 && choice.seatId === selected.seatId) || (selected.roleId && choice.roleId === selected.roleId)))) return draft
        targetRoleChoices[action.index] = selected
        return invalidateOutcome(item, {
          ...draft, targetRoleChoices, targets: targetRoleChoices.filter((choice) => choice.seatId > 0).map((choice) => choice.seatId),
          targetCountChoice: undefined, roleChoice: '', secondRoleChoice: undefined, additionalRoleChoices: undefined,
        })
      })
    case 'target':
      return updatePreviewDraft(state, (draft, item) => {
        if (item.targetRoleChoiceCount !== undefined) return draft
        if (item.abilityPhase === 'initial' && state.seatSnapshots[action.seatId]?.status.life !== 'alive') return draft
        const exists = draft.targets.includes(action.seatId)
        const without = draft.targets.filter((id) => id !== action.seatId)
        const count = selectedTargetCount(item, draft)
        if (!targetCountChosen(item, draft) || count === 0) return draft
        const targets = exists ? without : [...without, action.seatId].slice(-count)
        return applyDefaultOutcome(item, invalidateOutcome(item, { ...draft, targets }))
      })
    case 'role-choice':
      return updatePreviewDraft(state, (draft, item) => {
        if (item.targetRoleChoiceCount !== undefined) return draft
        const roleChoice = draft.roleChoice === action.roleId ? '' : action.roleId
        return applyDefaultOutcome(item, invalidateOutcome(item, { ...draft, roleChoice }))
      })
    case 'second-role-choice': {
      const item = state.queue.find((entry) => entry.id === state.previewEntryId)
      if (!item || (item.roleCount !== 2 && item.roleCount !== 4) || !canEditItem(state, item)) return state
      return updatePreviewDraft(state, (draft) => applyDefaultOutcome(item, invalidateOutcome(item, {
        ...draft, secondRoleChoice: draft.secondRoleChoice === action.roleId ? '' : action.roleId,
      })))
    }
    case 'additional-role-choice': {
      const item = state.queue.find((entry) => entry.id === state.previewEntryId)
      if (!item || item.roleCount !== 4 || !canEditItem(state, item) || !item.roleChoices?.some((role) => role.id === action.roleId)) return state
      return updatePreviewDraft(state, (draft) => {
        const choices = [...(draft.additionalRoleChoices ?? ['', ''])]
        choices[action.index] = choices[action.index] === action.roleId ? '' : action.roleId
        return invalidateOutcome(item, { ...draft, additionalRoleChoices: choices })
      })
    }
    case 'storyteller-context': {
      const item = state.queue.find((entry) => entry.id === state.previewEntryId)
      if (!item || !canEditItem(state, item)) return state
      return updatePreviewDraft(state, (draft) => {
        const value = action.value.trim().slice(0, 1000)
        if (value === (draft.storytellerContext ?? '')) return draft
        return invalidateOutcome(item, { ...draft, storytellerContext: value || undefined })
      })
    }
    case 'outcome':
      return updatePreviewDraft(state, (draft, item) => {
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
        confirmedAt: new Date().toISOString(),
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
        item.id === state.activeCursorId && ['deferred', 'skipped'].includes(item.progress)
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
      if (state.previewEntryId !== state.activeCursorId) return state
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
    case 'use-ai-result': {
      const item = state.queue.find((entry) => entry.id === state.previewEntryId)
      if (!item || !canEditItem(state, item)) return state
      const draft = state.drafts[item.id] ?? emptyWakeDraft()
      const advice = createAIResultAdvice(state, item, draft)
      return applyAIAdviceToState(state, item, draft, advice)
    }
    case 'apply-ai-advice': {
      const item = state.queue.find((entry) => entry.id === state.previewEntryId)
      if (!item || !canEditItem(state, item)) return state
      const draft = state.drafts[item.id] ?? emptyWakeDraft()
      return applyAIAdviceToState(state, item, draft, action.advice)
    }
    case 'change-role': {
      if (state.previewEntryId !== state.activeCursorId || state.correctionItemId) return state
      const item = state.queue.find((entry) => entry.id === state.activeCursorId)
      const draft = state.drafts[state.activeCursorId]
      if (!item || (draft?.updatedAt && item.progress !== 'confirmed')) {
        return { ...state, lastNotice: '请先完成或清空当前草稿，再更换角色' }
      }
      return appendRoleChange(state, item, action.role, action.reason)
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


