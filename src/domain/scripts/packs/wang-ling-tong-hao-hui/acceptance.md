# 亡灵同好会：来源与共享角色接入

状态：角色、来源、当前夜表、相克和模板资料验收已完成；整批发布状态以实际发布记录为准。

来源：[亡灵同好会](https://kkovo550.github.io/clocktower-wiki/script_lib/剧本库.html)，作者 Natlove，原库索引 901。作者未标可确认版本；库标签仅作来源索引，不声称最新作者版。原JSON完整保存在 source.json，字节SHA256为 `6ba5cfe963c606e56e5e567b26ca2ed3a3837d429017f55d190889173589d517`。当前库JS及官方角色/夜表已于2026-10-21重新核对，与本地缓存同字节。

角色：23个可入袋ID逐个对应当前官方团队和技能，全部复用共享核心资料，无新增角色定义；原始中文技能及旧夜数保留在原文/来源锁。运行时使用明确的当前官方规则适配，当前夜表见 definition.json；不重写已有对局。

配板：7–15人分别3/2/2/3/2/3/2/2/3套，共22套。精确旧模板复用 0 套，私有批次补 22 套，按角色集合去重。人数修正带明确choiceId，亡骨魔先应用其他修正、再最多扣除1外来者，零外来者不额外增镇民。所有模板通过模板结构、人数构成，以及生产createSmartScriptSetupCandidates/evaluateSmartScriptSetup九档验证。本批综合回归另行记录，不把结构合法当成组合平衡性证明。

主持重点：

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。
- Information can be affected by poison/drunk or registration.
- 在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 按当前官方版，气球驾驶员可选择增加0或1外来者；每夜信息与上一夜角色类型比较，不使用旧四类型版本。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 每个夜晚*，你会得知有多少名死亡的玩家是邪恶的。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 每个夜晚，你能查看魔典。你可能会被当作善良阵营、镇民角色或外来者角色，即使你已死亡。
- 男爵在场增加2外来者并减少2镇民，与其他已确认人数修正叠加。
- 每个夜晚，你要选择一名玩家：如果他明天白天发起提名，他死亡。如果只有三名存活的玩家，你失去此能力。
- AI only drafts reminders; storyteller confirms before changing authority state.
- 亡骨魔减少1外来者并增加1镇民；先应用其他人数修正，再最多移除1名外来者。零外来者时不凭空额外增加镇民。
- 农夫死亡后的身份继承、理发师换角与亡骨魔保留爪牙能力分别记录；新角色是否当晚发动由主持指定。气球驾驶员按相邻两夜角色类型及+0/+1外来者版本。

角色改动、阵营、生死、毒醉、额外能力和胜负均需主持分别确认；新增能力当晚处理按现有选择录入。旧已确认角色、模板和会话快照保持。

验证：本地私有批次生成器逐模板templateRoleSelectionValid/validateTemplateComposition、九档实际候选及evaluate守门通过；本批完整测试、浏览器人工点击与真实AI结果由总发布记录统一记录，不能提前宣称整批已上线。原始证据不进入公开源码。

2026-10-21复核当前官方相克表，本板角色交集没有适用的官方相克条目；普通技能组合仍按角色资料由主持核对，不将其冒称官方相克。
