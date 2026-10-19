import { expect, test, type Page } from '@playwright/test'
import type { GameSessionState } from '../../src/features/game-session/types'

const key = 'botc-copilot-session-v1'
function fixture(scriptId: string, marionette = false): GameSessionState {
  const ids = marionette ? ['empath', 'soldier', 'investigator', 'chef', 'monk', 'marionette', 'imp'] : ['empath', 'soldier', 'investigator', 'chef', 'monk', 'poisoner', 'imp']
  const names = ['共情者', '士兵', '调查员', '厨师', '僧侣', marionette ? '提线木偶' : '投毒者', '小恶魔']
  const roles = ids.map((id, index) => ({ id, name: names[index], initial: names[index][0], iconPath: '' }))
  const at = '2026-10-16T00:00:00.000Z'
  return {
    schemaVersion: 1, id: `identity-recovery-${scriptId}`, scriptId, playerCount: 7, knowledgeVersion: 'e2e/identity', scriptRoles: [],
    seats: Object.fromEntries(ids.map((_, i) => [i + 1, { seatId: i + 1, label: `${i + 1}号`, nickname: `玩家${i + 1}`, experience: 'regular' }])),
    initialPlayerStates: Object.fromEntries(ids.map((_, i) => [i + 1, { life: 'alive', poisoned: false, drunk: false, markers: [] }])),
    phaseSegments: [], timeline: [{ id: 'identity-setup-entry', kind: 'setup_confirmed', segmentId: null, createdAt: at, confirmedBy: 'storyteller',
      setup: { id: 'identity-setup', confirmedAt: at, draft: { candidateId: 'identity-e2e', revision: 1, updatedAt: at, assignments: roles.map((role, i) => ({ seatId: i + 1, role })), demonBluffs: ['washerwoman', 'librarian', 'undertaker'].map((id) => ({ id, name: id, initial: '?', iconPath: '' })) } } }],
    setupDraft: null, dayVoteDraft: null, dayActionDraft: null, nightRuns: {}, activeNightRunId: null,
  }
}
async function seed(page: Page, session: GameSessionState) {
  await page.addInitScript(({ key, session }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(session)) }, { key, session })
  await page.goto('/')
  await expect(page.getByRole('button', { name: '发身份', exact: true })).toBeEnabled()
}
async function read(page: Page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!) as GameSessionState, key) }

for (const width of [390, 1440]) {
  test(`微调后发最新身份，已确认伪装只读 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await seed(page, fixture('trouble-brewing'))
    await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
    const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    for (const select of await setup.getByRole('combobox').all()) await expect(select).toBeDisabled()
    await expect(setup.getByText('伪装已保存在开局记录中；本局调整不再修改这份已确认信息。')).toBeVisible()
    await setup.getByRole('button', { name: '1号 共情者', exact: true }).click()
    await setup.getByRole('button', { name: '2号 士兵', exact: true }).click()
    await setup.getByRole('button', { name: '确认调整', exact: true }).click()
    await expect(setup).toBeHidden()
    await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'setup_changed').length).toBe(2)
    await page.getByRole('button', { name: '发身份', exact: true }).click()
    await page.getByRole('button', { name: '打开单人展示', exact: true }).click()
    const privateView = page.getByRole('dialog', { name: '1号单人身份展示', exact: true })
    await privateView.getByRole('button', { name: '显示身份', exact: true }).click()
    await expect(privateView.getByText('士兵', { exact: true })).toBeVisible()
    await expect(privateView.getByText('共情者', { exact: true })).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath(`identity-current-${width}.png`), animations: 'disabled' })
  })

  test(`提线木偶先确认外显身份，刷新后仍保留 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await seed(page, fixture('devout-theists', true))
    await page.getByRole('button', { name: '发身份', exact: true }).click()
    const sheet = page.getByRole('dialog', { name: '发身份', exact: true })
    await sheet.getByRole('button', { name: /^6号 / }).click()
    await expect(sheet.getByRole('button', { name: '打开单人展示', exact: true })).toBeDisabled()
    const select = sheet.getByLabel('6号对外身份', { exact: true })
    await select.selectOption({ index: 1 })
    const shownName = await select.locator('option:checked').textContent()
    await sheet.getByRole('button', { name: '确认对外身份', exact: true }).click()
    await expect.poll(async () => (await read(page)).identityPresentations?.[6]?.shownRole.name).toBe(shownName)
    await sheet.getByRole('button', { name: '打开单人展示', exact: true }).click()
    let privateView = page.getByRole('dialog', { name: '6号单人身份展示', exact: true })
    await expect(sheet.getByRole('button', { name: /^6号 /, includeHidden: true })).toBeHidden()
    await privateView.getByRole('button', { name: '显示身份', exact: true }).click()
    await expect(privateView.getByText(shownName!, { exact: true })).toBeVisible()
    await expect(privateView.getByText('提线木偶', { exact: true })).toHaveCount(0)
    await page.screenshot({ path: testInfo.outputPath(`identity-private-${width}.png`), animations: 'disabled' })
    await page.reload()
    await page.getByRole('button', { name: '发身份', exact: true }).click()
    await page.getByRole('dialog', { name: '发身份', exact: true }).getByRole('button', { name: /^6号 / }).click()
    await page.getByRole('button', { name: '打开单人展示', exact: true }).click()
    privateView = page.getByRole('dialog', { name: '6号单人身份展示', exact: true })
    await privateView.getByRole('button', { name: '显示身份', exact: true }).click()
    await expect(privateView.getByText(shownName!, { exact: true })).toBeVisible()
    expect(errors).toEqual([])
  })
}
