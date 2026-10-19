import { expect, test, type Page } from '@playwright/test'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

const storageKey = 'botc-copilot-session-v1'
async function read(page: Page) { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey) }

async function prepare(page: Page, mode: 'gambler' | 'philosopher' | 'preview') {
    const session = createPrototypeGameSession()
    session.timeline = session.timeline.filter((entry) => entry.kind === 'setup_confirmed')
    const run = session.nightRuns[session.activeNightRunId!]
    run.queue = run.queue.map((item) => ({ ...item, progress: 'pending', status: { life: 'alive', impairments: [], markers: [] } }))
    const item = run.queue.find((item) => item.roleId === (mode === 'philosopher' ? 'philosopher' : 'gambler'))!
    run.activeCursorId = run.previewEntryId = item.id
    run.privacyShielded = false
    run.drafts = mode === 'philosopher' ? {} : { [item.id]: {
      targets: [9], roleChoice: 'lunatic', outcomeId: 'correct', playerChoice: '选择9号 · 猜测角色：疯子',
      storytellerResult: '6号赌徒猜测9号是疯子：正确，无事发生。', informationGiven: '猜测正确。',
      draftRevision: 1, outputSource: { kind: 'preset', templateId: 'correct', specVersion: item.interactionVersion },
    } }
    if (mode === 'preview') {
      const preview = run.queue.find((item) => item.roleId === 'snakecharmer')!
      preview.applicability = 'needs_review'
      preview.status.life = 'dead'
      run.previewEntryId = preview.id
    }
  await page.goto('/')
  await page.evaluate(({ key, session }) => {
    localStorage.setItem(key, JSON.stringify(session))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 20000 }))
  }, { key: storageKey, session })
  await page.reload()
  await page.getByRole('button', { name: /^进入夜晚/ }).click()
  await expect(page.getByRole('heading', { name: '第3夜', exact: true })).toBeVisible()
}

for (const width of [390, 1440]) {
  for (const operation of ['edit', 'confirm'] as const) {
    test(`迟到的 AI 不覆盖${operation === 'edit' ? '目标修改' : '已确认进度'} ${width}px`, async ({ page }, testInfo) => {
      test.setTimeout(60000)
      await page.setViewportSize({ width, height: 900 })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      let release!: () => void
      const responseGate = new Promise<void>((resolve) => { release = resolve })
      await page.route('**/api/ai/night-settlement-advice', async (route) => {
        await responseGate
        await route.fulfill({ json: { accepted: true, data: { draft: {
          provider: 'openai-compatible', status: 'answer', recommendedOutcomeId: 'correct', summary: '原选择的草稿。',
        } } } })
      })
      await prepare(page, 'gambler')
      await expect(page.getByRole('button', { name: '展示信息', exact: true })).toHaveCount(0)
      const original = await read(page)
      const originalRun = original.nightRuns[original.activeNightRunId]
      const requested = page.waitForRequest('**/api/ai/night-settlement-advice')
      await page.getByRole('button', { name: 'AI推荐', exact: true }).click()
      await requested
      if (operation === 'edit') await page.getByRole('button', { name: '选择4号玩家', exact: true }).click()
      else await page.getByRole('button', { name: '确认并下一位', exact: true }).click()
      await expect.poll(async () => {
        const session = await read(page)
        return operation === 'edit'
          ? session.nightRuns[session.activeNightRunId].drafts[originalRun.activeCursorId]?.targets
          : session.timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').length
      }).toEqual(operation === 'edit' ? [4] : 1)
      const changed = await read(page)
      release()
      await expect(page.getByText('AI建议已失效', { exact: true })).toBeVisible()
      await expect.poll(async () => {
        const session = await read(page)
        const run = session.nightRuns[session.activeNightRunId]
        return { cursor: run.activeCursorId, targets: run.drafts[originalRun.activeCursorId]?.targets,
          progress: run.queue.find((item: { id: string }) => item.id === originalRun.activeCursorId).progress,
          records: session.timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').length }
      }).toEqual({
        cursor: changed.nightRuns[changed.activeNightRunId].activeCursorId,
        targets: operation === 'edit' ? [4] : [9], progress: operation === 'edit' ? 'draft' : 'confirmed', records: operation === 'edit' ? 0 : 1,
      })
      const bounds = await page.locator('.night-workbench').boundingBox()
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1)
      await page.screenshot({ path: testInfo.outputPath('night-safe-after-late-ai.png'), animations: 'disabled' })
      expect(errors).toEqual([])
    })
  }

  test(`不发动与预览操作不会虚构选择或误改另一位 ${width}px`, async ({ page }) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width, height: 900 })
    await prepare(page, 'philosopher')
    await page.getByRole('button', { name: '不发动', exact: true }).click()
    await expect(page.getByRole('button', { name: '确认本项', exact: true })).toBeEnabled()
    await page.getByRole('button', { name: '确认本项', exact: true }).click()
    await expect.poll(async () => (await read(page)).timeline.filter((entry: { kind: string }) => entry.kind === 'night_action').length).toBe(1)
    const confirmed = await read(page)
    const entry = confirmed.timeline.find((entry: { kind: string }) => entry.kind === 'night_action')
    expect(entry.record.snapshot.roleChoice).toBe('')
    expect(entry.record.snapshot.targets).toEqual([])
    expect(entry.record.snapshot.playerChoice).toBe('')
    await prepare(page, 'preview')
    const before = await read(page)
    await expect(page.getByRole('button', { name: '不适用', exact: true })).toBeDisabled()
    expect((await read(page)).nightRuns).toEqual(before.nightRuns)
  })
}
