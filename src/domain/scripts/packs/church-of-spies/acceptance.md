# Church of Spies 智能板子验收记录

状态：`needs-review`。  
导入日期：2026-07-21。  
任务阶段：`12.31 Church of Spies 智能板子包`。

## 来源

- 展示名：Church of Spies
- 作者：Andrew Nathenson
- 来源入口：The Bakery TPI Full Scripts / BotC Scripts
- JSON 下载：`https://www.botcscripts.com/script/2378/1.0.0/download`
- JSON sha256：`dd5fea53947a5818eacc406e2fc09b3595815b3588567d7cc1b4d541acbe837d`
- 官方角色资料：`https://release.botc.app/resources/data/roles.json`
- 官方夜序资料：`https://release.botc.app/resources/data/nightsheet.json`

## 角色清单

- 镇民 13：`librarian`、`steward`、`pixie`、`cultleader`、`fortuneteller`、`highpriestess`、`exorcist`、`monk`、`undertaker`、`juggler`、`nightwatchman`、`artist`、`ravenkeeper`
- 外来者 4：`klutz`、`saint`、`mutant`、`drunk`
- 爪牙 4：`baron`、`marionette`、`scarletwoman`、`spy`
- 恶魔 3：`nodashii`、`po`、`pukka`

## 角色事实

- 大多数角色复用当前已接入 pack 的 confirmed 角色事实。
- `cultleader` 在本板补齐为 confirmed 角色事实，来源为官方 `roles.json`。
- 本板仍作为社区脚本保持 `needs-review`，等待实桌 spot-check。

## 夜序

首夜：

```text
marionette, pukka, pixie, librarian, fortuneteller, steward, nightwatchman, cultleader, spy, highpriestess
```

其他夜：

```text
monk, scarletwoman, exorcist, pukka, po, nodashii, ravenkeeper, fortuneteller, undertaker, juggler, nightwatchman, cultleader, spy, highpriestess
```

## 高风险边界

- `cultleader`：阵营变化和邪教胜利由说书人确认，不自动改阵营或判胜。
- `pixie`：疯狂和获得能力只做提醒，不自动给能力。
- `highpriestess`：说书人自由裁量信息，AI 只给候选草稿。
- `exorcist`：命中恶魔时只提醒，不自动跳过恶魔行动。
- `marionette`：身份和阵营信息防误公开。
- `spy`：登记异常由说书人裁量。
- `nodashii`、`po`、`pukka`：中毒、蓄力、死亡链路只做提醒，不自动写权威状态。

## 模板

- 已建立 22 套 7-15 人 verified 模板。
- 男爵模板显式声明 `baron-outsiders` 人数修正。
- 恶魔伪装从本板未在场角色中选择。

## 验证

```powershell
npx vitest run src/domain/scripts/packs/church-of-spies/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts --reporter=verbose
npm run check
```
