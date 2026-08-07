# 设计文档被截断段落的恢复原文

> **为什么有这份文件**
>
> `DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md` 是由
> `data/wiki-ground-truth/compare/dualmode-design.json`（多路评审的结构化中间产物）汇编而成的。
> 汇编时对长字段做了硬截断：表格单元格约 190 字符、类型定义约 1100 字符即断。
> 结果是主文档里有 **33 处**正文半途而止，合计约 4678 个字符从未出现在任何 .md 里。
>
> 危险之处在于**看不出来**：断点全都落在一句话中间，读起来只像是作者话没说完。
> 已实际发生的后果包括——`GrimoireOp` 在主文档里少了 4 个变体与收尾说明；
> 夜态 core 的 CurrentWakeCard 拆分方案只剩「留在抽屉 hal」；
> 14 条落点表的 `why` 与 `conflictRisk` 两列**整列丢失**。
>
> 本文件逐字恢复全部 33 处，未做任何改写。**与主文档不一致处一律以本文件为准。**
> 落点表另有一份按条目整理的完整版：[GRIMOIRE_FOLDED_FEATURES_FULL.md](GRIMOIRE_FOLDED_FEATURES_FULL.md)。
>
> 恢复日期：2026-08-06。

## 清单

| # | 位置 | 主文档保留 | 原文 | 丢失 |
| --- | --- | ---: | ---: | ---: |
| 1 | `.boundary.findings[17].recommendation` | 700 | 1465 | **765** |
| 2 | `.model.entities[0].tsShape` | 1100 | 1485 | **385** |
| 3 | `.review.topRisks[0].mitigation` | 280 | 618 | **338** |
| 4 | `.boundary.findings[6].recommendation` | 700 | 1008 | **308** |
| 5 | `.reverse.findings[7].detail` | 1300 | 1585 | **285** |
| 6 | `.ux.foldedFeatures[0].grimoireForm` | 190 | 426 | **236** |
| 7 | `.modeSwitch.findings[7].recommendation` | 400 | 625 | **225** |
| 8 | `.model.risks[1]` | 87 | 272 | **185** |
| 9 | `.ux.foldedFeatures[1].grimoireForm` | 190 | 366 | **176** |
| 10 | `.model.entities[7].tsShape` | 1101 | 1259 | **158** |
| 11 | `.ux.foldedFeatures[13].grimoireForm` | 190 | 331 | **141** |
| 12 | `.modeSwitch.findings[4].recommendation` | 400 | 540 | **140** |
| 13 | `.review.topRisks[8].mitigation` | 280 | 415 | **135** |
| 14 | `.review.topRisks[2].mitigation` | 280 | 410 | **130** |
| 15 | `.model.entities[1].tsShape` | 1100 | 1219 | **119** |
| 16 | `.ux.foldedFeatures[2].grimoireForm` | 190 | 298 | **108** |
| 17 | `.ux.foldedFeatures[6].grimoireForm` | 190 | 291 | **101** |
| 18 | `.ux.foldedFeatures[11].grimoireForm` | 190 | 283 | **93** |
| 19 | `.ux.foldedFeatures[8].grimoireForm` | 190 | 277 | **87** |
| 20 | `.ux.foldedFeatures[12].grimoireForm` | 190 | 260 | **70** |
| 21 | `.ux.foldedFeatures[10].grimoireForm` | 190 | 258 | **68** |
| 22 | `.ux.foldedFeatures[5].grimoireForm` | 190 | 251 | **61** |
| 23 | `.model.entities[6].tsShape` | 1100 | 1157 | **57** |
| 24 | `.review.topRisks[8].risk` | 170 | 226 | **56** |
| 25 | `.ux.foldedFeatures[3].grimoireForm` | 190 | 240 | **50** |
| 26 | `.model.entities[7].migration` | 280 | 323 | **43** |
| 27 | `.review.topRisks[5].mitigation` | 280 | 319 | **39** |
| 28 | `.review.contradictions[2].between` | 200 | 237 | **37** |
| 29 | `.review.contradictions[1].between` | 200 | 235 | **35** |
| 30 | `.ux.foldedFeatures[4].grimoireForm` | 190 | 207 | **17** |
| 31 | `.review.contradictions[4].between` | 200 | 217 | **17** |
| 32 | `.boundary.findings[8].recommendation` | 700 | 708 | **8** |
| 33 | `.modeSwitch.findings[3].recommendation` | 400 | 405 | **5** |

---

## 1. `.boundary.findings[17].recommendation`

主文档在第 700 个字符处断开，此后 765 字符缺失。

**断点前文**（用来在主文档里定位）：

> …ht`/`onDeath`/`resolve`/`trigger`。
5. **禁止自动推进**：src/features/grimoire

**完整原文**：

```text
建议按优先级加入 scripts/verify-architecture.mjs：

**P0（最高价值，纯依赖方向检查，零误报）**
1. **AI 不得直连权威状态**：session / grimoire 的 reducer 与 state 目录下的任何文件，禁止 import `services/ai` 或 `features/ai-*` 下的任何模块。违反即 fail。这一条把 AI_AUTHORITY_BOUNDARY 的核心变成了编译期可查的事实。
2. **角色包必须是纯数据**：src/domain/scripts/packs/** 与 src/domain/role-knowledge/** 禁止 import `GameSessionState`、`features/game-session/**` 的任何类型，禁止出现 `=> GameSessionState` 返回签名。违反即 fail。这一条防住「能力可执行化」。
3. **单一持久化真值**：全仓 localStorage key 常量集中在白名单文件内声明，魔典模式不得新增独立 session key（快照 key 需显式登记）。

**P1（形状检查）**
4. **标记不得携带效果**：魔典 token / reminder 的类型定义文件中，禁止出现字段名 `effect`/`effects`/`appliesTo`/`modifies`/`onNight`/`onDeath`/`resolve`/`trigger`。
5. **禁止自动推进**：src/features/grimoire/** 与 src/features/hosting-deck/** 中禁止 `setTimeout`/`setInterval` 与 dispatch 出现在同一文件（计时器 feature 目录白名单豁免）。
6. **禁止胜负判定**：全 src 禁止标识符 `computeWinner`/`checkVictory`/`evaluateWinCondition`/`isGameOver`，并禁止 UI 文案常量中出现「获胜/胜利条件已达成」类字符串（说书人手动选定胜方后的回执除外，走白名单）。

**P2（扩展现有符号检查）**
7. **扩充禁用符号表**（同时扩到 server/）：在现有 4 个之外追加 `GrimoireEngine|RuleEngine|autoResolve|applyAbility|resolveAbility|autoAdvancePhase|autoKill|cascadeEffect|simulateNight`。
8. **禁止联机**：全 src 禁止 `WebSocket|EventSource|BroadcastChannel|socket\.io|peerjs`（单实例锁若需 BroadcastChannel，走显式白名单文件 + 注释说明）。
9. **两模式解耦**：src/features/hosting-deck/**（纯记录模式）禁止 import src/features/grimoire/** 的任何模块，保证关闭魔典模式后纯记录路径完整可用。

另建议配套加一条 e2e（不属于本脚本）：以纯记录模式跑完「配板 → 首夜 → 白天投票 → 次夜 → 归档」，作为 npm run check 的一部分，防止魔典模式上线后纯记录模式静默腐化。
```


---

## 2. `.model.entities[0].tsShape`

主文档在第 1100 个字符处断开，此后 385 字符缺失。

**断点前文**（用来在主文档里定位）：

> …valHintText?: string
  note?: string
}

/** 剧本知识包中的标记目录条目：来自百科各角色「提示标记

**完整原文**：

```text
// src/features/night-workbench/types.ts（就地放宽，不新建并行类型）
export type ReminderSemantics =
  | 'impairment'        // 中毒/醉酒来源
  | 'protection'
  | 'identity_overlay'  // 是酒鬼 / 是提线木偶 / 是疯子
  | 'selection'         // 疯子的「被选择」
  | 'information'       // 干扰项 / 已给信息
  | 'death'             // 帷幕
  | 'once_per_game'     // 能力已使用
  | 'custom'

/**
 * 提示标记 = 说书人记忆的物理载体。
 * 模型只描述「这枚标记现在在谁身上、谁放的、当时是几夜」，
 * 绝不描述「到了什么时候它会自己消失」。移除永远是说书人的一次手动操作。
 */
export interface ReminderToken extends ManualStatusMarker {
  id: string
  label: string
  /** 来源角色；可以是不在场角色（如伪装/男爵）。缺省 = 说书人自定义便签。 */
  sourceRoleId?: string
  /** 放置这枚标记的能力属于哪个座位；null = 不属于任何座位（如配板阶段的「是酒鬼」）。 */
  sourceSeatId?: number | null
  /** 指向剧本知识包目录条目；自定义标记为 undefined。 */
  definitionId?: string
  semantics?: ReminderSemantics
  /** 放置时所处昼夜段与时刻，用于回看「它是第几夜放上去的」。 */
  placedInSegmentId?: string | null
  placedAt?: string
  /**
   * 倒转放置。《重要细节》三.3：可用倒转表示「这枚标记暂时不生效」（放置者中毒/醉酒时）。
   * 缺省 false。翻面与翻回都由说书人手动完成，系统不因任何状态自动翻面。
   */
  inverted?: boolean
  /** 目录里的「移除时机」原文，纯提示文本。 */
  removalHintText?: string
  note?: string
}

/** 剧本知识包中的标记目录条目：来自百科各角色「提示标记」小节，是文本事实，不是可执行规则。 */
export interface ReminderTokenDefinition {
  id: string
  roleId: string
  label: string
  count: number
  placementTiming: string     // 「在为首个夜晚做准备时放置」
  placementCondition: string  // 「在一个镇民角色标记旁放置」
  removalTiming: string       // 「酒鬼离场时」/「在黎明时」
  semantics: ReminderSemantics
  knowledgeVersion: string
  source: string              // wiki 页名 + contentHash
}
```


---

## 3. `.review.topRisks[0].mitigation`

主文档在第 280 个字符处断开，此后 338 字符缺失。

**断点前文**（用来在主文档里定位）：

> …te-change 的 action 断言 projectCurrentPlayerStates 前后深等；④ 静态检查把越界变成依赖方向问

**完整原文**：

```text
把判据写死并转成可测试形式，而不是靠文档自觉：① 「一次手势等于恰好一条 player_state_changed，ops 长度恒为 1，系统不得因一条 op 派生第二条 op」写进 dev-docs/HOSTING_MODE_BOUNDARY.md 首句；② 不变量测试 A：after/before 的差异字段集必须是 ops[0] 名字的字面子集；③ 不变量测试 B：对每个非 confirm-player-state-change 的 action 断言 projectCurrentPlayerStates 前后深等；④ 静态检查把越界变成依赖方向问题——reducer/state 禁止 import services/ai、role-knowledge 与 packs 禁止 import GameSessionState、标记类型禁止出现 effect/appliesTo/modifies/onNight/onDeath/resolve/trigger 字段名、禁止 computeWinner/checkVictory/isGameOver/recomputeOnTheBlock、grimoire 目录内 setTimeout 与 dispatch 不得同文件；⑤ semantics 这类分类字段只允许被展示模块读取，禁止任何状态写入分支依赖它（因为「protection 到期自动清」正是最像人话的那条越界）。
```


---

## 4. `.boundary.findings[6].recommendation`

主文档在第 700 个字符处断开，此后 308 字符缺失。

**断点前文**（用来在主文档里定位）：

> …能是贴纸：一个 seatId + 一段文本 + 一个来源角色，仅此而已。
5. **能力可执行化**：角色知识从数据变成函数，出现 `app

**完整原文**：

```text
在 ABILITY_SETTLEMENT_BOUNDARY.md 新增「魔典模式的越界判别」章节，列出以下 6 条「出现即越界」的实现特征（可在 code review 和自动检查中逐条对照）：
1. **级联写入**：一个 reducer case 在处理某个 action 时修改了它名字之外的状态。例：`add-reminder` 同时改了 `alive`。判据——每个 case 的 diff 字段集必须是该 action 名字的字面子集。
2. **派生值入库**：把渲染层算出来的结论写回 session。存活数、票数门槛、是否达到多数、恶魔是否已死都可以显示，但一旦出现在 dispatch 的 payload 里就是越界。判据——`majority`、`aliveCount`、`isDemonDead` 这类计算值只能进 render，不能进 action。
3. **定时/副作用推进**：任何 setTimeout / setInterval / useEffect 触发的状态写入。白天计时器是唯一豁免，且它不写日志、不改状态（PRODUCT_VISION:18 已有此约束）。
4. **标记即效果**：提示标记（reminder token）的数据结构里出现 `effect` / `appliesTo` / `modifies` / `onNight` / `resolve` 之类字段，或放置标记会改变任何其它座位的字段。标记只能是贴纸：一个 seatId + 一段文本 + 一个来源角色，仅此而已。
5. **能力可执行化**：角色知识从数据变成函数，出现 `apply(state) => state`、`resolveAbility()`、`AbilityHandler` 这类签名。角色包必须保持纯数据（文本、目标数、提示清单、标记建议）。
6. **拖拽/点击隐含结算**：把角色 Token 拖到另一个座位就自动完成换身份 + 记录 + 阵营变更。换身份必须仍走既有的 IdentityChanged 事件与确认流程（ABILITY_SETTLEMENT_BOUNDARY:79-86）。

另补一条正向澄清（作者的调和点，要写进文档）：「电子魔典是说书人直接操作状态的界面，不是规则引擎。它与『不自动结算』不冲突，因为它不减少说书人的任何一次决策，只减少他的一次抄写。」
```


---

## 5. `.reverse.findings[7].detail`

主文档在第 1300 个字符处断开，此后 285 字符缺失。

**断点前文**（用来在主文档里定位）：

> …{playerId} 供命中检测。
5) 叶片装饰：.left-leaf（首夜行动，left-leaf.webp）、.right-leaf（

**完整原文**：

```text
外层 .grimoire-token-wrapper.position-relative.d-inline-block.rounded-circle，内联 --size / width / height。自内向外：
1) 底图：.token（background-image: url(cdn/images/token.webp); background-position:center; background-size:110%; box-shadow:2px 2px 10px #000; z-index:2）。
2) 内容层：.role-details-layer（absolute inset:0，flex 居中）+ .token-flex-container（absolute，纵向 flex，pointer-events:none，z-index:1）；里面依次是 .left-shaper/.right-shaper（float + shape-outside:polygon 做梯形绕排，width:18%，height:calc(var(--size)*.14)）、.ability-text（font-size:calc(var(--size)*.052)，max-height:calc(var(--size)*.45)，隐藏时 .hidden-ability 把 max-height 收成 0）、角色图 img.icon-flex（max-height:calc(var(--size)*.65)，.full-size 时 .8；Evil/Good + .flipped 用 --blue-to-red / --red-to-blue 两个 hue-rotate 滤镜做阵营变色）。
3) 角色名：一个 <svg class="name-svg" viewBox="0 0 140 140">，内含 <path id="curve" d="M 8,95 A 70,70 0 0,0 128,95"/> + <textPath href="#curve" startOffset="50%" text-anchor="middle">，字体 Sorts Mill Goudy，fill:#000 —— 弧形刻名就是靠这条 SVG path，不是 CSS。
4) 座位号/玩家名：.floating-name-label（absolute，top:98%，z-index:10；.name-above 变体改成 bottom:98%），内含 .name-badge（badge rounded-pill text-bg-light），里面 .player-number（奇数 #B8860B 金、偶数 #6F2DA8 紫）+ 名字 + .pronouns-text（opacity .7，0.8em）。带 data-name-badge={playerId} 供命中检测。
5) 叶片装饰：.left-leaf（首夜行动，left-leaf.webp）、.right-leaf（其他夜行动）、.top-leaves（src = top-{min(reminderTokenCount,5)}.webp，表示该角色有几个提醒标记）、.setup-leaf（setup 类角色，/static/images/setup.webp），全部 width:calc(var(--size)*.8)。
6) 空座位是另一个组件：.token.empty-seat 里放 .chair-wrap > i.fa-chair（font-size:calc(var(--size)*.36)，色 #4a3520）+ .seat-number / .seat-name。
```


---

## 6. `.ux.foldedFeatures[0].grimoireForm`

主文档在第 190 个字符处断开，此后 236 字符缺失。

**断点前文**（用来在主文档里定位）：

> …的 ‹ › 按钮，空间定位交给环，转盘不再占一屏。CurrentWakeCard 拆两半：能力说明与「今天发生了什么」事实条留在抽屉 hal

**完整原文**：

```text
环变成夜序的空间光标：当前项座位是全屏唯一暖金焦点环，后续两项打 ①② 冷灰角标，已确认项打 ✓，已暂缓项打「缓」。250px 转盘降级进 core —— 双 RoleDisc small(58px)「当前 / 下一位」+ 两侧带座位号标签的 ‹ › 按钮，空间定位交给环，转盘不再占一屏。CurrentWakeCard 拆两半：能力说明与「今天发生了什么」事实条留在抽屉 half 档顶部（两行以内），目标选择直接点环上座位、抽屉里只留一行「已选：5号 ✕」回显 + 一个折叠的 SeatButton 号码网格作键盘/屏读/上半弧不可达时的 fallback；角色 chip 与结果按钮仍在抽屉，底栏仍是「确认后：停留 ⇄ 下一位」+ 唯一主动作「确认本项」。夜序清单（本局/官方两段、首夜/其他夜）走 core 底行「夜序 3/12」pill → 抽屉 full 渲染现有 NightQueueSheet。「结束本夜」移出页面，挂轨道右端「收尾」。
```


---

## 7. `.modeSwitch.findings[7].recommendation`

主文档在第 400 个字符处断开，此后 225 字符缺失。

**断点前文**（用来在主文档里定位）：

> …（按 timeline 事后重建魔典），但顶部常驻一条冷色条：「这局用笔录模式主持，魔典是事后按记录重建的。座位上的空白表示当时没有录入，不

**完整原文**：

```text
归档记录加三个字段（配合 localArchiveAdapter 的 1→2 迁移，旧归档补 `hostingMode: 'record'`）：`hostingMode`、`hostingModeHistory`、以及 `grimoireCompleteness: { seatsWithRole: number; totalSeats: number; stateChangeCount: number; markerCount: number }`。

归档列表卡片上用一枚小标签区分「魔典局」「笔录局」「混合（第3夜起开魔典）」。

跨模式回看放开，但规则不对称：
· 用纯记录视图看魔典局 —— 永远安全，无提示。
· 用魔典视图看纯记录局 —— 允许（按 timeline 事后重建魔典），但顶部常驻一条冷色条：「这局用笔录模式主持，魔典是事后按记录重建的。座位上的空白表示当时没有录入，不表示当时没有状态。」
· 归档一律只读：回看时的魔典禁止任何写入交互，不提供「补录」入口。补录只能在进行中的对局里做——这是防止事后篡改战绩的硬边界，要在组件层用 `readOnly` prop 强制，不靠自觉。

同时顺手修 `GameArchiveSummary.alive/dead` 在纯记录局里的误导：completeness.stateChangeCount 为 0 时，摘要处显示「存活/死亡未录入」而不是「存活 12 / 死亡 0」。
```


---

## 8. `.model.risks[1]`

主文档在第 87 个字符处断开，此后 185 字符缺失。

**断点前文**（用来在主文档里定位）：

> …er.ts` 的 `samePlayerState()` 只比较 life/poisoned/drunk/markers(id+label)

**完整原文**：

```text
`playerStateReducer.ts` 的 `samePlayerState()` 只比较 life/poisoned/drunk/markers(id+label)：一次只改 identity.alignment 或 madness 的魔典操作会被判为「与 before 相同」而被整条拒绝，表现为「点了没反应」——这是最容易在牌桌上丢记录的一处。同文件 `clonePlayerState()` 是浅拷贝，新增的 identity/madness/traveller 会在多条事件间共享引用，一处后续 mutate 会污染历史快照。
```


---

## 9. `.ux.foldedFeatures[1].grimoireForm`

主文档在第 190 个字符处断开，此后 176 字符缺失。

**断点前文**（用来在主文档里定位）：

> …下出现 ✋ + 「举」+ 计数序号；死亡座位举手后在其卫星位长出一枚 44px 的「死亡票」二次确认 chip（取代 26px 药丸，且不再

**完整原文**：

```text
提名：环上提名人 token 出现暖金实心起点三角、被提名人出现终点三角，两者之间画一条 1px 冷青弧（唯一一处连线，只表达「这一次提名」）；选人 = 点环，落到抽屉分段当前指向的槽。举手：进入计票子态后每个 token 变成打卡键，点一下出现 ✋ + 「举」+ 计数序号；死亡座位举手后在其卫星位长出一枚 44px 的「死亡票」二次确认 chip（取代 26px 药丸，且不再把整行推下去）。core 实时显示 举手N / 门槛M / 差X，三档色 + 三档文字。可选「顺时针唱票指针」：从被提名者起的一枚高亮点，说书人每点一次前进一位，纯视觉节拍器。暂列 / 处决 / 无处决走抽屉的单列步骤序列（讨论→提名→举手→暂列→处决），一次只展开一步，其余折成 44px 摘要条；处决落账后该座位在环上加帷幕 + 「本日处决」角标。
```


---

## 10. `.model.entities[7].tsShape`

主文档在第 1101 个字符处断开，此后 158 字符缺失。

**断点前文**（用来在主文档里定位）：

> … | SetupChangedEntry
  | PlayerStateChangedEntry
  | NightActionEntry


**完整原文**：

```text
export interface PlayerStateChangedEntry extends TimelineBase {
  kind: 'player_state_changed'
  seatId: number
  before: PlayerState
  after: PlayerState
  reason: string
  /** 本次改动的原子意图；旧归档缺省。 */
  ops?: GrimoireOp[]
  /** 操作从哪个界面发起。缺省 'player_panel'（旧数据来源）。 */
  origin?: 'player_panel' | 'grimoire' | 'night_workbench' | 'day_workbench' | 'handoff'
  /**
   * 同一次手势波及多个座位时（如「限」同时让两人中毒，百科明确「同时进入，不分先后」），
   * 按座位各写一条，用同一个 batchId 串起来，便于一起展示与一起更正。
   */
  batchId?: string
  /** 关联的夜间唤醒项，把「标记」与「是谁的能力放的」绑起来。 */
  contextRef?: { nightRunId: string; wakeItemId: string } | null
  /** 本次改动由采纳 AI 建议产生时填写；未采纳/手动操作时不填。 */
  fromAdvice?: AIAdviceReference
}

export interface RegistrationRulingEntry extends TimelineBase {
  kind: 'registration_ruling'
  ruling: RegistrationRuling
}

export interface MadnessRulingEntry extends TimelineBase {
  kind: 'madness_ruling'
  ruling: MadnessRuling
}

/** 指令类（下达/解除疯狂要求）不单独建 kind：它改变 PlayerState.madness，走 player_state_changed + ops。 */

export type TimelineEntry =
  | SetupConfirmedEntry
  | SetupChangedEntry
  | PlayerStateChangedEntry
  | NightActionEntry
  | DayActionEntry
  | VoteRoundEntry
  | ExecutionEntry
  | ExileEntry               // 新
  | RegistrationRulingEntry  // 新
  | MadnessRulingEntry       // 新
```


---

## 11. `.ux.foldedFeatures[13].grimoireForm`

主文档在第 190 个字符处断开，此后 141 字符缺失。

**断点前文**（用来在主文档里定位）：

> …、毒醉、具名标记、领取/夜序角标——这些都是玩家看到也无所谓、而说书人最常需要的量。L2 魔典视图：显角色图标与名称，需长按遮蔽键 600m

**完整原文**：

```text
升为三级并成为魔典模式的默认设计前提。L0 全遮蔽：不透明幕盖住整块画布与抽屉，秘密内容不进 DOM，恢复需单指点大按钮。L1 席位视图（默认）：token 用 RoleDisc 现有的 concealed「隐」态，只显示座位号、昵称、生死、毒醉、具名标记、领取/夜序角标——这些都是玩家看到也无所谓、而说书人最常需要的量。L2 魔典视图：显角色图标与名称，需长按遮蔽键 600ms 或点+确认两段进入，90 秒无操作自动落回 L1，画布顶部常驻冷青条「魔典已揭示 · 剩余 62s」。另有 L1.5 单座位揭示：座位卡里只露这一位。触发路径：轨道右端 44px 遮蔽键（可见入口）+ 画布任意处双指点（盲操作路径）；进入发身份、投屏、展示信息时强制降级并锁定。
```


---

## 12. `.modeSwitch.findings[4].recommendation`

主文档在第 400 个字符处断开，此后 140 字符缺失。

**断点前文**（用来在主文档里定位）：

> …[跳过]」
· AI `stateChangeDrafts` 历史 → 只作为最低优先级提示，且必须标「这是 AI 当时的草稿，不是记录」


**完整原文**：

```text
切换后立即渲染魔典（不等补录），顶部挂一条可关闭的 completeness 条，文案带具体数字而不是笼统提示：「魔典已按配板生成 · 12 个座位身份齐全 · 生死毒醉标记还没录过 —— 从第 1 夜到现在有 9 条记录可能涉及状态变化」，两个按钮「逐条核对（约 1 分钟）」「先这样，边走边补」，右侧「不再提示」。

「逐条核对」是一串可跳过的建议卡，每张一条，来源必须显式标注：
· `execution` 条目 → 「第 2 天处决了 7 号 · 建议标记为死亡 [标记] [跳过]」
· night_action 里 outcome 语义含死亡/中毒的 → 「第 3 夜 · 记录 #xx 提到 3 号被恶魔选中 · 建议给 3 号加死亡 [标记] [跳过]」
· AI `stateChangeDrafts` 历史 → 只作为最低优先级提示，且必须标「这是 AI 当时的草稿，不是记录」
每次「标记」= 一次正常的 `confirm-player-state-change` dispatch，reason 自动填「魔典补录 · 依据 {phaseLabel} 记录 {entryId}」。任何一张都能跳过，跳完不影响使用。绝不允许「全部应用」按钮——那就是自动结算。
```


---

## 13. `.review.topRisks[8].mitigation`

主文档在第 280 个字符处断开，此后 135 字符缺失。

**断点前文**（用来在主文档里定位）：

> … 字段完整性、仓库内不得出现 botc.games 与 cdn.botc.games 的 URL；⑤ source-manifest 的 k

**完整原文**：

```text
① 自绘资产数归零，全部用 CSS 加 lucide 图标实现；② PUBLIC_RELEASE_BOUNDARY 补一条禁止以截图、录屏、切图、临摹从官方应用或官方网页提取界面元素；③ 去混淆脚本、bundle 片段、偏移量注释一律留在 scratchpad 不进 Git，留档只留散文化公式与自写实现；④ audit:public 新增三条检查：data:image 超 2KB 报错、source-manifest 字段完整性、仓库内不得出现 botc.games 与 cdn.botc.games 的 URL；⑤ source-manifest 的 kind 增加 self-made；⑥ Community Created Content 标识与非官方工具声明在魔典模式下改为常驻（魔典是最容易被截图外传的界面，标识必须跟着截图走）；⑦ 缺素材时魔典必须以中文名文字 Token 完整可用——既是可用性也是许可上的保险。
```


---

## 14. `.review.topRisks[2].mitigation`

主文档在第 280 个字符处断开，此后 130 字符缺失。

**断点前文**（用来在主文档里定位）：

> … 0、新增 PlayerState 字段为 0，身份附加层/旅行者流放/登记裁定/疯狂全部推 G4 并允许永不做；④ 自绘资产数为 0，裹尸

**完整原文**：

```text
四把刀砍到最小可用：① 布局只做一个椭圆 + 四档离散 startOffset，不做注册表、不做 160→20 贪心求解（改四档离散尺寸 + pitch 碰撞降档），单这一刀省掉魔典几何部分的一半；② 语义状态一律不拖拽（UX 已论证：暗光下落点不可预览、单手够不到上半弧、误放是静默成功），因此不实现拖拽层、不实现托盘的 8px 死区与跟手幽灵、不实现就近归属判定；③ G1/G2 新增 timeline kind 为 0、新增 PlayerState 字段为 0，身份附加层/旅行者流放/登记裁定/疯狂全部推 G4 并允许永不做；④ 自绘资产数为 0，裹尸布、状态环、标记底盘全部用 CSS 加现有 lucide 图标实现。另加两条硬闸：features/grimoire 沿用 320 行预算不放宽（撞了就拆组件，不改脚本）；每批结束都必须是可独立上线、纯记录 e2e 仍绿的状态，任何一批之后停工都不产生半成品。
```


---

## 15. `.model.entities[1].tsShape`

主文档在第 1100 个字符处断开，此后 119 字符缺失。

**断点前文**（用来在主文档里定位）：

> …apshot | null
  alignment: Alignment | null        // null = 知识包缺角色阵营，

**完整原文**：

```text
export type Alignment = 'good' | 'evil'
export type RoleType = 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveller' | 'fabled'

/**
 * 身份「附加层」。真实角色仍然唯一地由 SetupAssignment.role + setup_changed 事件决定，
 * 这里刻意不放 actualRole，避免出现两个权威。
 */
export interface SeatIdentityOverlay {
  /**
   * 玩家以为自己是的角色（酒鬼/提线木偶/疯子/失忆者/食人族）。
   * undefined = 认知与真实角色一致（旧归档缺省语义）。
   */
  perceivedRole?: RoleSnapshot | null
  /** 玩家自认阵营；疯子以为自己邪恶、提线木偶以为自己善良。undefined = 与 alignment 一致。 */
  perceivedAlignment?: Alignment | null
  /** 为什么会有两张牌，自由文本，仅供回看。 */
  perceptionNote?: string
  /**
   * 当前阵营。《重要细节》三.2：阵营与角色互相独立。
   * undefined = 未单独记录，按配板确认时该角色的初始阵营解读（见 migration）。
   */
  alignment?: Alignment
  /** 阵营与角色初始阵营不符时，魔典上表现为角色标记倒转放置。 */
  alignmentInverted?: boolean
  /**
   * 角色类型覆盖。默认取知识包里 actualRole 的类型；
   * 仅当说书人明确判定时才写（如酒鬼实际是外来者却拿着镇民标记）。
   */
  roleTypeOverride?: RoleType | null
}

/** 只读投影：给魔典圆环渲染的一摞牌。由 projectors 合成，不落库。 */
export interface SeatIdentityView {
  seatId: number
  actualRole: RoleSnapshot | null
  perceivedRole: RoleSnapshot | null
  alignment: Alignment | null        // null = 知识包缺角色阵营，界面显示「未记录」而不是猜
  alignmentInverted: boolean
  roleType: RoleType | null
  overlaySource: 'setup' | 'timeline' | 'none'
}
```


---

## 16. `.ux.foldedFeatures[2].grimoireForm`

主文档在第 190 个字符处断开，此后 108 字符缺失。

**断点前文**（用来在主文档里定位）：

> …升到一条「确认 5号 状态」的单动作条（死亡时为 danger 色），点了才 dispatch。「记入哪个段」的下拉保留在这条确认条上，默认

**完整原文**：

```text
长按座位（或 idle 单击）→ SeatActionBar 锚定浮层，3×2 网格：存活/死亡、中毒、醉酒、加标记、更换角色、座位卡。点其中任一格只写本地 draft，环上立刻以虚线幽灵 chip / 幽灵帷幕呈现；抽屉同时从 peek 升到一条「确认 5号 状态」的单动作条（死亡时为 danger 色），点了才 dispatch。「记入哪个段」的下拉保留在这条确认条上，默认取当前相位。完整 PlayerStatusSheet（含相关记录）仍可从座位卡进抽屉 full。PlayerStatusBoard 卡片在魔典模式下消失——环本身就是那张卡片的空间版，档案页保留一份列表版供逐行核对。
```


---

## 17. `.ux.foldedFeatures[6].grimoireForm`

主文档在第 190 个字符处断开，此后 101 字符缺失。

**断点前文**（用来在主文档里定位）：

> …。点它 = 就地落账（并让抽屉底栏主动作闪回一次，明示这一下等于按了底栏）；长按它 = 否决并留一行原因。建议改结果时仍按设计系统「结果只出

**完整原文**：

```text
魔典上的形态就是「待确认草稿幽灵」，且不新增任何卡片：AI 建议给 3 号加中毒 → 3 号 token 卫星位长出一枚虚线描边、40% 不透明的「毒」chip，右上一枚 ✨ 微角标，chip 下方一行 --type-meta 的「待确认」。点它 = 就地落账（并让抽屉底栏主动作闪回一次，明示这一下等于按了底栏）；长按它 = 否决并留一行原因。建议改结果时仍按设计系统「结果只出现一份」：直接选中抽屉里那一枚 outcome 按钮并标「AI建议」，SettlementAssistPanel 瘦身为一行依据 + 「展开依据」，五张小卡收进折叠。人工改选后显示「已改为说书人选择」。
```


---

## 18. `.ux.foldedFeatures[11].grimoireForm`

主文档在第 190 个字符处断开，此后 93 字符缺失。

**断点前文**（用来在主文档里定位）：

> …记录，让说书人在按下不可逆按钮之前看到自己要归档的是哪个局面（阵营/角色仍需一次显式揭示）。归档完成后环清空为新局空态——一圈灰色座位占位 

**完整原文**：

```text
入口收进轨道右端「收尾」→ 局终交接卡（页内覆盖，与黄昏/黎明/白天收尾同一族），交接卡里是唯一的 danger 按钮。抽屉 full 渲染现有 GameEndSheet 三步。画布在归档确认那一刻显示终局快照预览作为回执：谁死谁活、多少条记录，让说书人在按下不可逆按钮之前看到自己要归档的是哪个局面（阵营/角色仍需一次显式揭示）。归档完成后环清空为新局空态——一圈灰色座位占位 + 一枚「AI配板」主动作。全部回执（正在保存 / 已保存到本机 / 归档校验失败 / JSON已导出）改由轨道下方的全局 HostNotice 单例承载，其中破坏性失败常驻不自动收回。
```


---

## 19. `.ux.foldedFeatures[8].grimoireForm`

主文档在第 190 个字符处断开，此后 87 字符缺失。

**断点前文**（用来在主文档里定位）：

> …位在环上打 ✓「已领取」角标，core 显示 8/12 领取进度，实体抽牌模式同理只记进度。伪装三张不上环（它们是不在场角色，环上没有它们的

**完整原文**：

```text
发身份是开局一次性叠加模式而非环的常态。进入后画布切 data-mode="deal"：强制降到 L1 并锁定（此时环上一个角色名都不出现），点一个座位 = 打开现有 spotlight（全屏、不透明、只有这一位、仍需两级揭示）；返回后该座位在环上打 ✓「已领取」角标，core 显示 8/12 领取进度，实体抽牌模式同理只记进度。伪装三张不上环（它们是不在场角色，环上没有它们的座位），落在 core 底行「本局备忘」pill → 抽屉里显示 bluff 组（组名 + 三个角色 + 展示给了谁 + 第几夜），首夜「恶魔信息」系统步骤卡直接读写这一组。
```


---

## 20. `.ux.foldedFeatures[12].grimoireForm`

主文档在第 190 个字符处断开，此后 70 字符缺失。

**断点前文**（用来在主文档里定位）：

> …对黄昏发生变化的座位——死亡座位帷幕落下、复活座位帷幕升起，core 用大字列出座位号；抽屉里是「只报生死，不报原因」的护栏条与「本夜 N 

**完整原文**：

```text
两张交接卡都在抽屉 full 档，同时环进入对应的辅助态。黄昏：环上把「上一夜标注为持续到黄昏的效果」对应的卫星 chip 变成待到期的虚化态（只提示、不到期、不清除），core 显示上一天结论回执与本夜队列预览。黎明：环上用差分动画标出相对黄昏发生变化的座位——死亡座位帷幕落下、复活座位帷幕升起，core 用大字列出座位号；抽屉里是「只报生死，不报原因」的护栏条与「本夜 N 项记录标注了死亡结果，但玩家状态未更新 [去更新]」的核对提醒。主动作分别是「所有玩家闭眼 · 开始第N夜」「已宣布睁眼 · 进入第N天」。
```


---

## 21. `.ux.foldedFeatures[10].grimoireForm`

主文档在第 190 个字符处断开，此后 68 字符缺失。

**断点前文**（用来在主文档里定位）：

> …/时长/投屏）在抽屉 peek 档的一条 88px 横条里，不占 half 空间。「投屏」= 全屏不透明遮蔽层，层内只有时间、阶段名和一枚「

**完整原文**：

```text
删掉顶层 timer 视图。白天计时态下环导轨本身变成进度弧——沿椭圆周长填充，这是环最自然的一次复用（一条已经存在的圆形轨道天生就是进度条）；core 中央放 mm:ss 大字 + 阶段名 + 「可开始提名」状态；控制键（开始/暂停/重置/时长/投屏）在抽屉 peek 档的一条 88px 横条里，不占 half 空间。「投屏」= 全屏不透明遮蔽层，层内只有时间、阶段名和一枚「收起」，收起后精确回到原步骤原滚动位；同时补齐现有超时后的三选一空洞（重新开始公聊 / 回到私聊 / 重置），与全屏层共用同一套按钮集。
```


---

## 22. `.ux.foldedFeatures[5].grimoireForm`

主文档在第 190 个字符处断开，此后 61 字符缺失。

**断点前文**（用来在主文档里定位）：

> … + 顶部「AI 候选 · 待确认」条），点抽屉底栏「确认配板」才实体化。座位交换 = 点两座，环上给一段 200ms 的交换弧线动画作为回

**完整原文**：

```text
开局态画布进入配板环：token 显示分配到的角色但默认 L1 遮蔽（配板时玩家常常已经落座），抽屉 full 渲染现有 SetupPanel。采用 AI 候选后不直接落账，而是在环上整圈以幽灵态预览（虚线描边 + 角色图标 40% 不透明 + 顶部「AI 候选 · 待确认」条），点抽屉底栏「确认配板」才实体化。座位交换 = 点两座，环上给一段 200ms 的交换弧线动画作为回执；更换角色走 SeatSeatEditor。人数修正条、合法性检查、伪装三张一律留在抽屉，不上环——它们是清单不是局面。
```


---

## 23. `.model.entities[6].tsShape`

主文档在第 1100 个字符处断开，此后 57 字符缺失。

**断点前文**（用来在主文档里定位）：

> …op: 'private_note_set'; seatId: number }   // 只记「改过」，不把私有笔记正文复制进记录标题



**完整原文**：

```text
/**
 * 一次魔典手势的「意图描述」。
 * 它不是命令、永远不会被重放执行；权威事实始终是 before/after 两份完整快照。
 * 这样旧归档（没有 ops）与新归档投影出的当前局面完全一致。
 */
export type GrimoireOp =
  | { op: 'token_added'; seatId: number; token: ReminderToken }
  | { op: 'token_removed'; seatId: number; tokenId: string; tokenLabel: string }
  | { op: 'token_moved'; fromSeatId: number; toSeatId: number; tokenId: string }
  | { op: 'token_inverted'; seatId: number; tokenId: string; inverted: boolean }
  | { op: 'life_set'; seatId: number; life: LifeState }
  | { op: 'impairment_set'; seatId: number; impairment: ImpairmentState; value: boolean }
  | { op: 'alignment_set'; seatId: number; alignment: Alignment; inverted: boolean }
  | { op: 'perceived_role_set'; seatId: number; role: RoleSnapshot | null }
  | { op: 'role_type_override_set'; seatId: number; roleType: RoleType | null }
  | { op: 'madness_issued'; seatId: number; directiveId: string }
  | { op: 'madness_lifted'; seatId: number; directiveId: string }
  | { op: 'ghost_vote_set'; seatId: number; available: boolean }
  | { op: 'private_note_set'; seatId: number }   // 只记「改过」，不把私有笔记正文复制进记录标题

/** 说明：真实角色的变更不在这里，仍走既有的 setup_changed 事件，避免两条路径都能改角色。 */
```


---

## 24. `.review.topRisks[8].risk`

主文档在第 170 个字符处断开，此后 56 字符缺失。

**断点前文**（用来在主文档里定位）：

> … 只按扩展名拦截，挡不住 data:image 内联进 ts/tsx/css，也挡不住把去混淆脚本与 bundle 片段提交进公开仓库（逆向

**完整原文**：

```text
素材与版权。魔典需要的裹尸布、标记底盘、投票令牌、底纹官方源不单独提供，最省事的路径是从官方应用截图切图或直接引用 botc.games 的 CSS 与 cdn 资源；而现有 audit:public 只按扩展名拦截，挡不住 data:image 内联进 ts/tsx/css，也挡不住把去混淆脚本与 bundle 片段提交进公开仓库（逆向那份恰好建议这么做）。魔典视图还会让界面观感更接近成品游戏，而社区素材占 582/718 且权利人不是 TPI。
```


---

## 25. `.ux.foldedFeatures[3].grimoireForm`

主文档在第 190 个字符处断开，此后 50 字符缺失。

**断点前文**（用来在主文档里定位）：

> …d 角标（右下角冷青 RefreshCw），token 下沿名字牌显示「已变更 · 原X」，夜间当前项仍在抽屉里标「本夜仍按X」。L1 遮蔽

**完整原文**：

```text
SeatActionBar 的第五格「更换角色」→ 抽屉 full 原样渲染现有 RoleChangeSheet，一行代码级别的容器替换。确认后环上该 token 直接换成新角色的官方 WebP 并挂 RoleDisc 已有的 changed 角标（右下角冷青 RefreshCw），token 下沿名字牌显示「已变更 · 原X」，夜间当前项仍在抽屉里标「本夜仍按X」。L1 遮蔽态下 token 仍是「隐」，changed 角标照常显示——「这个座位换过角色」本身不是秘密身份。
```


---

## 26. `.model.entities[7].migration`

主文档在第 280 个字符处断开，此后 43 字符缺失。

**断点前文**（用来在主文档里定位）：

> …`Dashboard.tsx:36` 都需要为新 kind 补分支，否则新条目会被静默丢弃或渲染成空白。GameArchiveSummary

**完整原文**：

```text
全部新增字段可选。风险集中在 TimelineEntry 联合类型变宽：`timelineSessionReducer.ts:16` 的黑名单、`timeline.ts:35` 的 entryCanUsePhase、`projectTimelineHistory.ts`、`archiveService.ts:58`、`gameReviewProjection.ts`、`projectSeatActivity.ts`、`Dashboard.tsx:36` 都需要为新 kind 补分支，否则新条目会被静默丢弃或渲染成空白。GameArchiveSummary 建议加可选计数器 exiles?/rulings?，旧归档读为 undefined。
```


---

## 27. `.review.topRisks[5].mitigation`

主文档在第 280 个字符处断开，此后 39 字符缺失。

**断点前文**（用来在主文档里定位）：

> …执，无回执的静默写入视为故障；④ 删除标记不得是单点击（长按或二段确认）；⑤ 草稿态与已落盘态用虚线加 40% 不透明加「待确认」文字三重区

**完整原文**：

```text
① 撤销必须实现为追加 CorrectionEvent（correctionOf 与 correctionReason，TimelineBase 已有），投影回到操作前但两条记录都在，禁止 state 快照回退或从 timeline 删条目；② 撤销 affordance 挂在 HostNotice 回执上，3.5 秒内可点，超时后走本局记录的更正路径（这一条五份产出都没给，是必须补的设计）；③ 魔典上每次写入强制回执，无回执的静默写入视为故障；④ 删除标记不得是单点击（长按或二段确认）；⑤ 草稿态与已落盘态用虚线加 40% 不透明加「待确认」文字三重区分，相位切换强制清空全部草稿态（常驻画布最容易把跨夜残留草稿当成真实局面读）。
```


---

## 28. `.review.contradictions[2].between`

主文档在第 200 个字符处断开，此后 37 字符缺失。

**断点前文**（用来在主文档里定位）：

> …s 从 string[] 升级为带可选 seatId 与 change 的对象，并列出 server provider / validato

**完整原文**：

```text
数据模型（AIGrimoireProposal 携带 ops 数组与 status）× 边界（GrimoireActionDraft 含 draftId/proposedChange 枚举/payload）× 模式切换（把现有 stateChangeDrafts 从 string[] 升级为带可选 seatId 与 change 的对象，并列出 server provider / validator / promptBuilder outputShape 的全部改动点）
```


---

## 29. `.review.contradictions[1].between`

主文档在第 200 个字符处断开，此后 35 字符缺失。

**断点前文**（用来在主文档里定位）：

> …e kind）× 模式切换（session.hostingMode 必填 + hostingModeHistory，schemaVersio

**完整原文**：

```text
数据模型（GrimoireSettings 挂 session.grimoire，含 mode/layout/shielded/showAnnotations，schemaVersion 保持 1，新增 session_mode_changed timeline kind）× 模式切换（session.hostingMode 必填 + hostingModeHistory，schemaVersion 升 2 并做 1→2 迁移，明确反对模式变更进 timeline）
```


---

## 30. `.ux.foldedFeatures[4].grimoireForm`

主文档在第 190 个字符处断开，此后 17 字符缺失。

**断点前文**（用来在主文档里定位）：

> …、谁被改了角色）；反向路径是点环上座位 → 座位卡「相关记录」区（projectSeatActivity 已有投影）。更正仍是「先详情后更正

**完整原文**：

```text
入口唯一且恒定：轨道右端「本局记录 N」，六个相位与档案页全程可见。魔典模式额外给它一个空间索引能力：打开后抽屉 full 渲染 TimelineHistorySheet，列表滚动时当前聚焦条目涉及的座位在环上亮冷青描边（谁提名了谁、谁死了、谁被改了角色）；反向路径是点环上座位 → 座位卡「相关记录」区（projectSeatActivity 已有投影）。更正仍是「先详情后更正」，更正态在画布顶部挂常驻冷青条。
```


---

## 31. `.review.contradictions[4].between`

主文档在第 200 个字符处断开，此后 17 字符缺失。

**断点前文**（用来在主文档里定位）：

> …ui-design-system.md:34（角色 PNG 与圆形 Token 只保留给 RoleDisc，SeatButton 只显示号码

**完整原文**：

```text
UX（token 直接用现有 RoleDisc，不新造第二种圆形 token）× 边界（verify-architecture.mjs:37 禁止 src/components/ui 出现 roleId，建议魔典座位放 features/grimoire）× ui-design-system.md:34（角色 PNG 与圆形 Token 只保留给 RoleDisc，SeatButton 只显示号码，避免把座位操作误解为另一套魔典）
```


---

## 32. `.boundary.findings[8].recommendation`

主文档在第 700 个字符处断开，此后 8 字符缺失。

**断点前文**（用来在主文档里定位）：

> …式下的全部座位、标记、状态、死亡操作仍可完整手动完成」「AI 建议在未点击确认前，魔典上不存在任何实心标记，导出的 session 里不存在

**完整原文**：

```text
1. 在 AI_AUTHORITY_BOUNDARY.md 的「AI 不可以」清单中追加：「不可以放置、移除或移动魔典上的任何提示标记、角色 Token、死亡态或状态环。」
2. 新增数据结构 `GrimoireActionDraft`，与 SettlementDraft 平级：{ draftId, source: 'ai' | 'rule-hint', targetSeatId, proposedChange（枚举：add-reminder / remove-reminder / set-status / set-death / change-identity）, payload, rationale, adviceId, contextRevision, knowledgeVersion }。约定：草稿只能渲染成魔典上的**虚线幽灵态**（与已落地标记视觉明显不同），必须点击才 commit，commit 后写入时间线并保留 AI 来源链（沿用 AI_AUTHORITY_BOUNDARY:17 的「已改为说书人选择」机制）。
3. 按钮文案沿用 ABILITY_SETTLEMENT_BOUNDARY:133-139 的三段式：`生成建议` / `采用草稿` / `确认落盘`，禁止出现「应用」「执行」「AI 已处理」。
4. 验收标准（补进 ABILITY_SETTLEMENT_BOUNDARY:154-159）：「关闭 AI 后，魔典模式下的全部座位、标记、状态、死亡操作仍可完整手动完成」「AI 建议在未点击确认前，魔典上不存在任何实心标记，导出的 session 里不存在任何对应记录」。
```


---

## 33. `.modeSwitch.findings[3].recommendation`

主文档在第 400 个字符处断开，此后 5 字符缺失。

**断点前文**（用来在主文档里定位）：

> …换按钮不需要二次确认——真正需要交接卡的是 grimoire→record 方向（见下条），record→grimoire 方向应当即时生效

**完整原文**：

```text
新增 `GameSessionState.hostingModeHistory: { mode: HostingMode; changedAt: string; fromPhaseLabel: string }[]`（建局时写入第一条）。切换 action 命名为 `set-hosting-mode`，只改 `hostingMode` 并 append history，不碰 timeline、不碰 phaseSegments、不碰 playerStates。入口放在【本局档案 · 主持设置】里，不放主持台顶栏 PhaseTrack（顶栏是 48px 高频误触区，且 UI_REDESIGN_PLAN 已经把它的右端两枚入口定死为「本局记录」「收尾」）。切换按钮不需要二次确认——真正需要交接卡的是 grimoire→record 方向（见下条），record→grimoire 方向应当即时生效、零摩擦。
```
