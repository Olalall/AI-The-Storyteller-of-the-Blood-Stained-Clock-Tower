# 第一批智能板子导入计划

状态：**第一批 10 板已完成 12.15 总验收**。  
日期：2026-07-19。  
适用范围：把第一批 10 个板子逐个转成 `SmartScriptPack`，进入 7-15 人开局、AI 配板、夜序和角色提示的统一事实源。  
不适用范围：真实 AI live 调用、官方魔典同步器、玩家端、自动技能结算、数据库/ORM。

## 1. 核心结论

第一批不做“随便导入 JSON 后马上可玩”。

正确流程是：

```text
官方/可信来源确认
-> 角色清单与夜序核对
-> 建立 SmartScriptPack
-> 建立人数模板库
-> 测试通过
-> 才允许进入开局列表
```

每个板子必须独立目录、独立验收，不允许为了赶进度把 10 个板子的角色、模板、规则塞进一个大文件。

## 2. 第一批 10 个板子

| 顺序 | scriptId | 展示名 | 中文建议名 | 来源等级 | 首要目的 | 首轮状态 |
|---:|---|---|---|---|---|---|
| 1 | `trouble-brewing` | Trouble Brewing | 暗流涌动 | 官方基础版 | 打好基础角色、基础夜序、7-15 人模板底座 | `done-12.1` |
| 2 | `bad-moon-rising` | Bad Moon Rising | 黯月初升 | 官方基础版 | 死亡、保护、复活、额外死亡和复杂夜晚记录 | `done-12.2` |
| 3 | `sects-and-violets` | Sects & Violets | 梦殒春宵 | 官方基础版 | 毒醉、疯狂、信息混乱和复杂规则提醒 | `done-12.3` |
| 4 | `one-in-one-out` | ONE IN ONE OUT | One In One Out | TPI Recommended | 中高阶玩家局，身份流动和社交张力 | `done-12.6` |
| 5 | `a-grimm-chorus` | A GRIMM CHORUS | A Grimm Chorus | TPI Recommended | 复杂度适中，适合补充常玩社区板 | `done-12.7` |
| 6 | `hide-and-seek` | HIDE & SEEK | Hide & Seek | TPI Recommended | 伪装、身份错认、趣味性局势 | `done-12.8` |
| 7 | `lunar-eclipse` | LUNAR ECLIPSE | Lunar Eclipse | TPI Recommended | Lunatic、Zombuul、Lycanthrope 等复杂夜间提醒 | `done-12.9` |
| 8 | `punchy` | Punchy | Punchy | TPI Carousel Collection | 邪恶方主动性强，适合老玩家刺激局 | `done-12.12` |
| 9 | `quick-maths` | Quick Maths | Quick Maths | TPI Carousel Collection | Riot、提名压力和白天投票系统验证 | `done-12.13` |
| 10 | `devout-theists` | Devout Theists | Devout Theists | TPI Carousel Collection | Kazali、Legion、Lleech 等复杂恶魔机制 | `done-12.14` |

说明：

- Catfishing / 瓦釜雷鸣已经在项目里，不占本批 10 个名额。
- Teensyville 板子暂不纳入本批，因为当前主线是 7-15 人。
- Carousel Collection 是 TPI 官方页面发布的社区脚本集合，不等同官方基础版；必须保留作者、来源和知识状态。

## 3. 来源记录

当前已确认的来源入口：

- TPI Custom Scripts 页面：`https://bloodontheclocktower.com/pages/custom-scripts`
- The Carousel Script Collection：`https://docs.google.com/document/d/1U_OQJQXyp5p0yuRaqqd44zWwQYRjvrql9D-4xIogQK4/edit`
- 官方 Script Tool：`https://script.bloodontheclocktower.com/`

每个板子实际实现时，仍必须记录具体 JSON/PDF/夜序来源、作者、版本和内容 hash。不能只写“来自官网”。

## 4. 导入顺序

### 4.1 第一轮：官方基础三板

1. Trouble Brewing
2. Bad Moon Rising
3. Sects & Violets

原因：

- 角色规则来源最稳定。
- 能覆盖大部分基础状态：死亡、醉酒、中毒、疯狂、阵营/身份信息。
- 适合先把 `SmartScriptPack`、模板库、夜序和 AI 上下文跑稳。

### 4.2 第二轮：TPI Recommended 四板

4. ONE IN ONE OUT
5. A GRIMM CHORUS
6. HIDE & SEEK
7. LUNAR ECLIPSE

原因：

- 作为更贴近实际桌游体验的社区常玩板。
- 复杂度高于基础三板，但仍适合作为第一批扩展。
- 能测试“来源不是官方基础版，但被 TPI 推荐”的知识状态与 UI 标识。

### 4.3 第三轮：Carousel 三板

8. Punchy
9. Quick Maths
10. Devout Theists

原因：

- 包含较多实验角色和复杂恶魔。
- 适合在基础架构稳定后，再验证高复杂规则提示。
- 不应在前两轮未稳定前抢先做夜间建议。

## 5. 每个板子的标准目录

```text
src/domain/scripts/packs/<script-id>/
  index.ts
  roles.ts
  night-orders.ts
  setup-rules.ts
  setup-templates.ts
  acceptance.md
```

禁止出现：

- `all-scripts.ts` 巨型文件。
- `all-roles.ts` 混合所有板子的角色定义。
- 页面组件里按 `scriptId` 写大量分支。
- 同一个角色在多个板子目录重复定义不同事实。

如果多个板子复用同一角色，应优先复用稳定 `RoleId` 和共享角色事实，再由板子包声明“本板包含该角色”。

## 6. 单板实现验收门槛

每完成一个板子，必须满足：

- [ ] `source` 包含作者、版本、URL、contentHash。
- [ ] 角色清单完整。
- [ ] 所有角色有稳定英文 ID 和中文展示名。
- [ ] 所有角色阵营正确。
- [ ] 所有角色技能文本已核对。
- [ ] 首夜顺序已核对。
- [ ] 其他夜顺序已核对。
- [ ] setup 修正规则已核对。
- [ ] 高风险规则已标注。
- [ ] 至少 7、10、12、15 人有模板；最终目标是 7-15 人都有足够模板。
- [ ] 恶魔伪装不在场，且来源合理。
- [ ] `acceptance.md` 写清楚未确认项。
- [ ] `knowledgeStatus` 不可伪装成 confirmed。
- [ ] 测试通过。

## 7. 模板数量目标

首轮最低要求：

| 人数 | 每板最低模板数 | 理想模板数 |
|---:|---:|---:|
| 7 | 3 | 8-12 |
| 8 | 2 | 6-10 |
| 9 | 2 | 6-10 |
| 10 | 3 | 8-12 |
| 11 | 2 | 6-10 |
| 12 | 3 | 10-15 |
| 13 | 2 | 6-10 |
| 14 | 2 | 6-10 |
| 15 | 3 | 10-15 |

第一阶段可以先做到“关键人数可玩”，但不能把缺模板人数显示成已完成。

## 8. AI 配板使用方式

AI 只能做：

- 从 verified 模板里解释优缺点。
- 根据玩家经验提醒说书人。
- 提醒某些组合难主持或更刺激。
- 给模板排序或推荐。
- 给说书人写简短配板理由。

AI 不可以做：

- 绕过模板库直接生成未知合法性配板。
- 自动改身份。
- 自动发送身份。
- 自动进入夜晚。
- 把玩家历史评分用于未来配板。

## 9. 停止条件

出现以下情况必须停：

- 新增一个板子需要改 3 个以上 UI 页面。
- 角色技能文本被复制到 UI、AI、夜序、模板四处。
- 某个板子文件超过预算仍继续塞。
- 使用中文名作为主键。
- 未核对规则就标 `confirmed`。
- 为每个角色写特殊 if/else 自动结算。
- 真实 AI live 调用、费用、Key、VPS 写入被顺手带入。

## 10. 阶段拆分

| 阶段 | 状态 | 目标 | 验收 |
|---|---|---|---|
| 12.0 | Done | 建立本批导入计划、索引和停止条件 | 文档存在并被索引 |
| 12.1 | Done | Trouble Brewing 智能板子包 | pack + acceptance + tests |
| 12.2 | Done | Bad Moon Rising 智能板子包 | pack + acceptance + tests |
| 12.3 | Done | Sects & Violets 智能板子包 | pack + acceptance + tests |
| 12.4 | Done | 官方基础三板浏览器验收 | 用户确认 UI 可用 |
| 12.5 | Done | TPI Recommended 四板逐个接入计划细化 | `SCRIPT_IMPORT_TPI_RECOMMENDED_SOURCES.md` 已记录每板来源、hash、角色清单、缺失角色和导入风险 |
| 12.6 | Done | ONE IN ONE OUT | pack + acceptance + tests |
| 12.7 | Done | A GRIMM CHORUS | pack + acceptance + tests |
| 12.8 | Done | HIDE & SEEK | pack + acceptance + tests |
| 12.9 | Done | LUNAR ECLIPSE | pack + acceptance + tests |
| 12.10 | Done | 推荐四板浏览器验收 | 用户已明确放行，不再卡手动验收 |
| 12.11 | Done | Carousel 三板逐个接入计划细化 | `SCRIPT_IMPORT_CAROUSEL_SOURCES.md` 已创建 |
| 12.12 | Done | Punchy | pack + acceptance + tests |
| 12.13 | Done | Quick Maths | pack + acceptance + tests |
| 12.14 | Done | Devout Theists | pack + acceptance + tests |
| 12.15 | Done | 第一批 10 板总验收 | `SCRIPT_IMPORT_BATCH_01_CLOSURE_AUDIT.md` 已记录问题修正和测试证据 |
| 12.16 | Done | AI 推荐体验深化 | `AI_RECOMMENDATION_UX_12_16_CLOSURE_AUDIT.md` 已记录配板排序和夜间辅助判断优化 |
| 12.17 | Done | AI 缺项反馈深化 | `AI_RECOMMENDATION_UX_12_17_CLOSURE_AUDIT.md` 已记录夜间 AI 缺项卡片反馈 |

## 11. 当前下一步

官方基础三板已完成并通过浏览器验收；TPI Recommended 四板来源细化与单板 pack 已完成；推荐四板验收已由用户放行；Carousel 三板来源细化与三板单板 pack 均已完成。  
当前 `12.15 第一批 10 板总验收`、`12.16 AI 推荐体验深化` 和 `12.17 AI 缺项反馈深化` 已完成。下一步需要单独选择：进入第二批板子导入、继续 AI 体验深化，或转向其他 P0。


