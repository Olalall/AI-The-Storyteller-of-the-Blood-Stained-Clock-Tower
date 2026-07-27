# AI 推荐体验 12.19 收口审计

状态：**已完成追问与补齐提示 / 不扩 AI 权限 / 不新增状态源**。

## 完成内容

- 夜间工作台：
  - 点击 `AI推荐` 但本项缺少目标、角色或其他上下文时，`辅助判断` 不再只显示一行缺项。
  - `AI缺少` 下方会列出“缺什么”和“到哪里补”。
  - 例如：
    - `玩家` → `在上方目标区点玩家号码。`
    - `声称角色` → `在角色区选择本次声明或猜测。`
  - 同一缺项上下文下，按钮从 `AI推荐` 变为 `重新推荐`。
  - 补齐输入后，旧缺项提示仍按 12.17 机制自动失效。

## 架构处理

- 继续复用现有 `aiAdviceLog`，没有新增第二套 AI 缺项状态。
- 缺项补齐提示只在 `SettlementAssistPanel` 做展示映射，不进入规则引擎。
- 没有新增角色 ID 自动结算分支。
- 没有修改夜序、玩家状态、日志写入或确认推进逻辑。

## 权限边界

- AI 仍只给候选、草稿和补齐提示。
- AI 不自动选择目标、角色或结果。
- AI 不写日志、不改身份/阵营/死亡/毒醉、不推进夜序。
- 说书人仍必须点击 `确认本项` 才会写入权威记录。

## 验收证据

已通过：

```powershell
npx vitest run src/features/night-workbench/components/SettlementAssistPanel.test.tsx src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose
```

真实浏览器验收：

```powershell
npx playwright test tests/e2e/night-workbench.spec.ts --reporter=line
```

最终验收：

```powershell
npm run check
```

截图证据：

```text
<repo>/artifacts/screenshots/ai-recommendation-ux-2026-07-20/04-night-ai-missing-guidance.png
```

## 风险与后置项

- 当前是通用缺项补齐提示，不代表 AI 已能理解所有复杂角色。
- 如果后续要让不同角色出现更精确追问，需要先走角色规则调研协议。
- 仍不建议在这个阶段导入自动技能结算状态机。
