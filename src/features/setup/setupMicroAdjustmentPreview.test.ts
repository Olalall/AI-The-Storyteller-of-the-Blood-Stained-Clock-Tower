import { describe, expect, it } from 'vitest'
import { previewDraftMicroAdjustment } from './setupMicroAdjustmentPreview'
import type { SetupDraft } from '../game-session/types'
import type { RoleSnapshot } from '../night-workbench/types'

const roles: RoleSnapshot[] = [
  { id: 'investigator', name: '调查员', initial: '调', iconPath: '' },
  { id: 'chef', name: '厨师', initial: '厨', iconPath: '' },
  { id: 'empath', name: '共情者', initial: '共', iconPath: '' },
]

function draft(): SetupDraft {
  return {
    candidateId: 'setup-a',
    revision: 1,
    assignments: [
      { seatId: 1, role: roles[0] },
      { seatId: 2, role: roles[2] },
    ],
    demonBluffs: [],
    repeatableRoleIds: [],
    setupRuleSelections: [],
    updatedAt: 'old',
  }
}

describe('previewDraftMicroAdjustment', () => {
  it('returns a revised setup draft without mutating the original draft', () => {
    const before = draft()
    const result = previewDraftMicroAdjustment(before, {
      candidateId: 'setup-a',
      replaceOutRoleId: 'investigator',
      replaceInRoleId: 'chef',
      reason: '降低信息强度',
      expectedEffect: '更平滑',
      risk: '重核人数',
    }, roles, 'now')

    expect(result?.draft.assignments[0].role).toMatchObject({ id: 'chef', name: '厨师' })
    expect(result?.draft.revision).toBe(2)
    expect(result?.summary).toContain('确认前不生效')
    expect(before.assignments[0].role.id).toBe('investigator')
  })

  it('rejects suggestions outside the candidate draft or role pool', () => {
    expect(previewDraftMicroAdjustment(draft(), {
      candidateId: 'other',
      replaceOutRoleId: 'investigator',
      replaceInRoleId: 'chef',
      reason: '',
      expectedEffect: '',
      risk: '',
    }, roles, 'now')).toBeNull()
    expect(previewDraftMicroAdjustment(draft(), {
      candidateId: 'setup-a',
      replaceOutRoleId: 'investigator',
      replaceInRoleId: 'missing',
      reason: '',
      expectedEffect: '',
      risk: '',
    }, roles, 'now')).toBeNull()
  })
})
