# AI 配板建议 10.10 收口审计

状态：**已完成安全接线 / 不自动采用 / 不做无人 live 调用**。

## 完成内容

- 新增 `POST /api/ai/setup-advice`。
- 新增 OpenAI-compatible 配板建议 provider。
- 新增前端 `createSetupAdviceDraftAsync`。
- 配板候选页新增次级按钮：`AI推荐`。
- AI 返回只用于候选排序、短提醒和理由展示。

## 权限边界

- AI 不生成新配板，只能在已核对候选中排序。
- AI 不修改 `setupDraft`、身份、座位、玩家状态或日志。
- 说书人仍需点击 `采用为草稿`，再显式确认配板。
- API Key 只在后端 provider 调用中使用，不进入前端存储、日志、归档或响应。
- 后端不可用、AI 未启用或 provider 失败时，前端回退本地模板顺序。

## 请求上下文

只发送：

- `scriptId`、`scriptName`、`knowledgeVersion`、`playerCount`。
- 座位号、昵称、经验。
- 已核对候选的 ID、标题、角色摘要、伪装名、合法性摘要。

不发送：

- 完整对局状态。
- 完整日志。
- 玩家长期画像。
- API Key 或 Authorization header。

## 验收证据

已通过：

```powershell
npx vitest run server/ai src/services/ai/setupAdviceHttp.test.ts
```

后续最终验收仍需：

```powershell
npm run check
```

## 风险与后置项

- 当前没有自动 live smoke；真实 provider 是否可用由说书人在设置页手动测试。
- AI 推荐可能和本地模板顺序一致，这是允许的。
- 10.11 夜间结算建议已进入独立草稿通路；仍不得自动写状态或日志。
