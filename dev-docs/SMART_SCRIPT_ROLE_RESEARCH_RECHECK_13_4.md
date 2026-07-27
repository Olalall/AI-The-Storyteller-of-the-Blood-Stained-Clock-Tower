# 13.4 已导入智能板子规则复核加固

## 结论

当前已注册的 15 个智能板子全部纳入新的 AI 角色调研质量门。复核重点是：AI 夜间建议拿到的 `roleResearch` 必须可读、来源可追踪，并且高风险技能必须落到对应结构化字段。

## 本轮修正

- 修正 `bad-moon-rising` 里水手、旅店老板、流言者、侍臣、教授、吟游诗人、茶艺师、弄臣、和平主义者、修补匠、月之子、魔鬼代言人、刺客、主谋、普卡、沙巴洛斯、珀的乱码研究字段。
- 修正 `sects-and-violets` 里神谕者、裁缝、哲学家、甜心、冒失鬼、理发师、畸形秀演员、女巫、诺达鲺的乱码研究字段。
- 补齐 `catfishing` 教父的外来者死亡触发、额外杀人和人工确认提醒。
- 补充常见外部 JSON 角色 ID 别名，避免 `snake_charmer`、`pit_hag`、`fortune_teller` 等导入格式导致 AI 取不到角色调研。

## 新质量门

`src/domain/scripts/smartScriptPackQuality.test.ts` 现在额外拦截：

1. `research` 中出现 `????` 乱码占位。
2. 高风险技能只写了空泛字段，没有按风险类型落到对应桶：
   - 死亡 / 复活：`possibleOutcomes`、`stateChanges` 或 `highRiskNotes`。
   - 毒醉：`stateChanges` 或 `highRiskNotes`。
   - 疯狂：`stateChanges`、`playerMessageTemplates` 或 `highRiskNotes`。
   - 身份变化：`identityChanges`、`playerMessageTemplates` 或 `highRiskNotes`。
   - 阵营变化 / 阵营信息：`possibleOutcomes`、`teamChanges`、`playerMessageTemplates` 或 `highRiskNotes`。
   - 胜负：`possibleOutcomes` 或 `highRiskNotes`。

`src/domain/scripts/roleResearchProjection.test.ts` 现在额外验证常见下划线角色 ID 能映射到项目稳定 ID。

## 边界

- 未新增板子。
- 未接玩家端、官方魔典同步或自动规则引擎。
- 未让 AI 自动改身份、阵营、死亡、毒醉或胜负。
- 本轮只治理 AI 可读规则摘要和导入门禁。

## 验证

```powershell
npm run test -- --run src/domain/scripts/smartScriptPackQuality.test.ts src/domain/scripts/roleResearchProjection.test.ts
npm run check
```

结果：通过。
