# AI 推荐体验 12.16 收口审计

状态：**已完成第一轮体验优化 / 不扩 AI 权限 / 不导入新板子**。

## 完成内容

- 配板候选页：
  - `AI推荐` 后显示首选组合、第一条推荐理由和第一条风险提醒。
  - 候选卡显示 `AI首选` / `AI第N` 排序标记。
  - 已推荐后按钮变为 `重新推荐`。
  - 组合详情页标题从 `AI建议` 改为 `组合详情`，避免误导。
- 夜间工作台：
  - 新增 `SettlementAssistPanel`。
  - 把赌徒等本地核对建议、AI依据、AI原建议统一放到 `辅助判断` 区。
  - 保留 `确认本项后写入` 提醒，AI 不直接写状态或日志。

## 权限边界

- AI 配板仍只排序已核对候选，不生成新角色组合。
- AI 推荐不会调用 `onUseCandidate`，不会采用配板草稿。
- 夜间 AI 仍只能选择当前 `WakeItem.outcomeOptions` 中已有且 ready 的结果。
- 夜间 AI 只填本项草稿；不写日志、不改死亡/身份/阵营/毒醉、不推进夜序。
- 本轮没有真实无人 live 调用；真实 provider 仍只在后端 HTTP 模式且用户点击时触发。

## 验收证据

已通过：

```powershell
npx vitest run src/features/setup/SetupCandidateBrowser.test.tsx src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose
```

最终验收：

```powershell
npm run check
npx playwright test tests/e2e/night-workbench.spec.ts tests/e2e/manual-click-smoke.spec.ts
```

## 风险与后置项

- 真实 AI 返回内容质量仍取决于后端 provider 和上下文；UI 只负责让草稿更清晰。
- 复杂角色结算仍不能靠按钮自动完成；后续若新增角色级草稿，必须先完成规则调研和智能板子验收。
- 第二批板子导入仍需单独选择，不与本轮混在一起。

