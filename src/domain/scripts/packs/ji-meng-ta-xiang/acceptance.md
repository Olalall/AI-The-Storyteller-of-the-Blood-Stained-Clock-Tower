# 寄梦他乡智能板子导入验收

状态：已接入智能板子包，知识状态 `needs-review`，可用于开局候选、夜序辅助和 AI 草稿提醒；所有权威结果仍由说书人确认。

## 来源锁定

- 来源：GStone 官方魔典剧本列表。
- 板子：寄梦他乡。
- 作者：鸭木布拉夫钟楼小镇。
- 版本：GStone edition 21263 / game 41725。
- JSON：https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21263_10294.json
- SHA256：`417d353edf620992fb3822f81bf7e12fd1a722a91ee21cd230a9f04f3d9b4fd7`。
- 抓取日期：2026-07-22。

## 角色映射

- qintianjian / 钦天监 / townsfolk
- dianxiaoer / 店小二 / townsfolk
- yinyangshi / 阴阳师 / townsfolk
- villageidiot / 村夫 / townsfolk
- empath / 共情者 / townsfolk
- dreamer / 筑梦师 / townsfolk
- yinluren / 引路人 / townsfolk
- exorcist / 驱魔人 / townsfolk
- undertaker / 送葬者 / townsfolk
- gossip / 造谣者 / townsfolk
- geling / 歌伶 / townsfolk
- banxian / 半仙 / townsfolk
- chongfei / 宠妃 / townsfolk
- nichen / 逆臣 / outsider
- acrobat / 杂技演员 / outsider
- plaguedoctor / 瘟疫医生 / outsider
- barber / 理发师 / outsider
- gudiao / 蛊雕 / minion
- assassin / 刺客 / minion
- cerenovus / 洗脑师 / minion
- ganshiren / 赶尸人 / minion
- jianning / 奸佞 / demon
- hundun / 混沌 / demon
- dianyuzhang / 典狱长 / demon
- djinn / 灯神 / fabled
- kazali / 卡扎力 / demon

## 高风险提醒

- 村夫、赶尸人和卡扎力会改变开局构成；首批普通模板先不放入。
- 逆臣、理发师、卡扎力、小恶魔类路径会改变阵营或身份；只生成草稿，不自动修改。
- 造谣者、歌伶、杂技演员、刺客、奸佞、混沌、典狱长会造成死亡；只提醒和记录，不自动标死。
- 洗脑师涉及疯狂和可能处决；蛊雕、混沌、店小二涉及毒醉；状态都必须由说书人确认。
- 灯神只作为公开相克规则提醒，不进入普通模板。

## 模板与夜序

- 模板：22 套，覆盖 7-15 人。
- 夜序：按来源 JSON 的 `firstNight` / `otherNight` 排序生成。
- 恶魔伪装：每套 3 个不在场角色，均来自本板角色池，且不包含旅行者/传奇角色。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/ji-meng-ta-xiang/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
