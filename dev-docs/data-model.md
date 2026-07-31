# 原型数据模型

## 状态说明

当前前端原型只持有夜间 `NightRun`、草稿、确认记录与角色变更的本地样例状态。以下“统一对局合同”是白天、常驻面板和 AI 配板接入前必须实现的目标模型；它不表示后端、真实 AI、官方魔典同步或玩家端已经存在。

规则知识、当局状态、AI 回答和本机展示草稿保持不同对象/存储边界。`TimelineEntry` 只做时间线索引，不能把所有业务详情塞进一张泛用表。

## ScriptDefinition 与 ScriptKnowledgePack（后续导入合同）

导入剧本 JSON 与“能够智能配板”不是同一个事实，但**对说书人而言必须作为一次可用性交付完成**：主界面不列出“只导入了角色文本、却不能开局”的半成品剧本。

### ScriptDefinition

- `scriptId + name + author + source + version + contentHash`
- `roles[]`：稳定 `roleId`、阵营、名称、技能文本、首夜/其他夜顺序、图标引用
- `rawImport`：原始 JSON 的可追溯副本；不能作为 AI 或规则引擎的唯一知识来源

### ScriptKnowledgePack

- `scriptId + scriptContentHash + catalogVersion + rulePackVersion`
- `roleFacts`：开局人数修正、恶魔伪装范围、夜序适用性与复杂度标签
- `conflicts / jinxes / manualChecks`：每条都有来源、严重级别与人类可读说明
- `setupPolicy`：基础人数、允许的修正选项和确认前阻断条件
- `coverage`：`setup | nightOrder | roleFacts | interactions` 的核对状态

导入向导可在后台先保存“待核对草稿”，但只有 `ScriptDefinition.contentHash === ScriptKnowledgePack.scriptContentHash` 且四项 `coverage` 均为 `ready` 时，剧本才能进入“可开局/可智能配板”列表。角色列表、技能文本或关键顺序变更后必须重新核对；不能继续沿用旧知识包悄悄给出智能建议。若四项 coverage 已完整、但剧本来源或社区版本仍标记为 `needs-review`，可以进入列表并正常开局；此时 AI 建议必须明确“需人工核对”，不能显示为已核验。

多数社区剧本复用已知 `roleId` 时，可自动关联本地已核对的角色事实；未知或自定义角色必须补充规则事实并由说书人确认。AI 未来只能把能力文本与来源整理成知识包草稿，不能仅凭文本猜出 Jinx、冲突或开局人数修正后就标为“已理解”。

图标通过独立 `roleId → assetRef` 目录解析，记录来源、版本与可选内容哈希。未知角色可先显示阵营通用 Token，但图标缺失不能伪造为角色知识完整。

## GameSession（计划）

- `id`
- `scriptId + scriptVersion + source + contentHash`
- `playerCount`
- `status`: `setup | in_progress | ended`
- `confirmedSetupId`
- `createdAt + startedAt + endedAt`
- `declaredWinner`: `good | evil | null`，只能由说书人显式声明

`GameSession` 不依据角色 ID 自动推进昼夜、结算技能或判定胜负。

## PlayerSeat 与 PlayerState

### PlayerSeat

- `id`：稳定座位 ID，不使用中文名作主键
- `seatNumber`
- `nickname`：仅供说书人现场辨认；默认展示为 `座位号 · 昵称`，不是账号、联机身份或权限凭据
- `experience`: `new | mixed | experienced | unknown`
- `roleId`：来自已确认配板及其追加式差异投影

### PlayerState

- `seatId`
- `life`: `alive | dead`
- `poisoned` / `drunk`：独立布尔状态，由追加式状态事件投影
- `markers`: 稳定 ID 与可见名称组成的人工标记列表
- `revision + updatedAt`

`PlayerState` 是唯一的当前人工确认状态投影。毒、醉、死亡和标记不会自动推导技能结果、夜序适用性或胜负。首页状态板的确认通过专用 reducer 命令追加 `player_state_changed`，可选择归入开放昼夜段；默认记作 `segmentId: null` 的“本局状态”，不会因为点状态板自动建立昼夜段。投票完成本身不得改变 `life`。

## PhaseSegment（计划）

- `id`
- `gameSessionId`
- `kind`: `night | day`
- `sequence`: 此类记录段的编号，从 `1` 开始
- `label`: `第{sequence}夜 | 第{sequence}天`
- `status`: `open | closed`
- `openedAt + closedAt?`
- `openedByEntryId? + closedByEntryId?`

创建规则：

- 打开、浏览、预览、查询 AI 不创建 `PhaseSegment`。
- 每个 `kind` 同时最多一个 `open` 段；`night` 与 `day` 的开放段允许并存。
- 某类首次权威保存与新段创建在同一事务/命令内完成；同类开放段存在时必须复用。
- 只有显式“结束本夜/结束今天”能关闭对应段。关闭后下一次同类权威保存才创建新编号。
- 更正和补记始终引用既有 `segmentId`，不创建新段，也不重编号。

## TimelineEntry（计划，追加式索引）

- `id`
- `gameSessionId + segmentId`
- `kind`: `skill | information | public_event | nomination | vote_round | standing_execution | day_resolution | player_state_change | role_change | setup_change | correction | note`
- `entityType + entityId`：指向对应的强类型对象
- `occurredAt + recordedAt`
- `correctionOf?`
- `correctionReason?`：新建的日记更正必须填写；旧版本地记录缺失时只显示为“历史记录未填写原因”。
- `recordedBy: storyteller`

`TimelineEntry` 只保存可排序、可分组和可追溯的元数据，详情放回 `ConfirmedWakeRecord`、`VoteRound`、`RoleChangeEvent`、`AIAdvice` 等对象。常驻面板和本局记录都从此索引及强类型事实生成只读投影。

更正链只允许线性追加：`原记录 → 更正1 → 更正2`。不能从已更正的旧版本分叉；审计日记保留所有版本，而“最近记录”、玩家相关记录和暂列票型只消费每条链最后一版。当前日记只开放夜间行动与白天行动的微调，投票、状态、日终和身份调整仍必须走专用工作台，避免一条文本更正暗中改变当前局面。

### DayActionEntry（当前原型）

- `category`: `skill | public_event`
- `actorSeatId`: 白天技能发动者；公开事件为 `null`
- `targetSeatIds`: 技能目标或公开事件涉及座位，可为空或多选
- `summary + details`: 说书人可见的简短记录和可选补充
- `skillContext?`：仅技能记录使用；在确认时冻结 `abilityRole`、发动者实际身份、可选公开声称、每名目标的实际身份与结构化结果（`no_effect | applied | custom`）。

日记回放必须读取 `skillContext` 的角色快照，不能按当前身份反推旧行动；后续换角不会改写“当时实际身份”。旧记录没有快照时明确显示“当时身份与结果未记录（旧记录）”，不会伪装成新格式。白天记录不会直接写入生死、中毒、醉酒或角色变化；这些仍由各自的显式确认命令追加。座位活动筛选只读取 `actorSeatId + targetSeatIds`，不从自由文本反解析号码。

## AI 配板（计划）

### SetupCandidate

- `id + gameSessionId`
- `source`: `prototype | ai`
- `scriptId + playerCount`
- `seatAssignments`: `seatId + roleId`
- `playerExperienceSnapshot`
- `style`: 例如 `balanced | participation | reversal`
- `rationale[] + risks[] + pacing`
- `legalityChecks[]`
- `generatedAt + knowledgeVersion?`

每次生成给出 3 套候选。候选先满足人数/阵营与相关开局效果的合法性，再按玩家经验、双方发挥空间和预计节奏排序；差异度只是轻量约束。不维护历史配板黑名单，相同组合可再次出现。

候选必须引用 `ScriptKnowledgePack` 的版本、内容哈希和已显式选择的开局修正；人数修正、冲突和恶魔伪装合法性由纯规则函数复核。AI 的伪装理由、节奏判断和玩家适配属于可修改草稿，不能和规则事实混存。

### SetupDraft

- `id + baseCandidateId?`
- `seatAssignments`
- `manualChanges[]`: 换角色、换座位、锁定、排除等
- `revision + updatedAt`

开局前，`SetupDraft` 可反复调整。它不会自动发送身份，也不会创建夜序或改变 `PlayerState`。

### ConfirmedSetup 与 SetupChangeEvent

- `ConfirmedSetup`: `id + gameSessionId + sourceDraftId + seatAssignments + confirmedAt + confirmedBy`
- `SetupChangeEvent`: `id + gameSessionId + changes[] + reason + effectiveFrom + confirmedAt + confirmedBy`

开始对局后，继续微调只能产生已确认的 `SetupChangeEvent`。差异从 `effectiveFrom` 向后投影，不能回写此前 `TimelineEntry`、不能改写当前夜间 `NightRun.queue` 快照，也不能静默替换原 `ConfirmedSetup`。

### SetupChangedEntry（角色调整）

- `originNightRunId`: 夜间工作台内确认的角色变更记录所属的 `NightRun`；配板面板的后续微调为 `null`。
- 夜间“本局记录”只投影 `originNightRunId` 与当前夜一致的角色变更，避免旧夜换角显示在下一夜。
- 此字段不改变角色调整对后续工作台快照的影响；它只定义记录归属。旧 v1 本地快照若没有该字段，会归一化为 `null`，不猜测属于哪一夜。

## NightRun（当前原型）

- `id`
- `scriptId`
- `label`
- `nightType`: `first | other`
- `playerCount`
- `activeCursorId`
- `revision`
- `knowledgeVersion`
- `phaseSegmentId`: 新夜草稿为 `null`；首次确认后绑定对应夜间记录段

当前 Catfishing 12 人样例在“结束本夜”后保留已关闭的旧 `NightRun`；从首页再次进入夜晚时，才按当前已确认身份快照建立新的“其他夜”样例队列。新运行态没有 `PhaseSegment`，首次确认才创建新夜编号。它不自动从技能结果推导角色、状态或唤醒结论。

## WakeItem

- `id`
- `seatId`
- `roleIdAtQueueCreation`
- `orderIndex`
- `applicability`: `applicable | needs_review | not_applicable`
- `progress`: `pending | draft | confirmed | deferred | skipped`
- `reason`
- `targetKind`: `player_choice | storyteller_info`
- `roleChoices`：使用稳定英文 ID，不以中文名作为键
- `interactionVersion`
- `outcomeOptions`：声明式结果模板；只能生成草稿，不能修改权威状态

## WakeDraft

- `targets`
- `roleChoice`
- `outcomeId`
- `playerChoice`
- `storytellerResult`
- `informationGiven`
- `outputSource`: `templateId + specVersion`
- `draftRevision`
- `updatedAt`

目标或角色改变时会清空 `outcomeId`、生成结果和信息，避免保存与当前选择不一致的旧草稿。`outputSource.kind` 区分 `preset | ai`；人工覆盖后通过 `modifiedFromAI` 保留来源链。

## ConfirmedWakeRecord（当前原型，后续接入时间线）

- `id`
- `wakeItemId`
- `revision`
- `confirmedAt`
- `snapshot`
- `correctionOf`：更正时指向上一条确认记录
- `segmentId?`：阶段 4 接入后必填

确认后草稿会生成不可变快照；再次修改只能追加更正记录。`draftRevision` 记录草稿点击次数；`ConfirmedWakeRecord.revision` 只在该夜序项真正保存时递增，二者不能混用。

## RoleChangeEvent（当前原则，目标合同扩展）

- `id + seatId + revision`
- `segmentId? + nightRunId? + phaseLabel?`
- `fromRole + toRole`
- `reason`: `gameplay | setup_adjustment | entry_correction | other`
- `effectiveFrom`
- `changedAt`
- `confirmedBy: storyteller`

更换角色是独立于技能确认的危险动作。打开角色选择或点击角色只改变草稿；只有明确确认才追加事件。当前 Token 可通过队列与变更事件投影最新角色，但本夜仍按队列创建时的角色快照执行；新角色不会自动插入夜序，也不会删除旧角色夜序。

## VoteRound、StandingExecution 与日终决议（计划）

### VoteRound

- `id + gameSessionId + segmentId`
- `roundNumber`
- `nominatorSeatId + nomineeSeatId`
- `threshold`
- `votes[]`: `seatId + raised + voteKind(normal | ghost) + recordedBy`
- `voteCount`
- `completedAt`

完成本轮计票后，`VoteRound` 是不可变记录；正在举手的临时草稿被清空。死亡票只做说书人确认的票型记录，不在前端自动判定资格或消耗次数。

当前原型把未确认的本轮选择保存为 `GameSession.dayVoteDraft`：包含所属白天段、提名双方、门槛、举手座位和死亡票座位。它是可恢复的界面草稿，不是 `TimelineEntry`，返回首页、刷新或重新进入白天都必须保留；只有“完成本轮计票”才写入 `VoteRound`。结束今天遇到非空草稿时必须显式选择“继续记录”或“清空并结束”，后者只删除未确认草稿，不生成票型、不处决、不进入夜晚。

`GameSession.dayActionDraft` 单独保存未确认的白天技能/公开事件表单：技能包含发动者、声称、目标和结果；公开事件包含涉及座位与文案。它与 `dayVoteDraft` 都能在关闭 Sheet、返回首页或刷新后恢复，但不属于权威时间线。只有“记录技能/记录事件”成功追加 `day_action` 后才清空对应类别；另一类别已经填写的草稿必须保留。“清空草稿”或明确“清空并结束”才清除全部未确认输入，且不写入记录或改变玩家状态。

### StandingExecution（只读投影）

- `daySegmentId`
- `status`: `leading | replaced | tied | below_threshold | none`
- `candidateSeatId?`
- `voteCount? + threshold?`
- `sourceVoteRoundIds[]`

它只表示当前日的暂列结果。平票、未达门槛、覆盖和最高票都不能直接写入玩家死亡状态。

### DayResolutionEvent 与 PlayerStateChange

- `DayResolutionEvent`: `daySegmentId + outcome(execute | no_execution) + executedSeatId? + confirmedAt + confirmedBy`
- `PlayerStateChange`: `seatId + before + after + sourceResolutionId + recordedAt`

只有说书人确认 `execute` 才可追加对应座位的死亡状态变化；确认 `no_execution` 只记录日终结果。两者均不自动进入夜晚。

## AIAdvice（当前夜间原型，后续扩展）

- `id`
- `kind`: `result | rules | setup | balance`
- `contextRevision + knowledgeVersion`
- `sourceDraftRevision?`
- `status + missing + facts + confidence`
- `recommendedOutcomeId?`
- `recommendations[] + assumptions[] + questionsForStoryteller[]`

AI 建议与对局权威状态分开保存。当前“使用 AI 建议”只把声明式结果候选写入 `WakeDraft`；后续“AI 配板”同样只创建 `SetupCandidate`，不能直接确认配板、改变玩家状态或发送信息。

## UIState

- `previewEntryId`
- `openPanel`: `night-order | game-record | role-change | null`（当前；后续按功能扩展）
- `privacyShielded`
- `dimmed`
- `discussionTimer`：按 `sessionId` 保存在本机的私聊/公聊剩余时间、阶段和时长；它不是 `GameSession` 字段，不生成记录段或时间线条目。
- `openingScript`：按 `sessionId` 保存在本机的说书人开场文案；它不是玩家消息，也不属于对局日志。

纯 UI 状态不影响 `PhaseSegment`、`TimelineEntry`、玩家状态、配板或投票结果。遮蔽模式下敏感记录不得渲染到可访问 DOM。

## OfficialNightOrderReference

- 数据来自本地版本化 `nightsheet.json + role-index.json`。
- 只包含顺序、角色英文名与稳定 ID，不包含座位、当局身份、处理进度或草稿。
- 当前其他夜官方参考共 99 项；它不是第二份本局权威队列。
