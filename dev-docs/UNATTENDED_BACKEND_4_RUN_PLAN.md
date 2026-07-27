# 后端 P0 四次无人推进计划

## 0. 总目标

在不改已确认 UI、不接真实 AI、不部署 VPS、不做官方魔典同步的前提下，把“结束对局 / 历史复盘 / 保存后重置”的后端 P0 最小闭环接起来。

目标链路：

```text
GameEndSheet / Review UI
  -> archiveService
  -> ArchiveAdapter
  -> httpArchiveAdapter
  -> archive HTTP routes
  -> server/archive handlers
  -> JsonArchiveRepository
  -> data/archives/archives.json
```

## 1. 全程硬边界

允许：

- 归档 HTTP route。
- 归档错误码。
- `httpArchiveAdapter`。
- 本地 adapter 与 HTTP adapter 可切换。
- fake 赛后复盘草稿 endpoint。
- 测试、合同和人类变更日志。

禁止：

- 真实 AI 调用、API Key 读取或保存。
- AI Provider 抽象、OpenAI/Claude SDK。
- SQLite / Postgres / ORM。
- VPS 部署。
- 官方魔典同步器。
- 玩家常驻端或玩家收件箱。
- 后端创建或修改 `GameSession`。
- 自动规则引擎、自动胜负、自动昼夜、自动处决。
- 复制旧项目巨型 HTML、巨型 server 或角色 ID 状态机。

旧项目只允许作为业务流程和反面经验参考，不允许复制架构和代码。

## 2. 停止条件

出现任一情况立刻停止并汇报：

1. 需要新增生产依赖。
2. 需要真实外部服务、部署或凭证。
3. 需要数据库选型。
4. 需要后端生成新局或修改权威状态。
5. 需要改变已确认 UI 主流程。
6. 单个新增后端文件超过 180 行且无法拆分。
7. `npm run check` 连续两次失败且原因不清。
8. 只能靠复制旧项目大块代码继续。

## 3. 第 1 次无人推进：HTTP route + 错误码

目标：

- 新增 archive HTTP route 纯函数层。
- route 只解析请求、调用 handlers、返回 JSON。
- 补齐错误码返回。

范围：

- `server/archive/httpArchiveRoutes.ts`
- `server/archive/httpArchiveRoutes.test.ts`
- `server/archive/types.ts`
- 必要文档

接口：

- `POST /api/games/:sessionId/archive`
- `GET /api/archives`
- `GET /api/archives/:archiveId`
- `POST /api/games/:sessionId/reset-after-archive`

验收：

```powershell
npm run test:server
npm run check
```

完成标志：

- 保存归档、列表、详情、reset 门卫均有 route 测试。
- malformed request 返回明确错误。
- route 不直接写业务逻辑。

## 4. 第 2 次无人推进：httpArchiveAdapter

目标：

- 新增前端 `httpArchiveAdapter`，实现异步 HTTP 归档 adapter。
- 不改组件，不让组件感知本地/后端差异。
- 不把真实 HTTP 伪装成同步 `ArchiveAdapter`；受控切换留到第 3 轮处理。

范围：

- `src/services/archive/httpArchiveAdapter.ts`
- `src/services/archive/httpArchiveAdapter.test.ts`
- `src/services/archive/types.ts`
- 必要的测试 mock

验收：

```powershell
npm run test -- src/services/archive/httpArchiveAdapter.test.ts
npm run check
```

完成标志：

- `load/save/get` 映射 HTTP route。
- 保存失败不会伪装成功。
- adapter 不生成、不修改 `GameSession`。
- local adapter 默认仍可用。

## 5. 第 3 次无人推进：受控切换与前端闭环

目标：

- 通过 `setAsyncArchiveAdapter(httpArchiveAdapter)` 验证结束对局闭环。
- 保持同步 `ArchiveAdapter` 给本地原型使用，不把真实 HTTP 伪装成同步调用。
- 保留 local adapter 默认可用。

范围：

- 测试层受控注入异步 HTTP adapter。
- 结束对局/历史复盘相关测试。
- 不新增 UI 模式切换按钮。

验收：

```powershell
npm run check
npm run test:e2e -- --workers=1
```

完成标志：

- local adapter 和 http adapter 都可测试。
- 保存本局、历史复盘、保存后重置路径仍可用。
- 前端组件不直接 import local/http adapter。
- UI 默认仍走本地 adapter；HTTP 闭环只通过服务层和测试层验证。

## 6. 第 4 次无人推进：fake 复盘草稿 endpoint + 收口审查

目标：

- 实现 `POST /api/archives/:archiveId/review-draft` fake endpoint。
- 基于归档日志生成本地可测试的复盘草稿。
- 完成文档、测试和架构预算复查。

范围：

- `server/archive/reviewDraft*` 或同级小模块。
- route 测试。
- 合同和 changelog。

验收：

```powershell
npm run test:server
npm run check
npm run test:e2e -- --workers=1
```

完成标志：

- 找不到归档返回 `ARCHIVE_NOT_FOUND`。
- fake 草稿不修改归档、不修改当前局。
- 输出带 disclaimer，明确评分只基于日志。
- 四轮结束后给出是否进入下一阶段的结论。

## 7. 每轮汇报模板

每轮结束必须汇报：

1. 本轮属于第几次无人推进。
2. 完成了什么。
3. 用户可见变化。
4. Before / After。
5. 触及文件。
6. 验证命令和结果。
7. 未做内容。
8. 是否触发停止条件。
9. 下一轮建议。
