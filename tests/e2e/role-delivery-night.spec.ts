import { expect, test, type Page } from '@playwright/test'
import { createPrototypeGameSession, gameSessionStorageKey } from '../../src/features/game-session/data/createPrototypeSession'
import type { GameSessionState, NightActionEntry } from '../../src/features/game-session/types'
import { emptyWakeDraft } from '../../src/features/night-workbench/state/projectWakeDraft'
import type { WakeItem } from '../../src/features/night-workbench/types'

const status = { life: 'alive' as const, impairments: [], markers: [] }

function sessionFocusedOn(item: WakeItem, shielded = false): GameSessionState {
  const session = createPrototypeGameSession()
  const runId = session.activeNightRunId
  const run = runId ? session.nightRuns[runId] : undefined
  if (!runId || !run) throw new Error('prototype night is missing')
  const previousEntry = previousNightEntryFor(item)
  return {
    ...session,
    initialPlayerStates: item.roleId === 'shabaloth'
      ? { ...session.initialPlayerStates, 4: { ...session.initialPlayerStates[4], life: 'dead' } }
      : session.initialPlayerStates,
    phaseSegments: previousEntry
      ? [{ id: 'e2e-night-2', kind: 'night', sequence: 2, label: '第2夜', createdAt: '2026-07-12T00:00:00.000Z', closedAt: '2026-07-12T01:00:00.000Z' }, ...session.phaseSegments]
      : session.phaseSegments,
    timeline: [...session.timeline.filter((entry) => entry.kind !== 'night_action'), ...(previousEntry ? [previousEntry] : [])],
    nightRuns: {
      ...session.nightRuns,
      [runId]: {
        ...run,
        queue: [item],
        activeCursorId: item.id,
        previewEntryId: item.id,
        drafts: {},
        privacyShielded: shielded,
        correctionItemId: null,
      },
    },
  }
}

function previousNightEntryFor(item: WakeItem): NightActionEntry | undefined {
  if (!['balloonist', 'exorcist', 'pukka', 'shabaloth', 'yanluo', 'po'].includes(item.roleId)) return undefined
  const registration = item.roleId === 'balloonist'
    ? { kind: 'role_type' as const, seatId: 4, value: 'outsider' as const }
    : undefined
  const targets = item.roleId === 'po' ? [] : item.roleId === 'shabaloth' ? [4, 5] : [4]
  const outcomeId = ({ pukka: 'pukka-new-poison', po: 'po-charge', yanluo: 'yanluo-record' } as Record<string, string>)[item.roleId] ?? 'record'
  return {
    id: `e2e-night-2-${item.roleId}`, kind: 'night_action', segmentId: 'e2e-night-2',
    createdAt: '2026-07-12T00:30:00.000Z', confirmedBy: 'storyteller',
    nightRunId: 'e2e-night-2', wakeItemId: `e2e-night-2-${item.roleId}-2`, actorSeatId: 2, roleId: item.roleId,
    summary: '上一夜确认记录', details: [], record: {
      revision: 1,
      snapshot: { ...emptyWakeDraft(), targets, registration, outcomeId, storytellerResult: '上一夜确认记录' },
    },
  }
}

function organGrinderItem(): WakeItem {
  return {
    id: 'e2e-organ-grinder',
    orderIndex: 1,
    seatId: 10,
    playerLabel: '10号 玩家10',
    roleId: 'organgrinder',
    roleName: '街头风琴手',
    roleInitial: '街',
    iconPath: '',
    ability: '所有玩家在投票时闭眼，且票数会秘密统计。每个夜晚，你要选择自己是否醉酒直到下个黄昏。',
    storytellerPrompt: '唤醒街头风琴手，让他选择自己是否醉酒直到下个黄昏；只记录选择，不自动改变醉酒状态。',
    progress: 'pending',
    applicability: 'applicable',
    status,
    targetCount: 0,
    interactionVersion: 'e2e/organ-grinder-v1',
    aiAdviceEnabled: false,
    outcomeOptions: [
      {
        id: 'yes',
        label: '醉酒至下个黄昏',
        requiredInputs: [],
        resultTemplate: '{actor}选择醉酒至下个黄昏；仅记录选择，不自动改变醉酒状态。',
      },
      {
        id: 'no',
        label: '保持清醒',
        requiredInputs: [],
        resultTemplate: '{actor}选择保持清醒；仅记录选择，不自动改变状态。',
      },
    ],
  }
}

function damselNoticeItem(): WakeItem {
  return {
    id: 'e2e-damsel-notice',
    orderIndex: 1,
    seatId: 3,
    playerLabel: '逐个通知 · 3号 玩家3 / 6号 玩家6',
    roleId: 'system-audience-damsel',
    roleName: '落难少女信息',
    roleInitial: '知',
    iconPath: '',
    ability: '唤醒所有爪牙，并告知他们场中有落难少女。',
    storytellerPrompt: '逐个唤醒名单中的玩家，展示「落难少女」标记。',
    progress: 'pending',
    applicability: 'applicable',
    status,
    targetCount: 0,
    interactionVersion: 'e2e/damsel-notice-v1',
    outcomeOptions: [{
      id: 'given',
      label: '已完成逐个通知',
      requiredInputs: [],
      resultTemplate: '落难少女信息已逐个告知合格爪牙。',
    }],
    systemStep: {
      kind: 'audience_notice',
      minionLabels: [],
      demonLabel: '',
      audienceLabel: '接收爪牙',
      recipientLabels: ['3号 玩家3', '6号 玩家6'],
      infoTokens: ['落难少女'],
      checks: [
        { id: 'notified-3', label: '已向3号 玩家3展示落难少女标记' },
        { id: 'notified-6', label: '已向6号 玩家6展示落难少女标记' },
      ],
      sensitive: true,
    },
  }
}

function balloonistItem(): WakeItem {
  return {
    id: 'e2e-balloonist-registration', orderIndex: 1, seatId: 2, playerLabel: '2号 玩家2',
    roleId: 'balloonist', roleName: '气球驾驶员', roleInitial: '气', iconPath: '',
    ability: '每个夜晚，你会得知一名与上个夜晚得知的角色类型不同的玩家。',
    storytellerPrompt: '选择玩家，并明确记录本夜按哪种角色类型展示。',
    progress: 'pending', applicability: 'applicable', status, targetCount: 1, targetLabel: '目标',
    targetKind: 'storyteller_info', interactionVersion: 'e2e/balloonist-registration-v1',
    registrationSpec: {
      kind: 'role_type', label: '本夜展示类型', choices: [
        { id: 'townsfolk', label: '镇民' }, { id: 'outsider', label: '外来者' },
        { id: 'minion', label: '爪牙' }, { id: 'demon', label: '恶魔' },
      ],
    },
    previousRegistration: { kind: 'role_type', seatId: 4, value: 'outsider' },
    history: '上一夜登记：外来者（4号）',
    outcomeOptions: [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}向玩家展示{targets}；本夜明确登记为{registration}。' }],
  }
}

function exorcistItem(): WakeItem {
  return {
    id: 'e2e-exorcist-history', orderIndex: 1, seatId: 2, playerLabel: '2号 玩家2',
    roleId: 'exorcist', roleName: '驱魔人', roleInitial: '驱', iconPath: '',
    ability: '每个夜晚*，选择一名与上个夜晚不同的玩家。', storytellerPrompt: '选择目标。',
    progress: 'pending', applicability: 'applicable', status, targetCount: 1, targetLabel: '目标',
    targetKind: 'player_choice', interactionVersion: 'e2e/exorcist-history-v1',
    previousTargets: [4], forbiddenTargetSeatIds: [4], previousTargetRequired: true,
    history: '上一夜目标：4号；本夜不可重复。',
    outcomeOptions: [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}选择{targets}。' }],
  }
}

function delayedRoleItem(roleId: 'pukka' | 'shabaloth' | 'yanluo' | 'po', name: string): WakeItem {
  return {
    id: `e2e-${roleId}-history`, orderIndex: 1, seatId: 2, playerLabel: '2号 玩家2',
    roleId, roleName: name, roleInitial: name[0], iconPath: '', ability: '跨夜技能。', storytellerPrompt: '记录本夜选择。',
    progress: 'pending', applicability: 'applicable', status, targetCount: 1, targetLabel: '目标', targetKind: 'player_choice',
    interactionVersion: `e2e/${roleId}-history-v1`,
    outcomeOptions: [{ id: 'record', label: '记录结果', requiredInputs: ['targets'], resultTemplate: '{actor}选择{targets}。' }],
  }
}

async function openSession(page: Page, session: GameSessionState) {
  await page.addInitScript(({ key, value }) => window.localStorage.setItem(key, value), {
    key: gameSessionStorageKey,
    value: JSON.stringify(session),
  })
  await page.goto('/')
}

test('Organ Grinder exposes only the player choice and no AI recommendation', async ({ page }) => {
  await openSession(page, sessionFocusedOn(organGrinderItem()))

  await expect(page.getByText('街头风琴手', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: '醉酒至下个黄昏' })).toBeVisible()
  await expect(page.getByRole('button', { name: '保持清醒' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'AI推荐' })).toHaveCount(0)

  await page.getByRole('button', { name: '醉酒至下个黄昏' }).click()
  await expect(page.getByRole('button', { name: '确认本项' })).toBeEnabled()
})

test('Damsel notice shows its eligible recipients', async ({ page }) => {
  const item = damselNoticeItem()
  await openSession(page, sessionFocusedOn(item))

  await expect(page.getByText('步骤说明 · 落难少女信息')).toBeVisible()
  await expect(page.getByText('接收爪牙')).toBeVisible()
  await expect(page.getByText('3号 玩家3 / 6号 玩家6', { exact: true })).toBeVisible()
})

test('privacy shield hides the sensitive Damsel notice identity', async ({ page }) => {
  await openSession(page, sessionFocusedOn(damselNoticeItem(), true))

  await expect(page.getByRole('region', { name: '夜间角色预览' })).toHaveCount(0)
  await expect(page.getByText('落难少女', { exact: false })).toHaveCount(0)
  await page.getByRole('button', { name: '夜间顺序' }).click()
  await expect(page.getByText('敏感步骤已隐藏')).toBeVisible()
  await expect(page.getByRole('button', { name: /预览夜序/ })).toHaveCount(0)
})

test('Balloonist requires an explicit displayed type and shows only confirmed previous history', async ({ page }) => {
  await openSession(page, sessionFocusedOn(balloonistItem()))

  await page.getByText('上次记录', { exact: true }).click()
  await expect(page.getByText('上一夜登记：外来者（4号）')).toBeVisible()
  await page.getByRole('button', { name: '选择4号玩家' }).click()
  await expect(page.getByRole('button', { name: '记录结果' })).toBeDisabled()
  await page.getByRole('button', { name: '爪牙' }).click()
  await page.getByRole('button', { name: '记录结果' }).click()
  await expect(page.getByText(/本夜明确登记为爪牙/)).toBeVisible()
  await expect(page.getByRole('button', { name: '确认本项' })).toBeEnabled()
})

test('Exorcist disables the confirmed previous target and keeps one clear next action', async ({ page }) => {
  await openSession(page, sessionFocusedOn(exorcistItem()))
  await page.getByText('上次记录', { exact: true }).click()
  await expect(page.getByText('上一夜目标：4号；本夜不可重复。')).toBeVisible()
  await expect(page.getByRole('button', { name: '选择4号玩家' })).toBeDisabled()
  await page.getByRole('button', { name: '选择5号玩家' }).click()
  await page.getByRole('button', { name: '记录结果' }).click()
  await expect(page.getByRole('button', { name: '确认本项' })).toBeEnabled()
})

test('Pukka shows the active poison target without applying death or recovery', async ({ page }) => {
  await openSession(page, sessionFocusedOn(delayedRoleItem('pukka', '普卡')))
  await page.getByText('上次记录', { exact: true }).click()
  await expect(page.getByText(/当前待结算的普卡中毒目标：4号/)).toBeVisible()
  await page.getByRole('button', { name: '选择5号玩家' }).click()
  await page.getByRole('button', { name: '新毒目标生效' }).click()
  await expect(page.getByText(/4号为死亡并恢复健康候选/)).toBeVisible()
  await expect(page.getByRole('button', { name: '确认本项' })).toBeEnabled()
})

test('Shabaloth offers only dead previous targets as regurgitation choices', async ({ page }) => {
  await openSession(page, sessionFocusedOn(delayedRoleItem('shabaloth', '沙巴洛斯')))
  await page.getByText('上次记录', { exact: true }).click()
  await expect(page.getByText(/当前可反刍候选：4号/)).toBeVisible()
  await expect(page.getByRole('button', { name: '反刍4号' })).toBeVisible()
  await expect(page.getByRole('button', { name: '反刍5号' })).toHaveCount(0)
  await page.getByRole('button', { name: '选择6号玩家' }).click()
  await page.getByRole('button', { name: '选择7号玩家' }).click()
  await page.getByRole('button', { name: '反刍4号' }).click()
  await expect(page.getByRole('button', { name: '确认本项' })).toBeEnabled()
})

test('Yanluo displays the rolling delayed-death candidate as a draft only', async ({ page }) => {
  await openSession(page, sessionFocusedOn(delayedRoleItem('yanluo', '阎罗')))
  await page.getByText('上次记录', { exact: true }).click()
  await expect(page.getByText(/本夜延迟死亡候选：4号/)).toBeVisible()
  await page.getByRole('button', { name: '选择5号玩家' }).click()
  await page.getByRole('button', { name: '记录目标与候选' }).click()
  await expect(page.getByText(/不自动修改状态/)).toBeVisible()
})

test('charged Po requires exactly three targets and has no AI choice recommendation', async ({ page }) => {
  await openSession(page, sessionFocusedOn(delayedRoleItem('po', '珀')))
  await page.getByText('上次记录', { exact: true }).click()
  await expect(page.getByText(/本夜必须依次选择三名玩家/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'AI推荐' })).toHaveCount(0)
  await page.getByRole('button', { name: '选择3号玩家' }).click()
  await page.getByRole('button', { name: '选择4号玩家' }).click()
  await expect(page.getByRole('button', { name: '记录三名目标' })).toBeDisabled()
  await page.getByRole('button', { name: '选择5号玩家' }).click()
  await page.getByRole('button', { name: '记录三名目标' }).click()
  await expect(page.getByRole('button', { name: '确认本项' })).toBeEnabled()
})
