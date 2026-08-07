# G3 对抗式复核发现清单

2026-08-07。54 个 agent、4 个视角（假绿测试 / 边界与裁决 / 接线正确性 / 无障碍与几何），
每条再经一轮「默认它是错的，除非能证明成立」的反驳验证。

**报出 50 条，39 条通过验证，去重后 30 组。**

这份清单的用途是让另一个会话能接着修。每条都带文件、行号、证据与复核者的变异验证记录——
不要凭标题去猜问题，先读 evidence，那里通常写着「我把 X 改成 Y，N 条测试仍然全绿」。

## 为什么会积到这个量

三块 G3 零件由三个并行 agent 造，那三个工作流**三次都断在复核阶段**，
所以它们的产出从未被复核过；接线是主控自己做的，同样没有第二双眼睛。
而单测、oxlint、架构守门三道闸门全绿——复核第一条就指出，
「守门规则和单测全绿这件事本身正在制造安全感」，因为它们盖不住类型层，
而 `npm run build`（tsc -b）当时是红的，29 个错误。

## 状态


- 已修 **7** 组
- 待修 **23** 组

## 接着做的人先读这四条

**一、验证只用 `npm run check`。** 它是 `lint && test && build && verify:architecture`。
不要单跑 `npx tsc --noEmit`——那和 `tsc -b` 走的不是同一份配置（后者含测试文件、走
project references）。这一轮我一路用错了命令，于是在多条提交说明里写了「四道闸门 exit 0」，
而 build 实际上红着 29 个错误。**单测全绿盖不住类型层。**

**二、修完必须做变异验证。** 把修复整段删掉，看新写的测试会不会红。这一轮有两处
「修了但没测」被抓到：只读闸门删掉后 425 条全绿，桥改成 `return false` 后 427 条全绿。
不做这一步，你不知道自己加的是保险还是装饰。

**三、写夹具时先确认它真的能走到被测分支。** 本轮踩过：挑了一条已确认的夜序项做只读夹具，
但它 `targetCount` 是 0，压根走不到夜间分支，那条测试恒绿。
`createPrototypeGameSession()` 的 3 号座位**出厂就 poisoned**，也是同类陷阱。

**四、agent 会在工作区留下临时探针文件。** 本轮清掉了 7 个（`__tmp_*` / `__zz*` / `__zq_*`）
和两处没还原的 `if (true) return` 变异。开工前先 `find src -name "__*"` 扫一遍，
提交前再扫一遍。

## 建议的修复顺序

1. **`DeckBody.tsx:121` 的 `targetsOnRing`**（唯一剩下的 blocker）。它让 G3 夜间那一半的
   验收全部不成立，而且同屏两个可写的目标选择器只有一个跟着环更新。
2. **回看态那三条**（`GrimoireStage.tsx:297/301/184`）。它们同源：写入被封的责任落在了
   调用方塞 `NO_WRITES` 的自觉上，而 G3 验收③写的是「readOnly prop 强制，不靠自觉」。
   一起改比分三次改省事。
3. **`readOnlyContract.test.ts` 那四条**。它是唯一一道防止长出第二个写入面的机器保险，
   而它现在认不出 `binding.dispatchSession(`。修它之前，上面第 2 组的任何修复都没有守卫。
4. **几何那四条**（死亡票 chip 盖住状态 chip、`oppositeSatelliteOffset` 推向会出界那侧、
   夜序角标与卫星弧硬碰、网格态 chip 压邻座）。它们互相牵扯，得一起看，
   而且必须用浏览器量真实盒模型——这一轮所有几何问题都是浏览器发现的，静态测试一个都没抓到。
5. 其余按严重度。

---

## 待修

### DeckBody.tsx:121 — 🔴 blocker

`src/app/DeckBody.tsx:121`

**问题**：夜间那一批新造的 `targetsOnRing` 通路在生产代码里一个调用点都没有——只有测试 harness 传它。魔典模式下抽屉里仍然摊着那张 6 列号码网格，同屏出现两个目标选择器，而「点环上的座位选玩家」那行回显永远不出现。

**证据**：

```
DeckBody.tsx:120-128 只传了 carouselElsewhere：
```
<NightWorkbench sessionBinding={nightBinding}
  carouselElsewhere={session.hostingMode === 'grimoire'}
  onExit={onExitToArchive} onCloseNight={() => onDeckNodeChange('dawn')} />
```
全仓 grep（排除 .test）对 `targetsOnRing` 只剩两处：NightWorkbench.tsx:47 的 prop 声明与 :54 的 `targetsOnRing = false` 缺省，以及 :243 `targetPicker={targetsOnRing ? 'ring' : 'grid'}`。
而 NightWorkbench.ring.test.tsx:24 自己传 `targetsOnRing`，所以那 4 条用例全绿。
```

**牌桌上会发生什么**：G3 夜间那一半的验收（「抽屉里只剩一行回显」「号码网格折进 details 作无障碍通道」）在真机上一条都不成立：新造的 WakeTargetPicker 的 ring 分支与 NightTargetEcho 在生产里是死组件。更实际的后果是同一屏两个可写的目标入口——环上一份（无守卫，见上一条）、网格一份（有守卫），说书人点哪个得到的行为不一样。这个洞被测试完全遮住，因为唯一覆盖它的测试自己把 prop 传进去了。

<details><summary>反驳验证</summary>

尝试推翻失败——这条发现站得住，而且是我实测复现出来的。

**引用核对（全部属实）**
- `<private-workspace>` 逐字如引用所写：只传了 `carouselElsewhere={session.hostingMode === 'grimoire'}`，没有 `targetsOnRing`。
- 全仓 grep `targetsOnRing`，生产代码只剩三处，全在 `NightWorkbench.tsx`：:47 prop 声明、:54 `targetsOnRing = false` 缺省、:243 `targetPicker={targetsOnRing ? 'ring' : 'grid'}`。
- `NightWorkbench` 在生产里的唯一渲染点就是 `DeckBody.tsx:121`（其余全是 `.test.tsx`）。
- `NightWorkbench.ring.test.tsx:17-24` 的 Harness 自己传 `targetsOnRing` 和 `carouselElsewhere`，所以那 5 条用例对接线一无所知——正是「测试自证」。

**最小复现（已跑，已删）**
临时写了一个 `src/app/__tmp_ringwire.test.tsx`，照 `DeckBody.test.tsx` 的 ResizeObserver 替身，用 `{...createPrototypeGameSession(), hostingMode: 'grimoire'}` + `deckNode="night"` 渲染 `DeckBody`，实测：
```
canvas: true, drawer: true, ringSeatButtons: 12,
gestureContract("点座位 = 选"): true,     // 环确实处在夜间选目标态
seatGridButton: true, seatGridCount: 1,
foldedIntoDetails: false,                  // 网格摊开着，没进 details
echoLine: false                            // 「点环上的座位选玩家」不存在
```
即：同屏环上 12 个可点座位 + 抽屉里一张摊开的 6 列号码网格，回显那行永远不出现。跑完已 `rm`，`git status src/app` 干净。

**后果真实存在，且不是「设计如此」**
- `useRingBindings.tsx` 里 `nightRing.target.targetCount > 0` 时 `onSelectSeat` 走 `commitNightRingTarget` —— 环上这条写入通路在生产里是活的（gestureContract 为 true 已证明它被选中）。抽屉那份网格也是活的。两个可写入口同屏，确凿。
- `WakeTargetPicker.tsx` 顶部注释写死了意图：「`ring` 是魔典模式：主选择面搬到环上，抽屉里只留一行回显 + 一个折叠的同款网格」。所以这不是「网格退化态没有空间版」那类写明的取舍，而是作者自己声明的目标在 DeckBody 处漏接了一根线。
- 没有任何别处的守卫/类型挡住它：`targetsOnRing?: boolean` 是可选带缺省的，漏传编译通过、无告警。

**一点修正（不影响成立）**：括号里那句「环上一份无守卫」在本条的证据里没被验证——`nigh

</details>

### GrimoireCanvas.test.tsx:36 — 🟠 major

`src/features/grimoire/GrimoireCanvas.test.tsx:36`

**问题**：主控这一批新增的接线——两个通用槽、nightRingBridge、useRingBindings、GrimoireStageHost、GrimoireReplaySheet——一条测试都没有。

**证据**：

```
GrimoireCanvas.test.tsx 的 11 条用例里没有一条提到 seatOverlays 或 renderRingOverlay（grep 两个名字均无命中）；GrimoireStage.test.tsx 的 11 条同样不碰它们，且 :38/:205 连必填的 nightBinding 都没传（tsc TS2741，运行时只是恰好没走到解引用的分支）。
src/features/grimoire/night/ 下有 4 个 .test，唯独 nightRingBridge.ts 没有。
useRingBindings.tsx、GrimoireStageHost.tsx、GrimoireReplaySheet.tsx 全仓无对应测试文件（grep 'GrimoireReplaySheet' 在 *.test.* 中零命中）。
```

**牌桌上会发生什么**：上面每一条 blocker 都落在这块无人覆盖的接缝里，而三块零件自己的 167 条测试全绿——因为它们测的是零件，接线是主控自己做的，而主控没给自己写测试。readOnlyContract.test.ts:247 那条「accounts for every dispatching surface」已经把两个待封的入口写进 accounted 表当备忘，但那张表只要求「写清楚为什么还没封」，不会因为没封而转红，所以它记下了洞却没有挡住洞。

<details><summary>反驳验证</summary>

I tried to break this one and could not. Every load-bearing citation is real, and the consequence reproduces.

**1. The two generic canvas slots are genuinely untested.** `seatOverlays` and `renderRingOverlay` are declared at `<private-workspace>` and consumed at `:162` and `:247`. A grep across all of `src/` finds their only other references in `GrimoireStage.tsx:233,235` and `stage/useRingBindings.tsx`. Zero hits in any committed `.test.*`. Confirmed.

**2. The TS2741 claim is verbatim correct, including the line numbers.** `nightBinding` is required (no `?`) at `GrimoireStage.tsx:83`, and `tsc` reports exactly:
```
src/features/grimoire/GrimoireStage.test.tsx(38,8): error TS2741: Property 'nightBinding' is missing ...
src/features/grimoire/GrimoireStage.test.tsx(205,10): error TS2741: Property 'nightBinding' is missing ...
```
Worth flagging for whoever fixes this: `npx tsc --noEmit -p tsconfig.json` prints **nothing**, because the root tsconfig is `{"files": [], "references": [...]}` and plain `-p` does not follow references. You must run `-p tsconfig.app.json` (or `tsc -b`) to see these. I nearly refuted the finding on the strength of the empty output before checking why it was empty.

**3. The "runtime just happens to miss the dereference" explanation is exactly right.** In `useRingBindings.tsx:88-100`, `nightBinding` is only touched inside the `nightRing && targetCount > 0` branch, and `nightRing` is null unless `deckNode === 'night'`. All 11 GrimoireStage test

</details>

### GrimoireCanvas.tsx:236 — 🟠 major

`src/features/grimoire/GrimoireCanvas.tsx:236`

**问题**：窄屏网格退化态照样按环的径向角摆卫星 chip，于是 chip 朝侧面的座位会把 chip 压进相邻座位的 token 上。

**证据**：

```
网格分支仍传 radialAngle={radialAngleFor(index, seats.length, startOffset)}、satelliteInside={false}。grimoire-canvas.css:24-28 的 .grimoire-canvas__grid 是 repeat(auto-fill, minmax(64px,1fr))、列间距 var(--space-12)=12px、justify-items:center。token=64、chip=22 时 chip 外沿超出 token 边缘 26px，列间距只有 12px → 横向侵入邻座 token 14px。|cos(radialAngle)|>0.7 的座位（12 人局是 2,3,4,8,9,10 六座；20 人局十座）chip 基本正对侧面。另外 .grimoire-canvas[data-mode='grid'] .grimoire-canvas__stage 设了 overflow-y:auto（:20），按规范另一轴的 visible 会被算成 auto，最左一列越界的 12px 之外还会被裁掉。
```

**牌桌上会发生什么**：径向角在网格里没有任何几何意义——它只是「这一座在环上本该朝哪」。结果是窄屏下毒/醉/标记 chip 系统性地画在邻座脸上，说书人读到的归属是错的，而这正是「计算附着、标记归属只有 seatId 一个真值」要消灭的那类歧义。验收④的「窄屏三档实测无重叠」不成立。

<details><summary>反驳验证</summary>

Confirmed, not refuted.

CITATIONS ALL ACCURATE. GrimoireCanvas.tsx:236 is exactly `radialAngle={radialAngleFor(index, seats.length, startOffset)}` inside the grid branch, with `satelliteInside={false}` on :237. grimoire-canvas.css:24-29 is `.grimoire-canvas__grid` with `repeat(auto-fill, minmax(64px,1fr))`, `gap: var(--space-20) var(--space-12)` (--space-12 = 12px, tokens.css:46), `justify-items:center`. css:20 is `overflow-y: auto` with no overflow-x, so overflow-x computes to auto per CSS Overflow 3 and clips at the padding box.

REPRODUCED. Temporary vitest render (12 poisoned seats, 320x420 stage -> grid mode; file deleted after). Chip inline offsets past the 64px seat box: right overhang 26.0px at index 3, 19.7px at indices 2 and 4; left overhang 26.0px at index 9, 19.7px at 8 and 10 — exactly the |cos|>0.7 seats named. Grid mode is reachable in ordinary use (20 seats @ 390x760 -> grid; 12 seats @ 360x420 -> grid).

ONE NUMERIC SLIP, IMMATERIAL. The 1fr column slack means intrusion into the neighbour's element box is at most 13px (at stageW 320), not 14px, and at 390px there is no box overlap. But the decisive metric is proximity, and it strengthens the finding: chip centre sits 47px from its own token centre while column pitch is 77-94.5px, so the chip is 30-47.5px from the NEIGHBOUR's centre — nearer to, or tied with, the wrong token at every grid width tested (320/360/375/390/414/428/480/540/600/768). Paint order makes it concrete: `.grimoire-seat` has `isolation: isolate`, so seat k+1 paints over seat k — left-pointing chips render on top of the left neighbour's o

</details>

### GrimoireStage.tsx:297 — 🟠 major

`src/features/grimoire/GrimoireStage.tsx:297`

**问题**：回看归档时「切换主持模式」这个入口照样在，照样能一路点到降级交接卡并「确认」。它没有被 sealGrimoireWrite 盖住，只是靠上层塞了一个吞掉一切的 dispatch。回看写入被封的责任落在了调用方的自觉上，而 G3 验收③写的是「readOnly prop 强制，不靠自觉」。

**证据**：

```
GrimoireStage.tsx:297 `<SessionInfoOverlay open={infoOpen} ... dispatch={dispatch} .../>` 无条件渲染，writeAccess 一点没参与；SessionInfoOverlay.tsx:65 `<HostingModeSection session={session} dispatch={dispatch} onSwitched={() => onOpenChange(false)} />`；HostingModeSection.tsx:28 `function commit(mode) { dispatch({ type: 'set-hosting-mode', ... }); setPendingDowngrade(false); onSwitched?.(mode) }`。回看侧 GrimoireReplaySheet.tsx:25 `const NO_WRITES = (_action: GameSessionAction) => undefined`，:50 `dispatch={NO_WRITES}`。回看 agent 自己在 readOnlyContract.test.ts:256 点了名：`'stage/HostingModeSection.tsx': '切换主持模式（set-hosting-mode）。回看归档时这个入口根本不该出现——改的是史实'`，:257 SessionInfoOverlay「随它一起处理」。主控接线的 2482694 没处理。
```

**牌桌上会发生什么**：回看一局归档时点开核顶行的本局信息 →「魔典放在哪里」→ 选纯记录 → 弹出降级交接卡（列出这一局全部非默认状态）→ 按「确认降级」，浮层关闭，看上去成功了。实际什么都没发生，也没有任何一句话告诉他没发生。writeAccess.ts:34 自己写着「只读时按下去什么都不发生，是本工具里最坏的一种反馈」——这里就是那种反馈，而且发生在一个声称「改的是史实」的入口上。

<details><summary>反驳验证</summary>

无法推翻——发现成立，且能完整复现。

**引用核对**：GrimoireStage.tsx:297 确实是 `<SessionInfoOverlay ... dispatch={dispatch} .../>` 无条件渲染，writeAccess 完全没参与（sealGrimoireWrite 只包住 useGrimoireWriteLayer + useSeatWriteBindings 那一对）；核顶行的 `onOpenSessionInfo={() => setInfoOpen(true)}` 同样无闸门。HostingModeSection.tsx:28 的 commit() 直接 dispatch set-hosting-mode，无任何检查。GrimoireReplaySheet.tsx:25/:50 的 NO_WRITES 与引用一字不差。readOnlyContract.test.ts:256-257 的两条 accounted 条目逐字属实，且明确写着「回看归档时这个入口根本不该出现——改的是史实」，是记账的技术债而不是豁免。`git show --stat 2482694` 证实该提交没碰 HostingModeSection.tsx。唯一瑕疵：SessionInfoOverlay 的那行在 :64 不是 :65（:65 是空行），不影响结论。

**最小复现**（临时测试，跑完已删）：两条都绿。①GrimoireStage 传 resolveWriteAccess({archive:{...}})（readOnly:true）+ spy dispatch，点「本局信息」→「桌上有实体魔典」→ 降级交接卡出现 →「已抄好，切回纯记录」，dispatch **被调用**，payload 为 {type:'set-hosting-mode', mode:'record'}。只读闸门根本没盖住这块写入面。②直接渲染真实的 GrimoireReplaySheet 走同样四步：交接卡照常弹出，确认后浮层关闭，什么都没发生，没有针对这次操作的任何反馈。

**是否被别处挡住**：没有。HostingModeCard / DowngradeHandoffCard / hostingModeSwitch.ts 里都没有守卫。readOnlyContract 那组测试之所以是绿的，正是因为这个文件被挂在标注了「还没处理」的白名单上。方向也不影响：若归档 session 的 hostingMode 是 record，选「没有实体魔典」会跳过交接卡直接 commit，同样是静默空操作。

**是否设计如此**：不是。仓库自己的测试点名说这个入口在回看态「根本不该出现」，G3 验收③要求 readOnly prop 强制。

**发现漏掉的一个减轻因素**：同屏常驻 ReplayHonestyBar，文案「归档只读 · 这里补不了录（补录只能在进行中的对局里做）」——我的复现里断言到了它。但它是操作前后都在的环境信息，不是对这次点击的反馈，而且流程进行中它被模态浮层挡在后面。加上 NO_WRITES 吞掉了 dispatch、归档数据实际未被篡改，这是降级的最强理由。仍不足以推翻：G3 验收③要的就是「prop 强制而非靠自觉」，而现在挡在用户手势与篡改史实之间的唯一东西，是调用方记得传了个空 dispatch。

维持 major。

</details>

### GrimoireStage.tsx:301 — 🟠 major

`src/features/grimoire/GrimoireStage.tsx:301`

**问题**：回看归档时 SessionInfoOverlay → HostingModeSection 拿到的是未封口的原始 dispatch（在 GrimoireReplaySheet 里就是吞掉一切的 NO_WRITES）。切换主持模式的 dispatch 被吞，UI 却给出完整的成功回执：交接卡消失、浮层关闭。

**证据**：

```
GrimoireStage.tsx:297-303 `<SessionInfoOverlay ... dispatch={dispatch} ... />`（dispatch 是 props 原件，不是 sealGrimoireWrite 之后的 write/bindings）。
HostingModeSection.tsx:27-36
```
function commit(mode) {
  dispatch({ type: 'set-hosting-mode', ... })
  setPendingDowngrade(false)
  onSwitched?.(mode)
}
```
SessionInfoOverlay.tsx:66 `onSwitched={() => onOpenChange(false)}`。
GrimoireReplaySheet.tsx:25 `const NO_WRITES = (_action) => undefined`，:50 `dispatch={NO_WRITES}`。
这个洞是 readOnlyContract.test.ts:256 自己点名留下的：`'stage/HostingModeSection.tsx': '切换主持模式（set-hosting-mode）。回看归档时这个入口根本不该出现——改的是史实'`。
```

**牌桌上会发生什么**：入口不但出现了，而且反馈是「成功」的形状：核顶行的本局信息按钮在回看态照常可点（GrimoireCore.tsx:162 只看 onOpenSessionInfo 在不在，而 GrimoireStage.tsx:244 无条件传了它），点进去选「纯记录模式」→ 弹降级交接卡 → 确认 → 卡片收起、浮层关闭。说书人得到的每一个视觉信号都在说「改好了」，归档里一个字节没动。这正是回看态最该防的那类失败：归档是战绩，事后往里补一笔和篡改没有区别，而这里连「没写成」都没告诉他。

<details><summary>反驳验证</summary>

Confirmed by direct file inspection and a runnable repro (temp vitest file, deleted after).

Citations all check out exactly: GrimoireStage.tsx:301 passes `dispatch={dispatch}` — the raw prop, not the `sealGrimoireWrite` result destructured at :133-136 as `{ layer: write, bindings }`. SessionInfoOverlay.tsx:66 forwards it to `HostingModeSection ... onSwitched={() => onOpenChange(false)}`. HostingModeSection.tsx:27-36 `commit()` dispatches `set-hosting-mode`, clears pendingDowngrade, fires onSwitched. GrimoireReplaySheet.tsx:25/:50 define and pass `NO_WRITES`. GrimoireCore.tsx:162 renders the identity as a button whenever `onOpenSessionInfo` exists, and GrimoireStage.tsx:244 passes it unconditionally (never gated on writeAccess). readOnlyContract.test.ts:256 contains the quoted line verbatim.

Repro: rendered GrimoireStage with exactly the replay-sheet wiring (writeAccess = resolveWriteAccess({archive, viewMode:'grimoire'}), session.hostingMode='grimoire') and a spy dispatch. Output: session-info button present in replay; overlay opens; 主持模式 radiogroup present; selecting 「桌上有实体魔典」 produces the downgrade handoff card (buttons: 复制清单 / 留在魔典模式 / 已抄好，切回纯记录) with 0 dispatches; confirming yields dispatch calls: 1 and the dialog closes. In the real replay sheet that single dispatch lands on NO_WRITES and evaporates, while the card collapses and the overlay closes — a complete success shape with no refusal receipt. The only "归档" text on screen is the permanently mounted ReplayHonestyBar, not feedback for this action.

Nothing blocks it. sealGrimoireWrite only covers WRITE_LAYER_SURFA

</details>

### GrimoireStage.tsx:184 — 🟠 major

`src/features/grimoire/GrimoireStage.tsx:184`

**问题**：useDayRing 拿到的 dispatch 是未封口的原件。回看归档时白天的环仍然算得出 intent、仍然可点，dispatch 被 NO_WRITES 吞掉，既不写也不解释——退化成本工具文档里反复点名的「按下去毫无反应」。

**证据**：

```
GrimoireStage.tsx:182-191 `useRingBindings({ session, dispatch, ... })`，useRingBindings.tsx:80-85 `const day = useDayRing({ session, dispatch, seatIds, active: deckNode === 'day' })`，useDayRing.ts:96 `dispatch({ type: 'set-day-vote-draft', draft: next })`。
useDayRing.ts:63 的闸门 `const readOnly = focus.writeLocked || context.hasResolution || !active` 完全不含 writeAccess。
readOnlyContract.test.ts:255 早就写下了这条待办：`'day/useDayRing.ts': '白天票型草稿（set-day-vote-draft）。不在本批文件范围内，主控接线时必须一并封'`——接线时没封。
```

**牌桌上会发生什么**：归档大多在白天局面下收尾，而归档流程不关相位段（game-end 里没有 close-open-segment），所以 deckNodeForSession 回看时通常就落在 'day'：intent 是 'nominator'，环可点，死亡票 chip（onConfirmGhostVote）也是一枚 44px 的启用态按钮。点下去 session 是冻结的归档，弧线与角标纹丝不动、回执带一声不吭。sealGrimoireWrite 的整个设计意图是「拒绝必须能说出一句话」（refuse() → notify(reason)），这条路径把它绕过去了，得到的恰好是那个被判定为「最坏」的反馈。

<details><summary>反驳验证</summary>

Confirmed by reading the files and by a deleted-after-use vitest repro.\n\nCode citations are exact. GrimoireStage.tsx:182-191 passes the raw `dispatch` prop (line 184 is literally `dispatch,`) into `useRingBindings`; only `notify` and `openActionBar` come from the sealed surface built at 133-136. useRingBindings.tsx:80-85 forwards that raw dispatch to `useDayRing`. useDayRing.ts:63 gates on `focus.writeLocked || context.hasResolution || !active` with no `writeAccess` term, and line 96 dispatches `set-day-vote-draft`. readOnlyContract.test.ts:255 contains the deferral verbatim ("主控接线时必须一并封"); the wiring commit 2482694 did not seal it, and the test stays green because the file is listed in the `accounted` map.\n\nRepro results (temp test in src/features/game-end, run then deleted):\n1. Archive session with an open day segment and no execution/no_execution entry: deckNodeForSession = 'day', hasResolution = false, suggested = 'nomination'.\n2. GrimoireReplaySheet on that archive renders seat tokens with aria-label "3号，玩家3，中毒，1枚标记，选为提名人", disabled=false. Clicking one: body text unchanged, and ARCHIVE_READ_ONLY_REASON never appears (absent both before and after). Fully silent.\n3. Contrast on the same archive at the dusk node (ring falls back to the sealed openActionBar): label is "座位操作", click changes the body and the refusal receipt "归档只读 —— 这局已经归档…" appears. So the intended refuse-out-loud behavior exists and the day path bypasses it.\n4. Direct proof the unsealed dispatch is reached: GrimoireStage rendered with writeAccess={{readOnly:true,…}} and deckNode="day" plus a spy di

</details>

### GrimoireStage.tsx:249 — 🟠 major

`src/features/grimoire/GrimoireStage.tsx:249`

**问题**：归档回看的核里显示的是**当前这一局**的讨论计时器读数，而不是被回看那一局的任何事实。

**证据**：

```
GrimoireStage.tsx:113 `const timer = useDiscussionTimer()`（读的是 App 里 `<DiscussionTimerProvider key={session.id} sessionId={session.id}>` 提供的 live 计时器），:249 `timer={phase === 'day-timer' ? projectDayTimer(timer) : undefined}`。
GrimoireReplaySheet.tsx 不换 Provider，它挂在 GameEndSheet → AppOverlays 里，拿到的就是进行中那局的 context。
归档流程不关相位段（game-end 目录内无 close-open-segment），deckNode.ts:20 `if (openDay) return 'day'`，corePhaseSources.ts:40 白天无票型草稿时即 'day-timer'。
```

**牌桌上会发生什么**：整个回看态的卖点是「诚实」——ReplayHonestyBar 的原话是「座位上的空白表示当时没有录入，不表示当时没有这个状态」。而核的同一屏上正在滚动一个来自另一局的剩余讨论时间和私聊/公聊阶段名，没有任何标记说它不属于这份归档。诚实条越是把空白讲清楚，这一格假数据越容易被当成真的。

<details><summary>反驳验证</summary>

Confirmed by reading the files and by a repro test (written, run, then deleted).

Citations: GrimoireStage.tsx:249 is exactly `timer={phase === 'day-timer' ? projectDayTimer(timer) : undefined}`; `const timer = useDiscussionTimer()` is at :114, not :113 (:113 is useGrimoireShield) — a one-line slip, immaterial. App.tsx:30 wraps everything including AppOverlays (:90) -> GameEndSheet -> GrimoireReplaySheet (GameEndSheet.tsx:295) in `<DiscussionTimerProvider key={session.id} sessionId={session.id}>`. GrimoireReplaySheet.tsx swaps session/dispatch/writeAccess/honestyBar/nightBinding but installs no timer provider, so useDiscussionTimer() inside the replay stage returns the in-progress game's context. deckNode.ts:20 `if (openDay) return 'day'` and corePhaseSources.ts:40 (day + empty vote draft -> 'day-timer') are accurate. The only non-test `close-open-segment` dispatch is DayWorkbench.tsx:149, and archiveService.ts:138 stores `session` verbatim, so a game archived during the day keeps its day segment open.

Repro: rendered GrimoireReplaySheet for an archive whose session had an open day segment, inside a DiscussionTimerProvider for a DIFFERENT (live) session id whose stored timer was 公聊 paused at 7:23. Core rendered data-phase=day-timer, clock 07:23, phase name 公聊. Changing only the live timer state (私聊 2:05) with the identical archive changed the core to 02:05 / 私聊. The reading is a pure function of the in-progress game, with zero coupling to the archive.

Not blocked and not intended: sealGrimoireWrite/resolveWriteAccess and readOnlyContract.test.ts seal only the write surfac

</details>

### GrimoireStageHost.tsx:13 — 🟠 major

`src/features/grimoire/GrimoireStageHost.tsx:13`

**问题**：DayRingFocusProvider 挂在 GrimoireStageHost 上——比 `WorkDrawer key={deckNode}` 的重挂边界更高。stepOverride 与 nominationTarget 因此在魔典模式下跨天存活，而纯记录模式下它们随 DayWorkbench 卸载而清零。

**证据**：

```
GrimoireStageHost.tsx:13-16 `<DayRingFocusProvider><GrimoireStageBody {...props} /></DayRingFocusProvider>`；DeckBody.tsx:46 决定渲染 GrimoireStage 时不区分 deckNode，所以这个 Provider 整局只挂载一次。
DayWorkbench.tsx:46 `const { nominationTarget, setNominationTarget, stepOverride, setStepOverride, setWriteLocked } = useDayRingFocus()`（原来是组件内 useState）。
复位只有一处：DayWorkbench.tsx:100-101 completeRound 里的 `setNominationTarget('nominator'); setStepOverride(null)`。DayWorkbench.tsx:144-150 的 closeDay **不复位**，confirmResolution 也不复位。
```

**牌桌上会发生什么**：说书人第 1 天点了「举手」那行的编辑（setStepOverride('vote')），然后这一天以「无处决」或直接关段收尾（没走 completeRound）。夜 → 黎明 → 第 2 天，DayWorkbench 随抽屉 key 重挂，但 stepOverride 还留在 Provider 里：第 2 天一开门就停在 vote 步、提名卡是收起的，而环的 intent 跟着同一个 step 走，于是还没有任何提名存在时点环就直接记举手票。同样 nominationTarget 可能停在 'nominee'，第 2 天第一次点环记的是被提名人。纯记录模式下这两个状态随组件卸载归零，所以这是魔典模式独有的回归，且两边都不报错。

<details><summary>反驳验证</summary>

发现成立，已用临时 vitest 复现（跑完删除）。\n\n引用核对：GrimoireStageHost.tsx:12-18 确实用 DayRingFocusProvider 包住 GrimoireStageBody（JSX 在 14-16 行，发现写的 13-16 只差一行）。DeckBody.tsx:46 `if (session.hostingMode !== 'grimoire' || !hasStarted) return body` 确实不看 deckNode，且 App.tsx:55-73 让 DeckBody 在整个 view==='deck' 期间保持挂载，所以 Provider 一局只挂一次。GrimoireStage.tsx:257-258 `<WorkDrawer key={deckNode}>` 确实在 Provider **之下**，换相位重挂 children（含 DayWorkbench）。DayWorkbench.tsx:46 从 useDayRingFocus 取值；useDeckNavigation.ts:41-44 在白天段关闭后把 deckNode 推到 dusk，于是 DayWorkbench 卸载而 Provider 存活。全仓 grep 确认复位只在 DayWorkbench.tsx:100-101 的 completeRound 里；closeDay(144-151) 与 confirmResolution(104-138) 都不复位。\n\n复现（复刻真实树形：常驻 Provider + key={deckNode} 子树），三条全过：\n1) 第1天选完提名双方 → 点「下一步：记录举手」(stepOverride='vote') → 「结束今天」→「清空并结束」→ 开第2天：DayWorkbench 重挂后**直接停在「记录举手」卡**、显示「先选择提名双方」，而 useDayRing 的 intent 仍是 raise，点环写入 raisedSeatIds:[5] 且 nominatorSeatId 为 null。\n2) nominationTarget='nominee' 同样跨天存活：第2天第一次点环写的是 nomineeSeatId:4。\n3) 对照组（无 Provider = 纯记录模式）第2天回到「提名人」槽——证实这是魔典模式独有回归。\n\n非「设计如此」：dayRingFocus.ts 自己的注释就说这两样是「易失 UI 态」。也没有任何守卫/类型/测试挡住——dayRingBridge.test.tsx 与 useDayRing.test.tsx 都只在一天之内。\n\n唯一不准确处（不足以推翻）：「以无处决收尾」这半个场景其实无法留下 stepOverride='vote'——「记录无处决」只在 activeStep 既非 nomination 也非 vote 时才渲染，即要求 stepOverride 为 null。真正复现的是另一半「直接关段收尾」，而 closeDay 是每一天唯一的收尾方式，所以机制成立。\n\n严重度维持 major：静默、魔典模式独有、把点环误记成举手票；但只污染 dayVoteDraft（不产生 timeline 条目、不改 PlayerState，且没有提名时「记录本轮票型」仍是 disabled），点一下提名行即可恢复，够不上 blocker。

</details>

### DayRingOverlay.tsx:127 — 🟠 major

`src/features/grimoire/day/DayRingOverlay.tsx:127`

**问题**：44px 死亡票 chip 与本座位的中毒/醉酒/标记 chip 落在同一条卫星弧的同一个方向上，把它们整个盖住并抢走指针事件；dayRingAnchors 里「由座位层在此期间让出那条弧」这句话在代码里没有对应实现。

**证据**：

```
const placement = ghostVoteChipPlacement(layout.tokenSize, anchor.radialAngle, anchor.satelliteInside) —— 实测 token=84：状态 chip（25px）中心半径 58.5，死亡票 chip（44px）中心半径 68，两者中心距离仅 9.5px，不重叠需要 ≥34.5px；单枚 chip 时 satellitePlacements 的 centre 就是 radialAngle，与 confirmationChipPlacement 的 theta 逐字相同，完全同轴。GrimoireSeat/GrimoireCanvas 没有任何抑制 chip 的 prop（GrimoireSeat.tsx:136-138 无条件 seatChips）。DayRingOverlay 在 GrimoireCanvas.tsx:247 渲染在座位之后，DOM 序即绘制序，所以它压在上面；chip 在可写态是 <button>（SeatChipLayer.tsx:117），而死亡票 chip 有 pointer-events:auto。
```

**牌桌上会发生什么**：计票那一刻，一个中毒的死人座位上「毒」这枚 chip 被 44px 的死亡票整个盖住——说书人在最需要同时读到「他中毒」和「他要用幽灵票」的一秒里，只看得到后者，且再也点不到前者。dayRingAnchors.ts:9-10 的注释把这当成已解决问题写进了文件头，下一个人读它会以为让位逻辑存在。

<details><summary>反驳验证</summary>

试着推翻但推不倒——每一条引用都对得上，几何后果实测复现。

**引用核对（全部属实）**
- `src/features/grimoire/day/DayRingOverlay.tsx:127` 正是 `const placement = ghostVoteChipPlacement(layout.tokenSize, anchor.radialAngle, anchor.satelliteInside)`。
- `dayRingAnchors.ts:9-10` 文件头确实写着「由座位层在此期间让出那条弧」；`ghostVoteChipPlacement` 只是原样转发 `confirmationChipPlacement`。
- `GrimoireSeat.tsx:136-138` 无条件由 `state` 算 chips，唯一门是 `visibility.markerCount`；`GrimoireSeatProps` 里没有任何抑制 chip 的 prop。全仓 grep「让出/独占/suppress」只命中注释，没有实现。
- `GrimoireCanvas.tsx:247` 确实是 `{layout.mode === 'ring' ? renderRingOverlay?.(layout) : null}`，排在座位 map 之后。
- `SeatChipLayer.tsx:117` 可写态确实是 `<button>`；`day-ring-overlay.css:95` 死亡票 chip 是 `pointer-events: auto`（整层 `pointer-events: none` 只对它开）。
- 真实接线到位：`GrimoireStage.tsx:235/237` 同时传 `renderRingOverlay` 与 `onChipGesture`，所以线上就是「按钮 chip + 可点死亡票」这一组合。

**最小复现（临时 vitest，跑完已删）**
纯几何四档 token 全部重叠（chip 与死亡票同轴，间距远小于不重叠所需）：
token=96 chip=28 dist=8.00 needed=36；token=84 chip=25 dist=9.50 needed=34.5；token=72 chip=22 dist=11.00 needed=33；token=64 chip=22 dist=11.00 needed=33。
渲染态（GrimoireCanvas + DayRingOverlay，12 座、900x640、token=84、7 号 dead+poisoned 且举手）：毒 chip 圆心 (450, 527.5) 尺寸 25，死亡票圆心 (450, 518) 尺寸 44，距离 9.5。`9.5 + 12.5 = 22 = 44/2` —— 25px 的毒 chip **整个落在** 44px 不透明圆盘（`background: var(--surface-raised)`）内部，内切。stage 子节点顺序 `[...12 个 grimoire-seat, day-ring-overlay]`，overlayIndex 13 > seatIndex 7，DOM 序即绘制序，死亡票压在上面且吃指针。chip 标签名实测 `BUTTON`。

**边界更正（对发现的一点收窄）**
只有 chip 数为 1 或 3 时被盖：`satellitePlacements` 单枚时 theta 与 `confirmationChipPlacement` 逐字相同；三枚时中间那枚正好落在弧心，同样同轴（三枚距离 48.20 / 9.50 / 48.20）。两枚时分居 ±44°，距离 48.2 > 34.5，

</details>

### day-ring-overlay.css:34 — 🟠 major

`src/features/grimoire/day/day-ring-overlay.css:34`

**问题**：焦点色纪律失守：魔典白天一屏上 --accent 家族承载 5–6 种互不相干的语义，硬上限是 2 类。

**证据**：

```
同屏可同时出现：① 提名三角 .day-ring-overlay__marker{fill:var(--accent)}（:34）；② 举手选中态 .grimoire-seat--selected .role-disc{box-shadow:0 0 0 3px var(--accent)}（grimoire-seat.css:91）；③ 生死草稿幽灵帷幕 .grimoire-seat__ghost-shroud（grimoire-seat.css:211/213，accent-border+accent-text）；④ AI 来源角标 .grimoire-seat__chip-ai{color:var(--accent-text)}（:199）；⑤ 待确认横条 .seat-confirm-bar（grimoire-write.css:68-69，accent-border+accent-soft）；⑥ 核里的门槛值与「差X」.grimoire-core__stat--threshold / [data-cell='gap']（grimoire-core.css:54、295，accent-text）；再加抽屉底栏 .ui-button--primary{background:var(--accent)}（ui.css:24）。夜间那一屏另有 .night-seat-overlay__focus-ring{border:3px solid var(--accent-strong)}（night-ring.css:19）与草稿目标的 accent 虚线环+「目标」小字（:69、81-83），与 ③④⑤⑥ 叠加。规则出处：UI_REDESIGN_PLAN_2026-08-04.md:373「一屏内 --accent 的语义用途 ≤ 2 类（相位焦点 / 动作焦点）」，且 DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md:999 明确把这条列为魔典画布唯一暖金焦点环的**前置条件**：「否则一屏会出现多个暖金源」。
```

**牌桌上会发生什么**：文档给夜序焦点环的定语是「全屏唯一暖金焦点环」。现在暗光下扫一眼，最亮的暖金块可能是 AI 的 ✨、可能是待确认横条、可能是核里的「差2」，而真正要抓的「现在叫 5 号」只是同族金色之一——这正是 UI_REDESIGN_PLAN:305 记录过、并已裁定必须在 G1 之前修掉的那个失效机制，G3 又把它加回来了四种。

<details><summary>反驳验证</summary>

发现成立，我未能推翻它。\n\n**引用逐条核对，13 处行号全部字节级准确**：day-ring-overlay.css:34 `fill: var(--accent)`；grimoire-seat.css:91 `box-shadow: 0 0 0 3px var(--accent)`、:199 `color: var(--accent-text)`、:211/213 accent-border+accent-text；grimoire-write.css:68-69 accent-border+accent-soft；grimoire-core.css:54 与 :295 均为 `color: var(--accent-text)`；ui.css:24 `.ui-button--primary{background:var(--accent)}`；night-ring.css:19 `border: 3px solid var(--accent-strong)`、:69、:81-83。三条文档引用（UI_REDESIGN_PLAN_2026-08-04.md:373 / :305、DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md:999）也是原文逐字命中。\n\n**同屏共存已用最小复现证明，不是推测**：写了一个临时 vitest 探针（已删除），把 GrimoireSeat（selected + ghostLife + AI 来源草稿 chip + NightSeatOverlay focus/targeted）、GrimoireCore phase=\"night\"、抽屉 peek 的 SeatConfirmBar 渲染进同一个容器，10 个 accent 承载选择器全部 YES：focus-ring、focus badge、target ring、「目标」小字、selected disc、ghost-shroud、✨ chip、核 处决门槛、confirm bar、primary button。\n\n关键机械事实：GrimoireCore.tsx:146 把 threshold 放进无条件的 stats 数组，:207-220 在**每个相位**都渲染那个 <dl>。所以 `.grimoire-core__stat--threshold`（--accent-text #e5c17e，font: 800 var(--type-section)）与夜间焦点环（--accent-strong #e7bc72）永远同屏——两个几乎同色的金，一个是大号粗体数字，一个是 3px 环。而 night-ring.css:12 的注释原文就是「当前项：全屏唯一一枚暖金焦点环」，这条自述不变量在实际组合下为假。day-vote 相位下核还额外渲染 [data-cell='gap'] 的同色 accent-text，与提名三角同屏。\n\n**几条推翻尝试都失败了**：(1) 是否已被守卫挡住——没有。verify-architecture.mjs 与 scripts/ 下全部脚本零 accent 检查，无任何测试断言 accent 类数；运行时唯一提及是 UiLab.tsx:11 把 --accent 标注为「当前焦点」。(2) 是否「设计如此」——恰恰相反。NominationArcLayer.tsx:8-19 作者自己写了「一屏最多两类 accent 语义」的预算，但只结算了 day-ring 这一层、没结算聚合；且 PLAN §14 明确把数值读数列为要**降级下 accent** 的对象（「夜序数字改 --text-muted、记录数角标与分组标题改冷青」），grimoire-core.css:54/295

</details>

### dayRingAnchors.ts:27 — 🟠 major

`src/features/grimoire/day/dayRingAnchors.ts:27`

**问题**：oppositeSatelliteOffset 把白天徽标放到卫星弧的对面，而 solveRingLayout 的 satelliteInside 恰恰是「朝外会出界所以翻进内侧」的结论——于是徽标被系统性地推到刚刚判定过会出界的那一侧。

**证据**：

```
const theta = satelliteInside ? radialAngle : radialAngle + Math.PI —— satelliteInside=true 时徽标朝外。实测 1024×640/12 人：12 点与 6 点两座 satelliteInside=true（因为 PAD_Y 只有 12 而 satelliteReach() 是 48，ellipseRing.ts:127 的 wouldClip 必然成立），举手药丸中心落在 y=-1 与 y=641，22px 高的药丸有一半在舞台外；「本日处决」（EXECUTION_BADGE_REACH=35）中心落在 y=-23 与 y=663，整枚在舞台外。768×900/12 人：4 座出界；1024×640/20 人：处决角标 6 座出界。这些位置没有做任何二次夹紧。
```

**牌桌上会发生什么**：环顶与环底的座位——12 人局里就是 1 号和 7 号——举手打卡看不见半个徽标，被处决的那一位「本日处决」角标完全看不见（.grimoire-canvas[data-mode='ring'] 的 stage 是 flex 定位容器，越界部分要么被上方的遮蔽栏/回执带盖住要么撑破布局）。验收④「12/15/20 人 × iPad 两向实测无重叠」在最容易人工抽查到的两个位置上就不成立。

<details><summary>反驳验证</summary>

站得住。代码引用逐字属实：dayRingAnchors.ts:27 就是 oppositeSatelliteOffset，第 33 行正是 `const theta = satelliteInside ? radialAngle : radialAngle + Math.PI`；ellipseRing.ts:127 的 wouldClip 按 satelliteReach()=48 判。

而且出界不是挑出来的个例，是结构性的：radiusY 从不被夹（只有 radiusX 受 MAX_AXIS_RATIO），所以 12 点那一座的 token 圆心恒为 PAD_Y + tokenSize/2 = 12 + tokenSize/2，outwardY 恒 = 12 − 48 = −36 < 0，于是这一座在任何尺寸下 satelliteInside 都为 true；徽标随即被推到 y = 12 − reach：举手药丸中心 −1，处决角标中心 −23（EXECUTION_BADGE_REACH = 13+22 = 35，DayRingOverlay.tsx:166）。偶数人数时环底对称同理。

我写了个临时 vitest 探针，直接 import 真的 solveRingLayout 与 oppositeSatelliteOffset 跑了一遍（跑完已删）：1024×640/12 → 1 号与 7 号，举手中心 y=−1 / 641，处决中心 y=−23 / 663（药丸 −34..−12 整枚在外）；768×900/12 → 4 座出界；1024×640/20 → 处决角标 6 座出界。与发现给的数字逐个吻合。二次夹紧确实不存在：DayRingOverlay.tsx:108 与 :169 把 offset 直接写进行内 left/top（配 translate -50% -50%），dayRingAnchors.test.ts 只断言「落在卫星弧对面」，没有任何边界断言。

后果核实：环底那一侧是真的看不见——.work-drawer 是 position: fixed; bottom: 0; z-index: 20，背景 --surface-panel 不透明，peek 96px，而 .grimoire-stage 恰好按 --drawer-reserve: 96px 留白，舞台下边缘与抽屉上边缘重合，越界部分整个压在抽屉之下；处决角标完全不可见，举手药丸下半截被吃掉。

但 whyItMatters 里环顶那一段说反了：app-frame.css / grimoire-canvas.css / grimoire-stage.css 链路上没有任何 overflow: hidden，叠加层又是靠后的定位兄弟，所以它是盖在遮蔽栏之上、而不是被遮蔽栏盖住，也不会「撑破布局」。环顶的徽标仍在屏上，只是脱离了自己的 token、压在头部那一行上。这处描述失准，但它依赖的几何缺陷本身成立。

不是「设计如此」：ellipseRing.ts:56-63 自己写明了标准（「否则那一枚会在最需要它的时候伸出舞台被裁掉」），白天这一层违反的正是本仓库自己定的这条。

严重度维持 major：两枚徽标都是 aria-hidden，ringSummary 有等价读屏文本，可点的死亡票 chip 走的是正确翻转过的卫星落点，所以损害纯属视觉层，够不上 blocker；但它在每一局、在最显眼的 1 号与环底那一座上恒定发生，环底的「本日处决」完全不可见，也不只是边角瑕疵。

</details>

### useDayRing.test.tsx:197 — 🟠 major

`src/features/grimoire/day/useDayRing.test.tsx:197`

**问题**：「本日处决」角标从投影接到环上的这一段接线，全仓只有一条断言，而且断言它是 null。executionMark.test.ts 单测投影、DayRingOverlay.test.tsx 拿手喂的 prop 测渲染，中间那一环没人测正向。

**证据**：

```
`it('没有处决记录时不挂角标', () => { const kit = harness(); expect(kit.hook.result.current.ring.execution).toBeNull() })` —— 这是 useDayRing.test.tsx 里唯一一处碰 `ring.execution` 的地方，dayRingBridge.test.tsx 也不碰。
实测改坏：把 useDayRing.ts:87-90 的 `useMemo(() => (active ? projectDayExecutionMark(session.timeline, context.openDaySegmentId) : null), …)` 整个换成 `useMemo(() => null, …)`，跑 `npx vitest run src/features/grimoire src/app` → `Test Files 50 passed (50) / Tests 427 passed (427)`。已 `git checkout` 还原。
```

**牌桌上会发生什么**：处决落账之后环上不长「本日处决」角标（或 openDaySegmentId 取错段导致挂到别的一天），说书人抬眼看环时读不到今天处决过谁。这正是 executionMark.ts 注释里点名的那个错（「说书人改完记录抬眼一看角标还在 5 号身上」），而它的两端都被测到了，唯独接头没有。

<details><summary>反驳验证</summary>

我尽力去推翻它，但每一项判据都站住了，无法反驳。

**1. 引用属实（逐字核对）**
`<private-workspace>` 第 87-90 行与引文完全一致：
```ts
const execution = useMemo(
  () => (active ? projectDayExecutionMark(session.timeline, context.openDaySegmentId) : null),
  [active, context.openDaySegmentId, session.timeline],
)
```
`useDayRing.test.tsx:197` 也确如所述：`expect(kit.hook.result.current.ring.execution).toBeNull()`。

**2. "全仓唯一一条断言"属实**
对 `.ts`/`.tsx` 全仓 grep `ring.execution`，命中且仅命中 `useDayRing.test.tsx:197` 一处，且断言 null。`dayRingBridge.test.tsx` 的 `RingProbe`（第 38-51 行）只摊出 `ring.intent`、`ring.actionHint` 和座位键，**根本不暴露 execution**，确实不碰。

**3. 两端已测、接头没测，属实**
- 上游：`executionMark.test.ts` 直接调 `projectDayExecutionMark`（含更正链、无处决、段号错配等 7 处断言）。
- 下游：`DayRingOverlay.test.tsx:103/113/121` 手喂 `execution` prop 测渲染。
- 中间 `useDayRing` 这一跳无人正向验证。

**4. 变异实测复现（与报告数字完全吻合）**
把 87-90 行整体换成返回 `null`：`npx vitest run src/features/grimoire/day` → **8 files / 65 tests 全绿**；报告者的 `src/features/grimoire src/app` 口径也复现为 **50 files / 427 tests 全绿**。角标被彻底摘除而全仓无一条测试变红。

**5. 排除"设计如此/不可达"这一最可能的反驳**
这是我重点攻击的方向，但被证伪。我写了临时探针（已删除）验证正向路径是活的：在开放白天段内 `confirm-day-execution` 之后，`ring.execution` 基线下确实产出 `{ seatId: 9, causedDeath: true }`。关键在于 `sessionReducer` 落处决后**不关闭白天段**（`closedAt` 仍为 undefined，reducer 自身单测第 51 行钉着这点），故 `context.openDaySegmentId` 仍解析得到、`active`（deckNode==='day'）仍为 true——角标是真实可达的用户可见功能，不是死代码。落账后 `hasResolution` 只把环转成只读，并不掐断 execution 投影。

**6. 闭环**
探针在场时，同一变异**红**；探针不在时**绿**。即一条测试即可补上，缺口真实存在。

**噪声说明**：全仓跑存在无关失败，源于并发会话正在反复创建/删除 `__repro_*`/`__tmp_rep

</details>

### night-ring.css:24 — 🟠 major

`src/features/grimoire/night/night-ring.css:24`

**问题**：夜序角标固定钉在 token 右上角 (-10,-10)，与卫星 chip 的弧在环的右上象限硬碰，且角标 z-index:2 压在 chip 上。

**证据**：

```
.night-seat-overlay__badge { top:-10px; right:-10px; min-width:18px; height:18px }，父层 .night-seat-overlay { z-index: 2 }。实测 1024×640/12 人（token=84，chip=25，角标框相对圆心 x∈[34,52] y∈[-52,-34]）：seat#1/#2/#3/#6 各有一枚 chip 与角标框相交（如 seat#3 的 chip0 落在 (42,-41)，几乎与角标框中心重合）。20 人局（token=64）相交对数升到 10 对，涉及 seat#2~#6、#9、#10。
```

**牌桌上会发生什么**：「现在叫谁」（暖金焦点角标）与「他中毒了吗」是夜里同时要读的两个量，在环的整个右上象限它们互相遮盖，而且被盖住的恒是下层的状态 chip。角标位置是常量、卫星角度由座位号决定，所以这不是偶发——12 人局里固定是 2、3、4、7 号四个座位每晚都错。

<details><summary>反驳验证</summary>

I tried to break this finding on four fronts and it survived all of them.

QUOTE ACCURACY — exact. night-ring.css:24 is `.night-seat-overlay__badge { position:absolute; top:-10px; right:-10px; min-width:18px; height:18px; padding:0 var(--space-4); border:1px solid …; background:var(--surface-raised) }`, and line 10 is `z-index:2` on the parent `.night-seat-overlay`.

SAME COORDINATE FRAME — confirmed by reading the wiring, not assumed. `.night-seat-overlay { inset:0 }` is applied to the GrimoireSeat root, which GrimoireSeat.tsx sizes to exactly tokenSize x tokenSize. SeatChipLayer.chipStyle positions chips into that same root at `left: tokenSize/2 + dx - size/2`. Both are siblings inside `.grimoire-seat` (`isolation:isolate` → local stacking context); chips carry no z-index (only draft chips get 1), so the badge paints above every chip. The z-index claim is correct.

MINIMAL REPRO — I copied the production geometry modules into scratch and drove them directly (solveRingLayout, satellitePlacements, satelliteChipSize, plus radialAngleFor transcribed from GrimoireCanvas.tsx:92), then box-intersected each chip against the badge rect. 12p @1024x640: token=84, chip=25, badge box rel. token centre x[34,52] y[-52,-34] — the reviewer's numbers to the digit. Intersections at 1-indexed seats 2,3,4,7; seat#4 chip0 sits at (42.1,-40.6) with 52% of its box under the badge (65% once the 4px padding + 1px borders widen the pill). 20p @1024x640 (token=64): exactly 10 intersecting chips, seats 3,4,5,6,7,10,11,12 — matches the reviewer's "10 对". Also fires at 8p (3), 15p (5), and identically 

</details>

### readOnlyContract.test.ts:264 — 🟠 major

`src/features/grimoire/replay/readOnlyContract.test.ts:264`

**问题**：第三层扫描器只认 `dispatch(` 与 `dispatch={`，认不出 `binding.dispatchSession(`。它自称「新增一个没交代的 dispatch 会让这条转红」，但它对**此刻仓库里已经存在**的那一个就是瞎的。

**证据**：

```
`.filter(({ code }) => /\bdispatch\s*\(/.test(code) || /\bdispatch=\{/.test(code))` —— `\bdispatch\s*\(` 在 `dispatchSession(` 上不匹配（dispatch 后面是 S 不是括号）。手跑同一段扫描逻辑得到的清单只有 5 个文件：GrimoireStage.tsx / day/useDayRing.ts / stage/HostingModeSection.tsx / stage/SessionInfoOverlay.tsx / write/useGrimoireWriteLayer.ts —— nightRingBridge.ts:32 的 `binding.dispatchSession(createNightWorkbenchCommit(next, binding))` 不在其中。
实测改坏（阴性）：往 night/nightTargetTap.ts 追加 `export function leakWrite(binding, seatId) { binding.dispatchSession({...}) }` → readOnlyContract.test.ts `Tests 19 passed (19)`。
实测改坏（阳性对照）：同一个函数改成裸 `dispatch(...)` → `FAIL … accounts for every dispatching surface in the canvas tree / AssertionError: expected [ 'night/nightTargetTap.ts' ] to deeply equal []`。两次均已 `git checkout` 还原。
```

**牌桌上会发生什么**：这条测试是整份只读契约里唯一一道「防止长出第二个写入面」的机器保险。它已经漏掉了 G3 这一批新加的夜间写入面；下一个人按同样的写法（拿 binding 传 dispatchSession）再加一处，仍然静悄悄。而回看归档时的写入等于篡改战绩。

<details><summary>反驳验证</summary>

试图推翻但推翻不了：三条事实核对全部命中，两组对照实验也复现了。

1) 引用属实。`src/features/grimoire/replay/readOnlyContract.test.ts:264` 逐字就是 `.filter(({ code }) => /\bdispatch\s*\(/.test(code) || /\bdispatch=\{/.test(code))`。`src/features/grimoire/night/nightRingBridge.ts:32` 逐字就是 `binding.dispatchSession(createNightWorkbenchCommit(next, binding))`，该文件在 `night/` 下、非 `.test.`、非 `replay/`，确实落在 `grimoireSourceFiles()` 的 61 个扫描面之内。

2) 盲区属实。我用 node 原样复刻 `stripComments` + walk + filter，扫出的 dispatching 清单正是 GrimoireStage.tsx / day/useDayRing.ts / stage/HostingModeSection.tsx / stage/SessionInfoOverlay.tsx / write/useGrimoireWriteLayer.ts 五个，nightRingBridge.ts 不在其中；把 filter 放宽成 `\bdispatch\w*\s*\(` 它立刻出现。原因是纯正则语义：`dispatch` 后面是 `S` 不是 `(`，`\s*\(` 匹配不上——与任何并发改动无关。顺带一提，转发这条通道的 `stage/useRingBindings.tsx` 同样扫不到，整条 nightBinding 写入链对这条测试完全不可见。

3) 对照实验属实。往 `night/nightTargetTap.ts` 追加 `binding.dispatchSession(...)` → `Tests 19 passed (19)`（阴性）；同一函数改成裸 `dispatch(...)` → `FAIL … accounts for every dispatching surface in the canvas tree / AssertionError: expected [ 'night/nightTargetTap.ts' ] to deeply equal []`（阳性）。已 `git checkout -- src/features/grimoire/night/nightTargetTap.ts` 还原，临时脚本已删。（当前工作区里 nightRingBridge.ts / useSeatWriteBindings.ts 的 `if (true) return` 与两个 `__*_repro.test.ts` 是并行复核会话的实验残留，不是我留下的，也不影响本结论。）

所以「测试自称的保险实际不成立」这一条站得住：这批 G3 新加的夜间写入面就是它漏掉的第一个实例，而它的注释白纸黑字写着「新增一个没交代的 dispatch 会让这条转红」。这不是「设计如此」——`accounted` 表的存在本身就说明作者意图是逐个点名所有 dispatch 面，nightRingBridge 既没被点名也没被扫到，属于两头落空。

但把 severity 从 blocker 降到 major，理由是 whyItMatters 夸大了当下的实际后果：
- 全仓唯一的只读消费方是 `src/features/game-end/GrimoireReplaySheet.tsx`（grep `writ

</details>

### readOnlyContract.test.ts:107 — 🟠 major

`src/features/grimoire/replay/readOnlyContract.test.ts:107`

**问题**：`refuses the seat gesture %s` 这组 it.each 只断言「0 次 dispatch + raw 状态没动」，而 5 个成员里只有 openActionBar 有反证（line 151-157）。另外 4 个（draftFromCell / addMarker / removeMarker / handleChipGesture）分不清「被封住了」和「这个函数本来就是死的」。

**证据**：

```
实测改坏：把 useSeatWriteBindings.ts 里 addMarker 的函数体首行改成 `if (true) return`（彻底空转），跑 `npx vitest run src/features/grimoire` → `Test Files 47 passed (47) / Tests 419 passed (419)`。再把 draftFromCell / removeMarker / handleChipGesture 一并空转，仍然 419/419 全绿。已 `git checkout` 还原。
文件头第 6 行自称「清单里标成 write 的成员，封口后一次 dispatch 都不许发生（逐个跑，不抽查）」，line 70-71 更专门解释了挑 `arm-delete` 是为了避开「本来就什么都不做」的空绿——但 BINDING_WRITE_CALLS 的反证段（line 151-157）实际只跑了 openActionBar。
```

**牌桌上会发生什么**：四个座位手势（六格里的前四格、加标记、删标记、chip 长按删除）任何一个在实现里退化成空函数，只读契约测试照样报绿，写入验收也报绿。说书人在进行中的对局里长按一枚标记想删掉它，什么都不发生。

<details><summary>反驳验证</summary>

发现成立，且我按判据逐条实测过。

引用属实：readOnlyContract.test.ts line 107-121 的 `refuses the seat gesture %s` 全部断言只有「dispatched 长度 0 / raw.bindings.actionBarSeatId 为 null / raw.layer.draft 为 null」三条；反证段里 binding 侧只有 line 151-157 的 openActionBar（LAYER_WRITE_CALLS 四个成员则由 line 136-149 全覆盖）；文件头 line 6「逐个跑，不抽查」、line 9「每一层都配了反证」、line 70-71 关于挑 arm-delete 以避开空绿的说明，均逐字对得上。

后果可复现：基线 `npx vitest run src/features/grimoire` = 47 files / 419 tests 全绿；把 write/useSeatWriteBindings.ts 的 addMarker 首行改成早退 → 仍 419/419 全绿；再把 draftFromCell / removeMarker / handleChipGesture 一并空转 → 仍全绿。全仓 `npx vitest run` 只有 3 条红，全部在 night/projectNightRing.test.ts 与另一并发 agent 留下的 night/__repro_*.test.ts（该 agent 同时改了 night/nightTargetTap.ts、nightRingBridge.ts），与本变异无关。两处改动均已 git checkout 还原，git status 对 replay/ 与 write/ 干净。

没有别处守卫：全仓 grep，这四个成员只出现在 GrimoireStage.tsx / stage/seatAnchor.tsx 的接线、sealWriteSurface.ts 的清单、以及这份只读契约测试。write/writeAcceptance.test.tsx 只测 useGrimoireWriteLayer，不碰 bindings；GrimoireStage.test.tsx 只点开六格浮层与第六格「座位卡」（走 onOpenPlayerStatus），从不点进会写草稿的格子。类型层也挡不住：WritingMembers 只约束键集，不约束函数体。

不是「设计如此」：文件自己承诺每层都配反证，line 70-71 正是在处理同一类空绿，作者只是没把 binding 侧的反证从 openActionBar 扩到另外四个。

一点补充分寸（不改变结论，也不降级）：我做了反向变异，把 sealWriteSurface.ts 的 `addMarker: 'write'` 改成 `'harmless'`（放行不封），line 119 立刻转红。所以这组断言对「封口失效」方向在当前实现下是真咬人的，不是纯装饰；缺的是钉住前提的那一半——实现一旦退化成空函数，这组绿静默失效，而全仓再无第二处测到这四个手势会写草稿。四个手势是画布上的主要写入入口（六格前四格、加标记、删标记、chip 长按删除），零正向覆盖，回归会静默上线。维持 major。修法很小：把 line 151-157 那条 live 用例扩成对五个 BINDING_WRITE_CALLS 逐个跑，断言 raw.layer.draft 转为非 null（openActionBar 则断言 actionBarSeatId）。

</details>

### readOnlyContract.test.ts:256 — 🟠 major

`src/features/grimoire/replay/readOnlyContract.test.ts:256`

**问题**：`accounted` 是一张散文白名单：5 个条目里 3 个的内容是「还没封，别人的事」。测试名叫 accounts for every dispatching surface，但绿灯并不代表这些面被盖住了，而且其中一条免责词与代码事实相反，没有任何断言在盯它。

**证据**：

```
`'stage/HostingModeSection.tsx': '切换主持模式（set-hosting-mode）。回看归档时这个入口根本不该出现——改的是史实'` —— 事实是 GrimoireStage.tsx:297-303 无条件渲染 `<SessionInfoOverlay … dispatch={dispatch} />`，回看态下那两颗模式单选键照样在（只是 GrimoireReplaySheet.tsx:25 传的 `NO_WRITES` 把它吞掉）。同理 `'day/useDayRing.ts': '……主控接线时必须一并封'` —— GrimoireStage.tsx:182-191 把裸 `dispatch` 直接喂进 useRingBindings→useDayRing，seal 一寸都没盖到它。
另：`accounted` 的键没有任何反向校验（不检查这些键仍然是 dispatching 文件），文件改名后条目会静默变成死配置。
覆盖面核对：`grep -rn "GrimoireReplaySheet" src --include="*.test.tsx"` 无结果——整个回看入口零测试；GrimoireStage.test.tsx 也从不传 writeAccess。
```

**牌桌上会发生什么**：只读契约的三层机器保险，第三层实际靠的是一段承诺文字。回看一局归档时打开「本局信息」，模式单选键看得见、点得动、按下去什么都不发生——按这个仓库自己的标准（「按下去什么都不发生是最坏的反馈」）这已经是缺陷；哪天有人把 NO_WRITES 换成真 dispatch，就是直接改史实，而 readOnlyContract 全程绿灯。

<details><summary>反驳验证</summary>

Tried to refute; every load-bearing claim checked out.\n\nCITATIONS EXACT: readOnlyContract.test.ts:252-258 is the `accounted` map, line 256 verbatim as quoted. GrimoireStage.tsx:297-303 renders <SessionInfoOverlay … dispatch={dispatch} /> with the RAW dispatch (the seal at :133-136 covers only layer/bindings). GrimoireStage.tsx:182-191 feeds raw dispatch into useRingBindings → useDayRing, which dispatches set-day-vote-draft at useDayRing.ts:97,103 — seal never touches it. GrimoireReplaySheet.tsx:25 is the NO_WRITES lambda. Assertion at line 268 is one-directional (dispatching.filter(f => !(f in accounted))), so accounted keys are never validated against reality → silent dead config after a rename.\n\nCOVERAGE CLAIMS HOLD: no test file anywhere references GrimoireReplaySheet (GameEndSheet.test.tsx doesn't exercise the replay path); no test outside replay/ passes writeAccess; GrimoireStage.test.tsx:112-118 asserts the mode radio only on the live path.\n\nREPRO (temp vitest file, run, then deleted): rendered GrimoireReplaySheet with a grimoire-mode archive, clicked 本局信息. Radio 桌上有实体魔典 renders with disabled=false and no aria-disabled. Clicking it pops the full DowngradeHandoffCard including its 「已抄好，切回纯记录」 button — a "copy your grimoire to the physical one" workflow inside a finished archive; confirming closes the overlay and changes nothing (NO_WRITES swallows set-hosting-mode). With a record-mode archive, clicking 没有实体魔典 skips the handoff entirely, commits a no-op, and silently closes the sheet.\n\nREFUTATIONS ATTEMPTED AND FAILED: the seal cannot reach this path (SessionInf

</details>

### readOnlyContract.test.ts:252 — 🟠 major

`src/features/grimoire/replay/readOnlyContract.test.ts:252`

**问题**：「画布树里每一个会 dispatch 的地方都必须被点名」那条守门用的正则匹配不到 G3 新增的两条写入路径，于是 accounted 名单静默漏掉了它们。这条测试宣称「新增一个没交代的 dispatch 会让这条转红」，实际上不会。

**证据**：

```
readOnlyContract.test.ts:283 `.filter(({ code }) => /\bdispatch\s*\(/.test(code) || /\bdispatch=\{/.test(code))`。nightRingBridge.ts:32 写的是 `binding.dispatchSession(createNightWorkbenchCommit(next, binding))` —— `\bdispatch\s*\(` 要求 dispatch 后面紧跟 `(`，`dispatchSession(` 不匹配；useRingBindings.tsx:83 只是把 dispatch 作为对象成员往下传（`useDayRing({ session, dispatch, ... })`），两种写法都不命中。所以这两个文件不在 :252 的 accounted 表里，测试照绿。
```

**牌桌上会发生什么**：这条测试是本批唯一一处「画布里不许长出第二个没人知道的写入面」的机器保证，而 G3 恰好长出了两个：夜环那条经由 dispatchSession 的真实 session 写入，和把 dispatch 透传给白天环的那一层。守门失效之后，「回看态下还有哪里写得进去」重新变成靠人记——而这批代码已经证明人记不住（见上一条 HostingModeSection）。

<details><summary>反驳验证</summary>

Verified and confirmed; only the cited line numbers are slightly off.

CODE CHECK. The gatekeeping filter is at readOnlyContract.test.ts:264 (finding said :283), but its content is verbatim as quoted: `.filter(({ code }) => /\bdispatch\s*\(/.test(code) || /\bdispatch=\{/.test(code))`. nightRingBridge.ts:32 is exactly `binding.dispatchSession(createNightWorkbenchCommit(next, binding))` — correct file and line. useRingBindings.tsx passes `dispatch` as an object shorthand into `useDayRing({ session, dispatch, ... })` at lines 80-85 (the `dispatch,` token is on :82, not :83).

MISS IS REAL. Replaying the test's own walk + regex over src/features/grimoire: detected = GrimoireStage.tsx, day/useDayRing.ts, stage/HostingModeSection.tsx, stage/SessionInfoOverlay.tsx, write/useGrimoireWriteLayer.ts. Missed = night/nightRingBridge.ts, stage/useRingBindings.tsx. `dispatchSession(` cannot match `\bdispatch\s*\(` (requires `(` immediately after `dispatch`), and shorthand `dispatch,` matches neither pattern. Notably GrimoireStage.tsx only lands in the list via `dispatch={dispatch}` on :301 — JSX passthrough is caught, object-literal passthrough is not.

MINIMAL REPRO. I added two throwaway files to grimoire/night/, one writing via `dispatch(action)` and one via `binding.dispatchSession(action)`. With both present the test fails with `expected [ 'night/__probeObviousWrite.ts' ] to deeply equal []` — the dispatchSession probe is invisible even in the failure. With only the dispatchSession probe present, the test PASSES. That directly falsifies the promise in the test's own comment at :247-2

</details>

### GrimoireShieldBar.tsx:45 — 🟠 major

`src/features/grimoire/stage/GrimoireShieldBar.tsx:45`

**问题**：揭示到 L2 只挂 onPointerDown/onPointerUp，没有任何 onClick 或「点+确认」两段路径——键盘与读屏用户永远进不了魔典视图。而 L2 是角色名/图标唯一进入 DOM 的一档。

**证据**：

```
<Button aria-label="按住 600 毫秒揭示角色" onPointerDown={beginReveal} onPointerUp={cancelReveal} onPointerLeave={cancelReveal} onPointerCancel={cancelReveal}>按住揭示</Button> —— 全组件没有第二个揭示入口；文件头自己写着「盲操作不能是唯一路径——键盘用户、读屏用户…都必须能盖上和掀开」。恢复方向（uncover / conceal / coverNow）都是 onClick，只有揭示这一向不是。文档原话是「需长按遮蔽键 600ms **或点+确认两段**进入」，第二条路没实现。GrimoireShieldBar.test.tsx:21 还反过来断言「单击永不揭示」，把这个死角钉住了。
```

**牌桌上会发生什么**：键盘/读屏用户 Tab 到这颗键、按 Enter，浏览器只派发 click，beginReveal 一次都不会跑——按钮完全无反应，不是「揭示失败」而是「按钮是死的」。对这类用户，整个魔典模式退化成一圈只念得出座位号和生死的匿名圆点，L2 的全部内容（角色名、标记 label、夜序 ✓/缓）永久不可达。

<details><summary>反驳验证</summary>

发现成立，代码引用逐字属实，后果已用真实浏览器复现；仅「影响面」一句略有夸大，故把 blocker 下调为 major。

1) 代码核对。GrimoireShieldBar.tsx:45-57 就是引文那段：揭示键只挂 onPointerDown={beginReveal} 与三个 cancelReveal 的指针处理器，没有 onClick、没有 onKeyDown。components/ui/Button.tsx 是裸 <button> 加 props 透传，不会合成指针事件。全仓 grep 显示 beginReveal 只有这一个挂载点，setLevel('L2') 也只出现在它那个 600ms 定时器里 —— 确实不存在第二条进 L2 的路。

2) 后果复现（临时文件已删）。Playwright 真 Chromium：<button> 聚焦后按 Enter 只派发 keydown,click；按 Space 派发 keydown,click —— 全程没有 pointerdown/pointerup。对真实组件跑的临时 vitest 用例也确认：Enter 后 beginReveal 调用数 0，Space 后 0，裸 fireEvent.click 后 0；且 L1 下整条栏只有两颗按钮（"按住 600 毫秒揭示角色"、"全遮蔽"）。按钮对键盘/读屏是死的，不是难用。

3) 不是「设计如此」。仓库三处写着相反的话：dev-docs/DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md:160 表格里明写「长按 600ms 或点+确认两段」；useGrimoireShield.ts:8 的注释自称两条路都有；write/SeatActionDrawerPath.tsx 文件头把这条定成硬规矩——「长按键盘发不出来、读屏也不会播报它存在……长按只能是加速器」。揭示键是唯一违反这条自定规矩的控件。

4) 没有被别处挡住。GrimoireShieldBar.test.tsx:21 用的是 userEvent.click，它会派发 pointerdown/pointerup，所以那条断言的是 beginReveal 被调用——它固定的是指针路径，对键盘零覆盖；也不阻挡修复，「点+确认」本来就不是「一击到底」。

需要修正的一点：whyItMatters 说「角色名永久不可达」偏重。drawerVisible = shieldVisibility(level).seatIdentity，L1 为 true，抽屉里托管的夜间工作台照旧显示当前唤醒项的角色名（GrimoireStage.tsx:179-181 自己写明这一点），SeatActionDrawerPath 还给了键盘用户座位卡/更换角色入口；此外纯记录模式是完整的退路。键盘用户真正拿不到的是环上每座的角色身份、标记 label/sourceRoleId 与说书人注记。属于「少了一条等价路径」而非「主流程断裂」，因此定 major 更合适。修复方向也很轻：给这颗键补一条 onClick 的两段确认（第一下变「确认揭示」，第二下才 setLevel('L2')），与 SeatActionDrawerPath 删标记的二段确认同形，且不破坏现有那条「单击不揭示」的测试。

</details>

### GrimoireReplaySheet.tsx:54 — 🟡 minor

`src/features/game-end/GrimoireReplaySheet.tsx:54`

**问题**：回看归档时环上的座位仍然是活的按钮：写入不是被封口拒绝的，是被一个 no-op dispatch 无声吞掉的。归档若在某个 day/night 段还开着的时候保存（收尾流程不关段），deckNodeForSession 会把回看落到 day 或 night 节点，环就走上这两条未封口的路。

**证据**：

```
GrimoireReplaySheet.tsx:50 `dispatch={NO_WRITES}`、:54 `nightBinding={{ session, dispatchSession: NO_WRITES }}`，:51 `deckNode={deckNodeForSession(session)}`。全仓只有 DayWorkbench.tsx:149 会 dispatch `close-open-segment`，GameEndSheet/archiveService 里一处都没有，所以「打完就收尾、没按过确认结束白天」的归档带着开着的 day 段。此时 useDayRing.ts:63 `const readOnly = focus.writeLocked || context.hasResolution || !active` 三项全假（回看里 DayWorkbench 根本没挂载，没人调 setWriteLocked；那天若还没落处决结论 hasResolution 也是假），intent 落到 'nominator'，座位可访问名念「选为提名人」，按下去 dispatch 进 NO_WRITES。夜段同理走 commitNightRingTarget，且因为 next !== state 返回 true，连 notify 都不给。
```

**牌桌上会发生什么**：G3 验收③要求「全部写入入口 disabled（readOnly prop 强制，不靠自觉）」。这里两条入口既不 disabled，也不给拒绝回执，靠的正是「主控记得传两个 NO_WRITES」这种自觉——而 sealWriteSurface.ts 头注释花了一整段解释为什么不能这样做（「那要求十几个组件各自记得做一次同样的事，而漏掉的那一次没有任何外部表现」）。

<details><summary>反驳验证</summary>

Confirmed, with a working repro.\n\nCitations are exact: GrimoireReplaySheet.tsx:50 `dispatch={NO_WRITES}`, :51 `deckNode={deckNodeForSession(session)}`, :54 `nightBinding={{ session, dispatchSession: NO_WRITES }}`; useDayRing.ts:63 is verbatim `const readOnly = focus.writeLocked || context.hasResolution || !active`.\n\nThe gap is structural: GrimoireStage.tsx:133 applies `sealGrimoireWrite` only to `{layer, bindings}`, while useRingBindings (GrimoireStage.tsx:182) gets the raw `dispatch` and the raw `nightBinding`. `writeAccess` never reaches the ring.\n\nPrecondition holds: the only production dispatcher of `close-open-segment` is DayWorkbench.tsx:149 (explicit "确认结束白天"); archiveService.ts:138 stores `session` verbatim and neither GameEndSheet nor archiveService closes segments; the "收尾" entry (AppPhaseTrack.tsx:42) is always reachable. So archives carrying an open day/night segment are the norm.\n\nRepro (temporary vitest file, run then deleted) rendering the real GrimoireReplaySheet inside DiscussionTimerProvider:\n- Day: session with an open day segment -> deckNodeForSession = 'day'; seat token renders aria-label "3号，玩家3，选为提名人", toBeEnabled() passes, click leaves `.grimoire-receipt` empty (no refusal). Drawer gesture contract reads "点座位 = 选为提名人；落账仍在抽屉里" in a replay whose drawer has no workbench.\n- Night: prototype session -> deckNodeForSession = 'night'; seats read "1号，玩家1，选为玩家", enabled, click -> empty receipt. nightRingBridge.ts:31-33 returns true on `next !== state`, so useRingBindings.tsx:96-98 never calls notify — silent, as claimed.\n\nBy contrast the sealed pat

</details>

### GrimoireStage.tsx:234 — 🟡 minor

`src/features/grimoire/GrimoireStage.tsx:234`

**问题**：selectedSeatIds 只接了白天的举手，夜间被选为目标的座位拿不到 aria-pressed，读屏完全听不出哪几个座位已经选上了。

**证据**：

```
selectedSeatIds={ring.day.selectedSeatIds} —— useDayRing.ts:112 `selectedSeatIds: active && step === 'vote' ? draft.raisedSeatIds : []`，夜间恒为 []。夜间的「已选」只表达在 NightSeatOverlay 的虚线描边与「目标①」小字上，而那一整层 aria-hidden="true"（NightSeatOverlay.tsx:60）；GrimoireSeat.accessibleName（:85-104）也不收 targeted。
```

**牌桌上会发生什么**：裁决 5 明写「GrimoireSeat 与 SeatButton 是同一 seatId 的两种呈现、共用选中态契约（勾选 + 描边 + 颜色 + aria-pressed），不得各自发明选中语义」。夜间环上恰恰各自发明了一套：视觉有描边、语义层什么都没有。读屏用户在环上选完两个目标，环本身一个字都不告诉他选了谁——而唯一会说的那行回显（NightTargetEcho）按上一条根本没渲染。

<details><summary>反驳验证</summary>

引用全部属实，机制也复现了，但后果被夸大了一档，所以成立、降级为 minor。

一、四处引用逐字核对无误
- <private-workspace> 确实是 `selectedSeatIds={ring.day.selectedSeatIds}`，环上唯一的选中态来源只接了白天。
- day/useDayRing.ts:112 `selectedSeatIds: active && step === 'vote' ? draft.raisedSeatIds : []`；useRingBindings.tsx:84 传 `active: deckNode === 'day'`，夜间恒为 []。
- night/NightSeatOverlay.tsx:60 整层 `aria-hidden="true"`，虚线描边与「目标①」都在这一层里（:64-72）。
- seat/GrimoireSeat.tsx:85-104 的 accessibleName 只拼 seatId/昵称/角色/生死/毒醉/标记枚数/actionHint，不含 targeted；:170 `'aria-pressed': selected` 恒渲染。

二、最小复现（临时测试已跑完删除）
在真实调用点 DeckBody（hostingMode='grimoire'、deckNode='night'）里，用真实写入路径 commitNightRingTarget 把 3 号选成当前项目标后：
- 环上 3 号 token：`aria-pressed="false"`，aria-label = 「3号，玩家3，中毒，1枚标记，选为玩家，替换3号」。
- 视觉层确实有 `.night-seat-overlay__target`，文本「目标①」，其宿主 span `aria-hidden="true"`。
所以「夜间被选中的座位在环上拿不到 aria-pressed」是真的，而且顺带暴露一个更难看的细节：useRingBindings.tsx:94 用 `nightSeatTapHint(nightRing.target, 0)` 算出一句**全环共用**的提示，于是已选的 3 号被告知「选为玩家，替换3号」，而实际点下去是取消选择——NightSeatOverlay 头注里「aria-hidden 是因为那句话由 nightSeatTapHint 进可访问名」的补偿通道，本身就没按 per-seat 接上（那句注释指向的 blockedBy 在全仓库只此一处，是个悬空引用，不构成「设计如此」的凭据）。反过来，GrimoireSeat.tsx:5 与 seat/grimoire-seat.css:89 都白纸黑字写着环上 token 与 SeatButton 共用「勾选+描边+颜色+aria-pressed」，夜间这一路确实违约。

三、被夸大的部分：不是「完全听不出」
DeckBody.tsx:121-128 只传了 carouselElsewhere，从没传 targetsOnRing（NightWorkbench.tsx:54 默认 false），于是抽屉里走的是 WakeTargetPicker 的 grid 分支——一整张未折叠的 6 列号码网格，SeatButton.tsx:41 `aria-pressed={selected}`。同一次复现里 `.seat-grid` 存在且不在 details 内，全屏唯一一个 `aria-pressed="true"` 正是

</details>

### DayRingOverlay.tsx:30 — 🟡 minor

`src/features/grimoire/day/DayRingOverlay.tsx:30`

**问题**：startOffset 没有被串起来：RingLayout 不带这个字段，renderRingOverlay 只交出 layout，于是白天叠加层永远按 startOffset=0 反算角度。四档旋转一旦启用，弧线与徽标会整体错位。

**证据**：

```
DayRingOverlay 的 startOffset?: RingStartOffset 缺省 0，:78 seatRadialAngle(index, seatIds.length, startOffset)；而 GrimoireStage.tsx 的 renderRingOverlay 只传 layout（useRingBindings.tsx:106-118），RingLayout（ellipseRing.ts:34-46）没有 startOffset 字段，GrimoireCanvas 也没把自己的 startOffset 透传出去。GrimoireCanvas.tsx:92 的 radialAngleFor 与 nominationArc.ts:36 的 seatRadialAngle 是同一公式的两份实现。
```

**牌桌上会发生什么**：裁决 1 硬规定「座位角度 = f(seatIndex, seatCount, startOffset)，startOffset 只有 0/90/180/270 四档」。今天全链路恒为 0 所以看不出来；谁一旦把四档接上，token 转了而提名三角、举手徽标、死亡票 chip 全留在原处，而且不会有任何测试变红——两份角度公式各自读不同的 offset 正是这类漂移的标准形态。

<details><summary>反驳验证</summary>

尝试推翻失败，发现成立。逐条核对：

1) 引用属实。DayRingOverlay.tsx:30 确为 `startOffset?: RingStartOffset`，:57 缺省 0，:78 `seatRadialAngle(index, seatIds.length, startOffset)`。ellipseRing.ts:34-46 的 RingLayout 只有 mode/tokenSize/pitch/radiusX/radiusY/centerX/centerY/seats/satelliteInside，确实没有 startOffset（solveRingLayout 在 :121 用掉后就丢弃）。useRingBindings.tsx:106-118 的 renderRingOverlay 确实只传 layout，不传 startOffset；GrimoireCanvas.tsx:247 只 `renderRingOverlay?.(layout)`；GrimoireStage.tsx:228-235 也没给画布传 startOffset。三份同一公式确实存在：ellipseRing.ts:121（内联）、GrimoireCanvas.tsx:92 radialAngleFor、nominationArc.ts:36 seatRadialAngle，前两份读画布的 offset，第三份读被静默缺省成 0 的那份。

2) 规格引用属实。dev-docs/DUAL_MODE_GRIMOIRE_DESIGN_2026-08-04.md:115 与 :1091 明写「座位角度 = f(seatIndex, seatCount, startOffset)，startOffset 只有 0/90/180/270 四档」，:1096 还写了「layout 字段删除，改为 startOffset」。所以这是写进裁决的功能，不是臆想的未来需求。

3) 后果可复现。写了一个临时 vitest（跑完已删除，git status 干净），走真实生产函数：solveRingLayout({seatCount:8, 900x700, startOffset:90}) 下 1 号 token 圆心在 (836,350)，而 DayRingOverlay 实际会画的提名三角落在 (450,116)——与正确位置差 389.6px，与它本该扎进的 token 圆心差 451.4px（正确值 74.5px）。徽标/死票 chip 走同一个 radialAngle，方向同样翻错。不是微小漂移，是整条弧跳到环的另一个象限。

4) 没有守卫挡住，也没有测试覆盖。startOffset 是可选带缺省，漏传照样过类型。全 src grep，非缺省用法只有 ellipseRing.test.ts:46 与 nominationArc.test.ts:135 两处纯函数测试，接线路径零覆盖——「不会有任何测试变红」属实。

5) 不是「设计如此」。DayRingOverlay 身上长着这个 prop，正说明作者本意是要串下来的；断点在 renderRingOverlay 的签名上。唯一能替它辩护的是：今天没有任何调用方设过 startOffset（无 session 字段、无 UI、无持久化），全链路恒为 0，用户此刻看不到任何问题。这只说明它是潜伏缺陷，不说明它不是缺陷——GrimoireCanvas.startOffset 是公开 prop，一次单 prop 改动即可触发 450px 级错位且静默无声。

维持原评级 minor：事实全部核实、后果已数值复现、无守卫无覆盖，但今天不可被用户观察到。

</details>

### nominationArc.test.ts:61 — 🟡 minor

`src/features/grimoire/day/nominationArc.test.ts:61`

**问题**：「永远走短边：顺时针一格是 sweep 1，逆时针一格是 sweep 0」这条用例的逆时针那一半是恒真断言。path 模板里 x-rotation 与 large-arc-flag 恒为 `0 0`，所以 `/ 0 0 /` 与 sweep 是什么值毫无关系。

**证据**：

```
nominationArc.ts:157 `const path = \`M ${x} ${y} A ${rx} ${ry} 0 0 ${clockwise ? 1 : 0} ${x2} ${y2}\`` —— 无论 sweep 是 0 还是 1，串里都含有「 0 0 」（rotation + large-arc 相邻）。配套的 `expect(anticlockwise.path).not.toMatch(/ 1 [01] /)` 也拦不住：sweep=1 时后面跟的是坐标数字。
实测改坏：把 `${clockwise ? 1 : 0}` 硬编码成 `1`，跑 `npx vitest run src/features/grimoire/day` → `Test Files 8 passed (8) / Tests 65 passed (65)`。已 `git checkout` 还原。（顺时针那一半 line 60 的 `/ 0 1 /` 是真的，硬编码成 0 会红。）
```

**牌桌上会发生什么**：逆时针方向的提名（比如 1 号提名 11 号）弧会翻到镜像那一侧，从环的内部横穿过去——正好压在核上那三个数「举手 N / 门槛 M / 差 X」上面，而 nominationArc.ts 开头整整两段就是在论证为什么绝对不能横穿中央。全屏唯一一条连线画反方向，且没有任何测试会红。

<details><summary>反驳验证</summary>

CONFIRMED, with a severity downgrade.

Code check: nominationArc.ts:157 is verbatim as quoted — `const path = \`M ${round(from.x)} ${round(from.y)} A ${rx} ${ry} 0 0 ${clockwise ? 1 : 0} ${round(to.x)} ${round(to.y)}\``. The x-rotation and large-arc-flag are hardcoded adjacent literals, so the substring " 0 0 " (with both surrounding spaces) is present in EVERY generated path irrespective of the sweep value. Therefore nominationArc.test.ts:61 `expect(anticlockwise.path).toMatch(/ 0 0 /)` is a tautology.

Mutation, actually executed: hardcoded the sweep to `1`, ran `npx vitest run src/features/grimoire/day` -> "Test Files 8 passed (8) / Tests 65 passed (65)". Control mutation to `0` -> line 60 fails ("expected 'M 400 148 A 228 152 0 0 0 514 168.4' to match / 0 1 /"), proving the clockwise half (line 60) is a real assertion and only the anticlockwise half is dead. Source restored; `git status --porcelain` on the file is clean; temp scripts deleted.

Backstop check: line 63 `not.toMatch(/ 1 [01] /)` also fails to catch it — with sweep=1 the following token is the x2 coordinate ("286"), so the pattern never matches. Grep of the whole repo shows only two test files reference nominationArc/DayRingOverlay, both inside src/features/grimoire/day, both included in the mutation run. No guard elsewhere.

Consequence check (SVG F.6.5 endpoint->center conversion, run numerically): correct anticlockwise arcs never come closer than 152px to the ring centre (they ride the arc ellipse, only clipping the coreBox corners, which the module header explicitly accepts as a tradeoff). Flipped-sweep

</details>

### useRingBindings.tsx:65 — 🟡 minor

`src/features/grimoire/stage/useRingBindings.tsx:65`

**问题**：seatOverlays 的 useMemo 永远命中不了：依赖里的 nightRing 每次渲染现算、seatIds 每次渲染现建，两个依赖都是新引用。

**证据**：

```
useRingBindings.tsx:65 `const nightRing = deckNode === 'night' ? projectNightRing(session) : null`（无 useMemo，projectNightRing 每次返回新对象 + 两个新 Map）
:66-77 `const seatOverlays = useMemo(..., [nightRing, seatIds, shield])`
GrimoireStage.tsx:186 `seatIds: seats.map((seat) => seat.seatId)`（每次渲染新数组）
```

**牌桌上会发生什么**：这不是纯粹的浪费：GrimoireStageBody 的重渲频率很高——useGrimoireShield 的 revealProgress 在 600ms 长按揭示期间按 requestAnimationFrame 更新（约 36 次），useDiscussionTimer 在白天每秒一跳。每一次都重跑一遍 projectNightRing（遍历队列建两个 Map）、重建 12–20 个 NightSeatOverlay 元素、并让 GrimoireCanvas 重解 solveRingLayout、每个 GrimoireSeat 重算 satellitePlacements。正好落在「长按揭示」这个最需要跟手的手势上。写了 useMemo 却一次都不命中，比不写更坏——它让下一个人以为这里已经处理过了。

<details><summary>反驳验证</summary>

核心事实成立，但「为什么重要」那一段的因果链是错的，major 撑不住。

**成立的部分（已实测）**
- `src/features/grimoire/stage/useRingBindings.tsx:65` 确实是 `const nightRing = deckNode === 'night' ? projectNightRing(session) : null`，没有 useMemo；`projectNightRing` 每次返回全新对象字面量 + 两个 `new Map`。
- `:66-77` 的 `useMemo(..., [nightRing, seatIds, shield])` 与引用一致；`GrimoireStage.tsx:186` 确实是 `seatIds: seats.map((seat) => seat.seatId)`，每渲染新数组。
- 最小复现（临时 vitest 探针，已删）：同一个 `useRingBindings` 连渲 3 次，`seatOverlays` 得到 **3 个互不相同的引用**。这个 useMemo 确实一次都不命中。

**被推翻的部分**
1. 因果错位——它归咎给 memo 的那些开销，跟 memo 命不命中无关。全仓 `grep "React.memo"` / `memo(` 命中数为 **0**，没有任何组件被 memo 包过。`GrimoireCanvas` 是普通函数组件、在 `GrimoireStage.tsx:228` 内联 JSX 里调用，且同时收着 `renderRingOverlay`（:106 每渲染新闭包）、`renderSeatAnchorWith(...)`、两个内联 `seats.map`、`projectDayTimer(timer)` 等一堆新引用。`solveRingLayout` 更是写在 `GrimoireCanvas.tsx:138` 函数体里、连 useMemo 都没有。所以「GrimoireCanvas 重解 solveRingLayout、每个 GrimoireSeat 重算 satellitePlacements」在 GrimoireStageBody 每次重渲时**无条件发生**，把 seatOverlays 修成稳定引用一次也省不下来。
2. 同理，`projectNightRing` 每渲染重跑是 :65 缺 useMemo 造成的，**在 memo 之外**。只修 :66 的依赖，这条开销原样留着——发现里最贵的那一项并不由它描述的缺陷产生。
3. 触发频率的证据是错的。`useGrimoireShield.ts:beginReveal` 用的是 `window.setInterval(..., 50)`，不是 requestAnimationFrame：600ms 长按约 **12 跳**，不是「约 36 次」。
4. 量级实测（15 座，临时基准，已删）：整个 memo 体（projectNightRing + fromEntries + 15 个 NightSeatOverlay 元素）**18 µs/次**，画布几何 4.7 µs/次。12 跳合计约 0.2 ms 摊在 600ms 手势上。`NightSeatOverlay` 本身十来行、大多数座位直接 `return null`。「正好落在最需要跟手的手势上」这个结论不成立。
5. 无正确性影响：`seatOverlays` 全仓只有 `GrimoireCanvas.tsx:162` 一处在渲染期读 `seatOverlays?.[seatId]`，没有任何 useEffect/useMemo 把它当依赖，引用抖动不会触发副作用。

**结论**：这是一处**死

</details>


---

## 已修（留档，便于核对修法是否对症）

### ✅ GrimoireCanvas.tsx:88 — 🔴 blocker

`src/features/grimoire/GrimoireCanvas.tsx:88`

**已修**：RingLayout 未导入（1a6ea33）

**问题**：G3 接线给画布加了 renderRingOverlay 槽，但 RingLayout 类型没 import，整个仓库编译不过。`npm run check`（lint && test && build && verify:architecture）在 build 这一步就红。

**证据**：

```
GrimoireCanvas.tsx:88 `renderRingOverlay?: (layout: RingLayout) => ReactNode`；文件 11–29 行的 import 里只有 `import type { RingStartOffset } from './layout/ellipseRing'`，没有 RingLayout。tsc 报 `src/features/grimoire/GrimoireCanvas.tsx(88,32): error TS2304: Cannot find name 'RingLayout'`。`git show db8632f:src/features/grimoire/GrimoireCanvas.tsx | grep RingLayout` 在 G3 之前查无此名，所以是 5afa229 引入的。`npx tsc -b` 全仓共 27 条错误，其中 nightRingBridge.ts:29、GrimoireCanvas.tsx:88、GrimoireStage.test.tsx:38/205（缺 nightBinding prop）四条出自 5afa229/2482694 这两个 G3 提交，其余先于 G3 就红。而 `node scripts/verify-architecture.mjs` 与 `npx vitest run`（64 文件 513 用例）全绿。
```

**牌桌上会发生什么**：三个并行 agent 加主控都只跑了测试与架构守门，谁都没跑 build。守门规则和单测全绿这件事本身正在制造安全感：它们盖不住类型层，而这一批恰恰是靠类型（satisfies 键集、穷尽枚举）在做边界保证的。构建红意味着这份 G3 现在根本发不出去，也意味着 nightRingBridge 那条 `at` 缺失从提交那一刻起就有编译器在喊，没人听。

<details><summary>反驳验证</summary>

CONFIRMED — I tried to refute this and could not; every load-bearing claim survives direct verification.

1) Code matches the quote exactly. GrimoireCanvas.tsx:88 is `renderRingOverlay?: (layout: RingLayout) => ReactNode`. The import block (lines 11-29) contains only `import type { RingStartOffset } from './layout/ellipseRing'`. The token `RingLayout` appears nowhere else in the file.

2) The consequence is real; the build is its own minimal repro. `npx tsc -b` exits 2 and emits verbatim `src/features/grimoire/GrimoireCanvas.tsx(88,32): error TS2304: Cannot find name 'RingLayout'.` Because `build` is `tsc -b && vite build`, `npm run check` (lint && test && build && verify:architecture) fails at the build step exactly as claimed.

3) G3 introduced it. `git log -L 88,88:src/features/grimoire/GrimoireCanvas.tsx` attributes the line to 5afa229; `git show db8632f:...GrimoireCanvas.tsx` contains no `RingLayout` token at all. nightRingBridge.ts is likewise new in 5afa229.

4) Nothing else guards it. There is no `typecheck` block in the vite/vitest config, so vitest transpiles through esbuild and never evaluates types; oxlint does not typecheck; verify-architecture is a plain node script. The "tests and gates all green" state the finding flags as false comfort is exactly right.

5) Not design-as-intended. `RingLayout` IS exported (layout/ellipseRing.ts:34) and is imported the ordinary way elsewhere — layout/coreBox.ts:2 does `import type { RingLayout } from './ellipseRing'`. This is a forgotten import, fixable in one line, not a deliberate omission.

Two accounting corrections that

</details>

### ✅ nightRingBridge.ts:32 — 🔴 blocker

`src/features/grimoire/night/nightRingBridge.ts:32`

**已修**：桥的全部测试（cb0364d）

**问题**：夜间环上点座位选目标的唯一写入路径 commitNightRingTarget 完全没有测试。夜侧三个 .test 文件（nightTargetTap / projectNightRing / nightRingCursor）测的是「按下去等于什么」的描述和「环上该画什么」的投影，没有任何一条走到写入本身。

**证据**：

```
实测改坏：在 nightRingBridge.ts:28 前插入 `if (true) return false`（即环上点座位永远不写、永远静默失败），跑 `npx vitest run src/features/grimoire src/app` → `Test Files 50 passed (50) / Tests 427 passed (427)`。已 `git checkout` 还原。
对照组：昼侧有 day/dayRingBridge.test.tsx，把真 DayWorkbench 和环探针挂进同一棵树、断言落到 localStorage 里的 session；夜侧没有对应物，useRingBindings.tsx（调用方）与 GrimoireStageHost.tsx 也都没有测试文件。
```

**牌桌上会发生什么**：说书人在夜里点环上的座位选目标，环上不出虚线描边、抽屉里不出回显、草稿一个字没写——而这正是 nightTargetTap.ts 开头自己写下的最坏反馈（「按下去毫无反应……说书人会以为自己点上了」）。整套 CI 不会有任何一条转红。

<details><summary>反驳验证</summary>

发现成立，我尝试推翻但每一条都反过来证实了它。

**1. 引用属实。** `<private-workspace>` 第 28 行确为 `const state = sessionInitialNightState(binding)`，第 32 行确为 `binding.dispatchSession(createNightWorkbenchCommit(next, binding))`。

**2. 「唯一写入路径」属实且是活线，不是死代码。** 全仓 grep `commitNightRingTarget` 只有三处命中：定义处、`stage/useRingBindings.tsx:11` 的 import、以及 `useRingBindings.tsx:96` 的唯一调用。这条链在生产里完整接通，没有任何开关：`GrimoireStage.tsx:182` 调 `useRingBindings` → `GrimoireStage.tsx:232` 把 `ring.onSelectSeat` 传给 `GrimoireCanvas` → `GrimoireCanvas.tsx:217/241` 把它给座位的 `onSelect`。而 `useRingBindings.tsx:96-98` 正是 `if (!commitNightRingTarget(...)) notify(...)`，所以返回 false 就等于「点了只弹一句提示、什么都不写」，跟 whyItMatters 描述一致。

**3. 破坏实验独立复现，数字一模一样。** 我在第 28 行前插入 `if (true) return false`，跑 `npx vitest run src/features/grimoire src/app` → `Test Files 50 passed (50) / Tests 427 passed (427)`，全绿，与原报告完全吻合。（随后跑全量时出现的 1 个 fail 与本发现无关：那是 `readOnlyContract.test.ts` 撞上了并发的兄弟 agent 此刻正在树里生成的 `__repro_*/__tmp_*` 临时测试文件与对 `projectNightRing.ts`、`useSeatWriteBindings.ts` 的在途改动，不是我的变异导致的。）我已用变异前的备份还原，`git diff --exit-code` 确认该文件与 HEAD 完全一致，且我没有在仓库里留下任何临时测试文件。

**4. 没有别处的守卫兜住。** 没有任何测试渲染 `deckNode="night"` 再点座位：`GrimoireStage.test.tsx`（它确实 import 自 `GrimoireStageHost`）只用了 dusk / day / dawn 三个节点。夜侧现有测试全部**绕开**桥直接打 reducer——`nightTargetTap.test.ts` 与 `projectNightRing.test.ts` 里满屏都是 `reduce(state, { type: 'target', seatId })`，也就是说 `sessionInitialNightState → reducer → createNightWorkbenchCommit → dispatchSession` 这段「写入本身」一步都没走到。`useRingBindings.tsx` 无测试文件；`gameSes

</details>

### ✅ nightRingBridge.ts:29 — 🔴 blocker

`src/features/grimoire/night/nightRingBridge.ts:29`

**已修**：at 缺失（1a6ea33）

**问题**：环上的 target 意图漏传时间戳 `at`，落进 session 的草稿没有 updatedAt。这既让 `tsc -b` 直接报错（构建红），也在运行时把草稿变成「清不掉、也拦不住换角」的状态。

**证据**：

```
nightRingBridge.ts:29 `const next = nightWorkbenchReducer(state, { type: 'target', seatId })`，而 gameSessionAdapter 侧的类型是 `export type NightWorkbenchAction = NightWorkbenchIntent & { at: string }`（nightWorkbenchReducer.ts:44）。tsc 报 `src/features/grimoire/night/nightRingBridge.ts(29,45): error TS2345: Property 'at' is missing`。运行时 nightWorkbenchDrafts.ts:22 `updatedAt: at` 写进 undefined，实跑得到的草稿 JSON 是 `{"targets":[4],...,"draftRevision":1}` —— updatedAt 整个键不存在。下游两处守卫都以它为准：nightWorkbenchReducer.ts:243 `if (!item || !draft?.updatedAt || ...) return state`（clear-draft 直接拒绝）、:236 `if (!item || (draft?.updatedAt && item.progress !== 'confirmed'))`（换角的「请先完成或清空当前草稿」失效）；NightWorkbench.tsx:254 `canClearDraft={... Boolean(draft.updatedAt)}` 恒 false。
```

**牌桌上会发生什么**：环上点出来的草稿在抽屉里既清不掉（「清空草稿」永远灰着、dispatch 也被 reducer 拒绝），又不再阻止换角——说书人可以带着一份看不见来源的目标草稿把角色换掉，下一步确认时落账的是错的目标。同时 reducer 的纯函数保证被打破：updatedAt 缺席意味着归档回放拿不到这次草稿改动的时刻。这一条本来编译器就该拦下来，说明 G3 从未跑过 `npm run build`。

<details><summary>反驳验证</summary>

尝试推翻失败——该发现完全成立，逐条验证通过。

【引用核对：真实，近乎逐字】
- nightRingBridge.ts:29 确为 `const next = nightWorkbenchReducer(state, { type: 'target', seatId })`。
- nightWorkbenchReducer.ts:45 确为 `export type NightWorkbenchAction = NightWorkbenchIntent & { at: string }`。
- NightWorkbench.tsx:254 确为 `canClearDraft={!readOnly && !isCorrectionMode(mode) && Boolean(draft.updatedAt)}`。
- 唯一瑕疵：两处守卫的行号有 2–4 行漂移（发现写 243/236，实际 247/238），内容一字不差。不影响成立。

【构建红：原样复现】
`npx tsc -b` 输出 `src/features/grimoire/night/nightRingBridge.ts(29,45): error TS2345: ... Property 'at' is missing`，与发现引用一致。

【排除「已被别处挡住」】
- createNightWorkbenchCommit / toNightRun 原样透传 drafts，不补时间戳；
- nightSessionReducer 的 commitNightWorkbench 只校验 records/roleChanges，不碰 draft 字段；
- 全仓 grep：除临时文件外无任何测试引用 nightRingBridge / commitNightRingTarget，零覆盖；
- 调用点 useRingBindings.tsx:96 在 `nightRing.target.targetCount > 0` 时即生效，真实可达，非死代码。

【最小复现（走真实 bridge，并以抽屉路径作对照，跑完已删除临时文件）】
环路径：bridge 返回 true；落进 session 的草稿 JSON 为 `{"targets":[4],"roleChoice":"","outcomeId":"","playerChoice":"选择4号","storytellerResult":"","informationGiven":"","draftRevision":1}` —— 与发现引用的字符串逐字相同，updatedAt 缺席；canClearDraft 恒 false（按钮不渲染）；clear-draft 被 reducer 拒绝（返回同一引用，草稿存活）；change-role 直接通过，notice 为「10号角色已改为小恶魔；本夜队列未自动调整」，roleChangeEvents 增长，且该项仍挂着 targets:[4] 的孤儿草稿。
抽屉对照路径（带 at）：updatedAt 正常写入；按钮可用；clear-draft 成功清空；change-role 被正确拦下「请先完成或清空当前草稿，再更换角色」。
差异完全归因于漏传 at。

【非「设计如此」】
nightWorkbenchDrafts.ts:4-8 与 roleChanges.ts:31-33 的文档明确要求调用方生成并传入 at，以保住 reducer 纯函数 / 归档回放。同一 intent 抽屉侧遵守了该契约，bridge 侧遗漏，属实现缺陷而非取舍。appendRoleChange 会追加一条持久 RoleChangeEvent 并提交进 session，坐席角色真的被改掉。

【严重度】
维持 blo

</details>

### ✅ useRingBindings.tsx:92 — 🔴 blocker

`src/features/grimoire/stage/useRingBindings.tsx:92`

**已修**：只读闸门（cb0364d）

**问题**：夜环完全绕过夜间工作台的只读闸门。projectNightRing 算出了 readOnly，接线处一次都没读。已确认项、已暂缓项、以及「正在预览别的项」时，点环仍然真的写进 session 的草稿，而抽屉里同一个动作是 fieldset disabled 的。

**证据**：

```
useRingBindings.tsx:92 `const seatTap = nightRing && nightRing.target.targetCount > 0 ? {...}` —— 判据里没有 `!nightRing.target.readOnly`。projectNightRing.ts:55 明明算了 `const readOnly = isReadOnlyMode(deriveWorkbenchMode(run, current))` 并放进 target 上下文；nightTargetTap.ts:60 `if (context.readOnly) return { kind: 'blocked', reason: '本项此刻只读，点座位不写任何东西' }` 只被 hint 用到，写入路径不经过它。nightWorkbenchReducer.ts:85 `case 'target':` 是这个 reducer 里唯一没有 canEditItem 守卫的写入分支（对比 :230 apply-ai-advice、:233 change-role、:243 clear-draft 都先查守卫）。实跑 initialNightWorkbenchState：把当前项置为 confirmed（mode=settled, readOnly=true）后 `nightWorkbenchReducer(state,{type:'target',seatId:4})` 返回新引用，drafts 变成 `{"targets":[4],...,"playerChoice":"选择4号"}`；把 previewEntryId 指向队列第二项（mode=preview-settled）后点 6 号，草稿照样落在那个被预览的项上。
```

**牌桌上会发生什么**：抽屉里点不动、环上点得动，而两块屏显示的是同一项。说书人回头看已确认的项，目标已经被自己不小心改掉了，屏幕上的目标和归档里那条确认记录对不上；预览下一位时顺手碰一下环，草稿落进一个他还没开始处理的角色。这既违反 9.3「每一次权威状态写入都必须能追溯到一次说书人手势」的「一次手势一次写入」，也直接违反 workbenchMode.ts 头注释自己定的硬规则「任何只读态都通过一个 readOnly prop 自上而下强制」——这里连读都没读。而且是无回执静默写入，边界第四节要求这个数必须为 0。

<details><summary>反驳验证</summary>

发现成立，且已用真实代码路径复现。

【引用核对】全部属实。useRingBindings.tsx:92 的判据逐字是 `const seatTap = nightRing && nightRing.target.targetCount > 0 ? {...}`，没有 `!nightRing.target.readOnly`；projectNightRing.ts:55 确实算了 `const readOnly = isReadOnlyMode(deriveWorkbenchMode(run, current))` 并放进 target；nightTargetTap.ts:48 的 blocked 分支只被 hint 用到。

【真正的漏洞点比发现描述的更深一层】nightRingBridge.ts:30 的注释写着「reducer 用『同一引用即无变化』表达拒绝，守卫挡下的点击在这里原样返回 false」——但 `case 'target'` 交给 updatePreviewDraft（nightWorkbenchDrafts.ts:14-15），后者唯一的检查是 `if (!item) return state`，根本没有守卫可以撞。所以桥接层依赖的那个「reducer 会拒绝」的前提是假的。

【最小复现（临时 vitest，跑完已删）】走真实 session 往返 + 真实 commitNightRingTarget：
- preview-open（预览队列另一项）：readOnly=true，第 92 行闸门照样开，hint 返回「本项此刻只读，点座位不写任何东西」，而 commitNightRingTarget 返回 true，草稿 {"targets":[6],...,"playerChoice":"选择6号"} 真的落进 session.nightRuns[runId].drafts。
- deferred（mode=settled）：wrote=true，草稿 targets:[7] 落盘，progress 仍是 deferred，随后 projectNightRing 在这个已落定项上画出 targets=[7]。
- reducer 层直接跑已确认项：得到与发现里逐字相同的 {"targets":[4],...,"playerChoice":"选择4号"}。
即：读屏念出来的那句话和实际行为完全相反，且写入无回执（返回 true 时不 notify）。

【是否被别处挡住】没有。GrimoireCanvas.writeProps（:156-163）从不传 disabled，GrimoireSeat 的 disabled 默认 false，点击无条件回调 onSelect；sealGrimoireWrite 只封 useSeatWriteBindings 那一层，ring.onSelectSeat 不在其中。CurrentWakeCard:207 给目标选择器传了 disabled={readOnly}，抽屉/环的不对称是真的。现有测试只钉住纯函数（nightTargetTap.test.ts:148、projectNightRing.test.ts:70/85 断言 readOnly 算对了），没有任何一条测接线是否照做。

【是否「设计如此」】不是。projectNightRing.ts:53-54 的注释明写「预览别的项、已确认、已暂缓时环上点不动，这与 CurrentWakeCard 的 fieldset disabled 是同一个判据」，nightRingBridge 的注释也明写它依赖 reducer 守卫——两处注释都断言了与实际相反的行为。对照 useDayRing.ts:63 昼环确实算了 readOnl

</details>

### ✅ useRingBindings.tsx:96 — 🔴 blocker

`src/features/grimoire/stage/useRingBindings.tsx:96`

**已修**：只读闸门（cb0364d）

**问题**：只读夜序项在环上照样写得进去：先 commit 再判断，而 commitNightRingTarget 与 reducer 都不看 readOnly。token 念的是「点座位不写任何东西」，实际写了。

**证据**：

```
onSelect: (seatId) => { if (!commitNightRingTarget(nightBinding, seatId)) { notify(nightSeatTapHint(...)) } } —— commit 在前，提示在后。nightRingBridge.ts:29 直接 nightWorkbenchReducer(state, { type: 'target', seatId })，不读 projectNightRing 算出来的 readOnly；reducer 的 case 'target'（nightWorkbenchReducer.ts:85）只调 updatePreviewDraft，没有 canEditItem 守卫。实跑（预览已 confirmed 的 night-3-gambler）：projectNightRing.readOnly = true，token 念 "本项此刻只读，点座位不写任何东西"，commitNightRingTarget 返回 true 并 dispatch commit-night-workbench，该已确认项的 draft.targets 被改成 [7]。
```

**牌桌上会发生什么**：说书人（或读屏用户）在环上点一下，会静默覆盖掉一条**已经确认过**的夜间行动的草稿目标，而屏幕和读屏都刚刚告诉他「这一下不写任何东西」。projectNightRing.ts:54 的注释「与抽屉里那张卡共用同一个只读闸门」是假的——抽屉那份闸门是 fieldset disabled，环这条路上一个闸门都没有。

<details><summary>反驳验证</summary>

确认成立，代码引用逐字属实，后果已用最小复现跑出来。

1) 位置与内容核对无误。useRingBindings.tsx:92-100 的夜间分支只按 `nightRing.target.targetCount > 0` 进入，hint 取 `nightSeatTapHint(nightRing.target, 0)`，onSelect 先调 commitNightRingTarget、返回 false 才 notify——commit 确实在提示之前，且全程不看 readOnly。nightRingBridge.ts 通篇没有 readOnly/canEditItem（会话期间另一个 agent 刚给它补了 `at` 参数，只读这条缺口原样保留）。nightWorkbenchReducer.ts:85-91 的 case 'target' 直接走 updatePreviewDraft，无 canEditItem 守卫；nightWorkbenchDrafts.ts:9-34 只校验 previewEntryId 对应的 item 存在。projectNightRing.ts:53-55 算出的 readOnly 只喂给 nightSeatTap 的提示字符串，注释里那句「与抽屉共用同一个只读闸门」在环这条路上确实不成立。

2) 最小复现（临时测试，已删除）。用真实 useRingBindings + prototype session，经真实 defer 意图把当前项打成 deferred：actionHint = 「本项此刻只读，点座位不写任何东西」，gestureContract = 「点座位 = 选玩家；确认仍在抽屉底栏」（两句自相矛盾），onSelectSeat(7) 之后 notices 为空、draft 变成 {"targets":[7],...,"draftRevision":1}。第二个探针复刻了原发现的原话：已 confirmed 的项上 draft.targets 由 [1] 变 [7]，commitNightRingTarget 返回 true，发出一条 commit-night-workbench，item 仍是 confirmed。第三个探针跑 preview-open（光标在 night-3-cerenovus、预览 night-3-gambler）：写进被预览项的 draft 并把它的 progress 由 pending 翻成 draft——这一支还额外破了「预览不写任何东西」，并且会给说书人后续可能确认的那一项静默预填一个目标。

3) 没有别处挡住。GrimoireSeat.tsx:167-172 是启用状态的 button，aria-label 里就嵌着 actionHint，onClick 直接调 onSelect；GrimoireCanvas.tsx:216-217 / 240-241 两处都不传 disabled。sealGrimoireWrite 只封 useGrimoireWriteLayer / useSeatWriteBindings 两张清单，nightBinding 是绕过封口直接传给 useRingBindings 的。现有测试 projectNightRing.test.ts:66-85 与 nightTargetTap.test.ts:135-158 只钉提示字符串，从没钉写入路径。

4) 不是「设计如此」。workbenchMode.ts:10-13 白纸黑字写着任何只读态必须由自上而下的 readOnly prop 强制、禁止组件自行判断；抽屉那侧靠 fieldset disabled 兑现了，环这侧一个闸门都没有。

对证据的一处无关紧要的更正：归档回看不受影响——Gr

</details>

### ✅ useRingBindings.tsx:93 — 🟠 major

`src/features/grimoire/stage/useRingBindings.tsx:93`

**已修**：逐座位提示语（cb0364d）

**问题**：夜间的每座位提示语被塌缩成一个用假座位号 0 算出来的全局字符串，贴到环上所有座位的可访问名上。

**证据**：

```
useRingBindings.tsx:93 `hint: nightSeatTapHint(nightRing.target, 0),`
GrimoireCanvas.tsx:43-44 `actionHint?: string`（单值），:216/:241 原样发给每一个 GrimoireSeat；GrimoireSeat.tsx:102 `if (actionHint) parts.push(actionHint)`。
nightTargetTap.ts 顶部注释写明它存在的理由：「说书人和读屏都需要在**按下之前**知道这一下会发生什么（选上？取消？顶掉谁？）」，:50 `if (context.targets.includes(seatId)) return { kind: 'deselect', seatId }`。
```

**牌桌上会发生什么**：targets 已满时，nightSeatTap(ctx, 0) 走的是 replace 分支，于是**每一颗** token 的 aria-label 都念「选为目标，替换2号」——包括 2 号自己（真实行为是取消选择），也包括已被选中的其他座位。读屏用户按下之前拿到的是一句确定的错话。nightTargetTap 那一整套按座位分情形的措辞（select/deselect/replace）在接线这一步被丢掉了，它的对拍测试仍然绿，因为测的是函数不是接线。

<details><summary>反驳验证</summary>

试图推翻但失败：最小复现逐字复刻了该发现描述的后果。

一、引用核对（准确，仅行号差一）
- 实际位置是 useRingBindings.tsx:94（发现写的 93），内容确为 `hint: nightSeatTapHint(nightRing.target, 0),`。
- GrimoireCanvas.tsx:44 `actionHint?: string` 确为单值；:216（环）与 :240（网格退化态）把同一个值原样发给每一个 GrimoireSeat。
- GrimoireSeat.tsx:102 `if (actionHint) parts.push(actionHint)`，:171 进 `aria-label`。

二、最小复现（renderHook(useRingBindings) + render(GrimoireCanvas)，跑完已删除临时文件）
原型 session 当前项 targetCount=1、targetLabel='玩家'、readOnly=false；点 2 号使 targets 满后：
- 逐座位真值：1号→「选为玩家，替换2号」，2号→「取消选为玩家」，3号→「选为玩家，替换2号」
- 接线产出的单值 actionHint =「选为玩家，替换2号」
- 真实渲染的 aria-label：
  "1号，玩家1，酒鬼，选为玩家，替换2号"
  "2号，玩家2，气球驾驶员，选为玩家，替换2号"   ← 真实行为是取消选择
  "3号，玩家3，筑梦师，中毒，选为玩家，替换2号"
  "4号，玩家4，占卜师，选为玩家，替换2号"
seatId 0 不是任何真实座位，故永不命中 nightSeatTap 的 deselect 分支；targets 满时恒定走 replace，evicted 恒为 targets[0]。

三、逐条排除守卫
1. aria-pressed 挡不住：GrimoireStage.tsx:234 传的是 `ring.day.selectedSeatIds`，而 useDayRing.ts:112 为 `active && step === 'vote' ? draft.raisedSeatIds : []`，夜间恒空。已被选中的座位 aria-pressed=false，读屏既拿不到「已选中」状态，又拿到一句相反的提示。
2. NightSeatOverlay 挡不住：整层 aria-hidden="true"，且其文件头注释明确写「读屏要听的是「点下去等于什么」，那句话由 nightSeatTapHint 算出来后进 GrimoireSeat 的可访问名」——它是主动把读屏职责让给这条被塌缩的通路的。
3. 测试挡不住：nightTargetTap.test.ts:155-163 直接拿真实 seatId 调函数，与接线无关，恒绿。全仓无任何一条测试穿过 useRingBindings/GrimoireCanvas 断言夜间 hint。发现里「测的是函数不是接线」这句属实。

四、不是「设计如此」
传字面量 0（永不存在的座位号）是占位而非取舍：nightSeatTapHint(context, seatId) 收 seatId 的全部意义就是让 select/deselect/replace 三种措辞按座位分开，其模块头注释写明存在理由是说书人与读屏必须在按下之前知道是三者中的哪一个。单值槽对**白天**是成立的（dayRingIntent.ts:45 的 DAY_RING_ACTION_HINT 按 intent 取值，与座位无关），塌缩很可能就是从这里顺下来的。

五、影响范围（缩小但不消除）
写入路径无恙：:96-98 的 onSelect 用真实 seatId 走 co

</details>

### ✅ useRingBindings.tsx:94 — 🟠 major

`src/features/grimoire/stage/useRingBindings.tsx:94`

**已修**：逐座位提示语（cb0364d）

**问题**：夜间环上每个 token 的可访问名后缀是用**座位号 0** 算出来的同一句话，而不是逐座位算。已选中的座位会念出与实际行为相反的提示。

**证据**：

```
hint: nightSeatTapHint(nightRing.target, 0) —— 实跑（targets=[5], targetCount=1）：广播给每一颗 token 的是 "选为目标，替换5号"；而 5 号自己的真实语义是 "取消选为目标"。双目标（targets=[3,5], targetCount=2）时广播 "选为目标，替换3号"，而 3 号与 5 号的真实语义都是 "取消选为目标"。nightTargetTap.ts:50 的 `context.targets.includes(seatId)` 分支对 seatId=0 永远为假，deselect 这一支根本走不到。
```

**牌桌上会发生什么**：读屏用户按下 5 号听到的是「选为目标，替换5号」，实际却把 5 号取消掉了——他会以为自己重选了一次，于是再按一次，把它又选回来，在同一枚目标上无限来回。nightTargetTap.ts 存在的全部理由就是「在按下之前知道这一下会发生什么」，接线这一步把它作废了。

<details><summary>反驳验证</summary>

确认成立，但严重度应从 blocker 降为 major。\n\n【代码核对】useRingBindings.tsx:94 确为 `hint: nightSeatTapHint(nightRing.target, 0),`，与发现引用逐字一致。紧邻的第 97 行传的是真实 seatId，只有广播用的 hint 写死了 0。\n\n【座位从 1 起】projectors.ts:75、createPrototypeSession.ts:136 等处一律 `seatId: index + 1`，座位 0 不存在。因此 nightTargetTap.ts:50 的 `context.targets.includes(seatId)` 对 0 恒为 false，deselect 分支在广播路径上不可达。\n\n【单串广播到每颗 token】GrimoireStage.tsx:231 → GrimoireCanvas.tsx:216/240（actionHint 是单个 string，非逐座位）→ GrimoireSeat.tsx:171 accessibleName → 第 102 行 parts.push(actionHint) 进 aria-label。\n\n【最小复现已跑（临时测试已删除）】输出与发现所述完全一致：targets=[5]/count=1 广播「选为目标，替换5号」而 5 号真实语义是「取消选为目标」；targets=[3,5]/count=2 广播「选为目标，替换3号」而 3 号、5 号真实语义均为「取消选为目标」。更精确的刻画是：对每个未选中座位广播恰好正确（顶掉集合相同），对每个已选中座位恰好错误——deselect 永远不会被念出来。\n\n【无其他守卫拦截】nightRingBridge.ts 直接把 {type:'target'} 交给 nightWorkbenchReducer 的切换分支，点击确实会取消选中；nightTargetTap.test.ts 只钉住了 hint 函数本身（函数是对的，错的是接线），没有测试覆盖接线层的逐座位可访问名。aria-pressed 也补不上：GrimoireStage.tsx:234 的 selectedSeatIds 来自 ring.day.selectedSeatIds，而 useDayRing.ts:112 在 active=false（夜间）时返回 []，已选目标同样播报为未按下。\n\n【不是「设计如此」】恰恰相反，它违反了仓库里明写的契约：NightSeatOverlay.tsx 整层 aria-hidden 的理由就是「读屏要听的是『点下去等于什么』，那句话由 nightSeatTapHint 算出来后进 GrimoireSeat 的可访问名」；nightTargetTap.ts:62-63 也写着「环上一个座位就是一颗键，读屏用户在按下前只能听到这句」。装饰层被静音的前提正是这句提示逐座位且为真。白天分支用单串是合理的（DAY_RING_ACTION_HINT[intent] 与座位无关），夜间不是——是 `actionHint: string` 这个 API 形状逼出了那个 0。\n\n【降级理由】这句话不在视觉上渲染任何位置，明眼说书人有草稿目标虚线描边与抽屉里「已选：5号」回显作为正确反馈，影响面限于读屏用户的取消选中路径；不涉及崩溃、数据损坏或主流程阻断。修复需要把 actionHint 拓宽为逐座位查表（或 hintForSeat 回调）穿过 GrimoireCanvas，是一处小的 API 变更而非一行补丁。

</details>


---

## 被推翻的 11 条

留在这里是为了避免下一个人重新「发现」它们。

- **nightTargetTap.test.ts** — `expect(Object.keys(context)).not.toContain('life')` 断言的是本文件 line 34-43 那个手写对象字面量，不是被测代码。恒真。
  - 推翻理由：事实部分对了一半，结论部分被实验证伪。

引用核对：<private-workspace> 确实是 `expect(Object.keys(context)).not.toContain('life')`，`contextOf()` 也确实在 line 34-43 手写返回 `{ targetCount, targetLabel, targets, readOnly }` 四个键。所以这句断言恒真——这一点成立。

但「这条百科级规矩没有机器保险」是错的。我做了最小复现：给 NightTargetContext 加可选 `deadSeats?: readonly

- **useDeckNavigation.test.ts** — `does not hijack the night close, which goes to dawn instead of dusk` 从头到尾没有关闭任何夜间段落，测的不是它注释里说的那件事。
  - 推翻理由：The finding's factual premises are accurate, but its central claim is empirically false.

VERIFIED AS DESCRIBED: The test at src/app/useDeckNavigation.test.ts:52 does only `setDeckNode('dawn')` + `rerender` on an untouched `createPrototypeGameSession()`. The prototype session really does contain a single UNCLOSED night-3 with no day segment (src/features/game-session/data/createPrototypeSession.ts

- **useDayRing.ts** — 裁决 10 被绕开：环上第一次点座位就把「按当时存活数算出的处决门槛」写进了 dispatch 的 payload 并落库。dayRingIntent.ts 头注释宣称「永不重算 threshold」，那句话只在纯函数内部成立，在真正 dispatch 的这条路上不成立。
  - 推翻理由：推翻。核心断言经实测为假，且定位的文件/行与所指现象无因果关系。

**1. 「永不重算 threshold 在 dispatch 路径上不成立」——实测为假。**
临时探针（已删除）：先模拟说书人在抽屉里把门槛手改成 3（存活 12，自动值本应 6），落库后在环上连点两次提名人，读回 session.dayVoteDraft.threshold = **3**，纹丝不动。原因是结构性的：applyDayRingTap 只走 setVoteNominator/setVoteNominee/toggleRaisedVote，三者都是 `{ ...draft, <单字段> }`（voteRound.ts:39/43/47），threshold 是被展开带过去的，没有任何一处调用 executionThresholdForAliveCount。executionThresholdForAlive

- **verify-architecture.mjs** — 守门规则 no-derived-values-in-actions 对 G3 全部代码不生效——它的 applies 只匹配 `src/features/*/state/**`，而 grimoire/day、grimoire/night、grimoire/replay、grimoire/stage 
  - 推翻理由：代码引用属实，但结论站不住：那是刻意的作用域，不是漏网。

**核对（引用本身没错）**
- `scripts/verify-architecture.mjs:308` 与 `:312` 逐字符与发现一致；`:209`、`:240` 同样只匹配 `src/features/[^/]+/state/`。
- `src/features/grimoire/` 下确实没有 `state/` 目录（子目录只有 backfill/completeness/core/day/drawer/layout/mode/night/replay/seat/shield/stage/write），所以这三条对 grimoire 一行都不生效——这一点是真的。

**但描述的后果不会发生（已做最小复现，跑完已回滚）**
1. 我把 `src/features/grimoire/day/useDayRing.ts:

- **nightRingBridge.ts** — 注释描述的拒绝机制不存在。commitNightRingTarget 靠「reducer 返回同一引用」判断被拒，但 target 分支没有任何守卫，只读情形下 reducer 照写照换引用，于是 notify 分支和 nightSeatTap 的 blocked 文案在接线后不可达。
  - 推翻理由：实测复核（临时 vitest 复现已跑并删除）。

站得住的部分：nightRingBridge.ts:30-31 引用无误；nightWorkbenchReducer 的 case 'target' 直接调 updatePreviewDraft，而 updatePreviewDraft 只在 previewEntryId 不在队列里时返回同一引用，确实没有 canEditItem/readOnly 守卫。复现：预览 night-3-pithag（readOnly=true、targetCount=1）时 commitNightRingTarget(binding,5) 返回 true 并写进 targets:[5]；useRingBindings.tsx:97 的 notify 分支实际不可达（唯一返回 false 的状态下 projectNightRing 给出 targetCount

- **useDeckNavigation.ts** — 关于「白天关掉后跟到 dusk」那个 effect 的判定：它**不**违反 9.3，但它是 G3 里唯一没有任何测试、也没有任何守门规则盯着的 effect，且它的判据无法区分「刚被关掉」与「还没被打开」。
  - 推翻理由：推翻。发现的承重论点在事实层面就是错的，其余部分是它自己已经撤回的指控加一个假想重构。

**代码引用属实**：useDeckNavigation.ts:41-44 逐字符对得上，`dayStillOpen` 判据与 effect 内容与引用一致。verify-architecture.mjs:296 的 grimoire-no-phase-dispatch 确实只扫 src/features/grimoire/**。机制本身在抽象层面也真实：我的复现证明，裸调 setDeckNode('day') 而没有开着的白天段时，确实会被弹回 dusk。

**但核心指控「G3 里唯一没有任何测试的 effect」是假的。** src/app/useDeckNavigation.test.ts 存在，里面三条测试全部是为这条 effect 写的，且与 effect 同属一次提交（db8632f）：

- **GrimoireCanvas.tsx** — 网格退化态下白天的空间反馈整块消失（提名弧、举手角标、处决帷幕、死亡票 chip），但环上的写入手势仍然生效。抽屉那条等价路径确实还在、也真的能用——这一条不是「路断了」，是「同一下点击在两档布局下的可见性差太远」。
  - 推翻理由：代码引用全部属实，但结论把「已写明、且已被测量调优过的降级取舍」讲成了缺陷，且其核心后果（「点了有效、看不见」）被实测推翻。

【引用核对：全对】
- GrimoireCanvas.tsx:247 确为 `{layout.mode === 'ring' ? renderRingOverlay?.(layout) : null}`；:224-245 网格分支确实照样把 `onSelect={onSelectSeat}` 发给每颗 token（:241）。
- 抽屉等价路径也属实：DeckBody.tsx 的 day 分支原样渲染 DayWorkbench；NominationStep.tsx:68-73 与 DayWorkbench.tsx:232-241（含 :238 的「标死亡票」）都没有 hostingMode 分支。
- useRingBindings.tsx:101-103 确实把

- **GrimoireStage.tsx** — L0 全遮蔽会把抽屉内容整段卸载，连带丢掉抽屉里工作台的本地 UI 态；掀开后回不到原处。
  - 推翻理由：代码引用属实，机制也真实存在，但它是被明确写下来的设计取舍而非缺陷，且后果被这条发现夸大了。

核对结果（全部对得上）：
- GrimoireStage.tsx:278-294 的三元与引用一字不差；drawerVisible 确在 :193 由 shieldVisibility(shield.level).seatIdentity 得出；GrimoireCanvas.tsx 的双指 touchstart（handleTouchStart / onBlindCover）在 :148-152；DayWorkbench.tsx:40-42 的 pendingResolution / pendingDayClose / leavePromptOpen 确为组件内 useState；DayRingFocusProvider 挂在 GrimoireStageHost.tsx:14，位于 Grimoi

- **nightRingCursor.ts** — NightSeatBadge.label 被注释成「进可访问名的那句话」，但全仓没有任何消费方——夜序角标（当前/①②/✓/缓）对读屏是彻底不存在的。
  - 推翻理由：代码引用属实，但后果判断不成立，severity 全靠那个不成立的后果撑着。

**属实的部分**：`src/features/grimoire/night/nightRingCursor.ts:37-38` 确实有 `/** 进可访问名的那句话。角标本身是 aria-hidden 的装饰，读屏只靠这句。 */ label: string`，:110 也确实每枚角标都算一遍 `badgeLabel(...)`。全仓 grep + 实跑确认：`NightSeatOverlay.tsx` 只读 `kind`/`ordinal`（自带 BADGE_TEXT + ordinalGlyph），`useRingBindings.tsx:71` 只把整个 badge 传给那个 aria-hidden 的叠加层，`GrimoireSeat.tsx:85-104` 的 `accessibleName` 不收

- **SeatChipLayer.tsx** — 可写态下每枚卫星 chip 都是一颗真按钮，尺寸却只有 22–28px，没有任何命中区外扩——远低于 44px 硬要求。
  - 推翻理由：代码引用属实，但把「设计如此」当成了缺陷，且后果链的每一环都反了。

属实的部分：SeatChipLayer.tsx:37-44 的 chipStyle 确实把 placement.size 写成 width/height；ellipseRing.ts:154-156 确实是 min(28,max(22,round(tokenSize*0.3)))，token=64 时 22px；grimoire-seat.css:143 的 .grimoire-seat__chip 确实没有 ::before 外扩，:74 只有 pointer-events:none 的 ::after 进度环；.grimoire-seat::before(:33-41) 确实用 --seat-hit。所以「可写态 chip 是 22-28px 的真按钮、无命中区外扩」这一句是对的。往后全错。

1) 手势语义整个搞反

- **DayRingOverlay.tsx** — 提名人/被提名人不在当前 seatIds 里时，angleOf 静默降级为 null，读屏摘要会说「未选」——把「选过但环上找不到」讲成「没选」。
  - 推翻理由：Refuted. The quoted code at line 83 is accurate (`angleOf` returns null via `anchorFor`, which nulls on `seatIds.indexOf === -1` at :71-81), but the claimed consequence does not exist. `ringSummary` at line 156 is invoked with the RAW props — `ringSummary(nominatorSeatId, nomineeSeatId, badges, execution)` — not with the angles. `angleOf`'s null value flows only into `nominationArc` (:90-91) for g
