# 给外部模型的 Runtime Mount 复审提示词

你是代码架构审查员。请审查“钟楼说书人副驾驶”项目的 runtime mount 阶段是否可以收口。

## 项目边界

产品不是第二套官方魔典，也不是自动规则引擎。说书人是最终权威。

本阶段只允许：

- 本地 Node runtime。
- archive HTTP route。
- JSON 文件 repository。
- `/healthz`。
- fake review draft。
- smoke 验证。

本阶段禁止：

- 改 UI 默认路径。
- 接真实 AI。
- 读取或保存 API Key。
- 部署 VPS。
- 新增数据库、ORM 或生产依赖。
- 玩家端、账号、权限、官方魔典同步。
- 自动规则引擎、自动胜负、自动昼夜、自动处决。

## 请重点审查文件

- `server/runtime.ts`
- `server/archive/httpArchiveRoutes.ts`
- `server/archive/handlers.ts`
- `server/archive/jsonArchiveRepository.ts`
- `scripts/smoke-backend-runtime.mjs`
- `vite.backend.config.ts`
- `package.json`
- `dev-docs/RUNTIME_MOUNT_PLAN.md`
- `dev-docs/RUNTIME_MOUNT_CLOSURE_AUDIT.md`
- `dev-docs/UNATTENDED_EXECUTION_GUARDRAILS.md`
- `dev-docs/UNATTENDED_TASK_INDEX.md`

## 已运行验收

```powershell
npm run test:server
npm run smoke:backend
npm run check
```

smoke 输出：

```json
{
  "ok": true,
  "archiveId": "archive-smoke-session-smoke-command",
  "archives": 1,
  "reviewProvider": "fake"
}
```

## 输出格式

请按以下格式输出：

1. 总体评级：绿 / 黄 / 红。
2. 一句话结论。
3. 是否可以进入下一阶段：UI HTTP adapter 决策文档。
4. 阻塞问题。
5. 非阻塞改进。
6. 架构风险。
7. 测试缺口。
8. 文档不一致。
9. 是否发现范围膨胀。
10. 是否发现“说书人权威”边界被破坏。
11. 下一步建议。

请给出具体文件路径和原因。不要泛泛评价。
