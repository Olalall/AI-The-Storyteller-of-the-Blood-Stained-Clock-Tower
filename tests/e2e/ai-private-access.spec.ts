import { expect, test, type Page } from '@playwright/test'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { closeArchiveRuntime, startArchiveRuntime } from '../../server/runtime'

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
    const originalFetch = globalThis.fetch
    const savedEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('BOTC_AI_')))
    for (const key of Object.keys(savedEnv)) delete process.env[key]
    Object.assign(process.env, env)
    globalThis.fetch = async input => {
      expect(String(input)).toBe(env.BOTC_AI_BASE_URL + '/chat/completions')
      modelCalls++
      return new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }))
    }
    // 真实 HTTP 验收需先构建；不靠拦截桩模拟 WebKit 的 HttpOnly Cookie 行为。
    const options = { host: '127.0.0.1', port: 0, staticDir: path.resolve('dist'), publicAccessMode: true,
      dataFile: testInfo.outputPath('isolated-archives.json'), recoveryDataFile: testInfo.outputPath('isolated-recovery.json') }
    let server: ReturnType<typeof startArchiveRuntime> | undefined
    try {
      expect(existsSync(path.join(options.staticDir, 'index.html')), '先运行 npm run build').toBe(true)
      server = startArchiveRuntime(options)
      await once(server, 'listening')
      const address = server.address()
      if (!address || typeof address === 'string') throw new Error('隔离 HTTP 监听未就绪')
      const origin = `http://127.0.0.1:${address.port}`
      await page.goto(origin)
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
      const text = await (await page.request.get(origin + '/api/settings/ai')).text()
      for (const privateValue of [env.BOTC_AI_BASE_URL, env.BOTC_AI_API_KEY, passcode]) expect(text).not.toContain(privateValue)
      await input.fill(passcode)
      const authorization = page.waitForResponse(response => response.url() === origin + '/api/settings/ai/access' && response.status() === 200)
      await page.getByRole('button', { name: '验证并记住此设备', exact: true }).click()
      const cookieHeader = await (await authorization).headerValue('set-cookie')
      expect(cookieHeader).toContain('SameSite=Strict')
      expect(cookieHeader).toContain('HttpOnly')
      await expect(page.getByRole('button', { name: '取消此设备授权' })).toBeVisible()
      expect(modelCalls).toBe(0)
      const publicSite = !['localhost', '127.0.0.1', '[::1]'].includes(new URL(page.url()).hostname)
      const cookieName = publicSite ? '__Host-botc-ai' : 'botc-ai-local'
      const cookies = await page.context().cookies()
      const accessCookie = cookies.find(cookie => cookie.name === cookieName)!
      expect(accessCookie).toBeDefined()
      expect(accessCookie.httpOnly).toBe(true)
      expect(accessCookie.secure).toBe(publicSite)
      expect(accessCookie.expires).toBeGreaterThan(Date.now() / 1000 + 29 * 86400)
      const storage = await page.evaluate(() => JSON.stringify(localStorage))
      expect(storage).not.toContain(passcode)
      expect(storage).not.toContain(env.BOTC_AI_API_KEY)
      expect(storage).not.toContain(env.BOTC_AI_BASE_URL)
      expect(await page.evaluate(() => document.cookie)).not.toContain(accessCookie.value)
      await page.screenshot({ path: testInfo.outputPath('private-ai-verified.png'), fullPage: false })
      await page.getByRole('button', { name: '关闭AI API 设置', exact: true }).click()
      await expect(page.getByRole('dialog', { name: 'AI API 设置' })).toHaveCount(0)
      await closeArchiveRuntime(server)
      server = startArchiveRuntime({ ...options, port: address.port })
      await once(server, 'listening')
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
      const crossSite = await page.request.post(origin + '/api/ai/night-settlement-advice', {
        headers: { Origin: 'https://other.example.test', 'Sec-Fetch-Site': 'cross-site' }, data: {},
      })
      expect(crossSite.status()).toBe(403)
      expect(modelCalls).toBe(1)
      await page.getByRole('button', { name: '取消此设备授权' }).click()
      await expect(page.getByRole('button', { name: '验证并记住此设备' })).toBeVisible()
      expect((await page.context().cookies()).some(cookie => cookie.name === cookieName)).toBe(false)
      expect(await page.getByRole('dialog', { name: 'AI API 设置' }).evaluate(element => element.scrollWidth > element.clientWidth)).toBe(false)
    } finally {
      if (server?.listening) await closeArchiveRuntime(server)
      globalThis.fetch = originalFetch
      for (const key of Object.keys(process.env)) if (key.startsWith('BOTC_AI_')) delete process.env[key]
      Object.assign(process.env, savedEnv)
    }
  })
}
