## 2026-07-27 - GitHub 首屏横幅与功能一览

### 给非开发者看的交付说明
- 新增原创 GitHub 横幅 `github-hero.svg`，放在 README 首屏，让项目首页更像一个完整产品，而不是纯文档仓库。
- 横幅不使用官方角色图标或社区素材，只使用原创抽象面板、夜序圆环和产品文字，避免版权边界混乱。
- README 新增“功能一览”表格，把每个使用场景能做什么、明确不会做什么放在一起，方便陌生人快速判断项目定位。

### Before / After
- Before：README 信息已经详细，但首屏缺少视觉记忆点，功能边界需要继续往下读。
- After：首屏有横幅，紧接着能看到项目解决的问题和功能一览，更适合公开 GitHub 展示。

### 验证
- 后续随本轮运行 `npm run audit:public`、`npm run check` 和 `git diff --check`。

### 风险
- 横幅是 SVG 文本图，GitHub 渲染依赖浏览器字体；但不影响项目功能。
## 2026-07-27 - GitHub README 展示深化

### 给非开发者看的交付说明
- README 从“功能列表”升级成“产品导览”：先解释工具解决什么问题，再按截图逐个说明每个界面的用途。
- GitHub 展示截图从 5 张扩展到 12 张，覆盖本局、板子库、AI 配板、身份交接、夜晚、白天投票、倒计时、AI 设置、开场白、玩家详情、日记和复盘。
- 新增“一局游戏怎么用”和“AI 权限边界”说明，陌生人更容易理解这个工具不是官方魔典，也不是自动规则引擎。

### Before / After
- Before：README 有截图和核心能力，但介绍偏概括，不能很好展示完整主持流程。
- After：README 更像 GitHub 产品首页，能按线下开局、夜晚、白天、归档复盘的顺序读懂项目。

### 验证
- 后续随本轮运行 `npm run screenshots:github`、`npm run audit:public`、`npm run check` 和 `git diff --check`。

### 风险
- 截图是 alpha UI 快照；后续 UI 改动后需要重新运行 `npm run screenshots:github`。
## 2026-07-27 - 公开前 License 收口

### 给非开发者看的交付说明
- 项目已采用 MIT License，但只覆盖本仓库原创代码和原创项目文档。
- README、LICENSE、THIRD_PARTY_NOTICES 和公开发布状态页都同步写清楚：MIT 不授权 BOTC 官方/社区脚本、角色名、规则文本、视觉素材、商标或第三方提供方材料。
- 这一步解决的是“GitHub 公开前授权口径不明确”的阻塞；仓库仍保持 Private，是否切 Public 仍需单独执行。

### Before / After
- Before：License 是 pending，公开 GitHub 前还有一个核心阻塞。
- After：代码授权已收口为 MIT with third-party exclusions；公开前剩余动作主要是最终审计和切换仓库可见性。

### 验证
- 后续随本轮运行 `npm run audit:public`、`npm run check` 和 `git diff --check`。

### 风险
- 这不是法律意见；MIT 只覆盖原创代码和原创文档，不覆盖 BOTC 或社区/官方/第三方内容。
## 2026-07-27 - License 决策指南

### 给非开发者看的交付说明
- 新增 `LICENSE_DECISION_GUIDE.md`，把 GitHub 公开前最容易卡住的 License 问题拆成几种选择。
- 当前建议仍是保守路线：保持 Private 和 `License decision pending`；如果要公开，推荐“原创代码 MIT，第三方 BOTC/社区/素材内容明确排除”。
- README 和 GitHub 公开发布状态页都已链接到这份指南，后续不用再翻聊天记录。

### Before / After
- Before：公开前只知道 License 是阻塞项，但不知道具体怎么选、每种选择有什么后果。
- After：有一份可执行决策文档，能支持你之后一句话确认路线。

### 验证
- 后续随本轮运行 `npm run audit:public` 和 `git diff --check`。

### 风险
- 这不是法律意见；真正公开、商用或大规模分发前，仍建议人工复核第三方条款和免责声明。
## 2026-07-27 - GitHub 公开发布状态页

### 给非开发者看的交付说明
- 新增 `GITHUB_PUBLICATION_STATUS.md`，把“现在能不能公开 GitHub、公开前还差什么、哪些宣传口径不能写”整理成一页。
- 当前结论：新仓库可以作为 private alpha preview 使用；转 Public 前还需要你确认 License / 授权口径。
- 文档明确保留素材包边界：代码仓库不直接分发官方/社区二进制素材，素材继续走可选加载包与来源说明。

### Before / After
- Before：GitHub 已经推上去，但公开发布的剩余动作主要散在聊天里。
- After：公开发布状态、剩余阻塞、命令、仓库描述和 topics 都有固定文档可查。

### 验证
- 后续随本轮运行 `npm run audit:public`。

### 风险
- 本轮没有替项目选择 License，也没有把仓库改成 Public；这两个动作仍需要项目所有者确认。
## 2026-07-27 - GitHub 首页截图与功能介绍

### 给非开发者看的交付说明
- README 现在更像 GitHub 项目首页：先说明项目定位、适合谁、不适合宣传成什么，再用截图展示常驻面板、AI 配板、夜晚、白天投票和复盘。
- 新增 `npm run screenshots:github`，以后 UI 稳定后可以一键刷新 GitHub 展示截图。
- 截图只展示产品 UI 预览，不把官方/社区素材包作为可复用资源发布；公开素材边界仍按 `PUBLIC_RELEASE_BOUNDARY.md` 执行。

### Before / After
- Before：README 主要是文字说明，陌生人点进 GitHub 不容易马上理解这个工具长什么样、解决什么问题。
- After：README 第一屏有清晰定位和截图，功能边界、AI 边界、启动方式和公开发布注意事项都集中可读。

### 验证
- 已运行 `npm run screenshots:github`，生成 5 张 GitHub 展示截图。
- 后续随本轮统一运行 `npm run check` 与 `npm run audit:public`。

### 风险
- 截图是当前 alpha UI 快照；如果后续 UI 大改，需要重新运行截图命令刷新。
## 2026-07-27 - P1 真实模型夜间质量 smoke

- 新增可选命令 `npm run smoke:ai-night-live`，用于在已经配置真实 AI Key 时抽查夜间复杂角色建议。
- 当前 smoke 覆盖赌徒、舞蛇人、洗脑师三类高风险场景，检查真实模型是否给出正确 `recommendedOutcomeId`，并确认输出仍是说书人草稿。
- 默认 `npm run check` 不调用真实模型，避免日常开发被网络、API 费用或 provider 排队阻塞。
- 顺手重写了 `AI_NIGHT_QUALITY_REGRESSION.md` 和 `AI_RUNTIME_STARTUP.md`，让真实 AI 启动、回归边界和 live smoke 用法变成可读中文。

### Before / After

- Before：本地复杂角色回归已完成，但真实模型只靠浏览器 smoke 粗测，无法专门验证赌徒/舞蛇人/洗脑师这类容易错的夜间结算。
- After：可以单独跑真实模型夜间质量 smoke；失败时能明确知道是哪类复杂角色建议不稳。

### 验证

- `npx vitest run server/ai/nightSettlementProvider.live.test.ts --reporter=verbose` 通过：默认模式 3 个 live 用例全部跳过，不会偷偷调用真实模型。
- `npm run audit:public` 通过。
- `npm run check` 通过：178 个测试文件通过、1 个 live 测试文件跳过；840 项测试通过、3 项 live 用例跳过；build 和 architecture verification 全部通过。
- 本轮默认不调用真实模型；如需 live 调用，需要显式设置 `BOTC_AI_BASE_URL`、`BOTC_AI_MODEL`、`BOTC_AI_API_KEY` 后运行 `npm run smoke:ai-night-live`。

### 风险

- live smoke 会消耗真实模型 API，并受网络、限流、模型版本影响；它是发布/部署前抽查，不是默认开发检查。

## 2026-07-27 - P1-4 ????????

- ????????/???????????????????????????????/???????/?????????
- ?????????????????????????????????????
- AI ????????????????????????????????????/????????
- ??????????????????????????????

### Before / After

- Before?????????????????????????????????????
- After???????????????????????????????????

### ??

- `npx vitest run src/features/night-workbench/NightWorkbench.test.tsx src/features/night-workbench/NightWorkbench.role-change.test.tsx src/features/night-workbench/components/SettlementAssistPanel.test.tsx --reporter=verbose` ???
- `npm run check` ???

## 2026-07-27 - P0-3 ??????????

- ???? AI ????????????????????????????????????-????????????????????
- ???????????????????????????????????????????????????
- ???????AI ???????????????????????????????????
- ??????????????????????? / Alchemist????????????????????????????????????????????????????????? ID?

### Before / After

- Before????????????????AI ?????????
- After?AI ????????????????????????????

### ??

- ???????????AI ????????? check?

## 2026-07-23 - P0-2 AI ??????

- AI ????? `????`??????VPS ???????????????????? `/api/settings/ai`?
- ??????????????????????? AI ????????????????
- ?? AI ??????????????? Key??????????????????????
- ?? `dev-docs/AI_RUNTIME_STARTUP.md`???????/VPS ?? AI ????????????????????

### Before / After

- Before?????????????????????????????????????????
- After??????????????????????????

### ??

- `npx vitest run src/features/ai-settings/backendAIStatus.test.ts --reporter=verbose` ???
- `npm run check` ???
- `npm run build:backend` ???

## 2026-07-23 - ?? AI P0/P1 ??

- P0??? AI prompt ??????????????????????????????????/??/??/????????????????????
- P0??? warnings ?????????????????/??/??/??????????????
- P1?????????? `???? / ???? / ???? / ???? / ????`???????????????????
- ?????AI ??????????????????????????????????????????

### Before / After

- Before?AI ???????????????? warning ????????????????
- After??? AI ????????????????????????????????????????

### ??

- `npx vitest run src/features/night-workbench/components/SettlementAssistPanel.test.tsx src/services/ai/nightSettlementHttp.test.ts server/ai/nightSettlementProvider.test.ts --reporter=verbose` ???

## 2026-07-23 - ?? AI warning ???

- ???? AI ??? `warnings` ??????????????????????????????
- ?????????????????????????????????????????? warning / authorityWarnings?
- ????????????????????????????????

### Before / After

- Before????????????????????????????
- After?????????????????/??/??????????

### ??

- `npx vitest run src/services/ai/nightSettlementHttp.test.ts server/ai/nightSettlementProvider.test.ts --reporter=verbose` ???

## 2026-07-23 - ?? AI ??????

- ?? AI ???? `statusFacts`????????????????????????10???????????????1????????? / ?? / ????
- ?? AI prompt ?????????????????????????????????????????
- ???????????????????????????????????
- ?????AI ??????????????????????????????

### Before / After

- Before?????????? JSON ??????????????????/???????
- After????????????????????????????????????????????

### ??

- `npx vitest run src/services/ai/nightSettlementHttp.test.ts src/services/ai/aiContract.test.ts server/ai/nightSettlementProvider.test.ts --reporter=verbose` ???

## 2026-07-22 - 14.2.96 AI 配板平衡分析与角色池微调

### 给非开发者看的交付说明

- 优化 AI 配板：点击“AI推荐”后，不只给候选排序，还会同时显示“平衡分析”和“微调建议”。
- AI 请求现在会带上当前板子的角色池、角色能力、复杂角色知识和调研摘要；它的建议会基于当前板子的机制，而不是只看候选名字随便排。
- 微调建议只给“某候选里哪个角色可考虑替换成角色池里的哪个角色”，不会自动改座位、身份、阵营或状态。
- 新增“预览调整”：点击 AI 微调建议里的按钮，会生成一份说书人草稿并替换对应座位角色；只有再点“确认配板/确认调整”才会生效。
- 新增候选“质量提示”标签：AI 推荐后，每张候选卡会显示稳定、高反转、裁量重、新手负担等短标签。
- 手机宽度下候选卡片恢复为单列，避免 AI 分析出来后下面的候选卡被挤成横向小列。
- 说书人仍是最终确认人；采用候选前需要人工复核人数、阵营分布、伪装、外来者修正和特殊 setup 规则。

### Before / After

- 以前：AI 配板区域主要显示首选候选、排序理由和一条风险提醒。
- 现在：同一块 AI 配板区域会补充当前候选的平衡复核点，候选卡也会显示质量标签；微调方向可一键预览成草稿，再由说书人确认。

### 技术记录

- 扩展前端/后端 setup advice 合同：新增 `rolePool` 输入，以及 `balanceSummary`、`storytellerNotes`、`microAdjustments` 输出。
- Provider 侧会过滤不存在的候选 ID、候选内不存在的待替换角色、角色池外的替入角色和旅行者/传奇角色。
- 新增前端微调预览 helper：预览只改 `SetupDraft`，不写权威 session；候选不匹配、角色池缺失或替入角色已在场时会拒绝预览。
- 扩展 setup advice 输出 `qualityTags`，provider 会过滤未知候选 ID；本地兜底按节奏、复杂角色数量和新手比例生成基础标签。
- 本地兜底模式也会生成基础平衡分析和少量同阵营替换建议，AI 后端不可用时仍能给说书人一个复核框架。
- 已跑定向测试：setup advice HTTP/UI/provider/contract/routes，5 test files / 24 tests passed。
- Full `npm run check` passed：169 test files / 803 tests，build 和 architecture verification clean。
- 浏览器 smoke 已通过：桌面 900px 与手机 390px 下均能看到“平衡分析 / 微调建议 / 角色池”。

## 2026-07-22 - 14.2.96 柳暗花明（老华灯） intelligent script pack

### 给非开发者看的交付说明

- 新增 `liu-an-hua-ming-lao-hua-deng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `柳暗花明（老华灯）`。
- 涡流假信息、普卡中毒/延迟死亡、小恶魔/红唇女郎转魔、呆瓜落败、寡妇/蛊雕中毒等路径全部保持说书人确认。
- 默认模板不自动放入酒鬼、教父和亡骨魔，避免隐藏身份或人数修正被误认为自动结算。

### 技术记录

- 来源：GStone edition 20772 / game 39466，SHA-256 `f8447f29a882606496b4800d8b01ad0e805bd6378b8aa115bd287643f9af623a`。
- 新增 25 个来源角色、12 条首夜顺序、19 条其他夜顺序、4 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试：`liu-an-hua-ming-lao-hua-deng` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 171 test files / 808 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.95 唯你独尊 intelligent script pack

### 给非开发者看的交付说明

- 新增 `wei-ni-du-zun` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `唯你独尊`。
- 镜中魔重复镇民、中毒、无神论者、小精灵/洗脑师疯狂、采莲君问答转邪恶/死亡、赶尸人视作存活等路径全部保持说书人确认。
- 默认模板不自动放入无神论者、酒鬼、悟道者、赶尸人、镜中魔和圣洁之魂，避免特殊 setup 或传奇规则被误当作自动结算。

### 技术记录

- 来源：GStone edition 20770 / game 39464，SHA-256 `df85e0e63d8b7853cfc86e0702729d9e3154dfee111e4da02657aa33279f0bd5`。
- 新增 26 个来源角色、13 条首夜顺序、15 条其他夜顺序、6 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试：`wei-ni-du-zun` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 169 test files / 803 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.94 改头换面 intelligent script pack

### 给非开发者看的交付说明

- 新增 `gai-tou-huan-mian` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `改头换面`。
- 耳目误认、千面人/双头蛟改身份与击杀、无神论者、麻脸巫婆、男爵、方古、亡骨魔等高风险路径全部保持说书人确认。
- 默认模板不自动放入无神论者、气球驾驶员和教父；模板中使用男爵、方古、亡骨魔、双头蛟时，会显式记录人数修正提醒。

### 技术记录

- 来源：GStone edition 20769 / game 39463，SHA-256 `d7833ff494f68c1819ee9ae7c2841c2e3a5b2d8a153d9301e522ba871352c05f`。
- 新增 25 个来源角色、10 条首夜顺序、18 条其他夜顺序、11 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试：`gai-tou-huan-mian` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 168 test files / 800 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.93 扭转乾坤 intelligent script pack

### 给非开发者看的交付说明

- 新增 `niu-zhuan-qian-kun` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `扭转乾坤`。
- 重复镇民、人数修正、无神论者、坑魔、亡骨魔、死亡/复活、身份和阵营变化都保持说书人确认。
- 默认模板不自动放入无神论者、酒鬼、气球驾驶员、镜魔、亡骨魔和旅行者；13 人以上缺少伪装空间时，只把无神论者/气球驾驶员作为额外伪装候选，不作为在场模板。

### 技术记录

- 来源：GStone edition 20768 / game 39462，SHA-256 `db75793c58d8678f614a8f6aa2d990485c5e46aebe538b1ed1e566a8bd2543a0`。
- 新增 34 个来源角色、15 条首夜顺序、20 条其他夜顺序、35 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试：`niu-zhuan-qian-kun` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 167 test files / 797 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.92 诡异童话-新 intelligent script pack

### 给非开发者看的交付说明

- 新增 `gui-yi-tong-hua-xin` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `诡异童话-新`?
- 人数修正/法令、不好的事、诅咒、疯狂/任务、死亡、登记和能力复制路径全部保持说书人确认。
- 默认模板不自动放入霜公主、吹笛人、雅加婆婆、王后的法令和旅行者，避免 setup/法令被误认为自动结算。

### 技术记录

- 来源：GStone edition 20734 / game 39406?SHA-256 `5f40f34c79c1208e1587e3f9bf7301c316c50f89452e23295398b992a716905b`?
- 新增 31 个来源角色、14 条首夜顺序、24 条其他夜顺序、32 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试： `gui-yi-tong-hua-xin` pack test + smart setup candidate test + global smart script quality gate?
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 166 test files / 794 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.91 追钗奇缘（老华灯） intelligent script pack

### 给非开发者看的交付说明

- 新增 `zhui-chai-qi-yuan-lao-hua-deng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `追钗奇缘（老华灯）`?
- 醉酒/中毒、视为登记、死亡、能力获得和 setup 人数修正全部保持说书人确认。
- 默认模板不自动放入悟道者、赶尸人、饕餮和旅行者，避免隐藏身份或人数修正被误认为自动结算。

### 技术记录

- 来源：GStone edition 20730 / game 39392?SHA-256 `01b45df6526338eccc06ee94ef771a4daaae2d8d33ddd2a88f2f4f1e719a2551`?
- 新增 30 个来源角色、10 条首夜顺序、18 条其他夜顺序、31 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试： `zhui-chai-qi-yuan-lao-hua-deng` pack test + smart setup candidate test + global smart script quality gate?
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 165 test files / 791 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.90 歌剧魅影-新 intelligent script pack

### 给非开发者看的交付说明

- 新增 `ge-ju-mei-ying-xin` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `歌剧魅影-新`?
- 假面、剧幕宣布、标记、死亡/流放、中毒、阵营视为和胜负路径全部保持说书人确认。
- 默认模板不自动放入小王子、愚者、死神13、本影和旅行者，避免隐藏身份或人数修正被误认为自动结算。

### 技术记录

- 来源：GStone edition 20724 / game 39391?SHA-256 `fc2a22a523a094ee1d84c18a41cc0d7b10a6502672dd385912c9a4a32650111a`?
- 新增 31 个来源角色、12 条首夜顺序、16 条其他夜顺序、32 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试： `ge-ju-mei-ying-xin` pack test + smart setup candidate test + global smart script quality gate?
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 164 test files / 788 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.89 初出茅庐（老华灯） intelligent script pack

### 给非开发者看的交付说明

- 新增 `chu-chu-mao-lu-lao-hua-deng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `初出茅庐（老华灯）`。
- 酒鬼、教父、梼杌和传奇规则保留人工确认边界，默认模板不自动改外来者数量。
- 道士、赌徒、杂技演员、月之子、痢蛭、小恶魔的死亡/转魔提醒都只作 AI 草稿。

### 技术备注

- 来源：GStone edition 20723 / game 39389，SHA-256 `f00e5c089419461ed644735950f9f0cf03797d094ae4701368872e7e793a0ec6`。
- 新增 27 个来源角色、9 条首夜顺序、17 条其他夜顺序、23 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试： `chu-chu-mao-lu-lao-hua-deng` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 163 test files / 785 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.88 一出好戏（老华灯） intelligent script pack

### 给非开发者看的交付说明

- 新增 `yi-chu-hao-xi-lao-hua-deng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `一出好戏（老华灯）`。
- 无神论者、戏子、军团、混沌、酒鬼、提线木偶等特殊 setup 路径只做提醒，不自动进入普通模板。
- 胜负反转、说书人被处决、军团投票、私货商传奇规则都保留人工确认边界。

### 技术备注

- 来源：GStone edition 20722 / game 39388，SHA-256 `d8e42e8f8cbc2fe7104d09543c466cf4d2d9f5aa14708aa938882561f25cfe3d`。
- 新增 28 个来源角色、11 条首夜顺序、10 条其他夜顺序、29 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试： `yi-chu-hao-xi-lao-hua-deng` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 162 test files / 782 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.87 窦氏奇冤（老华灯） intelligent script pack

### 给非开发者看的交付说明

- 新增 `dou-shi-qi-yuan-lao-hua-deng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `窦氏奇冤（老华灯）`。
- 旅行者和传奇角色只作为提醒，不进入普通 7-15 人坐席模板。
- 唱诗男孩、气球驾驶员、赶尸人、方古、梼杌等 setup 路径保留说书人确认边界。

### 技术备注

- 来源：GStone edition 20721 / game 39387，SHA-256 `8d1bceb51afacb5482ccc601119550a03ae23044ae4217dad8fa2cfd68845e4e`。
- 新增 32 个来源角色、10 条首夜顺序、20 条其他夜顺序、29 条 setup/high-risk 提醒、27 套已校验模板。
- 已跑定向测试： `dou-shi-qi-yuan-lao-hua-deng` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 161 test files / 779 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.86 黄粱一梦 intelligent script pack

### 大白话总结
- 新增 `huang-liang-yi-meng-lao-hua-deng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `黄粱一梦`。

### 用户可见变化
- 7-15 人都能生成智能配板候选。
- 钦天监、阴阳师、郎中、掞客、变脸师、悟道者、酒鬼、莽夫、魔像、麻脸巫婆、酿酒师、提线木偶、哈迪寂亚、珀、方古、入梦人等路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, madness, vote, day-end and win/loss remain storyteller-confirmed.
- 酒鬼、悟道者、酿酒师、方古、入梦人、提线木偶等隐藏身份 / setup / 阵营路径不会自动执行。

### 验证
- 已跑定向测试： `huang-liang-yi-meng-lao-hua-deng` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; full `npm run check` passed: 160 test files / 776 tests, build and architecture verification clean.

## 2026-07-22 - 14.2.85 一夜鱼龙舞 intelligent script pack

### 大白话总结
- 新增 `yi-ye-yu-long-wu` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `一夜鱼龙舞`。

### 用户可见变化
- 7-15 人都能生成智能配板候选。
- 舞狮人、方士、道士、灶君、阴阳师、舞龙（头/尾/身）、鱼灯、天子、朱厌、蛊雕、酿酒师、诡美人、长安红茶、冤、凤等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, vote, day-end and win/loss remain storyteller-confirmed.
- 舞龙链、朱厌、诡美人、长安红茶、冤、凤等 setup / 转化 / 阵营 / 死亡路径不会自动执行。

### 验证
- 已跑定向测试： `yi-ye-yu-long-wu` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; `npm run check` passed (159 test files / 773 tests + build + architecture).

## 2026-07-22 - 14.2.84 童言无忌 intelligent script pack

### 大白话总结
- 新增 `tong-yan-wu-ji` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `童言无忌`。

### 用户可见变化
- 开局板子列表可选 `童言无忌`。
- 7-15 人都能生成智能配板候选。
- 钟表匠、小精灵、祖母、占卜师、筑梦师、共情者、熊孩子、锦衣卫、罂粟种植者、妖僧、灵言师、精神病患者、方古、饧餮、穷奇等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, madness, identity, alignment, vote, day-end and win/loss remain storyteller-confirmed.
- Fabled, Drunk, Yaoseng, Fang Gu, Taotie and Qiongqi setup/special paths stay out of first normal templates.

### 验证
- 已跑定向测试： `tong-yan-wu-ji` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (158 test files / 770 tests + build + architecture).

## 2026-07-22 - 14.2.83 古老魔法 intelligent script pack

### 大白话总结
- 新增 `gu-lao-mo-fa` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `古老魔法`。

### 用户可见变化
- 开局板子列表可选 `古老魔法`。
- 7-15 人都能生成智能配板候选。
- 侍童、侍从、魔法师、缪斯、王子、怪盗、游侠、仆人、巫师、圣像守卫、术士、夜魔、帝王、邪术师、傀儡师、风笛手等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, upgrade, identity, alignment, redirection, vote and win/loss remain storyteller-confirmed.
- Diwang and Fengdi Shou setup paths stay out of first normal templates.

### 验证
- 已跑定向测试： `gu-lao-mo-fa` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (157 test files / 766 tests + build + architecture).

## 2026-07-22 - 14.2.82 小二，上酒！ intelligent script pack

### 大白话总结
- 新增 `xiao-er-shang-jiu` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `小二，上酒！`。

### 用户可见变化
- 开局板子列表可选 `小二，上酒！`。
- 7-15 人都能生成智能配板候选。
- 神算盟、峨眉、丐帮、天机阁、华山、武当、六扇门、唐门、一品堂、五毒、姑苏慕容、明教、无名、日月神教、天龙教等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, redirection, vote and win/loss remain storyteller-confirmed.
- Shaolin, Tangmen, Zhongyuan Miaojia, Qitu, Riyue Shenjiao, Tianlongjiao and Travelers setup/special paths stay out of first normal templates.

### 验证
- 已跑定向测试： `xiao-er-shang-jiu` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (156 test files / 762 tests + build + architecture).

## 2026-07-22 - 14.2.81 华府雷鸣 intelligent script pack

### 大白话总结
- 新增 `hua-fu-lei-ming` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `华府雷鸣`。

### 用户可见变化
- 开局板子列表可选 `华府雷鸣`。
- 7-15 人都能生成智能配板候选。
- 掞客、赌徒、舞狮人、哲学家、食人族、疑心病、酒鬼、理发师、蛊雕、教父、寡妇、提线木偶、麻脸巫婆、方古、亡骨魔、穷奇等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, redirection, vote and win/loss remain storyteller-confirmed.
- Drunk, Godfather, Marionette, Fang Gu, Vigormortis, Travelers and Fabled setup/special paths stay out of first normal templates.

### 验证
- 已跑定向测试： `hua-fu-lei-ming` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (155 test files / 758 tests + build + architecture).

## 2026-07-22 - 14.2.80 暮色村庄 intelligent script pack

### 大白话总结
- 新增 `mu-se-cun-zhuang` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `暮色村庄`。

### 用户可见变化
- 开局板子列表可选 `暮色村庄`。
- 7-15 人都能生成智能配板候选。
- 摆渡人?巧手窃贼?白衣圣女?十字军?守墓老者?酒馆女郎?瘾君子?畸形秀女主角?广场乞丐?迷乱子嗣?魅魔?邪恶点票员?刺客庭长老?异乡人?大恶魔?寄生者?红月教皇?瘟疫之源等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, plague, identity, alignment, seat-swap, vote and win/loss remain storyteller-confirmed.
- Ferryman, Addict, Freak Show Heroine, Stranger, Red Moon Pope, Plague Source, Travelers and Fabled setup/special paths stay out of first normal templates.

### 验证
- 已跑定向测试： `mu-se-cun-zhuang` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (154 test files / 754 tests + build + architecture).

## 2026-07-22 - 14.2.79 魃罗之夜 intelligent script pack

### 大白话总结
- 新增 `ba-luo-zhi-ye` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `魃罗之夜`。

### 用户可见变化
- 开局板子列表可选 `魃罗之夜`。
- 7-15 人都能生成智能配板候选。
- 国王?驱魔人?巡山人?农夫?唱诗男孩?食人族?酒鬼?落难少女?圣徒?提线木偶?寡妇?灵言师?洗脑师?男爵?魃罗-惘?灯神等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, madness, registration, vote and win/loss remain storyteller-confirmed.
- Huntsman, Choirboy, Drunk, Damsel, Marionette, Baron and Fabled setup/special paths stay out of first normal templates.

### 验证
- 已跑定向测试： `ba-luo-zhi-ye` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (153 test files / 750 tests + build + architecture).

## 2026-07-22 - 14.2.78 颓败残局 intelligent script pack

### 大白话总结
- 新增 `tui-bai-can-ju` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `颓败残局`。

### 用户可见变化
- 开局板子列表可选 `颓败残局`。
- 7-15 人都能生成智能配板候选。
- 王、王后、象、马、食客、酒侍、王子、伪王、兵、信使、情妇、篡位者、共犯、阴险的酒侍、巨人、飞龙、魇魔、莫甘娜、领主、谄媚者、至高无上等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, registration, vote and win/loss remain storyteller-confirmed.
- False King, Usurper, Nightmare Demon, Morgana, Travelers and Fabled setup/special paths stay out of first normal templates.

### 验证
- 已跑定向测试： `tui-bai-can-ju` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (152 test files / 746 tests + build + architecture).

## 2026-07-22 - 14.2.77 圣诞夜惊魂 intelligent script pack

### 大白话总结
- 新增 `sheng-dan-ye-jing-hun` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `圣诞夜惊魂`。

### 用户可见变化
- 开局板子列表可选 `圣诞夜惊魂`。
- 7-15 人都能生成智能配板候选。
- 舞蛇人、气球驾驶员、旅店老板、赌徒、半兽人、神秘学家、造谣者、侍臣、食人族、镇长、修补匠、帽匠、莽夫、伪证天才、刺客、寡妇、怪盗、恐惧之灵、人质先生、卡扎力、利维坦等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, madness, redirection and win/loss remain storyteller-confirmed.
- Balloonist, Mystic, Drunk, Mr. Hostage and Kazali setup-changing paths stay out of first normal templates.

### 验证
- 已跑定向测试： `sheng-dan-ye-jing-hun` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (151 test files / 742 tests + build + architecture).

## 2026-07-22 - 14.2.76 交换人生 intelligent script pack

### 大白话总结
- 新增 `jiao-huan-ren-sheng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `交换人生`。

### 用户可见变化
- 开局板子列表可选 `交换人生`。
- 7-15 人都能生成智能配板候选。
- 掮客、舞蛇人、舞狮人、村夫、偃师、入殓师、理发师、畸形秀演员、麻脸巫婆、镜像双子、蛊雕、洗脑师、诺-达鲺、混沌、亡骨魔、方古等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, madness, redirection and win/loss remain storyteller-confirmed.
- Villager, Drunk, Vigormortis and Fang Gu setup-changing paths stay out of first normal templates.

### 验证
- 已跑定向测试： `jiao-huan-ren-sheng` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (150 test files / 738 tests + build + architecture).

## 2026-07-22 - 14.2.75 古道酒温 intelligent script pack

### 大白话总结
- 新增 `gu-dao-jiu-wen` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `古道酒温`。

### 用户可见变化
- 开局板子列表可选 `古道酒温`。
- 7-15 人都能生成智能配板候选。
- 棋士、嫠妇、竹马无猜、青梅无忌、狂狷侠、虚枝公、乾道、桃花仙、欢梦、烽烟、浮生客、离世镜、酒盅蛊、毓秀灵、蓑笠翁、破戒僧、春秋笔、食貘、一枕黄粱等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, poison/drunk, identity, alignment, nomination restrictions, ability-copy and win/loss remain storyteller-confirmed.
- Bamboo Childhood, Joy Dream, Qian Dao, Solo Fisherman and Spring-Autumn Brush special setup paths stay out of first normal templates.

### 验证
- 已跑定向测试： `gu-dao-jiu-wen` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 109 tests passed; `npm run check` passed (149 test files / 734 tests + build + architecture).

## 2026-07-22 - 14.2.74 命定灾祸 intelligent script pack

### 大白话总结
- 新增 `ming-ding-zai-huo` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 开局板子列表可选 `命定灾祸`。

### 用户可见变化
- 命定灾祸：工具只给提醒和草稿，不自动结算。
- 7-15 人都能生成智能配板候选。
- 酋长、看守人、先知、肠卜僧、恶棍、扫把星、兽王、掩日者、阴谋家、悲剧家、二把手、逆时旅人、沼泽蜥人、末日执行者、万钧之力、命运指针、负伤等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI only drafts setup candidates, night-order reminders, ability settlement suggestions and journal text.
- Death, execution, wound, blessing, poison, alignment, vote invalidation, fate pointer movement and win/loss remain storyteller-confirmed.
- Chieftain, Tragedian, Destiny Pointer and Wounded status stay out of first normal templates.

### 验证
- 已跑定向测试： `ming-ding-zai-huo` pack test + smart setup candidate test + global smart script quality gate。
- Targeted: 3 test files / 110 tests passed; `npm run check` passed (148 test files / 731 tests + build + architecture).

## 2026-07-22 - 14.2.73 笼中金雀 intelligent script pack

### 大白话总结
- 新增 `long-zhong-jin-que` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 笼中金雀：工具只给提醒和草稿，不自动结算。

### 用户可见变化
- 开局板子列表可选 `笼中金雀`。
- 7-15 人都能生成智能配板候选。
- 炼金术士、舞蛇人、煤矿工、酒鬼、畸形秀演员、理发师、男爵、恐惧之灵、女巫、提线木偶、军团、诺-达鲺、小怪宝等高风险路径会进入 AI/规则提醒。

### 风险与边界
- AI 只给配板候选、夜序提醒、技能结算建议和日志草稿.
- 死亡、处决、毒醉、身份、阵营、胜负和投票无效都必须由说书人确认.
- 煤矿工、酒鬼、男爵、提线木偶、军团、小怪宝涉及人数修正或隐藏身份，首批普通模板暂不自动采用.

### 验证
- 已跑定向测试： `long-zhong-jin-que` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；`npm run check` passed (147 test files / 727 tests + build + architecture).

## 2026-07-22 - 14.2.72 谍影重重 intelligent script pack

### 大白话总结
- 新增 `die-ying-chong-chong` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 这个板子围绕伪装泄露、保护、延迟死亡、替代死亡和身份/阵营不确定展开；工具只给提醒和草稿，不自动结算。

### 用户可见变化
- 开局板子列表可选 `谍影重重`。
- 7-15 人都能生成智能配板候选。
- 经纪人、擦鞋匠、毒蛇、美术馆长、毒舞者、死之握、碾骨魔、三威之力、狂戮等高风险路径会进入 AI/规则提醒。

### 风险与边界
- 经纪人来源规则是 4 个伪装且其中 2 个在场；当前工具通用伪装 UI 仍是 3 个，先作为说书人额外提醒，不扩展通用配板管线。
- 擦鞋匠、毒蛇、三威之力涉及人数修正或隐藏身份路径，首批普通模板暂不自动放入，可由说书人手动微调。
- 旅行者只保留知识/夜序提醒，不进入普通座位模板或恶魔伪装。
- 死亡、处决、毒醉、身份、阵营、胜负、延迟死亡和替代死亡都必须由说书人确认。

### 验证
- 已跑定向测试： `die-ying-chong-chong` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（146 test files / 724 tests + build + architecture）。

## 2026-07-22 - 14.2.71 信念解离 + intelligent script pack

### 大白话总结
- 新增 `xin-nian-jie-li-plus` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 这个板子围绕自我认知错位、伪身份、目标转移、替代死亡和恶魔信息偏差展开；工具只给提醒和草稿，不自动结算。

### 用户可见变化
- 开局板子列表可选 `信念解离 +`。
- 7-15 人都能生成智能配板候选。
- 模仿者、护士长、药师、无政府主义者、煤气灯人、代行邪魔、幕后黑手、二重身、认知错位、精神扭曲、嗜血等高风险路径会进入 AI/规则提醒。

### 风险与边界
- 认知错位、精神扭曲、嗜血作为传奇提醒保留，不进入普通座位模板或恶魔伪装。
- 二重身涉及 -1 爪牙和双恶魔同能力，首批普通模板暂不自动放入，可由说书人手动微调。
- 死亡、处决、毒醉、身份、阵营、胜负和恶魔信息变化都必须由说书人确认。

### 验证
- 已跑定向测试： `xin-nian-jie-li-plus` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（145 test files / 721 tests + build + architecture）。

﻿## 2026-07-22 - 14.2.70 礼崩乐坏 intelligent script pack

### 大白话总结
- 新增 `li-beng-le-huai` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 这个板子强调语言、处决代价和后期恶魔压力；工具只整理配板/夜序/提醒，不自动处理死亡、胜负或阵营变化。

### 用户可见变化
- 开局板子列表可选 `礼崩乐坏`。
- 7-15 人都能生成智能配板候选。
- 教父、灵言师、鹰身女妖、主谋、焦尾、典狱长、珀、圣洁之魂、灯神等高风险路径会进入 AI/规则提醒。

### 风险与边界
- 教父会增减外来者，首批普通模板暂不自动放入，可由说书人手动微调。
- 圣洁之魂、私货商人、灯神作为传奇/相克提醒保留，不进入普通座位模板或恶魔伪装。
- 死亡、处决、毒醉、疯狂、阵营变化和胜负判断都必须由说书人确认。

### 验证
- 已跑定向测试：`li-beng-le-huai` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（144 test files / 718 tests + build + architecture）。

## 2026-07-22 - 14.2.69 试胆大会分类

### 大白话总结
- 复核了 `试胆大会`，结论是：暂时不把它当普通 7-15 人智能板子导入。
- 这个来源只有 12 个角色，且没有常规恶魔，靠传奇「凶宅」制造恶魔，属于特殊玩法小板。

### 用户可见变化
- 开局板子列表不会新增 `试胆大会`，避免出现看似可玩但人数/恶魔结构不稳定的候选。
- 后续如果要玩它，需要先做“小板/特殊模式”设计，而不是塞进普通配板流程。

### 验证
- 已锁定来源：GStone edition 21100 / game 41112。
- 已记录 hash：`sha256:3a6f94028402191f4240ff495006dcbf8cd70b3ccc7b11d26172cc3c85482383`。
- 已更新 `SPECIAL_CLASSIFICATION_NOTES.md` 和导入队列。

## 2026-07-22 - 14.2.68 血色风华 intelligent script pack

### 大白话总结
- 新增 `xue-se-feng-hua` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 这个板子有染血标记、往生之路、魔戒、看守者钥匙和多条死亡/身份/胜负链路；工具只做提醒和草稿，不自动改权威状态。

### 用户可见变化
- 开局板子列表可选 `血色风华`。
- 7-15 人都能生成智能配板候选。
- 八角笼、变身茄子、亡语师、护戒人、看守者、判决者、窥伺者、血织女、血渡鸦等高风险路径会进入 AI/规则提醒。

### 风险与边界
- 看守者会调整恶魔/爪牙数量，首批普通模板暂不自动放入，可由说书人手动微调。
- 染血、往生、魔戒、死亡、处决、毒醉、身份/能力、阵营和胜负判断都必须由说书人确认。
- 往生者、梦蝶作为旅行者保留知识与夜序，不进入普通座位模板或恶魔伪装。

### 验证
- 已跑定向测试：`xue-se-feng-hua` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（143 test files / 715 tests + build + architecture）。

## 2026-07-22 - 14.2.67 梨园残梦 intelligent script pack

### 大白话总结
- 新增 `li-yuan-can-meng` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 这个板子有剧目、搭档、主演/反派、生旦净丑和特殊胜负条件；工具只做结构化提醒，不自动跑规则。

### 用户可见变化
- 开局板子列表可选 `梨园残梦`。
- 7-15 人都能生成智能配板候选。
- 剧目牌、搭档、扫把星、腐儒、天子、千金、将军、权臣等高风险路径会进入 AI/规则提醒。

### 风险与边界
- 剧目切换、搭档分配、主演/反派、身份变化、阵营变化、死亡、毒醉、疯狂和胜负判断都必须由说书人确认。
- 剧目牌作为传奇提醒保留，不进入普通座位模板或恶魔伪装。
- 本板的第一版模板按工具标准人数构成给候选；具体剧目和搭档仍需现场记录。

### 验证
- 已跑定向测试：`li-yuan-can-meng` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（142 test files / 712 tests + build + architecture）。

## 2026-07-22 - 14.2.66 灯下绘影 intelligent script pack

### 大白话总结
- 新增 `deng-xia-hui-ying` 智能板子，可用于智能配板、夜序辅助和 AI 角色提醒。
- 这个板子特殊恶魔很多，第一版默认候选保守处理：只采用标准人数构成的尸佛路径，其他特殊 setup 恶魔先做提醒和手动微调。

### 用户可见变化
- 开局板子列表可选 `灯下绘影`。
- 7-15 人都能生成智能配板候选。
- 鬼、皮影戏坊主、残躯、偃师等特殊路径会作为规则提醒，不会自动改状态。

### 风险与边界
- 没有自动处理阵营变化、身份变化、投票失效、胜负条件或死亡连锁。
- 高风险结果仍需说书人核对后才能采用。

### 验证
- 已跑定向测试：`deng-xia-hui-ying` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（141 test files / 709 tests + build + architecture）。

## 2026-07-22 - 14.2.65 酬神纳吉 intelligent script pack

### 大白话总结
- 新增 `chou-shen-na-ji` 智能板子，现在可以走智能配板、夜序辅助和 AI 角色提醒。
- 这个板子有特殊恶魔「傩戏班」：无爪牙。本轮不做自动结算，只把人数构成和高风险提醒给说书人看。

### 用户可见变化
- 开局板子列表可选 `酬神纳吉`。
- 7-15 人都能生成智能配板候选。
- 13-15 人时，恶魔伪装不再被错误限死为「只能未在场镇民」，本板可使用未在场镇民或外来者。

### 风险与边界
- 傩戏班看魔典、使用不在场能力、麻脸巫婆改角色、洗脑师/鹰身女妖疯狂等仍是说书人确认。
- 没有自动改身份、阵营、毒醉、生死或胜负。

### 验证
- 已跑定向测试：`chou-shen-na-ji` pack test + smart setup candidate test + global smart script quality gate。
- 结果：定向 3 test files / 109 tests passed；全量 `npm run check` passed（140 test files / 706 tests + build + architecture）。

## 2026-07-22 - Mass script import board 71

### Xin Ren Shi Lian / 信任试炼

- Added: `xin-ren-shi-lian` smart script pack, locked to GStone edition 21005 / game 40587, source hash `sha256:f603b4fa9757330b5f9865fa87dfacc7435232fc17f5804638ac1c31571f1d75`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Mystic Scholar, Balloonist, Baron, Drunk, Plague Doctor and custom merchant jinxes stay as setup/reminder paths; Pit-Hag, Shabaloth, Friend Game, Fox Spirit and Psychopath death, identity, alignment and revival paths remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 70

### Jing Jue Gu Guo Shen Hua / 精绝古国（神话）

- Added: `jing-jue-gu-guo-shen-hua` smart script pack, locked to GStone edition 20973 / game 40326, source hash `sha256:541c3fc441a9ae4b1dfff154c2c47d53f653848dc0579ba688fefaba04c51c1c`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Balloonist/Baron/Vigormortis/Lil Monsta setup changes are reminders only; Feng/Phoenix, Marionette projection, Evil Twin, Rebel Minister and Snake Charmer death, identity, alignment, poison/drunk and win/loss paths remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 69

### Liu Gong Fen Dai / 六宫粉黛

- 新增: 接入 `liu-gong-fen-dai` 智能板子包, 来源锁定为 GStone edition 20950 / game 40255, hash 为 `sha256:1f3db312adda11b99ddee61096e4c7519aa25ab5ca742d8bfdf5bfc93f2b8a17`.
- 用户可见: 开局板子列表可使用六宫粉黛, 支持 7-15 人 AI 配板候选, 来源夜序和高风险规则提醒.
- 边界: Legion/Chang An Hong Cha/旅行者/传奇 不进入首批普通模板; 死亡/处决/胜负/阵营/身份/中毒醉酒/查看魔典 仍必须由说书人确认.
- 验证: 定向 pack/质量/composition 测试通过, `npm run check` 通过.

## 2026-07-22 - Mass script import board 68

### Wu Ren Sheng Huan / 无人生还

- 新增: 接入 `wu-ren-sheng-huan` 智能板子包, 来源锁定为 GStone edition 21222 / game 41550, hash 为 `sha256:424967d1c8999ba8c714e16ed4c922b56f2fe076897de7005a0c947fea808ce7`.
- 用户可见: 开局板子列表可使用无人生还, 支持 7-15 人 AI 配板候选, 来源夜序和高风险规则提醒.
- 边界: 族长/幽灵/夜魇 setup 修正只作为显式调整; 旅行者/警督变量 setup 路径不进入首批普通模板; 疯狂/死亡/处决/胜负/阵营/身份/登记 仍必须由说书人确认.
- 验证: 定向 pack/质量/composition 测试通过, `npm run check` 通过.

## 2026-07-22 - Mass script import board 67

### An Du Chen Cang / 暗度陈仓

- 新增: 接入 `an-du-chen-cang` 智能板子包, 来源锁定为 GStone edition 20705 / game 39316, hash 为 `sha256:cb73a1205b7295efa452a1cca1383a9e8bc74d558bae27fc1daba30562c4429a`.
- 用户可见: 开局板子列表可使用暗度陈仓, 支持 7-15 人 AI 配板候选, 来源夜序和高风险规则提醒.
- 边界: 方古, 气球驾驶员和男爵人数修正只作为显式 setup 调整; 醉酒者/教父不进入首批普通模板; 红唇女郎继承, 方古跳, 莽夫/心上人/突变者/舞蛇人/精神病患者/修补匠/驱魔人相关状态仍必须由说书人确认.
- 验证: 定向 pack/质量/composition 测试通过, `npm run check` 通过.

## 2026-07-22 - Mass script import board 65

### Ye Ban Kuang Huan / 夜半狂欢
- Added: `ye-ban-kuang-huan` smart script pack, locked to GStone edition 20003 / game 32341, source hash `sha256:f512be8087e3f0b2caa971adc8d9b789cc96315f4c8bffef44423380107b3077`.
- User-visible: this high-chaos board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Balloonist and Vigormortis setup effects use explicit adjustments; Atheist/Huntsman/Drunk/Sentinel/Spirit of Ivory stay out of first normal templates; Professor revival, Engineer/Pit-Hag character changes, Snake Charmer swap, Farmer change, Poppy Grower evil-info timing, Damsel loss, Mezepheles alignment, Psychopath death and Al-Hadikhia death choices remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 64

### Ying Su Hua Kai / 罂粟花开
- Added: `ying-su-hua-kai` smart script pack, locked to GStone edition 20005 / game 32345, source hash `sha256:8115ac32a50fcab7f93db0badc61a807a852d497568f995d4c5967c8d47d7305`.
- User-visible: this Poppy Grower / Leviathan-risk style board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Baron setup uses explicit +2 Outsiders adjustment; Legion/Marionette/Drunk/Bounty Hunter stay out of first normal templates; Poppy Grower evil-info timing, Evil Twin/Vortox/Mayor win-loss, Cerenovus/Mutant madness, Vigormortis poison/death and Imp succession remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 63

### Guo Jie Xin Yang / 过界信仰
- Added: `guo-jie-xin-yang` smart script pack, locked to GStone edition 20006 / game 32346, source hash `sha256:aae3b5e90dc59df98998d6e0ee8f3a30bf64a859abc802e7c19e9d92389d197a`.
- User-visible: this Leviathan/Atheist-risk board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Balloonist and Baron setup effects use explicit adjustments; Atheist/Marionette stay out of first normal templates; Leviathan execution/day-five win pressure, Snake Charmer swap, Cult Leader alignment, Widow poison, Drunk/Lunatic hidden identity and Mutant madness remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 62

### Xian Xiang Huan Sheng / 险象环生
- Added: `xian-xiang-huan-sheng` smart script pack, locked to GStone edition 20004 / game 32342, source hash `sha256:c79b41548a6737825911eac8c5244f972310ec8eeaad78bf13a4c926d98a5997`.
- User-visible: this Riot-focused 21-role board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Riot templates explicitly allow repeated Riot seats and convert Minion slots through setup correction; Marionette/Sentinel stay out of first normal templates; Riot nomination/death/win timing, Balloonist information, Choirboy/King trigger, and Puzzlemaster drunk paths remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 61

### Si Zui Chan Hui Ri / 死罪忏悔日
- Added: `si-zui-chan-hui-ri` smart script pack, locked to GStone edition 20001 / game 32705, source hash `sha256:5c514b72a58b8b9beacbf8da767760c34a73f3b3f1f9e36b63c8fe0b01c384c3`.
- User-visible: this compact 21-role board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: every template carries Lil Monsta +1 Minion; 13-15 player templates also carry Baron +2 Outsiders; Bounty Hunter/Cult Leader/Politician/Saint/Barber/Witch/Assassin/Lil Monsta effects remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 60

### Shang Di Que Xi / 上帝缺席
- Added: `shang-di-que-xi` smart script pack, locked to GStone edition 20284 / game 36805, source hash `sha256:b63d687ab9f3532b9aab1bff3a34e63421170138da782933204689a322b80176`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Drunk/Marionette/Vigormortis stay manual and out of first normal templates; 13-15 player templates carry explicit Godfather +1 Outsider adjustment; Imp/Scarlet Woman/Vigormortis succession and Pukka/No Dashii/Poisoner/Philosopher/Gambler poison, drunk or death chains remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 59

### Da Quan Zai Wo / 大权在握
- Added: `da-quan-zai-wo` smart script pack, locked to GStone edition 20748 / game 39444, source hash `sha256:11e225e196b7e2edc77bb6c7a67d3cc75ec9538c3abae4273f2f2b049f9e3950`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Bounty Hunter/Balloonist/Drunk/Lunatic/Godfather stay manual; Snake Charmer/Pit-Hag/Puzzlemaster/Lunatic identity, drunk or false-Demon paths remain storyteller-confirmed; Pukka/No Dashii/Shabaloth/Lleech poison, death, revive or host chains remain reminders only until adopted.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 58

### Er Yu Wo Zha / 尔虞我诈
- Added: `er-yu-wo-zha` smart script pack, locked to GStone edition 20750 / game 39442, source hash `sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Drunk/Heretic/Fang Gu/Vigormortis/Djinn stay manual; Snake Charmer/Philosopher/Goon/Pit-Hag/Imp/Fang Gu identity, alignment or ability changes remain storyteller-confirmed; Cerenovus/Fearmonger/Saint/Heretic/Djinn outcomes remain reminders only.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 57

### Xin Li Bo Yi / 心理博弈
- Refreshed: `xin-li-bo-yi` smart script pack, locked to GStone edition 20751 / game 39441, source hash `sha256:e208bc31314b6faab9a17b6d74f5e93aa5ebba218fe9132402a46818ff1d2708`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Bounty Hunter/Godfather/Vigormortis/Leviathan paths stay manual; Gambler/Lycanthrope/Goon/Pit-Hag/Po death, alignment, identity or multi-kill chains remain storyteller-confirmed; Leviathan/Mayor/Gossip/Moonchild/Tinker/Acrobat triggers remain reminders only.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 56

### E Mo Mi Cheng / 恶魔谜城
- Added: `e-mo-mi-cheng` smart script pack, locked to GStone edition 20752 / game 39440, source hash `sha256:0ecf691d816b1cb95b23d112e2512b691a8851f894bc1bab9c931d500edb7ab2`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Huntsman/Damsel, Drunk, Godfather, Vigormortis and Choirboy paths stay manual; Cerenovus/Pit-Hag/Scarlet Woman/Pukka/No Dashii/Lleech/Vortox poison, madness, identity, death or false-information chains remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 55

### Yao Wu Yin Xin / 杳无音信
- Added: `yao-wu-yin-xin` smart script pack, locked to GStone edition 20753 / game 39439, source hash `sha256:13a59bdd0d3561ad90725defcfdbe1b2b07ff3cec30a471a518b1423b5394a69`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Godfather setup and Snitch evil-bluff path stay manual; Pit-Hag/Scarlet Woman/Pukka/No Dashii/Lleech/Vortox identity, poison, death, false-information or win/loss pressure stays storyteller-confirmed; Klutz/Moonchild/Gossip/Acrobat triggers remain reminders only.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 54

### Heng Xing Ba Dao / 横行霸道
- Added: `heng-xing-ba-dao` smart script pack, locked to GStone edition 20754 / game 39438, source hash `sha256:3143c0f142a7d5ebd609934396a50339f2b662c0e9dce81768197ab34230899b`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Huntsman/Damsel, Heretic and Poppy Grower hidden/reversal/team-info paths stay manual; Snake Charmer/Goon/Barber/Imp/Lleech identity, alignment, poison or death chains remain storyteller-confirmed; Goblin/Fearmonger/Damsel/Heretic win-loss triggers remain reminders only.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 53

### Yu Gai Mi Zhang / 欲盖弥彰
- Added: `yu-gai-mi-zhang` smart script pack, locked to GStone edition 20755 / game 39437, source hash `sha256:abd6bf76cb4565c25cc7d5feb3bac3eb79f06612c0f49121fed2dbba4e543c47`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Balloonist/Drunk/Fang Gu/Lil Monsta setup or hidden-special paths stay manual; Evil Twin/Goblin/Fearmonger win/loss triggers stay reminders only; Widow/Sailor/Sweetheart/Lleech poison, drunk or death chains remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and full `npm run check` passed.

## 2026-07-22 - Mass script import board 52

### Sheng Ri Yan Hui / 生日宴会！
- Added: `sheng-ri-yan-hui` smart script pack, locked to GStone edition 20756 / game 39436, source hash `sha256:8fcf5a525879f75f451f2243f75499479f73481d1c2da667040f291b6f1e99f0`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Choirboy/Drunk/Godfather/Vigormortis/Fang Gu setup or hidden-identity paths stay manual; Sailor/Innkeeper/Courtier/Sweetheart/Acrobat/Lleech poison, drunk or death effects remain storyteller-confirmed; Marionette/Cannibal/Imp/Fang Gu identity or alignment changes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 51

### Man Tian Guo Hai / 瞒天过海
- Added: `man-tian-guo-hai` smart script pack, locked to GStone edition 20757 / game 39435, source hash `sha256:48542895c7172cde5dda9a88f0ac8600e8a4a17f29a3a4c410070a5c174af841`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Balloonist/Huntsman/Drunk/Baron/Fang Gu setup or hidden-identity paths stay manual; Marionette templates require storyteller adjacency check; Cerenovus/Pixie/Damsel/Klutz/Golem madness, death, identity, alignment or win/loss outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 50

### Lan Xie Jie Qu / 蓝榭街区
- Added: `lan-xie-jie-qu` smart script pack, locked to GStone edition 20758 / game 39434, source hash `sha256:7964badba754c80e54378eac7670c6f7e5c3be4d547476dca58ea0d9f9417aa2`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Drunk/Godfather/Vigormortis hidden or setup-changing paths stay manual; 13-15 player templates using Marionette require storyteller adjacency check; Barber/Imp/Cannibal/Lunatic/Magician identity or viewpoint changes and Poisoner/No Dashii/Vigormortis poison/death outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 49

### Mi Ying Xun Zong / 觅影寻踪
- Added: `mi-ying-xun-zong` smart script pack, locked to GStone edition 20759 / game 39432, source hash `sha256:4a44da87af812886d77d55628a4b1f169e98ed1116df511e0e9bae5067191a61`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Huntsman/Drunk/Godfather/Vigormortis setup or hidden paths stay manual; Mezepheles/Cerenovus/Pukka/Preacher/Goon/Virgin/Damsel alignment, poison, death, madness or identity outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 48

### Zui Ge Luan Wu / 醉歌乱舞
- Added: `zui-ge-luan-wu` smart script pack, locked to GStone edition 20760 / game 39433, source hash `sha256:1d1b6109849cce24c4b48e0dbb4564900d65f13b8f3e588710d5d60f0915f08e`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Bounty Hunter/Huntsman/Drunk/Godfather/Vigormortis/Fang Gu setup or hidden paths stay manual; Philosopher/Cerenovus/Pit-Hag/No Dashii/Goon/Minstrel/Damsel identity, alignment, poison, drunk or madness outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 47

### Yin He Man Bu / 银河漫步
- Added: `yin-he-man-bu` smart script pack, locked to GStone edition 20761 / game 39431, source hash `sha256:edb443b035e3ceb1cd1dd2e9a6decc570369ef8eec5e17f6f3532122ad2f098c`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Godfather/Fang Gu/Vigormortis setup paths stay manual; Fortune Teller/Recluse/Puzzlemaster/Cannibal registration, drunk or ability-source paths stay manual; Pit-Hag/Barber/Imp/Fang Gu/Vigormortis identity, poisoning or death outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 46

### Hao Shi Duo Mo / 好事多磨
- Added: `hao-shi-duo-mo` smart script pack, locked to GStone edition 20749 / game 39443, source hash `sha256:2ad57e09ee5edc0523bea8979d42431922e09cbf68182cd0ad041320d98657a5`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Travelers and Sentinel stay outside templates/bluffs; Drunk/Heretic/Fang Gu setup, reversal, hidden or jump paths stay manual; Snake Charmer/Cerenovus/Gambler/Poppy Grower/Lleech/Imp/Boomdandy outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 45

### Hui Xuan Mi Zhen / 回旋迷阵
- Added: `hui-xuan-mi-zhen` smart script pack, locked to GStone edition 20747 / game 39445, source hash `sha256:af0a238cd7827215b5827a3a799d77d1761ef81ea30a74f0df5407d18b3f15c7`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Travelers stay outside templates/bluffs; Drunk/Godfather/Lil' Monsta/Vigormortis/Legion setup or hidden/special paths stay manual; high-player Marionette templates require storyteller adjacency check; Widow/Cerenovus/Vortox/Philosopher/Farmer/Cannibal outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 44

### Quan Mian Su Qing / ????
- Added: `quan-mian-su-qing` smart script pack, locked to GStone edition 20746 / game 39446, source hash `sha256:f83b3c5e5a3c14912b36fcdc4f38bdf0aeddb673855b78c124838bd6f6cca807`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Fabled roles stay outside templates/bluffs; Balloonist/Drunk/Fang Gu/Lil' Monsta setup or hidden/special paths stay manual; Widow/Mezepheles/Cerenovus/Scarlet Woman/No Dashii/Barber/Klutz/Cannibal/Sage outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 43

### Tou Tian Huan Ri / ????
- Added: `tou-tian-huan-ri` smart script pack, locked to GStone edition 20745 / game 39447, source hash `sha256:222d0ffb78fc4d10eb9eafa085e4913b030f50e72953dd2abdcaf90f1748f044`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Drunk/Lunatic/Goon/Fang Gu hidden, alignment or setup paths stay manual; Lycanthrope/Fortune Teller/Cerenovus/Poisoner/Scarlet Woman/Witch/Imp/Pukka outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 42

### Jiu Zhuan Qian Ceng / ????
- Added: `jiu-zhuan-qian-ceng` smart script pack, locked to GStone edition 20744 / game 39448, source hash `sha256:5cb45033a75468c0ed9957b86f5b73b5a8bd5301f891cefd1723eb3bd3a7dd81`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Travelers stay outside templates/bluffs; Balloonist/Snitch/Drunk/Godfather/Vigormortis setup or hidden/special paths stay manual; Philosopher/Innkeeper/Gossip/Farmer/Mezepheles/Witch/Cerenovus/Assassin/Pukka/Imp outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - Mass script import board 41

### Huo Shan Jiao Tuan / ????
- Added: `huo-shan-jiao-tuan` smart script pack, locked to GStone edition 20729 / game 39393, source hash `sha256:8762cec1b585af2fc9314cfa31c38a46e32099d215ebcc8159ec0ae945bac3f1`.
- User-visible: this board can now appear as a smart script with 7-15 player setup candidates, source night order reminders, and AI-safe role research projection.
- Boundary: Balloonist/Choirboy/Drunk/Fang Gu/Legion setup, hidden-identity or special Demon paths stay manual; Snake Charmer/Vortox/Lleech/Cerenovus/Devil's Advocate/Poisoner/Goblin/Pacifist/Farmer/Cannibal outcomes remain storyteller-confirmed.
- Verification: Targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - batch-03 board 41: 宝梦谜团 imported

- Stage: 14.2 official-grimoire 132-board mass smart-script import.
- Added: `bao-meng-mi-tuan` smart script pack, locked to GStone edition 20727 / game 39394, source hash `sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f`.
- User-visible effect: this board is available in opening script selection, AI setup templates support 7-15 players, and the night workbench can filter the source night order to in-play roles.
- Boundary: Traveler/Fabled roles stay as reminders only; Bounty Hunter, Drunk, Marionette, Lil' Monsta and Legion setup paths stay manual; Vortox, Evil Twin, Pit-Hag, Witch, Assassin, Farmer, Engineer and Alchemist outcomes are only ST-confirmed suggestions.
- Before: queue row 48 was pending.
- After: row 48 has 33 source roles, Traveler/Fabled reminders, source night order, setup reminders, 22 templates, acceptance notes and tests.
- Verification: targeted pack/quality/composition/AI projection tests and `npm run check` passed.

## 2026-07-22 - batch-03 board 40: 宝月初升 imported

- Stage: 14.2 official-grimoire 132-board mass smart-script import.
- Added: `bao-yue-chu-sheng` smart script pack, locked to GStone edition 20726 / game 39395, source hash `sha256:73a0d102934967b66a455b6d8f5e012bcfb9fbd720efc38c2340240a7d7a7893`.
- User-visible effect: this board is available in opening script selection, AI setup templates support 7-15 players, and the night workbench can filter the source night order to in-play roles.
- Boundary: Balloonist, Choirboy, Drunk, Godfather and Lil' Monsta setup or hidden-identity paths stay manual; Pukka, Shabaloth, Po, Widow, Cerenovus, Goblin, Barber, Snake Charmer, Professor, Gambler and Mayor outcomes are only ST-confirmed suggestions.
- Before: queue row 47 was pending.
- After: row 47 has 25 roles, source night order, setup reminders, 22 templates, acceptance notes and tests.
- Verification: targeted pack/quality/composition/AI projection tests passed; `npm run check` passed.

## 2026-07-22 - batch-03 board 39: 天堂花园 imported

- Stage: 14.2 official-grimoire 132-board mass smart-script import.
- Added: `tian-tang-hua-yuan` smart script pack, locked to GStone edition 20725 / game 39396, source hash `sha256:f70ddd0ffebd64bbfcc04b30ae9b6d54a91e5da61f55f20b4b8cec379486de39`.
- User-visible effect: this board is available in opening script selection, AI setup templates support 7-15 players, and the night workbench can filter the source night order to in-play roles.
- Boundary: Choirboy, Drunk, Baron and Marionette setup or hidden-identity paths stay manual; Al-Hadikhia, Vizier, Witch, Barber, Goon, Gambler, Innkeeper, Philosopher, Pixie, Slayer and Klutz outcomes are only ST-confirmed suggestions.
- Before: queue row 46 was pending.
- After: row 46 has 24 roles, source night order, setup reminders, 22 templates, acceptance notes and tests.
- Verification: targeted pack/quality/composition/AI projection tests passed; `npm run check` passed.

## 2026-07-22 - batch-03 board 38: 只手遮天 imported

- Stage: 14.2 official-grimoire 132-board mass smart-script import.
- Added: `zhi-shou-zhe-tian` smart script pack, locked to GStone edition 20514 / game 38024, source hash `sha256:4238810a6fb68f2daa965e332d1be23dd5f61299b49bd179a6937dd2692e68d2`.
- User-visible effect: this board is available in opening script selection, AI setup templates support 7-15 players, and the night workbench can filter the source night order to in-play roles.
- Boundary: Godfather setup-changing path stays manual; Vizier, Boomdandy, No Dashii, Al-Hadikhia, Lleech, Pukka, Damsel, Klutz, Moonchild, Farmer, Philosopher, Gambler, Innkeeper, Gossip and Sailor outcomes are only ST-confirmed suggestions.
- Before: queue row 45 was pending.
- After: row 45 has 25 roles, source night order, setup reminders, 22 templates, acceptance notes and tests.
- Verification: targeted pack/quality/composition/AI projection tests passed; `npm run check` passed.

## 2026-07-22 · 官方魔典 batch-03 第三十七板：愚者欢宴接入

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`yu-zhe-huan-yan` 智能板子包，锁定 GStone edition 20438 / game 37700，来源 hash 为 `sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06`。
- 可见效果：开局板子列表可读取《愚者欢宴》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：亡骨魔、男爵、赏金猎人、气球驾驶员属于人数/阵营修正路径，首批普通模板先排除；街头风琴手投票、涡流假信息和无人处决邪恶胜利、小恶魔传位、恐惧之灵/哥布林/圣徒/异端分子胜负、理发师/舞蛇人换身份阵营、贞洁者/魔像死亡等只给说书人待确认建议。
- Before：第 44 行仍是待导入。
- After：第 44 行完成 25 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；`npm run check` 通过。

## 2026-07-22 · 官方魔典 batch-03 第三十六板：说书人之怒接入

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`shuo-shu-ren-zhi-nu` 智能板子包，锁定 GStone edition 20287 / game 36809，来源 hash 为 `sha256:6e26d3024bfd22e2268aa4713d718057a85ef4612956c4a5694c9a838939b0ca`。
- 可见效果：开局板子列表可读取《说书人之怒》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：军团、小怪宝、赏金猎人、无神论者属于特殊 setup/破规则路径，首批普通模板先排除；涡流假信息和无人处决邪恶胜利、僵怖死而存活登记、舞蛇人换身份阵营、哲学家醉酒、麻脸巫婆改身份、洗脑师疯狂等只给说书人待确认建议。
- Before：第 43 行仍是待导入。
- After：第 43 行完成 25 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；`npm run check` 通过。

## 2026-07-22 · 官方魔典 batch-03 第三十五板：身份危机接入

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`shen-fen-wei-ji` 智能板子包，锁定 GStone edition 20285 / game 36806，来源 hash 为 `sha256:627eeec710a42b9e23055b40a99f6759e7eb3647e607fb77cc76239ea9382a95`。
- 可见效果：开局板子列表可读取《身份危机》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：方古、小怪宝、赏金猎人、气球驾驶员含人数或隐藏阵营 setup 路径，首批普通模板先排除；舞蛇人换身份阵营、痢蛭宿主中毒、麻脸巫婆改身份、洗脑师疯狂、理发师交换、提线木偶假身份、疯子假恶魔、炼金术士/失忆者能力等只给说书人待确认建议。
- Before：第 42 行仍是待导入。
- After：第 42 行完成 25 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第三十四板：诡谲异象接入

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`gui-jue-yi-xiang` 智能板子包，锁定 GStone edition 20255 / game 36686，来源 hash 为 `sha256:b999d9d8d9a375152a41286362c7496ed3b0d68fd1e09230fd18c048cc7ad2e3`。
- 可见效果：开局板子列表可读取《诡谲异象（测试中）》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：河伯、叫花子是旅行者，只保留知识/提醒，不进入普通模板；混沌、饕餮、酿酒师含 setup 改动，首批普通模板先排除；逆臣阵营变化、蛊雕中毒/登记、悟道者假身份/变身、典狱长延迟死亡、道士/锦衣卫死亡替代等只给说书人待确认建议。
- Before：第 41 行仍是待导入。
- After：第 41 行完成 27 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第三十三板：盛世奇闻接入

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`sheng-shi-qi-wen` 智能板子包，锁定 GStone edition 20254 / game 36685，来源 hash 为 `sha256:756e333f2ca244ce903e7f4a51e49bc089f8a0bba5c7c4551787f83617f0d4a3`。
- 可见效果：开局板子列表可读取《盛世奇闻（测试中）》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：河伯、叫花子是旅行者，只保留知识/提醒，不进入普通模板；戏子、梼杌、食梦貘、酿酒师含 setup 或全局改动，首批普通模板先排除；典狱长延迟死亡、掮客/和尚/半仙目标改向、打更人防死、店小二醉酒、入殓师转恶魔等只给说书人待确认建议。
- Before：第 40 行仍是待导入。
- After：第 40 行完成 27 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第三十二板处理：全员谜语人分类 + 传奇之夜接入

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 分类：`全员谜语人` 锁定 GStone edition 21218 / game 41548，来源 hash 为 `sha256:194f97f5a1ddbb5105f43aa2664f270167738d46f41def92cf60635409593780`；因 151 角色、包含大量旅行者和传奇，判断为角色池/特殊谜语集合，暂不按普通 7-15 智能板子注册。
- 新增：`chuan-qi-zhi-ye` 智能板子包，锁定 GStone edition 20771 / game 39467，来源 hash 为 `sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d`。
- 可见效果：开局板子列表可读取《传奇之夜》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：赏金猎人会加入额外邪恶镇民，亡骨魔会减少外来者，首批普通模板先不放入；麻脸巫婆改身份、红唇女郎传魔、农夫传承、普卡毒杀、诺-达鲺邻近中毒、珀蓄力三杀、圣徒/呆瓜胜负等只给说书人待确认建议，不自动改状态或判胜负。
- Before：第 38 行未分类，第 39 行仍是待导入。
- After：第 38 行已标记特殊/暂不注册；第 39 行完成 25 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第三十一板：懦夫救星

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`nuo-fu-jiu-xing` 智能板子包，锁定 GStone edition 21232 / game 41567，来源 hash 为 `sha256:69340c25aae5e3f6503b8210f5435a3eeccbcf92a11516157c6453cd44f11dcf`。
- 可见效果：开局板子列表可读取《懦夫救星》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：卡扎力会改变开局构成，首批普通模板先不放入；痢蛭宿主、鹰身女妖疯狂、奥赫选角色杀人、牙噶巴卜暗号死亡、狐媚娘转邪恶、哥布林胜利、精神病患者白天杀人、锦衣卫替死等都只输出待确认建议，不自动改状态或判胜负；麒麟和 Cody 的骗人精只作为传奇规则提示。
- 质量修复：同步修复本轮导入链路中《满堂红》和《寄梦他乡》源码里的中文角色名、能力文案、夜序提示乱码，改为从锁定 GStone JSON 重新写入 UTF-8 内容。
- Before：第 37 行仍是待导入，不能作为智能板子开局；上两板源码层存在中文乱码风险。
- After：27 个角色、来源夜序、setup 提醒、22 套模板、验收测试已接入；最近两板源码中文恢复可读。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第三十板：寄梦他乡

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`ji-meng-ta-xiang` 智能板子包，锁定 GStone edition 21263 / game 41725，来源 hash 为 `sha256:417d353edf620992fb3822f81bf7e12fd1a722a91ee21cd230a9f04f3d9b4fd7`。
- 可见效果：开局板子列表可读取《寄梦他乡》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：村夫、赶尸人、卡扎力会改变开局构成，首批普通模板先不放入；逆臣、理发师、卡扎力涉及身份或阵营变化；造谣者、歌伶、杂技演员、刺客、奸佞、混沌、典狱长涉及死亡；洗脑师涉及疯狂，蛊雕、混沌、店小二涉及毒醉，灯神只作为传奇规则提示，这些都只输出待确认建议，不自动改状态或切阶段。
- Before：第 36 行仍是待导入，不能作为智能板子开局。
- After：26 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试已接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第二十九板：满堂红

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`man-tang-hong` 智能板子包，锁定 GStone edition 21264 / game 41726，来源 hash 为 `sha256:02e9b0b0559b4d5e755fd0e324e54c8aa5fa73d2d497b732e6ef75c5baeaa05f`。
- 可见效果：开局板子列表可读取《满堂红》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：教父和小怪宝会改变开局构成，首批普通模板先不放入；偃师、入殓师、麻脸巫婆、小恶魔涉及身份或阵营变化；赌徒、造谣者、猎手、刺客、奸佞、小怪宝涉及死亡；判官涉及白天提前结束，这些都只输出待确认建议，不自动改状态或切阶段。
- Before：第 35 行仍是待导入，不能作为智能板子开局。
- After：26 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试已接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第二十八板：移花接木

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`yi-hua-jie-mu` 智能板子包，锁定 GStone edition 21265 / game 41727，来源 hash 为 `sha256:9bbb3391e47daa2d60383a66c2bb2a1e3db97110131f1ee05e8c94285d88b3b4`。
- 可见效果：开局板子列表可读取《移花接木》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：村夫、饕餮、提线木偶和灯神不进首批普通模板；13-15 人模板使用教父时显式记录 +1 外来者修正；掮客、半仙、使节、莽夫、蛊雕、鹰身女妖、普卡、典狱长和混沌只输出待确认建议，不自动改状态。
- Before：第 34 行仍是待导入，不能作为智能板子开局。
- After：26 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试已接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第二十七板：胡言乱语

- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
- 新增：`hu-yan-luan-yu` 智能板子包，锁定 GStone edition 21266 / game 41728，来源 hash 为 `sha256:cdbca64798fabca08e25147875ddf9456a3503ed06455dd3a870d8a668104237`。
- 可见效果：开局板子列表可读取《胡言乱语》；AI 配板可用 7-15 人模板；夜晚工作台可按来源夜序筛选在场角色。
- 规则边界：村夫、方古、提线木偶和灯神不进首批普通模板；罂粟种植者、洗脑师、赌徒、牙噶巴卜、诺-达鲺和典狱长只输出待确认建议，不自动改状态。
- Before：第 33 行仍是待导入，不能作为智能板子开局。
- After：26 个角色、来源夜序、setup 提醒、22 套模板、验收文档和测试已接入。
- 验证：定向 pack/质量门/模板构成/AI 投影测试通过；随后执行 `npm run check`。

## 2026-07-22 · 官方魔典 batch-03 第二十六板：九泉颂歌

- 新增 `src/domain/scripts/packs/jiu-quan-song-ge/`，来源锁定为 GStone edition 21271 / game 41733，作者 Cody。
- 司民、狸猫、俑匠、秉笔、阎罗、禁卫军Ⅱ、奥赫已建立稳定 ID；并保留 GStone 首夜/其他夜顺序。
- 教父和饥餮会改变普通开局结构，首批普通模板不自动采用；阎罗、狸猫、理发师、蛊雕、禁卫军Ⅱ、珀、奥赫、政客等只做 AI/夜序提醒。
- 用户可见变化：AI 配板板子列表增加《九泉颂歌》，7-15 人均有已验证模板和对应夜序提醒。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第二十五板：白昼为市

- 新增 `src/domain/scripts/packs/bai-zhou-wei-shi/`，来源锁定为 GStone edition 21285 / game 41747，作者寒水。
- 刀客、秉笔、痴人、卡扎力、牙噶巴卜已建立稳定 ID；`fortune_teller`、`scarlet_woman` 已归一为项目稳定 ID。
- 无神论者和卡扎力会改变普通开局结构，首批普通模板不自动采用；灵言师、红唇女郎、蛊雕、混沌、牙噶巴卜、痴人、魔像等只做 AI/夜序提醒。
- 用户可见变化：AI 配板板子列表增加《白昼为市》，7-15 人均有已验证模板和对应夜序提醒。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 ? 官方魔典 batch-03 第二十四板：沸反盈天

- 新增 `src/domain/scripts/packs/fei-fan-ying-tian/`，来源锁定为 GStone edition 20783 / game 39496，作者字段为空。
- `fang_gu`、`devils_advocate`、`tea_lady`、`high_priestess` 已归一为项目稳定 ID；保留 Po、僵怖、精神病患者等高风险夜序提醒。
- 赏金猎人、方古、教父、巡山人会影响阵营或开局人数，首批普通模板不自动采用；落难少女、解谜大师、水手、旅店老板等只做 AI/夜序提醒。
- 用户可见变化：AI 配板板子列表增加《沸反盈天》，7-15 人均有已验证模板和对应夜序提醒。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
## 2026-07-22 ? 官方魔典 batch-03 第二十三板：枯木逢春

- 新增 `src/domain/scripts/packs/ku-mu-feng-chun/`，来源锁定为 GStone edition 21365 / game 42067，作者 Cody。
- 修行者、报丧女妖、鹰身女妖、卡扎力分别归一为 `shugenja`、`banshee`、`harpy`、`kazali`；`fortune_teller`、`town_crier`、`pit-hag` 已归一为项目稳定 ID。
- 卡扎力和亡骨魔会改变开局人数或产生中毒路径，首批普通模板不自动采用；舞蛇人、麻脸巫婆、理发师、鹰身女妖、呆瓜等只做 AI/夜序提醒。
- 用户可见变化：AI 配板板子列表增加《枯木逢春》，7-15 人均有已验证模板和对应夜序提醒。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。
## 2026-07-22 · 官方魔典 batch-03 第二十二板：莫逆之交

- 新增 `mo-ni-zhi-jiao` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 修行者、食人魔、瘟疫医生、鹰身女妖、奥赫分别建立稳定 ID；`pit-hag`、`lil_monsta` 已归一为项目稳定 ID。
- 男爵、小怪宝、亡骨魔属于 setup-changing 路径，首批普通模板不自动采用；食人魔、哲学家、寡妇、洗脑师、鹰身女妖、刺客、呆瓜、瘟疫医生、奥赫等只做 AI/夜序提醒。
- 本轮继续保持边界：不自动改身份、阵营、死亡、毒醉、疯狂惩罚、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第二十一板：静候佳音

- 新增 `jing-hou-jia-yin` 智能板子包：26 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 修行者保留为 `xiuxingzhe`；戏法师、瘟疫医生、帽匠分别归一为 `alsaahir`、`plaguedoctor`、`hatter`；`fortune_teller`、`pit-hag`、`no_dashii` 已归一为项目稳定 ID。
- 气球驾驶员、巡山人、军团和灯神属于特殊 setup/传奇路径，首批普通模板不自动采用；麻脸巫婆、帽匠、瘟疫医生、戏法师、落难少女、普卡、诺-达鲺等只做 AI/夜序提醒。
- 本轮继续保持边界：不自动改身份、阵营、死亡、毒醉、疯狂惩罚、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第二十板：王不见王

- 新增 `wang-bu-jian-wang` 智能板子包：24 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- `al-hadikhia`、`plague_doctor`、`bounty_hunter` 已归一为 `alhadikhia`、`plaguedoctor`、`bountyhunter`。
- 男爵、气球驾驶员、赏金猎人属于 setup-changing 路径，首批普通模板不自动采用；哈迪寂亚、戏法师、理发师、提线木偶、瘟疫医生、鹰身女妖、报丧女妖等高风险逻辑只做 AI/夜序提醒。
- 本轮继续保持边界：不自动改身份、阵营、死亡、毒醉、疯狂惩罚、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第十九板：子规泣鸣

- 新增 `zi-gui-qi-ming` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 来源中的数字 ID 已映射为 `bingbi`、`daoke`、`xuncha`、`yishi`、`zhen`、`shutong`、`plaguedoctor`、`harpy`、`yanluo`、`guhuoniao`；`lil_monsta` 已归一为 `lilmonsta`。
- 小怪宝和教父属于 setup-changing 路径，首批普通模板不自动采用；阎罗、典狱长、鸩、蛊雕、鹰身女妖、瘟疫医生等高风险技能只做 AI/夜序提醒。
- 本轮继续保持边界：不自动改身份、阵营、死亡、毒醉、疯狂惩罚、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第十八板：雾隐苍生

- 新增 `wu-yin-cang-sheng` 智能板子包：26 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 来源中的数字 ID 已映射为 `harpy`、`plaguedoctor`、`kazali`、`yanshi`、`zhifu`、`yishi`、`zhen`；`pit-hag`、`high_priestess`、`spirit_of_ivory` 已归一为项目稳定 ID。
- 卡扎力属于 setup-changing 恶魔，圣洁之魂是传奇规则，首批普通模板不自动采用；麻脸巫婆、理发师、灵言师、入殓师、蛊雕、混沌、鸩等只做 AI/夜序提醒。
- 本轮继续保持边界：不自动改身份、阵营、死亡、毒醉、疯狂惩罚、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第十七板：日月偕亡

- 新增 `ri-yue-xie-wang` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 来源中的数字 ID 已映射为 `ranfangfangzhu`、`xuncha`、`zhifu`、`shutong`、`aohe`、`baojun` 等稳定 ID。
- 提线木偶有恶魔邻座 setup 约束，首批普通模板不自动采用；红唇女郎、酿酒师、奥赫、暴君、诺-达鲺、涡流等高风险逻辑只做 AI/夜序提醒。
- 本轮继续保持边界：不自动改身份、阵营、死亡、毒醉、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第十六板：势焰交炽

- 新增 `shi-yan-jiao-chi` 智能板子包：来源 26 个角色位折叠为 25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 来源中重复出现的食人族已折叠为一个 `cannibal`；数字 ID 已映射为 `bingbi`、`ranfangfangzhu`、`summoner`。
- 召唤师和饕餮属于 setup-changing 路径，首批普通模板不自动采用；教父模板显式携带外来者修正。
- 舞蛇人、掮客、召唤师、饕餮、涡流、诺-达鲺等只提供夜序/AI 提醒；不自动改身份、阵营、死亡、毒醉、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-22 · 官方魔典 batch-03 第十五板：信口雌黄

- 新增 `xin-kou-ci-huang` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 来源中所有角色都是 GStone 数字 ID，本轮已映射为稳定角色 ID，例如 `banshee`、`boffin`、`yaggababble`、`lordoftyphon`、`kazali`。
- 科学怪人、堤丰之首、卡扎力等会影响开局或恶魔能力的路径只作为 setup 提醒，首批普通模板不自动采用。
- 报丧女妖、帽匠、牙噶巴卜、奥赫等只提供夜序/AI 提醒；不自动改身份、死亡、毒醉、投票或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-21 · 官方魔典 batch-03 第十四板：十三行

- 新增 `shi-san-hang` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 来源自定义角色已从数字 ID 映射为可读稳定 ID，例如 `simin`、`yishi`、`huapi`，避免用 GStone 数字 ID 当项目主键。
- 教父、饕餮等会影响开局人数或构成的路径先作为 setup 提醒，首批普通模板不自动采用。
- 司民、驿使、画皮、半仙、和尚、典狱长等来源自定义角色只提供夜序/AI 提醒；不自动改身份、死亡、毒醉或胜负。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-21 · 官方魔典 batch-03 第十二、第十三板：妙山封仙 / 文武双全

- 新增 `miao-shan-feng-xian` 智能板子包：26 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 新增 `wen-wu-shuang-quan` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- `妙山封仙` 中亡骨魔、方古、工程师、理发师、瘟疫医生等只作为 setup/夜序/AI 提醒；不自动改人数、身份、死亡或毒醉。
- `文武双全` 中气球驾驶员、教父、麻脸巫婆、理发师、恶魔死亡链等只作为提醒；首批普通模板不自动采用 setup 变体。
- `保护我方小怪宝` 含小怪宝保护法等自定义传奇规则，本轮先标为需人工分类，不按普通板子硬注册。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入。

## 2026-07-21 · 官方魔典 batch-03 第十一板：护犊之征

- 新增 `hu-du-zhi-zheng` 智能板子包：27 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 这个板子的恶魔是小怪宝；模板不把小怪宝当作普通“恶魔玩家”座位，而是记录为“无恶魔玩家 +1 爪牙”的开局修正。
- 小怪宝保姆、夜间死亡、蛊雕中毒/登记、赏金猎人额外邪恶、理发师交换、异教领袖/政客胜负等都只作为 AI/夜序提醒，不自动改状态。
- 所属阶段：14.2 官方魔典 132 板 batch-03 继续导入（1/10）。

## 2026-07-21 · 官方魔典 batch-03 第九、第十板：以眼还眼 / 喃喃低语

- 新增 `yi-yan-huan-yan` 智能板子包：26 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 新增 `nan-nan-di-yu` 智能板子包：26 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- `以眼还眼` 中军团、亡骨魔、提线木偶等 setup/特殊局路径只作为提醒，首批普通模板不自动采用。
- `喃喃低语` 中巡山人、方古等会影响人数、身份或阵营的路径只作为提醒，首批普通模板不自动采用。
- 两个板子的死亡、身份、阵营、毒醉、胜负提示均只生成 AI/夜序建议；不会自动写入权威状态。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（10/10）。

## 2026-07-21 · 官方魔典 batch-03 第八板：仇海溺行

- 新增 `chou-hai-ni-xing` 智能板子包：24 个稳定角色 ID、利维坦单恶魔 GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 气球驾驶员、男爵、无神论者、提线木偶等 setup 影响角色本轮先排除在普通模板外，仅作为开局提醒。
- 舞蛇人、麻脸巫婆、落难少女、洗脑师、哥布林、政客、利维坦等只提供 AI/夜序提醒；不自动改身份、阵营、死亡、毒醉或胜负。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（8/10）。

## 2026-07-21 · 官方魔典 batch-03 第七板：心理博弈 v9.0.0

- 新增 `xin-li-bo-yi` 智能板子包：28 个稳定角色 ID（25 个常规身份 + 3 个传奇提醒）、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 赏金猎人、莽夫、帽匠、寡妇、麻脸巫婆、利维坦、亡骨魔等复杂角色只提供 AI/夜序提醒；不自动改阵营、身份、死亡、毒醉或胜负。
- 圣洁之魂、灯神、私货商人只作为公共规则提醒，不进入座位身份或恶魔伪装。
- 私货商人关于“拒不采纳麻脸巫婆与利维坦新增相克规则”的本地规则被记录为开局提醒，不转成自动行为。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（7/10）。

## 2026-07-21 · 官方魔典 batch-03 第六板：夜幕降临

- 新增 `ye-mu-jiang-lin` 智能板子包：24 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 城镇公告员、红唇女郎、魔鬼代言人等来源 ID 已归一成稳定英文 ID，不使用来源数字 ID 当主键。
- 教父的人数修正本轮先只作为 setup 提醒，未进入首批普通模板。
- 涡流、红唇女郎、魔鬼代言人、刺客、精神病患者、呆瓜、畸形秀演员、月之子等只提供 AI/夜序提醒，不自动改死亡、身份、投票、阵营或胜负。
- `将错就错`、`大哥刀我`、`堕落天使` 因角色数低于当前质量门，先标为特殊/小板复核，不硬注册。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（6/10）。

## 2026-07-21 · 官方魔典 batch-03 第五板：浊月毕方

- 新增 `zhuo-yue-bi-fang` 智能板子包：25 个稳定角色 ID、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 阴阳师、煞星、典狱长等 GStone 扩展角色已用稳定语义 ID 接入；不使用来源数字 ID 当主键。
- 军团作为特殊多数军团玩法保留在角色知识和夜序提醒，本轮普通模板不自动采用。
- 13-15 人模板需要第三个爪牙时，教父会显式携带 `+1 外来者` 修正；赶尸人和亡骨魔的外来者修正本轮先只提醒。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（5/10）。

## 2026-07-21 · 官方魔典 batch-03 第四板：秉公办事

- 新增 `bing-gong-ban-shi` 智能板子包：32 个稳定角色 ID（重复灯神相克提醒已合并）、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 教父、穷奇、赶尸人、无神论者等会影响人数或特殊开局的角色，本轮先作为 setup/高风险提醒，不自动套进普通模板。
- 麻脸巫婆、哈迪寂亚、维齐尔、疯子、落难少女、圣洁之魂等只提供 AI/夜序提醒；不自动改身份、阵营、死亡、胜负或毒醉。
- 队列中的“黑人抬棺”因角色数低于当前质量门且大量原创角色，先改为特殊/小板复核，不为追数量硬注册。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（4/10）。

## 2026-07-21 · 官方魔典 batch-03 第三板：似懂非懂

- 新增 `si-dong-fei-dong` 智能板子包：41 个角色（25 个常规身份 + 16 个旅行者）、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 旅行者仅保留为角色知识和夜序提醒，不会进入普通 7-15 人配板模板。
- 赏金猎人、气球驾驶员、教父的人数修正仅作提醒；本轮模板暂不自动采用这些修正。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（3/10）。

## 2026-07-21 · 官方魔典 batch-03 第二板：无何有之乡

- 新增 `wu-he-you-zhi-xiang` 智能板子包：25 个角色、GStone 夜序、22 套 7-15 人 verified 配板草稿。
- 卡扎力、帽匠、酒鬼、村夫、罂粟种植者、瘟疫医生等只提供 AI/夜序提醒；不自动改身份、阵营、死亡或毒醉。
- 军团作为特殊多军团玩法保留在角色知识，本轮普通模板不自动采用。
- 所属阶段：14.1 官方魔典 132 板 batch-03 单板闭环导入（2/10）。

## 2026-07-21 · 官方魔典 132 板导入目标池锁定

### 大白话

这次没有直接把 132 个板子一口气塞进开局列表，而是先把官方魔典里能搜到的 132 条剧本入口锁成“导入队列”。后续会按单板小闭环逐个变成智能板子，避免板子多了以后变成一堆互相打架的规则和模板。

### 用户可见变化

- 现在有一份 132 条官方魔典来源队列，后续导入不会再靠猜。
- 队列区分了官方剧本、缝合剧本、原创角色剧本。
- 已经识别出部分条目不是常规开局板子，而是角色池或需要先人工分类的特殊条目。

### Before / After

- Before：Antiphoton 页面能看到很多脚本，但虚拟列表采样只拿到 128 条，不能解释你说的 132 个来源。
- After：改用官方魔典 `grimoire_edition_list` 接口锁定 8 + 77 + 47 = 132 条，并给每条记录 JSON URL、hash、角色数和导入状态。

### 本轮性质

批量导入前置治理 / 来源锁定 / 防屎山门禁。没有新增可选板子，没有接玩家端、魔典同步或自动规则引擎。

### 风险

- 132 条里有 3 个明确标注“非剧本”的角色池，还有若干角色数异常的特殊条目，不能直接当开局板子。
- 当前只是目标池锁定，真正“可玩智能板子”仍要逐个完成角色、夜序、setup、模板、registry 和测试闭环。

### 验证

- 官方魔典接口三类合计 132 条，所有 JSON URL 抓取成功，错误数 0。
- 已生成 `dev-docs/script-import-work/batch-03/SOURCE_LOCK.md`、`IMPORT_QUEUE_132.md`、`ROLE_CENSUS.md`、`SCRIPT_RULE_CENSUS.md`。
- `npm run check` 通过：lint、419 项测试、build、architecture verification 全部通过。

## 2026-07-21 · 已导入智能板子规则复核加固

### 大白话

这次把已经导入的智能板子又按“AI 能不能真的看懂技能结果”的标准过了一遍。重点不是新增板子，而是防止已有板子里出现乱码、空泛提醒或高风险技能没有落到正确字段。

### 用户可见变化

- Bad Moon Rising / 暗流涌动 和 Sects & Violets / 黯月初升 里原来残留的 `????` 规则提示已替换为中文处理提醒。
- Catfishing / 瓦釜雷鸣 的教父补齐了“外来者死亡后可额外杀人”的技能结果提示。
- 后续导入新智能板子时，如果死亡、毒醉、疯狂、身份/阵营变化等高风险技能没有对应结构化字段，测试会直接拦住。

### Before / After

- Before：部分已导入板子的角色 `research` 虽然有字段，但个别内容是乱码或没有按风险类型落到对应字段。
- After：质量门会同时检查来源、投影、乱码、高风险类别字段和常见角色 ID 别名，避免 AI 拿到不可读或不够具体的规则摘要。

### 本轮性质

规则知识治理 / 质量门补强 / 已导入板子复核。没有做自动技能结算、自动改状态、玩家端或官方魔典同步。

### 风险

- 这仍然不是 100% 官方权威数据库；AI 只给建议，最终仍由说书人确认。
- 后续大量导入板子时仍需要按 `RULE_RESEARCH_PROTOCOL.md` 逐板复核，不能只靠模板生成。

### 验证

- `npm run test -- --run src/domain/scripts/smartScriptPackQuality.test.ts src/domain/scripts/roleResearchProjection.test.ts` 通过。

## 2026-07-21 · 夜晚 AI 角色规则知识补强

### 大白话

这次把“每个智能板子里的角色调研”正式接进 AI 上下文。以后导入新板子时，角色的技能逻辑、可能结果、状态/身份/阵营变化、高风险提醒会自动成为 AI 配板和夜晚 `AI推荐` 的依据，而不是只靠模型自己记忆规则。

### 用户可见变化

- 夜晚 `AI推荐` 会拿到当前唤醒角色、当前草稿、已选目标简况、可选结果、共享复杂角色摘要和当前板子的角色调研摘要。
- AI 只能在已经就绪的结果候选里推荐，死亡、身份、阵营、毒醉、疯狂和延迟结算仍只进入草稿/提醒。
- 新智能板子如果缺角色调研投影，会被测试拦住，不能直接当作可智能游玩的板子。

### Before / After

- Before：复杂角色有共享摘要，板子内也有 `research`，但真实 AI 夜晚请求没有稳定把“当前板子的逐角色调研”带过去。
- After：`roleResearchForAI(scriptId, roleId)` 成为统一投影入口；配板 AI、夜晚 AI、后端 prompt 和质量门都知道这份资料。

### 本轮性质

规则知识治理 / AI 推理质量补强 / 新板子导入门禁。没有做自动技能执行、自动改状态、玩家端或官方魔典同步。

### 风险

- 这仍然不是完整规则引擎；AI 建议必须由说书人确认。
- `roleResearch` 的质量取决于新板子导入时的逐角色复核，不能跳过来源和高风险字段。

### 验证

- `npm run test -- --run src/services/ai/aiContract.test.ts src/services/ai/nightSettlementHttp.test.ts src/services/ai/setupAdviceHttp.test.ts src/domain/scripts/roleResearchProjection.test.ts server/ai/nightSettlementProvider.test.ts server/ai/aiProxyRoutes.test.ts` 通过。

## 2026-07-21 · Antiphoton / Tachyon 剧本来源锁定

### 大白话

你给的两个剧本集合入口已经记录为后续批量导入的来源库，并新增了一个只读采样脚本。现在项目知道：一个是 Antiphoton 中文集合，一个是 botcscripts 大集合，但不会把几千个剧本直接塞进应用。

### 用户可见变化

本轮没有改 UI。开发侧可以用 `scripts/scout-script-collection.mjs` 从来源页面采样剧本标题、encoded script 和角色摘要；后续选板子仍会继续按“智能板子包”逐个接入，而不是把来源列表直接当成可玩板子。

### Before / After

- Before：后续大量板子缺少统一来源入口和读取边界。
- After：已明确来源 A 有 1080 个剧本，来源 B 有 15402 个剧本；读取器原型已能采样两个来源；下一步按批次做角色清点和规则清点。

### 本轮性质

来源治理 / 架构防跑偏 / 开发工具。不是导入新板子，也不是 UI 改动。

### 风险

- 页面数据是前端运行时 + capnp / 二进制，不是普通 JSON；当前读取器只是浏览器采样，不是最终全量解析器。
- 社区剧本不能标成官方剧本，必须保留来源和 hash。

### 验证

- 浏览器实测两个来源页面的剧本数量与首屏内容。
- `node scripts/scout-script-collection.mjs --limit=3` 通过。
- `node scripts/scout-script-collection.mjs --url="https://antiphoton.github.io/botc/zh-cn/collection#book=https%3A%2F%2Ftachyondungeon.xyz%2Fs%2Fbotc%2F0" --limit=3` 通过。
- `npm run check` 通过：68 个测试文件、416 个测试、build、architecture verification 全部通过。

## 2026-07-21 · 多 Agent 批量导入流水线收口

### 大白话

后续如果用多个子 Agent 并行导入板子，每个子 Agent 只能做单板调研和草稿，不能直接修改共享角色库、AI、页面或后端，避免并发写出一堆冲突和屎山。

### 用户可见变化

本轮没有改 UI。它影响的是后续批量导入的安全边界：先清点角色和特殊规则，再单写入集成。

### Before / After

- Before：多 Agent 并行导入缺少明确边界，容易重复写角色、重复写规则或把社区脚本误当成确定规则。
- After：`MULTI_AGENT_SCRIPT_IMPORT_PIPELINE.md` 明确了子 Agent 输出目录、禁止修改文件、角色复用规则、特殊规则清点和停止条件。

### 本轮性质

架构治理 / 批量导入防跑偏。不是导入新板子。

### 风险

- 如果后续跳过 `ROLE_CENSUS.md` 或 `SCRIPT_RULE_CENSUS.md`，仍然会有重复角色和规则冲突风险。

### 验证

- `npm run check` 通过：68 个测试文件、416 个测试、build、architecture verification 全部通过。

## 2026-07-21 · 智能板子名称汉化

### 大白话

之前智能板子能用，但很多板子标题还是英文。现在统一改成“中文显示名 / 英文原名”，开局选板子、常驻面板、夜晚工作台和配板候选里会优先看到中文。

### 用户可见变化

- `Catfishing / 瓦釜雷鸣` 改为 `瓦釜雷鸣 / Catfishing`。
- 官方基础三板、TPI Recommended、Carousel 和第二批社区板子都补了中文显示名。
- AI 配板候选标题会使用斜杠前面的中文名，不再默认取英文。

### Before / After

- Before：很多板子在 UI 里只显示英文，比如 `Insanity and Intuition`。
- After：显示为 `疯狂与直觉 / Insanity and Intuition`，英文原名仍保留用于来源追溯。

### 本轮性质

UI 文案汉化 / 显示层优化。没有改来源 hash、角色 ID、模板、夜序或规则逻辑。

### 风险

- 社区板子多数没有官方中文译名，本轮是项目内中文显示名，不标成官方译名。

### 验证

- `npm run check` 通过。

## 2026-07-21 · 12.33 Insanity and Intuition 智能板子包

### 大白话

`Insanity and Intuition` 已经加入智能板子列表。它支持 7-15 人开局、AI 配板候选、夜序过滤和高风险提醒。

### 用户可见变化

- 开局选板子时会多一个 `Insanity and Intuition`。
- 这个板子有 22 套 7-15 人候选模板。
- 夜晚工作台会按本板角色过滤首夜和其他夜顺序。
- 罂粟种植者、瘟疫医生、爆炸花花公子、方古、维格莫提斯、诺达鲺等只做提醒，不自动改身份、死亡、中毒或胜负。

### Before / After

- Before：第二批第四板还没有来源和可用 pack。
- After：已固定 BotC Scripts 1.2.0 JSON、hash、角色清单、夜序；并建立独立 pack、10 条规则提醒和单板测试。

### 本轮性质

来源锁定 + 新增智能板子 / 多板子扩展 / 架构复用。没有做玩家端、魔典同步、自动技能结算或真实 AI 无人调用。

### 风险

- `Insanity and Intuition` 是社区脚本，当前保持 `needs-review`。
- 爆炸花花公子的处决结果会造成大量死亡；工具只提醒，不会自动清空状态。
- 罂粟种植者和瘟疫医生都涉及说书人信息/能力处理，实桌前建议 spot-check。

### 验证

- `npx vitest run src/domain/scripts/packs/insanity-and-intuition/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts --reporter=verbose` 通过。
- `npm run check` 通过。
- `npx playwright test tests/e2e/session-flow.spec.ts --reporter=line` 通过。

## 2026-07-21 · 12.31 Church of Spies 智能板子包

### 大白话

`Church of Spies` 已经从“来源锁定”变成“可开局使用的智能板子”。它会出现在统一智能板子列表里，支持 7-15 人配板、夜序过滤和角色提示。

### 用户可见变化

- 开局选板子时会多一个 `Church of Spies`。
- 这个板子支持 7-15 人候选配板。
- 夜晚工作台会按本板角色过滤首夜和其他夜顺序。
- 邪教领袖、小精灵、女祭司、驱魔人、提线木偶、间谍、诺达鲺、珀、普卡等复杂点只做提醒，不自动改状态或判胜。

### Before / After

- Before：`Church of Spies` 只有来源、hash 和风险记录，不能开局使用。
- After：已建立独立 pack、22 套 verified 模板、官方夜序、10 条 setup/高风险规则和单板测试，并接入统一质量门。

### 本轮性质

新增智能板子 / 多板子扩展 / 架构复用。没有做玩家端、魔典同步、自动技能结算或真实 AI 无人调用。

### 风险

- `Church of Spies` 是社区脚本，当前保持 `needs-review`。
- `cultleader` 是本轮新增角色事实；后续如果做权威规则复核，应优先 spot-check 阵营变化和邪教胜利的说书人裁量。
- 普卡、诺达鲺、珀和提线木偶的复杂链路只做提醒，不自动写权威状态。

### 验证

- `npx vitest run src/domain/scripts/packs/church-of-spies/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts --reporter=verbose` 通过。
- `npm run check` 通过。
- `npx playwright test tests/e2e/session-flow.spec.ts --reporter=line` 通过。

## 2026-07-21 · 12.30 锁定下一块板子 Church of Spies

### 大白话

第二批第三块板子已经选好：`Church of Spies`。这轮还没有把它放进开局列表，只是先把下载地址、版本、hash、角色、夜序和风险固定下来，下一轮可以按这个清单导入。

### 用户可见变化

- 本轮没有改 UI。
- 下一步可直接进入 `Church of Spies` 智能板子包导入。
- 这块板子会重点补齐 `cultleader`，并继续把 Pixie、High Priestess、Exorcist、Marionette、No Dashii、Po、Pukka 等复杂点控制在“提醒/草稿”层。

### Before / After

- Before：第二批已完成 `Everyone Can Play` 和 `Uncertain Death`，第三块未定。
- After：第三块锁定为 `Church of Spies`，来源固定到 BotC Scripts 1.0.0 JSON，并记录了 hash、官方夜序过滤结果和导入风险。

### 本轮性质

来源锁定 / 导入前审查 / 防跑偏计划。没有新增前端入口，没有写 pack 代码，没有做自动技能结算。

### 风险

- `Church of Spies` 是社区脚本，后续导入后仍应保持 `needs-review`。
- `cultleader` 需要在 12.31 导入时补齐角色事实，不能自动改阵营或判定邪教胜利。
- `marionette`、`nodashii`、`po`、`pukka` 等复杂链路只做提醒，不能自动改身份、阵营、死亡或中毒。

### 验证

- 已下载 `https://www.botcscripts.com/script/2378/1.0.0/download`。
- 已计算 JSON sha256：`dd5fea53947a5818eacc406e2fc09b3595815b3588567d7cc1b4d541acbe837d`。
- 已按官方 `nightsheet.json` 过滤首夜和其他夜顺序。
- `npm run check` 通过。

## 2026-07-21 · 12.29 Uncertain Death 智能板子包

### 大白话

`Uncertain Death` 已经从“来源锁定”变成“可开局使用的智能板子”。它会出现在统一智能板子 registry 里，支持 7-15 人配板、夜序过滤和角色提示。

### 用户可见变化

- 开局选板子时会多一个 `Uncertain Death`。
- 这个板子支持 7-15 人候选配板。
- 夜晚工作台会按本板角色过滤首夜和其他夜顺序。
- 教父、疯子、提线木偶、普卡、诺达鲺、红唇女郎、心上人、陌客等只做高风险提醒，不自动改状态。

### Before / After

- Before：`Uncertain Death` 只有来源、hash 和风险记录，不能开局使用。
- After：已建立独立 pack、22 套 verified 模板、官方夜序和单板测试，并接入统一质量门。

### 本轮性质

新增智能板子 / 多板子扩展 / 架构复用。没有做玩家端、魔典同步、自动技能结算或真实 AI 无人调用。

### 风险

- `Uncertain Death` 是社区脚本，当前保持 `needs-review`。
- `marionette` 不是官方基础三板角色，复用了当前已接入板子的角色事实；后续如果做权威规则复核，应优先检查这个角色。
- 普卡和诺达鲺的中毒/死亡链路复杂，本轮只做提醒，不自动写权威状态。

### 验证

- `npx vitest run src/domain/scripts/packs/uncertain-death/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts --reporter=verbose` 通过。
- `npm run check` 通过。

## 2026-07-21 · 12.28 锁定下一块板子 Uncertain Death

### 大白话

第二批下一块板子已经选好：`Uncertain Death`。这轮还没有把它放进前端开局列表，只是先把来源、版本、hash、角色清单、夜序和风险锁死，避免后面导入时靠猜。

### 用户可见变化

- 本轮没有改 UI。
- 下一步可直接进入 `Uncertain Death` 智能板子包导入。
- 这块板子适合继续扩展 7-15 人开局，因为它的角色都能复用当前已有的基础三板角色事实。

### Before / After

- Before：第二批只有 `Everyone Can Play` 已接入，下一块板子未定。
- After：下一块锁定为 `Uncertain Death`，来源固定到 BotC Scripts 1.0.1 JSON，并记录了 hash 和导入风险。

### 本轮性质

来源锁定 / 导入前审查 / 防跑偏计划。没有新增前端入口，没有写 pack 代码，没有做自动技能结算。

### 风险

- `Uncertain Death` 是社区脚本，后续导入后仍应保持 `needs-review`。
- `lunatic`、`marionette`、`pukka`、`nodashii`、`godfather`、`scarletwoman` 都只能做提醒，不能自动改身份、阵营、死亡或中毒。

### 验证

- 已下载 `https://www.botcscripts.com/script/68/1.0.1/download`。
- 已计算 JSON sha256：`05d854f75fb7ea6821b111368ad2c9d55ee5b736cc44578eea1bb84e8b0d6e2c`。
- 已按官方 `nightsheet.json` 过滤首夜和其他夜顺序。

## 2026-07-21 · 12.27 第二批第一板 Everyone Can Play

### 大白话

第二批智能板子开始了。本轮先接入 `Everyone Can Play`。它的角色大多来自官方基础三板，所以没有复制第二份角色技能库，而是复用已经确认过的角色事实。

### 用户可见变化

- 开局选板子时会多一个 `Everyone Can Play`。
- 这个板子支持 7-15 人配板候选。
- 夜晚工作台能按本板在场角色过滤夜序。
- 男爵、酒鬼、红鲱鱼、魔鬼代言人、红唇女郎、小恶魔、圣徒、月之子、市长等风险点只做提醒，不自动改状态。

### Before / After

- Before：第一批 10 板已完成，但第二批还没开始。
- After：第二批第一块板子已进入统一 `SmartScriptPack` registry；角色事实复用已有来源，避免多份技能文案冲突。

### 本轮性质

新增智能板子 / 架构复用 / 多板子能力扩展。没有做玩家端、魔典同步、自动技能结算或真实 AI 无人调用。

### 风险

- `Everyone Can Play` 是社区脚本，当前保持 `needs-review`，需要实桌 spot-check 后才考虑升级。
- 旧历史文档中已有编码噪音，本轮没有做无关清理。

### 验证

- `npx vitest run src/domain/scripts/packs/everyone-can-play/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/batch01Acceptance.test.ts --reporter=verbose` 通过。
- `npm run check` 通过。

## 2026-07-21 · 12.24 复杂角色 Wave D 调研包

### 大白话
这次补完高自由裁量和信息类复杂角色，一共 12 个：失忆者、艺术家、博学者、哲学家、食人族、筑梦师、占卜师、洗衣妇、图书管理员、调查员、厨师、共情者。

### 用户可见变化
- 本轮没有改 UI。
- 后续 AI 推荐可以更清楚地区分“帮说书人起草信息”和“说书人最终决定信息”。
- 对博学者、艺术家、失忆者这类自由度高的角色，已经明确：AI 只能起草和提醒，不能自动生成权威答案。

### Before / After
- Before：信息角色容易让 AI 直接编答案，现场风险较高。
- After：每个角色都写明必填输入、AI 可做/不可做和现场核对清单。

### 本轮性质
规则调研 / 信息边界治理 / AI 草稿依据准备。没有自动生成权威信息，没有自动发送，没有新增板子。

### 风险
- 这些记录仍是 reviewed，不是 UI 功能。
- 下一步如果要让夜间工作台引用这些调研，需要单独做结构化摘要和测试。

### 验证
- 已查官方角色数据。
- `npm run check` 通过。

## 2026-07-21 · 12.23 复杂角色 Wave C 调研包

### 大白话
这次处理死亡、免死、复活和延迟死亡类复杂角色，一共 15 个：赌徒、流言者、祖母、水手、旅店老板、教授、茶艺师、弄臣、月之子、刺客、僵怖、珀、沙巴洛斯、阿哈迪基亚、狼人。

### 用户可见变化
- 本轮没有改 UI。
- 后续夜间 AI 推荐可以更清楚地区分“记录选择”“提醒核对”“说书人确认死亡/复活”。
- 对僵怖、珀、沙巴洛斯、阿哈迪基亚、狼人这类容易把局面弄乱的角色，已经明确：工具只能提醒，不自动杀人、不自动复活、不自动判胜。

### Before / After
- Before：死亡类复杂角色容易被误做成“点击结果就直接改状态”的规则引擎。
- After：每个角色单独写明必填输入、状态影响、AI 可做/不可做和现场核对清单。

### 本轮性质
规则调研 / 死亡结算边界治理 / AI 草稿依据准备。没有自动技能结算，没有新增板子，没有玩家端，没有魔典同步。

### 风险
- 这些记录仍是 reviewed，不是自动结算代码。
- 后续如果要接入夜间 UI，需要继续保持“AI 草稿 + 说书人确认”的边界。

### 验证
- 已查官方角色数据。
- `npm run check` 通过。

## 2026-07-21 · 12.22 复杂角色 Wave B 调研包

### 大白话
这次继续处理复杂角色，补上疯狂、隐藏信息和玩家告知类角色：洗脑师、畸形秀演员、小精灵、少女、猎人、告密者、秘密研究员。

### 用户可见变化
- 本轮没有改 UI。
- 后续这些角色在夜晚提示、AI 推荐和日志草稿里会有更明确的“该问什么、该提醒什么、不能自动做什么”的依据。
- 洗脑师和畸形秀演员明确保持说书人裁量：工具只能提醒，不能自动处决。
- 少女相关角色明确保持隐藏信息边界：工具不能自动判胜，也不能泄露身份。

### Before / After
- Before：疯狂、少女链路、告密者伪装和秘密研究员能力容易和普通技能记录混在一起。
- After：每个角色都有独立调研记录，先服务说书人核对，再给后续 AI 草稿引用。

### 本轮性质
规则调研 / 隐藏信息边界治理 / AI 草稿依据准备。没有自动处决、没有自动判胜、没有玩家端、没有魔典同步。

### 风险
- 这些记录是 reviewed，不是自动结算规则。
- 后续要接 UI 或 AI 结构化字段时，必须继续保留说书人确认边界。

### 验证
- 已查官方角色数据与官方 Wiki 页面。
- `npm run check` 通过。

## 2026-07-21 · 12.21 复杂角色 Wave A 调研包

### 大白话
这次开始真正处理复杂角色，先把最容易影响身份、阵营和恶魔更替的 6 个角色单独写成调研记录：舞蛇人、麻脸巫婆、方古、小恶魔、猩红女郎、亡骨魔。

### 用户可见变化
- 本轮没有改 UI。
- 后续 AI 推荐和夜间提示可以逐步引用这些调研记录，避免每个板子重复写一套角色解释。
- 特别修正了一个关键点：舞蛇人命中恶魔后，新舞蛇人应按“中毒”语义处理，不是醉酒。
- 麻脸巫婆记录中明确：通常只改角色，不自动改阵营；创造新恶魔时死亡由说书人裁量。

### Before / After
- Before：这些复杂角色主要散在各个板子的 `research` 字段里，容易重复和不一致。
- After：每个复杂角色有独立调研记录，先给人看，再逐步提炼到结构化摘要。

### 本轮性质
规则调研 / 架构治理 / AI 草稿依据准备。没有自动技能结算，没有玩家端，没有魔典同步，没有新增板子。

### 风险
- 这些记录是 reviewed，不是“自动结算规则”。
- 后续如果要把内容提炼进代码，还需要单独做结构化字段更新和测试。

### 验证
- 已查官方角色数据与官方 Wiki 页面。
- `npm run check` 通过。

## 2026-07-21 · 12.20 复杂角色共享调研计划

### 大白话
这次没有继续盲目加板子，而是先把“复杂角色怎么调研、怎么复用、怎么避免写成规则引擎”定下来。以后舞蛇人、麻脸巫婆、方古、洗脑师、赌徒这类角色，不应该每个板子各写一套解释，而是先形成共享调研记录，再给板子和 AI 推荐引用。

### 用户可见变化
- 新增复杂角色调研路线：先处理身份、阵营、恶魔更替，再处理疯狂、死亡、信息类角色。
- 新增逐角色调研目录，后续每个复杂角色都会有独立记录。
- 无人推进索引已经把下一步切到 `12.21 复杂角色 Wave A 调研包`。
- 本轮不改界面，所以用户操作界面不会变化。

### Before / After
- Before：复杂角色资料散落在不同板子里，后续多板子会容易重复、冲突或膨胀。
- After：复杂角色先走共享调研，再提炼为结构化摘要；页面仍只读取摘要，不写角色专属自动结算分支。

### 本轮性质
架构治理 / 调研计划 / 防屎山边界。没有新增板子，没有自动技能结算，没有玩家端，没有魔典同步。

### 风险
- 当前只是调研计划，不代表复杂角色规则已经全部复核完成。
- 下一阶段逐角色调研必须查官方/权威来源，不能只靠已有代码或 AI 记忆。

### 验证
- 已生成本地复杂角色优先级统计：`artifacts/reports/complex-role-priority-2026-07-21.json`。
- 最终检查见本轮交付说明。

## 2026-07-20 · 12.19 AI 推荐追问与补齐提示

### 大白话
这次继续优化夜晚里的 `AI推荐`。以前 AI 只告诉你“缺少玩家、缺少角色”，现在会直接告诉你缺什么、应该去哪个区域补，补完后再重新推荐。

### 用户可见变化
- 夜晚工作台点 `AI推荐`，如果信息不够，`辅助判断` 会显示 `AI缺少`。
- `AI缺少` 下方会列出具体补齐动作，例如：
  - `玩家`：在上方目标区点玩家号码。
  - `声称角色`：在角色区选择本次声明或猜测。
- 同一缺项状态下，按钮会显示 `重新推荐`。
- 这些提示不会写日志，也不会自动改结果。

### Before / After
- Before：只显示一行缺项，现场还要自己想“我该去哪补”。
- After：缺项变成小清单，直接告诉说书人下一步点哪里。

### 本轮性质
UI 体验优化 / AI 草稿提示优化 / 测试加固。没有导入新板子，没有玩家端，没有魔典同步，没有自动技能结算。

### 风险
- 这是通用缺项提示，不代表 AI 已经理解所有复杂角色。
- 复杂角色仍需要规则调研和说书人确认。

### 验证
- `npx vitest run src/features/night-workbench/components/SettlementAssistPanel.test.tsx src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose` 通过：16 个测试。
- `npx playwright test tests/e2e/night-workbench.spec.ts --reporter=line` 通过：7 个浏览器用例。
- `npm run check` 已作为最终检查运行。

## 2026-07-20 · 12.18 完整现场流程实测

### 大白话
这次没有继续改界面，也没有新增板子，而是把“说书人现场真的会怎么点”跑了一遍：从 AI 设置、开场白、AI 配板、发身份入口、夜晚、白天、投票、处决、日记，一直到保存本局、历史复盘、重置后重新开局。

### 用户可见变化
- 本轮没有新增按钮或改 UI。
- 已确认现有入口能串成完整主持流程，不是零散页面。
- 重置后可以重新选择板子和人数，再进入配板与发身份流程。

### Before / After
- Before：单个页面和单个功能基本都测过，但还缺一份“整局实战链路”的明确证据。
- After：完整人工点击链路、结束复盘链路和昼夜边界链路都已经有 Playwright 证据。

### 本轮性质
验收治理 / 浏览器实测 / 文档收口。没有新增玩家端、没有魔典同步、没有自动规则引擎，也没有导入第二批板子。

### 风险
- 这是本机浏览器自动化验收，不等于 OPPO Pad 实机横屏最终体验。
- 真实 AI live 调用仍需要用户手动点击验证，不纳入无人测试。

### 验证
- `npx playwright test tests/e2e/manual-click-smoke.spec.ts tests/e2e/game-end-prototype.spec.ts --reporter=line` 通过：2 个浏览器用例。
- `npx playwright test tests/e2e/session-flow.spec.ts --reporter=line` 通过：14 个浏览器用例。

## 2026-07-20 · 12.16 AI 推荐体验优化

### 大白话
这次没有继续导入新板子，而是把已经接好的 `AI推荐` 变得更像现场工具：配板页能直接看到 AI 首选和排序，夜晚页把本地核对与 AI 草稿合并到一个辅助判断区，减少重复提示。

### 用户可见变化
- 配板候选页点击 `AI推荐` 后，会出现“首选”卡片，并给候选打上 `AI首选` / `AI第2` 等标记。
- `AI推荐` 点过后变成 `重新推荐`，避免不知道能不能再生成。
- 进入单个配板详情时，标题改成 `组合详情`，不再暗示详情页一定来自 AI。
- 夜间工作台的赌徒核对、AI依据、AI原建议合并到 `辅助判断` 区；结果仍要点 `确认本项` 才写入。

### Before / After
- Before：AI 配板只显示一条短提醒，不容易看出排序变化；夜间结算有“核对建议”和“AI依据”两个分散信息块。
- After：配板首选、候选排序和警告更集中；夜间辅助判断集中展示，AI 仍只填草稿。

### 本轮性质
UI 体验优化 / 测试加固 / 文档收口。没有导入第二批板子，没有玩家端，没有魔典同步，没有自动技能结算，也没有无人真实 AI 调用。

### 风险
- AI 推荐仍可能和模板原顺序一致，这是允许结果。
- 夜间复杂角色仍依赖说书人判断；本轮只优化展示，不扩展角色规则引擎。

### 验证
- `npx vitest run src/features/setup/SetupCandidateBrowser.test.tsx src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose` 通过：15 个测试。
- `npm run check` 通过：61 个测试文件、382 个测试、build 和架构边界检查。
- `npx playwright test tests/e2e/night-workbench.spec.ts tests/e2e/manual-click-smoke.spec.ts` 通过：8 个浏览器用例；顺手修复了 smoke 脚本里的旧按钮文案。
## 2026-07-20 · 12.15 第一批 10 板总验收

### 大白话
这次不是继续加新板子，而是把第一批 10 个智能板子整体扫了一遍：确认它们都能进入开局、按人数生成候选，并且不会因为模板或人数修正问题卡死配板。

### 用户可见变化
- 开局页选择第一批 10 个板子后，都能走到 12 人配板候选。
- A Grimm Chorus 的召唤师模板不再给出恶魔角色当伪装，改为未在场镇民伪装。
- 可选人数修正不会再被默认误套用；只有模板明确带了修正，才会改变目标阵营人数。

### Before / After
- Before：A Grimm Chorus 的召唤师模板会被“恶魔伪装可用”拦住；Punchy 等板子的可选人数修正可能被误当成默认修正。
- After：第一批 10 板在 7-15 人候选生成、12 人可见开局路径、基础质量门上全部通过。

### 本轮性质
总验收 / 修复 / 测试加固。没有新增玩家端、没有官方魔典同步、没有自动技能结算，也没有把真实 AI live 调用纳入无人验收。

### 风险
- 社区/TPI/Carousel 板子仍保持 `needs-review`，首次实战前仍建议说书人 spot-check 关键角色。
- 当前模板库是“合规可玩”的初始库，不代表每个人数都有大量高丰富度模板。

### 验证
- `npx vitest run src/features/setup/smartScriptSetupCandidates.test.ts --reporter=verbose` 通过：101 个测试。
- `npx vitest run src/domain/scripts/batch01Acceptance.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/features/setup/smartScriptSetupCandidates.test.ts` 通过：120 个测试。
- `npx playwright test tests/e2e/batch01-script-setup.spec.ts` 通过：第一批 10 板可见开局路径。
- `npm run check` 通过：60 个测试文件、381 个测试和架构边界检查。
## 2026-07-20 · 12.9 Lunar Eclipse / 智能板子包

### 大白话
这次把 TPI Recommended 的 Lunar Eclipse 接成了可用智能板子包。它现在能进入统一板子 registry，支持 7-15 人模板、夜序筛选、中文能力摘要和高风险提醒。

### 用户可见变化
- 开局 / AI 配板候选可以读取 Lunar Eclipse。
- 新增 31 个角色事实：13 镇民、4 外来者、5 爪牙、3 恶魔、5 旅行者、1 传奇。
- 旅行者和象牙之灵保留事实与夜序，但不进入常规 7-15 人配板模板。
- 新增官方 night sheet 过滤后的首夜/其他夜顺序。
- 新增 22 套 verified 模板，覆盖 7-15 人。
- 疯子、提线木偶、魔术师、狼人、僵怖、理发师、解谜大师、象牙之灵都只提供提醒和记录建议，不自动改权威状态。

### Before / After
- Before：Lunar Eclipse 只有来源和 hash 记录，不能进入开局列表或智能配板模板。
- After：新增 `lunar-eclipse` pack，可被统一 registry、配板候选和夜晚工作台读取。

### 本轮性质
新增 domain pack / 模板 / 中文能力摘要 / 验收文档。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- Pack 仍标记 `needs-review`，因为这是 TPI Recommended 社区板，建议说书人首次实战前 spot-check。
- 提线木偶座位相邻、疯子信息流、狼人停刀、僵怖登记死亡都不能自动结算，需要说书人核对。
- 旅行者和传奇角色暂不进入常规模板，后续若支持旅行者开局需要单独设计。

### 验证
- `npx vitest run src/domain/scripts/packs/lunar-eclipse/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts` 通过：3 个测试文件，18 个测试。
- `npm run check` 通过后，本条记录作为 12.9 完成证据。

## 2026-07-20 · 12.8 Hide & Seek / 智能板子包

### 大白话
这次把 TPI Recommended 的 Hide & Seek 接成了可用智能板子包。它现在能进入统一板子 registry，支持 7-15 人模板、夜序筛选、中文能力摘要和高风险提醒。

### 用户可见变化
- 开局 / AI 配板候选可以读取 Hide & Seek。
- 新增 25 个角色事实：13 镇民、4 外来者、4 爪牙、4 恶魔。
- 新增官方 night sheet 过滤后的首夜/其他夜顺序。
- 新增 22 套 verified 模板，覆盖 7-15 人。
- 小精灵、落难少女、猎人、传教士、灵言师、普卡、维格莫提斯和奥赫都只提供提醒和记录建议，不自动改权威状态。

### Before / After
- Before：Hide & Seek 只有来源和 hash 记录，不能进入开局列表或智能配板模板。
- After：新增 `hide-and-seek` pack，可被统一 registry、配板候选和夜晚工作台读取。

### 本轮性质
新增 domain pack / 模板 / 中文能力摘要 / 验收文档。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- Pack 仍标记 `needs-review`，因为这是 TPI Recommended 社区板，建议说书人首次实战前 spot-check。
- 小精灵、落难少女和猎人的隐藏信息链路必须由说书人核对，工具只做提醒。
- 模板是人工设计的合规模板，不代表唯一最佳配板。

### 验证
- `npx vitest run src/domain/scripts/packs/hide-and-seek/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts` 通过：3 个测试文件，16 个测试。
- `npm run check` 通过后，本条记录作为 12.8 完成证据。

## 2026-07-20 · 12.7 A Grimm Chorus / 智能板子包

### 大白话
这次把 TPI Recommended 的 A Grimm Chorus 接成了可用智能板子包。它现在能进入统一板子 registry，支持 7-15 人模板、夜序筛选、中文能力摘要和高风险提醒。

### 用户可见变化
- 开局 / AI 配板候选可以读取 A Grimm Chorus。
- 新增 30 个角色事实：13 镇民、4 外来者、4 爪牙、4 恶魔、5 旅行者。
- 旅行者保留角色事实和夜序，但不进入常规 7-15 人配板模板。
- 新增官方 night sheet 过滤后的首夜/其他夜顺序。
- 新增 22 套 verified 模板，覆盖 7-15 人。
- 召唤师、呓语魔、奥赫、落难少女、魔像、政客等只提供提醒和记录建议，不自动改权威状态。

### Before / After
- Before：A Grimm Chorus 只有来源和 hash 记录，不能进入开局列表或智能配板模板。
- After：新增 `a-grimm-chorus` pack，可被统一 registry、配板候选和夜晚工作台读取。

### 本轮性质
新增 domain pack / 模板 / 中文能力摘要 / 验收文档。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- Pack 仍标记 `needs-review`，因为这是 TPI Recommended 社区板，建议说书人首次实战前 spot-check。
- Script Tool 作者字段为 Zets，TPI 页面当前显示 Lachlan；该差异已写入 acceptance，不影响角色规则。
- 旅行者暂不进入常规模板，后续若支持旅行者开局需要单独设计。

### 验证
- `npx vitest run src/domain/scripts/packs/a-grimm-chorus/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts` 通过：3 个测试文件，16 个测试。
- `npm run check` 通过后，本条记录作为 12.7 完成证据。

## 2026-07-20 · 12.6 One in one out / 智能板子包

### 大白话
这次把 TPI Recommended 的 One in one out 接成了智能板子包。它现在有独立角色事实、setup 规则、7-15 人模板和验收记录，可以进入后续开局/配板/夜序统一流程。

### 用户可见变化
- 开局 / AI 配板候选可以从 registry 读取 One in one out。
- 新增 26 个角色事实：13 镇民、4 外来者、4 爪牙、4 恶魔、1 传奇。
- 新增首夜 / 其他夜官方 night sheet 顺序。
- 新增 7-15 人 verified 模板，共 22 套。
- 舞蛇人、食人魔、灵言师、卡扎力、方古、奥赫都保留高风险提醒。
- `spiritofivory / 象牙之灵` 只作为传奇规则约束，不进入座位身份或恶魔伪装。

### Before / After
- Before：One in one out 只有来源记录，不能作为智能板子使用。
- After：新增 `one-in-one-out` pack，可被统一 registry、setup 模板和夜序读取。

### 本轮性质
新增 domain pack / 模板 / 验收文档 / 中文能力摘要。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- Pack 是 TPI Recommended 社区板，整体 `knowledgeStatus` 仍为 `needs-review`，建议说书人首次实战前 spot-check。
- 模板是人工设计的合规模板，不代表唯一最佳配板。
- 身份/阵营/死亡变化仍必须由说书人确认。

### 验证
- `npx vitest run src/domain/scripts/packs/one-in-one-out/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts` 通过：3 个测试文件，15 个测试。
- `npm run check` 通过：完成 12.6 全量检查。

## 2026-07-20 · 12.3 Sects & Violets / 智能板子包

### 大白话
这次把官方基础板 Sects & Violets / 梦殒春宵接成了智能板子包。它现在具备角色清单、官方夜序、setup 风险提示、7-15 人模板和基础验收记录。

### 用户可见变化
- 新增 Sects & Violets 的 30 个角色事实。
- 新增首夜/其他夜官方 night sheet 顺序。
- 新增 7-15 人 verified 模板，共 22 套。
- 增加 Fang Gu、Vigormortis、Evil Twin、Snake Charmer 等关键提醒。
- 舞蛇人使用中文名“舞蛇人”，并保留交换后原恶魔醉酒的高风险备注。

### Before / After
- Before：S&V 没有独立智能板子包，夜序和配板无法进入统一事实源。
- After：S&V 已有独立 pack，可被后续 UI/AI 配板接入统一读取。

### 本轮性质
新增 domain pack / 模板 / 验收文档。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- 当前只是 domain pack 完成；UI 中三板选择和浏览器验收放到 12.4。
- S&V 复杂规则只做提示和知识标记，不做自动结算。
- Vite 仍提示部分 chunk 超过 500 kB，这是既有构建体积提示，不阻塞本轮。

### 验证
- `npx vitest run src/domain/scripts/packs/sects-and-violets/index.test.ts src/domain/setup-templates/composition.test.ts` 通过：2 个测试文件，11 个测试。
- `npm run check` 通过：44 个测试文件，195 个测试，build 和 architecture verification 通过。

## 2026-07-20 · 12.2 Bad Moon Rising / 智能板子包

### 大白话
这次把官方基础板 Bad Moon Rising / 黯月初升接成了智能板子包，重点覆盖死亡、保护、复活、额外死亡和高风险夜晚记录。

### 用户可见变化
- 新增 Bad Moon Rising 的 30 个角色事实。
- 新增首夜/其他夜官方 night sheet 顺序。
- 新增 7-15 人 verified 模板，共 22 套。
- 增加 Godfather、Lunatic、Apprentice 等 setup/高风险提醒。

### Before / After
- Before：BMR 没有独立智能板子包，不能按统一方式参与配板和夜序。
- After：BMR 已有独立 pack，可供后续 UI/AI 配板读取。

### 本轮性质
新增 domain pack / 模板 / 验收文档。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- 当前只是 domain pack 完成；UI 中三板选择和浏览器验收放到 12.4。
- BMR 复杂死亡/保护链只做提示和知识标记，不做自动结算。
- Vite 仍提示部分 chunk 超过 500 kB，这是既有构建体积提示，不阻塞本轮。

### 验证
- `npx vitest run src/domain/scripts/packs/bad-moon-rising/index.test.ts src/domain/setup-templates/composition.test.ts` 通过：2 个测试文件，10 个测试。
- `npm run check` 通过：43 个测试文件，188 个测试，build 和 architecture verification 通过。

## 2026-07-20 · 12.1 Trouble Brewing / 智能板子包

### 大白话
这次把官方基础板 Trouble Brewing / 暗流涌动接成了智能板子包，作为后续多板子、多人数和 AI 配板的基础样板。

### 用户可见变化
- 新增 Trouble Brewing 的 27 个角色事实。
- 新增首夜/其他夜官方 night sheet 顺序。
- 新增 7-15 人 verified 模板，共 22 套。
- 增加 Baron、Drunk、Fortune Teller 等基础 setup 提醒。

### Before / After
- Before：第一批 10 个板子只有计划，Trouble Brewing 还不能作为智能板子读取。
- After：Trouble Brewing 已有独立 pack，可被后续 UI/AI 配板统一读取。

### 本轮性质
新增 domain pack / 模板 / 验收文档。没有接真实 AI、没有自动结算、没有玩家端、没有魔典同步。

### 风险
- 当前只是 domain pack 完成；UI 中三板选择和浏览器验收放到 12.4。
- Vite 仍提示部分 chunk 超过 500 kB，这是既有构建体积提示，不阻塞本轮。
- 中文展示名可以在后续验收时继续微调，主键仍使用稳定英文 roleId。

### 验证
- `npx vitest run src/domain/scripts/packs/trouble-brewing/index.test.ts src/domain/setup-templates/composition.test.ts` 通过：2 个测试文件，9 个测试。
- `npm run check` 通过：42 个测试文件，181 个测试，build 和 architecture verification 通过。


## 2026-07-19 · 批量智能板子导入无人推进总计划

### 大白话
这次把“以后怎么大量导入板子”写成了中文总计划：不是一次性把很多 JSON 塞进代码，而是每个板子都从来源、规则、夜序、setup、模板、UI 可用到收口审计走一个小闭环。

### 用户可见变化
- 当前还没有新增可玩的板子；这是导入前的无人推进规则和路线图。
- 下一步明确从 `12.1 Trouble Brewing 智能板子包` 开始。
- 完成 Trouble Brewing 后，如果没有触发停止条件，可以继续 Bad Moon Rising 和 Sects & Violets；完成官方基础三板后会停下来让你验收。

### Before / After
- Before：已有第一批 10 个板子的名单，但缺少“以后大量导入时的总流水线”。
- After：新增批量导入总计划，规定候选池、来源归档、角色事实、夜序、setup、模板、registry、UI 可用和收口审计。

### 本轮性质
文档 / 无人推进计划 / 架构边界治理。没有 UI 改动，没有业务代码改动，没有真实网络调用。

### 风险
- 计划完成不等于板子已可玩。
- 之后每个板子仍需要逐角色核对；不确定规则必须标 `needs-review`。
- 真实 AI、VPS、自动技能结算仍然是阻塞项，不能顺手做。

### 验证
- 已创建 `UNATTENDED_MASS_SCRIPT_IMPORT_PLAN.md`。
- 已更新 `README.md` 文档索引。
- 已更新 `UNATTENDED_TASK_INDEX.md`，新增 `12.0a` 并保留当前下一项为 12.1 Trouble Brewing 智能板子包。

## 2026-07-19 · 第一批 10 个智能板子导入计划

### 大白话
这次没有直接把 10 个板子塞进代码，而是先把“哪些板子先做、按什么顺序做、每个板子做到什么程度才算可用”固定下来，避免后面多板子越来越乱。

### 用户可见变化
- 下一阶段可以从 Trouble Brewing / 暗流涌动开始做第一个新增智能板子包。
- 10 个板子的导入顺序已经明确：官方基础三板优先，然后 TPI 推荐社区板，最后 Carousel 高复杂板。
- 真实 AI、VPS、夜间自动结算仍没有被顺手开启。

### Before / After
- Before：只确定“可以开始导入板子”，但没有明确第一批名单和停止条件。
- After：第一批 10 个板子、导入顺序、来源等级、验收门槛、模板数量目标和停止条件都写入文档与任务索引。

### 本轮性质
文档 / 计划 / 架构边界治理。没有 UI 改动，没有业务代码改动，没有真实网络调用。

### 风险
- 具体板子规则还没有逐个落地；计划完成不等于 10 个板子已经可玩。
- TPI Recommended / Carousel Collection 是官方页面推荐或收录的社区脚本，不能标成官方基础版。
- 从 12.1 开始，每个板子仍必须逐角色核对规则和夜序。

### 验证
- 已创建 `SCRIPT_IMPORT_BATCH_01_PLAN.md`。
- 已更新 `README.md` 文档索引。
- 已更新 `UNATTENDED_TASK_INDEX.md`，当前下一项为 `12.1 Trouble Brewing 智能板子包`。

## 2026-07-19 · 阶段 10.9.2-10.9.5 AI Provider 安全收口

### 大白话
这次把“真实 AI 接入前的安全通道”跑完了：后端已经有 OpenAI 兼容 client 的骨架和 mock 测试，赛后复盘可以走后端草稿路径，前端能显示后端 AI 状态；但没有真实联网、没有真实 Key、没有产生费用。

### 用户可见变化
- AI 设置页在选择本地后端 HTTP 时，会显示后端 AI 是否启用、是否配置 Key。
- 复盘面板在 HTTP 模式下会尝试请求后端复盘草稿；请求失败会自动显示本地草稿，不影响查看历史归档。
- 本轮新增了 10.9 收口审计和给外部大模型审查用的提示词。

### Before / After
- Before：10.9.1 只有后端脱敏设置接口，复盘还没有真正走后端 provider 形状。
- After：复盘 route 已有可注入 provider 路径；前端和后端都保留本地/fake 回退，真实调用仍被挡在 `10.9-live`。

### 本轮性质
后端基础设施 / 前端安全接线 / 收口审计。没有真实 AI 调用，没有新增 SDK，没有保存 API Key，没有做夜间自动结算。

### 风险
- `openai-compatible` 目前只通过 mock fetch 验证，不代表真实 provider 已可用。
- 真实 Key、真实网络调用和费用确认仍必须单独授权。
- 新增智能板子导入可以作为下一阶段，但不能绕过规则调研和角色验收。

### 验证
- `npx vitest run server/ai` 通过。
- `npx vitest run server/ai server/archive/httpArchiveRoutes.test.ts server/archive/archiveBackend.test.ts` 通过。
- `npx vitest run src/services/ai/gameReviewHttp.test.ts src/services/ai/aiService.test.ts src/services/settings/settingsService.test.ts src/features/game-end/GameEndSheet.test.tsx` 通过。
- 最终 `npm run test:server`、`npm run smoke:backend`、`npm run check` 通过。
- 已搜索 `BOTC_AI_API_KEY|apiKey|Authorization|localStorage`，新增路径未发现 Key 泄漏。

## 2026-07-19 · 阶段 10.9.1 后端 AI 设置脱敏闭环

### 大白话
这次把真实 AI 接入前最安全的一层后端底座做好了：后端可以读取环境变量里的 AI 配置，并把脱敏后的状态提供给前端或 smoke 检查；但它不会调用真实模型，也不会保存或返回 API Key。

### 用户可见变化
- 当前 UI 基本不变。
- 后端新增 `/api/settings/ai`，能看到 AI 是否启用、模型名、接入地址和是否配置 Key。
- 后端新增 `/api/settings/ai/test`，只检查配置是否完整，不会发起付费模型调用。

### Before / After
- Before：AI 设置主要停留在前端原型和文档约束里，后端 runtime 没有公开的脱敏设置接口。
- After：runtime 已挂载 AI 设置接口，默认返回关闭状态；配置齐全时只返回 `apiKeyConfigured: true`，不会泄漏 Key。

### 本轮性质
后端基础设施 / 安全边界 / 无人推进阶段 10.9.1。没有接真实 provider，没有新增 SDK，没有前端保存 Key。

### 风险
- 这不是“真实 AI 已接通”，只是配置检查。
- 10.9.2 仍是 Draft，不能自动进入；真实网络 smoke 仍是 Blocked，需要你授权 Key、费用和网络调用。

### 验证
- `npm run test:server` 通过：5 个 server 测试文件 / 22 个测试。
- `npm run smoke:backend` 通过：runtime 启动、AI 默认 off、归档和 fake 复盘正常。
- `npm run check` 通过：38 个测试文件 / 163 个测试、build、架构检查全绿。
- 已搜索 `BOTC_AI_API_KEY|apiKey|Authorization|localStorage`，确认新增后端公开响应不返回 Key，前端现有临时 Key 输入不落盘。

## 2026-07-19 ? ?? 10.8 ??????????

### ???
????????????? 10.1-10.7 ????????????????????????????????????

### ??????
- ?? UI ???
- ????????????????????AI ?????????????
- ??????????????????????????????AI ????????
- ??????? 10.9??? AI provider ??????????????

### Before / After
- Before??? 10.1-10.7 ????????????????????
- After?????????????????????????????????????

### ????
?? / ???? / ?????? 10.8????????????? AI??????

### ??
- `SetupPanel.tsx` ??????/??????????? setup ???????
- 8-11?13-14 ? verified ???????
- 10.9 ?? AI provider ?? API Key???????????????????

### ??
- `npm run check` ???

## 2026-07-19 ? ?? 10.7 AI ??? fake adapter

### ???
??????? AI??????????? AI ???AI ?????????????????????????

### ??????
- ?? UI ???
- AI ????????????????????? draft-only ???
- ?????? `minimal`??????????????API Key ? provider secret ?????

### Before / After
- Before?AI ???????? setup / night / review ???????????
- After???????? builder ? fake adapter?????? provider ?????????????????

### ????
???? / ???? / ?????? 10.7???????????????? API Key????? SDK?

### ??
- fake adapter ???????? UI/???????????????
- ??? provider ?? 10.9 ???? provider??????????????

### ??
- `npx vitest run src/services/ai/aiContract.test.ts src/services/ai/aiService.test.ts` ???
- `npm run check` ???

## 2026-07-19 ? ?? 10.6 ??????????

### ???
????????????????????????????????????????????????????????????????????

### ??????
- `???` ????????????????????????????????????
- ??????????????????????????????
- `????` ???????????????????????????
- ????????????? `AI?????`???????????????????/???

### Before / After
- Before??????????????????????????????????????
- After??????????????????????????????????

### ????
?? / ???? / ?????? 10.6??????????????????????

### ??
- ???????????????????????
- ?????????????????????????????????

### ??
- `npx vitest run src/features/identity-deal/IdentityDealSheet.test.tsx src/App.test.tsx src/features/game-end/GameEndSheet.test.tsx` ???
- `npx playwright test tests/e2e/game-end-prototype.spec.ts` ???
- `npm run check` ???

## 2026-07-19 · 阶段 10.5 7-15 人开局数据流和 UI

### 大白话
这次把“先选人数再开局”落到界面和数据流里：重置后的空局不会再默认变成 12 人旧局，而是先选择 7-15 人、填写昵称和经验，再进入 AI 配板候选。

### 用户可见变化
- `AI配板` 入口会先显示人数选择和玩家昵称/经验表。
- 可以复用上一局的昵称和经验，但不会复用上一局身份、状态、日志或阶段。
- Catfishing 现在按 7 / 12 / 15 人从已核对模板里生成候选；其它人数会明确显示暂无模板，不会假装随机生成。
- `切换板子` 不再直接开固定 12 人局，而是进入同一套“选择人数开局”流程。

### Before / After
- Before：开局入口容易回到固定 12 人原型；上一局和新局之间的昵称复用、身份清空边界不够清楚。
- After：新局先选人数，昵称/经验可带入，身份/状态/日志保持干净，确认配板后才进入本局状态。

### 本轮性质
新增 / 数据流治理 / 无人推进阶段 10.5。没有自动进入夜晚，没有自动发送身份，没有接真实 AI。

### 风险
- 目前只有 7、12、15 人有 verified 模板；8-11、13-14 人可以先建空座位，但还没有 AI 候选模板。
- 模板候选来自已核对模板库，不是自由生成；后续要逐个人数补模板。

### 验证
- `npx vitest run src/domain/setup-templates/composition.test.ts src/services/setup-candidates/selectSetupCandidates.test.ts src/domain/scripts/packs/catfishing/index.test.ts src/features/setup/catfishingPrototypeCandidates.test.ts src/features/setup/setupRosterMemory.test.ts src/features/game-session/state/projectors.test.ts src/App.test.ts src/services/ai/aiService.test.ts` 通过。
- `npx playwright test tests/e2e/session-flow.spec.ts` 通过。
- `npm run check` 通过。

## 2026-07-19 · 阶段 10.2 Catfishing 智能板子包草案

### 大白话
这次把 Catfishing / 瓦釜雷鸣先搬进新的智能板子包目录，但没有冒充“规则已确认”。它现在只是一个可读取的草案包。

### 用户可见变化
- 当前 UI 不变。
- 新增 Catfishing pack 草案，包含角色、夜序、配板模板、人数修正规则和验收记录。
- 所有未调研内容保持 `needs-review`，模板保持 `verified: false`。

### Before / After
- Before：Catfishing 数据散落在 setup 和 night-workbench 原型数据里。
- After：已有 `src/domain/scripts/packs/catfishing/` 作为后续统一事实源草案。

### 本轮性质
架构迁移草案 / 无人推进阶段 10.2。没有接真实 AI，没有改 UI，没有确认规则。

### 风险
- 当前角色技能文本仍是待调研占位，不能用于真实 AI 规则建议。
- 首夜/其他夜顺序仍需 10.3 调研确认。

### 验证
- `npx vitest run src/domain/scripts/registry.test.ts src/domain/scripts/packs/catfishing/index.test.ts` 通过。
- `npm run check` 通过。
## 2026-07-19 · 阶段 10.1 智能板子 registry 基础

### 大白话
这次先给“多板子”搭了一个很小的底座：以后板子必须先注册成智能板子包，页面和 AI 才能读取同一个来源。

### 用户可见变化
- 当前 UI 不变。
- 新增了 `domain/scripts` 类型和 registry。
- 后续 Catfishing、其它板子、夜序、AI 配板都可以逐步改为从 registry 读取。

### Before / After
- Before：板子数据主要散在 setup、night-workbench 等功能目录里。
- After：已有一个独立的智能板子 registry 入口，能按稳定 `scriptId` 注册、读取和按人数筛选。

### 本轮性质
架构基础 / 无人推进阶段 10.1。没有接真实 AI，没有改 UI。

### 风险
- 这里只是基础 registry，还没有迁移 Catfishing 数据。
- 后续迁移时仍要避免把未核对规则标成 confirmed。

### 验证
- `npx vitest run src/domain/scripts/registry.test.ts` 通过。
- `npm run check` 通过。
## 2026-07-18 · 无人推进项目化

### 大白话
这次把后续开发改成“按索引自动推进”的项目：我以后不能凭感觉乱做，只能读任务索引里第一个 Ready 阶段，做完验收后再进入下一项。

### 用户可见变化
- 当前 UI 不变。
- 新增了无人推进主计划和 runbook。
- 任务索引已经写清：可以自动推进到智能板子、7-15 人开局和 AI 合同；真实 AI 调用和 VPS 部署必须停下等你确认。

### Before / After
- Before：无人推进边界主要靠聊天共识，容易忘记哪些能做、哪些必须停。
- After：每个阶段都有目标、禁止事项、可改文件、验收命令和停止条件。

### 本轮性质
治理 / 计划 / 无人推进护栏。没有实现新功能。

### 风险
- 计划能降低跑偏风险，但不能替代每阶段验证。
- 阶段 10.3 规则调研可能遇到资料冲突；遇到冲突必须停下，不允许硬写。
- 阶段 10.9 真实 AI 和 11.0 VPS 部署仍需要你明确授权。

### 可自行验证
1. 打开 `dev-docs/UNATTENDED_TASK_INDEX.md`，确认下一步是 10.1。
2. 打开 `dev-docs/UNATTENDED_SMART_SCRIPT_AI_PROJECT.md`，查看总体边界。
3. 打开 `dev-docs/UNATTENDED_SMART_SCRIPT_AI_RUNBOOK.md`，查看 10.1-10.8 每阶段验收。

## 2026-07-18 · 多板子与真实 AI 架构冻结

### 大白话
这次没有新增按钮，而是把后续“7-15 人自由开局、多板子、真实 AI、技能结算建议”先写成明确规则，避免后端和板子越加越乱。

### 用户可见变化
- 当前 UI 不变。
- 开发入口文档已明确：下一阶段先做智能板子包、开局流程、规则调研和 AI 后端代理。
- 以后新增板子不能随便导入后直接智能配板，必须先完成规则确认。

### Before / After
- Before：多板子、AI 配板、技能建议、身份交接、重置后开局之间的边界只停留在讨论里。
- After：这些边界已经固化到计划文档、清单和开发索引中，后续实现有可检查标准。

### 本轮性质
治理 / 文档 / 架构冻结。没有改动业务 UI 和真实后端行为。

### 风险
- 文档不能替代实现；下一步仍需要按阶段迁移代码。
- 规则调研会增加新板子接入成本，但能减少 AI 错判和架构膨胀。

### 可自行验证
1. 打开 `dev-docs/README.md` 查看新增的“下一阶段设计冻结”索引。
2. 打开 `dev-docs/SCRIPT_ARCHITECTURE_PLAN.md` 查看智能板子包方案。
3. 打开 `dev-docs/ABILITY_SETTLEMENT_BOUNDARY.md` 查看 AI 结算只能生成草稿的边界。

## 说明

旧版 `HUMAN_CHANGELOG.md` 中部分历史条目曾出现编码损坏，已不再作为当前阶段验收依据。后续从本记录开始继续维护可读中文变更日志。


## 2026-07-19 · 阶段 10.4 模板库与随机候选引擎

### 大白话
这次把“AI配板不能凭空瞎编”落到了代码里：候选只能从已经验证过的人数模板里抽取，并且会先检查人数构成是否对得上。

### 用户可见变化
- 当前 UI 暂不变化。
- Catfishing 现在有 7人、12人、15人各 3 套 verified 模板。
- 后续开局页可以按“人数 + 板子”抽出 2-3 套候选；测试时可固定 seed，真实使用默认不固定。

### Before / After
- Before：模板只有 12 人原型草案，AI配板还缺少稳定底座。
- After：有本地候选服务，默认只返回 verified 且人数构成有效的模板。

### 本轮性质
领域服务 / 模板治理 / 无人推进阶段 10.4。没有接真实 AI，没有改 UI，没有做自由生成配板。

### 风险
- 目前只补了 7/12/15 三个人数的模板；8-11、13-14 人还需要后续逐步补齐。
- 复杂人数修正只做 composition delta 校验，不代表自动规则结算。

### 验证
- `npx vitest run src/domain/setup-templates/composition.test.ts src/services/setup-candidates/selectSetupCandidates.test.ts src/domain/scripts/packs/catfishing/index.test.ts` 通过。
- `npm run check` 通过。

## 2026-07-19 · 阶段 10.3 Catfishing 规则调研与角色验收

### 大白话
这次把 Catfishing / 瓦釜雷鸣里 30 个角色的官方技能、夜序和高风险点补进智能板子包。现在角色知识可以作为后续 AI 提醒和夜序筛选的来源，但模板还没有验收，所以整个板子包仍不会被当成完全确认版。

### 用户可见变化
- 当前 UI 不变。
- 后续夜序、配板、AI 提醒可以读取更可靠的角色事实。
- 舞蛇人、洗脑师、麻脸巫婆、方古、亡骨魔、赌徒等高风险角色已标出“只能提醒/草稿，不能自动结算”。

### Before / After
- Before：角色技能还是占位，首夜/其他夜顺序只是原型草案。
- After：角色技能来自官方角色资料，夜序按官方 night sheet 过滤，setup 人数修正有来源记录。

### 本轮性质
规则调研 / 领域数据治理 / 无人推进阶段 10.3。没有改 UI，没有接真实 AI，没有新增自动技能结算。

### 风险
- 角色技能文本当前保留官方英文原文，中文沉浸感文案后续再做。
- 3 套 12 人模板仍是 `verified: false`，不能把 AI 当自由配板器直接生成未知合法阵容。

### 验证
- `npx vitest run src/domain/scripts/registry.test.ts src/domain/scripts/packs/catfishing/index.test.ts` 通过。
- `npm run check` 通过。

## 2026-07-19 · 修复智能板子 AI 外部审查文档编码

### 大白话
这次不是功能开发，而是把给外部大模型审查用的提示词和收口审计文档从乱码状态恢复成可读中文，避免外部审查读不到重点。

### 用户可见变化
- `dev-docs/CLAUDE_SMART_SCRIPT_AI_REVIEW_PROMPT.md` 可以直接复制给 Claude / 其他模型审查。
- `dev-docs/SMART_SCRIPT_AI_CLOSURE_AUDIT.md` 可以正常作为审查依据。

### Before / After
- Before：两个文档里大量中文变成 `????`，无法可靠审查。
- After：文档重新保存为 UTF-8，可读中文内容已恢复，并明确 10.9 真实 AI provider 仍是 Blocked。

### 本轮性质
文档修复 / 编码治理。没有改业务代码、UI 或后端行为。

### 验证
- 已用脚本确认两个文档 UTF-8 可解码，且不再包含异常数量的问号占位符。

## 2026-07-19 · 10.9 真实 AI provider 前置设计

### 大白话
外部审查已经给绿灯，但绿灯只代表“可以开始设计”，不是可以直接接真实模型。这次把真实 AI 怎么接、密钥放哪里、失败怎么回退、先接哪个功能写成正式文档。

### 用户可见变化
- 当前 UI 和功能不变。
- 后续真实 AI 接入会按“后端代理、API Key 不进前端、默认最小上下文、失败回退手动/fake”的方案推进。
- 真实 AI 首个推荐功能是赛后复盘，不是夜间结算。

### Before / After
- Before：10.9 只有 Blocked 状态，缺少可审查的接入方案。
- After：已有 `AI_PROVIDER_INTEGRATION_DESIGN.md`，实际写代码前需要确认 provider、key、费用和回退策略。

### 本轮性质
文档 / 架构设计 / 风险收口。没有真实 AI 调用，没有新增依赖，没有保存 API Key。

### 风险
- 这只是设计文档，不代表真实 AI 已可用。
- 真实接入前仍需要用户确认 provider、Base URL、model、API Key 保存方式和费用控制。

### 验证
- 文档已加入 `dev-docs/README.md` 索引。
- `dev-docs/UNATTENDED_TASK_INDEX.md` 已记录 10.9 前置设计完成，真实 AI 调用仍 Blocked。

## 2026-07-19 · 10.9 真实 AI provider 实现计划

### 大白话
你确认按推荐方案走后，这次把“怎么开始接真实 AI”拆成了可执行阶段。现在可以先做不需要真实 Key 的安全脚手架：后端脱敏设置、mock provider client、赛后复盘 mock 路径；真正花钱调用模型仍单独卡住。

### 用户可见变化
- 当前 UI 和功能不变。
- 任务索引里新增 10.9.1 到 10.9.5，可按阶段无人推进。
- 真实 Key / 真实网络 smoke 被单独标为 Blocked，不会误触发付费调用。

### Before / After
- Before：只有 10.9 接入设计，但没有细化到每一步能改哪些文件、跑哪些测试、什么时候停止。
- After：已有 `AI_PROVIDER_IMPLEMENTATION_PLAN.md`，明确下一步是 10.9.1 后端 AI 设置与脱敏公开配置。

### 本轮性质
文档 / 实现计划 / 无人推进索引更新。没有真实 AI 调用，没有新增依赖，没有保存 API Key。

### 风险
- 后续实现时仍要防止把 API Key 写进前端、日志、归档或 localStorage。
- 赛后复盘可以先接，AI 配板和夜间结算仍后置，不能跳阶段。

### 验证
- `npm run check` 已通过。


## 2026-07-20 · 12.4 官方基础三板进入前端开局流程

### 大白话
这次把已经导入的 Trouble Brewing / 暗流涌动、Bad Moon Rising / 黯月初升、Sects & Violets / 梦殒春宵接到前端开局入口。现在“切换板子”不再只看到 Catfishing，选择官方基础板后可以走选择人数、AI配板候选、确认配板、发身份和进入夜晚的基础流程。

### 用户可见变化
- “切换板子”里显示 Catfishing 和官方基础三板。
- 新局空白状态下，可以选择 Trouble Brewing / Bad Moon Rising / Sects & Violets 开局。
- AI配板页会按当前板子和人数生成 3 套已核对模板候选。
- 确认配板后，常驻页标题、身份展示、夜晚工作台和夜晚左侧速览都读取当前板子，不再硬回 Catfishing。
- 官方基础三板夜晚先用通用记录型夜序，不做自动技能结算。

### Before / After
- Before：官方基础三板只在 domain pack 里，前端切换板子和 AI配板仍只有 Catfishing。
- After：前端能从切换板子入口选择官方基础三板，并完成“开局 → 配板 → 身份展示 → 夜晚记录”的基础链路。

### 本轮性质
前端接线 / 智能板子投影 / 夜晚通用记录队列。没有接真实 AI，没有做官方魔典同步，没有做玩家端，没有新增自动规则引擎。

### 风险
- 官方基础三板的夜晚工作台现在是“通用记录模板”，不是角色专属自动结算；复杂角色仍需要说书人判断。
- Catfishing 仍保留原有专用夜晚交互，官方基础三板后续可逐步补角色专属建议。
- 真实 AI 和 VPS 后端读取这些板子的策略仍按后续阶段处理。

### 验证
- `npm run check` 通过。
- Playwright 人工点击流通过：切换板子 → Trouble Brewing → 开始配板 → 采用候选 → 确认配板 → 发身份单人展示 → 进入夜晚。
- 截图与报告位于 `artifacts/manual-click-qa-2026-07-20-multi-script/`。

## 2026-07-20 · 重置后开局可重新选择板子

### 大白话
这次修了你指出的问题：重置对局后，进入“选择人数”页面时不能只锁死上一块板子，必须能先选板子，再开始配板。

### 用户可见变化
- “AI配板与调整”里的新局开局页新增“开局板子”下拉框。
- 重置后默认带回上一局板子，但可以直接切到其他已接入智能板子。
- 只有点击“开始配板”后，新板子才会写入新局，不会因为浏览下拉框就改当前局。

### Before / After
- Before：重置后只能看到人数、昵称和经验，无法在当前开局页切换板子。
- After：重置后先选板子、选人数、填昵称/经验，再开始配板，流程完整。

### 本轮性质
UI 修复 / 开局流程补洞。没有改 AI 配板算法，没有接官方魔典同步，没有做自动技能结算。

### 风险
- 当前只允许选择已经接入的智能板子包；任意 JSON 导入仍需先完成智能板子导入验收。

### 验证
- `npx vitest run src/App.test.tsx` 通过。
- `npm run check` 通过。
- Playwright 真实点击验证通过：空白新局打开 AI 配板，选择 Trouble Brewing / 暗流涌动，切到 7 人并开始配板，最终 session 写入 `trouble-brewing/7`。
- 截图：`artifacts/manual-click-qa-2026-07-20-reset-script-select/setup-reset-script-selector-before-start.png`。

## 2026-07-20 · 12.4a 官方基础三板中文能力文案补强

### 大白话
这次把官方基础三板的角色能力从英文源数据改成中文能力摘要。发身份和夜晚工作台现在都优先显示中文，现场不用临时翻译。

### 用户可见变化
- Trouble Brewing / 暗流涌动、Bad Moon Rising / 黯月初升、Sects & Violets / 梦殒春宵的角色身份展示改为中文能力摘要。
- 夜晚工作台当前角色能力改为中文。
- 高风险角色增加更明确的处理提示，例如赌徒猜错死亡、舞蛇人交换后新舞蛇人中毒、洗脑师疯狂证明。

### Before / After
- Before：官方基础三板身份展示和夜晚能力可能显示英文能力文本。
- After：三板角色能力通过 `domain/scripts` 的中文文案投影统一读取，UI 页面不维护第二份角色文案。

### 本轮性质
文案投影 / 现场可读性优化 / 夜晚记录提示补强。没有做自动技能结算，没有接真实 AI，没有改变权威状态。

### 风险
- 这些是中文摘要，不是完整官方规则书逐字翻译。
- 官方基础三板夜晚仍是通用记录模板；复杂角色仍需要说书人最终核对。

### 验证
- `npx vitest run src/domain/scripts/role-copy.test.ts src/features/setup/smartScriptSetupCandidates.test.ts src/services/ai/aiService.test.ts` 通过。
- `npm run check` 通过。
- Playwright 人工点击流通过；身份单人展示和夜晚工作台均显示中文能力文案。

## 2026-07-20 · 12.5 TPI Recommended 四板来源细化

### 大白话
这次没有直接导入新板子，而是先把四个 TPI 推荐社区板的来源、作者、Script Tool hash、角色清单和导入风险查清楚。后面接 ONE IN ONE OUT 时，不会靠记忆或随便 JSON 开始写。

### 用户可见变化
- 当前 UI 不变。
- 无人推进索引的下一项从 `12.5 来源细化` 推进到 `12.6 ONE IN ONE OUT 智能板子包`。
- 四个推荐板都有了导入前检查清单：缺哪些角色事实、哪些角色高风险、哪些内容不能自动结算。

### Before / After
- Before：第一批计划只知道要做四个 TPI Recommended 板，但没有每板的 hash、完整角色 ID 和风险边界。
- After：`SCRIPT_IMPORT_TPI_RECOMMENDED_SOURCES.md` 记录了 One in one out、A Grimm Chorus、Hide and Seek、Lunar Eclipse 的来源细节。

### 本轮性质
来源治理 / 导入计划细化 / 防跑偏文档。没有新增 UI，没有真实 AI 调用，没有导入 pack，没有修改玩家状态逻辑。

### 风险
- 官方页面或 Script Tool 链接未来可能更新；如果 hash 变化，必须重新核对后再导入。
- 这些板子包含当前项目尚未完整确认的角色，下一步不能跳过角色级验收。

### 验证
- 已从 TPI Custom Scripts 页面和官方 Script Tool 链接核对四板来源。
- 已用脚本解压 Script Tool JSON 并计算 sha256。

## 2026-07-20 · 10.9-live AI 真实连通测试入口

### 大白话
你确认允许进入真实 AI 连通测试后，这次把“校验配置”和“真实连通测试”拆开了。现在点“校验配置”不会调用模型；点“真实连通测试”才会通过后端发起一次真实请求。

### 用户可见变化
- AI API 设置页多了“校验配置”和“真实连通测试”两个独立按钮。
- “真实连通测试”会走本机或 HTTPS 后端，临时 API KEY 只用于这一次请求，不保存到浏览器。
- 本地开发页面跨端口访问本机后端时，后端允许本机来源的 CORS 预检。
- `live-test` 收到坏 JSON 会直接拒绝，不会回退到环境变量 Key 误触发模型请求。

### Before / After
- Before：“测试连接”看起来像真实连接，但实际只做配置完整性检查。
- After：按钮语义分清楚；真实测试、配置校验和保存设置不再混在一起。

### 本轮性质
后端接口 / 前端接线 / 安全边界优化。没有把真实 AI 接入配板、夜间结算或权威状态。

### 风险
- 真实连通测试会产生一次模型请求，可能消耗额度。
- 是否支持 `response_format: json_object` 取决于你配置的兼容接口和模型。
- Codex 没有读取截图或密码框里的真实 Key；真实外部调用需要你在界面里手动点。

### 验证
- `npx vitest run server/ai src/features/ai-settings/backendAIStatus.test.ts src/services/settings/settingsService.test.ts src/services/ai/gameReviewHttp.test.ts` 通过。
- `npx vitest run server/ai/aiProxyRoutes.test.ts` 通过，覆盖坏 JSON 不触发 provider。
- `npm run test:server` 通过。
- `npm run smoke:backend` 通过。
- `npm run check` 通过。


## 2026-07-20 · 当前全部智能板子复核质量门

### 大白话
这次不是新增一个可见页面，而是给所有已经接入的板子加了一道“智能板子体检”。以后任意板子要进入智能配板，不能只靠 JSON 或名字列表，必须有来源、7-15 人模板、夜序、角色技能字段和高风险技能提醒。

### 用户可见变化
- Catfishing / 瓦釜雷鸣现在 7-15 人每个人数都有 3 套已验证模板。
- Bad Moon Rising / 黯月初升和 Sects & Violets / 梦殒春宵补齐了容易出错的死亡、醉酒、中毒、疯狂、复活、身份交换和胜负边界提醒。
- UI 仍然只展示说书人可确认的建议和记录草稿，不会自动结算角色技能。

### Before / After
- Before：部分板子能配板，但缺少一个统一检查，后续新增板子可能漏掉高风险技能结构化字段。
- After：所有注册智能板子都必须通过 `smartScriptPackQuality.test.ts`，新增板子漏来源、漏模板、漏高风险逻辑会直接测试失败。

### 本轮性质
规则知识治理 / 智能板子质量门 / 模板补齐。没有新增玩家端，没有魔典同步，没有自动规则引擎。

### 风险
- 结构化逻辑是“提醒和草稿来源”，不是完整官方规则书逐字翻译。
- 社区脚本仍应在实战前由说书人 spot-check，不能因为通过质量门就当作官方板。

### 验证
- `npx vitest run src/domain/scripts/smartScriptPackQuality.test.ts src/domain/scripts/packs/catfishing/index.test.ts src/domain/setup-templates/composition.test.ts` 通过。
- `npm run check` 通过。

## 2026-07-20 · 10.10 AI 配板建议安全接线

### 大白话
这次把“AI 配板建议”从纯本地模板，推进成可接后端 AI 的安全通路。现在配板候选页有一个 `AI推荐`，点了以后只会帮你重新排序候选、给简短提醒，不会自动采用配板。

### 用户可见变化
- `AI配板与调整` 里的候选组合页新增 `AI推荐` 按钮。
- 本机模式下会使用本地模板顺序，不会卡住开局。
- HTTP 后端模式且 AI 配置可用时，才会请求后端 AI 给排序和提醒。
- 返回结果只影响候选展示，不会改身份、座位、状态或日志。

### Before / After
- Before：配板候选只来自本地模板，前端没有后端 AI 推荐入口。
- After：候选仍来自已核对模板；AI 只能在这些候选里排序并补充短提醒，采用仍由说书人确认。

### 本轮性质
后端接口 / 前端接线 / AI 边界治理。不是自动规则引擎，不做夜间结算，不做无人真实模型调用。

### 风险
- 如果后端 HTTP 或 provider 不可用，界面会回退本地模板顺序。
- AI 推荐可能和本地顺序一致；这是允许结果，不代表失败。

### 验证
- `npx vitest run server/ai src/services/ai/setupAdviceHttp.test.ts` 通过。
- `npm run check` 通过。

## 2026-07-20 · 10.11 夜间结算 AI 推荐安全接线

### 大白话
这次把夜间工作台的 AI 建议从纯本地示例，接成了可走后端 AI 的草稿通路。点 `AI推荐` 后，它只会把本项结果候选填成草稿；你还必须点 `确认本项`，才会写入记录。

### 用户可见变化
- 夜间工作台按钮统一为 `AI推荐`。
- HTTP 后端模式且 AI 配置可用时，会请求 `/api/ai/night-settlement-advice`。
- 目标或角色没选够时，AI 只提示缺什么，不会硬给结果。
- 后端不可用时自动回退本地草稿，夜晚记录仍可继续。

### Before / After
- Before：夜间 AI 建议只来自前端本地示例。
- After：夜间建议可以走后端 provider；但返回值仍只能对应现有结果候选，不能自动改死亡、身份、状态、日志或夜序。

### 本轮性质
后端接口 / 前端接线 / AI 权限边界治理。不是自动技能结算引擎。

### 风险
- AI 只能基于本项输入和候选结果给草稿；复杂角色仍要说书人核对。
- 真实 provider 是否可用仍取决于后端配置、模型兼容性和网络。

### 验证
- `npx vitest run server/ai src/services/ai/nightSettlementHttp.test.ts src/features/night-workbench/NightWorkbench.test.tsx` 通过。
- `npm run test:server` 通过。
- `npm run smoke:backend` 通过。
- `npx playwright test tests/e2e/night-workbench.spec.ts tests/e2e/session-flow.spec.ts` 通过。
- `npm run check` 通过。

## 2026-07-20 · 12.11 Carousel 三板来源细化

### 大白话
这次没有直接新增板子，而是先把 Punchy、Quick Maths、Devout Theists 三个 Carousel Collection 板子的来源、作者、hash、角色清单和风险整理清楚。下一步导入 Punchy 时，就不会边写代码边猜规则。

### 用户可见变化
- 当前界面暂时没有新增板子。
- 无人推进索引现在会继续到 `12.12 Punchy`，不再停在推荐四板手动验收。

### Before / After
- Before：第一批后 3 个 Carousel 板子只是计划项，缺少每板来源和导入风险。
- After：每个板子都有固定 JSON 地址、sha256、角色清单、缺失角色和高风险提醒。

### 本轮性质
来源治理 / 导入计划细化 / 防跑偏文档。没有新增 UI，没有导入 pack，没有真实 AI 调用。

### 风险
- Carousel Collection 属于社区脚本，不能当作官方基础三板。
- 如果来源 JSON 未来变化，必须重新核对 hash。
- Quick Maths 的 Riot、Devout Theists 的 Legion/Lleech、Punchy 的 Alchemist/Kazali 都不能被做成自动规则引擎。

### 验证
- 已从 TPI Custom Scripts 页面确认 Carousel Collection 来源入口。
- 已读取三个脚本页面的 JSON，计算 sha256。
- 已更新 `UNATTENDED_TASK_INDEX.md`、`SCRIPT_IMPORT_BATCH_01_PLAN.md`、`UNATTENDED_MASS_SCRIPT_IMPORT_PLAN.md` 和 `README.md`。

## 2026-07-20 · 12.12 Punchy 智能板子包

### 大白话
Punchy 已经从“计划中的板子”变成了可进入项目统一智能板子架构的 pack。它现在有角色事实、夜间顺序、人数修正规则和 7-15 人配板模板。

### 用户可见变化
- 开局板子列表后续可以选择 Punchy。
- AI 配板候选可以从 Punchy 的 verified 模板里推荐。
- 夜晚工作台可以按 Punchy 在场角色筛选夜序。
- 身份展示和角色提示会显示中文能力摘要。

### Before / After
- Before：Punchy 只有来源记录，不能开局、不能配板、不能走夜序。
- After：Punchy 已接入 `SmartScriptPack`，有 26 个角色事实、22 套 7-15 人模板和官方 night sheet 过滤夜序。

### 本轮性质
智能板子导入 / 规则知识治理 / 模板库新增。没有真实 AI live 调用，没有玩家端，没有魔典同步，没有自动技能结算。

### 风险
- Punchy 是社区脚本，仍保持 `needs-review`。
- 气球驾驶员、猎人、炼金术士、卡扎力、维格莫提斯、普卡、奥赫等复杂角色只提供提醒和草稿，不自动改权威状态。
- `spirit_of_ivory` 已归一为项目 ID `spiritofivory`，后续新增板子要继续遵守同一 ID。

### 验证
- `npx vitest run src/domain/scripts/packs/punchy/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts src/domain/scripts/smartScriptPackQuality.test.ts` 通过。

## 2026-07-20 · 12.13 Quick Maths 智能板子包

### 大白话
Quick Maths 已经接入智能板子架构。它现在可以按 7-15 人生成 verified 配板模板，也能把 Riot、Boffin、Snitch、Xaan 这些高风险点投影成说书人提醒。

### 用户可见变化
- 开局板子列表后续可以选择 Quick Maths。
- AI 配板候选可以从 Quick Maths 的 verified 模板里推荐。
- 夜晚工作台可以按 Quick Maths 在场角色筛选夜序。
- 身份展示和角色提示会显示中文能力摘要。

### Before / After
- Before：Quick Maths 只有来源记录，不能开局、不能配板、不能走夜序。
- After：Quick Maths 已接入 `SmartScriptPack`，有 22 个角色事实、22 套 7-15 人模板和官方 night sheet 过滤夜序。

### 本轮性质
智能板子导入 / 规则知识治理 / 模板库新增 / 中文能力摘要补强。没有真实 AI live 调用，没有玩家端，没有魔典同步，没有自动技能结算。

### 风险
- Quick Maths 是社区脚本，仍保持 `needs-review`。
- `Riot` 的第 3 天提名链、死亡和胜负只做提醒，不自动处理。
- `Boffin`、`Snitch`、`Xaan` 都只做 setup 或状态提醒，不批量改玩家状态。
- 统一质量门从“至少 25 个角色”调整为“至少 22 个角色”，因为 Quick Maths 官方 JSON 只有 22 个角色；这不是降低单板验收，单板测试仍精确断言 Quick Maths 的 22 个角色。

### 验证
- `npx vitest run src/domain/scripts/packs/quick-maths/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts src/domain/scripts/smartScriptPackQuality.test.ts` 通过。

## 2026-07-20 · 12.14 Devout Theists 智能板子包

### 大白话
Devout Theists 已经接入智能板子架构。它现在可以按 7-15 人生成 verified 配板模板，也能把 Lleech、Fang Gu、Kazali、Legion、Widow、Marionette、Magician 这些容易出错的机制投影成说书人提醒。

### 用户可见变化
- 开局板子列表后续可以选择 Devout Theists。
- AI 配板候选可以从 Devout Theists 的 verified 模板里推荐。
- 夜晚工作台可以按 Devout Theists 在场角色筛选夜序。
- 身份展示和角色提示会显示中文能力摘要。

### Before / After
- Before：Devout Theists 只有来源记录，不能开局、不能配板、不能走夜序。
- After：Devout Theists 已接入 `SmartScriptPack`，有 25 个角色事实、22 套 7-15 人模板和官方 night sheet 过滤夜序。

### 本轮性质
智能板子导入 / 规则知识治理 / 模板库新增 / 中文能力摘要补强。没有真实 AI live 调用，没有玩家端，没有魔典同步，没有自动技能结算。

### 风险
- Devout Theists 是社区脚本，仍保持 `needs-review`。
- `Lleech` 宿主保护、`Fang Gu` 新恶魔链、`Kazali` 开局选爪牙、`Legion` 多恶魔与胜负、`Widow` 中毒目标都只做提醒，不自动改死亡、身份、阵营或胜负。
- `Legion` 暂不进入 verified 配板模板，因为当前模板结构不支持同一角色多份；角色事实、夜序和风险提醒已经保留。
- `high_priestess` 已归一为项目 ID `highpriestess`，`fang_gu` 已归一为项目 ID `fanggu`。

### 验证
- `npx vitest run src/domain/scripts/packs/devout-theists/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts src/domain/scripts/smartScriptPackQuality.test.ts` 通过。
- `npm run check` 通过：59 个测试文件、278 个测试。
- `npx playwright test tests/e2e/game-end-prototype.spec.ts` 通过。




## 2026-07-20 · 12.17 AI 缺项反馈深化

### 大白话
这次继续优化夜间 `AI推荐`：如果你还没选目标或角色，AI 不再只是顶部闪一条提示，而是会在当前角色卡片的 `辅助判断` 里明确写出缺什么。

### 用户可见变化
- 夜间工作台点 `AI推荐`，如果本项缺输入，会出现 `AI缺少`。
- 缺项会按当前技能字段显示，例如 `缺少玩家、缺少声称角色`。
- 缺输入时不会把“生效/不生效”等结果按钮标成 `AI建议`，避免误以为已经有可采用结果。
- 你补齐目标或角色后，旧的缺项提示自动消失，可以重新点 `AI推荐`。

### Before / After
- Before：缺输入时只有顶部提示，容易在现场误以为 AI 没反应，或者不知道缺的是目标还是角色。
- After：当前卡片里保留缺项反馈，说书人不用回忆刚才点了什么；补齐后自动失效，不会留下过期提示。

### 本轮性质
UI 体验优化 / 测试加固 / 文档收口。没有新增板子，没有玩家端，没有官方魔典同步，没有自动技能结算，也没有无人真实 AI 调用。

### 风险
- 这只是缺项反馈，不代表 AI 已经理解所有复杂角色规则。
- 复杂技能仍要按智能板子规则调研和说书人确认来处理，不能绕过 `确认本项`。

### 验证
- `npx vitest run src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose` 通过：15 个测试。
- `npm run check` 通过：61 个测试文件、383 个测试、build 和架构边界检查。
- `npx playwright test tests/e2e/night-workbench.spec.ts` 通过：7 个浏览器用例。
- 截图：`<repo>/artifacts/screenshots/ai-recommendation-ux-2026-07-20/03-night-ai-missing-input.png`




## 2026-07-21 · 12.26 剩余高风险角色结构化摘要补强

### 大白话
继续把当前已导入板子里容易出错的角色做成 AI 可读的“规则提醒卡”。这次新增 31 个角色，结构化摘要从 40 个扩到 71 个。

### 用户可见变化
- AI 配板遇到卡扎力、军团、召唤师、哥布林、暴乱、呓语魔、疯子、酒鬼等角色时，会更容易给出风险提醒。
- 夜间 AI 推荐遇到普卡、奥赫、痢蛭、灵言师、寡妇、投毒者等角色时，会带上“不能自动改状态/杀人/判胜负”的边界提醒。
- 这些提醒来自统一的 `role-knowledge`，不会在不同板子里各写一套。

### Before / After
- Before：复杂角色摘要覆盖 40 个角色，部分当前板子常见高风险角色还只能依赖各 pack 的局部字段。
- After：摘要覆盖 71 个角色，当前 10 个已导入智能板子里的主要高风险角色都能被配板 AI / 夜间 AI 引用。

### 本轮性质
规则知识治理 / AI 上下文增强 / 防屎山收口。没有新增 UI、玩家端、魔典同步、数据库，也没有自动规则引擎。

### 风险
- 这些仍是短摘要，不是完整规则翻译。
- 新增的 31 个简版调研记录保留了官方 Wiki 复核入口；如果后续发现某个细节冲突，要先修 `role-research`，再同步结构化摘要。
- 低风险简单信息角色没有全部塞进复杂摘要，避免把知识库变成垃圾桶。

### 验证
- `npx vitest run src/domain/role-knowledge/complexRoleKnowledge.test.ts src/services/ai/aiContract.test.ts src/services/ai/nightSettlementHttp.test.ts src/services/ai/setupAdviceHttp.test.ts server/ai/nightSettlementProvider.test.ts server/ai/setupAdviceProvider.test.ts --reporter=verbose` 通过。
- `npm run check` 通过。

## 2026-07-21 · 12.25 复杂角色结构化摘要接入

### 大白话
之前 40 个复杂角色只是有调研文档，现在已经变成程序能读取的“短规则提醒”。AI 配板和夜间 AI 推荐在遇到这些角色时，会带上关键风险和禁止自动执行的边界。

### 用户可见变化
- 夜间点 `AI推荐` 时，赌徒、洗脑师、舞蛇人、麻脸巫婆等复杂角色会更容易出现对应规则提醒。
- AI 配板请求会把候选组合里的复杂角色风险一起交给后端 AI，用于解释和排序。
- 本地回退也会保留短提醒，不会因为后端 AI 不可用就完全丢掉复杂角色风险提示。

### Before / After
- Before：复杂角色规则主要停留在 `dev-docs/role-research/` 文档里，AI 请求不一定知道这些风险。
- After：40 个复杂角色被统一放进 `src/domain/role-knowledge/`，配板 AI 和夜间 AI 都能引用短摘要。

### 本轮性质
规则知识治理 / AI 上下文增强 / 架构收口。没有新增玩家端、魔典同步、数据库或自动规则引擎。

### 风险
- 这是短摘要，不是完整规则引擎；说书人仍然必须确认最终结果。
- 如果后续发现角色规则错译或漏点，应先修对应 `role-research` 文档，再同步结构化摘要。
- 本轮没有新增 UI 展示入口，所以主要变化体现在 AI 推荐内容和请求上下文里。

### 验证
- `npx vitest run src/domain/role-knowledge/complexRoleKnowledge.test.ts src/services/ai/aiContract.test.ts src/services/ai/nightSettlementHttp.test.ts src/services/ai/setupAdviceHttp.test.ts server/ai/nightSettlementProvider.test.ts server/ai/setupAdviceProvider.test.ts --reporter=verbose` 通过。
- `npm run check` 通过。



## 2026-07-21 · 夜晚技能 AI 建议草稿深化

### 大白话
夜晚点 `AI推荐` 后，AI 不再只给一段“依据/结论”，而是把“建议记录、告知草稿、需确认事项”分开显示。它只帮你填草稿和提醒风险，不会直接写日志、改身份、改阵营、改死亡或改毒醉。

### 用户可见变化
- 夜晚辅助区标题从 `AI依据` 改为更准确的 `AI建议`。
- AI 建议下方新增 `建议记录`、`告知草稿`、`需确认` 三类草稿预览。
- `需确认` 会提示死亡、身份、阵营、毒醉、疯狂、延迟结算等风险仍需说书人手动确认。
- 如果说书人改掉 AI 推荐结果，界面显示 `已改为手动结果`，避免误以为仍是 AI 结论。

### Before / After
- Before：AI 建议更像一段说明，记录、告知和权威状态边界混在一起，容易让人误会已经自动结算。
- After：AI 输出只进入草稿区；确认本项前不写日志、不改状态，状态变化只作为 `需确认` 提醒。

### 本轮性质
夜晚技能辅助深化 / AI 草稿结构扩展 / UI 表达优化 / 后端 AI 合同同步。没有新增自动规则引擎，也没有自动执行技能。

### 风险
- AI 仍可能误解复杂规则；说书人必须核对后再确认。
- 当前只是草稿结构深化，不等于完成所有角色的高质量规则推理。

### 验证
- `npx vitest run src/features/night-workbench/NightWorkbench.test.tsx --reporter=verbose` 通过：15 项测试。
- `npm run check` 通过：lint、417 项测试、build、architecture verification 全部通过。

## 2026-07-21 · 官方魔典 batch-03 首板：何方教众

### 大白话

这次不是继续扩大 UI，而是把官方魔典 132 板导入队列里的第一块常规板子“何方教众”做成了完整智能板子包。它现在能进入同一套智能配板、夜序、规则提醒和质量门流程。

### 用户可见变化

- 开局板子列表会多一个 `何方教众`。
- AI 配板可以从这块板子的 22 套 7-15 人模板中挑选。
- 夜晚工作台能按这块板子的首夜/其他夜顺序筛选在场角色。
- 高风险角色只给提醒和草稿，不自动改死亡、身份、阵营或胜负。

### Before / After

- Before：`何方教众` 只在官方魔典 132 队列里，不能直接作为本工具智能板子使用。
- After：新增 `src/domain/scripts/packs/he-fang-jiao-zhong/`，包含角色事实、夜序、setup 规则、配板模板、验收记录和 registry 接入。

### 风险

- 这是社区脚本，`knowledgeStatus` 仍保持 `needs-review`，不伪装成官方基础板。
- GStone 原 JSON 使用 `21087_xxxx` 自定义 ID，本项目已映射为稳定官方 roleId；后续导入必须继续执行这个规则。
- 首批模板暂不使用小怪宝和巡山人，避免第一次接入就把保姆/身份变更复杂度推太高。

### 验证

- `npx vitest run src/domain/scripts/packs/he-fang-jiao-zhong/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts` 已通过。
- 最终 `npm run check` 将在本轮收口前执行。


## 2026-07-23 - 117 个智能板子与 API 点击流审查

### 给非开发者看的交付说明
- 审查了当前 117 个已注册智能板子是否满足“可作为智能板子使用”的基础门槛。
- 跑通了智能板子质量测试、后端 smoke、后端单测、全量 check 和完整浏览器 E2E。
- 模拟人工点击时发现 2 个测试卡点：测试脚本写死了旧座位，不适配现在 AI/模板会改变角色座位的现实。
- 已把测试改成读取当前草稿里的真实角色卡再点击/拖拽，避免后续新增板子或模板后误报失败。

### Before / After
- 以前：浏览器测试假设“1号一定是心上人、2号一定是赌徒”，模板变化后会卡住。
- 现在：测试按页面真实存在的角色卡操作，验证的是“用户能交换/拖拽/确认”，不再绑定固定座位。

### 验证
- `npm run check` 通过：172 个测试文件 / 810 项测试。
- `npm run smoke:backend` 通过。
- `npm run test:server` 通过：10 个测试文件 / 46 项测试。
- `npm run test:e2e` 通过：29 项浏览器点击测试。

### 风险
- 117 个板子通过结构化质量门槛，但不是逐个实机点击验收全部板子。
- 真实 AI live 调用未测，因为当前没有真实 API Key。
- 主 bundle 仍有体积警告，后续公开或 VPS 使用前建议考虑 code split。
## 2026-07-23 - 真实 MiniMax-M3 接入与浏览器 AI smoke

### 给非开发者看的交付说明
- 已用真实后端代理跑通 AI 设置连通、AI 配板推荐、夜晚技能建议的浏览器点击链路。
- 发现 MiniMax-M3 默认会先输出较长 thinking/reasoning，容易导致配板推荐超时或返回空 content；现在后端会显式关闭 thinking，并把配板上下文压缩后再发给模型。
- 真实 AI 失败时仍会回退本地模板，不会直接改身份、状态、死亡、毒醉或日志。

### Before / After
- Before：本地模板和假 AI 能用，但真实模型在浏览器里可能超时、返回 fake fallback，无法证明按钮真的走了后端模型。
- After：新增真实 AI smoke，用可见按钮完成“AI配板 → 采用草稿 → 进入夜晚 → AI推荐”，并校验返回 provider 是 `openai-compatible`。

### 验证
- `npm run check` 通过：172 个测试文件 / 813 项测试、build、architecture verification。
- `BOTC_RUN_REAL_AI_SMOKE=1 npx playwright test tests/e2e/real-ai-provider-smoke.spec.ts --reporter=list` 通过；后端使用真实 OpenAI-compatible runtime，模型为 MiniMax-M3。
- `npm run build:backend` 通过。

### 风险
- 真实模型速度受代理、模型排队和网络影响，偶发慢响应仍可能发生；现在前端 runtime timeout 上限提高到 180 秒。
- API Key 只作为本机环境变量使用，没有写入源码、文档或测试文件。

## 2026-07-23 - ?? AI ???????

### ???????????
- ????????????? AI ????????????????
- ???? AI ????????????????/???????/??/??/??????????????????????
- ????????????????????????????????????

### Before / After
- Before??????? 1 ??? 1 ??????????????? AI ? `selectedTargets` ??????????? `needs_input`?
- After????? 1 ???????? 1 ??????????AI ??????????????

### ??
- `npx vitest run src/services/ai/nightSettlementHttp.test.ts src/services/ai/aiContract.test.ts src/features/night-workbench/state/projectWakePlayerStatus.test.ts --reporter=verbose` ???3 ????? / 10 ????
- `npm run check` ???172 ????? / 814 ????build?architecture verification ?????

### ??
- ????????????????????? AI ???????? 100% ??????????????????


## 2026-07-27 - 挑刺 P0 文档口径修复

### 给非开发者看的交付说明
- 修掉挑刺审查里的前三个 P0 文档问题：README 真实 AI 状态不一致、AI 启动说明乱码、VPS 端口说明混乱。
- README 现在明确：真实 AI 连通测试入口已存在，但默认关闭；AI 配板、夜间结算和复盘仍只是草稿建议。
- `AI_RUNTIME_STARTUP.md` 已重写为可读中文，说明本机/VPS AI 环境变量、设置页操作、live test 和错误码。
- `VPS_DEPLOYMENT_PREP.md` 已把本机默认端口 `8787`、当前 VPS 对外端口 `3000`、同步脚本默认端口 `3000` 分开解释。

### Before / After
- Before：用户看 README 会误解真实 AI 是否存在；AI 启动文档乱码；VPS 文档把本地默认端口和当前远端端口混在一起。
- After：GitHub 用户能看懂真实 AI 是“可手动连通测试、默认关闭、永远草稿建议”；VPS 端口口径也更明确。

### 验证
- `npm run audit:public` 通过；素材引用提示是预期提醒，不是失败。
- `npm run check` 通过：177 个测试文件 / 828 项测试，build 与 architecture verification 全部通过。
- 乱码固定字符串扫描通过：`AI_RUNTIME_STARTUP.md` 和 `VPS_DEPLOYMENT_PREP.md` 已无乱码命中；`PROJECT_CRITIQUE_AUDIT.md` 中保留的 `?????` 是历史问题证据。

### 风险
- 还没有执行新的 `SMOKE_HOSTING_SCENARIOS.md` 7/12/15 人模拟主持流程，这是剩余 P0 验收问题。

## 2026-07-27 - 项目完整度挑刺审查

### 给非开发者看的交付说明
- 新增 `PROJECT_CRITIQUE_AUDIT.md`，对当前项目做了一次不加功能的挑刺审查。
- 结论：GitHub alpha / preview 可发布；正式稳定版还不建议宣传。
- 找到的核心短板不是主流程缺失，而是 README 真实 AI 状态不一致、AI 启动文档乱码、VPS 端口口径混乱、模拟主持流程未按新标准重跑、真实 AI 质量回归未系统化、大规模板子数据文件后续维护风险。

### Before / After
- Before：只能口头判断“差不多能发，但还不是正式版”。
- After：P0/P1/P2 问题有文档记录，后续按优先级修，不靠聊天记忆。

### 验证
- `npm run audit:public` 通过；素材引用提示是预期提醒，不是失败。
- `npm run smoke:backend` 通过：本地 runtime 可启动，archive 和 fake review provider 正常。

### 风险
- 本轮只审查和记录，没有修复审查中列出的 P0/P1 问题。

## 2026-07-27 - 公开发布前最终审计

### 给非开发者看的交付说明
- 完成一次 GitHub alpha / preview 发布前审计：Key、个人路径、素材误提交、测试构建、公开说明都检查了一遍。
- 新增 `PUBLIC_RELEASE_FINAL_AUDIT.md`，记录通过项、命令结果、素材 Git 边界和剩余人工决策。
- 当前结论是：可以进入 GitHub 发布前的人工决策阶段；还没替你选择代码许可证，也没有创建远端仓库。

### Before / After
- Before：知道有 `audit:public` 和 `check`，但没有一份“这次到底审过什么、结果如何”的最终记录。
- After：发布前审计结果有文档可追溯，后续创建 GitHub 仓库时不依赖聊天记忆。

### 验证
- `npm run audit:public` 通过；素材引用提示是预期提醒，不是失败。
- `npm run check` 通过：177 个测试文件 / 828 项测试，build 与 architecture verification 全部通过。
- Git 素材边界抽查通过：126 个角色 WebP 和 1 个社区二进制素材被忽略，manifest 与 README 可进入 Git。

### 风险
- Vite build 仍有主 chunk 超 500 kB 警告；不阻塞 alpha / preview，后续可做 code splitting。
- License 仍未决策，发布前需要你确认。

## 2026-07-27 - GitHub 发布包装收口

### 给非开发者看的交付说明
- README 已改成陌生人打开 GitHub 能看懂的首页：项目是什么、适合谁、能做什么、不做什么、怎么启动、怎么配置 AI、怎么处理素材。
- 新增 `.env.example`，列出本地后端、AI provider 和 VPS 同步脚本需要的环境变量占位符，不包含真实 Key。
- 重写第三方说明和公开发布边界，明确非官方项目、素材包策略、免责声明和 License 尚未决策。
- 新增 GitHub 发布检查清单，防止发布前漏掉 Key、个人路径、素材误提交、模拟主持验收和许可证决策。

### Before / After
- Before：README 更像内部进度说明；`PUBLIC_RELEASE_BOUNDARY.md` 存在乱码；公开发布前要检查什么不够集中。
- After：README 更像 GitHub 首页；公开边界、第三方说明、环境变量和发布 checklist 都有独立文件。

### 验证
- `npm run check` 通过：177 个测试文件 / 828 项测试，build 与 architecture verification 全部通过。
- `npm run audit:public` 通过；素材引用提示是预期提醒，不是失败。

### 风险
- 代码许可证仍未选择；这属于发布前必须由项目所有者确认的法律/授权决策，本轮没有替你默认选 MIT 或其他许可证。

## 2026-07-27 - 发布前验收口径调整

### 给非开发者看的交付说明
- “真实线下局验证”不再作为 GitHub alpha / preview 发布的硬性阻塞项。
- 新增 `SMOKE_HOSTING_SCENARIOS.md`，把发布前验收改成：模拟主持流程验收、AI 质量回归、VPS 稳定性验证。
- 后续 README 或发布页不能写“已通过真实线下局验证”，只能写“已通过模拟主持流程验证，适合自用和早期试用”。

### Before / After
- Before：项目成熟度容易被“没有真实开桌验证”卡住，导致无法继续收口发布。
- After：用可重复、可自动化或半自动的模拟主持流程替代真实桌游现场，仍保留 AI 建议质量和 VPS 稳定性的硬检查。

### 验证
- `npm run check` 通过：177 个测试文件 / 828 项测试，build 与 architecture verification 全部通过。
- `npm run audit:public` 通过；素材引用提示是预期提醒，不是失败。

### 风险
- 模拟主持不能覆盖真实玩家发言、节奏压力和现场误触；这些只能作为后续反馈优化，不作为当前 preview 阻塞项。

## 2026-07-27 - 素材包检测与导入说明入口

### 给非开发者看的交付说明
- 在右上角“AI API 设置”里新增“素材包 / 角色图标”区域，用来检测本机是否已有角色图标素材。
- 新增“查看导入说明”二级页面：说明素材不会自动下载、不会默认提交到公开仓库，并展示本地放置目录和来源记录路径。
- 缺少素材不会影响开局、夜序、日志、投票或 AI 建议；只是角色图标可能回退为文字/默认图形。

### Before / After
- Before：公开仓库已忽略素材，但页面里没有入口告诉使用者为什么缺图、素材应放哪里、需要注意什么。
- After：设置页能看到素材状态；需要导入时有明确的二级页面和确认提示。

### 验证
- `npx vitest run src/services/assets/assetPackService.test.ts src/features/ai-settings/AssetPackSettingsSection.test.tsx --reporter=verbose` 通过。
- `npm run check` 通过：177 个测试文件 / 828 项测试，build 与 architecture verification 全部通过。
- `npm run audit:public` 通过；素材引用提示是预期提醒，不是失败。

### 风险
- 当前只做检测和说明，不做自动下载；真正的素材包下载/导入按钮仍是后续功能。

## 2026-07-23 - 夜间结算“受到影响”表达与 AI 发动者状态

### 给非开发者看的交付说明
- 夜间结算里“生效 / 不生效”的表达改成更贴近主持现场的“受到影响 / 未受影响”。
- AI 夜间请求现在同时带上“发动者自身状态”和“被选目标状态”。例如洗脑师是否醉酒/中毒，会作为 wakeItem.status 发给后端；目标 1 号的身份和状态会作为 selectedTargets 发给后端。
- 后端提示词已补充：如果目标和角色已经填齐，不要只因为说书人没点结果按钮就追问；可以先按 ready 的常规结果给草稿建议。

### Before / After
- Before：AI 只明确拿到目标状态，发动者状态没有作为独立字段传入；模型容易追问“洗脑师是否醉酒/中毒”。按钮文案也像规则引擎里的“生效/不生效”。
- After：发动者状态与目标状态分开传入；按钮改为“受到影响/未受影响”，更像现场记录结果，而不是自动裁定。

### 验证
- `npx vitest run src/services/ai/nightSettlementHttp.test.ts server/ai/nightSettlementProvider.test.ts src/services/ai/aiContract.test.ts --reporter=verbose` 通过。
- `npm run check` 通过：172 个测试文件 / 814 项测试、build、architecture verification 全部通过。
- `npm run build:backend` 通过。
- `BOTC_RUN_REAL_AI_SMOKE=1 npx playwright test tests/e2e/real-ai-provider-smoke.spec.ts --reporter=list` 第二次通过；第一次 provider 临时回退 fake，重跑后为 openai-compatible。

### 风险
- 已构建新的 `dist-server/runtime.mjs`，但如果 8787 后端进程是在本轮修改前启动的，需要手动重启后端才能使用最新 server 提示词。
- AI 仍只给草稿，不会自动写日志或修改身份、阵营、死亡、毒醉。
## 2026-07-27 - 公开仓库最小安全门

### 给非开发者看的交付说明
- 按“代码可公开、素材做可选加载包”的方向补了公开仓库边界，不删除本地素材、不拆功能。
- 新增公开前审计命令：`npm run audit:public`，用于拦截真实 API Key、本机个人路径和素材误提交风险。
- `.gitignore` 已把本地角色图标 WebP 和社区图片放进默认忽略范围；本地仍可继续使用，公开仓库默认不提交这些二进制素材。

### Before / After
- Before：文档里残留少量本机路径；官方/社区素材如果直接 `git add .` 可能被一起提交。
- After：个人路径已改成 `<repo>` / `<local-temp>` / `<local-v2.5-backup-path>`；素材走加载包边界，公开前有可执行审计。

### 验证
- `npm run audit:public` 通过；仅提示存在素材引用，这是预期提示，不是失败。
- `npm run check` 通过：175 个测试文件 / 824 项测试，build 与 architecture verification 全部通过。

### 风险
- 这不是法律意见。公开发布、商业化或大范围分发前，仍应重新核对 TPI 最新社区内容和版权条款。
- 后续还需要实现真正的“素材包下载/导入同意页”；本轮只完成工程边界和误提交防护。

## 2026-07-27 - P1-6 赛后复盘轻量版深化

### 给非开发者看的交付说明
- 历史复盘里的 AI 草稿现在不只给玩家分数，还会给“整局复盘摘要”“关键转折”和“建议回看顺序”。
- 每个玩家卡片增加“关键行为摘录”，只从已保存日志里抓取和该玩家相关的记录，方便复盘时快速定位。
- 评分和锐评仍明确标注为草稿，不是客观玩家能力评价，也不会改归档、当前局或玩家状态。

### Before / After
- Before：复盘页主要展示总评价、玩家草稿分数和锐评；说书人还要自己从长日志里找关键节点。
- After：复盘页先给整局回看路径，再给每个玩家的关键日志摘录，复盘时更像“索引”，不是“判决书”。

### 验证
- `npx vitest run src/services/ai/aiService.test.ts src/services/ai/gameReviewHttp.test.ts src/features/game-end/GameAIReviewPanel.test.tsx --reporter=verbose` 通过。
- `npm run check` 通过：175 个测试文件 / 824 项测试，build 与 architecture verification 全部通过。
- 浏览器 smoke 通过：保存本局 → 进入历史复盘 → 看到“AI复盘草稿 / 关键转折 / 玩家评分草稿”；截图保存到 `<local-temp>/botc-game-review-ai-panel.png`。

### 风险
- 如果本局日志记录少，关键行为摘录会偏少；复盘仍需要说书人补充现场发言和玩家动机。
- 真实 AI 后端如果返回缺字段，前端会回退到本地复盘草稿。

## 2026-07-27 - P1-5 多板子质量面板

### 给非开发者看的交付说明
- 在“切换板子”二级页面里新增“智能板子看板”，集中显示当前已导入多少板子、哪些可开局、哪些需要复核、哪些暂缓。
- 每个板子现在会显示：角色知识、角色调研、模板、夜序、设置规则的核对进度；有问题时只展示短标签，例如“角色待复核 2”“缺人数 15”。
- 这个看板不是给现场主持增加操作负担，而是给后续批量导入板子时防止“看起来能选，其实 AI 建议质量不稳”的维护入口。

### Before / After
- Before：切换板子页只列出板子名称、人数和模板数；板子是否真正智能化、AI 建议是否偏弱，需要开发者去翻测试或源码。
- After：同一个入口内能直接看到智能板子质量分层：可开局 / 需复核 / 暂缓，并能快速定位缺口。

### 验证
- `npx vitest run src/domain/scripts/quality.test.ts src/features/script-library/ScriptQualityPanel.test.tsx --reporter=verbose` 通过。
- `npm run check` 通过：174 个测试文件 / 823 项测试，build 与 architecture verification 全部通过。
- 浏览器 smoke 通过：打开常驻页 → 点击“切换板子” → 出现“智能板子看板”；截图保存到 `<local-temp>/botc-script-quality-panel.png`。

### 风险
- 面板只做质量投影，不负责修复板子；如果某个板子显示“需复核”，仍需要按规则调研和板子导入流程处理。
- 当前质量判断是结构化启发式，不等于官方权威认证。

## 2026-07-27 - 模拟主持流程 smoke 收口

### 给非开发者看的交付说明
- 把“7/12/15 人模拟主持验收”做成了可以自动点击真实页面按钮的浏览器测试。
- 现在会分别验证：7 人开局与夜序投影、12 人主主持链路、15 人大局投票密度、结束归档/复盘/重置、缺角色图标时仍能继续开局。
- 修了一个测试里暴露出的流程问题：夜间“受到影响”如果已经被 AI 建议预选，测试不会再点一次把它取消掉；这能防止按钮语义被误测成不可确认。

### Before / After
- Before：`SMOKE_HOSTING_SCENARIOS.md` 只是验收标准，没有一次新标准下的执行记录。
- After：新增 `smoke-hosting-scenarios.spec.ts`，并记录 5 个浏览器 smoke 全部通过；模拟主持验收从“口头标准”变成“可重复检查”。

### 验证
- `npx playwright test tests/e2e/manual-click-smoke.spec.ts tests/e2e/game-end-prototype.spec.ts tests/e2e/smoke-hosting-scenarios.spec.ts --reporter=line` 通过：5 passed。
- `npm run check` 通过：177 个测试文件 / 828 项测试，build 与 architecture verification 全部通过。
- `npm run audit:public` 通过。

### 风险
- 这是模拟主持验收，不等同于真实线下局验证。
- 本轮没有强制真实模型 live 调用；AI 质量回归仍需要单独跑。

## 2026-07-27 - P1 夜间 AI 复杂角色质量回归

### 给非开发者看的交付说明
- 给夜间 AI 增加了一组复杂角色回归测试，专门防止它在关键角色上“看起来会说话，但建议不靠谱”。
- 现在本地回退建议能识别：赌徒猜错、赌徒醉酒、舞蛇人选中恶魔、方古击杀外来者、麻脸巫婆换成已在场/未在场角色、洗脑师疯狂告知。
- 所有建议仍然只是草稿：死亡、换身份、改阵营、中毒、醉酒、疯狂处罚都不会自动写入权威状态。

### Before / After
- Before：AI 上下文已经带了角色知识和目标状态，但缺少固定回归；以后改 prompt 或导入板子时，复杂角色建议质量可能悄悄退化。
- After：关键复杂角色有可执行测试卡住；新增板子遇到高风险角色时，要按同一标准补角色知识和回归。

### 验证
- `npx vitest run src/services/ai/nightSettlementQualityRegression.test.ts src/services/ai/aiContract.test.ts src/services/ai/aiService.test.ts --reporter=verbose` 通过：3 个测试文件 / 15 项测试。
- `npm run check` 通过：178 个测试文件 / 834 项测试，build 与 architecture verification 全部通过。
- `npm run audit:public` 通过。

### 风险
- 当前只覆盖第一批高风险角色；普卡、诺-达鲺、熬药女巫、红唇女郎、疯子、数学家还需要继续补。
- 本轮不调用真实模型；真实模型 live 质量抽查仍是后续独立步骤。

## 2026-07-27 - P1 夜间 AI 复杂角色回归第二批

### 给非开发者看的交付说明
- 继续补强夜间 AI 建议的复杂角色底座：普卡、诺-达鲺、红唇女郎、炼金术士、数学家、疯子已加入回归。
- 本地 AI 回退现在会把“隐藏信息、开局修正、保护、胜负”也转成明确的待确认草稿提醒，不再只覆盖死亡、身份、阵营、毒醉。
- 红唇女郎这类会影响胜负边界的角色，现在会保留“AI不能自动判胜”的提醒，避免建议看起来像裁定。

### Before / After
- Before：第一批只卡住赌徒、舞蛇人、方古、麻脸巫婆、洗脑师；部分风险标签没有转成草稿提醒。
- After：复杂角色回归扩大到 12 个场景；涉及隐藏信息、开局修正、胜负、保护的角色也能输出更清楚的说书人核对点。

### 验证
- `npx vitest run src/services/ai/nightSettlementQualityRegression.test.ts src/services/ai/aiContract.test.ts src/services/ai/aiService.test.ts --reporter=verbose` 通过：3 个测试文件 / 21 项测试。
- `npm run check` 通过：178 个测试文件 / 840 项测试，build 与 architecture verification 全部通过。
- `npm run audit:public` 通过。

### 风险
- 仍然不是完整规则引擎；普卡上一晚毒目标、诺-达鲺两侧最近镇民、红唇女郎接恶魔等都只是草稿提醒，最终由说书人确认。
- 真实模型 live 抽查还未扩展到这些第二批角色。
