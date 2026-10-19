import { expect, test, type Page } from '@playwright/test'
import { createAIProxyHandlers } from '../../server/ai/aiProxyHandlers'
import { createAIProxyRoutes } from '../../server/ai/aiProxyRoutes'

async function ready(page: Page) {
  await expect(page.locator('.dashboard')).toBeVisible()
  // 初始对局先完成正常保存；刷新后让原页面的异步租约释放/过期，沿用其他持久化回归的等待条件。
  await expect.poll(() => page.evaluate(() => localStorage.getItem('botc-copilot-session-v1'))).not.toBeNull()
  await expect(page.getByRole('dialog', { name: '编辑保护' })).toHaveCount(0, { timeout: 21_000 })
}

for (const width of [390, 1440]) {
  test(`private AI access is remembered without storing provider credentials ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      if (['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)) {
        localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 8000 }))
      }
    })
    const passcode = 'browser-test-only-private-access-secret'
    const env = { BOTC_AI_ENABLED: 'true', BOTC_AI_BASE_URL: 'https://fake-provider.example.test/v1', BOTC_AI_MODEL: 'fixed-server-model', BOTC_AI_API_KEY: 'fake-browser-provider-key', BOTC_AI_ACCESS_SECRET: passcode }
    let modelCalls = 0
    const handlers = createAIProxyHandlers({ env, fetcher: async () => {
      modelCalls++
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }))
    } })
    let aiRoute = createAIProxyRoutes(handlers, { env })
    await page.route('**/api/settings/ai**', async route => {
      const request = route.request()
      const response = await aiRoute(new Request(request.url(), {
        method: request.method(), headers: await request.allHeaders(),
        ...(request.method() === 'POST' ? { body: request.postData() ?? '' } : {}),
      }))
      await route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: await response.text() })
    })
    await page.goto('/')
    await ready(page)
    await page.getByRole('button', { name: '打开AI API设置' }).click()
    await expect(page.getByText('待验证访问', { exact: true })).toBeVisible()
    await expect(page.getByText('真实连通测试', { exact: true })).toHaveCount(0)
    const input = page.getByLabel('AI 访问口令', { exact: true })
    await input.fill('wrong')
    await page.getByRole('button', { name: '验证并记住此设备', exact: true }).click()
    await expect(page.getByText('访问口令不正确。', { exact: true })).toBeVisible()
    await expect(input).toHaveValue('')
    expect(modelCalls).toBe(0)
    await input.fill(passcode)
    await page.getByRole('button', { name: '验证并记住此设备', exact: true }).click()
    await expect(page.getByRole('button', { name: '取消此设备授权' })).toBeVisible()
    expect(modelCalls).toBe(0)
    const publicSite = !['localhost', '127.0.0.1', '[::1]'].includes(new URL(page.url()).hostname)
    const cookieName = publicSite ? '__Host-botc-ai' : 'botc-ai-local'
    const cookies = await page.context().cookies()
    const accessCookie = cookies.find(cookie => cookie.name === cookieName)!
    expect(accessCookie).toBeDefined()
    expect(accessCookie.httpOnly).toBe(true)
    expect(accessCookie.sameSite).toBe('Strict')
    expect(accessCookie.secure).toBe(publicSite)
    expect(accessCookie.expires).toBeGreaterThan(Date.now() / 1000 + 29 * 86400)
    const storage = await page.evaluate(() => JSON.stringify(localStorage))
    expect(storage).not.toContain(passcode)
    expect(storage).not.toContain(env.BOTC_AI_API_KEY)
    expect(await page.evaluate(() => document.cookie)).not.toContain(accessCookie.value)
    await page.screenshot({ path: testInfo.outputPath('private-ai-verified.png'), fullPage: false })
    await page.getByRole('button', { name: '关闭AI API 设置', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'AI API 设置' })).toHaveCount(0)
    aiRoute = createAIProxyRoutes(handlers, { env })
    await page.reload()
    await ready(page)
    await page.getByRole('button', { name: '打开AI API设置' }).click()
    await expect(page.getByRole('button', { name: '取消此设备授权' })).toBeVisible()
    await expect(page.getByLabel('AI 访问口令', { exact: true })).toHaveCount(0)
    await page.getByText('真实连通测试', { exact: true }).click()
    await page.getByLabel('我确认发起一次真实模型请求').check()
    await page.getByRole('button', { name: '测试当前模型' }).click()
    await expect(page.getByText('真实连通成功；模型已返回可解析 JSON。', { exact: true })).toBeVisible()
    expect(modelCalls).toBe(1)
    await page.getByRole('button', { name: '取消此设备授权' }).click()
    await expect(page.getByRole('button', { name: '验证并记住此设备' })).toBeVisible()
    expect((await page.context().cookies()).some(cookie => cookie.name === cookieName)).toBe(false)
    expect(await page.getByRole('dialog', { name: 'AI API 设置' }).evaluate(element => element.scrollWidth > element.clientWidth)).toBe(false)
  })
}
