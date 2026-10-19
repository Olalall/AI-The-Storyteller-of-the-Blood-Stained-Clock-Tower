import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import { createArchiveHandlers } from '../../server/archive/handlers'
import { createArchiveHttpRoutes } from '../../server/archive/httpArchiveRoutes'
import type { GameArchiveRecord } from '../../src/services/archive/types'

const sessionKey = 'botc-copilot-session-v1'
const archiveKey = 'botc-game-archives-v1'
const recoveryKey = 'botc-copilot-session-recovery-v1'

async function seed(page: Page, scriptId = 'catfishing', http = false) {
  await page.addInitScript(({ sessionKey, scriptId, http }) => {
    if (localStorage.getItem(sessionKey)) return
    localStorage.setItem(sessionKey, JSON.stringify({
      schemaVersion: 1, id: `data-safety-${scriptId}`, scriptId, playerCount: 7, knowledgeVersion: 'e2e/data-safety',
      seats: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i + 1, { seatId: i + 1, label: `${i + 1}号`, nickname: `测试玩家${i + 1}`, experience: 'regular' }])),
      initialPlayerStates: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i + 1, { life: 'alive', poisoned: false, drunk: false, markers: [] }])),
      phaseSegments: [], timeline: [], dayVoteDraft: null, dayActionDraft: null, setupDraft: null, nightRuns: {}, activeNightRunId: null,
    }))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: http ? 'http' : 'local', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { sessionKey, scriptId, http })
}
async function openEnd(page: Page) { await page.getByRole('button', { name: '保存本局', exact: true }).click() }
async function save(page: Page) {
  await page.getByRole('dialog', { name: '保存本局', exact: true }).getByRole('button', { name: '保存本局', exact: true }).click()
  await expect(page.locator('.game-end__notice')).toContainText('已保存')
}
async function poison(page: Page) {
  await page.getByRole('button', { name: /查看1号/ }).click()
  await page.getByRole('button', { name: '中毒', exact: true }).click()
  await page.getByRole('button', { name: '确认状态', exact: true }).click()
}

for (const width of [390, 1440]) {
  test(`重置自动归档同局新内容，旧版本保留且剧本正确 ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await seed(page, 'trouble-brewing')
    await page.goto('/')
    await openEnd(page); await save(page)
    await page.getByRole('button', { name: '关闭保存本局', exact: true }).click()
    await poison(page)
    await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).timeline.length, sessionKey)).toBe(1)
    await page.getByRole('button', { name: '关闭1号玩家', exact: true }).click()
    const latestSnapshot = await page.evaluate((key) => localStorage.getItem(key), sessionKey)
    await page.getByRole('button', { name: '重置游戏', exact: true }).click()
    await page.getByRole('button', { name: '确认重置并开新局', exact: true }).click()
    await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).playerCount, sessionKey)).toBe(0)
    const archives = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), archiveKey)
    expect(archives).toHaveLength(2)
    expect(archives.every((archive: GameArchiveRecord) => archive.scriptName === '暗流涌动 / Trouble Brewing')).toBe(true)
    expect(archives.map((archive: GameArchiveRecord) => archive.session.timeline.length).sort()).toEqual([0, 1])
    expect(await page.evaluate(() => localStorage.getItem('botc-session-before-restore-v1'))).toBe(latestSnapshot)
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).length, archiveKey)).toBe(2)
  })

  test(`全局存储故障保留界面、内存备份与重试 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await seed(page)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await expect(page.locator('.dashboard')).toBeVisible()
    await page.evaluate(() => {
      const original = Storage.prototype.setItem
      Object.assign(window, { storageFullForTest: true })
      Storage.prototype.setItem = function (key, value) {
        if ((window as unknown as { storageFullForTest: boolean }).storageFullForTest) throw new DOMException('Storage full', 'QuotaExceededError')
        original.call(this, key, value)
      }
    })
    await poison(page)
    const notice = page.getByRole('alert', { name: '对局保存失败' })
    await expect(notice).toBeVisible()
    expect(await page.locator('.dashboard').count()).toBe(1)
    const event = page.waitForEvent('download')
    await notice.getByRole('button', { name: '导出对局', exact: true }).click()
    const exported = JSON.parse(await readFile((await (await event).path())!, 'utf8'))
    expect(exported.timeline).toHaveLength(1)
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).timeline.length, sessionKey)).toBe(0)
    await page.screenshot({ path: info.outputPath('global-quota-recovery.png'), animations: 'disabled' })
    await page.evaluate(() => Object.assign(window, { storageFullForTest: false }))
    await notice.getByRole('button', { name: '重试保存', exact: true }).click()
    await expect(notice).toHaveCount(0)
    expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), sessionKey)).toEqual(exported)
    expect(errors).toEqual([])
  })

  test(`损坏大存档超配额时原文不被替换且仍可导出 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript((key) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, '{"id":"precious-original","scriptId":"catfishing","timeline":[broken' + 'x'.repeat(3 * 1024 * 1024))
    }, sessionKey)
    await page.goto('/')
    const dialog = page.getByRole('dialog', { name: '原存档无法读取', exact: true })
    await expect(dialog).toBeVisible()
    const originalLength = await page.evaluate((key) => localStorage.getItem(key)!.length, sessionKey)
    await page.reload()
    await expect(dialog).toBeVisible()
    const event = page.waitForEvent('download')
    await dialog.getByRole('button', { name: '导出原文', exact: true }).click()
    const raw = await readFile((await (await event).path())!, 'utf8')
    expect(raw.length).toBe(originalLength)
    expect(raw.startsWith('{"id":"precious-original"')).toBe(true)
    await dialog.getByRole('checkbox', { name: '我已保存导出文件，确认开始空白新局' }).check()
    await dialog.getByRole('button', { name: '留档并开始空白新局', exact: true }).click()
    await expect(dialog).toContainText('原存档尚未替换')
    expect(await page.evaluate((key) => localStorage.getItem(key)!.length, sessionKey)).toBe(originalLength)
    expect(await page.evaluate((key) => localStorage.getItem(key), recoveryKey)).toBeNull()
    expect(await dialog.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false)
    await page.screenshot({ path: info.outputPath('unreadable-original-protected.png'), animations: 'disabled' })
  })
}

test('HTTP归档区分新内容与重试同一命令，修改胜方会产生新版本', async ({ page }) => {
  const records = new Map<string, GameArchiveRecord>()
  const commandIds: string[] = []
  const handlers = createArchiveHttpRoutes(createArchiveHandlers({
    list: async () => [...records.values()], get: async (id) => records.get(id) ?? null,
    save: async (record) => { if (!records.has(record.id)) records.set(record.id, structuredClone(record)); return [...records.values()] },
  }))
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    if (request.method() === 'POST') commandIds.push(request.postDataJSON().commandId)
    const response = await handlers(new Request(request.url(), { method: request.method(), headers: request.headers(), body: request.postData() }))
    await route.fulfill({ status: response.status, body: await response.text(), contentType: 'application/json' })
  })
  await seed(page, 'catfishing', true)
  await page.goto('/')
  await openEnd(page); await save(page); await save(page)
  expect(records.size).toBe(1)
  expect(commandIds[0]).toBe(commandIds[1])
  await page.getByRole('radio', { name: /邪恶获胜/ }).click()
  await save(page)
  expect(records.size).toBe(2)
  expect(commandIds[2]).not.toBe(commandIds[1])
  expect([...records.values()].map((record) => record.winner).sort()).toEqual(['evil', 'undecided'])
})

test('损坏存档成功留档后也须导出并显式确认才建立空白新局', async ({ page }) => {
  const raw = '{"id":"small-original",broken'
  await page.addInitScript(({ key, raw }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, raw) }, { key: sessionKey, raw })
  await page.goto('/')
  const dialog = page.getByRole('dialog', { name: '原存档无法读取', exact: true })
  await expect(dialog).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(raw)
  await expect(dialog.getByRole('button', { name: '留档并开始空白新局', exact: true })).toBeDisabled()
  const event = page.waitForEvent('download')
  await dialog.getByRole('button', { name: '导出原文', exact: true }).click()
  expect(await readFile((await (await event).path())!, 'utf8')).toBe(raw)
  await dialog.getByRole('checkbox', { name: '我已保存导出文件，确认开始空白新局' }).check()
  await Promise.all([page.waitForEvent('load'), dialog.getByRole('button', { name: '留档并开始空白新局', exact: true }).click()])
  await expect(dialog).toHaveCount(0)
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).playerCount, sessionKey)).toBe(0)
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).raw, recoveryKey)).toBe(raw)
})
