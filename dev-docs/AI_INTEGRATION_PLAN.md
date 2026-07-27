# AI 集成计划

状态：进行中；后端代理、配板建议、夜晚建议和复盘草稿已接线，仍持续补强规则知识。  
目标：真实 AI 可以辅助配板、结算、复盘和文案，但不能成为权威规则执行者。

## 1. 接入方式

采用后端代理。

- 前端可以提供保存入口。
- API Key 不写入前端持久化存储。
- VPS 后端保存和读取敏感配置。
- 前端只能看到非敏感配置，例如 provider、baseUrl、model、timeout、keySaved、maskedKey。

## 2. Provider 设置

建议字段：

```ts
interface AIProviderSettings {
  providerId: string
  baseUrl: string
  model: string
  timeoutMs: number
  maxContextTokens: number
  enabled: boolean
  keySaved: boolean
  maskedKey?: string
}
```

可支持多个配置：

- 手动选择默认 provider。
- 允许有限自动 fallback。
- 夜晚结算快失败，不长时间卡主持流程。
- 复盘可以等待更久。

## 3. AI 阶段顺序

1. Setup reminders：配板解释、角色冲突提醒、模板建议。
2. Night settlement advice：夜晚技能结算建议。
3. Review draft：赛后复盘、玩家评语、锐评草稿。
4. Message polish：开场白、玩家告知、沉浸感文案润色。
5. Rules advisor：问 AI 的规则检索和裁定建议。

不要一次性把所有 AI 能力做完。

## 4. 上下文最小化

AI 请求必须声明 `contextLevel`：

- `minimal`：只发当前技能、相关座位、相关角色、必要状态。
- `related`：追加相关历史事件。
- `full-session`：全局复盘或明确询问整局时使用。

默认问什么发什么。全局上下文必须由调用点明确选择。

### 4.1 夜晚技能上下文

夜晚 `AI推荐` 的默认上下文固定为本项最小集合：

- 当前唤醒项：角色、座位、技能、说书人提示。
- 当前草稿：目标、角色选择、结果候选、草稿版本。
- 已选目标简况：仅本步已选座位的角色、昵称和状态。
- 可选结果：只允许从 `ready=true` 的结果里推荐。
- `roleKnowledge`：共享复杂角色短摘要。
- `roleResearch`：导入智能板子时逐角色复核的规则摘要。

真实 AI 的判断顺序：先看当前草稿是否缺输入，再用 `roleResearch` 和 `roleKnowledge` 核对高风险项，最后才选择可采用结果。不能因为模型记忆“知道规则”就绕过当前板子的 `research`。

## 5. 知识等级

每个板子、角色和技能都要有知识状态：

- `confirmed`：已调研、已核对、可用于 AI 建议。
- `needs-review`：可展示，但 AI 必须降低置信度并提示需要说书人确认。
- `missing`：不可用于智能配板或技能建议，只能手动记录。

新增板子必须先完成规则调研协议，不能让 AI 只凭模型记忆判断。

## 6. 输出格式

AI 输出必须区分：

- `ruleFacts`：规则事实。
- `inferences`：AI 推断。
- `missingFacts`：缺失信息。
- `recommendedAction`：建议。
- `alternatives`：备选方案。
- `playerMessageDrafts`：玩家文案草稿。
- `journalDrafts`：日志草稿。
- `confidence`：置信度。

所有 `playerMessageDrafts` 和 `journalDrafts` 都必须由说书人确认。

## 7. 沉浸感文案

采用“语义先行，风格后置”。

```text
规则语义 -> 默认模板 -> 可选 AI 润色 -> 说书人确认 -> 展示/记录
```

AI 可以润色语气和沉浸感，但不能改变事实：

- 不能把“无事发生”改成“你得到了错误信息”。
- 不能把目标、身份、阵营、状态改掉。
- 不能绕过说书人确认。

全局沉浸感风格可以作为设置，例如：简洁、戏剧化、恐怖、幽默。风险是信息误读，所以必须保留规则语义预览和一键回退默认模板。

## 8. 失败处理

AI 不可用时：

- 开局可继续使用模板库配板。
- 夜晚可继续手动记录和本地规则提示。
- 白天投票和倒计时不受影响。
- 归档和复盘保存不受影响。
- UI 明确提示“AI 不可用”，不要空白或卡住。

## 9. 禁止事项

- 不在前端保存明文 API Key。
- 不把 AI 评分写入长期玩家画像。
- 不让 AI 默认读取全局对局数据。
- 不让 AI 自动发送身份或裁定信息。
- 不用 AI 输出直接更新玩家状态。
- 不把 fake AI 文案伪装成真实 AI。
