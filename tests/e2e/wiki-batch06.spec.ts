import { expect, test } from '@playwright/test'
import sources from '../../dev-docs/script-import-work/wiki-batch-06/sources.json' with { type: 'json' }
import { createEmptyGameSession } from '../../src/features/game-session/data/createPrototypeSession'
import type { GameSessionState } from '../../src/features/game-session/types'

const key = 'botc-copilot-session-v1'
for (const [index, row] of sources.boards.entries()) {
  test(`第六批 ${row.scriptId} 搜索开局、进入夜晚与刷新保留`, async ({ page }) => {
    const count = [7, 9, 12, 15][index % 4]
    const empty = createEmptyGameSession('2026-10-21T07:00:00.000Z')
    await page.addInitScript(({ key, empty }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(empty)) }, { key, empty })
    await page.route('**/api/ai/**', (route) => route.abort())
    await page.goto('/')
    await page.getByRole('button', { name: '智能配板与调整', exact: true }).click()
    const setup = page.getByRole('dialog', { name: '智能配板与调整', exact: true })
    await setup.getByRole('searchbox', { name: '搜索板子', exact: true }).fill(row.displayName)
    await setup.getByRole('combobox', { name: '开局板子', exact: true }).selectOption(row.scriptId)
    await setup.getByRole('button', { name: `${count}人`, exact: true }).click()
    await setup.getByRole('button', { name: '开始配板', exact: true }).click()
    await setup.getByRole('button', { name: '选择这套配板', exact: true }).first().click()
    await expect(setup.getByRole('button', { name: '确认配板', exact: true })).toBeEnabled()
    await setup.getByRole('button', { name: '确认配板', exact: true }).click()
    const stored = (): Promise<GameSessionState> => page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key)
    await expect.poll(async () => (await stored()).scriptId).toBe(row.scriptId)
    await page.getByRole('button', { name: /^进入夜晚/ }).click()
    await expect(page.getByLabel('夜间角色预览', { exact: true })).toBeVisible()
    await expect.poll(async () => Boolean((await stored()).activeNightRunId)).toBe(true)
    const before = await stored()
    expect(before.playerCount).toBe(count)
    expect(before.timeline.filter((entry) => entry.kind === 'setup_confirmed')).toHaveLength(1)
    expect(before.nightRuns[before.activeNightRunId!]!.queue.length).toBeGreaterThan(0)
    await page.reload()
    await expect(page.getByRole('main', { name: '本局', exact: true })).toBeVisible()
    await expect(page.getByRole('dialog', { name: '编辑保护', exact: true })).toHaveCount(0)
    const after = await stored()
    expect(after.id).toBe(before.id)
    expect(after.timeline).toEqual(before.timeline)
    expect(after.nightRuns).toEqual(before.nightRuns)
  })
}
