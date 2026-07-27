# Punchy 智能板子验收记录

状态：**已导入 pack / needs-review**。  
阶段：`12.12`。  
日期：2026-07-20。  

## 来源

- 来源等级：TPI Carousel Collection 社区脚本。
- 作者：Zets。
- 展示名：Punchy v3.8。
- 来源页面：`https://botc-script-viewer.sthom.kiwi/carousel/punchy/`
- JSON：`https://botc-script-viewer.sthom.kiwi/carousel/punchy/punchy.json`
- 官方角色数据：`https://release.botc.app/resources/data/roles.json`
- 官方夜序数据：`https://release.botc.app/resources/data/nightsheet.json`
- JSON sha256：`2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c`

## 角色构成

- 镇民 13：`steward`、`pixie`、`balloonist`、`general`、`monk`、`savant`、`philosopher`、`huntsman`、`slayer`、`princess`、`alchemist`、`cannibal`、`amnesiac`
- 外来者 4：`ogre`、`drunk`、`mutant`、`damsel`
- 爪牙 4：`harpy`、`cerenovus`、`psychopath`、`vizier`
- 恶魔 4：`pukka`、`ojo`、`kazali`、`vigormortis`
- 传奇 1：`spiritofivory`

## 已完成

- 已把 JSON 中的 `spirit_of_ivory` 归一为项目稳定 ID `spiritofivory`。
- 已补齐 Punchy 的角色事实、中文名、能力文本、输入类型和高风险提醒。
- 已按官方 night sheet 筛选首夜和其他夜顺序。
- 已建立 7-15 人 verified 模板：7/10/12/15 各 3 套，其余人数各 2 套。
- 已排除传奇角色进入座位池和恶魔伪装。

## 高风险边界

- `balloonist` 可增加 1 名外来者；模板只记录 setup 调整，不自动改玩家身份。
- `huntsman` 加入 `damsel`；救援成功只生成更正提醒，不能自动换身份。
- `alchemist` 获得爪牙能力；只显示对应能力提醒，不写爪牙自动结算状态机。
- `kazali` 可指定爪牙和修正外来者；必须由说书人确认。
- `pukka`、`ojo`、`vigormortis` 都会造成死亡/中毒链路；工具只记录和建议，不自动杀人。
- `vizier`、`psychopath` 是白天公开压力角色；投票、立即处决和死亡都必须人工确认。

## 未完成 / 保留项

- 仍需用户实机浏览器验收：开局选择、配板、身份展示、夜序和角色提示是否易读。
- 仍需后续实战 spot-check 中文译名是否符合你的常用叫法。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/punchy/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts
npm run check
```
