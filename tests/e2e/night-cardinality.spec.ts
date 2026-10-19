import { expect, test, type Page } from '@playwright/test'
import { loadSmartScriptPack } from '../../src/domain/scripts'
import { cardinalitySession } from '../../src/features/night-workbench/state/nightCardinality.test-support'

const key = 'botc-copilot-session-v1'
async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key) }
async function prepare(page: Page, scriptId: string, roleId: string, count: number, other = false) {
  await loadSmartScriptPack(scriptId)
  const session = cardinalitySession(scriptId, roleId, count, other)
  await page.route('**/api/ai/**', route => route.abort())
  await page.goto('/')
  await page.evaluate(({ key, session }) => localStorage.setItem(key, JSON.stringify(session)), { key, session })
  await page.reload()
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.getByRole('heading', { name: '本项记录', exact: true })).toBeVisible()
  return session.activeNightRunId!
}

for (const width of [390, 1440]) {
  test(`珀显式三刀与不选目标可记录并刷新 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    const run = await prepare(page, 'bad-moon-rising', 'po', 8, true)
    await expect(page.getByRole('button', { name: 'AI推荐', exact: true })).toBeDisabled()
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
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
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
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.screenshot({ path: info.outputPath('yinyangshi-four-roles.png'), animations: 'disabled' })
    await page.reload()
    expect((await saved(page)).timeline).toEqual(before.timeline)
  })
}
