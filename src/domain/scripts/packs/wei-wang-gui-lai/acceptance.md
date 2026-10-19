# 伪王归来 第二批草稿验收

状态：材料草稿，未注册、未上线；root 统一复核集成。日期：2026-10-16。

- 作者：Patters；社区板子，不是官方发行剧本。
- [来源库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)：索引 538，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；来源文件 `伪王归来-Patters.json`。
- 作者原文未标版本，不猜最新版本。原字节保存在 `source.json`，17485 字节，SHA-256 `7a0921d4f3b7ca391a608e681a59345fee7d5a1b3eb2498d08d7eebe8385aa93`。
- 原库版本和当前官方规则适配分开记录；`source-lock.json` 锁定原文/逐角色能力哈希、稳定别名、官方快照哈希及差异。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[官方夜表](https://release.botc.app/resources/data/nightsheet.json)核对日期 2026-10-16。相克与特别判定参考 setup-rules 的官方 Wiki primary 链接。

## 版本差异

- 来源炼金术士已经是当前“拥有爪牙能力，主持可要求更换选择”版，不退回只能拥有不在场爪牙能力的旧版。
- 农夫原文“当你在夜晚死亡时”与当前官方 When you die at night 同义；不据初筛字符串不相等猜成规则变版。

## 角色映射

没有新增自制角色ID，没有覆盖共享事实。大部分复用 `confirmedRoleFactsForScript`，额外角色按 roles.ts 引用现有已核包对象，输入规则和AI研究摘要保持同一来源。

| 原文ID | 原文名 | 稳定ID | 类型 |
|---|---|---|---|
| `jingcaisanxuanyi111` | 贵族 | `noble` | townsfolk |
| `woshininainai111` | 祖母 | `grandmother` | townsfolk |
| `meishayongdeshabi111` | 小精灵 | `pixie` | townsfolk |
| `xiongdinihaoxiang111` | 卖花女孩 | `flowergirl` | townsfolk |
| `wojiushitukuai111` | 赌徒 | `gambler` | townsfolk |
| `weishenmesenglvjiaomoke111` | 僧侣 | `monk` | townsfolk |
| `chunzaoyaoa` | 造谣者 | `gossip` | townsfolk |
| `shiyizhezhezhezhe` | 失忆者 | `amnesiac` | townsfolk |
| `xitele111` | 艺术家 | `artist` | townsfolk |
| `diaoshangyizhengtiandeyu111` | 渔夫 | `fisherman` | townsfolk |
| `xinde_xinjide111` | 炼金术士 | `alchemist` | townsfolk |
| `wangzherongyao111` | 农夫 | `farmer` | townsfolk |
| `chichichichichichichi111` | 食人族 | `cannibal` | townsfolk |
| `zhadiaole111` | 畸形秀演员 | `mutant` | outsider |
| `daibi111` | 呆瓜 | `klutz` | outsider |
| `woheduolema111` | 酒鬼 | `drunk` | outsider |
| `chousha111` | 月之子 | `moonchild` | outsider |
| `youzhizhua11111111` | 寡妇 | `widow` | minion |
| `touduzheeeeeeee111` | 投毒者 | `poisoner` | minion |
| `baonijuhua111` | 刺客 | `assassin` | minion |
| `nanjueeeee111` | 男爵 | `baron` | minion |
| `tiehuaibi11111` | 维齐尔 | `vizier` | minion |
| `meiyoudashi11111` | 诺-达鲺 | `nodashii` | demon |
| `opppppppppp1111` | 珀 | `po` | demon |
| `woliuliuliu111` | 涡流 | `vortox` | demon |

## 夜序与设置

- 首夜：`alchemist, poisoner, widow, pixie, amnesiac, grandmother, noble, vizier`。
- 其他夜：`poisoner, gambler, monk, po, nodashii, vortox, assassin, gossip, amnesiac, farmer, moonchild, grandmother, flowergirl`。
- 均从当前官方夜表过滤，原序号保存在 note；不混用原库旧整数。额外能力或角色变化由主持核对，不自动重排旧对局。
- 22套：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3。所有人数修正带 choiceId，伪装是本板3个不在场善良角色，传奇不占席位。

- 所有开局、技能、毒醉、生死、角色、阵营和胜负均由说书人确认；仅新对局读取本包，已有快照不迁移。
- 男爵开局+2外来者、-2镇民，按模板choiceId明确记录，不能只在备注声称已改。
- 酒鬼自认不在场镇民，实际没有该能力；身份与玩家稿由主持私下确认，不能公开其真实外来者身份。
- 当前炼金可拥有在场或不在场爪牙能力，主持可要求重新选择；本批含炼金模板建议授予刺客能力，不改初始人数。不得擅自授予男爵造成未记录的人数修正。
- 失忆者能力由主持单独设计并记录，AI不得发明权威能力；首批本包静态模板暂排除失忆者。
- 维齐尔首日公开身份、健康时白天不会死；一轮提名有实际善良玩家投票即可选择立即处决，不受半数或最高票限制；这是当天一次处决。主持需走现有特殊处决流程确认，工具不自动强制。
- 珀分清0/1/3目标与蓄力历史，多刀按已确认顺序逐个核对当前保护源，先前已被有效保护挡下的攻击不追溯重结算。
- 涡流令镇民能力信息为假，外来者等不一律翻转；白天无人被处决才触发邪恶胜利，处决不死不是无人被处决。
- 诺-达鲺中毒查两侧最近镇民并跳过其他角色类型，不以最近存活玩家代替镇民类型；身份或座位变更后由主持核对。
- 寡妇首夜查看魔典并选择中毒者，善良阵营中一人得知其在场；这些私密信息和持续来源必须主持确认，不向其他玩家泄露目标。

## 关键行为抽测建议（尚未调用真实AI）

- 维齐尔强制处决不受半数门槛限制。
- 已知事实：12名玩家均存活的白天，今天尚未有过处决。一轮合法提名刚完成计票，只有3名玩家投票，其中一人已核实为真正的善良玩家且其票有效。存活、清醒健康并持有能力的维齐尔此刻明确要求立即处决本轮被提名者；被提名者不是维齐尔，无免死、替死、登记、相克或其他干扰。
- 独立预期：可立即处决该被提名者并令其死亡，算当天的一次处决，随后停止当天提名/投票和处决；3票不足6票不是否定理由，也不要求超过其他候选票数。
- [官方依据](https://wiki.bloodontheclocktower.com/Vizier)；机器可读题见 `ai-regression-oracle.json`。

## 验证与边界

- 同组离线预集成验证见组级 `offline-validation.json`；该验证在内存注册草稿并调用真实候选链，不写生产目录或已有对局。
- 测试草稿位于组级 `wikiBatch02A.test.ts`，root复制到 `src/domain/scripts/` 后运行；manifest、全check、浏览器与真实AI由集成任务另行登记。
- 本材料没有注册、部署或付费AI调用，不能称为已上线或全技能组合已验证。
