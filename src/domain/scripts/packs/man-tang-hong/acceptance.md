# 满堂红智能板子导入验收

状态：已接入智能板子包，知识状态 `needs-review`，可用于开局候选、夜序辅助和 AI 草稿提醒；所有权威结果仍由说书人确认。

## 来源锁定

- 来源：GStone 官方魔典剧本列表。
- 板子：满堂红。
- 作者：Sui染钟楼。
- 版本：GStone edition 21264 / game 41726。
- JSON：https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21264_94932.json
- SHA256：`02e9b0b0559b4d5e755fd0e324e54c8aa5fa73d2d497b732e6ef75c5baeaa05f`。
- 抓取日期：2026-07-22。

## 角色映射

- tixingguan / 提刑官 / townsfolk
- yanshi / 偃师 / townsfolk
- chongfei / 宠妃 / townsfolk
- flowergirl / 卖花女孩 / townsfolk
- towncrier / 城镇公告员 / townsfolk
- savant / 博学者 / townsfolk
- cannibal / 食人族 / townsfolk
- gossip / 造谣者 / townsfolk
- noble / 贵族 / townsfolk
- slayer / 猎手 / townsfolk
- gambler / 赌徒 / townsfolk
- fisherman / 渔夫 / townsfolk
- chef / 厨师 / townsfolk
- rulianshi / 入殓师 / outsider
- recluse / 陌客 / outsider
- drunk / 酒鬼 / outsider
- mutant / 畸形秀演员 / outsider
- niangjiushi / 酿酒师 / minion
- godfather / 教父 / minion
- pithag / 麻脸巫婆 / minion
- assassin / 刺客 / minion
- panguan / 判官 / minion
- jianning / 奸佞 / demon
- lilmonsta / 小怪宝 / demon
- imp / 小恶魔 / demon
- jiaohuazi / 叫花子 / traveler

## 高风险提醒

- 教父和小怪宝会改变开局构成；首批普通模板先不放入，避免隐藏人数修正。
- 偃师、入殓师、麻脸巫婆、小恶魔会触发身份或阵营变化；只生成草稿，不自动改身份。
- 赌徒、造谣者、猎手、刺客、奸佞、小怪宝都可能导致死亡；只提醒和草稿，不自动标记死亡。
- 判官关键词可结束白天；只提醒，不自动切阶段。
- 酒鬼身份投影必须保护，不能把真实酒鬼身份给玩家端。

## 模板与夜序

- 模板：22 套，覆盖 7-15 人。
- 夜序：按来源 JSON 的 `firstNight` / `otherNight` 排序生成。
- 恶魔伪装：每套 3 个不在场角色，均来自本板角色池，且不包含旅行者。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/man-tang-hong/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
