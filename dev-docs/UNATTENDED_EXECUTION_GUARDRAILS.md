# 无人推进总计划与护栏

## 当前授权边界

当前允许无人推进的主题是：

```text
多板子智能板子包
7-15 人自由开局
本地模板库与随机候选
身份交接和重置后引导
真实 AI 前的合同、mock adapter、安全测试
外部审查包
10.9 安全 AI provider 脚手架：后端脱敏设置、mock fetch client、赛后复盘 mock provider 路径
```

当前不允许无人推进的主题是：

- 真实 AI 付费调用或 live smoke。
- API Key 明文读取后输出、前端保存、远端配置落库或日志打印。
- VPS 正式部署或远端写入。
- 新增数据库、ORM、账号系统。
- 玩家常驻端、玩家收件箱。
- 官方魔典同步器。
- 自动规则引擎、自动胜负、自动处决、自动昼夜。

## 推进方式

无人推进必须按 `UNATTENDED_TASK_INDEX.md` 读取下一项任务。

规则：

1. 只推进第一个 `Ready` 或当前 `In Progress` 的任务。
2. 每个阶段必须独立收口。
3. 当前阶段完成后，如果下一项仍是 `Ready` 且没有触发停止条件，可以自动进入下一阶段。
4. 每个阶段完成后必须更新任务索引。
5. 每个阶段都必须写清：目标、边界、禁止事项、可改文件、验收命令、完成证据、下一阶段状态。
6. 如果任务索引没有下一项 `Ready`，或下一项是 `Blocked / Needs User Review`，必须停止。

## 全局停止条件

出现以下任一情况，必须停止并汇报：

1. 需要真实 AI、API Key、外部付费服务或凭证。
2. 需要 VPS、生产数据、远端写入或部署。
3. 需要新增数据库、ORM 或生产依赖。
4. 需要玩家常驻端、登录、多用户权限或官方魔典同步。
5. 需要后端创建新 `GameSession` 或修改当前局权威状态。
6. 需要自动规则引擎、自动胜负、自动昼夜或自动处决。
7. 需要复制旧项目大块代码、巨型 HTML、巨型 server 或角色 ID 状态机。
8. `npm run check` 连续两次失败且原因不清。
9. 单个新业务文件超过预算且无法拆分。
10. 需要改变已经确认的 UI 主流程或视觉语言。
11. 新增板子规则资料互相冲突，需要说书人判断。
12. AI 输出要直接改变身份、状态、死亡、投票、昼夜或日志。

## 防屎山规则

### 文件体积

- 入口文件建议不超过 120 行。
- 新增后端业务文件建议不超过 180 行。
- 新增前端业务组件建议不超过 300 行。
- 新增共享 UI 组件建议不超过 220 行。
- 板子数据必须拆成 roles、night-orders、setup-templates、setup-rules、acceptance，不允许单文件堆所有内容。

### 分层

后端保持：

```text
runtime mount
  -> HTTP route
  -> handler/service
  -> repository/adapter
```

前端保持：

```text
feature UI
  -> feature hooks/projections
  -> service/domain
  -> adapter
```

板子保持：

```text
SmartScriptPack registry
  -> roles
  -> night orders
  -> setup templates
  -> setup rules
  -> acceptance notes
```

AI 保持：

```text
context builder
  -> AI request contract
  -> provider adapter 或 fake adapter
  -> AI response parser
  -> draft only
  -> storyteller confirmation
```

禁止：

- route 直接写文件。
- UI 直接读写 repository。
- UI 按角色 ID 写自动结算 if/else。
- AI 草稿直接写权威状态。
- 多页面各存一份玩家状态。
- 一个组件同时承担开局、夜晚、白天、归档多种主流程。

## 防架构膨胀规则

无人推进中默认禁止新增：

- Express / Koa / Fastify。
- Prisma / Sequelize / SQLite / Postgres。
- OpenAI / Claude SDK。
- 账号系统。
- WebSocket 协作。
- 插件化 Provider 市场。
- 队列系统。
- 微服务拆分。

允许：

- 现有 Vite / React / TypeScript / Vitest 工具链。
- Node 内置能力。
- JSON 文件 repository。
- 本地 fake/mock adapter。
- smoke 脚本。
- 文档和测试。

## BOTC 产品边界

- 说书人是最终权威。
- 官方/实体魔典仍是空间局面主视角。
- 本工具负责记录、提示、草稿、倒计时、投票、复盘。
- AI 只能产生候选、提醒、草稿、润色。
- 所有身份、状态、死亡、处决、昼夜、胜负都必须由说书人确认。
- 新板子必须先规则调研，再智能使用。
- 玩家私密展示只暴露单个座位信息，不把完整局面下发后前端隐藏。

## 阶段验收通用要求

每个阶段至少满足：

1. `npm run check` 通过。
2. 涉及后端 runtime 时，`npm run test:server` 和 `npm run smoke:backend` 通过。
3. 涉及 UI 时，补充相关 E2E 或浏览器 smoke。
4. `dev-docs/HUMAN_CHANGELOG.md` 记录用户可理解变化。
5. `UNATTENDED_TASK_INDEX.md` 更新状态。
6. 汇报未做内容、风险和下一阶段状态。

## 当前可无人推进窗口

当前安全无人推进窗口是阶段 10.1 到 10.9.5：

1. `domain/scripts` 基础。
2. Catfishing 智能板子包草案。
3. Catfishing 规则调研与角色验收。
4. 模板库与随机候选引擎。
5. 7-15 人开局数据流和 UI。
6. 身份交接与重置后引导。
7. AI 合同与 mock adapter。
8. 收口审计和外部审查包。
9. 10.9 provider 实现计划。
10. 10.9.1-10.9.5 安全脚手架、mock provider 路径和收口审计。

到 10.9-live 后必须停下，因为真实网络调用涉及实际 API Key、费用、隐私和失败模式。

