# 智能板子与 AI 合同阶段收口审计

## 当前结论

当前完成到 **无人推进阶段 10.8**。

阶段 10.1-10.7 已完成：智能板子 registry、Catfishing pack、规则调研、verified 模板候选、7-15 人开局数据流、身份交接、AI draft-only 合同和 fake adapter。阶段 10.8 已完成外部审查包整理。

下一阶段 10.9 是“真实 AI provider 调用”，当前仍为 **Blocked**，必须等待用户确认 provider、API Key 保存方式、费用、隐私和失败回退策略。

## 阶段完成表

| 阶段 | 状态 | 主要产物 |
|---|---|---|
| 10.1 domain/scripts 基础 | Done | `src/domain/scripts/types.ts`、`src/domain/scripts/registry.ts`、`src/domain/scripts/registry.test.ts` |
| 10.2 Catfishing pack 草案 | Done | `src/domain/scripts/packs/catfishing/` 下 roles / night-orders / setup-templates / setup-rules / acceptance |
| 10.3 Catfishing 规则调研 | Done | 30 个角色技能、官方夜序、高风险交互 notes；来源已核对 |
| 10.4 模板库与随机候选引擎 | Done | `src/domain/setup-templates/composition.ts`、`src/services/setup-candidates/selectSetupCandidates.ts` |
| 10.5 7-15 人开局数据流和 UI | Done | `SetupStartPanel`、`SetupPanel`、`setupRosterMemory`、`createPrototypeSession` |
| 10.6 身份交接与重置后引导 | Done | `IdentityDealSheet`、identity deal service、重置后打开开局流程 |
| 10.7 AI 合同与 fake adapter | Done | `src/services/ai/types.ts`、`contextBuilder.ts`、`fakeAIContractAdapter.ts`、`aiContract.test.ts` |
| 10.8 收口审计与外部审查包 | Done | 本文件、`CLAUDE_SMART_SCRIPT_AI_REVIEW_PROMPT.md` |

## 已满足的边界

- 没有接真实 AI provider。
- 没有读取或保存 API Key。
- 没有新增 OpenAI / Claude SDK。
- 没有上数据库、ORM、账号系统或 WebSocket。
- 没有做玩家端、玩家收件箱或官方魔典同步器。
- AI 返回保持 `draftOnly: true`，不能直接写入身份、状态、死亡、投票、昼夜或日志。
- setup candidate 只从 verified 模板中抽取；未验证模板不会被返回。
- 重置后只复用昵称/经验，不复用旧身份、状态、日志。
- 单人身份展示一次只显示一个座位身份；实体抽牌记录不显示角色。

## 架构观察

### 数据边界

- `GameSessionState` 仍是当前局的权威状态来源。
- setup roster memory 只保存 `{ seatId, nickname, experience }`。
- identity deal receipts 与游戏权威状态分离。
- AI contract request 默认 `contextLevel: 'minimal'`，避免把完整 session、完整日志或敏感配置传入 AI。

### 智能板子边界

- 角色使用稳定英文 ID，中文名只做展示。
- Catfishing / 瓦釜雷鸣保留社区脚本来源和作者标识，来源已核对；仍不代表自动规则结算。
- 7 / 12 / 15 人模板有 verified 模板；8-11、13-14 人仍待补充 verified 模板。
- 高风险角色交互只做提醒和草稿，不做自动结算。

### AI 边界

- `fakeAIContractAdapter` 明确返回 `provider: 'fake'`。
- `draftOnly: true` 是强约束。
- `suggestedJournalEntries` 当前固定为空。
- 真实 provider、API Key、费用、失败回退策略仍属于 10.9 Blocked。

## 文件规模观察

| 文件 | 观察 |
|---|---|
| `src/App.tsx` | 入口保持在项目建议预算内。 |
| `src/features/setup/SetupPanel.tsx` | 曾达到 315 行，属于 P1 观察项；后续继续加开局逻辑前应优先拆分。 |
| `src/features/setup/catfishingPrototypeCandidates.ts` | 接近 300 行，后续多板子不能继续堆在这里。 |
| `src/features/identity-deal/IdentityDealSheet.tsx` | 当前规模可接受。 |
| `src/services/ai/types.ts` | 当前规模可接受。 |
| `src/services/ai/contextBuilder.ts` | 当前规模可接受。 |
| `src/domain/scripts/packs/catfishing/roles.ts` | 角色数据文件较大但属于静态 pack 数据；不要把业务逻辑塞入该文件。 |

## 已运行验证

```powershell
npx vitest run src/domain/setup-templates/composition.test.ts src/services/setup-candidates/selectSetupCandidates.test.ts src/domain/scripts/packs/catfishing/index.test.ts src/features/setup/catfishingPrototypeCandidates.test.ts src/features/setup/setupRosterMemory.test.ts src/features/game-session/state/projectors.test.ts src/App.test.ts src/services/ai/aiService.test.ts
npx playwright test tests/e2e/session-flow.spec.ts
npx vitest run src/features/identity-deal/IdentityDealSheet.test.tsx src/App.test.tsx src/features/game-end/GameEndSheet.test.tsx
npx playwright test tests/e2e/game-end-prototype.spec.ts
npx vitest run src/services/ai/aiContract.test.ts src/services/ai/aiService.test.ts
npm run check
```

最后一次 `npm run check` 已通过：

- oxlint 通过。
- Vitest：36 files / 155 tests passed。
- TypeScript + Vite build 通过。
- `verify:architecture` 通过。
- Vite chunk > 500KB 是既有非阻塞警告。

## 剩余风险

### P1：SetupPanel 拆分

`src/features/setup/SetupPanel.tsx` 是后续最容易膨胀的文件。继续加 AI 解释、候选详情、多板子配置前，应拆出候选浏览、角色座位编辑、人数修正和伪装建议子组件。

### P1：8-11 / 13-14 人模板补齐

当前只有 7 / 12 / 15 人 verified 模板。其他人数可以进入自由开局流程，但不能返回未验证模板作为“智能配板候选”。

### P1：Catfishing 中文规则与沉浸文案

当前角色事实主要来自官方英文技能文本。中文沉浸感文案、技能信息模板和结算提示需要后续按角色逐个确认，不能由 AI 直接改状态。

### P1：真实 AI provider 接入

需要先确认：

- provider / Base URL / model。
- API Key 只放后端环境变量，不能进前端或 localStorage。
- 调用费用和限流。
- 网络失败回退策略。
- 允许传给 AI 的上下文范围。

## 不应继续做的事项

- 不接真实 AI。
- 不保存 API Key 到前端。
- 不新增 SDK 或 ORM。
- 不做 VPS 部署。
- 不做玩家端 / 收件箱。
- 不做官方魔典同步。
- 不做自动技能结算或角色 if 规则引擎。

## 当前停止点

`dev-docs/UNATTENDED_TASK_INDEX.md` 已把 10.9 标为 `Blocked`：真实 AI provider 调用必须等待用户确认。

建议下一步先进行外部审查；审查通过后，再讨论 10.9 的 provider、密钥、费用、隐私和失败回退策略。
