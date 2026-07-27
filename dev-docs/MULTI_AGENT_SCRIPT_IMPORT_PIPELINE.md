# 多 Agent 批量智能板子导入流水线

适用范围：后续批量导入社区、官方、推荐剧本，并把它们转成 `SmartScriptPack`。  
冻结日期：2026-07-21。  
目标：允许多个 Agent 并行做“单板调研”，但共享角色事实、规则知识、注册表和最终代码只能由主 Agent/集成 Agent 单写入，避免 132 个板子越导越乱。

## 1. 核心原则

允许并行：

```text
来源采集 -> 单板调研 -> 单板草稿 -> 主 Agent 复核 -> 集成到 pack -> 统一测试
```

禁止并行写共享核心：

```text
子 Agent 直接改 catalog.ts / role-copy.ts / complexRoleKnowledge.ts / registry.ts
```

## 2. 子 Agent 只能产出调研材料

每个子 Agent 只负责一个或少量剧本，输出到：

```text
dev-docs/script-import-work/<batch-id>/<script-id>/
  source.json
  roles.json
  night-orders.json
  setup-rules.json
  setup-templates-draft.json
  risks.md
  acceptance-draft.md
```

子 Agent 禁止修改：

```text
src/domain/scripts/catalog.ts
src/domain/scripts/role-copy.ts
src/domain/role-knowledge/complexRoleKnowledge.ts
src/features/**
server/**
```

## 3. 批量导入前置清点

### 3.1 角色清点

每个批次先生成：

```text
dev-docs/script-import-work/<batch-id>/ROLE_CENSUS.md
```

必须记录：

- 角色英文 ID / 中文显示名。
- 阵营与角色类型。
- 能力文本与能力 hash。
- 是否已经存在于共享角色事实库。
- 是否需要新增复杂角色研究。
- 是否存在同名不同能力、同能力不同名、社区改版等冲突。

### 3.2 剧本特殊规则清点

每个批次先生成：

```text
dev-docs/script-import-work/<batch-id>/SCRIPT_RULE_CENSUS.md
```

必须记录：

- setup 人数修正。
- 夜序变体。
- 恶魔伪装 / 信息链提醒。
- 传奇角色、旅行者、实验角色。
- 特殊胜负、处决、死亡、身份变化、阵营变化相关提醒。

特殊规则只能作为“提醒 / AI 上下文 / 草稿”，不能变成自动规则引擎。

## 4. 重复角色处理

导入候选角色使用如下结构：

```ts
interface RoleImportCandidate {
  scriptId: string
  rawRoleId: string
  canonicalGuess: string
  englishName: string
  chineseName?: string
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled'
  abilityText: string
  abilityHash: string
  sourceUrls: string[]
  sourceVersion?: string
  sourceType: 'official' | 'experimental' | 'community' | 'custom'
  riskFlags: string[]
}
```

处理规则：

| 情况 | 处理 |
|---|---|
| 同 canonicalGuess + 同 abilityHash | 复用已确认角色事实 |
| 同中文/英文名但 abilityHash 不同 | 写入 `ROLE_CONFLICTS.md`，不得自动合并 |
| 同能力但不同译名 | 记录 alias，人工确认后合并 |
| 官方角色已存在 | 复用 canonical role |
| 社区自定义角色 | 使用 `<script-id>/<role-slug>`，默认 `needs-review` |
| 来源不清 | 标记 `needs-review`，AI 不得当成确定规则 |

## 5. 单写入集成流程

集成 Agent 按以下顺序执行：

1. 汇总子 Agent 草稿。
2. 生成角色冲突表。
3. 复核来源 URL、版本、hash。
4. 复核夜序和 setup 修正。
5. 把通过复核的角色事实接入共享库。
6. 把仍有争议的角色标记 `needs-review`。
7. 创建 `SmartScriptPack`。
8. 注册 catalog。
9. 补测试。
10. 跑检查。
11. 更新 changelog 和 closure audit。

## 6. 标准 pack 形态

每个正式接入的剧本使用：

```text
src/domain/scripts/packs/<script-id>/
  index.ts
  roles.ts
  night-orders.ts
  setup-rules.ts
  setup-templates.ts
  acceptance.md
```

要求：

- `index.ts` 只组装。
- `roles.ts` 只描述角色事实与投影字段。
- `night-orders.ts` 只描述夜序过滤数据。
- `setup-rules.ts` 只描述人数修正 / 风险提示，不自动结算。
- `setup-templates.ts` 只放 verified 模板。
- `acceptance.md` 记录来源、hash、验收、风险。

## 7. 验证命令

批量导入后至少运行：

```powershell
npx vitest run src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts
npm run verify:architecture
npm run check
```

单板导入时增加：

```powershell
npx vitest run src/domain/scripts/packs/<script-id>/index.test.ts
```

## 8. 停止条件

遇到以下情况必须停止并报告：

- 来源无法确认或 hash 不稳定。
- 同名不同能力无法判断。
- 剧本包含大量自定义规则，需要产品边界确认。
- 子 Agent 需要 API Key、VPS、登录态或外部写入。
- 需要绕过 `SmartScriptPack`。
- 需要在页面组件里写 `if (scriptId === ...)` 规则分支。
- 需要自动改变身份、阵营、死亡、毒醉、胜负等权威状态。
- 单文件接近架构预算上限。

## 9. 当前建议

下一批不要直接导入 132 个。先做“来源读取器 + 10-20 个候选批次”的来源锁定和角色清点。确认读取器稳定后，再并行做单板调研，最后单写入集成。
