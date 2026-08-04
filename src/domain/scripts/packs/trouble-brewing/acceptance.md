# Trouble Brewing / 暗流涌动 智能板子验收

阶段：12.1 Trouble Brewing 智能板子包。

## 1. 来源

- 板子：Trouble Brewing / 暗流涌动
- 来源：The Pandemonium Institute official edition data
- 角色数据：https://release.botc.app/resources/data/roles.json
- 夜序数据：https://release.botc.app/resources/data/nightsheet.json
- 核对日期：2026-07-20
- 内容哈希：sha256:102dddc141da4e829de953563b5d9370c6c71482860c756474f7e55477c56ecb

## 2. 角色清单

### 镇民

- 厨师 / Chef / `chef`
- 调查员 / Investigator / `investigator`
- 洗衣妇 / Washerwoman / `washerwoman`
- 图书管理员 / Librarian / `librarian`
- 共情者 / Empath / `empath`
- 占卜师 / Fortune Teller / `fortuneteller`
- 送葬者 / Undertaker / `undertaker`
- 僧侣 / Monk / `monk`
- 猎手 / Slayer / `slayer`
- 士兵 / Soldier / `soldier`
- 守鸦人 / Ravenkeeper / `ravenkeeper`
- 镇长 / Mayor / `mayor`
- 贞洁者 / Virgin / `virgin`

### 外来者

- 管家 / Butler / `butler`
- 酒鬼 / Drunk / `drunk`
- 陌客 / Recluse / `recluse`
- 圣徒 / Saint / `saint`

### 爪牙

- 投毒者 / Poisoner / `poisoner`
- 间谍 / Spy / `spy`
- 红唇女郎 / Scarlet Woman / `scarletwoman`
- 男爵 / Baron / `baron`

### 恶魔

- 小恶魔 / Imp / `imp`

### 旅行者

- 窃贼 / Thief / `thief`
- 官员 / Bureaucrat / `bureaucrat`
- 枪手 / Gunslinger / `gunslinger`
- 乞丐 / Beggar / `beggar`
- 替罪羊 / Scapegoat / `scapegoat`

## 3. 夜间顺序

首夜：

官员 -> 窃贼 -> 投毒者 -> 洗衣妇 -> 图书管理员 -> 调查员 -> 厨师 -> 共情者 -> 占卜师 -> 管家 -> 间谍

其他夜：

官员 -> 窃贼 -> 投毒者 -> 僧侣 -> 红唇女郎 -> 小恶魔 -> 守鸦人 -> 共情者 -> 占卜师 -> 送葬者 -> 管家 -> 间谍

## 4. Setup / 高风险规则

- `baron-outsiders` / 男爵：男爵：+2 外来者，通常替换 2 名镇民。
- `drunk-cover` / 酒鬼：酒鬼：以为自己是某个镇民，但实际是外来者且能力无效。
- `fortuneteller-red-herring` / 占卜师：占卜师：开局指定 1 名善良玩家作为红鲱鱼，可能被登记为恶魔。

## 5. 模板

- 已提供 22 套 verified 模板。
- 覆盖人数：7、8、9、10、11、12、13、14、15。
- 恶魔伪装均要求来自本板且不在当前模板在场角色中。

## 6. 本轮边界

- 只完成 domain pack、模板和验收记录。
- 不做真实 AI live 调用。
- 不做自动技能结算。
- 不做玩家端或官方魔典同步。

## 7. 验证

- 定向测试：`npx vitest run src/domain/scripts/packs/trouble-brewing/index.test.ts src/domain/setup-templates/composition.test.ts`
- 全量检查：`npm run check`
- Vite 仍可能提示部分 chunk 超过 500 kB；这是既有体积提示，不阻塞本轮。
