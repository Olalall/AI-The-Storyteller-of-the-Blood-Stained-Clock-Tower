# 钟楼说书人副驾驶

面向线下《血染钟楼》说书人的非官方辅助工具。帮助记录配板、夜序、技能、提名投票、日志和复盘；AI 只提供候选与草稿，权威结果由说书人确认。

当前主持流程沿用已上线的常驻页、昼夜工作台和独立保存/重置，包含 148 个智能板子。第四批新增 10 板复用共享角色库，来源、规则差异与验收见[本批记录](dev-docs/RELEASE_2026-10-21_WIKI_BATCH_04.md)。角色变化、当夜夜序、卡扎力首夜录入与原有对局保护的历史验收见 [开发文档](dev-docs/README.md)。本轮整合保留 main 的 PWA 安装和更新能力；另一套主持台与魔典顶层未替换进当前入口。

## 安装与运行

Windows 用户可按 [安装教程](安装教程.md) 下载 Release 中的 `botc-storyteller-companion-windows-portable.zip`。源码 ZIP 不是便携安装包。便携包不包含第三方角色图片，安装素材时仍需确认来源和使用说明。

开发环境使用 Node.js 和 npm：

```powershell
npm install
npm run dev
npm run dev:backend
```

前后端开发命令分别在终端运行。后端默认监听 `127.0.0.1:8787`，归档默认保存在 `data/archives/archives.json`。部署步骤见 [自托管手册](dev-docs/SELF_HOSTING_RUNBOOK.md)。

## 手机、平板与离线

HTTPS 部署可安装到主屏幕。PWA 只预缓存入口、主样式和安装图标；已访问的哈希静态资源按需缓存。尚未联网打开过的板子和页面不保证离线可用，真实 AI 和服务器归档仍需联网。

应用更新需要显式确认。编辑保护尚未就绪、有待保存内容或保存失败时，不允许更新刷新。Service Worker 不缓存 API，也不上传对局。

## AI 与私有配置

固定服务器 AI 使用同源后端。提供商地址、模型、API Key 和访问口令只放在服务器的私有配置中；首次验证设备后保留授权。浏览器不需要填写提供商 Key，也不能覆盖服务器提供商配置。AI 不可用时仍可手动主持。

公开仓库只包含占位示例，不包含部署者的 API 地址、密钥、个人域名、云实例、机器路径或对局数据。不要把真实配置写进 Issue、PR、Release、截图或日志。`.env`、私有加密配置和本地归档均不提交。

部署者若显式启用公开分享模式，需要按 [运行手册](dev-docs/SELF_HOSTING_RUNBOOK.md) 单独核对匿名访问限制；不能因为隐藏网站地址就省略权限保护。详细 AI 合同见 [AI Runtime](dev-docs/AI_RUNTIME_STARTUP.md) 与 [AI 权限边界](dev-docs/AI_AUTHORITY_BOUNDARY.md)。

## 检查

```powershell
npm run check
npm run test:e2e
npm run test:e2e:pwa
npm run smoke:backend
npm run audit:public
```

默认检查不调用付费 AI。`smoke:ai-night-live` 需要单独配置与授权，产生的原始请求、响应及日志不得进入公开仓库。公开审计只报告文件、行号和问题类别，不打印匹配值。

本轮 main 整合的取舍、回归、浏览器测试和发布状态见 [整合记录](dev-docs/RELEASE_2026-10-19_MAIN_INTEGRATION.md)。测试结果不等于所有角色组合或实体设备都已穷举。

## 素材与授权

本项目不是官方工具、官方魔典替代品或自动规则引擎。不自动确认身份、阵营、生死、毒醉、处决、胜负或昼夜推进，不做官方魔典同步或常驻玩家端。

原创源码和原创文档采用 [MIT License](LICENSE)。该授权不覆盖 Blood on the Clocktower 的角色、规则、脚本、商标、官方或社区素材。公开仓库保留来源与校验清单，不随仓库分发第三方图片。见 [第三方说明](THIRD_PARTY_NOTICES.md) 与 [公开发布边界](dev-docs/PUBLIC_RELEASE_BOUNDARY.md)。
