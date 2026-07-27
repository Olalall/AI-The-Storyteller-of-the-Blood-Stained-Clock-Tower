# 盛世奇闻（测试中）智能板子导入验收

- 板子：盛世奇闻（测试中）
- 来源：GStone edition 20254 / game 36685
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20254_23200.json`
- 来源 hash：`sha256:756e333f2ca244ce903e7f4a51e49bc089f8a0bba5c7c4551787f83617f0d4a3`
- 作者：未填写

## 已接入

- 27 个来源角色：13 镇民、4 外来者、4 爪牙、4 恶魔、2 旅行者。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 自定义角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 旅行者河伯、叫花子只保留角色知识和夜序/规则提醒，不进入普通配板模板或恶魔伪装。
- 戏子、梼杌、食梦貘、酿酒师含 setup 或全局规则改动，首批普通模板先排除，后续由说书人手动启用。
- 典狱长延迟死亡、掮客/和尚/半仙目标改向、打更人防死、店小二醉酒、入殓师转恶魔等只给 AI 建议，不自动改状态。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/sheng-shi-qi-wen/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
