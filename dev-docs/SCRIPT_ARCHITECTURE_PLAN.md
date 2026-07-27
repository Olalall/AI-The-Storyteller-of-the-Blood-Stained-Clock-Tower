# 多板子与智能板子架构计划

状态：设计冻结，待分阶段实现。  
适用范围：7-15 人自由开局、多板子接入、AI 配板建议、夜晚/白天工作台读取板子能力。  
不适用范围：官方魔典同步器、常驻玩家端、完整自动规则引擎、数据库/ORM。

## 1. 核心结论

本项目以后不再把“导入任意 JSON”直接等同于“可玩板子”。

- 基础导入只能作为原材料。
- 能出现在开局列表里的板子必须先变成“智能板子包”。
- 智能板子包必须通过角色级确认和规则研究检查。
- AI 配板优先从已验证模板库中抽取，再给出提醒、解释和轻量微调建议。

这样做的目的不是增加流程，而是避免后期多板子后出现：角色名混乱、夜序不准、AI 胡乱建议、每个页面各自维护一份板子数据。

## 2. 智能板子包边界

一个智能板子包至少包含：

```ts
interface SmartScriptPack {
  scriptId: string
  displayName: string
  source: {
    author?: string
    version?: string
    url?: string
    contentHash: string
    verifiedAt: string
  }
  playerCounts: number[]
  roles: SmartRoleDefinition[]
  nightOrders: {
    firstNight: NightOrderEntry[]
    otherNight: NightOrderEntry[]
  }
  setupTemplates: SetupTemplate[]
  setupRules: SetupRule[]
  knowledgeStatus: 'confirmed' | 'needs-review' | 'missing'
}
```

禁止：

- 用中文名作为主键。
- UI 页面自己复制一份角色技能或夜序。
- 新增板子后直接进开局列表。
- 根据角色 ID 在页面里写大量 if/else 结算逻辑。

## 3. 推荐目录

```text
src/domain/scripts/
  registry.ts
  types.ts
  packs/
    catfishing/
      index.ts
      roles.ts
      night-orders.ts
      setup-templates.ts
      setup-rules.ts
      acceptance.md
server/ai/
  script-context-builder.ts
  rule-knowledge-loader.ts
```

原则：

- `domain/scripts` 是唯一板子事实源。
- UI 只能读取投影结果，不维护第二份板子数据。
- AI 只能读取经过确认的智能板子包和当前局快照。
- 每个板子独立目录，避免后期所有角色和模板挤在一个大文件里。

## 4. SetupTemplate 策略

采用“合规模板库 + 随机抽取 + AI 提醒”的组合。

每个模板声明：

```ts
interface SetupTemplate {
  templateId: string
  scriptId: string
  playerCount: number
  style: 'balanced' | 'chaos' | 'beginner' | 'long-game' | 'bluff-heavy'
  roles: RoleId[]
  bluffs: RoleId[]
  notes: string[]
  verified: boolean
}
```

开局时：

1. 按当前人数和板子筛选已验证模板。
2. 近似真随机抽取 3 套候选。
3. 展示每套候选的角色组合、恶魔伪装和简短建议。
4. AI 根据玩家经验只做提醒，不强行重排。
5. 说书人可手动微调并确认。

测试中允许固定 seed；真实使用默认不固定 seed。每局记录 `templateId`，方便复盘和排查。

## 5. 多人数支持

人数不是 UI 里的临时筛选，而是开局流程的第一步。

```text
选择人数 -> 选择板子 -> 填昵称/经验 -> AI配板 -> 说书人调整 -> 确认开局
```

规则：

- 7-15 人都走同一套 `GameSession` 和 `SmartScriptPack`。
- 不同人数只改变模板筛选、人数构成校验和推荐提示。
- 复用上一局只复用座位号、昵称、经验，不复用身份、状态、日志、胜负、评分。
- 未标注经验的玩家默认为标准玩家。

## 6. AI 配板边界

AI 可以：

- 从合规模板中解释优缺点。
- 根据新手/标准/熟手给说书人提醒。
- 提醒某些角色组合可能更难主持。
- 帮说书人写更清晰的配板理由。

AI 不可以：

- 绕过模板库直接生成一套未知合法性的板子。
- 自动改玩家身份。
- 自动发送身份。
- 把玩家评分用于未来配板。
- 把未确认板子加入可玩列表。

## 7. 停止条件

出现以下情况必须暂停新增功能，先治理架构：

- 同一个角色技能在 UI、AI、夜序、配板中出现四份不同文案。
- 新增板子需要改多个页面组件。
- `GameSession` 之外出现第二套玩家状态源。
- 智能配板开始依赖角色中文名匹配。
- 某个文件超过项目预算仍继续塞逻辑。
- 角色结算逻辑散落在页面组件里。

## 8. 下一步实现顺序

1. 建立 `domain/scripts` 类型和 registry。
2. 迁移 Catfishing / 瓦釜雷鸣为第一个智能板子包。
3. 接入 7-15 人开局流程，但先只支持已验证模板。
4. 把夜序、角色技能、AI 配板都改成从 registry 读取。
5. 再逐个新增其它板子。
