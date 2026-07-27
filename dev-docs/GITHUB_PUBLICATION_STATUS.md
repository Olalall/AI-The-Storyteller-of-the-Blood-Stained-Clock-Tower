# GitHub 公开发布状态

日期：2026-07-27
仓库：`Olalall/botc-storyteller-companion`
当前可见性：Private
当前默认分支：`main`

## 当前结论

可以作为 **GitHub alpha / preview 私有仓库** 使用。

暂不建议直接改成 Public，除非完成下面的人工确认项：

1. 选择代码 License。
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

公开前仍建议保持 `Private`，确认 License 后再切 `Public`。

## License 状态

当前：`License decision pending`。

不要默认选 MIT / Apache / GPL。因为项目涉及 BOTC 相关概念、社区脚本、可选素材包和免责声明，代码 License 需要项目所有者单独确认。

可选方向：

- 私有自用：暂不添加 License。
- 公开源码但保留授权：自定义限制性许可证或 `All rights reserved` 说明。
- 开源代码：选择 MIT / Apache-2.0 等，但必须明确第三方 BOTC 内容和素材不在该 License 授权范围内。

## 当前剩余阻塞

P0 阻塞：

- License / 授权口径未最终确认。

P1 建议：

- 如果转 Public，创建第一个 GitHub Release：`alpha-preview-YYYYMMDD`。
- README 可后续补英文摘要，但不是公开阻塞。
- 如需获星，可补一张更像封面的项目横幅图；不是工程阻塞。
