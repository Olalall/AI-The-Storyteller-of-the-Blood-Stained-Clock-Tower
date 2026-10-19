import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack } from '../../src/domain/scripts'
import { cardinalitySession, nextCardinalityNight } from '../../src/features/night-workbench/state/nightCardinality.test-support'

const key = 'botc-copilot-session-v1'
async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key) }
async function prepare(page: Page, scriptId: string, roleId: string, count: number, other = false, poHistory: 'missing' | 'first-action' = 'missing') {
  await loadSmartScriptPack(scriptId)
  const initial = cardinalitySession(scriptId, roleId, count, other)
  const session = roleId === 'po' && other && poHistory === 'missing' ? nextCardinalityNight(initial, roleId) : initial
  await page.route('**/api/ai/**', route => route.abort())
  await page.goto('/')
  await page.evaluate(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session })
  await page.reload()
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.getByRole('heading', { name: '本项记录', exact: true })).toBeVisible()
  return session.activeNightRunId!
}

for (const width of [390, 1440]) {
  test(`珀首次行动只允许零或一人，蓄力必须明确确认 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await prepare(page, 'bad-moon-rising', 'po', 8, true, 'first-action')
    const before = await saved(page)
    await expect(page.getByRole('button', { name: '选择3名玩家', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'AI推荐', exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: '选择1名玩家', exact: true }).click()
    await page.getByRole('button', { name: /^选择3号玩家/ }).click()
    await expect(page.getByRole('button', { name: '选择无人，进行蓄力', exact: true })).toBeDisabled()
    await expect(page.getByRole('button', { name: '选择一名玩家', exact: true })).toBeEnabled()
    await page.getByRole('button', { name: '不选目标', exact: true }).click()
    await expect(page.getByRole('button', { name: '选择一名玩家', exact: true })).toBeDisabled()
    await page.getByRole('button', { name: '选择无人，进行蓄力', exact: true }).click()
    expect((await saved(page)).timeline).toEqual(before.timeline)
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').at(-1)?.record.snapshot).toMatchObject({ targetCountChoice: 0, targets: [], outcomeId: 'po-charge' })
    const confirmed = await saved(page)
    expect(confirmed.initialPlayerStates).toEqual(before.initialPlayerStates)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('po-first-action-explicit-charge.png'), animations: 'disabled' })
    await page.reload()
    expect((await saved(page)).timeline).toEqual(confirmed.timeline)
  })

  test(`珀缺少历史时可核实三刀与不选目标并刷新 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const run = await prepare(page, 'bad-moon-rising', 'po', 8, true)
    await expect(page.getByRole('button', { name: 'AI推荐', exact: true })).toHaveCount(0)
    await page.getByRole('button', { name: '选择3名玩家', exact: true }).click()
    for (const seat of [1, 2, 3]) await page.getByRole('button', { name: new RegExp(`^选择${seat}号玩家`) }).click()
    for (const seat of [1, 2, 3]) await expect(page.getByRole('button', { name: new RegExp(`^选择${seat}号玩家`) })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: '不选目标', exact: true }).click()
    await page.getByRole('button', { name: '记录结果', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((e: { kind: string }) => e.kind === 'night_action').at(-1)?.record.snapshot.targetCountChoice).toBe(0)
    const before = await saved(page)
    expect(before.nightRuns[run].drafts[before.nightRuns[run].activeCursorId].targets).toEqual([])
    await page.screenshot({ path: info.outputPath('po-explicit-zero.png'), animations: 'disabled' })
    await page.reload()
    expect((await saved(page)).timeline).toEqual(before.timeline)
  })

  test(`贵族三人信息全部保留 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const run = await prepare(page, 'zui-ge-luan-wu', 'noble', 7)
    for (const seat of [1, 2, 3]) await page.getByRole('button', { name: new RegExp(`^选择${seat}号玩家`) }).click()
    await page.getByRole('button', { name: '记录结果', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((e: { kind: string }) => e.kind === 'night_action').at(-1)?.record.snapshot.targets).toEqual([1, 2, 3])
    const session = await saved(page)
    expect(session.nightRuns[run].queue.some((w: { roleId: string; targetCount: number }) => w.roleId === 'noble' && w.targetCount === 3)).toBe(true)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('noble-three-targets.png'), animations: 'disabled' })
  })

  test(`阴阳师四角色确认并持久化 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await prepare(page, 'ji-meng-ta-xiang', 'yinyangshi', 7)
    for (const [group, role] of [[/^善良角色/, '筑梦师'], [/^邪恶角色/, '刺客'], [/^第二个善良角色/, '共情者']] as const) {
      await page.getByRole('group', { name: group }).getByRole('button', { name: role, exact: true }).click()
    }
    await expect(page.getByRole('button', { name: '记录结果', exact: true })).toBeDisabled()
    await page.getByRole('group', { name: /^第二个邪恶角色/ }).getByRole('button', { name: '洗脑师', exact: true }).click()
    await page.getByRole('button', { name: '记录结果', exact: true }).click()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((e: { kind: string }) => e.kind === 'night_action').at(-1)?.record.snapshot.additionalRoleChoices).toEqual(['empath', 'cerenovus'])
    const before = await saved(page)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('yinyangshi-four-roles.png'), animations: 'disabled' })
    await page.reload()
    expect((await saved(page)).timeline).toEqual(before.timeline)
  })
}
