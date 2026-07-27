# 新板子规则调研协议

状态：设计冻结，新增板子前必须执行。  
目标：避免 AI 和代码在不了解板子规则时给出错误配板或技能结算建议。

## 1. 硬门槛

任何新板子要进入“可智能开局”列表，必须先完成：

1. 来源记录。
2. 角色清单确认。
3. 每个角色技能确认。
4. 首夜/其他夜顺序确认。
5. 人数构成与特殊 setup 规则确认。
6. 高风险角色交互标记。
7. 模板库验收。
8. 说书人 spot-check 或明确标记为 `needs-review`。

未完成前只能作为导入草稿，不能用于智能配板和 AI 技能建议。

## 2. 资料来源

优先级：

1. 官方规则、官方角色说明、官方 wiki 或可信规则资料。
2. 板子作者发布说明。
3. 当前项目已确认的旧资料。
4. AI 生成的初稿。

AI 初稿不能单独作为确认来源。对规则生效时机、身份变化、阵营变化、疯狂、毒醉、额外死亡等内容，必须额外核对。

## 3. 每个角色必须确认的字段

```ts
interface RoleResearchRecord {
  roleId: string
  chineseName: string
  englishName?: string
  team: 'townsfolk' | 'outsider' | 'minion' | 'demon' | 'traveler' | 'fabled'
  abilityText: string
  firstNight?: number
  otherNight?: number
  setupImpact: string[]
  inputShape: AbilityInputShape
  possibleOutcomes: string[]
  stateChanges: string[]
  identityChanges: string[]
  teamChanges: string[]
  playerMessageTemplates: string[]
  highRiskNotes: string[]
  knowledgeStatus: 'confirmed' | 'needs-review' | 'missing'
  reviewedBy?: string
  reviewedAt?: string
}
```

## 4. 高风险规则清单

新增板子时必须特别检查：

- 改变身份。
- 改变阵营。
- 改变是否醉酒/中毒。
- 新增或移除外来者。
- 新恶魔、旧恶魔死亡、额外死亡。
- 疯狂和打破疯狂后果。
- 多目标技能。
- 信息真假与说书人自由裁量。
- 技能立即生效还是下个夜晚生效。
- 当前夜序是否需要人工处理例外。

## 5. 知识状态

### confirmed

可以用于：

- 智能配板。
- 夜序筛选。
- 本地规则提示。
- AI 技能建议。

### needs-review

可以显示，但必须提示：

- 规则未完全确认。
- AI 建议置信度降低。
- 说书人必须自行核对。

### missing

只能手动记录，不能进入智能配板或 AI 技能建议。

## 6. 角色名校验

必须同时保存稳定 ID 和展示名。

例如“蛇魅人/舞蛇人”这种名称差异会直接影响理解和玩家信息，不能靠中文字符串猜测。展示名需要逐个确认。

## 7. 输出产物

每个新板子完成后应新增：

```text
src/domain/scripts/packs/<script-id>/
  index.ts
  roles.ts
  night-orders.ts
  setup-templates.ts
  setup-rules.ts
  acceptance.md
```

`acceptance.md` 记录：

- 来源。
- 已确认角色。
- 未确认项。
- 高风险交互。
- 模板数量。
- 验证命令。

## 7.1 AI 可用门禁

每个角色的 `research` 不只是给人看的备注，也是 AI 夜间建议和 AI 配板建议的输入来源。新增智能板子时必须保证：

- `roleResearchForAI(scriptId, roleId)` 能投影出该角色的 `sourceUrls`、`reviewedAt`、`possibleOutcomes`、`stateChanges`、`identityChanges`、`teamChanges`、`playerMessageTemplates` 和 `highRiskNotes`。
- 夜间 AI 请求只能携带当前唤醒项、当前草稿、已选目标简况、可选结果、`roleKnowledge` 和 `roleResearch`，不能塞完整魔典或完整日志。
- 真实 AI 必须优先使用 `roleResearch`，再参考模型自身知识；如果 `knowledgeStatus !== confirmed`，必须降低置信度并提示说书人复核。
- 复杂角色必须把“可建议”和“必须人工确认”分开：身份、阵营、死亡、毒醉、疯狂、延迟结算只能进入草稿或确认提醒。
- 新板子导入完成后必须运行 `src/domain/scripts/roleResearchProjection.test.ts` 覆盖的质量门；投影失败就不能标为智能板子可用。
- `research` 里不能出现乱码占位（例如 `????`）；高风险技能词必须落到对应字段：死亡/复活进 `possibleOutcomes` 或 `stateChanges`，毒醉进 `stateChanges`，疯狂进 `playerMessageTemplates` 或 `highRiskNotes`，身份/阵营变化进 `identityChanges` / `teamChanges`。
- 从外部 JSON 导入角色时，要把常见下划线 ID 映射到项目稳定 ID，例如 `snake_charmer -> snakecharmer`、`pit_hag -> pithag`，避免同一角色重复建档。

## 8. 禁止事项

- 不靠模型记忆直接写规则。
- 不让前端用户随便导入 JSON 后立刻智能配板。
- 不把 `needs-review` 板子当作 `confirmed` 展示。
- 不为了赶进度跳过角色级确认。
