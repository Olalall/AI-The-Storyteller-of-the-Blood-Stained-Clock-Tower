# 架构防腐

## 2026-10-21 共享角色与板包准备

- `role-library/<来源分组>/roles.ts` 是独立的角色知识源，旧 `packs/*/roles.ts` 仅兼容导出，不再保存第二份定义。迁移前后完整板包逐项相等，不修改会话快照。
- `roleDefinitionLibrary` 只索引已加载/显式提供的知识。ID别名可归一，不同定义不能按同名覆盖；已知默认角色也必须真实存在于来源中。来源和版本可明确锁定。
- `createReferencedScriptPack` 只组装角色引用及夜表；不执行角色技能、不注册板子、不触碰GameSession。自制与非默认变体不能套用默认官方夜序。
- 离线准备工具复用已有合法模板并输出待核对草稿；不能把缺失角色、规则冲突或模板数量不足自动降级成“已核实”。新增板子无需增加页面和角色技能分支。
- 共享角色、模板和生成目录保持按需加载；浏览器入口不得导入全量 `allPacks.ts`。构建清单和素材投影仍从单一注册表生成。

## 2026-10-18 普通换角与当晚安排

- 仍只有一个会话 reducer、夜序和时间线。`confirm-night-role-change` 由主持指定玩家、新角色和当晚处理方式，同一步追加角色事件并停用旧未发动项；不让 AI 选择时点或改权威状态。
- 普通夜间能力、仅首夜信息补充与新痢蛭宿主初始化分开；`abilityPhase: initial` 不改变全局昼夜编号。初始化范围只开放有来源的痢蛭，不据此重做卡扎力/堤丰之首设置。
- 新技能实例关联本次换角ID，不重用旧确认；已确认项与旧草稿不删除。持续效果、生死、阵营和次数仍逐项人工确认。
- `nightAbilityTiming` 与 `abilityPhase` 均为旧存档兼容的可选字段，恢复、AI请求和最终提交继续核对合法值、当前身份及存活宿主。

## 2026-10-18 卡扎力首夜确认边界

- 分配表单和 AI 只写逐组“玩家 → 爪牙”草稿；普通“确认本项”只追加夜晚记录。
- 说书人单独点击“确认应用身份并更新本夜夜序”后，单一会话命令追加带来源的身份事件，按本板首夜表补入新爪牙，并停用失去角色的未发动项；不自动结算技能、毒醉、死亡或胜负。
- 已确认记录、被停用项的旧草稿和历史配板不覆盖。更正分配追加来源及角色事件；若分配后还有其他换角则拒绝覆盖，交由说书人核对。

## 2026-09-08 本地恢复与编辑权边界

- 对局仍只有 GameSession reducer 与既有 localStorage 真源；IndexedDB 仅用于跨标签页编辑租约，不保存第二份业务状态。
- 备份预览不写权威状态；说书人确认后先备份当前局，再替换主存档并重新加载。版本、结构或引用不符时拒绝导入。
- 工作台写入统一通过 useGameSession 的编辑保护；不得在页面绕过租约直接调用存档 adapter。保护不可用时停止编辑。

- `main.tsx` 和 `App.tsx` 只装配，不承载夜间业务。
- 夜序只有一个 `NightQueueList` 和一个 `NightQueueSheet`；“本局/官方”只是同一列表的展示投影。
- 共享组件不读取夜间 store；业务状态留在 feature。
- 角色 ID 只用于数据查找，不用于自动判断技能结果。
- 点击结果由声明式模板投影为草稿；模板不得包含条件、状态补丁、发送命令或夜序推进命令。
- AI只能推荐现有声明式 `outcomeId`；“AI推荐”只能改本项草稿，不得直接写确认记录、权威状态或夜序光标。
- 原型数据通过独立 adapter/fixture 输入，后续 API adapter 替换时不重写组件。
- 不从旧项目复制 `server.js`、巨型 HTML、PhaseCoordinator、RuleAutomation 或 NightOrderManager。

执行：

```powershell
npm run verify:architecture
```


## ?????????

- ?? `Domain Contract + Projectors + Repository Adapter`???????????? React ?????? HTTP?SQL ? AI SDK?
- ??????????????? PATCH `GameSession`?
- ???????? `commandId`?`baseVersion` ????????????????????????????
- ????????????????????????????????????????????????
- API Key ??????????????????????????????
- ?????????????????????????????AI ???????????

?????????`dev-docs/frontend-backend-contract.md`?


## ??????????

- ????????????????`ROLE_CENSUS.md`??????????????????????????
- ??????????????????`SCRIPT_RULE_CENSUS.md`??? setup ?????????????????????
- ? Agent ????????????????? `dev-docs/script-import-work/<batch-id>/<script-id>/` ?????
- ???????`catalog.ts`?`role-copy.ts`?`complexRoleKnowledge.ts` ???? Agent/?????????
- ??????????????????????? hash ?????????????????
- ???????????????? setup ?????????????????????


## 2026-09-08 剧本知识加载边界

- 浏览列表用自动生成的 `scriptManifest`；完整资料读取前需完成 `loadSmartScriptPack`。已加载知识缓存不存储对局状态。
- `allPacks.ts` 是原始 pack 的离线完整注册入口，不得作为浏览器页面依赖；新增剧本后运行 `npm run generate:script-manifest`，构建校验生成内容。
- 开局、切换和恢复必须先完成资料加载；失败、取消或过期的请求不得继续改变本局。恢复后的编辑仍走原来的会话租约。
- 生成列表、异步入口和图标投影都来自原始 pack；不得手工维护第二份角色资料。详细流程见 `LOAD_PERFORMANCE.md` 第三轮。

## main 保留的独立魔典设计约束

以下约束用于保留的独立模块与后续设计；本轮仍以已上线主持台为入口，不启用另一套魔典顶层。

## 魔典模式：九条反规则引擎静态检查

### 这一节存在的理由

纯记录模式下「本工具不结算能力」是天然成立的——工具压根不持有能算出结果的状态。魔典模式把整局局面搬进了工具，这句话就失去了物理保障，只剩下实现纪律。而规则引擎不会以「我们来做个规则引擎吧」的形式提交上来，它长成一连串体贴的小优化：夜间确认了击杀顺手把目标标死、加了中毒标记顺手把 `poisoned` 置真、票数达标顺手把人暂列。每一条单看都合理，靠 code review 拒绝不了第五次。

因此这九条的设计原则是：**把「不是规则引擎」尽量转化为依赖方向问题与类型形状问题**。这两类判定不需要理解代码语义，可以 100% 静态验证，也就不依赖评审者当天的警觉程度。凡是只能靠读懂意图才能判的（例如「这个 case 改的字段是不是超出了它的名字」），不放进静态检查，走不变量单测（见本节末尾）。

依据：`dev-docs/DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md`「架构守护：为魔典模式新增的 9 条反规则引擎自动检查」。实现落在 `scripts/verify-architecture.mjs`，本节记录的是意图与判据，不是实现。

设计文档在第 5 条中途截断（原文只写到「禁止自动推进：src/features/grimoire」），第 5 至 9 条由上述设计原则回推补全，取的是文档其余章节已经点名要做静态检查的那几处：判别标准三（定时/副作用推进）、判别标准二加胜负判定符号表、双模式腐化的机械保护、以及 ABILITY_SETTLEMENT_BOUNDARY 那条「后端不得持有隐藏规则引擎状态」——它是现存边界里唯一还没有任何自动检查在守的一条。原文如果日后被补全，以原文为准。

**第 1、2、4 条价值最高**——它们是纯依赖方向与纯类型形状检查，零语义判断、零误报，且各自单点挡住一整类漂移：AI 直写权威状态、能力可执行化、标记变成规则。任何时候要削减检查数量或为某条开豁免，这三条最后动。

### P0（最高价值，纯依赖方向检查，零误报）

**1. AI 不得直连权威状态** — 已实现，规则 id `state-no-ai-import`

- 判据：`src/features/*/state/**` 下的任何 `.ts/.tsx`，其 import 说明符解析为相对路径后落在 `src/services/ai/**` 或 `src/features/ai-*/**`，即 fail。静态、动态 `import()`、副作用 import 一并计入。
- 为什么：AI_AUTHORITY_BOUNDARY 的核心是「AI 只能改本项草稿」。一旦 reducer 能直接 import AI 服务，这条边界就从架构事实退回成口头约定——某个 case 里顺手 `await advise()` 再把返回值写进权威状态，在 diff 里只表现为多了一行 import。禁掉这个方向，AI 结果就只剩一条路进入状态：由组件层取到后作为 action payload 传进来（参考 `nightWorkbenchReducer` 的 `apply-ai-advice`），而 payload 是人写的、可枚举的、可测的。

**2. 角色包必须是纯数据** — 已实现，规则 id `pack-no-session-state`

- 判据：`src/domain/scripts/packs/**` 与 `src/domain/role-knowledge/**` 下出现以下任一即 fail：import 解析到 `src/features/game-session/**`；出现 `=> GameSessionState` / `: GameSessionState` / `Promise<GameSessionState>` 形状的返回签名；出现裸标识符 `GameSessionState`。
- 为什么：角色包看不见整局状态，「洗衣妇的能力」就只能是一段给人读的说明文字；角色包一旦能看见，同一段说明就会被改写成一个能算出答案的函数。这是能力可执行化的唯一入口，而且它会同时长在两百多个角色包里——发现得晚就收不回来了。需要局面信息时由调用方投影成入参传入，方向永远是 features → domain。

**3. 单一持久化真值** — 已实现，检查 `localstorage-key-allowlist`（不在 rules 数组内，走 `checkStorageKeys`，白名单常量 `localStorageKeyAllowlist`）

- 判据：扫描 `src/**` 与 `server/**`，从三种确定是存储 key 的语法位置取字面量——`localStorage.{get,set,remove}Item` 的直接实参、标识符名以 `StorageKey`/`StoragePrefix`/`MemoryKey` 结尾的常量声明、同名后缀函数的 `return` 字面量；模板插值归一为 `{}` 后必须命中白名单，否则 fail。新增 key 连同 owner 与用途登记进白名单才放行。
- 为什么：魔典一屏能改的东西比纯记录多一个量级，「给魔典自己开一个 key」是最省事的写法。真值一分为二，崩溃恢复时两份必然对不上，而对不上的那一局正开在牌桌上。快照槽与单实例锁已经在白名单里显式登记并注明「不是第二份真值，主副本始终权威」——登记这个动作本身就是让作者在写下 key 之前先回答它跟主副本是什么关系。

### P1（形状检查：类型形状与语法位置）

**4. 标记不得携带效果** — 已实现，规则 id `reminder-no-effect-fields`

- 判据：范围限定在 `src/features/{night-workbench,game-session,grimoire}/` 下的 `types.ts` 与 `model/*.ts`；先向上回溯到最近的 `interface`/`type` 声明，名字含 `Reminder`/`Marker`/`Token` 且花括号未配平（即仍在该类型体内）时，字段声明位置出现 `effect` / `effects` / `appliesTo` / `modifies` / `onNight` / `onDeath` / `resolve` / `trigger` 即 fail。只查类型定义处：业务代码里的 `onDeath` 未必是标记字段，全域查会把真信号淹没在误报里。
- 为什么：`ManualStatusMarker` 现在只有 `id` 和 `label`，它是说书人写给自己看的一张便签。补上任意一个上述字段，标记就从便签变成一条可执行规则；有了可执行规则，就一定会有人写一个遍历 `markers` 执行 `effect` 的循环。那个循环就是 `AbilityEngine`，只是名字不同——而 `legacy-engine-symbols` 只认名字。这条检查认的是形状，名字换成什么都绕不过去。

**5. 禁止自动推进** — 已实现，规则 id `grimoire-no-phase-dispatch`

- 判据：`src/features/grimoire/**`（`*.test.*` 与整行注释除外）禁止出现相位类 action 的字面量 `open-phase-segment` / `close-open-segment` / `start-next-night-run` / `close-active-night-run` / `confirm-day-execution` / `confirm-day-no-execution`。落地时选的是「魔典组件树里根本不出现这些 action 名」，而不是「effect 里不许 dispatch」——前者是纯字面量匹配，判定面比扫描回调体小得多，也不会因为 `dispatch` 被换个名字包一层就失效。
- 为什么：这是把「一次状态写入必须能追溯到一次说书人手势」翻译成语法位置。副作用推进是最体贴、最难拒绝的一类越界——夜间最后一个角色确认完，一个 effect 顺手推进到黎明，用起来确实更顺。但它同时切断了手势与写入的对应关系：出错时说书人无法指认是自己的哪一次操作造成的，也无法撤销。相位推进的唯一门是黄昏/黎明/收尾交接卡，魔典视图上的座位操作、标记操作、夜序操作一律不推进相位。
- 未覆盖的部分：这条只锁相位类 action。魔典 effect 里 dispatch **非**相位类 action（例如在 `useEffect` 里改生死或改标记）当前没有静态检查在拦，靠的是本节末尾那两条不变量测试。白天计时器是唯一豁免的定时器，它不写日志、不改状态，且不在 `src/features/grimoire/` 下。

**6. 派生值不得进入 action payload** — 部分实现，规则 id `no-derived-values-in-actions`

- 已实现的判据：`src/features/*/state/**`（`*.test.*` 与整行注释除外）的字段声明位置禁止出现 `majority` / `aliveCount` / `isDemonDead` / `evilRemaining` / `isGameOver`。查的是 action 与 state 的类型声明，不是表达式——这些值在 render 里随便算，进了类型就成了第二真值。
- 为什么：三个阈值算式（举手 N / 门槛 M / 差 X）已获准使用，但只准出现在渲染路径。算给说书人看是辅助，算完写回 session 是裁定——中间只隔一次 `dispatch`。「票数达标顺手把人暂列处决」正是从这一步开始的，而它在评审里几乎无法拒绝，因为算式本身是对的。把边界画在类型字段上，就把一个语义争论变成了一个可机械判定的位置问题。
- 缺口：`computeWinner` / `checkVictory` / `evaluateWinCondition` / `recomputeOnTheBlock` 这批胜负判定标识符尚未加进 `legacy-engine-symbols` 的符号表（`isGameOver` 已被上面那条以字段名形式拦住，但作为函数名同样没拦）。补上之前，「谁赢了」这个计算可以在 state 目录之外的任何地方以函数形式出现而不被发现。

### P1（补充依赖方向）

这三条守的不是「规则引擎」本身，而是它赖以长出来的三块地基：一个能被魔典绑架的保底通道、一个不可重放因而无法被不变量测试约束的 reducer、一个手里握着能力数据的后端。地基没了，引擎就没有生长的地方。

**7. 纯记录模式不得依赖魔典** — 未实现

- 判据：`src/features/hosting-deck/**`（及其余纯记录路径）禁止 import `src/features/grimoire/**` 的任何模块。方向单向：魔典可以复用纯记录的骨架，反之不成立。
- 为什么：纯记录模式是保底通道。魔典画布一旦崩溃或被降级，说书人必须还能把这一局跑完；只要纯记录路径上有一个 import 指向魔典，这个保底就不存在了。双模式产品里这种腐化几乎必然发生，除非有机械保护。
- 落地前置：`src/features/hosting-deck/SessionEntry.tsx:3` 当前 import 了 `../grimoire/mode/HostingModeCard`，这条检查加上即 fail。`HostingModeCard` 是模式选择卡，不是魔典视图的一部分，它归位到 `src/features/hosting-deck/` 或共享层之后这条检查才能开。

**8. reducer 保持可重放的纯函数** — 未实现

- 判据：`src/features/*/state/**` 下的 `*Reducer.ts` 禁止出现 `Date.now()` / `new Date(` / `Math.random()` / `crypto.randomUUID()`。时间戳与 id 由调用方生成后随 action payload 传入。范围刻意只到 reducer 文件，不覆盖同目录的 hook——`discussionTimer.tsx` 与 `useSessionDurability.ts` 读时钟是它们的职责所在。
- 为什么：reducer 读时钟或读随机数，同一串 action 重放两次就会得到两份不同的状态，归档回放与不变量测试同时失去意义——而不变量测试正是本节把语义类判据托付出去的地方（见下）。这条守的是那套测试的前提。
- 落地前置：`src/features/night-workbench/state/nightWorkbenchReducer.ts` 里写 `confirmedAt` 的那一处 `new Date().toISOString()` 是当前唯一违反项，把时间戳改成随 payload 传入后这条检查才能开。

**9. 后端不得取用角色能力数据** — 未实现

- 判据：`server/**`（`*.test.ts` 除外）禁止 import `src/domain/role-knowledge/**` 与 `src/domain/scripts/packs/**`。归档需要角色名或剧本名时，由前端投影成字符串随请求体传入。测试文件豁免的理由是明确的：`server/roleKnowledgeSourceDocs.test.ts` 校验的是知识条目与来源文档的一致性，它不参与运行时。
- 为什么：ABILITY_SETTLEMENT_BOUNDARY 要求后端不保存一套隐藏的规则引擎状态，但这条边界此前没有任何自动检查在守。「后端有没有隐藏状态」需要读懂代码才能判，「后端能不能看见能力数据」不需要——看不见能力数据的后端算不出任何能力结果，隐藏引擎就没有原料。这是把一条语义边界换成一条依赖方向边界的标准做法。

### 一览表

| # | 规则名 | 判据 | 已实现的规则 id | 优先级 |
| --- | --- | --- | --- | --- |
| 1 | AI 不得直连权威状态 | `src/features/*/state/**` 的 import 不得解析到 `src/services/ai/**` 或 `src/features/ai-*/**` | `state-no-ai-import` | P0，最高价值 |
| 2 | 角色包必须是纯数据 | `src/domain/{scripts/packs,role-knowledge}/**` 不得 import `features/game-session/**`、不得出现返回 `GameSessionState` 的签名或该标识符 | `pack-no-session-state` | P0，最高价值 |
| 3 | 单一持久化真值 | 三种语法位置取到的 localStorage key 字面量必须命中脚本内白名单 | `localstorage-key-allowlist` | P0 |
| 4 | 标记不得携带效果 | `features/{night-workbench,game-session,grimoire}` 的 `types.ts`/`model/*.ts` 中，名字含 `Reminder`/`Marker`/`Token` 的类型体内禁止字段名 `effect`/`effects`/`appliesTo`/`modifies`/`onNight`/`onDeath`/`resolve`/`trigger` | `reminder-no-effect-fields` | P1，最高价值 |
| 5 | 禁止自动推进 | `src/features/grimoire/**` 禁止出现六个相位类 action 字面量（`open-phase-segment` 等） | `grimoire-no-phase-dispatch` | P1 |
| 6 | 派生值不得进入 action payload | `src/features/*/state/**` 的字段声明位置禁止 `majority`/`aliveCount`/`isDemonDead`/`evilRemaining`/`isGameOver` | `no-derived-values-in-actions`（胜负判定符号表未补，见上） | P1 |
| 7 | 纯记录模式不得依赖魔典 | `src/features/hosting-deck/**` 禁止 import `src/features/grimoire/**` | 未实现（且现有代码违反，见上） | P1 |
| 8 | reducer 保持可重放的纯函数 | `src/features/*/state/**` 的 `*Reducer.ts` 禁止 `Date.now()`/`new Date(`/`Math.random()`/`crypto.randomUUID()` | 未实现（且现有代码违反，见上） | P1 |
| 9 | 后端不得取用角色能力数据 | `server/**`（`*.test.ts` 除外）禁止 import `src/domain/role-knowledge/**` 与 `src/domain/scripts/packs/**` | 未实现 | P1 |

### 与这九条相邻、但不计入的检查

`scripts/verify-architecture.mjs` 里另有几条同样在跑的规则，它们各有出处，不计入本节这九条：`legacy-engine-symbols`（旧引擎类名，范围已扩到 `src|server`）、`ui-night-coupling`（`src/components/ui` 零业务耦合，魔典座位因此必须放 `src/features/grimoire/` 而不是共享层，本规则一字不改）、`ai-script-hardcode`、`hosting-mode-not-behavioural`（state 目录不得读 `hostingMode`）、`hosting-preferences-not-runtime`（除偏好文件自身与 `src/app/` 外禁止 import `hostingPreferences`，运行时读模式一律读 `session.hostingMode`）、`file-budget`（`src/features/**.tsx` 封顶 320 行，魔典画布不因复杂而放宽）以及三条 CSS 纪律。`src/` 全域禁止 `WebSocket`/`EventSource`/`BroadcastChannel`/`socket.io`/`peerjs` 同样未实现，它守的是「不做联机」而非「不做规则引擎」。

### 刻意不做成静态检查的两件事

它们是真正的边界，但判定需要理解语义，做成正则只会同时产出误报和漏报，因此走不变量单测：

1. **级联写入**：一次 `confirm-player-state-change` 前后的差异字段集，必须是 `ops[0]` 名字的字面子集（`token_added` 只允许 `markers` 变，`life_set` 只允许 `life` 变，依此类推）。
2. **静默写入**：对每一个非 `confirm-player-state-change` 的 action，断言 `projectCurrentPlayerStates` 前后深等。

配套的运行时约束是魔典路径上 `ops` 长度恒为 1——类型上保留数组以备将来，但加 runtime assert；多座位同手势按座位各写一条 entry，共用 `batchId`。

### 行内豁免

符号类与形状类检查在注释和说明性文字里会误命中，而这个项目必然要在代码里大量书写「这里不做某某引擎」的说明。豁免机制是 `// arch-allow: <规则名> <原因>`（CSS 写成 `/* arch-allow: ... */`），写在违规行末尾或紧邻上一行。三条配套约束：原因必填，缺原因本身就是一个失败项；规则名必须是已知 id，写错即 fail；豁免失效（该规则在此处已不再命中）也会被报出来——豁免不留库存。
