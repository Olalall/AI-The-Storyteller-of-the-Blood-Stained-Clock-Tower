# 双模式设计：纯记录模式 / 魔典+记录模式

- 日期：2026-08-04
- 缘起：作者提出「有时手边没有实体魔典」，要求提供可切换的两种模式；魔典模式参考 botc.games，现有功能以辅助形式融入魔典交互。
- 前置：[UI_REDESIGN_PLAN_2026-08-04.md](UI_REDESIGN_PLAN_2026-08-04.md)（纯记录模式方案，本文复用其三层骨架）
- 方法：5 条并行设计线（botc.games 魔典逆向 / 共享数据模型 / 魔典交互 / 模式切换 / 边界重划）+ 1 轮交叉评审，评审裁掉 12 处方向性冲突。
- 结构化数据：`data/wiki-ground-truth/compare/dualmode-design.json`

---


> ### ⚠ 本文件有 33 处正文被截断
>
> 本文件是由 `data/wiki-ground-truth/compare/dualmode-design.json` 汇编而成的，
> 汇编时对长字段做了硬截断：**表格单元格约 190 字符、类型定义约 1100 字符即断**，
> 且第三节落点表的 `why` 与 `conflictRisk` 两列整列丢失。
>
> 断点全部落在句子中间，读起来只像是话没说完——已经造成的实际后果包括：
> `GrimoireOp` 在本文件里少了 4 个变体、夜态 core 的方案只剩「留在抽屉 hal」。
>
> **动手前先读这两份恢复文件，它们与本文件冲突时以它们为准：**
> - [GRIMOIRE_DESIGN_RECOVERED_PASSAGES.md](GRIMOIRE_DESIGN_RECOVERED_PASSAGES.md) —— 全部 33 处逐字恢复
> - [GRIMOIRE_FOLDED_FEATURES_FULL.md](GRIMOIRE_FOLDED_FEATURES_FULL.md) —— 第三节落点表 14 条完整版（含丢失的两列）
>
> 另：**第八节「评审裁决的 12 处冲突」凌驾于前七节**。前文被裁决否掉的内容（如 `AIGrimoireProposal`、
> `GrimoireSettings`、`SessionSurfaceMode`）正文仍在，但一律不实现。


## 〇、两条最重要的裁决

### 裁决 1：电子魔典不是规则引擎（这是整个设计的护身符）

作者解除的只有「不做第二套魔典」这一条，其余边界全部保留。二者能共存的唯一方式是：

> **电子魔典是「说书人直接操作状态的界面」，不是「规则引擎」。每一次状态改变都由说书人手动完成。**

最锋利的可检验判据（来自边界线）：

> **工具必须允许说书人录入规则上不可能的状态。规则引擎会拒绝非法状态，记录台不会。**

对照：

| | 动作 | 判定 |
| --- | --- | --- |
| ✅ | 说书人点 3 号 → 选「中毒」→ 出现中毒标记 | 直接操作，状态由人改 |
| ❌ | 确认「投毒者选了 3 号」→ 工具自动给 3 号加中毒标记 | 自动结算，越界 |
| ✅ | 确认后在 3 号旁生成**虚线幽灵标记** + 「AI 建议：投毒者本夜选择此人」，点一下才实体化 | 建议 + 人工确认 |

「幽灵标记」是贯穿魔典模式的核心模式：AI 与流程推断只能产出虚线待确认物，实线只能由说书人的手指产生。

### 裁决 2：否掉自由拖拽画布，改用计算式布局（砍掉约一半工程量）

逆向发现 botc.games 是**自由拖拽画布**：布局只在「重排」时由 JS 算出每个 token 的绝对 `{x,y}` 写进 Redux 持久化，之后 token 与 reminder 都是 interact.js 驱动的绝对定位元素，标记归属靠「落点离哪个 token 中心最近且 ≤1.2×tokenSize」判定。

**本项目不采用**。评审裁定理由：

- 坐标持久化会让标记归属出现**两个真值**（proximity 算出来的 vs seatId 记的），一旦不一致无法判定谁对；
- 暗光下拖拽**落点不可预览**（手指遮住目标），而松手即提交，且误放是静默成功；
- 竖屏单手时拇指弧覆盖不到环的上半弧，「从 12 点拖到 6 点」物理上不可能；
- 边界要求魔典视图只渲染既有投影，**不得持有独立局面状态**。

替代方案：**座位角度由人数唯一决定，标记按计算附着到 seatId，语义状态一律不拖拽。**
逆向成果收缩为六点可用资产：椭圆角度公式、名字预留量、pitch 判据、昼夜背景叠加、名字牌避让、锁定开关。

---

## 一、两种模式的关系

```
              纯记录模式 (record)          魔典模式 (grimoire)
  ┌───────────────────────────────────────────────────────────┐
  │  PhaseTrack 阶段轨道（48px sticky）        ← 两模式共用     │
  ├───────────────────────────────────────────────────────────┤
  │                          │                                │
  │      步骤台               │   魔典画布（环 + 核）            │
  │   （唤醒卡流 /            │   ＋ 工作抽屉（peek/half/full）  │
  │     白天步骤序列 /         │      抽屉内容 = 左侧的步骤台     │
  │     交接卡）              │                                │
  ├───────────────────────────────────────────────────────────┤
  │  StickyActionBar 单一底栏                  ← 两模式共用     │
  └───────────────────────────────────────────────────────────┘
```

魔典模式**只替换中间那层**：把「步骤台」拆成「画布 + 抽屉」，轨道与底栏原样复用。
抽屉 full 档正好等于现有 `presentation="page"` 尺寸，因此 SetupPanel、IdentityDealSheet、TimelineHistorySheet、GameEndSheet、RoleChangeSheet、NightQueueSheet **六个全屏页几乎零改动搬进抽屉**，只换容器。

### 模式字段的归属（作者已拍板）

> **记录它发生过，但永不让它成为分支条件。**

- `GameSessionState.hostingMode` 放 session 根，作为**出处元数据**——归档必须诚实回放，否则跨模式回看会把「纯记录局」渲染成一张看起来很完整、实则大半没人录过的魔典。
- **禁止任何 reducer 读取它**，由 `verify-architecture.mjs` 强制。允许读的只有三处且都不是 reducer：视图层选渲染组件、归档/复盘展示、AI 上下文说明局面完整度。
- 模式变更只 append `session.hostingModeHistory`，**不新增 TimelineEntry kind**——它是工具事实不是对局事实，进 timeline 会强迫七处非穷尽 switch 为非对局条目开分支，还会污染「本局记录 N」计数。
- `schemaVersion` 保持字面量 `1`（新字段全可选），避开 `isSession` 硬相等判断的静默重置爆炸半径。

---

## 二、魔典画布规格

### 环布局算法

```
座位 i（0 起，座位号 i+1）：
  θ_i = -90° + startOffset + (360° / N) · i
  x = cx + A·cos θ ，y = cy + B·sin θ    （y 向下 ⇒ θ 递增即顺时针，与说书人站圈中央顺时针唱票一致）

半轴由可用矩形反推（不是先定圆再塞）：
  A = (stageW - 2·padX - tokenSize) / 2 ，padX = 16
  B = (stageH - 2·padY - tokenSize) / 2 ，padY = 12
  允许椭圆，比例上限 1.45；超过则按 B 收 A 并左右留白——超过 1.45 就不像一张桌子了

弧距 pitch = 椭圆周长（Ramanujan 近似）/ N   ← 尺寸档位与 chip 落位的唯一判据
```

座位 1 固定 12 点。`startOffset` 只给 **0/90/180/270 四档**（让屏上 1 号方位对齐说书人在真实桌边的朝向），**不提供自由旋转，不提供形状选择**。

### token 尺寸（离散四档，禁连续缩放）

| 档 | 尺寸 | 人数 |
| --- | --- | --- |
| L | 96px | N ≤ 10 |
| M | 84px | N 11–14 |
| S | 72px | N 15–17 |
| XS | 64px | N 18–20 |

碰撞守卫：`pitch − tokenSize < 28` 降一档；已 XS 仍不足则整块退化为网格模式。命中区用 `::before` 外扩到 `max(token, 56px)`。
token 直接用现有 `RoleDisc`，**不新造第二种圆形 token**；抽屉里的号码网格仍是 `SeatButton`，二者职责不混。

### 标记附着（计算附着，永不拖拽）

以 token 圆心为原点，沿「core → token」径向外侧铺 **88° 卫星弧**，弧半径 `r = token/2 + chip/2 + 4`，chip 直径 `clamp(22, round(token·0.30), 28)`。
顺序恒定 **中毒 → 醉酒 → 具名标记**（与现有 `PlayerStatusBar` 一致）。最多 3 枚，第 4 枚起折叠 `+N`。
**空间反转**：`pitch − token < 40` 时卫星弧翻到 token 内侧朝 core——N 越大外圈越挤内圈越空。

死亡不占 chip 位：token 底部 30% 一条实底帷幕 + Skull + 「亡」+ 语义色描边（图标/文字/颜色三重编码，昼夜同一套）。中毒/醉酒同时改 token 边框为语义色虚线，构成双重表达。

### 手势语义

**点击**只承载「当前这一步最想做的那件事」，语义随抽屉步骤切换，抽屉顶部常驻一行手势契约明写此刻点座位会发生什么：

| 当前步骤 | 点座位 = |
| --- | --- |
| 夜·目标未选齐 | 选目标 |
| 白天·提名 | 填入当前指向的槽（提名人/被提名人）|
| 白天·计票 | toggle 举手 |
| 开局·配板 | 第一下选中、第二下交换 |
| idle | 打开座位卡 |

> 暗光下说书人没有余裕记「哪个手势对应哪个功能」，只有余裕记「点下去 = 做当前这一步」。

**长按 400ms** 只做加速器、永不做唯一入口（设计系统禁止隐藏式长按），每次带 haptic + 环形填充进度。
**拖拽**：语义状态一律不用（理由见裁决 2），只保留两处非语义拖拽。

### 防窥：三级遮蔽

| 级别 | 内容 | 进入方式 |
| --- | --- | --- |
| L0 全遮蔽 | 不透明幕，秘密**不进 DOM** | 双指点画布任意处，立刻 |
| L1 席位视图（默认）| 座位号、生死、毒醉；**标记只渲染无字圆点 + 计数** | 默认态 |
| L2 魔典视图 | 露角色 | 长按 600ms 或点+确认两段；90 秒无操作自动落回 L1 |

评审否掉了 UX 原本「L1 显示具名标记也无所谓」的假设：**标记 label 本身就是角色信息**——「僧侣保护」暴露场上有僧侣及其今晚保了谁，「红鲱鱼」暴露占卜师及其误导对象，「是酒鬼」直接暴露一个玩家的真实身份。故 L1 下 label / sourceRoleId 一律不进 DOM。

---

## 三、现有功能如何融入魔典

| 功能 | 纯记录模式形态 | 魔典模式形态 |
| --- | --- | --- |
| 夜序与夜间逐项记录 | NightWorkbench 独立全屏页：96–160px 页头 + 250px NightPlayerCarousel 转盘 + Curr | 环变成夜序的空间光标：当前项座位是全屏唯一暖金焦点环，后续两项打 ①② 冷灰角标，已确认项打 ✓，已暂缓项打「缓」。250px 转盘降级进 core —— 双 RoleDisc small(58px)「当前 / 下一位」+ 两侧带座位号标签的 ‹ › 按钮，空间定位交给环，转盘不再占一屏。CurrentWakeCard 拆两半：能力说明与「今天发生了什么」事实条留在抽屉 hal |
| 白天提名 / 举手 / 暂列 / 处决 | DayWorkbench 两栏并排（步骤1 提名卡 ｜ 步骤2 举手卡），门槛 number input，死亡座位举手后长出 26px 的「 | 提名：环上提名人 token 出现暖金实心起点三角、被提名人出现终点三角，两者之间画一条 1px 冷青弧（唯一一处连线，只表达「这一次提名」）；选人 = 点环，落到抽屉分段当前指向的槽。举手：进入计票子态后每个 token 变成打卡键，点一下出现 ✋ + 「举」+ 计数序号；死亡座位举手后在其卫星位长出一枚 44px 的「死亡票」二次确认 chip（取代 26px 药丸，且不再 |
| 玩家状态编辑（生死 / 中毒 / 醉酒  | 入口在 Dashboard 的 PlayerStatusBoard 卡片，点座位卡 → PlayerStatusSheet 全屏页 → 改  | 长按座位（或 idle 单击）→ SeatActionBar 锚定浮层，3×2 网格：存活/死亡、中毒、醉酒、加标记、更换角色、座位卡。点其中任一格只写本地 draft，环上立刻以虚线幽灵 chip / 幽灵帷幕呈现；抽屉同时从 peek 升到一条「确认 5号 状态」的单动作条（死亡时为 danger 色），点了才 dispatch。「记入哪个段」的下拉保留在这条确认条上，默认 |
| 更换角色 | 入口是 PlayerStatusBar 里的「更换角色」按钮 → RoleChangeSheet 全屏页：先选角色、再选原因、底部唯一主动作 | SeatActionBar 的第五格「更换角色」→ 抽屉 full 原样渲染现有 RoleChangeSheet，一行代码级别的容器替换。确认后环上该 token 直接换成新角色的官方 WebP 并挂 RoleDisc 已有的 changed 角标（右下角冷青 RefreshCw），token 下沿名字牌显示「已变更 · 原X」，夜间当前项仍在抽屉里标「本夜仍按X」。L1 遮蔽 |
| 本局记录与更正 | 四个别名散在三处：Dashboard「最近记录/日记」、GameEndSheet 底部「本局记录」、复盘页「当局日志」；白天工作台根本没有入 | 入口唯一且恒定：轨道右端「本局记录 N」，六个相位与档案页全程可见。魔典模式额外给它一个空间索引能力：打开后抽屉 full 渲染 TimelineHistorySheet，列表滚动时当前聚焦条目涉及的座位在环上亮冷青描边（谁提名了谁、谁死了、谁被改了角色）；反向路径是点环上座位 → 座位卡「相关记录」区（projectSeatActivity 已有投影）。更正仍是「先详情后更正 |
| AI 配板 | Dashboard 的「AI配板」按钮 → SetupPanel 全屏页：SetupCandidateBrowser 候选 → 采用为草稿  | 开局态画布进入配板环：token 显示分配到的角色但默认 L1 遮蔽（配板时玩家常常已经落座），抽屉 full 渲染现有 SetupPanel。采用 AI 候选后不直接落账，而是在环上整圈以幽灵态预览（虚线描边 + 角色图标 40% 不透明 + 顶部「AI 候选 · 待确认」条），点抽屉底栏「确认配板」才实体化。座位交换 = 点两座，环上给一段 200ms 的交换弧线动画作为回 |
| AI 夜间结算建议 | CurrentWakeCard 结果区的「AI推荐」按钮 → 选中同一枚结果按钮并标「AI建议」，下方 SettlementAssistPa | 魔典上的形态就是「待确认草稿幽灵」，且不新增任何卡片：AI 建议给 3 号加中毒 → 3 号 token 卫星位长出一枚虚线描边、40% 不透明的「毒」chip，右上一枚 ✨ 微角标，chip 下方一行 --type-meta 的「待确认」。点它 = 就地落账（并让抽屉底栏主动作闪回一次，明示这一下等于按了底栏）；长按它 = 否决并留一行原因。建议改结果时仍按设计系统「结果只出 |
| AI 复盘 | Dashboard「历史复盘」（挂着「危险动作」徽标，与「结束对局」同一张卡）→ GameEndSheet 的 review 段 → Gam | 只在局终出现，且与「结束对局」彻底拆开（不再共用一张卡、不再挂危险徽标）。轨道右端「收尾」→ 局终交接卡 →「本局复盘」→ 抽屉 full 渲染现有复盘面板。此时画布切到只读定格环：显示终局生死与角色（需要一次显式「揭示终局」点击才升 L2），点某个座位 = 抽屉滚到该玩家的评分草稿与关键行为，反向点评分卡片 = 环上该座位高亮。评分数字、锐评文本只在抽屉里，环上只做索引。 |
| 发身份 / 伪装 | Dashboard「发身份」按钮 → IdentityDealSheet 全屏页：屏幕领取 / 实体抽牌两段，座位网格（屏幕模式下每格直接印 | 发身份是开局一次性叠加模式而非环的常态。进入后画布切 data-mode="deal"：强制降到 L1 并锁定（此时环上一个角色名都不出现），点一个座位 = 打开现有 spotlight（全屏、不透明、只有这一位、仍需两级揭示）；返回后该座位在环上打 ✓「已领取」角标，core 显示 8/12 领取进度，实体抽牌模式同理只记进度。伪装三张不上环（它们是不在场角色，环上没有它们的 |
| 剧本切换 | Dashboard 的「切换板子」按钮（与配板、发身份、倒计时并列在同一排工具条）→ ScriptLibrarySheet 全屏页；实际只允 | 降级为 core 顶行那条「乌鸦渡口 · 12人」标识的点击目标 → 本局信息浮层（剧本、人数、知识版本、切换板子、开场白）。空局时它是主入口且醒目；非空局时「切换板子」保持 disabled + 一行说明。绝不出现在环上，也绝不出现在拇指可达区。 |
| 倒计时 | 两处：白天工作台内的 DayTimer 卡（私聊/公聊、时长设置、开始/暂停/重置，超时后有渲染空洞）与 Dashboard 上并列的第四个 | 删掉顶层 timer 视图。白天计时态下环导轨本身变成进度弧——沿椭圆周长填充，这是环最自然的一次复用（一条已经存在的圆形轨道天生就是进度条）；core 中央放 mm:ss 大字 + 阶段名 + 「可开始提名」状态；控制键（开始/暂停/重置/时长/投屏）在抽屉 peek 档的一条 88px 横条里，不占 half 空间。「投屏」= 全屏不透明遮蔽层，层内只有时间、阶段名和一枚「 |
| 结束归档 | Dashboard 底部「结束对局」卡（与「历史复盘」共卡、共挂危险徽标）→ GameEndSheet 三步：声明胜方 → 保存本局（含导出 | 入口收进轨道右端「收尾」→ 局终交接卡（页内覆盖，与黄昏/黎明/白天收尾同一族），交接卡里是唯一的 danger 按钮。抽屉 full 渲染现有 GameEndSheet 三步。画布在归档确认那一刻显示终局快照预览作为回执：谁死谁活、多少条记录，让说书人在按下不可逆按钮之前看到自己要归档的是哪个局面（阵营/角色仍需一次显式揭示）。归档完成后环清空为新局空态——一圈灰色座位占位  |
| 黄昏 / 黎明交接（新增，但必须与环共存 | 完全缺失。夜结束是「检查并关闭」→ onExit 回 Dashboard →「进入白天」三段跳；黄昏准备与黎明播报全靠说书人记忆。 | 两张交接卡都在抽屉 full 档，同时环进入对应的辅助态。黄昏：环上把「上一夜标注为持续到黄昏的效果」对应的卫星 chip 变成待到期的虚化态（只提示、不到期、不清除），core 显示上一天结论回执与本夜队列预览。黎明：环上用差分动画标出相对黄昏发生变化的座位——死亡座位帷幕落下、复活座位帷幕升起，core 用大字列出座位号；抽屉里是「只报生死，不报原因」的护栏条与「本夜 N  |
| 遮蔽 / 防窥（贯穿全局的结构件） | 单一布尔 privacyShielded：开启后 CurrentWakeCard 整张卡被 230px 的 privacy-curtain  | 升为三级并成为魔典模式的默认设计前提。L0 全遮蔽：不透明幕盖住整块画布与抽屉，秘密内容不进 DOM，恢复需单指点大按钮。L1 席位视图（默认）：token 用 RoleDisc 现有的 concealed「隐」态，只显示座位号、昵称、生死、毒醉、具名标记、领取/夜序角标——这些都是玩家看到也无所谓、而说书人最常需要的量。L2 魔典视图：显角色图标与名称，需长按遮蔽键 600m |

---

## 四、共享数据模型

一份共享模型，三条主线：(1) 把座位状态 PlayerState 扩成「生死/中毒/醉酒 + 提示标记 + 身份附加层 + 疯狂 + 登记能力 + 旅行者 + 私有笔记」的单一容器，所有新字段可选，纯记录模式只显示前四项、魔典模式把其余升为一等公民；(2) 把无归属的 {id,label} 标记升级为带来源角色、语义、放置段落与倒转态的 ReminderToken（ManualStatusMarker 是它的结构子集，旧归档天然合法），并用「真实角色（唯一权威，仍走 setup_changed）+ SeatIdentityOverlay（以为是谁、当前阵营、类型覆盖）」表达酒鬼/提线木偶/疯子/间谍的 token 堆叠；(3) 把「不改变状态的裁定」与「改变状态的操作」严格分家——登记异常按每次判定各记一条 RegistrationRuling（阵营与角色分别裁定、同夜可不同），疯狂建模为「命题 + prove/avoid + 奖惩文本」的指令加说书人裁量结论，流放独立成 ExileEntry 绝不复用投票/处决；而魔典上的每一次手势都翻译成 GrimoireOp 挂在既有的 player_state_changed 上，权威事实仍是 before/after 全量快照，ops 只是可读的意图描述、永不被重放。AI 最强只能产出 AIGrimoireProposal（一组 op + status），点确认才生成事件。模式本身是会话级可选字段 GrimoireSettings，缺省 record_only，保证旧归档按纯记录模式回放。

### 新增实体

#### ReminderToken（+ ReminderTokenDefinition 目录）

把现在无归属的 {id,label} 便签升级成「有来源、有语义、有放置/移除时机」的提示标记，成为魔典视图的第一公民，同时保持纯记录模式下仍可当普通标签用。

```ts
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

/** 剧本知识包中的标记目录条目：来自百科各角色「提示标记
```

- **为何需要**：《酒鬼》「是酒鬼」、《提线木偶》「是提线木偶」、《疯子》「被选择×3（黎明时移除）」都明确给出了放置时机/条件/移除时机；《间谍》整条能力就是「读魔典上的标记摆放」，所以标记的位置与归属本身就是游戏内容。《重要细节》三.3 给出倒转放置这一物理表达。魔典模式的核心手势（长按座位→选标记→落位、拖到另一座位、翻面）全部落在这个类型上。
- **纯记录模式下**：只显示 label，编辑面板仍是「加一个标签」；sourceRoleId/semantics/inverted 全部不出现也不要求填写。既有「具名标记编辑」需求正好由 label 满足。
- **迁移**：ManualStatusMarker 是 ReminderToken 的严格结构子集，PlayerState.markers 字段名与位置不变，仅把元素类型放宽，旧归档里的 {id,label} 天然合法。ReminderTokenDefinition 属于知识包（与 ScriptSourceMetadata 同层），不进 session、不进归档；目录缺失时魔典退化为自由命名标记，不得因目录没有就禁止摆放。

#### SeatIdentityOverlay（座位身份附加层）

表达「玩家以为自己是 A、实际是 B」以及「阵营独立于角色」，即魔典上那一摞叠放的标记，而不新增第二个「当前角色」权威源。

```ts
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
  alignment: Alignment | null        // null = 知识包缺角色阵营，
```

- **为何需要**：酒鬼（袋里是镇民牌，实际是外来者酒鬼）、提线木偶（以为善良、实为爪牙且被当作邪恶）、疯子（以为自己是恶魔）、食人族/失忆者都要求同时保存两层身份；舞蛇人/方古/莽夫/政客要求改阵营不改角色或反之；《重要细节》三.2 的倒转放置就是这层的物理表达。
- **纯记录模式下**：纯记录模式下座位卡只显示 actualRole；perceivedRole 若有值则作为一行小字备注（「玩家以为自己是送葬者」），alignment 只在与初始阵营不符时提示。全部字段可不填。
- **迁移**：全部字段可选，挂在 PlayerState.identity 与 SetupAssignment.identity 上；旧归档 identity 缺失 = 认知与角色一致、阵营等于角色初始阵营。注意 RoleSnapshot 目前只有 {id,name,initial,iconPath}，没有 team 字段（SetupTeam 只存在于 src/features/setup 的规则包里），所以「角色初始阵营」必须在配板确认时解析成显式值写进 ConfirmedSetup，否则历史归档无法离线解析阵营——见 risks。

#### PlayerState v2（座位事实容器）

唯一的座位状态类型，纯记录模式只用前四个字段，魔典模式把其余字段升为主界面元素；不拆成两套模型。

```ts
export interface PlayerState {
  // ——— 既有字段，位置与语义完全不变 ———
  life: LifeState
  poisoned: boolean
  drunk: boolean
  /** 元素类型放宽为 ReminderToken；字段名不改。 */
  markers: ReminderToken[]

  // ——— 新增，全部可选 ———
  /** 身份附加层。undefined = 认知与角色一致、阵营随角色。 */
  identity?: SeatIdentityOverlay
  /** 当前生效的疯狂要求；缺省空数组。疯狂在魔典上「看不见」，是注记层不是标记层。 */
  madness?: MadnessDirective[]
  /** 该座位的「可能被当作」声明（间谍/陌客）；是能力说明，不是任何一次判定的结果。 */
  registration?: RegistrationCapability | null
  /** 旅行者登记；undefined = 非旅行者。 */
  traveller?: TravellerEnrollment | null
  /**
   * 说书人私有笔记。《间谍》明确：提示标记以外的记录方式不会被间谍看到，
   * 因此它必须能被遮蔽开关整段移出 DOM。
   */
  privateNote?: string
  /**
   * 死亡玩家是否仍持有投票标记。undefined = 未记录；死亡且未记录时按「仍有一次」解读。
   * 这是手动标记，不由 vote_round.ghostVoteSeatIds 自动扣减（见 risks）。
   */
  ghostVoteAvailable?: boolean
}
```

- **为何需要**：《重要细节》三：状态与玩家绑定而非与角色绑定，且「角色、阵营、生死、醉酒、中毒、疯狂」互相独立。把它们并列挂在座位上，正好对应魔典上一个座位周围的一圈东西；魔典模式的座位长按面板就是这个对象的编辑器。
- **纯记录模式下**：编辑面板仍只呈现 生死 / 中毒 / 醉酒 / 标记 四项，与今天的玩家状态板一致；identity、madness、registration、traveller 折叠在「更多（魔典）」里，不填不报错、不进任何校验。
- **迁移**：所有新增字段可选，旧 PlayerState 直接就是合法的 v2。必须同步改两处既有实现：`playerStateReducer.ts` 的 `samePlayerState()` 只比较 life/poisoned/drunk/markers(id+label)，新字段变化会被判为「无变化」而静默丢弃；`clonePlayerState()` 是浅拷贝，新增的 identity/madness 数组会与前一条事件共享引用。二者都必须扩到全字段结构比较与深拷贝。

#### RegistrationCapability + RegistrationRuling（登记异常）

把「可能被当作」拆成两件东西：座位上的常驻能力说明（静态），和每一次判定各自独立的裁定记录（动态、可在同一夜出现多条不同结果）。

```ts
/** 角色文本声明的「可能被当作」。来自知识包，本身不改变任何判定结果。 */
export interface RegistrationCapability {
  sourceRoleId: string                    // 'spy' | 'recluse' | ...
  mayRegisterAsAlignments: Alignment[]
  mayRegisterAsRoleTypes: RoleType[]
  /** 空数组 = 不限定具体角色。 */
  mayRegisterAsRoleIds: string[]
  /** 《间谍》《陌客》：「即使你已死亡」。 */
  evenWhenDead: boolean
  note?: string
}

/**
 * 一次登记判定。《间谍》：「在同一个夜晚间谍能被多次当作不同阵营或不同的角色」，
 * 且「阵营与角色是独立判断的」（可以是「善良的间谍」或「邪恶的镇民」）。
 * 因此它必须是每次判定一条记录，而不是座位上的持久开关。
 */
export interface RegistrationRuling {
  id: string
  seatId: number
  /** 这次判定服务于哪一次探查；null = 事后补记。 */
  contextRef:
    | { kind: 'wake'; nightRunId: string; wakeItemId: string }
    | { kind: 'day_action'; entryId: string }
    | { kind: 'manual'; label: string }
    | null
  /** 被谁的能力探查到。 */
  observerSeatId?: number | null
  observerRoleId?: string | null
  /** 三个维度分别裁定；未裁定的维度写 null，绝不回落到真实值。 */
  registeredAlignment: Alignment | null
  registeredRoleType: RoleType | null
  registeredRoleId: string | null
  reason?: string
  decidedBy: 'storyteller'
}
```

- **为何需要**：《间谍》范例：厨师看到「1」（当作邪恶），同夜稍晚共情者看到「0」（当作善良）；《陌客》：同一夜不同能力可分别当作善良/邪恶、外来者/爪牙/恶魔。若做成座位上的布尔或单值，就会把「每次可不同」压扁成「本局固定」，直接与百科冲突。同时它解释了为什么送葬者会看到「小恶魔」。
- **纯记录模式下**：纯记录模式下不出现在座位卡上；只在夜间唤醒卡的结果区提供一枚可选的「这次把 N 号当作…」小按钮，不填则完全不产生记录。
- **迁移**：RegistrationCapability 挂 PlayerState.registration（可选）；RegistrationRuling 通过新的 registration_ruling 时间线条目落库，旧归档从不含该 kind。注意它不改变任何 PlayerState，所以状态投影必须显式忽略它——否则会把「被当作邪恶」误投影成「阵营变成邪恶」。

#### MadnessDirective + MadnessRuling（疯狂）

按百科把疯狂建模为「被要求疯狂证明某命题」的指令 + 说书人的裁量记录，而不是座位上的一个布尔。

```ts
export interface MadnessDirective {
  id: string
  /** 要求疯狂证明的命题，自由文本：「自己是贤者」「自己是外来者」。 */
  proposition: string
  /** prove = 必须疯狂证明；avoid = 不得疯狂证明。 */
  stance: 'prove' | 'avoid'
  sourceRoleId?: string        // 洗脑师 / 畸形秀演员 / 小精灵 / 鹰身女妖
  sourceSeatId?: number | null
  issuedInSegmentId?: string | null
  issuedAt?: string
  /** 说书人手动解除时填写；undefined = 仍在生效。系统不因任何事件自动解除。 */
  liftedAt?: string
  /** 角色文本里写明的奖惩原文，纯提示。 */
  rewardText?: string
  penaltyText?: string
}

/**
 * 疯狂裁量。《疯狂》：「说书人有最终裁决权」「可以」惩罚而不是「必须」。
 * 因此这里只记录裁量结论；即便结论是处决，处决本身仍另记一条 ExecutionEntry。
 */
export interface MadnessRuling {
  id: string
  seatId: number
  directiveId: string
  verdict: 'satisfied' | 'not_satisfied' | 'lenient'  // lenient = 对新手放宽
  /** 说书人实际做了什么，自由文本。 */
  actionTaken: string
  reason?: string
  decidedBy: 'storyteller'
}
```

- **为何需要**：《疯狂》与《重要细节》三.4：疯狂「更像是一个现实中的状态」，「你无法在魔典中查看一名角色是否疯狂」，要求是「疯狂地证明某件事」并附奖惩，且是否处罚完全由说书人裁量、对新手可放宽。布尔字段无法承载命题、stance、奖惩文本与裁量结论。
- **纯记录模式下**：纯记录模式下作为「本局记录」里的两条文本条目出现（下达要求 / 裁量结论），座位卡不显示。
- **迁移**：PlayerState.madness 可选、缺省空数组；MadnessRuling 通过新的 madness_ruling 条目落库。魔典模式下必须视觉上明确标注它是「注记层」而非提示标记层——因为它在实体魔典上根本不存在，间谍遮蔽时应连同私有笔记一起隐藏。

#### TravellerEnrollment + ExileEntry（旅行者与流放）

旅行者的入场/离场/阵营是说书人私下决定的事实；流放是与处决完全并行的第二套计票与结算，必须是独立的时间线类型。

```ts
export interface TravellerEnrollment {
  joinedInSegmentId: string | null
  joinedAt: string
  /** 说书人私下指定的阵营：正放=善良，倒放=邪恶（《旅行者》第2、3步）。 */
  alignment: Alignment
  /** 玩家中途离场：移除角色标记与生命标记。 */
  leftAt?: string
  leftReason?: string
}

/**
 * 流放。《旅行者》：流放不是处决、不是投票；
 * 门槛按「所有玩家总数」的一半（不是存活数），死亡玩家可支持且不消耗投票标记，
 * 同一白天可流放任意多次，且流放不消耗当天唯一的处决机会。
 * 因此它绝不能复用 VoteRoundEntry / ExecutionEntry。
 */
export interface ExileEntry extends TimelineBase {
  kind: 'exile'
  exileeSeatId: number
  proposerSeatId: number | null
  /** 门槛数值仍由说书人填写，系统只作为记录，不自动计算、不自动判定。 */
  threshold: number
  /** 举手支持的座位，含死亡玩家。 */
  raisedSeatIds: number[]
  /** 是否通过，由说书人勾选。 */
  succeeded: boolean
  /** 通过也可能不死（有能力保命）。 */
  causedDeath: boolean
  note?: string
}
```

- **为何需要**：《旅行者》全文：旅行者不计入「仅剩两人」的邪恶获胜条件、需通过流放而非处决杀死、角色能力无法影响流放、流放表决不算投票、每白天每旅行者只能被提议流放一次、可随时中途加入或离场。把它塞进 vote_round + execution 会同时污染「每天一次处决」的计数与门槛语义。
- **纯记录模式下**：白天工作台的提名投票步骤旁多一个「流放」次要入口；没有旅行者时该入口不出现。两种模式完全一致。
- **迁移**：PlayerState.traveller 与 SetupAssignment.traveller 可选，undefined = 非旅行者；ExileEntry 是新 kind，旧归档不含。注意 `entryCanUsePhase()` 需为 'exile' 显式返回 phaseKind === 'day'，否则它会落到默认分支（返回 true）而被允许写进夜晚段。

#### GrimoireOp（魔典操作意图）

把魔典上的每一次手势翻译成一条可读的原子意图，挂在既有的 player_state_changed 上，让记录能显示「给3号加了中毒标记」而不是让人对两份快照做 diff。

```ts
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


```

- **为何需要**：《中毒》把能力拆成四部分，其中第 4 部分明确就是「魔典操作」；《间谍》强调标记的摆放位置本身是信息。魔典模式的价值就在于这些操作直接可做，而审计链要求每一次都留痕。ops 让「本局记录」能一眼读懂，也让 AI 建议（如「建议给3号加中毒标记」）有一个可点即落的结构化落点。
- **纯记录模式下**：纯记录模式下玩家状态板的改动同样可以生成 ops（life_set / impairment_set / token_added），只是界面不叫「魔典操作」；不生成也合法（旧路径就是不生成）。
- **迁移**：ops 是 player_state_changed 上的可选字段，旧归档缺失时 UI 回退到既有的 before/after 差分文案（projectTimelineHistory.ts 的 stateLabel 已经在做这件事）。绝不允许出现「只有 ops 没有 after 快照」的条目。

#### PlayerStateChangedEntry v2 + 新增裁定类条目

保持 player_state_changed 作为座位事实变化的唯一入口，同时把「不改变状态的裁定」隔离成独立 kind，避免污染状态投影。

```ts
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
```

- **为何需要**：要求 2 要求魔典上的每次直接操作可追溯可更正；既有 correctionOf / correctionReason 机制已经足够，前提是不新开第二条写状态的路径。登记裁定与疯狂裁量本身不改状态（间谍「被当作善良」并没有变成善良），必须与状态事件分开，否则投影会把裁定误算成状态变更。
- **纯记录模式下**：纯记录模式只会产生不带 ops/origin/batchId 的 player_state_changed，与现状字节级兼容；三个新 kind 在纯记录模式下也可用（它们本来就是「记录」），只是入口更深。
- **迁移**：全部新增字段可选。风险集中在 TimelineEntry 联合类型变宽：`timelineSessionReducer.ts:16` 的黑名单、`timeline.ts:35` 的 entryCanUsePhase、`projectTimelineHistory.ts`、`archiveService.ts:58`、`gameReviewProjection.ts`、`projectSeatActivity.ts`、`Dashboard.tsx:36` 都需要为新 kind 补分支，否则新条目会被静默丢弃或渲染成空白。GameArchiveSummary

#### SetupAssignment v2（配板即初始魔典）

让「配板确认」这一步就能产出一个完整的初始魔典：袋里发什么牌、玩家以为自己是谁、初始阵营、开局就摆上的标记。

```ts
export interface SetupAssignment {
  seatId: number
  /** 真实角色，唯一权威，语义不变。 */
  role: RoleSnapshot
  /**
   * 盲抽袋里实际发给这名玩家的角色标记。
   * 酒鬼：袋里是某个镇民；提线木偶：袋里是镇民/外来者。
   * undefined = 与 role 相同（旧配板的缺省语义）。发身份与交接卡按它出。
   */
  bagRole?: RoleSnapshot | null
  /** 开局身份附加层：玩家自认角色、自认阵营、初始阵营、角色类型覆盖。 */
  identity?: SeatIdentityOverlay
  /** 开局就要摆上魔典的提示标记：「是酒鬼」「是提线木偶」。 */
  initialReminders?: ReminderToken[]
  /** 旅行者登记（旅行者可在任意时刻加入，此处只覆盖开局就在场的）。 */
  traveller?: TravellerEnrollment | null
  /**
   * 该角色在本剧本知识包中的初始阵营，在配板确认时解析并冻结。
   * 这样归档离线回放时无需再查知识包即可解释 alignment 缺省值。
   */
  resolvedInitialAlignment?: Alignment
  resolvedRoleType?: RoleType
}
```

- **为何需要**：《酒鬼》运作方式：移除酒鬼标记、放入一个额外镇民标记、把「是酒鬼」标记放到那名镇民旁边；《提线木偶》运作方式：交换标记并在恶魔邻座放「是提线木偶」；《疯子》：把疯子与恶魔的角色标记在魔典中交换。这些都是配板阶段的魔典操作，必须能被配板结果表达，否则魔典模式一开局就是错的，交接卡也发错身份。
- **纯记录模式下**：纯记录模式下配板界面仍只显示 role；bagRole 只影响「发身份/交接卡」输出的那一张牌（这在纯记录模式下同样必要，酒鬼本来就要发镇民牌），identity 与 initialReminders 折叠为可选高级项。
- **迁移**：全部新增字段可选。`projectCurrentAssignments()` 目前重建 assignment 时只拷贝 {seatId, role}，会把新字段整体丢掉，必须改为整体展开；同时它用 `current.role.id !== change.fromRole.id` 做守卫，说明真实角色的唯一变更路径仍是 setup_changed，这一点保持不变。

#### GrimoireSettings（模式与魔典视图状态）

把「纯记录 / 魔典+记录」做成会话级可切换的呈现模式，并把模式切换本身也纳入审计。

```ts
export type SessionSurfaceMode = 'record_only' | 'grimoire'

export interface GrimoireSettings {
  /** 缺省 'record_only'：旧归档没有这个字段，必须按纯记录模式回放。 */
  mode: SessionSurfaceMode
  /** 座位在圆环上的排布，纯展示。缺省按 seatId 顺时针均分。 */
  layout?: { seatId: number; angle: number }[]
  /**
   * 遮蔽态。把设备递给间谍看魔典时开启：
   * privateNote、madness、registration 三个「实体魔典上不存在」的层必须整段移出 DOM，
   * 而不是降低透明度（沿用 night-workbench 的 privacyShielded 先例）。
   */
  shielded?: boolean
  /** 是否显示注记层（疯狂/登记）。缺省 true，遮蔽时强制 false。 */
  showAnnotations?: boolean
  modeChangedAt?: string
}

// GameSessionState 增补一个可选字段：
// grimoire?: GrimoireSettings

/** 模式切换不改变任何游戏事实，但会改变「这份记录有多完整」的解读，所以留一条痕。 */
export interface SessionModeChangedEntry extends TimelineBase {
  kind: 'session_mode_changed'
  from: SessionSurfaceMode
  to: SessionSurfaceMode
  /** 切到 grimoire 时，说书人是否声明「已按当前实体魔典补录完毕」。 */
  backfillDeclared?: boolean
}
```

- **为何需要**：作者的前提是「有时没有实体魔典」，所以模式是每局甚至每局中途可变的。同时《间谍》要求魔典可被玩家查看而自定义笔记不可见，这决定了遮蔽必须是模型级开关而不是 CSS。归档回放也需要知道这局当时是哪种模式，否则会把「纯记录模式下本来就没记标记」误读成「说书人漏记」。
- **纯记录模式下**：这就是纯记录模式的开关本身。mode='record_only' 时魔典视图不挂载，所有魔典专属字段仍可存在（例如从上一局或补录来的），只是不显示。
- **迁移**：GameSessionState.grimoire 可选，undefined 一律视为 record_only，schemaVersion 保持 1（既有 jsonArchiveRepository 只校验 schemaVersion===1|undefined，新增可选字段不会被拒）。session_mode_changed 是新 kind，同样需要补齐各处 switch 分支。

#### AIGrimoireProposal（AI 建议的魔典操作）

把 AI 现在的自由文本 stateChangeDrafts 升级成可点即落的结构化建议，同时在类型层面钉死「AI 只产出草稿，落地必须由说书人确认」。

```ts
/**
 * AI 建议的魔典操作。它永远只是草稿：
 * 采纳时由说书人点确认 → 生成一条 player_state_changed（origin='grimoire', fromAdvice=…），
 * 这条建议本身永远不写入 timeline，也不改变任何 PlayerState。
 */
export interface AIGrimoireProposal extends AIAdviceReference {
  id: string
  /** 与 AIResultAdvice.stateChangeDrafts 的自由文本一一对应的结构化版本。 */
  ops: GrimoireOp[]
  summary: string          // 「建议给3号加中毒标记（来源：投毒者）」
  rationale: string
  /** 采纳前必须由说书人自行复核的点。 */
  authorityWarnings: string[]
  status: 'proposed' | 'applied' | 'dismissed'
  /** 采纳后回填，形成「建议 → 落地事件」的双向可追溯。 */
  appliedTimelineEntryId?: string
}

// AIResultAdvice 增补：
//   grimoireProposals?: AIGrimoireProposal[]
// 既有的 stateChangeDrafts: string[] 保留不动，作为无法结构化时的降级表达。
```

- **为何需要**：这是「电子魔典是说书人直接操作状态的界面、不是规则引擎」这条调和点的类型级保证：AI 能生成的最强对象是一组 op，而 op 只有经过说书人确认生成 player_state_changed 才成为事实。status + appliedTimelineEntryId 让复盘时能看出哪些建议被采纳、哪些被否决。
- **纯记录模式下**：纯记录模式下同一份建议以文本形式呈现在夜间唤醒卡的「状态改动草稿」区（即今天的行为），点击后跳到玩家状态板预填，不出现魔典手势。
- **迁移**：挂在 AIResultAdvice 上的可选字段；AIResultAdvice 存在于 NightRunState.aiAdviceLog 里并进归档，旧归档缺失即为空。必须保证 proposals 不参与任何状态投影——`projectCurrentPlayerStates` 只看 timeline，天然满足，但要有测试守住。

### 审计链

审计链的形状不变，只加宽不改道。一、写状态的路径仍然唯一：魔典上的任何手势（落标记、拖标记、翻面、点生死、改阵营、换「以为」的那张牌、下达/解除疯狂要求）都收敛成一条 player_state_changed——完整 before/after 快照 + reason + 新增的 ops[]（原子意图）+ origin='grimoire' + contextRef（关联的 nightRunId/wakeItemId）。ops 是描述不是命令，投影仍然只读 after 快照，所以旧归档（无 ops）和新归档投影出完全一致的当前局面，`projectCurrentPlayerStates` 的算法一行都不用改。二、同一手势波及多座位（「限」同时毒两人，百科明确「同时进入，不分先后」）时按座位各写一条、共用 batchId，展示与更正都按 batch 成组，既不伪造顺序也不需要引入多座位事件类型。三、更正机制完全复用：魔典上的「撤销」不是删除，而是追加一条新的 player_state_changed，correctionOf 指向原条目、correctionReason 必填（TimelineBase 已有）；确认落库之前的手势停留在草稿缓冲里，从不进时间线。四、不改变状态的判断隔离成两个新 kind：registration_ruling（间谍/陌客的每一次「这次被当作什么」）和 madness_ruling（疯狂裁量），它们不参与状态投影，因此「被当作邪恶」永远不会被误投影成「阵营变成邪恶」；疯狂要求的下达与解除因为确实改变了 PlayerState.madness，所以走 player_state_changed + ops，不另开 kind。五、流放独立为 exile，与 vote_round / execution 平行，门槛与结果都由说书人填写与勾选，绝不消耗当天的处决机会。六、昼夜段规则原样保留：开放的夜段内的魔典操作带该 segmentId；配板阶段与不属于任何开放段的补录带 segmentId=null（沿用 setup_confirmed/setup_changed 的先例），因此「摆一枚标记」不会偷偷创建第 4 夜。七、AI 侧形成闭环但不越权：AIGrimoireProposal 只存在于 NightRunState.aiAdviceLog，采纳时生成的事件用 fromAdvice 指回建议、建议用 appliedTimelineEntryId 指向事件，复盘时能看出哪些建议被采纳、哪些被否决，而建议本身永远不是事实。八、归档：GameArchiveRecord.schemaVersion 保持 1（既有仓库只校验 1|undefined，新增可选字段不会被拒），GameArchiveSummary 可加 exiles?/rulings? 等可选计数器，旧归档读为 undefined 而不是 0 与「确实为 0」区分开。

---

## 五、模式切换与补录

### 模式归属：每局冻结 + 全局默认（不是二选一）

模式既不能纯全局也不能纯每局。纯全局：说书人改了偏好后回看旧归档，视图会变，历史局的呈现就不再忠于当时的主持方式；纯每局：每开一局都要重问一次，是典型的甩锅。方案是两层：(1) `GameSessionState` 新增 `hostingMode: 'record' | 'grimoire'`，在开局时写入并随会话持久化、随归档冻结；(2) 新增 `src/services/settings/hostingPreferences.ts`，完全照抄 `archiveRuntimeSettings.ts` 的形状（storageKey + defaults + normalize + read/save/reset），存 `{ defaultHostingMode, hasCompletedFirstRunChoice }`，只作为新局初值来源，不参与任何运行时判断。运行时任何地方读模式都只读 `session.hostingMode`，不读偏好——这条要写进 architecture-guardrails 并加测试，否则两个真相源会漂移。

**结论**：新增 `HostingMode = 'record' | 'grimoire'` 于 src/features/game-session/model/sessionTypes.ts；`GameSessionState.hostingMode` 设为必填（由 createEmptyGameSession 从偏好注入，测试里显式传）；新建 src/services/settings/hostingPreferences.ts 存储键 `botc-copilot-hosting-preferences-v1`，默认 `{ defaultHostingMode: 'grimoire', hasCompletedFirstRunChoice: false }`。禁止任何组件 import hostingPreferences 做渲染判断，只允许 App 层在建局时读一次。

### 前置阻断项：loadGameSession 会静默清空进行中的对局，扩展字段前必须先修

`isSession()` 用 `session.schemaVersion === 1` 硬相等判断，不匹配就直接 `createPrototypeGameSession()`；`loadGameSession` 外层 catch 也无条件回退到样例局。这意味着：一旦为双模式把 schemaVersion 提到 2，所有装了旧版本、正在进行第 3 夜的说书人刷新页面后会看到一局全新的样例局，且旧数据被下一次 persist 直接覆盖——线下主持中途发生这件事是不可挽回的。这是整个双模式改造里唯一的高危项，必须排在第一位。

**结论**：分三步：(1) 先单独提交一个「安全加载」补丁——把 `isSession` 的版本判断改为 `schemaVersion === 1 || schemaVersion === 2`，并在解析失败/校验失败时先把原始字符串写入 `botc-copilot-session-recovery-v1` 再回退，UI 顶部挂一条「上一局存档无法读取，已保留备份，可在【本局档案 · 故障恢复】导出」；(2) 在 `normalizeSession` 里做 1→2 迁移：缺 `hostingMode` 的旧存档一律补 `'record'`（历史上就是纯记录模式主持的，不能猜成 grimoire），补 `hostingModeHistory: []`，然后写回 schemaVersion 2；(3) 再开始加双模式字段。三步之间各自有测试，不合并提交。

### 开局选择：问「魔典在哪」，不问「选哪个模式」

让用户在开局时面对「纯记录模式 / 魔典+记录模式」这两个自造名词，是把设计决策转嫁给用户。开局选择应该出现在配板确认之后的「发身份 / 配板交接卡」那一步（说书人此刻正好手里拿着实体魔典或没拿），问的是一个他不用思考就能回答的物理事实，并且默认项已经替他选好了。

**结论**：交接步骤内嵌一张单选卡，文案定死为：

标题「这局的魔典放在哪里？」
· A（默认选中，大卡）「就用这个工具当魔典 —— 身份、生死、中毒、标记都在这里点。配板结果已经在魔典上了，不用再抄一遍。」
· B（并列，同尺寸不弱化）「我有实体/官方魔典 —— 工具只做笔录：夜序、夜间记录、提名投票、AI 建议。座位状态我自己在魔典上管。」
· B 选中后原地展开原本的配板交接清单 +「复制清单」按钮。
· 底部灰字一行「随时能改，改了不会丢已录的内容。」
· 复选框（默认不勾）「以后新开的局都这样」——只有勾了才写 `defaultHostingMode`。

不要做全屏 modal，不要做「稍后再说」的第三选项（第三选项等于没选，会让后续所有代码要处理 null 模式）。

### 中途切换：双向、无限次、无损，但记录在会话元数据而不是 timeline

因为两种模式共用同一份 session，切换在数据层面是零成本的，不该设任何限制或确认地狱。但归档回看时需要知道「这局前两夜是纯记录、第三夜起才开了魔典」，否则会误判为「说书人前两夜什么都没管」。这条信息不属于对局事实（timeline 只装权威对局事件：配板、夜间行动、投票、处决、状态变更），把它塞进 timeline 会污染 `projectEffectiveTimelineEntries` 和归档统计。

**结论**：新增 `GameSessionState.hostingModeHistory: { mode: HostingMode; changedAt: string; fromPhaseLabel: string }[]`（建局时写入第一条）。切换 action 命名为 `set-hosting-mode`，只改 `hostingMode` 并 append history，不碰 timeline、不碰 phaseSegments、不碰 playerStates。入口放在【本局档案 · 主持设置】里，不放主持台顶栏 PhaseTrack（顶栏是 48px 高频误触区，且 UI_REDESIGN_PLAN 已经把它的右端两枚入口定死为「本局记录」「收尾」）。切换按钮不需要二次确认——真正需要交接卡的是 grimoire→record 方向（见下条），record→grimoire 方向应当即时生效

### 纯记录 → 魔典：不做阻塞式补录向导，做「空魔典 + 缺口徽章 + 建议式补录」

先澄清一个容易被误判的点：切过去时并不是「什么都没有」。身份是权威已知的——`projectCurrentAssignments` 从 `setup_confirmed` + `setup_changed` 投影出每个座位当前角色，只要说书人用工具配过板，魔典的角色环开箱即满。真正可能空的只有 `PlayerState`（life/poisoned/drunk/markers）：`initialPlayerStates` 建局时全是 alive/未中毒/无标记，而纯记录模式下说书人多半没有逐条 dispatch 过 `confirm-player-state-change`。所以缺口是有界且可枚举的，不需要一个五分钟的向导——线下主持中途弹一个必须填完才能继续的向导是灾难。

**结论**：切换后立即渲染魔典（不等补录），顶部挂一条可关闭的 completeness 条，文案带具体数字而不是笼统提示：「魔典已按配板生成 · 12 个座位身份齐全 · 生死毒醉标记还没录过 —— 从第 1 夜到现在有 9 条记录可能涉及状态变化」，两个按钮「逐条核对（约 1 分钟）」「先这样，边走边补」，右侧「不再提示」。

「逐条核对」是一串可跳过的建议卡，每张一条，来源必须显式标注：
· `execution` 条目 → 「第 2 天处决了 7 号 · 建议标记为死亡 [标记] [跳过]」
· night_action 里 outcome 语义含死亡/中毒的 → 「第 3 夜 · 记录 #xx 提到 3 号被恶魔选中 · 建议给 3 号加死亡 [标记] [跳过]」
· AI `stateChangeDrafts` 历史 → 只作为最低优先级提示，且必须标「这是 AI 当时的草稿，不是记录」


### 补录事件的时间归属：别让复盘时间线说谎

补录产生的 `player_state_changed` 的 `createdAt` 是「第 4 天补录的那一刻」，但它描述的事实发生在「第 2 夜」。如果不区分，复盘和 AI 复盘草稿会读出「3 号在第 4 天才中毒」这种假事实；而如果为了好看去伪造 createdAt，又会破坏 `projectCurrentPlayerStates` 依赖的时序投影（它严格按 createdAt 排序叠加，插入历史时间点会改变后续覆盖顺序，可能把后来的正确状态覆盖掉）。

**结论**：createdAt 一律用真实补录时刻，绝不回填。改为在 `PlayerStateChangedEntry` 上加两个可选字段：`backfill?: { attributedPhaseSegmentId: string; sourceEntryId?: string }`。投影逻辑完全不变（仍按 createdAt），只有展示层用它：本局记录里这条显示为「第 4 天 · 补录 · 归属第 2 夜」，复盘时间线把它挂在第 2 夜下方但加「事后补录」角标。AI 复盘上下文里也要带这个标记，提示词加一句「标注 backfill 的状态变更是事后补录，其发生时间不可靠，不要据此推断说书人当时的判断」。

### 魔典 → 纯记录：数据零丢失，但「看不见」本身就是风险，必须给交接卡

降级方向在数据层是绝对安全的——session 里的 role/life/poisoned/drunk/markers 一个字段都不删，切回去只是不渲染魔典环，随时切回来全部还在。真正的风险是认知性的：说书人切回纯记录后，可能仍以为工具在替他记状态，于是既没在实体魔典上补、也没在工具里点，两边都空。所以降级必须比升级更「有摩擦」，方向是不对称的。

**结论**：降级时弹一张一次性交接卡（这是唯一需要二次确认的模式切换）：

标题「切回纯记录 · 状态由你和实体魔典负责」
正文「工具会保留现在魔典上的全部内容（不会删），但不再显示为魔典，也不会再提醒你更新。请确认实体魔典上已经有这些：」
然后列出当前所有非默认状态的完整清单：「死亡 3 人：4号 7号 11号 / 中毒 1 人：3号 / 标记 2 条：5号「僧侣保护」、9号「已用死亡票」」，附「复制清单」按钮（复用配板交接卡的输出能力）。
底部「[留在魔典模式] [已抄好，切回纯记录]」，主动作是前者。

降级后不要真的把状态藏起来：纯记录模式的「玩家状态板」仍要显示这份摘要，只是折叠、低密度、不带交互提示。形式上是降级展示，不是隐藏——两模式的信息可达性差异应当是「密度和交互成本」，不是「有和无」。

### 归档格式：标注模式 + 魔典完整度，跨模式回看默认放开但必须挂诚实条

`GameArchiveRecord` 内嵌完整 `session`，所以加了 `hostingMode` 之后归档天然带上了模式。但只有模式标签还不够：一局标着 grimoire 的对局，也可能说书人开了魔典却只录了三个座位——回看时空白座位到底是「当时确实没状态」还是「当时没录」，光靠模式字段分不出来，而这个区分直接决定复盘结论和 AI 复盘草稿的可信度。

**结论**：归档记录加三个字段（配合 localArchiveAdapter 的 1→2 迁移，旧归档补 `hostingMode: 'record'`）：`hostingMode`、`hostingModeHistory`、以及 `grimoireCompleteness: { seatsWithRole: number; totalSeats: number; stateChangeCount: number; markerCount: number }`。

归档列表卡片上用一枚小标签区分「魔典局」「笔录局」「混合（第3夜起开魔典）」。

跨模式回看放开，但规则不对称：
· 用纯记录视图看魔典局 —— 永远安全，无提示。
· 用魔典视图看纯记录局 —— 允许（按 timeline 事后重建魔典），但顶部常驻一条冷色条：「这局用笔录模式主持，魔典是事后按记录重建的。座位上的空白表示当时没有录入，不

---

## 六、边界重划

已通读 PRODUCT_VISION / AI_AUTHORITY_BOUNDARY / ABILITY_SETTLEMENT_BOUNDARY / PUBLIC_RELEASE_BOUNDARY / README / THIRD_PARTY_NOTICES / verify-architecture.mjs / UI_REDESIGN_PLAN_2026-08-04.md，并抽查了 ui-design-system.md、素材 manifest（718 项，官方 136 / 社区 582）、session 与 archive 服务的持久化实现。结论：作者解除的只有「不做第二套魔典视图」这一条产品约束，文档中真正需要改写的原句共 9 处（PRODUCT_VISION 6 处、README 2 处、ui-design-system 1 处），其余边界一条都不能松，但必须在魔典语境下重新表述——因为「不自动结算」在纯记录模式下靠「工具根本没有状态」天然成立，在魔典模式下则必须靠可检验的实现约束来守。核心调和原则可以固化成一句工程判据：**电子魔典的每一次状态写入都必须能追溯到一次说书人手势，且一次手势只能产生一次写入**；任何级联、派生、定时或 AI 直写都是越界。此外识别出三类新增风险：唯一事实来源带来的数据丢失/误操作放大（现状是 localStorage 单副本 + 局终才归档）、整屏局面的防窥、以及魔典模式对提示标记图形的新素材需求（现有 manifest 只覆盖角色图标，不含 reminder token / 裹尸布 / 投票令牌，且官方源基本不单独提供这类图形，极易滑向截图切图）。verify-architecture.mjs 目前只有 4 类检查（行数预算、4 个旧引擎符号、共享 UI 解耦、AI 硬编码剧本），完全不覆盖魔典模式的越界形态，建议新增 9 条静态检查，其中「reducer 不得 import services/ai」「角色包不得 import GameSessionState」「token 类型不得含 effect 类字段」三条最有价值，因为它们把「不是规则引擎」变成了依赖方向问题，可 100% 静态验证。

### 必须改写：PRODUCT_VISION 定位句与「不是第二套魔典」条款

这两句是全库中最明确排除电子魔典的表述，作者的新决策直接与之冲突，不改写则后续所有魔典模式工作都在违反产品文档。

原句 1（dev-docs/PRODUCT_VISION.md:5）：「以官方/实体魔典为主要空间视角，为线下说书人提供配板草稿、昼夜记录、夜序轮换、白天投票和 AI 建议草稿；说书人始终是唯一的权威操作者。」

原句 2（dev-docs/PRODUCT_VISION.md:9）：「不是第二套官方魔典，不复制官方面板的完整空间局面。」

注意原句 2 里其实捆绑了两件事：一是「不做魔典视图」（产品取舍，作者已解除），二是「不复制官方面板」（外观/商誉风险，不能跟着解除）。改写时必须把这两件事拆开，否则会顺手把知识产权边界一起松掉。

**要求**：新句 1（替换 L5）：「为线下说书人提供配板草稿、昼夜记录、夜序轮换、白天投票和 AI 建议草稿。提供两种可切换的主视图模式：纯记录模式假设说书人另有实体魔典，工具只做记录台；魔典模式提供电子魔典作为主视图，由说书人直接操作局面。两种模式下说书人都是唯一的权威操作者，工具不做任何自动结算。」

新句 2（替换 L9）：「不是自动规则引擎。魔典模式提供的电子魔典是说书人手动操作局面的界面，不是官方魔典的替代品、不与官方应用同步，也不复刻官方应用的视觉外观与商标标识；界面交互参考社区工具（如 botc.games）的信息组织方式，不进行像素级复制。」

同时在 PUBLIC_RELEASE_BOUNDARY.md:74-79 的「禁止措辞」清单中保留「官方魔典替代品」这一条不动，并补一行说明：「即使产品已提供电子魔典视图，对外措辞仍禁止使用『官方魔典替代品』『官方应用平替』。」

### 必须改写：PRODUCT_VISION 中把「魔典」与「官方魔典同步」混为一谈的三处

这三处把「电子魔典视图」和「官方魔典同步器」写在同一个否定列表里，改写后必须让两者分家：前者开放，后者永久禁止。

原句 3（L11）：「不是线上游戏平台；常驻玩家端、玩家收件箱、官方魔典同步、半自动点击器、OCR 和真实 AI 接口均不属于当前原型交付。」——附带问题：「真实 AI 接口」已与 README:226 的「后端已有 OpenAI-compatible provider 配置」矛盾，属于过期表述，应一并修掉。

原句 4（L15）：「点座位才显示身份、状态编辑与单座位结构化记录，不替代官方/实体魔典；暂列处决只在白天工作台显示。」

原句 5（L43）：「仍不做：登录、常驻玩家端、玩家收件箱、真实消息、自动结算、自动昼夜推进、官方魔典同步、半自动点击器、DOM 注入、WebSocket 同步或逆向接口。」

**要求**：新句 3（替换 L11）：「不是线上游戏平台；常驻玩家端、玩家收件箱、与官方应用的数据同步、半自动点击器和 OCR 均不在路线内。真实 AI 接入已通过后端 provider 实现，但仍只产出草稿。」

新句 4（替换 L15）：「纯记录模式下点座位才显示身份、状态编辑与单座位结构化记录，不替代说书人手边的实体魔典；魔典模式下座位与标记常驻可见，由说书人直接操作，但仍不与任何外部魔典同步。暂列处决在两种模式下都只在白天步骤中显示。」

新句 5（替换 L43）：「仍不做：登录、常驻玩家端、玩家收件箱、真实消息、自动结算、自动判定胜负、自动昼夜推进、与官方应用同步、半自动点击器、DOM 注入、联机同步（WebSocket / BroadcastChannel / 共享房间链接）或逆向接口。电子魔典视图是单机单屏的说书人界面，不因为它的存在而引入其中任何一项。」

### 必须改写：PRODUCT_VISION「官方/实体魔典协作取舍」整章需要模式条件化

该章（L52-57）整体假定「本工具没有局面视图，因此需要交接卡把结果搬到实体魔典」。在魔典模式下这个前提消失，但交接卡不能删——它在纯记录模式下仍是核心交付物，且 UI_REDESIGN_PLAN 已把它做成完成态。

原句 6（L54）：「MVP 只做手动录入与『配板交接卡』：把本工具确认的座位、昵称、身份和恶魔伪装输出为人工核对清单，由说书人照着录入官方/实体魔典。」

原句 7（L55）：「官方/实体魔典中的后续变化也由说书人手动录入本工具；本工具不尝试保持两边自动一致。」

L56-57（不做同步器/点击脚本/DOM 注入/OCR）无需改动，逐字保留。

**要求**：章节标题改为「与实体魔典的协作（纯记录模式）／与电子魔典的关系（魔典模式）」，并按模式分列。

新句 6（替换 L54）：「纯记录模式下，本工具只做手动录入与『配板交接卡』：把确认的座位、昵称、身份和恶魔伪装输出为人工核对清单，由说书人照着录入自己的实体魔典。魔典模式下不需要交接卡搬运，但交接卡入口保留，供说书人在中途切回实体魔典时使用。」

新句 7（替换 L55）：「任一模式下，外部魔典（实体或官方应用）中的变化都由说书人手动录入本工具；本工具不尝试保持两边自动一致。魔典模式下电子魔典成为工具内的权威投影，但它同样不代表外部魔典的状态。」

另需补一条新约束：「两种模式共享同一 GameSession，不得为魔典模式建立第二套状态模型或第二个持久化 key。模式切换只切换视图，不迁移、不转换、不丢弃任何记录。」

### 必须新增：PRODUCT_VISION 缺一节「双模式合同」

作者的决策引入了一个文档里完全不存在的概念（可切换的两种主视图），如果不写成明确合同，实现时最可能的两种走偏是：(a) 魔典模式变成第三套并列界面，夜序/投票/AI 建议在魔典之外又开一套（作者明确反对）；(b) 魔典模式做完后纯记录模式无人维护，悄悄退化成不可用。

作者已给出关键设计约束：现有全部功能（夜序、夜间记录、白天提名投票、本局记录、AI 建议、配板、发身份、复盘）要以辅助按钮等形式自然融入与电子魔典的交互，而不是并列的另一套界面。这句话必须原样进文档，因为它是评审时唯一可用的取舍依据。

**要求**：在 PRODUCT_VISION.md「产品不是」之后新增章节「主视图模式合同」，至少写清 6 条：
1. 两种模式：纯记录模式（阶段轨道 + 主持台 + 交接卡，假设说书人另有实体魔典）与魔典+记录模式（电子魔典为主视图）。默认模式在开局前选择，局中可随时切换。
2. 同源：两模式读写同一 GameSession、同一时间线、同一持久化 key。切换不产生任何记录，也不改变阶段。
3. 融入而非并列：魔典模式下，夜序、夜间记录、白天提名投票、本局记录、AI 建议、配板、发身份、复盘一律以魔典上的辅助入口（座位上下文操作、顶部轨道入口、覆盖层）出现，禁止在魔典之外再挂一套等价的全屏工作台。
4. 纯记录模式是保底通道：魔典模式的任何功能都不得成为完成一局主持的必要条件；每次发布前必须有一条纯记录模式跑完整局的验收。
5. 阶段推进的唯一门在两模式下相同：黄昏/黎明/收尾交接卡。魔典视图上的任何操作都不推进阶段。
6. 魔典视图不是权威源之外的第二真值：它渲染的是 projectCurrentPlayerStates 等既有投影，不得持有独立的局面状态。

### 必须改写：README 两处定位句

原句 8（README.md:8）：「它不是官方魔典，也不是线上游戏平台，更不是自动规则引擎。」——「不是官方魔典」在有了电子魔典视图后会让读者困惑，需要改成「不是官方的魔典」而非「不提供魔典」。

原句 9（README.md:12）：「说书人依然使用官方/实体魔典作为主要局面视角，同时在平板、电脑或 VPS 页面上打开这个工具，作为记录台和 AI 顾问。」——这句直接与新决策冲突。

README 的「不做什么」清单（L184-193）中「不同步或操作官方魔典」「不做常驻玩家端/收件箱」「不自动判定胜负」等全部保留原样，只需在清单前加一句限定语。

**要求**：新句 8（替换 L8）：「它不是官方应用，不是线上游戏平台，更不是自动规则引擎。它可以提供一个说书人自用的电子魔典视图，但这个魔典里的每一次改动都由说书人亲手完成。」

新句 9（替换 L12）：「支持两种用法：如果你手边有实体魔典，用纯记录模式，工具只当记录台和 AI 顾问；如果没有实体魔典，用魔典模式，工具在平板或电脑上直接充当你的魔典，夜序、记录、投票、AI 建议都从魔典上的按钮进入。」

在 L184「## 不做什么」标题下补一行：「以下边界在两种模式下同等有效，不因为提供了电子魔典视图而放宽：」，清单本身逐条保留。

### 必须改写：ui-design-system.md 的 SeatButton/RoleDisc 条款会让魔典视图违反自家设计系统

ui-design-system.md:34 写着「角色 PNG 与圆形 Token 只保留给 RoleDisc，避免把座位操作误解为另一套魔典」，:29 又规定 SeatButton「只显示号码」。魔典模式的核心恰恰是「座位就是带角色图标和标记的圆形 Token」——不改这两条，魔典视图落地时会被设计系统评审卡住，或者更糟：有人绕过 SeatButton 另写一套座位组件，直接造成两套座位交互并存。

**要求**：改写 ui-design-system.md:34 为：「纯记录模式下座位是号码键（SeatButton），不承载角色图像，避免被误解为魔典；魔典模式下座位是角色 Token（GrimoireSeat，复用 RoleDisc 的图像与降级规则），承载图标、状态环与提示标记。两者是同一 seatId 的两种呈现，共用选中态契约（勾选 + 描边 + 颜色 + aria-pressed），不得各自发明选中语义。」并在「当前共享组件」清单中显式登记魔典模式新增的组件名，避免绕过共享层另起炉灶。

### 守住的边界（一）：不自动结算——魔典模式下的可检验判别标准

这是最关键的一条。在纯记录模式下「不自动结算」几乎是免费的，因为工具根本不持有局面；在魔典模式下工具持有完整局面，只要有人写一行「加了中毒标记就把占卜师结果标为不可信」，产品就变成了规则引擎，而且这种改动通常以「体贴的小优化」形式提交，评审时很难拒绝——除非有成文判据。

可以把作者的调和点固化成一句工程判据：**每一次权威状态写入都必须能追溯到一次说书人手势，且一次手势只能产生一次写入。**

**要求**：在 ABILITY_SETTLEMENT_BOUNDARY.md 新增「魔典模式的越界判别」章节，列出以下 6 条「出现即越界」的实现特征（可在 code review 和自动检查中逐条对照）：
1. **级联写入**：一个 reducer case 在处理某个 action 时修改了它名字之外的状态。例：`add-reminder` 同时改了 `alive`。判据——每个 case 的 diff 字段集必须是该 action 名字的字面子集。
2. **派生值入库**：把渲染层算出来的结论写回 session。存活数、票数门槛、是否达到多数、恶魔是否已死都可以显示，但一旦出现在 dispatch 的 payload 里就是越界。判据——`majority`、`aliveCount`、`isDemonDead` 这类计算值只能进 render，不能进 action。
3. **定时/副作用推进**：任何 setTimeout / setInterval / useEffect 触发的状态写入。白天计时器是唯一豁免，且它不写日志、不改状态（PRODUCT_VISION:18 已有此约束）。
4. **标记即效果**：提示标记（reminder token）的数据结构里出现 `effect` / `appliesTo` / `modifies` / `onNight` / `resolve` 之类字段，或放置标记会改变任何其它座位的字段。标记只能是贴纸：一个 seatId + 一段文本 + 一个来源角色，仅此而已。
5. **能力可执行化**：角色知识从数据变成函数，出现 `app

### 守住的边界（二）：不自动判胜负、不自动推进昼夜——魔典模式下的重述

魔典模式会让这两条变得比现在更脆弱：一屏就能看到「恶魔已死」「存活 3 人其中 2 邪恶」，写一个胜负横幅的诱惑极大；同时魔典视图会让说书人长时间停留在同一个界面，「顺手加一个自动切夜」的需求会自然浮现。UI_REDESIGN_PLAN 已经把黄昏/黎明/收尾做成唯一的相位门（:46「它是相位之间唯一的门，也是全部不可逆动作的唯一落点」），魔典模式必须继承而不是绕过这个设计。

**要求**：在 PRODUCT_VISION 与 ABILITY_SETTLEMENT_BOUNDARY 中同时写明：
1. 胜负：魔典视图可以显示客观计数（存活数、已死数、阵营已知数），但禁止显示任何形式的结论性判定（「邪恶获胜」「善良只剩 X 人，恶魔胜利条件已达成」「胜负条件已满足」）。判据——UI 文案中不得出现胜/负/获胜/结束条件达成等词，除非它出现在说书人已手动选定胜方之后的回执里。
2. 昼夜：相位推进的唯一入口仍是交接卡（黄昏 / 黎明 / 收尾），魔典视图上的任何座位操作、标记操作、夜序操作都不推进相位；夜序光标的前进仍需说书人显式选择「停留 / 下一位」（AI_AUTHORITY_BOUNDARY:15）。判据——魔典组件树中不得出现 dispatch 相位类 action。
3. 死亡：魔典上的「裹尸布 / 死亡态」切换是一次独立手势，不得由夜间结果、投票结果或标记自动触发。UI_REDESIGN_PLAN:135 已就此立过规矩（「绝不能由夜间结果自动推死亡」，黎明播报只做差分提示），魔典模式沿用：可以提示「本夜 2 项记录标注死亡结果，状态未更新」，不能替说书人更新。

### 守住的边界（三）：AI 只给草稿——魔典模式需要新增「魔典操作草稿」这一层

现有 AI 草稿契约（SettlementDraft、adviceId + contextRevision + sourceDraftRevision + knowledgeVersion）是为夜间结算表单设计的，落点是表单字段。魔典模式引入了新的落点：AI 会建议直接的魔典操作（作者举的例子就是「建议给 3 号加中毒标记」）。如果不为这类建议定义草稿层，最省事的实现就是让 AI 返回一个 action 让前端 dispatch——那一步就是全部边界的崩塌点。

**要求**：1. 在 AI_AUTHORITY_BOUNDARY.md 的「AI 不可以」清单中追加：「不可以放置、移除或移动魔典上的任何提示标记、角色 Token、死亡态或状态环。」
2. 新增数据结构 `GrimoireActionDraft`，与 SettlementDraft 平级：{ draftId, source: 'ai' | 'rule-hint', targetSeatId, proposedChange（枚举：add-reminder / remove-reminder / set-status / set-death / change-identity）, payload, rationale, adviceId, contextRevision, knowledgeVersion }。约定：草稿只能渲染成魔典上的**虚线幽灵态**（与已落地标记视觉明显不同），必须点击才 commit，commit 后写入时间线并保留 AI 来源链（沿用 AI_AUTHORITY_BOUNDARY:17 的「已改为说书人选择」机制）。
3. 按钮文案沿用 ABILITY_SETTLEMENT_BOUNDARY:133-139 的三段式：`生成建议` / `采用草稿` / `确认落盘`，禁止出现「应用」「执行」「AI 已处理」。
4. 验收标准（补进 ABILITY_SETTLEMENT_BOUNDARY:154-159）：「关闭 AI 后，魔典模式下的全部座位、标记、状态、死亡操作仍可完整手动完成」「AI 建议在未点击确认前，魔典上不存在任何实心标记，导出的 session 里不存在

### 守住的边界（四）：不做玩家端/联机——参考 botc.games 的视觉，不能连它的架构一起参考

这是本次改动里被低估的风险。botc.games 是一个**联机**工具：它的魔典之所以长成那样，是因为有房间、有玩家客户端、有实时同步。一旦以它为参考实现魔典视图，最省力的路径就是把它的状态同步模型一并借鉴（房间 id、WebSocket、玩家只读链接、二维码入座）。这些每一项都在 PRODUCT_VISION:43 和 README:191 的禁止清单里，但没有任何自动检查拦得住它们。UI_REDESIGN_PLAN:81 已经注意到要只借鉴「说书人操作面从不卸载」的部分，但没有明文禁止联机部分。

**要求**：1. 在 PRODUCT_VISION「视觉关系」章节补写：「魔典模式借鉴 botc.games 的：魔典圆环布局、座位 Token 与提示标记的空间组织、操作面不卸载、历史事件流。不借鉴：房间与联机同步、玩家客户端、玩家只读链接、二维码入座、任何跨设备实时状态共享。本工具的魔典是单机单屏说书人视图。」
2. 明确一个例外的边界：「投屏 / 给单个玩家看」的全屏遮蔽层（UI_REDESIGN_PLAN:165-176、现有 PrivateRevealOverlay）是同一台设备上的临时覆盖层，不是玩家端，不涉及任何网络传输——这个区分要写进文档，否则会被当成「已经有玩家可见面了，做个玩家端也不过分」的先例。
3. 加静态检查（见架构守护条目）：src/ 全域禁止 WebSocket / EventSource / BroadcastChannel / socket.io / peerjs。

### 新增风险（一）：魔典模式下工具成为唯一事实来源，但持久化仍是 localStorage 单副本

这是本次评审中最严重的实际风险。纯记录模式下工具丢数据只是丢记录，实体魔典还在，局能继续；魔典模式下工具丢数据 = 全场身份和标记全部消失，一局直接报废且不可能凭记忆恢复。

现状核查：session 走 localStorage（gameSessionStorageKey，src/services/session/localSessionAdapter.ts），archive 默认也是 localStorage（localArchiveAdapter），后端 httpArchiveAdapter 存在但归档动作发生在 GameEndSheet（局终）。也就是说，整局进行中的权威状态只有浏览器里的一份，且随时可能被「清除浏览数据」、隐私模式、多标签页互相覆盖、iPad Safari 内存回收清掉。

**要求**：把以下要求写成魔典模式的准入条件（未满足则魔典模式不得默认开启）：
1. **多副本轮转**：每次 commit 后写主副本，同时按时间轮转保留最近 N 份快照（独立 key，如 session:snapshot:0..4），启动时校验主副本，损坏则提供「从 3 分钟前的快照恢复」。
2. **局中周期归档**：后端可用时，每次相位关闭（黄昏/黎明/收尾）与每 N 次写入自动向后端推送一次中途快照，不再等到局终。注意这条不违反「不自动结算」——它写的是备份，不是权威状态变更。
3. **单实例锁**：检测同一浏览器多标签页打开同一 session，后开的标签页进入只读并提示，避免两个标签页互相覆盖 localStorage。
4. **崩溃恢复提示**：启动时若发现上次没有正常收尾，主动询问是否恢复，而不是静默加载。
5. **一键导出**：魔典模式下把「导出本局 JSON」提到轨道右端常驻可达（现在只在 GameEndSheet 里），并在开局时提示一次。
6. **破坏性操作分级**：「重置」「清空标记」「结束对局」在魔典模式下必须二次确认 + 自动先存一份快照，确保误点可回滚。

### 新增风险（二）：高频微操作放大误操作后果，undo 必须走更正体系而非覆盖

魔典模式会引入大量高频、低成本、无表单确认的手势：点座位切死亡、拖标记、长按删除。误操作概率远高于现在的表单式记录。诱人的解法是给一个「撤销」按钮直接回滚 state——但那会绕过 ABILITY_SETTLEMENT_BOUNDARY:82-86 的事件追加体系，让时间线不再能还原真实操作历史，直接损坏复盘和争议回溯这两个核心卖点。

另一处具体隐患：UI_REDESIGN_PLAN:90 已经指出工作台改为常驻不卸载后，局部 state（pendingResolution 等）需要在相位切换时显式重置。魔典视图常驻会把这个问题放大——一个没清掉的草稿标记可能跨夜留在屏幕上，被说书人当成真实局面读取。

**要求**：1. **undo 是逆操作不是回滚**：撤销必须实现为追加一条 CorrectionEvent（ABILITY_SETTLEMENT_BOUNDARY:86），投影结果回到操作前，但历史里两条记录都在。禁止实现为 state 快照回退或从时间线删除条目。
2. **回执强制**：魔典上每一次写入都必须触发 HostNotice 回执（UI_REDESIGN_PLAN:234-248 的全局单例回执带），文案说明「已记录：3 号 · 中毒标记」。魔典模式下没有回执的静默写入等同于故障。
3. **草稿态与已落盘态视觉必须强区分**：AI 建议的幽灵标记、未确认的拖拽预览一律虚线 + 低饱和 + 带「未确认」角标，且相位切换时强制清空全部草稿态。
4. **删除需摩擦**：删除标记不得是单点击。可参考 UI_REDESIGN_PLAN:205 记录的 botc.games 做法（长按进入移除模式再点 X 再确认），至少做到「长按或二段确认」。

### 新增风险（三）：整屏局面的防窥，需要一套明确的遮蔽契约

纯记录模式下，屏幕上一次只暴露一个座位的身份（PRODUCT_VISION:15「点座位才显示身份」），被瞄一眼的损失有限。魔典模式下一屏就是全部 12-15 个身份加全部标记——被任何一个玩家瞄到一眼，整局直接结束。这是模式切换带来的**质变**，不是量变，现有的遮蔽机制（CurrentWakeCard / NightPlayerCarousel / RoleDisc 的 masked 态，PrivateRevealOverlay）是围绕单座位展示设计的，覆盖不到整屏场景。

**要求**：把以下要求写进 PRODUCT_VISION 或单独的 GRIMOIRE_MODE 文档，作为魔典模式的准入条件：
1. **默认遮蔽**：魔典视图默认进入遮蔽态（身份图标盖住、只见座位号与生死），需要一次明确手势（长按 / 按住空格 / 揭示按钮 + 二次确认）才揭示。参考 UI_REDESIGN_PLAN:205 记录的 botc.games「揭示魔典需二次确认」。
2. **一键盖屏**：全局快捷键与屏幕角落常驻大按钮，一下即刻全屏遮蔽，任何位置任何相位都可用。
3. **自动遮蔽**：页面失焦、visibilitychange、无操作超时（可配置，默认 60 秒）自动回到遮蔽态。
4. **遮蔽态不进 DOM**：遮蔽不能只是 CSS 覆盖或 opacity——身份信息在遮蔽态下必须完全不进 DOM（UI_REDESIGN_PLAN:284 已对白天事实条立过这条规矩，魔典模式必须继承）。这同时防住了截屏、屏读器泄露和 devtools 窥视。
5. **投屏层必须不透明**：UI_REDESIGN_PLAN:176 已有此要求（「必须真正遮住秘密信息，不能只是半透明」），魔典模式下升级为硬性验收项。
6. **玩家可见层白名单**：任何要给玩家看的界面（单人信息展示、倒计时投屏、黎明播报）必须走一个显式的「玩家可见」组件白名单，默认不渲染任何身份数据；新增此类界面须过评审。

### 素材授权（一）：现有「确认后下载 + SHA-256 校验」机制在魔典模式下仍然成立，但覆盖面有缺口

机制本身评估结论：**够用，不需要推翻**。PUBLIC_RELEASE_BOUNDARY:46-52 的五条（先看来源用途版权 → 显式确认 → 只存本机/自用 VPS → 缺素材不阻塞 → 必须记原始 URL 与 SHA-256 且不得绕过校验）在魔典模式下逐条依然适用，THIRD_PARTY_NOTICES:56 也已经把「不随仓库分发、下载后校验、TPI 素材仍受 TPI 政策约束、不在 MIT 覆盖范围」说清楚了。

但覆盖面有缺口。当前 source-manifest.json 共 718 项，全部是**角色图标**（官方 136 / 社区 582）。魔典模式为了「参考 botc.games」，会新增至少四类图形需求，manifest 一项都没覆盖：
1. 提示标记（reminder token）图形；
2. 死亡标记 / 裹尸布（shroud）；
3. 投票令牌 / 死亡票令牌；
4. 魔典底盘背景纹理与 Token 底纹。

更关键的是：官方 Toolmaker Resources 主要提供角色图标，**不单独提供上述这几类图形**。这意味着实现者面对的最省事路径就是「从官方 App 截图切图」——而 PUBLIC_RELEASE_BOUNDARY:44 已明确禁止「从网页抓取的任何素材」，但没有明文禁止「从官方应用截图切图」，而这恰恰是魔典模式下最可能发生的一种。

**要求**：1. 在 PUBLIC_RELEASE_BOUNDARY「素材包策略」中补一条禁止项：「禁止以截图、录屏、切图、临摹或任何形式从官方应用/官方网页提取界面元素（标记底图、裹尸布、投票令牌、背景纹理、UI 图标）。这类图形一律自制，或使用明确授权的开源图形。」
2. 明确自制路线：裹尸布、投票令牌、状态环、标记底盘全部用项目自绘 SVG / CSS 实现，不引入任何第三方图形二进制。自制资产可以进 Git（它们是本项目原创，受 MIT 覆盖），这反而降低分发风险。
3. 若确有官方源可下载的新类别素材，必须扩展 source-manifest.json（同样记录 url + sha256 + kind + recordSource），不得走 manifest 之外的旁路下载。
4. 缺素材降级在魔典模式下升级为硬性要求：无图标时魔典必须以「角色中文名文字 Token」完整可用。这不只是可用性要求，更是许可上的保险——它证明本工具的功能不依赖任何受版权保护的素材。

### 素材授权（二）：提示标记的文本、社区素材占比与常驻标识，三个额外问题

除图形外，提示标记还带来三个现有文档没覆盖的问题：

1. **标记文本本身是官方规则文本**。「中毒」「红鲱鱼」「明日死亡」「保护」这类提示词逐字来自官方角色卡，且中译名多为社区通行译法。项目已有 complexRoleKnowledge.ts 持有 reminders 字段（:22/:33，:141 处还有 slice(0,3) 的截断）。THIRD_PARTY_NOTICES:41-45 已经就中文能力文本立过规矩（工作参考、非官方翻译、不得当权威规则文本），但没点名 reminder 文本。

2. **社区素材占 582/718，权利人不是 TPI**。魔典模式一屏同时展示十几个社区图标 + 十几个标记，视觉密度接近「一个完整的游戏界面」，比现在的单座位展示更容易被理解为「一个成品游戏」而非「一个引用素材的辅助工具」。THIRD_PARTY_NOTICES:56 已注明社区素材受其创作者条款约束，但项目里只在安装时展示一次 Community Created Content 标识。

3. **manifest 的 kind 字段目前只有 official / community 两值**，无法表达「本项目自制」这一类，扩展后会混淆。

**要求**：1. 在 THIRD_PARTY_NOTICES.md「Chinese text and rule summaries」段落中显式点名 reminder 文本：「Reminder token labels used in the grimoire view are working references derived from official role text and community translations. They are not official wording and must not be presented as authoritative.」并在 UI 上对标记文本保留「非官方译法」的可查说明。
2. 魔典模式下把 Community Created Content 标识与「非官方工具」声明做成**常驻**（页脚或档案页固定位置），不再只在安装时出现一次。理由：魔典视图是最容易被截图外传的界面，标识必须跟着截图走。
3. source-manifest.json 的 kind 增加 `self-made` 一值，自制图形登记在案且标注 MIT，与需下载的第三方素材在数据层就分开。
4. 保留 PUBLIC_RELEASE_BOUNDARY:11 已有的政策复核提醒，并在其中补一句：「新增魔典视图属于对官方界面观感更接近的形态，发布前须重新核对 TPI Community Created Content Policy 中关于界面与商誉的条款。」

### 素材授权（三）：data URI 内联可绕过 .gitignore，audit:public 需补检

这是一个当前存在的实际漏洞，魔典模式会显著提高它被触发的概率。PUBLIC_RELEASE_BOUNDARY:21-27 的忽略规则是按**文件扩展名**匹配的（`public/assets/characters/*.{webp,png,...}`），它挡不住把图片以 `data:image/png;base64,...` 内联进 .ts / .tsx / .css / .json 的写法。而魔典视图恰恰最需要一批小图形（标记底盘、裹尸布、状态环），「小图直接 base64 内联省一次请求」是前端最常见的顺手做法，一旦发生就等于把受版权素材提交进了公开仓库，且现有 audit:public 与 .gitignore 全都发现不了。

**要求**：在 scripts/public-release-audit.mjs 中新增两条检查：
1. 扫描 src/**、public/**、server/** 的所有文本文件，若出现 `data:image/`（png|jpe?g|webp|gif|svg+xml）且 payload 长度超过阈值（建议 2KB，足以放行小图标级的自绘 SVG，拦住任何真实位图），则 fail，提示「疑似内联第三方素材，请改为走 source-manifest 下载或自制 SVG」。
2. 检查 source-manifest.json 中每一项都有非空 url + sha256 + kind，且 kind 属于枚举白名单，防止新增素材类别时静默跳过校验字段。

同时把这两条写进 PUBLIC_RELEASE_BOUNDARY 的「公开前检查」清单（:81-94）。

### 架构守护：verify-architecture.mjs 现状盘点

逐行读完，脚本共 51 行，遍历整个 repo（跳过 node_modules / dist / .git / artifacts）后做 4 类检查：

1. **行数预算**（:7-12）：src/(main|App).tsx ≤ 120、src/components/ui/**.tsx ≤ 220、src/features/**.tsx ≤ 320、index.html ≤ 180。
2. **旧规则引擎符号**（:34）：src 下的 .ts/.tsx 若含 `PhaseCoordinator|RuleAutomation|AutonomousGameRunner|AbilityEngine` 即 fail。
3. **共享 UI 解耦**（:37）：src/components/ui/*.tsx 若含 `night-workbench|activeCursorId|roleId` 即 fail。
4. **AI 剧本硬编码**（:40）：localAIAdapter.ts 不得含 catfishing 相关分支。

三个现存局限，会在魔典模式下变成实际问题：
- 检查 2/3/4 都是**纯文本正则**，注释、字符串、测试名里出现同名词也会 fail。魔典模式必然会在代码注释里大量书写「这里不做 xxx 引擎」之类的说明，误报率会上升，需要提前处理。
- 检查范围只有 `src/`，**完全不覆盖 server/**。而 ABILITY_SETTLEMENT_BOUNDARY:151 明确要求「后端不应保存一套隐藏规则引擎状态」——这条边界目前没有任何自动检查在守。
- 检查 3 禁止共享 UI 组件出现 `roleId`，但魔典模式的座位 Token 一定要用 roleId。这条规则会直接与魔典组件冲突，必须先想好放在哪一层（建议魔典座位组件放 src/features/grimoire/ 而非 components/ui/，从而保留原规则不动）。

**要求**：1. 把符号类检查从「整文件文本匹配」改为「先剥离注释与字符串再匹配」，或最低限度支持 `// arch-allow: <reason>` 行内豁免注释，避免文档化注释导致误报。
2. 把检查 2 的路径范围从 `src/` 扩展到 `src/|server/`。
3. 明确规定魔典座位组件不进 src/components/ui/（那里是无业务耦合的共享层），从而保留 :37 规则原样有效；同时为 src/features/grimoire/**.tsx 沿用 320 行预算，不得为「魔典画布很复杂」而放宽。

### 架构守护：为魔典模式新增的 9 条反规则引擎自动检查

现有 4 类检查对魔典模式的越界形态零覆盖——它只认 4 个特定的旧类名，而魔典模式的规则引擎不会叫 AbilityEngine，它会以「一个体贴的 useEffect」「一个 helper 函数」「一个 token 类型上的 effect 字段」的形式长出来。

下列 9 条的设计原则是：**把「不是规则引擎」尽量转化为依赖方向与类型形状问题**，因为这两类可以 100% 静态验证，不依赖语义判断。其中第 1、2、4 条价值最高。

**要求**：建议按优先级加入 scripts/verify-architecture.mjs：

**P0（最高价值，纯依赖方向检查，零误报）**
1. **AI 不得直连权威状态**：session / grimoire 的 reducer 与 state 目录下的任何文件，禁止 import `services/ai` 或 `features/ai-*` 下的任何模块。违反即 fail。这一条把 AI_AUTHORITY_BOUNDARY 的核心变成了编译期可查的事实。
2. **角色包必须是纯数据**：src/domain/scripts/packs/** 与 src/domain/role-knowledge/** 禁止 import `GameSessionState`、`features/game-session/**` 的任何类型，禁止出现 `=> GameSessionState` 返回签名。违反即 fail。这一条防住「能力可执行化」。
3. **单一持久化真值**：全仓 localStorage key 常量集中在白名单文件内声明，魔典模式不得新增独立 session key（快照 key 需显式登记）。

**P1（形状检查）**
4. **标记不得携带效果**：魔典 token / reminder 的类型定义文件中，禁止出现字段名 `effect`/`effects`/`appliesTo`/`modifies`/`onNight`/`onDeath`/`resolve`/`trigger`。
5. **禁止自动推进**：src/features/grimoire

---

## 七、分批落地

## 总原则

不是「先做完纯记录三批再上魔典」，也不是并行。正确答案是：纯记录第 0/1/2 批必须先做完（它们是双模式共用骨架，不是纯记录专属），第三批拆成三份分别归位，魔典自己分四批且前两批之间隔一道数据耐久性闸门。另外必须在一切之前插一批 P0 前置修复——它不含任何魔典代码，但没有它，任何字段扩展都可能在主持中途清空一局。

## P0 前置修复批（先于一切，约 1 周，零魔典代码，独立价值）

1. loadGameSession 安全加载：放宽版本判断并容忍未知可选字段；解析或校验失败时先把原始字符串写入 botc-copilot-session-recovery-v1 再回退，UI 挂一条可导出的提示。（已核实 :19 硬相等、:136 catch 无条件回落、:142 随后覆盖，是全案唯一高危阻断项。）
2. playerStateReducer 修两处：samePlayerState 改为全字段结构比较（当前只比 life/poisoned/drunk 与 markers 的 id+label，任何新字段的单独变更会被判为无变化而整条静默拒绝，在牌桌上表现为点了没反应）；clonePlayerState 改为深拷贝（当前只逐项浅拷 markers，其余字段共享引用）。
3. 把 timelineSessionReducer 黑名单、entryCanUsePhase、projectTimelineHistory、projectSeatActivity、archiveService.entrySummary、gameReviewProjection、Dashboard 七处对 TimelineEntry 的非穷尽 switch 改成 never 穷尽检查。这是将来任何新 kind 的前置，现在做成本最低。
4. verify-architecture 扩展三条 P0 检查（价值最高、零误报）：reducer/state 目录禁止 import services/ai；domain/scripts/packs 与 domain/role-knowledge 禁止 import GameSessionState 或出现返回 GameSessionState 的签名；localStorage key 集中白名单声明。同时把旧引擎符号检查范围从 src 扩到 src 与 server，并给符号类检查加行内豁免注释机制（否则后续大量「这里不做某某引擎」的说明性注释会误报）。
5. 一条纯记录模式全流程 e2e（配板 → 首夜 → 白天投票 → 次夜 → 归档）进 CI。

验收：旧存档在新代码下 100% 不被重置；e2e 绿；npm run check 通过；本批不改变任何用户可见行为。

## 纯记录第 0 / 一 / 二批：原计划照跑，不合并

它们本来就是双模式共用件。第 0 批的 Card/Field 原语、SeatButton dead 语义、未定义 token 清理、三条 CI 守门，是魔典不变成第 166 个手写卡片的唯一保障；第一批的 PhaseTrack、App 视图收敛、StickyActionBar 单一底栏契约、HostNotice 全局回执，是 UX 那份魔典版式三层骨架中的两层（魔典只替换中间那层）；第二批的黄昏/黎明交接卡、白天步骤序列化、记录入口归一、倒计时投屏，是魔典 UX 明文复用的东西——交接卡是相位推进的唯一门、本局记录轨道入口是魔典的空间索引落点、倒计时投屏是魔典遮蔽层的先例。跳过它们直接做魔典，等于在魔典里把这四件事再实现一遍。

## 纯记录第三批：拆三份归位（唯一需要动原计划的地方）

- 3A 提前（并入 P0 或第一批尾）：焦点色纪律（一屏 accent 语义不超过两类）、状态三重表达（死亡/中毒的图标+文字+颜色一致编码）、四个 CSS 主干文件的未定义 token 与死代码清理。理由：魔典 token 的死亡帷幕与中毒边框直接沿用这套编码；魔典画布的唯一暖金焦点环要求焦点色纪律已经生效，否则一屏会出现多个暖金源。
- 3B 独立（内容层，与魔典零耦合，任何时候可做）：跨相位事实条、首夜爪牙/恶魔信息两步、伪装三张记录。它们改的是夜序内容与唤醒卡，两种模式都受益。
- 3C 合并进 G3：相位回看。它与魔典的 replay 降饱和态是同一个状态机，而原计划自己就标注了需要先把 isPreviewing/isReadOnly/isCorrecting 三布尔收敛成 mode 枚举——这个收敛必须一次做完并包含魔典的 replay/deal/遮蔽三级，否则要做两遍。

## 魔典四批

## 实施状态（截至 2026-08-06）

分支 `fix/wiki-ground-truth-audit`。1265 单测 + 35 e2e 绿（Node 24 与 26 各跑一遍），
`verify-architecture.mjs` exit 0，`audit:public` 通过，oxlint 零警告。

### 已完成

**G1 只读魔典**：布局求解、GrimoireSeat、GrimoireCanvas、三级遮蔽（模型 + 运行时控制）、
窄屏网格退化、hostingMode 出处元数据 + 架构守门、首次引导卡、降级交接卡与可抄清单、
完整度双维度提示条、**core 五种相位内容 + 夜序双 Disc**、**抽屉宿主与页面注册表**。

**耐久性闸门（G2 准入）**：快照轮转、启动崩溃恢复询问、多标签页单实例锁、
体积基线（300 次操作 20.6KB）、**导出本局 JSON 常驻可达**、**相位关闭本地快照**、
**后端 recovery 命名空间（独立存储与路由，与归档隔离并有专门测试）**。

**G2 数据模型**：ReminderToken 就地放宽（sourceRoleId + placedInSegmentId）、
GrimoireOp 十三变体、PlayerStateChangedEntry 四个可选字段并已真正落盘、
**一次手势一条记录的不变量**（字段子集 + 值一致 + 非空改动三重校验）、
**不变量测试 B**（除专用 action 外无人能改玩家状态）。

**守门与发布闸门**：9 条反规则引擎检查已实现 6 条（含裁决 10 的禁用标识符表），
audit:public 三条新检查（data URI 超 2KB、清单字段完整性、botc.games 资源 URL），
并修好了它在无 ripgrep 环境下直接抛堆栈的老问题。

**文档**：PRODUCT_VISION 八节改写含新增「主视图模式合同」、
ABILITY_SETTLEMENT_BOUNDARY 三节、AI_AUTHORITY_BOUNDARY 十节、
architecture-guardrails 九条检查表、GRIMOIRE_MODE_BOUNDARY 七条边界。

### 未完成

- **六个全屏页尚未真正进抽屉**。宿主与注册表就绪，但六页的根都是 Radix
  `Dialog.Portal`，portal 出去后抽屉的高度与 inert 全部失效、overlay 铺满视口把环糊掉。
  需要先给 Sheet 加内联呈现分支；SetupPanel 现 316/320 行，脱壳时要同批拆文件。
- **画布尚未接进主流程**。GrimoireCanvas / GrimoireCore 全部就绪但无人渲染；
  core 五个相位的数据源（night/timer/vote/dusk/dawn）也还没人喂。
  模式切换入口按裁决 7 应落在 core 顶行的本局信息浮层，浮层本身未做。
- **G2 写入层**：SeatActionBar、草稿/确认两段式、HostNotice 全局化与 3.5 秒撤销、
  补录建议卡、删除标记二段摩擦。其中撤销有一处硬阻断需先解决：
  `sessionReducerGuards.ts` 只允许 night_action / day_action 走更正链，
  player_state_changed 的更正会被静默吞掉——撤销会「看起来成功」而实际什么都没发生。
- **G3 全部**。另有一处需先裁决：44px 死亡票 chip 与 satelliteChipSize 28px 上限冲突，
  硬塞会与相邻座位重叠、违反 G1 验收④。
- **G4**：文档明确允许永不做。

### 本轮发现的既存问题

1. 本文件有 33 处正文被截断（见 GRIMOIRE_DESIGN_RECOVERED_PASSAGES.md）。
2. 测试套件在 Node ≥ 26 上 55 条全红，原因是 Node 的实验性全局 localStorage
   顶掉了 jsdom 那份。已在 src/test/setup.ts 修好。
3. `audit:public` 在没有 ripgrep 的机器上直接抛 ENOENT 堆栈，既没扫描也没有可读的
   失败信息——而调用者很容易把「崩了」当成「没扫出问题」。已加 Node 兜底。

---

### G1 只读魔典（约 2–3 周）——环作为观察面，零写入
内容：features/grimoire 目录 + GrimoireSeat（包 RoleDisc）+ 椭圆布局纯函数（含 pitch 判据与四档尺寸）+ core（五种相位内容、Town Info、夜序双 Disc）+ 三档抽屉（六个全屏页原样换容器）+ 三级遮蔽 + 窄屏网格退化 + hostingMode/hostingModeHistory + 首次引导卡「你的魔典放在哪里」+ 降级交接卡 + 完整度提示条（含 seatsWithRole 为 0 的分支）。
关键约束：本批画布内不得出现任何 dispatch，全部状态编辑仍走既有 PlayerStatusSheet。
验收：① 环上任何触摸都不改变 session（测试：模拟环内全部可点元素，断言 session 引用不变）；② 关闭魔典模式后纯记录路径与 G1 之前逐像素一致，e2e 绿；③ L1 默认态下 DOM 内不存在任何角色名、角色图标 src、标记 label；④ 12/15/20 人 × iPad 两向 × 窄屏三档实测无重叠、命中区不小于 44px；⑤ features/grimoire 下无文件超 320 行。

### 耐久性闸门（约 1 周，G2 准入条件，不可跳过）
快照轮转（主副本 + 最近 5 份）、启动崩溃恢复询问、多标签页单实例锁、导出 JSON 提到常驻可达、相位关闭时向后端 recovery 命名空间推送快照（不进归档列表，避免半局出现在战绩里）、破坏性操作先存快照。
验收：手动清掉主 key 后能恢复到 3 分钟前；两个标签页同时打开时后开者只读；实测一局 300 次操作的 JSON 体积并记录在案。
理由：G1 的魔典是只读的，工具还不是唯一事实来源；G2 一旦允许在魔典上直接改状态，说书人就会停止在别处记录，此后丢数据等于整局报废。这道闸门必须在 G2 之前而不是之后。

### G2 魔典写入（约 2–3 周）——每一次手势恰好一条记录
内容：SeatActionBar（长按 400ms 或 idle 单击，3×2 网格，等价路径在抽屉）+ 草稿/确认两段式 + GrimoireOp（长度恒 1）+ origin/batchId/backfill 三个可选字段 + ReminderToken 只加 sourceRoleId 与 placedInSegmentId + HostNotice 强制回执与 3.5 秒即时撤销（追加 CorrectionEvent，非回滚）+ 补录建议卡（逐条可跳过，无「全部应用」）+ 删除标记的二段摩擦。
验收：① 不变量测试 A——after/before 的差异字段集是 ops[0] 名字的字面子集；② 不变量测试 B——对每个非 confirm-player-state-change 的 action 断言 projectCurrentPlayerStates 前后深等（reset 与 start-setup 白名单除外）；③ 魔典上无回执的静默写入数为 0；④ 补录 entry 的 createdAt 是真实补录时刻、归属靠 backfill 字段；⑤ 归档体积增长在闸门批测得的预算内。

### G3 融入（约 2–3 周）——把既有功能收进魔典交互
内容：夜间点座位选目标（只写 draft）+ 夜序光标空间化（焦点环、后续两项角标、已确认勾）+ 白天提名弧线与举手打卡（门槛只算不裁）+ stateChangeDrafts 结构化（含 server provider/validator/promptBuilder outputShape 四处改动）+ 采纳按钮 + contextLevel 由 coverage 推导并真正接通（当前三个 build 函数硬编码 minimal、server 端零读取）+ 提示词加「未列出等于未知，不是正常」分支 + 3C 的状态枚举收敛与 replay 态 + 归档 completeness 标注与跨模式回看诚实条。
验收：① 采纳 AI 建议产生的记录带 adviceId 溯源，未采纳时 session 无任何痕迹；② 关闭 AI 后魔典全部操作仍可手动完成；③ 用魔典视图看纯记录局时常驻诚实条且全部写入入口 disabled（readOnly prop 强制，不靠自觉）；④ coverage 非 full 时模型返回 needs_input 并点名座位（provider 层测试）。

### G4 内容深度（无限期可选，允许永不做）
身份附加层（酒鬼/提线木偶/疯子双层身份）、旅行者与流放、登记裁定、疯狂指令、提示标记目录、自绘资产。每项独立可上线、互不依赖。文档明写：这批不做，魔典模式依然完整可用。

## 与已完成方案的复用关系（一句话）

魔典模式复用纯记录模式的：PhaseTrack、HostNotice、StickyActionBar 契约、Card/Field 原语、六个全屏页组件（SetupPanel / IdentityDealSheet / TimelineHistorySheet / GameEndSheet / RoleChangeSheet / NightQueueSheet 原样进抽屉 full 档）、三张交接卡、本局记录唯一入口、SeatButton 号码网格（作环的等价路径与无障碍通道）、RoleDisc、以及 confirm-player-state-change 这唯一的写入路径。魔典新增的只有一个 stage 变体、一个抽屉高度控制器、一个 features/grimoire 目录。凡是需要在 grimoire 里重新实现一遍纯记录已有功能的设计，一律视为设计错误退回。

---

## 八、评审裁决的 12 处冲突

**1. 逆向（自由拖拽画布 / position{x,y} 写进 Redux 持久化 / reminder 是独立实体靠 1.2×tokenSize 就近归属）× UX（语义状态一律不拖拽、标记按计算附着到 seatId、座位角度由人数唯一决定）× 数据模型（ReminderToken 挂在 PlayerState.markers 上，无任何坐标字段）× 边界（魔典视图渲染既有投影，不得持有独立局面状态）**

- 冲突：逆向的核心机制是坐标持久化 + 空间归属，UX 与数据模型的核心机制是 seatId 归属 + 纯计算布局。二者不可共存：一旦 position 进 session，标记归属就有两个真值（proximity 算出来的 vs attachedTo 存的），逆向自己也承认 botc 因此额外存了 reminderTargets 兜底。坐标进 session 还会让「两模式共享同一 GameSession、切回纯记录零损失」这条合同出现一批纯呈现层死字段。
- 裁决：UX + 数据模型胜，逆向的定位/拖拽/归属整套机制不实现。硬规定：session 内不存任何像素坐标；标记归属只有 seatId 一个真值；座位角度 = f(seatIndex, seatCount, startOffset)，startOffset 只有 0/90/180/270 四档。逆向可用部分收缩为六点写进实现说明：椭圆 position 公式（θ=i·2π/N−π/2，x=W/2+rx·cosθ−S/2）、名字预留量 pad（中文昵称取 0.3 系数）、pitch 作为尺寸档位与碰撞判据、night-clouds 式三层背景叠加、标记与名字牌重叠时名字牌翻到上方、锁定 token 开关。nshape/ushape/rainbow/circle 注册表、160→20 贪心求解、interact.js 拖拽层、reminder 托盘 8px 死区手势、真径向菜单极坐标一律不做。

**2. 数据模型（GrimoireSettings 挂 session.grimoire，含 mode/layout/shielded/showAnnotations，schemaVersion 保持 1，新增 session_mode_changed timeline kind）× 模式切换（session.hostingMode 必填 + hostingModeHistory，schemaVersio**

- 冲突：三重冲突：字段名与枚举不同、持久化策略不同、模式变更落点不同。第三点是真分歧——timeline 是对局事实的唯一去处，模式切换不是对局事实，进 timeline 会强迫七处非穷尽 switch 为一个非对局条目开分支。另外 layout 的 {seatId, angle}[] 直接违反 UX 的角度由人数唯一决定，等于从后门放回自由布局。
- 裁决：统一为 GameSessionState.hostingMode（放 session 根，不嵌套）+ hostingModeHistory；schemaVersion 保持字面量 1（两者都是可增可选字段，isSession 的硬相等判断因此不会触发，完全避开静默重置的爆炸半径，同时仍需按 P0 批修安全加载）；模式变更只 append history，不进 timeline，不新增 kind。layout 字段删除，改为 startOffset。shielded / showAnnotations 是易失 UI 态，绝不持久化——持久化遮蔽态等于下次开机可能默认掀开魔典。

**3. 数据模型（AIGrimoireProposal 携带 ops 数组与 status）× 边界（GrimoireActionDraft 含 draftId/proposedChange 枚举/payload）× 模式切换（把现有 stateChangeDrafts 从 string[] 升级为带可选 seatId 与 change 的对象，并列出 server provider / validato**

- 冲突：同一件事三套互不兼容的类型。更危险的是让 AI 直接产出 GrimoireOp 数组——那是内部写入意图的表示，让模型输出它等于把内部写入语言暴露成 AI 的输出语言，下一步就会有人写一行 forEach 把 ops 直接派发。而只有模式切换那版核实了 stateChangeDrafts 当前是端到端 string[]（types.ts:99 / nightSettlementHttp.ts:28,165 / provider.ts:112 / promptBuilder.ts:33），因此只有它给出了可落地的改动清单。
- 裁决：只保留一套：扩展既有 stateChangeDrafts 为 { text: string; seatId?: number; change?: { field: life|poisoned|drunk|marker; to: string; markerLabel?: string } }，text 必填、其余可选、解析失败一律降级纯 text，seatId 必须是 input 中出现过的座位号否则丢弃。AI 永不产出 GrimoireOp、永不产出 op 数组、一条建议最多对应一个座位的一个字段。溯源复用 advice 上已有的 adviceId / contextRevision / knowledgeVersion，不新建字段。采纳按钮由组件自行构造 confirm-player-state-change，禁止把 provider 返回值透传进 dispatch。AIGrimoireProposal 与 GrimoireActionDraft 两个类型都不建。

**4. 数据模型（GrimoireOp 是 player_state_changed 上的 ops 数组，配 batchId 表达一次手势波及多座位）× 边界（判别标准一：级联写入，一个 case 修改了它名字之外的状态；核心判据：一次手势只能产生一次写入）**

- 冲突：ops 是复数，类型上就允许「加中毒标记」和「置 poisoned=true」出现在同一条 entry 里，而这正是级联写入最自然的伪装形态——它甚至不需要改 reducer，只要在构造 action 的组件里多 push 一个 op 就成立，边界提的静态检查一条都抓不到。
- 裁决：魔典路径上 ops 长度恒为 1（类型保留数组以备将来，但加 runtime assert + 单测）。多座位同手势按座位各写一条 entry 共用 batchId。补一条不变量测试：对任意 confirm-player-state-change，after 与 before 的差异字段集必须是 ops[0] 名字的字面子集（token_added 只允许 markers 变、life_set 只允许 life 变，依此类推）。这条比边界提的九条静态检查里任何一条都更贴近真实漂移路径。

**5. UX（token 直接用现有 RoleDisc，不新造第二种圆形 token）× 边界（verify-architecture.mjs:37 禁止 src/components/ui 出现 roleId，建议魔典座位放 features/grimoire）× ui-design-system.md:34（角色 PNG 与圆形 Token 只保留给 RoleDisc，SeatButton 只显示号码**

- 冲突：表面冲突：魔典座位必须同时是角色 Token 和可操作座位键，而设计系统明文把这两件事分开正是为了避免被误解为另一套魔典——现在作者要的就是另一套魔典。已核实 RoleDisc 当前 props 为 initial/roleName/size/active/concealed/imageSrc/changed，本身不含 roleId，复用不会触发检查；真正风险是有人为了在环上做交互，把 seatId、roleId、选中语义塞进 RoleDisc。
- 裁决：新建 features/grimoire/GrimoireSeat.tsx 作容器，持有 seatId、选中态、状态环、卫星标记与命中区，内部渲染纯展示的 RoleDisc；RoleDisc 保持零业务耦合、不加任何新 prop（死亡/中毒表达在 GrimoireSeat 层覆盖）。ui-design-system.md:34 按边界给的新句改写，并明写 GrimoireSeat 与 SeatButton 是同一 seatId 的两种呈现、共用选中态契约（勾选 + 描边 + 颜色 + aria-pressed），不得各自发明选中语义。verify-architecture:37 原规则一字不改。

**6. UX（L1 席位视图为默认，显示座位号、生死、毒醉 chip、具名标记，称这些玩家看到也无所谓）× 边界（遮蔽态下身份信息必须完全不进 DOM）× 数据模型（ReminderToken 带 sourceRoleId，label 形如 僧侣保护 / 红鲱鱼 / 是酒鬼）**

- 冲突：L1 的安全性假设不成立。具名标记的 label 本身就是角色信息：僧侣保护暴露场上有僧侣及其今晚保了谁，红鲱鱼暴露占卜师及其误导对象，是酒鬼直接暴露一个玩家的真实身份。UX 把标记划进玩家看到也无所谓那一档，与边界的整屏防窥要求直接冲突，而这正是魔典模式最大的一次性泄密面。
- 裁决：L1 下标记只渲染为无字圆点 + 计数（如 3 枚标记），label、sourceRoleId、semantics 一律不进 DOM；中毒/醉酒保留（粗粒度、不足以定位角色，且是说书人最高频需要的量）。标记文字只在 L2 或单座位揭示 L1.5 下出现。AI 推理草稿、说书人给过的假信息记录、私有笔记在 L0/L1 下一律不进 DOM，不是视觉遮住。

**7. UX（PhaseTrack 左端一枚 44px 显式模式切换键）× 模式切换（切换入口放本局档案的主持设置，明确反对放主持台顶栏，理由是 48px 高频误触区，且顶栏右端两枚入口已被定死为本局记录与收尾）**

- 冲突：两份对同一入口给出相反位置。顶栏常驻切换键的实际后果是：主持中途一次误触把魔典整个换成纯记录视图（数据不丢但视觉上像丢了），而这正是模式切换那份自己识别出的空魔典错觉风险的触发器。
- 裁决：取消顶栏切换键。入口放进 UX 已定义的 core 顶行本局信息浮层（点剧本名进入），两次点击可达、物理上在拇指弧之外、语义正确。record→grimoire 即时生效零摩擦；grimoire→record 必须过一次交接卡（列出当前全部非默认状态清单 + 复制按钮 + 主动作为留在魔典模式）。档案页主持设置里保留同一入口作为第二条路径。

**8. 数据模型（新增四个 timeline kind：exile / registration_ruling / madness_ruling / session_mode_changed，外加 PlayerState 六个新字段与 SetupAssignment 五个新字段）× 模式切换与边界（业余项目、最小改动、七处非穷尽 switch 是已知地雷）**

- 冲突：数据模型给的是把百科语义完整表达出来的最优解，工程量等于一次领域模型重写，且每个新 kind 都要在 timelineSessionReducer 黑名单、entryCanUsePhase、projectTimelineHistory、projectSeatActivity、archiveService.entrySummary、gameReviewProjection、Dashboard 七处补分支。而魔典的最小可用形态（看得见局面 + 点得动状态 + 摆得了标记）一个都不需要。
- 裁决：分层裁决：G1/G2 新增 timeline kind = 0，新增 PlayerState 字段 = 0（只放宽 markers 的元素类型）。SeatIdentityOverlay、MadnessDirective、RegistrationCapability/Ruling、TravellerEnrollment、ExileEntry 全部推到 G4 内容深度批，且明确允许永不实现——它们属于工具能不能表达酒鬼，不属于魔典能不能用。将来若要做，先做的必须是把那七处 switch 改成 never 穷尽检查（已列入 P0 前置批），而不是先加 kind。

**9. 数据模型（ReminderToken 用 placedInSegmentId 记录放置段落）× 模式切换（ManualStatusMarker 追加 sourceRoleId + originPhaseLabel）**

- 冲突：同一件事两个字段：一个是引用，一个是显示字符串。已核实 localSessionAdapter 的 normalizePhaseSegments 会在加载时重算 segment.sequence，即相位标签是可变派生值——把它冻结成字符串存进标记，会在段落被规整后与实际相位不一致。
- 裁决：只保留 placedInSegmentId（string | null），标签一律渲染时由 segmentId 查表得出。sourceRoleId 采用（黄昏到期候选需要它）。G2 阶段 ReminderToken 只加 sourceRoleId 与 placedInSegmentId 两个可选字段；definitionId / semantics / inverted / removalHintText 推后。

**10. 逆向（照抄三条阈值算式并重算谁在砧板上）× UX（门槛只算不裁，达标不自动处决不自动改生死）× 边界（判别标准二：派生值入库，majority/aliveCount 只能进 render 不能进 action）**

- 冲突：逆向推荐的最后半句「提交后重算谁在砧板上，取票数达标中的唯一最高票者」是一次典型的派生值入库 + 自动裁定，而且非常好写、非常体贴，评审时极难拒绝。
- 裁决：三个算式采纳但只出现在渲染路径（core 的举手N/门槛M/差X 与提名面板阈值行），禁止任何算式结果进入 dispatch 的 payload。暂列处决保持为说书人的一次显式动作。verify-architecture 禁用标识符表追加 computeWinner|checkVictory|evaluateWinCondition|isGameOver|recomputeOnTheBlock。

**11. 逆向（建议把去混淆脚本整体拷进 dev-docs 留档，建议照抄 CSS 的 calc 系数表、SVG textPath 的 path 数据与类名结构）× 边界（禁止像素级复制官方外观；禁止从网页抓取的任何素材；audit:public 目前只按扩展名拦截）**

- 冲突：逆向自己在最后一条正确指出 CSS 与图片必须自制，但同一份产出的前半部分反复建议把 k 表抄过去一比一、path d 值直接用，并建议把针对第三方混淆 bundle 的解码脚本提交进公开仓库。这与边界冲突，且解码脚本加 bundle 偏移量注释在公开仓库里是额外的法律与观感风险。
- 裁决：去混淆脚本、bundle 片段、偏移量、原始变量名一律留在 scratchpad，不进 Git 不进 dev-docs；需要留档的只有散文化的几何公式描述 + 自写 TS 实现 + 单测。CSS 系数、类名、SVG path 数据不照抄，按本项目 tokens 重新推导（弧形角色名在中文下本来也要重做：CJK 需按字符数动态字号，沿用 140 viewBox 与 0.052 系数会溢出）。采纳边界提的两条 audit:public 新检查（data:image 超 2KB 报错、source-manifest 字段完整性），并追加第三条：仓库内不得出现 botc.games / cdn.botc.games 的资源 URL。

**12. 模式切换（切到魔典时身份是权威已知的，角色环开箱即满）× 现实（说书人可能从未在工具里配板，用实体袋抽牌）× UX（配板环是开局态的一部分）**

- 冲突：projectCurrentAssignments 只能从 setup_confirmed / setup_changed 投影身份。若这局的配板发生在桌面上而非工具里（纯记录模式下完全可能，产品文档也允许），切到魔典后得到的是一圈空座位，而完整度提示条的文案「12 个座位身份齐全，生死毒醉标记还没录过」在这种情况下会说谎。
- 裁决：完整度必须分两个独立维度：seatsWithRole/totalSeats 与 stateChangeCount。seatsWithRole 为 0 时提示语改为「这局没有在工具里配过板——先补录 12 个座位的身份，魔典才有内容」，入口指向 SetupPanel 的手动分配而非状态补录卡。AI 的 contextLevel 推导必须用同一套 coverage，不得因为 stateChangeCount 大于 0 就升到 standard。

---

## 九、最高风险

| 风险 | 缓解 |
| --- | --- |
| 电子魔典滑向规则引擎——最高风险，且它不会以「我们来做个规则引擎吧」的形式出现，而是一连串体贴的小优化：夜间确认了击杀顺手把目标标死、加了中毒标记顺手把 poisoned 置真、票数达标顺手把人暂列、标记到了移除时机顺手清掉、alignmentInverted 顺手改阵营。每一条单看都合理，code review 很难拒绝，累积起来产品就 | 把判据写死并转成可测试形式，而不是靠文档自觉：① 「一次手势等于恰好一条 player_state_changed，ops 长度恒为 1，系统不得因一条 op 派生第二条 op」写进 dev-docs/HOSTING_MODE_BOUNDARY.md 首句；② 不变量测试 A：after/before 的差异字段集必须是 ops[0] 名字的字面子集；③ 不变量测试 B：对每个非 confirm-player-state-change 的 action 断言 projectCurrentPlayerStates 前后深等；④ 静态检查把越界变成依赖方向问 |
| 工具成为唯一事实来源，而持久化仍是 localStorage 单副本。纯记录模式下丢数据只是丢记录，实体魔典还在；魔典模式下丢数据等于全场身份与标记消失，一局报废且不可能凭记忆恢复。触发路径很多：清除浏览数据、隐私模式、iPad Safari 内存回收、多标签页互相覆盖，以及已核实的 loadGameSession 在任何解析异常时静默回 | 两道闸：① P0 前置批先修静默重置（放宽版本判断 + 失败时先写 recovery key 再回退 + UI 提示可导出），这一条必须在任何字段扩展之前落地；② 在 G1（只读魔典）与 G2（魔典写入）之间插一道不可跳过的耐久性闸门：快照轮转 5 份、启动崩溃恢复询问、多标签页单实例锁、导出 JSON 常驻可达、相位关闭时向后端 recovery 命名空间推送快照（不进归档列表，避免半局进战绩）、破坏性操作先存快照。顺序上让魔典先只读一阵子，正是为了在工具真正成为唯一真值之前把耐久性补齐。 |
| 工程量失控——业余项目，而五份产出加起来的完整实现量约等于重做一遍前端：五种布局注册表 + 贪心尺寸求解 + 拖拽层 + reminder 托盘手势 + 真径向菜单 + 六个新领域类型 + 四个新 timeline kind + 一批自绘资产。最可能的失败形态不是做错，是做到一半停在既不能用纯记录也不能用魔典的中间态。 | 四把刀砍到最小可用：① 布局只做一个椭圆 + 四档离散 startOffset，不做注册表、不做 160→20 贪心求解（改四档离散尺寸 + pitch 碰撞降档），单这一刀省掉魔典几何部分的一半；② 语义状态一律不拖拽（UX 已论证：暗光下落点不可预览、单手够不到上半弧、误放是静默成功），因此不实现拖拽层、不实现托盘的 8px 死区与跟手幽灵、不实现就近归属判定；③ G1/G2 新增 timeline kind 为 0、新增 PlayerState 字段为 0，身份附加层/旅行者流放/登记裁定/疯狂全部推 G4 并允许永不做；④ 自绘资产数为 0，裹尸 |
| 整屏局面的一次性泄密。纯记录模式一次只暴露一个座位，被瞄一眼损失有限；魔典模式一屏就是全部身份加全部标记，被任何一个玩家看到一眼整局结束。这是质变不是量变，而现有遮蔽机制全部围绕单座位设计。UX 的 L1 还错误地把具名标记划进「玩家看到也无所谓」——僧侣保护、红鲱鱼、是酒鬼都是直接的身份信息。 | ① 默认 L1 而非 L2，L2 需两段手势进入且 90 秒无操作自动落回；② L1 下标记只渲染无字圆点加计数，label、sourceRoleId、semantics 不进 DOM；③ 遮蔽是不进 DOM 而非 CSS 覆盖（同时防截屏、屏读器与 devtools）；④ 双指点画布等于立刻 L0 的盲操作路径，恢复必须单指点大按钮（避免慌乱中一次误触又掀开）；⑤ visibilitychange、失焦、无操作超时自动落回；⑥ 进入发身份、投屏、展示信息时强制降级并锁定揭示键；⑦ 玩家可见界面走显式白名单组件，默认不渲染任何身份数据。 |
| 双模式腐化——魔典做完后纯记录模式无人维护悄悄退化成不可用，或反过来魔典的功能成了完成一局的必要条件。这在双模式产品里几乎必然发生，除非有机械保护。 | ① 纯记录全流程 e2e 进 CI，在 P0 批就落地，早于任何魔典代码；② 静态检查：features/hosting-deck 禁止 import features/grimoire 的任何模块；③ 产品文档写死「纯记录模式是保底通道，魔典模式的任何功能都不得成为完成一局主持的必要条件」，每次发布前必须有一条纯记录跑完整局的验收；④ 画布外包 ErrorBoundary，崩溃时自动降级为纯记录并给回执，避免魔典的 bug 让整个工具不可用。 |
| 高频微操作放大误操作，而最省事的撤销实现会破坏审计链。魔典引入点座位切死亡、点标记、长按删除这类无表单确认的手势，误操作率远高于现在；此时给一个撤销按钮直接回滚 state 是最自然的实现，但那会绕过事件追加体系，让时间线不再能还原真实操作历史——而复盘与争议回溯正是本产品的核心卖点。 | ① 撤销必须实现为追加 CorrectionEvent（correctionOf 与 correctionReason，TimelineBase 已有），投影回到操作前但两条记录都在，禁止 state 快照回退或从 timeline 删条目；② 撤销 affordance 挂在 HostNotice 回执上，3.5 秒内可点，超时后走本局记录的更正路径（这一条五份产出都没给，是必须补的设计）；③ 魔典上每次写入强制回执，无回执的静默写入视为故障；④ 删除标记不得是单点击（长按或二段确认）；⑤ 草稿态与已落盘态用虚线加 40% 不透明加「待确认」文字三重区 |
| 归档体积与复盘噪声。before/after 全量快照乘以魔典高频手势，几百次操作后 JSON 明显变大，localStorage 5MB 配额、快照轮转 5 份与 History 的逐条 diff 渲染会同时受压，而没有任何一份给出实测数字。 | 耐久性闸门批必须实测一局 12 人 300 次操作的 JSON 大小并记录在案，据此决定三件事：privateNote 是否只存已修改标志位、是否用 batchId 合并展示以压制 diff 噪声、快照轮转取几份。若超预算，优先砍快照份数而不是砍记录完整性——记录完整性是产品本体。 |
| 补录制造假事实。切到魔典后的状态补录，其 createdAt 是补录那一刻，描述的却是几夜前的事实；若为了时间线好看去回填 createdAt，会直接破坏 projectCurrentPlayerStates 的排序叠加（它严格按 createdAt 覆盖，插入更早的条目可能被后续事件正确覆盖，也可能错误地覆盖别的事件），复盘与 AI 复 | createdAt 一律用真实补录时刻绝不回填；改为在 PlayerStateChangedEntry 上加 backfill（attributedPhaseSegmentId 与可选 sourceEntryId），投影逻辑一行不改，只有展示层与 AI 上下文读它（记录里显示「第4天 · 补录 · 归属第2夜」，复盘时间线挂到第2夜并加事后补录角标，提示词加一句「标注 backfill 的变更发生时间不可靠，不要据此推断说书人当时的判断」）。补录卡逐条可跳过，禁止「全部应用」按钮——那就是自动结算。 |
| 素材与版权。魔典需要的裹尸布、标记底盘、投票令牌、底纹官方源不单独提供，最省事的路径是从官方应用截图切图或直接引用 botc.games 的 CSS 与 cdn 资源；而现有 audit:public 只按扩展名拦截，挡不住 data:image 内联进 ts/tsx/css，也挡不住把去混淆脚本与 bundle 片段提交进公开仓库（逆向 | ① 自绘资产数归零，全部用 CSS 加 lucide 图标实现；② PUBLIC_RELEASE_BOUNDARY 补一条禁止以截图、录屏、切图、临摹从官方应用或官方网页提取界面元素；③ 去混淆脚本、bundle 片段、偏移量注释一律留在 scratchpad 不进 Git，留档只留散文化公式与自写实现；④ audit:public 新增三条检查：data:image 超 2KB 报错、source-manifest 字段完整性、仓库内不得出现 botc.games 与 cdn.botc.games 的 URL；⑤ source-manifest 的 k |
| 状态组合爆炸。UI_REDESIGN_PLAN 第三批已记录 isPreviewing / isReadOnly / isCorrecting 三布尔叠加会爆炸并要求先收敛成 mode 枚举，魔典再叠 replay 态、deal 态、遮蔽三级、草稿态、模式二值，组合数进一步上升，而五份产出没有一份给出统一状态设计。后果是每加一个态都要回头 | 把三布尔收敛成显式 mode 枚举的工作提前到 G1 之前（并入 P0 或第一批尾），且这次收敛必须一次性把魔典将来要加的 replay/deal/草稿全部纳入设计（可以先不实现，但枚举与不变量先定）。同时定一条硬规则：任何只读态都通过一个 readOnly prop 自上而下强制，禁止各组件自行判断——归档回看的写入禁用也用同一机制，不靠自觉。 |

## 十、尚未回答的问题

- 组件分解与行数预算：verify-architecture 对 src/features/**/*.tsx 硬性封顶 320 行，而 UX 描述的画布（环布局 + 卫星弧 + 帷幕/角标覆盖层 + 幽灵层 + core 五种相位内容 + SeatActionBar + 三档抽屉 + 三级遮蔽 + 网格退化）没有任何一份给出文件切分与预估 LOC。必须先产出一张「G1/G2 各新增哪些文件、各自职责与行数上限」的清单，否则第一周就会撞预算并引发放宽预算的提议（边界已明确反对放宽）。
- 撤销与更正的界面完全缺失：边界规定 undo 必须实现为追加 CorrectionEvent 而非状态回滚，但 UX 的 actionModel 里没有任何撤销入口——而魔典的全部卖点就是高频低成本微操作，误操作率必然高于表单式记录。缺一个「刚才那一下」的即时撤销 affordance（建议挂在 HostNotice 回执上，3.5 秒内可点，超时后走本局记录的更正路径）及其与 expectedBefore 乐观锁的交互定义。
- 提示标记目录的数据来源与覆盖率：数据模型定义了 ReminderTokenDefinition，黄昏到期候选依赖 sourceRoleId，但没人回答这些标记文本从哪来。已知 complexRoleKnowledge.ts 持有 reminders 字段且有 slice(0,3) 截断，而导入的社区剧本数量远大于已研究的复杂角色。缺一份「已覆盖多少角色的标记目录 / 未覆盖时的降级形态 / 是否需要新的抓取批次」的评估。目录缺失面若超过一半，G2 的标记面板就应直接做成自由命名，不做目录。
- 素材：现有 source-manifest 718 项全是角色图标，魔典需要的裹尸布、标记底盘、投票令牌、状态环、底纹一项都没有，官方源也基本不单独提供。边界给了「一律自制 SVG」的方向，但没人估算这批自绘资产的工作量与由谁完成——对业余项目这可能是隐藏的最大时间黑洞。需要一个明确的最小集（建议：自绘资产数为 0，全部用 CSS + 现有 lucide 图标实现）。
- 中文角色名在 token 上的排版：逆向指出 botc 是在 JS 里按名字长度算 font-size、超过 22 字符切换布局分支，而中文角色名从两字到五字以上不等，在 64px 的 XS 档如何渲染，UX 没有给规格。这直接决定 18–20 人局的环是否可读。
- 无障碍与键盘路径：UX 只说抽屉里保留 SeatButton 号码网格作 fallback 兼作键盘与屏读通道，但没给环本身的 ARIA 结构、焦点顺序，以及「点座位 = 做当前这一步」这个上下文相关语义如何向屏读器表达。项目现有 UI_ACCEPTANCE_CHECKLIST 有屏读要求，魔典需要对应条目。
- 性能与命中检测：20 座位 × 每座最多 3 枚 chip × 幽灵层在 iPad Safari 上的渲染与触摸响应没有任何实测或预算。特别是从逆向沿用的「菜单打开时用 rAF 持续跟随」若被保留，会在低端设备上成为持续掉帧源——建议直接不做跟随，SeatActionBar 打开期间禁止画布位移。
- 局中座位数变化：旅行者可随时加入/离场，而环的角度是 f(index, count)，人数一变整圈重排。现有 GameSessionState.seats 是 Record 且 playerCount 是顶层字段，没有任何一份说明中途增减座位怎么做、会不会打乱既有 timeline 的 seatId 引用。这也是 G4 旅行者批的真正前置。
- 存储容量与归档体积：before/after 全量快照乘以魔典高频手势的增长只有定性描述没有数字。需要实测一局 12 人 × 300 次操作的 JSON 大小，与 localStorage 5MB 配额、快照轮转份数一起算总账，据此决定 privateNote 是否只存标志位、markers 是否需要增量。
- 功能开关与回滚：没有任何一份提到 feature flag。降级交接卡覆盖了主动切换，但没覆盖「魔典视图渲染崩溃」这种情况。建议 ErrorBoundary 包住画布，崩溃时自动降级为纯记录并给回执。
- ~~窄屏下模式的语义~~ **已裁决（G1 实施时）**：窄屏照问，不隐藏。这张卡问的是「桌上有没有实体魔典」——那是物理世界的事实，与屏幕宽度无关。隐藏它会让 hostingMode 静默取默认值，等说书人换到平板上，就会看见一张自己从没同意过的电子魔典。窄屏只在卡片下方补一句「这台设备画不下座位环，会排成列表；换到平板上会自动变回环」。换设备时不做任何迁移动作：hostingMode 是出处元数据，退化的是渲染而不是这局的性质，这也正是它被禁止成为行为分支的原因。
- 只读态的组合爆炸：UI_REDESIGN_PLAN 第三批已记录 isPreviewing / isReadOnly / isCorrecting 三布尔叠加会爆炸并要求先收敛成 mode 枚举，魔典再叠 replay 态、deal 态、遮蔽三级、草稿态，组合数进一步上升，但没有任何一份给出统一的状态枚举设计。这应在 G1 之前定好，否则 G3 的回看态会成为最难写的一块。
- AI standard 上下文的成本与隐私：模式切换提出 coverage 为 full 时下发完整 seats 数组，但没估算 token 增量与费用影响，也没说明这同时是一个隐私选择（把完整魔典发给第三方模型）。缺一条「完整局面上传需用户显式开启」的决定。
- 纯记录模式的回归保护：三份都提到纯记录模式不得腐化，但只有边界提了一条 e2e。缺具体定义：这条 e2e 覆盖哪些步骤、跑在 npm run check 的哪个位置、耗时预算多少（Playwright 全流程在业余项目的本地 check 里可能过慢，需决定是否只在 CI 跑）。

---

## 附：botc.games 逆向资产（仅供实现参考，不照抄代码/CSS/素材）

> 去混淆脚本、bundle 片段、偏移量、原始变量名一律留在本地 scratchpad，**不进 Git**。此处只保留散文化的几何描述，实现须自写并配单测。

### 定位机制总体：JS 算绝对 left/top 并持久化，不是 CSS transform rotate/translate

画布是 <div class="flex-grow-1 position-relative mt-3 div-frame canvas svelte-br42yd">，宽高由 q.clientWidth/clientHeight 实测（window resize 时重算）。每个座位是 Draggable 包装组件 <div class="draggable position-absolute" style="top:{y}px; left:{x}px; z-index:{dragging?9999:EndzIndex}">。位置来源是 Redux 里每个 player 的 position:{x,y}，只有触发 rearrangeTokens 事件时才由布局函数批量重算并 dispatch(setPosition)。布局公式是一次性求解器，不是每帧渲染的几何绑定；说书人拖动后位置永久偏离公式。token 的 EndzIndex = 500 - Math.round(y/5)（越靠上层级越高，制造伪 3D 遮挡），菜单打开时提升到 5000；reminder 用 900 - Math.round(y/5)；拖拽中 9999。重排后额外做水平夹紧 x = clamp(x, 12, W - tokenSize - 15)。

**本项目取舍**：本项目（React 19 + Vite，src/features 下目前完全没有魔典画布，只有 seatPresentation.ts 这类文本化座位）若要做魔典，建议照抄这个「求解一次 + 自由拖拽」模型而不是纯 CSS 环：新增 src/features/grimoire/，把 layout/ 做成纯函数模块（无 DOM 依赖、可单测），把 position:{x,y} 放进 game-session 的 state 并持久化。渲染层用 position:absolute + left/top（不要用 transform，因为拖拽库和命中检测都依赖 offset 坐标系）。z-index 用同样的 base - round(y/5) 公式。

### 布局注册表与五种形状的入口签名

index-Ct0ZFg-o.js 末尾有 const pi={}; pi.nshape=d3; pi["circle"]=f3; pi["ellipse"]=u3; pi.rainbow=l3; pi.ushape=b3; const R$=pi。每个条目是 {position, size}。签名（去混淆后）：position(index, count, canvasW, canvasH, tokenSize, showNames, showPronouns) → {x,y}；size(count, canvasW, canvasH, showNames, showPronouns) → number。UI 选项 i18n：common.n_shape="∩ Shape"、u_shape="Smile"、rainbow、circle、ellipse；value 分别是 nshape/ushape/rainbow/circle/ellipse。默认 nshape（2.15.0 版本说明：Tokens are now laid out in a ∩ shape by default）。setup 页和魔典的 #arrangeModal 都用同一个 <select id="layoutDropdown">，另有 First Player 下拉（startIndex）与 flip（水平翻转）。circle/ellipse 时隐藏「首位玩家在哪个角」的提示。

**本项目取舍**：照搬这个注册表形状：export const GRIMOIRE_LAYOUTS: Record<LayoutId, {position, size}>，LayoutId = 'nshape'|'ushape'|'rainbow'|'circle'|'ellipse'。把 startIndex（首位玩家）与 flip 作为重排参数而不是布局参数——botc 是在调用侧做 (flip ? n-1-i : i + startIndex) % n 的索引重映射，布局函数本身保持纯粹。

### Circle / Ellipse 的角度与半径公式

公共角度函数 t1(i,n) = i*(2π/n) - π/2（从正上方 12 点开始顺时针）。名字预留量 pad = showNames ? tokenSize * (showPronouns ? 0.25 : 0.15) : 0（函数 Ca(showPronouns)）——这就是为什么开了名字/代词后圆会往上缩。
Circle（_W）：R = min(W, H - pad)/2 - S/2；x = W/2 + R*cos(θ) - S/2；y = (H - pad)/2 + R*sin(θ) - S/2。
Ellipse（cW）：rx = W/2 - S/2；ry = (H - pad)/2 - S/2；x = W/2 + rx*cos(θ) - S/2；y = (H - pad)/2 + ry*sin(θ) - S/2。
注意两者都把 -S/2 直接算进去，因为定位的是元素左上角而不是中心。

**本项目取舍**：直接移植这两条公式即可，两行代码。建议把 pad 抽成 nameGutter(tokenSize, showNames, showPronouns) 常量函数，避免以后加「显示座位号/显示能力文本」时再散落魔法数 0.25/0.15。若本项目 UI 一律显示中文昵称，pad 系数可能要调大到 0.3 左右（中文名占两行的概率更高）。

### Rainbow / Smile(ushape) 的弧线公式（共用 rw）

共用弧线函数 rw(i, n, W, H, baseY, R, S, flip)：φ = π + i * (n>1 ? -π/(n-1) : 0)，即角度从 π（最左）线性扫到 0（最右）；x = W/2 + R*cos(φ) - S/2；y = flip ? baseY - R*sin(φ) - S/2 : baseY + R*sin(φ) - S/2；随后 x = clamp(x, 0, W-S)、y = clamp(y, 0, H-S)。
半径上界 K5(W,H,S)：m = S*0.1；return min(W*0.4, H*0.6, (W/2 - S/2) - m, (H - S) - m)。
Smile（uW，flip=false，向下凹的 ∪）：R = K5(W,H,S) - pad；baseY = S*0.1 + S/2（基线贴在画布顶部）。
Rainbow（bW，flip=true，向上拱的 ∩ 半圆）：R = K5(W,H,S) - pad；baseY = S*0.1 + R + S/2（基线在弧底）。
两者都是「从左侧起点顺弧到右侧」——changelog 明确修过 "Rainbow token arrangement now correctly starts from the left side"，且抽牌提示对 nshape/rainbow 说 the_bottom_left、对 ushape 说 the_top_left。

**本项目取舍**：这两个共用一个 arc(i,n,...,flip) 就够，别写两份。K5 里的 W*0.4 / H*0.6 是「弧不许占满画布」的观感常数，移植时保留；如果本项目画布是宽屏 16:9，H*0.6 会成为瓶颈，可考虑改成 min(W*0.42, H*0.62)。注意 flip 与 baseY 是一组，改一个必须改另一个。

### 默认 ∩ 形（nshape）：分列算法与逐项坐标

先算列数分配 xw(n, W)：narrow = (W <= 500)。
· n ≤ 11：side = floor((n-2)/2)；top = min(3, n - 2*side)（即偶数 n→top 2、奇数 n→top 3）。
· n > 11 且窄屏：n 偶 → top=2, side=(n-2)/2；n 奇 → top=3, side=(n-3)/2。
· n > 11 且宽屏：n 奇 → top=5, side=(n-5)/2；n 偶 → top=4, side=(n-4)/2。
然后 dW(i,...)：gap = min(15, S*0.5)；pad = showNames ? S*Ca(showPronouns) : 0；vgap = gap + pad；firstY = S + S*0.3 = 1.3S；evenTop = (top%2===0)；m = evenTop ? top+1 : top；rowW = (m-1)*(S+gap) + S + S；vw = min(rowW, W)；gx = max(0,(W-vw)/2)；leftX = gx；rightX = min(W-S, gx+vw-S)；topStartX = max(0, (W - ((m-1)*(S+gap)+S))/2)。
· i < side（左列，自下而上）：x = clamp(leftX,0,W-S)；y = clamp(firstY + (side-1-i)*(S+vgap), 0, H-S-pad)。
· side ≤ i < side+top（顶排，左→右）：a = i-side；slot = a；若 evenTop 且 a ≥ top/2 则 slot = a+1（跳过正中槽位）；x0 = topStartX + slot*(S+gap)；若 evenTop 再做 x0 += (a < top/2 ? +S*0.5 : -S*0.5)（把偶数排向中线对称收拢）；x = clamp(x0,0,W-S)；y = 0。
· 其余（右列，自上而下）：a = i-(side+top)；x = clamp(rightX,0,W-S)；y = clamp(firstY + a*(S+vgap), 0, H-S-pad)。
即座位 0 在左下角，逆时针（视觉上向上）走完左列、走顶排、再向下走右列。

**本项目取舍**：这是 botc 的默认观感来源，也是最值得抄的一个——它比圆形更适合手机竖屏。移植时把 xw() 单独做成 splitColumns(n, canvasWidth)，写表驱动单测（n=5..20 × 窄/宽两档），因为分支多、边界（evenTop 的半格偏移）很容易写错。窄屏阈值 500px 建议做成常量并跟本项目的断点体系对齐。

### token 尺寸自适应：160→20 贪心求解，另有独立 slider

每种布局都有 size()，形式统一：for (S = 160; S >= 20; S -= 5) { 若可行 return S } return 20（tu 常量=160，下界 20，步长 5）。
· 弧线类（aw，rainbow/ushape 共用）：pad = showNames ? S*Ca : 0；R = K5(W,H,S) - pad；可行条件 (π*R)/n ≥ S*1.1 && R ≥ S（弧长每人至少 1.1 个 token）。
· Circle（pW）：R = min(W, H-pad)/2 - S/2；need = S*(1 + (showNames?Ca:0))；可行条件 (2π*R)/n ≥ need*1.1。
· Ellipse（mW）：rx = W/2 - S/2、ry = (H-pad)/2 - S/2，遍历相邻两个座位算实际弦长，取最小弦长 ≥ need*1.1。
· nshape（fW）：先查顶排能否塞下（top*S + (top-1)*2 ≤ W - S - 4），再查总高 2S + side*S + (side>0 ? (side-1)*(min(5,S*0.05)+pad) : 0) ≤ H。
求出的 S 会 dispatch 进 settings.tokenSize。此外用户设置里有手动 slider：#sizeSlider type=range min=50 max=300（±10 按钮），默认 tokenSize=160；reminder 有 #reminderSizeSlider min=25 max=tokenSize（±5 按钮），默认 reminderSize=80；一个 linkSizes 开关（fa-link / fa-link-slash）决定两者是否联动，联动时改 tokenSize 会按原比例等比缩 reminderSize 并夹到 ≥25。渲染时 --size = tokenSize * scale（scale 是组件 prop，默认 1）。

**本项目取舍**：强烈建议照抄「贪心求解 + 用户 slider 覆盖」双轨：自动求解保证任何人数都不重叠，slider 让说书人在投屏时放大。可行判据里的 1.1 是间距系数，本项目若 token 上要显示中文角色名+昵称，建议提到 1.15~1.2。求解循环只有 29 次迭代，放在 resize 的 rAF 里也不卡。

### 拖拽层：interact.js draggable + 分向边界夹紧 + allowOverflow

包装组件（index 里的 aee，main 里叫 F2）props：{item, EndzIndex, boundTo(画布 DOM), disabled, extraBottomMargin, extraLeftMargin, extraRightMargin, allowOverflow}，事件 position_changed / dropped。实现用 interact(el).draggable({ignoreFrom:'[data-resize-handle]', listeners:{start,move,end}}).styleCursor(false)。move 里：S = clientX - grabOffsetX；用 boundTo.getBoundingClientRect() 与 firstElementChild 的实际尺寸算 maxX = max(0, A.width - W - extraRightMargin)、maxY = max(0, A.height - B - extraBottomMargin)；S = min(max(extraLeftMargin, S), maxX)；z = allowOverflow ? max(0,z) : min(max(0,z), maxY)。token 传 extraBottomMargin = showNames ? tokenSize*(showPronouns?0.25:0.15) : 0（给名字牌留位），extraLeft/Right 来自同一组 12/15；reminder 传 allowOverflow:true，所以 reminder 可以被拖到画布下沿之外（配合 .reminder-offcanvas-spacer / .night-gallery-spacer 这两个负 bottom 的占位块）。

**本项目取舍**：React 侧可以用 @use-gesture/react 或 dnd-kit 复刻，但要保留三件事：(1) 边界按「元素实际测量尺寸」而不是 tokenSize 常量算，否则开了名字牌会漏出画布；(2) 水平/垂直分别夹紧，且给 reminder 单开 allowOverflow；(3) 拖拽中提升 z-index 到极大值再落回公式值。ignoreFrom 那个手柄排除机制也留着，将来要在 token 上放小按钮时会用到。

### 角色 token 的 DOM 构成层次（六层）

外层 .grimoire-token-wrapper.position-relative.d-inline-block.rounded-circle，内联 --size / width / height。自内向外：
1) 底图：.token（background-image: url(cdn/images/token.webp); background-position:center; background-size:110%; box-shadow:2px 2px 10px #000; z-index:2）。
2) 内容层：.role-details-layer（absolute inset:0，flex 居中）+ .token-flex-container（absolute，纵向 flex，pointer-events:none，z-index:1）；里面依次是 .left-shaper/.right-shaper（float + shape-outside:polygon 做梯形绕排，width:18%，height:calc(var(--size)*.14)）、.ability-text（font-size:calc(var(--size)*.052)，max-height:calc(var(--size)*.45)，隐藏时 .hidden-ability 把 max-height 收成 0）、角色图 img.icon-flex（max-height:calc(var(--size)*.65)，.full-size 时 .8；Evil/Good + .flipped 用 --blue-to-red / --red-to-blue 两个 hue-rotate 滤镜做阵营变色）。
3) 角色名：一个 <svg class="name-svg" viewBox="0 0 140 140">，内含 <path id="curve" d="M 8,95 A 70,70 0 0,0 128,95"/> + <textPath href="#curve" startOffset="50%" text-anchor="middle">，字体 Sorts Mill Goudy，fill:#000 —— 弧形刻名就是靠这条 SVG path，不是 CSS。
4) 座位号/玩家名：.floating-name-label（absolute，top:98%，z-index:10；.name-above 变体改成 bottom:98%），内含 .name-badge（badge rounded-pill text-bg-light），里面 .player-number（奇数 #B8860B 金、偶数 #6F2DA8 紫）+ 名字 + .pronouns-text（opacity .7，0.8em）。带 data-name-badge={playerId} 供命中检测。
5) 叶片装饰：.left-leaf（首夜行动，left-leaf.webp）、.right-leaf（

**本项目取舍**：值得完整复刻的是第 2、3 层：shape-outside 梯形绕排 + SVG textPath 弧形名，这两个是「像官方 token」的关键，纯 CSS 做不出来。所有尺寸都用 calc(var(--size) * k) 表达，本项目直接把 k 表抄过去（.052/.14/.45/.65/.8/.36/.15/.16）就能一比一。中文角色名要注意 textPath 的 startOffset:50% + text-anchor:middle 对 CJK 依然成立，但字号要按字符数动态给（botc 是在 JS 里算 font-size 传进来的，且名字 >22 字符时切换到另一个纯 div 布局分支）。
