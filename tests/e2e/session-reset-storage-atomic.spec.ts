import { expect, test, type Page } from '@playwright/test'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

const sessionKey = 'botc-copilot-session-v1'
const archiveKey = 'botc-game-archives-v1'
const beforeResetKey = 'botc-session-before-restore-v1'

async function openReset(page: Page) {
  const original = createPrototypeGameSession()
  const previousBackup = JSON.stringify({ ...original, id: 'previous-recovery-copy' })
  await page.addInitScript(({ original, previousBackup, sessionKey, beforeResetKey }) => {
    localStorage.setItem(sessionKey, JSON.stringify(original))
    localStorage.setItem(beforeResetKey, previousBackup)
  }, { original, previousBackup, sessionKey, beforeResetKey })
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('.dashboard')).toBeVisible()
  await page.getByRole('button', { name: '重置游戏', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '重置游戏', exact: true })
  await expect(dialog).toBeVisible()
  const before = await page.evaluate((key) => localStorage.getItem(key), sessionKey)
  return { dialog, before, previousBackup }
}

for (const fault of ['put-throws', 'post-put-abort', 'expired-after-renewal', 'released-after-renewal'] as const) {
  test(`租约${fault}不能清空当前局或覆盖已有回退备份`, async ({ page }) => {
    const { dialog, before, previousBackup } = await openReset(page)
    await page.evaluate(({ fault, archiveKey }) => {
      const originalSet = Storage.prototype.setItem
      const originalPut = IDBObjectStore.prototype.put
      const originalNow = Date.now
      let armed = false
      let clockExpired = false
      Storage.prototype.setItem = function (key, value) {
        originalSet.call(this, key, value)
        if (key === archiveKey) armed = true
      }
      Date.now = () => originalNow() + (clockExpired ? 16_000 : 0)
      IDBObjectStore.prototype.put = function (value, key) {
        if (!armed || this.name !== 'leases' || key !== 'current') return originalPut.call(this, value, key)
        armed = false
        if (fault === 'put-throws') throw new DOMException('Injected lease storage failure', 'QuotaExceededError')
        const request = originalPut.call(this, value, key)
        request.addEventListener('success', () => {
          if (fault === 'post-put-abort') this.transaction.abort()
          else if (fault === 'expired-after-renewal') clockExpired = true
          else {
            // 故障注入模拟离页及返回；真实 BFCache 另由跨浏览器测试记录。
            window.dispatchEvent(new PageTransitionEvent('pagehide'))
            window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
          }
        })
        return request
      }
    }, { fault, archiveKey })
    await dialog.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
    if (fault === 'put-throws' || fault === 'post-put-abort') {
      await expect(page.getByRole('dialog', { name: '保存失败', exact: true })).toBeVisible()
      await page.getByRole('button', { name: '关闭保存失败', exact: true }).click()
      await expect(dialog.getByRole('status')).toContainText('重置未完成')
    } else {
      await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toBeVisible()
      // 编辑保护禁止关闭；保留的重置说明仍应记录失败原因。
      await expect(page.locator('.game-end__notice')).toContainText('重置未完成')
    }
    expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(before)
    expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(previousBackup)
    const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), archiveKey)
    expect(saved).toHaveLength(1)
    expect(JSON.stringify(saved[0].session)).toBe(before)
    await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toHaveCount(0)
  })
}

test('租约成功提交后才替换当前局并保存完整旧局备份', async ({ page }) => {
  const { dialog, before } = await openReset(page)
  await dialog.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '智能配板与调整', exact: true })).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(before)
  const current = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), sessionKey)
  expect(current.id).not.toBe(JSON.parse(before!).id)
  expect(current).toMatchObject({ playerCount: 0, timeline: [], nightRuns: {}, seats: {} })
})
