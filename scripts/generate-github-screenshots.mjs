import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir, readdir, rename, rm, unlink } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = 'http://127.0.0.1:4174'
const screenshotDir = path.resolve('docs/screenshots')
const stagingDir = path.resolve('docs/.screenshots-staging')

async function isAppReady() {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(800) })
    return response.ok
  } catch {
    return false
  }
}

async function waitForApp(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isAppReady()) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  throw new Error(`Vite app did not become ready at ${baseUrl}`)
}

async function ensureAppServer() {
  if (await isAppReady()) return null

  const devServer = spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev -- --host 127.0.0.1 --port 4174'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'ignore',
    windowsHide: true,
  })

  await waitForApp()
  return devServer
}

async function cleanScreenshotDir() {
  await rm(stagingDir, { recursive: true, force: true })
  await mkdir(stagingDir, { recursive: true })
}

async function capture(page, fileName) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: path.join(stagingDir, fileName), fullPage: false })
}

async function waitForRoleIcons(page, selector, minimum) {
  await page.waitForFunction(
    ({ imageSelector, minimumCount }) => {
      const images = [...document.querySelectorAll(imageSelector)]
      return images.length >= minimumCount && images.every((image) => image.complete && image.naturalWidth > 0)
    },
    { imageSelector: selector, minimumCount: minimum },
  )
}

async function publishScreenshots() {
  await mkdir(screenshotDir, { recursive: true })
  const oldFiles = await readdir(screenshotDir)
  await Promise.all(oldFiles.filter((file) => file.endsWith('.png')).map((file) => unlink(path.join(screenshotDir, file))))
  const newFiles = await readdir(stagingDir)
  await Promise.all(newFiles.map((file) => rename(path.join(stagingDir, file), path.join(screenshotDir, file))))
}

async function loadDemoSessionFromEntry(page) {
  if (!await page.getByRole('main', { name: '开始新对局' }).isVisible().catch(() => false)) return

  await page.getByRole('radio', { name: /桌上有实体魔典/ }).click()
  await page.getByRole('button', { name: /新手教学/ }).click()
  for (const label of ['下一步：生成配板', '下一步：发送身份', '下一步：处理夜晚', '下一步：记录白天', '下一步：结束复盘']) {
    await page.getByRole('button', { name: label }).click()
  }
  await page.getByRole('button', { name: '载入示例对局' }).click()
}

async function gotoDashboard(page) {
  await page.goto(baseUrl)
  await loadDemoSessionFromEntry(page)
  const archiveEntry = page.getByRole('button', { name: '本局', exact: true })
  if (await archiveEntry.isVisible().catch(() => false)) await archiveEntry.click()
  await page.locator('.dashboard').waitFor({ state: 'visible' })
}

async function openDashboardTools(page) {
  const tools = page.locator('.dashboard__more-tools')
  if (!await tools.evaluate((element) => element.open)) await tools.locator('summary').click()
}

async function openGameEnd(page) {
  await page.getByRole('button', { name: '更多' }).click()
  await page.getByRole('button', { name: '收尾与复盘' }).click()
}

async function main() {
  await cleanScreenshotDir()
  const devServer = await ensureAppServer()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })

  try {
    await gotoDashboard(page)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await loadDemoSessionFromEntry(page)
    await page.getByRole('button', { name: '本局', exact: true }).click()
    await page.locator('.dashboard').waitFor({ state: 'visible' })
    await waitForRoleIcons(page, '.dashboard .role-disc__icon', 12)
    await capture(page, '01-dashboard.png')

    await openDashboardTools(page)
    await page.getByRole('button', { name: '切换板子' }).click()
    await page.locator('.script-library').waitFor({ state: 'visible' })
    await capture(page, '02-script-library.png')

    await gotoDashboard(page)
    await openDashboardTools(page)
    await page.getByRole('button', { name: 'AI配板与调整' }).click()
    await page.locator('.setup-panel').waitFor({ state: 'visible' })
    await page.locator('.setup-panel__advice-entry').click()
    await page.locator('.setup-candidate').first().waitFor({ state: 'visible' })
    await capture(page, '03-setup-advice.png')

    await gotoDashboard(page)
    await openDashboardTools(page)
    await page.getByRole('button', { name: '发身份' }).click()
    await page.locator('.identity-deal__seat-grid button').first().waitFor({ state: 'visible' })
    await capture(page, '04-identity-deal.png')

    await gotoDashboard(page)
    await openDashboardTools(page)
    await page.getByRole('button', { name: '进入夜晚' }).click()
    await page.locator('.night-workbench').waitFor({ state: 'visible' })
    await page.setViewportSize({ width: 1440, height: 960 })
    await page.getByRole('button', { name: '选择3号玩家' }).click()
    await page.getByRole('button', { name: '调查员' }).click()
    const unaffectedOutcome = page.getByRole('button', { name: '未受影响', exact: true })
    if (await unaffectedOutcome.getAttribute('aria-pressed') !== 'true') await unaffectedOutcome.click()
    await waitForRoleIcons(page, '.night-workbench .role-disc__icon', 3)
    await capture(page, '05-night-workbench.png')
    await page.setViewportSize({ width: 1440, height: 900 })

    await gotoDashboard(page)
    await openDashboardTools(page)
    await page.getByRole('button', { name: '进入白天' }).click()
    await page.locator('.day-workbench').waitFor({ state: 'visible' })
    await page.getByRole('button', { name: '选择1号为提名人' }).click()
    await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
    await page.getByRole('button', { name: '选择4号为被提名人' }).click()
    await page.getByRole('button', { name: '下一步：记录举手' }).click()
    for (const seatId of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
    }
    await capture(page, '06-day-vote.png')

    await gotoDashboard(page)
    await openDashboardTools(page)
    await page.getByRole('button', { name: '公聊倒计时' }).click()
    await page.locator('.public-timer-page').waitFor({ state: 'visible' })
    await capture(page, '07-public-timer.png')

    await gotoDashboard(page)
    await page.getByRole('button', { name: '打开应用设置' }).click()
    await page.getByRole('heading', { name: '应用设置' }).waitFor({ state: 'visible' })
    await capture(page, '08-ai-settings.png')

    await gotoDashboard(page)
    await openDashboardTools(page)
    await page.getByRole('button', { name: '开场白', exact: true }).click()
    await page.getByRole('heading', { name: '开场白' }).waitFor({ state: 'visible' })
    await page.getByRole('button', { name: '大字展示' }).click()
    await page.getByLabel('开场白大字展示').waitFor({ state: 'visible' })
    await capture(page, '09-opening-display.png')

    await gotoDashboard(page)
    await page.getByRole('button', { name: /查看4号/ }).click()
    await page.getByRole('dialog', { name: '4号玩家' }).waitFor({ state: 'visible' })
    await capture(page, '10-player-detail.png')

    await gotoDashboard(page)
    await page.getByRole('button', { name: /本局记录/ }).click()
    await page.getByRole('heading', { name: '日记' }).waitFor({ state: 'visible' })
    await capture(page, '11-journal.png')

    await gotoDashboard(page)
    await openGameEnd(page)
    await page.locator('.game-end').waitFor({ state: 'visible' })
    await page.locator('.game-end__winner-grid button').first().click()
    await page.getByRole('button', { name: '保存本局' }).click()
    await page.getByRole('button', { name: '历史复盘' }).click()
    await page.locator('.game-review').waitFor({ state: 'visible' })
    await capture(page, '12-review.png')

    await page.setViewportSize({ width: 390, height: 844 })
    await gotoDashboard(page)
    await waitForRoleIcons(page, '.dashboard .role-disc__icon', 12)
    await capture(page, '13-mobile-dashboard.png')

    await openDashboardTools(page)
    await page.getByRole('button', { name: '发身份' }).click()
    await page.locator('.identity-deal__seat-grid button').first().waitFor({ state: 'visible' })
    await page.getByRole('button', { name: '打开单人展示' }).click()
    await page.getByRole('button', { name: '显示身份' }).click()
    await waitForRoleIcons(page, '.identity-spotlight .role-disc__icon', 1)
    await capture(page, '14-mobile-identity-display.png')

    await gotoDashboard(page)
    await openGameEnd(page)
    await page.locator('.game-end').waitFor({ state: 'visible' })
    await capture(page, '15-mobile-game-end.png')
    await publishScreenshots()
  } finally {
    await browser.close()
    if (devServer) devServer.kill()
    await rm(stagingDir, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
