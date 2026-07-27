import { describe, expect, it } from 'vitest'
import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import type { NightSeatSnapshot, NightWorkbenchState, WakeItem } from '../../features/night-workbench/types'
import { createNightResultAdvice } from './index'

function wakeItem(id: string): WakeItem {
  const item = initialNightWorkbenchState.queue.find((entry) => entry.id === id)
  if (!item) throw new Error(`missing wake item ${id}`)
  return item
}

function customWakeItem(patch: Partial<WakeItem> & Pick<WakeItem, 'id' | 'roleId' | 'roleName' | 'outcomeOptions'>): WakeItem {
  return {
    orderIndex: 99,
    seatId: 10,
    playerLabel: '10号玩家',
    roleInitial: patch.roleName.slice(0, 1),
    iconPath: `/assets/characters/${patch.roleId}.webp`,
    ability: `${patch.roleName}测试技能。`,
    storytellerPrompt: '只生成说书人草稿。',
    progress: 'pending',
    applicability: 'applicable',
    status: { life: 'alive', impairments: [], markers: [] },
    history: undefined,
    targetCount: 0,
    interactionVersion: 'quality-regression',
    ...patch,
  }
}

function customState(scriptId: string, seats: Record<number, { id: string; name: string }>): NightWorkbenchState {
  return {
    ...initialNightWorkbenchState,
    scriptId,
    seatSnapshots: Object.fromEntries(Object.entries(seats).map(([seatId, role]): [number, NightSeatSnapshot] => [Number(seatId), {
      seatId: Number(seatId),
      playerLabel: `${seatId}号 · 玩家${seatId}`,
      nickname: `玩家${seatId}`,
      role: { ...role, initial: role.name.slice(0, 1), iconPath: `/assets/characters/${role.id}.webp` },
      status: { life: 'alive' as const, impairments: [], markers: [] },
    }])) as Record<number, NightSeatSnapshot>,
  }
}

describe('night settlement AI quality regression', () => {
  it('GAMBLER-R1 recommends wrong guess as death draft, never authoritative death', () => {
    const item = wakeItem('night-3-gambler')
    const advice = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [4], roleChoice: 'balloonist', draftRevision: 1 },
    })

    expect(advice).toMatchObject({
      status: 'answer',
      recommendedOutcomeId: 'wrong',
    })
    expect(advice?.journalDrafts.join(' ')).toContain('错误，应死亡，待确认状态')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('死亡')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动杀死赌徒')
    expect(JSON.stringify(advice)).not.toContain('confirmedBy')
  })

  it('GAMBLER-R2 prefers no-effect when the acting Gambler is impaired', () => {
    const item = {
      ...wakeItem('night-3-gambler'),
      status: { life: 'alive' as const, impairments: ['drunk' as const], markers: [] },
    }
    const advice = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [9], roleChoice: 'lunatic', draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('no-effect')
    expect(advice?.facts.join(' ')).toContain('发动者：6号赌徒')
    expect(advice?.facts.join(' ')).toContain('醉酒')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动杀死赌徒')
  })

  it('SNAKECHARMER-R1 recommends swap only as identity/team/poison drafts when target is Demon', () => {
    const item = wakeItem('night-3-snakecharmer')
    const advice = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [12], draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('swap')
    expect(advice?.journalDrafts.join(' ')).toContain('交换角色和阵营')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('身份')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('阵营')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('中毒')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动交换身份')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动改阵营')
  })

  it('FANGGU-R1 distinguishes outsider conversion from normal kill drafts', () => {
    const item = wakeItem('night-3-fanggu')
    const convertAdvice = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [8], draftRevision: 1 },
    })
    const killAdvice = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [4], draftRevision: 1 },
    })

    expect(convertAdvice?.recommendedOutcomeId).toBe('convert')
    expect(convertAdvice?.journalDrafts.join(' ')).toContain('转化为邪恶方古')
    expect(convertAdvice?.stateChangeDrafts.join(' ')).toContain('身份')
    expect(convertAdvice?.stateChangeDrafts.join(' ')).toContain('阵营')
    expect(convertAdvice?.authorityWarnings.join(' ')).toContain('自动更换恶魔')
    expect(killAdvice?.recommendedOutcomeId).toBe('kill')
    expect(killAdvice?.journalDrafts.join(' ')).toContain('死亡')
  })

  it('PITHAG-R1 separates already-in-play role from role-change draft', () => {
    const item = wakeItem('night-3-pithag')
    const alreadyInPlay = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [3], roleChoice: 'gambler', draftRevision: 1 },
    })
    const changed = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [3], roleChoice: 'chef', draftRevision: 1 },
    })

    expect(alreadyInPlay?.recommendedOutcomeId).toBe('already-in-play')
    expect(changed?.recommendedOutcomeId).toBe('changed')
    expect(changed?.stateChangeDrafts.join(' ')).toContain('身份')
    expect(changed?.authorityWarnings.join(' ')).toContain('自动更换角色')
  })



  it('PUKKA-R1 keeps poison/death/delay as drafts only', () => {
    const item = customWakeItem({
      id: 'quality-pukka',
      roleId: 'pukka',
      roleName: '普卡',
      targetCount: 1,
      outcomeOptions: [
        { id: 'poison', label: '中毒目标', requiredInputs: ['targets'], resultTemplate: '{actor}选择{target}中毒，上一名普卡目标待核对。' },
        { id: 'no-effect', label: '未受影响', requiredInputs: ['targets'], resultTemplate: '{actor}本夜能力未影响目标。' },
      ],
    })
    const advice = createNightResultAdvice({
      state: customState('a-grimm-chorus', { 10: { id: 'pukka', name: '普卡' }, 3: { id: 'chef', name: '厨师' } }),
      item,
      draft: { ...emptyWakeDraft(), targets: [3], draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('poison')
    expect(advice?.journalDrafts.join(' ')).toContain('中毒')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('中毒')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('死亡')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('延迟')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动杀人')
  })

  it('NODASHII-R1 only drafts poison-range reminders and never batch-poisons seats', () => {
    const item = customWakeItem({
      id: 'quality-nodashii',
      roleId: 'nodashii',
      roleName: '诺-达鲺',
      outcomeOptions: [
        { id: 'range-reminder', label: '中毒范围待核对', requiredInputs: [], resultTemplate: '{actor}两侧最近镇民中毒范围待核对。' },
      ],
    })
    const advice = createNightResultAdvice({
      state: customState('chu-chu-mao-lu-lao-hua-deng', { 10: { id: 'nodashii', name: '诺-达鲺' } }),
      item,
      draft: { ...emptyWakeDraft(), draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('range-reminder')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('中毒')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动批量中毒')
    expect(JSON.stringify(advice)).not.toContain('confirmedBy')
  })

  it('SCARLETWOMAN-R1 frames Demon succession as identity/team draft only', () => {
    const item = customWakeItem({
      id: 'quality-scarletwoman',
      roleId: 'scarletwoman',
      roleName: '红唇女郎',
      outcomeOptions: [
        { id: 'succession', label: '恶魔更替待确认', requiredInputs: [], resultTemplate: '{actor}可能成为死亡恶魔，待确认。' },
      ],
    })
    const advice = createNightResultAdvice({
      state: customState('a-grimm-chorus', { 10: { id: 'scarletwoman', name: '红唇女郎' } }),
      item,
      draft: { ...emptyWakeDraft(), draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('succession')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('身份')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('阵营')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动改身份')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动判胜')
  })

  it('ALCHEMIST-R1 records source Minion ability without running that Minion state machine', () => {
    const item = customWakeItem({
      id: 'quality-alchemist',
      roleId: 'alchemist',
      roleName: '炼金术士',
      roleChoices: [{ id: 'pithag', label: '麻脸巫婆' }],
      roleLabel: '获得能力',
      outcomeOptions: [
        { id: 'ability-recorded', label: '能力已记录', requiredInputs: ['role'], resultTemplate: '{actor}本夜按{role}能力生成草稿。' },
      ],
    })
    const advice = createNightResultAdvice({
      state: customState('bao-meng-mi-tuan', { 10: { id: 'alchemist', name: '炼金术士' } }),
      item,
      draft: { ...emptyWakeDraft(), roleChoice: 'pithag', draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('ability-recorded')
    expect(advice?.journalDrafts.join(' ')).toContain('麻脸巫婆')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('隐藏信息')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('开局')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动执行爪牙结算')
  })

  it('MATHEMATICIAN-R1 gives number as storyteller-confirmed info, not final truth', () => {
    const item = customWakeItem({
      id: 'quality-mathematician',
      roleId: 'mathematician',
      roleName: '数学家',
      outcomeOptions: [
        { id: 'number-draft', label: '数字草稿', requiredInputs: [], resultTemplate: '{actor}本夜数学家数字待说书人确认。' },
      ],
    })
    const advice = createNightResultAdvice({
      state: customState('devout-theists', { 10: { id: 'mathematician', name: '数学家' } }),
      item,
      draft: { ...emptyWakeDraft(), draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('number-draft')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('延迟')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('隐藏信息')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动给最终数字')
  })

  it('LUNATIC-R1 records fake Demon choice without killing or revealing truth', () => {
    const item = customWakeItem({
      id: 'quality-lunatic',
      roleId: 'lunatic',
      roleName: '疯子',
      targetCount: 1,
      outcomeOptions: [
        { id: 'recorded', label: '已记录', requiredInputs: ['targets'], resultTemplate: '{actor}选择{target}，供真实恶魔核对。' },
      ],
    })
    const advice = createNightResultAdvice({
      state: customState('an-du-chen-cang', { 10: { id: 'lunatic', name: '疯子' }, 4: { id: 'chef', name: '厨师' } }),
      item,
      draft: { ...emptyWakeDraft(), targets: [4], draftRevision: 1 },
    })

    expect(advice?.recommendedOutcomeId).toBe('recorded')
    expect(advice?.journalDrafts.join(' ')).toContain('供真实恶魔核对')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('死亡')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('隐藏信息')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动杀人')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动向疯子泄露真相')
  })

  it('CERENOVUS-R1 gives an adoptable madness draft when target and role are filled', () => {
    const item = wakeItem('night-3-cerenovus')
    const advice = createNightResultAdvice({
      state: initialNightWorkbenchState,
      item,
      draft: { ...emptyWakeDraft(), targets: [3], roleChoice: 'investigator', draftRevision: 1 },
    })

    expect(advice).toMatchObject({
      status: 'answer',
      recommendedOutcomeId: 'applied',
    })
    expect(advice?.playerMessageDrafts.join(' ')).toContain('疯狂地声称自己是调查员')
    expect(advice?.stateChangeDrafts.join(' ')).toContain('疯狂')
    expect(advice?.authorityWarnings.join(' ')).toContain('自动处决')
  })
})
