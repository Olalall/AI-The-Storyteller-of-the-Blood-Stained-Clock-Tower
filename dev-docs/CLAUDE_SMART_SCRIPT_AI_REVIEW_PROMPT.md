# Claude 审查提示词：智能板子与 AI 合同收口

请审查本仓库“钟楼说书人副驾驶”的阶段 10.1-10.8 交付结果。你的任务是审查，不是实现。请按本文末尾的输出格式给出结论。

## 审查目标

判断当前智能板子、多人数开局、身份交接、AI 合同和 fake adapter 是否已经在既定边界内收口，并判断是否可以进入 10.9：真实 AI provider 调用设计/实现前置阶段。

### 已允许完成的范围

- `domain/scripts` 智能板子包类型、registry 和测试。
- Catfishing / 瓦釜雷鸣 pack 草案。
- 7-15 人开局数据流和 UI。
- verified 模板库和随机候选引擎。
- 昵称/经验复用，但不复用旧身份、状态、日志。
- 单人身份展示与实体抽牌记录。
- AI 请求/响应合同、`contextLevel`、fake adapter 和 draft-only 边界。
- 阶段 10.8 收口审计。

### 明确不允许完成的范围

- 调用真实 AI provider。
- 在前端、localStorage 或导出归档中保存 API Key。
- 新增 OpenAI / Claude SDK。
- VPS 正式部署。
- 上数据库、ORM、账号系统或 WebSocket。
- 玩家端 / 玩家收件箱。
- 官方魔典同步器。
- 自动执行技能、自动改身份、自动改状态、自动判定死亡或胜负。
- 为每个角色写专属 if 分支形成规则引擎。

## 必读文件

### 项目边界与计划

- `AGENTS.md`
- `dev-docs/UNATTENDED_TASK_INDEX.md`
- `dev-docs/UNATTENDED_EXECUTION_GUARDRAILS.md`
- `dev-docs/UNATTENDED_SMART_SCRIPT_AI_PROJECT.md`
- `dev-docs/UNATTENDED_SMART_SCRIPT_AI_RUNBOOK.md`
- `dev-docs/SMART_SCRIPT_AI_CLOSURE_AUDIT.md`
- `dev-docs/API_CONTRACT.md`
- `dev-docs/SCRIPT_ARCHITECTURE_PLAN.md`
- `dev-docs/RULE_RESEARCH_PROTOCOL.md`
- `dev-docs/ABILITY_SETTLEMENT_BOUNDARY.md`
- `dev-docs/AI_INTEGRATION_PLAN.md`

### 智能板子与模板

- `src/domain/scripts/types.ts`
- `src/domain/scripts/registry.ts`
- `src/domain/scripts/packs/catfishing/index.ts`
- `src/domain/scripts/packs/catfishing/roles.ts`
- `src/domain/scripts/packs/catfishing/night-orders.ts`
- `src/domain/scripts/packs/catfishing/setup-templates.ts`
- `src/domain/scripts/packs/catfishing/setup-rules.ts`
- `src/domain/scripts/packs/catfishing/acceptance.md`
- `src/domain/setup-templates/composition.ts`
- `src/services/setup-candidates/selectSetupCandidates.ts`

### UI / 状态流

- `src/features/setup/SetupPanel.tsx`
- `src/features/setup/SetupStartPanel.tsx`
- `src/features/setup/setupRosterMemory.ts`
- `src/features/game-session/data/createPrototypeSession.ts`
- `src/features/game-session/state/sessionActions.ts`
- `src/features/game-session/state/sessionReducer.ts`
- `src/features/identity-deal/IdentityDealSheet.tsx`
- `src/App.tsx`

### AI 合同

- `src/services/ai/types.ts`
- `src/services/ai/contextBuilder.ts`
- `src/services/ai/fakeAIContractAdapter.ts`
- `src/services/ai/aiContract.test.ts`

## 已运行过的验证命令

```powershell
npx vitest run src/domain/setup-templates/composition.test.ts src/services/setup-candidates/selectSetupCandidates.test.ts src/domain/scripts/packs/catfishing/index.test.ts src/features/setup/catfishingPrototypeCandidates.test.ts src/features/setup/setupRosterMemory.test.ts src/features/game-session/state/projectors.test.ts src/App.test.ts src/services/ai/aiService.test.ts
npx playwright test tests/e2e/session-flow.spec.ts
npx vitest run src/features/identity-deal/IdentityDealSheet.test.tsx src/App.test.tsx src/features/game-end/GameEndSheet.test.tsx
npx playwright test tests/e2e/game-end-prototype.spec.ts
npx vitest run src/services/ai/aiContract.test.ts src/services/ai/aiService.test.ts
npm run check
```

最后一次 `npm run check` 已通过：Vitest 36 files / 155 tests passed，build 通过，architecture verification 通过。Vite chunk > 500KB 是既有非阻塞警告。

## 请重点审查

1. 是否仍然遵守“说书人最终权威，AI 只给草稿”的边界。
2. 是否存在真实 AI、API Key、SDK、VPS、数据库、WebSocket 等越界实现。
3. 智能板子 pack 是否以稳定 role id 为主键，而不是中文名。
4. Catfishing pack 是否清楚标注社区脚本来源和 needs-review / verified 边界。
5. 7-15 人开局是否只复用昵称/经验，不复用旧身份、状态、日志。
6. setup candidate 是否只从 verified 模板库抽取，不让 AI 自由编阵容。
7. 身份交接是否只显示单个座位身份，实体抽牌是否不暴露角色。
8. AI context builder 是否默认 minimal，是否避免传完整 GameSession、完整日志和敏感配置。
9. fake adapter 是否明确 provider: fake、draftOnly: true，且不能直接写入权威状态。
10. 是否出现巨型组件、重复状态源、万能 store 或角色 ID if 规则引擎苗头。
11. 测试是否覆盖关键边界，是否有明显缺口。
12. 阶段 10.9 是否应继续 Blocked，直到 provider、费用、API Key 保存方式、隐私和失败回退策略确认。

## 输出格式

请按以下结构输出：

1. 总体评级：绿 / 黄 / 红
2. 一句话结论
3. 是否可以进入 10.9：真实 AI provider 前置设计
4. 阻塞问题
5. 非阻塞改进
6. 架构风险
7. 测试缺口
8. 文档不一致
9. 需要用户确认的问题
10. 下一步建议
11. 最终结论

如果发现越界，请给出具体文件路径、函数/组件名和原因。不要只写泛泛建议。
