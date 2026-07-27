# 公开发布前最终审计记录

日期：2026-07-27

## 结论

当前仓库可以进入 GitHub alpha / preview 发布前的人工决策阶段。

通过项：

- 公开审计通过：未发现真实 API Key、本机个人路径或被规则识别的敏感内容。
- 构建与测试通过：lint、单测、build、architecture verification 均通过。
- 素材边界正常：角色 WebP 和社区二进制素材被 Git 忽略；manifest 和 README 保留。
- README、第三方说明、公开边界、模拟主持验收和 GitHub checklist 已落地。

仍需人工决定：

- 代码许可证尚未选择。
- 是否现在创建 GitHub 仓库和首次提交。
- 是否先补仓库截图 / demo GIF。

## 已执行命令

```powershell
npm run audit:public
npm run check
```

结果：

- `npm run audit:public`：通过；素材引用提示是预期提醒，不是失败。
- `npm run check`：通过，177 个测试文件 / 828 项测试通过，build 与 architecture verification 通过。

## Git 素材边界抽查

会进入 Git 的公开素材说明：

```text
public/assets/characters/source-manifest.json
public/assets/community/README.md
```

被 Git 忽略的本地二进制素材：

```text
public/assets/characters/*.webp：126 个
public/assets/community/*：1 个
```

这符合 `PUBLIC_RELEASE_BOUNDARY.md`：公开仓库保留来源说明、manifest 和导入边界，不默认提交官方/社区二进制素材。

## 发布措辞检查

允许：

- 社区制作的非官方说书人辅助工具。
- 当前为 alpha / preview。
- 已通过模拟主持流程验证，适合自用和早期试用。
- AI 只给草稿和建议，权威状态由说书人确认。

禁止：

- 官方工具。
- 官方魔典替代品。
- 已通过真实线下局验证。
- 自动正确结算所有规则。

## 当前不阻塞但建议后续优化

1. Vite build 仍提示主 chunk 超过 500 kB。当前不阻塞 alpha / preview，但后续可按页面或板子包做 code splitting。
2. License decision pending。发布前如果希望别人复用代码，需要明确许可证；如果只是先展示项目，可以先保持未授权复用口径。
3. README 还没有正式截图或 GIF。想要 GitHub 获星，截图会明显提升理解速度。
