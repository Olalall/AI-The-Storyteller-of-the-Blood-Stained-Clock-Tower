# 胡言乱语 智能板子验收

状态：已导入；整体知识状态 `needs-review`，因为该板含多个自定义角色和高风险身份/状态变化。

## 来源锁定

- 来源：GStone 官方魔典可搜索剧本 JSON。
- URL：https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21266_81492.json
- 作者：刘中奇
- 版本：GStone edition 21266 / game 41728
- SHA256：`sha256:cdbca64798fabca08e25147875ddf9456a3503ed06455dd3a870d8a668104237`
- 复核日期：2026-07-22

## 角色映射

- 来源 26 个角色已全部导入为稳定 roleId。
- 已归一：`high_priestess -> highpriestess`、`village_idiot -> villageidiot`、`poppy_grower -> poppygrower`、`scarlet_woman -> scarletwoman`、`no_dashii -> nodashii`、`fang_gu -> fanggu`、`21266_11189 -> yaggababble`、`21266_11190 -> djinn`。
- `djinn` 仅作为传奇角色知识和提醒，不进入普通模板或恶魔伪装。

## setup 与模板边界

- 村夫、方古、提线木偶、灯神不进入首批普通模板。
- 模板覆盖 7-15 人，合计 22 套，恶魔伪装均为未在场且非旅行者/传奇角色。
- 罂粟种植者、洗脑师、赌徒、牙噶巴卜、诺-达鲺、典狱长等结果只做 AI/夜序建议，不自动修改权威状态。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/hu-yan-luan-yu/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
