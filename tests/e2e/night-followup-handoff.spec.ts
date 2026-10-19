import { expect, test, type Page } from '@playwright/test'
const key = 'botc-copilot-session-v1'
async function read(page: Page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key) }
for (const width of [390, 1440]) {
  test(`确认并下一位后的待办交接与连续更正 ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.evaluate(async (key) => {
      const path = '/src/features/game-session/data/createPrototypeSession.ts'
      const module = await import(/* @vite-ignore */ path)
      const session = module.createPrototypeGameSession()
      session.nightRuns[session.activeNightRunId].privacyShielded = false
      const original = session.timeline.find((entry: { kind: string }) => entry.kind === 'night_action')
      session.timeline.push({ ...original, id: 'correction-one', correctionOf: original.id, summary: '第一次更正：改为使用能力', record: { ...original.record, revision: 2 } }, { ...original, id: 'correction-two', correctionOf: 'correction-one', summary: '第二次更正：本夜无需改变状态', record: { ...original.record, revision: 3, snapshot: { ...original.record.snapshot, storytellerResult: '核对后本夜无需改变状态' } } })
      session.stateFollowups = [{ id: 'pending-old', sourceEntryId: original.id, seatId: 1, note: '旧记录的待办', createdAt: '2026-09-08T00:00:00Z' }, { id: 'completed-old', sourceEntryId: original.id, seatId: 2, note: '已处理的旧待办', createdAt: '2026-09-08T00:00:00Z', resolution: { kind: 'dismissed', reason: '已核对', at: '2026-09-08T00:01:00Z' } }]
      localStorage.setItem(key, JSON.stringify(session))
    }, key)
    await page.reload()
    await page.getByRole('button', { name: '进入夜晚' }).click()
    const before = await read(page)
    const recorder = page.locator('.wake-recorder')
    await recorder.locator('.seat-grid button').first().click()
    await recorder.locator('.choice-chips button').first().click()
    if (!(await recorder.locator('.outcome-grid button[aria-pressed="true"]').count())) await recorder.locator('.outcome-grid button:not([disabled])').first().click()
    await page.getByRole('button', { name: '确认并下一位', exact: true }).click()
    await expect.poll(async () => (await read(page)).timeline.length).toBe(before.timeline.length + 1)
    const confirmed = await read(page)
    const last = confirmed.timeline.at(-1)
    expect(confirmed.nightRuns[confirmed.activeNightRunId].activeCursorId).not.toBe(before.nightRuns[before.activeNightRunId].activeCursorId)
    const handoff = page.getByRole('region', { name: '夜晚确认后待办' })
    await expect(handoff).toContainText('10号')
    await handoff.scrollIntoViewIfNeeded()
    await handoff.getByRole('button', { name: '添加状态待办', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '状态待办', exact: true })
    await expect(dialog.getByLabel('已确认记录')).toHaveValue(last.id)
    await dialog.getByLabel('待处理玩家').selectOption('3')
    await dialog.getByLabel('待办内容').fill('核对刚确认的结果')
    await dialog.getByRole('button', { name: '确认添加待办' }).click()
    await expect.poll(async () => (await read(page)).stateFollowups.length).toBe(3)
    const added = await read(page)
    expect(added.stateFollowups.at(-1).sourceEntryId).toBe(last.id)
    expect(added.timeline).toEqual(confirmed.timeline)
    expect(added.nightRuns[added.activeNightRunId].activeCursorId).toBe(confirmed.nightRuns[confirmed.activeNightRunId].activeCursorId)
    await expect(dialog.getByText('2项待办的来源有更正（含已处理项）。')).toBeVisible()
    const oldTask = dialog.getByRole('list', { name: '状态待办清单' }).locator('li').filter({ hasText: '旧记录的待办' })
    await expect(oldTask.getByText(/来源已更正/)).toBeVisible()
    await oldTask.getByText('核对更正前后', { exact: true }).click()
    await expect(oldTask.getByText('第二次更正：本夜无需改变状态', { exact: true })).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('corrected-followup.png'), animations: 'disabled' })
    await dialog.getByText('已处理 1', { exact: true }).click()
    await expect(dialog.getByText('已处理的旧待办', { exact: false })).toBeVisible()
    await dialog.getByText('添加状态待办', { exact: true }).click()
    const originalId = before.stateFollowups[0].sourceEntryId
    await expect(dialog.getByLabel('已确认记录').locator(`option[value="${originalId}"]`)).toHaveJSProperty('disabled', true)
    await dialog.getByRole('button', { name: '关闭状态待办' }).click()
    expect((await read(page)).stateFollowups[1]).toEqual(before.stateFollowups[1])
    await handoff.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('confirmed-handoff.png') })
    expect(errors).toEqual([])
  })
}
