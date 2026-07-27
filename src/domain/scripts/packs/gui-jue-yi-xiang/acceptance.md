# 诡谲异象（测试中）智能板子导入验收

- 板子：诡谲异象（测试中）
- 来源：GStone edition 20255 / game 36686
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20255_23199.json`
- 来源 hash：`sha256:b999d9d8d9a375152a41286362c7496ed3b0d68fd1e09230fd18c048cc7ad2e3`
- 作者：未填写

## 已接入

- 27 个来源角色：13 镇民、4 外来者、4 爪牙、4 恶魔、2 旅行者。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 自定义角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 旅行者河伯、叫花子只保留角色知识和规则提醒，不进入普通配板模板或恶魔伪装。
- 混沌、饕餮、酿酒师含 setup 改动，首批普通模板先排除，后续由说书人手动启用。
- 逆臣阵营变化、蛊雕中毒/登记、悟道者假身份/变身、典狱长延迟死亡、道士/锦衣卫死亡替代等只给说书人待确认建议。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/gui-jue-yi-xiang/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
