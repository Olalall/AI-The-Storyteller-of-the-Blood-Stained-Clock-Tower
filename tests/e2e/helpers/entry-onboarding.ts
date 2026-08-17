import type { Page } from '@playwright/test'

export async function completeEntryOnboarding(page: Page, mode: 'record' | 'grimoire' = 'record') {
  const skipInstall = page.getByRole('button', { name: /暂不安装，先试用|继续设置主持方式/ })
  if (await skipInstall.isVisible().catch(() => false)) await skipInstall.click()

  const modeChoice = page.getByRole('radio', {
    name: mode === 'record' ? /桌上有实体魔典/ : /没有实体魔典/,
  })
  if (await modeChoice.isVisible().catch(() => false)) await modeChoice.click()
}

export async function loadDemoSessionFromEntry(page: Page, mode: 'record' | 'grimoire' = 'record') {
  await completeEntryOnboarding(page, mode)
  const help = page.getByText('第一次使用？查看完整流程和示例')
  const demo = page.getByRole('button', { name: /载入示例对局/ })
  if (!await demo.isVisible().catch(() => false) && await help.isVisible().catch(() => false)) await help.click()
  if (await demo.isVisible().catch(() => false)) await demo.click()
}

export async function openSetupFromEntry(page: Page, mode: 'record' | 'grimoire' = 'record') {
  await completeEntryOnboarding(page, mode)
  await page.getByRole('button', { name: '开始配板' }).click()
}
