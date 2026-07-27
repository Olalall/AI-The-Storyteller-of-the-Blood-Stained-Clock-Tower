# 后端 P0 收口审查

## 结论

状态：**可进入外部复审，不建议直接进入部署。**

后端 P0 的“归档最小闭环”已经按四次无人推进完成到**可测试模块**层面：

```text
archiveService
  -> httpArchiveAdapter
  -> archive HTTP route 纯函数
  -> archive handlers
  -> JsonArchiveRepository
  -> fake review draft
```

但它还不是生产服务：

- 没有挂载到真实 Express / VPS runtime。
- 没有真实 AI。
- 没有账号、权限、玩家端、官方魔典同步。
- UI 默认仍走本地 adapter；HTTP 闭环只在服务层和测试层验证。

## P0 范围对照

| 冻结范围 | 状态 | 证据 |
|---|---:|---|
| `archiveGame` | 已完成 | `server/archive/handlers.ts`、`server/archive/httpArchiveRoutes.ts` |
| `listArchives` | 已完成 | `JsonArchiveRepository.list()`、`GET /api/archives` |
| `getArchive` | 已完成 | `JsonArchiveRepository.get()`、`GET /api/archives/:archiveId` |
| `resetAfterArchive` | 已完成 | 门卫校验，不创建新局 |
| `generateReviewDraft` fake 草稿 | 已完成 | `server/archive/reviewDraft.ts`、`POST /api/archives/:archiveId/review-draft` |
| JSON 文件存储 | 已完成 | `server/archive/jsonArchiveRepository.ts` |
| HTTP adapter | 已完成 | `src/services/archive/httpArchiveAdapter.ts` |
| 本地 / HTTP adapter 可替换 | 已完成 | `setAsyncArchiveAdapter()` 与 HTTP 闭环测试 |

## 明确未做

这些是按冻结范围故意不做，不是遗漏：

- 真实 AI 调用。
- OpenAI / Claude SDK。
- API Key 保存或读取。
- AI Provider 抽象。
- AI 设置后端化。
- SQLite / Postgres / ORM。
- VPS 部署。
- 官方魔典同步。
- 玩家常驻端或玩家收件箱。
- 后端创建新 `GameSession`。
- 自动规则引擎、自动判胜、自动昼夜、自动处决。

## 实现文件

### 后端 archive 模块

- `server/archive/types.ts`
- `server/archive/handlers.ts`
- `server/archive/httpArchiveRoutes.ts`
- `server/archive/jsonArchiveRepository.ts`
- `server/archive/reviewDraft.ts`
- `server/archive/index.ts`

### 前端归档服务边界

- `src/services/archive/types.ts`
- `src/services/archive/archiveService.ts`
- `src/services/archive/localArchiveAdapter.ts`
- `src/services/archive/httpArchiveAdapter.ts`
- `src/services/archive/index.ts`

### 测试

- `server/archive/archiveBackend.test.ts`
- `server/archive/httpArchiveRoutes.test.ts`
- `server/archive/archiveServiceHttpLoop.test.ts`
- `src/services/archive/archiveService.test.ts`
- `src/services/archive/httpArchiveAdapter.test.ts`

## API 状态

### 已有 route

```http
POST /api/games/:sessionId/archive
GET  /api/archives
GET  /api/archives/:archiveId
POST /api/games/:sessionId/reset-after-archive
POST /api/archives/:archiveId/review-draft
```

### 错误码

P0 实现的是 archive 最小错误码集合，不等同于完整未来命令模型。

- `BAD_REQUEST`
- `ARCHIVE_NOT_FOUND`
- `SESSION_MISMATCH`
- `RESET_NOT_CONFIRMED`

以下完整合同错误码后置：

- `SESSION_NOT_FOUND`：P0 archive route 不持有 session。
- `VERSION_CONFLICT`：P0 不实现 session 版本冲突。
- `DUPLICATE_COMMAND`：P0 通过同一 `commandId` 返回同一归档实现幂等，不单独返回该错误码。
- `RESET_REQUIRES_ARCHIVE`：P0 用 `ARCHIVE_NOT_FOUND` / `SESSION_MISMATCH` 表达 reset 门卫失败。

## 架构边界检查

### 通过项

- route 只做 HTTP 解析和 JSON 返回，不直接写存储。
- handlers 承担归档业务命令，不依赖 UI。
- repository 只负责 JSON 文件读写。
- `httpArchiveAdapter` 是异步 adapter，没有伪装成同步 `ArchiveAdapter`。
- UI 组件没有直接 import local/http adapter。
- fake 复盘草稿不修改归档、不修改当前局。
- 单个新增后端文件未超过 180 行停止线。

### 仍需注意

- 当前 route 是纯函数层，还没有挂到真实 server runtime。
- `API_CONTRACT.md` 中通用 `CommandMeta/baseVersion/sessionVersion` 是未来完整命令模型；P0 archive route 当前实现的是最小合同，没有做版本冲突。
- `listArchives` 当前实现了日期、胜方、人数筛选；`scriptId/limit/cursor` 属于后续增强。
- `httpArchiveAdapter` 当前通过 `archive-${sessionId}-${commandId}` 的归档 ID 约定反推 `commandId`；如果未来 archive ID 不再遵守该格式，应改为显式命令元数据。
- fake 复盘草稿只能验证合同，不代表真实 AI 质量。

## 测试覆盖

已覆盖：

- 空归档列表。
- 保存归档。
- 同一 `commandId` 幂等。
- 同一 `sessionId` 不同 `commandId` 追加新版本。
- 日期筛选。
- 旧归档缺少 `schemaVersion` 时兼容。
- `getArchive` 缺失返回 `ARCHIVE_NOT_FOUND`。
- reset 未确认拒绝。
- reset 归档缺失拒绝。
- reset session 不匹配拒绝。
- reset 成功不返回新 `GameSession`。
- HTTP adapter 保存失败不会伪装成功。
- 受控注入 HTTP adapter 后，归档服务可完整跑通 HTTP route 到 JSON repository。
- fake 复盘草稿不修改归档。
- fake 复盘找不到归档返回 `ARCHIVE_NOT_FOUND`。

最新验证命令：

```powershell
npm run test:server
npm run check
npm run test:e2e -- --workers=1
```

## 外部复审关注点

请重点审查：

1. P0 是否有范围蔓延。
2. `AsyncArchiveAdapter` 与同步 `ArchiveAdapter` 并存是否清晰。
3. `reviewDraft.ts` 是否仍然只是 fake 草稿，没有暗含真实 AI/provider 抽象。
4. JSON repository 是否足够 P0 使用，是否有明显数据损坏风险。
5. API 合同与实现的差异是否已明确标注。
6. 下一阶段是否应该先做 runtime mount，还是先做 UI HTTP adapter 开关。

## 建议下一阶段

建议进入：**P1 前置收口 / runtime 接入设计**。

推荐顺序：

1. 外部模型复审本文件。
2. 修正复审指出的阻塞问题。
3. 明确是否需要把 pure route 挂载到真实本地 Node runtime。
4. 再决定 UI 是否增加“后端 adapter 开关”或保持本地优先。

不建议现在直接做：

- 真实 AI。
- VPS 部署。
- SQLite / Postgres。
- 玩家端。
- 官方魔典同步。
