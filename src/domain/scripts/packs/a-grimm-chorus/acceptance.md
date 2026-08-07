# A Grimm Chorus 智能板子包验收记录

状态：`needs-review`。  
完成日期：2026-07-20。  
导入阶段：12.7。

## 来源

- TPI Recommended 页面：https://bloodontheclocktower.com/pages/custom-scripts
- Script Tool 链接：https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACpWUQU4DMQxFr4K8nhPMDnWBuAIIIU/iSdwm9sjOUCrE3VFFBUvMMtbzj/X95ecP4AwzvHYaCBPgPqoazPBEw2ECwU4ww/3dg3Hvd4eqtl/rS1PNPtAeOxY6qBmlwSowg8q3jrragHnF5jTBuGxXoXVvDT6n26+FhAwbTFCq+i+8sQjl2/OHfuPWsBBn1hFsGXqWZEwW5FnkRLSF+YJ9aWGa3tUSe3R47ELOmIK4cKnjjCPVjhLs8YaX8PgreyX7h7i2HLe+s/gwioYhoQgv4exk7B7WzrbLKZoAbdSD7KaNBycOO1g0rzhq2EPfe1cJ4+iO7hzeZ0JrNM4aj8AFS8EFl6VR1KP9dMIgq0cNOx89GJVpDbIVrYUv0XHPJerBQqVgeOcJNyqKfw3y8gXT+fIa6wUAAA==
- Script Tool 内容 SHA-256：`1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d`
- 官方角色数据：https://release.botc.app/resources/data/roles.json
- 官方夜序数据：https://release.botc.app/resources/data/nightsheet.json

作者字段存在来源差异：Script Tool `_meta.author` 为 `Zets`，TPI Recommended 页面当前显示 `Lachlan`。本包保留差异说明，不把作者字段当作规则事实。

## 已接入内容

- 30 个角色事实：13 镇民、4 外来者、4 爪牙、4 恶魔、5 旅行者。
- 旅行者角色保留事实和夜序，但不进入 7-15 人常规模板和恶魔伪装。
- 首夜/其他夜顺序来自官方 `nightsheet.json` 过滤。
- 6 条 setup/高风险规则：
  - 村夫额外角色与醉酒。
  - 教父外来者增减。
  - 召唤师无恶魔开局与第 3 夜造魔。
  - 落难少女爪牙公开猜测。
  - 牙噶巴卜暗号次数。
  - 旅行者排除常规模板。
- 22 套 7-15 人 verified 模板。

## 高风险边界

- `summoner`：第 3 夜创建恶魔只做提醒，不自动改身份或阵营。
- `yaggababble`：暗号次数必须由说书人记录，不根据聊天自动判断杀人。
- `ojo`：选择角色是否在场、死亡目标都必须由说书人确认。
- `damsel`：爪牙猜测是否成功与胜负必须由说书人确认。
- `golem`：提名次数和死亡结果必须由说书人确认。
- `politician`：赛后阵营和获胜裁量不在对局中自动改状态。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/a-grimm-chorus/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts
npm run check
```

## 未做

- 未支持旅行者作为常规开局模板成员。
- 未接真实 AI 配板 live 调用。
- 未做自动技能结算、自动胜负、自动昼夜、玩家端或官方魔典同步。
