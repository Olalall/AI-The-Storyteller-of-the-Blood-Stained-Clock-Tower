import { expect, test, type Page } from '@playwright/test'

const key = 'botc-copilot-session-v1'
async function ready(page: Page) {
  await page.goto('/')
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), key)).not.toBeNull()
}
async function read(page: Page) { return page.evaluate((k) => JSON.parse(localStorage.getItem(k)!), key) }
async function choose(page: Page, value: unknown) {
  await page.getByLabel('选择备份文件').setInputFiles({ name: 'session.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) })
}

for (const width of [390, 1440]) {
  test(`备份预览、取消、确认与回退 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await ready(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    const original = await read(page)
    const imported = structuredClone(original)
    imported.id = 'imported-session'
    imported.seats[1].nickname = '恢复测试玩家'
    await page.getByRole('button', { name: '备份恢复' }).click()
    await choose(page, imported)
    const dialog = page.getByRole('dialog', { name: '对局备份' })
    await expect(dialog.getByText('12 人', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '确认恢复', exact: true })).toBeDisabled()
    expect(await read(page)).toEqual(original)
    await page.getByRole('button', { name: '关闭对局备份' }).click()
    expect(await read(page)).toEqual(original)
    await page.getByRole('button', { name: '备份恢复' }).click()
    await choose(page, imported)
    await page.getByRole('checkbox').check()
    const confirmBox = await page.getByRole('button', { name: '确认恢复', exact: true }).boundingBox()
    expect(confirmBox!.height).toBeGreaterThanOrEqual(44)
    expect(confirmBox!.x).toBeGreaterThanOrEqual(0)
    expect(confirmBox!.x + confirmBox!.width).toBeLessThanOrEqual(width)
    await page.screenshot({ path: testInfo.outputPath('restore-preview.png') })
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: '确认恢复', exact: true }).click()])
    await expect.poll(async () => (await read(page)).id).toBe(imported.id)
    await expect(page.getByRole('dialog', { name: '对局备份' })).toHaveCount(0)
    expect(await read(page)).toEqual(imported)
    await page.getByRole('button', { name: '备份恢复' }).click()
    await page.getByRole('button', { name: '查看恢复前备份' }).click()
    await expect(dialog.getByText('恢复前的对局', { exact: true })).toBeVisible()
    await page.getByRole('checkbox').check()
    await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: '确认恢复', exact: true }).click()])
    await expect.poll(async () => (await read(page)).id).toBe(original.id)
    expect(await read(page)).toEqual(original)
  })
}

test('无效文件与恢复前备份失败都不替换当前局', async ({ page }) => {
  await ready(page)
  const original = await read(page)
  await page.getByRole('button', { name: '备份恢复' }).click()
  await choose(page, { schemaVersion: 1 })
  await expect(page.getByRole('alert')).toContainText('不完整')
  expect(await read(page)).toEqual(original)
  await choose(page, { ...original, id: 'must-not-save' })
  await page.evaluate(() => {
    const originalSet = Storage.prototype.setItem
    Storage.prototype.setItem = function (k, v) {
      if (k === 'botc-session-before-restore-v1') throw new DOMException('full', 'QuotaExceededError')
      originalSet.call(this, k, v)
    }
  })
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: '确认恢复', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('恢复未完成')
  expect(await read(page)).toEqual(original)
})

test('第二页面不能覆盖，关闭编辑页后可重新打开最新局', async ({ page, context }) => {
  test.setTimeout(45_000)
  await ready(page)
  const second = await context.newPage()
  await second.goto('/')
  await expect(second.getByRole('dialog', { name: '编辑保护' })).toBeVisible()
  await expect(second.getByText(/另一页面正在编辑/)).toBeVisible()
  await page.getByRole('button', { name: /查看1号/ }).click()
  await page.getByRole('button', { name: '中毒', exact: true }).click()
  await page.getByRole('button', { name: '确认状态', exact: true }).click()
  await expect.poll(async () => (await read(page)).timeline.filter((e: { kind: string }) => e.kind === 'player_state_changed').length).toBeGreaterThan(0)
  const latest = await read(page)
  await page.close()
  await Promise.all([second.waitForEvent('load'), second.getByRole('button', { name: '重新打开最新对局' }).click()])
  await expect(second.getByRole('dialog', { name: '编辑保护' })).toHaveCount(0, { timeout: 21_000 })
  expect(await read(second)).toEqual(latest)
})

test('过期页面保存时发现新存档，停止写入并保留新内容', async ({ page, context }) => {
  await ready(page)
  const latest = await read(page)
  latest.seats[1].nickname = '另一页面的新记录'
  const other = await context.newPage()
  await other.goto('/')
  await expect(other.getByRole('dialog', { name: '编辑保护' })).toBeVisible()
  // 模拟另一编辑器已经成功落盘，当前页面仍持有旧内存。
  await other.evaluate(({ k, value }) => localStorage.setItem(k, JSON.stringify(value)), { k: key, value: latest })
  await page.getByRole('button', { name: /查看1号/ }).click()
  await page.getByRole('button', { name: '中毒', exact: true }).click()
  await page.getByRole('button', { name: '确认状态', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '编辑保护' })).toBeVisible()
  expect(await read(page)).toEqual(latest)
  await other.close()
  await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: '重新打开最新对局' }).click()])
  await expect(page.getByRole('dialog', { name: '编辑保护' })).toHaveCount(0)
  expect(await read(page)).toEqual(latest)
})
