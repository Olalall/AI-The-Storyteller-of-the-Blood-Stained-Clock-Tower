# GitHub 公开发布状态

日期：2026-07-27
仓库：`Olalall/botc-storyteller-companion`
当前可见性：Public
当前默认分支：`main`

## 当前结论

可以作为 **GitHub alpha / preview 公开仓库** 使用。

已经切换为 Public；后续公开介绍仍需遵守下面的边界：

1. 代码 License 已选择：MIT，仅覆盖原创代码和原创项目文档。
2. 确认 README 与第三方声明没有把本项目说成官方工具。
3. 确认不提交 API Key、个人路径、本地素材二进制包。
4. 确认官方/社区素材继续走“可选加载包 + 来源说明 + 用户自行同意下载/放置”的边界。

## 已完成

- README 已包含：
  - 项目定位；
  - alpha / preview 状态；
  - 界面截图；
  - 核心功能；
  - 不做事项；
  - 快速开始；
  - 本地后端；
  - AI 配置；
  - 公开仓库与素材包边界；
  - 第三方与免责声明。
- 已生成 GitHub 展示截图：
  - `docs/screenshots/01-dashboard.png`
  - `docs/screenshots/02-setup-advice.png`
  - `docs/screenshots/03-night-workbench.png`
  - `docs/screenshots/04-day-vote.png`
  - `docs/screenshots/05-review.png`
- 已新增截图刷新命令：`npm run screenshots:github`。
- 已有公开审计命令：`npm run audit:public`。
- 当前仓库与旧 V2.5/旧项目仓库分开：
  - 新工具：`botc-storyteller-companion`
  - 旧仓库保留为历史参考，不再作为当前工具默认远端。

## 不能误宣传

公开后 README、仓库描述、Release、社交平台介绍里都不要写：

- 官方工具；
- 官方魔典替代品；
- 自动规则引擎；
- 自动执行技能；
- 自动判定胜负；
- 已通过真实线下局验证；
- 包含官方/社区素材授权；
- AI 裁定结果等同规则权威。

推荐宣传口径：

> Pad 优先的非官方《血染钟楼》线下说书人辅助工具：智能配板草稿、夜间顺序辅助、白天投票记录、日志归档和 AI 复盘建议。AI 只给草稿，最终由说书人确认。

## 公开前命令

公开前在本地运行：

```powershell
npm run audit:public
npm run check
```

可选真实 AI 抽查：

```powershell
npm run smoke:ai-night-live
```

注意：`smoke:ai-night-live` 会调用真实模型，必须由本机环境变量提供 API Key；不要把 Key 写进仓库。

## GitHub 设置建议

仓库描述建议：

```text
Pad-first Blood on the Clocktower storyteller companion: smart setup drafts, night order assistant, voting log, archive review
```

Topics 建议：

```text
botc, blood-on-the-clocktower, storyteller, react, vite, typescript, ai-assistant, tabletop
```

当前已公开为 `Public`。

## License 状态

当前：原创代码和原创项目文档使用 MIT License。

边界：`LICENSE` 保持标准 MIT，便于 GitHub 正确识别；第三方内容排除说明见 `README.md` 与 `THIRD_PARTY_NOTICES.md`。MIT 授权不覆盖 Blood on the Clocktower、官方/社区脚本、角色名、规则文本、视觉素材、商标、provider-owned materials 或任何第三方内容。

决策参考留档：`dev-docs/LICENSE_DECISION_GUIDE.md`。

## 当前剩余阻塞

P0 阻塞：

- 暂无。

P1 建议：

- 建议创建第一个 GitHub Release：`alpha-preview-YYYYMMDD`。
- README 可后续补英文摘要，但不是公开阻塞。
- 如需获星，可补一张更像封面的项目横幅图；不是工程阻塞。
