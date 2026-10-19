import { expect, test, type Page } from '@playwright/test'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

const key = 'botc-copilot-session-v1'
async function saved(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key) }
async function prepare(page: Page) {
  const session = createPrototypeGameSession()
  session.timeline = session.timeline.filter(entry => entry.kind === 'setup_confirmed')
  const run = session.nightRuns[session.activeNightRunId!]
  const item = run.queue.find(item => item.roleId === 'dreamer')!
  run.activeCursorId = run.previewEntryId = item.id
  run.privacyShielded = false
  run.queue = run.queue.map(item => ({ ...item, progress: 'pending' }))
  run.drafts = {}
  await page.goto('/')
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 20000 }))
  }, { key, session })
  await page.reload()
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.getByRole('heading', { name: '第3夜', exact: true })).toBeVisible()
  return item.id
}

for (const width of [390, 1440]) {
  test(`双角色与补充事实可保存、确认和刷新 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const id = await prepare(page)
    await page.getByRole('button', { name: '选择12号玩家', exact: true }).click()
    await page.getByRole('group', { name: '善良角色' }).getByRole('button', { name: '厨师', exact: true }).click()
    await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeDisabled()
    await page.getByRole('group', { name: '邪恶角色' }).getByRole('button', { name: '小恶魔', exact: true }).click()
    await page.getByText('补充已核对事实（可选）', { exact: true }).click()
    const facts = '已核对：12号当前邪恶，给出的两角色为厨师或小恶魔；不改变任何身份。'
    await page.getByLabel('说书人已核对的事实', { exact: true }).fill(facts)
    await expect(page.getByText('未保存，尚未用于AI', { exact: true })).toBeVisible()
    expect((await saved(page)).nightRuns[(await saved(page)).activeNightRunId].drafts[id].storytellerContext).toBeUndefined()
    await page.getByRole('button', { name: '保存补充事实', exact: true }).click()
    await page.getByRole('button', { name: '信息已给', exact: true }).click()
    await expect(page.getByText('厨师 / 小恶魔', { exact: true }).last()).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('two-roles-and-saved-facts.png'), animations: 'disabled' })
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await saved(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').length).toBe(1)
    const entry = (await saved(page)).timeline.find((entry: { kind: string }) => entry.kind === 'night_action')
    expect(entry.record.snapshot).toMatchObject({ roleChoice: 'chef', secondRoleChoice: 'imp', storytellerContext: facts })
    await page.reload()
    const after = await saved(page)
    expect(after.timeline.find((item: { id: string }) => item.id === entry.id)).toEqual(entry)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })

  test(`保存补充事实后拒绝旧AI，保留新事实 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    let release!: () => void
    const gate = new Promise<void>(resolve => { release = resolve })
    await page.route('**/api/ai/night-settlement-advice', async route => {
      await gate
      await route.fulfill({ json: { accepted: true, data: { draft: { status: 'answer', recommendedOutcomeId: 'info', missing: [], summary: '旧输入建议。', journalDrafts: [], playerMessageDrafts: [], stateChangeDrafts: [] } } } })
    })
    const id = await prepare(page)
    await page.getByRole('button', { name: '选择12号玩家', exact: true }).click()
    await page.getByRole('group', { name: '善良角色' }).getByRole('button', { name: '厨师', exact: true }).click()
    await page.getByRole('group', { name: '邪恶角色' }).getByRole('button', { name: '小恶魔', exact: true }).click()
    const requested = page.waitForRequest('**/api/ai/night-settlement-advice')
    await page.getByRole('button', { name: 'AI推荐', exact: true }).click()
    const request = await requested
    expect(request.postDataJSON().draft).toMatchObject({ roleChoice: 'chef', secondRoleChoice: 'imp' })
    await page.getByText('补充已核对事实（可选）', { exact: true }).click()
    const facts = '已核对：最新事实以本次保存为准。'
    await page.getByLabel('说书人已核对的事实', { exact: true }).fill(facts)
    await page.getByRole('button', { name: '保存补充事实', exact: true }).click()
    await expect.poll(async () => {
      const session = await saved(page)
      return session.nightRuns[session.activeNightRunId].drafts[id]?.storytellerContext
    }).toBe(facts)
    const before = await saved(page)
    release()
    await expect(page.getByText('AI建议已失效', { exact: true })).toBeVisible()
    const after = await saved(page)
    expect(after.nightRuns[after.activeNightRunId].drafts[id].storytellerContext).toBe(facts)
    expect(after.nightRuns[after.activeNightRunId].drafts[id]).toEqual(before.nightRuns[before.activeNightRunId].drafts[id])
    expect(after.timeline).toEqual(before.timeline)
    await page.screenshot({ path: testInfo.outputPath('new-facts-reject-stale-ai.png'), animations: 'disabled' })
  })
}
