# Claude 后端 P0 复审提示词

把下面内容发给 Claude。目标是复审当前仓库的后端 P0 是否可以进入实现阶段，不要审旧项目。

```text
你是一个严苛的产品 + 架构 + 后端工程审查模型。

请先确认审查对象。如果以下任一条件不满足，请立即停止并报告你实际读取的路径：

- 当前仓库路径：<repo>
- package.json 的 name 是 botc-storyteller-companion
- 技术栈是 React + TypeScript + Vite
- 存在 src/features、src/services、dev-docs、tests、vite.config.ts
- 根目录不存在 server.js
- 存在 dev-docs/BACKEND_P0_FINAL.md

不要审查旧项目。若你看到 server.js、CURRENT_PROJECT_COMPLETION_STATUS.md、V2.5、V3、modules/archive、verify:current-project-completion，说明你审查错了仓库。

当前项目定位：

这是线下《血染钟楼》说书人的本地辅助工具，不是第二套官方魔典，不是线上游戏平台，不是自动规则引擎。

核心边界：

- 说书人是最终权威。
- AI 只能生成候选、建议、追问、复盘草稿。
- AI 不能直接改身份、状态、死亡、处决、胜负、昼夜。
- 投票完成不能自动杀人。
- 夜晚完成不能自动进入白天。
- 结束对局必须先保存归档，再允许重置。
- 当前不做官方魔典同步。
- 当前不做玩家常驻端或玩家收件箱。
- 当前不接真实 AI API。
- 当前不部署 VPS。
- 当前不保存真实 API Key。

请重点读取：

1. package.json
2. AGENTS.md
3. dev-docs/BACKEND_P0_FINAL.md
4. dev-docs/API_CONTRACT.md
5. dev-docs/frontend-backend-contract.md
6. dev-docs/BACKEND_IMPLEMENTATION_PLAN.md
7. dev-docs/UNATTENDED_BACKEND_IMPLEMENTATION_PLAN.md
8. src/services/archive/
9. src/services/ai/
10. src/App.test.tsx
11. src/services/archive/archiveService.test.ts
12. src/features/game-end/GameEndSheet.test.tsx

当前已处理你上轮审查指出的问题：

- resetAfterArchive 已统一为“门卫模式”：后端只校验归档，不返回 newSession。
- API_CONTRACT.md 已删除 resetAfterArchive 的 newSession 返回。
- frontend-backend-contract.md 已同步门卫模式。
- BACKEND_P0_FINAL.md 已冻结 P0 范围。
- P0 存储方案已收敛为 JSON 文件。
- generateSetupCandidates 已明确不纳入 P0 后端。
- P0 不做真实 AI Provider 抽象，只做 fake review draft。
- GameArchiveRecord 已增加 schemaVersion: 1。
- local archive adapter 支持旧归档缺少 schemaVersion 时自动补 1。
- 新增 App 级测试：保存本局并确认重置后，当前 session 回到初始局，历史归档仍保留。
- src/ 下已搜索并清理用户可见的 ???? 乱码文案。

当前验证结果：

- npm run check 通过。
- Vitest：24 个测试文件，102 个测试通过。
- build 通过。
- verify:architecture 通过。
- npm run test:e2e -- --workers=1 通过。
- Playwright：28 个浏览器流程通过。

请审查的问题：

1. 后端 P0 是否已经可以进入实现阶段？
2. BACKEND_P0_FINAL.md 是否足够冻结范围？
3. resetAfterArchive 门卫模式是否已经在文档和代码中统一？
4. JSON 文件作为 P0 存储是否仍有明显问题？
5. P0 排除 generateSetupCandidates 后端化是否合理？
6. P0 排除真实 AI Provider 抽象是否合理？
7. 是否还有阻塞后端实现的前端测试缺口？
8. 是否还有第二状态源、第二日志、第二夜序、规则引擎化风险？
9. server/ 后端目录结构是否应该进一步收窄？
10. 下一步如果开始实现，第一步应该做什么？

请按以下格式输出：

## 总体评级
绿 / 黄 / 红

## 一句话结论

## 是否可以开始后端 P0 实现

## 仍然阻塞实现的事项

## 允许立即做的事项

## 不应该做的事项

## resetAfterArchive 复审

## JSON 存储复审

## AI 边界复审

## 测试缺口

## 架构风险

## 具体修改建议
按 P0 / P1 / P2 分级。

请直接指出问题，不要泛泛表扬。
```

