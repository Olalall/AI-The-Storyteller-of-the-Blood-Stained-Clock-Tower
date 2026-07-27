# 移花接木 智能板子验收

状态：已导入；整体知识状态 `needs-review`，因为该板含多个自定义角色、目标重定向、毒醉、阵营变化和延迟死亡路径。

## 来源锁定

- 来源：GStone 官方魔典可搜索剧本 JSON。
- URL：https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21265_94933.json
- 作者：刘中奇
- 版本：GStone edition 21265 / game 41727
- SHA256：`sha256:9bbb3391e47daa2d60383a66c2bb2a1e3db97110131f1ee05e8c94285d88b3b4`
- 复核日期：2026-07-22

## 角色映射

- 来源 26 个角色已全部导入为稳定 roleId。
- 已归一：`fortune_teller -> fortuneteller`、`21265_11186 -> villageidiot`、`21265_11187 -> harpy`。
- `djinn` 仅作为传奇角色知识和提醒，不进入普通模板或恶魔伪装。

## setup 与模板边界

- 村夫、饕餮、提线木偶、灯神不进入首批普通模板。
- 13-15 人模板需要第三个爪牙时使用教父，并显式采用 `+1 外来者` setup 修正。
- 模板覆盖 7-15 人，合计 22 套，恶魔伪装均为未在场且非旅行者/传奇角色。
- 掮客、半仙、使节、莽夫、蛊雕、鹰身女妖、普卡、典狱长、混沌等只做 AI/夜序建议，不自动修改权威状态。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/yi-hua-jie-mu/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
