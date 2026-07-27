# Catfishing / 瓦釜雷鸣 智能板子包验收

状态：角色、夜序、setup 规则和 7-15 人模板均已结构化；pack 仍保持 `needs-review`。  
原因：Catfishing 是社区脚本，进入实战前仍建议说书人 spot-check 当前版本和模板口味。

## 来源

- 板子：Catfishing / 瓦釜雷鸣
- 作者：Emily
- 版本：11.1.1
- 板子来源：`https://www.botcscripts.com/script/3/11.1.1/download`
- 官方角色资料：`https://release.botc.app/resources/data/roles.json`
- 官方夜序资料：`https://release.botc.app/resources/data/nightsheet.json`
- 板子内容哈希：`sha256:02664ff82e0ba47526d8cc00a77331f71b996299c9b6b2683728bc4d104b8d06`
- 调研日期：2026-07-19

## 角色级验收

- 已确认 30 个角色的稳定 ID、中文展示名、英文官方名、阵营、官方能力文本和输入形状。
- 官方 `traveller` 阵营映射为项目内稳定枚举 `traveler`。
- 角色知识状态已确认；pack 整体仍保持 `needs-review`。
- 高风险技能只写结构化提醒和草稿字段，不启用自动结算。

已确认角色：

```text
调查员 investigator
厨师 chef
祖母 grandmother
气球驾驶员 balloonist
筑梦师 dreamer
占卜师 fortuneteller
舞蛇人 snakecharmer
赌徒 gambler
博学者 savant
哲学家 philosopher
守鸦人 ravenkeeper
失忆者 amnesiac
食人族 cannibal
酒鬼 drunk
陌客 recluse
心上人 sweetheart
畸形秀演员 mutant
疯子 lunatic
教父 godfather
洗脑师 cerenovus
麻脸巫婆 pithag
寡妇 widow
小恶魔 imp
亡骨魔 vigormortis
方古 fanggu
学徒 apprentice
咖啡师 barista
乞丐 beggar
集骨者 bonecollector
流莺 harlot
```

## 夜序验收

- 首夜和其他夜顺序已按官方 night sheet 过滤到 Catfishing 在场角色集合。
- 首夜补入 `cerenovus` 与 `amnesiac`。
- 夜序条目知识状态为 `confirmed`。
- 身份变化不会自动重排当前夜序，只生成提醒或待办。

## Setup 规则验收

已确认 5 条开局修正规则：

- 气球驾驶员：`+0 or +1 Outsider`
- 教父：`-1 or +1 Outsider`
- 亡骨魔：`-1 Outsider`
- 方古：`+1 Outsider`
- 酒鬼：玩家不知道自己是酒鬼，需要镇民伪装身份

## 模板验收

- 7-15 人每个人数都有 3 套 `verified: true` 模板。
- 每套模板通过 `validateTemplateComposition` 校验基础人数构成和 setup 修正。
- 方古、亡骨魔、气球驾驶员、教父等人数修正通过 `setupAdjustments` 明确记录。
- 候选服务只会返回 `verified: true` 且人数构成有效的模板。

## 高风险交互

以下角色已写入 `research.highRiskNotes` 或结构化字段，后续只能生成提醒或草稿，不能自动执行权威状态：

- 赌徒：先记录“某玩家猜测某角色”；是否猜对、是否死亡由说书人确认。
- 舞蛇人：可能同时改变身份、阵营和中毒状态；当前夜序不自动回滚或重排。
- 洗脑师：疯狂是玩家信息和说书人裁量，不自动处决。
- 麻脸巫婆：目标必须变成未在场角色；制造恶魔后的当晚死亡任意，不自动结算。
- 方古：首次外来者跳恶魔涉及身份、阵营和死亡事件。
- 亡骨魔：杀死爪牙后的保留能力与邻近镇民中毒是连锁提醒，不自动套用。
- 哲学家：获得在场善良角色能力时，原角色醉酒需要单独确认。

## 验收

- [x] pack 可被 registry 读取。
- [x] roles / night-orders / templates / setup-rules 已分文件。
- [x] 每个角色有知识状态、来源和复核日期。
- [x] 高风险角色有 notes 或结构化逻辑字段。
- [x] 首夜/其他夜按官方 night sheet 过滤生成。
- [x] setup 修正规则有来源 URL。
- [x] 7-15 人模板均通过 composition 校验。
- [x] 随机候选服务不返回未验证模板。

## 验证命令

```powershell
npx vitest run src/domain/scripts/smartScriptPackQuality.test.ts src/domain/scripts/packs/catfishing/index.test.ts src/domain/setup-templates/composition.test.ts
npm run check
```
