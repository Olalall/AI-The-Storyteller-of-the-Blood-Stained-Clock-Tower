# 外部模型审查提示词：后端 P0 收口

请你作为严格的后端架构审查员，审查这个项目的后端 P0 收口状态。

## 项目背景

项目是《血染钟楼》线下说书人辅助工具：

- 官方/实体魔典仍是主要空间视角。
- 本项目负责结构化记录、配板草稿、夜晚/白天/投票工作台和复盘草稿。
- AI 只能生成草稿或建议，不能修改权威状态。
- 当前后端 P0 只做归档最小闭环，不做真实 AI、不做 VPS、不做玩家端、不做官方魔典同步。

## 请审查的文件

优先阅读：

1. `dev-docs/BACKEND_P0_FINAL.md`
2. `dev-docs/UNATTENDED_BACKEND_4_RUN_PLAN.md`
3. `dev-docs/BACKEND_P0_CLOSURE_AUDIT.md`
4. `dev-docs/API_CONTRACT.md`
5. `dev-docs/frontend-backend-contract.md`
6. `server/archive/*`
7. `src/services/archive/*`

## 已完成的四次无人推进

1. 第 1 次：archive HTTP route + 错误码。
2. 第 2 次：`httpArchiveAdapter`。
3. 第 3 次：`setAsyncArchiveAdapter()` 受控切换与 HTTP 闭环测试。
4. 第 4 次：fake 复盘草稿 endpoint。

## 审查重点

请逐项判断：

1. 后端 P0 是否仍在冻结范围内。
2. 是否意外实现或引入了真实 AI、API Key、AI provider 抽象、数据库、VPS、玩家端或官方魔典同步。
3. `ArchiveAdapter` 与 `AsyncArchiveAdapter` 的边界是否健康。
4. `httpArchiveAdapter` 是否有失败伪装成功的问题。
5. `resetAfterArchive` 是否保持门卫模式，没有创建新 `GameSession`。
6. `generateReviewDraft` 是否只是 fake 草稿，没有修改归档或当前局。
7. route / handler / repository 分层是否清楚。
8. JSON 文件存储是否足够 P0，是否有明显数据损坏风险。
9. 测试是否覆盖 P0 必须路径。
10. 文档和代码是否存在明显不一致。

## 请输出

请用以下格式输出：

```text
总体评级：绿 / 黄 / 红

一句话结论：

是否可以进入下一阶段：

阻塞问题：
1.
2.

非阻塞改进：
1.
2.

架构风险：
1.
2.

测试缺口：
1.
2.

文档不一致：
1.
2.

下一步建议：
1.
2.
```

## 判断标准

- 只要发现真实 AI、凭证读取、数据库、部署、官方魔典同步、玩家常驻端、自动规则引擎或后端创建新局，应评为红。
- 如果只是 runtime 还未挂载、API 合同有未来字段未实现、fake 草稿质量有限，可评为黄但不一定阻塞。
- 如果范围、测试、文档和架构都基本一致，可评为绿。
