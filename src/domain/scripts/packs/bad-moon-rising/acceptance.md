# Bad Moon Rising / 黯月初升 智能板子验收

阶段：12.2 Bad Moon Rising 智能板子包。

## 1. 来源

- 板子：Bad Moon Rising / 黯月初升
- 来源：The Pandemonium Institute official edition data
- 角色数据：https://release.botc.app/resources/data/roles.json
- 夜序数据：https://release.botc.app/resources/data/nightsheet.json
- 核对日期：2026-07-20
- 内容哈希：sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d

## 2. 角色清单

### 镇民

- 祖母 / Grandmother / `grandmother`
- 水手 / Sailor / `sailor`
- 侍女 / Chambermaid / `chambermaid`
- 旅店老板 / Innkeeper / `innkeeper`
- 赌徒 / Gambler / `gambler`
- 驱魔人 / Exorcist / `exorcist`
- 造谣者 / Gossip / `gossip`
- 侍臣 / Courtier / `courtier`
- 教授 / Professor / `professor`
- 吟游诗人 / Minstrel / `minstrel`
- 茶艺师 / Tea Lady / `tealady`
- 弄臣 / Fool / `fool`
- 和平主义者 / Pacifist / `pacifist`

### 外来者

- 莽夫 / Goon / `goon`
- 疯子 / Lunatic / `lunatic`
- 修补匠 / Tinker / `tinker`
- 月之子 / Moonchild / `moonchild`

### 爪牙

- 教父 / Godfather / `godfather`
- 魔鬼代言人 / Devil's Advocate / `devilsadvocate`
- 刺客 / Assassin / `assassin`
- 主谋 / Mastermind / `mastermind`

### 恶魔

- 普卡 / Pukka / `pukka`
- 沙巴洛斯 / Shabaloth / `shabaloth`
- 珀 / Po / `po`
- 僵怖 / Zombuul / `zombuul`

### 旅行者

- 女舍监 / Matron / `matron`
- 法官 / Judge / `judge`
- 学徒 / Apprentice / `apprentice`
- 主教 / Bishop / `bishop`
- 巫毒师 / Voudon / `voudon`

## 3. 夜间顺序

首夜：

学徒 -> 疯子 -> 水手 -> 侍臣 -> 教父 -> 魔鬼代言人 -> 普卡 -> 祖母 -> 侍女

其他夜：

水手 -> 侍臣 -> 旅店老板 -> 赌徒 -> 魔鬼代言人 -> 疯子 -> 驱魔人 -> 僵怖 -> 普卡 -> 沙巴洛斯 -> 珀 -> 刺客 -> 教父 -> 造谣者 -> 教授 -> 修补匠 -> 月之子 -> 祖母 -> 侍女

## 4. Setup / 高风险规则

- `godfather-outsider` / 教父：教父：开局会增加或减少 1 名外来者；如果外来者今天死亡，夜晚可以额外选择一名玩家死亡。
- `lunatic-fake-demon` / 疯子：疯子：以为自己是恶魔；恶魔知道疯子和他的夜晚选择。
- `apprentice-first-night` / 学徒：学徒：首夜根据阵营获得镇民或爪牙能力。

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

- 定向测试：`npx vitest run src/domain/scripts/packs/bad-moon-rising/index.test.ts src/domain/setup-templates/composition.test.ts`
- 全量检查：`npm run check`
- Vite 仍可能提示部分 chunk 超过 500 kB；这是既有体积提示，不阻塞本轮。
