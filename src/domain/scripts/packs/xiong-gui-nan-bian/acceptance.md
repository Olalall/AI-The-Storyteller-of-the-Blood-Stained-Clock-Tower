# 凶诡难辨 第二批草稿验收

状态：材料草稿，未注册、未上线；root 统一复核集成。日期：2026-10-16。

- 作者：鸭木布拉夫钟楼小镇；社区板子，不是官方发行剧本。
- [来源库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)：索引 489，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；来源文件 `凶诡难辨.json`。
- 作者原文未标版本，不猜最新版本。原字节保存在 `source.json`，20844 字节，SHA-256 `f19e62de0b9e10b650211a2fa0df628ea0297cc1769be4bb50a915ac8e4b732a`。
- 原库版本和当前官方规则适配分开记录；`source-lock.json` 锁定原文/逐角色能力哈希、稳定别名、官方快照哈希及差异。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[官方夜表](https://release.botc.app/resources/data/nightsheet.json)核对日期 2026-10-16。相克与特别判定参考 setup-rules 的官方 Wiki primary 链接。

## 版本差异

- 调查员原文误带无爪牙分支，适配当前官方版。
- 鹰身女妖原文“他们职中”是错字，按当前官方一人或两人可能死亡，不改为必死或必处决。
- 帽匠沿用现有已核角色对象，死亡触发、换角及不重复角色仍按当前官方规则；气球驾驶员原文已是不同于上一夜类型、+0或+1。

## 角色映射

没有新增自制角色ID，没有覆盖共享事实。大部分复用 `confirmedRoleFactsForScript`，额外角色按 roles.ts 引用现有已核包对象，输入规则和AI研究摘要保持同一来源。

| 原文ID | 原文名 | 稳定ID | 类型 |
|---|---|---|---|
| `mangshengnifaxianlehuadian111` | 调查员 | `investigator` | townsfolk |
| `arknights111` | 骑士 | `knight` | townsfolk |
| `ainiii11111` | 共情者 | `empath` | townsfolk |
| `mofasaozhou111` | 侍女 | `chambermaid` | townsfolk |
| `zhuijidelaoda111` | 气球驾驶员 | `balloonist` | townsfolk |
| `weishenmesenglvjiaomoke111` | 僧侣 | `monk` | townsfolk |
| `lingluowawa111` | 女裁缝 | `seamstress` | townsfolk |
| `wolaishouhunidemama111` | 守夜人 | `nightwatchman` | townsfolk |
| `makesi111` | 哲学家 | `philosopher` | townsfolk |
| `biubiubiu111` | 猎手 | `slayer` | townsfolk |
| `chunzaoyaoa` | 造谣者 | `gossip` | townsfolk |
| `huojin111` | 博学者 | `savant` | townsfolk |
| `shanliangdeniaoer111` | 守鸦人 | `ravenkeeper` | townsfolk |
| `woheduolema111` | 酒鬼 | `drunk` | outsider |
| `dabanshou111` | 修补匠 | `tinker` | outsider |
| `zabusini111` | 魔像 | `golem` | outsider |
| `fengmaoziyuailisi111` | 帽匠 | `hatter` | outsider |
| `hongchunnvlangaaaaaaaa111` | 红唇女郎 | `scarletwoman` | minion |
| `zhijiagedaziji111` | 教父 | `godfather` | minion |
| `noita111` | 女巫 | `witch` | minion |
| `xixi111111111111` | 洗脑师 | `cerenovus` | minion |
| `yingyingying111` | 鹰身女妖 | `harpy` | minion |
| `waibibaboabbbb1111` | 牙噶巴卜 | `yaggababble` | demon |
| `yigeshaba111` | 沙巴洛斯 | `shabaloth` | demon |
| `meiyoudashi11111` | 诺-达鲺 | `nodashii` | demon |

## 夜序与设置

- 首夜：`philosopher, yaggababble, godfather, witch, cerenovus, harpy, investigator, empath, seamstress, knight, balloonist, nightwatchman, chambermaid`。
- 其他夜：`philosopher, monk, witch, cerenovus, harpy, scarletwoman, shabaloth, nodashii, yaggababble, godfather, gossip, hatter, tinker, ravenkeeper, empath, seamstress, balloonist, nightwatchman, chambermaid`。
- 均从当前官方夜表过滤，原序号保存在 note；不混用原库旧整数。额外能力或角色变化由主持核对，不自动重排旧对局。
- 22套：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3。所有人数修正带 choiceId，伪装是本板3个不在场善良角色，传奇不占席位。

- 所有开局、技能、毒醉、生死、角色、阵营和胜负均由说书人确认；仅新对局读取本包，已有快照不迁移。
- 教父开局+1或-1外来者，等量替换镇民；本批每个含教父模板都显式选择。白天至少一名外来者实际死亡才追加一次夜杀，多个外来者死亡不叠加次数。
- 采用当前气球驾驶员：可+0或+1外来者，只要求本夜类型不同于上一夜；不沿用四类一次后停的信息循环。模板对0/1均显式记录choiceId。
- 酒鬼自认不在场镇民，实际没有该能力；身份与玩家稿由主持私下确认，不能公开其真实外来者身份。
- 帽匠今天或当晚有效死亡才触发；爪牙和恶魔玩家可选择同类型新角色，不能重复，阵营不随角色自动变；新能力唤醒和恶魔已攻击后不得再杀须主持核对。
- 牙噶巴卜暗号和白天公开说出次数须主持记录；夜间可能死亡由主持选择，不把暗号次数直接转为未核实死亡。
- 沙巴洛斯每个其他夜晚选择2目标；上一夜所选死亡玩家可能反刍复活，并非必定；复活和新能力由主持单独确认。
- 诺-达鲺中毒查两侧最近镇民并跳过其他角色类型，不以最近存活玩家代替镇民类型；身份或座位变更后由主持核对。
- 鹰身女妖选两名有序玩家，第一名需疯狂声称第二名邪恶；失败时一人或两人可能死亡，是主持裁量，不能自动处决。
- 魔像每局只能提名一次，首次提名非恶魔可能立即导致被提名者死亡；这是技能死亡而非投票处决，登记与免死由主持核对。

## 关键行为抽测建议（尚未调用真实AI）

- 气球驾驶员只比较相邻两夜。
- 已知事实：气球驾驶员健康且不受涡流或错误登记影响，上夜得知镇民，本夜拟告知外来者；更早曾告知该外来者类型。
- 独立预期：本夜类型只需不同于上一夜，不能要求四类型各一次后停止，也不能因早夜见过外来者就拒绝本夜信息。
- [官方依据](https://wiki.bloodontheclocktower.com/Balloonist)；机器可读题见 `ai-regression-oracle.json`。

## 验证与边界

- 同组离线预集成验证见组级 `offline-validation.json`；该验证在内存注册草稿并调用真实候选链，不写生产目录或已有对局。
- 测试草稿位于组级 `wikiBatch02A.test.ts`，root复制到 `src/domain/scripts/` 后运行；manifest、全check、浏览器与真实AI由集成任务另行登记。
- 本材料没有注册、部署或付费AI调用，不能称为已上线或全技能组合已验证。
