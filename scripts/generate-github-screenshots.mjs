import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = 'http://127.0.0.1:4173'
const screenshotDir = path.resolve('docs/screenshots')

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

  const devServer = spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev -- --host 127.0.0.1 --port 4173'], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'ignore',
    windowsHide: true,
  })

  await waitForApp()
  return devServer
}

async function cleanScreenshotDir() {
  await mkdir(screenshotDir, { recursive: true })
  const files = await readdir(screenshotDir)
  await Promise.all(files.filter((file) => file.endsWith('.png')).map((file) => unlink(path.join(screenshotDir, file))))
}

async function capture(page, fileName) {
  await page.screenshot({ path: path.join(screenshotDir, fileName), fullPage: false })
}

async function gotoDashboard(page) {
  await page.goto(baseUrl)
  await page.locator('.dashboard').waitFor({ state: 'visible' })
}

async function main() {
  await cleanScreenshotDir()
  const devServer = await ensureAppServer()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1 })

  try {
    await gotoDashboard(page)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.locator('.dashboard').waitFor({ state: 'visible' })
    await capture(page, '01-dashboard.png')

    await page.locator('.dashboard__script-switch').click()
    await page.locator('.script-library').waitFor({ state: 'visible' })
    await capture(page, '02-script-library.png')

    await gotoDashboard(page)
    await page.locator('.dashboard__setup-entry').click()
    await page.locator('.setup-panel').waitFor({ state: 'visible' })
    await page.locator('.setup-panel__advice-entry').click()
    await page.getByText('角色组合').waitFor({ state: 'visible' })
    await capture(page, '03-setup-advice.png')

    await gotoDashboard(page)
    await page.locator('.dashboard__identity-entry').click()
    await page.locator('.identity-deal__seat-grid button').first().waitFor({ state: 'visible' })
    await capture(page, '04-identity-deal.png')

    await gotoDashboard(page)
    await page.locator('.dashboard__phase-button').first().click()
    await page.locator('.night-workbench').waitFor({ state: 'visible' })
    await capture(page, '05-night-workbench.png')

    await page.getByRole('button', { name: '返回本局', exact: true }).click()
    await page.locator('.dashboard').waitFor({ state: 'visible' })
    await page.locator('.dashboard__phase-button').nth(1).click()
    await page.locator('.day-workbench').waitFor({ state: 'visible' })
    await page.getByRole('button', { name: '选择1号为提名人' }).click()
    await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
    await page.getByRole('button', { name: '选择4号为被提名人' }).click()
    for (const seatId of [1, 2, 3, 4, 5]) {
      await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
    }
    await capture(page, '06-day-vote.png')

    await gotoDashboard(page)
    await page.locator('.dashboard__timer-entry').click()
    await page.locator('.public-timer-page').waitFor({ state: 'visible' })
    await capture(page, '07-public-timer.png')

    await gotoDashboard(page)
    await page.getByRole('button', { name: '打开AI API设置' }).click()
    await page.getByRole('heading', { name: 'AI API 设置' }).waitFor({ state: 'visible' })
    await capture(page, '08-ai-settings.png')

    await gotoDashboard(page)
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
    await page.getByRole('button', { name: '日记' }).click()
    await page.getByRole('dialog', { name: '日记' }).waitFor({ state: 'visible' })
    await capture(page, '11-journal.png')

    await gotoDashboard(page)
    await page.locator('.dashboard__end-entry').click()
    await page.locator('.game-end').waitFor({ state: 'visible' })
    await page.locator('.game-end__winner-grid button').first().click()
    await page.getByRole('button', { name: '保存本局' }).click()
    await page.getByRole('button', { name: '历史复盘' }).click()
    await page.locator('.game-review').waitFor({ state: 'visible' })
    await capture(page, '12-review.png')
  } finally {
    await browser.close()
    if (devServer) devServer.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
