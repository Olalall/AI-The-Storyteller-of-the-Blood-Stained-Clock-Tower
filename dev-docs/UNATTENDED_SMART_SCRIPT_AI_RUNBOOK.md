# 无人推进 Runbook：智能板子、开局流程与 AI 合同

状态：Ready。  
适用范围：阶段 10.1 - 10.8。  
本 runbook 是 `UNATTENDED_SMART_SCRIPT_AI_PROJECT.md` 的执行细则。

## 0. 开始前检查

每轮开始先执行：

```powershell
Get-Content .\AGENTS.md -Raw -Encoding UTF8
Get-Content .\dev-docs\README.md -Raw -Encoding UTF8
Get-Content .\dev-docs\UNATTENDED_TASK_INDEX.md -Raw -Encoding UTF8
Get-Content .\dev-docs\UNATTENDED_SMART_SCRIPT_AI_PROJECT.md -Raw -Encoding UTF8
```

然后只选择任务索引中第一个 `Ready` 任务。

## 1. 阶段 10.1：domain/scripts 基础

### 目标

建立智能板子包的最小类型、registry 和读取 API。

### 可改文件

```text
src/domain/scripts/types.ts
src/domain/scripts/registry.ts
src/domain/scripts/index.ts
src/domain/scripts/*.test.ts
```

必要时新增目录，但不接 UI。

### 禁止

- 不改 `GameSession` 行为。
- 不改开局 UI。
- 不迁移所有角色数据。
- 不接真实 AI。

### 验收

- 可以注册和读取一个测试智能板子包。
- registry 不允许重复 `scriptId`。
- 所有角色使用稳定 ID。
- `npm run check` 通过。

## 2. 阶段 10.2：Catfishing 智能板子包草案

### 目标

把现有 Catfishing / 瓦釜雷鸣样例迁移成第一个智能板子包草案。

### 可改文件

```text
src/domain/scripts/packs/catfishing/index.ts
src/domain/scripts/packs/catfishing/roles.ts
src/domain/scripts/packs/catfishing/night-orders.ts
src/domain/scripts/packs/catfishing/setup-templates.ts
src/domain/scripts/packs/catfishing/setup-rules.ts
src/domain/scripts/packs/catfishing/acceptance.md
```

### 禁止

- 不把未核对规则标成 `confirmed`。
- 不靠中文名做主键。
- 不把 pack 数据散落到 UI 组件。

### 验收

- pack 能被 registry 读取。
- roles / night orders / templates 分文件。
- `acceptance.md` 写明来源和 `needs-review` 项。
- `npm run check` 通过。

## 3. 阶段 10.3：规则调研与角色验收

### 目标

按 `RULE_RESEARCH_PROTOCOL.md` 对 Catfishing 涉及角色做规则调研和验收。

### 允许

- 浏览官方或可信规则资料。
- 记录来源 URL、版本、调研日期。
- 把不确定项保留为 `needs-review`。

### 禁止

- 不用模型记忆直接确认规则。
- 不把争议规则硬写进代码。
- 不新增自动技能结算。

### 验收

- 每个角色有知识状态。
- 高风险角色有 notes，例如舞蛇人、洗脑师、熬药女巫等。
- `acceptance.md` 完成角色级清单。
- `npm run check` 通过。

## 4. 阶段 10.4：模板库与候选引擎

### 目标

实现从合规模板库随机抽取候选的本地引擎。

### 可改文件

```text
src/domain/setup-templates/*
src/services/setup-candidates/*
```

### 规则

- 按 `scriptId + playerCount` 筛选模板。
- 默认随机抽取 3 套。
- 测试允许固定 seed。
- 每局记录 `templateId`。
- AI 只解释和提醒，不生成未知模板。

### 验收

- 7、12、15 人筛选有测试。
- 同一个 seed 下测试结果稳定。
- 真实使用不固定 seed。
- 不会返回未验证模板。
- `npm run check` 通过。

## 5. 阶段 10.5：7-15 人开局数据流和 UI

### 目标

把开局流程接入 UI：人数、板子、昵称/经验、候选、调整、确认开局。

### 可改范围

```text
src/features/setup/*
src/features/dashboard/*
src/features/game-session/*
```

只允许围绕开局改动，不重写夜晚/白天工作台。

### 禁止

- 确认开局后自动进入夜晚。
- 自动发送身份。
- 复用上一局身份、状态、日志或评分。
- 让经验标签自动决定角色。

### 验收

- 7、12、15 人可创建空白新局。
- 可复用上一局昵称/经验。
- 未标注经验默认为标准玩家。
- 开局确认后才生成 `GameSession` 权威身份。
- `npm run check` 通过。
- 必要时补 E2E。

## 6. 阶段 10.6：身份交接与重置后引导

### 目标

把确认开局后的身份交接和重置后引导连起来。

### 规则

- 身份交接是可选入口。
- 单人屏幕领取只能显示一个座位身份。
- 实体抽牌只记录进度。
- 重置后回到选择人数。
- 上一局只可作为昵称/经验来源。

### 验收

- 单人展示不出现其他玩家身份。
- 退出身份展示后回到遮蔽/安全状态。
- 重置后旧身份不残留。
- `npm run check` 通过。

## 7. 阶段 10.7：AI 合同与 mock adapter

### 目标

建立真实 AI 前的合同、请求上下文构建器和 mock/fake adapter。

### 可改文件

```text
src/services/ai/*
server/ai/*
dev-docs/API_CONTRACT.md
```

### 允许

- 定义 AI 请求/响应类型。
- 定义 contextLevel。
- 写 mock/fake adapter 测试。
- 写安全边界测试：AI 输出不改变权威状态。

### 禁止

- 不调用真实外部模型。
- 不读取或保存真实 API Key。
- 不新增 OpenAI/Claude SDK。
- 不让 AI 直接写状态。

### 验收

- setup advice、night settlement advice、review draft 至少有合同测试。
- AI 输出未确认前不改变 `GameSession`。
- context builder 默认最小上下文。
- `npm run check` 通过。

## 8. 阶段 10.8：收口审计和外部审查包

### 目标

确认 10.1-10.7 没有越界，并生成给外部大模型审查的材料。

### 可改文件

```text
dev-docs/SMART_SCRIPT_AI_CLOSURE_AUDIT.md
dev-docs/CLAUDE_SMART_SCRIPT_AI_REVIEW_PROMPT.md
dev-docs/HUMAN_CHANGELOG.md
dev-docs/UNATTENDED_TASK_INDEX.md
```

### 禁止

- 不继续扩功能。
- 不接真实 AI。
- 不做 VPS 部署。

### 验收

- 审计文档列出文件预算、状态源、AI 边界、测试证据和未做内容。
- 外部审查提示词能让 Claude 检查架构膨胀、规则引擎化、AI 越权、玩家隐私。
- `npm run check` 通过。

## 9. 阶段 10.9：真实 AI provider 调用

状态：Blocked。

必须先由用户确认：

- 使用哪个 provider。
- 费用风险。
- API Key 保存方式。
- VPS 环境变量或后端 secret 位置。
- 失败时是否回退 fake/local。

未确认前不得实现。

## 10. 阶段 11.0：VPS 正式部署

状态：Blocked。

必须先由用户确认：

- 部署目录。
- 端口。
- 与 V2.5 共存方式。
- 数据目录备份策略。
- 是否允许远端写入。

未确认前不得执行部署。
