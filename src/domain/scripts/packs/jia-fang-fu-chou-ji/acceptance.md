# 贾方复仇记：来源与共享角色接入

状态：角色、来源、当前夜表、相克和模板资料验收已完成；整批发布状态以实际发布记录为准。

来源：[贾方复仇记-jimothy](https://kkovo550.github.io/clocktower-wiki/script_lib/剧本库.html)，作者 jimothy，原库索引 561。作者未标可确认版本；库标签仅作来源索引，不声称最新作者版。原JSON完整保存在 source.json，字节SHA256为 `50cd959cdbada67d1ad97cdff83223a9d7e43da6e420b61f9793929076e1a042`。当前库JS及官方角色/夜表已于2026-10-21重新核对，与本地缓存同字节。

角色：24个可入袋ID逐个对应当前官方团队和技能，全部复用共享核心资料，无新增角色定义；原始中文技能及旧夜数保留在原文/来源锁。运行时使用明确的当前官方规则适配，当前夜表见 definition.json；不重写已有对局。

配板：7–15人分别3/2/2/3/2/3/2/2/3套，共22套。精确旧模板复用 0 套，私有批次补 22 套，按角色集合去重。人数修正带明确choiceId，亡骨魔先应用其他修正、再最多扣除1外来者，零外来者不额外增镇民。所有模板通过模板结构、人数构成，以及生产createSmartScriptSetupCandidates/evaluateSmartScriptSetup九档验证。本批综合回归另行记录，不把结构合法当成组合平衡性证明。

主持重点：

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。
- Information can be affected by poison/drunk or registration.
- 在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 每个夜晚*，你要选择两名玩家：他们当晚不会死亡，但其中一人会醉酒到下个黄昏。
- AI only drafts reminders; storyteller confirms before changing authority state.
- 每个夜晚*，你会得知有多少名死亡的玩家是邪恶的。
- AI only drafts reminders; storyteller confirms before changing authority state.
- May drunk an existing holder of the selected good role.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 每个夜晚，你要选择一名玩家：如果他明天白天发起提名，他死亡。如果只有三名存活的玩家，你失去此能力。
- Vizier public identity, daytime death immunity and immediate execution all need explicit Storyteller confirmation.
- Pukka poison and delayed death must be tracked manually.
- 亡骨魔减少1外来者并增加1镇民；先应用其他人数修正，再最多移除1名外来者。零外来者时不凭空额外增加镇民。
- 方古在场增加1外来者并减少1镇民；首次成功转变须分别确认新身份和原方古死亡，仅有候选不算成功。
- AI only drafts reminders; storyteller confirms before changing authority state.
- 失忆者保留角色资料供手动主持，但常规模板不选用；能力必须由主持设计和记录，AI不能编造。
- 维齐尔公开身份、白天免死及有善良投票时的强制处决由主持确认，不按普通得票门槛自动裁定；与调查员、侍臣等同场时另核当前官方相克。
- 方古转变须确认新角色及原宿主死亡，仅有候选不消耗首次成功。理发师、舞蛇与哲学家产生的新能力按主持选择的当晚时点处理。

角色改动、阵营、生死、毒醉、额外能力和胜负均需主持分别确认；新增能力当晚处理按现有选择录入。旧已确认角色、模板和会话快照保持。

验证：本地私有批次生成器逐模板templateRoleSelectionValid/validateTemplateComposition、九档实际候选及evaluate守门通过；本批完整测试、浏览器人工点击与真实AI结果由总发布记录统一记录，不能提前宣称整批已上线。原始证据不进入公开源码。

当前官方相克：2026-10-21复核 [jinxes.json](https://release.botc.app/resources/data/jinxes.json)，字节SHA256 `5d3d8d0ac194fb1ea44af79b74f9e4bdc09712aef2123c3a3ef2b6c43efa7df7`。

- `vizier / courtier`：侍臣与维齐尔相克生效时，如果维齐尔失去能力，他会得知此事，并且仍不能在白天死亡；不能用普通失能分支覆盖这条相克。
- `vizier / investigator`：调查员与维齐尔相克：说书人不宣布维齐尔在场，不机械执行维齐尔通常的公开在场声明。
