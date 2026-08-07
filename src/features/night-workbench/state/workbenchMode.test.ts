import { describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../game-session/data/createPrototypeSession'
import { sessionInitialNightState } from './gameSessionAdapter'
import { nightWorkbenchReducer, type NightWorkbenchIntent } from './nightWorkbenchReducer'
import {
  deriveWorkbenchMode,
  isCorrectionMode,
  isLiveFocusMode,
  isPreviewMode,
  isReadOnlyMode,
  isSettledMode,
  type WorkbenchMode,
} from './workbenchMode'
import type { NightWorkbenchState, WakeItem } from '../types'

const AT = '2026-08-05T10:00:00.000Z'

function reduce(state: NightWorkbenchState, intent: NightWorkbenchIntent): NightWorkbenchState {
  return nightWorkbenchReducer(state, { ...intent, at: AT })
}

function currentItem(state: NightWorkbenchState): WakeItem {
  const item = state.queue.find((entry) => entry.id === state.previewEntryId)
  if (!item) throw new Error('fixture is incomplete: previewEntryId 不在队列里')
  return item
}

/**
 * 收敛前的三个布尔，从 useNightWorkbench 改动前的源码逐字抄下来。
 *
 * 期望值必须来自这份独立参照实现，而不是被测函数自己的输出——否则断言只是在说
 * 「它等于它自己」，把 deriveWorkbenchMode 改坏了也照样绿。
 */
function legacyBooleans(state: NightWorkbenchState, current: WakeItem) {
  return {
    isPreviewing: state.previewEntryId !== state.activeCursorId,
    isReadOnly:
      current.progress === 'deferred' ||
      current.progress === 'not_applicable' ||
      (current.progress === 'confirmed' && state.correctionItemId !== current.id),
    isCorrecting: state.correctionItemId === current.id,
  }
}

/** 夹具里已确认的一项（有确认快照，因此可以进入更正）。 */
const CONFIRMED_ID = 'night-3-philosopher'
/** 夹具里尚未处理的一项，且不是光标所在项。 */
const PENDING_ELSEWHERE_ID = 'night-3-pithag'

function freshState(): NightWorkbenchState {
  return sessionInitialNightState({
    session: createPrototypeGameSession(),
    dispatchSession: () => undefined,
  })
}

/** 五个 UI 可达的组合，全部由 reducer 一步步走到，不手搓 state 字段。 */
function reachableScenarios(): { name: string; expected: WorkbenchMode; state: NightWorkbenchState }[] {
  const fresh = freshState()
  const previewConfirmed = reduce(fresh, { type: 'preview', id: CONFIRMED_ID })
  const settled = reduce(previewConfirmed, { type: 'activate-preview' })
  return [
    { name: '光标项未落定：可写', expected: 'editing', state: fresh },
    { name: '预览另一项，那一项未落定', expected: 'preview-open', state: reduce(fresh, { type: 'preview', id: PENDING_ELSEWHERE_ID }) },
    { name: '预览另一项，那一项已确认', expected: 'preview-settled', state: previewConfirmed },
    { name: '光标停在已确认项上', expected: 'settled', state: settled },
    { name: '给已确认项追加更正', expected: 'correcting', state: reduce(settled, { type: 'begin-correction' }) },
  ]
}

describe('工作台状态枚举', () => {
  it('五个可达组合各自落到一个不同的 mode', () => {
    const scenarios = reachableScenarios()

    for (const scenario of scenarios) {
      expect(deriveWorkbenchMode(scenario.state, currentItem(scenario.state)), scenario.name).toBe(scenario.expected)
    }
    // 双射：五个组合不能有两个塌到同一个 mode，否则收敛就丢了信息。
    expect(new Set(scenarios.map((scenario) => scenario.expected)).size).toBe(scenarios.length)
  })

  it('每个可达组合都能原样还原出收敛前的三个布尔', () => {
    for (const scenario of reachableScenarios()) {
      const current = currentItem(scenario.state)
      const legacy = legacyBooleans(scenario.state, current)
      const mode = deriveWorkbenchMode(scenario.state, current)

      expect(isPreviewMode(mode), `${scenario.name} · isPreviewing`).toBe(legacy.isPreviewing)
      expect(isSettledMode(mode), `${scenario.name} · isReadOnly`).toBe(legacy.isReadOnly)
      expect(isCorrectionMode(mode), `${scenario.name} · isCorrecting`).toBe(legacy.isCorrecting)
      // 旧代码里的 formDisabled / canUseAI 都是这个并集，收敛后由唯一的 readOnly 承担。
      expect(isReadOnlyMode(mode), `${scenario.name} · formDisabled`).toBe(legacy.isPreviewing || legacy.isReadOnly)
      // 旧代码里换角与「展示信息」用的都是 !isPreviewing。
      expect(isLiveFocusMode(mode), `${scenario.name} · liveFocus`).toBe(!legacy.isPreviewing)
    }
  })

  it('暂缓与本夜不适用同样收敛成 settled', () => {
    const deferred = reduce(freshState(), { type: 'defer' })
    const notApplicable = reduce(freshState(), { type: 'resolve-applicability', value: 'not_applicable' })

    for (const state of [deferred, notApplicable]) {
      const current = currentItem(state)
      expect(current.progress === 'deferred' || current.progress === 'not_applicable').toBe(true)
      expect(deriveWorkbenchMode(state, current)).toBe('settled')
      expect(isSettledMode(deriveWorkbenchMode(state, current))).toBe(legacyBooleans(state, current).isReadOnly)
    }
  })

  it('放弃更正后回到 settled，确认更正后也回到 settled', () => {
    const settled = reduce(reduce(freshState(), { type: 'preview', id: CONFIRMED_ID }), { type: 'activate-preview' })
    const correcting = reduce(settled, { type: 'begin-correction' })

    expect(deriveWorkbenchMode(correcting, currentItem(correcting))).toBe('correcting')
    const cancelled = reduce(correcting, { type: 'cancel-correction' })
    expect(deriveWorkbenchMode(cancelled, currentItem(cancelled))).toBe('settled')
  })
})

/**
 * 组合表里标着「UI 不可达」的三行 (a)(b)，靠的是两段推理。推理会过期——
 * 谁在 begin-correction 或 defer 上放宽一次守卫，那两行就悄悄变成可达，
 * 而收敛后的 mode 会按注释里那句「保守解析」把它们折进 settled / preview-*，
 * 没有任何东西会红。
 *
 * 所以这里不重复那两段推理，改成穷举：从空局出发把全部 21 种意图铺开三层，
 * 对每一个到达过的状态算一遍旧三布尔，断言只落在那五个组合上。
 */
function reachableBooleanCombos(): Set<string> {
  const intents: NightWorkbenchIntent[] = [
    { type: 'preview', id: CONFIRMED_ID },
    { type: 'preview', id: PENDING_ELSEWHERE_ID },
    { type: 'return-current' },
    { type: 'target', seatId: 3 },
    { type: 'role-choice', roleId: 'investigator' },
    { type: 'system-check', checkId: 'pointed-demon' },
    { type: 'system-bluff', roleId: 'chef' },
    { type: 'outcome', outcomeId: 'no-effect' },
    { type: 'confirm', advance: false },
    { type: 'confirm', advance: true },
    { type: 'defer' },
    { type: 'advance' },
    { type: 'activate-preview' },
    { type: 'resume' },
    { type: 'begin-correction' },
    { type: 'cancel-correction' },
    { type: 'resolve-applicability', value: 'applicable' },
    { type: 'resolve-applicability', value: 'not_applicable' },
    { type: 'apply-ai-advice', advice: null },
    { type: 'change-role', role: { id: 'chef', name: '厨师', initial: '厨', iconPath: '' }, reason: 'gameplay' },
    { type: 'clear-draft' },
  ]

  const combos = new Set<string>()
  const seen = new Set<string>()
  let frontier = [freshState()]

  const signature = (state: NightWorkbenchState) => [
    state.previewEntryId,
    state.activeCursorId,
    state.correctionItemId ?? '-',
    state.queue.map((item) => `${item.progress}/${item.applicability}`).join(','),
  ].join('|')

  const record = (state: NightWorkbenchState) => {
    const item = state.queue.find((entry) => entry.id === state.previewEntryId)
    if (!item) return
    const legacy = legacyBooleans(state, item)
    combos.add(`${Number(legacy.isPreviewing)}${Number(legacy.isReadOnly)}${Number(legacy.isCorrecting)}`)
  }

  seen.add(signature(frontier[0]))
  record(frontier[0])

  for (let depth = 0; depth < 3; depth += 1) {
    const next: NightWorkbenchState[] = []
    for (const state of frontier) {
      for (const intent of intents) {
        const candidate = reduce(state, intent)
        const key = signature(candidate)
        if (seen.has(key)) continue
        seen.add(key)
        record(candidate)
        next.push(candidate)
      }
    }
    frontier = next
  }
  // 前置：真的走出去了。若守卫把一切都挡回原地，下面的断言会变成空转。
  expect(seen.size).toBeGreaterThan(20)
  return combos
}

describe('组合表里「不可达」那三行确实到不了', () => {
  it('三层穷举下只出现表里标为可达的五个组合', () => {
    const combos = reachableBooleanCombos()

    // 表里五行「是」，按 P R C 排列。
    expect([...combos].sort()).toEqual(['000', '001', '010', '100', '110'])
    // 逐条点名，失败时一眼看出是哪一行破了。
    expect(combos.has('011'), '(a) C ⟹ ¬R：更正中的项不可能同时算已落定').toBe(false)
    expect(combos.has('101'), '(b) C ⟹ ¬P：更正只在光标项上开始').toBe(false)
    expect(combos.has('111'), '(b) 的另一半').toBe(false)
  })

  it('五个可达组合各自都真的被 reachableScenarios 覆盖到了', () => {
    // 穷举出来的组合集合与手写的五个场景必须相等：
    // 少了说明手写场景漏了一种，多了说明表过时了。
    const fromScenarios = new Set(reachableScenarios().map((scenario) => {
      const legacy = legacyBooleans(scenario.state, currentItem(scenario.state))
      return `${Number(legacy.isPreviewing)}${Number(legacy.isReadOnly)}${Number(legacy.isCorrecting)}`
    }))

    expect([...fromScenarios].sort()).toEqual([...reachableBooleanCombos()].sort())
  })
})

describe('只读由 surface 自上而下强制', () => {
  it('replay 与 deal 压过任何局面状态，包括本来可写的 editing', () => {
    const fresh = freshState()
    const current = currentItem(fresh)
    // 前置：这一屏本来是可写的，下面的断言才有意义。
    expect(deriveWorkbenchMode(fresh, current)).toBe('editing')
    expect(isReadOnlyMode(deriveWorkbenchMode(fresh, current))).toBe(false)

    for (const surface of ['replay', 'deal'] as const) {
      const mode = deriveWorkbenchMode(fresh, current, surface)
      expect(mode, surface).toBe(surface)
      expect(isReadOnlyMode(mode), surface).toBe(true)
      // 预留态既不是预览也不是「已落定」，那些文案分支不该被它误触发。
      expect(isPreviewMode(mode), surface).toBe(false)
      expect(isSettledMode(mode), surface).toBe(false)
      expect(isCorrectionMode(mode), surface).toBe(false)
      expect(isLiveFocusMode(mode), surface).toBe(false)
    }
  })

  it('可写的 mode 恰好只有 editing / correcting / staging', () => {
    // 手写的规格表，不是从实现里读出来的：加一个 mode 却忘了想清楚它能不能写，这里就会红。
    const spec: Record<WorkbenchMode, boolean> = {
      editing: false,
      correcting: false,
      settled: true,
      'preview-open': true,
      'preview-settled': true,
      replay: true,
      deal: true,
      staging: false,
    }

    for (const [mode, readOnly] of Object.entries(spec) as [WorkbenchMode, boolean][]) {
      expect(isReadOnlyMode(mode), mode).toBe(readOnly)
    }
  })
})
