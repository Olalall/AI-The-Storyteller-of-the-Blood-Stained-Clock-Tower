import { test, expect, type Page } from '@playwright/test'
import { once } from 'node:events'
import path from 'node:path'
import { startArchiveRuntime, closeArchiveRuntime } from '../../server/runtime'
import { createPrototypeGameSession } from '../../src/features/game-session/data/createPrototypeSession'

const sessionKey = 'botc-copilot-session-v1'
const runtimeKey = 'botc-copilot-archive-runtime-settings-v1'
const passcode = 'synthetic-rules-advisor-invitation-secret'
let server: ReturnType<typeof startArchiveRuntime>, origin: string, calls: Record<string, unknown>[], failNext: boolean
let release: (() => void) | undefined
let originalFetch: typeof fetch, savedEnv: Record<string, string | undefined>

test.beforeEach(async ({ page }, info) => {
  calls = []; failNext = false; release = undefined
  originalFetch = globalThis.fetch
  savedEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('BOTC_AI_')))
  for (const key of Object.keys(savedEnv)) delete process.env[key]
  Object.assign(process.env, { BOTC_AI_ENABLED: 'true', BOTC_AI_MODEL: 'browser-test-model', BOTC_AI_BASE_URL: 'https://synthetic-provider.example.test/v1', BOTC_AI_API_KEY: 'synthetic-provider-key', BOTC_AI_ACCESS_SECRET: passcode })
  globalThis.fetch = async (url, init) => {
    expect(String(url)).toBe('https://synthetic-provider.example.test/v1/chat/completions')
    const body = JSON.parse(init!.body as string), data = JSON.parse(body.messages[1].content)
    calls.push(data)
    if (failNext) { failNext = false; return new Response('upstream-private-error', { status: 503 }) }
    if (data.question.includes('等待')) await new Promise<void>(resolve => { release = resolve })
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ summary: `测试回答：${data.question}`, ruleFacts: ['依据本板原文核对技能条件。'], considerations: ['本板有角色不代表该角色在场。'], missingFacts: ['具体局面需补充毒醉与时点。'], sourceIds: ['S1', 'unverified'] }) } }] }))
  }
  server = startArchiveRuntime({ host: '127.0.0.1', port: 0, staticDir: path.resolve('dist'), publicAccessMode: true,
    dataFile: info.outputPath('archives.json'), recoveryDataFile: info.outputPath('recovery.json') })
  await once(server, 'listening')
  const address = server.address()
  if (!address || typeof address === 'string') throw Error('Missing test server')
  origin = `http://127.0.0.1:${address.port}`
  const session = createPrototypeGameSession()
  await page.addInitScript(({ sessionKey, runtimeKey, session }) => {
    if (!localStorage.getItem(sessionKey)) localStorage.setItem(sessionKey, JSON.stringify(session))
    localStorage.setItem(runtimeKey, JSON.stringify({ mode: 'http', baseUrl: location.origin, timeoutMs: 8000 }))
  }, { sessionKey, runtimeKey, session })
  await page.goto(origin)
  await expect(page.locator('.dashboard')).toBeVisible()
  await expect(page.getByRole('dialog', { name: '编辑保护' })).toHaveCount(0)
})
test.afterEach(async () => {
  release?.()
  if (server?.listening) await closeArchiveRuntime(server)
  globalThis.fetch = originalFetch
  for (const key of Object.keys(process.env)) if (key.startsWith('BOTC_AI_')) delete process.env[key]
  Object.assign(process.env, savedEnv)
})
async function openAndAuthorize(page: Page) {
  await page.getByRole('button', { name: '规则问答', exact: true }).click()
  await page.getByRole('textbox', { name: 'AI 访问口令', exact: true }).fill(passcode)
  await page.getByRole('button', { name: '验证并记住此设备', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'AI 访问口令' })).toHaveCount(0)
  expect(calls).toHaveLength(0)
}
async function ask(page: Page, question: string) {
  await page.getByRole('textbox', { name: '规则问题' }).fill(question)
  await page.getByRole('button', { name: '发送', exact: true }).click()
  await expect(page.getByText(`测试回答：${question}`, { exact: true })).toBeVisible()
}

test('两字工具入口保留完整名称，待办有使用说明，关闭问答返回入口焦点', async ({ page }, info) => {
  const before = await page.evaluate(key => localStorage.getItem(key), sessionKey)
  const buttons = page.locator('.ui-phase-track__actions button')
  const labels = await buttons.allTextContents()
  expect(labels.every(label => /^[\u4e00-\u9fff]{2}(?:\s*\d+)?$/.test(label.trim()))).toBe(true)
  await page.getByRole('button', { name: /^状态待办/ }).click()
  await expect(page.getByText(/添加待办不会改变玩家状态/)).toBeVisible()
  await page.getByRole('button', { name: '关闭状态待办' }).click()
  await page.getByRole('button', { name: '规则问答', exact: true }).click()
  await expect(page.getByRole('dialog', { name: '钟楼搭档' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: '规则问答', exact: true })).toBeFocused()
  expect(await page.evaluate(key => localStorage.getItem(key), sessionKey)).toBe(before)
  await page.screenshot({ path: info.outputPath('two-character-navigation.png'), fullPage: true })
})

test('问答访问验证、连续追问、关闭再开、引用和对局完整保留', async ({ page }, info) => {
  const before = await page.evaluate(key => localStorage.getItem(key), sessionKey)
  await openAndAuthorize(page)
  await page.getByRole('combobox', { name: '关注角色', exact: true }).selectOption('philosopher')
  await ask(page, '哲学家获得能力是换角色吗？')
  await page.getByText('查看资料来源 · 1', { exact: true }).click()
  const source = page.locator('.rules-advisor__answer a')
  expect(await source.getAttribute('href')).toMatch(/^https?:/)
  await page.getByRole('button', { name: '关闭钟楼搭档' }).click()
  await page.getByRole('button', { name: '规则问答', exact: true }).click()
  await expect(page.getByText('测试回答：哲学家获得能力是换角色吗？', { exact: true })).toBeVisible()
  await ask(page, '那当晚夜序呢？')
  expect(calls).toHaveLength(2)
  expect((calls[1].history as unknown[])).toHaveLength(1)
  expect(JSON.stringify(calls)).not.toMatch(/玩家1|nickname|confirmedSetup|activeNightRunId|synthetic-provider-key/)
  expect(await page.evaluate(key => localStorage.getItem(key), sessionKey)).toBe(before)
  await page.screenshot({ path: info.outputPath('rules-conversation.png'), fullPage: true })
  await page.reload()
  await page.getByRole('button', { name: '规则问答', exact: true }).click()
  await expect(page.getByText('我是你的钟楼搭档。', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'AI 访问口令' })).toHaveCount(0)
})

test('切板不切当前对局，不混用另一个角色或板子的对话', async ({ page }) => {
  const before = await page.evaluate(key => localStorage.getItem(key), sessionKey)
  await openAndAuthorize(page)
  await ask(page, '这块板的首夜步骤？')
  await page.getByLabel('搜索问答板子').fill('bad-moon')
  await page.getByRole('combobox', { name: '问答板子', exact: true }).selectOption('bad-moon-rising')
  await page.getByRole('combobox', { name: '关注角色', exact: true }).selectOption('zombuul')
  await ask(page, '僵怖表面死亡时怎么办？')
  expect((calls[1].context as { scriptName: string }).scriptName).toContain('黯月')
  expect(calls[1].history).toEqual([])
  expect(await page.evaluate(key => localStorage.getItem(key), sessionKey)).toBe(before)
})

test('失败保留问题，重试成功；等待中关闭侧窗不会重复调用或丢回答', async ({ page }) => {
  await openAndAuthorize(page)
  failNext = true
  await page.getByRole('textbox', { name: '规则问题' }).fill('网络故障重试')
  await page.getByRole('button', { name: '发送', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('AI 暂时无法回答')
  await expect(page.getByRole('textbox', { name: '规则问题' })).toHaveValue('网络故障重试')
  await page.getByRole('button', { name: '发送', exact: true }).click()
  await expect(page.getByText('测试回答：网络故障重试', { exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: '规则问题' }).fill('等待这一条回复')
  await page.getByRole('button', { name: '发送', exact: true }).click()
  await expect.poll(() => calls.length).toBe(3)
  await page.getByRole('button', { name: '关闭钟楼搭档' }).click()
  release!()
  await page.getByRole('button', { name: '规则问答', exact: true }).click()
  await expect(page.getByText('测试回答：等待这一条回复', { exact: true })).toBeVisible()
  expect(calls).toHaveLength(3)
})

test('窄屏和桌面输入、发送、关闭可触达，侧窗内容不横向溢出', async ({ page }, info) => {
  await openAndAuthorize(page)
  await ask(page, '请说明技能判定先检查什么？')
  const panel = page.getByRole('dialog', { name: '钟楼搭档' })
  expect(await panel.evaluate(element => element.scrollWidth > element.clientWidth + 1)).toBe(false)
  await expect(page.getByRole('textbox', { name: '规则问题' })).toBeInViewport()
  const send = await page.getByRole('button', { name: '发送', exact: true }).boundingBox()
  expect(send!.height).toBeGreaterThanOrEqual(44)
  expect(send!.width).toBeGreaterThanOrEqual(44)
  for (const field of await page.locator('.rules-advisor__context input, .rules-advisor__context select').all()) {
    expect((await field.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
  await expect(page.getByText('测试回答：请说明技能判定先检查什么？', { exact: true })).toBeInViewport()
  await page.screenshot({ path: info.outputPath('rules-responsive.png'), fullPage: true })
})
