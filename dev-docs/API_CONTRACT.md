# P0 API 合同

## 状态

当前文件是 P0 最小闭环的可测试合同。归档最小闭环正在按无人推进计划逐步实现；本文仍不授权真实 AI、VPS、玩家端或官方魔典同步。

P0 后端只做：

- 保存本局
- 历史复盘列表
- 单局复盘详情
- 保存后重置游戏
- AI 复盘草稿假实现

P0 不做：

- 真实 AI 付费调用
- AI 设置后端保存
- VPS 部署
- 玩家常驻端
- 官方魔典同步器
- 自动规则引擎

## 通用规则

### 请求头

```http
Content-Type: application/json
```

### 命令幂等

所有写命令必须带：

```ts
type CommandMeta = {
  commandId: string
  sessionId: string
  baseVersion: number
  actor: 'storyteller'
  occurredAt: string
}
```

规则：

- 同一个 `commandId` 重试，必须返回同一个结果或幂等成功。
- `baseVersion` 与当前版本不一致，返回 `VERSION_CONFLICT`。
- 不允许后端自动合并冲突。

### 通用成功返回

```ts
type CommandResult<T> = {
  accepted: true
  sessionVersion: number
  data: T
  warnings: string[]
}
```

### 通用失败返回

```ts
type ApiError = {
  accepted: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

### 通用错误码

| code | 含义 | 前端处理 |
|---|---|---|
| `BAD_REQUEST` | 请求字段缺失或格式错误 | 显示错误，不重试 |
| `SESSION_NOT_FOUND` | 对局不存在 | 返回本局页并提示；P0 archive route 不持有 session，后置 |
| `ARCHIVE_NOT_FOUND` | 归档不存在 | 停留复盘页并提示 |
| `VERSION_CONFLICT` | 版本冲突 | 刷新对局快照后提示用户重试；P0 archive route 后置 |
| `DUPLICATE_COMMAND` | 命令已处理 | 使用已处理结果；P0 使用同一 `commandId` 返回同一归档 |
| `RESET_REQUIRES_ARCHIVE` | 未保存不能重置 | 禁用重置按钮；P0 route 用 `ARCHIVE_NOT_FOUND` / `SESSION_MISMATCH` 表达 |
| `SESSION_MISMATCH` | 归档不属于当前 session | 拒绝重置 |
| `FORBIDDEN_STATE_MUTATION` | AI 或非授权命令尝试改权威状态 | 阻断并记录开发错误 |
| `AI_PROVIDER_UNAVAILABLE` | AI 服务不可用 | 显示可手动继续 |

## 1. 保存本局

### `POST /api/games/:sessionId/archive`

用途：把当前对局保存成历史复盘归档。

### Request

```ts
type ArchiveGameRequest = CommandMeta & {
  payload: {
    archive: GameArchiveRecord
    includeReviewDraft?: boolean
  }
}
```

### Response

```ts
type ArchiveGameResponse = CommandResult<{
  archive: GameArchiveRecord
  resetUnlocked: boolean
}>

type GameArchiveRecord = GameArchiveSummary & {
  schemaVersion: 1
  timeline: ArchiveTimelineItem[]
  session: GameSessionState
}

type GameArchiveSummary = {
  id: string
  sessionId: string
  scriptName: string
  playerCount: number
  winner: 'good' | 'evil' | 'undecided'
  winnerLabel: string
  archivedAt: string
  summary: {
    records: number
    nightActions: number
    dayActions: number
    votes: number
    executions: number
    corrections: number
    alive: number
    dead: number
  }
}
```

### 验收

- 保存成功后，历史复盘能查到该归档。
- 保存失败时，前端不能解锁重置游戏。
- 重复提交同一 `commandId` 不创建重复归档。
- `archive` 返回完整归档记录，不只返回列表摘要，避免前端重复投影。
- 后端不持有权威 `GameSession`，只保存前端显式提交的完整归档快照。

## 2. 历史复盘列表

### `GET /api/archives`

用途：查询任意时间的任意历史对局。

### Query

```ts
type ListArchivesQuery = {
  dateFrom?: string
  dateTo?: string
  scriptId?: string
  winner?: 'good' | 'evil' | 'undecided'
  playerCount?: number
  limit?: number
  cursor?: string
}
```

### Response

```ts
type ListArchivesResponse = {
  archives: GameArchiveSummary[]
  nextCursor?: string
}
```

### 验收

- 无归档时返回空数组，不报错。
- 日期筛选不能出现跳天或错时区导致的归档丢失。

## 3. 单局复盘详情

### `GET /api/archives/:archiveId`

用途：查看某一局的日志、玩家评分草稿、当局评价和整局复盘。

### Response

```ts
type GameArchiveDetail = GameArchiveSummary & {
  timeline: ArchiveTimelineItem[]
  players: ArchivePlayerSnapshot[]
  reviewDraft?: AIReviewDraft
  session: GameSessionState
}

type ArchiveTimelineItem = {
  id: string
  kind: string
  phaseLabel: string
  summary: string
  createdAt: string
  correctionOf?: string
}

type ArchivePlayerSnapshot = {
  seatId: number
  nickname: string
  roleId: string
  roleName: string
  life: 'alive' | 'dead'
  poisoned: boolean
  drunk: boolean
}
```

### 验收

- 日志顺序稳定。
- 更正链不覆盖原记录。
- 玩家身份来自归档快照，不按当前局反推。

## 4. 保存后重置游戏

### `POST /api/games/:sessionId/reset-after-archive`

用途：保存成功后允许前端关闭当前局并本地创建新局。

### Request

```ts
type ResetAfterArchiveRequest = CommandMeta & {
  payload: {
    archiveId: string
    confirmReset: true
  }
}
```

### Response

```ts
type ResetAfterArchiveResponse = CommandResult<{
  archiveId: string
  resetAllowed: true
}>
```

### 规则

- 未找到 `archiveId`：返回 `ARCHIVE_NOT_FOUND`。
- 归档不属于当前 `sessionId`：返回 `SESSION_MISMATCH`。
- `confirmReset !== true`：返回 `BAD_REQUEST`。
- 后端只做门卫校验，不返回新 `GameSession`。
- 前端收到 `resetAllowed: true` 后，使用本地 `reset-session` 回到空白新局初始状态（清空玩家人数、座位、状态、昼夜、日志、投票和当前草稿；历史归档、本机设置和脚本库保留）。
- 重置不能删除历史归档。

### 验收

- 未保存不能重置。
- 保存后可重置。
- 重置后历史复盘仍能打开旧局。

## 5. 生成 AI 复盘草稿

### `POST /api/archives/:archiveId/review-draft`

用途：基于归档日志生成 AI 复盘草稿。

P0 先使用 fake endpoint；10.9 接入后可通过注入式 provider 生成 `openai-compatible` 形状草稿，但默认 runtime 仍不发起真实网络调用。

### Request

```ts
type GenerateReviewDraftRequest = {
  reviewStyle?: 'neutral' | 'sharp'
  includePlayerScores?: boolean
}
```

P0 fake endpoint 允许空请求体，默认 `reviewStyle: 'sharp'`、`includePlayerScores: true`。

### Response

```ts
type AIReviewDraft = {
  archiveId: string
  generatedAt: string
  provider: 'fake' | 'openai-compatible'
  model?: string
  confidence: 'low' | 'medium' | 'high'
  disclaimer: string
  gameEvaluation: {
    summary: string
    highlights: string[]
    risks: string[]
  }
  fullReview: {
    summary: string
    turningPoints: string[]
    suggestedReplayOrder: string[]
  }
  playerReviews: PlayerReviewDraft[]
}

type PlayerReviewDraft = {
  seatId: number
  nickname: string
  roleName: string
  score: number
  basis: string[]
  comment: string
  sharpComment?: string
  confidence: 'low' | 'medium' | 'high'
}
```

### 规则

- 必须返回 `provider` 和 `disclaimer`；`fake` 必须标注为假实现，`openai-compatible` 也仍然只是草稿。
- 缺少日志时，`confidence` 必须降为 `low`。
- 不得写入 `PlayerState`、`TimelineEntry` 或胜负。
- 不得修改归档快照或当前局。
- 不生成公开排行榜。
- provider 失败时可以回退 fake 草稿或返回结构化错误，但不能影响归档读取。

## 6. AI 配板候选

### `POST /api/games/:sessionId/setup-candidates`

用途：生成 2—3 套配板候选。

### Request

```ts
type GenerateSetupCandidatesRequest = {
  scriptId: string
  playerCount: number
  playerProfiles: {
    seatId: number
    nickname: string
    experience: 'new' | 'mixed' | 'experienced' | 'unknown'
  }[]
  locks?: {
    seatId: number
    roleId: string
  }[]
  excludes?: {
    seatId?: number
    roleId: string
  }[]
  style?: 'balanced' | 'participation' | 'long_game' | 'chaos'
}
```

### Response

```ts
type SetupCandidateResponse = {
  candidates: SetupCandidate[]
  knowledgeVersion: string
  warnings: string[]
}

type SetupCandidate = {
  id: string
  title: string
  style: string
  assignments: {
    seatId: number
    roleId: string
    roleName: string
  }[]
  demonBluffs: {
    roleId: string
    roleName: string
    reason: string
  }[]
  rationale: string[]
  risks: string[]
  legalityChecks: {
    status: 'pass' | 'warning' | 'blocked'
    message: string
  }[]
}
```

### 规则

- 返回的是候选，不是确认配板。
- 说书人确认前不得写入 `ConfirmedSetup`。
- 恶魔伪装必须优先从未在场角色中选。
- 人数修正、冲突、旅行者、传奇角色必须来自 `ScriptKnowledgePack`，不能由 AI 口头猜。

## 6.1 AI 草稿合同（真实 provider 前置）

阶段 10.7 只冻结请求/响应形状和 fake adapter，不调用真实模型。

### Context level

```ts
type AIContextLevel = 'minimal' | 'standard'
```

默认必须是 `minimal`：

- setup advice：只包含 `scriptId`、`playerCount`、昵称/经验和候选 ID。
- night settlement：只包含当前唤醒项、当前草稿、夜序标识和知识版本。
- review draft：只包含归档摘要、胜方、人数和记录计数。

`minimal` 禁止包含：

- 完整 `GameSessionState`。
- 完整 `PlayerState`。
- 完整夜间队列或全部日志正文。
- API Key、provider secret 或浏览器 localStorage 配置。

### Response

```ts
type AIContractResponse<TDraft> = {
  requestId: string
  kind: 'setup_advice' | 'night_settlement' | 'review_draft'
  provider: 'fake' | 'openai-compatible'
  status: 'answer' | 'needs_input'
  draftOnly: true
  confidence: 'low' | 'medium' | 'high'
  ruleFacts: string[]
  assumptions: string[]
  missing: string[]
  result: TDraft
  suggestedJournalEntries: []
}
```

### 规则

- `provider: 'fake'` 必须明确标注为假实现。
- `draftOnly: true` 是强约束，AI 返回值不能直接写入身份、状态、死亡、投票、昼夜或日志。
- `suggestedJournalEntries` 当前固定为空；未来若开放，也必须由说书人确认后才能写入。
- AI 合同测试必须覆盖 setup advice、night settlement advice 和 review draft。
- 真实 provider 只能在后端 HTTP 模式下、由说书人点击对应 AI 按钮后触发；AI 返回仍是草稿。

## 7. AI 设置（10.9.1 脱敏后端设置 / 10.9-live 一次性连通测试）

10.9.1 实现后端公开脱敏配置和配置检查；`10.9-live` 只增加一次性真实连通测试入口。两者都不保存 API Key，不新增 SDK，不把 AI 结果写入权威状态。

后端从环境变量读取敏感配置：

```env
BOTC_AI_ENABLED=false
BOTC_AI_PROVIDER=openai-compatible
BOTC_AI_BASE_URL=https://example.com/v1
BOTC_AI_MODEL=your-model-name
BOTC_AI_API_KEY=***
BOTC_AI_TIMEOUT_MS=30000
BOTC_AI_MAX_CONTEXT_TOKENS=12000
```

### `GET /api/settings/ai`

返回公开脱敏配置。

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

type GetAISettingsResponse = {
  settings: PublicAISettings
}
```

规则：

- 不返回 API Key。
- 不返回 Authorization header。
- `apiKeyConfigured` 只能是布尔值。
- 未启用时默认返回 `mode: 'off'`、`provider: 'fake'`。

### `POST /api/settings/ai/test`

只检查后端配置完整性，不发起真实模型调用。

```ts
type TestAISettingsResponse = {
  ok: boolean
  provider: 'fake' | 'openai-compatible'
  model?: string
  code: 'AI_PROVIDER_DISABLED' | 'AI_PROVIDER_UNCONFIGURED' | 'AI_PROVIDER_READY'
  message: string
}
```

规则：

- `AI_PROVIDER_READY` 只表示后端环境变量齐全，不表示模型已真实连通。
- 测试响应不得包含 API Key。
- 不发起 provider 网络请求。

### `POST /api/settings/ai/live-test`

发起一次真实 OpenAI-compatible 连通测试。用于说书人手动确认接入地址、模型和 Key 是否可用；会产生一次模型请求。

```ts
type LiveTestAISettingsRequest = {
  provider?: 'openai-compatible'
  baseUrl?: string
  model?: string
  apiKey?: string
  timeoutSeconds?: number
}

type LiveTestAISettingsResponse = {
  ok: boolean
  provider: 'fake' | 'openai-compatible'
  model?: string
  code:
    | 'AI_PROVIDER_DISABLED'
    | 'AI_PROVIDER_UNCONFIGURED'
    | 'AI_PROVIDER_READY'
    | 'AI_PROVIDER_TIMEOUT'
    | 'AI_PROVIDER_RATE_LIMITED'
    | 'AI_PROVIDER_BAD_RESPONSE'
    | 'AI_PROVIDER_UNAVAILABLE'
  message: string
}
```

规则：

- 允许请求体临时携带 `apiKey`，仅用于本次连通测试。
- 响应体、错误 message、日志、localStorage、归档仍不得包含 API Key。
- 如果请求体没有 Key，则只使用后端环境变量中的 Key。
- 前端只允许向本机后端或 HTTPS 后端发送临时 Key。
- 连通成功只表示模型接口可用；配板、夜间结算和赛后复盘仍必须由说书人点击对应按钮才会请求 AI 草稿。

### `POST /api/ai/setup-advice`

用途：对已经通过智能板子包校验的配板候选进行排序和提醒。

规则：

- 请求体不得包含 API Key。
- AI 只能返回已有候选 ID 的排序。
- 不新增角色组合，不确认身份，不写日志。
- provider 失败时前端回退本地模板顺序。

### `POST /api/ai/night-settlement-advice`

用途：基于当前唤醒项和本项草稿，生成夜间结果建议。

规则：

- 请求体只包含当前唤醒项、当前草稿、可选结果和知识版本。
- AI 只能推荐当前 `availableOutcomes` 中 `ready=true` 的 `outcomeId`。
- 返回未知或未就绪结果必须降级为 `needs_input`。
- 不自动改身份、阵营、死亡、中毒、醉酒、日志或夜序光标。

### 禁止

- 除 `POST /api/settings/ai/live-test` 的一次性测试外，API Key 不允许出现在请求体。
- API Key 不允许出现在响应体。
- API Key 不允许出现在 localStorage。
- API Key 不允许出现在导出归档。
- API Key 不允许出现在日志和错误 message。

### 后置项

- `POST /api/settings/ai` 保存非敏感配置仍后置；10.9.1 不提供前端保存入口。
- 真实 provider 网络连通性只允许走 `POST /api/settings/ai/live-test`，且必须由说书人手动点击。
- `streamEnabled` 与兼容接口直连模式仍后置；10.9.1 不做流式返回和浏览器直连。

## 8. 原型功能状态矩阵

| 功能 | 当前状态 | 后端目标 | 备注 |
|---|---|---|---|
| 保存本局 | 前端 `archiveGame` + local adapter 可用 | 后端 `archiveGame` | 后续只替换 adapter |
| 重置游戏 | 前端 `resetAfterArchive` 校验 + reducer 可用 | 后端 `resetAfterArchive` | 必须保存后解锁 |
| 历史复盘 | 前端 `listArchives / getArchive` + local adapter 可用 | 后端 `listArchives / getArchive` | 支持任意时间任意对局 |
| AI 复盘 | 本地假草稿；HTTP 模式可请求后端草稿并失败回退 | `generateReviewDraft` | 用户点击才请求后端草稿 |
| AI 配板 | HTTP 模式可请求后端建议并失败回退 | `POST /api/ai/setup-advice` | 只排序已核对候选，不自动采用 |
| 夜间 AI 推荐 | HTTP 模式可请求后端建议并失败回退 | `POST /api/ai/night-settlement-advice` | 只填本项草稿，不改权威状态 |
| AI API 设置 | 前端 settings service + 后端脱敏状态读取 + 一次性连通测试 | `GET /api/settings/ai`、`POST /api/settings/ai/test`、`POST /api/settings/ai/live-test` | `test` 不调用模型；`live-test` 手动触发一次真实请求 |
| 发身份 | 前端本机流程 | 后续 IdentityReceipt | 当前不做玩家端 |
| 官方魔典同步 | 不做 | 不做 | 手动录入 |
| 玩家收件箱 | 不做 | 不做 | 当前路线移除 |

## 9. P0 完成定义

P0 后端完成时必须满足：

- 前端不直接读写归档 localStorage。
- 保存本局走 service，可切换 local adapter / http adapter。
- 后端保存、查询、重置有测试。
- AI 复盘、AI 配板和夜间 AI 推荐均保留 fake/local 回退；真实 provider 只能由说书人点击触发。
- `npm run check` 通过。
- 新增后端测试通过。
- 没有 API Key 泄漏。
