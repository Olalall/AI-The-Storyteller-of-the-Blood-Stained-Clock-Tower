import { describe, expect, it } from 'vitest'
import type { WakeDraft, WakeItem } from '../types'
import { emptyWakeDraft, hasWakeDraftContent, outcomeReady, wakeInputsSatisfied } from './projectWakeDraft'

/** 气球驾驶员那一类：需要目标，但「未受影响」这个结果选项自身不声明任何 requiredInputs。 */
function itemNeedingTarget(): WakeItem {
  return {
    id: 'wake-1',
    orderIndex: 1,
    seatId: 4,
    playerLabel: '4号玩家',
    roleId: 'balloonist',
    roleName: '气球驾驶员',
    roleInitial: '气',
    ability: '每夜得知一名与上一晚不同角色类型的玩家。',
    storytellerPrompt: '记录本夜给出的玩家。',
    iconPath: '/assets/characters/balloonist.webp',
    progress: 'pending',
    applicability: 'applicable',
    status: { life: 'alive', impairments: [], markers: [] },
    targetCount: 1,
    targetLabel: '玩家',
    interactionVersion: 'test',
    outcomeOptions: [
      { id: 'info', label: '信息已给', requiredInputs: ['targets'], resultTemplate: '{actor}本夜得知{target}。' },
      { id: 'no-effect', label: '未受影响', requiredInputs: [], resultTemplate: '{actor}本夜能力未影响目标。' },
    ],
  } as WakeItem
}

function draftWith(patch: Partial<WakeDraft>): WakeDraft {
  return { ...emptyWakeDraft(), ...patch }
}

describe('唤醒项的输入门', () => {
  it('blocks every outcome while the item still needs a target', () => {
    const item = itemNeedingTarget()
    const empty = emptyWakeDraft()

    expect(wakeInputsSatisfied(item, empty)).toBe(false)
    // 「未受影响」不声明 requiredInputs，此前在零目标时可点，一按就写下一条没有对象的假记录。
    for (const option of item.outcomeOptions) {
      expect(outcomeReady(option, item, empty), option.label).toBe(false)
    }
  })

  it('opens the outcomes once the target is chosen', () => {
    const item = itemNeedingTarget()
    const withTarget = draftWith({ targets: [7] })

    expect(wakeInputsSatisfied(item, withTarget)).toBe(true)
    for (const option of item.outcomeOptions) {
      expect(outcomeReady(option, item, withTarget), option.label).toBe(true)
    }
  })

  it('rejects duplicate, overflowing and forbidden targets', () => {
    const item = { ...itemNeedingTarget(), targetCount: 2, minimumTargetCount: 1, forbiddenTargetSeatIds: [6] } as WakeItem

    expect(wakeInputsSatisfied(item, draftWith({ targets: [4, 4] }))).toBe(false)
    expect(wakeInputsSatisfied(item, draftWith({ targets: [4, 5, 7] }))).toBe(false)
    expect(wakeInputsSatisfied(item, draftWith({ targets: [6] }))).toBe(false)
    expect(wakeInputsSatisfied(item, draftWith({ targets: [4] }))).toBe(true)
  })

  it('allows required target outcomes across an explicit target range', () => {
    const item = { ...itemNeedingTarget(), targetCount: 3, minimumTargetCount: 1 } as WakeItem
    const option = item.outcomeOptions[0]

    expect(outcomeReady(option, item, draftWith({ targets: [] }))).toBe(false)
    expect(outcomeReady(option, item, draftWith({ targets: [4] }))).toBe(true)
    expect(outcomeReady(option, item, draftWith({ targets: [4, 5] }))).toBe(true)
    expect(outcomeReady(option, item, draftWith({ targets: [4, 5, 6] }))).toBe(true)
    expect(outcomeReady(option, item, draftWith({ targets: [4, 5, 6, 7] }))).toBe(false)
  })

  it('honors outcome-specific target counts such as one-or-three targets', () => {
    const item = {
      ...itemNeedingTarget(),
      targetCount: 3,
      minimumTargetCount: 1,
      outcomeOptions: [
        { id: 'one', label: '一名', requiredInputs: ['targets'], targetCounts: [1], resultTemplate: '{targets}' },
        { id: 'three', label: '三名', requiredInputs: ['targets'], targetCounts: [3], resultTemplate: '{targets}' },
      ],
    } as WakeItem

    expect(outcomeReady(item.outcomeOptions[0], item, draftWith({ targets: [4] }))).toBe(true)
    expect(outcomeReady(item.outcomeOptions[0], item, draftWith({ targets: [4, 5] }))).toBe(false)
    expect(outcomeReady(item.outcomeOptions[1], item, draftWith({ targets: [4, 5, 6] }))).toBe(true)
  })

  it('keeps optional target branches usable when choosing nobody is a valid role action', () => {
    const item = { ...itemNeedingTarget(), targetCount: 1, minimumTargetCount: 0 } as WakeItem
    const withNoTarget = emptyWakeDraft()
    const withTarget = draftWith({ targets: [7] })

    expect(wakeInputsSatisfied(item, withNoTarget)).toBe(true)
    expect(outcomeReady(item.outcomeOptions[0], item, withNoTarget)).toBe(false)
    expect(outcomeReady(item.outcomeOptions[1], item, withNoTarget)).toBe(true)
    expect(outcomeReady(item.outcomeOptions[0], item, withTarget)).toBe(true)
  })

  it('still requires a role choice when the item offers one', () => {
    const item = { ...itemNeedingTarget(), roleChoices: [{ id: 'chef', label: '厨师' }] } as WakeItem
    const onlyTarget = draftWith({ targets: [7] })

    expect(wakeInputsSatisfied(item, onlyTarget)).toBe(false)
    expect(wakeInputsSatisfied(item, draftWith({ targets: [7], roleChoice: 'chef' }))).toBe(true)
  })

  it('rejects a forbidden storyteller registration', () => {
    const item = {
      ...itemNeedingTarget(),
      registrationSpec: {
        kind: 'role_type' as const,
        label: '本夜展示类型',
        choices: [{ id: 'outsider', label: '外来者' }],
      },
      forbiddenRegistrationValues: ['outsider' as const],
    } as WakeItem

    expect(wakeInputsSatisfied(item, draftWith({
      targets: [7],
      registration: { kind: 'role_type', seatId: 7, value: 'outsider' },
    }))).toBe(false)
  })
})

describe('草稿内容判定', () => {
  it('treats an untouched draft as empty', () => {
    expect(hasWakeDraftContent(emptyWakeDraft())).toBe(false)
  })

  it('detects each kind of edit so the leave guard actually fires', () => {
    // progress 上没有 'draft' 状态，离开守卫只能靠这些字段判断，漏一个就等于守卫失效。
    expect(hasWakeDraftContent(draftWith({ targets: [3] }))).toBe(true)
    expect(hasWakeDraftContent(draftWith({ roleChoice: 'chef' }))).toBe(true)
    expect(hasWakeDraftContent(draftWith({ outcomeId: 'info' }))).toBe(true)
    expect(hasWakeDraftContent(draftWith({ storytellerResult: '已记录' }))).toBe(true)
    expect(hasWakeDraftContent(draftWith({ informationGiven: '3号' }))).toBe(true)
  })
})
