import type { Page } from '@playwright/test'

export async function completeEntryOnboarding(page: Page, mode: 'record' | 'grimoire' = 'record') {
  const modeChoice = page.getByRole('radio', {
    name: mode === 'record' ? /桌上有实体魔典/ : /没有实体魔典/,
  })
  if (await modeChoice.isVisible().catch(() => false)) await modeChoice.click()
}

export async function loadDemoSessionFromEntry(page: Page, mode: 'record' | 'grimoire' = 'record') {
  if (!await page.getByRole('main', { name: '开始新对局' }).isVisible().catch(() => false)) return
  await completeEntryOnboarding(page, mode)
  const help = page.getByRole('button', { name: /新手教学/ })
  const demo = page.getByRole('button', { name: /载入示例对局/ })
  if (!await demo.isVisible().catch(() => false) && await help.isVisible().catch(() => false)) await help.click()
  for (const label of ['下一步：生成配板', '下一步：发送身份', '下一步：处理夜晚', '下一步：记录白天', '下一步：结束复盘']) {
    const next = page.getByRole('button', { name: label })
    if (await next.isVisible().catch(() => false)) await next.click()
  }
  if (await demo.isVisible().catch(() => false)) await demo.click()
}

export async function openSetupFromEntry(page: Page, mode: 'record' | 'grimoire' = 'record') {
  await completeEntryOnboarding(page, mode)
  await page.getByRole('button', { name: '继续：选择板子和人数' }).click()
}
