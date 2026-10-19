import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`fresh public device uses same-origin AI without changing local archive defaults ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const site = 'https://botc.first-visit.test'
    const preview = String(testInfo.project.use.baseURL)
    const apiRequests: string[] = []
    // 用当前生产构建提供静态文件，保留真实公网 HTTPS 页面地址；API 只返回假配置，不调用模型。
    await page.route(`${site}/**`, async route => {
      const url = new URL(route.request().url())
      if (url.pathname.startsWith('/api/')) {
        apiRequests.push(url.href)
        expect(url.pathname).toBe('/api/settings/ai')
        await route.fulfill({ json: {
          settings: { mode: 'backend_proxy', provider: 'openai-compatible', baseUrl: 'https://fake-provider.example.test/v1', model: 'first-visit-server-model', apiKeyConfigured: true },
          access: { required: true, authorized: false },
        } })
        return
      }
      const response = await page.request.get(new URL(`${url.pathname}${url.search}`, preview).href)
      await route.fulfill({ response })
    })
    await page.goto(`${site}/`)
    await expect(page.locator('.dashboard')).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('botc-copilot-archive-runtime-settings-v1'))).toBeNull()
    await page.getByRole('button', { name: '打开AI API设置' }).click()
    await expect(page.getByRole('heading', { name: '后端代理', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'first-visit-server-model', exact: true })).toBeVisible()
    await expect(page.getByLabel('AI 访问口令', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '测试当前模型' })).toHaveCount(0)
    expect(apiRequests).toEqual([`${site}/api/settings/ai`])
    expect(await page.evaluate(() => localStorage.getItem('botc-copilot-archive-runtime-settings-v1'))).toBeNull()
    expect(await page.getByRole('dialog', { name: 'AI API 设置' }).evaluate(element => element.scrollWidth > element.clientWidth)).toBe(false)
    await page.screenshot({ path: testInfo.outputPath('fresh-public-ai-settings.png'), fullPage: false })
  })
}
