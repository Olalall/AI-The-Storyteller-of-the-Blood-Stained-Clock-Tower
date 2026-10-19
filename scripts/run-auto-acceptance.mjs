import { spawn } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
process.chdir(root)
const pkg = JSON.parse(await readFile('package.json', 'utf8'))
if (pkg.name !== 'botc-storyteller-companion') throw new Error('项目不匹配，停止验收')
const output = path.join(root, '.codex-artifacts', 'auto-acceptance', `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}`)
await mkdir(output, { recursive: true })
const npm = process.env.npm_execpath
if (!npm) throw new Error('请通过 npm run verify:auto 启动')
const env = { ...process.env, BOTC_ACCEPTANCE_DIR: output, BOTC_RUN_REAL_AI_NIGHT_QUALITY_SMOKE: '0' }
delete env.BOTC_DEVICE_URL
const steps = [
  ['lint', '代码检查', [npm, 'run', 'lint']],
  ['architecture', '架构检查', [npm, 'run', 'verify:architecture']],
  ['unit', '单元测试（不调用真实 AI）', [npm, 'run', 'test', '--', '--maxWorkers=4']],
  ['build', '独立生产构建', [npm, 'run', 'build', '--', '--outDir', path.join(output, 'dist')]],
  ['browser', '核心流程与异常恢复', ['node_modules/@playwright/test/cli.js', 'test', '--config', 'playwright.acceptance.config.ts']],
]
const results = []
let child, interrupted = false
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  interrupted = true
  child?.kill(signal)
})
async function run(id, label, args) {
  console.log(`\n开始：${label}`)
  const started = Date.now(), log = createWriteStream(path.join(output, `${id}.log`))
  let error
  const code = await new Promise((resolve) => {
    child = spawn(process.execPath, args, { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] })
    for (const [stream, destination] of [[child.stdout, process.stdout], [child.stderr, process.stderr]]) {
      stream.on('data', (data) => { log.write(data); destination.write(data) })
    }
    child.on('error', (value) => { error = value.message; resolve(1) })
    child.on('close', (value) => resolve(value ?? 1))
  })
  child = undefined
  await new Promise((resolve) => log.end(resolve))
  return { id, label, status: code === 0 && !interrupted ? '通过' : '失败', code, seconds: Math.round((Date.now() - started) / 1000), error }
}
try {
  for (const [id, label, args] of steps) {
    if (interrupted || results.some((item) => item.status === '失败')) {
      results.push({ id, label, status: '未执行', seconds: 0 })
    } else results.push(await run(id, label, args))
  }
} catch (error) {
  results.push({ id: 'runner', label: '验收执行器', status: '失败', error: error.message })
}
let browser
try { browser = JSON.parse(await readFile(path.join(output, 'browser-results.json'), 'utf8')) } catch { /* 构建失败时没有浏览器结果 */ }
const passed = results.length === steps.length && results.every((item) => item.status === '通过')
const report = {
  project: root, finishedAt: new Date().toISOString(), status: passed ? '自动验收通过' : '自动验收未通过',
  steps: results, browserStats: browser?.stats ?? null,
  notCovered: ['真实手机和平板的系统键盘、触摸手感、切后台恢复', '真实 AI 服务质量与计费调用', 'VPS 和真实局域网设备连通性', '全部 117 个剧本的语义及角色规则'],
}
await writeFile(path.join(output, 'summary.json'), JSON.stringify(report, null, 2))
const lines = [
  '# 一键自动验收报告', '', `结果：**${report.status}**`, `完成时间：${report.finishedAt}`, `项目：${root}`, '',
  '| 检查 | 结果 | 耗时（秒） | 日志 |', '| --- | --- | --- | --- |',
  ...results.map((item) => `| ${item.label} | ${item.status} | ${item.seconds ?? '-'} | ${item.status === '未执行' || item.id === 'runner' ? '—' : `[查看](${item.id}.log)`} |`), '',
  '前一步失败后，后续步骤标记为未执行。每个浏览器用例使用隔离测试数据，不读取日常浏览器存档。', '',
  '## 浏览器证据', '',
  browser ? `通过 ${browser.stats.expected}；失败 ${browser.stats.unexpected}；跳过 ${browser.stats.skipped}；不稳定 ${browser.stats.flaky}。` : '尚未产生浏览器测试结果。',
  ...(browser ? ['', '[打开操作报告](html/index.html)（失败用例包含截图和轨迹）；[机器结果](browser-results.json)。', '交互式报告请运行：', '', '```powershell', `npx playwright show-report "${path.join(output, 'html')}"`, '```'] : []), '',
  '## 未覆盖', '', ...report.notCovered.map((item) => `- ${item}`), '',
  '通过仅代表本轮代码在上述自动化范围内通过，不等于真机验收或全部规则正确。', '',
]
await writeFile(path.join(output, 'summary.md'), lines.join('\n'))
console.log(`\n${report.status}\n报告：${path.join(output, 'summary.md')}`)
process.exitCode = passed ? 0 : 1
