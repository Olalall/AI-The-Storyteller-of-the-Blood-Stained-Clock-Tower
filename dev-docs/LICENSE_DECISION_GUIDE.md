# License 决策指南

日期：2026-07-27
适用仓库：`Olalall/botc-storyteller-companion`
当前选择：方案 B，原创代码使用 MIT License，并明确排除第三方内容。

## 已确认结论

本仓库原创代码和原创项目文档使用 MIT License。

该授权不包含：

- Blood on the Clocktower 本身；
- 官方或社区脚本；
- 角色名、规则文本、夜序文本、官方/社区规则语义；
- 官方或社区视觉素材；
- 商标、品牌标识或 provider-owned materials；
- 任何第三方内容。

代码可以授权，第三方内容不能被本仓库的代码 License 顺手授权。

## 为什么选 MIT with exclusions

适合当前项目的原因：

- 公开 GitHub 时访问者容易理解；
- 允许别人学习、fork、提 issue；
- 对原创代码授权清晰；
- 通过 README、LICENSE 和 THIRD_PARTY_NOTICES 把 BOTC/社区/素材边界分开。

## 已落地文件

说明：第三方内容排除说明放在 README 与 THIRD_PARTY_NOTICES，避免破坏 GitHub 对 MIT License 的自动识别。

- `LICENSE`：标准 MIT License，便于 GitHub 正确识别。
- `README.md`：License 区说明原创代码 MIT、第三方内容不授权。
- `THIRD_PARTY_NOTICES.md`：第三方声明和素材包边界。
- `dev-docs/GITHUB_PUBLICATION_STATUS.md`：公开发布状态更新为 License 已收口。

## 公开前仍要注意

即使代码 License 已经收口，公开仓库前仍然不要误宣传：

- 官方工具；
- 官方魔典替代品；
- 自动规则引擎；
- 自动执行技能；
- 自动判定胜负；
- 已通过真实线下局验证；
- 包含官方/社区素材授权；
- AI 裁定结果等同规则权威。

## 素材包边界

公开仓库默认不提交官方/社区二进制素材。

允许提交：

- 来源说明；
- hash / manifest；
- 导入说明；
- 可选加载包的说明文本。

不应提交：

- 未获明确授权的官方角色图标二进制包；
- 未获明确授权的社区图片素材；
- 把第三方素材说成由 MIT 授权。

## 下一步

License 阻塞已解除。

如果要正式公开 GitHub，还需要：

1. 跑 `npm run audit:public`。
2. 跑 `npm run check`。
3. 人工打开 GitHub 首页确认 README、截图和免责声明显示正常。
4. 将仓库可见性从 Private 切换为 Public。
5. 可选：创建 `alpha-preview-20260727` Release。
