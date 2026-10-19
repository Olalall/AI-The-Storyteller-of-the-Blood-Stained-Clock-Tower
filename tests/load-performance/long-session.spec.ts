import { readFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'
import type { GameSessionState } from '../../src/features/game-session/types'
import { fillCurrentWakeInputs } from '../helpers/nightInputs'

test.describe.configure({ mode: 'parallel' })
const key = 'botc-copilot-session-v1'
async function read(page: Page): Promise<GameSessionState> { return page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), key) }
async function ready(page: Page) {
  await expect(page.locator('.dashboard')).toBeVisible()
  await expect(page.getByRole('dialog', { name: '编辑保护' })).toHaveCount(0, { timeout: 21_000 })
}
async function reloadAndCheck(page: Page, before: GameSessionState) {
  await page.reload()
  await ready(page)
  expect(await read(page)).toEqual(before)
}
async function layout(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width)
}
async function skipReviewedItem(page: Page) {
  const review = page.getByRole('button', { name: '不适用', exact: true })
  if (!(await review.isVisible().catch(() => false))) return false
  // 模拟说书人明确确认已死亡玩家本夜不适用，不自动处理权威状态。
  await review.tap()
  await page.getByRole('button', { name: /进入下一位/ }).tap()
  return true
}
async function settleNight(page: Page) {
  const before = await read(page), runId = before.activeNightRunId!
  const queue = before.nightRuns[runId].queue
  let confirmed = 0
  for (let step = 0; step < queue.length; step++) {
    const run = (await read(page)).nightRuns[runId]
    if (run.queue.every((item) => ['confirmed', 'not_applicable'].includes(item.progress))) break
    if (await skipReviewedItem(page)) continue
    await fillCurrentWakeInputs(page, true)
    const next = page.getByRole('button', { name: '确认并下一位', exact: true })
    const button = await next.isEnabled().catch(() => false) ? next : page.getByRole('button', { name: '确认本项', exact: true })
    await expect(button).toBeEnabled()
    const box = await button.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
    await button.tap()
    confirmed++
    await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'night_action' && entry.nightRunId === runId).length).toBe(confirmed)
  }
  expect((await read(page)).nightRuns[runId].queue.filter((item) => !['confirmed', 'not_applicable'].includes(item.progress))).toEqual([])
  return confirmed
}

for (const width of [390, 820]) test.describe(`touch long game ${width}`, () => {
  test.use({ viewport: { width, height: 900 }, hasTouch: true, isMobile: true, actionTimeout: 15_000, navigationTimeout: 15_000 })
  test('six days preserve drafts, confirmed records and archive through interruptions', async ({ page, context }, info) => {
    test.setTimeout(240_000)
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.addInitScript(({ key }) => {
      // Browser-generated offline error documents have no origin storage. Only the test seeder skips them.
      let storage: Storage
      try { storage = window.localStorage } catch { return }
      if (!storage.getItem(key)) storage.setItem(key, JSON.stringify({ schemaVersion: 1, id: 'touch-long-game', scriptId: 'trouble-brewing', playerCount: 0, knowledgeVersion: 'e2e/long-game', scriptRoles: [], seats: {}, initialPlayerStates: {}, phaseSegments: [], timeline: [], dayVoteDraft: null, dayActionDraft: null, setupDraft: null, nightRuns: {}, activeNightRunId: null }))
    }, { key })
    await page.goto('/'); await ready(page)
    await page.getByRole('button', { name: '智能配板与调整', exact: true }).tap()
    await page.getByLabel('开局板子').selectOption('trouble-brewing')
    await expect(page.getByLabel('开局板子')).toHaveValue('trouble-brewing')
    await page.getByRole('button', { name: '开始配板', exact: true }).tap()
    await page.locator('.setup-candidate').first().getByRole('button', { name: '选择组合', exact: true }).tap()
    await page.getByRole('button', { name: '确认配板', exact: true }).tap()
    await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'setup_confirmed').length).toBe(1)
    let totalNightActions = 0
    for (let day = 1; day <= 6; day++) {
      console.info(`Touch ${width}: night/day ${day}`)
      await test.step(`night ${day}`, async () => {
        await page.getByRole('button', { name: /^进入夜晚/ }).tap()
        await expect(page.getByRole('heading', { name: `第${day}夜`, exact: true })).toBeVisible()
        await layout(page)
        if (day === 2) {
          while (await skipReviewedItem(page)) { /* 先定位可记录的唤醒项 */ }
          await fillCurrentWakeInputs(page, true)
          await expect.poll(async () => { const state = await read(page), run = state.nightRuns[state.activeNightRunId!]; return run.drafts[run.activeCursorId!]?.outcomeId }).toBeTruthy()
          const draft = await read(page)
          await reloadAndCheck(page, draft)
          await page.getByRole('button', { name: /^进入夜晚/ }).tap()
          await expect(page.getByRole('heading', { name: `第${day}夜`, exact: true })).toBeVisible()
          expect((await read(page)).activeNightRunId).toBe(draft.activeNightRunId)
        }
        totalNightActions += await settleNight(page)
        await page.getByRole('button', { name: '检查并关闭', exact: true }).tap()
        await page.getByRole('button', { name: '确认关闭', exact: true }).tap()
        await ready(page)
      })
      await test.step(`day ${day}`, async () => {
        await page.getByRole('button', { name: /^进入白天/ }).tap()
        await expect(page.getByRole('heading', { name: `第${day}天`, exact: true })).toBeVisible()
        if (day === 3) await context.setOffline(true)
        await page.getByRole('button', { name: '选择1号为提名人', exact: true }).tap()
        await page.getByRole('tab', { name: /被提名人/ }).tap()
        const nominee = 13 - day
        await page.getByRole('button', { name: `选择${nominee}号为被提名人`, exact: true }).tap()
        for (const seat of [1, 2, 3, 4, 5, 6]) await page.getByRole('button', { name: `记录${seat}号举手`, exact: true }).tap()
        if (day === 3) {
          await expect.poll(async () => (await read(page)).dayVoteDraft?.raisedSeatIds.length).toBe(6)
          const draft = await read(page)
          await page.reload({ waitUntil: 'domcontentloaded', timeout: 5_000 }).catch(() => undefined)
          await context.setOffline(false)
          await page.goto('/'); await ready(page)
          expect(await read(page)).toEqual(draft)
          await page.getByRole('button', { name: /^进入白天/ }).tap()
        }
        await page.getByRole('button', { name: '记录本轮票型', exact: true }).tap()
        await expect.poll(async () => (await read(page)).timeline.filter((entry) => entry.kind === 'vote_round').length).toBe(day)
        await layout(page)
        if (day === 3) await page.screenshot({ path: info.outputPath('day-three-touch.png'), fullPage: true })
        await page.getByRole('button', { name: day <= 2 ? `记录处决${nominee}号` : '记录无处决', exact: true }).tap()
        await page.getByRole('button', { name: '确认记录', exact: true }).tap()
        await page.getByRole('button', { name: '结束今天', exact: true }).tap()
        await page.getByRole('button', { name: '确认结束', exact: true }).tap()
        await page.getByRole('button', { name: '返回本局', exact: true }).tap()
        await ready(page)
      })
      if (day === 4) {
        const beforeFailure = await read(page)
        await page.evaluate(({ key }) => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function (k, value) { if (k === key) throw new DOMException('test full', 'QuotaExceededError'); original.call(this, k, value) }; Object.assign(window, { restoreStorage: () => { Storage.prototype.setItem = original } }) }, { key })
        await page.getByRole('button', { name: /查看10号/ }).tap()
        await page.getByRole('button', { name: '中毒', exact: true }).tap()
        await page.getByRole('button', { name: '确认状态', exact: true }).tap()
        const notice = page.getByRole('alert', { name: '对局保存失败' })
        await expect(notice).toBeVisible()
        await page.getByRole('dialog', { name: '保存失败', exact: true }).evaluate(async (element) => { await Promise.all(element.getAnimations().map((animation) => animation.finished.catch(() => undefined))) })
        await page.screenshot({ path: info.outputPath('nested-save-failure.png') })
        expect(await read(page)).toEqual(beforeFailure)
        const download = page.waitForEvent('download')
        await notice.getByRole('button', { name: '导出对局', exact: true }).tap()
        const exported = JSON.parse(await readFile((await (await download).path())!, 'utf8'))
        expect(exported.timeline.length).toBe(beforeFailure.timeline.length + 1)
        await page.evaluate(() => (window as unknown as { restoreStorage: () => void }).restoreStorage())
        await notice.getByRole('button', { name: '重试保存', exact: true }).tap()
        await expect(notice).toHaveCount(0)
        expect(await read(page)).toEqual(exported)
        await page.getByRole('button', { name: '关闭10号玩家', exact: true }).tap()
      }
    }
    const final = await read(page)
    expect(final.phaseSegments).toHaveLength(12)
    expect(final.phaseSegments.every((phase) => Boolean(phase.closedAt))).toBe(true)
    expect(Object.keys(final.nightRuns)).toHaveLength(6)
    expect(new Set(final.timeline.map((entry) => entry.id)).size).toBe(final.timeline.length)
    expect(final.timeline.filter((entry) => entry.kind === 'night_action')).toHaveLength(totalNightActions)
    expect(final.timeline.filter((entry) => entry.kind === 'execution')).toHaveLength(2)
    expect(final.timeline.filter((entry) => entry.kind === 'no_execution')).toHaveLength(4)
    expect(final.timeline.filter((entry) => entry.kind === 'player_state_changed')).toHaveLength(3)
    await reloadAndCheck(page, final)
    await page.getByRole('button', { name: '重置游戏', exact: true }).tap()
    await page.getByRole('radio', { name: /^善良获胜/ }).tap()
    await page.getByRole('button', { name: '保存本局', exact: true }).tap()
    await expect(page.getByText('本局已保存到本机浏览器', { exact: true })).toBeVisible()
    const archives = await page.evaluate(() => JSON.parse(localStorage.getItem('botc-game-archives-v1')!))
    expect(archives).toHaveLength(1)
    expect(archives[0].session).toEqual(final)
    expect(archives[0].summary).toMatchObject({ alive: 10, dead: 2, votes: 6, executions: 2, nightActions: totalNightActions })
    expect(errors).toEqual([])
    await info.attach('long-game-result', { body: JSON.stringify({ width, phases: 12, nightRuns: 6, votes: 6, executions: 2, totalNightActions, timelineEntries: final.timeline.length, pageErrors: errors }, null, 2), contentType: 'application/json' })
  })
})
