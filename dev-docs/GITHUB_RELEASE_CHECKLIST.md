# GitHub 发布检查清单

目标：把当前项目发布为 GitHub alpha / preview，而不是正式稳定版。

## 1. 版本定位

- [ ] README 标明：社区制作、非官方、说书人辅助工具。
- [ ] README 标明：不是官方魔典，不自动结算全部规则。
- [ ] README 标明：AI 只给草稿和建议，权威状态由说书人确认。
- [ ] release 标题使用 `alpha` / `preview`，不要写 `stable` / `正式版`。
- [ ] 发布说明使用“已通过模拟主持流程验证”，不要写“已通过真实线下局验证”。

## 2. 隐私与密钥

- [ ] `.env`、`.env.*` 没有进入 Git。
- [ ] `.env.example` 只包含占位符。
- [ ] 搜索确认没有 API Key、token、cookie、私钥、服务器密码。
- [ ] 搜索确认没有本机个人路径、聊天截图路径、微信临时文件路径。

命令：

```powershell
npm run audit:public
```

## 3. 素材与第三方内容

- [ ] `public/assets/characters/*.webp` 没有进入 Git。
- [ ] `public/assets/community/*` 二进制素材没有进入 Git。
- [ ] `public/assets/community/README.md` 存在，用来解释社区素材目录。
- [ ] `THIRD_PARTY_NOTICES.md` 列出 BOTC、TPI、官方资源、社区脚本来源。
- [ ] `dev-docs/PUBLIC_RELEASE_BOUNDARY.md` 明确素材包策略。

## 4. 功能可运行

- [ ] 本地前端能启动。
- [ ] 本地后端 runtime 能启动。
- [ ] 模拟主持流程按 `SMOKE_HOSTING_SCENARIOS.md` 通过。
- [ ] AI 不可用时，开局、夜序、投票、日志、归档仍可用。
- [ ] 缺素材时，页面有降级提示，不阻塞核心流程。

命令：

```powershell
npm run check
npm run smoke:backend
```

## 5. GitHub 首页体验

- [ ] README 首屏能说明项目是什么、给谁用、解决什么问题。
- [ ] README 有启动命令。
- [ ] README 有当前能力列表。
- [ ] README 有公开仓库/素材包说明。
- [ ] README 有项目边界和不做内容。
- [ ] README 有截图或后续截图占位说明。

## 6. 许可证决策

当前不自动选择许可证。发布前必须明确：

- [ ] 代码采用什么许可证，或暂不授权复用。
- [ ] 素材不受代码许可证覆盖。
- [ ] 第三方数据、角色名、能力文本和图标遵循其各自来源条款。

如果没有选定许可证，README 应写明：

> License decision pending. No license is granted for third-party assets.

## 7. 发布后观察

- [ ] 收集首次用户安装失败点。
- [ ] 收集素材包缺失反馈。
- [ ] 收集 AI 配置失败反馈。
- [ ] 收集夜间建议误判案例。
- [ ] 收集多板子质量缺口。

发布后不要立即扩大功能范围；先修安装、文档、素材、AI 配置和模拟主持流程中的硬问题。
