# 血染钟楼AI说书人辅助工具

根据个人理解制作的，AI血染钟楼说书人辅助工具，因为本人线下组局常常遇到这种问题，1.配板需要说书人非常熟悉技能，角色，有理解，才能配出比较好玩的板子，耗时长。2.技能结算，夜间处理长。3.投票记录麻烦。4.发送玩家身份太过古法，不够方便。5.全局日志需要手动记录。6.复盘评分复杂等问题。
内置100个智能板子，什么叫智能板子？智能板子是AI根据导入的板子，角色技能，发动逻辑，夜间技能顺序等，做成了一个知识库，是真的懂如何配板，在什么情况下能够做出什么判断而不出错。

它不是官方魔典，也不是线上游戏平台，更不是自动规则引擎。它的核心定位是：
帮说书人减少记录、配板、夜序、投票、复盘和规则判断时的脑力负担，但最终裁定权永远在说书人手里。

它适合的使用方式是：
说书人依然使用官方/实体魔典作为主要局面视角，同时在平板、电脑或 VPS 页面上打开这个工具，作为记录台和 AI 顾问。
核心优势
1. 很贴合线下说书人的真实痛点
这个项目不是从“我要做一个线上血染钟楼”出发，而是从线下主持的真实麻烦出发：
开局要配板；
要考虑人数、玩家经验、趣味性、角色冲突；
夜晚要按夜序逐个唤醒；
每个角色技能要记录目标、结果、信息；
白天要记录提名、票型、处决；
出错后要能更正；
赛后还要能复盘。
它解决的是说书人主持时最累的那部分：
记不清、写不快、容易漏、规则复杂、复盘困难。

2. 不抢说书人的权威
这是很重要的优势。
很多类似工具容易走偏，变成：
自动结算技能；
自动改身份；
自动判死亡；
自动进昼夜；
自动判胜负。
这个项目明确不这么做。
AI 只能提供：
配板建议；
夜间结算建议；
规则提醒；
日志草稿；
复盘草稿。
但所有关键结果都必须由说书人确认：
身份；
阵营；
死亡；
中毒；
醉酒；
处决；
胜负；
昼夜推进。
这让它更像“副驾驶”，不是“代驾”。

3. 智能配板是核心亮点
普通工具最多只能导入板子，或者随机发身份。
这个项目的优势是会把板子做成“智能板子”。
智能板子不只是 JSON：
有角色池；
有夜序；
有 setup 影响；
有角色风险提醒；
有推荐配板模板；
有恶魔伪装建议；
有玩家经验参与考虑；
有 AI 解释为什么这样配。
对说书人来说，它不是简单随机，而是可以快速给出几套“能玩、合理、有趣”的候选组合。
尤其适合：
临时开局；
玩家经验不均；
不想每次都用同一套配置；
想让游戏更持久、更有戏剧性。

4. 夜晚工作台非常贴近主持流程
夜晚是血染钟楼最容易出错的部分。
这个项目的夜晚工作台不是简单列表，而是围绕“逐个唤醒”设计：
当前夜序；
当前角色；
当前玩家；
玩家昵称；
技能说明；
目标选择；
猜测角色；
受到影响；
AI 建议；
确认记录；
同步到日志。
优势是说书人可以按顺序处理，不容易漏人，也不需要边翻规则边手写。
它尤其适合复杂角色，比如：
赌徒；
舞蛇人；
洗脑师；
普卡；
诺-达鲺；
方古；
红唇女郎；
熬药女巫；
疯子；
数学家。
这些角色不应该自动结算，但 AI 可以提醒说书人该注意什么。

5. 白天投票和提名记录更结构化
线下白天投票也很容易乱：
谁提名谁；
几票；
是否超过门槛；
是否覆盖暂列；
是否平票；
谁最终被处决；
死亡票有没有用。
这个工具把这些内容做成结构化记录，不再只靠纸笔。
它不会自动杀人，而是帮你记录完整过程，最后由说书人确认。

6. 日志和更正体系是长期优势
这个项目很重视“可追溯”。
每晚行动、每次投票、每条信息、每次更正都可以进入日志。
如果说书人中途改了结果，不是简单覆盖，而是保留更正记录。
这很适合：
现场纠错；
复盘；
回看争议；
总结说书人操作；
后续 AI 复盘。
简单说，它把“手写纸”变成了可搜索、可分类、可复盘的记录。

7. 赛后复盘比普通日志更进一步
普通工具做到记录就结束了。
这个项目还做了复盘方向：
整局时间线摘要；
关键转折；
玩家关键行为摘录；
AI 锐评草稿；
每个玩家评语；
整局游戏节奏评价。
当然，它不会假装自己完全知道玩家发言和心理博弈。
它只能基于日志做草稿，但这个草稿足够帮说书人快速组织复盘。

8. 架构边界比较健康
这个项目有一个很大的优势：
它一直在防止变成屎山。
目前已经明确了很多边界：
不做完整规则引擎；
不做玩家常驻端；
不做官方魔典同步；
不做数据库/ORM 过度工程；
不把每个角色写成巨大 if/else；
不把 AI 建议直接写进权威状态；
多板子走智能板子包架构；
复杂角色走共享规则知识；
前端、后端、AI、板子数据都有分层。
这对长期维护很重要。
因为血染钟楼角色多、板子多、特殊规则多，如果一开始不设边界，后面一定会乱。

9. 支持自托管和 VPS
这个项目不是只能本地跑。
现在已经支持：
本地运行；
后端 runtime；
JSON 归档；
VPS 部署；
Windows Scheduled Task 托管；
GitHub Release；
自托管说明；
公开仓库边界说明。
这意味着它可以作为你自己的长期工具运行在 VPS 上，而不是只能开开发环境。

## AI 权限边界

AI 可以：

- 给配板候选；
- 解释候选为什么适合当前人数/玩家经验；
- 给夜间技能结算建议；
- 给玩家信息文案草稿；
- 提醒缺少目标、缺少历史信息、状态冲突或高风险规则；
- 生成赛后复盘草稿和玩家锐评草稿。

AI 不可以：

- 自动发送身份；
- 自动执行技能；
- 自动改变身份、阵营、死亡、毒醉或疯狂状态；
- 自动判定胜负；
- 自动进入下一昼夜；
- 把建议写成权威裁定。

## 不做什么

- 不自动运行完整规则；
- 不自动判定胜负；
- 不自动改身份、阵营、死亡、毒醉；
- 不自动执行技能；
- 不同步或操作官方魔典；
- 不做常驻玩家端/收件箱；
- 不把 AI 建议当权威裁定；
- 不把官方/社区素材直接随公开仓库发布。

## 快速开始

```powershell
npm install
npm run dev
```

打开 Vite 输出的本地地址，默认进入“本局”。

## 本地后端

构建并启动本地 runtime：

```powershell
npm run dev:backend
```

默认：

- host: `127.0.0.1`
- port: `8787`
- archive data: `data/archives/archives.json`

可参考 `.env.example` 设置环境变量。

## AI 配置

真实 AI 走后端代理，前端只保存非敏感设置。不要把 API Key 写入源码或提交到 Git。

当前状态：

- 后端已有 OpenAI-compatible provider 配置和一次性 live test 入口。
- 默认 `BOTC_AI_ENABLED=false`，不调用真实模型。
- AI 配板、夜间结算和赛后复盘仍是草稿建议；不会自动改权威状态。
- 详细启动方式见 `dev-docs/AI_RUNTIME_STARTUP.md`。

环境变量示例：

```powershell
$env:BOTC_AI_ENABLED='true'
$env:BOTC_AI_PROVIDER='openai-compatible'
$env:BOTC_AI_BASE_URL='https://api.example.com/v1'
$env:BOTC_AI_MODEL='your-model-name'
$env:BOTC_AI_API_KEY='your-local-secret'
```

## 自托管 / VPS

本项目可以本机运行，也可以部署到自用 VPS。推荐先看：

- `dev-docs/SELF_HOSTING_RUNBOOK.md`：从本机验证、打包、VPS 同步、启动、健康检查、备份到回滚的完整说明。
- `dev-docs/VPS_DEPLOYMENT_PREP.md`：当前自用 VPS 与旧 V2.5 的目录、端口和共存边界。
- `dev-docs/AI_RUNTIME_STARTUP.md`：真实 AI provider 的环境变量和连通测试。

关键边界：API Key 只放后端环境变量；归档数据默认是 JSON 文件；AI 不可用时，手动主持流程仍必须可用。

## 验证

```powershell
npm run check
npm run test:e2e
npm run smoke:backend
npm run smoke:ai-night-live
npm run audit:public
```

`audit:public` 用于拦截真实 API Key、本机个人路径和素材误提交风险。
`smoke:ai-night-live` 是可选真实模型抽查，运行前必须设置 `BOTC_AI_BASE_URL`、`BOTC_AI_MODEL` 和 `BOTC_AI_API_KEY`；默认检查不会调用真实模型。

刷新 GitHub 展示截图：

```powershell
npm run screenshots:github
```

## 公开仓库与素材包

代码可以公开整理；官方/社区二进制素材默认不提交。

本地素材目录：

- `public/assets/characters/`
- `public/assets/community/`

保留来源说明：

- `public/assets/characters/source-manifest.json`
- `public/assets/community/README.md`
- `THIRD_PARTY_NOTICES.md`

详细边界见 `dev-docs/PUBLIC_RELEASE_BOUNDARY.md`。

## 项目文档

- `dev-docs/README.md`：文档索引和当前路线。
- `dev-docs/PRODUCT_VISION.md`：产品定位。
- `dev-docs/AI_AUTHORITY_BOUNDARY.md`：AI 权限边界。
- `dev-docs/SCRIPT_ARCHITECTURE_PLAN.md`：智能板子包架构。
- `dev-docs/RULE_RESEARCH_PROTOCOL.md`：新增板子前的规则调研。
- `dev-docs/ABILITY_SETTLEMENT_BOUNDARY.md`：技能结算建议边界。
- `dev-docs/AI_INTEGRATION_PLAN.md`：真实 AI 接入和上下文最小化。
- `dev-docs/SMOKE_HOSTING_SCENARIOS.md`：模拟主持流程验收。
- `dev-docs/GITHUB_RELEASE_CHECKLIST.md`：GitHub 发布检查清单。
- dev-docs/GITHUB_PUBLICATION_STATUS.md：GitHub 公开发布状态。
- dev-docs/releases/alpha-preview-20260727.md：首个 alpha preview Release Notes 草稿。

## 第三方与免责声明

见 `THIRD_PARTY_NOTICES.md`。

本项目是社区制作的非官方辅助原型。Blood on the Clocktower、相关角色、概念、脚本、视觉资产和官方资源属于其各自权利人。

## License

The original source code and original project documentation in this repository are licensed under the MIT License. See `LICENSE`.

This MIT License does not grant any rights to Blood on the Clocktower, official or community scripts, role names, rules text, visual assets, trademarks, provider-owned materials, or any third-party content. See `THIRD_PARTY_NOTICES.md`.

## Windows 零安装便捷包

普通使用者无需安装 Node.js、npm 或开发工具。请在 GitHub Release 下载 `botc-storyteller-companion-windows-portable.zip`，完整解压后双击根目录 `Start-Storyteller.cmd`。便捷包内置经过官方 SHA-256 校验的 Node.js LTS 运行时及其许可证。

首次启动可以配置 AI，也可以跳过；夜序、记录、投票、日志和归档不依赖 AI。配置只保存在本机 `.env`，不会随仓库发布。

详细说明：[`docs/QUICK_START_WINDOWS.md`](docs/QUICK_START_WINDOWS.md)。开发者仍可使用 `npm install`、`npm run dev` 和 `npm run dev:backend`。

> GitHub 的 **Code → Download ZIP** 是源码包，不是零安装便捷包。普通使用者只下载 Releases 中名称完全一致的 portable ZIP。

中文说明：本仓库原创代码和原创项目文档按 MIT License 授权；但该授权不包含 Blood on the Clocktower 相关内容、官方/社区脚本、角色名、规则文本、视觉素材、商标或第三方提供方材料。
