# AI 推荐体验 12.17 收口审计

状态：**已完成缺项反馈深化 / 不扩 AI 权限 / 不新增状态源**。

## 完成内容

- 夜间工作台：
  - 点击 `AI推荐` 但目标或角色未选全时，当前卡片会在 `辅助判断` 中显示 `AI缺少`。
  - 缺项文案使用当前技能字段，例如 `缺少玩家、缺少声称角色`，不再只给顶部短提示。
  - 缺项状态不会把结果按钮标成 `AI建议`，避免误读为已经给出可采用结果。
  - 补齐输入后，旧缺项提示会随草稿版本变化自动失效。

## 架构处理

- 复用现有 `aiAdviceLog` 保存 `needs_input` 建议，不新增第二套夜间状态源。
- 页面只展示与当前 `wakeItemId`、`revision`、`draftRevision`、`knowledgeVersion` 匹配的缺项建议。
- 输入变化会触发草稿版本和局面版本变化，旧 AI 缺项建议不再展示。

## 权限边界

- AI 缺项提示只是现场辅助反馈。
- 没有自动选择目标、角色或结果。
- 没有写日志、改身份、改阵营、改死亡、改毒醉或推进夜序。
- 真实 provider 仍只在后端 HTTP 模式且用户点击时触发；本轮没有无人 live 调用。

## 验收证据

已通过：

```powershell
npx vitest run src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose
```

最终验收：

```powershell
npm run check
npx playwright test tests/e2e/night-workbench.spec.ts
```

以上均已通过。截图证据：

```text
<repo>/artifacts/screenshots/ai-recommendation-ux-2026-07-20/03-night-ai-missing-input.png
```

## 风险与后置项

- 当前只是把“缺什么”展示清楚，不代表 AI 理解所有复杂技能。
- 复杂角色仍必须按 `ABILITY_SETTLEMENT_BOUNDARY.md` 先做规则调研和角色级草稿设计。
- 后续如果做更细的角色级 AI 建议，不允许把缺项提示扩成自动技能结算。
