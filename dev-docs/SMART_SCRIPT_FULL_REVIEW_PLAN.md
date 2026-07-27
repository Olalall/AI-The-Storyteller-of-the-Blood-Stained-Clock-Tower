# 当前智能板子全面复核计划

状态：执行中，当前八个已接入板子已纳入质量门。  
日期：2026-07-20。  
适用范围：`src/domain/scripts/packs/*` 下所有已注册 `SmartScriptPack`。

## 1. 目标

把目前已经出现在开局流程里的所有板子统一收口为“智能板子包”：

- 每个板子都能按 7-15 人筛选合规模板。
- 每个角色都有稳定 ID、展示名、阵营、官方能力文本、输入形状和来源。
- 夜序、setup 修正、恶魔伪装和高风险技能提醒都来自同一个 pack。
- AI 只能读取这些结构化信息生成建议或草稿，不直接改身份、状态、死亡或胜负。

## 2. 当前板子清单

| scriptId | 名称 | 当前定位 | 本轮质量门 |
|---|---|---|---|
| `catfishing` | Catfishing / 瓦釜雷鸣 | 社区脚本，保持 `needs-review` | 覆盖 7-15 人模板；高风险角色结构化 |
| `trouble-brewing` | Trouble Brewing / 暗流涌动 | 官方基础板 | 覆盖 7-15 人模板；来源和角色元数据必填 |
| `bad-moon-rising` | Bad Moon Rising / 黯月初升 | 官方基础板 | 补齐死亡、醉酒、保护、复活等结构化逻辑 |
| `sects-and-violets` | Sects & Violets / 梦殒春宵 | 官方基础板 | 补齐疯狂、身份交换、中毒、胜负风险等结构化逻辑 |
| `one-in-one-out` | One in one out | TPI Recommended 社区板 | 覆盖 7-15 人模板；保持来源 hash |
| `a-grimm-chorus` | A Grimm Chorus | TPI Recommended 社区板 | 覆盖 7-15 人模板；高风险角色只做提醒 |
| `hide-and-seek` | Hide & Seek | TPI Recommended 社区板 | 覆盖 7-15 人模板；隐藏信息链路只做提醒 |
| `lunar-eclipse` | Lunar Eclipse | TPI Recommended 社区板 | 覆盖 7-15 人模板；传奇/旅行者不进常规模板 |

## 3. 自动质量门

新增 `src/domain/scripts/smartScriptPackQuality.test.ts`，统一检查：

1. 所有注册 pack 都声明支持 7-15 人。
2. 来源必须有 `url`、`sha256:` contentHash 和 `verifiedAt`。
3. 角色 ID 不重复，角色数量不少于 25。
4. 首夜或其他夜夜序必须存在。
5. setup 规则必须是 `confirmed`。
6. 每个人数都有足够 verified 模板。
7. 模板人数、角色唯一性、伪装唯一性和构成校验必须通过。
8. 模板角色和伪装必须属于同一板子，且不能使用旅行者或传奇角色。
9. 每个角色必须有官方名、能力文本、输入形状、来源和复核日期。
10. 能力文本涉及死亡、毒醉、疯狂、身份/阵营变化、登记或胜负时，必须写入结构化逻辑字段。

## 4. 本轮已执行的复核项

### Catfishing / 瓦釜雷鸣

- 原先只重点覆盖 7/12/15 人模板。
- 本轮补齐 8、9、10、11、13、14 人模板。
- 现在 7-15 人每个人数都有 3 套 verified 模板。
- 保持 pack `needs-review`，原因是社区脚本仍应允许说书人最终 spot-check。

### Bad Moon Rising / 黯月初升

补齐以下高风险角色结构化字段：

- 水手、旅店老板：醉酒和免死保护。
- 流言者、刺客、普卡、沙巴洛斯、珀：死亡/额外死亡链路。
- 侍臣、吟游诗人、甜茶女士、和平主义者、弄臣、修补匠：持续状态或免死裁量。
- 月之子、魔鬼代言人、教授、主谋：死亡、复活、处决和胜负边界。

### Sects & Violets / 梦殒春宵

补齐以下高风险角色结构化字段：

- 哲学家：获得能力与在场角色醉酒。
- 甜心、诺达鲺：长期醉酒/中毒。
- 冒失鬼、邪恶双子相关风险：胜负必须说书人确认。
- 理发师：死亡后恶魔可交换角色，但不自动改身份。
- 畸形秀演员、女巫：疯狂惩罚和提名死亡只做提醒。
- 神谕者、裁缝：信息输出模板和核对提醒。

## 5. 明确不做

- 不把规则提示升级为自动技能结算引擎。
- 不在页面组件里新增角色 ID if/else。
- 不让 AI 绕过模板库直接生成未知合法性的配板。
- 不自动发送身份、不自动进入夜晚、不自动判定胜负。
- 不把旅行者、传奇角色放入常规座位模板。

## 6. 验收命令

```powershell
npx vitest run src/domain/scripts/smartScriptPackQuality.test.ts src/domain/scripts/packs/catfishing/index.test.ts src/domain/setup-templates/composition.test.ts
npm run check
```

## 7. 后续建议

- 下一批新增板子前，先让新板子通过同一份 `smartScriptPackQuality.test.ts`。
- 如果某个角色规则存在争议，先把 pack 或角色保留 `needs-review`，不要为了通过测试硬标 confirmed。
- 真实 AI 配板和夜间建议只读取这些结构化字段，不能自行发明未写入 pack 的结算规则。
