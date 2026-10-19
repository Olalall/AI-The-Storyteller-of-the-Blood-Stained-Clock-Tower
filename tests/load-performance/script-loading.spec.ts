import { expect, test, type Page } from '@playwright/test'
import { scriptManifest } from '../../src/domain/scripts/scriptManifest.generated'

const key = 'botc-copilot-session-v1'
const blank = (scriptId = 'catfishing') => ({ schemaVersion: 1, id: 'lazy-script-session', scriptId, playerCount: 0, knowledgeVersion: 'e2e/lazy', scriptRoles: [], seats: {}, initialPlayerStates: {}, phaseSegments: [], timeline: [], dayVoteDraft: null, dayActionDraft: null, setupDraft: null, nightRuns: {}, activeNightRunId: null })
async function seed(page: Page, scriptId = 'catfishing') {
  await page.addInitScript(({ key, value }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)) }, { key, value: blank(scriptId) })
}
async function raw(page: Page) { return page.evaluate((key) => localStorage.getItem(key), key) }
async function settleDialog(page: Page) {
  const dialog = page.getByRole('dialog').last()
  await dialog.evaluate(async (element) => { await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined))) })
  const box = await dialog.boundingBox()
  expect(box!.x).toBeGreaterThanOrEqual(-1)
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1)
  const button = await dialog.getByRole('button').last().boundingBox()
  expect(button!.height).toBeGreaterThanOrEqual(44)
  expect(button!.y + button!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
}
async function chooseSwitch(page: Page) {
  await page.getByRole('button', { name: '切换板子', exact: true }).click()
  await expect(page.locator('.script-library__script-card')).toHaveCount(scriptManifest.length)
  await page.locator('.script-library__script-card').filter({ has: page.getByRole('heading', { name: '暗度陈仓', exact: true }) }).getByRole('button').click()
  await page.getByRole('button', { name: '确认切换', exact: true }).click()
}

test('all scripts remain listed; cancelling a pending switch ignores its late response', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 900 })
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  await page.route('**/assets/an-du-chen-cang-*.js', async (route) => { await gate; await route.continue() })
  await seed(page); await page.goto('/')
  await expect(page.locator('.dashboard')).toBeVisible()
  expect(requests.some((url) => /\/(an-du-chen-cang|trouble-brewing)-.*\.js/.test(url))).toBe(false)
  const before = await raw(page)
  await chooseSwitch(page)
  const loading = page.getByRole('dialog', { name: /加载剧本/ })
  await expect(loading).toBeVisible()
  expect(await raw(page)).toBe(before)
  await settleDialog(page)
  await page.screenshot({ path: info.outputPath('script-loading-mobile.png') })
  await loading.getByRole('button', { name: '返回本局', exact: true }).click()
  const response = page.waitForResponse((response) => /an-du-chen-cang-.*\.js/.test(response.url()))
  release(); await response
  await expect(loading).toHaveCount(0)
  expect(await raw(page)).toBe(before)
  await chooseSwitch(page)
  await expect(page.getByLabel('开局板子')).toHaveValue('an-du-chen-cang')
  expect(requests.filter((url) => /an-du-chen-cang-.*\.js/.test(url))).toHaveLength(1)
  await page.getByRole('button', { name: '开始配板', exact: true }).click()
  await expect.poll(async () => JSON.parse((await raw(page))!).scriptId).toBe('an-du-chen-cang')
})

test('switch download failure leaves the current session unchanged', async ({ page }) => {
  await seed(page)
  await page.route('**/assets/an-du-chen-cang-*.js', (route) => route.abort('failed'))
  await page.goto('/'); await expect(page.locator('.dashboard')).toBeVisible()
  const before = await raw(page)
  await chooseSwitch(page)
  await expect(page.getByRole('alert')).toContainText('当前对局未被重置')
  await page.getByRole('button', { name: '返回本局', exact: true }).click()
  expect(await raw(page)).toBe(before)
})

test('saved nondefault script loads before opening the session', async ({ page }) => {
  await seed(page, 'trouble-brewing')
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/'); await expect(page.locator('.dashboard')).toBeVisible()
  expect(JSON.parse((await raw(page))!).scriptId).toBe('trouble-brewing')
  expect(requests.some((url) => /trouble-brewing-.*\.js/.test(url))).toBe(true)
  expect(requests.some((url) => /an-du-chen-cang-.*\.js/.test(url))).toBe(false)
})

test('startup failure preserves raw save and offers an export', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await seed(page, 'trouble-brewing')
  await page.route('**/assets/trouble-brewing-*.js', (route) => route.abort('failed'))
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('.dashboard')).toHaveCount(0)
  expect(await raw(page)).toBe(JSON.stringify(blank('trouble-brewing')))
  await settleDialog(page)
  await page.screenshot({ path: info.outputPath('script-startup-failed.png') })
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '导出已有存档' }).click()
  expect((await download).suggestedFilename()).toBe('botc-session-backup.json')
})

for (const fail of [false, true]) test(`restore another script waits for its data (failure=${fail})`, async ({ page }) => {
  await seed(page)
  if (fail) await page.route('**/assets/trouble-brewing-*.js', (route) => route.abort('failed'))
  await page.goto('/'); await expect(page.locator('.dashboard')).toBeVisible()
  const before = await raw(page)
  await page.getByRole('button', { name: '备份恢复' }).click()
  const imported = { ...blank('trouble-brewing'), id: 'restored-lazy-script' }
  await page.getByLabel('选择备份文件').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) })
  await page.getByRole('checkbox').check()
  const reloaded = fail ? null : page.waitForEvent('load')
  await page.getByRole('button', { name: '确认恢复', exact: true }).click()
  if (reloaded) await reloaded
  if (fail) {
    await expect(page.getByRole('alert')).toContainText('剧本资料加载失败')
    expect(await raw(page)).toBe(before)
    expect(await page.evaluate(() => localStorage.getItem('botc-session-before-restore-v1'))).toBeNull()
  } else {
    await expect.poll(async () => JSON.parse((await raw(page))!).id).toBe(imported.id)
    await expect(page.locator('.dashboard')).toBeVisible()
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('botc-session-before-restore-v1')!).scriptId)).toBe('catfishing')
  }
})
