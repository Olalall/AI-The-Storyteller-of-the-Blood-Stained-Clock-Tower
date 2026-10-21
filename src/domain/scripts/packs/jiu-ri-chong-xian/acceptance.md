# 旧日重现：来源与共享角色接入

状态：角色、来源、当前夜表、相克和模板资料验收已完成；整批发布状态以实际发布记录为准。

来源：[旧日重现](https://kkovo550.github.io/clocktower-wiki/script_lib/剧本库.html)，作者 叮当，原库索引 377。作者未标可确认版本；库标签仅作来源索引，不声称最新作者版。原JSON完整保存在 source.json，字节SHA256为 `ea5d369b9f65e22dfab3cb52e4892280a8fed6c9e9d835e0d4e7be5fde23726b`。当前库JS及官方角色/夜表已于2026-10-21重新核对，与本地缓存同字节。

角色：25个可入袋ID逐个对应当前官方团队和技能，全部复用共享核心资料，无新增角色定义。原文仅列稳定ID，未提供姓名、团队、能力文本或夜数；当前技能与夜序来自已核官方资料和共享库，来源锁如实保留这些缺省。运行时使用明确的当前官方规则适配，当前夜表见 definition.json；不重写已有对局。

配板：7–15人分别3/2/2/3/2/3/2/2/3套，共22套。精确旧模板复用 0 套，私有批次补 22 套，按角色集合去重。人数修正带明确choiceId，亡骨魔先应用其他修正、再最多扣除1外来者，零外来者不额外增镇民。所有模板通过模板结构、人数构成，以及生产createSmartScriptSetupCandidates/evaluateSmartScriptSetup九档验证。本批综合回归另行记录，不把结构合法当成组合平衡性证明。

主持重点：

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。
- 在你的首个夜晚，你会得知场上邻座的邪恶玩家有多少对。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 按当前官方版，气球驾驶员可选择增加0或1外来者；每夜信息与上一夜角色类型比较，不使用旧四类型版本。
- 每个夜晚，你要选择除你以外的两名存活的玩家：你会得知他们中有几人在当晚因其自身能力而被唤醒。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- Nomination history and registration are checked by ST.
- AI only drafts reminders; storyteller confirms before changing authority state.
- May drunk an existing holder of the selected good role.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 你拥有上个死于处决的玩家的能力。如果该玩家属于邪恶阵营，你中毒直到下个善良玩家死于处决。
- AI only drafts reminders; storyteller confirms before changing authority state.
- Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI may suggest this result, but ST confirms authority state before saving changes.
- 每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。
- Ojo kills a chosen role, or storyteller chooses the death if absent; target and death are manual.
- 亡骨魔减少1外来者并增加1镇民；先应用其他人数修正，再最多移除1名外来者。零外来者时不凭空额外增加镇民。
- 食人族及哲学家借用能力、麻脸创造新角色、舞蛇交换都保留主持单独确认；新能力是否当晚发动必须选时点。镜像双子的当前阵营和胜负阻碍分别核对。

角色改动、阵营、生死、毒醉、额外能力和胜负均需主持分别确认；新增能力当晚处理按现有选择录入。旧已确认角色、模板和会话快照保持。

验证：本地私有批次生成器逐模板templateRoleSelectionValid/validateTemplateComposition、九档实际候选及evaluate守门通过；本批完整测试、浏览器人工点击与真实AI结果由总发布记录统一记录，不能提前宣称整批已上线。原始证据不进入公开源码。

2026-10-21复核当前官方相克表，本板角色交集没有适用的官方相克条目；普通技能组合仍按角色资料由主持核对，不将其冒称官方相克。
