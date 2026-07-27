# 无人推进后端实现计划

## 目标

让 Codex 可以在无人值守时推进“前端功能规格收口 + 后端最小闭环实现”，但不跑偏、不扩范围、不做高风险动作。

本计划不是授权部署、不是授权使用真实 API Key、不是授权改官方魔典，也不是授权实现规则引擎。

## 当前状态判断

后端尚未落地。

已完成：

- 前端 UI 原型。
- 统一 `GameSession` 前端合同雏形。
- 结束对局、历史复盘、AI 复盘草稿的前端展示。
- 本地 service/adapter 原型。
- 归档 service 已使用 `archiveGame / listArchives / getArchive / resetAfterArchive` 命令边界；当前 adapter 仍为本地实现。

未完成：

- 后端服务。
- 真实 AI Provider。
- 真实后端版 `archiveGame / resetAfterArchive`。
- 后端 JSON 归档 adapter。
- 剧本导入知识包。
- 后端鉴权、部署、VPS 同步。

## 无人推进总规则

### 可以无人推进

- 整理文档和合同。
- 拆分前端服务层。
- 新增本地 adapter。
- 新增后端骨架。
- 新增纯本地测试。
- 实现 `archiveGame / listArchives / getArchive / resetAfterArchive` 的本地闭环。
- 实现 `generateReviewDraft` fake endpoint。
- 补单元测试、E2E、架构校验。

### 不能无人推进

- 部署 VPS。
- 写入真实生产数据库。
- 调用真实付费 AI API。
- 保存真实 API Key 到仓库、localStorage 或日志。
- 实现官方魔典同步器。
- 逆向官方接口。
- 新增玩家常驻端。
- 实现自动规则引擎。
- 大范围重写 UI。
- 改 AGENTS.md 的稳定规则，除非另行征得批准。

### 必须暂停询问

出现以下情况必须停止：

- 需要选择数据库方案且会影响长期部署。
- 需要真实 API Key 或真实 AI 调用。
- 需要部署或连接 VPS。
- 需要删除或迁移现有本地数据。
- 发现现有 UI 需要大改才能接后端。
- 发现合同和现有代码冲突，且无法通过 adapter 兼容。

## 阶段 A：规格收口

目标：让后端实现前没有歧义。

任务：

- [x] 重写 `dev-docs/frontend-backend-contract.md`。
- [x] 生成 `dev-docs/BACKEND_IMPLEMENTATION_PLAN.md`。
- [x] 生成 `dev-docs/BACKEND_P0_FINAL.md`，冻结 P0 范围、JSON 存储和 `resetAfterArchive` 门卫模式。
- [ ] 生成 `dev-docs/API_CONTRACT.md`。
- [ ] 标记所有原型按钮：真实生效 / 本地假实现 / 后端待接入。
- [ ] 列出 P0 后端命令的输入、输出、错误码。
- [ ] 写明 AI 权限边界在 API 层如何校验。

验收：

- 文档能回答“按钮点下去写哪里、返回什么、失败怎么显示”。
- `npm run check` 通过。

## 阶段 B：前端服务层

目标：避免组件直接绑定 localStorage，方便后端替换。

任务：

- [x] 新建 `src/services/archive/`：归档类型、archive service 和 local adapter。
- [x] 新建 `src/services/session/`：当前本局 session service 和 local adapter。
- [x] 新建 `src/services/ai/`：AI 原型类型、service 和 local adapter。
- [x] 新建 `src/services/timer/`：白天倒计时 service 和 local adapter。
- [x] 新建 `src/services/settings/`：AI 设置类型、settings service 和本地 adapter。
- [x] 把结束对局的归档生成、保存和读取从组件内迁到 archive service。
- [x] archive service 对外 API 收口为 `archiveGame / listArchives / getArchive / resetAfterArchive`，并保留本地 adapter。
- [x] 保留本地归档 adapter，不破坏当前 UI。
- [x] AI 设置页改为调用 settings service；临时 API KEY 仍只用于本次测试输入，不进入前端持久化。
- [x] `useGameSession` 改为调用 session service；旧 `persistence.ts` 仅保留兼容导出。
- [x] AI 配板候选、夜晚结果建议、赛后复盘草稿改为调用 ai service；当前 adapter 不调用真实 AI。
- [x] 白天倒计时 Provider 改为调用 timer service；计时仍不写日志、不推进昼夜。
- [x] `GameSession` 类型拆分到 `features/game-session/model/`；原 `types.ts` 只保留兼容导出。

验收：

- UI 行为不变。
- E2E 仍通过。
- 组件不直接知道归档存在 localStorage 里。

## 阶段 C：后端骨架

目标：建立模块化单体，不引入屎山。

建议目录：

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

任务：

- [ ] 选择 Node 后端方案。
- [ ] 新增最小 HTTP 服务。
- [ ] 新增 JSON 文件归档 adapter。
- [ ] 新增 `archiveGame` 命令。
- [ ] 新增 `resetAfterArchive` 命令；只做门卫校验，不返回新 `GameSession`。
- [ ] 新增 `listArchives / getArchive` 查询。
- [ ] 新增命令幂等表或幂等机制。

验收：

- 后端单元测试通过。
- 保存后刷新仍可查历史复盘。
- 未保存不能重置。
- 重置不删历史归档。
- `resetAfterArchive` 成功只返回允许标志，前端本地执行 `reset-session`。

## 阶段 D：AI 复盘草稿 endpoint（后置，非阶段 C 阻塞）

目标：在归档闭环稳定后，单独增加 AI 复盘 fake 草稿。P0 后端不做 AI 设置后端化、不做 provider 抽象、不做 AI 配板后端化。

任务：

- [ ] 新增 `generateReviewDraft` 假实现。
- [ ] 前端接入后端返回的草稿结构。

验收：

- 没有 API Key 出现在前端存储、导出 JSON 或日志。
- AI 返回只能作为草稿。
- 断网或 AI 不可用时，日志、投票、夜序、结束对局仍可用。

## 阶段 E：真实 AI 接入前检查

真实 AI 接入不属于无人推进默认权限。

接入前必须确认：

- 使用哪个模型。
- 使用哪个 Base URL。
- 后端部署在哪里。
- API Key 如何配置。
- 费用和超时限制。
- 日志中是否记录 prompt。
- 是否允许把对局日志发送给 AI。

没有明确确认前，只能保留 fake endpoint。

## 已落地的前端安全测试

- `src/services/ai/aiService.test.ts`：AI 配板候选、夜晚结果建议、AI 复盘草稿不得改变权威 `GameSession` 或归档对象。
- `src/features/game-end/GameEndSheet.test.tsx`：未保存当前归档时，即使勾选确认也不能触发重置；保存本局后再确认才允许重置。
- `src/services/archive/archiveService.test.ts`：同一 `commandId` 重试不产生重复归档；归档缺失、session 不匹配或未确认时不能重置。

这些测试属于后端最小闭环前的护栏。后续替换为真实后端或 fake AI endpoint 时，必须保留同等边界。

## 架构健康指标

每轮无人推进结束前必须检查：

- `npm run check`
- 后端测试命令
- 文件体积预算
- 是否新增第二套状态源
- 是否新增万能 store
- 是否把业务逻辑塞进 UI 组件
- 是否把 AI 结果当权威状态
- 是否保存了密钥

## 文件预算

- React 页面/业务组件：建议不超过 300 行。
- 共享 UI：建议不超过 220 行。
- 后端 route：建议不超过 120 行。
- 后端 command handler：建议不超过 180 行。
- 领域纯函数：建议不超过 220 行。

超出预算先拆分，不允许靠继续堆代码推进。

## 防跑偏停止条件

如果出现以下任一情况，停止无人推进：

- 新增了第二套 GameSession。
- 新增了角色 ID 自动结算技能结果。
- `完成计票` 能直接杀人。
- AI 能直接确认配板、改状态、处决或判胜。
- 后端 route 直接写数据库且绕过 command handler。
- UI 组件直接拼 SQL、HTTP 或 AI SDK。
- API Key 进入前端持久化。
- 为了接后端大改已满意的 UI。

## 推荐无人推进任务描述

可交给 Codex 的任务：

```text
请按 dev-docs/UNATTENDED_BACKEND_IMPLEMENTATION_PLAN.md 推进阶段 A 和阶段 B。
只允许做文档、前端服务层和本地 adapter。
禁止真实后端部署、真实 AI 调用、保存 API Key、官方魔典同步器和规则引擎。
每完成一个阶段必须运行 npm run check，并更新 dev-docs/HUMAN_CHANGELOG.md。
如果发现需要选择数据库、部署、真实 API Key 或大改 UI，立即停止并汇报。
```

后端实现任务描述：

```text
请按 dev-docs/frontend-backend-contract.md 和 dev-docs/UNATTENDED_BACKEND_IMPLEMENTATION_PLAN.md 推进阶段 C。
实现本地后端最小闭环：archiveGame、listArchives、getArchive、resetAfterArchive。
必须使用命令模型和幂等 commandId。
禁止真实 AI、VPS 部署、官方魔典同步器、玩家常驻端和规则引擎。
完成后运行前后端测试、npm run check，并给出可观察验证步骤。
```
