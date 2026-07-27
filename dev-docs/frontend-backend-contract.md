# 前后端协同合同

## 当前结论

当前项目已经完成大量前端交互原型；后端 P0 归档最小闭环已完成到可测试模块层面，但还没有挂载到真实运行时或 VPS，不能视为生产后端已上线。

后端实现前必须先守住三条线：

1. 前端 UI 不直接操作数据库。
2. 后端命令只追加事实或生成草稿，不静默覆盖权威状态。
3. AI 永远只能返回候选、建议、追问、复盘草稿，不能直接改身份、状态、处决、胜负或昼夜。

## 分层结构

```text
React UI
  只负责展示、草稿输入、确认按钮和错误反馈

Feature State
  只保存当前页面草稿和纯 UI 状态

Application Services
  统一封装 archiveGame / resetAfterArchive / askAI 等调用

Domain Contract
  GameSession / TimelineEntry / ScriptDefinition / KnowledgePack / AIAdvice / GameArchive

Backend Modules
  P0 只实现 archive 与 fake review draft；session / setup / real ai / settings 后置

Persistence + Adapters
  P0 使用 JSON 文件归档；SQLite / Postgres、AI Provider、VPS 部署后置
```

UI 只能通过 Application Services 调后端。任何组件不得直接拼 HTTP、SQL、AI SDK 或本地持久化细节。

## 核心数据边界

### GameSession

当前对局唯一事实源。

必须包含：

- `id`
- `scriptId`
- `playerCount`
- `status`: `setup | in_progress | ended | archived`
- `confirmedSetupId`
- `createdAt`
- `startedAt?`
- `endedAt?`
- `declaredWinner?`: `good | evil | undecided`
- `version`

禁止：

- 根据角色 ID 自动判胜。
- 根据技能记录自动推进昼夜。
- 在 UI 草稿保存时直接改变权威状态。

### TimelineEntry

追加式日志索引。

必须支持：

- 夜间行动
- 白天技能
- 公开事件
- 提名
- 投票轮
- 处决 / 无处决
- 玩家状态变化
- 配板确认 / 配板调整
- 身份领取
- AI 建议采纳结果
- 更正链
- 手工备注

更正只能追加新条目，不能覆盖旧条目。

### GameArchive

结束对局后的只读归档。

必须包含：

- `id`
- `sessionId`
- `archivedAt`
- `scriptName`
- `playerCount`
- `summary`
- `timeline`
- `session`
- `winner`
- `winnerLabel`
- `reviewDraft?`

归档成功后才能执行真实 `resetAfterArchive`。

### AIAdvice

AI 建议、配板、复盘都必须存为草稿或审计记录。

必须包含：

- `id`
- `sessionId`
- `type`: `setup | rule | night_action | day_action | review`
- `inputContextVersion`
- `knowledgeVersion`
- `status`: `answer | need_more_info | blocked`
- `ruleFacts[]`
- `assumptions[]`
- `recommendedDraft`
- `missingInfo[]`
- `confidence`
- `sources[]`
- `adoptedByStoryteller?`

AIAdvice 不得直接产生 `PlayerState`、`Execution`、`ConfirmedSetup` 或 `TimelineEntry` 的权威变更。

## 命令模型

后端写操作统一走命令，不做任意 PATCH。

```ts
type CommandEnvelope<TPayload> = {
  commandId: string
  sessionId: string
  baseVersion: number
  actor: 'storyteller'
  occurredAt: string
  payload: TPayload
}
```

统一返回：

```ts
type CommandResult<TProjection = unknown> = {
  accepted: boolean
  sessionVersion: number
  events: TimelineEntry[]
  projection?: TProjection
  warnings: string[]
  error?: {
    code: string
    message: string
  }
}
```

必须实现幂等：

- 同一个 `commandId` 重试不能产生重复日志。
- `baseVersion` 不匹配时返回冲突，不自动覆盖。

## P0 后端命令

### archiveGame

用途：保存当前对局到历史复盘。

输入：

- `sessionId`
- `archive: GameArchiveRecord`
- `includeReviewDraft?: boolean`

输出：

- `GameArchive`
- 最新归档列表摘要

规则：

- 可以多次保存同一局；归档记录主键统一使用 `id`，同一 `id` 幂等覆盖，不同 `id` 追加新版本。
- 后端只保存前端显式提交的完整归档快照，不反向生成或修改 `GameSession`。
- 保存失败时，前端不得解锁重置游戏。

### resetAfterArchive

用途：保存成功后校验是否允许前端重置当前对局。

输入：

- `sessionId`
- `archiveId`
- `confirmReset: true`

输出：

- `archiveId`
- `resetAllowed: true`

规则：

- 找不到归档时拒绝。
- 归档不是当前 session 的快照时拒绝。
- 后端只做门卫校验，不创建或返回新 `GameSession`。
- 前端继续负责本地 `reset-session`，回到空白新局初始状态（清空玩家人数、座位、状态、昼夜、日志、投票和当前草稿；历史归档、本机设置和脚本库保留）。
- 不能删除历史复盘。

### listArchives / getArchive

用途：历史复盘。

输入：

- 日期范围
- 剧本
- 人数
- 胜方

输出：

- 对局列表
- 单局日志
- fake AI 复盘草稿

### generateReviewDraft

用途：AI 复盘。

P0 当前只做本地 fake 草稿 endpoint，不调用真实模型。

输入：

- `archiveId`
- `reviewStyle`: `neutral | sharp`
- `includePlayerScores: boolean`

输出：

- 当局评价
- 整局复盘
- 玩家评分草稿
- 每名玩家评语 / 锐评
- 优先回看索引

规则：

- 必须标注“基于日志，不是客观能力评分”。
- 不生成公开排行榜。
- 缺少日志时要降低置信度或提示信息不足。
- 不修改归档、不修改当前局、不写权威状态。

### generateSetupCandidates

用途：AI 配板。

输入：

- 剧本
- 人数
- 玩家经验
- 锁定 / 排除
- 风格偏好

输出：

- 2—3 套候选
- 理由
- 风险
- 恶魔伪装建议
- 合法性检查

规则：

- 候选不是确认配板。
- 说书人确认后才产生 `ConfirmedSetup`。

### saveAISettings（前端本地，后置后端化）

用途：当前只在前端 settings service 保存非敏感 AI 配置。P0 后端不实现该 endpoint。

可保存：

- provider mode
- base URL
- model name
- timeout
- context limit
- stream enabled

禁止保存：

- API Key
- token
- cookie
- 私钥

真实 API Key 必须留在后端环境变量或后端密钥存储中；接真实 AI 前另行审查。

## 前端 Application Service

前端应新增服务层，不让组件直接读写 localStorage 或调用后端。

建议目录：

```text
src/services/
  gameSessionService.ts
  archiveService.ts
  aiService.ts
  settingsService.ts
```

服务层先支持两个 adapter：

```text
localPrototypeAdapter
  当前前端原型继续可用

httpBackendAdapter
  后端实现后切换
```

组件只依赖 service 接口，不关心数据来自 localStorage 还是 HTTP。

归档服务必须通过 adapter 接口切换持久化：

- `archiveService` 只依赖 `ArchiveAdapter` 接口。
- 默认 adapter 是本地 `localArchiveAdapter`。
- 后端接入时新增 `httpArchiveAdapter`，异步 HTTP 路径由初始化层调用 `setAsyncArchiveAdapter()` 受控切换。
- 组件不得直接 import local/http adapter。

## 后端模块建议

首版采用模块化单体，不拆微服务。

```text
server/
  domain/
    archive/
  application/
    commands/
    queries/
  adapters/
    persistence/
  api/
    routes/
  tests/
```

## 验收门槛

后端 P0 完成必须满足：

- 保存本局后刷新仍能在历史复盘看到。
- 重置游戏不会删除历史复盘。
- 未保存不能重置。
- 同一个保存命令重试不会重复创建多条同名归档。
- AI API Key 不出现在 localStorage、导出 JSON、日志或前端源码。
- AI 复盘不可修改权威状态。
- `npm run check` 通过。

## 禁止事项

- 不做官方魔典同步器。
- 不做玩家常驻端。
- 不做规则引擎。
- 不写万能 `server.js`。
- 不把所有数据塞进一张 JSON 表。
- 不让 AI 自动执行技能、处决、胜负或昼夜跳转。
