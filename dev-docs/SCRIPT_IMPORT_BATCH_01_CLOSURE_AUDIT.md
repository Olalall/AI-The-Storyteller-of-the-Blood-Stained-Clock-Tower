# 第一批 10 板收口审计

日期：2026-07-20。  
状态：**通过 / 12.15 已完成**。

## 1. 审计范围

本次只验收第一批 10 个智能板子包：

1. `trouble-brewing`
2. `bad-moon-rising`
3. `sects-and-violets`
4. `one-in-one-out`
5. `a-grimm-chorus`
6. `hide-and-seek`
7. `lunar-eclipse`
8. `punchy`
9. `quick-maths`
10. `devout-theists`

Catfishing / 瓦釜雷鸣是既有默认板子，不计入本批 10 个名额，但保留在同一个 registry 中。

## 2. 通过项

- 10 个第一批板子均已注册到统一 `SmartScriptPack` registry。
- Catfishing 未被替换；当前 registry 为 Catfishing + 第一批 10 板。
- 每个第一批板子都声明支持 7-15 人。
- 每个第一批板子都有独立 pack 目录、角色事实、夜序、setup 规则、模板和验收文档。
- 社区/TPI/Carousel 脚本仍保持 `needs-review`，没有伪装成官方 confirmed。
- 7-15 人候选生成已统一通过合法性检查：座位、角色、人数修正、恶魔伪装均不阻断。
- 浏览器可见流程已覆盖 10 个板子从“选择板子 -> 12 人 -> 开始配板 -> 3 套候选”的实际点击路径。

## 3. 本轮发现并修正的问题

### 3.1 A Grimm Chorus 召唤师模板伪装错误

问题：召唤师模板曾把恶魔角色放进 `bluffs`，触发“恶魔伪装可用”校验失败。

处理：改为未在场镇民伪装：

- `summoner-short`：`exorcist`、`amnesiac`、`slayer`
- `summoner-mid`：`general`、`slayer`、`fisherman`
- `thirteen-summoner`：`villageidiot`、`exorcist`、`nightwatchman`
- `fifteen-summoner`：`innkeeper`、`slayer`、`minstrel`

### 3.2 可选人数修正被误当成默认修正

问题：`setupRuleEvaluator` 在没有模板显式选择修正时，会默认使用同角色的第一个可选修正，导致例如 Punchy 的气球驾驶员在未选择增加外来者时也被算成增加外来者。

处理：未显式选择的可选修正现在按“不修正人数”处理；只有模板明确带 `setupAdjustments` 时才改变目标阵营人数。

边界：这只影响开局人数合法性校验，不会自动换角色、改身份、改状态或执行任何技能结算。

## 4. 仍然不做

- 不做官方魔典同步器。
- 不做常驻玩家端/收件箱。
- 不做自动技能结算或自动判胜。
- 不把真实 AI 调用作为无人验收的一部分。
- 不上数据库/ORM。

## 5. 验收证据

```powershell
npx vitest run src/features/setup/smartScriptSetupCandidates.test.ts --reporter=verbose
npx vitest run src/domain/scripts/batch01Acceptance.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/features/setup/smartScriptSetupCandidates.test.ts
npx playwright test tests/e2e/batch01-script-setup.spec.ts
```

结果：

- `src/features/setup/smartScriptSetupCandidates.test.ts`：101 个测试通过。
- 4 个核心单元测试文件：120 个测试通过。
- 浏览器 E2E：1 个测试通过，覆盖第一批 10 板的可见开局路径。
- `npm run check`：通过，60 个测试文件、381 个测试通过，架构边界通过。

## 6. 收口结论

第一批 10 个智能板子已经达到“可用智能板子”的最低门槛：能选择、能按 7-15 人生成候选、能进入统一配板和夜序事实源，且不会绕过说书人确认。

下一步不应继续在第一批里堆功能。若继续扩展，建议二选一：

1. 进入第二批板子导入。
2. 深化已接 AI 推荐的体验与错误提示。
