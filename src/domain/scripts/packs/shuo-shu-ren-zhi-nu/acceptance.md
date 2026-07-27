# 说书人之怒智能板子导入验收

- 板子：说书人之怒
- 来源：GStone edition 20287 / game 36809
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20287_77439.json`
- 来源 hash：`sha256:6e26d3024bfd22e2268aa4713d718057a85ef4612956c4a5694c9a838939b0ca`
- 作者：未填写

## 已接入

- 25 个来源角色：13 镇民、4 外来者、4 爪牙、4 恶魔。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 角色稳定 ID 映射、角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 军团、小怪宝、赏金猎人、无神论者属于特殊 setup/破规则路径，首批普通模板先排除。
- 涡流假信息和无人处决邪恶胜利、僵怖死而存活登记、舞蛇人换身份阵营、哲学家醉酒、麻脸巫婆改身份、洗脑师疯狂等只给说书人待确认建议。
- 不自动改身份、阵营、死亡、毒醉、能力失效、登记或胜负。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/shuo-shu-ren-zhi-nu/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
