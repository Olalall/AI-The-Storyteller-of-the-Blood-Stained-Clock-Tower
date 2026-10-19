import { expect, test, type Page } from '@playwright/test'
import { createEmptyGameSession, createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../src/features/game-session/types'

const sessionKey = 'botc-copilot-session-v1'
const archiveKey = 'botc-game-archives-v1'
const beforeResetKey = 'botc-session-before-restore-v1'
const setupTitle = '智能配板与调整'

async function seed(page: Page, empty = false) {
  const session = empty ? createEmptyGameSession('2026-10-19T08:00:00.000Z') : createPrototypeGameSession()
  const previousBackup = JSON.stringify({ ...session, id: 'navigation-existing-recovery-copy' })
  await page.addInitScript(({ session, previousBackup, sessionKey, beforeResetKey }) => {
    if (!localStorage.getItem(sessionKey)) {
      localStorage.setItem(sessionKey, JSON.stringify(session))
      localStorage.setItem(beforeResetKey, previousBackup)
    }
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'local', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { session, previousBackup, sessionKey, beforeResetKey })
  let paidRequests = 0
  await page.route('**/api/ai/**', (route) => { paidRequests++; return route.abort() })
  await page.route('**/api/**/live-test', (route) => { paidRequests++; return route.abort() })
  await page.goto('/')
  await expect(page.locator('.dashboard')).toBeVisible()
  return { previousBackup, paidRequests: () => paidRequests }
}

async function snapshot(page: Page) { return page.evaluate((key) => localStorage.getItem(key)!, sessionKey) }
async function session(page: Page): Promise<GameSessionState> { return JSON.parse(await snapshot(page)) }
async function archives(page: Page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), archiveKey) }

async function chooseSwitchTarget(page: Page, label: string) {
  const library = page.getByRole('dialog', { name: '切换板子', exact: true })
  const card = library.locator('.script-library__script-card').filter({ has: page.getByRole('heading', { name: label, exact: true }) })
  await card.getByRole('button', { name: '切换到此板子', exact: true }).click()
  await page.getByRole('button', { name: '前往重置确认', exact: true }).click()
  const reset = page.getByRole('dialog', { name: '重置游戏', exact: true })
  await expect(reset).toContainText(`完成后进入“${label}”的新局配板。`)
  return reset
}

async function holdChunk(page: Page, name: string, pack = false) {
  let release = () => {}
  const barrier = new Promise<void>((resolve) => { release = resolve })
  let intercepted = false
  await page.route((url) => pack
    ? url.pathname.includes(`/packs/${name}/`) || new RegExp(`/${name}-[^/]+\\.js$`).test(url.pathname)
    : url.pathname.endsWith(`/${name}.tsx`) || new RegExp(`/${name}-[^/]+\\.js$`).test(url.pathname), async (route) => {
    intercepted = true
    await barrier
    await route.continue()
  })
  return { release, intercepted: () => intercepted }
}

for (const width of [390, 905, 1440]) {
  test(`未配板误入白天不会锁住开局，昼夜提示在当前页可见 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    const checks = await seed(page, true)
    const before = await snapshot(page)
    await page.getByRole('button', { name: '进入白天', exact: true }).click()
    let setup = page.getByRole('dialog', { name: setupTitle, exact: true })
    await expect(setup).toBeVisible()
    await expect(setup.getByText('请先确认本局配板，再进入白天。', { exact: true })).toBeVisible()
    await expect(page.locator('.day-workbench')).toHaveCount(0)
    expect(await snapshot(page)).toBe(before)
    await page.screenshot({ path: info.outputPath('day-setup-guidance.png'), animations: 'disabled' })
    await setup.getByRole('button', { name: '7人', exact: true }).click()
    await setup.getByRole('button', { name: '开始配板', exact: true }).click()
    await expect(setup.locator('.setup-candidate')).toHaveCount(3)
    const shell = await snapshot(page)
    expect(await session(page)).toMatchObject({ playerCount: 7, phaseSegments: [], timeline: [], nightRuns: {}, activeNightRunId: null })
    await setup.getByRole('button', { name: `关闭${setupTitle}`, exact: true }).click()

    for (const phase of ['白天', '夜晚']) {
      await page.getByRole('button', { name: `进入${phase}`, exact: true }).click()
      setup = page.getByRole('dialog', { name: setupTitle, exact: true })
      await expect(setup.getByText(`请先确认本局配板，再进入${phase}。`, { exact: true })).toBeVisible()
      expect(await snapshot(page)).toBe(shell)
      await setup.getByRole('button', { name: `关闭${setupTitle}`, exact: true }).click()
    }
    await expect(page.locator('.dashboard')).toBeVisible()
    expect(await archives(page)).toEqual([])
    expect(checks.paidRequests()).toBe(0)
  })

  test(`切换板子取消重置回到选板，再选目标不会串板或写入 ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1082 })
    const checks = await seed(page)
    const before = await snapshot(page)
    await page.getByRole('button', { name: '切换板子', exact: true }).click()
    let reset = await chooseSwitchTarget(page, '暗度陈仓')
    await reset.getByRole('button', { name: '返回选板', exact: true }).click()
    await expect(reset).toBeHidden()
    await expect(page.getByRole('dialog', { name: '切换板子', exact: true })).toBeVisible()
    await expect(page.getByRole('dialog', { name: '确认切换板子', exact: true })).toHaveCount(0)
    await page.screenshot({ path: info.outputPath('switch-reset-canceled.png'), animations: 'disabled' })
    reset = await chooseSwitchTarget(page, '暗流涌动 / Trouble Brewing')
    await reset.getByRole('button', { name: '关闭重置游戏', exact: true }).click()
    const library = page.getByRole('dialog', { name: '切换板子', exact: true })
    await expect(library).toBeVisible()
    await library.getByRole('button', { name: '关闭切换板子', exact: true }).click()
    await page.getByRole('button', { name: '重置游戏', exact: true }).click()
    reset = page.getByRole('dialog', { name: '重置游戏', exact: true })
    await expect(reset).toBeVisible()
    await expect(reset).not.toContainText('完成后进入“')
    await reset.getByRole('button', { name: '暂不重置', exact: true }).click()
    await expect(page.locator('.dashboard')).toBeVisible()
    expect(await snapshot(page)).toBe(before)
    expect(await archives(page)).toEqual([])
    expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(checks.previousBackup)
    expect(checks.paidRequests()).toBe(0)
  })
}

for (const mode of [
  { entry: '保存本局', title: '保存本局' },
  { entry: '本局记录', title: '历史复盘' },
  { entry: '重置游戏', title: '重置游戏' },
]) {
  test(`首次加载${mode.title}时标题与操作一致，取消返回本局不改数据`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 1082 })
    const checks = await seed(page)
    const before = await snapshot(page)
    const chunk = await holdChunk(page, 'GameEndSheet')
    try {
      await page.getByRole('button', { name: mode.entry, exact: true }).click()
      await expect.poll(chunk.intercepted).toBe(true)
      const loading = page.getByRole('dialog', { name: mode.title, exact: true })
      await expect(loading.getByRole('status')).toBeVisible()
      await expect(loading).toHaveAccessibleDescription('正在加载，请稍候。')
      await page.screenshot({ path: info.outputPath('mode-loading.png'), animations: 'disabled' })
      await loading.getByRole('button', { name: '返回上一步', exact: true }).click()
      await expect(page.getByRole('dialog')).toHaveCount(0)
      chunk.release()
      await page.waitForLoadState('networkidle')
      await expect(page.locator('.dashboard')).toBeVisible()
      expect(await snapshot(page)).toBe(before)
      expect(await archives(page)).toEqual([])
      expect(checks.paidRequests()).toBe(0)
    } finally { chunk.release() }
  })
}

test('开局加载新板取消时明确返回配板，迟到资料不改变选择或原局', async ({ page }, info) => {
  await page.setViewportSize({ width: 905, height: 1082 })
  const checks = await seed(page, true)
  const before = await snapshot(page)
  await page.getByRole('button', { name: setupTitle, exact: true }).click()
  const setup = page.getByRole('dialog', { name: setupTitle, exact: true })
  const select = setup.getByRole('combobox', { name: '开局板子', exact: true })
  await expect(select).toHaveValue('catfishing')
  const chunk = await holdChunk(page, 'trouble-brewing', true)
  try {
    await select.selectOption('trouble-brewing')
    await expect.poll(chunk.intercepted).toBe(true)
    const loading = page.getByRole('dialog', { name: '加载剧本：暗流涌动 / Trouble Brewing', exact: true })
    await expect(loading).toBeVisible()
    await loading.getByRole('button', { name: '返回配板', exact: true }).click()
    await expect(loading).toBeHidden()
    await expect(setup).toBeVisible()
    await expect(select).toHaveValue('catfishing')
    chunk.release()
    await page.waitForLoadState('networkidle')
    await expect(select).toHaveValue('catfishing')
    await setup.getByRole('searchbox', { name: '搜索板子', exact: true }).fill('瓦釜')
    await expect(select.getByRole('option', { name: '瓦釜雷鸣', exact: true })).toHaveAttribute('value', 'catfishing')
    expect(await snapshot(page)).toBe(before)
    expect(await archives(page)).toEqual([])
    expect(checks.paidRequests()).toBe(0)
    await page.screenshot({ path: info.outputPath('script-load-canceled.png'), animations: 'disabled' })
  } finally { chunk.release() }
})

test('从选板页加载目标取消后仍可选板，不提前打开重置确认', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1082 })
  const checks = await seed(page)
  const before = await snapshot(page)
  await page.getByRole('button', { name: '切换板子', exact: true }).click()
  const library = page.getByRole('dialog', { name: '切换板子', exact: true })
  const chunk = await holdChunk(page, 'an-du-chen-cang', true)
  try {
    const card = library.locator('.script-library__script-card').filter({ has: page.getByRole('heading', { name: '暗度陈仓', exact: true }) })
    await card.getByRole('button', { name: '切换到此板子', exact: true }).click()
    await page.getByRole('button', { name: '前往重置确认', exact: true }).click()
    await expect.poll(chunk.intercepted).toBe(true)
    const loading = page.getByRole('dialog', { name: '加载剧本：暗度陈仓', exact: true })
    await expect(loading).toBeVisible()
    await loading.getByRole('button', { name: '返回选板', exact: true }).click()
    await expect(loading).toBeHidden()
    await expect(library).toBeVisible()
    chunk.release()
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('dialog', { name: '重置游戏', exact: true })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: '确认切换板子', exact: true })).toHaveCount(0)
    expect(await snapshot(page)).toBe(before)
    expect(await archives(page)).toEqual([])
    expect(await page.evaluate((key) => localStorage.getItem(key), beforeResetKey)).toBe(checks.previousBackup)
    expect(checks.paidRequests()).toBe(0)
  } finally { chunk.release() }
})
