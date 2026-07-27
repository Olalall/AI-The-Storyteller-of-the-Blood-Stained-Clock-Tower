# 12.25 复杂角色结构化摘要接入收口审计

## 结论

通过。Wave A-D 已调研的 40 个复杂角色，已经从纯文档记录提炼为共享结构化摘要，并接入配板 AI 和夜间结算 AI 的最小上下文。

## 本轮完成

- 新增 `src/domain/role-knowledge/complexRoleKnowledge.ts`：
  - 统一保存 40 个复杂角色的风险标签、需要核对的信息、结算提醒、AI 可做/不可做边界。
  - 提供 `roleKnowledgeForAI()`，只投影短摘要，不把完整调研文档塞进 AI 请求。
  - 兼容旧项目常见角色 ID 别名，例如 `snake_charmer` → `snakecharmer`。
- 夜间 AI：
  - `buildNightSettlementRequest()`、HTTP adapter、后端 provider 都带上当前角色的 `roleKnowledge`。
  - fallback 也会把复杂角色提醒写进 `ruleFacts`。
- 配板 AI：
  - 每个候选的角色座位 brief 带上对应 `roleKnowledge`。
  - 后端提示词明确：结构化摘要只能作为风险提醒，不能自动改身份或状态。
  - 本地回退也会把高风险角色提醒放进 warnings。

## 明确没做

- 没有新增自动技能结算。
- 没有按角色 ID 写页面级特殊 if/else。
- 没有让 AI 自动改身份、阵营、死亡、中毒、醉酒或胜负。
- 没有把完整规则文档塞进每次请求。

## 验收

- `npx vitest run src/domain/role-knowledge/complexRoleKnowledge.test.ts src/services/ai/aiContract.test.ts src/services/ai/nightSettlementHttp.test.ts src/services/ai/setupAdviceHttp.test.ts server/ai/nightSettlementProvider.test.ts server/ai/setupAdviceProvider.test.ts --reporter=verbose`
- `npm run check`

## 风险

- 当前是短摘要，不等于完整规则库；新增板子或新增复杂角色仍要先走 `RULE_RESEARCH_PROTOCOL.md`。
- 本轮只把摘要接进 AI 上下文，UI 仍保持原来的按钮与工作流，不额外展示完整调研记录。
- 结构化摘要质量依赖前置 `role-research/` 记录，后续发现错译或漏规则时，应先修调研记录，再同步摘要。

