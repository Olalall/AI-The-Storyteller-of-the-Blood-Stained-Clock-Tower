import { expect, test } from '@playwright/test'

test('production PWA can reopen the core host entry while offline', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.getByRole('main', { name: '开始新对局' })).toBeVisible()
  await expect(page.getByText('下载安装到手机/平板')).toBeVisible()
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole('main', { name: '开始新对局' })).toBeVisible()
  await expect(page.getByText('当前离线')).toBeVisible()
  await expect(page.getByText('本机存档和核心主持可继续使用；AI 与云端归档暂不可用。')).toBeVisible()
  await expect(page.getByText(/另一个窗口正在主持这局/)).toHaveCount(0)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
  await page.screenshot({ path: 'artifacts/screenshots/pwa-phone-390-offline.png', fullPage: true })
})

test('mobile settings previews a backup and only restores after confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await (await import('./helpers/entry-onboarding')).loadDemoSessionFromEntry(page)
  const raw = await page.evaluate(() => window.localStorage.getItem('botc-copilot-session-v1') ?? '')
  const imported = JSON.parse(raw) as { id: string }
  imported.id = 'mobile-import-proof'
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  const beforeImportId = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').id)

  await page.getByRole('button', { name: '打开设置与存档' }).click()
  await expect(page.getByRole('heading', { name: '应用设置' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '导出与恢复当前对局' })).toBeVisible()
  await page.getByLabel('选择备份文件').setInputFiles({
    name: 'mobile-backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(imported)),
  })

  await expect(page.getByLabel('待恢复对局摘要')).toBeVisible()
  await expect(page.getByText('尚未写入')).toBeVisible()
  await page.getByLabel('待恢复对局摘要').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'artifacts/screenshots/pwa-phone-390-import-preview.png' })
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('botc-copilot-session-v1')?.includes('mobile-import-proof'))).toBe(false)

  await page.getByRole('button', { name: '确认恢复这份对局' }).click()

  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').id)).toBe('mobile-import-proof')
  await expect(page.getByRole('main', { name: '开始新对局' })).not.toBeVisible()
  await page.getByRole('button', { name: '撤销这次恢复' }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').id)).toBe(beforeImportId)
  await expect(page.getByRole('main', { name: '开始新对局' })).toBeVisible()
})

test('an existing game can record a night result and a day vote after going offline', async ({ page, context }) => {
  await page.setViewportSize({ width: 412, height: 915 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await (await import('./helpers/entry-onboarding')).loadDemoSessionFromEntry(page)
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true)

  await context.setOffline(true)
  await page.reload()
  await expect(page.locator('.night-workbench')).toBeVisible()
  const beforeNight = await page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)
  await page.getByRole('button', { name: '选择3号玩家' }).click()
  await page.getByRole('button', { name: '调查员' }).click()
  await page.getByRole('button', { name: '未受影响' }).click()
  await page.getByRole('button', { name: '确认本项' }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}').timeline.length)).toBe(beforeNight + 1)

  await page.getByRole('button', { name: '返回', exact: true }).click()
  await page.getByRole('button', { name: '进入白天' }).click()
  await page.getByRole('button', { name: '选择1号为提名人' }).click()
  await page.getByRole('tab', { name: '被提名人 · 未选' }).click()
  await page.getByRole('button', { name: '选择4号为被提名人' }).click()
  await page.getByRole('button', { name: '下一步：记录举手' }).click()
  for (const seatId of [1, 2, 3, 4, 5, 6]) {
    await page.getByRole('button', { name: `记录${seatId}号举手` }).click()
  }
  await page.getByRole('button', { name: '记录本轮票型' }).click()

  await expect.poll(() => page.evaluate(() => {
    const state = JSON.parse(window.localStorage.getItem('botc-copilot-session-v1') ?? '{}')
    return state.timeline.some((entry: { kind: string }) => entry.kind === 'vote_round')
  })).toBe(true)
  await expect(page.getByText('当前离线')).toBeVisible()
})
