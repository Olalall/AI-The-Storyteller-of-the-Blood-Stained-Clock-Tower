# 不蛭之症：来源与共享角色接入

状态：角色、来源、当前夜表、相克和模板资料验收已完成；整批发布状态以实际发布记录为准。

来源：[不蛭之症](https://kkovo550.github.io/clocktower-wiki/script_lib/剧本库.html)，作者 Flyingludicolo，原库索引 900。作者未标可确认版本；库标签仅作来源索引，不声称最新作者版。原JSON完整保存在 source.json，字节SHA256为 `1ef5e50f76db692f5825673f9a2221af1e41e49b74bf8f7fca6b043b78faa7e6`。当前库JS及官方角色/夜表已于2026-10-21重新核对，与本地缓存同字节。

角色：23个可入袋ID逐个对应当前官方团队和技能，全部复用共享核心资料，无新增角色定义；原始中文技能及旧夜数保留在原文/来源锁。运行时使用明确的当前官方规则适配，当前夜表见 definition.json；不重写已有对局。

配板：7–15人分别3/2/2/3/2/3/2/2/3套，共22套。精确旧模板复用 0 套，私有批次补 22 套，按角色集合去重。人数修正带明确choiceId，按已确认人数修正规则核对。所有模板通过模板结构、人数构成，以及生产createSmartScriptSetupCandidates/evaluateSmartScriptSetup九档验证。本批综合回归另行记录，不把结构合法当成组合平衡性证明。

主持重点：

- 仅生成主持候选；身份、阵营、生死、毒醉、投票和胜负由说书人确认。角色变化、额外能力与死亡触发按本局事实另行记录。
- Information can be affected by poison/drunk or registration.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- Nomination history and registration are checked by ST.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 每局游戏限一次，在夜晚时，你可以选择除你以外的两名玩家：你会得知他们是否为同一阵营。
- May drunk an existing holder of the selected good role.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- Protection impact is ST-confirmed.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- 一名玩家醉酒，即使你已死亡。每局游戏限一次，你可以猜测谁是那个醉酒的玩家，如果猜对了，你会得知谁是恶魔，但如果猜错了，你会得知错误的“谁是恶魔”信息。
- 男爵在场增加2外来者并减少2镇民，与其他已确认人数修正叠加。
- 每个夜晚，你能查看魔典。你可能会被当作善良阵营、镇民角色或外来者角色，即使你已死亡。
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI only drafts reminders; storyteller confirms before changing authority state.
- AI may suggest this result, but ST confirms authority state before saving changes.
- 首夜先确认痢蛭存活宿主与中毒，后夜攻击另录。宿主、痢蛭毒醉及死亡关系由主持核对；麻脸或舞蛇产生新痢蛭时单独处理初始化，不补第二刀。
- 和平主义者可能防止处决死亡，圣徒和送葬者按实际处决死亡核对，不能只凭处决标记宣告胜负或信息。

角色改动、阵营、生死、毒醉、额外能力和胜负均需主持分别确认；新增能力当晚处理按现有选择录入。旧已确认角色、模板和会话快照保持。

验证：本地私有批次生成器逐模板templateRoleSelectionValid/validateTemplateComposition、九档实际候选及evaluate守门通过；本批完整测试、浏览器人工点击与真实AI结果由总发布记录统一记录，不能提前宣称整批已上线。原始证据不进入公开源码。

2026-10-21复核当前官方相克表，本板角色交集没有适用的官方相克条目；普通技能组合仍按角色资料由主持核对，不将其冒称官方相克。
