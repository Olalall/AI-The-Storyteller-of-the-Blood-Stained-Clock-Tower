# 只手遮天 智能板子接入验收

- 来源：GStone edition 20514 / game 38024
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20514_51630.json`
- 来源 hash：`sha256:4238810a6fb68f2daa965e332d1be23dd5f61299b49bd179a6937dd2692e68d2`
- 作者：未填写

## 已接入

- 25 个来源角色：13 镇民、4 外来者、4 爪牙、4 恶魔。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 角色稳定 ID 映射、角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 教父属于人数修正路径，首批普通模板先排除。
- 维齐尔、炸弹人、诺-达鲺、哈迪寂亚、痢蛭、普卡、落难少女、呆瓜、月之子、农夫、哲学家、赌徒、旅店老板、造谣者和水手等只给说书人待确认建议。
- 不自动改身份、阵营、死亡、毒醉、能力失效、登记或胜负。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/zhi-shou-zhe-tian/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
