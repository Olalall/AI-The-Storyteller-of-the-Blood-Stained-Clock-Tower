# 夜间 AI 质量回归

日期：2026-07-27

## 目标

夜间 AI 是说书人副驾驶，不是规则引擎。它必须能在复杂角色上给出可采用草稿，同时不自动修改身份、阵营、死亡、毒醉、胜负、昼夜或日志。

## 默认回归集

默认自动化用例：`src/services/ai/nightSettlementQualityRegression.test.ts`。

已覆盖：

| 编号 | 角色 | 场景 | 必须表现 |
| --- | --- | --- | --- |
| GAMBLER-R1 | 赌徒 | 猜测目标身份错误 | 推荐“猜错 · 死亡待确认”，死亡只进入草稿和警告，不自动杀人 |
| GAMBLER-R2 | 赌徒 | 赌徒自身醉酒 | 推荐“未受影响”，提醒发动者状态 |
| SNAKECHARMER-R1 | 舞蛇人 | 目标是真恶魔 | 推荐“发生交换”，身份、阵营、中毒都只进待确认草稿 |
| FANGGU-R1 | 方古 | 目标是外来者 / 非外来者 | 外来者推荐转化，非外来者推荐死亡，均不自动改状态 |
| PITHAG-R1 | 麻脸巫婆 | 新角色已在场 / 不在场 | 已在场推荐“不变化”，不在场推荐身份变化草稿 |
| PUKKA-R1 | 普卡 | 当前选择目标 | 推荐中毒目标草稿，并提醒上一名普卡目标、死亡和延迟恢复都待确认 |
| NODASHII-R1 | 诺-达鲺 | 中毒范围核对 | 只提醒两侧最近镇民中毒范围，不批量改玩家状态 |
| SCARLETWOMAN-R1 | 红唇女郎 | 恶魔死亡后的更替 | 只生成恶魔更替、身份和阵营草稿，不自动改身份或判胜 |
| ALCHEMIST-R1 | 炼金术士 | 记录获得的爪牙能力 | 只记录来源能力草稿，不直接运行爪牙状态机 |
| MATHEMATICIAN-R1 | 数学家 | 给出异常数字 | 数字是说书人确认的信息草稿，不自动给最终数字 |
| LUNATIC-R1 | 疯子 | 记录伪恶魔选择 | 只记录供真实恶魔核对，不杀人、不泄露真相 |
| CERENOVUS-R1 | 洗脑师 | 目标和善良角色已填 | 推荐“受到影响”，生成疯狂告知草稿，不判断是否破疯狂 |

## 可选真实模型 smoke

真实模型质量 smoke 不进入默认 `npm run check`。原因：它需要外部 API、网络和可能的费用，不能成为日常开发阻塞项。

运行前必须在本地 shell 或 VPS secret 中设置：

```powershell
$env:BOTC_AI_BASE_URL='https://your-provider.example/v1'
$env:BOTC_AI_MODEL='your-model-name'
$env:BOTC_AI_API_KEY='your-secret'
npm run smoke:ai-night-live
```

当前 live smoke 文件：`server/ai/nightSettlementProvider.live.test.ts`。

当前 live smoke 覆盖：

- 赌徒猜错：真实模型应推荐 `wrong`，并把死亡写成待确认草稿。
- 舞蛇人选中恶魔：真实模型应推荐 `swap`，并提到身份、阵营、中毒均需说书人确认。
- 洗脑师目标和角色齐全：真实模型应推荐 `applied`，并生成疯狂/确认相关提醒。

## 新角色加入标准

导入新智能板子或补复杂角色时，至少判断该角色是否涉及：

- 死亡 / 复活；
- 身份变化；
- 阵营变化；
- 中毒 / 醉酒；
- 疯狂；
- 延迟结算；
- 胜负；
- setup 人数修正；
- 登记异常；
- 说书人自由裁量。

只要命中任一项，就需要补一条回归用例，或扩展现有用例。

## 测试原则

- 测“可采用草稿”，不测“自动生效”。
- 缺目标、缺角色、缺目标实际身份或缺关键历史时，允许 `needs_input`。
- 目标、角色和可见状态齐全时，不应只因为 `draft.outcomeId` 为空就追问。
- AI 输出必须包含边界提示：`stateChangeDrafts`、`authorityWarnings`、`ruleFacts` 至少命中一种。
- 默认回归测试不得调用真实模型；真实模型只走可选 smoke。

## 当前边界

- 本地回归只做有限显式核对，不处理完整 BOTC 规则。
- 真实模型 prompt 已要求优先使用 `roleResearch`、`roleKnowledge`、`statusFacts` 和 `selectedTargets`。
- 新智能板子如果引入高风险角色，必须先补角色知识，再补回归。
