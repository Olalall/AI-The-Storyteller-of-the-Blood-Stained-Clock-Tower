# Insanity and Intuition 智能板子验收记录

日期：2026-07-21  
状态：needs-review

## 来源

- JSON：`https://www.botcscripts.com/script/2128/1.2.0/download`
- BotC Scripts meta：`Insanity and Intuition v1.2` / author `Sam`
- JSON sha256：`227279b78329fb27c3b2690503a0dc929f3db34073b8db8bb5b2b0005b63f399`
- 官方角色事实：`https://release.botc.app/resources/data/roles.json`
- 官方夜序：`https://release.botc.app/resources/data/nightsheet.json`

## 已完成

- 25 个角色全部来自官方角色库，无自定义角色。
- 罂粟种植者、瘟疫医生、炸弹人已补齐本 pack 本地角色事实。
- 首夜和其他夜顺序按官方 nightsheet 过滤。
- 7-15 人共 22 套模板通过人数构成校验。
- 方古和亡骨魔的人数修正已显式写入模板 adjustment。

## 说书人注意

- 罂粟种植者只影响邪恶互认信息；工具不自动发送互认。
- 瘟疫医生死亡后，说书人获得爪牙能力；能力选择和使用不自动结算。
- 炸弹人被处决会造成大量死亡；工具不能自动清空状态。
- 方古跳转、亡骨魔爪牙死亡后保留能力、诺-达鲺邻座中毒都只做提醒。

## 未做

- 未接真实 AI 自动判断。
- 未做玩家端或官方魔典同步。
- 未把复杂角色写成页面级自动规则引擎。
