# Quick Maths 智能板子验收记录

状态：**已导入 pack / needs-review**。  
阶段：`12.13`。  
日期：2026-07-20。  

## 来源

- 来源等级：TPI Carousel Collection 社区脚本。
- 作者：Fran。
- 展示名：Quick Maths。
- 来源页面：`https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/`
- JSON：`https://botc-script-viewer.sthom.kiwi/carousel/quick-maths/quick-maths.json`
- 官方角色数据：`https://release.botc.app/resources/data/roles.json`
- 官方夜序数据：`https://release.botc.app/resources/data/nightsheet.json`
- JSON sha256：`2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03`

## 角色构成

- 镇民 13：`noble`、`shugenja`、`pixie`、`highpriestess`、`general`、`dreamer`、`savant`、`alsaahir`、`nightwatchman`、`seamstress`、`philosopher`、`fisherman`、`juggler`
- 外来者 4：`ogre`、`politician`、`snitch`、`puzzlemaster`
- 爪牙 4：`spy`、`xaan`、`marionette`、`boffin`
- 恶魔 1：`riot`

## 已完成

- 已补齐 Quick Maths 的角色事实、中文名、能力文本、输入类型和高风险提醒。
- 已按官方 night sheet 筛选首夜和其他夜顺序。
- 已建立 7-15 人 verified 模板：7/10/12/15 各 3 套，其余人数各 2 套。
- 已把 `high_priestess` 统一为项目稳定 ID `highpriestess`。
- 已避免在 0 外来者模板中放入 `xaan`，防止 `X Outsiders` 规则和人数构成冲突。

## 高风险边界

- `riot` 第 3 天会让爪牙变成暴乱，并让被提名者死亡后立即提名；工具只做投票/胜负提醒，不自动杀人、不自动判胜。
- `boffin` 让恶魔获得不在场善良角色能力；只做 setup 提醒，不自动执行该能力。
- `snitch` 让每个爪牙各得 3 个伪装；伪装信息需要按爪牙分别记录。
- `xaan` 的 X 与外来者数量绑定；第 X 夜全体镇民中毒只做提醒，不批量改状态。
- `marionette` 需要与恶魔相邻；座位相邻关系由说书人核对，不自动重排。
- `alsaahir` 可触发善良胜利；公开猜测是否完整命中必须由说书人确认。

## 未完成 / 保留项

- 仍需用户实机浏览器验收：开局选择、配板、身份展示、夜序和角色提示是否易读。
- 仍需后续实战 spot-check 中文译名是否符合你的常用叫法，尤其是 `alsaahir`、`xaan`、`boffin`。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/quick-maths/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts src/domain/scripts/smartScriptPackQuality.test.ts
npm run check
```
