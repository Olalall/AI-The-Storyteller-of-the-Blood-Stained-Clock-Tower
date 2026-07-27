# Runtime Mount 收口审查

## 总体结论

状态：**通过**。

runtime mount 已在 P0 边界内收口：本地 Node runtime 可以挂载 archive HTTP route、提供 `/healthz`、使用 JSON repository，并通过真实 HTTP smoke 验证。

## 已完成范围

### Runtime

- 文件：`server/runtime.ts`
- 行数：106 行，低于入口文件 120 行预算。
- 使用 Node 内置 `node:http`。
- 未引入 Express、Koa、Fastify 或其它运行时框架。
- 未引入数据库、ORM、队列、WebSocket、账号系统或 provider 插件。

### 构建

- 文件：`vite.backend.config.ts`
- 输出：`dist-server/runtime.mjs`
- `dist-server` 已加入 `.gitignore`，不作为源码产物提交。

### Smoke

- 文件：`scripts/smoke-backend-runtime.mjs`
- 行数：130 行，属于验证脚本，低于 180 行停止线。
- 流程：
  1. 创建临时数据目录。
  2. 启动临时端口 runtime。
  3. 请求 `/healthz`。
  4. `POST /api/games/:sessionId/archive` 保存归档。
  5. `GET /api/archives` 验证列表。
  6. `GET /api/archives/:archiveId` 验证详情。
  7. `POST /api/archives/:archiveId/review-draft` 验证 fake 复盘草稿。
  8. 关闭 runtime 并清理临时目录。

## HTTP 入口

runtime 挂载的 endpoint：

- `GET /healthz`
- `POST /api/games/:sessionId/archive`
- `GET /api/archives`
- `GET /api/archives/:archiveId`
- `POST /api/games/:sessionId/reset-after-archive`
- `POST /api/archives/:archiveId/review-draft`

## 架构边界

当前链路保持为：

```text
server/runtime.ts
  -> server/archive/httpArchiveRoutes.ts
  -> server/archive/handlers.ts
  -> server/archive/jsonArchiveRepository.ts
```

符合 `UNATTENDED_EXECUTION_GUARDRAILS.md` 要求。

## 明确未做

- 未改 UI 默认数据路径。
- 未让前端默认走 HTTP adapter。
- 未接真实 AI。
- 未读取或保存 API Key。
- 未部署 VPS。
- 未新增数据库。
- 未新增生产依赖。
- 未做玩家端、账号、权限、官方魔典同步。
- 未让后端创建或修改权威 `GameSession`。
- 未做自动规则引擎、自动胜负、自动昼夜或自动处决。

## 验收结果

已通过：

```powershell
npm run test:server
npm run smoke:backend
npm run check
```

smoke 输出确认：

```json
{
  "ok": true,
  "archiveId": "archive-smoke-session-smoke-command",
  "archives": 1,
  "reviewProvider": "fake"
}
```

## 风险

### P1：裸 fetch 无超时策略

当前 runtime smoke 与未来 HTTP adapter 调用仍需要在 UI 接入阶段设计超时、错误提示和回退策略。该风险不阻塞 runtime mount。

### P1：JSON repository 单进程假设

当前 JSON 文件存储适合单机本地原型。若未来 VPS 多进程或多实例部署，需要锁、单写者或数据库方案。当前不进入该范围。

### P1：UI 默认路径未决

runtime 已可用，但 UI 是否默认走 HTTP 属于产品决策，不能在无人推进中直接改。

## 下一步

进入 `UI_HTTP_ADAPTER_DECISION.md`，只做决策文档，不改 UI。
