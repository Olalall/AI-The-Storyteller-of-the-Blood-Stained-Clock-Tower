# License 决策指南

日期：2026-07-27
适用仓库：`Olalall/botc-storyteller-companion`

## 先说结论

当前不建议我直接替你选择 MIT / Apache / GPL。

原因不是代码不能开源，而是这个项目天然包含三类边界：

1. 你自己写的应用代码；
2. Blood on the Clocktower 相关概念、角色名、规则语义和第三方权利；
3. 官方/社区脚本与可选视觉素材包。

代码可以授权，第三方内容不能被本仓库的代码 License 顺手授权。

## 当前最稳方案

### 方案 A：继续 Private，不添加 License

适合：

- 继续自用；
- VPS 自用；
- 不急着公开获星；
- 还想继续改功能和板子。

效果：

- GitHub 上默认所有权利保留；
- 不会误导别人以为可以自由复制、商用、二次分发；
- 最少法律解释成本。

缺点：

- 不利于公开获星；
- 外部用户不能明确知道是否可复用代码。

当前推荐：**是。**

## 准备公开时的推荐方案

### 方案 B：代码使用 MIT，但明确排除第三方内容

适合：

- 你想公开 GitHub；
- 希望别人能学习、fork、提 issue；
- 希望项目更像正常开源项目。

需要同时做：

1. 新增 `LICENSE`：只授权本项目原创代码。
2. README License 区写清楚：BOTC 内容、社区脚本、官方/社区素材不在 MIT 授权范围内。
3. `THIRD_PARTY_NOTICES.md` 保留第三方权利声明。
4. 素材继续不进仓库，只做可选加载包。
5. 不在 README 或 Release 里写“官方授权”。

优点：

- GitHub 访问者最容易理解；
- 有利于获星和协作；
- 对原创代码的授权清晰。

风险：

- 需要把“第三方内容不随 MIT 授权”写得非常明显；
- 仍然不是法律意见，公开前最好再人工复核一次 README 和 notices。

当前推荐：**如果你要 Public，这是我更建议的路线。**

### 建议 License 说明文案

如果选 MIT，可以在 README 保留这段：

```text
The original source code in this repository is licensed under the MIT License.
This license does not grant any rights to Blood on the Clocktower, official or community scripts, character names, rules text, visual assets, trademarks, or provider-owned materials. See THIRD_PARTY_NOTICES.md.
```

中文说明：

```text
本仓库原创代码可按 MIT License 使用；但该授权不包含 Blood on the Clocktower 相关内容、官方/社区脚本、角色名、规则文本、视觉素材、商标或第三方提供方材料。详见 THIRD_PARTY_NOTICES.md。
```

## 不推荐方案

### 方案 C：GPL / AGPL

不推荐原因：

- 对个人自用和小工具协作偏重；
- 容易让贡献者或使用者困惑；
- 项目当前重点是工具可用性和边界清晰，不是强 copyleft。

### 方案 D：直接把官方/社区素材一起提交并声明开源

不推荐原因：

- 这会把代码授权和素材授权混在一起；
- 容易让别人误以为素材可自由复制和再分发；
- 与当前素材包边界冲突。

### 方案 E：不写免责声明就 Public

不推荐原因：

- 容易被理解成官方工具；
- 容易被理解成官方魔典替代品；
- 容易被理解成 AI 规则裁定器。

## 公开前最小动作清单

如果你决定 Public，建议按这个顺序：

1. 选择 License：继续 pending / MIT with exclusions / 自定义保留授权。
2. 如果选 MIT：新增 `LICENSE`。
3. 更新 README 的 License 区。
4. 再跑：

```powershell
npm run audit:public
npm run check
```

5. 人工打开 GitHub 首页看截图和免责声明。
6. 把 GitHub 仓库从 Private 改成 Public。
7. 可选：创建 `alpha-preview-20260727` Release。

## 我的建议

如果目标是“先稳，再公开”：

- 现在保持 Private；
- License 保持 pending；
- 继续用新仓库同步代码和截图；
- 等你确认要公开那天，再走方案 B。

如果目标是“尽快公开获星”：

- 选方案 B；
- 我新增 MIT `LICENSE`，并同步 README/THIRD_PARTY_NOTICES/PUBLICATION_STATUS；
- 跑 `audit:public` 和 `check`；
- 你最后确认后再切 Public。

## 需要你最终确认的一句话

二选一即可：

- “暂时不公开，保持 Private 和 License pending。”
- “准备公开，采用 MIT 代码许可证，但排除 BOTC/社区/素材等第三方内容。”
