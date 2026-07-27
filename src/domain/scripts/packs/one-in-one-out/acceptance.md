# One in one out 智能板子包验收记录

状态：12.6 已实现，`knowledgeStatus` 保持 `needs-review`。  
日期：2026-07-20。  
作者：Baron von Klutz。  
来源等级：TPI Recommended 社区脚本。

## 来源

- TPI Custom Scripts：<https://bloodontheclocktower.com/pages/custom-scripts>
- Script Tool：<https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWSQU7EMAxFr1J53RN0CSvEggMghEzrJqaJHTnOoBnE3RFiBEvMMtLzj/N%2BHt%2BBN1jguZIjzIDDsxoscIOmMp1Upvsy%2FAIzCFaCBR6EJpZJhSYdDjO8FNWtO9pdxUS3akarswosoPIdqV3NYdmxdJrBz%2B0raB%2BlwMd8XaA7vaFtMEPK2n%2FhxiK0XY8%2F9CGcsgfhzCk3Y%2BpOvQdnTlwKJuKNNXpNFzxozWiVLDiyq%2FkQciolPKOGa6EgXFWOIIpVqDOu0dW5Z7KKErVDWLtbvIH9PyJXFOEXLFGHyaIGk2r0iUZrGT0avNkId9OUu0rYRkZr52gvYbLShVqmQtEGD7xg4SDMtUXLe9XwF5KURlgEG7vufFL7S8nTJ74mOs83BQAA>
- 官方角色数据：<https://release.botc.app/resources/data/roles.json>
- 官方 night sheet：<https://release.botc.app/resources/data/nightsheet.json>
- Script JSON sha256：`87e2d275030590b6420a48da7426e56d5d3e7e5628b957ded192c89eeb46308a`

## 角色清单

- 镇民 13：事务官、骑士、女祭司、村夫、舞蛇人、占卜师、神谕者、僧侣、失忆者、渔夫、女裁缝、农夫、食人族。
- 外来者 4：食人魔、莽夫、隐士、酒鬼。
- 爪牙 4：投毒者、鹰身女妖、间谍、灵言师。
- 恶魔 4：卡扎力、小恶魔、奥赫、方古。
- 传奇 1：象牙之灵。

## 已确认内容

- 26 个角色 ID、阵营和英文技能文本来自官方角色数据。
- 首夜和其他夜顺序来自官方 `nightsheet.json`，按本板角色过滤。
- `spiritofivory` 作为 `fabled` 保留在 pack 事实源里，但不进入座位池、模板或恶魔伪装。
- 7-15 人均已有 verified 模板，共 22 套。
- 方古模板显式声明 `fanggu-outsider` 人数修正。

## 高风险交互

- 舞蛇人：命中恶魔时交换角色和阵营，原恶魔成为中毒舞蛇人；工具只提示和记录，不自动交换。
- 食人魔：首夜选择后变成目标阵营，即使醉酒/中毒也会发生；说书人确认后再追加阵营变化。
- 灵言师：暗号触发额外邪恶，受象牙之灵限制；工具不根据聊天自动触发。
- 卡扎力：首夜指定爪牙与外来者修正，需要人工确认，不自动改身份。
- 方古：首次杀死外来者会发生恶魔传递；必须人工确认。
- 奥赫：若选择不在场角色，由说书人选择死亡玩家，不自动杀人。
- 食人族、农夫、莽夫、鹰身女妖都可能影响能力、阵营、死亡或疯狂，均只给草稿提醒。

## 未确认或后置项

- 中文译名已按当前公开中文资料与旧项目资料整理，但社区脚本整体仍保持 `needs-review`，需要说书人 spot-check 后再决定是否标为 confirmed。
- 还没有接真实 AI live 配板；当前仍是模板库 + 本地提醒。
- 没有新增任何自动技能结算分支。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/one-in-one-out/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts
npm run check
```
