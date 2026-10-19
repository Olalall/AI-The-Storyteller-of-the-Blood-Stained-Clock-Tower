# 2026-10-16 核心玩法 20 项修复与部署

20 项问题（13 项 P1、7 项 P2）均已修复并部署到 [BOTC 网站](https://botc.example.com)。修复按[原审计](../.tmp/core-audit-20261016/CORE_GAMEPLAY_AUDIT.md)的优先级完成，逐项源码和正式回归见下方对照表。

目标为腾讯上海实例 `SERVER_INSTANCE_ID`，运行目录 `C:\example\botc`，继续监听 `127.0.0.1:3000`。没有提交或推送源代码，发布包从用户授权的本地未提交工作区构建。

## 验收结果

- `npm run check` 通过：205 个测试文件、1,019 项测试通过，10 项可选真实模型测试跳过；lint、TypeScript、前端构建和架构硬门通过。保留 143/30 条原有非阻断 CSS 提示。
- `npm run smoke:backend` 通过。实际传输包独立解压运行，健康接口、首页、16 个入口 JS/CSS 和 AI 关闭状态通过。
- 生产构建浏览器共 53 个独立场景通过，包含新增夜间 6 项（已加入 load-performance 入口）、身份 4 项、白天 2 项、存档保护 8 项，以及原有长局、备份恢复、多标签编辑与按需加载回归。
- 首轮生产回归有 50 项通过、3 项测试失败：两项依赖旧假剧本名，一项在异步保存完成前读取快照。修正测试定位与保存等待后，相关 4 项通过；随后再次跑夜间 6 项也通过。运行代码没有因此改动。[生产汇总](../.tmp/release-20261016-core-fixes/production-acceptance.json)保留全部原始报告及按用例 ID 合并的最终状态，没有把重复执行计入场景总数。
- 公网浏览器共 24 个独立场景通过。首轮 23 项通过，一项同样提前读取旧光标；补齐持久化等待后，公网夜间 6 项重跑通过。[公网汇总](../.tmp/release-20261016-core-fixes/public-acceptance.json)保留失败原因及补测记录。浏览器使用隔离测试存档，HTTP AI 回复为受控替身，没有覆盖日常浏览器内容或调用真实模型。
- 查看了 390/1440px 身份、白天、恢复及夜间截图。单人身份页发现的半透明背景透出问题已修正为隐藏主持区域、禁用后台交互并完整遮住背景。
- 部署脚本的正常切换、健康失败回滚、恢复失败保留维护状态三种隔离演练均通过。

完整日志和[最终机器检查](../.tmp/release-20261016-core-fixes/final-verification.json)保存在 `.tmp/release-20261016-core-fixes/`。未重跑或宣称源码公开审计通过，历史 trace 和用户对局备份均未进入运行包。

## 发布与上线

运行包为私有仓库中的[部署资产](https://github.com/Olalall/botc-ai-storyteller/releases/tag/assistant-core-fixes-20261016-160155)：`botc-core-fixes-runtime-20261016.zip`，4,006,103 字节，SHA-256 `79E0D91BA0B86253D44487B41343053B8B734DF077BC9CE148F0992C3E546A7A`。保留文件与完整构建逐字节一致；省略的 719 个可选图片沿用服务器现有资源。包不含业务数据、日志、环境凭据、Git、node_modules 或历史报告，高置信度密钥扫描通过。

北京时间 16:08:27 开始切换，16:08:30 新版本本机健康检查通过。这是部署脚本执行窗口，不是精确公网停机时长。首页原始 SHA-256：`EB0D929B56AEDA98C577C02391E0D36205FD4DBEF45AA442ED3ADAB22A665E66`。公网 HTML 与构建一致；比较时只忽略 Cloudflare 既有统计 beacon 与标签间空白。16 个入口 JS/CSS 与本地构建逐字节匹配。

最终服务器取样时间为北京时间 16:15:04：Node PID `2436` 与上线初次取样相同；本机巡检和隧道巡检 healthy，失败计数为零，4 条隧道连接在线，原恢复时间未变，无额外自动重启。三个任务仍启用，任务 XML 与 5 个运维脚本哈希未变。主任务周期触发的非零 LastTaskResult 需结合 Running 状态、进程创建时间和 HTTP 判断，不能当成 Node 已退出。

## 数据保留与回滚

- 日常浏览器升级前后均通过应用自带按钮导出当前对局。两份文件逐字节一致，共 8,876 字节，SHA-256 `79CB7DF305C3A14C63DD1C051F820CEB5382B27EAAE71B0660B3663B0EA44BFF`；保留“欲盖弥彰”、12 个座位、3 条记录和原始全部字段。刷新时旧编辑租约短暂阻止写入，正常自动解除；没有绕过保护、导入或重置对局。
- 服务器原文件集合、大小和哈希与部署前一致。`data/asset-packs/characters.json` 仍为 560 字节，SHA-256 `011FA63E699DEF6B389C99B774E144FF3EC01B0A26BFDD54535A7567BF61BCB0`。停写期间备份后核对哈希和 JSON 可读性，之后仅替换程序目录。
- 旧程序、数据备份和任务 XML 位于 `C:\example\botc-deploy\releases\release-20261016-core-fixes\previous`。同级保留部署和验收结果；现有 `data/`、`.env`、Cloudflared 服务与路由、开机自启和巡检配置保留。旧哈希资源继续可读，降低已打开页面加载旧分块失败的风险。

回滚只恢复 previous 中的 `dist/`、`dist-server/`，保留发布后新增数据。暂停主任务及两项巡检、留存当前程序后还原两个程序目录，再恢复任务并检查本机与公网健康。不要用旧 data 覆盖当前 data，不改 Cloudflared 凭据。线上本次没有触发回滚、整机重启或故障注入。

## P1 修复对照

| 编号 | 原问题与触发 | 当前行为及源码 | 正式回归覆盖 |
| --- | --- | --- | --- |
| A01 | 同一局保存后继续操作，旧归档仍能解锁重置；HTTP 重复保存可能返回旧内容。 | 保存凭证绑定完整 session 快照及胜方；内容变化立即失效。相同快照重试复用命令，新内容使用新命令并保留旧归档。重置前重新读取归档并核对快照；后端拒绝同命令携带不同内容，包括并发竞争。见[面板与重置](PROJECT_ROOT/src/features/game-end/GameEndSheet.tsx)、[快照比较](PROJECT_ROOT/src/services/archive/archiveSnapshot.ts)、[后端幂等](PROJECT_ROOT/server/archive/handlers.ts)。 | [归档服务单测](PROJECT_ROOT/src/services/archive/archiveService.test.ts)核对当前内容及胜方；[HTTP 回路](PROJECT_ROOT/server/archive/archiveServiceHttpLoop.test.ts)覆盖重试与新版本；[后端并发](PROJECT_ROOT/server/archive/archiveBackend.test.ts)；[真实浏览器](PROJECT_ROOT/tests/e2e/archive-data-safety.spec.ts)覆盖 390/1440 保存→继续玩→禁止旧凭证重置→重存→重置，[HTTP 浏览器](PROJECT_ROOT/tests/e2e/archive-data-safety.spec.ts)覆盖胜方变化。 |
| A02 | 所有 localStorage 写入均超配额时，昵称记忆 effect 抛错导致主界面崩溃。 | 昵称记忆写入失败降级；主局仍保留内存状态、保存失败提示、导出和重试入口。见[便利用副本降级](PROJECT_ROOT/src/features/setup/setupRosterMemory.ts)、[主对局保存](PROJECT_ROOT/src/features/game-session/state/useGameSession.ts)。 | [hook 单测](PROJECT_ROOT/src/features/game-session/state/useGameSession.test.tsx)；[390/1440 浏览器](PROJECT_ROOT/tests/e2e/archive-data-safety.spec.ts)让全部 setItem 失败，检查界面未崩溃、导出含最新操作、恢复写入后重试不重放操作。 |
| A03 | 损坏原文可容纳，但恢复副本超配额，回退局随后覆盖唯一原文。 | 不可读原文完整保留并进入恢复界面，暂停编辑、自动保存和普通恢复。即使首次复制失败仍可导出。只有用户导出、明确确认，且在编辑锁与原文一致性检查下成功写入恢复副本，才建立空白新局；副本失败不写主键。见[原文保留](PROJECT_ROOT/src/services/session/localSessionAdapter.ts)、[恢复阻断与确认](PROJECT_ROOT/src/features/game-session/state/useGameSession.ts)、[锁内先备份后写主键](PROJECT_ROOT/src/services/session/sessionEditLock.ts)、[恢复界面](PROJECT_ROOT/src/features/game-session/components/SessionRecoveryNotice.tsx)。 | [hook 单测](PROJECT_ROOT/src/features/game-session/state/useGameSession.test.tsx)；[真实 Chromium 配额 390/1440](PROJECT_ROOT/tests/e2e/archive-data-safety.spec.ts)覆盖约 3 MiB 残缺 JSON、刷新不覆盖、原文下载、失败后仍阻止新局；[成功留档路径](PROJECT_ROOT/tests/e2e/archive-data-safety.spec.ts)覆盖明确确认后才新建。 |
| A04 | 慢 AI 回复覆盖新目标、倒退确认/光标，再确认产生无更正链的重复记录。 | 夜间交互提交动作，由统一 session reducer 对最新状态应用；整夜提交同时校验基础 revision 与会话上下文。过期建议、跨局回复、已关闭夜晚的迟到动作均不能覆盖当前事实；已有记录不重复追加。逐项操作同时绑定点击时的预览项和处理项，防止重复确认连带确认下一位。见[hook](PROJECT_ROOT/src/features/night-workbench/state/useNightWorkbench.ts)、[统一提交及版本校验](PROJECT_ROOT/src/features/game-session/state/nightSessionReducer.ts)。 | [最新目标与确认进度单测](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)、[真实组件延迟回复](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)、[提交边界及跨局拒绝](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)、[关闭后拒绝](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)；[390/1440 浏览器延迟 HTTP 替身](PROJECT_ROOT/tests/e2e/night-core-regression.spec.ts)。 |
| A05 | Catfishing 首夜遍历后续夜样例，角色集合与顺序错误。 | 新夜序以当前剧本包首夜/后续夜表决定在场角色与顺序，Catfishing 样例只复用对应角色的交互表单。见[新夜序生成](PROJECT_ROOT/src/features/game-session/state/createNextNightRun.ts)。 | [真实首夜角色集合、相对顺序与交互保留](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)；[既有夜序不重建](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)。未把单一剧本回归表述为全部剧本逐条语义验收。 |
| A06 | 当夜新确认毒醉状态未进入 AI 发动者上下文，旧健康建议仍可采用。 | 工作台和 AI 读取当前座位状态；相关权威事件变化进入上下文版本，旧建议及已采用的旧 AI 草稿不能直接确认。保留草稿供核对，主持人重新选择结果或生成新建议后再确认。见[当前状态投影](PROJECT_ROOT/src/features/night-workbench/state/gameSessionAdapter.ts)、[确认防线](PROJECT_ROOT/src/features/night-workbench/state/workbenchGuards.ts)。 | [新中毒进入发动者上下文、旧建议失效](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)、[已采用建议在新醉酒事件后不可确认，重新人工选择后可确认及备份往返](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)。 |
| A07 | 确认配板后微调身份，首次领取仍展示原配板身份。 | 身份交接读取当前确认投影；本座位身份变化后旧领取凭证失效，原开局快照仍供历史使用。见[身份页投影](PROJECT_ROOT/src/features/identity-deal/IdentityDealSheet.tsx)、[领取凭证校验](PROJECT_ROOT/src/features/identity-deal/identityProjection.ts)。 | [确认→微调→展示与旧凭证失效](PROJECT_ROOT/src/features/identity-deal/IdentityDeal.core-regression.test.tsx)；[390/1440 发最新身份](PROJECT_ROOT/tests/e2e/identity-core-recovery.spec.ts)。 |
| A08 | 提线木偶单人展示泄露真实爪牙身份，外显身份未确认持久化。 | 实际身份与主持确认的对外身份分开。酒鬼、疯子、提线木偶未确认外显身份前禁止打开身份展示；候选按角色限制筛选，确认不改实际配板，保存后刷新可恢复。本座位实际身份变化使旧确认失效；其他座位后来变为该外显角色不撤销本座位原确认。见[展示策略](PROJECT_ROOT/src/features/identity-deal/identityProjection.ts)、[确认命令](PROJECT_ROOT/src/features/game-session/state/setupSessionReducer.ts)。 | [三类错认身份与备份往返](PROJECT_ROOT/src/features/identity-deal/IdentityDeal.core-regression.test.tsx)、[提线木偶私密展示](PROJECT_ROOT/src/features/identity-deal/IdentityDeal.core-regression.test.tsx)、[同局后续角色变化](PROJECT_ROOT/src/features/identity-deal/IdentityDeal.core-regression.test.tsx)；[390/1440 确认与刷新](PROJECT_ROOT/tests/e2e/identity-core-recovery.spec.ts)。 |
| A09 | 赌徒结果模板允许向玩家展示猜对/猜错。 | 赌徒结果只作主持记录；生成草稿不填玩家告知，展示入口按角色策略关闭。旧存档已有告知原文仍保留供审计，但不能从玩家展示入口泄露。见[角色交互策略](PROJECT_ROOT/src/domain/scripts/nightInteractionInputs.ts)、[告知生成](PROJECT_ROOT/src/features/night-workbench/state/projectWakeDraft.ts)、[展示入口](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.tsx)。 | [新结果与旧存档私密文本](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)；[390/1440 浏览器确认无展示信息按钮](PROJECT_ROOT/tests/e2e/night-core-regression.spec.ts)。 |
| A10 | 错误高票不能下调更正，旧最大值继续控制暂列。 | 独立更正/撤销命令带理由追加线性更正链，保留原记录；暂列只采用有效最新版本，撤销票型不参与暂列。关闭日段的历史也可更正，当前无关草稿不被清空。见[投票更正](PROJECT_ROOT/src/features/game-session/state/dayVoteRevision.ts)、[有效暂列](PROJECT_ROOT/src/features/day-workbench/state/voteStanding.ts)。 | [8 票下调、关闭白天后更正与撤销](PROJECT_ROOT/src/features/game-session/state/dayRecovery.test.ts)、[过期/非法命令拒绝](PROJECT_ROOT/src/features/game-session/state/dayRecovery.test.ts)、[真实组件更正再撤销](PROJECT_ROOT/src/features/day-workbench/DayRecovery.test.tsx)；[390/1440 连续流程](PROJECT_ROOT/tests/e2e/day-core-recovery.spec.ts)。 |
| A11 | 直接/强制处决只能伪造最高票或漏记 execution。 | 提供带理由的主持确认特殊处决，可越过普通暂列限制，原子记录处决与可选死亡；无开日段时一并创建。普通处决仍受暂列约束，重复日终拒绝，失败不清空表单。见[特殊处决命令](PROJECT_ROOT/src/features/game-session/state/daySessionReducer.ts)、[录入界面](PROJECT_ROOT/src/features/day-workbench/components/SpecialExecution.tsx)。 | [低票特殊处决与防重复](PROJECT_ROOT/src/features/game-session/state/dayRecovery.test.ts)、[首日原子创建](PROJECT_ROOT/src/features/day-workbench/DayRecovery.test.tsx)、[拒绝保留输入](PROJECT_ROOT/src/features/day-workbench/DayRecovery.test.tsx)；[390/1440 连续流程](PROJECT_ROOT/tests/e2e/day-core-recovery.spec.ts)。 |
| A12 | 每座位固定一票，报丧女妖等额外票无法表达。 | 唯一举手座位数上增加主持确认的有符号总票修正与理由；统一 voteCount 供暂列、历史、归档与复盘使用，不伪造举手人，不自动推断能力。非整数、越界、负总票、非零无理由均拒绝。见[计票与校验](PROJECT_ROOT/src/features/day-workbench/state/voteRound.ts)、[录入](PROJECT_ROOT/src/features/day-workbench/components/DayVoteEditor.tsx)、[跨边界校验](PROJECT_ROOT/src/services/archive/archiveDayFields.ts)。 | [额外票与必要理由](PROJECT_ROOT/src/features/game-session/state/dayRecovery.test.ts)、[UI 计票](PROJECT_ROOT/src/features/day-workbench/DayRecovery.test.tsx)、[备份往返及拒绝畸形字段](PROJECT_ROOT/src/services/session/sessionBackup.test.ts)、[HTTP 拒绝非法字段](PROJECT_ROOT/server/archive/httpArchiveRoutes.test.ts)；[390/1440 连续流程](PROJECT_ROOT/tests/e2e/day-core-recovery.spec.ts)。 |
| A13 | 首次确认前移除男爵，残留 +2 外来者人数修正仍通过。 | 首次开局按当前在场来源角色验证人数修正，移除男爵后旧修正失效并阻断不合法人数；已经确认的局继续以原开局来源计算，避免男爵死亡/变角色错误撤销原构成。见[来源校验](PROJECT_ROOT/src/features/setup/setupRuleEvaluator.ts)、[已确认开局来源传入](PROJECT_ROOT/src/features/setup/SetupPanel.tsx)。 | [开局前移除来源必须失败、开局后保留原修正且不修改原草稿](PROJECT_ROOT/src/features/identity-deal/IdentityDeal.core-regression.test.tsx)。 |

## P2 修复对照

| 编号 | 原问题与触发 | 当前行为及源码 | 正式回归覆盖 |
| --- | --- | --- | --- |
| B01 | 预览另一角色时点“不适用”，修改当前处理角色。 | 预览时适用性按钮禁用，reducer 也拒绝预览状态写入。见[UI 防线](PROJECT_ROOT/src/features/night-workbench/components/CurrentWakeCard.tsx)、[reducer 防线](PROJECT_ROOT/src/features/night-workbench/state/nightWorkbenchReducer.ts)。 | [真实组件点击及状态不变](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)；[390/1440 浏览器](PROJECT_ROOT/tests/e2e/night-core-regression.spec.ts)。 |
| B02 | 哈迪寂亚三目标只保留两人。 | 交互元数据明确目标数 3，并覆盖相应角色别名；新夜序按元数据生成，旧夜序在运行时投影补正确目标数，不改原已存队列。见[元数据](PROJECT_ROOT/src/domain/scripts/nightInteractionInputs.ts)、[兼容旧队列投影](PROJECT_ROOT/src/features/night-workbench/state/gameSessionAdapter.ts)。 | [1、2、3 号顺序全保留，旧 targetCount=2 投影修正且原队列不变](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)。 |
| B03 | 哲学家“不发动”前被迫虚选能力。 | 明确无输入的 hold/skip 可直接选择；该结果清掉旧目标与角色选择，其他结果继续检查必要输入。见[结果就绪判断](PROJECT_ROOT/src/features/night-workbench/state/projectWakeDraft.ts)。 | [无虚构能力/目标及清除旧输入](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)；[390/1440 从无输入到确认](PROJECT_ROOT/tests/e2e/night-core-regression.spec.ts)。 |
| B04 | 先开第 1 天，再开夜晚，标题第 2 夜却生成首夜。 | 夜序、夜型和记录段共用下一阶段序号。先开第 1 天后的夜晚使用第 2 夜及后续夜表，保留独立昼夜入口。见[统一序号](PROJECT_ROOT/src/features/game-session/state/phaseSegments.ts)、[夜序调用](PROJECT_ROOT/src/features/game-session/state/createNextNightRun.ts)。 | [第 1 天→第 2 夜，包含小恶魔且不含洗衣妇](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)。 |
| B05 | 误开新提名后，不能单独取消草稿，只能结束白天。 | 独立“取消本轮”只清 dayVoteDraft，不推进阶段、不伪造票型、不改变先前暂列。见[取消入口](PROJECT_ROOT/src/features/day-workbench/DayWorkbench.tsx)、[草稿命令](PROJECT_ROOT/src/features/game-session/state/daySessionReducer.ts)。 | [取消后日段/暂列保持不变](PROJECT_ROOT/src/features/day-workbench/DayRecovery.test.tsx)；[390/1440 连续流程](PROJECT_ROOT/tests/e2e/day-core-recovery.spec.ts)。 |
| B06 | 已确认配板的恶魔伪装仍可改，确认时静默丢弃。 | 采用原报告允许的最小修复：已确认伪装明确只读，并说明保存在开局记录、本局调整不再修改；未新增开局后编辑伪装功能。见[禁用与说明](PROJECT_ROOT/src/features/setup/SetupPanel.tsx)。 | [已确认三栏全部只读且有说明](PROJECT_ROOT/src/features/identity-deal/IdentityDeal.core-regression.test.tsx)；[390/1440 真实流程](PROJECT_ROOT/tests/e2e/identity-core-recovery.spec.ts)。 |
| B07 | 非默认剧本归档名称全部写成 Catfishing。 | 新归档按 session.scriptId 对应元数据写名称；本地/HTTP/服务端 JSON 读取已知旧归档时修复显示名称，不重写 session 与原日志；未知剧本保留原名。见[新归档名称](PROJECT_ROOT/src/services/archive/archiveService.ts)、[兼容名称](PROJECT_ROOT/src/services/archive/archiveSnapshot.ts)、[服务端读取](PROJECT_ROOT/server/archive/jsonArchiveRepository.ts)。 | [新名称和旧显示元数据修复](PROJECT_ROOT/src/services/archive/archiveService.test.ts)；[390/1440 暗流涌动归档](PROJECT_ROOT/tests/e2e/archive-data-safety.spec.ts)。 |

## 数据兼容与交叉检查

- 当前局、历史记录、已确认配板和既有夜序不会因为本次修复自动重建。后续新夜序采用修正后的夜序表；旧夜序运行时可读取最新状态、修正目标数及限制玩家信息展示，但不批量改写旧事实。旧局已经误记的事实仍由主持人明确更正。
- 备份合同继续为 schemaVersion 1。identityPresentations、voteAdjustment、voided、exceptionReason 都是兼容旧备份的可选字段。结构检查允许附带未知字段，不在导入时裁剪；普通本地加载继续保留兼容字段。备份导入仍只支持已声明的版本与本机含有的剧本，不等同于承诺接受任意未来 schema。
- 夜间运行时 contextKey、seatSnapshots 不写进 NightRun；AI 草稿的 outputSource、建议来源和确认快照仍随备份保留。[正式回归](PROJECT_ROOT/src/features/night-workbench/NightWorkbench.core-regression.test.tsx)同时检查无额外权威状态、采用草稿与确认后记录的备份往返。
- 投票更正、撤销、手动票数修正、特殊处决理由已贯通历史、归档、备份与 HTTP 校验。撤销记录保留供审计，但不参与有效投票摘要、玩家活动汇总或 AI 当前引用。见[摘要回归](PROJECT_ROOT/src/services/archive/archiveService.test.ts)、[复盘依据回归](PROJECT_ROOT/src/services/ai/gameReviewEvidence.test.ts)、[备份回归](PROJECT_ROOT/src/services/session/sessionBackup.test.ts)。
- 归档 HTTP 的旧调用参数仍可用。相同命令只允许相同 session 内容与胜方；不同内容必须新命令。重置接口新增快照校验参数保持可选，真实重置界面始终提供并在提交前复核，不把旧 sessionId 匹配当作已保存证明。
- 损坏原文导出不表示应用可以确认文件已被用户妥善保管，因此还需显式勾选；恢复副本写不下时即使已导出也仍不覆盖主键。需要先释放存储空间再重试。该限制优先保护唯一原文。
- 本次只读交叉检查未发现新的归档/恢复与夜间字段阻塞；这不替代全部角色组合、全部剧本语义或实体手机验收。

## 已明确的产品边界

- 已确认的恶魔伪装只读；本轮没有加入开局后修改伪装的事件模型。
- AI 仍提供候选与草稿。测试使用本地候选、注入 provider 或受控 HTTP 回复，没有调用真实或付费模型；迟到回复的行为不依赖真实供应商响应速度。
- 毒醉、死亡、能力例外、对外身份、胜方和阶段推进仍由说书人确认。手动增减票和特殊处决要求理由，本轮没有实现自动规则引擎。
- 更正历史票型会更新有效记录和暂列，不自动撤销主持人先前已经确认的处决或死亡；后者需要明确的人工作业。
- 既有昼夜独立入口、处决不必导致死亡、死人票资格由主持人控制的边界继续保留。实际 App 按 session.id 重挂载子树的跨局隔离疑点已在原审计中排除，不计为新增修复。


## 仍需人工判断的范围

没有调用或开启真实模型，10 项 live 测试仍跳过；离线与 HTTP 替身回归不能证明真实模型推理正确，也没有穷举所有剧本与角色组合。390/1440px 是 Chromium 视口，不是实体手机验收。

旧夜序不自动重排，已有历史误记需说书人显式更正。毒醉、死亡、能力例外、身份、胜方和阶段推进仍由说书人确认，修复不把应用改成自动规则引擎。当前局继续保存在原浏览器，本次未增加跨设备同步。
