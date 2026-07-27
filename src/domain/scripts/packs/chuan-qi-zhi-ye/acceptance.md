# 传奇之夜智能板子导入验收

- 板子：传奇之夜
- 来源：GStone edition 20771 / game 39467
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20771_78762.json`
- 来源 hash：`sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d`
- 作者：Sui

## 已接入

- 25 个角色。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 赏金猎人会把一名镇民转为邪恶，亡骨魔会减少 1 名外来者，首批普通模板先不放入。
- 麻脸巫婆改身份、红唇女郎传魔、农夫传承、普卡毒杀、诺-达鲺邻近中毒、珀蓄力三杀、圣徒/呆瓜胜负等只给说书人待确认建议。
- 不自动改身份、阵营、死亡、毒醉或胜负。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/chuan-qi-zhi-ye/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
