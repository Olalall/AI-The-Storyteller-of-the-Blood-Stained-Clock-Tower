# AI 夜间结算建议 10.11 收口审计

状态：**已完成安全接线 / 只填草稿 / 不自动结算**。

## 完成内容

- 新增 `POST /api/ai/night-settlement-advice`。
- 新增 OpenAI-compatible 夜间建议 provider。
- 新增前端 `createNightResultAdviceAsync`。
- 夜间工作台按钮统一为 `AI推荐`。
- 后端失败、AI 未启用或配置不完整时，前端回退本地草稿。

## 权限边界

- AI 只能推荐当前 `WakeItem` 已声明的 `outcomeId`。
- AI 不能新增结果、不能执行角色技能、不能写日志。
- AI 不能修改身份、阵营、死亡、中毒、醉酒、昼夜或夜序光标。
- AI 返回缺失信息时只显示提醒，不填结果草稿。
- 说书人仍需点击 `确认本项` 才写入确认记录。

## 请求上下文

只发送：

- `scriptId`、`knowledgeVersion`、`nightRunId`、`phaseLabel`、`playerCount`。
- 当前唤醒项：座位、角色、能力文案、说书人提示、目标数量。
- 当前草稿：目标、角色选择、当前结果、草稿版本。
- 本项可选结果：`id`、`label`、是否已满足输入。

不发送：

- 完整对局日志。
- 完整玩家身份列表。
- 完整夜序队列。
- API Key 或 Authorization header。

## 关键安全检查

- provider 返回未知或未就绪的 `recommendedOutcomeId` 会被降级为 `needs_input`。
- 前端收到未就绪结果不会调用 `applyAIOutcome` 写草稿。
- 异步返回会绑定 `contextRevision` 和 `sourceDraftRevision`；期间草稿变化会被 reducer 判为失效。
- 后端 route 先校验请求 shape，再调用 provider。

## 验收证据

已通过：

```powershell
npx vitest run server/ai src/services/ai/nightSettlementHttp.test.ts src/features/night-workbench/NightWorkbench.test.tsx
npm run test:server
npm run smoke:backend
npx playwright test tests/e2e/night-workbench.spec.ts tests/e2e/session-flow.spec.ts
npm run check
```

## 风险与后置项

- 这不是完整规则引擎；复杂角色仍依赖板子知识、AI 提醒和说书人确认。
- 真实 provider 只在用户点击且 HTTP 后端模式下触发；本轮 Codex 不做无人 live 调用。
- 后续若增加角色级结算草稿，必须先完成对应板子规则调研和角色验收。
