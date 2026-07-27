# AI Provider 接入设计（10.9 前置）

状态：**设计收口 / 待用户确认**。  
本文件只冻结真实 AI provider 的接入方案，不授权真实模型调用，不保存 API Key，不新增 SDK。

## 1. 当前结论

外部审查结论为绿：10.1-10.8 已在冻结范围内收口，可以进入 10.9 的设计阶段。

但 10.9 的实际实现仍然是 **Blocked**，原因是接真实模型涉及：

- provider / Base URL / model 选择。
- API Key 保存位置。
- 费用与限流。
- 传给模型的数据范围。
- 失败回退策略。

在这些确认前，不写真实 HTTP 调用代码。

## 2. 推荐默认方案

| 项 | 推荐默认 | 原因 |
|---|---|---|
| 接入形态 | 后端代理 | API Key 不进入前端，便于 VPS 部署和统一失败处理。 |
| Provider 协议 | OpenAI-compatible 优先 | 可兼容多家模型服务，避免一开始绑定单一 SDK。 |
| SDK | 暂不新增 | 第一版用后端 `fetch` 即可，减少依赖和供应链风险。 |
| API Key | 只放后端环境变量或后端 secret 文件 | 禁止 localStorage、前端配置、导出归档携带 key。 |
| 默认状态 | 关闭真实 AI，fake/local 可用 | AI 不可用时游戏仍能继续。 |
| 首个真实 AI 功能 | 赛后复盘 | 风险最低，AI 错误不会影响当局进行。 |
| 后续顺序 | AI 配板 → 夜间结算建议 | 夜间结算影响最大，必须最后接。 |
| 默认上下文 | `minimal` | 问什么发什么，减少泄露和幻觉风险。 |
| 回退策略 | 失败后明确提示并回退 fake/local/manual | 不允许空白、不允许卡住主持流程。 |

## 3. 不做事项

10.9 设计和第一版真实 AI 接入都不做：

- 不做前端保存 API Key。
- 不把 API Key 放进 localStorage、sessionStorage、归档、日志或导出文件。
- 不新增数据库、ORM、账号系统、WebSocket。
- 不做玩家端 / 玩家收件箱。
- 不做官方魔典同步器。
- 不让 AI 自动修改身份、状态、死亡、投票、昼夜、日志或胜负。
- 不为每个角色写后端 if/else 自动规则引擎。
- 不做公开玩家排行榜或长期玩家画像。

## 4. 后端配置设计

建议后端读取以下环境变量。变量名可以在实现前再确认，当前作为设计草案。

```env
BOTC_AI_ENABLED=false
BOTC_AI_PROVIDER=openai-compatible
BOTC_AI_BASE_URL=https://example.com/v1
BOTC_AI_MODEL=your-model-name
BOTC_AI_API_KEY=***
BOTC_AI_TIMEOUT_MS=30000
BOTC_AI_MAX_CONTEXT_TOKENS=12000
```

规则：

- `BOTC_AI_API_KEY` 只允许后端读取。
- `/api/settings/ai` 返回时只能返回 `apiKeyConfigured: true/false`，不能返回 key。
- 日志不能打印 request header、API Key、完整 prompt。
- Provider 未配置时，真实 AI endpoint 必须返回结构化不可用状态，不得抛未处理异常。

## 5. 前端设置页边界

前端可以展示和保存非敏感设置，例如：

```ts
type PublicAISettings = {
  mode: 'off' | 'backend_proxy'
  provider: 'fake' | 'openai-compatible'
  baseUrl?: string
  model?: string
  timeoutSeconds: number
  contextLimit: number
  apiKeyConfigured: boolean
}
```

前端不能保存：

- 明文 API Key。
- Authorization header。
- provider secret。
- 完整模型调用请求体。

如果 UI 临时提供“测试 Key”输入框，也必须满足：

- 只用于本次测试请求。
- 不参与 `save settings`。
- 输入框使用 `autoComplete="new-password"`。
- 提交后清空内存中的 key。
- 测试失败也不能把 key 写入错误日志或 toast。

## 6. Runtime 目录建议

实际实现时建议保持三层，不把逻辑塞进 `runtime.ts`：

```text
server/ai/
  aiProviderSettings.ts      # 只读环境变量，输出脱敏公开设置
  aiProviderClient.ts        # OpenAI-compatible fetch 封装，可注入 fetch 测试
  aiProxyHandlers.ts         # 把业务请求转成 provider 调用
  aiProxyRoutes.ts           # HTTP route 分发
  aiErrors.ts                # 结构化错误码
```

约束：

- 单文件建议不超过 180 行。
- provider client 不 import React、不 import UI。
- handler 不直接读写 `GameSessionState`，只接收调用方传来的最小上下文。
- route 只做 HTTP 解析和响应，不写业务规则。
- 不新增全局万能 store。

## 7. 第一版真实 AI 功能顺序

### 7.1 赛后复盘（第一优先）

原因：

- 已有 fake review draft endpoint。
- AI 错误不会影响当局裁定。
- 可以使用归档摘要和日志统计，不需要实时阻塞主持。

上下文：

- 默认 `minimal`：归档摘要、胜方、人数、记录计数。
- 只有说书人明确选择“详细复盘”时，才考虑 `standard` 或 `full-session`。

### 7.2 AI 配板（第二优先）

原则：

- AI 不自由生成角色集合。
- AI 只基于 verified 模板库做解释、排序、提醒和轻量微调建议。
- 说书人确认前不得写入当前配板。

### 7.3 夜间结算建议（第三优先）

原则：

- 最危险，最后做。
- AI 只输出建议，不直接结算。
- 角色规则必须来自 `ScriptKnowledgePack` 和规则调研文档，不允许模型凭记忆判定。
- 高风险角色（例如舞蛇人、洗脑师、方古、亡骨魔、麻脸巫婆、赌徒）必须保留缺失信息和说书人确认提示。

## 8. 上下文策略

```ts
type AIContextLevel = 'minimal' | 'standard' | 'full-session'
```

默认：`minimal`。

| 场景 | 默认上下文 | 是否允许升级 |
|---|---|---|
| 赛后复盘 | minimal | 允许说书人手动选择 detailed / full-session。 |
| AI 配板 | minimal | 可升级到 standard，但只包含玩家经验、候选模板、板子知识摘要。 |
| 夜间结算建议 | minimal | 默认不升级；除非问题明确需要相关历史。 |
| 文案润色 | minimal | 只传语义事实和风格，不传完整局面。 |
| 问规则 | minimal | 只传问题、相关角色、必要状态。 |

禁止默认发送：

- 完整 `GameSessionState`。
- 完整 `PlayerState`。
- 完整日志全文。
- localStorage 配置。
- API Key 或 provider secret。

## 9. 错误和回退

建议错误码：

| code | 含义 | 前端处理 |
|---|---|---|
| `AI_PROVIDER_DISABLED` | 后端未启用真实 AI | 显示“AI 未启用”，继续 fake/local/manual。 |
| `AI_PROVIDER_UNCONFIGURED` | 缺少 baseUrl/model/key | 引导到设置，但不阻塞游戏。 |
| `AI_PROVIDER_TIMEOUT` | 超时 | 夜间立即回退手动；复盘可重试。 |
| `AI_PROVIDER_RATE_LIMITED` | 限流 | 显示稍后重试，不自动重复刷请求。 |
| `AI_PROVIDER_BAD_RESPONSE` | 模型返回不符合合同 | 丢弃结果，保留手动流程。 |
| `AI_PROVIDER_UNAVAILABLE` | 网络或服务不可用 | 回退 fake/local/manual。 |

回退规则：

- 夜间：不能卡主持，短超时，失败后立即手动继续。
- 白天：计时、投票不受 AI 影响。
- 配板：失败后仍可用模板库。
- 复盘：失败后仍显示本地/fake 草稿或提示稍后生成。

## 10. 测试要求

实际实现 10.9 时至少补：

- provider settings 不返回明文 API Key。
- provider client 使用注入 fetch，可以 mock 成功、超时、限流、坏 JSON。
- fake fallback 不修改权威状态。
- context builder 不包含完整 session、timeline、localStorage、API Key。
- 赛后复盘真实 provider 失败时，归档详情仍可打开。
- UI 保存设置时，localStorage 不包含 API Key。
- `npm run test:server`、`npm run smoke:backend`、`npm run check` 通过。

## 11. 需要用户确认的问题

实际写真实 AI 调用前，至少需要确认：

1. Provider：OpenAI-compatible 代理是否作为第一版默认？
2. Base URL：由 VPS 环境变量固定，还是允许前端填写非敏感地址？
3. Model：先单模型，还是多模型可切换？
4. API Key：是否确认只放 VPS 后端环境变量 / secret 文件？
5. 费用：是否需要每日/每局限额？
6. 失败回退：是否接受默认回退 fake/local/manual？
7. 第一个功能：是否确认先接“赛后复盘”？
8. 上下文：是否确认默认 `minimal`，详细复盘才允许手动升级？

## 12. 当前状态

- 10.9 设计文档：已创建。
- 10.9 真实 provider 调用：仍 Blocked。
- 下一步：用户确认上述问题后，才创建 10.9 实现计划并写代码。
