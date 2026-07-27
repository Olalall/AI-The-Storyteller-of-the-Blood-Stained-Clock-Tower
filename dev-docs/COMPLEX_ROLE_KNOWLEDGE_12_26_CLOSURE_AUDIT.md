# 12.26 剩余高风险角色结构化摘要补强收口审计

## 结论

通过。已在上一轮 40 个复杂角色基础上，继续补入当前 10 个已导入智能板子中仍常见、且容易影响身份、阵营、死亡、毒醉、疯狂、setup 或胜负的 31 个角色。

## 本轮新增角色

- 恶魔与恶魔更替/击杀：`kazali`、`lleech`、`legion`、`summoner`、`ojo`、`yaggababble`、`riot`、`pukka`
- 爪牙与阵营/胜负/疯狂：`marionette`、`mezepheles`、`goblin`、`godfather`、`widow`、`xaan`、`devilsadvocate`、`harpy`、`psychopath`、`vizier`、`poisoner`、`spy`
- 外来者与登记/毒醉/身份：`lunatic`、`puzzlemaster`、`drunk`、`recluse`、`goon`、`barber`、`golem`、`politician`、`klutz`
- 镇民信息/伪装链路：`magician`、`virgin`

当前 `complexRoleKnowledge` 总数：71 个。

## 本轮完成

- 为 31 个角色补充 `dev-docs/role-research/<roleId>.md` 简版调研记录。
- 更新 `src/domain/role-knowledge/complexRoleKnowledge.ts`：
  - 增加 `victory` 风险标签。
  - 补入 31 个角色的短摘要、必填上下文、AI 可做和 AI 不能做。
- 更新测试：
  - 确认结构化摘要总量为 71。
  - 确认卡扎力、哥布林等新增高风险角色能被索引读取。

## 明确没做

- 没有新增自动技能结算。
- 没有写页面级角色 ID 特殊逻辑。
- 没有自动处理恶魔更替、胜负、处决、死亡、毒醉或阵营变化。
- 没有把这些角色强行做成完整规则引擎。

## 验收

- `npx vitest run src/domain/role-knowledge/complexRoleKnowledge.test.ts src/services/ai/aiContract.test.ts src/services/ai/nightSettlementHttp.test.ts src/services/ai/setupAdviceHttp.test.ts server/ai/nightSettlementProvider.test.ts server/ai/setupAdviceProvider.test.ts --reporter=verbose`
- `npm run check`

## 风险

- 本轮新增的是“短摘要 + 风险提醒”，不是完整逐字规则翻译。
- 新增角色的简版调研记录来源于当前已导入智能板子包中的角色元数据，并保留官方 Wiki 复核入口；后续若发现细节冲突，应先修 `role-research/`，再同步结构化摘要。
- 仍有一些低风险或简单信息角色未进入复杂摘要；这些角色不影响当前 AI 草稿安全边界。

