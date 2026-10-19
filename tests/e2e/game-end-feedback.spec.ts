import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import { createGameArchiveRecord } from '../../src/services/archive/archiveService'
import type { GameArchiveRecord } from '../../src/services/archive/types'
import { parseSessionBackup } from '../../src/services/session/sessionBackup'

const sessionKey = 'botc-copilot-session-v1'
const archiveKey = 'botc-game-archives-v1'
const beforeResetKey = 'botc-session-before-restore-v1'

async function seed(page: Page, http = false) {
  const session = createPrototypeGameSession()
  const historical = createGameArchiveRecord({
    session: { ...session, id: 'feedback-historical-session' }, winner: 'good',
    archiveId: 'feedback-historical-archive', archivedAt: '2026-10-18T00:00:00.000Z',
  })
  await page.addInitScript(({ session, historical, http, sessionKey, archiveKey, beforeResetKey }) => {
    if (!localStorage.getItem(sessionKey)) localStorage.setItem(sessionKey, JSON.stringify(session))
    if (!localStorage.getItem(archiveKey)) localStorage.setItem(archiveKey, JSON.stringify([historical]))
    localStorage.setItem(beforeResetKey, JSON.stringify(historical.session))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: http ? 'http' : 'local', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { session, historical, http, sessionKey, archiveKey, beforeResetKey })
  await page.route('**/api/ai/**', (route) => route.abort())
  await page.route('**/api/ai-settings/live-test', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('.dashboard')).toBeVisible()
  return historical
}

async function stored(page: Page, key: string) { return page.evaluate((key) => localStorage.getItem(key)!, key) }
async function openSave(page: Page) {
  await page.getByRole('button', { name: '保存本局', exact: true }).click()
  return page.getByRole('dialog', { name: '保存本局', exact: true })
}

for (const width of [390, 905]) {
  test(`归档存储满仍可直接下载可恢复对局，原局与历史不变 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    await seed(page)
    const before = await stored(page, sessionKey)
    const archivesBefore = await stored(page, archiveKey)
    const backupBefore = await stored(page, beforeResetKey)
    const dialog = await openSave(page)
    await page.evaluate((archiveKey) => {
      const original = Storage.prototype.setItem
      Object.assign(window, { feedbackArchiveWriteAttempts: 0 })
      Storage.prototype.setItem = function (key, value) {
        if (key === archiveKey) {
          const state = window as unknown as { feedbackArchiveWriteAttempts: number }
          state.feedbackArchiveWriteAttempts += 1
          throw new DOMException('Storage full', 'QuotaExceededError')
        }
        original.call(this, key, value)
      }
    }, archiveKey)
    await dialog.getByRole('button', { name: '保存本局', exact: true }).click()
    await expect(dialog.getByRole('status')).toContainText('保存失败，当前局未归档')
    const attemptsBeforeExport = await page.evaluate(() => (window as unknown as { feedbackArchiveWriteAttempts: number }).feedbackArchiveWriteAttempts)
    const event = page.waitForEvent('download')
    await dialog.getByRole('button', { name: '导出当前对局', exact: true }).click()
    const download = await event
    expect(await download.failure()).toBeNull()
    expect(download.suggestedFilename()).toMatch(/^botc-session-.*\.json$/)
    const raw = await readFile((await download.path())!, 'utf8')
    expect(parseSessionBackup(raw)).toEqual(JSON.parse(before))
    await expect(dialog.getByRole('status')).toContainText('当前对局备份已导出')
    await expect(dialog.getByRole('status')).toBeInViewport({ ratio: 1 })
    expect(await page.evaluate(() => (window as unknown as { feedbackArchiveWriteAttempts: number }).feedbackArchiveWriteAttempts)).toBe(attemptsBeforeExport)
    expect(await stored(page, sessionKey)).toBe(before)
    expect(await stored(page, archiveKey)).toBe(archivesBefore)
    expect(await stored(page, beforeResetKey)).toBe(backupBefore)
    await page.screenshot({ path: info.outputPath('current-backup-under-quota.png'), animations: 'disabled' })
  })

  test(`历史导出与下载失败都在复盘页提示，后端回退也可见 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/api/archives', (route) => route.fulfill({ status: 503, json: { accepted: false, error: { code: 'UNAVAILABLE' } } }))
    const historical = await seed(page, true)
    const before = await stored(page, sessionKey)
    const archivesBefore = await stored(page, archiveKey)
    await page.getByRole('button', { name: '本局记录', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '历史复盘', exact: true })
    const status = dialog.getByRole('status')
    await expect(status).toContainText('本地后端不可用，已显示本机归档')
    await expect(status).toBeInViewport({ ratio: 1 })
    const event = page.waitForEvent('download')
    await dialog.getByRole('button', { name: '导出这局', exact: true }).click()
    const download = await event
    expect(await download.failure()).toBeNull()
    expect(download.suggestedFilename()).toBe(`botc-archive-${historical.id}.json`)
    expect(JSON.parse(await readFile((await download.path())!, 'utf8'))).toEqual(historical)
    await expect(status).toHaveText('归档JSON已导出')
    await expect(status).toBeInViewport({ ratio: 1 })
    await expect(dialog.getByRole('tab', { name: '历史复盘', exact: true })).toHaveAttribute('aria-selected', 'true')
    await page.screenshot({ path: info.outputPath('historical-export-success.png'), animations: 'disabled' })
    await page.evaluate(() => { URL.createObjectURL = () => { throw new Error('Injected download failure') } })
    await dialog.getByRole('button', { name: '导出这局', exact: true }).click()
    await expect(status).toHaveText('导出失败，请重试。当前对局和已保存归档未改变。')
    await expect(status).toBeInViewport({ ratio: 1 })
    await expect(dialog.getByRole('tab', { name: '历史复盘', exact: true })).toHaveAttribute('aria-selected', 'true')
    expect(await stored(page, sessionKey)).toBe(before)
    expect(await stored(page, archiveKey)).toBe(archivesBefore)
    expect(errors).toEqual([])
    await page.screenshot({ path: info.outputPath('historical-export-failure.png'), animations: 'disabled' })
  })

  test(`旧归档丢失先拒绝重置，再次确认重新留档并保留其他历史 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    const historical = await seed(page)
    const before = await stored(page, sessionKey)
    const backupBefore = await stored(page, beforeResetKey)
    const save = await openSave(page)
    await save.getByRole('button', { name: '保存本局', exact: true }).click()
    await expect(save.getByRole('status')).toContainText('本局已保存到本机浏览器')
    const records: GameArchiveRecord[] = JSON.parse(await stored(page, archiveKey))
    const missing = records.find((record) => record.sessionId === JSON.parse(before).id)!
    expect(missing).toBeDefined()
    await save.getByRole('button', { name: '关闭保存本局', exact: true }).click()
    await page.evaluate(({ archiveKey, id }) => {
      const records = JSON.parse(localStorage.getItem(archiveKey)!) as GameArchiveRecord[]
      localStorage.setItem(archiveKey, JSON.stringify(records.filter((record) => record.id !== id)))
    }, { archiveKey, id: missing.id })
    const afterDeletion = await stored(page, archiveKey)
    await page.getByRole('button', { name: '重置游戏', exact: true }).click()
    const reset = page.getByRole('dialog', { name: '重置游戏', exact: true })
    await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
    await expect(reset.getByRole('status')).toHaveText('归档校验失败或当前局已有变化，当前局未重置。再次确认会重新留档并核对。')
    await expect(reset.getByRole('status')).toBeInViewport({ ratio: 1 })
    expect(await stored(page, sessionKey)).toBe(before)
    expect(await stored(page, archiveKey)).toBe(afterDeletion)
    expect(await stored(page, beforeResetKey)).toBe(backupBefore)
    await page.screenshot({ path: info.outputPath('missing-archive-retry.png'), animations: 'disabled' })
    await reset.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
    const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    await expect(setup).toBeVisible()
    await expect(setup.getByRole('status').filter({ hasText: '本局已重置，记录已归档' })).toBeVisible()
    const current = JSON.parse(await stored(page, sessionKey))
    expect(current).toMatchObject({ playerCount: 0, seats: {}, timeline: [], nightRuns: {}, activeNightRunId: null })
    expect(current.id).not.toBe(JSON.parse(before).id)
    expect(await stored(page, beforeResetKey)).toBe(before)
    const after: GameArchiveRecord[] = JSON.parse(await stored(page, archiveKey))
    expect(after).toHaveLength(2)
    expect(after.find((record) => record.id === historical.id)).toEqual(historical)
    const recreated = after.find((record) => record.sessionId === JSON.parse(before).id)!
    expect(recreated.id).not.toBe(missing.id)
    expect(recreated.session).toEqual(JSON.parse(before))
  })
}
