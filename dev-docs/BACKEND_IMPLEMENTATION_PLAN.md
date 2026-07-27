# 后端最小闭环开发计划（审查版）

## 0. 当前结论

本计划只用于你审查后端落地范围。当前不开始实现后端。

P0 后端最小闭环只做四件事：

1. 保存本局归档。
2. 查询历史复盘。
3. 查看单局复盘详情。
4. 保存成功后允许重置当前游戏。

可选但仍属于 P0 边界内：

5. AI 复盘草稿 fake endpoint。

明确不做：

- 真实 AI 付费调用。
- VPS 部署。
- 官方魔典同步。
- 玩家常驻端或玩家收件箱。
- 自动规则引擎。
- 自动判胜、自动处决、自动昼夜推进。
- 真实 API Key 落入前端、日志、导出文件或仓库。
- AI 设置后端化。

## 1. 目标

把当前前端 localStorage 原型，升级为可以替换后端 adapter 的模块化单体最小闭环。

成功标准不是“后端功能很多”，而是：

- 前端 UI 不大改。
- 当前已经满意的交互不倒退。
- 归档、历史复盘和重置有明确命令边界。
- archive service 只依赖 adapter 接口，后端接入不改组件调用。
- 保存失败不能解锁重置。
- 后端代码不变成万能 service 或巨型 route。

## 2. 当前前置条件

已经完成：

- 前端 `GameSession` 统一状态。
- archive service 已有命令式边界：
  - `archiveGame`
  - `listArchives`
  - `getArchive`
  - `resetAfterArchive`
- AI service 已收口：
  - `generateSetupCandidates`
  - `createNightResultAdvice`
  - `createGameReviewDraft`
- settings service 已收口。
- session service 已收口。
- timer service 已收口。
- 结束对局、历史复盘、AI 复盘已有前端原型。
- 已有测试覆盖：
  - AI 不写权威状态。
  - 未归档不能重置。
  - archive 命令幂等和 reset 拒绝条件。

## 3. 推荐后端形态

推荐先做模块化单体，不拆微服务。

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

### 3.1 不建议一开始做

- 不建议一开始上复杂权限系统。
- 不建议一开始做多用户房间。
- 不建议一开始做 WebSocket。
- 不建议一开始建立 `session/`、`ai/`、`settings/` 或 `ai-provider/` 后端目录。
- 不建议一开始做官方魔典同步器。
- 不建议一开始接真实 AI。
- 不建议把后端 route 直接写成业务逻辑中心。

## 4. P0 命令与查询

### 4.1 `archiveGame`

用途：保存当前对局为历史归档。

输入：

- `commandId`
- `sessionId`
- `baseVersion`
- `winner`
- `includeReviewDraft`

输出：

- `archive`
- `resetUnlocked: true`

必须满足：

- 同一个 `commandId` 重试不能创建重复归档。
- 保存失败时不能解锁重置。
- 归档必须包含当前对局快照、时间线、玩家状态、胜方和摘要。

### 4.2 `listArchives`

用途：查询历史复盘列表。

筛选：

- 日期范围。
- 剧本。
- 人数。
- 胜方。

必须满足：

- 无归档返回空数组。
- 支持以后查看任意时间的任意对局。

### 4.3 `getArchive`

用途：查看单局复盘详情。

输出：

- 归档快照。
- 当局日志。
- 玩家状态摘要。
- 投票、夜晚、白天、处决、更正统计。
- AI 复盘草稿，如果已有。

### 4.4 `resetAfterArchive`

用途：归档成功后校验是否允许前端重置当前游戏。

输入：

- `commandId`
- `sessionId`
- `archiveId`
- `confirmReset: true`

必须拒绝：

- 没有归档。
- `archiveId` 不存在。
- 归档不属于当前 `sessionId`。
- `confirmReset` 不是 true。

必须满足：

- 返回 `archiveId` 与 `resetAllowed: true`。
- 后端不创建、不返回新的 `GameSession`。
- 前端收到允许结果后，继续使用本地 `reset-session` 创建空白新局初始状态（清空玩家人数、座位、状态、昼夜、日志、投票和当前草稿；历史归档、本机设置和脚本库保留）。
- 不删除历史归档。
- 不清空复盘列表。

## 5. AI P0 边界

### 5.1 fake review draft

P0 只允许 fake review draft，不建立可切换真实模型的 provider 抽象。

用途：

- 让后端 API、前端错误处理和数据结构先跑通。
- 不调用真实模型。
- 不花钱。
- 不要求 API Key。

### 5.2 `generateReviewDraft`

输入：

- `archiveId`
- `reviewStyle`
- `includePlayerScores`

输出：

- 当局评价。
- 整局复盘。
- 每名玩家评分草稿。
- 每名玩家评语和锐评草稿。

边界：

- 只能基于日志估算。
- 不得伪装成客观能力评分。
- 不得公开排行榜化。
- 不得修改归档。

### 5.3 `generateSetupCandidates`

P0 明确不接后端，继续使用当前前端 local adapter。

后续如果接入，必须另行审查知识包方案：

- 不能确认配板。
- 不能发送身份。
- 不能写 `GameSession` 权威状态。
- 必须依赖知识包，不允许纯靠模型口头猜角色规则。

## 6. 数据存储选择

P0 推荐选择本地 JSON 文件。SQLite 和 Postgres 后置。

建议结构：

```text
data/
  archives/
    archives.json
```

### 方案 A：本地 JSON 文件（P0 推荐）

优点：

- 实现最快。
- 容易导出、备份和调试。
- 和当前 localStorage 原型迁移最平滑。

适合：

- 继续验证本地单机工具。
- 归档量级在个位数到百位数。
- 直接查看、备份和导出。

### 方案 B：SQLite（后置）

优点：

- 仍然本地优先。
- 有表结构和查询能力。
- 后续迁移到 VPS/Postgres 更清晰。

缺点：

- 比 JSON 多一点工程量。

触发条件：

- 归档数量明显增长。
- 需要更强查询能力。
- JSON 文件写入或维护出现实际问题。

### 方案 C：直接 Postgres

优点：

- VPS 正式化更接近最终形态。

缺点：

- 过早。
- 会引入部署、连接、备份和权限问题。

当前不建议。

## 7. 推荐实施阶段

### 阶段 1：只建后端骨架

目标：

- 建 `server/` 目录。
- 建 application/adapters/api 分层；P0 只保留 archive 必要目录。
- 不接前端。
- 不改 UI。

验收：

- 后端测试能跑。
- 没有真实 AI。
- 没有数据库选型争议代码。

### 阶段 2：归档本地持久化 adapter

目标：

- 实现 `ArchiveRepository`。
- 支持 `saveArchive / listArchives / getArchive`。
- 存储使用本地 JSON 文件。
- 写入使用临时文件 + rename。

验收：

- 保存后能查列表。
- 能查单局详情。
- 同一个 `commandId` 不重复写。

### 阶段 3：实现 `archiveGame`

目标：

- 保存前端显式提交的完整 `GameArchiveRecord` 快照。
- 后端不反向生成或修改 `GameSession`。

验收：

- 成功返回 `resetUnlocked: true`。
- 失败返回错误，前端不能重置。
- 归档中包含日志、玩家状态、胜方和摘要。

### 阶段 4：实现 `resetAfterArchive`

目标：

- 只有归档存在且属于当前 session 时才允许重置。
- 只做门卫校验，不创建新 `GameSession`。

验收：

- 未保存不能重置。
- 错 archiveId 不能重置。
- session 不匹配不能重置。
- 成功只返回 `archiveId` 与允许标志。
- 重置不删除历史归档。

### 阶段 5：前端接 HTTP adapter

目标：

- 保持现有 UI 不变。
- 将 archive service 的 local adapter 替换或并存为 http adapter。

验收：

- 结束对局页面仍然原样可用。
- 历史复盘刷新后可见。
- E2E 仍通过。

### 阶段 6：fake AI review draft

目标：

- 先让 AI 复盘接口存在，但返回 fake 草稿。
- 不建立通用 AI provider 抽象层。

验收：

- 没有 API Key。
- 没有真实网络 AI 调用。
- AI 结果不能写权威状态。

## 8. 文件预算

- 后端 route：不超过 120 行。
- command handler：不超过 180 行。
- repository adapter：不超过 180 行。
- domain 纯函数：不超过 220 行。
- 单个测试文件：建议不超过 260 行。

超过预算先拆文件，不继续堆。

## 9. 测试要求

每阶段至少要有对应测试。

### 必须测

- `archiveGame` 成功保存。
- `archiveGame` 同 `commandId` 幂等。
- `listArchives` 空列表。
- `listArchives` 日期筛选。
- `getArchive` 找不到返回 `ARCHIVE_NOT_FOUND`。
- `resetAfterArchive` 未归档拒绝。
- `resetAfterArchive` session 不匹配拒绝。
- `resetAfterArchive` 成功后历史归档仍存在。
- `resetAfterArchive` 成功不返回新 `GameSession`。
- fake AI 复盘不修改归档。

### 前端回归

继续跑：

```powershell
npm run check
npm run test:e2e -- --workers=1
```

如果新增后端脚本，还要新增：

```powershell
npm run test:server
```

## 10. 必须暂停问你的点

以下任何一个出现，都不能无人继续：

- 从 JSON 文件改成 SQLite 或 Postgres。
- 是否真的要部署 VPS。
- 是否接真实 AI。
- API Key 如何放。
- 是否允许把对局日志发给 AI。
- 是否需要登录/多用户。
- 是否迁移或删除旧 localStorage 数据。
- 是否改变已满意 UI。

## 11. 我建议你重点审查的问题

1. P0 是否只保留归档、复盘、重置和 fake review draft。
2. 你是否接受 JSON 文件作为 P0 本地后端存储。
3. 是否允许先不做用户登录。
4. 是否允许前端保留 local adapter 作为离线兜底。
5. `resetAfterArchive` 采用门卫模式：后端只校验，前端本地重置。
6. AI 复盘是否先只做 fake endpoint。
7. 真实 AI 接入前，是否必须再次单独确认。

## 12. 建议批准口径

如果你认可，可以批准：

```text
批准后端 P0 最小闭环：
只做 archiveGame、listArchives、getArchive、resetAfterArchive、fake generateReviewDraft。
resetAfterArchive 只做门卫校验，不返回新 GameSession。
P0 存储使用 JSON 文件。
不接真实 AI，不部署 VPS，不做官方魔典同步，不改 UI。
每阶段必须跑 npm run check 和对应后端测试。
```
