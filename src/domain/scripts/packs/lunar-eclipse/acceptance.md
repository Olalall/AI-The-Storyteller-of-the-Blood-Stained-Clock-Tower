# Lunar Eclipse 智能板子包验收记录

状态：`needs-review`。  
完成日期：2026-07-20。  
导入阶段：12.9。

## 来源

- TPI Recommended 页面：https://bloodontheclocktower.com/pages/custom-scripts
- Script Tool 链接：https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUTU7EMAyFr4K87gm6RbNA4gYIIbdxU2sSO3Lcig7i7mhgBEs8y0jPv%2B9zXj6AE4zwVskRBsDNVzUY4XRmgQEEK8EIz5ugPZzmwq0TDDAV1dQd7alipkc1o9lZBUZQ%2BUmjXc1hXLB0GsCPds2zbKXA53Armg0lVfWVDAbIq%2Fa%2FgMYilG7P34jG70xBbUcuGk08r1gnsoqcghEVfaWKzjOjBGNY5EzUwuOWY0bx1bTFh95RPChGc%2B5RsRMWTEd4O%2FmexVQ84lahCE9YgvKsGu1iQpvi3mxyNT8K7na5FKrYPVwga1rwjttItHPpmHad0cO8tKij2Dv2znFHjVXIw52IJuwrc1B%2B0TptWxSCnbNa1SvvcRa4f3%2BJEfWKVjR8dq0ZifMcXc1EOWMUg123FCa%2BNzZ2XXhX%2Bw%2BE1y%2BQsqpnLAYAAA%3D%3D
- Script Tool 内容 SHA-256：`070cb29f3835ee8b19312a6a7d19fe163cb1db3661d679c50f1d6296cbfcbe95`
- 官方角色数据：https://release.botc.app/resources/data/roles.json
- 官方夜序数据：https://release.botc.app/resources/data/nightsheet.json

Script Tool `_meta.author` 为 `Ekin`。本包保留 TPI Recommended 社区板来源，不标成官方基础剧本。

## 已接入内容

- 31 个角色事实：13 镇民、4 外来者、5 爪牙、3 恶魔、5 旅行者、1 传奇。
- 旅行者和传奇角色保留事实与夜序，但不进入 7-15 人常规模板和恶魔伪装。
- 首夜/其他夜顺序来自官方 `nightsheet.json` 过滤。
- 9 条 setup/高风险规则：
  - 教父外来者增减。
  - 亡骨魔减少外来者。
  - 提线木偶必须与恶魔相邻。
  - 魔术师影响恶魔/爪牙互认。
  - 疯子以为自己是恶魔。
  - 半兽人可能停掉恶魔杀人。
  - 解谜大师醉酒与猜测。
  - 圣洁之魂额外邪恶限制。
  - 旅行者和传奇角色排除常规模板。
- 22 套 7-15 人 verified 模板。

## 高风险边界

- `lunatic`：疯子的夜晚选择只作为真正恶魔的信息来源，不自动杀人。
- `marionette`：必须邻近恶魔；工具只提醒，不自动重排座位。
- `magician`：只影响恶魔/爪牙开局信息，不改变真实身份或阵营。
- `lycanthrope`：是否杀死目标、是否停掉恶魔刀、登记为邪恶的善良玩家都由说书人确认。
- `zombuul`：首次死亡后存活但登记为死亡，不能用普通死亡状态简单替代。
- `barber`：恶魔换角色只生成更正草稿，不自动交换身份。
- `puzzlemaster`：醉酒目标与猜测结果只由说书人确认。
- `spiritofivory`：传奇角色只做全局约束，不进入座位身份或恶魔伪装。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/lunar-eclipse/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts
npm run check
```

## 未做

- 未支持旅行者和传奇角色作为常规开局模板成员。
- 未接真实 AI 配板 live 调用。
- 未做自动技能结算、自动胜负、自动昼夜、玩家端或官方魔典同步。
