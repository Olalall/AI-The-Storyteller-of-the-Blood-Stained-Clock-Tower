# Everyone Can Play 智能板子验收

状态：`needs-review`，已进入第二批单板闭环。  
日期：2026-07-21。  
作者：Ben Burns。  
版本：1.0.2。

## 来源

- BotC Scripts 页面：https://botcscripts.com/script/1945
- JSON 下载：https://botcscripts.com/script/1945/1.0.2/download
- Script Tool 链接来自页面按钮。
- JSON sha256：`acf6387ace9760b6eb07ac083aba61e12215973253cf55f2510fcb9e26e0880c`
- 夜序来源：https://release.botc.app/resources/data/nightsheet.json
- 角色事实来源：官方基础三板已确认角色事实复用，不在本目录复制第二份角色事实。

## 角色清单

```text
librarian, clockmaker, grandmother, fortuneteller, empath, monk, undertaker, gambler, artist, slayer, fool, ravenkeeper, mayor,
drunk, recluse, saint, moonchild,
baron, poisoner, assassin, devilsadvocate, spy, scarletwoman,
imp
```

构成：镇民 13 / 外来者 4 / 爪牙 6 / 恶魔 1。

## 已确认规则点

- 男爵在场时增加 2 名外来者，模板通过 `setupAdjustments` 显式记录。
- 酒鬼、陌客、占卜师红鲱鱼、魔鬼代言人、红唇女郎、小恶魔、圣徒、月之子和镇长均只做提醒或草稿，不自动改身份、死亡或胜负。
- 首夜和其他夜顺序来自官方 `nightsheet.json` 过滤结果。
- 模板覆盖 7-15 人，并满足最低数量要求。
- 恶魔伪装全部来自本板且不在场。

## 未确认项

- 该脚本来自社区脚本库，不等同官方基础版；需要说书人实桌 spot-check 后再考虑升级为 `confirmed`。
- 中文展示名来自项目已确认角色事实，后续如果统一翻译表调整，会随共享事实源更新。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/everyone-can-play/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts
npm run check
```
