import { expect, test, type Locator, type Page } from '@playwright/test'

async function expectNoHorizontalOverflow(page: Page) {
  const report = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth
    const offenders = [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.width > 0 && (rect.right > viewportWidth + 1 || rect.left < -1)
      })
      .slice(0, 12)
      .map((element) => `${element.tagName.toLowerCase()}.${element.className || '-'}: ${Math.round(element.getBoundingClientRect().left)}..${Math.round(element.getBoundingClientRect().right)}`)
    return { overflow: document.documentElement.scrollWidth - viewportWidth, offenders }
  })
  expect(report.overflow, `横向越界元素：${report.offenders.join(' | ')}`).toBeLessThanOrEqual(1)
}

async function expectTouchTarget(locator: Locator) {
  const box = await locator.boundingBox()
  expect(box, '触控目标必须可见并有尺寸').not.toBeNull()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
}

async function expectInViewport(page: Page, locator: Locator) {
  const box = await locator.boundingBox()
  const viewport = page.viewportSize()
  expect(box, '主操作必须可见').not.toBeNull()
  expect(viewport, '测试必须配置明确视口').not.toBeNull()
  expect(box!.y).toBeGreaterThanOrEqual(0)
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height)
}

async function expectVisibleTouchTargets(page: Page) {
  const undersized = await page.evaluate(() => {
    const selector = 'button, summary, [role="button"], [role="radio"], [role="tab"], input:not([type="hidden"]), select'
    return [...document.querySelectorAll<HTMLElement>(selector)].flatMap((element) => {
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
      if (!visible || (rect.width >= 44 && rect.height >= 44)) return []
      if (element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)) {
        const label = element.closest('label') || (element.id ? document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`) : null)
        const labelRect = label?.getBoundingClientRect()
        if (labelRect && labelRect.width >= 44 && labelRect.height >= 44) return []
      }
      const name = element.getAttribute('aria-label') || element.textContent?.trim() || element.tagName
      return [`${name.slice(0, 40)} (${Math.round(rect.width)}×${Math.round(rect.height)})`]
    })
  })
  expect(undersized, '可见交互控件应至少为 44×44 CSS px').toEqual([])
}

function watchPage(page: Page) {
  const consoleErrors: string[] = []
  const badResponses: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`)
  })
  return () => {
    expect(consoleErrors, '不应出现控制台错误').toEqual([])
    expect(badResponses, '联网点击阶段不应出现 4xx/5xx').toEqual([])
  }
}

async function clearDevice(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function loadDemoThroughGuide(page: Page) {
  await page.getByRole('button', { name: /新手教学/ }).tap()
  for (const label of ['下一步：生成配板', '下一步：发送身份', '下一步：处理夜晚', '下一步：记录白天', '下一步：结束复盘']) {
    await page.getByRole('button', { name: label }).tap()
  }
  await page.getByRole('button', { name: '载入示例对局' }).tap()
}

test('human taps: new user sees the start task first and reaches setup without an install gate', async ({ page }, testInfo) => {
  const assertCleanPage = watchPage(page)
  await clearDevice(page)

  await expect(page.getByRole('heading', { name: '先选择主持方式' })).toBeVisible()
  await expect(page.getByText('安装到主屏幕（可稍后）')).toBeVisible()
  const start = page.getByRole('button', { name: '继续：选择板子和人数' })
  await expect(start).toBeDisabled()

  const recordMode = page.getByRole('radio', { name: /桌上有实体魔典/ })
  const grimoireMode = page.getByRole('radio', { name: /没有实体魔典/ })
  await expect(recordMode).toHaveAttribute('aria-checked', 'false')
  await expect(grimoireMode).toHaveAttribute('aria-checked', 'false')
  await expect(recordMode).toBeEnabled()
  await expectTouchTarget(recordMode)
  await expectTouchTarget(grimoireMode)
  await recordMode.tap()
  await grimoireMode.tap()
  await expect(grimoireMode).toHaveAttribute('aria-checked', 'true')
  await expect(start).toBeEnabled()
  await expectTouchTarget(start)
  await expectInViewport(page, start)

  const help = page.getByRole('button', { name: '新手教学 · 2分钟看懂一局' })
  await expectTouchTarget(help)
  await help.tap()
  await expect(page.getByRole('heading', { name: '先选择主持方式' })).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await expectVisibleTouchTargets(page)
  await page.screenshot({ path: `artifacts/screenshots/mobile-audit-${testInfo.project.name}-new-user-guide.png` })
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await expectNoHorizontalOverflow(page)
  await expectVisibleTouchTargets(page)
  await page.evaluate(() => { document.documentElement.style.fontSize = '' })
  await page.getByRole('button', { name: '关闭新手教学' }).tap()
  await expect(help).toBeFocused()

  await start.tap()
  await expect(page.getByRole('heading', { name: 'AI配板与调整' })).toBeVisible()
  const generate = page.getByRole('button', { name: '生成配板方案' })
  await expectInViewport(page, generate)
  await expectTouchTarget(generate)
  await expectNoHorizontalOverflow(page)
  await expectVisibleTouchTargets(page)
  await page.screenshot({ path: `artifacts/screenshots/mobile-audit-${testInfo.project.name}-setup-viewport.png` })
  await page.screenshot({ path: `artifacts/screenshots/mobile-audit-${testInfo.project.name}-setup.png`, fullPage: true })
  assertCleanPage()
})

test('human taps: returning user can reopen install help, change mode and draft seven players', async ({ page }, testInfo) => {
  const assertCleanPage = watchPage(page)
  let characterAssetRequests = 0
  page.on('request', (request) => {
    if (request.url().includes('/assets/characters/') && request.method() === 'HEAD') characterAssetRequests += 1
  })
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
    window.localStorage.setItem('botc-copilot-hosting-preferences-v1', JSON.stringify({
      defaultHostingMode: 'record',
      hasCompletedInstallIntro: true,
      hasCompletedFirstRunChoice: true,
    }))
  })
  await page.reload()

  await expect(page.getByRole('heading', { name: '开始一局新的主持' })).toBeVisible()
  await page.getByRole('button', { name: '打开设置与存档' }).tap()
  await expect(page.getByRole('heading', { name: '安装与离线使用' })).toBeVisible()
  await expect(page.getByText(/分享.*菜单.*添加到主屏幕|浏览器菜单.*安装应用/)).toBeVisible()
  const timeoutInput = page.getByText('超时秒数').locator('..').getByRole('spinbutton')
  await timeoutInput.scrollIntoViewIfNeeded()
  await timeoutInput.tap()
  await expect(timeoutInput).toBeFocused()
  await expectNoHorizontalOverflow(page)
  expect(characterAssetRequests, '打开设置不应自动逐个探测角色图标').toBe(0)
  await page.getByRole('button', { name: '关闭' }).tap()

  await page.getByRole('button', { name: '更改' }).tap()
  await page.getByRole('radio', { name: /没有实体魔典/ }).tap()
  await expect(page.getByLabel('当前主持方式')).toContainText('电子魔典')
  await page.getByRole('button', { name: '继续：选择板子和人数' }).tap()

  await page.getByRole('button', { name: '7人' }).tap()
  await page.getByText('玩家昵称与经验').tap()
  const nickname = page.getByLabel('1号昵称')
  await nickname.tap()
  await nickname.fill('手机测试员')
  await page.getByRole('button', { name: '生成配板方案' }).tap()
  await expect(page.locator('.setup-candidate')).toHaveCount(3)
  await expect(page.locator('.setup-candidate .setup-candidate__roles')).toHaveCount(1)
  await expectNoHorizontalOverflow(page)
  await expectVisibleTouchTargets(page)
  await page.screenshot({ path: `artifacts/screenshots/mobile-audit-${testInfo.project.name}-candidates.png`, fullPage: true })
  assertCleanPage()
})

test('human taps: an existing game still records night and vote after going offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'android-390', '完整离线主持只在代表性 390px Android 项目跑一次')
  await clearDevice(page)
  await page.getByRole('radio', { name: /桌上有实体魔典/ }).tap()
  await loadDemoThroughGuide(page)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await page.getByRole('button', { name: '选择3号玩家' }).tap()
  await page.getByRole('button', { name: '调查员' }).tap()
  await page.getByRole('button', { name: '未受影响' }).tap()
  await page.getByRole('button', { name: '确认并停留' }).tap()
  await page.getByRole('button', { name: '返回', exact: true }).tap()
  await page.getByRole('button', { name: '进入白天' }).tap()
  await page.getByRole('button', { name: '选择1号为提名人' }).tap()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).tap()
  await page.getByRole('button', { name: '选择4号为被提名人' }).tap()
  await page.getByRole('button', { name: '下一步：记录举手' }).tap()
  for (const seatId of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).tap()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).tap()

  await expect(page.getByText('当前离线')).toBeVisible()
  await expectNoHorizontalOverflow(page)
  await expectVisibleTouchTargets(page)
  await page.screenshot({ path: 'artifacts/screenshots/mobile-audit-android-390-offline-vote.png', fullPage: true })
})

test('large text: active game remains usable at 200 percent text size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'ipad-768', '手机大字体回流重点覆盖 360px 和 390px')
  await clearDevice(page)
  await page.getByRole('radio', { name: /桌上有实体魔典/ }).tap()
  await loadDemoThroughGuide(page)
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await expectNoHorizontalOverflow(page)
  await expect(page.getByRole('navigation', { name: '主持阶段' })).toBeVisible()
  await page.getByRole('button', { name: '本局', exact: true }).tap()
  await expectNoHorizontalOverflow(page)
  await page.screenshot({ path: `artifacts/screenshots/mobile-audit-${testInfo.project.name}-large-text.png`, fullPage: true })
})
