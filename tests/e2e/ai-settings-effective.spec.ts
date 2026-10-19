import { expect, test } from '@playwright/test'

for (const width of [390, 720, 1440]) {
  test(`AI settings show the effective model without changing runtime at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.addInitScript(() => {
      localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 8000 }))
      localStorage.setItem('botc-copilot-ai-settings-v1', JSON.stringify({ mode: 'openai-compatible', model: 'old-inactive-browser-model' }))
    })
    let liveRequests = 0
    await page.route('**/api/settings/ai', (route) => route.fulfill({
      json: { settings: { mode: 'backend_proxy', provider: 'openai-compatible', baseUrl: 'https://provider.example.test/v1', model: 'actual-backend-model', apiKeyConfigured: true, timeoutSeconds: 30, contextLimit: 12000 } },
    }))
    await page.route('**/api/settings/ai/test', (route) => route.fulfill({ json: { ok: true, message: '配置已就绪；本次未调用模型。' } }))
    await page.route('**/api/settings/ai/live-test', (route) => { liveRequests++; return route.fulfill({ json: { ok: true } }) })
    await page.goto('/')
    await page.getByRole('button', { name: '打开AI API设置' }).click()
    await expect(page.getByRole('heading', { name: 'actual-backend-model' })).toBeVisible()
    await expect(page.getByText('配置已就绪', { exact: true })).toBeVisible()
    await expect(page.getByLabel('模型名字')).toHaveCount(0)
    await expect(page.getByLabel('API KEY')).toHaveCount(0)
    await page.getByRole('button', { name: '检查配置（不调用模型）' }).click()
    await expect(page.getByText('配置已就绪；本次未调用模型。')).toBeVisible()
    await page.getByText('真实连通测试', { exact: true }).click()
    await expect(page.getByText(/可能产生 API 费用/)).toBeVisible()
    await expect(page.getByRole('button', { name: '测试当前模型' })).toBeDisabled()
    expect(liveRequests).toBe(0)
    const runtime = await page.evaluate(() => JSON.parse(localStorage.getItem('botc-copilot-archive-runtime-settings-v1')!))
    expect(runtime.mode).toBe('http')
    expect(runtime.baseUrl).toBe(new URL(page.url()).origin)
    await expect(page.getByRole('heading', { name: '角色图标', exact: true })).toBeVisible()
    const overflow = await page.getByRole('dialog', { name: 'AI API 设置' }).evaluate((element) => element.scrollWidth > element.clientWidth)
    expect(overflow).toBe(false)
    for (const section of await page.locator('.ai-settings-panel > section').all()) {
      const bounds = await section.boundingBox()
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    }
    await page.screenshot({ path: `artifacts/screenshots/ai-settings-effective-${width}.png`, fullPage: false })
  })
}
