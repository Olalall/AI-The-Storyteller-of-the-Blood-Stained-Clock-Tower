# Claude 审查提示词：AI Provider 10.9 收口

请你作为架构与安全审查员，审查本仓库的 AI Provider 10.9 实现是否可以进入下一阶段。

## 仓库范围

仓库：`<repo>`

产品：钟楼说书人副驾驶。

核心边界：

- 说书人是最终权威。
- AI 只能生成草稿、建议、提醒或复盘文案。
- AI 不能修改玩家身份、状态、死亡、投票、昼夜、胜负或日志。
- 当前只开放一次性手动真实连通测试，不做 VPS 部署 / 夜间自动结算 / 默认真实 AI 接管。

## 本轮目标

审查 10.9.1-10.9.5 以及 10.9-live 手动连通测试入口：

1. 后端 AI 设置与脱敏公开配置。
2. Provider client 骨架与 mock fetch 测试。
3. 赛后复盘 provider 路径。
4. 前端 AI 设置与复盘入口安全接线。
5. 收口审计。
6. `POST /api/settings/ai/live-test` 与前端“真实连通测试”按钮。

请重点确认：

- 真实 provider 网络调用是否只存在于手动 `live-test`，且不会自动触发。
- 是否泄漏 API Key。
- 除 `live-test` 一次性请求体外，是否把 API Key 保存到前端、localStorage、归档、日志或错误对象。
- 是否绕过说书人确认修改权威状态。
- 是否新增 SDK、数据库、ORM 或膨胀式架构。
- 是否仍能在 provider 失败时继续本地草稿/手动流程。
- 文件规模是否超出项目预算。

## 必读文件

### 计划与合同

- `dev-docs/AI_PROVIDER_IMPLEMENTATION_PLAN.md`
- `dev-docs/AI_PROVIDER_10_9_CLOSURE_AUDIT.md`
- `dev-docs/API_CONTRACT.md`
- `dev-docs/UNATTENDED_TASK_INDEX.md`
- `dev-docs/AI_AUTHORITY_BOUNDARY.md`
- `dev-docs/architecture-guardrails.md`

### 后端实现

- `server/runtime.ts`
- `server/ai/types.ts`
- `server/ai/aiProviderSettings.ts`
- `server/ai/aiProxyHandlers.ts`
- `server/ai/aiProxyRoutes.ts`
- `server/ai/aiProviderClient.ts`
- `server/runtimeCors.ts`
- `server/ai/reviewPromptBuilder.ts`
- `server/ai/reviewDraftProvider.ts`
- `server/archive/types.ts`
- `server/archive/handlers.ts`
- `server/archive/httpArchiveRoutes.ts`

### 前端实现

- `src/features/ai-settings/AISettingsSheet.tsx`
- `src/features/ai-settings/backendAIStatus.ts`
- `src/features/game-end/GameAIReviewPanel.tsx`
- `src/services/ai/gameReviewHttp.ts`
- `src/services/ai/localAIAdapter.ts`
- `src/services/ai/types.ts`
- `src/services/settings/localAISettingsAdapter.ts`
- `src/services/settings/settingsService.ts`

### 测试

- `server/ai/*.test.ts`
- `src/features/ai-settings/backendAIStatus.test.ts`
- `server/archive/httpArchiveRoutes.test.ts`
- `src/services/ai/gameReviewHttp.test.ts`
- `src/services/settings/settingsService.test.ts`
- `src/features/game-end/GameEndSheet.test.tsx`

## 建议运行命令

```powershell
npm run test:server
npm run smoke:backend
npm run check
rg "BOTC_AI_API_KEY|apiKey|Authorization|localStorage" server src dev-docs
```

## 输出格式

请按以下格式输出：

1. 总体评级：绿 / 黄 / 红。
2. 一句话结论。
3. 是否可以进入“新增智能板子导入流程”规划。
4. `live-test` 是否足够安全；是否仍需要由用户手动完成外部 smoke。
5. 阻塞问题。
6. 非阻塞改进。
7. 架构风险。
8. 安全风险。
9. 测试缺口。
10. 文档不一致。
11. 你建议下一步做什么。

## 不要做的事

- 不要建议自动触发真实网络调用；真实连通只能由用户手动点击。
- 不要建议把 API Key 放到前端。
- 不要建议上数据库/ORM。
- 不要建议做夜间自动结算。
- 不要把“复盘评分草稿”说成客观玩家能力评分。
