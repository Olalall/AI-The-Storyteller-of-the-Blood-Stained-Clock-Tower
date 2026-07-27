# AI Provider 10.9 收口审计

状态：**本地实现收口 / live 手动连通测试已开放**。  
日期：2026-07-19。

> 历史说明：本审计冻结的是 10.9 阶段边界；之后用户已单独授权 10.10 配板建议和 10.11 夜间建议，见对应收口审计。

## 总体结论

10.9.1-10.9.4 已在冻结范围内完成：

- 后端 AI 设置只公开脱敏状态。
- OpenAI-compatible client 只有 mock fetch 测试，没有真实网络调用。
- 赛后复盘 route 支持注入 provider，但 runtime 默认不注入真实 provider。
- 前端 AI 设置页只读取后端状态，不保存 API Key。
- 复盘面板在 HTTP 模式下可请求后端草稿，失败回退本地草稿。
- 用户确认后，新增一次性真实连通测试：`POST /api/settings/ai/live-test`。

可以进入外部审查；`10.10` AI 配板真实建议和 `10.11` 夜间结算建议仍不得自动进入。

## 分阶段结果

| 阶段 | 状态 | 结果 |
|---|---|---|
| 10.9.1 | Done | `/api/settings/ai`、`/api/settings/ai/test` 已挂载；响应不含 Key |
| 10.9.2 | Done | `server/ai/aiProviderClient.ts` 支持 mock fetch、超时、错误映射 |
| 10.9.3 | Done | `review-draft` route 支持注入 provider；失败回退 fake |
| 10.9.4 | Done | 设置页展示后端 AI 状态；复盘面板可请求后端草稿并回退 |
| 10.9.5 | Done | 本审计和外部审查提示词已完成 |
| 10.9-live | Manual | 一次性真实连通测试入口已开放；真实调用由说书人手动点击 |

## 关键文件

### 后端 AI

- `server/ai/aiProviderSettings.ts`
- `server/ai/aiProxyHandlers.ts`
- `server/ai/aiProxyRoutes.ts`
- `server/ai/aiProviderClient.ts`
- `server/ai/reviewPromptBuilder.ts`
- `server/ai/reviewDraftProvider.ts`

### 后端归档

- `server/archive/handlers.ts`
- `server/archive/httpArchiveRoutes.ts`
- `server/archive/types.ts`

### 前端接线

- `src/features/ai-settings/AISettingsSheet.tsx`
- `src/features/ai-settings/backendAIStatus.ts`
- `src/features/game-end/GameAIReviewPanel.tsx`
- `src/services/ai/gameReviewHttp.ts`
- `src/services/ai/localAIAdapter.ts`
- `src/services/ai/types.ts`

### 测试

- `server/ai/aiProviderClient.test.ts`
- `server/ai/reviewDraftProvider.test.ts`
- `server/ai/aiProviderSettings.test.ts`
- `server/ai/aiProxyRoutes.test.ts`
- `server/archive/httpArchiveRoutes.test.ts`
- `src/services/ai/gameReviewHttp.test.ts`

## 安全边界检查

### 真实网络调用边界

- `server/ai/aiProviderClient.test.ts` 和 `server/ai/reviewDraftProvider.test.ts` 全部使用注入 `fetcher`。
- `server/runtime.ts` 仍使用 `createArchiveHandlers(repository)`，没有注入 `createOpenAICompatibleReviewDraftProvider`。
- `/api/settings/ai/test` 只检查配置完整性，不调用 provider。
- `/api/settings/ai/live-test` 会调用 provider，但只在说书人手动点击“真实连通测试”时发生。
- 自动测试仍使用注入 `fetcher` 或缺参路径，不使用真实 Key。

### API Key 不进前端

- 后端只在 `server/ai/aiProviderSettings.ts` 内部读取 `BOTC_AI_API_KEY`。
- `/api/settings/ai` 只返回 `apiKeyConfigured: boolean`。
- 前端设置页的 API Key 输入仍是组件 state，保存时不进入 localStorage。
- 前端复盘 HTTP 请求不携带 Key。
- 只有 `/api/settings/ai/live-test` 的一次性请求体允许携带临时 Key；响应与错误不回显 Key。

### AI 不改权威状态

- provider 只返回 `AIReviewDraft`。
- `generateReviewDraft` 不写 repository。
- 前端复盘只展示草稿，不写 `GameSession`、`PlayerState`、`TimelineEntry` 或归档。

### 文件预算

- `server/ai/aiProviderClient.ts`：114 行。
- `server/ai/reviewPromptBuilder.ts`：64 行。
- `server/ai/reviewDraftProvider.ts`：101 行。
- `src/services/ai/gameReviewHttp.ts`：122 行。
- `src/features/ai-settings/AISettingsSheet.tsx`：已拆回 264 行。
- `server/archive/httpArchiveRoutes.ts`：153 行，略高于 10.9 计划建议的 route 140 行；本轮没有继续把 provider 逻辑塞进 route，而是放在 handler/provider 模块里。后续若继续改 archive route，应优先拆 `postArchive` / `postReviewDraft` 小模块。

没有新增巨型 store、数据库、ORM、SDK、角色 ID 自动结算分支。

## 已知限制

- Codex 没有读取截图或密码框里的真实 Key，也没有代替用户发起外部付费 smoke。
- `openai-compatible` provider 是否兼容 `response_format: json_object` 仍需用户手动点“真实连通测试”确认。
- 复盘上下文仍是 minimal，不发送完整日志和完整身份快照。
- 10.10 AI 配板真实建议、10.11 夜间结算建议仍 Blocked。

## 验证记录

已执行：

```powershell
npx vitest run server/ai
npx vitest run server/ai server/archive/httpArchiveRoutes.test.ts server/archive/archiveBackend.test.ts
npx vitest run src/services/ai/gameReviewHttp.test.ts src/services/ai/aiService.test.ts src/services/settings/settingsService.test.ts src/features/game-end/GameEndSheet.test.tsx
npx vitest run server/ai src/features/ai-settings/backendAIStatus.test.ts src/services/settings/settingsService.test.ts src/services/ai/gameReviewHttp.test.ts
npm run test:server
npm run smoke:backend
npm run check
rg "BOTC_AI_API_KEY|apiKey|Authorization|localStorage" server src dev-docs
```

最终验收以最后一次 `npm run check`、`npm run smoke:backend` 和 `npm run test:server` 为准。

## 下一步

1. 先把本审计交给外部模型复查。
2. 若审查通过，可以进入“新增智能板子导入/接入流程”的规划。
3. 真实 AI live smoke 仍需用户另行授权。
