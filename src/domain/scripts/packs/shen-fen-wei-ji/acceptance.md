# 身份危机智能板子导入验收

- 板子：身份危机
- 来源：GStone edition 20285 / game 36806
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20285_77381.json`
- 来源 hash：`sha256:627eeec710a42b9e23055b40a99f6759e7eb3647e607fb77cc76239ea9382a95`
- 作者：未填写

## 已接入

- 25 个来源角色：13 镇民、4 外来者、4 爪牙、4 恶魔。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 官方/社区角色稳定 ID 映射、角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 方古、小怪宝、赏金猎人、气球驾驶员含人数或隐藏阵营 setup 路径，首批普通模板先排除。
- 舞蛇人换身份阵营、痢蛭宿主中毒、麻脸巫婆改身份、洗脑师疯狂、理发师交换、提线木偶假身份、疯子假恶魔、炼金术士/失忆者能力等只给说书人待确认建议。
- 不自动改身份、阵营、死亡、毒醉、能力失效或胜负。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/shen-fen-wei-ji/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
