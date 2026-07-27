# 第二批智能板子导入计划

状态：**进行中 / 12.27 已接入 Everyone Can Play / 12.29 已接入 Uncertain Death / 12.31 已接入 Church of Spies / 12.33 已接入 Insanity and Intuition**。  
日期：2026-07-21。  
适用范围：第一批 10 板收口之后，继续逐个接入更多 7-15 人可用智能板子。  
不适用范围：玩家端、官方魔典同步器、自动技能结算、数据库/ORM、真实 AI 无人调用。

## 1. 本批原则

第二批不追求一次塞满 10 个板子。

正确做法：

```text
锁定来源
-> 下载/归档 JSON 或 Script Tool 内容
-> 计算 hash
-> 角色事实复用或补齐
-> 夜序过滤
-> setup 规则
-> 7-15 人模板
-> registry 接入
-> 测试
-> acceptance
```

如果来源没有固定版本或无法下载 JSON，只进入候选池，不进入开局列表。

## 2. 当前已锁定板子

| 顺序 | scriptId | 展示名 | 作者 | 来源 | 状态 |
|---:|---|---|---|---|---|
| 1 | `everyone-can-play` | Everyone Can Play | Ben Burns | BotC Scripts 1.0.2 JSON | `done-12.27` |
| 2 | `uncertain-death` | Uncertain Death | Ekin | BotC Scripts 1.0.1 JSON | `done-12.29` |
| 3 | `church-of-spies` | Church of Spies | Andrew Nathenson | BotC Scripts 1.0.0 JSON | `done-12.31` |

## 3. 候选池策略

后续候选优先满足：

- 7-15 人完整脚本，不做 Teensyville。
- 角色复用率高，先减少新增规则风险。
- 来源能下载 JSON、Script Tool 链接或作者公开版本。
- 高风险角色已经在 `role-research/` 或 `complexRoleKnowledge.ts` 中有摘要。
- 每个板子单独闭环，不横向铺开 10 个半成品。

## 4. 12.27 Everyone Can Play 完成情况

- 已锁定 JSON：`https://botcscripts.com/script/1945/1.0.2/download`
- 已计算 hash：`acf6387ace9760b6eb07ac083aba61e12215973253cf55f2510fcb9e26e0880c`
- 已建立 `src/domain/scripts/packs/everyone-can-play/`。
- 已复用官方基础三板已确认角色事实，避免复制第二份角色技能。
- 已按官方 `nightsheet.json` 过滤首夜和其他夜顺序。
- 已建立 22 套 7-15 人 verified 模板。
- 已接入 registry 和质量门。

## 5. 12.28 Uncertain Death 来源锁定

- 已锁定 JSON：`https://www.botcscripts.com/script/68/1.0.1/download`
- 已计算 hash：`05d854f75fb7ea6821b111368ad2c9d55ee5b736cc44578eea1bb84e8b0d6e2c`
- 已记录角色清单、官方夜序过滤结果、导入风险和 12.29 导入门槛。
- 详见 `SCRIPT_IMPORT_BATCH_02_SOURCES.md`。

## 6. 12.29 Uncertain Death 完成情况

- 已建立 `src/domain/scripts/packs/uncertain-death/`。
- 已复用官方基础三板和已接入 pack 的角色事实，避免复制第二份技能库。
- 已按官方 `nightsheet.json` 过滤首夜和其他夜顺序。
- 已建立 8 条 setup/高风险规则。
- 已建立 22 套 7-15 人 verified 模板。
- 已接入 registry、composition 测试和统一质量门。
- Pack 保持 `needs-review`，等待实桌 spot-check。

## 7. 12.30 Church of Spies 来源锁定

- 已锁定 JSON：`https://www.botcscripts.com/script/2378/1.0.0/download`
- 已计算 hash：`dd5fea53947a5818eacc406e2fc09b3595815b3588567d7cc1b4d541acbe837d`
- 已记录作者、角色清单、官方夜序过滤结果、当前缺口和导入风险。
- 详见 `SCRIPT_IMPORT_BATCH_02_SOURCES.md`。

## 8. 12.31 Church of Spies 完成情况

- 已建立 `src/domain/scripts/packs/church-of-spies/`。
- 已复用现有角色事实，并为 `cultleader` 补齐单一角色事实。
- 已按官方 `nightsheet.json` 过滤首夜和其他夜顺序。
- 已建立 10 条 setup/高风险规则。
- 已建立 22 套 7-15 人 verified 模板。
- 已接入 registry、composition 测试和统一质量门。
- Pack 保持 `needs-review`，等待实桌 spot-check。

## 9. 12.32 Insanity and Intuition 来源锁定

- 已锁定 JSON：`https://www.botcscripts.com/script/2128/1.2.0/download`
- 已计算 hash：`227279b78329fb27c3b2690503a0dc929f3db34073b8db8bb5b2b0005b63f399`
- 已记录作者、角色清单、官方夜序过滤结果、当前缺口和导入风险。
- 详见 `SCRIPT_IMPORT_BATCH_02_SOURCES.md`。

## 10. 12.33 Insanity and Intuition 完成情况

- 已建立 `src/domain/scripts/packs/insanity-and-intuition/`。
- 已复用现有角色事实，并为 `poppygrower`、`plaguedoctor`、`boomdandy` 补齐本 pack 本地事实。
- 已按官方 `nightsheet.json` 过滤首夜和其他夜顺序。
- 已建立 10 条 setup/高风险规则。
- 已建立 22 套 7-15 人 verified 模板。
- 已接入 registry、composition 测试和统一质量门。
- Pack 保持 `needs-review`，等待实桌 spot-check。

## 11. 停止条件

必须停止的情况：

- 新候选无法固定来源或 hash。
- 需要为角色写页面级 `if roleId === ...` 自动结算。
- 一个新增板子导致 UI 页面新增第二套状态或第二套夜序。
- 为了追求数量，把未确认规则标为 confirmed。
- 需要真实 AI Key、VPS 写入或远端部署授权。

## 12. 验收命令

```powershell
npx vitest run src/domain/scripts/packs/everyone-can-play/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/batch01Acceptance.test.ts
npx vitest run src/domain/scripts/packs/uncertain-death/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts
npx vitest run src/domain/scripts/packs/insanity-and-intuition/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts
npm run check
```
