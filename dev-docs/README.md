# 开发文档索引

本目录是项目设计、边界、计划和验收的真源。开发前先读本索引，再按任务读取对应文档。

- [旧浏览器刷新交接](RELEASE_2026-10-23_LEGACY_EDITOR_HANDOFF.md)：兼容分支同步退出凭据、多标签排他、前台恢复和数据保留验收。

- [iPad 主持准备与返回编辑检查](RELEASE_2026-10-22_IPAD_READINESS.md)：前台立即检查编辑权、平板横竖屏与分屏验收、设备口令及本机对局迁移边界。

- [问答界面精简与公开信息复查](RELEASE_2026-10-22_CHAT_PRIVACY.md)：对话优先、按需选板和查依据、邀请口令说明、公开历史及发布附件复查。

- [两字入口与钟楼搭档问答](RELEASE_2026-10-22_RULES_ADVISOR.md)：状态待办说明、板子与角色问答、人格与依据、隐私和实际验收边界。

- [第七批：特殊开局与三十九个共享角色组合](RELEASE_2026-10-21_BATCH_INTAKE_07.md)：994条引用、915套模板、128条当前相克；历史角色ID仅在导入阶段核对，旧局保持。实际验收见记录与发布回执。

- [第六批：批量复用角色接入十九板](RELEASE_2026-10-21_BATCH_INTAKE_06.md)：478条引用、418套模板、50条相克，2830项回归、204项浏览器与五个真实AI片段通过；Ego八次开局，发布状态以对应回执为准。

- [按完整流程提高接板吞吐量](SCRIPT_INTAKE_THROUGHPUT.md)：全库生成清单、复用角色事实、取消十板上限、按差异验收；27项流程探针及其未上线边界。

- [第五批：批量接板与整批验收](RELEASE_2026-10-21_BATCH_INTAKE_05.md)：新增九板、198套模板，259条引用复用共享角色；同条件工具准备实测约8.56倍，落难少女通知夜序修复及实际测试范围。

- [Clocktower Wiki 第四批：共享角色复用](RELEASE_2026-10-21_WIKI_BATCH_04.md)：新增十板、220 套模板，245 条角色引用全部复用；来源、旧版差异、相克、自制角色复核和本批验收记录。

- [十项主持问题与共享角色库](RELEASE_2026-10-21_SHARED_ROLES.md)：共享技能录入、夜序、投票与复盘修复；角色定义独立化和已有角色板包准备工具，完整验证与发布进行中。

- [人工点击五项问题修复](RELEASE_2026-10-20_HUMAN_CLICK_FIXES.md)：身份交接遮蔽、占卜师正式回答、人数缩放保留输入、夜晚阶段引导和日终返回；完整验证与发布验收进行中。

- [PR 与 main 整合](RELEASE_2026-10-19_MAIN_INTEGRATION.md)：已于北京时间16:07:31上线。最终2,533项回归和228项生产浏览器通过，条件跳过分别11与5项；首次部署自动回滚后，已修复固定API与公开模式的兼容问题并复测。两轮自然巡检、原局完整字节及配置数据保留验收通过。公开历史与两份旧发布附件已清理，平台缓存申请待处理。

- [手机与跨浏览器的编辑保护](RELEASE_2026-10-19_CROSS_BROWSER_EDITOR.md)：已于北京时间13:09:38上线，修复真实返回缓存后丢弃未保存内存的问题；1,537项测试及95项浏览器通过，22项单测条件跳过、4项浏览器因未命中缓存跳过。95项中6项为单列的合成生命周期补测，不扩大真实缓存覆盖。三引擎刷新/前进后退/多页通过，当前原局完整字节保留，实体手机不在证明范围；GitHub已确认通过独立分支和草稿PR交接，main差异单独整合。

- [刷新后编辑保护交接](RELEASE_2026-10-19_REFRESH_EDITOR_LOCK.md)：已于2026-10-19北京时间10:58:21上线。正常刷新快速接手，多标签页仍独占保护，存档与基线绑定同一次读取；1,533项回归、69项生产浏览器及两轮自然巡检通过。实际公网连刷约半秒回到本局，完整原局与服务器数据、API和设备授权保持，旧协议/无原生锁浏览器保留兜底等待。

- [跳转与操作反馈优化](RELEASE_2026-10-19_NAVIGATION_FEEDBACK.md)：已于2026-10-19北京时间10:37:34上线。未配板进入昼夜会在配板页说明原因，不创建记录段或覆盖已选板；加载及取消按来源返回，切板取消重置回到选板。保存、复盘、直接导出和失败重试的反馈已补齐；1,528项回归、57项生产浏览器及两轮自然巡检通过，22项条件跳过，138板保持。原局完整字节、现有数据、API和设备授权保留，本轮未调用付费AI。

- [开局搜索与独立重置](RELEASE_2026-10-19_SEARCH_AND_RESET.md)：已于2026-10-19北京时间10:12:56上线。开局可搜索138板且不改变当前局；保存与重置分开，确认重置后自动留档、保留重置前备份，成功才进入新局并提示。1,512项回归、40项生产构建浏览器测试和14项部署故障演练通过，22项条件跳过；两轮自然巡检、原局完整字节与数据配置保留验收通过。本轮未调用付费AI，部署首次失败及恢复过程保留在记录中。

- [Clocktower Wiki 第三批与当夜换角](RELEASE_2026-10-18_WIKI_BATCH_03.md)：3个新板66套模板、普通换角当夜夜序与痢蛭宿主初始化已部署，现共138板；全套测试、生产浏览器和7个真实AI局部场景通过，原局与数据配置保留，两轮自然巡检验收通过。

- [卡扎力首夜与当夜夜序](RELEASE_2026-10-18_KAZALI.md)：11个旧板的逐组分配、4板24模板、显式应用与木偶假装流程已上线；1,438项回归、10条生产浏览器流程、真实AI及数据保留验收通过，原始失败和复测保留。

- [Clocktower Wiki 第二批接入与人数守门修复](RELEASE_2026-10-16_WIKI_BATCH_02.md)：已上线 135 板、九板版本适配、13 个旧模板修正及真实模型原始失败/复测；最终构建、浏览器和部署状态见记录。
- [Clocktower Wiki 全库候选与首批接入](RELEASE_2026-10-16_WIKI_BATCH_01.md)：来源盘点、规则版本差异、首批 9 板上线与配座/分夜输入修复，含真实模型和部署证据。
- [Clocktower Wiki 候选清单](script-import-candidates/clocktower-wiki-2026-10-16/README.md)：全部 1,267 条记录、版本分组、既有板子对应与待核范围。
- [RELEASE_2026-10-16_FIXED_API_AND_SCRIPT_RULES.md](RELEASE_2026-10-16_FIXED_API_AND_SCRIPT_RULES.md)：本轮固定私有 API、多目标表单、配板/夜序修复与六板真实 AI 复测。
- [AI_SERVER_SECRETS.md](AI_SERVER_SECRETS.md)：Windows 加密配置、首次访问验证、启动与回滚流程。
- [LINK_BATCH_IMPORT_GUIDE.md](LINK_BATCH_IMPORT_GUIDE.md)：通过多个网页链接或在线剧本库分批新增板子。

- [REAL_AI_GAME_SIMULATION_2026-10-16.md](REAL_AI_GAME_SIMULATION_2026-10-16.md)：真实模型 7/10/12/15人四局真实AI建议模拟、核心流程证据、语义问题与未覆盖范围。
- [RELEASE_2026-10-16_AI_FOLLOWUPS.md](RELEASE_2026-10-16_AI_FOLLOWUPS.md)：上述模拟问题修复、真实复测、数据保留及本批发布记录。

当前路线：前端 UI 原型已基本冻结；归档与 runtime mount 已接入；AI 配板推荐和夜间结算推荐使用固定私有模型后端，结果仍为主持草稿。第五批已接入157个智能板包，本批完整回归、生产浏览器、Ego点击和真实AI片段验收通过，发布状态以本批部署回执为准。前三批和第四批的历史证据保留；覆盖范围与原始失败见各次发布记录，不能据此认定所有复杂组合已穷举。现有对局、数据和配置保留；官方魔典同步器、常驻玩家端、数据库/ORM、完整自动规则引擎不在当前范围。

main 的手机 / 平板历史实现见 `MOBILE_PWA_SHAREABLE_PLAN.md` 和 `MOBILE_PWA_SHAREABLE_ACCEPTANCE.md`。本轮只整合 PWA 安装、离线提示与受编辑保护约束的更新，不启用另一套顶层界面。尚未访问过的板子和页面不保证离线可用，真实 AI 与服务器归档仍需联网。

## 产品与边界

- `AUTO_ACCEPTANCE.md`：一条命令执行隔离构建、核心浏览器流程及异常恢复，生成中文验收报告。

- `DEVICE_ACCEPTANCE_START.md`：当前局域网真机测试入口、设备操作步骤和 HTTP 待办兼容性修复。

- `LONG_SESSION_ACCEPTANCE.md`：六昼夜手机/平板触控模拟、刷新与断网恢复、弹窗内保存失败修复和真实设备边界。

- `LOAD_PERFORMANCE.md`：首屏加载基线、按需加载范围、生产构建验收与剩余瓶颈。

- `NIGHT_CLOSE_AND_STATE_FOLLOWUPS.md`：夜晚收尾清单、手动状态待办及验收边界。

- `SESSION_BACKUP_AND_EDITOR_PROTECTION.md`：2026-09-08 新版对局备份导入、恢复前回退副本、多标签编辑保护与当前验收。

1. `PRODUCT_VISION.md`：产品定位和长期方向。
2. `AI_AUTHORITY_BOUNDARY.md`：AI 权限边界，说书人最终确认。
3. `frontend-architecture.md`：前端分层、状态源和页面边界。
4. `ui-design-system.md`：设计 Token、组件规范和触控规则。
5. `data-model.md`：核心数据对象和状态投影。
6. `architecture-guardrails.md`：文件预算、防膨胀和停止条件。
7. `development-plan.md`：阶段计划和当前进度。
8. `acceptance.md`：产品验收标准。
9. `HUMAN_CHANGELOG.md`：给非开发者看的迭代记录。

## 下一阶段设计冻结

10. `SCRIPT_ARCHITECTURE_PLAN.md`：多板子与智能板子包架构。
11. `SCRIPT_ROLE_ACCEPTANCE_CHECKLIST.md`：新增板子和角色验收清单。
12. `RULE_RESEARCH_PROTOCOL.md`：新增板子前的规则调研协议。
13. `OPENING_FLOW_PLAN.md`：7-15 人开局、昵称/经验复用、身份交接和重置引导。
14. `ABILITY_SETTLEMENT_BOUNDARY.md`：手动记录 + AI/规则建议的技能结算边界。
15. `AI_INTEGRATION_PLAN.md`：真实 AI、后端代理、上下文最小化和文案润色边界。
16. `AI_PROVIDER_INTEGRATION_DESIGN.md`：10.9 真实 AI provider 前置设计，实际调用仍需用户确认。
17. `AI_PROVIDER_IMPLEMENTATION_PLAN.md`：10.9 真实 AI provider 的分阶段实现计划，live 调用仍单独阻塞。
18. `AI_SETUP_ADVICE_10_10_CLOSURE_AUDIT.md`：10.10 AI 配板建议安全接线与收口审计。
19. `AI_NIGHT_SETTLEMENT_10_11_CLOSURE_AUDIT.md`：10.11 夜间结算 AI 推荐安全接线与收口审计。
20. `AI_RECOMMENDATION_UX_12_16_CLOSURE_AUDIT.md`：12.16 AI 推荐体验第一轮优化收口审计。
22. `AI_RECOMMENDATION_UX_12_17_CLOSURE_AUDIT.md`：12.17 AI 推荐缺项反馈深化收口审计。
23. `AI_RECOMMENDATION_UX_12_19_CLOSURE_AUDIT.md`：12.19 AI 推荐追问与补齐提示收口审计。
24. `SCRIPT_IMPORT_BATCH_01_PLAN.md`：第一批 10 个智能板子导入计划、顺序、验收和停止条件。
25. `SCRIPT_IMPORT_TPI_RECOMMENDED_SOURCES.md`：12.5 TPI Recommended 四板来源、hash、角色清单和导入风险。
26. `SCRIPT_IMPORT_CAROUSEL_SOURCES.md`：12.11 Carousel 三板来源、hash、角色清单和导入风险。
27. `SMART_SCRIPT_FULL_REVIEW_PLAN.md`：当前所有智能板子的全面复核计划、质量门和验收。
28. `SCRIPT_IMPORT_BATCH_01_CLOSURE_AUDIT.md`：第一批 10 板总验收、问题修正和测试证据。
29. `SCRIPT_IMPORT_BATCH_02_PLAN.md`：第二批智能板子导入计划，当前已接入 Everyone Can Play、Uncertain Death、Church of Spies 和 Insanity and Intuition。
30. `SCRIPT_IMPORT_BATCH_02_SOURCES.md`：第二批来源锁定记录，已锁定并导入 Uncertain Death、Church of Spies 和 Insanity and Intuition。
31. `LIVE_HOSTING_FLOW_12_18_CLOSURE_AUDIT.md`：12.18 完整现场主持流程浏览器实测。
32. `COMPLEX_ROLE_RESEARCH_PLAN.md`：复杂角色共享调研计划、优先级和逐角色模板。
33. `role-research/`：复杂角色逐个调研记录目录。
34. `COMPLEX_ROLE_KNOWLEDGE_12_25_CLOSURE_AUDIT.md`：40 个复杂角色结构化摘要接入收口审计。
35. `COMPLEX_ROLE_KNOWLEDGE_12_26_CLOSURE_AUDIT.md`：剩余高风险角色结构化摘要补强收口审计。
36. `SMART_SCRIPT_ROLE_RESEARCH_RECHECK_13_4.md`：已导入智能板子的 AI 角色调研复核、乱码修正和质量门加固。
37. `script-import-work/batch-03/`：官方魔典 132 条可搜索剧本的来源锁定、导入队列、角色复用清点和规则风险清点。
38. `SMOKE_HOSTING_SCENARIOS.md`：替代真实局硬门槛的模拟主持流程验收、AI 质量回归和 VPS 稳定性验证。
39. `AI_NIGHT_QUALITY_REGRESSION.md`：夜间 AI 复杂角色质量回归标准，规定导入新智能板子时哪些角色必须补回归。
40. `PUBLIC_RELEASE_BOUNDARY.md`：公开仓库、素材包、AI Key 和发布措辞边界。
41. `GITHUB_RELEASE_CHECKLIST.md`：GitHub alpha / preview 发布前检查清单。
42. `PUBLIC_RELEASE_FINAL_AUDIT.md`：公开发布前最终审计记录、命令结果和剩余人工决策。
43. `PROJECT_CRITIQUE_AUDIT.md`：当前项目完整度、正式版短板、P0/P1/P2 挑刺审查。

## 后端 P0 与 runtime

19. `API_CONTRACT.md`：前后端命令合同、错误码和幂等边界。
20. `frontend-backend-contract.md`：前端/后端职责分工，存在旧命名时以 `API_CONTRACT.md` 为准。
21. `BACKEND_P0_FINAL.md`：后端 P0 冻结范围。
22. `BACKEND_IMPLEMENTATION_PLAN.md`：后端最小闭环实现计划。
23. `BACKEND_P0_CLOSURE_AUDIT.md`：后端 P0 收口审计。
24. `RUNTIME_MOUNT_PLAN.md`：runtime mount 设计。
25. `RUNTIME_MOUNT_CLOSURE_AUDIT.md`：runtime mount 收口审计。
26. `UI_HTTP_ADAPTER_DECISION.md`：UI 是否接 HTTP adapter 的决策记录。
27. `VPS_DEPLOYMENT_PREP.md`：VPS 部署准备和 V2.5 共存边界。
28. `SELF_HOSTING_RUNBOOK.md`：本机/VPS 自托管运行手册，覆盖打包、同步、启动、健康检查、备份、AI 环境变量和回滚。

## 无人推进文档

28. `UNATTENDED_EXECUTION_GUARDRAILS.md`：无人推进通用边界、停止条件和防跑偏规则。
29. `UNATTENDED_TASK_INDEX.md`：无人推进任务索引；所有无人推进从这里读取下一项。
30. `UNATTENDED_MASS_SCRIPT_IMPORT_PLAN.md`：批量智能板子从导入到可用的无人推进总计划。
31. `UNATTENDED_SMART_SCRIPT_AI_PROJECT.md`：多板子、7-15 人和 AI 合同的无人推进项目定义。
32. `UNATTENDED_SMART_SCRIPT_AI_RUNBOOK.md`：阶段 10.1-10.8 的执行细则。
33. `UNATTENDED_24H_BACKEND_RUNBOOK.md`：后端 P0 归档闭环历史 runbook。
34. `UNATTENDED_BACKEND_4_RUN_PLAN.md`：后端四轮无人推进历史计划。
35. `UNATTENDED_BACKEND_IMPLEMENTATION_PLAN.md`：后端无人实现历史计划。

## 外部审查资料

36. `CLAUDE_BACKEND_P0_REVIEW_PROMPT.md`：后端 P0 外部审查提示词。
37. `CLAUDE_BACKEND_P0_CLOSURE_REVIEW_PROMPT.md`：后端 P0 收口审查提示词。
38. `CLAUDE_RUNTIME_MOUNT_REVIEW_PROMPT.md`：runtime mount 外部审查提示词。
39. `EXTERNAL_MODEL_REVIEW_PACKET.md`：前端/后端交接审查包。
40. `EXTERNAL_REVIEW_RESPONSE_2026-07-17.md`、`EXTERNAL_REVIEW_RESPONSE_2026-07-17_YELLOW.md`：外部审查反馈记录。
41. `AI_PROVIDER_10_9_CLOSURE_AUDIT.md`：AI Provider 10.9 收口审计。
42. `CLAUDE_AI_PROVIDER_10_9_REVIEW_PROMPT.md`：AI Provider 10.9 外部审查提示词。

## 当前开发提醒

- 新增板子前先走 `RULE_RESEARCH_PROTOCOL.md`，再填 `SCRIPT_ROLE_ACCEPTANCE_CHECKLIST.md`。
- 批量导入板子时先读 `UNATTENDED_MASS_SCRIPT_IMPORT_PLAN.md`，再按批次计划逐个闭环；当前已完成 12.1-12.15，第一批 10 板已收口；12.18 已完成完整现场主持流程实测。
- 能进入开局列表的必须是智能板子包，不是任意 JSON。
- AI 输出只能是候选、草稿、提醒或润色；权威状态必须由说书人确认。
- 复杂角色先写入 `role-research/` 调研记录，再提炼成结构化摘要；当前 71 个复杂/高风险角色摘要已接入配板 AI / 夜间 AI 上下文，但仍不能在页面里写角色 ID 专属自动结算分支。
- 夜间 AI 建议质量按 `AI_NIGHT_QUALITY_REGRESSION.md` 加回归；涉及死亡、身份、阵营、毒醉、疯狂、延迟结算或胜负的角色，不能只靠模型自由发挥。
- 无人推进只做 `UNATTENDED_TASK_INDEX.md` 中第一个 `Ready` 任务；完成后再自动读下一项。
- 官方魔典 132 条已经锁定为目标池，但不能一次性全注册；必须按 `script-import-work/batch-03/IMPORT_QUEUE_132.md` 逐板闭环导入。
- 新功能不得新增第二套玩家状态源、第二套夜序、巨型 store、角色 ID if/else 规则引擎。
- UI 改动后运行 `npm run check`，并把用户可见变化写入 `HUMAN_CHANGELOG.md`。


- PORTABLE_PACKAGE_PLAN.md：GitHub 用户的一键启动包、AI 首次配置和打包边界。
