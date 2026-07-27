# 后端 Runtime Mount 计划

## 结论

下一阶段先做 **runtime mount**，再决定 UI 是否切 HTTP adapter。

原因：

- UI 切 HTTP 需要可观察的后端运行时，否则网络失败只能变成前端失败。
- 当前 `createArchiveHttpRoutes()` 已经是纯函数层，适合挂到最小 Node runtime。
- runtime mount 不需要真实 AI、不需要数据库、不需要 VPS、不需要新增依赖。

## P0 runtime 只做

- 启动一个本地 Node HTTP server。
- 挂载 archive route：
  - `POST /api/games/:sessionId/archive`
  - `GET /api/archives`
  - `GET /api/archives/:archiveId`
  - `POST /api/games/:sessionId/reset-after-archive`
  - `POST /api/archives/:archiveId/review-draft`
- 提供 `GET /healthz`。
- 使用 `JsonArchiveRepository` 写入 JSON 文件。
- 提供 smoke 脚本验证真实 runtime bundle。

## 明确不做

- 不改 UI 默认路径。
- 不接真实 AI。
- 不保存 API Key。
- 不部署 VPS。
- 不加数据库。
- 不加 Express/Koa/Fastify 等新依赖。
- 不做玩家端、登录、权限或官方魔典同步。

## 默认配置

```text
PORT=8787
BOTC_BACKEND_PORT=8787
BOTC_ARCHIVE_DATA_FILE=data/archives/archives.json
```

优先级：

1. 显式传入启动参数。
2. 环境变量。
3. 默认值。

## 脚本

```powershell
npm run build:backend
npm run smoke:backend
npm run dev:backend
```

- `build:backend`：用 Vite 打包 server runtime 到 `dist-server/runtime.mjs`。
- `smoke:backend`：导入打包后的 runtime，启动临时端口，保存归档并生成 fake 复盘草稿。
- `dev:backend`：构建后启动本地后端。

## 验收

```powershell
npm run test:server
npm run build:backend
npm run smoke:backend
npm run check
```

## 收口状态

状态：**Done**。

本阶段已经完成本地 Node runtime mount，不改变 UI 默认路径。

已验证：

```powershell
npm run test:server
npm run smoke:backend
npm run check
```

smoke 结果确认：

- `ok: true`
- `archives: 1`
- `reviewProvider: fake`

仍未做：

- 未切 UI 到 HTTP adapter。
- 未接真实 AI。
- 未部署 VPS。
- 未新增数据库或生产依赖。

## 下一步决策

runtime mount 完成后，再决策 UI：

1. 默认继续本地 adapter，HTTP 只作为高级/调试路径。
2. 默认走 HTTP，本地作为离线 fallback。
3. 由设置页手动选择。

当前建议先保持 UI 默认本地 adapter，避免现场主持时被本地 runtime 状态影响。
