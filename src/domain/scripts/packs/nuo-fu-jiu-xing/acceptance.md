# 懦夫救星智能板子导入验收

- 板子：懦夫救星。
- 来源：GStone edition 21232 / game 41567。
- 来源 JSON：`https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21232_78203.json`
- 来源 hash：`sha256:69340c25aae5e3f6503b8210f5435a3eeccbcf92a11516157c6453cd44f11dcf`
- 作者：Cody。

## 已接入

- 27 个角色，含 25 个普通可入局角色和 2 个传奇规则提示。
- 来源首夜 / 其他夜夜序。
- 7-15 人 22 套 verified 模板。
- 角色规则摘要、setup 提醒、AI/夜序高风险边界。

## 边界

- 卡扎力会改变开局爪牙与外来者构成，首批普通模板先不放入。
- 痢蛭宿主、鹰身女妖疯狂惩罚、奥赫选角色杀人、牙噶巴卜暗号死亡、狐媚娘转邪恶、哥布林胜利、精神病患者白天杀人、锦衣卫替死，都只生成建议，不自动修改状态。
- 麒麟、Cody 的骗人精只作为传奇规则提示，不进入普通配板模板。

## 验证命令

```powershell
npx vitest run src/domain/scripts/packs/nuo-fu-jiu-xing/index.test.ts src/domain/scripts/smartScriptPackQuality.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/roleResearchProjection.test.ts --reporter=verbose
npm run check
```
