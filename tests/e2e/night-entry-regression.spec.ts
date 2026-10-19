import { expect, test, type Page } from '@playwright/test'

const key = 'botc-copilot-session-v1'
async function read(page: Page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key) }

for (const width of [390, 1440]) {
  test(`夜间入口只显示已确认的本局 ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript((key) => {
      if (localStorage.getItem(key)) return
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 1, id: 'night-entry-regression', scriptId: 'trouble-brewing', playerCount: 0,
        knowledgeVersion: 'e2e/night-entry', scriptRoles: [], seats: {}, initialPlayerStates: {},
        phaseSegments: [], timeline: [], dayVoteDraft: null, dayActionDraft: null, setupDraft: null,
        nightRuns: {}, activeNightRunId: null,
      }))
    }, key)
    await page.goto('/')
    await page.getByRole('button', { name: '进入夜晚', exact: true }).click()
    let setup = page.getByRole('dialog', { name: '智能配板与调整' })
    await expect(setup).toHaveAccessibleDescription('暗流涌动 · 确认配板后可进入夜晚。')
    await expect(page.getByText('夜间工作台', { exact: true })).toHaveCount(0)
    expect((await read(page)).phaseSegments).toEqual([])
    expect((await read(page)).nightRuns).toEqual({})
    await page.screenshot({ path: testInfo.outputPath('setup-required.png'), animations: 'disabled' })

    await setup.getByRole('button', { name: '7人', exact: true }).click()
    await setup.getByRole('button', { name: '开始配板', exact: true }).click()
    await expect(setup.locator('.setup-candidate')).toHaveCount(3)
    await setup.getByRole('button', { name: '关闭智能配板与调整' }).click()
    await page.getByRole('button', { name: '进入夜晚', exact: true }).click()
    setup = page.getByRole('dialog', { name: '智能配板与调整' })
    await expect(setup).toBeVisible()
    expect((await read(page)).phaseSegments).toEqual([])
    expect((await read(page)).nightRuns).toEqual({})
    expect((await read(page)).timeline).toEqual([])

    await setup.locator('.setup-candidate').first().getByRole('button', { name: '选择这套配板', exact: true }).click()
    await setup.getByRole('button', { name: '确认配板', exact: true }).click()
    await expect(setup).toBeHidden()
    await page.getByRole('button', { name: '进入夜晚', exact: true }).click()
    await expect(page.getByRole('heading', { name: '第1夜', exact: true })).toBeVisible()
    await expect(page.locator('.night-header')).toContainText('暗流涌动 / Trouble Brewing · 7人')
    await expect(page.locator('.night-header__title > span')).toBeVisible()
    const session = await read(page)
    const run = session.nightRuns[session.activeNightRunId]
    expect(run.scriptId).toBe('trouble-brewing')
    expect(run.playerCount).toBe(7)
    expect(run.queue.length).toBeGreaterThan(0)
    const setupEntry = session.timeline.find((entry: { kind: string }) => entry.kind === 'setup_confirmed')
    for (const item of run.queue.filter((item: { systemStep?: unknown }) => !item.systemStep)) {
      expect(setupEntry.setup.draft.assignments.find((assignment: { seatId: number }) => assignment.seatId === item.seatId)?.role.id).toBe(item.roleId)
    }
    expect(session.timeline).toHaveLength(1)
    expect(session.phaseSegments).toHaveLength(1)
    await expect(page.getByText('第3夜', { exact: true })).toHaveCount(0)
    const bounds = await page.locator('.night-workbench').boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
    await page.screenshot({ path: testInfo.outputPath('current-game-night.png'), animations: 'disabled' })
    expect(errors).toEqual([])
  })
}
