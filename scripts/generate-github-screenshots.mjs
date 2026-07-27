import { chromium } from '@playwright/test'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
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

async function clickIfVisible(page, locator) {
  if (await locator.isVisible().catch(() => false)) {
    await locator.click()
  }
}

async function capture(page, fileName) {
  await page.screenshot({ path: path.join(screenshotDir, fileName), fullPage: false })
}

async function main() {
  await mkdir(screenshotDir, { recursive: true })
  const devServer = await ensureAppServer()
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1 })

  try {
    await page.goto(baseUrl)
    await page.evaluate(() => window.localStorage.clear())
    await page.reload()
    await page.locator('.dashboard').waitFor({ state: 'visible' })
    await capture(page, '01-dashboard.png')

    await page.locator('.dashboard__setup-entry').click()
    await page.locator('.setup-panel').waitFor({ state: 'visible' })
    await page.locator('.setup-panel__advice-entry').click()
    await page.getByText('角色组合').waitFor({ state: 'visible' })
    await capture(page, '02-setup-advice.png')

    await clickIfVisible(page, page.getByRole('button', { name: '关闭配板详情' }))
    await clickIfVisible(page, page.getByRole('button', { name: '关闭AI配板与调整' }))
    await page.locator('.dashboard').waitFor({ state: 'visible' })

    await page.locator('.dashboard__phase-button').first().click()
    await page.locator('.night-workbench').waitFor({ state: 'visible' })
    await capture(page, '03-night-workbench.png')

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
    await capture(page, '04-day-vote.png')

    await page.goto(baseUrl)
    await page.locator('.dashboard').waitFor({ state: 'visible' })
    await page.locator('.dashboard__end-entry').click()
    await page.locator('.game-end').waitFor({ state: 'visible' })
    await page.locator('.game-end__winner-grid button').first().click()
    await page.getByRole('button', { name: '保存本局' }).click()
    await page.getByRole('button', { name: '历史复盘' }).click()
    await page.locator('.game-review').waitFor({ state: 'visible' })
    await capture(page, '05-review.png')
  } finally {
    await browser.close()
    if (devServer) devServer.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
