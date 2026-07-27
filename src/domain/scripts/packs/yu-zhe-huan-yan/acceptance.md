# 愚者欢宴 智能板子接入验收

- 来源：GStone edition 20438 / game 37700
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20438_58690.json`
- 来源 hash：`sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06`
- 作者：未填写

## 已接入

- 25 个来源角色：13 镇民、5 外来者、4 爪牙、3 恶魔。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 角色稳定 ID 映射、角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 亡骨魔、男爵、赏金猎人、气球驾驶员属于人数/阵营修正路径，首批普通模板先排除。
- 街头风琴手投票、涡流假信息和无人处决邪恶胜利、小恶魔传位、恐惧之灵/哥布林/圣徒/异端分子胜负、理发师/舞蛇人换身份阵营、贞洁者/魔像死亡等只给说书人待确认建议。
- 不自动改身份、阵营、死亡、毒醉、能力失效、登记或胜负。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/yu-zhe-huan-yan/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
