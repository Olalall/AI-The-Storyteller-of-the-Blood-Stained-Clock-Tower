// Copy to tests/e2e and place lleech-initial.support.ts next to the integrated reducer test,
// or import the fixture from this document folder. This is an isolated local browser draft.
import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack } from '../../src/domain/scripts'
import type { GameSessionState } from '../../src/features/game-session/types'
import { lleechLaterNightFixture } from '../../src/features/game-session/state/lleechInitial.test-support'

const key = 'botc-copilot-session-v1'
async function saved(page: Page): Promise<GameSessionState> {
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)!), key)
}

for (const width of [390, 1440]) test(`帽匠后旧恶魔只初始化痢蛭宿主，不额外攻击 ${width}px`, async ({ page }, info) => {
  await loadSmartScriptPack('feng-mao-zhi-yan')
  const seed = lleechLaterNightFixture()
  await page.setViewportSize({ width, height: 900 })
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.addInitScript(({ storageKey, session }) => {
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(session))
  }, { storageKey: key, session: seed })
  await page.goto('/')
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await page.getByRole('button', { name: '更换角色', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: /^更换\d+号角色$/ })
  await dialog.getByRole('combobox', { name: '变更玩家', exact: true }).selectOption('12')
  await dialog.getByRole('button', { name: '痢蛭', exact: true }).click()
  const initialize = dialog.getByRole('radio', { name: '当晚只初始化新能力（选宿主，不额外攻击）', exact: true })
  await expect(initialize).toBeVisible()
  await expect(dialog.getByRole('button', { name: '确认改为痢蛭', exact: true })).toBeDisabled()
  await initialize.check()
  await dialog.getByRole('button', { name: '确认改为痢蛭', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  const changed = await saved(page), run = changed.nightRuns[changed.activeNightRunId!]
  const hostItem = run.queue.find((item) => item.seatId === 12 && item.roleId === 'lleech')!
  expect(run.nightType).toBe('other')
  expect(hostItem.abilityPhase).toBe('initial')
  expect(run.queue.filter((item) => item.seatId === 12 && item.roleId === 'lleech')).toHaveLength(1)
  expect(changed.timeline.slice(0, seed.timeline.length)).toEqual(seed.timeline)
  expect(changed.initialPlayerStates).toEqual(seed.initialPlayerStates)

  await page.getByRole('button', { name: '夜间顺序', exact: true }).click()
  await page.getByRole('button', { name: /^预览夜序.*：12号痢蛭$/ }).click()
  await page.getByRole('button', { name: /^将夜间处理位置切换到/ }).click()
  await expect(page.locator('.wake-facts')).toContainText('只选择一名存活宿主')
  const recordHost = page.getByRole('button', { name: '记录存活宿主', exact: true })
  await expect(recordHost).toBeDisabled()
  const deadHost = page.getByRole('button', { name: /^选择9号玩家/ })
  if (await deadHost.isEnabled()) {
    await deadHost.click()
    await recordHost.click()
    await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeDisabled()
  } else await expect(deadHost).toBeDisabled()
  await page.getByRole('button', { name: '选择1号玩家', exact: true }).click()
  await recordHost.click()
  await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: '确认本项', exact: true }).click()
  const final = await saved(page), last = final.timeline.findLast((entry) => entry.kind === 'night_action')!
  expect(last.kind).toBe('night_action')
  if (last.kind === 'night_action') {
    expect(last.wakeItemId).toBe(hostItem.id)
    expect(last.record.snapshot.targets).toEqual([1])
    expect(last.record.snapshot.storytellerResult).toContain('宿主')
    expect(last.record.snapshot.informationGiven).toBe('')
  }
  expect(final.timeline.filter((entry) => entry.kind === 'player_state_changed')).toEqual(seed.timeline.filter((entry) => entry.kind === 'player_state_changed'))
  expect(final.timeline.filter((entry) => entry.kind === 'setup_confirmed')).toEqual(seed.timeline.filter((entry) => entry.kind === 'setup_confirmed'))
  expect(final.nightRuns[final.activeNightRunId!].queue.filter((item) => item.roleId === 'lleech')).toHaveLength(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  await page.screenshot({ path: info.outputPath('lleech-initial-host.png'), animations: 'disabled' })
  await page.reload()
  const restored = await saved(page)
  expect(restored.timeline).toEqual(final.timeline)
  expect(restored.nightRuns[restored.activeNightRunId!].nightType).toBe('other')
  expect(restored.nightRuns[restored.activeNightRunId!].queue.find((item) => item.id === hostItem.id)?.abilityPhase).toBe('initial')
})
