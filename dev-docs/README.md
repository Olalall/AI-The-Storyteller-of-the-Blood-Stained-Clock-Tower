# 开发文档索引

本目录是项目设计、边界、计划和验收的真源。开发前先读本索引，再按任务读取对应文档。

当前路线：前端 UI 原型已基本冻结；后端 P0 归档与 runtime mount 已完成到本地可验证阶段；AI 配板推荐和夜间结算推荐已完成草稿安全接线；117 个已注册智能板子均已通过结构质量门、来源核对和全量浏览器开局流程；本地夜间 AI 质量回归已通过，下一步进入真实模型 live 质量抽查与 VPS 稳定性验证。官方魔典同步器、常驻玩家端、数据库/ORM、完整自动规则引擎不在当前范围。

## 产品与边界

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
