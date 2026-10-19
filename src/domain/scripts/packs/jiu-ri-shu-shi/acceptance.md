# 旧日熟识 第二批草稿验收

状态：材料草稿，未注册、未上线；root 统一复核集成。日期：2026-10-16。

- 作者：老许&王鑫；社区板子，不是官方发行剧本。
- [来源库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)：索引 321，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；来源文件 `旧日熟识.json`。
- 作者原文未标版本，不猜最新版本。原字节保存在 `source.json`，19524 字节，SHA-256 `e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7`。
- 原库版本和当前官方规则适配分开记录；`source-lock.json` 锁定原文/逐角色能力哈希、稳定别名、官方快照哈希及差异。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[官方夜表](https://release.botc.app/resources/data/nightsheet.json)核对日期 2026-10-16。相克与特别判定参考 setup-rules 的官方 Wiki primary 链接。

## 版本差异

- 调查员原文误带“或者得知没有爪牙”的分支，适配当前官方“两人之一是指定爪牙”，不把图书管理员的零外来者分支混入。
- 方古与红唇女郎的来源相克保留，并按当前官方“若会有两个恶魔且一个来自红唇女郎，则她仍是红唇女郎”表述。

## 角色映射

没有新增自制角色ID，没有覆盖共享事实。大部分复用 `confirmedRoleFactsForScript`，额外角色按 roles.ts 引用现有已核包对象，输入规则和AI研究摘要保持同一来源。

| 原文ID | 原文名 | 稳定ID | 类型 |
|---|---|---|---|
| `chef_button` | 厨师 | `chef` | townsfolk |
| `librarian_button` | 图书管理员 | `librarian` | townsfolk |
| `investigator_button` | 调查员 | `investigator` | townsfolk |
| `grandmother_button` | 祖母 | `grandmother` | townsfolk |
| `empath_button` | 共情者 | `empath` | townsfolk |
| `oracle_button` | 神谕者 | `oracle` | townsfolk |
| `flowergirl_button` | 卖花女孩 | `flowergirl` | townsfolk |
| `monk_button` | 僧侣 | `monk` | townsfolk |
| `gambler_button` | 赌徒 | `gambler` | townsfolk |
| `slayer_button` | 猎手 | `slayer` | townsfolk |
| `seamstress_button` | 女裁缝 | `seamstress` | townsfolk |
| `soldier_button` | 士兵 | `soldier` | townsfolk |
| `ravenkeeper_button` | 守鸦人 | `ravenkeeper` | townsfolk |
| `drunk_button` | 酒鬼 | `drunk` | outsider |
| `barber_button` | 理发师 | `barber` | outsider |
| `klutz_button` | 呆瓜 | `klutz` | outsider |
| `recluse_button` | 陌客 | `recluse` | outsider |
| `poisoner_button` | 投毒者 | `poisoner` | minion |
| `godfather_button` | 教父 | `godfather` | minion |
| `scarlet_woman_button` | 红唇女郎 | `scarletwoman` | minion |
| `assassin_button` | 刺客 | `assassin` | minion |
| `imp_button` | 小恶魔 | `imp` | demon |
| `vortox_button` | 涡流 | `vortox` | demon |
| `fang_gu_button` | 方古 | `fanggu` | demon |

## 夜序与设置

- 首夜：`poisoner, godfather, librarian, investigator, chef, empath, grandmother, seamstress`。
- 其他夜：`poisoner, gambler, monk, scarletwoman, imp, fanggu, vortox, assassin, godfather, barber, grandmother, ravenkeeper, empath, flowergirl, oracle, seamstress`。
- 均从当前官方夜表过滤，原序号保存在 note；不混用原库旧整数。额外能力或角色变化由主持核对，不自动重排旧对局。
- 22套：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3。所有人数修正带 choiceId，伪装是本板3个不在场善良角色，传奇不占席位。

- 所有开局、技能、毒醉、生死、角色、阵营和胜负均由说书人确认；仅新对局读取本包，已有快照不迁移。
- 教父开局+1或-1外来者，等量替换镇民；本批每个含教父模板都显式选择。白天至少一名外来者实际死亡才追加一次夜杀，多个外来者死亡不叠加次数。
- 方古开局+1外来者并减少1镇民；首次成功杀死外来者才由其变邪恶方古且旧方古死，保护阻止实际死亡时不跳；整局最多成功一次。
- 方古成功跳外来者造成旧方古死亡时，红唇女郎不再额外成为方古；若会有两个恶魔且其中一个来自红唇女郎，她仍是红唇女郎。
- 酒鬼自认不在场镇民，实际没有该能力；身份与玩家稿由主持私下确认，不能公开其真实外来者身份。
- 涡流令镇民能力信息为假，外来者等不一律翻转；白天无人被处决才触发邪恶胜利，处决不死不是无人被处决。

## 关键行为抽测建议（尚未调用真实AI）

- 方古成功跳转不产生第二恶魔。
- 已知事实：本局只有一个恶魔，是存活且清醒健康的方古；整局尚未成功跳过外来者。本夜首次有效攻击一名存活的真实外来者，目标与旧方古均无免死、替死或登记干扰。存活的红唇女郎清醒健康，旧方古将死前共有至少5名非旅行者存活，使用当前方古/红唇女郎相克，无其他干扰。
- 独立预期：外来者保持存活并变为邪恶方古，旧方古死亡；当前相克使红唇女郎保持原角色，不同时创造第二个恶魔。
- [官方依据](https://wiki.bloodontheclocktower.com/Fang_Gu)；机器可读题见 `ai-regression-oracle.json`。

## 验证与边界

- 同组离线预集成验证见组级 `offline-validation.json`；该验证在内存注册草稿并调用真实候选链，不写生产目录或已有对局。
- 测试草稿位于组级 `wikiBatch02A.test.ts`，root复制到 `src/domain/scripts/` 后运行；manifest、全check、浏览器与真实AI由集成任务另行登记。
- 本材料没有注册、部署或付费AI调用，不能称为已上线或全技能组合已验证。
