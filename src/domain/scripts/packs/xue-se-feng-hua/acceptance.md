# 血色风华智能板子验收

- 来源：GStone edition 21099 / game 41111，作者苏通染。
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21099_69681.json`
- 内容哈希：`sha256:762a5e8d1712573ddbcd493ca3eb7efdf3fcf7d55b41a087c6ac1d36387720e7`
- 覆盖角色：26 个来源角色，其中 24 个常规角色、2 个旅行者。
- 夜序：按来源 JSON 的 firstNight / otherNight 顺序生成；当前对局夜序仍只显示已入场座位角色。
- 模板：22 套 7-15 人 verified 模板，旅行者不进入常规配板，恶魔伪装只取未在场镇民或外来者。
- 关键边界：
  - 染血、往生之路、看守者的钥匙只做规则提醒。
  - 看守者会 `+1恶魔，-1爪牙`，首批普通模板暂不自动放入，可由说书人手动微调。
  - 八角笼、判决者、刺客、血织女、血渡鸦、小恶魔等死亡/胜负/处决链路只生成建议，不能自动改状态。
  - 变身茄子、亡语师、阴阳先生、窥伺者涉及能力或身份变化，只能由说书人确认后写入。

## 验收命令

```powershell
npm run test -- src/domain/scripts/packs/xue-se-feng-hua/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/features/setup/smartScriptSetupCandidates.test.ts
npm run check
```
