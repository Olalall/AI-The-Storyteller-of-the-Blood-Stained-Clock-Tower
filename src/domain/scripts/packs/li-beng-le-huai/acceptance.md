# 礼崩乐坏智能板子验收

- 来源：GStone edition 21219 / game 40256，作者摸鱼学徒。
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21219_64086.json`
- 内容哈希：`sha256:af0f4ab26df993c8f6d68c422e12c5a87c8d063d9d06d95d2bab171f65a2d985`
- 覆盖角色：29 个来源角色，其中 25 个常规角色、3 个传奇、1 个旅行者。
- 夜序：按来源 JSON 的 firstNight / otherNight 顺序生成；当前对局夜序仍只显示已入场座位角色。
- 模板：22 套 7-15 人 verified 模板，传奇和旅行者不进入常规配板，恶魔伪装只取未在场镇民或外来者。
- 关键边界：
  - 教父 `[-1或+1外来者]` 暂不进入首批普通模板，可由说书人手动微调。
  - 圣洁之魂、私货商人、灯神只做全局/相克提醒，不作为座位身份或恶魔伪装。
  - 灵言师、鹰身女妖、主谋、焦尾、典狱长、珀等死亡、阵营、疯狂和胜负链路只生成建议，不能自动改状态。

## 验收命令

```powershell
npm run test -- src/domain/scripts/packs/li-beng-le-huai/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/features/setup/smartScriptSetupCandidates.test.ts
npm run check
```
