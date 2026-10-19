import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`保存失败可见、可导出并重试恢复 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(() => {
      const original = Storage.prototype.setItem
      Object.assign(window, { failSessionSaveForTest: true })
      Storage.prototype.setItem = function (key, value) {
        if (key === 'botc-copilot-session-v1' && (window as unknown as { failSessionSaveForTest: boolean }).failSessionSaveForTest) {
          throw new DOMException('Storage full', 'QuotaExceededError')
        }
        original.call(this, key, value)
      }
    })
    await page.goto('/')
    const notice = page.getByRole('alert', { name: '对局保存失败' })
    await expect(notice).toBeVisible()
    await expect(page.locator('.dashboard')).toBeVisible()
    for (const name of ['重试保存', '导出对局']) {
      const box = await notice.getByRole('button', { name }).boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    }
    await page.screenshot({ path: testInfo.outputPath('save-failure.png'), fullPage: true })
    await notice.getByRole('button', { name: '重试保存' }).click()
    await expect(notice).toBeVisible()
    const downloadEvent = page.waitForEvent('download')
    await notice.getByRole('button', { name: '导出对局' }).click()
    const download = await downloadEvent
    const exported = JSON.parse(await readFile((await download.path())!, 'utf8'))
    expect(exported.schemaVersion).toBeGreaterThanOrEqual(1)
    expect(exported.id).toBeTruthy()
    await page.evaluate(() => Object.assign(window, { failSessionSaveForTest: false }))
    await notice.getByRole('button', { name: '重试保存' }).click()
    await expect(notice).toHaveCount(0)
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('botc-copilot-session-v1')!))).toEqual(exported)
    expect(errors).toEqual([])
  })
}
