# 24 小时无人推进 Runbook：后端 P0 归档闭环

## 0. 运行状态

本文件用于 24 小时内的受控无人推进。它不是无限授权，不允许越过本文件边界。

当前已完成：

- `server/archive/` 后端归档核心。
- `JsonArchiveRepository`。
- `createArchiveHandlers()`。
- `npm run test:server`。
- 归档核心单测覆盖保存、读取、幂等、版本追加、日期筛选、reset 门卫和旧 `schemaVersion` 兼容。

当前未完成：

- HTTP route。
- `httpArchiveAdapter`。
- 前端切后端 adapter。
- fake review draft endpoint。

## 1. 24 小时目标

完成后端 P0 归档 HTTP 最小闭环，但不改变已确认 UI。

目标闭环：

```text
GameEndSheet / Review UI
  ↓ 不直接知道后端
archiveService
  ↓ setArchiveAdapter(httpArchiveAdapter)
httpArchiveAdapter
  ↓ HTTP
archive route
  ↓
server/archive handlers
  ↓
JsonArchiveRepository
  ↓
data/archives/archives.json
```

完成后应具备：

1. 后端 archive route 可测试。
2. `httpArchiveAdapter` 可测试。
3. local adapter 仍可用。
4. 前端组件不直接 import local/http adapter。
5. 保存失败不能解锁重置。
6. `resetAfterArchive` 仍只做门卫校验。
7. 文档和 `HUMAN_CHANGELOG.md` 同步。

## 2. 允许做

只允许做以下事项：

1. 新增最小 HTTP archive route。
2. 暴露以下接口：
   - `POST /api/games/:sessionId/archive`
   - `GET /api/archives`
   - `GET /api/archives/:archiveId`
   - `POST /api/games/:sessionId/reset-after-archive`
3. 新增 `httpArchiveAdapter`。
4. 新增后端 route 测试。
5. 新增前端 adapter 切换测试。
6. 更新：
   - `dev-docs/API_CONTRACT.md`
   - `dev-docs/BACKEND_P0_FINAL.md`
   - `dev-docs/development-plan.md`
   - `dev-docs/HUMAN_CHANGELOG.md`
7. 运行并修复相关测试。

## 3. 禁止做

无人推进期间禁止：

1. 不接真实 AI。
2. 不新增 OpenAI / Claude / Compatible API SDK。
3. 不新增 AI Provider 抽象。
4. 不读取、保存或测试真实 API Key。
5. 不部署 VPS。
6. 不新增 SQLite / Postgres / ORM。
7. 不做官方魔典同步。
8. 不做玩家常驻端或玩家收件箱。
9. 不做自动规则引擎。
10. 不自动判胜、自动处决、自动昼夜推进。
11. 不让后端创建新 `GameSession`。
12. 不让后端修改当前局权威状态。
13. 不大改 UI。
14. 不复制旧项目巨型 HTML / 巨型 server / 角色规则状态机。
15. 不新增生产依赖，除非先停止并报告理由。

## 4. 停止条件

出现以下任一情况，必须停止并汇报，不得继续无人推进：

1. 需要数据库选型。
2. 需要部署或外部网络服务。
3. 需要真实 AI Key。
4. 需要改 GameSession 权威状态生成方式。
5. 需要让后端生成或修正身份、状态、投票、胜负、昼夜。
6. 单个新增后端文件超过 180 行，且无法直接拆分。
7. 任一 `src/features/*.tsx` 业务组件被迫大改。
8. `npm run check` 连续两轮失败且原因不清。
9. 需要引入新依赖。
10. 需要参考旧项目时发现只能通过复制大块代码解决。

## 5. 阶段 A：HTTP route 最小骨架

目标：

- 新增最小 HTTP route 层。
- route 只负责解析请求、调用 `server/archive` handlers、返回 JSON。
- route 不写归档业务逻辑。

建议文件：

```text
server/archive/httpArchiveRoutes.ts
server/archive/httpArchiveRoutes.test.ts
```

验收：

```powershell
npm run test:server
npm run check
```

必须覆盖：

- route 可以保存归档。
- route 可以查列表。
- route 可以查单局。
- route 可以 reset 门卫校验。

## 6. 阶段 B：HTTP route 错误码

目标：

- 统一错误返回。
- 不引入复杂 middleware。

必须覆盖：

- `ARCHIVE_NOT_FOUND`
- `RESET_NOT_CONFIRMED`
- `SESSION_MISMATCH`
- malformed request 返回明确错误。

验收：

```powershell
npm run test:server
```

## 7. 阶段 C：`httpArchiveAdapter`

目标：

- 新增前端可替换 adapter。
- 实现 `ArchiveAdapter`：
  - `load()`
  - `save(record)`
  - `get(archiveId)`
- 默认不强制切 UI。

建议文件：

```text
src/services/archive/httpArchiveAdapter.ts
src/services/archive/httpArchiveAdapter.test.ts
```

规则：

- adapter 只做 HTTP 映射。
- 不在组件里 import adapter。
- 不在 adapter 里生成或修改 `GameSession`。

验收：

```powershell
npm run test -- src/services/archive/httpArchiveAdapter.test.ts
npm run check
```

## 8. 阶段 D：受控切换验证

目标：

- 通过 `setArchiveAdapter(httpArchiveAdapter)` 验证流程。
- 不改变 UI 文案和布局。

允许：

- 测试环境注入 http adapter。
- 增加启动层配置开关。

禁止：

- UI 按钮新增“本地/后端模式”。
- 让用户在界面上配置后端地址。
- 默认要求后端运行才能打开前端。

验收：

```powershell
npm run check
npm run test:e2e -- --workers=1
```

## 9. 阶段 E：fake review draft endpoint（后置）

只有阶段 A-D 通过后，才允许考虑。

目标：

- 基于已保存归档返回 fake 复盘草稿。
- 不接真实 AI。
- 不建立 provider 抽象。
- 不修改归档。

如果阶段 A-D 还没稳定，不做阶段 E。

## 10. 每阶段最终汇报格式

每完成一个阶段，必须汇报：

1. 完成了什么。
2. 用户可见变化是什么。
3. Before / After。
4. 触及文件。
5. 验证命令和结果。
6. 未做内容。
7. 是否触发停止条件。
8. 下一阶段建议。

## 11. 旧项目参考边界

F 盘旧血染钟楼项目只允许作为经验参考：

允许借鉴：

- 旧项目犯过的错误。
- 业务流程经验。
- 数据字段命名教训。
- 验收场景。

禁止复制：

- 巨型 HTML。
- 巨型 server。
- 多套状态源。
- 角色 ID 自动规则状态机。
- WebSocket 同步方案。
- 玩家端整套旧逻辑。

如果必须复制旧项目代码才能继续，立即停止。

## 12. 当前推荐下一步

从阶段 A 开始：新增 HTTP route 最小骨架和 route 测试。

不要先做 fake review draft，不要先做真实 AI，不要先做部署。
