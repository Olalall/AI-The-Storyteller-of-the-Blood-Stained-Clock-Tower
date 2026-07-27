# 117 个智能板子与 API 点击流审查记录

日期：2026-07-23

## 结论

当前仓库里有 117 个已注册智能板子。按现有质量门槛看，它们已经满足“智能板子可用”的基础条件：

- 已在 `src/domain/scripts/catalog.ts` 注册。
- 每个 pack 覆盖 7-15 人。
- 每个 pack 有来源 URL、内容哈希、验证时间。
- 每个 pack 有角色、夜序、setup rules、setup templates。
- 每个 pack 的模板为 `verified: true`，且通过阵营人数与伪装合法性校验。
- 角色级 `officialName`、`abilityText`、`inputKinds`、`research.sourceUrls`、`research.reviewedAt` 通过质量测试。
- 高风险技能的死亡、毒醉、疯狂、身份、阵营、胜负等路径仍为 AI 草稿/说书人确认，不自动改权威状态。

## 已验证命令

```powershell
npm run test -- src/domain/scripts/smartScriptPackQuality.test.ts src/domain/scripts/roleResearchProjection.test.ts src/domain/scripts/batch01Acceptance.test.ts
npm run check
npm run smoke:backend
npm run test:server
npm run test:e2e
```

结果：

- 智能板子质量门槛：3 个测试文件 / 9 项通过。
- 全量 `npm run check`：172 个测试文件 / 810 项测试通过，build 通过，architecture verification 通过。
- 后端 smoke：归档 runtime、`/healthz`、fake review provider 可用；`aiMode: off`，`reviewProvider: fake`。
- 后端单测：10 个测试文件 / 46 项通过。
- 浏览器 E2E：29 项通过。

## 模拟人工点击发现的卡点

发现 2 个 E2E 失败点，原因不是功能坏了，而是测试脚本写死了旧的 Catfishing 12 人“全员参与”座位：

- 旧测试假设 `1号 心上人`、`2号 赌徒`。
- 当前草稿里这些角色已被合理分配到其他座位，导致测试找不到旧按钮。

已修正：

- `tests/e2e/session-flow.spec.ts`
- `tests/e2e/manual-click-smoke.spec.ts`

修正方式：

- 不再绑定固定角色和固定座位。
- 改为读取当前草稿中真实存在的前两个座位按钮，模拟用户点击交换。
- 拖拽测试也改成读取当前第 3 / 第 4 张真实角色卡再拖拽。

这更符合现在“多模板、多板子、AI 推荐后座位会变化”的实际产品逻辑。

## API/AI 验证边界

已验证：

- 后端 runtime smoke 可启动并返回结构化结果。
- 前端 AI API 设置入口在浏览器 smoke 中可点、可填、可保存非敏感配置。
- 测试 API Key 不进入 localStorage。
- 后端当前默认 `aiMode: off`，复盘 provider 为 `fake`。

未验证：

- 没有真实 API Key，因此没有做真实模型 live 调用。
- 没有验证真实 OpenAI-compatible provider 的外部网络质量、费用、限流或模型输出稳定性。

## 当前仍需注意的风险

1. 117 个板子通过的是“结构化智能可用”门槛，不等于每个二创角色的复杂规则都已经人工逐条复核到官方级权威。
2. 浏览器 E2E 目前覆盖核心流程和第一批脚本开局，不等于 117 个板子每一个都做过实机点击开局。
3. build 仍有 Vite chunk 体积警告：主 JS 约 5.4MB。当前不阻塞本地自用，但后续公开/VPS 优化时应考虑按板子或页面做 code split。
4. 真实 AI 只能作为草稿建议。即使接入真实 API，也不能自动改身份、阵营、死亡、毒醉、昼夜或胜负。

## 下一步建议

优先顺序：

1. 补一个“批量板子 UI 抽样 smoke”：每次随机抽 10-20 个已注册板子，自动走选择板子、12 人开局、采用候选、进入夜晚、请求 AI 推荐但不确认权威状态。
2. 再做真实 API live 测试入口的手动验收：只测连通和返回格式，不自动跑 117 个板子。
3. 之后再继续导入剩余板子或做角色规则深度复核。
