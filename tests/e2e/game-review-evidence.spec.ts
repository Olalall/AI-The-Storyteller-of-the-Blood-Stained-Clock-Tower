import { expect, test, type Page } from '@playwright/test'
import type { GameSessionState, DayActionEntry } from '../../src/features/game-session/types'
import type { GameArchiveRecord } from '../../src/services/archive/types'

const sessionKey = 'botc-copilot-session-v1'
const archiveKey = 'botc-game-archives-v1'

function archiveFixture(empty = false): GameArchiveRecord {
  const original: DayActionEntry = {
    id: 'review-original-11', kind: 'day_action', category: 'public_event',
    segmentId: 'review-day-1', createdAt: '2026-10-16T10:00:00.000Z', confirmedBy: 'storyteller',
    actorSeatId: null, targetSeatIds: [11, 12], summary: '11号与12号公开事件原记录', details: ['现场手工记录'],
  }
  const corrected: DayActionEntry = {
    ...original, id: 'review-corrected-11', createdAt: '2026-10-16T10:01:00.000Z',
    summary: '11号与12号公开事件已更正', details: ['已核对当时的公开记录'],
    correctionOf: original.id, correctionReason: '原记录时间写错，现场核对后追加更正',
  }
  const session: GameSessionState = {
    schemaVersion: 1, id: empty ? 'review-empty-session' : 'review-evidence-session',
    scriptId: 'catfishing', playerCount: 12, knowledgeVersion: 'e2e/review-evidence', scriptRoles: [],
    seats: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, {
      seatId: index + 1, label: `${index + 1}号`, nickname: `复盘玩家${index + 1}`, experience: 'regular',
    }])),
    initialPlayerStates: Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, {
      life: 'alive', poisoned: false, drunk: false, markers: [],
    }])),
    phaseSegments: empty ? [] : [{ id: 'review-day-1', kind: 'day', sequence: 1, label: '第1天', createdAt: original.createdAt }],
    timeline: empty ? [] : [original, corrected], dayVoteDraft: null, dayActionDraft: null,
    setupDraft: null, nightRuns: {}, activeNightRunId: null,
  }
  return {
    schemaVersion: 1, id: empty ? 'review-empty-archive' : 'review-evidence-archive', sessionId: session.id,
    archivedAt: empty ? '2026-10-15T10:10:00.000Z' : '2026-10-16T10:10:00.000Z',
    winner: 'undecided', winnerLabel: '暂不声明', scriptName: empty ? '无记录验收局' : '事件依据验收局', playerCount: 12,
    summary: { alive: 12, dead: 0, phases: empty ? 0 : 1, records: empty ? 0 : 1, nightActions: 0, dayActions: empty ? 0 : 1, votes: 0, executions: 0, corrections: empty ? 0 : 1 },
    timeline: empty ? [] : [{ id: corrected.id, kind: corrected.kind, phaseLabel: '第1天', summary: corrected.summary, createdAt: corrected.createdAt }],
    session,
  }
}

async function openReview(page: Page) {
  await page.getByRole('button', { name: '本局记录', exact: true }).click()
  await expect(page.getByRole('region', { name: 'AI复盘草稿', exact: true })).toBeVisible()
  return page.getByRole('region', { name: 'AI复盘草稿', exact: true })
}

for (const width of [390, 1440]) {
  test(`复盘默认展示事件依据，娱乐评分只按需展开 ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    const modelRequests: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('request', (request) => { if (request.url().includes('/review-draft')) modelRequests.push(request.url()) })
    await page.addInitScript(({ key, records }) => localStorage.setItem(key, JSON.stringify(records)), {
      key: archiveKey, records: [archiveFixture(), archiveFixture(true)],
    })
    await page.goto('/')
    await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), sessionKey)).not.toBeNull()
    const sessionBefore = await page.evaluate((key) => localStorage.getItem(key), sessionKey)
    const archivesBefore = await page.evaluate((key) => localStorage.getItem(key), archiveKey)
    const review = await openReview(page)
    const evidence = review.getByRole('list', { name: '关键事件与依据', exact: true })
    await expect(page.locator('.game-review__timeline')).toBeHidden()
    expect(await review.evaluate((element) => Boolean(element.compareDocumentPosition(element.parentElement!.querySelector('.game-review__log-section')!) & Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true)
    await expect(evidence).toBeVisible()
    await expect(evidence).toContainText('11号与12号公开事件已更正')
    await expect(evidence).toContainText('review-corrected-11')
    await expect(evidence).toContainText('review-original-11')
    await expect(review.getByText('缺失信息', { exact: true })).toBeVisible()
    await expect(review).toContainText('当前使用本地记录，尚未连接后端 AI')
    await expect(review.getByRole('button', { name: '生成 AI 解读', exact: true })).toHaveCount(0)
    await expect(review.locator('.game-ai-review__scoreboard')).toBeHidden()
    await evidence.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('evidence-default.png'), animations: 'disabled' })
    const toggle = review.getByRole('button', { name: '展开娱乐评分与吐槽', exact: true })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.scrollIntoViewIfNeeded()
    const toggleBounds = await toggle.boundingBox()
    expect(toggleBounds!.height).toBeGreaterThanOrEqual(44)
    expect(toggleBounds!.x).toBeGreaterThanOrEqual(0)
    expect(toggleBounds!.x + toggleBounds!.width).toBeLessThanOrEqual(width + 1)
    await toggle.click()
    await expect(review.locator('.game-ai-review__scoreboard')).toBeVisible()
    await expect(review.getByText('玩家评分草稿', { exact: true })).toBeVisible()
    const firstPlayer = review.locator('.game-ai-review__players article').filter({ has: page.getByText('1号 · 复盘玩家1', { exact: true }) })
    await expect(firstPlayer).not.toContainText('11号与12号')
    expect(modelRequests).toEqual([])
    expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(sessionBefore)
    expect(await page.evaluate((key) => localStorage.getItem(key), archiveKey)).toBe(archivesBefore)
    await page.screenshot({ path: testInfo.outputPath('entertainment-expanded.png'), animations: 'disabled' })

    await page.locator('.game-review__list button').filter({ hasText: '0条记录' }).click()
    await expect(review.locator('.game-ai-review__scoreboard')).toBeHidden()
    await expect(review.getByRole('button', { name: '展开娱乐评分与吐槽', exact: true })).toHaveAttribute('aria-expanded', 'false')
    await expect(review).toContainText(/暂无.*记录|没有.*记录/)
    await expect(review).not.toContainText('11号与12号公开事件已更正')
    await review.scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('empty-review.png'), animations: 'disabled' })
    expect(modelRequests).toEqual([])
    expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(sessionBefore)
    const dialog = page.getByRole('dialog', { name: '历史复盘', exact: true })
    expect(await dialog.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false)
    expect(errors).toEqual([])
  })
}

test('旧后端复盘没有有效引用时，不把模型文案当记录事实', async ({ page }) => {
  const archive = archiveFixture()
  const requests: unknown[] = []
  await page.addInitScript(({ key, archive }) => {
    localStorage.setItem(key, JSON.stringify([archive]))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { key: archiveKey, archive })
  await page.route('**/api/archives', (route) => route.fulfill({ json: { archives: [archive] } }))
  await page.route('**/api/archives/*/review-draft', (route) => {
    requests.push(route.request().postDataJSON())
    return route.fulfill({ json: { accepted: true, data: { draft: {
      provider: 'openai-compatible', disclaimer: '旧合同草稿',
      fullReview: { summary: '1号故意误导全场', turningPoints: ['1号主导了胜负'], suggestedReplayOrder: ['先批评1号'] },
      playerReviews: [{ seatId: 1, score: 100, comment: '玩家能力已经证实', basis: ['不存在的发言'], sharpComment: '没有依据的锐评' }],
    } } } })
  })
  await page.goto('/')
  const review = await openReview(page)
  await review.getByRole('button', { name: '展开娱乐评分与吐槽', exact: true }).click()
  expect(requests).toEqual([])
  await review.getByRole('button', { name: '生成 AI 解读', exact: true }).click()
  await expect.poll(() => requests.length).toBe(1)
  expect(requests[0]).toMatchObject({ includePlayerScores: false, reviewStyle: 'neutral' })
  await expect(review).toContainText('暂无带有效引用的 AI 解释。')
  await expect(review.getByRole('list', { name: '关键事件与依据', exact: true })).toContainText('11号与12号公开事件已更正')
  await expect(review).not.toContainText('1号故意误导全场')
  await expect(review).not.toContainText('1号主导了胜负')
  await expect(review).not.toContainText('玩家能力已经证实')
})

test('AI 解读只显示此次有效记录引用，拒绝未知、混合和被更正的依据', async ({ page }) => {
  const archive = archiveFixture()
  const requests: Record<string, unknown>[] = []
  await page.addInitScript(({ key, archive }) => {
    localStorage.setItem(key, JSON.stringify([archive]))
    localStorage.setItem('botc-copilot-archive-runtime-settings-v1', JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { key: archiveKey, archive })
  await page.route('**/api/archives', (route) => route.fulfill({ json: { archives: [archive] } }))
  await page.route('**/api/archives/*/review-draft', (route) => {
    requests.push(route.request().postDataJSON())
    return route.fulfill({ json: { accepted: true, data: { draft: {
      interpretations: [
        { recordIds: ['review-corrected-11'], explanation: '可核对的解释：公开事件包含一次更正。' },
        { recordIds: ['missing-record'], explanation: '未知引用解释不能显示。' },
        { recordIds: ['review-corrected-11', 'missing-record'], explanation: '混合引用解释不能显示。' },
        { recordIds: ['review-original-11'], explanation: '已被更正的旧记录不能作为当前依据。' },
      ], missing: ['未保存完整发言，不能判断玩家动机。'],
    } } } })
  })
  await page.goto('/')
  const review = await openReview(page)
  const sessionBefore = await page.evaluate((key) => localStorage.getItem(key), sessionKey)
  expect(requests).toEqual([])
  await review.getByRole('button', { name: '生成 AI 解读', exact: true }).click()
  await expect(review).toContainText('可核对的解释：公开事件包含一次更正。')
  await expect(review).toContainText('未保存完整发言，不能判断玩家动机。')
  await expect(review).not.toContainText('未知引用解释不能显示。')
  await expect(review).not.toContainText('混合引用解释不能显示。')
  await expect(review).not.toContainText('已被更正的旧记录不能作为当前依据。')
  expect(requests).toHaveLength(1)
  expect(requests[0]).toMatchObject({ includePlayerScores: false, reviewStyle: 'neutral' })
  expect(await page.evaluate((key) => localStorage.getItem(key), sessionKey)).toBe(sessionBefore)
})
