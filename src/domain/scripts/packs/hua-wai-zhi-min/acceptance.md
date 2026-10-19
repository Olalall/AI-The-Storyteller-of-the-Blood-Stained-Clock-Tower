# 化外之民 第二批草稿验收

状态：材料草稿，未注册、未上线；root 统一复核集成。日期：2026-10-16。

- 作者：Riggs；社区板子，不是官方发行剧本。
- [来源库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)：索引 543，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；来源文件 `化外之民-Riggs.json`。
- 作者原文未标版本，不猜最新版本。原字节保存在 `source.json`，19277 字节，SHA-256 `92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c`。
- 原库版本和当前官方规则适配分开记录；`source-lock.json` 锁定原文/逐角色能力哈希、稳定别名、官方快照哈希及差异。
- [当前官方角色](https://release.botc.app/resources/data/roles.json)与[官方夜表](https://release.botc.app/resources/data/nightsheet.json)核对日期 2026-10-16。相克与特别判定参考 setup-rules 的官方 Wiki primary 链接。

## 版本差异

- 气球驾驶员原文仍为旧“每类依次得知直到全部类型/+1外来者”，本包明确适配当前“与上一夜类型不同/+0或+1外来者”，不是原库规则的原样复刻。
- 街头风琴手原文已为当前“闭眼投票、秘密计票、每夜可选自己醉酒”版，使用项目现有当前角色对象和夜间选择表单。
- 方古原文措辞与当前一次性跳外来者含义核对后保留，开局+1必须显式记录。

## 角色映射

没有新增自制角色ID，没有覆盖共享事实。大部分复用 `confirmedRoleFactsForScript`，额外角色按 roles.ts 引用现有已核包对象，输入规则和AI研究摘要保持同一来源。

| 原文ID | 原文名 | 稳定ID | 类型 |
|---|---|---|---|
| `jingcaisanxuanyi111` | 贵族 | `noble` | townsfolk |
| `daerduotutu111` | 图书管理员 | `librarian` | townsfolk |
| `qingtianjianbei111` | 修行者 | `shugenja` | townsfolk |
| `meishayongdeshabi111` | 小精灵 | `pixie` | townsfolk |
| `wuxingshangjiang111` | 将军 | `general` | townsfolk |
| `balloonistbutton` | 气球驾驶员 | `balloonist` | townsfolk |
| `rangwokangkang111` | 筑梦师 | `dreamer` | townsfolk |
| `qiaozhong111` | 城镇公告员 | `towncrier` | townsfolk |
| `chunzaoyaoa` | 造谣者 | `gossip` | townsfolk |
| `shiyizhezhezhezhe` | 失忆者 | `amnesiac` | townsfolk |
| `caibuduide111` | 杂耍艺人 | `juggler` | townsfolk |
| `lingluowawa111` | 女裁缝 | `seamstress` | townsfolk |
| `sb111` | 士兵 | `soldier` | townsfolk |
| `woshishui111` | 莽夫 | `goon` | outsider |
| `shuiganshawo111` | 圣徒 | `saint` | outsider |
| `zhadiaole111` | 畸形秀演员 | `mutant` | outsider |
| `woheduolema111` | 酒鬼 | `drunk` | outsider |
| `zhijiagedaziji111` | 教父 | `godfather` | minion |
| `youzhizhua11111111` | 寡妇 | `widow` | minion |
| `baonijuhua111` | 刺客 | `assassin` | minion |
| `shabihouzi122211` | 街头风琴手 | `organgrinder` | minion |
| `xiaoweibaxiliuxiliu111` | 普卡 | `pukka` | demon |
| `meiyoudashi11111` | 诺-达鲺 | `nodashii` | demon |
| `xiaoemo1111111eee111eee111` | 小恶魔 | `imp` | demon |
| `fangguuuuuuuuuuuuuu111` | 方古 | `fanggu` | demon |

## 夜序与设置

- 首夜：`widow, godfather, organgrinder, pukka, pixie, amnesiac, librarian, dreamer, seamstress, noble, balloonist, shugenja, general`。
- 其他夜：`organgrinder, imp, pukka, fanggu, nodashii, assassin, godfather, gossip, amnesiac, dreamer, towncrier, seamstress, juggler, balloonist, general`。
- 均从当前官方夜表过滤，原序号保存在 note；不混用原库旧整数。额外能力或角色变化由主持核对，不自动重排旧对局。
- 22套：7/8/9/10/11/12/13/14/15人分别3/2/2/3/2/3/2/2/3。所有人数修正带 choiceId，伪装是本板3个不在场善良角色，传奇不占席位。

- 所有开局、技能、毒醉、生死、角色、阵营和胜负均由说书人确认；仅新对局读取本包，已有快照不迁移。
- 教父开局+1或-1外来者，等量替换镇民；本批每个含教父模板都显式选择。白天至少一名外来者实际死亡才追加一次夜杀，多个外来者死亡不叠加次数。
- 方古开局+1外来者并减少1镇民；首次成功杀死外来者才由其变邪恶方古且旧方古死，保护阻止实际死亡时不跳；整局最多成功一次。
- 采用当前气球驾驶员：可+0或+1外来者，只要求本夜类型不同于上一夜；不沿用四类一次后停的信息循环。模板对0/1均显式记录choiceId。
- 酒鬼自认不在场镇民，实际没有该能力；身份与玩家稿由主持私下确认，不能公开其真实外来者身份。
- 失忆者能力由主持单独设计并记录，AI不得发明权威能力；首批本包静态模板暂排除失忆者。
- 当前风琴手每夜明确选择自己是否醉酒到黄昏；其有效时闭眼投票、秘密计票，自醉期则按通常睁眼投票。真实票数由主持私密记录，不改或抹掉已确认票数。
- 普卡新目标中毒、原目标死亡/恢复健康以及自身失能按时点分别核对，不延续已失效毒源，不从当前目标捏造旧毒历史。
- 诺-达鲺中毒查两侧最近镇民并跳过其他角色类型，不以最近存活玩家代替镇民类型；身份或座位变更后由主持核对。
- 寡妇首夜查看魔典并选择中毒者，善良阵营中一人得知其在场；这些私密信息和持续来源必须主持确认，不向其他玩家泄露目标。

## 关键行为抽测建议（尚未调用真实AI）

- 风琴手当夜自醉后的投票。
- 已知事实：健康街头风琴手在本夜明确选择自己醉酒直到下个黄昏，白天尚未到下个黄昏，无其他来源或相克。
- 独立预期：本人仍处在自醉持续期，闭眼和秘密计票效果失效，白天按通常睁眼投票；不能称风琴手因自醉而自动清除自己的自醉。
- [官方依据](https://wiki.bloodontheclocktower.com/Organ_Grinder)；机器可读题见 `ai-regression-oracle.json`。

## 验证与边界

- 同组离线预集成验证见组级 `offline-validation.json`；该验证在内存注册草稿并调用真实候选链，不写生产目录或已有对局。
- 测试草稿位于组级 `wikiBatch02A.test.ts`，root复制到 `src/domain/scripts/` 后运行；manifest、全check、浏览器与真实AI由集成任务另行登记。
- 本材料没有注册、部署或付费AI调用，不能称为已上线或全技能组合已验证。
