# 外部审查回应 2026-07-17

## 结论

外部模型这轮审查提出的“防屎山、防规则引擎、防第二状态源”方向是有价值的，但它的核心事实判断错了。

它审查的对象明显不是当前新项目仓库，而是旧项目或旧项目残留目录。

当前工作目录是：

`<repo>`

当前仓库确实是 React + TypeScript + Vite 前端原型，不是它描述的 Node.js + Express + WebSocket + 多 HTML 静态前端 + 自动规则引擎项目。

## 已核对事实

在当前目录中已确认：

- 存在 `package.json`。
- `package.json` 的包名是 `botc-storyteller-companion`。
- `package.json` 的脚本包含：
  - `dev: vite`
  - `build: tsc -b && vite build`
  - `test: vitest run`
  - `test:e2e: playwright test`
  - `verify:architecture: node scripts/verify-architecture.mjs`
  - `check: npm run lint && npm run test && npm run build && npm run verify:architecture`
- 存在：
  - `src/`
  - `src/app/`
  - `src/components/`
  - `src/features/`
  - `src/services/`
  - `tests/`
  - `playwright.config.ts`
  - `vite.config.ts`
- 不存在：
  - `server.js`
  - `public/storyteller-v2.html`
  - `modules/mvp/AutonomousGameRunner.js`
  - `blood-game/`

因此，外部审查中的 P0-1、P0-2、P0-3、P0-5、P0-6、P0-7 不能作为当前仓库事实采纳。

## 可以采纳的部分

虽然它审错了仓库，但以下方向仍然应该保留：

1. 开发前必须确认仓库路径，防止把旧项目当成新项目审查。
2. 旧项目里的自动规则引擎、自动游戏运行器、玩家常驻端、VPS 部署脚本，只能作为反例和风险来源。
3. 当前新项目必须继续坚持：
   - 说书人是唯一权威。
   - AI 只能生成建议、草稿和候选。
   - 不做自动规则引擎。
   - 不做自动昼夜跳转。
   - 不做自动死亡、处决、胜负判定。
   - 不让 UI 组件直接读写存储、拼 HTTP、调用 AI SDK。
   - 不制造第二套 GameSession、玩家状态、夜序、日志。
4. 外部审查交接包应该增加“适用仓库与审查边界”，明确它只适用于当前 React/Vite 新项目。

## 不能采纳的部分

以下判断不适用于当前新项目：

1. “仓库实际是 Node.js + Express + WebSocket 后端”。
2. “没有 src/ 目录”。
3. “没有 React/Vite/Vitest/Playwright 配置”。
4. “当前仓库存在 server.js、public/storyteller-v2.html、modules/mvp/AutonomousGameRunner.js”。
5. “当前交接包描述的服务层在仓库中找不到”。

这些结论与当前目录核对结果冲突。

## 对交接包的修正

已在 `dev-docs/EXTERNAL_MODEL_REVIEW_PACKET.md` 增加 `0.0 适用仓库与审查边界`，要求外部模型先确认：

1. 审查路径是不是当前新项目。
2. 是否看到 React/Vite 的 `package.json`。
3. 是否看到 `src/features/` 和 `src/services/`。
4. 如果认为不是 React/Vite，必须列出它实际读取的绝对路径和文件名。

## 下一轮给外部模型的建议提示词

请先确认你审查的是以下仓库：

`<repo>`

请先读取并报告：

1. `package.json` 的 `name` 和 `scripts`。
2. 是否存在 `src/features/`。
3. 是否存在 `src/services/`。
4. 是否存在 `server.js`、`public/storyteller-v2.html`、`modules/mvp/AutonomousGameRunner.js`。

如果你读取到的是旧项目、其他目录或历史包袱，请停止审查，并说明你实际读取的路径。

在确认路径正确后，再审查：

1. 当前 React/Vite 原型的 UI 功能边界是否清楚。
2. 当前 service/adapter 边界是否足以承接后端。
3. 是否仍有第二状态源风险。
4. 是否有角色 ID 自动规则引擎倾向。
5. 后续后端实现计划是否会导致架构膨胀。

## 对当前开发计划的影响

当前不需要因为这轮外部审查而停止新项目开发。

但需要新增一条开发前置规则：

> 每次让外部模型审查时，必须先让它确认仓库路径、技术栈和关键文件存在性；如果路径或技术栈不一致，审查结果只能作为“旧项目风险参考”，不能作为当前新项目事实。

