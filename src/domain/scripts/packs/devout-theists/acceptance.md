# Devout Theists 智能板子验收记录

状态：**已导入 pack / needs-review**。  
阶段：`12.14`。  
日期：2026-07-20。  

## 来源

- 来源等级：TPI Carousel Collection 社区脚本。
- 作者：Emerald。
- 展示名：Devout Theists v6。
- 来源页面：`https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/`
- JSON：`https://botc-script-viewer.sthom.kiwi/carousel/devout-theists/devout-theists.json`
- 官方角色数据：`https://release.botc.app/resources/data/roles.json`
- 官方夜序数据：`https://release.botc.app/resources/data/nightsheet.json`
- JSON sha256：`fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683`

## 角色构成

- 镇民 13：`noble`、`chef`、`pixie`、`highpriestess`、`mathematician`、`flowergirl`、`savant`、`amnesiac`、`juggler`、`fisherman`、`farmer`、`magician`、`cannibal`
- 外来者 4：`puzzlemaster`、`klutz`、`golem`、`snitch`
- 爪牙 4：`widow`、`goblin`、`psychopath`、`marionette`
- 恶魔 4：`lleech`、`fanggu`、`kazali`、`legion`

## 已完成

- 已把 JSON 中的 `high_priestess` 归一为项目稳定 ID `highpriestess`。
- 已把 JSON 中的 `fang_gu` 归一为项目稳定 ID `fanggu`。
- 已补齐 Devout Theists 的角色事实、中文名、能力文本、输入类型和高风险提醒。
- 已按官方 night sheet 筛选首夜和其他夜顺序。
- 已建立 7-15 人 verified 模板：7/10/12/15 各 3 套，其余人数各 2 套。

## 高风险边界

- `legion` 需要多数玩家是军团，当前模板体系不支持同一角色多份身份；本轮只保留角色事实、夜序和提醒，不把军团放入 verified 模板。
- `lleech` 的宿主中毒、宿主保护和恶魔死亡判定不能自动结算。
- `fanggu` 会增加外来者，并可能产生新邪恶方古、旧方古死亡和阵营变化；全部必须人工确认。
- `kazali` 可以指定爪牙并修正外来者；开局调整必须人工确认。
- `widow` 会产生额外中毒目标和一名知道寡妇在场的善良玩家；不能自动选择或隐藏修改状态。
- `goblin`、`golem`、`psychopath` 都有白天公开死亡或胜负风险；投票和死亡只做提醒。

## 未完成 / 保留项

- 仍需用户实机浏览器验收：开局选择、配板、身份展示、夜序和角色提示是否易读。
- `legion` 的多名同角色 setup 需要后续单独设计；当前 verified 模板不使用 `legion`。
- 仍需后续实战 spot-check 中文译名是否符合你的常用叫法，尤其是 `lleech`。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/devout-theists/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts src/domain/scripts/smartScriptPackQuality.test.ts
npm run check
```
