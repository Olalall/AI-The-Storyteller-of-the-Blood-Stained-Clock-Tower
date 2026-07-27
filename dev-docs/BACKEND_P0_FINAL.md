# 后端 P0 最小闭环冻结版

## 状态

本文件是后端 P0 实现前的冻结范围。除非用户重新确认，不得在 P0 中扩大范围。

## P0 只做

1. `archiveGame`
2. `listArchives`
3. `getArchive`
4. `resetAfterArchive`
5. `generateReviewDraft` fake 草稿

## P0 明确不做

- 真实 AI 调用。
- OpenAI Compatible Provider 抽象。
- `generateSetupCandidates` 后端化。
- AI 设置后端化。
- SQLite / Postgres。
- VPS 部署。
- 官方魔典同步。
- 玩家常驻端。
- 自动规则引擎。
- 后端创建新 `GameSession`。

## 存储方案

P0 使用 JSON 文件。

建议目录：

```text
data/
  archives/
    archives.json
```

升级到 SQLite 的触发条件：

- 归档数量明显增长。
- 日期、剧本、玩家维度查询变复杂。
- JSON 文件写入或维护出现实际问题。

## `archiveGame`

用途：保存当前对局快照。

输入：

- `commandId`
- `sessionId`
- `archive: GameArchiveRecord`
- `includeReviewDraft?`

输出：

- `archive`
- `resetUnlocked: true`

规则：

- 同一 `commandId` 重试不能重复归档。
- 同一 `sessionId` 使用不同 `commandId` 保存时，创建新的归档版本，不覆盖旧归档。
- 归档包含 `schemaVersion: 1`。
- JSON adapter 读取旧归档时，如果缺少 `schemaVersion`，按 `schemaVersion: 1` 兼容。
- `archiveGame` 返回完整 `GameArchiveRecord`，不是只有列表摘要。
- 后端只保存前端提交的完整归档快照，不反向生成或修改 `GameSession`。
- JSON 写入使用临时文件 + rename，避免半写入。
- 保存失败不能解锁重置。

前端接后端时：

- `archiveService` 只依赖 `ArchiveAdapter` 接口。
- 新增 `httpArchiveAdapter` 后，通过 `setArchiveAdapter()` 切换。
- 组件不得直接 import local/http adapter。

## `listArchives`

用途：查询历史复盘列表。

支持：

- 日期筛选。
- 剧本筛选。
- 人数筛选。
- 胜方筛选。

无归档时返回空数组。

## `getArchive`

用途：读取单局复盘详情。

找不到归档返回 `ARCHIVE_NOT_FOUND`。

## `resetAfterArchive`

采用门卫模式。

后端只做校验：

- `archiveId` 存在。
- 归档属于当前 `sessionId`。
- `confirmReset === true`。

后端返回：

```ts
type ResetAfterArchiveResponse = {
  accepted: true
  data: {
    archiveId: string
    resetAllowed: true
  }
  warnings: string[]
}
```

后端不做：

- 不创建新 `GameSession`。
- 不返回 `newSession`。
- 不删除历史归档。

前端职责：

- 收到 `resetAllowed: true` 后，调用本地 `reset-session` 回到空白新局初始状态（清空玩家人数、座位、状态、昼夜、日志、投票和当前草稿；历史归档、本机设置和脚本库保留）。

## `generateReviewDraft`

P0 只做 fake 草稿。

规则：

- 不调用真实 AI。
- 不要求 API Key。
- 不修改归档。
- 不写权威 `GameSession`。
- 评分只能是日志完整度和活跃度草稿，不是客观玩家能力评价。

## AI 设置（P0 后置）

当前前端保留 settings service 和本地 adapter，只保存非敏感配置：

- mode
- baseUrl
- model
- timeoutSeconds
- contextLimit
- streamEnabled

P0 后端不实现 `saveAISettings` endpoint，不新增 `settings/` 后端模块。

API Key 不允许：

- 写入前端 localStorage。
- 写入 JSON 配置。
- 写入日志。
- 写入导出归档。

## 必须测试

- `archiveGame` 成功保存。
- 同一 `commandId` 不重复保存。
- 同一 `sessionId` 不同 `commandId` 追加新归档版本。
- 旧归档缺少 `schemaVersion` 时读取为 `schemaVersion: 1`。
- archive service 可通过 adapter 接口切换持久化，不改组件调用。
- `archiveGame` 失败不解锁重置。
- `listArchives` 空列表。
- `listArchives` 日期筛选。
- `getArchive` 找不到返回 `ARCHIVE_NOT_FOUND`。
- `resetAfterArchive` 未确认拒绝。
- `resetAfterArchive` 归档缺失拒绝。
- `resetAfterArchive` session 不匹配拒绝。
- `resetAfterArchive` 成功不返回新 `GameSession`。
- 前端保存归档并确认后，当前 session 回到初始局。
- 归档在重置后仍保留。
- fake AI 复盘不修改归档。

## 停止条件

出现以下任一情况，停止并询问用户：

- 想改用 SQLite 或 Postgres。
- 想接真实 AI。
- 想部署 VPS。
- 想让后端创建新 `GameSession`。
- 想把 `generateSetupCandidates` 接入后端。
- 想增加登录、多用户、玩家端或官方魔典同步。
