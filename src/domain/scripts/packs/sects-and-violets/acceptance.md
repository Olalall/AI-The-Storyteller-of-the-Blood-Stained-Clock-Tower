# Sects & Violets / 梦殒春宵 智能板子验收

阶段：12.3 Sects & Violets 智能板子包。

## 1. 来源

- 板子：Sects & Violets / 梦殒春宵
- 来源：The Pandemonium Institute official edition data
- 角色数据：https://release.botc.app/resources/data/roles.json
- 夜序数据：https://release.botc.app/resources/data/nightsheet.json
- 核对日期：2026-07-20
- 内容哈希：sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656

## 2. 角色清单

### 镇民

- 钟表匠 / Clockmaker / `clockmaker`
- 舞蛇人 / Snake Charmer / `snakecharmer`
- 数学家 / Mathematician / `mathematician`
- 筑梦师 / Dreamer / `dreamer`
- 卖花女孩 / Flowergirl / `flowergirl`
- 城镇公告员 / Town Crier / `towncrier`
- 神谕者 / Oracle / `oracle`
- 博学者 / Savant / `savant`
- 女裁缝 / Seamstress / `seamstress`
- 哲学家 / Philosopher / `philosopher`
- 艺术家 / Artist / `artist`
- 杂耍艺人 / Juggler / `juggler`
- 贤者 / Sage / `sage`

### 外来者

- 心上人 / Sweetheart / `sweetheart`
- 呆瓜 / Klutz / `klutz`
- 理发师 / Barber / `barber`
- 畸形秀演员 / Mutant / `mutant`

### 爪牙

- 女巫 / Witch / `witch`
- 洗脑师 / Cerenovus / `cerenovus`
- 麻脸巫婆 / Pit-Hag / `pithag`
- 镜像双子 / Evil Twin / `eviltwin`

### 恶魔

- 诺-达鲺 / No Dashii / `nodashii`
- 亡骨魔 / Vigormortis / `vigormortis`
- 涡流 / Vortox / `vortox`
- 方古 / Fang Gu / `fanggu`

### 旅行者

- 咖啡师 / Barista / `barista`
- 流莺 / Harlot / `harlot`
- 屠夫 / Butcher / `butcher`
- 集骨者 / Bone Collector / `bonecollector`
- 怪咖 / Deviant / `deviant`

## 3. 夜间顺序

首夜：

咖啡师 -> 哲学家 -> 舞蛇人 -> 镜像双子 -> 女巫 -> 洗脑师 -> 钟表匠 -> 筑梦师 -> 女裁缝 -> 数学家

其他夜：

咖啡师 -> 流莺 -> 集骨者 -> 哲学家 -> 舞蛇人 -> 女巫 -> 洗脑师 -> 麻脸巫婆 -> 方古 -> 诺-达鲺 -> 涡流 -> 亡骨魔 -> 理发师 -> 心上人 -> 贤者 -> 筑梦师 -> 卖花女孩 -> 城镇公告员 -> 神谕者 -> 女裁缝 -> 杂耍艺人 -> 数学家

## 4. Setup / 高风险规则

- `fanggu-outsider` / 方古：方古：+1 外来者；首次被方古夜晚杀死的外来者会变成邪恶方古，原方古死亡。
- `vigormortis-outsider` / 亡骨魔：亡骨魔：-1 外来者；被他杀死的爪牙保留能力并让相邻镇民中毒。
- `evil-twin-pair` / 镜像双子：镜像双子：建立一对阵营相反的双子；善良双子被处决时邪恶获胜。
- `snakecharmer-swap` / 舞蛇人：舞蛇人：选择恶魔时交换角色和阵营；原恶魔成为中毒的舞蛇人。

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

- 定向测试：`npx vitest run src/domain/scripts/packs/sects-and-violets/index.test.ts src/domain/setup-templates/composition.test.ts`
- 全量检查：`npm run check`
- Vite 仍可能提示部分 chunk 超过 500 kB；这是既有体积提示，不阻塞本轮。
