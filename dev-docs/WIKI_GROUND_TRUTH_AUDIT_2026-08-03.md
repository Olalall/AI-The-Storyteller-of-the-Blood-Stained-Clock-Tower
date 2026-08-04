# 钟楼百科 Ground Truth 审计报告

- 审计日期：2026-08-03
- Ground truth：钟楼百科 https://clocktower-wiki.gstonegames.com 全量快照（429 页，本地缓存于 `data/wiki-ground-truth/`）
- 对照范围：117 个智能板子包、718 个角色（其中 255 个有百科对应页）、role-copy 中文文案层、complexRoleKnowledge、夜序、剧本花名册、22 个规则概念页、基础配板表
- 方法：38 个对照智能体逐页比对 → 每条 medium 以上发现由独立「反驳型」核实智能体二次查证（引文必须可复核）；411 条原始发现中 244 条确认、56 条被驳回为误报、其余为 low 级备注
- 完整结构化数据：`data/wiki-ground-truth/compare/merged-results.json`

## 总览

| 层面 | 确认 | 其中 high | 驳回误报 | low 备注 |
| --- | --- | --- | --- | --- |
| 角色知识 | 200 | 63 | 51 | 80 |
| 夜序 | 21 | 14 | 4 | 3 |
| 规则概念/产品机制 | 23 | 10 | 1 | 4 |
| 剧本花名册 | 0 | 0 | 0 | 0 |
| 覆盖盘点 | 0 | 0 | 0 | 27 |

## 系统性根因（修复优先级最高）

1. **`role-copy.ts` 中文意译层会覆盖板子包中正确的能力文本**（`localizedRoleAbility` 优先取 roleCopy）：大量硬条件在意译时丢失、数值改变甚至方向写反（主教阵营写反、官员票数 3→4、怪咖效果写反、旅店老板免死写成防恶魔等）。建议逐条对照百科「角色能力」原文重写这 130 条，或改为仅当板子包无中文文本时才使用 roleCopy。
2. **自动生成的英文 research 摘要与同一角色的中文 abilityText 互相矛盾**（教父 "out-of-play" vs 「在场」、赏金猎人虚构 "+1 Outsider"、赌徒 playerMessageTemplates 泄露猜测结果等），且多个包批量复制同一错误。建议以 abilityText 为准重新生成 research 字段并抽查。
3. **夜序数据存在三类批量缺陷**：刻度换算遗漏（104→10400、32→7700 等）、字母序污染（静候佳音首夜表前 15 项）、角色整体缺失（愚者欢宴街头风琴手）。建议写一个校验脚本：对照官方 nightsheet 顺位做单调性检查 + 首夜/其他夜行动者集合检查。
4. **产品机制层四个缺口**：处决与死亡强制绑定（百科明确可分离）；已死玩家不能被记录处决（涡流局胜负会判反）；处决门槛预填固定 6（应为 ⌈存活/2⌉ 动态计算）；旅行者「流放」无独立记录通道（计票基数/次数/死亡票规则均与处决不同）。
5. **命名与映射**：Recluse 应为「陌客」而非「隐士」（隐士是另一角色 Hermit）；al-hadikhia/alhadikhia 同角色双 roleId 导致共享知识只挂其一；自创角色与官方角色 officialName 撞名（如两个自创「公主/郡主」都标 Princess）。

## 一、夜序层（21 条确认）

#### [high] jing-hou-jia-yin/imp
- **仓库现状**：night-orders.json《静候佳音》firstNight 数组按角色 id 字母序列出 hatter(order 6)、imp(7)、legion(8)、monk(10)、nodashii(11)、oracle(12)、pithag(13)、plaguedoctor(14)（note 均为空字符串）。
- **百科依据**（夜晚行动顺序一览）：百科首夜列表不含小恶魔/军团/诺-达鲺/僧侣/神谕者/麻脸巫婆/帽匠/瘟疫医生；这些条目仅出现在「其他夜晚」区段（如「小恶魔：唤醒小恶魔，让他攻击一名玩家……」「僧侣：唤醒僧侣，让他选择除自己以外的一名玩家……」）。
- **影响**：该包 firstNight 前 15 项（alsaahir、artist、cannibal、djinn、drunk、hatter、imp、legion、mastermind、monk、nodashii、oracle、pithag、plaguedoctor、soldier）是字母序名单而非夜序，其中 8 个总表覆盖角色首夜根本不行动（官方 nightsheet firstNight 同样不含它们）。按此表主持会在首夜错误唤醒恶魔杀人、唤醒麻脸巫婆变身等，完全打乱首夜结算。
- **建议**：重新生成《静候佳音》首夜表：删除无首夜行动的条目并按百科总表排序。

#### [high] jing-hou-jia-yin/pixie
- **仓库现状**：night-orders.json《静候佳音》otherNight 含 pixie(order 7) 与 xiuxingzhe(order 9)，且 legion(19) 排在 imp(16)/pukka(17)/nodashii(18) 之后（note 均为空）。
- **百科依据**（夜晚行动顺序一览）：百科「其他夜晚」列表没有小精灵和修行者（两者仅首夜行动：「小精灵：唤醒小精灵，对他展示一个在场镇民角色标记」「修行者：唤醒修行者，对他指向对应方向来告知他最近的邪恶玩家的方向」）；且「军团：决定今晚谁会因为军团能力死亡。」位于小恶魔/普卡/诺-达鲺之前。
- **影响**：官方 nightsheet otherNight 同样不含 pixie/shugenja，且 legion 在 imp 之前。包内其他夜会错误唤醒仅首夜行动的角色，军团的杀人判定位置也与百科和官方原序都矛盾。
- **建议**：删除 otherNight 中的 pixie/xiuxingzhe，将 legion 移到小恶魔之前。

#### [high] ku-mu-feng-chun/banshee
- **仓库现状**：night-orders.json《枯木逢春》otherNight banshee 的 order=104（note:「报丧女妖」），为全表最小值，排在 philosopher(400)、投毒者(1400)、小恶魔(4900)、亡骨魔(6100)、卡扎力(7700) 等所有条目之前。
- **百科依据**（夜晚行动顺序一览）：「报丧女妖：如果恶魔杀死了报丧女妖，宣布“报丧女妖觉醒了”，并使用“具有能力”标记报丧女妖。」位于其他夜晚恶魔行动（小恶魔/亡骨魔/卡扎力等）之后的死亡触发区段。
- **影响**：报丧女妖是“被恶魔杀死后”的触发项，必须在恶魔行动之后检查；排在夜晚最前会让说书人在恶魔行动前就跳过该项，漏掉当晚“报丧女妖觉醒”宣告。同仓库《信口雌黄》banshee=105（1–134 小刻度），而《枯木逢春》其余条目为 ×100 刻度（400–13400），104 是刻度换算遗漏（应约 10400），包间自相矛盾。
- **建议**：将 banshee 的 order 调整到恶魔行动之后（约 10400）。

#### [high] ji-meng-ta-xiang/kazali
- **仓库现状**：night-orders.json《寄梦他乡》otherNight kazali 的 order=32（note:「唤醒卡扎力，让他攻击一名玩家。」），为全表第一个行动，排在蛊雕(1500)、洗脑师(2800)、逆臣(3400)、驱魔人(4300) 之前。
- **百科依据**（夜晚行动顺序一览）：其他夜晚列表中「卡扎力：唤醒卡扎力，让他攻击一名玩家。」位于恶魔行动区段，在「驱魔人：唤醒驱魔人，让他选择一名与上一晚不同的玩家。如果他选中了恶魔……」与洗脑师、蛊雕等之后。
- **影响**：驱魔人必须先于恶魔行动才能封锁恶魔当晚的击杀；恶魔杀人若在蛊雕/洗脑师等之前结算也会改变各能力目标的存活状态。官方 nightsheet otherNight 中 kazali 同样远在 exorcist 之后。同仓库《无何有之乡》《枯木逢春》kazali otherNight=7700，本包 32 为明显数据错误——照表结算时驱魔人将永远无法封锁卡扎力。
- **建议**：将 kazali 的 otherNight order 改为 7700 档位。

#### [high] yi-hua-jie-mu/villageidiot
- **仓库现状**：night-orders.json《移花接木》villageidiot firstNight order=45、otherNight order=65，均为全表最前，先于疯子(2300)、提线木偶(3200)、掮客(4000)、蛊雕(4800)、教父(5400)、混沌(7900) 等全部条目（note:「让村夫指向一名玩家，根据对方的阵营，对他给出拇指向上或向下的手势。」）。
- **百科依据**（夜晚行动顺序一览）：「村夫：唤醒村夫，让他指向一名玩家，用手势告诉他那名玩家的阵营。」首夜位于洗衣妇/占卜师/郎中等信息角色区段（修行者之前），其他夜位于杂耍艺人与方士之间——均在投毒/杀人角色之后。
- **影响**：村夫是信息角色，须在投毒者/蛊雕/恶魔等行动之后醒来，其信息才能正确受当晚醉酒中毒影响；排在全夜第一位会给出未受当晚下毒影响的信息，直接改变信息结算。官方 nightsheet 中 villageidiot 也在 balloonist/shugenja 之后接近末尾；同仓库《无何有之乡》villageidiot=10100/12800，本包 45/65 为刻度数据错误。
- **建议**：改为 10100/12800 档位。

#### [high] ji-meng-ta-xiang/villageidiot
- **仓库现状**：night-orders.json《寄梦他乡》villageidiot firstNight order=45、otherNight order=65，先于蛊雕(4800/1500)、洗脑师(5800/2800)、典狱长(6700/8300)、混沌(7900) 等几乎全部条目。
- **百科依据**（夜晚行动顺序一览）：「村夫：唤醒村夫，让他指向一名玩家，用手势告诉他那名玩家的阵营。」首夜与其他夜均位于信息角色区段，在投毒/杀人角色之后。
- **影响**：与《移花接木》同一处刻度错误：村夫信息角色被排到全夜最前，先于蛊雕下毒和恶魔行动，其阵营信息将无法正确反映当晚的醉酒/中毒与死亡状态，误导信息结算。官方 nightsheet 与同仓库《无何有之乡》(10100/12800) 均为夜末位置。
- **建议**：改为 10100/12800 档位。

#### [high] xin-kou-ci-huang/lordoftyphon
- **仓库现状**：night-orders.json《信口雌黄》firstNight：boffin order=2、philosopher order=3、kazali order=4，而 lordoftyphon order=12（note 均只有角色名）。
- **百科依据**（夜晚行动顺序一览）：首夜列表最前两个角色条目依次为「堤丰之首：将位于堤丰之首两侧的对应数量的玩家变成邪恶的爪牙，并分别唤醒他们通知他们的角色和阵营变化。」「卡扎力：唤醒卡扎力，让他选择玩家变成邪恶爪牙。」，之后才是「科学怪人」「哲学家」。
- **影响**：堤丰之首/卡扎力开局要先把玩家变成爪牙，必须是首夜最早的行动；官方 nightsheet 顺序同为 lordoftyphon→kazali→boffin→philosopher。包内把堤丰之首排在科学怪人/哲学家/卡扎力之后、卡扎力排在哲学家之后，与百科和官方原序都矛盾；爪牙生成滞后会使新爪牙错过当夜流程（如科学怪人向恶魔展示能力的时机）。
- **建议**：调整为 lordoftyphon < kazali < boffin < philosopher。

#### [high] wu-he-you-zhi-xiang/kazali
- **仓库现状**：night-orders.json《无何有之乡》firstNight：philosopher order=300、poppygrower order=700 先于 kazali order=1000（kazali note:「在首个夜晚，唤醒卡扎力。让他指向一名玩家，和角色列表上的一个爪牙角色……」）。
- **百科依据**（夜晚行动顺序一览）：「卡扎力：唤醒卡扎力，让他选择玩家变成邪恶爪牙。」是首夜列表第二个角色条目，位于失忆者/哲学家/罂粟种植者之前。
- **影响**：官方 nightsheet firstNight 同为 kazali 在 philosopher、poppygrower 之前。卡扎力先创建爪牙，罂粟种植者才能正确决定是否跳过爪牙/恶魔信息，且被卡扎力选中变爪牙的玩家（可能是哲学家）不应先以善良身份行动。包序与两种顺序都矛盾。
- **建议**：将 kazali 移到 philosopher(300) 之前。

#### [high] ku-mu-feng-chun/kazali
- **仓库现状**：night-orders.json《枯木逢春》firstNight：philosopher order=300 先于 kazali order=1000（note 分别为「哲学家」「卡扎力」）。
- **百科依据**（夜晚行动顺序一览）：「卡扎力：唤醒卡扎力，让他选择玩家变成邪恶爪牙。」是首夜列表第二个角色条目，位于哲学家之前。
- **影响**：与《无何有之乡》相同的问题：官方 nightsheet 与百科都要求卡扎力在哲学家之前先完成爪牙创建；包序颠倒，被选中变爪牙的哲学家可能已先行动。
- **建议**：将 kazali 移到 philosopher 之前。

#### [high] shi-san-hang/huapi
- **仓库现状**：night-orders.json《十三行》otherNight 含 huapi order=8810（note:「画皮」）；firstNight 中 huapi order=6310 排在投毒者(4600)、教父(5400)、魔鬼代言人(5500) 之后。
- **百科依据**（夜晚行动顺序一览）：「画皮：唤醒画皮，让他攻击一名存活玩家，该玩家变成活尸。」仅出现在首个夜晚列表，位于限/投毒者之前；「其他夜晚」列表中没有画皮条目。
- **影响**：按百科，画皮只在首夜行动且先于投毒者；包内首夜顺序颠倒，且其他夜多出画皮条目，会让说书人在之后的夜晚再次唤醒画皮攻击，直接改变结算（多出攻击/活尸转化）。
- **建议**：删除 otherNight 的 huapi 条目；firstNight 将 huapi 移到投毒者之前。

#### [high] shi-san-hang/acrobat
- **仓库现状**：night-orders.json《十三行》otherNight acrobat order=8900（note:「杂技演员」），排在道士(4410)、小恶魔(4900)、普卡(5100)、饕餮(8100)、典狱长(8300)、教父(8700) 之后。
- **百科依据**（夜晚行动顺序一览）：「杂技演员：唤醒杂技演员，让他选择一名玩家。如果当晚这名玩家醉酒或中毒，杂技演员死亡。」位于赌徒之后、舞蛇人/僧侣以及所有恶魔行动之前。
- **影响**：现行杂技演员需要每夜在保护/下毒与恶魔击杀结算前被唤醒选人；官方 nightsheet otherNight 中 acrobat 同样位于 gambler 与 snakecharmer 之间。包内把他放到几乎所有击杀之后，说书人将无法在正确时点让其选人并判定醉酒/中毒死亡，直接改变其死亡结算。
- **建议**：移到赌徒之后、舞蛇人之前（约 2000 档位）。

#### [high] ji-meng-ta-xiang/acrobat
- **仓库现状**：night-orders.json《寄梦他乡》otherNight acrobat order=8900，note:「如果杂技演员左右两侧最近的存活善良玩家之一中毒或醉酒，杂技演员死亡。」
- **百科依据**（夜晚行动顺序一览）：「杂技演员：唤醒杂技演员，让他选择一名玩家。如果当晚这名玩家醉酒或中毒，杂技演员死亡。」（位于赌徒之后、恶魔行动之前）
- **影响**：note 描述的是旧版杂技演员（被动检查两侧邻居的醉酒中毒），与百科现行版本（主动唤醒选择一名玩家）在目标对象、判定条件与唤醒方式上完全不同；顺位也随旧版被放在所有击杀之后。对象错+条件错+时机错，会直接误导结算。
- **建议**：note 改为“唤醒杂技演员让其选择一名玩家……”，顺位移到恶魔行动之前。

#### [high] bing-gong-ban-shi/poppygrower
- **仓库现状**：night-orders.json《秉公办事》firstNight：qianke order=4、lunatic order=5、poppygrower order=6；otherNight：qianke order=2、poppygrower order=3（poppygrower note:「不要让恶魔和爪牙相认。」）。
- **百科依据**（夜晚行动顺序一览）：首夜顺序为「罂粟种植者：如果罂粟种植者在场，跳过今晚的爪牙信息和恶魔信息环节。」→（爪牙信息/恶魔信息）→「疯子」→「掮客」；其他夜为「罂粟种植者」（死亡补发信息）在「掮客」之前。
- **影响**：罂粟种植者必须在爪牙/恶魔信息与疯子的假恶魔信息环节之前结算（官方原序 poppygrower 亦在 lunatic 之前）；包内把掮客和疯子排在其之前，说书人可能先发出本应被跳过的邪恶信息。其他夜的补发信息环节同理应先于掮客。（该剧本中标注“清清自编”的梼杌/穷奇等自定义条目未计入本审计。）
- **建议**：firstNight 调整为 poppygrower < lunatic < qianke；otherNight 调整为 poppygrower < qianke。

#### [high] ji-meng-ta-xiang/jianning
- **仓库现状**：night-orders.json《寄梦他乡》otherNight jianning(order 8400) note:「唤醒奸佞，让其选择一名玩家。如果白天奸佞未投票，改为让其选择两名玩家。标记他选择的玩家死亡。」
- **百科依据**（夜晚行动顺序一览）：「奸佞：唤醒奸佞，让他攻击一名玩家。随后，唤醒被标记“爪牙死亡”的玩家，让他攻击一名玩家。」
- **影响**：两者的击杀规则完全不同：百科版是奸佞攻击一人后、再唤醒被标记“爪牙死亡”的玩家追加攻击一人；包版改为“白天未投票则选两人”。触发条件与攻击主体都不一致，会直接误导夜晚击杀结算。若为剧本自定义变体应在 note 中注明（同包其他条目均无自编标注）。
- **建议**：按百科文本修正 note，或明确标注为剧本自定义规则。

#### [medium] shang-di-que-xi/ravenkeeper
- **仓库现状**：night-orders.json《上帝缺席》otherNight：ravenkeeper order=42 先于 moonchild order=49（moonchild note:「如果月之子在白天触发了死亡能力并选择了一名善良玩家，该玩家死亡。标记那名玩家死亡。」）。
- **百科依据**（夜晚行动顺序一览）：其他夜晚列表中「月之子：如果月之子在今天白天的时候使用自己的能力选择了一名善良玩家，那名玩家死亡。（调整理由：会造成死亡的能力效果，放在死亡触发能力效果之前……）」位于「守鸦人：如果守鸦人死于夜晚，唤醒守鸦人，让他选择一名玩家……」之前。
- **影响**：月之子在百科虽有调整标注，但官方原序（release.botc.app nightsheet）同样是 moonchild 先于 ravenkeeper，包序与两种顺序都矛盾。若月之子白天选中的善良玩家正是守鸦人，按包序说书人会在该死亡结算前先跳过守鸦人环节，漏掉守鸦人验人。
- **建议**：将 ravenkeeper 移到 moonchild 之后。

#### [medium] zhi-shou-zhe-tian/farmer
- **仓库现状**：night-orders.json《只手遮天》otherNight：farmer order=46 先于 gossip order=47（farmer note:「如果农民在夜晚死去，则选择另一位善良玩家成为农民……」；gossip note:「如果白天的声明为真，会有一名玩家死亡……」）。
- **百科依据**（夜晚行动顺序一览）：「造谣者：如果造谣者今天白天的声明正确，一名玩家死亡。（调整理由：会造成死亡的能力效果，放在死亡触发能力效果之前……）」位于「农夫：如果农夫死于夜晚，唤醒一名存活的善良玩家告知他角色变化。」之前。
- **影响**：造谣者虽有调整标注，但官方原序同样是 gossip 先于 farmer（官方 nightsheet otherNight：gossip 在 farmer 之前），包序与两种顺序都矛盾；且同仓库《信口雌黄》为 gossip=91 < farmer=103，包间自相矛盾。若造谣者造成的死亡判给农夫，按包序会漏掉农夫的角色传承结算。
- **建议**：将 farmer 移到 gossip 之后。

#### [medium] bing-gong-ban-shi/damsel
- **仓库现状**：night-orders.json《秉公办事》firstNight damsel(order 10) note:「如果落难少女被巡山人选中，唤醒落难少女，展示“你是”信息标记和一个不在场的镇民角色标记，将落难少女的角色标记替换成新的镇民角色标记。」
- **百科依据**（夜晚行动顺序一览）：首夜「落难少女：如果落难少女在场，对爪牙展示落难少女角色标记。」（其调整理由亦说明首夜行动的本质是对爪牙的暴露）
- **影响**：首夜落难少女环节应是向爪牙展示落难少女在场，而非巡山人换角色流程；且 script-rosters.json 显示该剧本 roster 根本没有巡山人，这条 note 永不触发。照 note 执行时爪牙首夜不会得知落难少女在场，其“爪牙猜中即败”的核心机制无法运转。
- **建议**：note 改为“对所有爪牙展示落难少女角色标记”。

#### [medium] bing-gong-ban-shi/investigator
- **仓库现状**：night-orders.json《秉公办事》firstNight investigator order=15，排在 general(13)、vizier(14) 之后（vizier note:「告诉所有玩家维齐尔在场，并指向维齐尔玩家。」）。
- **百科依据**（夜晚行动顺序一览）：「调查员：唤醒调查员，对他指向两名玩家，并展示一个爪牙角色标记。」位于首夜信息角色区段（逆臣/祖母/将军之前）；而「维齐尔：如果维齐尔在场，告知所有人谁是维齐尔。」位于黎明之后。
- **影响**：调查员被排到将军、甚至黎明后才宣告的维齐尔之后，与百科及官方原序（investigator 远在 general/vizier 之前）都矛盾。另同包 祖母(order 11) 先于 逆臣(order 12)，百科为逆臣在前。信息内容本身不受影响，但时序明显错误、易造成主持流程混乱。
- **建议**：将 investigator 移到祖母之前的信息区段；逆臣移到祖母之前。

#### [medium] bing-gong-ban-shi/jinyiwei
- **仓库现状**：night-orders.json《秉公办事》otherNight：gambler order=4 先于 jinyiwei order=5（jinyiwei note:「……唤醒锦衣卫，让其选择一名玩家。在该玩家角色标记旁放置“保护”提示标记。」）；nichen order=6 先于 pithag order=7。
- **百科依据**（夜晚行动顺序一览）：其他夜晚列表中「锦衣卫：唤醒锦衣卫，让他选择一名玩家。他现在开始保护那名玩家。」位于「赌徒」之前；「麻脸巫婆」（调整后位置）位于「逆臣」之前，且按其调整理由推算的原始位置（洗脑师之后）同样先于逆臣。
- **影响**：锦衣卫的保护应先于赌徒的猜错死亡判定生效，包序颠倒可能改变赌徒是否死亡；麻脸巫婆的变身按百科调整序与原序都应先于逆臣，包序颠倒会让被变身玩家的当晚互动错位。
- **建议**：jinyiwei 移到 gambler 之前；pithag 移到 nichen 之前。

#### [medium] wu-he-you-zhi-xiang/villageidiot
- **仓库现状**：night-orders.json《无何有之乡》firstNight villageidiot(order 10100) note:「在为首个夜晚做准备时，（如果有超过一名村夫在场，）将村夫的“醉酒”提示标记放置到其中一个村夫角色标记旁。」
- **百科依据**（夜晚行动顺序一览）：首夜「村夫：唤醒村夫，让他指向一名玩家，用手势告诉他那名玩家的阵营。」
- **影响**：首夜 note 只写了设置醉酒标记的准备工作，完全没有“唤醒村夫指人并给出阵营手势”的行动；说书人按 note 执行会漏掉首夜村夫信息（该包只有 otherNight note 写了唤醒流程）。遗漏首夜信息对结算有实际影响。
- **建议**：在 firstNight note 中补上唤醒与给信息的流程。

#### [medium] mo-ni-zhi-jiao/xiuxingzhe
- **仓库现状**：night-orders.json《莫逆之交》firstNight：nightwatchman order=11、ogre order=12 先于 xiuxingzhe order=13。同类问题：《枯木逢春》shugenja=12000 晚于 nightwatchman=10700；《无何有之乡》shugenja=12000 晚于 spy=11700 和 highpriestess=11900；《静候佳音》xiuxingzhe=26 晚于 nightwatchman=25。
- **百科依据**（夜晚行动顺序一览）：首夜「修行者：唤醒修行者，对他指向对应方向来告知他最近的邪恶玩家的方向。」位于赏金猎人/守夜人/异教领袖/间谍/食人魔/女祭司之前。
- **影响**：官方 nightsheet firstNight 同样是 shugenja 先于 bountyhunter/nightwatchman/spy/ogre/highpriestess；四个包一致把修行者排到夜末，与两种顺序都矛盾，属系统性顺位数据错误。修行者信息与这些角色无相互作用，结算内容不受影响，故定为 medium。
- **建议**：将四个包的修行者条目统一移到守夜人/间谍等之前。

## 二、规则概念与产品机制层（23 条确认）

#### [high] innkeeper
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:44): “每晚选择两名玩家，他们今晚不受恶魔影响，但其中一人醉酒到黄昏。”
- **百科依据**（旅店老板 / 保护 / 免死）：旅店老板.wiki 角色能力：“每个夜晚*，你要选择两名玩家：他们当晚不会死亡，但其中一人会醉酒到下个黄昏。”；同页：“受保护的玩家也不会因为外来者、爪牙、镇民和旅行者的能力而死亡。”；保护.wiki：“具有“保护”类能力的角色均在[[暗流涌动]]中出场”（仅僧侣、士兵）；免死.wiki 将旅店老板列在免死类角色下。
- **影响**：把旅店老板的“当晚不能死亡”（免死，阻止任何来源的死亡）错写成“不受恶魔影响”（保护/safe from the Demon）。这正是免死与保护两个概念的区别：按 repo 文案，说书人会在赌徒猜错、修补匠、祖母连坐、月之子等非恶魔死亡上错误地让被保护玩家死亡。同仓库 bad-moon-rising/roles.ts 的 research（“两名目标今晚不能死亡”）与 complexRoleKnowledge.ts:68（“两名目标今晚不能死亡，其中一人醉酒”）都是对的，roleCopy 与之自相矛盾。另注意百科为“每个夜晚*”（首夜不行动），roleCopy 写“每晚”。
- **建议**：改为“每个夜晚*选择两名玩家：他们当晚不会死亡，但其中一人醉酒到下个黄昏。”

#### [high] vigormortis
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:167): “每晚选择一名玩家死亡；你杀死的爪牙保留能力，且相邻两名镇民中毒。”
- **百科依据**（亡骨魔）：亡骨魔.wiki 角色能力：“被你杀死的爪牙保留他的能力，且与他邻近的两名镇民之一中毒。[-1外来者]”；同页：“亡骨魔在杀死爪牙时总是会使一名镇民玩家中毒……由说书人选择该爪牙哪一侧的镇民中毒。”
- **影响**：数字错误：百科是“邻近两名镇民之一”即每个被杀爪牙只使一名镇民中毒（哪一侧由说书人选择），repo roleCopy 写成相邻两名镇民都中毒。complexRoleKnowledge.ts:56（“使相邻一名镇民中毒”）和 sects-and-violets/roles.ts research（“让相邻一名镇民中毒”）都正确，roleCopy 与之矛盾。roleCopy 还遗漏了 [-1外来者] 设置项。
- **建议**：改为“……你杀死的爪牙保留能力，且与其邻近的两名镇民之一中毒。[-1外来者]”

#### [high] nodashii
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:166): “两侧最近的镇民中毒。”（全文仅此一句）
- **百科依据**（诺-达鲺）：诺-达鲺.wiki 角色能力：“每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。”
- **影响**：roleCopy 完全遗漏了恶魔主条款“每个夜晚*选择一名玩家：他死亡”，只剩中毒被动。这是会改变结算结果的硬条件遗漏（恶魔不杀人）。同仓库 sects-and-violets/roles.ts 的 possibleOutcomes（“夜晚选择一名玩家死亡。”）和夜序表都包含击杀，roleCopy 与之矛盾。
- **建议**：改为“每个夜晚*选择一名玩家死亡；与你邻近的两名镇民中毒。”

#### [high] goon
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:57): “首个夜晚选择你的玩家醉酒到黄昏；你变成其阵营。”
- **百科依据**（莽夫（醉酒页所列相关角色））：莽夫.wiki 角色能力：“每个夜晚，首个使用其自身能力选择了你的玩家会醉酒直到下个黄昏。你会转变为他的阵营。”；同页：“通过祖母之类的角色能力，而由说书人选择了莽夫不算在内。”
- **影响**：时机错误：百科是“每个夜晚”的“首个（使用自身能力选择你的）玩家”，repo 写成“首个夜晚选择你的玩家”，自然读作只在首夜生效，会漏掉之后每晚的醉酒与阵营转变结算。同时遗漏“使用其自身能力”这一限定（说书人代选不触发）。complexRoleKnowledge.ts:109（“每晚第一个用能力选择莽夫的玩家醉酒到黄昏”）正确，roleCopy 与之矛盾。
- **建议**：改为“每个夜晚，首个用自身能力选择你的玩家醉酒到下个黄昏；你变成他的阵营。”

#### [high] shabaloth
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:98): "每晚选择两名玩家死亡；你可能复活被你杀死的玩家。"
- **百科依据**（沙巴洛斯）：沙巴洛斯.wiki 角色能力："你上个夜晚选择过且当前死亡的玩家之一可能会被你反刍。"；角色简介："被复活的玩家可以是在存活状态下被沙巴洛斯攻击的玩家，也可以是在死亡状态下被沙巴洛斯攻击的玩家。"
- **影响**：两处偏差：(1) 遗漏"上个夜晚"这一硬性时机条件——只能反刍上一夜选择过的玩家，按仓库文案说书人可能复活任意一名沙巴洛斯曾经杀死的玩家；(2) 对象错误——条件是"上晚被选择且当前死亡"，不要求"被你杀死"（可以选择一名已死亡玩家再于次夜反刍他），仓库的"被你杀死的玩家"把这条路径排除了。同仓库 bad-moon-rising/roles.ts 的 research.possibleOutcomes（"上一晚选中的死亡玩家可能被反刍复活"）和 bao-yue-chu-sheng/night-orders.ts:23 均正确，与 roleCopy 矛盾。
- **建议**：改为："每晚选择两名玩家死亡；你上晚选择过且当前死亡的玩家之一可能被你反刍复活。"

#### [high] concept:处决
- **仓库现状**：src/features/game-session/state/daySessionReducer.ts (confirm-day-execution, 43-68行)：确认处决时无条件写入死亡——`const after = { ...before, life: 'dead' as const }`，并追加 player_state_changed 记录，reason 为「说书人确认处决」。不存在“被处决但存活”的记录路径。
- **百科依据**（规则概要）：规则概要·三.3：「说书人会宣布这名玩家死亡（或宣布这名玩家被处决但没有死亡，如果他因为任何效果导致不死的话）」；重要细节·三.1：「处决的概念与死亡有所不同。某些情况下，一名玩家可能被处决，但仍然存活而不死亡。」
- **影响**：百科明确区分“处决”与“死亡”两个概念：被处决者可因角色能力（如弄臣首次免死、魔鬼代言人保护、精神病患者猜拳获胜）存活。仓库的处决确认流程把处决与死亡强制绑定，说书人一旦确认处决，权威状态即自动标记该玩家死亡；若实际结算应为“被处决但未死”，要么产生错误的死亡记录（需另行手动改回存活），要么被迫记录为“无处决”——后者又会错误影响镇长/涡流/主谋等以“是否发生处决”为条件的结算。仓库自身的 complexKnowledge 也承认这种情形（devilsadvocate:「若明天被处决，该玩家不死」；psychopath:「被处决时只有输掉猜拳才死亡」），与该 reducer 互相矛盾。
- **建议**：把“处决发生”与“处决造成死亡”拆成两步：确认处决时允许选择结果（死亡/未死亡），execution 时间线条目独立于 player_state_changed。

#### [high] moonchild
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:80): 「死亡后当晚选择一名存活玩家；若其善良，目标死亡。」（该字段经 localizedRoleAbility 覆盖各包 abilityText，直接面向说书人展示）
- **百科依据**（月之子 / 公开触发能力）：月之子.wiki 角色能力：「当你得知你死亡时，你要公开选择一名存活的玩家。如果他是善良的，在当晚他会死亡。」角色简介：「月之子必须在得知自己死亡后的一到两分钟内选择一名玩家，无论是被处决后，还是在黎明说书人宣布夜晚的死亡玩家后。」公开触发能力.wiki：「部分公开触发能力还有更为严格的时限（如月之子和呆瓜）。」
- **影响**：仓库文案遗漏了「公开」这一硬条件，并把选择时机写成「当晚选择」。百科规定：选择发生在得知死亡时（处决后或黎明宣布后一到两分钟内）且必须公开进行，死亡才发生在当晚。「公开」是公开触发能力页的核心机制（他人可伪装触发、说书人须配合），写成夜晚私下选择会让说书人在错误的时机以错误的方式结算。仓库自身的 complexKnowledge（'月之子死后公开选择'）与该文案也互相矛盾。
- **建议**：改为「当你得知自己死亡时，公开选择一名存活玩家；若其善良，当晚他死亡。」

#### [high] damsel
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:242): 「所有爪牙知道落难少女在场；若爪牙公开猜中你一次，善良阵营失败。」
- **百科依据**（落难少女 / 公开触发能力）：落难少女.wiki 角色能力：「每局游戏限一次，任意爪牙可以公开猜测你是落难少女，如果猜对，你的阵营落败。」角色简介：「不论有多少爪牙在场，他们都仅仅只有一次猜测的机会。如果有爪牙做出了猜测但答案错误，后续做出的任何猜测都不会再生效。」
- **影响**：仓库文案丢失了「每局游戏限一次（全体爪牙共享，猜错即耗尽）」这一硬条件。「若爪牙公开猜中你一次」的自然读法是爪牙可反复猜测直到猜中，这会彻底改变结算（照此裁定邪恶最终必胜）。各包 abilityText（如 catfishing 包）原文正确，但被此中央覆盖文案替换，构成包间矛盾。
- **建议**：改为「所有爪牙知道落难少女在场；每局限一次，任一爪牙可公开猜测你是落难少女，猜对则你的阵营落败（猜错即耗尽机会）。」

#### [high] juggler
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:153): 「首日白天公开猜若干玩家的角色；当晚得知猜对数量。」
- **百科依据**（杂耍艺人 / 回溯型能力）：杂耍艺人.wiki 角色能力：「在你的首个白天，你可以公开猜测任意玩家的角色最多五次。在当晚，你会得知猜测正确的角色数量。」角色简介：「他可以猜测零个角色，或者最多猜测五个角色」。回溯型能力.wiki 范例注：「“在你的首个白天”中的“你”指的是玩家作为该能力所属角色时的“你”，而非玩家的“你”」。
- **影响**：「若干」丢失了「最多五次」这一会改变结算结果的硬性数字上限；此外「首日白天」与百科的「你的首个白天」语义不同——回溯型能力页明确该表述指玩家作为杂耍艺人的首个白天（中途变成杂耍艺人的玩家在其变身后的首个白天猜测），写死为游戏第一天会在角色变化场景下误导结算。
- **建议**：改为「在你（作为该角色）的首个白天，可公开猜测任意玩家的角色最多五次；当晚得知猜对数量。」

#### [high] deviant
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:277): 「如果你很有趣，可能随时被处决。」
- **百科依据**（怪咖 / 疯狂规则如何运作？——疯狂的小精灵）：怪咖.wiki 角色能力：「如果你表现得很有趣，当天你不能被流放。」疯狂规则如何运作？——疯狂的小精灵.wiki：「如果说书人认为怪咖很搞笑，那些其他玩家尝试不笑出声来只是为了想要流放怪咖，那么说书人可以判断怪咖表现得很搞笑并阻止他的死亡。」
- **影响**：效果完全写反：百科中「有趣」是奖励——当天免于被流放（怪咖是旅行者，对应流放而非处决）；仓库写成「有趣→可能随时被处决」，既把保护写成惩罚（对象/条件全错），又混淆了流放与处决两个不同机制。按此文案裁定会直接错杀玩家。
- **建议**：改为「如果你今天表现得很有趣，当天你不能被流放。」

#### [medium] minstrel
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:53): “爪牙被处决后，所有其他玩家醉酒到明天黄昏。”
- **百科依据**（吟游诗人（醉酒页所列相关角色））：吟游诗人.wiki 角色能力：“当一名爪牙死于处决时，除了你和旅行者以外的所有其他玩家醉酒直到明天黄昏。”；同页：“如果一名爪牙玩家被处决但没有死亡，吟游诗人的能力不会触发。”
- **影响**：两处条件/对象错误：(a) 触发条件是“死于处决”而非“被处决”——被处决但未死（如弄臣首次免死、魔鬼代言人保护）不触发；(b) 遗漏“旅行者除外”，按 repo 文案旅行者也会被标记醉酒。bad-moon-rising/roles.ts 的 abilityText（含 “(except Travellers)”）与 stateChanges（“爪牙被处决死亡后，其他非旅行者玩家醉酒至明天黄昏”）正确，roleCopy 与之矛盾。
- **建议**：改为“当一名爪牙死于处决时，除你和旅行者外的所有玩家醉酒到明天黄昏。”

#### [medium] spy
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:31): “每晚可查看魔典；你可能被登记为善良和镇民。”
- **百科依据**（间谍）：间谍.wiki 角色能力：“你可能会被当作善良阵营、镇民角色或外来者角色，即使你已死亡。”
- **影响**：登记(register)机制遗漏两个结算相关要素：可登记为“外来者角色”（影响图书管理员、筑梦师等对间谍的登记结果），以及“即使你已死亡”（影响送葬者、守鸦人、神谕者等对死亡间谍的结算）。trouble-brewing/roles.ts 的 possibleOutcomes（“可能被登记为善良、镇民或外来者”）与 complexRoleKnowledge.ts:121（“……即使死亡也可能如此”）都正确，roleCopy 与之矛盾。同文件 recluse 条目则完整写出了对应要素。
- **建议**：补全为“……你可能被登记为善良阵营、镇民或外来者角色，即使已死亡。”

#### [medium] shabaloth
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:98): “每晚选择两名玩家死亡；你可能复活被你杀死的玩家。”
- **百科依据**（沙巴洛斯（复活页所列相关角色））：沙巴洛斯.wiki 角色能力：“你上个夜晚选择过且当前死亡的玩家之一可能会被你反刍。”
- **影响**：遗漏“上个夜晚选择过”的时机限制，且把对象“选择过且当前死亡的玩家”改写成“被你杀死的玩家”。按 repo 文案说书人可能错误地复活多夜之前杀死的玩家（或不复活被选择但因其他原因死亡的玩家）。夜序表（“上一夜被沙巴洛斯选择且当前已死亡的玩家之一可能被反刍”）和 complexRoleKnowledge.ts:76（“前一晚被选且死亡者可能复活”）都正确，roleCopy 与之矛盾。
- **建议**：改为“每晚选择两名玩家死亡；上一晚被你选择且已死亡的玩家之一可能被反刍复活。”

#### [medium] huapi
- **仓库现状**：abilityText (src/domain/scripts/packs/shi-san-hang/roles.ts:51): “……当他下一次死亡时，他重生，随后你重获能力。”
- **百科依据**（画皮 / 免死）：画皮.wiki 角色能力：“当他下一次即将死亡时，他重生，随后你重获能力。”；运作方式：“下一次即将死亡时，该玩家再次变成存活状态……不要宣布该玩家死亡”；免死.wiki：“画皮会阻止被他选择玩家的下一次死亡”。
- **影响**：abilityText 漏掉“即将”二字，语义从“下一次死亡被阻止（免死并转为存活）”漂移为“死亡之后再复活”。免死.wiki 明确受免死保护的玩家“不会死亡，也不会触发死亡触发能力”；按 repo 文案说书人可能先宣布死亡/触发死亡类结算再复活，结算结果不同。
- **建议**：abilityText 改回百科原文“当他下一次即将死亡时，他重生，随后你重获能力。”

#### [medium] devilsadvocate
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:82): "每晚选择一名存活玩家；若其明天被处决，不会死亡。"
- **百科依据**（魔鬼代言人）：魔鬼代言人.wiki 角色能力："每个夜晚，你要选择一名存活的玩家（与上个夜晚不同）：如果明天白天他被处决，他不会死亡。"；角色简介："魔鬼代言人不能连续两个夜晚选择同一名玩家"。
- **影响**：遗漏"（与上个夜晚不同）"这一硬性目标限制。按仓库文案，说书人会允许魔鬼代言人每晚连续保护同一名玩家（例如连夜保自己或恶魔），这会实质改变处决结算与游戏平衡。同仓库 complexRoleKnowledge.ts:111 的"每晚选择一名与昨晚不同的存活玩家"是正确的，与 roleCopy 矛盾。
- **建议**：改为："每晚选择一名存活玩家（与上晚不同）；若其明天被处决，不会死亡。"

#### [medium] pukka
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:97): "每晚选择一名玩家中毒；前一名被你中毒的玩家死亡后恢复健康。"；complexRoleKnowledge.ts:116 reminders 同样写作"上一名被普卡中毒的玩家死亡后恢复健康"，且 requiredContext 把"上一名目标是否死亡"列为待核对事实。
- **百科依据**（普卡）：普卡.wiki 角色能力："上个因你的能力中毒的玩家会死亡并恢复健康。"；角色简介："在下一个夜晚，该名玩家会在普卡发起下一次攻击之后的时间点死亡。"
- **影响**：语义弱化：百科中"死亡并恢复健康"是普卡能力自身造成的击杀效果（这是普卡唯一的杀人方式），仓库的"死亡后恢复健康"把主动击杀改写成了"待其死亡后再恢复健康"的被动条件句，配合 requiredContext 里"上一名目标是否死亡"的措辞，容易让说书人误以为死亡由其他来源造成、从而漏掉普卡对上一个中毒目标的击杀结算。bao-yue-chu-sheng/night-orders.ts:22 的夜间提示（"上一个因普卡中毒的玩家死亡，随后恢复健康"）是正确的。
- **建议**：roleCopy 改为："每晚选择一名玩家：他中毒。上一个因你中毒的玩家死亡，随后恢复健康。"并把 complexRoleKnowledge 的提醒同步为主动击杀表述。

#### [medium] concept:复活
- **仓库现状**：src/domain/scripts/packs/bao-yue-chu-sheng/night-orders.ts:30 教授 note："教授可以选择一名死亡玩家。如果他这么做了，标记教授失去能力，然后如果那名玩家是镇民，标记那名玩家被复活。之后的夜晚无需再唤醒教授。"；同文件 :23 沙巴洛斯 note："……如果被反刍，标记那名玩家被复活。让沙巴洛斯选择两名玩家。标记这两名玩家死亡。"
- **百科依据**（复活）：复活.wiki："新的角色视为该玩家以全新状态获得，因此能够触发'在你的首个夜晚/白天'类能力，或是使用'每局游戏限一次'的能力。"；教授.wiki 运作方式："如果被复活的玩家其角色在当晚的后续时段中应该被唤醒，则照常唤醒。如果该玩家的角色只会在首个夜晚被唤醒，则立即唤醒该玩家来使用自己的能力。……黎明时，在宣布哪些玩家死亡后，宣布哪些玩家再次变成存活状态了。"沙巴洛斯.wiki 运作方式有相同要求。
- **影响**：两条复活相关的夜间流程 note 都只写"标记那名玩家被复活"，遗漏了百科规定的后续处理：被复活玩家视为全新获得角色——若其角色只在首夜被唤醒（如洗衣妇、祖母），需要立即唤醒并重新给信息；正常夜间行动的角色照常唤醒；且黎明时要宣布复活（不说明原因）。按仓库 note 执行会漏掉复活玩家的能力重触发，直接影响夜晚结算。
- **建议**：在教授与沙巴洛斯的 night-order note 中补充："被复活的玩家视为重新进场：只在首夜行动的角色立即唤醒并结算其首夜能力，其余角色当晚照常唤醒；黎明时宣布该玩家复活（不说明原因）。"

#### [medium] concept:规则概要
- **仓库现状**：src/features/day-workbench/DayWorkbench.tsx:33：`function newDraft(session: GameSessionState, threshold = 6)` —— 每轮投票草稿的「处决门槛」固定默认 6 票，与在场/存活人数无关；全仓库无任何按“存活人数一半（向上取整）”推导门槛的逻辑。
- **百科依据**（规则概要）：规则概要·三.2：「他的票数等于或超过了存活玩家人数的一半」；术语汇总·处决：「在一天的处决提名中得到至少等同于当前存活玩家数量一半的票数，且得到比其他被提名的玩家更多票数的玩家会被处决。」
- **影响**：处决门槛是硬结算数字：⌈存活人数/2⌉，且随白天中的死亡而变化。工具把门槛预填为固定 6，只有 11-12 名存活玩家时恰好正确；其他人数下若说书人未手动改，voteStanding 会据错误门槛产出「未达门槛/暂列」判定，直接误导处决结算。字段虽可编辑，但工具未给出任何“存活一半”的提示或自动计算。
- **建议**：用 projectCurrentPlayerStates 统计存活人数，默认 threshold = Math.ceil(alive / 2)，并在人数变化时刷新提示。

#### [medium] concept:旅行者
- **仓库现状**：全仓库（src/、server/，除脚本包角色文本外）没有任何「流放/放逐」概念：时间线类型仅有 vote_round / execution / no_execution 等（src/features/game-session/model/timelineTypes.ts），complexRoleKnowledge.ts 无任何旅行者/流放条目，白天工作台只有“提名→投票→处决”一条流程。
- **百科依据**（旅行者）：旅行者：「旅行者需要通过流放流程而不是处决流程来杀死」「成功流放所需的票数是所有玩家总数的一半，而非根据存活玩家数量计算」「支持流放的死亡玩家不需要消耗他们的投票标记」「流放一名旅行者的流程无法被任何角色能力所影响」「在同一个白天能够流放任意数量的旅行者……流放不算做处决，因此即使有旅行者被流放，当天仍然能够进行一次处决」。
- **影响**：流放与处决在百科中是两套计票与结算规则：门槛基数不同（全体玩家数 vs 存活玩家数）、死亡票不消耗、能力免疫、每天次数不限、不占用当天唯一的处决。仓库完全没有流放的记录通道和提醒知识，说书人若把流放记成 vote_round+execution，会：占掉当天唯一处决（hasDayResolution 拦截后续真处决）、按存活一半的门槛误判、并错误消耗死亡票记录。这是本组核对点“旅行者的放逐与计票规则”的直接缺口。
- **建议**：为时间线新增 exile 条目类型（门槛=⌈全体玩家/2⌉、不计入当日处决、不消耗死亡票），或至少在白天工作台提供独立于处决的流放记录入口与规则提示。

#### [medium] recluse
- **仓库现状**：src/domain/scripts/packs/trouble-brewing/roles.ts：`"id":"recluse","name":"隐士"`；src/domain/role-knowledge/complexRoleKnowledge.ts:108：`k('recluse', '隐士', ... ['隐士可能被登记为邪恶、爪牙或恶魔，即使死亡也可能如此。'...])`。而同仓库多数其他脚本包及 role-copy 提取层将 recluse 命名为「陌客」。
- **百科依据**（外来者）：外来者（暗流涌动栏）：「File:Recluse.png|link=陌客|[[陌客]]」；同页实验性角色栏另有独立角色「File:Hermit.png|link=隐士|[[隐士]]」（Hermit）。
- **影响**：百科 ground truth 中 Recluse 的官方中文名是「陌客」，「隐士」是另一个规则完全不同的实验性外来者（Hermit）。仓库在核心官方剧本《暗流涌动》包和 complexKnowledge 标题里把 Recluse 显示为「隐士」，说书人按此名去百科查询会命中错误角色的规则；且与仓库其他包的「陌客」形成同角色跨包两名的内部矛盾。
- **建议**：将 trouble-brewing 包与 complexRoleKnowledge 中 recluse 的显示名统一改为「陌客」，保留「隐士」给未来的 Hermit。

#### [medium] concept:镇民/外来者/爪牙/恶魔/旅行者
- **仓库现状**：三个官方基础剧本包的角色显示名偏离百科官方译名，且与同仓库其他包对同一 roleId 的命名互相矛盾。暗流涌动包（src/domain/scripts/packs/trouble-brewing/roles.ts）：undertaker=掘墓人、virgin=圣女、scarletwoman=猩红女郎、bureaucrat=官僚；黯月初升包：gossip=流言者、voudon=伏都教徒；梦殒春宵包：flowergirl=花艺师、towncrier=镇喊者、sweetheart=甜心、klutz=冒失鬼、pithag=皮特哈格、eviltwin=邪恶双子、vigormortis=维格莫提斯、vortox=漩涡、harlot=风尘女子、bonecollector=骸骨收集者、deviant=异端者。
- **百科依据**（镇民）：镇民/外来者/爪牙/恶魔/旅行者各页官方名录：送葬者(Undertaker)、贞洁者(Virgin)、红唇女郎(Scarletwoman)、官员(Bureaucrat)、造谣者(Gossip)、巫毒师(Voudon)、卖花女孩(Flowergirl)、城镇公告员(Towncrier)、心上人(Sweetheart)、呆瓜(Klutz)、麻脸巫婆(Pithag)、镜像双子(Eviltwin)、亡骨魔(Vigormortis)、涡流(Vortox)、流莺(Harlot)、集骨者(Bonecollector)、怪咖(Deviant)。
- **影响**：同一 roleId 在仓库多数包里用百科官方名（如 造谣者、贞洁者、麻脸巫婆），却在三个官方基础剧本包里换成另一套译名，构成跨包同角色命名矛盾。这些名字被百科其他规则页大量引用（如处决页引用送葬者、镜像双子、涡流；规则概要引用红唇女郎），使用官方包的说书人按包内名称检索规则会找不到或找错条目；「邪恶双子/异端者」还与百科既有角色「镜像双子/异端分子」形成近名混淆。角色能力文本本身未见语义冲突，故定为 medium（同角色跨包描述矛盾）。
- **建议**：以百科名录为准统一三个官方包的 name 字段（掘墓人→送葬者、圣女→贞洁者、猩红女郎→红唇女郎、官僚→官员、流言者→造谣者、伏都教徒→巫毒师、花艺师→卖花女孩、镇喊者→城镇公告员、甜心→心上人、冒失鬼→呆瓜、皮特哈格→麻脸巫婆、邪恶双子→镜像双子、维格莫提斯→亡骨魔、漩涡→涡流、风尘女子→流莺、骸骨收集者→集骨者、异端者→怪咖）。

#### [medium] bianlianshi
- **仓库现状**：abilityText (src/domain/scripts/packs/huang-liang-yi-meng-lao-hua-deng/roles.ts 与 yi-chu-hao-xi-lao-hua-deng/roles.ts 的 bianlianshi 条目): 「每个白天，如果你“疯狂”地证明自己是一个善良角色（与之前不同），你会在当晚获得那个角色的能力，直到下个黄昏。」
- **百科依据**（变脸师 / 疯狂）：变脸师.wiki 角色能力：「每个白天，如果你“疯狂”地证明自己是一个善良角色（与之前不同），你可能会在当晚获得那个角色的能力，直到下个黄昏。」疯狂.wiki：「说书人有对玩家的表现是否符合“疯狂”状态的最终裁决权。」
- **影响**：两个包的中文 abilityText 均把「可能会……获得」写成「会……获得」，删掉了「可能」。疯狂类奖励是否发放是说书人对疯狂表现的裁量（疯狂页核心原则），写成必然获得会让说书人误以为只要有过疯狂声明就必须授予能力。该角色无 roleCopy 覆盖，此文本即面向用户的展示文本。
- **建议**：在两个包的 abilityText 中恢复「可能会在当晚获得」。

#### [medium] cerenovus
- **仓库现状**：roleCopy.ability (src/domain/scripts/role-copy.ts:161): 「每晚选择一名玩家和一个善良角色；其明天必须疯狂证明自己是该角色，否则可能被处决。」complexKnowledge.reminders (complexRoleKnowledge.ts:57): 「玩家明天需疯狂证明自己是指定善良角色。」
- **百科依据**（洗脑师 / 疯狂）：洗脑师.wiki 角色能力：「他明天白天和夜晚需要“疯狂”地证明自己是这个角色，不然他可能被处决。」运作方式：「在下一个白天或夜晚，如果被选择的玩家没有尽最大努力去说服其他玩家他是被选择的角色，你就可以处决他。」提示标记：「移除时机：在下一个夜晚的黎明时」
- **影响**：仓库文案把疯狂窗口缩写为「明天」，遗漏了「白天和夜晚」——疯狂持续到下个黎明，且被洗脑玩家在夜晚打破疯狂同样可以被（夜间）处决，这是有实际结算影响的窗口（畸形秀演员页同样确认夜间处决机制）。此外 chou-hai-ni-xing 包的 abilityText 原文完整正确（「他明天白天和夜晚需要……」），但被此简化的 roleCopy 覆盖展示，构成包间不一致。
- **建议**：roleCopy 改为「……他明天白天和夜晚需要疯狂证明自己是该角色，否则可能被处决（含夜间处决）」。

## 三、角色知识层（200 条确认）

### 3.1 规则错误（会误导结算）

#### [high] 哈迪寂亚 — complexKnowledge 触发条件写成「都选生」且遗漏复活规则
- **仓库现状**：complexKnowledge.reminders：「三名目标秘密选生死；三人都选生时三人都死亡。」wang-bu-jian-wang 变体 research.possibleOutcomes 同样写 "each secretly chooses life/death, then all die if all chose life"；bing-gong-ban-shi highRiskNotes 引用「如果三名玩家都选择活着，他们都死去。」
- **百科依据**（哈迪寂亚）：角色能力：「……然后如果他们都存活则都死亡。」规则细节：「『如果他们都存活』判断条件不会关注这些玩家是如何做出选择的，而只看在这些选择结算后玩家是否存活。选择『死去』的存活玩家如果受到免死能力的保护，会因此存活并计入『如果他们都存活』的判断条件。」「已死亡的玩家如果选择『活着』，会被复活。」
- **影响**：触发条件是「三人在各自选择结算后全部存活」，不是「三人都选择活」。选『死』但受免死保护而存活的玩家也计入该条件（此时三人仍全部死亡）——按仓库的「都选生」写法说书人会错判为无人死亡。complexKnowledge 还完全遗漏了「死亡玩家选『活』会被复活」这一结算关键规则，以及「哈迪寂亚醉酒或中毒时能力完全无效果、不发播报、不唤醒被选玩家」（规则细节原文）。
- **建议**：reminders 改为「若三人在选择结算后全部存活，则三人全部死亡（不看选了什么）」，并补充：死亡玩家选活会复活；哈迪寂亚醉酒/中毒时无任何效果与播报；逐个公布被选玩家并全场保持沉默的流程。

#### [high] 暴君 (baojun) — abilityText / roleCopy.ability / research
- **仓库现状**：abilityText 与 roleCopy.ability：「每个夜晚*，你可以选择至多两名玩家：他们死亡。你选择的玩家数量不能与上个夜晚死亡的玩家数量相同（超过二人时算作二人）。」；research.possibleOutcomes：「Each night choose up to two players to die; number chosen cannot match previous night deaths, capped at two.」；research.highRiskNotes：「Compare chosen count to last night death count; counts above two as two.」
- **百科依据**（暴君）：角色能力：「每个夜晚*，你要选择一名玩家：他死亡。」「如果你杀死了与爪牙邻近的玩家，下个夜晚你可以选择至多两名玩家：他们死亡。」角色简介：「如果与爪牙邻近的玩家因为某些原因没有被暴君杀死，那么暴君只能选择一名玩家。」
- **影响**：整套击杀机制与百科完全不同。百科：默认每晚只杀一名玩家；只有在上个夜晚成功杀死了与爪牙邻近的玩家（该玩家实际死亡）时，下个夜晚才可「暴虐」选择至多两名玩家，且暴虐时可不选或只选一人。仓库（script: ri-yue-xie-wang）：每晚都可选至多两人，附加了一条百科完全没有的「所选人数不能与上晚死亡人数相同（上限记二）」约束，且没有任何「与爪牙邻近」触发条件。数字、条件、触发时机全部对不上，会直接误导说书人结算恶魔击杀。
- **建议**：按百科重写 abilityText/roleCopy 与 research：基础每晚杀一人；杀死与爪牙邻近的玩家后放置「暴虐」标记，下晚可选至多两人（可少选或不选）；删除「人数不能与上晚死亡数相同」的错误约束。

#### [high] 驱魔人 (exorcist)
- **仓库现状**：roleCopy.ability："每晚选择一名玩家；若选中恶魔，恶魔不知道你且今晚不能行动。"
- **百科依据**（驱魔人）：百科"角色能力"："如果你选中了恶魔，他会得知你是驱魔人，但他当晚不会因其自身能力而被唤醒。"另"角色简介"："恶魔会得知他不能发动攻击，且得知谁是驱魔人。"
- **影响**：roleCopy 把规则完全说反了：百科明确规定选中恶魔时恶魔【会得知】谁是驱魔人（运作方式还要求向恶魔展示驱魔人角色标记并指向驱魔人玩家），而仓库文案写成"恶魔不知道你"。此外"今晚不能行动"比百科的"不会因其自身能力而被唤醒"更宽：百科说明其他恶魔能力仍然生效（如普卡上一夜攻击造成的死亡、僵怖假死等），且恶魔仍可因其他角色的能力被唤醒。按此文案结算会漏掉对恶魔的告知步骤并可能错误取消恶魔的被动效果。
- **建议**：将 roleCopy.ability 改为与百科一致："若选中恶魔，恶魔会得知你是驱魔人，且当晚不会因其自身能力被唤醒"。

#### [high] 赌徒 playerMessageTemplates 向玩家泄露猜测结果
- **仓库现状**：research.playerMessageTemplates：「Your guess result: {result}.」（An Du Chen Cang / Shang Di Que Xi / Si Zui Chan Hui Ri 变体）、「Your guess was {result}.」（Xin Li Bo Yi 变体，scripts xin-li-bo-yi、da-quan-zai-wo）
- **百科依据**（赌徒）：角色简介：「赌徒不会从说书人处得知自己的猜测是正确还是错误。」
- **影响**：多个板子包的玩家消息模板会把猜测对/错直接告知赌徒玩家，等于替他确认或否认目标的真实角色，直接违反百科的明确规则。赌徒只能通过黎明的死亡宣告间接推断结果。涉及 scripts：an-du-chen-cang、shang-di-que-xi、si-zui-chan-hui-ri、xin-li-bo-yi、da-quan-zai-wo。
- **建议**：删除所有含 {result} 的结果类模板，仅保留记录型模板（如 catfishing 变体的「You chose {target} and guessed {role}.」）。

#### [high] 锦衣卫 (jinyiwei, bing-gong-ban-shi) 首夜行动时机
- **仓库现状**：research.highRiskNotes (bing-gong-ban-shi): “First-night source reminder: ?移除上个夜晚放置的“保护”标记。唤醒锦衣卫，让其选择一名玩家。在该玩家角色标记旁放置“保护”提示标记。”；roleCopy.prompt 采用同一句 “First-night source reminder: ……唤醒锦衣卫……”
- **百科依据**（锦衣卫）：角色能力：“每个夜晚*，你要选择一名玩家……”；运作方式：“除首个夜晚以外的每个夜晚，唤醒锦衣卫。”
- **影响**：百科明确锦衣卫首个夜晚不行动（能力带*号，运作方式写明“除首个夜晚以外”），而 bing-gong-ban-shi 变体把唤醒锦衣卫选人的流程标注为“First-night source reminder”，且该句被直接抄进面向用户的 roleCopy.prompt，会误导说书人在首夜唤醒锦衣卫。该句内容本身（“移除上个夜晚放置的保护标记”）也自相矛盾——首夜不存在上个夜晚。同一段文字在 zhuo-yue-bi-fang 变体中被正确标为 “Other-night source reminder”，两剧本描述互相矛盾。
- **建议**：将 bing-gong-ban-shi 的该条改为 other-night 提示，并把 roleCopy.prompt 换成与“每个夜晚*”一致的表述。

#### [high] 酒保 (liu_gong_jiu_bao)
- **仓库现状**：abilityText/roleCopy.ability：「与你邻近的善良玩家之一醉酒，即使你已死亡。」
- **百科依据**（酒保）：角色能力：「……即使你死于处决。」角色简介：「这项能力当酒保死于处决时仍会保留。如果酒保因为非处决的原因而死亡时，醉酒将会解除。」运作方式：「如果酒保因为非处决的原因死亡了，立即移除'醉酒'标记。」
- **影响**：仓库把「即使你死于处决」改写成「即使你已死亡」，把仅在处决死亡时保留的醉酒效果扩大到任何死因。按百科，酒保被恶魔夜杀等非处决死亡时醉酒立即解除（百科范例：恶魔杀死酒保后共情者恢复清醒并获得正确信息）；按仓库文本，说书人会在酒保夜死后继续让邻近玩家醉酒，直接改变信息类角色的结算结果。
- **建议**：将能力文本改为「……即使你死于处决」，并补充非处决死亡时醉酒解除的说明。

#### [high] 主谋 mastermind — roleCopy.ability
- **仓库现状**：roleCopy.ability: “若恶魔因处决死亡且剩余至少 5 名玩家，游戏继续一天；若善良再次处决，邪恶胜利。”
- **百科依据**（主谋）：百科角色能力：“如果恶魔因为死于处决而因此导致游戏结束时，再额外进行一个夜晚和一个白天。在那个白天如果有玩家被处决，他的阵营落败。”角色简介：“如果一名邪恶玩家被处决，或者没有人被处决，则善良阵营获胜”“如果恶魔死亡且只剩余两名存活玩家，游戏仍然会额外进行一天”。
- **影响**：roleCopy 有多处规则语义错误：(1) 凭空添加“剩余至少 5 名玩家”这一硬条件，百科明确说明即使只剩两名存活玩家也会额外进行一天，主谋能力覆盖常规规则；(2) 落败条件写错——百科是“被处决玩家的阵营落败”（处决到邪恶玩家则善良获胜），roleCopy 写成“若善良再次处决，邪恶胜利”，会让说书人在善良阵营处决了邪恶玩家时错判为邪恶胜利；(3) 触发条件遗漏“因此导致游戏结束”（若还有其他恶魔存活则不触发）；(4) “游戏继续一天”遗漏了“额外一个夜晚”。各 repoVariants 的 abilityText 与 research（如 Bad Moon Rising：“额外一天若有人被处决，其阵营失败”）均正确，仅 roleCopy 错误。
- **建议**：改为：“若恶魔死于处决且这会导致游戏结束，则再额外进行一夜一天；那个白天被处决的玩家所属阵营落败（无人被处决则善良获胜）。”

#### [high] 女舍监 matron — roleCopy.ability
- **仓库现状**：roleCopy.ability: “每天可让两名玩家换座；除非你允许，玩家不能离开座位。”
- **百科依据**（女舍监）：百科角色能力：“每个白天，你可以选择至多三对玩家交换座位。玩家不能离开座位私聊。”角色简介：“女舍监可以交换两名玩家的座位，一天最多交换三次。”
- **影响**：两处规则错误：(1) 数字错——百科为每个白天至多三对玩家交换座位，roleCopy 只写“每天可让两名玩家换座”（即一对），少了三分之二的能力次数；(2) 条件错——百科的限制是“玩家不能离开座位私聊”，没有“除非你允许”的豁免条款，roleCopy 添加了百科不存在的女舍监许可机制，且丢失了“私聊”这一限制范围（百科允许玩家离开座位如上厕所，只是不能借此谈论游戏内容）。repoVariants 的 abilityText（中英）均与百科一致，仅 roleCopy 错误。
- **建议**：改为：“每个白天，你可以选择至多三对玩家交换座位；玩家不能离开座位私聊。”

#### [high] 酿酒师 man-tang-hong 变体 research
- **仓库现状**：research.possibleOutcomes (edition "Man Tang Hong"): "Chooses a player; if that player dies by execution, their team loses."；且该变体 inputKinds 为 ["player"]
- **百科依据**（酿酒师）：角色能力: "每个夜晚，你要选择一个镇民角色：当他下一次通过自身能力获取信息时，改为得知你给出的信息。"
- **影响**：man-tang-hong 包中酿酒师的 research 摘要描述的是一个完全不同的能力（选择玩家、其死于处决则其阵营落败），与同一变体自身的 abilityText（与百科一致的信息替换能力）自相矛盾，也与百科完全冲突。inputKinds 记为 player 也与"选择一个镇民角色"不符。按此摘要结算会把一次处决错误地判为终局。涉及 scripts: man-tang-hong。
- **建议**：重写该变体 research，改为信息替换类摘要（选择镇民角色、下一次自身能力获取信息时改为得知酿酒师给出的信息），inputKinds 改为 role+text。

#### [high] 入殓师 (rulianshi) — man-tang-hong 变体 research
- **仓库现状**：research.possibleOutcomes（scripts: man-tang-hong）："Learns the character of a player who died at night."；research.highRiskNotes："Night death source and role shown are ST-confirmed."
- **百科依据**（入殓师）：角色能力："如果你提名了恶魔且他死于这次处决，你会变成那个邪恶的恶魔。当剩余存活玩家小于等于四人时（旅行者除外），你失去能力。"
- **影响**：man-tang-hong 变体的规则摘要把入殓师描述成"得知夜晚死亡玩家角色"的信息型角色，与百科能力（提名并处决恶魔后自己变成邪恶恶魔、少于等于四人存活时失去能力）完全无关，也与同一变体自身的 abilityText 自相矛盾，疑似从其他角色（如送葬者类角色）误拷贝。按此摘要结算会完全误导说书人。
- **建议**：将 man-tang-hong 变体的 possibleOutcomes/highRiskNotes 重写为角色变化/阵营转变类摘要（参考同批 wu-yin-cang-sheng 变体的写法）。

#### [high] virgin roleCopy.ability 与 complexKnowledge.reminders
- **仓库现状**：roleCopy.ability: "首次被镇民提名时，提名者立刻被处决。"；complexKnowledge.reminders: "首次被镇民提名时，提名者立即被处决。"；trouble-brewing 变体 research.possibleOutcomes: "首次被镇民提名时，提名者立即被处决。"
- **百科依据**（贞洁者）：角色能力: "当你首次被提名时，如果提名你的玩家是镇民，他立刻被处决。"；角色简介: "当第一次被提名后，贞洁者会失去能力，即使发起提名者没有死亡，或者贞洁者处于醉酒或中毒状态。"
- **影响**：触发条件被压缩成"首次被镇民提名"，语义上暗示非镇民的首次提名不消耗能力、之后再被镇民提名仍可触发。百科规定：能力绑定在"首次被提名"这一事件上，无论提名者是什么身份（外来者/爪牙/恶魔提名则无事发生但能力照样耗尽，需放置"失去能力"标记）。按仓库文案结算会得出错误结果。
- **建议**：改为："当你首次被提名时，如果提名者是镇民，他立刻被处决；无论提名者是谁，首次被提名后你即失去能力。"

#### [high] 引路人 (yinluren)
- **仓库现状**：roleCopy.ability："每个夜晚，你要选择两名玩家：你会得知今晚是否有邪恶玩家的能力选择或影响了他们之中的玩家。"（sameAsAbilityText: true）
- **百科依据**（引路人）：角色能力："每个夜晚，你要选择除你以外的至多三名玩家：你会得知今晚是否有邪恶玩家的能力选择或影响了他们之中的玩家。"；角色简介："每个夜晚，引路人都可以选择一至三名玩家，但不能不进行选择，也不能选择自己。"
- **影响**：面向用户的中文文案把目标数量从"除你以外的至多三名玩家"写成了固定"两名玩家"：数字错误（至多三 vs 恰好二），同时丢失"除你以外"限制。按此文案结算会限制引路人的合法选择范围并允许选择自己，直接误导说书人。
- **建议**：将 roleCopy.ability 改为百科原文"每个夜晚，你要选择除你以外的至多三名玩家：……"。

#### [high] bountyhunter（赏金猎人）si-dong-fei-dong 的 research 虚构「+1 外来者」设置调整
- **仓库现状**：research.setupImpact（si-dong-fei-dong 变体）：「Bounty Hunter adds one Outsider and makes one Townsfolk evil. Templates avoid it unless storyteller deliberately chooses it.」
- **百科依据**（赏金猎人）：角色能力：「[会有一名镇民转变为邪恶阵营]」；角色简介：「如果赏金猎人初始就加入了本局游戏，在设置调整阶段，会有一名镇民加入邪恶阵营。」
- **影响**：百科的设置调整只有「一名（已在场的）镇民转为邪恶阵营」，完全不改变外来者数量。「adds one Outsider」会导致错误的板子构成（多放一个外来者/少放一个镇民）。同角色其他 scripts 的 research（xin-li-bo-yi、si-zui-chan-hui-ri、hu-du-zhi-zheng、fei-fan-ying-tian、chuan-qi-zhi-ye、wang-bu-jian-wang 等）均只写镇民转邪，与 si-dong-fei-dong 这条互相矛盾，进一步佐证其为错误。
- **建议**：删去「adds one Outsider」，保留「makes one Townsfolk evil」。

#### [high] cannibal 食人族 — playerMessageTemplates 直接告知获得的能力
- **仓库现状**：research.playerMessageTemplates："Current ability: {roleName}."（Jing Jue Gu Guo Shen Hua、Xin Ren Shi Lian 变体）；"You now have the ability of {role}."（何方教众 / GStone 21087 变体）
- **百科依据**（食人族）：角色简介："食人族不会被告知自己获得了什么能力。他必须自己弄明白。"；运作方式："现在食人族会拥有这名善良玩家的能力（不要告诉他具体的能力是什么）"
- **影响**：涉及 scripts：jing-jue-gu-guo-shen-hua、xin-ren-shi-lian、he-fang-jiao-zhong。这些消息模板会让 AI 说书人把食人族获得的具体角色能力直接告诉玩家，与百科明文规则相反（食人族只能通过被唤醒时机自行推断）。complexKnowledge.reminders 也没有"不得告知具体能力"的提示，无法兜底。
- **建议**：删除或改写这些模板为不透露具体角色的措辞（如仅按被借用角色的正常唤醒流程给信息），并在 complexKnowledge.reminders 增加"不要告诉食人族他获得了什么能力"。

#### [medium] 杂技演员 — shi-san-hang 变体 research.stateChanges 含与角色无关的错误状态变化
- **仓库现状**：shi-san-hang 变体 research.stateChanges："May apply or remove poisoned state." / "May apply drunk state or make an ability fail." / "May cause, prevent, delay, or disguise death."
- **百科依据**（杂技演员）：角色简介：「杂技演员会在找到醉酒或中毒的玩家时死亡。」运作方式：「如果被选择的玩家在当晚任何时刻醉酒或中毒，杂技演员死亡」——杂技演员的能力只导致其自身死亡，不会施加或移除任何醉酒/中毒状态，也不会阻止或伪装死亡。
- **影响**：该变体的状态变化摘要是与角色能力无关的模板文本：声称杂技演员可能施加/移除中毒、施加醉酒、阻止或伪装死亡，全部与百科规则冲突，也与同角色其余 7 个变体（仅记录自身死亡）互相矛盾，会误导 AI 的结算候选。仅涉及 script：shi-san-hang。
- **建议**：将 stateChanges 收敛为「杂技演员自身可能死亡」。

#### [medium] 咖啡师 (barista) — si-dong-fei-dong research
- **仓库现状**：si-dong-fei-dong 包 research.identityChanges：「May change character or gain/replace an ability.」；research.playerMessageTemplates：「You are now {role}.」
- **百科依据**（咖啡师）：角色能力：「……1）一名玩家解除并免受醉酒和中毒影响，且会得知正确信息；2）一名玩家的能力可以生效两次。该玩家会得知是哪个效果。」（全文无任何改变角色的效果。）
- **影响**：咖啡师的两个效果都不改变任何玩家的角色，百科通篇没有角色变化路径；si-dong-fei-dong 包的 research 却声称可能「change character」并提供「You are now {role}」话术模板，会误导 AI 为咖啡师草拟身份变更/错误私聊。其他包（如 catfishing/snv：「Storyteller chooses one of two effects and tells the target which one.」）无此问题，也构成包间描述矛盾。
- **建议**：删除 si-dong-fei-dong 包中咖啡师的 identityChanges 与「You are now {role}」模板，改为与百科一致的清醒健康/生效两次描述。

#### [medium] 教父 research 写成得知“未在场”外来者
- **仓库现状**：research.possibleOutcomes：「Knows out-of-play Outsiders; if an Outsider died today, may kill tonight; setup changes Outsider count.」（edition E Mo Mi Cheng，scripts e-mo-mi-cheng、xin-li-bo-yi、da-quan-zai-wo、yao-wu-yin-xin）
- **百科依据**（教父）：角色能力：「在你的首个夜晚，你会得知有哪些外来者角色在场。」运作方式：「向教父展示所有在场的外来者的角色标记。」
- **影响**：规则摘要把首夜信息对象写反成 out-of-play（未在场）外来者，与百科（在场外来者）以及同一变体自身的中文 abilityText 都矛盾。按此摘要给信息会完全给错，属于对象错误。
- **建议**：改为「Knows in-play Outsiders」。

#### [medium] 混沌 (hundun)
- **仓库现状**：research.teamChanges（shi-yan-jiao-chi、wu-yin-cang-sheng）："Check whether target is adjacent Townsfolk."；research.possibleOutcomes（shi-yan-jiao-chi）："if adjacent Townsfolk is killed, good players are poisoned until next dusk"
- **百科依据**（混沌）：角色简介："如果该玩家的角色是镇民，并且是与混沌最邻近的镇民玩家，混沌的中毒效果就会被触发"、"只要该玩家是混沌最邻近的两名镇民玩家之一"；范例："混沌的左侧是告密者，再左侧是卖花女孩。混沌杀死了卖花女孩，所有善良玩家中毒到下个黄昏。"
- **影响**：百科对"邻近的镇民"的官方解释是"最邻近的镇民玩家"——即两侧各自最近的镇民，中间隔着非镇民座位也算（范例中隔一个告密者的卖花女孩触发了中毒）。research 摘要写成 "adjacent Townsfolk"（紧邻座位的镇民），会导致说书人在紧邻座位不是镇民时错误地不触发集体中毒。
- **建议**：将摘要改为 "nearest Townsfolk neighbour (skipping non-Townsfolk seats)"，并补充范例说明。

#### [medium] 月之子 complexKnowledge.aiCan
- **仓库现状**：complexKnowledge.aiCan: "提醒夜晚核对阵营"（另 requiredContext: "目标是否善良" 未说明判定时点）
- **百科依据**（月之子）：提示标记·放置条件: "在月之子选择时不论月之子是否中毒醉酒，只判断他选择的玩家是否善良来决定是否放置标记。（因为月之子的能力是回溯型能力）"；角色简介: "如果月之子在选择莽夫时，莽夫是善良的，则无论莽夫的阵营在夜晚如何变化，月之子都会杀死莽夫。"
- **影响**：百科明确目标阵营以"月之子做出公开选择的那一刻"为准（回溯型能力），之后夜晚阵营再变化也不影响结果（莽夫例）。知识库让 AI"夜晚核对阵营"会把判定时点错移到夜晚结算时，在阵营中途变化（莽夫、舞蛇人等）场景下得出相反结算。
- **建议**：改为"在月之子公开选择的当下核对目标阵营并记录，夜晚按记录结算，不再以夜间阵营为准"；同时可补充醉酒中毒按夜晚行动时点判断的细节。

#### [medium] 麻脸巫婆 (pithag) wu-yin-cang-sheng 变体 research.teamChanges
- **仓库现状**：research.teamChanges (edition "Wu Yin Cang Sheng", scripts: wu-yin-cang-sheng): "Alignment follows new role unless ST/source says otherwise."
- **百科依据**（麻脸巫婆）：运作方式："（你可能需要倒置角色标记，表示玩家阵营与该角色原本阵营相反。同样你可能也需要通过手势来提醒玩家，他的阵营没有改变。）"；提示与技巧："你的能力会改变玩家的角色，但不会改变他们的阵营。"
- **影响**：百科明确：麻脸巫婆只改变角色、不改变阵营（善良玩家变成女巫仍是善良爪牙）。该 research 摘要写成"阵营默认跟随新角色"，方向完全相反，会误导说书人把被改造玩家改成新角色的原生阵营。同一数据包内 complexKnowledge.reminders 写的是"通常不自动改阵营"，与该变体互相矛盾（涉及 scripts: wu-yin-cang-sheng）。
- **建议**：改为 "Alignment does NOT change with the new role; only the character changes"，与 complexKnowledge 保持一致。

#### [medium] 珀 (po) complexKnowledge.reminders 与多个 research 摘要（三杀写成"可选"）
- **仓库现状**：complexKnowledge.reminders: "上次空刀后本夜可选择 3 名玩家死亡。"；research.stateChanges (A Grimm Chorus): "可选择不杀；若上一夜不杀，本夜可杀 3 人。"；research.possibleOutcomes (Xin Li Bo Yi): "May choose no one to gain three attacks next night, or choose up to three after charging."；research.possibleOutcomes (Bad Moon Rising): "若上一晚空刀，本晚可选择三名玩家死亡。"
- **百科依据**（珀）：角色简介："当要求珀选择三名玩家时，他必须要选择。珀不能再次不选择任何人。"；"如果珀在上一个夜晚不选择任何人时处于醉酒或中毒，当晚珀仍然能够选择三名玩家。"
- **影响**：百科规定充能后的三杀是强制的：必须选择恰好三名玩家，不能再次空刀。仓库多处摘要用"可选择/可杀/choose up to three"的可选语气（xin-li-bo-yi 的 "up to three" 还暗示可少于三人），会误导说书人允许珀连续空刀或少选目标。涉及 scripts: bad-moon-rising、church-of-spies、a-grimm-chorus、xin-li-bo-yi 及共享 complexKnowledge。另一遗漏：空刀之夜醉酒中毒不影响下一夜三杀，各摘要均未提及。
- **建议**：统一改为"上次空刀后，本夜必须选择三名玩家（不能再次空刀，不能少选）"，并补充空刀夜醉酒中毒不影响充能的提醒。

#### [medium] pukka（普卡）/ si-dong-fei-dong 板子包
- **仓库现状**：research.identityChanges（si-dong-fei-dong）："May change character or gain/replace an ability."；playerMessageTemplates："You are now {role}."
- **百科依据**（普卡）：角色能力：「每个夜晚，你要选择一名玩家：他中毒。上个因你的能力中毒的玩家会死亡并恢复健康。」；角色信息：「角色能力类型：中毒、回溯型能力」。
- **影响**：普卡的能力只有中毒与延迟死亡，不涉及任何角色/能力变更。该包给普卡挂上了"可改变角色/获得替换能力"的 identityChanges 和"You are now {role}"的玩家消息模板，属于脚本级模板错误套用到角色上；AI 若据此生成"你现在是X角色"的私信将是纯粹的规则错误。
- **建议**：移除 si-dong-fei-dong 包中普卡的 identityChanges 条目与该消息模板。

#### [medium] preacher（传教士）/ shen-fen-wei-ji 板子包
- **仓库现状**：research.identityChanges（shen-fen-wei-ji）："May grant, replace, fake, swap or transform an ability/character."；playerMessageTemplates："If adopted, storyteller may tell the target their new or perceived role information."
- **百科依据**（传教士）：角色能力：「每个夜晚，你要选择一名玩家：如果你选中了爪牙，他会得知被传教士选中。所有被你选中的爪牙失去能力。」——只造成爪牙失去能力，不授予、交换或转变任何角色/能力。
- **影响**：传教士的效果仅为"爪牙失去能力"（该包 stateChanges 里已正确列出 ability-loss）。identityChanges 声称可"授予/替换/伪造/交换/转变角色或能力"并配套"告知目标新角色信息"的消息模板，与百科能力完全不符，可能诱导助手提出角色转变类结算建议。
- **建议**：删除该包传教士的 identityChanges 条目及对应消息模板。

#### [medium] 掮客 (qianke) - sheng-shi-qi-wen 变体 research
- **仓库现状**：research.identityChanges："May grant, replace or transform an ability/character."；research.playerMessageTemplates："If adopted, storyteller may tell the target their new ability/role information."
- **百科依据**（）：掮客.wiki："使用能力被掮客转移目标的玩家不会得知自己的选择目标被更换。掮客也不会得知是否有玩家因此被转移了选择的目标。"掮客能力仅为"更换选择目标"，全文无任何授予/替换/变化角色能力的内容。
- **影响**：掮客的能力只是在夜晚转移他人能力的选择目标，不涉及授予、替换或变形任何能力/角色，identityChanges 的描述是错误的。playerMessageTemplates 更是直接违反百科的保密规则——被转移目标的玩家和掮客本人都不能得知发生了转移，说书人不应向目标透露任何"新能力/角色信息"。照此提示操作会泄露关键隐藏信息。
- **建议**：清空该变体的 identityChanges，把 playerMessageTemplates 改为"不向任何玩家透露转移发生"类提醒。

#### [medium] shaxing / zhuo-yue-bi-fang 变体 research.highRiskNotes
- **仓库现状**：research.highRiskNotes（scripts: zhuo-yue-bi-fang）: "Other-night source reminder: 如果煞星死亡，将与其邻近的存活善良玩家之一标记为死亡。"
- **百科依据**（煞星）：百科角色能力："如果你死亡，当晚与你邻近的存活玩家之一可能会死亡。"；角色简介："因此死亡的玩家可能是善良玩家，也有可能是邪恶玩家。"、"如果煞星死亡，由说书人来决定煞星的能力是否触发"。
- **影响**：该夜间提醒把目标限定为"存活善良玩家"，与百科（可善可恶）冲突，也与本变体自身的 abilityText（无善良限定）自相矛盾；且"将……标记为死亡"丢失了"可能"（由说书人决定是否触发）的裁量语义，读作强制结算。
- **建议**：把提醒改为"如果煞星死亡，说书人可决定使其邻近的一名存活玩家（善恶均可）死亡"。

#### [medium] snakecharmer / 舞蛇人（hao-shi-duo-mo 变体 research）
- **仓库现状**：research.highRiskNotes: "Snake Charmer/Demon identity and alignment swap happens only after ST confirmation; the new Snake Charmer is drunk and does not use the Demon ability that night."（edition: Hao Shi Duo Mo，scripts: hao-shi-duo-mo）
- **百科依据**（舞蛇人）：角色能力："每个夜晚，你要选择一名存活的玩家：如果你选中了恶魔，你和他交换角色和阵营，然后他中毒。"；角色简介："当选中一名恶魔时，舞蛇人变成那个恶魔并转为邪恶，那名恶魔则转为善良并永久中毒。"
- **影响**：该 research 摘要把新舞蛇人（原恶魔）的状态写成 drunk（醉酒），而百科与该变体自身的 abilityText 都明确是中毒（且为永久中毒）。醉酒与中毒在结算上是两种不同状态（影响状态追踪、相关检测/解毒类角色的结算）。另外 "does not use the Demon ability that night" 的主语是 new Snake Charmer，但新舞蛇人（原恶魔）已不再拥有恶魔能力，此句对象混乱，容易误导 AI 说书人。
- **建议**：把 drunk 改为 poisoned（永久中毒，直到该角色死亡或离场才移除），并删除或改写 "does not use the Demon ability that night" 这句主语错误的表述。

#### [medium] soldier / 士兵（xue-se-feng-hua 变体 research）
- **仓库现状**：research.possibleOutcomes: "May involve hidden identity, gained ability, role change or ability transfer."；research.identityChanges: "Identity, shown role, gained ability and role-change effects are confirmed manually."（edition: Xue Se Feng Hua，scripts: xue-se-feng-hua）
- **百科依据**（士兵）：角色能力："恶魔的负面能力对你无效。"；角色简介："士兵无法因为恶魔的能力而死去。"——士兵是纯保护/免死类角色（角色能力类型：保护、免死），百科中没有任何身份变化、获得能力或能力转移的效果。
- **影响**：该变体的 research 摘要完全是身份变化类角色的模板文案，与士兵的实际规则（保护类）不符：它没有记录任何保护/免死结算要点，反而暗示士兵可能涉及身份、角色变化和能力转移。这与同批其他士兵变体（如 si-zui-chan-hui-ri 的 "Immune to negative Demon abilities" / "May block Demon-caused death or harm"）的正确摘要相互矛盾，会给依赖该摘要的 AI 说书人提供错误的结算方向。
- **建议**：将 xue-se-feng-hua 变体的 research 改写为保护类摘要（免疫恶魔负面能力、可阻止恶魔造成的死亡/伤害；中毒/醉酒时失效），删除身份变化类模板文案。

#### [medium] 梼杌 首夜行动提醒错误（bing-gong-ban-shi 变体）
- **仓库现状**：research.highRiskNotes（scripts: bing-gong-ban-shi）: "First-night source reminder: ?（清清自编）让梼杌选择一名玩家。标记那名玩家死亡。如果梼杌选择了自己，在一名存活且具有能力的爪牙身边放置\"失去能力\"标记。"
- **百科依据**（梼杌）：运作方式："在游戏中的首个夜晚，将要唤醒恶魔提供恶魔信息时，不要唤醒梼杌。除了首个夜晚外的每个夜晚，唤醒梼杌，并让他指向任意一名玩家。"（能力文本为"每个夜晚*"，即首夜不行动）
- **影响**：该变体把梼杌的杀人行动标注为首夜提醒（First-night source reminder），与百科"每个夜晚*"（首夜不行动）及运作方式"首夜不要唤醒梼杌"直接冲突，会误导 AI 在第一夜就让梼杌选人杀人。这是行动时机层面的错误，不是夜序顺位问题。
- **建议**：将该条提醒归入 other-night（非首夜）提醒，首夜仅保留"不要唤醒梼杌、不提供恶魔信息"。

#### [medium] 扎恩(xaan) roleCopy.prompt 用“当前”外来者数量
- **仓库现状**：roleCopy.prompt: 「X 按当前外来者数量核对；中毒范围只做提醒，不批量自动改状态。」；complexKnowledge.requiredContext 只写「外来者数量」、reminders 写「外来者数量为 X；第 X 夜所有镇民中毒直到黄昏。」均未限定“初始”
- **百科依据**（限）：角色能力：「在等同于初始外来者数量的夜晚，所有镇民玩家中毒直到下个黄昏。」角色简介：「如果在游戏过程中外来者数量发生变化，大限将至的夜晚也仍然取决于初始设置的外来者数量。」
- **影响**：条件错误：prompt 指示说书人按“当前”外来者数量核对 X，与百科明确的“初始设置的外来者数量”冲突。百科范例：11 人局初始只有一名外来者，首夜镇民集体中毒；第二夜麻脸巫婆创造帽匠使外来者变为两名，但所有玩家保持健康——若按“当前数量”执行会在第二夜再次判定生效夜，结算完全错误。roleCopy.ability 与 complexKnowledge 各处也都缺“初始”限定。
- **建议**：prompt/reminders/requiredContext 统一改为“初始外来者数量”，并注明游戏中途外来者增减不改变生效夜。

#### [medium] 寡妇 bao-yue-chu-sheng 变体把中毒目标限定为善良玩家
- **仓库现状**：research.highRiskNotes（scripts: bao-yue-chu-sheng）: 「Widow sees the grimoire and poisons one good player; poisoned state remains candidate-only.」
- **百科依据**（寡妇）：角色能力：「在你的首个夜晚，你能查看魔典并选择一名玩家：他中毒。」（不限阵营；提示与技巧甚至写「对你自己投毒来隐藏寡妇在场。一个中毒的寡妇没有能力，因此善良阵营不会得知寡妇在场。」）
- **影响**：对象错误：寡妇可选择任意一名玩家（包括邪恶玩家和她自己，自毒是百科明确记载的合法玩法），该注记把目标限定为 one good player，会误导说书人拒绝寡妇的合法选择。同数据包其他板子的同角色摘要均正确写 choose/poisons one player。
- **建议**：把该条改为 poisons one player（不限阵营）。

#### [medium] cerenovus 洗脑师 — Ying Su Hua Kai 变体疯狂持续时间错误
- **仓库现状**：research.playerMessageTemplates："You are mad as {roleName} until tomorrow dusk."（Ying Su Hua Kai 变体，script ying-su-hua-kai）
- **百科依据**（洗脑师）：角色能力："他明天白天和夜晚需要“疯狂”地证明自己是这个角色"；提示标记"疯狂"移除时机："在下一个夜晚的黎明时"
- **影响**：百科规定疯狂覆盖明天的白天和夜晚（至下一个黎明才移除），且百科运作方式明确"在下一个白天或夜晚"都可因不够疯狂被处决。模板写成 until tomorrow dusk（到明天黄昏为止）会把夜晚时段排除，时限错误。
- **建议**：改为 "until dawn after tomorrow night"（直到下个夜晚结束/黎明）之类与百科一致的表述。

#### [medium] 流莺 (harlot) Lunar Eclipse 变体 research 错加“若目标邪恶”条件
- **仓库现状**：research.possibleOutcomes（Lunar Eclipse 变体，scripts: lunar-eclipse）: “若目标同意，得知其角色；若目标邪恶，双方可能死亡。”
- **百科依据**（流莺）：角色简介: “如果揭露的话，说书人可以决定流莺和该玩家是否在今晚一起死亡。”；运作方式: “如果你决定让两名玩家一起死——将“死亡”提示标记分别放在两者的角色标记旁。”
- **影响**：与 roleCopy 相同的错误：双死没有“目标邪恶”前提，是说书人自由裁量。该变体的 abilityText（官方英文）本身正确，但 research 摘要会把错误条件喂给结算逻辑，且很可能是 roleCopy 错误文案的来源。
- **建议**：改为“若目标同意，流莺得知其角色；说书人可裁量让两人同晚死亡（与目标阵营无关）”。

#### [medium] 鹰身女妖 (harpy) si-dong-fei-dong/wu-he-you-zhi-xiang 变体玩家消息模板写错疯狂对象
- **仓库现状**：research.playerMessageTemplates（“似懂非懂 / GStone 21179”变体，scripts: si-dong-fei-dong, wu-he-you-zhi-xiang）: “You need to be mad that you are {role}.”
- **百科依据**（鹰身女妖）：角色能力: “明天第一名玩家需要“疯狂”地证明第二名玩家是邪恶的”；运作方式: “唤醒标记了“疯狂”的玩家……然后指向标记了“第二名”的玩家。”
- **影响**：模板把疯狂义务写成“疯狂地相信自己是{role}”（这是洗脑师式疯狂），而鹰身女妖的疯狂要求是“第一名玩家疯狂证明第二名玩家是邪恶的”。用该模板起草夜间告知会向玩家传达完全错误的疯狂内容，直接影响后续是否触发死亡的判定。同变体 teamChanges 里的“May involve alignment, registration or win/loss interpretation”也与鹰身女妖能力无关。
- **建议**：模板改为“You must be mad that {seatB} is evil tomorrow.”（其他多个变体已用正确表述）。

#### [low] 侍臣 (courtier)
- **仓库现状**：research.highRiskNotes（chou-hai-ni-xing / 仇海溺行）："First-night source reminder: 侍臣可以选择一个角色。如果他这么做了，标记侍臣失去能力，标记被选择的角色所对应的玩家醉酒。之后的夜晚无需再唤醒侍臣。"（Other-night 同文）
- **百科依据**（侍臣）：百科运作方式："将侍臣的'醉酒1'放置到该玩家的角色标记旁。在下一夜，将'醉酒1'替换成'醉酒2'。再下一夜，将'醉酒2'替换成'醉酒3'。再下一夜的黄昏，移除'醉酒3'，且侍臣失去能力。"角色简介："如果侍臣使一个角色醉酒，但是侍臣变得醉酒或中毒，那名醉酒的玩家会重新恢复清醒。"
- **影响**：该包引用的提醒与百科结算流程矛盾：(1) 时机错——提醒要求在侍臣使用能力当晚立即"标记侍臣失去能力"，而百科规定失去能力标记在醉酒3之后的黄昏才放置（提前判定失去能力会连带影响目标恢复清醒、维齐尔/召唤师相克等结算）；(2) 遗漏硬性时限——提醒只写"标记被选择的角色所对应的玩家醉酒"，未提"三天三夜"的持续时间与到期移除，配合"之后的夜晚无需再唤醒侍臣"易被执行为永久醉酒。与同角色其他包（bad-moon-rising、e-mo-mi-cheng、sheng-ri-yan-hui、hu-yan-luan-yu 均明确 3 夜 3 天）也不一致。
- **建议**：在 chou-hai-ni-xing 的 research 中补充：醉酒持续三天三夜、到期黄昏才标记失去能力；或在引用源提醒旁注明其与官方结算流程的差异。

#### [low] legion（军团，bao-meng-mi-tuan）setup 描述
- **仓库现状**：research.setupImpact（bao-meng-mi-tuan 变体）：「[多数爪牙可成为军团相关设置]」
- **百科依据**（军团）：军团.wiki 角色能力：「[多数玩家为军团]」角色简介：「如果军团在场，推荐将在场善良和邪恶玩家的数量在通常的数量上进行反转……非军团的玩家可以是镇民也可以是外来者。」
- **影响**：该变体把设置括号写成了「多数爪牙」，而百科（及同批其他变体如 liu-gong-fen-dai、ying-su-hua-kai、shuo-shu-ren-zhi-nu 的「[半数以上玩家为军团]」）都是对全体玩家的构成要求，与爪牙数量无关。这条 setupImpact 与其他包互相矛盾且会误导板子设置。涉及 scripts: bao-meng-mi-tuan。
- **建议**：将该变体 setupImpact 更正为「[多数玩家为军团]」或与其他包一致的表述。

#### [low] 数学家 mathematician — yao-wu-yin-xin 包 research.possibleOutcomes
- **仓库现状**：research.possibleOutcomes（edition: Yao Wu Yin Xin）: “Learns how many players had abilities malfunction since dusk due to another character ability.”
- **百科依据**（数学家）：百科角色能力：“每个夜晚，你会得知……未正常生效。（从上个黎明到你被唤醒时）”运作方式：数学家统计的是从上个黎明起累计放置的“未正常生效”标记数量。
- **影响**：统计窗口时机写错：百科为“从上个黎明到数学家被唤醒时”，包含整个白天发生的异常（如白天触发的能力失效）；该 research 写成 “since dusk”（自黄昏起），会漏掉白天时段的异常事件，导致给数学家的数字偏小。同一 variant 的 abilityText（“从上个黎明到你被唤醒时”）是正确的，research 摘要与其自身 abilityText 也互相矛盾。其他包（如 Man Tian Guo Hai）正确写作 “since dawn”。
- **建议**：将 “since dusk” 改为 “since the previous dawn (up to when the Mathematician wakes)”。

#### [low] shugenja / wu-he-you-zhi-xiang 变体 research
- **仓库现状**：research.possibleOutcomes（scripts: wu-he-you-zhi-xiang）: "May create a win/loss candidate."；teamChanges: "May involve alignment, registration or win/loss interpretation."；highRiskNotes: "Win/loss is a candidate reminder; storyteller declares the result."
- **百科依据**（修行者）：百科角色能力："在你的首个夜晚，你会得知距离最近的邪恶玩家位于你的顺时针还是逆时针方向。如果两侧的邪恶玩家与你距离相等，你得知的信息由说书人决定。"（纯首夜获取信息能力，无任何胜负判定效果）
- **影响**：该变体的规则摘要与修行者能力完全不符：修行者只是首夜得知方向信息，不产生任何 win/loss 候选或胜负判定；这些字段疑似从其他角色复制的模板。同时该摘要完全没有覆盖方向信息、等距由说书人裁量等真正的结算要点（同批其他变体均已覆盖）。
- **建议**：重写该变体 research：possibleOutcomes 记录顺/逆时针两种信息与等距裁量，删去 win/loss 相关表述。

### 3.2 能力文本不符

#### [high] 哈迪寂亚 (al-hadikhia / alhadikhia) — 「你要选择」应为「你可以选择」
- **仓库现状**：两个 roleId 的 roleCopy.ability 及绝大多数 abilityText：「每个夜晚*，你要选择三名玩家（所有玩家都会得知你选了谁）：他们分别秘密决定自己的生死，然后如果他们都存活则都死亡。」
- **百科依据**（哈迪寂亚）：角色能力：「每个夜晚*，你可以选择三名玩家……」角色简介：「哈迪寂亚可以不进行选择，当这种情况发生时，说书人不会宣布哈迪寂亚在场并选择玩家的播报，夜晚继续进行，没有任何迹象表明恶魔还活着。」
- **影响**：百科为「可以」（可放弃选择，且不选择时说书人不发任何播报、当晚无人因此死亡）；仓库文案改成「你要选择」（强制），会误导说书人强迫恶魔每晚必须选择、并总是发布播报。此外板子包之间互相矛盾：bing-gong-ban-shi 变体保留「你可以选择」，与 ye-ban-kuang-huan、huang-liang-yi-meng-lao-hua-deng、niu-zhuan-qian-kun、shen-fen-wei-ji、wang-bu-jian-wang、zhi-shou-zhe-tian、tian-tang-hua-yuan 的「你要选择」在规则语义上冲突。
- **建议**：统一改为「你可以选择」，并在 research/complexKnowledge 中补充「不选择时不发播报、当晚无人因此死亡」。

#### [high] 半兽人 (ban_shou_ren)
- **仓库现状**：abilityText 及 roleCopy.ability（scripts: sheng-dan-ye-jing-hun，sameAsAbilityText=true）：「每个夜晚*，你要选择一名存活的玩家：如果他是善良的，他死亡，并且当晚不会再有其他玩家死亡。」
- **百科依据**（半兽人）：角色能力：「每个夜晚*，你要选择一名存活玩家：如果他是善良的，他死亡，并且当晚恶魔不会造成死亡。」「会有一名善良玩家始终被当作邪恶阵营。」角色简介：「如果半兽人选择的玩家是邪恶玩家，那名玩家不会死亡，并且恶魔可以造成死亡。」「一名善良玩家始终被当作邪恶阵营。……因此半兽人无法杀死这名玩家。」
- **影响**：两处规则语义差异：(1) 死亡阻断范围——百科现行版本只阻止「恶魔造成的死亡」，其他来源的死亡照常结算；仓库文本「当晚不会再有其他玩家死亡」会错误地阻断一切其他死亡（对应旧版 Lycanthrope 文本）。(2) 仓库完全缺失第二句能力「会有一名善良玩家始终被当作邪恶阵营」——该条款影响检测类信息，且使半兽人无法杀死该玩家（百科范例：半兽人攻击被标记的狂热者不致死），同时对应「失足」提示标记的设置流程。两者都会直接改变结算结果。
- **建议**：若圣诞夜惊魂板子刻意使用旧版文本，应在 research 中注明版本差异；否则将 abilityText/roleCopy 更新为百科现行两句式文本，并补充首夜「失足」标记逻辑。

#### [high] 乞丐 (beggar) — roleCopy.ability
- **仓库现状**：roleCopy.ability：「你必须公开索要投票标记；没有标记时，你的票不算。」
- **百科依据**（乞丐）：角色能力：「你只能使用投票标记才能投票。」「死亡的玩家可以将他的投票标记给你，如果他这么做，你会得知他的阵营。」「你不会中毒和醉酒。」运作方式：「在白天时，一个已死亡的玩家可以宣布将他的投票标记交给乞丐。」
- **影响**：面向用户的中文文案有三处硬伤：1）凭空添加了「必须公开索要」这一百科不存在的条件——百科中是已死亡玩家自行决定是否宣布交出标记，乞丐无任何『索要』义务；2）完全遗漏「只有死亡玩家可给出标记、给出后乞丐会得知其阵营」这一核心信息能力；3）完全遗漏「你不会中毒和醉酒」这一影响结算的硬规则（乞丐免疫醉酒中毒）。此外「你的票不算」与百科「全程不能举手（不能投票）」也有细微出入。各板子包的 abilityText 本身与百科一致，问题仅在 roleCopy。
- **建议**：roleCopy.ability 改为贴合百科三句能力文本：只能用投票标记投票；死亡玩家可将标记给你且你会得知其阵营；你不会中毒和醉酒。删除「必须公开索要」。

#### [high] 咖啡师 (barista) — roleCopy.ability
- **仓库现状**：roleCopy.ability：「每晚选择一名玩家；其能力明天可能重复触发，或变得清醒健康并获得真实信息。」
- **百科依据**（咖啡师）：角色能力：「每个夜晚，直至下个黄昏，由说书人二选一：1）一名玩家解除并免受醉酒和中毒影响，且会得知正确信息；2）一名玩家的能力可以生效两次。该玩家会得知是哪个效果。」角色简介：「每个夜晚由说书人选择咖啡师的角色能力生效，和受到该能力影响的玩家。咖啡师不会知道说书人选择了谁或者哪一项能力，但受影响的玩家会知道。」
- **影响**：行为主体错误：roleCopy 写成咖啡师玩家「每晚选择一名玩家」，而百科明确是由说书人选择受影响玩家和生效的效果，咖啡师本人不知情。同时遗漏「该玩家会得知是哪个效果」这一必须执行的告知步骤；「明天可能重复触发」的时机也不对——效果从当晚持续到下个黄昏，能力生效两次可发生在当晚（如夜间行动角色当晚被二次唤醒）。这些会直接误导夜间结算流程。（各 abilityText 本身为官方中/英文，与百科一致，无问题。）
- **建议**：roleCopy.ability 改写为：每个夜晚由说书人二选一——使一名玩家清醒健康且得知正确信息，或使其能力生效两次（持续到下个黄昏）；受影响玩家会得知是哪个效果。

#### [high] 变脸师 (bian_lian_shi / bianlianshi) — abilityText / roleCopy.ability
- **仓库现状**：两个 roleId（bian_lian_shi、bianlianshi）的全部 abilityText 及两条 roleCopy.ability 均为：「每个白天，如果你“疯狂”地证明自己是一个善良角色（与之前不同），你会在当晚获得那个角色的能力，直到下个黄昏。」
- **百科依据**（变脸师）：角色能力：「……你可能会在当晚获得那个角色的能力，直到下个黄昏。」运作方式：「如果说书人决定让变脸师获得能力，在当晚将变脸师角色标记更换为……」以及说书人指引「通常来说，让变脸师在一局游戏中获得1-2次能力是比较合适的」。
- **影响**：仓库文本把百科的「你可能会……获得」写成「你会……获得」，删掉了「可能」，把说书人可自由裁量是否授予能力的规则改成了疯狂证明成功即必然获得。百科明确授能与否由说书人决定（且建议一局仅授予1-2次），该条件错误会误导 AI 说书人每天自动授能。涉及 roleId bian_lian_shi（script: jing-jue-gu-guo-shen-hua）与 bianlianshi（scripts: huang-liang-yi-meng-lao-hua-deng、yi-chu-hao-xi-lao-hua-deng、hu-yan-luan-yu）及两者的 roleCopy（均 sameAsAbilityText: true）。research 层的「Madness judgement and temporary ability are ST-confirmed / ST discretio
- **建议**：abilityText 与 roleCopy 补回「可能」：「……你可能会在当晚获得那个角色的能力，直到下个黄昏。」

#### [high] 打更人 (dagengren)
- **仓库现状**：abilityText（scripts: gui-jue-yi-xiang, sheng-shi-qi-wen）及 roleCopy.ability："每个夜晚*，你要猜测今晚死亡的玩家与你的最近距离。如果你猜测正确，这些玩家今晚不会死亡，但你可能会死亡。"
- **百科依据**（打更人）：百科角色能力："每个夜晚*，你要猜测今晚首个死亡的玩家与你的距离。如果你猜测正确，则除你以外的所有玩家今晚不会死亡，但你可能会死亡。"角色简介进一步明确："如果打更人猜测正确，那么在当晚，除了打更人以外的其他玩家都不会死亡。"
- **影响**：两处语义错误：(1) 猜测对象错——百科是猜"今晚首个死亡的玩家与你的距离"，仓库文本改成了猜"今晚死亡的玩家与你的最近距离"，当首个死亡者距离3、后续死亡者距离2时，两种规则判定的正确猜测不同；(2) 保护范围错——百科规定猜对后"除你以外的所有玩家今晚不会死亡"（百科范例中距离2和距离3的两名被攻击玩家都存活），仓库文本写成"这些玩家今晚不会死亡"，即仅保护与猜测距离相符的玩家。roleCopy.ability 原样沿用了这段错误文本且 sameAsAbilityText 为 true，直接面向用户。
- **建议**：将 gui-jue-yi-xiang / sheng-shi-qi-wen 的 abilityText 及 roleCopy.ability 改为百科原文："每个夜晚*，你要猜测今晚首个死亡的玩家与你的距离。如果你猜测正确，则除你以外的所有玩家今晚不会死亡，但你可能会死亡。"

#### [high] daoshi / repoVariants[].abilityText + roleCopy.ability + research
- **仓库现状**：abilityText（全部4个变体：chu-chu-mao-lu-lao-hua-deng、zhui-chai-qi-yuan-lao-hua-deng、gui-jue-yi-xiang、shi-san-hang）及 roleCopy.ability："每个夜晚*，你要选择一名玩家：如果他是恶魔，你死亡，并且当晚不会再有其他玩家死亡。"；research.possibleOutcomes："Chooses a player; if target is Demon, Dao Shi dies and no other players die tonight."；research.stateChanges："Dao Shi death and night death-prevention lock."
- **百科依据**（道士）：角色能力："每个夜晚*，你要选择一名玩家：如果你选中了恶魔，你死亡，然后他醉酒直到下个黎明。"；角色简介："当选中一名恶魔玩家时，道士死亡，然后那名恶魔玩家在当晚醉酒。""醉酒只会维持到天亮前"；运作方式："将'醉酒'提示标记放置到恶魔玩家的角色标记旁。在黎明，移除'醉酒'提示标记。"
- **影响**：结算效果完全不同。百科版本：选中恶魔后道士死亡、该恶魔醉酒直到下个黎明（醉酒恶魔攻击无效，但不阻止其他来源的死亡，且醉酒还影响恶魔的其他能力，如百科范例中醉酒的沙巴洛斯无法复活玩家）。仓库版本：道士死亡并锁定"当晚不会再有其他玩家死亡"，这是一个全局死亡锁，会错误地阻止刺客等其他来源的死亡，也不会让恶魔进入醉酒状态。仓库所有变体、roleCopy 和 research 摘要一致地采用了这个与百科冲突的规则（可能是该自制角色的旧版本文本）。另外百科的关键细节"如果道士选中了恶魔，但道士的死亡由于某些原因被阻止，恶魔玩家当晚不会醉酒"在仓库任何字段中均未体现。
- **建议**：将全部变体的 abilityText 与 roleCopy.ability 更新为百科文本"……如果你选中了恶魔，你死亡，然后他醉酒直到下个黎明"，并重写 research 摘要为"恶魔醉酒到黎明"而非"死亡锁"，同时补充"道士死亡被阻止则恶魔不醉酒"这一硬条件。

#### [high] deviant / roleCopy.ability
- **仓库现状**：roleCopy.ability："如果你很有趣，可能随时被处决。"（sameAsAbilityText: false）
- **百科依据**（怪咖）：角色能力："如果你表现得很有趣，当天你不能被流放。"；运作方式："如果怪咖被流放了，你可以宣布怪咖依旧存活。"
- **影响**：面向用户的中文文案把能力写反了：百科是"表现有趣→当天不能被流放（流放不死）"的免死能力，roleCopy 却写成"很有趣→可能随时被处决"，既把保护效果改成了负面效果，又把"流放"（旅行者的离场机制）误写为"处决"。仓库变体中的英文官方文本 "If you were funny today, you cannot die by exile." 与百科语义一致，问题仅在 roleCopy。
- **建议**：将 roleCopy.ability 改为"如果你表现得很有趣，当天你不能被流放（流放不死）。"

#### [high] 镜像双子 (eviltwin)
- **仓库现状**：roleCopy.ability："你和一名善良玩家互相知道对方；若善良双子被处决，邪恶胜利。"
- **百科依据**（镜像双子）：百科"角色能力"："你与一名对立阵营的玩家互相知道对方是什么角色。如果其中善良玩家被处决，邪恶阵营获胜。如果你们都存活，善良阵营无法获胜。"
- **影响**：面向用户的 roleCopy 遗漏了第三句硬性胜负条件"如果你们都存活，善良阵营无法获胜"——这是结算级条件（双子均存活时即使恶魔被处决游戏也继续，百科："此时即使恶魔死亡，游戏也会继续"），漏掉会直接导致错误判定游戏结束。另有两处漂移："一名善良玩家"应为"一名对立阵营的玩家"（百科明确善良玩家变成镜像双子时其对立双子是邪恶玩家）；"互相知道对方"丢失了"是什么角色"（双子互知对方的具体角色）。注意同批次中 evil_twin（另一 roleId）的 roleCopy 是完整三句，两个 roleId 的用户文案不一致。
- **建议**：将 eviltwin 的 roleCopy.ability 补全为百科完整三句，并把"善良玩家"改为"对立阵营的玩家"。

#### [high] 莽夫 roleCopy.ability
- **仓库现状**：roleCopy.ability: “首个夜晚选择你的玩家醉酒到黄昏；你变成其阵营。”
- **百科依据**（莽夫）：角色能力：“每个夜晚，首个使用其自身能力选择了你的玩家会醉酒直到下个黄昏。你会转变为他的阵营。”；角色简介：“除非玩家自己选择了莽夫，否则莽夫不能让玩家醉酒。通过祖母之类的角色能力，而由说书人选择了莽夫不算在内。”
- **影响**：两处语义错误：(1) 时机错——百科是“每个夜晚，首个……的玩家”，roleCopy 把“首个”错挪到“夜晚”上，变成“首个夜晚选择你的玩家”，会让说书人以为该能力只在首夜触发，实际每晚都会重新触发一次；(2) 条件丢失——丢掉了“使用其自身能力选择”这一硬条件，百科明确说书人代选（如祖母的孙子指定）不触发莽夫。两者都会直接改变结算结果。
- **建议**：改为：“每个夜晚，第一个用自身能力选择你的玩家醉酒直到下个黄昏；你转变为他的阵营。”

#### [high] 蛊雕 (gu_diao / gudiao) abilityText 与 roleCopy.ability
- **仓库现状**：abilityText / roleCopy.ability（gu_diao 与 gudiao 两个 roleId 的多数变体）：“蛊雕：每个夜晚，你要选择左或右：将你的飞行标记从当前位置移动到这个方向上的下一名存活善良玩家。他中毒且可能被当作邪恶阵营和爪牙角色，你会知道他原本的角色。”
- **百科依据**（蛊雕）：角色能力：“每个夜晚，你会得知顺时针方向上的下一名存活的镇民玩家的角色，他中毒且可能被当作邪恶的蛊雕，直到下个黄昏。”“每局游戏限一次，在夜晚时，你可以改变方向。”；角色简介：“其他角色类型的玩家，或是已经死亡的玩家，都会被蛊雕跳过。”；规则细节：“……这名玩家只能被当作‘邪恶的蛊雕’。”
- **影响**：与百科（ground truth）存在四处规则语义冲突：(1) 方向机制错——仓库版是“每晚自由选择左或右”，百科版是固定顺时针、且“每局游戏限一次”才能改变方向；(2) 目标对象错——仓库版是“下一名存活善良玩家”（含外来者），百科版是“下一名存活的镇民玩家”，非镇民会被跳过；(3) 被当作的对象不同——仓库版是泛化的“邪恶阵营和爪牙角色”，百科规则细节明确同时判定角色和阵营时“只能被当作‘邪恶的蛊雕’”；(4) 仓库该版本文本缺少“直到下个黄昏”的持续时间。另注意：本 compare 数据包的 wikiAbility 字段也漏抄了百科第二句“每局游戏限一次，在夜晚时，你可以改变方向。”。涉及 scripts：jiao-huan-ren-sheng、yi-ye-yu-long-wu、dou-shi-qi-yuan-lao-hua-deng、zhui-chai-qi-yuan-lao-hu
- **建议**：确认各 GStone 板子实际使用的蛊雕版本；若与山雨欲来官方页一致，按百科文本改写（顺时针、镇民、被当作邪恶的蛊雕、直到下个黄昏、每局限一次改向），否则在数据中标注为不同版本并停止与该百科页做同一性对照。

#### [high] 姑获鸟 abilityText / roleCopy.ability / research
- **仓库现状**：abilityText 与 roleCopy.ability（zi-gui-qi-ming）：“每个夜晚*，你要选择一名玩家：他死亡。你可能会拥有上一个死于处决的爪牙的能力。”；research.possibleOutcomes：“Choose a player to die; may have ability of last executed Minion.”；research.highRiskNotes：“Check last executed Minion before applying extra ability.”
- **百科依据**（姑获鸟）：角色能力：“每个夜晚*，你要选择一名玩家：他死亡。每局游戏限一次，当爪牙死于处决时，你可能会获得他的能力。”；角色简介：“姑获鸟获得爪牙的能力只能触发一次。”；规则细节：“姑获鸟始终获得的是死于处决时该爪牙的能力，无论该爪牙后续变成了什么角色。”
- **影响**：仓库文本丢失“每局游戏限一次”这一硬性限次条件，并把“当爪牙死于处决时（一次性）获得其能力”改写成“拥有上一个死于处决的爪牙的能力”——后者暗示能力会随最近一次被处决的爪牙滚动更换，与百科“只能触发一次、获得后固定不变”的结算完全相反（例如第二名爪牙被处决时，按仓库文本能力会被替换，按百科则不获得任何新能力）。research 的 possibleOutcomes 与 highRiskNotes 也沿用了同样的“last executed Minion”错误框架。另外 research 未提及百科的关键结算细节“姑获鸟不会得知自己获得了什么爪牙的能力”（说书人不应向玩家透露获得了哪个能力）。
- **建议**：按百科改写为“每局游戏限一次，当爪牙死于处决时，你可能会获得他的能力”，research 中补充：获得由说书人决定、只触发一次、获得后不因后续处决更换、且不告知玩家获得了什么能力。

#### [high] 混沌 (hundun)
- **仓库现状**：abilityText（jiao-huan-ren-sheng、shi-yan-jiao-chi、wu-yin-cang-sheng、bai-zhou-wei-shi、yi-hua-jie-mu、ji-meng-ta-xiang 六个变体）与 roleCopy.ability 均为："每个夜晚*，你要选择一名玩家：他死亡。如果你以这种方式杀死了一名与你邻近的镇民玩家，所有善良玩家会中毒直到下个黄昏。"
- **百科依据**（混沌）：百科角色能力："每个夜晚*，你要选择一名玩家：他死亡。如果你以这种方式杀死了一名与你邻近的镇民玩家，除旅行者外的所有善良玩家会中毒直到下个黄昏。"；角色简介："只要玩家是善良阵营（旅行者除外），就会受到中毒效果的影响"
- **影响**：仓库所有毒杀版混沌的能力文本和前端 roleCopy 都遗漏了硬条件"除旅行者外"。按仓库文本结算会把善良旅行者也标记为中毒，直接改变信息类/能力类结算结果。相关 research 摘要（如 shi-yan-jiao-chi 的 "good players are poisoned until next dusk"）同样未排除旅行者。
- **建议**：将所有毒杀版 abilityText 与 roleCopy.ability 更正为"除旅行者外的所有善良玩家会中毒直到下个黄昏"，并同步修订各 research 摘要。

#### [high] 旅店老板 (innkeeper)
- **仓库现状**：roleCopy.ability："每晚选择两名玩家，他们今晚不受恶魔影响，但其中一人醉酒到黄昏。"
- **百科依据**（旅店老板）：百科角色能力："每个夜晚*，你要选择两名玩家：他们当晚不会死亡，但其中一人会醉酒到下个黄昏。"；角色简介："与僧侣类似，旅店老板能让玩家们不被恶魔杀死。受保护的玩家也不会因为外来者、爪牙、镇民和旅行者的能力而死亡。"
- **影响**：roleCopy 把保护效果改写为"不受恶魔影响"，对象与条件双重错误：(1) 百科的保护是"当晚不会死亡"，防的是任何来源的夜间死亡（外来者、爪牙、镇民、旅行者能力造成的死亡同样被防），不只防恶魔；(2) "不受影响"过宽——被保护玩家仍可被投毒等非死亡效果影响，保护仅针对死亡。另外该文案丢失了"每个夜晚*"中的首夜除外标记。各变体 abilityText 本身与百科一致，仅前端文案错误。
- **建议**：roleCopy.ability 改为"每个夜晚*（首夜除外）选择两名玩家：他们当晚不会死亡，但其中一人醉酒到下个黄昏"。

#### [high] 奸佞 (jianning, 全部变体与 roleCopy)
- **仓库现状**：abilityText/roleCopy.ability (zhui-chai-qi-yuan-lao-hua-deng / man-tang-hong / ji-meng-ta-xiang): “每个夜晚*，你要选择一名玩家：他死亡。如果你今天白天没有投票，今晚你可以行动两次。”；abilityText (gui-jue-yi-xiang): “……如果你在今天白天没有被提名，改为选择两名玩家。”
- **百科依据**（奸佞）：角色能力：“每个夜晚*，你要选择一名玩家：他死亡。爪牙在其死亡的当晚要选择一名玩家：如果他是善良的，他死亡。”；规则细节：“[[僧侣]]、[[士兵]]无法免疫爪牙使用奸佞能力所造成的死亡。”
- **影响**：百科奸佞（Geehnyn，山雨欲来）的第二段能力是“爪牙死亡当晚获得一次限善良目标的额外击杀”，这是该恶魔的核心结算机制（含爪牙死于任何原因均触发、奸佞醉酒中毒则不触发、僧侣/士兵不免疫等）。仓库三个变体全部把第二段替换为“没投票→行动两次”或“没被提名→改选两名玩家”，roleCopy 也沿用前者；所有 research 字段均未提及爪牙死亡触发机制。若这些剧本收录的确是官方奸佞，则规则完全错误；若是同名自制变体，则不应共用官方奸佞的百科映射。
- **建议**：核对各剧本源 JSON：若为官方奸佞则统一改为百科能力文本并在 research 补充爪牙死亡触发结算；若为自制变体则拆分 roleId，避免与官方百科页对照。

#### [high] 酒保 (jiu_bao_outsider / jiubao)
- **仓库现状**：abilityText 与 roleCopy.ability（两个 roleId 的全部变体）："与你邻近的善良玩家之一醉酒，即使你已死亡。"；research.highRiskNotes（sheng-shi-qi-wen 变体）："Neighbor drunk source must be tracked manually even after Jiu Bao dies."；research.stateChanges（yi-hua-jie-mu 变体）："One neighboring good player is drunk, even if Jiubao is dead."
- **百科依据**（酒保）：角色能力："与你邻近的善良玩家（旅行者除外）之一醉酒，即使你死于处决。"；运作方式："如果酒保死于处决了，那么'醉酒'标记不会被移除。如果酒保因为非处决的原因死亡了，立即移除'醉酒'标记。"；角色简介："如果酒保因为非处决的原因而死亡时，醉酒将会解除。"
- **影响**：仓库把死后保留条件从"即使你死于处决"泛化成"即使你已死亡"。按百科，酒保只有死于处决时醉酒才保留；死于其他原因（最常见：夜晚被恶魔杀死）时醉酒立即解除，百科范例甚至专门演示了"恶魔当晚杀死了酒保，共情者恢复清醒并获得正确信息"。按仓库文本结算会在酒保夜晚死亡后错误地继续让邻近善良玩家醉酒，直接改变信息类角色的结算结果。该错误同时出现在面向用户的 abilityText/roleCopy 和 sheng-shi-qi-wen、yi-hua-jie-mu 两个板子的 research 摘要中。涉及 scripts：tong-yan-wu-ji、zhui-chai-qi-yuan-lao-hua-deng、gui-jue-yi-xiang、sheng-shi-qi-wen、yi-hua-jie-mu。
- **建议**：将两个 roleId 的 abilityText/roleCopy.ability 改为百科官方文本"……即使你死于处决"，并在 research/highRiskNotes 中补充"非处决死亡时立即解除醉酒"的结算规则。

#### [high] 国王 (king)
- **仓库现状**：abilityText（ba-luo-zhi-ye、dou-shi-qi-yuan-lao-hua-deng、e-mo-mi-cheng、xian-xiang-huan-sheng、sheng-ri-yan-hui、huo-shan-jiao-tuan、tian-tang-hua-yuan 等全部中文变体）与 roleCopy.ability："每个夜晚，如果死亡的玩家数量大于存活的玩家数量，你会得知一个存活的角色。"；research.possibleOutcomes（dou-shi-qi-yuan 变体）："King may learn an alive character once dead players outnumber living players."；research.possibleOutcomes（sheng-ri-yan-hui 变体）："If dead player
- **百科依据**（国王）：角色能力："每个夜晚，如果死亡的玩家数量大于或等于存活的玩家数量，你会得知一个存活的角色。"；角色简介："只要死亡玩家的数量大于或等于存活玩家的数量"；官方英文（he-fang-jiao-zhong 变体自带）："if the dead equal or outnumber the living"。
- **影响**：触发阈值差一：百科是"大于或等于"（死亡数 >= 存活数即触发），仓库中文文本和 roleCopy 全部写成"大于"。在死亡数等于存活数的常见局面（如 12 人局 6 死 6 活）下，按仓库文本国王不会被唤醒，按百科必须唤醒并给信息，直接改变结算。此外存在包间不一致：he-fang-jiao-zhong 变体的英文 abilityText 和 possibleOutcomes 使用正确的 "equal or outnumber"，与其余中文变体互相矛盾。涉及 scripts：ba-luo-zhi-ye、dou-shi-qi-yuan-lao-hua-deng、e-mo-mi-cheng、xian-xiang-huan-sheng、sheng-ri-yan-hui、huo-shan-jiao-tuan、tian-tang-hua-yuan、bao-yue-chu-sheng（he-fang-
- **建议**：把所有中文 abilityText、roleCopy.ability 及 dou-shi-qi-yuan、sheng-ri-yan-hui 的 research.possibleOutcomes 统一改为"死亡的玩家数量大于或等于存活的玩家数量"。

#### [high] langzhong（郎中，全部变体）
- **仓库现状**：全部 10 个变体的 abilityText 及 roleCopy.ability（sameAsAbilityText=true）：「每个夜晚，你要选择一名玩家：你会得知一个与他能力相关的词语。」
- **百科依据**（郎中）：郎中.wiki 角色能力：「每个夜晚，你要选择除你以外的一名玩家：你会得知一个与他能力相关的词语。」角色简介：「郎中可以选择已死亡的玩家。郎中不能选择自己。」运作方式：「让他指向任意一名除自己以外的玩家。」
- **影响**：仓库所有 langzhong 变体和前端文案都丢失了「除你以外」这一硬性目标限制，按仓库文本玩家可以选择自己，而百科在能力文本、简介、运作方式三处都明确禁止自选。涉及 scripts: li-beng-le-huai, huang-liang-yi-meng-lao-hua-deng, yi-chu-hao-xi-lao-hua-deng, zhui-chai-qi-yuan-lao-hua-deng, gui-jue-yi-xiang, sheng-shi-qi-wen, wu-yin-cang-sheng, bai-zhou-wei-shi, hu-yan-luan-yu, yi-hua-jie-mu, nuo-fu-jiu-xing。
- **建议**：在所有 langzhong 变体的 abilityText 与 roleCopy.ability 中补回「除你以外」。

#### [high] lilmonsta（小怪宝）
- **仓库现状**：全部中文变体的 abilityText 及 roleCopy.ability（sameAsAbilityText=true）：「每个夜晚*，会有一名玩家死亡。[+1爪牙]」；research.possibleOutcomes（si-zui-chan-hui-ri）：「each night* one player dies」
- **百科依据**（小怪宝）：小怪宝.wiki 角色能力：「每个夜晚，所有爪牙要秘密决定由哪名玩家来照看小怪宝并且“是恶魔”。每个夜晚*，可能会有一名玩家死亡。[+1爪牙]」
- **影响**：百科（与官方英文 a player might die 一致）写的是「可能会有一名玩家死亡」，仓库所有中文变体和前端文案都丢掉「可能」，把可选的夜杀写成了必然发生，会误导说书人认为每个非首夜必须结算一次死亡。仓库内部也自相矛盾：he-fang-jiao-zhong 变体的英文 abilityText 是「Each night*, a player might die.」。涉及 scripts: jing-jue-gu-guo-shen-hua, long-zhong-jin-que, quan-mian-su-qing, hui-xuan-mi-zhen, si-zui-chan-hui-ri, hu-du-zhi-zheng, shen-fen-wei-ji, shuo-shu-ren-zhi-nu, zi-gui-qi-ming, mo-ni-zhi-jiao, man-tang-ho
- **建议**：将所有中文 abilityText 与 roleCopy.ability 更正为「每个夜晚*，可能会有一名玩家死亡」，并同步修正 si-zui-chan-hui-ri 的 research 摘要。

#### [high] 吟游诗人 minstrel — roleCopy.ability
- **仓库现状**：roleCopy.ability: “爪牙被处决后，所有其他玩家醉酒到明天黄昏。”
- **百科依据**（吟游诗人）：百科角色能力：“当一名爪牙死于处决时，除了你和旅行者以外的所有其他玩家醉酒直到明天黄昏。”角色简介：“如果一名爪牙玩家被处决但没有死亡，吟游诗人的能力不会触发”“镇民、外来者、爪牙、甚至是恶魔都会醉酒，但是旅行者不会”。
- **影响**：两处结算关键遗漏：(1) 触发条件从“死于处决”弱化为“被处决”——百科明确爪牙被处决但未死亡（如魔鬼代言人保护）或已死亡爪牙被再次处决时能力不触发；(2) 遗漏“旅行者除外”这一对象例外，旅行者不会醉酒。多数 repoVariants 的 abilityText 和 research（如 Bad Moon Rising：“爪牙被处决死亡后，其他非旅行者玩家醉酒至明天黄昏”）均正确，仅 roleCopy 丢失这两个条件。
- **建议**：改为：“当一名爪牙死于处决时，除你和旅行者以外的所有其他玩家醉酒直到明天黄昏。”

#### [high] 诺-达鲺 roleCopy.ability
- **仓库现状**：roleCopy.ability: "两侧最近的镇民中毒。"
- **百科依据**（诺-达鲺）：角色能力: "每个夜晚*，你要选择一名玩家：他死亡。" "与你邻近的两名镇民中毒。"
- **影响**：前端展示文案只保留了被动中毒子句，完全丢失了恶魔的核心主动能力"每个夜晚*选择一名玩家：他死亡"。所有 repoVariants 的 abilityText 都含完整两句（杀人+中毒），只有面向用户的 roleCopy 缺失杀人子句，会让使用者误以为诺-达鲺没有夜晚击杀能力，直接影响结算。
- **建议**：roleCopy.ability 改为完整文本："每个夜晚*，你要选择一名玩家：他死亡。与你邻近的两名镇民中毒。"

#### [high] 街头风琴手 (organgrinder)
- **仓库现状**：abilityText/roleCopy.ability：「所有玩家在投票时闭眼，且票数会秘密统计。对你的提名只在你投票时才会统计票数。」；research.possibleOutcomes：「Voting is eyes-closed and secretly counted; nominations on Organ Grinder count only if Organ Grinder votes.」
- **百科依据**（街头风琴手）：角色能力：「所有玩家在投票时闭眼，且票数会秘密统计。」「每个夜晚，你要选择自己是否醉酒直到下个黄昏。」；运作方式：「每个夜晚，唤醒街头风琴手点头或摇头……如果街头风琴手醉酒，和正常情况一样，所有玩家睁眼投票。」
- **影响**：仓库全部三个变体（scripts: yi-chu-hao-xi-lao-hua-deng、chuan-qi-zhi-ye、yu-zhe-huan-yan）及 roleCopy 均使用旧版能力文本：多出一条百科没有的硬条件「对你的提名只在你投票时才会统计票数」，同时完全遗漏百科现行能力的第二句——每个夜晚要选择自己是否醉酒直到下个黄昏（醉酒时所有玩家正常睁眼投票、黄昏移除醉酒标记）。这会导致说书人漏掉街头风琴手的每夜必做行动，并按已被替换的旧规则处理对风琴手本人的提名计票，属于结算级错误。
- **建议**：将 abilityText/roleCopy 更新为百科现行两句能力文本，并在 research 中补充每夜点头/摇头选择醉酒、醉酒期间正常睁眼投票、黄昏移除醉酒标记的流程；如个别自定义剧本刻意使用旧版文本，应在 research 中显式标注版本差异。

#### [high] 街头风琴手 (organ_grinder)
- **仓库现状**：abilityText/roleCopy.ability：「所有玩家在投票时闭眼，且票数会秘密统计。对你的提名只在你投票时才会统计票数。」；research.possibleOutcomes：「Votes are eyes-closed and secretly counted; nominations against Organ Grinder count only if they vote.」
- **百科依据**（街头风琴手）：角色能力：「所有玩家在投票时闭眼，且票数会秘密统计。」「每个夜晚，你要选择自己是否醉酒直到下个黄昏。」
- **影响**：roleId organ_grinder（script: xin-ren-shi-lian）与 organgrinder 存在同样问题：使用旧版能力文本，多出「对你的提名只在你投票时才会统计票数」这一百科现行文本中不存在的条件，且遗漏「每个夜晚选择自己是否醉酒直到下个黄昏」这一每夜必做行动。按此文案结算会漏唤醒该角色并错误处理其被提名时的计票。
- **建议**：与 organgrinder 一并改为百科现行文本，并补充每夜醉酒选择流程；两个 roleId 指向同一角色，建议统一数据来源。

#### [high] 珀 (po) roleCopy.ability
- **仓库现状**：roleCopy.ability: "每晚可选择不杀；若上一晚不杀，今晚选择三名玩家死亡。"（sameAsAbilityText: false）
- **百科依据**（珀）：角色能力："每个夜晚*，你可以选择一名玩家：他死亡。" "如果你上次选择时没有选择任何玩家，当晚你要选择三名玩家：他们死亡。"；角色简介："珀在首个夜晚不行动，但这不算作珀'没有选择'。" "如果珀在上一次进行选择时攻击了某人但该玩家没有死亡，珀也不会获得三次攻击的机会。"（另有驱魔人条目：被驱魔人选择不算"没有选择任何人"）
- **影响**：三处语义偏差：(1) 完全丢失了基础能力"你可以选择一名玩家：他死亡"——文案只写了空刀/三杀分支，没有写每晚可单杀；(2) 触发条件写成"若上一晚不杀"，而百科是"上次选择时没有选择任何玩家"——首夜不行动、被驱魔人跳过、攻击了但目标未死，都不算"没有选择"，按"上一晚不杀"结算会在第二夜或驱魔人之夜错误给出三杀；(3) "每晚"丢失"每个夜晚*"的首夜排除。
- **建议**：改写为完整两句："每个夜晚*，你可以选择一名玩家：他死亡。如果你上次选择时没有选择任何玩家，当晚你要选择三名玩家：他们死亡。"

#### [high] 圣徒 (saint) — roleCopy.ability
- **仓库现状**：roleCopy.ability："若你被处决，邪恶胜利。"
- **百科依据**（圣徒）：角色能力："如果你死于处决，你的阵营落败。"；运作方式："在其他剧本中，可能会让角色改变阵营。如果一名邪恶的圣徒被处决，善良阵营获胜。"；范例："替罪羊代替圣徒被处决。游戏继续，因为圣徒没有死亡。"
- **影响**：面向用户的中文文案有两处规则错误：(1) 条件错——百科条件是"死于处决"而非"被处决"；若圣徒被处决但没有死亡（如替罪羊代替被处决、处决时未死），能力不触发、游戏继续；(2) 对象错——百科为"你的阵营落败"，roleCopy 硬编码成"邪恶胜利"，在圣徒阵营被改变（邪恶圣徒被处决）时结论相反，应为善良阵营获胜。
- **建议**：roleCopy.ability 改为"若你死于处决，你的阵营落败"。

#### [high] scarletwoman / roleCopy.ability
- **仓库现状**：roleCopy.ability: "若场上至少 5 名存活玩家且恶魔死亡，你变成恶魔。"
- **百科依据**（红唇女郎）：百科角色能力："如果大于等于五名玩家存活时（旅行者不计算在内）恶魔死亡，你变成那个恶魔。"；范例："有七名玩家存活：小恶魔，红唇女郎，两名镇民，三名旅行者。小恶魔被处决，因此游戏结束且善良阵营获胜，因为旅行者不计算在红唇女郎的能力里。"
- **影响**：中文展示文案丢失了硬条件"旅行者不计算在内"。百科范例明确表明：7 名存活玩家中含 3 名旅行者时恶魔被处决，游戏直接结束、善良获胜——是否计入旅行者会直接翻转结算结果。另外"你变成恶魔"丢失了"那个恶魔"的限定（必须变成与死去恶魔同种类的恶魔，见运作方式："她一定会变成与刚死去的恶魔同一种类的恶魔"）。
- **建议**：改为"若恶魔死亡时至少 5 名玩家存活（旅行者不计算在内），你变成那个恶魔。"

#### [high] shabaloth / roleCopy.ability（反刍条件）
- **仓库现状**：roleCopy.ability: "每晚选择两名玩家死亡；你可能复活被你杀死的玩家。"
- **百科依据**（沙巴洛斯）：百科角色能力第二句："你上个夜晚选择过且当前死亡的玩家之一可能会被你反刍。"；角色简介："被复活的玩家可以是在存活状态下被沙巴洛斯攻击的玩家，也可以是在死亡状态下被沙巴洛斯攻击的玩家。"
- **影响**："复活被你杀死的玩家"在对象和条件上都与百科冲突：(1) 反刍对象是"上个夜晚选择过且当前死亡"的玩家，不要求死于沙巴洛斯之手——选择时已死亡的玩家（如已死的驱魔人范例）同样可被反刍；(2) 只限上一夜的选择，更早夜晚杀死的玩家不可反刍，而"被你杀死的玩家"没有此时限；(3) 只能是两名被选玩家"之一"。按此文案结算会选错可复活对象。
- **建议**：改为"每个夜晚*选择两名玩家死亡；你上一夜选择过且当前死亡的玩家之一可能被你反刍复活。"

#### [high] shijie / roleCopy.ability 与 sheng-shi-qi-wen 变体 abilityText
- **仓库现状**：roleCopy.ability 与 sheng-shi-qi-wen 变体 abilityText（同文）: "所有玩家在使用自身能力选择恶魔时可能会改为选中你，即使你已死亡。"
- **百科依据**（使节）：百科角色能力："每个夜晚限一次，一名玩家在使用自身能力选择邪恶玩家时会改为选中你，即使你已死亡。"；角色简介："只要有玩家在使用自身能力选择了邪恶玩家……"、"如果使节的能力在当晚已经被触发过一次了，那么之后有其他玩家使用能力进行选择时，就无法再被使节影响。"
- **影响**：三处规则语义错误：(1) 对象错——百科是选择"邪恶玩家"即可触发，repo 写成选择"恶魔"，大幅收窄触发条件；(2) 遗漏硬限制"每个夜晚限一次"，按 repo 文案一晚可多次改选；(3) "一名玩家"被写成"所有玩家"。另注意包间矛盾：yi-hua-jie-mu 变体保留了"每个夜晚限一次"和"邪恶玩家"，与 sheng-shi-qi-wen 变体在触发对象和次数限制上互相冲突。
- **建议**：roleCopy 与 sheng-shi-qi-wen 变体改为"每个夜晚限一次，一名玩家在使用自身能力选择邪恶玩家时会改为选中你，即使你已死亡。"

#### [high] 间谍 roleCopy.ability
- **仓库现状**：roleCopy.ability: "每晚可查看魔典；你可能被登记为善良和镇民。"
- **百科依据**（间谍）：角色能力："每个夜晚，你能查看魔典。你可能会被当作善良阵营、镇民角色或外来者角色，即使你已死亡。"
- **影响**：面向用户的中文文案遗漏了两个硬条件：(1) 间谍还可能被当作"外来者角色"（百科范例：送葬者得知死者是酒鬼，即间谍被当作外来者）；(2) "即使你已死亡"的死后登记保留。按此文案结算，说书人会认为间谍只能登记为善良和镇民、且死亡后登记失效，直接改变洗衣妇/图书管理员/送葬者等角色的信息结算。
- **建议**：将 roleCopy.ability 改为与百科一致："每个夜晚，你能查看魔典。你可能被当作善良阵营、镇民角色或外来者角色，即使你已死亡。"

#### [high] vigormortis roleCopy.ability
- **仓库现状**：roleCopy.ability: "每晚选择一名玩家死亡；你杀死的爪牙保留能力，且相邻两名镇民中毒。"
- **百科依据**（亡骨魔）：角色能力: "被你杀死的爪牙保留他的能力，且与他邻近的两名镇民之一中毒。[-1外来者]"；运作方式: "（顺时针和逆时针分别判断最近的一个镇民，并取这两个镇民的其中之一）"
- **影响**：前端中文文案把"邻近的两名镇民之一中毒"写成"相邻两名镇民中毒"，会误导说书人同时给两名镇民下毒（中毒对象数量错误：应为二选一，由说书人选择其中一侧）。同时该文案遗漏了 [-1外来者] 设置调整。
- **建议**：改为："每个夜晚*选择一名玩家死亡；被你杀死的爪牙保留能力，且与其邻近的两名镇民之一中毒（说书人选择一名）。[-1外来者]"

#### [high] voudon roleCopy.ability
- **仓库现状**：roleCopy.ability: "只有死亡玩家可投票；善良玩家不知道自己阵营。"
- **百科依据**（巫毒师）：角色能力: "只有你和死亡的玩家可以投票，且投票不需要使用投票标记。忽略票数需要过半的要求。"；角色简介: "已死亡的玩家和巫毒师可以在白天不限次数进行投票……处决一名玩家的票数无需达到存活玩家数量的一半以上"
- **影响**：三处错误：(1) 遗漏巫毒师本人可以投票（百科为"只有你和死亡的玩家可以投票"）；(2) "善良玩家不知道自己阵营"是凭空添加的条件，百科中该角色完全没有此规则；(3) 遗漏"投票不需要投票标记"和"忽略票数过半要求"两条直接影响处决结算的规则。
- **建议**：改为："只有你和死亡的玩家可以投票，投票不需要投票标记；忽略票数需过半的要求。"并删去阵营相关的错误语句。

#### [high] vortox roleCopy.ability
- **仓库现状**：roleCopy.ability: "镇民能力得到的信息全为假；若白天无人处决，邪恶胜利。"
- **百科依据**（涡流）：角色能力: "每个夜晚*，你要选择一名玩家：他死亡。"（涡流能力的第一句加粗文本）
- **影响**：面向用户的能力文案完全遗漏了涡流作为恶魔"每个夜晚*选择一名玩家：他死亡"的杀人能力，这是恶魔结算的硬条件；仅保留假信息与无处决胜利两句。
- **建议**：补上"每个夜晚*，你要选择一名玩家：他死亡。"作为文案第一句。

#### [high] 女巫 roleCopy.ability 能力失效人数
- **仓库现状**：roleCopy.ability: 「每晚选择一名玩家；若其明天提名，立即死亡。剩 5 人时能力失效。」
- **百科依据**（女巫）：角色能力：「每个夜晚，你要选择一名玩家：如果他明天白天发起提名，他死亡。如果只有三名存活的玩家，你失去此能力。」角色简介：「只剩三名玩家存活时，女巫的诅咒立即解除，女巫也无法再进行夜晚行动。」
- **影响**：数字错误：能力失效阈值是 3 名存活玩家，前端中文文案写成「剩 5 人」。全部 11 个 repoVariants 的 abilityText（中英）都正确写 3 人（「如果只有三名存活的玩家」/「If just 3 players live」），仅 roleCopy 出错。按此文案说书人会在 5 人存活时就提前解除诅咒、停止女巫夜间行动，直接改变结算结果。
- **建议**：将 roleCopy.ability 改为「只剩 3 名存活玩家时失去此能力」。

#### [high] 驿使 (yishi)
- **仓库现状**：abilityText（shi-san-hang / wu-yin-cang-sheng / zi-gui-qi-ming 三个变体一致）与 roleCopy.ability：「每个白天，你可以公开声明一个角色。在当晚，你会得知该角色是否在场。如果你因此得知了否，你失去此能力。」research.possibleOutcomes（Wu Yin Cang Sheng）："Publicly claim a role by day; at night learn whether it is in play; if no, lose ability."；research.stateChanges："May lose ability after a no."
- **百科依据**（驿使）：角色能力：「每个白天，你可以公开声明一个角色在场。在当晚，你会得知该声明是否正确。如果你得知过是和否，你失去此能力。」范例：「上个夜晚，驿使得知了"是"。当晚，驿使得知了"否"。驿使失去了他的能力。」提示标记特殊说明：「如果两个标记都已放置，不要唤醒驿使」
- **影响**：失去能力的条件被写错：百科要求驿使先后得知过「是」和「否」两种结果才失去能力（并配有"得知过是""得知过否"两个提示标记，两者都放置后才停止唤醒）；仓库所有 abilityText、roleCopy 与 research 摘要都写成"得知一次否即失去能力"。按仓库文本，第一次得到"否"就会停止给信息，而按百科驿使在只得到过"否"的情况下仍可继续每天声明并获得真实信息，直到再得知"是"为止——直接改变结算。百科规则细节还注明即使醉酒/中毒时得知的是和否也计入失能条件。
- **建议**：把三个板子包的 abilityText、roleCopy.ability 及 research（possibleOutcomes/stateChanges）统一改为"如果你得知过是和否（两种结果都得知过），你失去此能力"，并补充"醉酒/中毒时得知的结果同样计入"。

#### [high] 鸩 (zhen)
- **仓库现状**：abilityText（wu-yin-cang-sheng / zi-gui-qi-ming）与 roleCopy.ability：「每局游戏限一次，在夜晚时*，你可以选择一个镇民角色：如果他在场，他醉酒并死亡。」research.possibleOutcomes："Once per game choose a Townsfolk role; if in play, that player is drunk and dies."；research.stateChanges："Chosen Townsfolk may become drunk and die."
- **百科依据**（鸩）：角色能力：「每局游戏限一次，在夜晚时*，你可以选择一个镇民角色：如果他在场，他中毒并死亡。」运作方式：「依次用"中毒"和"死亡"提示标记标记那名玩家」；规则细节：「如果鸩选择了自己，他会中毒但不会死亡」；相克规则：「罂粟种植者：如果鸩选择了罂粟种植者，罂粟种植者不会因为鸩的能力中毒。」
- **影响**：状态类型写错：百科为「中毒并死亡」，仓库两个板子包的 abilityText、roleCopy 及 research 全部写成「醉酒并死亡」。中毒与醉酒在结算上不同——与检测/免疫中毒的角色（如罂粟种植者相克规则）以及"鸩选择自己会中毒失去能力从而通常不死"的自指结算都依赖"中毒"这一状态，写成醉酒会导致这些交互结算错误。
- **建议**：将 wu-yin-cang-sheng、zi-gui-qi-ming 两个变体的 abilityText、roleCopy.ability 与 research 摘要中的"醉酒/drunk"改为"中毒/poisoned"。

#### [high] bishop（主教）roleCopy.ability 提名对象阵营写反
- **仓库现状**：roleCopy.ability：「只有说书人能提名，且每天至少提名一名自己阵营的玩家。」
- **百科依据**（主教）：角色能力：「只有说书人可以发起提名。每个白天说书人至少要提名一名你对立阵营的玩家。」
- **影响**：中文文案把「对立阵营」写成了「自己阵营」，方向完全相反。说书人若按此文案执行，会每天至少提名一名与主教同阵营的玩家，而官方规则要求提名主教对立阵营的玩家，直接改变提名约束和信息推理基础。两个 repoVariants 的英文 abilityText（At least 1 opposing player must be nominated each day）均正确，仅面向用户的 roleCopy 出错。
- **建议**：改为「只有说书人能发起提名；每个白天说书人至少要提名一名主教对立阵营的玩家」。

#### [high] bureaucrat（官员）roleCopy.ability「多算三票」与百科「算作三票」数值不符
- **仓库现状**：roleCopy.ability：「每晚选择除自己外一名玩家；明天该玩家若投票，多算三票。」
- **百科依据**（官员）：角色能力：「每个夜晚，你要选择除你以外的一名玩家：明天白天，他的投票算作三票。」范例：「说书人数道：“1...2...3...4·5·6...7”。被提名的玩家在这次处决投票中获得了7票」
- **影响**：「多算三票」的自然读法是在原本 1 票之外额外加 3 票（合计 4 票），而百科及英文原文（their vote counts as 3 votes）是该玩家的一票整体算作 3 票。按文案唱票会每次多计 1 票，直接影响处决票数门槛的判定。
- **建议**：改为「明天白天，他的投票算作三票」。

#### [high] bonecollector（集骨者）roleCopy.ability 把「直到下个黄昏」截断为「今晚」
- **仓库现状**：roleCopy.ability：「每局一次，夜晚选择一名死亡玩家；其今晚重新获得能力。」
- **百科依据**（集骨者）：角色能力：「每局游戏限一次，在夜晚时*，你可以选择一名死亡的玩家：他重新获得能力直到下个黄昏。」范例：「在晚上，集骨者选择了已死亡的屠夫。在接下来的白天，当一名玩家被处决后，说书人告诉屠夫可以再进行一次处决提名。」
- **影响**：重获的能力持续到下一个黄昏，覆盖次日整个白天；写成「今晚」会让被恢复能力的白天型角色（如屠夫、杂耍艺人、艺术家）在次日白天被错误地判定为无能力，结算结果不同。另外文案还丢掉了「夜晚时*」中星号（首夜不可用）的限制。各 repoVariants 的 abilityText 本身均正确，仅 roleCopy 出错。
- **建议**：改为「每局限一次，非首夜的夜晚选择一名死亡玩家：他重新获得能力直到下个黄昏（含次日白天）」。

#### [high] boffin（科学怪人）roleCopy.ability 丢失「即使他醉酒或中毒」硬条件
- **仓库现状**：roleCopy.ability：「恶魔拥有一个不在场善良角色的能力；恶魔和博芬都知道该能力。」
- **百科依据**（科学怪人）：角色能力：「恶魔拥有一个不在场的善良角色的能力，即使他醉酒或中毒。你和他都知道他获得了什么能力。」角色简介：「如果恶魔醉酒中毒，恶魔仍然保留自己获得的这个善良角色的能力。」
- **影响**：「即使他醉酒或中毒」是对默认规则（醉酒/中毒角色能力失效）的显式覆盖。文案删掉此从句后，说书人很可能在恶魔中毒/醉酒时错误地判定其失去获得的善良能力，与官方结算相反。两个 repoVariants 的 abilityText（英文与中文）均含此从句，仅 roleCopy 缺失。
- **建议**：补回「即使恶魔醉酒或中毒，该能力仍然生效」。

#### [high] 流莺 (harlot) roleCopy.ability 错加“若其邪恶”条件
- **仓库现状**：roleCopy.ability: “每晚选择一名存活玩家；若其同意，你得知其角色；若其邪恶，你们都可能死亡。”
- **百科依据**（流莺）：角色能力: “每个夜晚*，你要选择一名存活的玩家：如果他同意，你会得知他的角色，但是你们两个可能同时死亡。”；角色简介: “如果揭露的话，说书人可以决定流莺和该玩家是否在今晚一起死亡。”
- **影响**：roleCopy 给双死结果加了百科不存在的硬条件“若其邪恶”。百科中两人是否同死完全由说书人裁量，与目标阵营无关（运作方式还特别提醒“当恶魔将自己的角色揭露给流莺，你不应该直接杀死他们以结束游戏”，说明目标邪恶时反而不宜杀）。按 roleCopy 结算会误以为善良目标同意揭露就绝对安全、目标邪恶才可判双死，直接改变结算结果。所有 repoVariants 的 abilityText 本身是正确的。
- **建议**：改为“每个夜晚*，选择一名存活玩家：若其同意，你得知其角色，但你们两人可能同时死亡（是否死亡由说书人裁量，与目标阵营无关）。”

#### [high] 和尚 (he_shang，jing-jue-gu-guo-shen-hua) 能力文本遗漏“选择”触发与“持续至下个黎明”时限
- **仓库现状**：abilityText 与 roleCopy.ability（sameAsAbilityText=true）: “每个夜晚，当有邪恶玩家的能力首次对与你邻近的存活玩家产生影响时，改为此次能力不生效，你会得知这一信息。”；research.possibleOutcomes: “First evil effect affecting a neighboring living player may be prevented and the Monk is informed.”
- **百科依据**（和尚）：角色能力: “每个夜晚，当有邪恶玩家的能力首次选择或影响与你邻近的存活玩家时，改为此次能力不生效并持续至下个黎明，且你会得知你的能力被触发。”；角色简介: “如果邪恶玩家的能力是一项持续生效的能力……和尚会使这项能力失效直至下个黎明。在下一个白天时，这项能力会再次生效。”
- **影响**：两处硬性遗漏：(1) 触发条件从“选择或影响”缩窄为仅“产生影响”；(2) 完全丢失“并持续至下个黎明”这一时限——对持续型能力（百科范例：诺-达鲺的中毒失效到下个黎明、白天恢复生效）该时限决定结算结果，遗漏会把失效误当成一次性或永久。research 摘要同样没有该时限。
- **建议**：将 abilityText/roleCopy 换为百科完整原文，并在 research 中补充“持续型能力仅失效至下个黎明，白天恢复生效”。

#### [high] 和尚 (heshang) roleCopy 与 zhui-chai-qi-yuan-lao-hua-deng 变体遗漏“并持续至下个黎明”
- **仓库现状**：roleCopy.ability（与 zhui-chai-qi-yuan-lao-hua-deng 变体 abilityText 相同）: “每个夜晚，当有邪恶玩家的能力首次选择或影响与你邻近的存活玩家时，改为此次能力不生效，你会得知这一信息。”
- **百科依据**（和尚）：角色能力: “……改为此次能力不生效并持续至下个黎明，且你会得知你的能力被触发。”；角色简介: “和尚会使这项能力失效直至下个黎明。在下一个白天时，这项能力会再次生效。”
- **影响**：丢失“并持续至下个黎明”这一决定持续型能力结算的硬时限。同一 roleId 下 shi-san-hang 与 yi-hua-jie-mu 变体的 abilityText 是完整百科原文，说明 roleCopy 选用了缺时限的旧文本；roleCopy.sameAsAbilityText=true 使该缺陷直接面向用户。
- **建议**：roleCopy 与 zhui-chai 变体统一改用百科完整原文。

#### [medium] 学徒 (apprentice) — roleCopy.ability 丢失阵营映射并硬化「不在场」
- **仓库现状**：roleCopy.ability：「首夜获得一名不在场镇民或爪牙的能力，阵营由说书人决定。」（lunar-eclipse 变体 research.identityChanges 同样写「首夜获得不在场镇民或爪牙能力。」）
- **百科依据**（学徒）：角色能力：「在你的首个夜晚，如果你是善良的，你会获得一个镇民角色的能力；如果你是邪恶的，你会获得一个爪牙角色的能力。」运作方式补充：「基本上，你只能挑选一个不在场的角色能力给学徒，因为每个角色只有一个标记」；提示与技巧：「你可能会获得一个在场角色的能力，但是几率不大。」
- **影响**：前端文案丢失了「善良→镇民能力、邪恶→爪牙能力」这一由学徒自身阵营决定能力类型的硬条件，改写成「阵营由说书人决定」，容易被理解为说书人可任意指派镇民或爪牙能力；同时把「不在场」从百科的实操建议（可以获得在场角色能力，只是几率不大）写成了硬条件。各变体 abilityText 本身与百科一致。
- **建议**：改为「首夜时：若你善良则获得一个镇民能力，若你邪恶则获得一个爪牙能力（通常为不在场角色）」；旅行者阵营由说书人指定可放入 prompt 说明。

#### [medium] 半仙 (banxian) — sheng-shi-qi-wen 变体
- **仓库现状**：abilityText（scripts: sheng-shi-qi-wen）：「任何使用自身能力选择你的其他玩家，会改为选中另一名邪恶玩家作为替代。」（缺少「在夜晚」）
- **百科依据**（半仙）：角色能力：「任何在夜晚使用自身能力选择你的其他玩家，会改为选中另一名邪恶玩家作为替代。」角色简介：「半仙的能力只会在夜晚被触发。在白天时，他的能力不会产生任何效果。」范例：「精神病患者攻击了半仙，半仙死亡，因为他的能力在白天无法被触发。」
- **影响**：该变体文本丢失了「在夜晚」这一时机限定，按其结算会把白天选择类能力（如精神病患者的攻击）也错误转移到邪恶玩家身上。同一 roleId 的其他变体（wei-ni-du-zun、shi-san-hang、yi-hua-jie-mu、ji-meng-ta-xiang）均含「在夜晚」，与本变体构成规则级包间矛盾。此外该变体 research.identityChanges「May grant, replace or transform an ability/character」与 teamChanges「May involve alignment, registration or evil/good interpretation」为模板化描述，与半仙仅转移选择目标的实际能力不符。
- **建议**：补回「在夜晚」时机限定，并清理该变体 research 中与角色无关的模板文本。

#### [medium] 气球驾驶员 (balloonist)
- **仓库现状**：多数变体 abilityText（an-du-chen-cang、jing-jue-gu-guo-shen-hua、xin-ren-shi-lian、sheng-dan-ye-jing-hun、dou-shi-qi-yuan-lao-hua-deng、yi-chu-hao-xi-lao-hua-deng、niu-zhuan-qian-kun、gai-tou-huan-mian、quan-mian-su-qing/jiu-zhuan-qian-ceng/huo-shan-jiao-tuan、da-quan-zai-wo、xian-xiang-huan-sheng、guo-jie-xin-yang、ye-ban-kuang-huan、wen-wu-shuang-quan、shen-fen-wei-ji、wang-bu-jian-wang、jing-hou-jia-yin、man-tian-gu
- **百科依据**（气球驾驶员）：角色能力：「每个夜晚，你会得知一名与上个夜晚得知的玩家角色类型不同的玩家。[+0~1外来者]」角色简介：「设置调整阶段，说书人可以决定是否让气球驾驶员添加一名额外的外来者。」「如果气球驾驶员中毒或醉酒，他可以得知与上一次得知玩家的角色类型相同的玩家。」
- **影响**：两个语义差异：(1) 设置数字——百科为说书人可选的 +0~1 外来者，旧文本强制 +1；(2) 运作方式——旧版「直到所有角色类型得知过一次」意味着类型用尽后不再醒来（chou-hai-ni-xing / wen-wu-shuang-quan 的源提示明言「如果所有类型均已被知晓……气球驾驶员不会醒来」），现行版本只要求与上一晚不同且每晚持续得知。同 roleId 下 catfishing、he-fang-jiao-zhong、si-dong-fei-dong、punchy（新版英文文本）与 chou-hai-ni-xing（新版中文文本）使用现行版本，与上述旧版变体构成规则级包间矛盾；且 chou-hai-ni-xing 在同一变体内混用新版能力文本与旧版夜间提示（highRiskNotes）。roleCopy.ability 与百科现行版本一致。
- **建议**：逐板确认实际使用的版本；确为旧版的在 research 标注版本差异，否则统一到百科现行文本，并修正 chou-hai-ni-xing 变体内部的新旧混用。

#### [medium] 理发师 (barber) — roleCopy.ability
- **仓库现状**：roleCopy.ability：「你死亡后，恶魔可选择两名玩家交换角色。」
- **百科依据**（理发师）：角色能力：「如果你死亡，在当晚恶魔可以选择两名玩家（不能选择其他恶魔）交换角色。」角色简介：「恶魔不能选择另一名恶魔玩家进行角色交换。」
- **影响**：面向用户的中文文案丢失了「（不能选择其他恶魔）」这一硬性目标限制——按此文案说书人可能允许恶魔选择另一名恶魔参与交换，直接改变结算结果；同时丢失「在当晚」的时机限定（交换只发生在理发师死亡的当晚）。各板子包 abilityText 与 complexKnowledge.reminders 均含此限制，仅 roleCopy 缺失。
- **建议**：roleCopy.ability 补回「（不能选择其他恶魔）」与「在当晚」：如「你死亡当晚，恶魔可以选择两名玩家（不能选择其他恶魔）交换角色。」

#### [medium] 侍臣 (courtier)
- **仓库现状**：roleCopy.ability："每局一次，夜晚选择一个角色，该角色醉酒 3 晚 3 天。"
- **百科依据**（侍臣）：百科角色能力："每局游戏限一次，在夜晚时，你可以选择一个角色：如果该角色在场，该角色之一从当晚开始醉酒三天三夜。"角色简介："侍臣不会得知自己成功或失败，因此侍臣可能会选到不在场的角色。"以及运作方式："侍臣只能让他选择的角色所对应的玩家其中之一醉酒。"
- **影响**：面向用户的中文文案丢失两个结算条件：(1) "如果该角色在场"——所选角色不在场时无事发生，文案写成无条件"该角色醉酒"；(2) "该角色之一"——场上有多个同名角色时只有其中一名玩家醉酒。丢失这两个限定会让用户误以为选择必然生效、且全部同名角色都醉酒。
- **建议**：roleCopy.ability 补回条件，如："每局一次，夜晚选择一个角色：若该角色在场，该角色之一醉酒 3 晚 3 天。"

#### [medium] dianyuzhang / repoVariants[].abilityText（老华灯及部分包）
- **仓库现状**：dou-shi-qi-yuan-lao-hua-deng、zhui-chai-qi-yuan-lao-hua-deng、wei-ni-du-zun 变体 abilityText："每个夜晚，你要选择一至三名玩家。如果明天白天其中之一被处决，其余玩家会在当晚死亡。……"；gui-jue-yi-xiang/sheng-shi-qi-wen 变体："……如果明天白天其中之一被处决……"；zi-gui-qi-ming 变体 research.possibleOutcomes："if one is executed tomorrow, others die that night"
- **百科依据**（典狱长）：角色能力："每个夜晚，你要选择至多三名玩家：如果明天白天他们之一死于处决，上次被你选择的其他玩家会在当晚死亡。否则，当晚他们之中会有一名玩家死亡。"；角色简介："如果下个白天，被典狱长选中的玩家之一死于处决……"；运作方式："如果被放置'判罚'提示标记的玩家死于处决，在该玩家角色标记旁放置'死于今日'提示标记。"
- **影响**：触发条件不同：百科要求"死于处决"（死亡实际发生）才触发连坐；上述包变体写成"被处决"即触发。当被选中的玩家被处决但存活（如受茶艺师/水手/魔鬼代言人类保护）时，两种文本的结算分歧：旧文本会让其余被选者全部死亡，百科文本则进入"否则"分支只有一人死亡。同一 roleId 在不同包间因此互相矛盾——li-beng-le-huai、zhuo-yue-bi-fang、shi-san-hang、hu-yan-luan-yu、yi-hua-jie-mu、ji-meng-ta-xiang 及 roleCopy 使用与百科一致的"死于处决"，而上述包使用"被处决"。zi-gui-qi-ming 的 abilityText 正确但 research 摘要又写成 "is executed"。
- **建议**：统一各包 abilityText 与 research 摘要为百科条件"死于处决"，或在确认老华灯包刻意保留旧版规则时在 research 中显式注明差异，避免跨包混淆。

#### [medium] 画皮 (huapi)
- **仓库现状**：abilityText（shi-san-hang）与 roleCopy.ability："在你的首个夜晚，你要选择一名存活玩家：他死亡但会被当作存活。当他下一次死亡时，他重生，随后你重获能力。"
- **百科依据**（画皮）：百科角色能力："当他下一次即将死亡时，他重生，随后你重获能力。"；角色简介："下一次即将死亡时，画皮会阻止这次死亡，并将他复活"；规则细节："如果画皮由于任何原因无法阻止这次死亡，那么画皮无法将他复活，也不会重获能力"
- **影响**：仓库文本丢掉了"即将"二字：百科的结算是画皮阻止这次死亡（免死+复活，不宣布死亡），玩家实际并未再次死亡；仓库写成"当他下一次死亡时，他重生"，暗示死亡先发生再复活，会误导说书人先宣布死亡/触发死亡触发能力后再复活，改变结算顺序与结果。
- **建议**：abilityText 与 roleCopy 均改回"当他下一次即将死亡时，他重生"，并在 research 中注明是阻止死亡而非死亡后复活。

#### [medium] 酒保 (jiu_bao_outsider / jiubao) 旅行者除外条款
- **仓库现状**：abilityText 与 roleCopy.ability（两个 roleId 的全部变体）："与你邻近的善良玩家之一醉酒……"（无"旅行者除外"）
- **百科依据**（酒保）：角色能力："与你邻近的善良玩家（旅行者除外）之一醉酒……"；角色简介："酒保的醉酒效果不会对旅行者生效。"；运作方式："让一名与酒保邻近的善良玩家（旅行者除外）醉酒"。
- **影响**：仓库全部文本变体和 roleCopy 都漏掉了官方能力文本中的"（旅行者除外）"限定。当酒保邻近坐着善良旅行者时，按仓库文本旅行者会成为合法醉酒目标，按百科必须跳过旅行者选择下一名善良玩家，结算目标错误。涉及 scripts：tong-yan-wu-ji、zhui-chai-qi-yuan-lao-hua-deng、gui-jue-yi-xiang、sheng-shi-qi-wen、yi-hua-jie-mu。
- **建议**：在 abilityText 与 roleCopy.ability 中恢复"（旅行者除外）"。

#### [medium] 酒保 (liu_gong_jiu_bao)
- **仓库现状**：abilityText/roleCopy.ability：「与你邻近的善良玩家之一醉酒……」（无旅行者除外限定）
- **百科依据**（酒保）：角色能力：「与你邻近的善良玩家（旅行者除外）之一醉酒……」角色简介：「酒保的醉酒效果不会对旅行者生效。」
- **影响**：仓库文本丢失「（旅行者除外）」这一硬性目标限制。当酒保邻座存在善良旅行者时，按仓库文本旅行者可能被选为醉酒对象，而按百科必须跳过旅行者去找下一名善良玩家，醉酒落点不同会改变结算。
- **建议**：在 abilityText 与 roleCopy.ability 中补回「（旅行者除外）」。

#### [medium] 数学家 mathematician — roleCopy.ability
- **仓库现状**：roleCopy.ability: “每晚得知上个白天以来有多少玩家的能力异常生效。”
- **百科依据**（数学家）：百科角色能力：“每个夜晚，你会得知有多少名玩家的能力因为其他角色的能力而未正常生效。（从上个黎明到你被唤醒时）”角色简介：“数学家的能力不会检测数学家自身是否未正常生效”。
- **影响**：roleCopy 丢失了“因为其他角色的能力”这一硬性归因条件——只有由其他角色能力导致的异常才计数（如说书人裁量、死亡导致的能力失效、数学家自身异常等均不计入）。省略该条件会导致面向玩家/说书人的文案把任何异常都算进数字，改变结算结果。complexKnowledge.reminders（“因其他角色能力而异常生效”）保留了该条件，仅 roleCopy 丢失。
- **建议**：改为：“每晚得知从上个黎明以来，有多少名玩家的能力因其他角色的能力而未正常生效。”

#### [medium] 麻脸巫婆 (pithag) roleCopy.ability
- **仓库现状**：roleCopy.ability: "每晚选择一名玩家和一个角色；若该角色不在场，目标变成该角色。"（sameAsAbilityText: false）
- **百科依据**（麻脸巫婆）：角色能力："每个夜晚*，你要选择一名玩家和一个角色，如果该角色不在场，他变成该角色。如果因此创造了一个恶魔，当晚的死亡由说书人决定。"；运作方式："除首夜外的每个夜晚，唤醒麻脸巫婆。"
- **影响**：面向用户的中文文案整句丢失了"如果因此创造了一个恶魔，当晚的死亡由说书人决定"这一硬结算规则（创造恶魔当晚的死亡改由说书人裁量，是麻脸巫婆最影响结算的部分）；同时把"每个夜晚*"（带星号，首夜不行动）简化成"每晚"，会误导说书人在首个夜晚也唤醒麻脸巫婆。注意同批次 roleId 为 pit-hag 的条目 roleCopy 保留了完整原文，两个条目行为不一致。
- **建议**：roleCopy.ability 恢复完整能力文本：补回恶魔创造条款，并保留"每个夜晚*"或写明"除首夜外的每个夜晚"。

#### [medium] 瘟疫医生 (plague_doctor / plaguedoctor) roleCopy.ability 及多数 abilityText 变体
- **仓库现状**：roleCopy.ability（plague_doctor 与 plaguedoctor 两条均为）: "如果你死亡，说书人获得一个不在场的爪牙能力。"；同样文本出现在 xin-ren-shi-lian、chou-shen-na-ji、long-zhong-jin-que、miao-shan-feng-xian、wang-bu-jian-wang、jing-hou-jia-yin、mo-ni-zhi-jiao、ji-meng-ta-xiang 等变体的 abilityText，以及 research.setupImpact (Chou Shen Na Ji): "Requires an out-of-play Minion ability if it dies."
- **百科依据**（瘟疫医生）：角色能力："当你死亡时，说书人会获得一个爪牙能力。"；运作方式："将一个不在场的爪牙角色标记放置在魔典左侧的正中位置……或直接用该标记标记一个在场的爪牙角色。"
- **影响**：百科官方能力文本没有"不在场"限定，且运作方式明确允许说书人直接标记一个在场的爪牙角色（相克规则中恐惧之灵/哥布林等条目也以在场爪牙为前提："改为一名爪牙玩家获得此能力"）。仓库给能力附加了"不在场"这一百科没有的硬条件，会错误限制说书人的选择。另有包间矛盾：wu-yin-cang-sheng 与 zi-gui-qi-ming 变体的 abilityText 为"如果你死亡，说书人获得一个爪牙能力。"（无"不在场"），与上述各包语义冲突；Carousel 英文变体 "When you die, the Storyteller gains a Minion ability." 与百科一致。
- **建议**：roleCopy 与中文 abilityText 统一改为"当你死亡时，说书人会获得一个爪牙能力"（不加"不在场"），必要时在 research 里注明说书人可选在场或不在场的爪牙能力。

#### [medium] 暴乱 (riot) — xian-xiang-huan-sheng 变体 abilityText 与 research
- **仓库现状**：abilityText（scripts: xian-xiang-huan-sheng）："被提名的玩家死亡，但他可以立刻再次发起提名（第三天白天他必须这么做）。在第三个白天结束时，邪恶阵营获胜。[所有爪牙都是暴乱]"；research.setupImpact："All Minions are Riot; templates represent Minion slots as repeatable Riot seats."；research.possibleOutcomes："Day 3 evil win condition is reminder-only."
- **百科依据**（暴乱）：角色能力："在第三个白天，所有爪牙会变成暴乱，当天被提名的玩家会立即死亡且必须再次提名一名存活的玩家。"；角色简介："在第三天，每名被提名的玩家都会立即死亡"、"如果所有暴乱玩家死亡，善良阵营获胜"；角色简介："爪牙们可以在第三天的提名阶段开始时变成暴乱。"
- **影响**：该变体与百科存在三处结算级冲突：(1) 时机错——变体文本让"被提名的玩家死亡"从游戏一开始每天生效（仅第三天必须再提名），而百科明确只有第三个白天被提名者才会死亡；(2) 添加了百科没有的胜负硬条件"在第三个白天结束时，邪恶阵营获胜"（百科的结束条件是所有暴乱死亡→善良获胜，或提名链进行到仅剩两名玩家）；(3) 设置阶段错——[所有爪牙都是暴乱]及 setupImpact 让爪牙位在设置时即为暴乱，而百科为"第三个白天（或第三个夜晚展示后）爪牙才变成暴乱"，设置时仍是普通爪牙。该文本疑似旧版 Riot 英文的翻译，与百科（现行文本）不符。
- **建议**：将 xian-xiang-huan-sheng 变体的 abilityText 与 research 改为与百科一致的第三天版本；若该剧本源 JSON 确实使用旧版文本，应在 research 中显式标注与官方现行规则的差异，避免被当作通用暴乱规则。

#### [medium] seamstress / roleCopy.ability
- **仓库现状**：roleCopy.ability: "每局一次，夜晚选择两名玩家，得知他们是否同阵营。"
- **百科依据**（女裁缝）：百科角色能力："每局游戏限一次，在夜晚时，你可以选择除你以外的两名玩家：你会得知他们是否为同一阵营。"；"请记住，女裁缝不能选择自己。他必须选择两名其他玩家。"
- **影响**：中文展示文案丢失了"除你以外"这一目标限制，按此文案玩家可能选择自己作为两名目标之一，属于对合法目标的硬条件遗漏。
- **建议**：改为"每局一次，夜晚可选择除你以外的两名玩家，得知他们是否同阵营。"

#### [medium] shijie / yi-hua-jie-mu 变体 abilityText 与 research.possibleOutcomes
- **仓库现状**：abilityText（scripts: yi-hua-jie-mu）: "每个夜晚限一次，所有玩家在使用自身能力选择邪恶玩家时会改为选中你，即使你已死亡。"；research.possibleOutcomes: "Once each night, all players using their ability to choose an evil player choose the Envoy instead."
- **百科依据**（使节）：百科角色能力："每个夜晚限一次，一名玩家在使用自身能力选择邪恶玩家时会改为选中你，即使你已死亡。"；角色简介："如果使节的能力在当晚已经被触发过一次了，那么之后有其他玩家使用能力进行选择时，就无法再被使节影响。"
- **影响**：百科是每晚仅"一名玩家"的一次选择被改向使节，该变体写成"所有玩家"（research 同样写 all players），虽保留了每晚限一次，但主语错误会让 AI 误以为当晚所有指向邪恶玩家的选择都改向使节。
- **建议**：将"所有玩家"改回"一名玩家"，research 同步修正为 one player's choice per night。

#### [medium] 提刑官 (tixingguan)
- **仓库现状**：abilityText（全部 9 个 repoVariants）与 roleCopy.ability（sameAsAbilityText=true）："在你首次提名玩家后，你会在当晚得知他的角色。外来者会被你的能力当作爪牙或恶魔角色。"；多个 research.highRiskNotes 同样断言 "Outsider targets are treated as Minion or Demon roles by this ability"（shi-yan-jiao-chi、wu-yin-cang-sheng、zi-gui-qi-ming、bai-zhou-wei-shi、jiu-quan-song-ge、man-tang-hong）
- **百科依据**（提刑官）：角色能力："在你首次提名玩家后，你会在当晚得知他的角色。恶魔会被你的能力当作善良角色。"；运作方式："如果被标记了'已提名'的玩家角色是恶魔，向提刑官展示一个镇民或外来者的角色标记。"；角色简介："恶魔玩家会被提刑官当作某个镇民或者外来者，由说书人来决定"
- **影响**：能力第二句完全相反：百科规定错误登记方向是【恶魔→被当作善良角色（镇民/外来者）】，仓库全部文本却写成【外来者→被当作爪牙或恶魔】。两者会导致说书人对提名结果给出完全不同的答案（百科版：提名恶魔时必须展示一个善良角色标记，提名外来者时如实展示；仓库版：提名外来者时要展示邪恶角色标记，提名恶魔时如实展示）。仓库 9 个变体（yi-ye-yu-long-wu、zhui-chai-qi-yuan-lao-hua-deng、shi-yan-jiao-chi、sheng-shi-qi-wen、wu-yin-cang-sheng、zi-gui-qi-ming、bai-zhou-wei-shi、jiu-quan-song-ge、man-tang-hong 等）之间互相一致，均与百科冲突。
- **建议**：以百科为准修正 abilityText、roleCopy.ability 及相关 research.highRiskNotes 为"恶魔会被你的能力当作善良角色"；若这些剧本中确实存在同名但规则不同的自制变体，应拆分为不同 roleId 并分别对照，不应与该百科页面绑定。

#### [medium] 方古 (fanggu) roleCopy.ability 丢失"变成邪恶的"阵营转变与"每个夜晚*"首夜除外时机
- **仓库现状**：roleCopy.ability："每晚选择一名玩家死亡；第一次杀死外来者时，该外来者变成方古而你死亡；开局多一名外来者。"
- **百科依据**（方古）：百科《方古》角色能力："每个夜晚*，你要选择一名玩家：他死亡。被该能力杀死的外来者改为变成邪恶的方古且你代替他死亡…[+1外来者]"；运作方式："除首个夜晚外的每个夜晚，唤醒方古"；角色简介："外来者变成邪恶的方古"。
- **影响**：两处语义丢失：(1) "每晚"丢掉了官方文本的"*"（首夜不行动），按此文案说书人会在首夜唤醒方古杀人，直接改变结算；(2) 丢掉"邪恶的"——钟楼规则中角色变化默认不改阵营，跳转时外来者转为邪恶是该能力的硬条件（运作方式明确要"向下的大拇指"示意转为邪恶阵营），省略后新方古的阵营归属会被误判，影响胜负判定。complexKnowledge.reminders 虽有"目标变邪恶方古"，但面向用户的 roleCopy 本身缺失。
- **建议**：roleCopy 改为："每个夜晚*（首夜除外），选择一名玩家死亡；首次成功杀死外来者时，该外来者变成邪恶的方古而你代替他死亡（每局仅一次）；[+1外来者]"。

#### [low] 炼金术士 (alchemist) — 多数变体 abilityText 为旧版「不在场的爪牙角色的能力」
- **仓库现状**：9 组变体 abilityText：「你拥有一个不在场的爪牙角色的能力。」（无「说书人可能会要求你更换选择」条款）
- **百科依据**（炼金术士）：角色能力：「你拥有一个爪牙角色的能力。当你使用能力时，说书人可能会要求你更换选择。」角色简介：「炼金术士通常会获得一个不在场爪牙的能力，但可以获得一个在场爪牙的能力。」「如果炼金术士获得了一个可以选择的能力，比如投毒者或维齐尔，说书人可以让炼金术士换个选择，炼金术士就必须更换自己的选择。」
- **影响**：旧文本把「不在场」写成硬条件（百科现行规则允许获得在场爪牙能力），并丢失「说书人可要求更换选择且必须更换」这一结算关键条款。板子包之间也互相矛盾：bing-gong-ban-shi、ye-mu-jiang-lin（新版中文）和 punchy（新版英文官方原文）为现行文本，与 jing-jue-gu-guo-shen-hua、xin-ren-shi-lian、xian-xiang-huan-sheng、chou-shen-na-ji、long-zhong-jin-que、niu-zhuan-qian-kun、heng-xing-ba-dao、shen-fen-wei-ji、shuo-shu-ren-zhi-nu、fei-fan-ying-tian、bao-meng-mi-tuan 的旧文本冲突。roleCopy.ability 本身与百科一致（无需修改）。
- **建议**：将旧文本变体更新为百科现行文本，或在 research 中标注该板子使用旧版并写明差异（不在场限制、无更换选择条款）。

### 3.3 关键细节遗漏

#### [high] 召唤师 research/complexKnowledge 遗漏胜负硬条件
- **仓库现状**：complexKnowledge.reminders: "开局没有恶魔，召唤师获得 3 个伪装；第 3 夜选择玩家成为邪恶恶魔。"、"新恶魔当晚能否行动和第二恶魔死亡等连锁必须人工核对。"（requiredContext 仅有"是否仍能发动"，全部 research 与 complexKnowledge 均未提及召唤失败时的胜负判定）
- **百科依据**（召唤师）：角色简介："如果召唤师因为某些原因无法创造新的恶魔（死亡或在第三个夜晚中毒等），善良阵营获胜。"；范例："在游戏的首个白天，召唤师被处决了。善良阵营获胜。"
- **影响**：召唤师无法创造恶魔（死亡、第三夜中毒/醉酒等）时善良阵营立即获胜，这是改变游戏结局的硬性胜负条件。仓库两个 repoVariants 的 research 与 complexKnowledge 均未记录，AI 说书人在首日处决召唤师后不会知道应立即结束游戏。
- **建议**：在 complexKnowledge.reminders 中补充："若召唤师在创造恶魔前死亡，或在第三个夜晚因中毒/醉酒等无法创造恶魔，善良阵营获胜。"

#### [medium] 炼金术士 — research.setupImpact / complexKnowledge 遗漏「设置阶段生效」
- **仓库现状**：除 chou-shen-na-ji（setupImpact: "May need an out-of-play Minion ability."）外，全部变体 research.setupImpact 为空；complexKnowledge.reminders（「炼金术士拥有一个爪牙能力……」「炼金术士仍是善良镇民……」）也未提及设置阶段效果。
- **百科依据**（炼金术士）：角色简介：「如果炼金术士获得的爪牙能力会导致在设置阶段添加或移除角色，这一能力也会在设置阶段生效。」范例：「炼金术士拥有男爵的能力，给游戏带来了两个额外的外来者。」角色能力类型：「获得能力、设置调整」。
- **影响**：炼金术士获得男爵等带设置效果的爪牙能力时会改变开局角色配置（例如 +2 外来者），这是开局结算的硬规则；仓库的规则摘要和共享复杂知识均未覆盖，AI 在开局校验人数配置时会得出错误结论。
- **建议**：在 complexKnowledge.reminders 及各变体 setupImpact 中补充「所获爪牙能力若含设置阶段效果（如男爵），在设置阶段照常生效」。

#### [medium] 无神论者 (atheist) — 胜负判定细节缺失
- **仓库现状**：各变体 research.possibleOutcomes 仅记录单侧结果，如「ST may break rules; if ST is executed, good wins even if Atheist is dead.」（yi-chu-hao-xi-lao-hua-deng 等）；complexKnowledge 为 null。
- **百科依据**（无神论者）：角色简介：「如果无神论者不在场，但说书人被处决了，那么邪恶阵营获胜。」「善良阵营会在仅剩两名玩家存活时落败。」「任何存活玩家都可以提名说书人，并且如果存活玩家数量一半或以上的玩家都参与投票，说书人就会被处决。（注：与常规的处决方式相同……）」
- **影响**：处决说书人的双面判定（无神论者在场→善良胜；不在场→邪恶胜）是该角色的核心结算规则，仓库所有变体只收录了「好人胜」一侧；「仅剩两名玩家存活时善良落败」与「提名说书人需满足常规处决条件」两条硬性规则也未收录。对判定终局的说书人有直接误导风险。
- **建议**：在 research 或 complexKnowledge 中补充上述三条判定规则。

#### [medium] 报丧女妖 (banshee) — 触发与终局细节缺失
- **仓库现状**：research（xin-kou-ci-huang、wang-bu-jian-wang、ku-mu-feng-chun）仅记录「Only Demon kill triggers; ST updates vote/nominations manually」等；roleCopy.prompt 为通用提示；complexKnowledge 为 null。
- **百科依据**（报丧女妖）：运作方式：「如果所有善良玩家都已死亡，游戏继续。因为善良阵营仍然有可能因为报丧女妖还能发起提名而获胜。」范例：「报丧女妖中毒了。随后奥赫杀死了报丧女妖。无人得知报丧女妖死亡，并且……无法发起提名，且只有最后一票。」规则细节：「如果报丧女妖在获得死亡能力时清醒健康，但在随后醉酒中毒，她无法发起提名，且投票需要消耗投票标记。」
- **影响**：三条对结算有实际影响的细节在仓库中完全缺失：(1) 被恶魔杀死时若醉酒中毒则不触发、不播报；(2) 觉醒后再醉酒中毒会暂时失去双提名/双票；(3) 觉醒的报丧女妖使「全体善良玩家死亡」时游戏不结束——这一条直接改变终局判定。
- **建议**：补充 complexKnowledge（requiredContext：是否被恶魔所杀、被杀时是否醉酒中毒；reminders：觉醒后全善良死亡游戏继续）。

#### [medium] 半仙 (banxian) 与刺客 (assassin) 的互动例外
- **仓库现状**：banxian research.possibleOutcomes（ji-meng-ta-xiang）：「Night abilities that would choose Banxian are redirected to another evil player.」；assassin complexKnowledge.reminders：「每局一次，目标死亡，即使通常不能死亡。」——两侧摘要对「刺客选中半仙」给出相反结论。
- **百科依据**（半仙）：半仙页规则细节：「刺客：如果刺客攻击了半仙，半仙会直接死亡，并且不会将刺客的效果转移到邪恶玩家身上。」
- **影响**：ji-meng-ta-xiang 板子同时收录刺客与半仙（刺客变体 scripts 含 ji-meng-ta-xiang）。仓库两侧规则摘要在该交互上互相冲突（半仙侧：夜晚选择一律转移；刺客侧：目标必死），且没有任何字段收录百科明确给出的裁定（刺客优先，不转移，半仙直接死亡）。同板共存使该遗漏具有实际结算影响。
- **建议**：在半仙的 research.highRiskNotes（至少 ji-meng-ta-xiang 变体）增补「刺客攻击半仙时不转移，半仙直接死亡」。

#### [medium] 理发师 (barber) — complexKnowledge / research 遗漏「阵营不变」
- **仓库现状**：complexKnowledge.reminders 仅有：「理发师今天或今晚死亡后，恶魔可以选择两名非另一恶魔玩家交换角色。」「交换身份必须由说书人确认并追加事件。」requiredContext 仅列「理发师是否死亡／恶魔选择的两名玩家／是否包含另一名恶魔」，全部 repoVariants 的 research 也均未提及阵营处理。
- **百科依据**（理发师）：角色简介：「玩家阵营在交换角色时保持不变。每名玩家都会得知他们变成了什么角色。」运作方式：「如果玩家的新角色标记与其所属阵营颜色不同，将其倒置以代表相反阵营。」「如果一名善良玩家变成爪牙或恶魔，或者是一名邪恶的玩家变成镇民或外来者，你可能需要提醒他阵营未改变。」
- **影响**：「交换角色时阵营保持不变」是理发师结算的关键硬规则（善良玩家换到爪牙/恶魔角色仍为善良，反之亦然），直接影响后续注册、胜负判定与私聊话术，但 complexKnowledge 与所有 research 摘要都没有记录这一点，AI 结算跨阵营角色交换时极易把阵营一并改掉。
- **建议**：在 complexKnowledge.reminders 增加「交换角色时双方阵营保持不变，仅角色与能力变化；每名被交换玩家会得知自己的新角色」。

#### [medium] 驱魔人 (exorcist)
- **仓库现状**：roleCopy.ability："每晚选择一名玩家；……"（无"与上个夜晚不同"，无首夜除外标记）
- **百科依据**（驱魔人）：百科"角色能力"："每个夜晚*，你要选择一名玩家（与上个夜晚不同）……"；"角色简介"："除首个夜晚以外的每个夜晚……驱魔人不能连续两个夜晚选择同一名玩家。"
- **影响**：roleCopy 写作"每晚"，丢失了两个硬性条件：(1) 夜晚*表示首夜不行动，按文案会在首夜错误唤醒驱魔人；(2) "与上个夜晚不同"的选择限制被删去，按文案会允许连续两晚选同一人。仓库 repoVariants 的 abilityText 和 ji-meng-ta-xiang/chuan-qi-zhi-ye 的 highRiskNotes（"Must choose different player than previous night"）都保留了该限制，仅前端文案缺失。
- **建议**：roleCopy.ability 改为"每个夜晚*（首夜除外），选择一名与上晚不同的玩家……"。

#### [medium] 共情者 (empath)
- **仓库现状**：complexKnowledge.reminders 仅有："每夜得知两侧存活邻居中邪恶数量。"；requiredContext："两侧存活邻居"、"邻居阵营"。各 research 摘要也无夜内时序说明。
- **百科依据**（共情者）：百科"角色简介"："共情者在恶魔之后行动，因此如果恶魔杀死了共情者邻近玩家之一，共情者不会得知有关那位现在已死的玩家的信息。共情者的信息以当晚黎明时的状态为基准，而非黄昏。"
- **影响**：对结算有直接影响的时序规则缺失：共情者信息以当晚黎明状态为准——若恶魔当晚杀死了共情者的邻座，须跳过该新死者、以更远的下一名存活玩家计算；当晚复活的玩家也计入。这是极常见的结算场景（恶魔刀共情者邻座），complexKnowledge 与所有 research 摘要均未提及，AI 可能按黄昏（行动前）状态计数导致给错数字。跳过已死玩家的静态规则在部分变体（如 shi-yan-jiao-chi "Skip dead players before finding living neighbors"）中有，但"当晚新死亡也要跳过/黎明基准"没有任何变体覆盖。
- **建议**：在 complexKnowledge.reminders 中补充："信息以当晚黎明状态为准：共情者在恶魔之后行动，当晚被杀的邻座按已死处理，跳到下一名存活玩家"。

#### [medium] 镜像双子 (evil_twin / eviltwin)
- **仓库现状**：research.possibleOutcomes（ying-su-hua-kai）："Evil Twin and good twin know each other; evil wins if good twin executed; good cannot win while both live."；（yu-gai-mi-zhang）："if good twin is executed, evil wins"——均为无条件表述。
- **百科依据**（镜像双子）：百科"角色简介"："死去的镜像双子会失去能力，如果在他死后处决善良双子，邪恶阵营不会获胜。"
- **影响**：两个 roleId 的所有 research 摘要都把"处决善良双子→邪恶获胜"写成无条件规则，缺少百科的关键限定：镜像双子（邪恶方）死亡后能力失效，此后处决善良双子不会触发邪恶获胜。缺少该限定会让 AI 在邪恶双子已死的局面下错误判定邪恶阵营胜利，属于改变胜负判定的遗漏。
- **建议**：在 evil_twin/eviltwin 的 research.highRiskNotes 或 possibleOutcomes 中补充："仅当镜像双子存活（能力有效）时，处决善良双子才导致邪恶获胜"。

#### [medium] 赶尸人 research 缺失“活尸失去能力”核心规则
- **仓库现状**：各变体 research 仅有「Adjacent Townsfolk may be treated as alive on first death.」「First-death alive registration marker.」「Neighboring Townsfolk are treated as alive the first time they die.」等；complexKnowledge 为 null。
- **百科依据**（赶尸人）：角色简介：「“活尸”状态与醉酒中毒相似：玩家会失去自身的能力，如果玩家的能力会让他自己获得信息，则有可能获得错误信息。」「“活尸”状态下的玩家死亡时，相关的“死亡时触发的能力”不会触发……而“得知自己死亡”的能力会正常触发。」
- **影响**：所有变体的规则摘要都只写“被当作仍然存活”，没有说明该玩家实际上已死亡、失去能力、死亡触发型能力不再触发。说书人若照摘要继续给“活尸”玩家正常结算能力和真实信息，结算结果会被直接改变；这是该角色最容易错的结算点。另有“死亡被阻止则不计首次死亡”“活尸为一次性变化、不随赶尸人失效而恢复”等硬规则也全部缺失。
- **建议**：在 research/共享知识中补充：活尸=实际死亡+失去能力+可给错误信息；死亡触发能力不触发；死亡被阻止不算首次死亡。

#### [medium] 歌伶 research 缺失回溯判定与醉酒中毒时点
- **仓库现状**：research.highRiskNotes：「Audience consent and demon check are manual.」（jiu-quan-song-ge）、「Audience consent and Demon check are manual.」（ji-meng-ta-xiang）；roleCopy.prompt 仅为通用的「先核对毒醉、死亡和保护」。
- **百科依据**（歌伶）：角色简介：「只要歌伶在当晚清醒健康，即使她在选择观众时醉酒中毒，但观众中包含恶魔，那么歌伶就会在夜晚死亡。」「如果非恶魔玩家在被选中作为观众后，变成了恶魔角色，歌伶不会因此死亡。」
- **影响**：歌伶是回溯型能力：是否死亡以“当晚结算时”是否清醒健康为准（选观众时醉酒中毒不影响），且只看选择观众那一刻对方是否恶魔（事后变恶魔不触发）。这两个硬条件在全部变体和文案中都未体现，说书人按直觉“选择时醉酒则能力无效”结算会得出相反结果。百科提示标记还规定当晚醉酒中毒时直接移除“死亡”标记。
- **建议**：在 research.highRiskNotes 补充：死亡判定看当晚清醒健康；观众身份以选择当刻为准；死亡标记不论选择时是否醉酒中毒均先放置。

#### [medium] 占卜师 缺失“可选死人、死亡恶魔仍为是”规则
- **仓库现状**：complexKnowledge.requiredContext 仅有「两名目标 / 红鲱鱼 / 是否含恶魔」；全部 24 个变体的 research 均未提及可以选择死亡玩家或自己。
- **百科依据**（占卜师）：角色简介：「占卜师可以选择任意两名玩家——无论他们存活与否，甚至可以选择自己。如果占卜师选中了已死亡的恶魔，仍然会得知“是”。」范例：「占卜师选择了一名存活的小恶魔与一名死亡的小恶魔，并得知了“是”。」
- **影响**：选中已死亡的恶魔仍必须回答“是”，且目标可为死人或占卜师自己。仓库数据完全没有覆盖这一点，AI/说书人可能拒绝死亡目标或对死亡恶魔回答“否”，直接给出错误信息。
- **建议**：在 complexKnowledge.reminders 增加：目标不限存活状态、可选自己；死亡恶魔被选中仍回答“是”。

#### [medium] 造谣者 complexKnowledge（结算时机细节缺失）
- **仓库现状**：complexKnowledge.reminders：“白天声明为真时，今晚一名玩家死亡。”；requiredContext：“公开声明”“声明真伪”“夜晚死亡目标”（未包含造谣者当晚的存活/醉酒中毒状态）
- **百科依据**（造谣者）：角色简介：“如果造谣者在白天处于醉酒或中毒时发表了一个正确的声明，但当晚造谣者能力触发时他恢复了清醒和健康，那么说书人仍然会杀死一名玩家。”；范例：“当晚，造谣者被恶魔杀死。造谣者失去了自己的能力，因此不会有任何人因为他正确的声明而死亡。”；提示标记移动条件：“若此时造谣者醉酒中毒，或造谣者死亡或离场，则直接移除该标记。”
- **影响**：造谣者是回溯型能力：是否造成死亡取决于夜晚轮到其结算时造谣者的状态（存活、清醒健康），而不是白天发表声明时的状态。complexKnowledge 与所有 research 摘要都只写“声明为真→今晚死人”，漏掉了这一硬条件：声明为真但造谣者在结算前死亡/醉酒/中毒则无人死亡；白天醉酒但夜晚清醒则仍然死人。该遗漏会直接改变结算结果。
- **建议**：在 reminders 中补充“以夜晚结算时造谣者的存活与清醒状态为准”，并在 requiredContext 中加入“造谣者当晚是否存活且清醒健康”。

#### [medium] 调查员 (investigator)
- **仓库现状**：roleCopy.ability："首夜得知两名玩家中有一名是某个爪牙，也可能被误导。"
- **百科依据**（调查员）：百科角色能力："在你的首个夜晚，你会得知两名玩家和一个爪牙角色：这两名玩家之一是该角色（或者你会得知没有爪牙在场）。"
- **影响**：前端文案遗漏了"（或者你会得知没有爪牙在场）"这一信息分支——在仅有间谍等注册为非爪牙、或场上无爪牙的情况下，说书人可以给出"0"信息，这是结算时的合法信息形态；同时文案额外添加了能力原文没有的"也可能被误导"（该表述属于中毒/醉酒与注册干扰的通用规则，不是调查员能力的一部分）。complexKnowledge.reminders（"开局得知两名玩家中一人是某爪牙。"）同样缺少 0 信息分支。
- **建议**：roleCopy 补上"或得知没有爪牙在场"分支，去掉"也可能被误导"；reminders 同步补充。

#### [medium] 锦衣卫 (jinyiwei / jin_yi_wei) 结算关键细节缺失
- **仓库现状**：research.stateChanges (bai-zhou-wei-shi): “If protected target dies before next dusk, Jinyiwei dies instead.”；(nuo-fu-jiu-xing): “May replace a protected target's death before next dusk.”——所有变体（含 jin_yi_wei 的 liu-gong-fen-dai、tong-yan-wu-ji）及 complexKnowledge (null) 均无更多结算规则。
- **百科依据**（锦衣卫）：“锦衣卫的能力造成的死亡源自于锦衣卫自身。原本的死亡效果已经被锦衣卫的能力阻止，不会再继续触发因为原本的死亡而导致的一系列效果。”（范例：小恶魔自杀被阻止，“也就不会有其他爪牙因此变成小恶魔”）；“锦衣卫的能力在白天也能触发。处决和流放导致的死亡……都能使锦衣卫成功保护他的目标玩家”；“已经死亡的锦衣卫失去能力……锦衣卫只能成功保护目标玩家一次。”
- **影响**：仓库摘要只写了“目标死亡则锦衣卫代替死亡”，缺失三条会直接改变结算结果的硬规则：(1) 原死亡被阻止后其连锁效果不再触发（如小恶魔自杀不传位、方古击杀外来者不转化）；(2) 保护在白天（处决/流放等）同样触发；(3) 死亡的锦衣卫失去能力，保护只成功一次，且目标未真正死亡时不消耗。AI 说书人若只依据现有摘要，遇到小恶魔自杀+锦衣卫保护这类局面会错误地继续处理传位。
- **建议**：在 research.stateChanges/highRiskNotes 或 complexKnowledge 中补充上述三条百科结算规则（两个 roleId 都需要）。

#### [medium] 禁卫军 (jinweijun, sheng-shi-qi-wen) 夜间处决细节缺失
- **仓库现状**：research.stateChanges: “May create, prevent, delay, redirect or react to death/execution.” / “May create or punish a madness requirement.”；highRiskNotes: “Madness judgment and penalties are storyteller discretion.”——无任何关于处决时机与处决次数限制的说明，complexKnowledge 为 null。
- **百科依据**（禁卫军）：“如果有玩家在晚上表达了想要死亡，那么你也可以在当晚处决他，这不算在每个白天的一次处决限制里。”；“处决必须立即执行。如果一名曾经想要死亡的玩家开始表现出求生的欲望，或者他表达自己想要死亡的想法已经过去了一段较长的时间，那么你就不能够在之后将他处决。”；“在白天执行的处决惩罚计入每个白天的处决限制。”
- **影响**：禁卫军的核心结算点在于：夜间也可处决且不占用白天的处决限制、白天处决计入限制、处决必须在玩家表达想死时立即执行（事后不可补处决）。这些规则决定“当天还能不能再处决一人”“现在还能不能处决他”，仓库 research 全部缺失，AI 按现有摘要无法正确裁定。
- **建议**：在 research 或 complexKnowledge 中补充夜间处决不计入白天限制、白天处决计入限制、必须立即执行三条规则。

#### [medium] 卡扎力 (kazali) complexKnowledge
- **仓库现状**：complexKnowledge.reminders："开局由卡扎力指定哪些玩家成为哪些爪牙，并可能修正外来者人数。"；complexKnowledge.aiCan："提醒可选爪牙必须来自本板子"（全部字段均未提及爪牙角色不可重复与中途创造规则）
- **百科依据**（卡扎力）：角色简介："他不能选择让多名玩家变成同一个爪牙角色。"；"如果卡扎力在游戏中途被创造，他不会选择玩家成为新的爪牙。"；运作方式："重复这个流程，直到场上有与初始设置时同等数量的爪牙。"
- **影响**：共享复杂角色知识只覆盖了"爪牙须来自本板子"，遗漏了三条对首夜结算有直接约束的规则：(1) 不能让多名玩家变成同一个爪牙角色；(2) 选择次数等于初始设置的爪牙数量；(3) 游戏中途被创造的卡扎力不再选择新爪牙。缺少 (1) 时 AI 可能起草出两个相同爪牙的开局方案，缺少 (3) 时可能在中途变身场景错误触发爪牙分配流程。各 repoVariants 的 research 字段同样没有这三条。
- **建议**：在 complexKnowledge.reminders/aiCannot 中补充：爪牙角色不可重复、选择次数等于初始爪牙数、中途被创造不选择爪牙。

#### [medium] 痢蛭 (lleech)
- **仓库现状**：complexKnowledge.reminders：「痢蛭只有在宿主死亡时才死亡；宿主和痢蛭死亡都要人工核对。」（无醉酒/中毒例外）
- **百科依据**（痢蛭）：规则细节：「当痢蛭醉酒或中毒时，宿主恢复健康。……如果痢蛭在醉酒或中毒时死亡，他死亡，因为他的能力在醉酒/中毒时无法阻止死亡。」「如果宿主在这个期间死亡，痢蛭不会受到影响，当痢蛭恢复清醒/健康后会立即死亡。」范例：「侍臣让痢蛭醉酒。……随后痢蛭被处决并死亡。」
- **影响**：complexKnowledge 把免死规则写成无条件的「只有宿主死亡时才死亡」，遗漏了对结算关键的例外：痢蛭自身醉酒/中毒时其免死与宿主中毒均失效（此时处决痢蛭会直接死亡，宿主恢复健康），且恢复清醒后若宿主已死会立即死亡。requiredContext 也未包含「痢蛭自身是否醉酒/中毒」。按现有提醒，说书人在投毒者/侍臣在场的局中会错误地保护痢蛭。
- **建议**：在 reminders 中补充「痢蛭醉酒/中毒时不免死且宿主恢复健康；恢复清醒健康后若宿主已死立即死亡」，并把「痢蛭自身毒醉状态」加入 requiredContext。

#### [medium] 哲学家 (philosopher) complexKnowledge
- **仓库现状**：complexKnowledge.reminders：「获得所选善良角色能力；若在场，原拥有者醉酒。」；requiredContext：「是否已使用/选择善良角色/该角色是否在场」
- **百科依据**（哲学家）：角色简介：「如果哲学家死亡，醉酒或中毒了，那么那名醉酒的玩家会再次恢复清醒。」「如果哲学家之前选择了不在场的角色，但之后被选择的角色在场了，被选择的角色对应的玩家也会醉酒。」；运作方式：「如果哲学家死亡，醉酒的玩家将恢复清醒。」
- **影响**：共享复杂角色知识只记录了「在场则原拥有者醉酒」，遗漏了两条对结算有实际影响的动态检测规则：(1) 哲学家死亡/醉酒/中毒时，被其致醉的玩家恢复清醒（醉酒标记需移除）；(2) 若所选角色最初不在场、之后被创造在场，该玩家同样醉酒。说书人若依据现有 reminders，会在哲学家死后错误地维持目标醉酒状态。各 repoVariants 的 research 也均未覆盖此点（仅 yi-yan-huan-yan 的原文提示部分涉及）。
- **建议**：在 complexKnowledge.reminders 补充「哲学家死亡/醉酒/中毒时被致醉玩家恢复清醒；所选角色中途进场时同样醉酒（动态检测）」，requiredContext 增加「哲学家当前是否存活/醉酒中毒」。

#### [medium] 小精灵 (pixie) complexKnowledge（获得能力的结算条件不完整）
- **仓库现状**：complexKnowledge.reminders 仅有: "对应镇民死亡且小精灵足够疯狂后，可能获得该能力。"；requiredContext: "首夜给出的角色"、"对应镇民是否死亡"、"是否足够疯狂"。
- **百科依据**（小精灵）：规则细节："只要小精灵在那名玩家死亡时清醒健康，且说书人判断他足够疯狂，便能获得他所得知的那个镇民角色的能力（不一定是标记了'疯狂'的那名玩家的角色能力……）"；角色简介："如果小精灵得知的角色所对应的玩家他的角色发生了变化，并随后死亡，小精灵会获得他得知的那个角色的能力，而非那名玩家死亡时的角色的能力。" "当那个镇民玩家死亡时，小精灵不会得知这一信息，也不会被告知自己获得了新的能力。"
- **影响**：三个对结算有实际影响的条件未进入 complexKnowledge：(1) 小精灵必须在被标记玩家死亡的那一刻清醒健康才能获得能力；(2) 若该玩家角色被改变后死亡，小精灵获得的是首夜得知的那个角色的能力，而非该玩家死亡时的角色能力（甚至可能因此获得一个已不在场的镇民能力）；(3) 获得能力时不告知小精灵本人（说书人不应发送"你获得了X能力"的通知）。这些直接决定授予哪个能力、是否授予以及是否发消息。
- **建议**：在 complexKnowledge.reminders 中补充上述三条，requiredContext 增加"被标记玩家死亡时小精灵是否醉酒中毒"与"被标记玩家角色是否已变化"。

#### [medium] 瘟疫医生 (plague_doctor / plaguedoctor) 死亡时醉酒中毒的硬条件缺失
- **仓库现状**：所有 research 摘要均为无条件触发，如 research.possibleOutcomes (Chou Shen Na Ji): "On death, ST gains an out-of-play Minion ability."；roleCopy.prompt 与各 highRiskNotes 均未提及醉酒中毒条件；complexKnowledge 为 null。
- **百科依据**（瘟疫医生）：角色简介："如果瘟疫医生在死亡时醉酒中毒，说书人不会获得爪牙能力，即使瘟疫医生在之后恢复清醒健康。"；另有"瘟疫医生的能力效果会在剩余的游戏时间里持续生效"与范例（死亡后再醉酒不影响已获得的能力）。
- **影响**："死亡时醉酒中毒则说书人永久得不到爪牙能力"是会直接改变结算结果的硬条件（且事后恢复清醒也无法补发）；反向规则（能力一旦获得，之后瘟疫医生再醉酒也不失效）同样影响结算。两个 roleId（plague_doctor、plaguedoctor）的全部变体和文案均未覆盖。
- **建议**：在 research.highRiskNotes 或新增 complexKnowledge 中补充：死亡瞬间醉酒中毒→不获得能力且不补发；已获得的说书人能力不受瘟疫医生之后状态影响。

#### [medium] 投毒者 (poisoner) 中毒随投毒者死亡/离场提前结束的规则缺失
- **仓库现状**：complexKnowledge.reminders: "投毒者每晚选择一名玩家；目标今夜和明天白天中毒。"、"中毒影响信息真假和能力是否有效，需要说书人结合上下文确认。"；各 research.stateChanges 均只写"Chosen player is poisoned tonight and tomorrow day."之类，无提前终止条件。
- **百科依据**（投毒者）：提示标记（中毒）移除时机："白天阶段结束时，或投毒者死亡或离场时。"；范例："投毒者让镇长中毒，然后变成了小恶魔。镇长不再中毒，因为投毒者这个角色已经不在场了。"
- **影响**：若投毒者在目标中毒期间死亡或离场（如被恶魔杀死、被麻脸巫婆改造），中毒立即结束——这会改变当夜后续角色获取信息的真假与能力有效性，属于对结算有实际影响的关键细节，但 requiredContext 虽列出"中毒持续时间"，却没有任何字段给出这条终止规则。
- **建议**：在 complexKnowledge.reminders 补充："投毒者死亡或离场时，其目标的中毒立即结束。"

#### [medium] 政客 (politician) 转变阵营的两个硬性限制条件缺失
- **仓库现状**：complexKnowledge.reminders: "若政客最应为本阵营失败负责，可能改变阵营并获胜，即使死亡也可。"、"这是赛后裁量，不在对局中自动改阵营。"；requiredContext: "结局责任判断"、"原阵营"、"是否最应为失败负责"。各 research 摘要亦无此两条。
- **百科依据**（政客）：角色简介："中毒或醉酒的政客不能转变阵营。"；"如果邪恶玩家的总数已经比初始设置多了一名，即使政客是对善良阵营落败负最大责任的人，由于圣洁之魂的存在，也不能转变阵营获胜。"
- **影响**：两条都是会直接改变胜负结算的硬条件：(1) 游戏结束时政客若醉酒中毒则不能转变阵营；(2) 邪恶阵营人数已比初始配置多一名时（圣洁之魂规则）政客不能转变阵营获胜。complexKnowledge、roleCopy 与全部 research 变体均未提及，说书人据此可能错误判定政客获胜。
- **建议**：在 complexKnowledge.reminders 与 requiredContext 中补充"结算时政客是否醉酒中毒"与"邪恶玩家总数是否已超过初始配置"两项检查。

#### [medium] poppygrower / poppy_grower（罂粟种植者）全部变体
- **仓库现状**：research.possibleOutcomes（ying-su-hua-kai 等多个包）："Evil players do not learn each other while alive; if dead, they learn each other that night."；两个条目的 complexKnowledge 均为 null。
- **百科依据**（罂粟种植者）：「如果罂粟种植者在死亡时醉酒或中毒，因为他此时没有任何能力，因此恶魔和爪牙也不会互相认识。」；规则细节：「将罂粟种植者变成另一个角色，或罂粟种植者死亡时处于中毒或醉酒状态，将不会导致爪牙/恶魔互认。」
- **影响**：仓库中所有变体（poppy_grower 与 poppygrower 两个 roleId 共 16 个变体）都无条件表述为"死亡→当晚邪恶互认"，没有任何一处记录两个会改变结算结果的硬性例外：(1) 死亡时醉酒/中毒则不触发互认；(2) 被变成其他角色后死亡不触发互认。百科范例中还专门给出酒鬼罂粟种植者死亡不互认的例子。缺失该条件可能诱导说书人助手在不该安排互认时安排邪恶互认环节。
- **建议**：在共享 complexKnowledge（当前为 null）中补充：互认只在罂粟种植者死亡时仍拥有能力（未醉酒/中毒、未变身）的前提下触发。

#### [medium] preacher（传教士）全部变体
- **仓库现状**：research.stateChanges（hide-and-seek）："被选中过的爪牙失去能力。"；roleCopy.ability："……且所有被选中过的爪牙失去能力。"；complexKnowledge 为 null。
- **百科依据**（传教士）：「如果传教士在醉酒或中毒的时候选择了一名玩家，那名玩家不会被传教士的能力影响。」「如果传教士醉酒或中毒，被布道的爪牙会重新获得能力，直到传教士恢复清醒健康。」规则细节：「如果传教士死亡，这些爪牙恢复能力。已经使用了『每局游戏限一次』的能力的爪牙无法再次使用能力。」
- **影响**：8 个变体和 roleCopy 都把"失去能力"写成一次性、永久的状态，没有任何一处记录：失去能力仅在传教士存活且清醒健康期间持续；传教士死亡或醉酒/中毒时被布道爪牙恢复能力（醉毒恢复后再次失去）；醉毒状态下的选择完全无效。这些是决定爪牙能否在后续夜晚行动的结算硬条件。
- **建议**：为传教士建立 complexKnowledge，明确"失去能力"标记的放置条件（传教士清醒健康）与移除/暂停条件（死亡、离场、醉毒、目标不再是爪牙）。

#### [medium] professor（教授）complexKnowledge 与 roleCopy
- **仓库现状**：complexKnowledge.reminders："每局一次，死亡镇民可复活。"；aiCannot："自动消耗能力"；roleCopy.ability："每局一次，夜晚选择一名死亡玩家；若其是镇民，目标复活。"
- **百科依据**（教授）：「如果教授选择了外来者、爪牙或恶魔，则无事发生，并且教授失去自己的能力。」；范例：「因为教授醉酒，无事发生，并且教授不能再次使用自己的能力。」；「复活的玩家会重新获得自己的能力，即使是已经使用过的『每局游戏限一次』的能力也会重新获得。」
- **影响**：共享知识面（complexKnowledge/roleCopy）缺两个结算关键点：(1) 只要教授选择了已死亡玩家，无论目标是否镇民、教授是否醉毒，一次性能力都被消耗（bing-gong-ban-shi 与 wen-wu-shuang-quan 两个包引用的官方提醒有此规则，但共享层没有）；(2) 被复活玩家重新获得能力，包括已用过的每局一次能力。缺失 (1) 可能导致助手在"选错目标"后仍认为能力可再用。
- **建议**：在 complexKnowledge.reminders 中补充"选择任何死亡玩家即消耗能力（含选错/醉毒时）"与"复活者重获全部能力（含已用的限次能力）"。

#### [medium] puzzlemaster（解谜大师）complexKnowledge 与 yin-he-man-bu 变体
- **仓库现状**：complexKnowledge.requiredContext 含"是否猜对"；yin-he-man-bu research.highRiskNotes："wrong/right feedback is ST-confirmed."；reminders 只写"猜对得知恶魔，猜错得到假信息"。
- **百科依据**（解谜大师）：「解谜大师不会得知自己的猜测正确与否。」；「已经死亡的解谜大师不能猜测，他这一部分的能力因为死亡而失去了。」；「只有猜中因解谜大师的能力醉酒的玩家才算作猜测正确。猜测因为其他原因醉酒的玩家不算猜测正确。」
- **影响**：三个结算关键点全部缺失：(1) 无论猜对猜错，只告知一个玩家名字，绝不能告知猜测对错——yin-he-man-bu 的"wrong/right feedback"措辞甚至暗示存在对错反馈，容易误导；(2) 死亡后醉酒持续但不能再猜测（猜测部分能力随死亡失去）；(3) 猜中因其他来源（如水手）醉酒的玩家算猜错（百科范例明确）。另外 da-quan-zai-wo 变体的 possibleOutcomes 只写了猜对分支，漏掉猜错给假信息的分支。
- **建议**：在 complexKnowledge.aiCannot 中加入"告知猜测是否正确"，reminders 中补充死后不能猜测、其他来源醉酒不算猜中。

#### [medium] pukka（普卡）complexKnowledge 与全部变体
- **仓库现状**：complexKnowledge.reminders："普卡每晚选择一名玩家中毒；上一名被普卡中毒的玩家死亡后恢复健康。"、"需要追踪上一名普卡中毒目标，死亡与恢复都由说书人确认。"
- **百科依据**（普卡）：运作方式：「被普卡杀死的玩家在死亡时仍然中毒。……例如，如果普卡杀死了贤者，贤者可能会因为中毒效果而获得错误信息。」；「如果普卡在上一个夜晚选择玩家时是清醒的，但是当晚醉酒了，该玩家不会死亡。但是当普卡恢复清醒，中毒效果会恢复，且会在随后的夜晚杀死该玩家。」；范例注：「普卡的致死能力只看他上一个成功中毒的角色，因此会跳过修补匠。」
- **影响**：所有 18 个变体和 complexKnowledge 都没有记录：(1) 目标死亡时仍处于中毒状态，其死亡触发能力要按中毒结算，之后才恢复健康（对贤者等死亡触发角色是硬性结算条件）；(2) 普卡醉毒时死亡链暂停、恢复清醒后原中毒目标恢复中毒并在后续夜晚死亡，且致死只看"上一个成功中毒"的目标（醉毒之夜的选择被跳过）。requiredContext 的"恢复健康时点"只是暗示，未给出规则。
- **建议**：在 reminders 中补充"死亡结算时目标仍中毒（死亡触发能力按中毒结算）"和普卡醉毒时链条暂停/恢复/跳过的规则。

#### [medium] princess（公主）研究摘要覆盖
- **仓库现状**：roleCopy.prompt："核对首日提名人和处决结果；是否停刀由说书人确认。"；唯一变体（punchy）research 仅有"若首日由公主提名并处决玩家，恶魔当晚不杀人"；complexKnowledge 为 null。
- **百科依据**（公主）：「公主的能力不要求被处决的玩家死亡。」；「如果公主在白天醉酒了，但在夜晚恢复清醒，她就能阻止恶魔造成的死亡。如果公主白天是清醒的，但夜晚醉酒了，她的能力不会生效。」；「在夜晚，非恶魔造成的死亡不会受到公主的影响。」；规则细节：「公主在其首个白天提名了一名玩家后，该玩家不论由于何种原因被处决……都会满足公主的要求。」
- **影响**：缺失多个对停刀判定关键的条件：(1) 处决成立即可，不要求被处决者死亡（处决了免死角色也触发）；(2) 能力是否生效看夜晚时的清醒状态而非白天；(3) 只阻止恶魔造成的死亡，恶魔仍正常行动、其其他效果（中毒、假信息等）不受影响，非恶魔来源的夜间死亡照常发生。
- **建议**：补充 complexKnowledge：requiredContext 加入"被处决者是否死亡（不要求）"、"公主夜晚是否清醒"、"死亡来源是否恶魔"。

#### [medium] 钦天监 (qin_tian_jian / qintianjian) research
- **仓库现状**：ri-yue-xie-wang 变体 research.highRiskNotes："Neighbor evil condition may force false info."；ji-meng-ta-xiang 变体："Neighbor evil condition can force false information."；各变体 possibleOutcomes 仅有"Tell left, right, or same side for nearest evil player."之类摘要。
- **百科依据**（）：钦天监.wiki："如果钦天监与一名邪恶玩家相邻，不论该玩家存活与否，钦天监会获得错误信息。说书人会从'左/右/相同'这三个答案中，任意选择一个与正确信息不符的信息告知钦天监。"；"即使是已死亡的玩家，也参与距离的计算。"
- **影响**：两处结算关键细节在两个 roleId（qin_tian_jian、qintianjian）的所有 research 摘要中均缺失或被弱化：(1) 邻座有邪恶玩家时给错误信息是强制的，且死亡的邪恶邻座同样触发；"may/can force"的措辞会让说书人误以为可自由裁量给真信息。(2) 计算最近邪恶玩家距离时死亡玩家也计入。此外错误信息必须从左/右/相同三个答案中选一个与正确答案不同的，摘要也未提及。
- **建议**：把 highRiskNotes 改为"邻座（含已死亡的）邪恶玩家 => 必须给错误信息，且须与正确答案不同"，并补充"死亡玩家参与距离计算"。

#### [medium] 圣徒 (saint) — 多个变体 research 规则摘要
- **仓库现状**：research.possibleOutcomes（trouble-brewing）："若被处决，善良阵营失败。"；（er-yu-wo-zha、si-zui-chan-hui-ri）："If executed, good loses."；research.highRiskNotes（yi-yan-huan-yan/hu-du-zhi-zheng）："Saint execution may lose the game for good; only create a win/loss reminder."
- **百科依据**（圣徒）：角色简介："如果圣徒因处决而死亡，游戏结束。"；范例："替罪羊代替圣徒被处决。游戏继续，因为圣徒没有死亡。"；运作方式："如果一名邪恶的圣徒被处决，善良阵营获胜。"
- **影响**：多个板子包的摘要把触发条件写成"被处决/if executed"，遗漏了"必须死于这次处决"的硬条件（替罪羊代替、处决未死等情形不触发）；且除 chuan-qi-zhi-ye（"Saint's team loses"）外均硬编码"善良阵营失败"，遗漏百科"你的阵营落败"在阵营转变剧本中的反向结论。涉及 scripts：trouble-brewing、everyone-can-play、church-of-spies、er-yu-wo-zha、si-zui-chan-hui-ri、yi-yan-huan-yan、hu-du-zhi-zheng。
- **建议**：统一改为"若圣徒死于处决，其阵营落败"的表述。

#### [medium] 水手 (sailor) — complexKnowledge.reminders
- **仓库现状**：complexKnowledge.reminders："水手或目标醉酒直到黄昏；水手不能死亡。"
- **百科依据**（水手）：角色简介："只要水手是清醒状态，就不会死亡。"、"如果水手选择了自己，他失去自己的'不会死亡'能力，直到恢复清醒为止。"；范例："水手要求处决自己……但是因为他醉酒，所以死亡了。"；运作方式："如果清醒的水手将要死亡，他会依然存活。"
- **影响**：共享复杂角色知识把免死写成无条件的"水手不能死亡"，遗漏了对结算关键的"仅清醒（未醉酒/未中毒）时免死"条件——醉酒的水手会正常死亡（含被处决死亡）。同批 nuo-fu-jiu-xing 变体的 research 写法正确（"Sailor cannot die while sober and healthy."），但共享 reminders 会误导结算。
- **建议**：reminders 改为"水手或目标醉酒直到黄昏；水手仅在清醒（未醉酒中毒）时不会死亡"。

#### [medium] shabaloth / complexKnowledge.reminders（复活者恢复能力）
- **仓库现状**：complexKnowledge.reminders 仅有: "每晚两刀；前一晚被选且死亡者可能复活。"（requiredContext: 本夜两名目标/前一晚目标/是否吐回）
- **百科依据**（沙巴洛斯）：百科角色简介："因反刍而复活的玩家重新获得自己的能力，即使是已经使用过的'每局游戏限一次'的能力也会重新获得。如果有'在你的首个夜晚'的能力，玩家可以再次使用该能力。"；运作方式："如果该玩家只在首个夜晚被唤醒，则现在就唤醒该玩家让他使用自己的能力。"
- **影响**：复杂角色知识遗漏了反刍复活的关键结算规则：复活者恢复能力，已用过的"每局限一次"能力重置，且首夜型能力需在复活当晚立即唤醒结算。这直接影响说书人当晚要唤醒谁、哪些限次能力可再次使用。
- **建议**：在 reminders 中补充"复活者恢复能力（含已用过的限次能力）；首夜型能力在复活当晚重新结算"。

#### [medium] snakecharmer / 舞蛇人（roleCopy 与 complexKnowledge：中毒时长）
- **仓库现状**：roleCopy.ability: "每晚选择一名存活玩家；若选中恶魔，与其交换角色和阵营，新舞蛇人中毒。"；complexKnowledge.reminders: "新舞蛇人中毒，交换当晚通常不能再用新技能。"；requiredContext: "交换后新舞蛇人中毒"——均未说明中毒是永久性的。
- **百科依据**（舞蛇人）：角色简介："那名恶魔则转为善良并永久中毒。"；提示标记（中毒）移除时机："放置有此标记的角色死亡或离场时。"
- **影响**：游戏中绝大多数中毒效果默认只持续一晚一天，而舞蛇人造成的中毒是永久的（直到该角色死亡或离场）。roleCopy 与 complexKnowledge 都只写"中毒"而不写"永久"，AI/说书人很可能在次日黎明按默认规则移除中毒，导致新舞蛇人错误地恢复能力，直接改变后续结算。
- **建议**：在 roleCopy.ability/prompt 与 complexKnowledge.reminders 中补充"永久中毒，直到死亡或离场才移除"。

#### [medium] 召唤师 新恶魔当晚行动与信息流细节
- **仓库现状**：complexKnowledge.reminders: "新恶魔当晚能否行动和第二恶魔死亡等连锁必须人工核对。"
- **百科依据**（召唤师）：角色简介："新恶魔在被创造的当晚就能行动。"、"被创造的新恶魔不会得知谁是爪牙，爪牙也不会得知他是恶魔。邪恶玩家之间需要通过交流来互认。"
- **影响**：百科明确规定新恶魔被创造的当晚就能行动，这是确定规则而非需逐局裁量的问题；仓库将其表述为"能否行动必须人工核对"，会让 AI 在第三夜漏掉新恶魔的击杀行动。同时全部字段均未记录"新恶魔不得知爪牙、爪牙不得知新恶魔"的信息流规则，这直接影响第三夜之后的夜间信息发放。
- **建议**：reminders 改为明确陈述："新恶魔在被创造的当晚就能行动；新恶魔与爪牙互相不会由说书人告知身份。"

#### [medium] 暴风捕手 research 遗漏"角色不在场"分支
- **仓库现状**：research.possibleOutcomes（scripts: he-fang-jiao-zhong）: "If in play, that character can only die by execution." / "Evil players learn the player."（仅覆盖在场分支）
- **百科依据**（暴风捕手）：运作方式："如果没有玩家被暴风捕手标记，对邪恶玩家展示\"这些角色不在场\"信息标记和对应的善良角色标记，然后让邪恶玩家重新入睡。"；角色简介："如果他不在场，所有邪恶玩家都会得知这一信息。"
- **影响**：仓库唯一变体的规则摘要只写了宣布角色在场时的结算，遗漏了不在场分支：首夜仍要依次唤醒每名邪恶玩家并告知该角色不在场。漏掉这一步会导致首夜信息发放不完整（邪恶玩家应据此获得伪装机会）。
- **建议**：在 possibleOutcomes 补充："若宣布的角色不在场，首夜向所有邪恶玩家展示该角色不在场的信息。"

#### [medium] 窃贼 (thief)
- **仓库现状**：research.stateChanges（lan-xie-jie-qu）："Chosen player has negative vote weight tomorrow."；其余变体仅为通用提醒文案，均未提及流放例外与能力失效恢复
- **百科依据**（窃贼）：角色简介："流放表决不会受到能力的影响，被以负数计票的玩家在进行流放表决时不会受到窃贼的能力影响。"；"窃贼死后或者被流放后，会失去他的能力，被窃贼偷取票数的玩家会立刻恢复为正数计票。"；范例："小黑举起了他的手以支持流放，这会以正票计算。"
- **影响**：两条对计票结算有直接影响的硬规则在所有 repoVariants 的 research 中均缺失：(1) 负票只作用于处决提名投票，流放表决按正常计票；(2) 窃贼死亡/被流放后立即失去能力，已被标记的玩家当天即恢复正数计票。缺失会导致在流放表决或窃贼中途死亡的场景下算错票数。
- **建议**：在 research（至少 lan-xie-jie-qu 等有实质摘要的变体）或新增 complexKnowledge 中补充这两条例外。

#### [medium] 修补匠 (tinker)
- **仓库现状**：research.highRiskNotes（bad-moon-rising）："死亡时机完全由说书人裁量，不能自动触发。"；roleCopy.prompt："Death timing is ST-confirmed."；所有变体均未提及保护效果的限制
- **百科依据**（修补匠）：角色简介："修补匠在受到免于死亡的能力保护时，不能因自己的能力而死亡。"；范例："茶艺师……保护修补匠免于死亡。修补匠不会因为自己的能力而死亡。"
- **影响**：百科规定当修补匠受免死保护（如茶艺师、旅店老板）时，说书人不能用修补匠自身能力杀死他——这是对"随时可能死亡"的硬性限制条件。仓库所有 research/roleCopy 只强调死亡时机由说书人裁量，未记录该限制，可能导致 AI 在修补匠受保护时仍建议将其杀死。
- **建议**：在 research.highRiskNotes（尤其 bad-moon-rising 等与茶艺师/旅店老板同板的变体）补充"受免死保护时不能因自身能力死亡"。

#### [medium] vigormortis complexKnowledge
- **仓库现状**：complexKnowledge.reminders: "杀死爪牙后，该爪牙保留能力并使相邻一名镇民中毒。"、"开局 -1 外来者。"（无持续条件说明）
- **百科依据**（亡骨魔）：角色简介: "只要亡骨魔还存活，该爪牙就能保留能力……如果亡骨魔死亡或失去能力，受亡骨魔影响的中毒玩家恢复健康"；"在说书人选择中毒玩家时会跳过与爪牙相邻的非镇民角色"、"即使该镇民已经死亡"；"如果死亡的爪牙变成非爪牙角色，便不再使相应的镇民中毒，且不再保留能力"
- **影响**：遗漏多条结算关键规则：(1) 爪牙保留能力与镇民中毒只在亡骨魔存活且有能力期间持续，亡骨魔死亡/失去能力后立即解除（相克例外：主谋在亡骨魔死后仍保留能力）；(2) 中毒目标跳过邻近的非镇民角色，且可以是已死亡的镇民；(3) 死亡爪牙变成非爪牙角色或醉酒中毒时失去保留的能力。requiredContext 只有"目标是否爪牙/相邻镇民是谁"，覆盖不到上述判定。
- **建议**：在 reminders 中补充"仅亡骨魔存活期间有效"、"跳过非镇民邻居、死亡镇民也可中毒"两条。

#### [medium] virgin research 与 complexKnowledge（处决后白天立即结束）
- **仓库现状**：各 repoVariants.research 仅写 "Nominating Townsfolk may be executed immediately."、"First Townsfolk nominator is immediately executed." 等；complexKnowledge.reminders 无白天结束/失去能力标记相关内容。
- **百科依据**（贞洁者）：运作方式: "终止提名流程并推进至夜晚阶段。（今天白天没有其他人能被处决。）"；角色简介: "因为每天只能有最多一次处决，提名的流程会立即结束，即使有其他玩家被提名且即将被处决。"
- **影响**：贞洁者能力触发处决后，当天立即结束提名流程并进入夜晚，任何"即将被处决"的玩家也不再被处决——这是改变白天结算流程的硬规则，所有变体的 research 与 complexKnowledge 均未记录。另外"失去能力"提示标记在首次被提名时（无论是否触发处决、无论醉酒中毒）都要放置，也未记录。
- **建议**：在 complexKnowledge.reminders 补充"触发处决后本日立即结束（当天不再有其他处决）"与"首次被提名即放置失去能力标记"。

#### [medium] vizier research 与 complexKnowledge（强制处决结束白天、醉酒中毒例外）
- **仓库现状**：complexKnowledge.reminders: "所有玩家知道维齐尔身份；维齐尔白天不能死亡。"、"若有善良玩家投票，维齐尔可以选择立即处决，必须人工确认。"（各变体 research 亦无下述规则）
- **百科依据**（维齐尔）：运作方式: "那么那名玩家被处决并死亡。今天白天不会再发生更多的提名，投票和处决了。"；角色简介: "这算在每个白天的一次处决之内"、"即使被提名者得票在存活玩家的半数以下，维齐尔仍然能够执行处决"；规则细节: "如果维齐尔受到非相克规则的角色带来的醉酒或中毒的效果影响，那么他能够在白天死亡，并且无法选择立即执行处决"
- **影响**：遗漏三条影响白天结算的规则：(1) 维齐尔强制处决后当天立即结束，不再有提名/投票/处决，且算作当天唯一一次处决；(2) 强制处决不受得票过半或得票最多限制；(3) 醉酒/中毒的维齐尔白天可以死亡且无法强制处决（reminders 的"白天不能死亡"在该状态下不成立）。
- **建议**：在 reminders 中补充上述三条判定条件。

#### [medium] 悟道者 wu_dao_zhe (deng-xia-hui-ying) research 缺设置机制且变身时机写反
- **仓库现状**：research.setupImpact: []（空）；possibleOutcomes/stateChanges: 「May transform after evil ability affects them.」
- **百科依据**（悟道者）：运作方式：「在游戏设置时，移除悟道者角色标记，并添加一个外来者角色标记，然后再让玩家抽取角色。」角色简介：「悟道者不具有自己以为的那个外来者的角色能力」「当悟道者被邪恶玩家的能力选择或影响时，在相关的效果生效前，悟道者会先改变角色」
- **影响**：该变体完全遗漏悟道者的核心设置机制：设置时移除本体标记、换入一个不在场外来者标记，抽到该外来者的玩家实际是悟道者且不具有该外来者能力——这是影响板子配置、首夜信息（如爪牙不会得知落难少女在场）和结算的硬规则，setupImpact 却为空。另外摘要写 transform after evil ability affects them，而百科明确变身发生在相关效果“生效前”，先后顺序决定该效果最终作用于哪个角色。wudaozhe 的 bing-gong-ban-shi 变体 setupImpact 同样为空。
- **建议**：补充 setupImpact（标记替换机制、无外来者能力），并把变身时机改为“在邪恶能力效果生效前”。

#### [medium] 寡妇 中毒持续时间未覆盖
- **仓库现状**：complexKnowledge.reminders: 「寡妇首夜查看魔典并选择一名玩家中毒。」；各变体 research.stateChanges 仅写「Poisons one player.」/「Chosen player is poisoned.」，均未写中毒何时结束
- **百科依据**（寡妇）：角色简介：「因寡妇中毒的玩家会一直保持中毒直到寡妇死亡。」提示标记·中毒·移除时机：「寡妇死亡或离场时。」范例：「旅店老板让寡妇醉酒了，所以共情者不再中毒。随后旅店老板死亡，现在寡妇恢复了清醒，共情者又中毒了。」
- **影响**：寡妇的毒不是常规的“到黄昏为止”，而是持续整局直到寡妇死亡或离场，且寡妇自身醉酒中毒期间毒暂时失效、恢复后继续生效。所有摘要和提醒都缺失该持续条件，AI 说书人很可能按默认一夜毒在黄昏解除，导致后续所有夜晚该玩家的信息/能力结算全部出错。
- **建议**：在 complexKnowledge.reminders 和 stateChanges 中补充“中毒持续到寡妇死亡/离场；寡妇醉酒中毒期间暂时失效”。

#### [medium] 女巫 提名结算两条硬规则未覆盖
- **仓库现状**：各变体 research 仅有如 he-fang-jiao-zhong highRiskNotes: 「Death triggers during day nomination; never pre-kill automatically.」等描述；complexKnowledge 为 null。无任何字段提及提名仍然生效或流放不触发诅咒
- **百科依据**（女巫）：角色简介：「那名玩家如果在下个白天提名了任何玩家，就会死亡。尽管如此，他的提名仍然生效。」范例：「杂耍艺人发起对旅行者的流放投票。杂耍艺人不会死亡而且还可以提名处决，因为女巫的诅咒不影响发起流放。」
- **影响**：两条直接影响白天结算的硬规则在全部 11 个变体中都缺失：(1) 被诅咒玩家因提名死亡后，该提名依然继续进行投票（运作方式：「立即宣布他死亡。（提名正常进行）」）；(2) 发起对旅行者的流放不算发起提名，不触发咒杀。缺失会导致 AI 建议取消死者的提名、或错杀发起流放的被诅咒玩家。
- **建议**：在 research 或补建 complexKnowledge 中加入“提名仍生效”“流放不触发”两条。

#### [medium] 扎恩(xaan) 存活与清醒健康前提未覆盖
- **仓库现状**：research.stateChanges: 「第 X 夜所有镇民中毒到黄昏。」；complexKnowledge.reminders: 「外来者数量为 X；第 X 夜所有镇民中毒直到黄昏。」——均写成无条件事件
- **百科依据**（限）：角色简介：「限需要存活，能力才能生效。」大限将至·放置条件：「当前游戏进行的夜晚数和初始的外来者数量相同时，且限未醉酒中毒，放置在魔典中央。」
- **影响**：若限在第 X 夜之前死亡，或当晚醉酒/中毒，集体中毒不会发生；摘要与提醒把“第 X 夜所有镇民中毒”写成必然事件，会在限已死/被毒时仍错误建议群体中毒。另百科还注明限的设置调整会覆盖男爵等其他设置调整类能力（「限的能力会覆盖其他设置调整类型的能力，例如男爵等角色」），setupImpact 亦未覆盖此优先级。
- **建议**：在 reminders/stateChanges 中加入“限需存活且当晚清醒健康”前提，并在 setupImpact 补充覆盖其他设置调整能力的说明。

#### [medium] 引路人 (yinluren)
- **仓库现状**：所有 repoVariants 的 abilityText（含与百科数量一致的"至多三名玩家"版本）及 roleCopy.ability 均未包含"除你以外"/不能选择自己的限制。
- **百科依据**（引路人）：角色能力："你要选择除你以外的至多三名玩家"；角色简介："每个夜晚，引路人都可以选择一至三名玩家，但不能不进行选择，也不能选择自己。"
- **影响**："不能选择自己"和"不能不进行选择"是百科明确的硬性选择约束，在全部 10 个变体的能力文本与 research 中都没有体现，可能导致说书人接受非法的自选目标。
- **建议**：在 abilityText/roleCopy 补回"除你以外"，并在 research.highRiskNotes 中加入"必须选择、不能选自己"的校验。

#### [medium] 引路人 (yinluren)
- **仓库现状**：research 中对"影响"的界定仅有 "Consider direct choices and indirect effects."（jiu-quan-song-ge，shi-yan-jiao-chi 类似："include indirect effects as well as direct choices"），complexKnowledge 为 null。
- **百科依据**（引路人）：规则细节："'影响'的范围包括：改变该玩家的状态（角色、阵营等），对该玩家的能力造成了妨害效果……暴露角色、让他人获取信息等能力不在'影响'的范围内。"；"如果邪恶玩家执行了善良玩家的能力产生选择或影响，同样会被引路人探查"；角色简介："不仅邪恶的爪牙、恶魔能力会被引路人探查，邪恶的镇民、外来者能力也会被引路人探查。"
- **影响**：说书人回答是/否时的关键判定边界全部缺失：(1) 暴露角色、让他人获取信息类能力不算"影响"；(2) 邪恶玩家执行善良角色的能力同样计入；(3) 探查范围按玩家阵营而非角色类型（邪恶的镇民/外来者能力也算）。缺失这些边界会直接导致是/否信息给错。
- **建议**：在 research.possibleOutcomes 或 highRiskNotes 中补充"影响"范围三条判定边界。

#### [medium] 牙噶巴卜 (yaggababble)
- **仓库现状**：complexKnowledge.aiCan 仅有笼统的"提醒毒醉会影响结算"；各变体 research 与 complexKnowledge.reminders 均未说明毒醉判定时点。
- **百科依据**（牙噶巴卜）：角色简介："在牙噶巴卜醉酒或中毒期间，玩家不会因为他的能力死亡，即使牙噶巴卜在说出短语时清醒健康。在牙噶巴卜清醒健康期间，玩家会因为他的能力死亡，即使在牙噶巴卜在说出短语时醉酒或中毒。"；提示标记："放置条件：不论牙噶巴卜是否醉酒中毒，都会将一枚标记放入魔典正中央。"
- **影响**：百科明确毒醉状态以"造成死亡的时刻"为准，与"说出短语的时刻"无关，且说出短语时无论毒醉都要放置提示标记。这一时点规则决定杀不杀得成，仓库摘要完全没有覆盖，说书人容易按"说话时是否毒醉"错误结算。
- **建议**：在 complexKnowledge.reminders 中补充："毒醉以执行死亡的时刻为准；说短语时是否毒醉不影响计数与标记放置。"

#### [medium] 戏子 (xizi)
- **仓库现状**：两个变体的 research 只覆盖互认与胜负对调（如 "All Xi Zi know each other; win/loss result is reversed regardless of count/life."）；teamChanges 仅有笼统的 "May involve alignment, registration or evil/good interpretation."（sheng-shi-qi-wen）；complexKnowledge 为 null。
- **百科依据**（戏子）：角色简介："在游戏过程中，一旦任意善良玩家变成了戏子角色，或获得了戏子的能力，都会立即使得所有善良玩家变成戏子角色……多名戏子同时在场时，任何一名戏子都无法单独地被改变成其他角色。"；"邪恶玩家和旅行者无法变成戏子角色，也无法获得戏子的能力。已经成为戏子角色的玩家无法转为邪恶阵营。"
- **影响**：戏子的中途转化连锁规则（任一善良玩家变成戏子→全体善良玩家变成戏子并互认）、"戏子无法被单独改变成其他角色"、"戏子无法转为邪恶阵营/邪恶玩家与旅行者无法变成戏子"这些硬性约束在 research 与 complexKnowledge 中全部缺失。百科范例（灵言师无法真正转变戏子阵营）表明这些约束会直接改变结算结果。
- **建议**：为戏子补充 complexKnowledge 或在 research.identityChanges/teamChanges 中列出中途转化连锁与阵营转换禁止规则。

#### [medium] 知府 (zhifu)
- **仓库现状**：research.possibleOutcomes（ri-yue-xie-wang / wu-yin-cang-sheng）："Tell whether a non-Townsfolk non-Traveler died today."；research.stateChanges（ri-yue-xie-wang）："Depends on day death log."（未提及夜晚死亡计入，也未提及以死亡瞬间的角色类型判定）
- **百科依据**（知府）：角色简介：「知府关注的是当天所有的死亡玩家，包括夜晚的死亡，且不论他们因何种方式死亡。」规则细节：「知府关注的是死亡那一刻，该玩家的角色类型是否为非镇民且非旅行者，即使该死亡玩家在之后角色发生了变化。」范例：「当晚，恶魔攻击了理发师，随后恶魔将死亡的理发师与存活的艺术家进行角色交换。随后知府被唤醒并得知了"是"。」
- **影响**：abilityText 本身与百科一致，但 research 摘要遗漏两个直接决定是/否答案的判定细节：(1) "今天"包含知府被唤醒前当晚已发生的死亡，而 ri-yue-xie-wang 变体 stateChanges 写作 "Depends on day death log"，容易被理解为只统计白天死亡；(2) 判定以玩家死亡那一刻的角色类型为准，之后身份变化不影响（百科范例中理发师死后被换成艺术家仍答"是"）。另有"即使当天没有任何玩家死亡，知府也会被唤醒"未收录。
- **建议**：在两个变体的 research 中补充："今天=当天白天+知府唤醒前的当晚死亡"、"以死亡瞬间的角色类型判定"，并把 "Depends on day death log" 改为涵盖夜晚死亡的表述。

#### [medium] 僵怖 (zombuul)
- **仓库现状**：complexKnowledge.requiredContext：「今天是否无人死亡」「是否首次死亡」；complexKnowledge.reminders：「今天无人死亡时夜晚杀人；首次死亡时存活但登记为死亡。」（各变体 research 同样只覆盖基础条件，未收录"死于今日"的登记判定规则）
- **百科依据**（僵怖）：运作方式：「如果僵怖因处决而"死亡"，会被当作已死亡，因此要给僵怖放置"死于今日"提示标记。」角色简介：「如果一名已死亡的玩家被处决，该玩家无法再次死亡，因此僵怖仍然会被唤醒。」「僵怖第二次死亡时，才会真正地死亡，且善良阵营获胜。」范例：「僵怖被处决且看起来已经死亡。僵怖当晚不能发动攻击。」
- **影响**：唤醒条件"今天白天是否有人死亡"的两个关键边界未收录，而它们直接决定当晚僵怖是否行动：(1) 僵怖自己首次"假死"（如被处决）也算当天有人死亡，当晚不唤醒僵怖（百科范例明确"僵怖被处决……当晚不能发动攻击"）；(2) 处决一名已死亡玩家不会产生新的死亡，因此僵怖当晚仍会被唤醒。另外"第二次死亡才真正死亡且善良阵营获胜"这一终局判定也未出现在 reminders/requiredContext 中。缺少这些细节时，说书人可能在僵怖假死当晚错误地唤醒它，或在处决死人后错误地跳过它。
- **建议**：在 complexKnowledge.reminders/requiredContext 补充："僵怖假死（含被处决）也算当天有死亡→当晚不唤醒"、"处决已死玩家不算死亡→当晚仍唤醒"、"第二次死亡即真死、善良阵营获胜"。

#### [medium] boffin（科学怪人）research/complexKnowledge 缺少「科学怪人自身醉酒中毒时恶魔暂时失去该能力」
- **仓库现状**：complexKnowledge.reminders 仅有「恶魔拥有一个不在场善良角色能力。」「新恶魔出现时需要重新核对。」；两个 repoVariants 的 research 中也没有任何关于科学怪人本人醉酒/中毒使恶魔暂失能力的条目。
- **百科依据**（科学怪人）：角色简介：「只要科学怪人存活且清醒健康，恶魔就会拥有一个不在场的镇民或外来者角色的能力。……然而如果科学怪人醉酒中毒，恶魔就会暂时失去这个善良角色的能力。」范例：「在第四个夜晚，科学怪人醉酒，恶魔因此失去了侍女的能力，当晚不再被额外唤醒。」
- **影响**：该条是这项能力生效与否的开关条件：恶魔自身醉酒/中毒不影响（能力文本已覆盖），但科学怪人醉酒/中毒时恶魔暂时失去获得的能力。提醒体系完全缺失这一条，投毒者等指向科学怪人时容易结算错误。
- **建议**：在 complexKnowledge.reminders 增加「科学怪人醉酒/中毒或死亡时，恶魔暂时失去/失去所获善良能力」。

#### [medium] bureaucrat（官员）research 缺少流放表决与官员死亡/被流放的例外
- **仓库现状**：research.possibleOutcomes（lan-xie-jie-qu 变体）：「Chosen player votes as three votes tomorrow day.」；research.stateChanges：「Chosen player has three-vote weight tomorrow.」——所有变体均未提及流放例外。
- **百科依据**（官员）：角色简介：「流放表决不会受到能力的影响，因此被官员选择的玩家在流放表决中正常计票，而不是计3票。」「官员死后或者被流放后，会失去他的能力，被官员选择的玩家会立刻恢复为计1票。」
- **影响**：两条例外都会直接改变唱票结果：被选中玩家在旅行者流放表决中只计 1 票；官员死亡或被流放的瞬间，三票加成立即失效。仓库摘要一律写成「明天全天三票」，说书人照此计票会算错。
- **建议**：在 research 中补充「exile votes are unaffected; the 3-vote weight ends immediately if the Bureaucrat dies or is exiled」。

#### [medium] chambermaid 侍女 — 醉毒目标仍计入唤醒数的规则被模糊化
- **仓库现状**：research.highRiskNotes："Count depends on actual wakeups and poison/drunk state."（Shang Di Que Xi 变体）；roleCopy.prompt："记录多个目标；先核对毒醉、死亡和保护，再确认结果。"
- **百科依据**（侍女）：角色简介："中毒或醉酒的玩家当晚因自己的能力被唤醒，仍然会计算在内。"
- **影响**：百科明确：被查验目标即使醉酒/中毒，只要当晚因自身能力被唤醒就计入数字（醉毒只会通过侍女自身状态导致假信息）。仓库把"数字取决于 poison/drunk state"作为规则摘要，容易引导 AI 把醉毒目标从计数中剔除，得出错误数字。
- **建议**：改写为"目标醉酒/中毒但因自身能力被唤醒仍计入；仅当侍女本人醉毒时才可给假数字"。

#### [medium] 卖花女孩 (flowergirl) research 缺少"仅处决提名投票计入、流放/其他举手不计入、死亡恶魔投票也计入"的结算关键细节
- **仓库现状**：research.possibleOutcomes（an-du-chen-cang 等多个变体）："Learns whether Demon voted today."；complexKnowledge 为 null，所有变体的 research 均未提及投票类型限制。
- **百科依据**（卖花女孩）：百科《卖花女孩》角色简介："卖花女孩的能力不会检测到恶魔玩家因为其他的原因而举手表决。例如恶魔玩家举手'投票'选择晚餐吃什么，或者恶魔玩家举手赞成流放旅行者，都不会被卖花女孩的能力检测到。"；"即使那些死去的恶魔也能检测到。哪怕只有一名恶魔玩家投票，卖花女孩得知的信息都是'是'。"
- **影响**：仓库摘要只说"恶魔今天是否投票"。若恶魔当天只参与了旅行者流放举手，按仓库摘要会答"是"，按百科正确答案是"否"；反之死亡恶魔在处决提名中投票也要计入"是"。这两条都会直接改变卖花女孩得到的信息，属结算关键遗漏。
- **建议**：在 research.highRiskNotes 或 complexKnowledge 补充：只统计处决提名中的投票；流放/非处决举手不计；死亡恶魔与多恶魔中任一投票均计为"是"。

#### [medium] 弄臣 (fool) complexKnowledge 缺少"被其他能力保护时不消耗免死"与"醉酒中毒时照常死亡"两条硬规则
- **仓库现状**：complexKnowledge.reminders：["第一次死亡时不死亡。"]；requiredContext：["是否首次死亡","弄臣是否有效"]。所有 repoVariants 的 research 也未提及保护不消耗免死这一点。
- **百科依据**（弄臣）：百科《弄臣》角色简介："如果其他角色的能力保护弄臣免于死亡，弄臣不会使用掉自己的能力。只有当弄臣将要真正的死去时，他的能力才会触发。"；运作方式："如果弄臣将要死亡，他依然存活。（但是如果此时醉酒或中毒就会死亡。）"
- **影响**：若说书人/AI 在弄臣被僧侣、茶艺师等保护挡下攻击时就把免死记为已消耗，之后弄臣本应免死的那次会被错误判死，直接改变结算结果（百科范例专门演示了连续两次被其他保护挡下后免死仍保留）。另外"醉酒中毒时免死不生效、直接死亡"也是结算硬条件，reminders 未收录（requiredContext 的"弄臣是否有效"过于隐晦）。
- **建议**：reminders 增补："仅当弄臣将要真正死亡时才消耗免死；被其他能力保护挡下不消耗"、"醉酒/中毒时将照常死亡且视情况不消耗标记"。

#### [medium] 鹰身女妖 (harpy) complexKnowledge 缺少结算关键细节
- **仓库现状**：complexKnowledge.reminders: “第一名目标明天需疯狂证明第二名目标邪恶。”“未满足疯狂要求时，一方或双方可能死亡，后果由说书人裁量。”（requiredContext 仅含：第一目标/第二目标/明天疯狂表现/是否触发死亡）
- **百科依据**（鹰身女妖）：角色简介: “鹰身女妖可以选择已死亡的玩家。如果她这么做，那么说书人只能杀死当前仍存活的目标玩家，因为已死亡的玩家不能再次死亡。”“被鹰身女妖的能力杀死的玩家的死亡顺序由说书人决定，这一点非常重要。”“被鹰身女妖选择的玩家会在鹰身女妖下一次进行选择之前持续被影响。”
- **影响**：complexKnowledge 未覆盖三条影响结算的百科细节：(1) 可以选择已死亡玩家，此时只能杀存活的那一名；(2) 双杀时死亡顺序由说书人决定（百科明确标注“非常重要”）；(3) 疯狂要求持续到女妖下一次选择之前，而非只限“明天”一个白天节点。另外提示标记规则“若此时鹰身女妖醉酒中毒，不放置该标记”也未收录。
- **建议**：在 reminders/requiredContext 中补充“可选死亡玩家（只能杀存活目标）”“双杀顺序由说书人决定”“影响持续到下次选择”。

#### [low] 理发师 (barber) — research 多板子包「non-Demon」目标描述
- **仓库现状**：多个板子包的 research 写为交换对象是「非恶魔玩家」，如 chou-shen-na-ji research.identityChanges：「Demon may swap two non-Demon player characters after Barber dies.」；si-zui-chan-hui-ri research.possibleOutcomes：「When Barber dies, Demon may swap two non-Demon players characters that night.」；wu-yin-cang-sheng：「On death, Demon may swap two non-Demon players roles that night.」等。
- **百科依据**（理发师）：角色简介：「恶魔可以选择自己进行角色交换。」「恶魔不能选择另一名恶魔玩家进行角色交换。」范例：「理发师死了。涡流与一名存活的女巫交换角色。」
- **影响**：百科的限制是「不能选择‘另一名’恶魔」，行动的恶魔可以选择自己参与交换（范例中涡流亲自与女巫交换）。而 chou-shen-na-ji、deng-xia-hui-ying、hua-fu-lei-ming、si-zui-chan-hui-ri、ye-ban-kuang-huan、wu-yin-cang-sheng、wang-bu-jian-wang、ku-mu-feng-chun、jiu-quan-song-ge、ji-meng-ta-xiang、shen-fen-wei-ji、yu-zhe-huan-yan 等包的 research 概括成「two non-Demon players」，等于错误地把行动恶魔自身也排除在交换目标之外，会让 AI 拒绝恶魔自换这一百科明确允许的操作。同一角色在 heng-xing-ba-dao / yu-gai-mi-zhang（non-other-Demon
- **建议**：把上述包的 research 表述统一改为「两名非另一恶魔的玩家（可含行动恶魔自身）」。

#### [low] vortox research（流放不算处决、醉酒中毒信息仍为假）
- **仓库现状**：各变体 research 只写 "If nobody is executed during the day, evil wins."（如 he-fang-jiao-zhong possibleOutcomes、lan-xie-jie-qu possibleOutcomes）；complexKnowledge 为 null。
- **百科依据**（涡流）：角色简介: "当夜晚降临时，如果今天白天没有人被处决，邪恶阵营胜利。流放旅行者不算在内。"；"哪怕他们醉酒或中毒，信息也一定是错误的"；"涡流不会影响其他人通过其他方式获得的信息，例如说书人解释的规则或玩家的角色或阵营的变化"
- **影响**：遗漏结算关键细节：(1) 流放旅行者不算处决，不能阻止邪恶胜利判定（范例：流放两名旅行者但无人被处决→邪恶胜利）；(2) 假信息只作用于"镇民角色通过能力获取的信息"，即使该镇民醉酒或中毒信息也必须为假，而角色/阵营变化等非能力信息不受影响。这两条对涡流局的信息结算和黄昏胜负判定都是硬规则。
- **建议**：在 research 或共享知识中补充"exile ≠ execution"与"Townsfolk 能力信息强制为假（含醉酒中毒），非能力信息不受影响"。

#### [low] butler 管家 — 遗漏"流放表决不受主人限制"
- **仓库现状**：research.stateChanges："明天投票受主人限制。"（Trouble Brewing 变体）；research.stateChanges："Voting restriction for next day."（Guo Jie Xin Yang、Sheng Ri Yan Hui 变体）——所有变体与 roleCopy 均未提及流放例外
- **百科依据**（管家）：角色简介："因为角色能力不能以任何形式影响流放流程，管家可以在流放表决中自由参与表决。"
- **影响**：仓库把管家的限制概括为"明天投票受主人限制"，没有任何字段说明流放（旅行者放逐）表决不受此限制。AI 说书人据此可能在流放表决中错误提醒/阻止管家投票，直接影响流放计票结果。
- **建议**：在管家的 research.highRiskNotes 或 roleCopy.prompt 中补充"流放表决不受主人限制，管家可自由参与"。

### 3.4 包间自相矛盾

#### [medium] 打更人 (dagengren)
- **仓库现状**：gui-jue-yi-xiang / sheng-shi-qi-wen 包 abilityText："猜测今晚死亡的玩家与你的最近距离……这些玩家今晚不会死亡"；jiu-quan-song-ge 包 abilityText："猜测今晚第一个死亡的玩家与你的距离……改为除你以外的所有玩家今晚不会死亡"，其 research.possibleOutcomes："Guesses distance to tonight first death; correct guess may prevent all other deaths except self."
- **百科依据**（打更人）：百科角色能力："每个夜晚*，你要猜测今晚首个死亡的玩家与你的距离。如果你猜测正确，则除你以外的所有玩家今晚不会死亡，但你可能会死亡。"
- **影响**：同一角色在不同包中的规则描述互相矛盾：jiu-quan-song-ge 版本（猜首个死亡者距离、猜对保护除自己外所有人）与百科一致；gui-jue-yi-xiang / sheng-shi-qi-wen 版本（猜死亡玩家最近距离、只保护"这些玩家"）在猜测对象和保护范围两个结算关键点上与前者冲突。涉及 scripts：gui-jue-yi-xiang、sheng-shi-qi-wen、jiu-quan-song-ge。
- **建议**：以 jiu-quan-song-ge 版本（与百科一致）为准统一各包的打更人文本。

#### [medium] 赌徒 bing-gong-ban-shi 行动被标注为首夜提醒
- **仓库现状**：research.highRiskNotes：「First-night source reminder: ?让赌徒选择一名玩家和一个角色。如果赌徒猜错了，标记赌徒死亡。」（edition 秉公办事 V6.0，scripts bing-gong-ban-shi）
- **百科依据**（赌徒）：角色能力：「每个夜晚*……」；角色简介：「除了首个夜晚以外的每个夜晚，赌徒需要选择一名玩家……」
- **影响**：同一段文本在 zhuo-yue-bi-fang、ye-mu-jiang-lin、wen-wu-shuang-quan 变体中都被正确标注为 Other-night source reminder，仅 bing-gong-ban-shi 标成 First-night，与百科的首夜不行动矛盾，属于包间时机描述互相矛盾（很可能是抓取错位，注意文本前有“?”噪声）。
- **建议**：核对 ct_edition_21097 源 JSON，把该提醒归入 other-night。

#### [medium] 奸佞 (jianning, man-tang-hong/ji-meng-ta-xiang) research 条件主体错误
- **仓库现状**：research.possibleOutcomes (Man Tang Hong): “Chooses a player to die; may choose twice if no one voted today.”；research.stateChanges: “May cause one or two deaths.”
- **百科依据**（奸佞）：百科能力文本为“每个夜晚*，你要选择一名玩家：他死亡。爪牙在其死亡的当晚要选择一名玩家……”，不含任何投票条件；该变体自身 abilityText 为“如果你今天白天没有投票，今晚你可以行动两次”。
- **影响**：research 摘要把触发条件的主体从“奸佞玩家本人今天没有投票”改成了“今天没有任何人投票”（no one voted today），与同一变体的 abilityText 语义冲突。若 AI 按 research 摘要结算，会在错误的条件下给予/拒绝第二次击杀。涉及 scripts：man-tang-hong、ji-meng-ta-xiang。
- **建议**：把 possibleOutcomes 改为 “may act twice if the Jianning player did not vote today”，与 abilityText 对齐。

#### [medium] 半兽人 (lycanthrope)
- **仓库现状**：中文变体（dou-shi-qi-yuan-lao-hua-deng 等九个包）abilityText：「当晚不会再有其他玩家死亡」（无登记条款）；英文变体（he-fang-jiao-zhong、lunar-eclipse）abilityText：「If good, they die & the Demon doesn't kill tonight. One good player registers as evil.」；roleCopy/complexKnowledge 又采用新版语义。
- **百科依据**（半兽人）：角色能力：「……当晚恶魔不会造成死亡。」「会有一名善良玩家始终被当作邪恶阵营。」
- **影响**：同一 roleId 在不同包间的规则语义互相矛盾：中文包为旧版（阻止当晚一切其他死亡、无善良玩家登记为邪恶），he-fang-jiao-zhong 与 lunar-eclipse 为新版（只阻止恶魔杀人、含登记条款）。研究摘要也随之分裂（dou-shi-qi-yuan 写 all later deaths prevented，he-fang-jiao-zhong 写 the Demon does not kill tonight）。前端 roleCopy 与 complexKnowledge 采用新版语义，与多数包内 abilityText 不一致，说书人跨包使用时会得到相互矛盾的结算指引。
- **建议**：统一到百科现行文本，或在各变体 research 中显式标注该包使用旧版半兽人并说明差异点。

#### [medium] 酿酒师 repoVariants 跨包矛盾
- **仓库现状**：abilityText 版本一（yi-ye-yu-long-wu、huang-liang-yi-meng-lao-hua-deng；gui-jue-yi-xiang、sheng-shi-qi-wen 为"今晚"措辞）: "…选择一个善良角色…改为得知你给出的信息，直到下个黄昏。[-1外来者]"；版本二（ri-yue-xie-wang、man-tang-hong）: "…选择一个镇民角色：当他下一次通过自身能力获取信息时，改为得知你给出的信息。"
- **百科依据**（酿酒师）：角色能力: "每个夜晚，你要选择一个镇民角色：当他下一次通过自身能力获取信息时，改为得知你给出的信息。"
- **影响**：同一 roleId 在不同板子包里存在规则语义级矛盾：目标范围（善良角色 vs 镇民角色）、生效窗口（当晚/直到下个黄昏 vs 持续到下一次获取信息）、setup 影响（[-1外来者] vs 无）。涉及 scripts: yi-ye-yu-long-wu、huang-liang-yi-meng-lao-hua-deng、gui-jue-yi-xiang、sheng-shi-qi-wen（版本一）与 ri-yue-xie-wang、man-tang-hong（版本二，与百科一致）。若确为各板子的不同历史版本，应在数据中显式标注版本差异，避免被当作同一规则混用。
- **建议**：核实各源 JSON 是否确实使用不同版本文本；如是，为变体加版本标注并保证 research/前端按包取对应文本；如否，统一为百科版本。

#### [medium] 暴乱 (riot) — repoVariants 之间规则矛盾
- **仓库现状**：quick-maths 变体 abilityText："On day 3, Minions become Riot & nominees die but nominate an alive player immediately. This must happen." vs xian-xiang-huan-sheng 变体 abilityText："被提名的玩家死亡……在第三个白天结束时，邪恶阵营获胜。[所有爪牙都是暴乱]"
- **百科依据**（暴乱）：角色能力："在第三个白天，所有爪牙会变成暴乱，当天被提名的玩家会立即死亡且必须再次提名一名存活的玩家。"
- **影响**：同一 roleId 在两个板子包中的规则语义互相矛盾（涉及 scripts：quick-maths、xian-xiang-huan-sheng）：被提名者死亡的生效时机（仅第三天 vs 每一天）、是否存在"第三个白天结束邪恶获胜"的胜负条件、爪牙是设置时即为暴乱还是第三天才转变。quick-maths 版与百科一致，xian-xiang-huan-sheng 版为旧文本。
- **建议**：统一为百科现行文本，或在数据中显式区分新旧版本并注明来源。

### 3.5 译名/翻译漂移

#### [high] 法官 (judge) roleCopy
- **仓库现状**：roleCopy.ability："每局一次，玩家被提名时可决定该次提名是否直接通过处决。"
- **百科依据**（法官）：角色能力："每局游戏限一次，如果其他玩家发起了提名，你可以选择让本次提名直接执行处决或让投票无效。"；角色简介："法官只能在游戏中使用一次自己的角色能力，而且仅能在其他玩家发起提名时使用。"；范例："善良的法官提名了教授。没有人投票，此时法官不能使用其角色能力。"
- **影响**：前端文案丢失两个硬条件：(1) 提名必须由"其他玩家"发起——法官对自己发起的提名不能使用能力，仓库文案"玩家被提名时"没有此限制；(2) 能力是二选一："直接执行处决"或"让投票无效"（被提名者视为得 0 票、提名流程继续），仓库文案只表达了"是否直接通过处决"，看不出还有让全部投票作废这一独立效果。按此文案结算会允许法官对自己的提名用能力，并漏掉"投票无效"分支。各 repoVariants 的 abilityText 本身与百科一致，问题仅在 roleCopy。
- **建议**：roleCopy.ability 改为与 abilityText 相同的官方文本，或至少补上"其他玩家发起提名"与"或让投票无效"两处。

#### [high] 窃贼 (thief)
- **仓库现状**：roleCopy.ability："每晚选择除自己外一名玩家；明天该玩家若投票，少算一票。"
- **百科依据**（窃贼）：角色能力："明天白天他的投票会被算作负数。"；范例："小黑在一场处决投票中投票了，计票结果不再是原本的6票（小黑没有受到窃贼能力影响的情况），而变成了4票。"
- **影响**："少算一票"表示总票数比正常少 1（例中应得 5 票），但百科规则是该玩家的投票以负数（-1）计入，相对正常投票净差 2 票（例中 6 票变 4 票）。前端中文文案的算术语义错误，会直接误导处决票数结算。abilityText 本身（"算作负数"/"counts negatively"）是正确的，问题仅在 roleCopy 意译。
- **建议**：将 roleCopy.ability 改为"明天白天他的投票会被算作负一票（-1）"或直接沿用官方文本"他的投票会被算作负数"。

#### [medium] devilsadvocate / roleCopy.ability
- **仓库现状**：roleCopy.ability："每晚选择一名存活玩家；若其明天被处决，不会死亡。"（sameAsAbilityText: false）
- **百科依据**（魔鬼代言人）：角色能力："每个夜晚，你要选择一名存活的玩家（与上个夜晚不同）：如果明天白天他被处决，他不会死亡。"；角色简介："魔鬼代言人不能连续两个夜晚选择同一名玩家，无论该玩家是否从处决中被救出"
- **影响**：前端文案丢失了"（与上个夜晚不同）"这一硬性目标限制。该限制是善良阵营"连续两天处决同一人"反制手段的规则基础，丢失后玩家可能认为可以连续保护同一目标。各包 abilityText 与 complexKnowledge.reminders（"每晚选择一名与昨晚不同的存活玩家……"）均含此条件，故 AI 侧结算风险有所缓冲，但展示文案本身缺失该条件。
- **建议**：roleCopy.ability 改为"每晚选择一名存活玩家（与上晚不同）；若其明天被处决，不会死亡。"

#### [medium] dreamer / roleCopy.ability + deng-xia-hui-ying 变体 abilityText
- **仓库现状**：roleCopy.ability："每晚选择除自己外一名玩家，得知其可能是一个善良角色或一个邪恶角色。"（sameAsAbilityText: false）；deng-xia-hui-ying 变体 abilityText："每个夜晚，选择一名其他玩家，你得知一个善良身份与一个邪恶身份，其中一个是他的真实身份。"
- **百科依据**（筑梦师）：角色能力："每个夜晚，你要选择除你及旅行者以外的一名玩家：你会得知一个善良角色和一个邪恶角色，该玩家是其中一个角色。"；角色简介："筑梦师不能选择自己和旅行者作为目标。"；运作方式："让他指向除自己和旅行者外的任意一名玩家。"
- **影响**：两处中文意译都丢失了"不能选择旅行者"这一硬性目标限制：roleCopy 只写"除自己外"，deng-xia-hui-ying 包只写"一名其他玩家"。有旅行者在场时会导致非法选择被接受。其余变体（含官方英文 "not yourself or Travellers"）和 shi-yan-jiao-chi 的 highRiskNotes（"Cannot choose self or Traveler"）均正确。
- **建议**：在 roleCopy.ability 与 deng-xia-hui-ying 包文本中补上"及旅行者以外"。

#### [medium] 杂耍艺人 (juggler) roleCopy
- **仓库现状**：roleCopy.ability："首日白天公开猜若干玩家的角色；当晚得知猜对数量。"
- **百科依据**（杂耍艺人）：角色能力："在你的首个白天，你可以公开猜测任意玩家的角色最多五次。在当晚，你会得知猜测正确的角色数量。"；角色简介："他可以猜测零个角色，或者最多猜测五个角色"。
- **影响**：前端文案把"最多五次"这一硬性数量上限弱化成"若干"，丢失了猜测次数上限。按此文案说书人可能接受超过五次的公开猜测并全部计入，结算数字被改变。各 repoVariants 的 abilityText 本身（中英文）都保留了上限五次，问题仅在 roleCopy。
- **建议**：roleCopy.ability 补回"最多五次"（如"首日白天最多公开猜测五次玩家角色；当晚得知猜对数量"）。

#### [medium] klutz（呆瓜）阵营相对性
- **仓库现状**：roleCopy.ability：「当你得知自己死亡时，公开选择一名存活玩家；若其邪恶，善良失败。」complexKnowledge.reminders：「若目标邪恶，善良阵营失败。」另有多个变体 research.possibleOutcomes 写作「if evil, good loses」（an-du-chen-cang, shang-di-que-xi, ri-yue-xie-wang, shi-yan-jiao-chi, devout-theists, zhi-shou-zhe-tian, tian-tang-hua-yuan 等）。
- **百科依据**（呆瓜）：呆瓜.wiki 角色能力：「如果他是邪恶的，你的阵营落败。」运作方式：「在特殊情况下，当属于邪恶阵营的呆瓜选择了一名邪恶玩家也会导致游戏结束，并且改为善良阵营获胜。」
- **影响**：百科能力文本是阵营相对的「你的阵营落败」，并在运作方式中明确了呆瓜转为邪恶阵营后的特例（此时选中邪恶玩家反而是善良获胜）。仓库的前端文案、complexKnowledge 提醒和多数 research 摘要把它硬化成「善良阵营失败」，在呆瓜被改变阵营的对局中会给出恰好相反的结算方向。各变体的 abilityText 本身仍是正确的「你的阵营落败」。
- **建议**：roleCopy 与 complexKnowledge 改用「你的阵营落败」表述，或补充邪恶呆瓜的特例说明。

#### [medium] 痢蛭 (lleech)
- **仓库现状**：roleCopy.ability：「每晚选择一名玩家死亡；开局选择一名玩家中毒。只有宿主死亡时，你才会死亡。」
- **百科依据**（痢蛭）：角色能力：「每个夜晚*，你要选择一名玩家：他死亡。在你的首个夜晚，你要选择一名存活的玩家：他中毒……」角色简介：「从第二个夜晚开始，痢蛭会攻击并杀死玩家」「他必须要选择一名存活的玩家」。
- **影响**：两处漂移：(1)「每晚选择一名玩家死亡」丢失「夜晚*」限定——首个夜晚痢蛭只选宿主不杀人，杀人从第二夜开始；(2)「开局选择一名玩家中毒」丢失「存活的」限定（痢蛭中途被创造时也必须选存活玩家为宿主）。仓库各变体 abilityText 本身保留了「每个夜晚*」与「存活的玩家」，仅前端文案漂移。
- **建议**：roleCopy 改为「首夜选择一名存活玩家中毒（宿主）；从第二夜起每晚选择一名玩家死亡；只有宿主死亡时你才会立即死亡」。

#### [medium] 镇长 mayor — roleCopy.ability 及多个 research 的胜利阵营表述
- **仓库现状**：roleCopy.ability: “若只剩 3 人且白天无人处决，善良胜利；若夜晚你将被杀，可能改为杀死别人。”另有多个 research.possibleOutcomes（Er Yu Wo Zha、Xin Li Bo Yi 等）写作 “If only three players live and no execution, good wins”。
- **百科依据**（镇长）：百科角色能力：“如果只有三名玩家存活且白天没有人被处决，你的阵营获胜。”运作方式补充：“在《暗流涌动》里，镇长的能力描述中‘你的阵营获胜’始终意味着‘善良阵营获胜’……在其他剧本中，如果出现了邪恶的镇长，他的能力意味着‘邪恶阵营获胜’。”
- **影响**：官方文本是“你的阵营获胜”，百科明确指出在暗流涌动以外的剧本中若镇长转为邪恶（本仓库多个自定义剧本含灵言师等阵营转变角色），则意味着邪恶阵营获胜。roleCopy 与多个 research 把它固化为“善良胜利/good wins”，在镇长阵营被改变的对局中会误导说书人判定胜负。该 roleCopy 被跨所有包共用，无法按剧本区分。
- **建议**：roleCopy 改为“你的阵营获胜”，并在 research/complexKnowledge 补充“邪恶镇长则邪恶阵营获胜”的说明。

#### [medium] 月之子 roleCopy.ability
- **仓库现状**：roleCopy.ability: "死亡后当晚选择一名存活玩家；若其善良，目标死亡。"
- **百科依据**（月之子）：角色能力: "当你得知你死亡时，你要公开选择一名存活的玩家。如果他是善良的，在当晚他会死亡。"；角色简介: "月之子必须在得知自己死亡后的一到两分钟内选择一名玩家，无论是被处决后，还是在黎明说书人宣布夜晚的死亡玩家后。"
- **影响**：中文文案丢失两个规则要件：(1) 选择必须"公开"进行；(2) 选择时机是"得知自己死亡时"立即（通常在白天处决后或黎明宣布后一两分钟内），而非"当晚选择"——"当晚"只是目标死亡的结算时点。按现文案说书人可能等到夜晚才让月之子秘密选择，违反百科运作方式。
- **建议**：改为"当你得知你死亡时，立即公开选择一名存活玩家；若其善良，当晚他死亡"。

#### [medium] princess（公主）roleCopy 与 punchy 研究摘要
- **仓库现状**：roleCopy.ability："首日如果你提名并处决一名玩家，恶魔今晚不杀人。"；research.possibleOutcomes（punchy）："若首日由公主提名并处决玩家，恶魔当晚不杀人。"
- **百科依据**（公主）：角色能力：「在你的首个白天，如果你提名并处决了一名玩家，当晚恶魔不会造成死亡。」；角色简介：「如果公主在游戏过程中被创造出来，并且在她的第一天成功提名并处决了一名玩家，当晚恶魔也不会造成死亡。」
- **影响**：官方文本的时机是"你的首个白天"（公主本人的第一个白天），仓库中文文案压缩成"首日"，最自然的读法是游戏第一天。当公主在游戏中途被创造（百科范例：第四夜麻脸巫婆把筑梦师变成公主）时，两种读法结算结果不同：按"首日"会误判能力已失效。
- **建议**：改为"在你（成为公主后）的首个白天"。

#### [medium] soldier / 士兵（roleCopy.ability）
- **仓库现状**：roleCopy.ability: "你不受恶魔影响。"（sameAsAbilityText: false）
- **百科依据**（士兵）：角色能力："恶魔的负面能力对你无效。"；规则细节："士兵无法免疫的效果包括：来自与该玩家（保护目标）阵营相同的恶魔对他进行的角色变化，照看小怪宝，成为痢蛭的寄生对象……"；角色简介："即使发起提名的玩家是恶魔，士兵仍然会因为处决而死亡。"
- **影响**：roleCopy 丢掉了"负面能力"这一限定词，把保护范围扩大成"不受恶魔影响"。百科明确列出士兵并非免疫恶魔的一切效果：同阵营恶魔的角色变化、照看小怪宝、痢蛭寄生绑定等都仍然生效，且恶魔提名导致的处决照常死亡。过宽的文案会误导说书人在这些场景下错误地判定士兵免疫。
- **建议**：改为与百科一致的"恶魔的负面能力对你无效"，或至少保留"负面/有害"限定词。

#### [medium] 送葬者 (undertaker)
- **仓库现状**：roleCopy.ability："每晚得知今天被处决玩家的角色。"
- **百科依据**（送葬者）：角色能力："每个夜晚*，你会得知今天白天死于处决的玩家的角色。"；运作方式："或发生了处决但并未导致死亡（在这种情形下送葬者不会得知任何消息）"；规则细节："在夜晚因处决而死亡的玩家其角色不会被送葬者得知。"
- **影响**：roleCopy 丢掉了两个硬条件：(1) "死于处决"被弱化为"被处决"——若玩家被处决但未死亡（如受保护、弄臣等），送葬者不应得知其角色，按仓库文案会被误结算为得知；(2) 丢失"每个夜晚*"的星号与"今天白天"限定（首夜不醒、夜间处决死亡不算）。research 各变体（如 trouble-brewing 的"只处理处决死亡"）是正确的，问题在面向用户的中文文案。
- **建议**：roleCopy.ability 改为"每个夜晚*，得知今天白天死于处决的玩家的角色"。

#### [medium] boomdandy（炸弹人）中文 abilityText/roleCopy「一分钟之后」与百科「倒数十声后」不一致
- **仓库现状**：hao-shi-duo-mo 与 zhi-shou-zhe-tian 变体的 abilityText 及 roleCopy.ability：「如果你被处决，除三名玩家以外的其他所有玩家均会死亡。一分钟之后，被最多玩家手指指着的玩家死亡。」
- **百科依据**（炸弹人）：角色能力：「如果你被处决，除三名玩家以外的其他所有玩家均会死亡。倒数十声后，被最多玩家手指指着的玩家死亡。」运作方式：「然后，倒数十声。当倒数结束时，让所有玩家暂停（宣布“停下”），随即统计玩家用手指指向的结果。」
- **影响**：百科（及仓库内 insanity-and-intuition 变体的英文 abilityText「After a 10 to 1 countdown」）规定的结算程序是说书人倒数十声后定格统计指向，中文文案沿用了旧版「一分钟」文本，说书人执行的计时程序不同。涉及 scripts：hao-shi-duo-mo、zhi-shou-zhe-tian，以及面向用户的 roleCopy（sameAsAbilityText 为 true）；与 insanity-and-intuition 英文变体在仓库内部也互相矛盾。
- **建议**：统一改为「倒数十声后，被最多玩家手指指着的玩家死亡」。

#### [medium] cerenovus 洗脑师 — roleCopy 与 complexKnowledge 丢失"夜晚"时段
- **仓库现状**：roleCopy.ability："其明天必须疯狂证明自己是该角色，否则可能被处决。"；complexKnowledge.reminders："玩家明天需疯狂证明自己是指定善良角色。"
- **百科依据**（洗脑师）：角色能力："他明天白天和夜晚需要“疯狂”地证明自己是这个角色，不然他可能被处决。"
- **影响**：官方文本时限是"明天白天和夜晚"；roleCopy 与 complexKnowledge 都只写"明天"，容易被理解为仅白天生效，导致 AI 在黄昏后提前解除疯狂约束（而百科规定疯狂标记要到下一个夜晚的黎明才移除）。
- **建议**：在 roleCopy.ability 与 complexKnowledge.reminders 中恢复"明天白天和夜晚"的完整时限。

#### [medium] butler 管家 — roleCopy 丢失"除你以外"限制
- **仓库现状**：roleCopy.ability："每晚选择一名主人；白天投票时，只有主人投票时你才能投票。"
- **百科依据**（管家）：角色能力："每个夜晚，你要选择除你以外的一名玩家：明天白天，只有他投票时你才能投票。"；提示标记："管家无法选择自己。"
- **影响**：roleCopy 意译丢掉了"除你以外"（不能选自己）这一目标合法性硬条件，也丢掉了"明天白天"的时间限定。按 roleCopy 字面，AI 可能允许管家选择自己作为主人。各 repoVariants 的 abilityText 本身正确。
- **建议**：roleCopy.ability 改为"每晚选择除你以外的一名玩家作为主人；明天白天只有主人投票时你才能投票"。

#### [medium] cannibal 食人族 — roleCopy 丢失"死于处决"条件
- **仓库现状**：roleCopy.ability："你拥有最近被处决者的能力；若该被处决者邪恶，你中毒直到善良玩家被处决死亡。"
- **百科依据**（食人族）：角色能力："你拥有上个死于处决的玩家的能力。"；角色简介："处决一名已经死亡的玩家不会让食人族获得能力。处决一名存活但并未导致死亡的玩家也不会让食人族获得能力。玩家必须要被处决并因此死亡，才会让食人族获得能力。"
- **影响**：roleCopy 第一分句写"最近被处决者"而非"上个死于处决（被处决并因此死亡）的玩家"。在"被处决但未死亡"（如士兵类免死、处决已死玩家）场景下，按 roleCopy 字面 AI 会错误让食人族换取能力。complexKnowledge.reminders 用的是"最近被处决死亡者"，与 roleCopy 不一致。
- **建议**：roleCopy.ability 改为"你拥有上个死于处决的玩家的能力……"，保持"死于处决"这一硬条件。

#### [low] 贤者 (sage) — roleCopy.ability 与 yao-wu-yin-xin 消息模板
- **仓库现状**：roleCopy.ability："若恶魔杀死你，当晚得知两名玩家中有一名是恶魔。"；research.playerMessageTemplates（yao-wu-yin-xin）："One of {seatA} or {seatB} is the Demon."
- **百科依据**（贤者）：角色能力："如果恶魔杀死了你，在当晚你会被唤醒并得知两名玩家，其中一名是杀死你的那个恶魔。"
- **影响**：中文文案和 yao-wu-yin-xin 的玩家消息模板把"其中一名是杀死你的那个恶魔"弱化为"有一名是恶魔"，丢失了指向对象的限定：所示两名玩家中必须包含杀死贤者的那个恶魔本人。在场上存在多个恶魔的局（如麻脸巫婆创造恶魔、多恶魔剧本）中，按弱化表述可能展示一个非凶手的恶魔，违反百科规则。ying-su-hua-kai 变体的模板写法正确（"...is the Demon who killed you"）。
- **建议**：roleCopy 与消息模板补上"杀死你的那个恶魔"限定。

#### [low] butcher（屠夫）roleCopy.ability 把「屠夫本人再次发起提名」弱化为「可允许再次提名」并丢失「首次处决后」
- **仓库现状**：roleCopy.ability：「每天一次，处决后你可允许再次提名。」
- **百科依据**（屠夫）：角色能力：「每个白天，首次处决后，你可以再次发起提名。」角色简介：「在有一名玩家因处决而死之后，屠夫可以提名当天第二名玩家进行处决。」「如果当天没有发生任何处决，屠夫无法在当天使用自己的角色能力。」
- **影响**：官方规则是屠夫本人在当天首次处决之后获得一次额外的提名权；「你可允许再次提名」读起来像屠夫开放（任意玩家的）第二轮提名，行为主体漂移，且丢掉「首次处决后」这一触发前提（无处决则当天不能用）。说书人可能据此错误地允许其他玩家进行第二次提名。各 repoVariants 的 abilityText 均正确，仅 roleCopy 出错。
- **建议**：改为「每个白天，首次处决后，屠夫本人可以再次发起一次提名」。

### 3.6 命名映射问题

#### [high] 公主 (gong_zhu) 与百科页面的映射
- **仓库现状**：abilityText 与 roleCopy.ability（tui-bai-can-ju，颓败残局）：“每局游戏限一次，如果王在夜晚死亡，你会被唤醒，然后你要选择一名玩家：你会得知他的角色。”
- **百科依据**（公主）：角色能力：“在你的首个白天，如果你提名并处决了一名玩家，当晚恶魔不会造成死亡。”（英文名 Princess，实验性角色，镇民）
- **影响**：仓库中 roleId=gong_zhu 的能力与被映射的百科“公主”页面完全无关：仓库版本是一个依赖“王”在夜晚死亡的限次得知型能力，百科官方公主是首个白天提名并处决后当晚恶魔无杀的能力，时机、条件、效果全部不同。要么颓败残局中的“公主”是与官方公主同名的自制角色（此时该角色不应与官方公主的百科页做同一性对照，也不应共享 roleId 语义），要么仓库文本本身抄错。无论哪种情况，当前映射都会让 AI 说书人用错误的角色知识结算。
- **建议**：核实颓败残局板子 JSON 中该角色的原文；若为同名自制角色，改用独立 roleId 或在 compare 映射中排除，避免与官方公主页面互相污染。

#### [high] 酒保 (jiu_bao, wu-ren-sheng-huan)
- **仓库现状**：abilityText/roleCopy.ability: “每个夜晚，你会得知一个在当晚能力正常生效的角色。”；team: "townsfolk"
- **百科依据**（酒保）：角色能力：“与你邻近的善良玩家（旅行者除外）之一醉酒，即使你死于处决。”；角色信息：“英文名：Bartender……角色类型：[[外来者]]”
- **影响**：百科酒保是外来者，被动使邻近善良玩家醉酒且死于处决时效果保留；仓库版本是“吴人盛欢”剧本里的镇民夜间信息角色，能力、阵营、时机全部不同。若 AI 用该百科页作为此 roleId 的规则依据，结算会完全错误。research 字段全为通用模板，也未含百科的任何醉酒/处决保留规则，无从纠正。
- **建议**：确认 wu-ren-sheng-huan 的“酒保”是否为同名自制角色；若是，解除与官方酒保百科页的配对并使用独立 roleId；若意图收录官方酒保，需改为百科能力文本并把 team 改为 outsider。

#### [high] 郡主 (jun_zhu) vs 百科页面《公主》
- **仓库现状**：repoVariants[0]（li-yuan-can-meng）：name "郡主"、officialName "Princess"、team "outsider"、abilityText "每个夜晚*，你要选择一名存活的玩家：当晚主演的负面能力对你无效，如果你选中了邪恶玩家或者丑角，你死亡。"（roleCopy.ability 相同）
- **百科依据**（公主）：公主.wiki 角色能力："在你的首个白天，如果你提名并处决了一名玩家，当晚恶魔不会造成死亡。"；角色信息："英文名：Princess"、"角色类型：镇民"。
- **影响**：数据包把仓库的"郡主"（梨园残梦板子的自定义外来者，能力围绕"主演/丑角"机制）配对到了百科的《公主》（官方实验性镇民 Princess）页面，两者能力文本、阵营类型（outsider vs 镇民）、运作方式完全无关。仓库把郡主的 officialName 标成 "Princess" 很可能是错误映射的根源：若 AI 以该映射为准，会把公主的"首个白天提名处决则当晚恶魔不杀人"规则套用到郡主身上（或反之），结算完全错误。涉及 scripts：li-yuan-can-meng。
- **建议**：核实郡主的真实来源：若为梨园残梦自定义角色，应将 officialName 改掉并解除与公主.wiki 的 ground-truth 配对；若剧本确实想用官方 Princess，则 abilityText/team 需整体替换为百科文本。

#### [high] recluse（陌客）与 隐士.wiki 配对
- **仓库现状**：roleId=recluse，roleCopy.name="陌客"，roleCopy.ability="你可能被登记为邪恶和爪牙或恶魔，即使死亡也可能如此。"；但 trouble-brewing/everyone-can-play/uncertain-death 与 one-in-one-out 脚本的变体 name="隐士"，complexKnowledge.title="隐士"，complexKnowledge.reminders="隐士可能被登记为邪恶、爪牙或恶魔，即使死亡也可能如此。"
- **百科依据**（）：隐士.wiki："英文名：Hermit"、角色能力"你拥有所有外来者能力。[-0~1外来者]"、"一个同时拥有酒鬼和陌客能力的隐士可以被当作一名邪恶角色"。本百科中 Recluse 的译名是"陌客"（见掮客.wiki 范例"说书人决定让[[陌客]]被当作邪恶阵营"、守鸦人.wiki"当心[[间谍]]和[[陌客]]"）。
- **影响**：该条目把 Recluse（陌客）与 Hermit（隐士）的百科页面配了对：wikiAbility 是隐士（Hermit）的"你拥有所有外来者能力。[-0~1外来者]"，与仓库 recluse 的登记异常能力完全是两个角色。仓库内部还在混用两个名字：多数变体叫"陌客"，但 trouble-brewing 系与 one-in-one-out 脚本的变体和 complexKnowledge 都叫"隐士"。按本百科，"隐士可能被登记为邪恶……"这句提醒挂在"隐士"名下是错误陈述——隐士只有在角色列表含陌客并获得其能力时才可能被当作邪恶。玩家/说书人查"隐士"会查到完全不同的角色，误导结算与查证。
- **建议**：统一 roleId=recluse 全部变体与 complexKnowledge 的中文名为"陌客"，并修正对照数据的配对（recluse 应对应陌客/Recluse 页面；隐士.wiki 属于 Hermit，是另一个角色）。

#### [medium] 教皇 (jiaohuang, ge-ju-mei-ying-xin)
- **仓库现状**：abilityText/roleCopy.ability: “①在你的首个夜晚，得知三个具有“假面”的在场角色。②夜晚*，你可以在你得知的角色中猜测其中一个角色对应的玩家并得知结果。如果你猜测正确，该玩家成为一个邪恶的教皇，然后你和他失去所有能力，你死亡。”；team: "minion"
- **百科依据**（教皇）：角色能力：“会有重复的善良角色在场。他们也可能是恶魔的伪装。”；角色信息：“英文名：Pope……角色类型：[[奇遇角色]]”
- **影响**：百科教皇（Pope）是奇遇角色、纯设置调整能力（在场出现重复的善良角色，可作恶魔伪装）；仓库版本是“歌尽美人心”剧本的自制爪牙猜人转化能力，含身份转变、失去能力、自身死亡等完全不同的机制。两者仅同名。research 仅有通用模板句（“may only create a note this step”），未描述任何一方的真实规则。
- **建议**：将该自制教皇与官方 Pope 百科页解绑（独立 roleId），避免规则知识库把设置调整型奇遇角色的规则套到这个自制爪牙上。

#### [medium] 弄臣 (nongchen)
- **仓库现状**：abilityText/roleCopy.ability：「恶魔知道你在游戏中，并且每个白天有一次机会猜测谁是弄臣，直到触发你的能力。如果猜测正确，一名善良玩家失去能力，如果猜错2次，一名爪牙失去能力。即使你死了。」（research.highRiskNotes 自述「custom role from GStone JSON source」）
- **百科依据**（弄臣）：弄臣（Fool）角色能力：「当你首次将要死亡时，你不会死亡。」
- **影响**：仓库中 roleId nongchen（script: ge-ju-mei-ying-xin）的能力与百科官方弄臣（Fool，免死一次）完全不同，是同名自定义角色。数据包却将其与官方弄臣百科页配对。若前端在该剧本外复用此文案、或说书人据百科页面理解此角色，都会产生完全错误的结算预期。仓库内部虽自标为 custom，但角色名与官方角色完全撞名，缺少消歧标注。
- **建议**：确认 ge-ju-mei-ying-xin 剧本源 JSON 中该角色的真实能力；若确为同名自定义角色，在 name/officialName 或文案中加「（自定义）」消歧，并修正对照数据的百科配对，避免与官方 Fool 页面互相映射。

#### [medium] 巫师(wu_shi) 与官方 Wizard 页面的映射
- **仓库现状**：abilityText 与 roleCopy.ability（script: gu-lao-mo-fa，team: townsfolk）: 「每局游戏限一次，在夜晚时*，你可以选择一名玩家和一个镇民角色：如果他不是恶魔且该角色不在场，他变成该角色。」
- **百科依据**（巫师）：角色能力：「每局游戏限一次，你可以向说书人许愿。如果愿望被实现，可能会伴随着代价和线索。」角色信息：英文名 Wizard，角色类型：爪牙。
- **影响**：仓库中的 wu_shi 是「古老魔法」板子里的镇民（限一次的夜间转化能力，类似善良版麻脸巫婆），而百科“巫师”是官方实验性爪牙 Wizard 的许愿能力——能力、阵营、时机全部不同，应是同名自制角色被错误配对到官方 Wizard 页面。按此对照做审计或向用户展示百科链接都会产生系统性误导。
- **建议**：核对 gu-lao-mo-fa 源 JSON，将该 roleId 标记为自制角色或映射到正确的百科页，勿与官方 Wizard 混用。

### 3.7 角色级覆盖缺口

#### [medium] dianyuzhang / research + complexKnowledge（缺失）
- **仓库现状**：complexKnowledge: null；各包 research 对结算时序仅有"Track marked players and next-day execution result."（zi-gui-qi-ming）、"Requires previous choice tracking and execution check; no automatic deaths."（yi-hua-jie-mu）等，均未提及醉酒中毒对结算的影响。
- **百科依据**（典狱长）：提示标记（判罚）："不论典狱长是否醉酒中毒，都要放置此标记。"；提示标记（死亡）："典狱长未醉酒中毒时，不论典狱长此次夜晚行动是否被唤醒或成功放置'判罚'标记……若这些玩家已死亡或无法被典狱长杀死或典狱长醉酒中毒，直接移除'判罚'标记。"；角色简介："典狱长在首个夜晚就会行动，他可以选择一至三名玩家，但不能不进行选择。"
- **影响**：典狱长是延迟连坐结算的复杂恶魔，但 complexKnowledge 为 null，且所有包的 research 都遗漏了改变结算结果的关键规则：(1) 死亡在典狱长下一次夜晚行动时结算，且以行动前是否已有"死于今日"标记为判定基准；(2) 结算时若典狱长醉酒中毒，被标记玩家全部不死、直接移除"判罚"标记（而选择/放标记阶段不受醉毒影响）；(3) 即使当晚未被唤醒也照常结算上一晚的选择；(4) 首夜必须行动且不能弃选。这些直接决定"死几人/死不死"，目前无任何字段覆盖。
- **建议**：为 dianyuzhang 补充 complexKnowledge，至少收录醉毒判定时点（结算时而非选择时）、结算时机（下一夜行动前检查处决死亡）与首夜必选 1-3 人。

#### [medium] lilmonsta（小怪宝）照看者死亡的胜利条件
- **仓库现状**：全部 15 个变体的 research 字段只写到照看者“是恶魔”，如 identityChanges「Babysitter registers as Demon holder.」、stateChanges「Babysitter is treated as Demon; one death may occur.」，无任何一处提到照看者死亡会结束游戏；complexKnowledge 为 null。
- **百科依据**（小怪宝）：小怪宝.wiki 角色简介：「正照顾小怪宝的玩家“是恶魔”。如果他死亡了，善良阵营获胜。」运作方式：「被标记“是恶魔”的玩家会被当作恶魔。如果他死亡了，宣布游戏结束，善良阵营获胜。」（简介另注明：一个死亡玩家照顾小怪宝会让游戏结束，因为恶魔已经死亡了。）
- **影响**：「当前照看者死亡＝恶魔死亡＝善良阵营立即获胜」是小怪宝最关键的结算规则（包括善良玩家照看时被处决也会直接终局），但在所有变体的 possibleOutcomes/stateChanges/teamChanges/highRiskNotes 中均未出现，也没有 complexKnowledge 兜底。对这种特殊恶魔，遗漏该条会让 AI 提醒不到说书人核查终局。
- **建议**：为 lilmonsta 增加 complexKnowledge 或在 research 中补充「照看小怪宝的玩家死亡时游戏结束、善良阵营获胜」的提醒。

#### [medium] 酒保 (liu_gong_jiu_bao)
- **仓库现状**：research.possibleOutcomes/highRiskNotes 仅有通用模板「AI only drafts reminders; storyteller confirms before changing authority state.」，stateChanges 为空，complexKnowledge 为 null。
- **百科依据**（酒保）：角色简介/运作方式：「由说书人选择哪名善良玩家醉酒，无论这名善良玩家是存活还是死亡」「酒保的醉酒效果会跳过与他相邻的邪恶玩家」「如果一名被酒保影响的善良玩家转为了邪恶，或者酒保变成了另一个角色，或者如果一个新的玩家变成了酒保，都会让与酒保现在邻近的善良玩家之一醉酒，而之前邻近但现在不邻近的善良玩家恢复清醒。」
- **影响**：酒保是持续检测型能力，但仓库 research 完全没有承载任何结算规则：说书人选择醉酒对象（可为死亡玩家）、跳过邻座邪恶玩家、阵营/角色变化时醉酒标记立即重新锚定等对结算有实际影响的机制全部缺失，也没有 complexKnowledge 兜底。配合能力文本本身的两处错误，说书人得不到任何正确的结算依据。
- **建议**：为酒保补充 research.stateChanges/highRiskNotes（醉酒对象由 ST 选择、跳过邪恶与旅行者、动态重锚定、非处决死亡解除）或建立 complexKnowledge 条目。

#### [medium] 堤丰之首 (lordoftyphon)
- **仓库现状**：research.setupImpact 仅为通用句「堤丰之首 has setup or composition impact; Storyteller confirms before play.」，possibleOutcomes 为通用模板，complexKnowledge 为 null。
- **百科依据**（堤丰之首）：角色简介：「在游戏开始时，堤丰之首的左右两侧必须都要有邪恶角色玩家。他不能位于一连串邪恶角色玩家队列的两侧」「与提线木偶相似，由说书人来决定哪名玩家在初始设置时成为爪牙。此外说书人还会决定爪牙的具体角色」「如果堤丰之首在游戏中途被创造，则他无需与其他邪恶角色玩家的位置相邻」。运作方式：「将角色标记放入盲抽袋前，移除所有的爪牙角色标记，并加入等量的镇民或外来者角色标记作为补充。」
- **影响**：堤丰之首的设置流程是全批次中改动最大的（盲抽袋移除全部爪牙标记、说书人指定+1爪牙及其具体角色、邪恶必须连座且恶魔不能在队列两端、外来者数量任意、中途创造豁免连座），但仓库除 abilityText 括号外没有任何具体结算/设置指引，也无 complexKnowledge。相比同批 lleech/lunatic 等角色的知识覆盖，这是对设置结算影响最大的空缺。
- **建议**：为堤丰之首补充 setupImpact 具体条目（移除爪牙标记、ST 指定爪牙玩家与角色、连座与居中约束、外来者数量可任意增减、中途创造豁免）并考虑建立 complexKnowledge。

#### [medium] 提线木偶 marionette — complexKnowledge 遗漏关键运作规则
- **仓库现状**：complexKnowledge.reminders 仅有：“提线木偶以为自己是一个善良角色，但实际是爪牙。”“必须与恶魔相邻，恶魔知道提线木偶是谁。”requiredContext: “恶魔座位/提线木偶座位/玩家误认身份”。
- **百科依据**（提线木偶）：百科角色简介：“认为自己是提线木偶的玩家所抽取到的善良角色对应的能力不会产生任何效果，但说书人会假装这些效果生效了。这与酒鬼的运作方式相似。”“提线木偶不会在游戏的首个夜晚被唤醒以得知其他邪恶玩家都有谁，其他爪牙也不会得知谁是提线木偶。”运作方式：“他会在他以为的那个善良角色的时机被唤醒，可能获得错误信息，但不会在首夜爪牙信息时被唤醒。”
- **影响**：complexKnowledge 缺少两条对结算关键的规则：(1) 提线木偶抽到的善良角色能力完全不生效，说书人需按酒鬼方式在该角色的行动时机唤醒他并给出（可能错误的）信息——缺少这条会导致 AI/说书人真的按善良角色结算其能力；(2) 提线木偶不参与首夜爪牙信息环节，其他爪牙也不知道谁是提线木偶——缺少这条会导致首夜错误地唤醒他或向其他爪牙泄露信息。各 repoVariants 的 research 同样只覆盖邻座与隐藏身份，未覆盖能力失效运作。
- **建议**：在 reminders 中补充“其善良角色能力不生效，按酒鬼方式假装生效并在该角色时机唤醒给信息”“首夜不参与爪牙信息环节，其他爪牙不知道提线木偶是谁”。

#### [medium] 灵言师 mezepheles — complexKnowledge 遗漏醉酒/中毒时机与能力消耗规则
- **仓库现状**：complexKnowledge.reminders: “灵言师得知秘密词；首个说出秘密词的善良玩家会在当晚变邪恶。”“灵言师不会自动得知是否有人变邪恶；玩家变阵营必须人工确认。”
- **百科依据**（灵言师）：百科角色简介：“如果灵言师在夜晚是清醒且健康的，那么即使他在白天善良玩家说出关键词时醉酒或中毒，仍然会让这名善良玩家转为邪恶。但如果一名玩家即将在夜里转为邪恶时灵言师醉酒中毒了，那么那名玩家会仍然保持善良阵营不变——灵言师会因此消耗他的能力的使用次数，并且无法在随后再让其他玩家转为邪恶阵营。”另有前提：“说书人需要实际听到那名玩家确切地说出了这个关键词。”
- **影响**：complexKnowledge 与所有 repoVariants 的 research 都没有覆盖两条改变结算结果的硬规则：(1) 判定醉酒/中毒的时机是夜晚结算时而非白天说出关键词时；(2) 若夜晚结算时灵言师醉酒/中毒，目标保持善良且灵言师的一次性能力被消耗（此后不能再转变任何人）——遗漏会导致说书人在灵言师恢复健康后再次触发转变。此外“说书人必须实际听到玩家说出关键词”这一触发前提也未记录。
- **建议**：在 reminders 补充：以当晚结算时灵言师是否清醒健康为准；转变失败时能力照样消耗、之后不能再转变；触发以说书人实际听到关键词为前提。

#### [medium] 卖花女孩 mai_hua_nv_hai — research 无任何角色专属规则细节
- **仓库现状**：唯一 variant（xue-se-feng-hua）的 research.possibleOutcomes 仅有通用句 “Provides storyteller-confirmed information to the player.”，setupImpact/stateChanges 等均为空，complexKnowledge 为 null。
- **百科依据**（卖花女孩）：百科角色简介：“卖花女孩的能力不会检测到恶魔玩家因为其他的原因而举手表决。例如……恶魔玩家举手赞成流放旅行者，都不会被卖花女孩的能力检测到。”“如果有两名或更多的恶魔玩家在场……即使那些死去的恶魔也能检测到。”“如果在原恶魔投票之后……恶魔玩家发生了改变，卖花女孩的能力还是会检测到原恶魔是否投票。”
- **影响**：仓库对该角色只有通用模板文案，遗漏了多条决定“是/否”答案的结算规则：(1) 只统计处决提名中的投票，赞成流放旅行者的举手不算投票；(2) 多恶魔在场时任一恶魔（含已死亡恶魔用死亡票）投票即为“是”；(3) 白天投票后恶魔玩家变更的，仍以原恶魔当日是否投票为准。这些细节直接决定给卖花女孩的信息内容，缺失会导致错误结算。
- **建议**：在 research.possibleOutcomes/highRiskNotes 中补充：流放投票不计、任一（含死亡）恶魔投票即为是、恶魔变更后仍回溯原恶魔投票。

#### [medium] 穷奇 (qiongqi) 活尸结算细节
- **仓库现状**：持有正确能力文本的变体（tong-yan-wu-ji、bing-gong-ban-shi）research 仅有通用摘要，如 possibleOutcomes："Use source night reminder to record choices, results and player-facing information."；complexKnowledge 为 null。
- **百科依据**（）：穷奇.wiki："'活尸'状态下的玩家死亡时，相关的'死亡时触发的能力'不会触发……而'得知自己死亡'的能力会正常触发"；"'活尸'状态与醉酒中毒相似：玩家会失去自身的能力"；范例："由于穷奇仍然存活，且场上实际存活的玩家只有两名，说书人宣布邪恶阵营获胜。"
- **影响**：穷奇的活尸机制有多条直接改变结算结果的硬规则，仓库的 research 与 complexKnowledge 完全没有覆盖：(1) 活尸玩家实际处于死亡状态，之后再次'死亡'时死亡触发型能力不触发，但'得知自己死亡'型能力（如呆瓜/月之子）会触发；(2) 活尸如醉酒中毒般失去自身能力、信息可能出错；(3) 胜负判定按实际存活人数计算，活尸不算存活，游戏可能在广场表面人数尚多时结束；(4) 活尸是一次性状态，穷奇之后醉酒中毒或死亡也不恢复；(5) 死亡被阻止的玩家不会进入活尸状态。缺少这些提醒，AI 生成的结算草稿很容易在这些点上出错。
- **建议**：为 qiongqi/qiong_qi 补充 complexKnowledge（reminders 覆盖上述活尸规则、'死于今日'与'死亡'标记流程、胜负按实际存活计算），至少在持正确文本的变体 research.stateChanges/highRiskNotes 中写明。

#### [medium] 宠妃（chong_fei / chongfei）— 遗漏"中毒或醉酒时不能打破规则"
- **仓库现状**：research.possibleOutcomes："Once per game ST breaks a rule about her, then secretly tells what was done."（Bai Zhou Wei Shi、Man Tang Hong 变体）；其余变体仅有通用提醒（"AI only drafts reminders..."）；complexKnowledge 为 null
- **百科依据**（宠妃）：角色简介："如果宠妃中毒或醉酒，说书人不能为宠妃打破规则；但说书人可以在宠妃即将中毒或醉酒时打破规则，让宠妃保持健康且清醒。"
- **影响**：涉及 chong_fei 与 chongfei 两个条目（scripts：liu-gong-fen-dai、yi-ye-yu-long-wu、dou-shi-qi-yuan-lao-hua-deng、bai-zhou-wei-shi、man-tang-hong、ji-meng-ta-xiang）。醉毒禁用是该角色唯一的失效条件，缺失后 AI 可能在宠妃中毒时仍建议打破规则。此外"打破规则后放置失去能力标记（限一次已用尽）"的追踪要点也未落入 research。
- **建议**：为宠妃补充 research/complexKnowledge：中毒醉酒时不可打破规则（但可为使其保持健康而打破）、打破后放置"失去能力"标记。

#### [medium] 帽匠 (hatter) 各变体缺少两条硬性结算规则
- **仓库现状**：wu-he-you-zhi-xiang 变体 research.identityChanges: “Minions or Demons may become new same-type characters.”，highRiskNotes: “Hatter changes must check duplicate roles and current evil structure manually.”；jing-hou-jia-yin 变体 identityChanges: “On death, Minions and Demons may choose new characters.”（complexKnowledge 为 null）
- **百科依据**（帽匠）：规则细节: “如果帽匠在夜晚时由于恶魔的攻击而死亡，在茶会中产生的新恶魔在当晚无法再次攻击。”；提示标记“今晚茶会”放置时机: “帽匠死亡，且他清醒健康。”；角色简介: “如果某名玩家选择变成了一个已在场的角色，那么那个角色对应的玩家必须选择变成一个新的角色。”
- **影响**：四个变体与 roleCopy 均未收录两条会改变结算的硬规则：(1) 帽匠夜间被恶魔杀死时，茶会产生的新恶魔当晚不能再次攻击；(2) 帽匠死亡时须“清醒健康”（未醉酒中毒）才触发茶会。此外“选到已在场角色会迫使原角色玩家改选新角色”仅在 wu-he-you-zhi-xiang 以“check duplicate roles”笼统带过，其余变体完全没有。这些遗漏在实际结算（夜杀帽匠、下毒帽匠）时会直接给错结果。
- **建议**：为 hatter 增加 complexKnowledge，收录“新恶魔当晚不可攻击”“醉酒中毒死亡不触发”“角色不可重复、选在场角色则原玩家必须改选”。

#### [medium] 枪手 (gunslinger) research 缺少流放投票不计入的硬规则
- **仓库现状**：research.possibleOutcomes（niu-zhuan-qian-kun 变体）: “枪手: may only create a timing reminder; no automatic authority-state change.”；trouble-brewing 变体 research 各字段为空；si-dong-fei-dong 变体仅有通用死亡提示。三个变体均无流放相关规则。
- **百科依据**（枪手）：角色简介: “流放表决不会受到能力的影响，因此枪手不能将他的能力用在那些支持流放表决的人身上。”；范例: “由于[[替罪羊]]的流放表决不算作是首次投票，[[管家]]的处决投票才算作是首次投票”。
- **影响**：百科明确：流放表决不算“首次投票”，且枪手不能射杀支持流放的投票者。仓库所有变体的 research 都没有这条硬规则，遇到“当天先流放后提名处决”的常见场景会算错哪次投票是首次投票、并可能允许枪手射杀流放投票者，直接影响结算。
- **建议**：在 research 或 complexKnowledge 中补充“流放表决不计为首次投票，不能选择流放投票者”。

#### [low] 哈迪寂亚 — 同一角色拆成两个 roleId，complexKnowledge 只挂其一
- **仓库现状**：数据包同时存在 roleId "al-hadikhia"（scripts: ye-ban-kuang-huan，complexKnowledge: null）与 roleId "alhadikhia"（其余 7 个板子，附带 complexKnowledge）。
- **百科依据**（哈迪寂亚）：两个条目指向同一百科页面「哈迪寂亚」（英文名：Al-Hadikhia）。
- **影响**：同一角色被拆成两个 roleId，共享复杂角色知识只挂在 alhadikhia 上；使用 al-hadikhia 的 ye-ban-kuang-huan 板子拿不到 reminders/aiCannot 等结算辅助，同角色在不同板子获得的规则支持不一致。另外 alhadikhia 的 complexKnowledge.title 写作「阿哈迪基亚」，与百科译名「哈迪寂亚」不一致。
- **建议**：归并 roleId 或为两个 ID 挂同一份 complexKnowledge，并统一译名为「哈迪寂亚」。

## 四、覆盖缺口盘点（low，无需核实）

### 4.1 百科有角色页、仓库未收录的 27 个角色

- **Q宝**：阵营类别：外来者（善良阵营）。能力概括：每晚选择一名“主人”，次日只有主人投票时自己才能投票（管家的恶搞变体）。来源：恶搞剧本《按牛涌动》（暗流涌动的愚人节戏仿版）。补充价值：低——愚人节恶搞角色，正常对局几乎不会使用，且机制与仓库已有的“管家”基本相同，收录优先级最低。
- **亡魂**：阵营类别：邪恶阵营（页面“角色信息”未明列角色类型，但正文通篇以邪恶队友视角描述，属爪牙类隐藏角色）。能力概括：夜晚可随时睁眼偷看，且在任何邪恶玩家被唤醒时一同醒来，充当邪恶阵营的夜间情报与协调核心。来源：官方实验性角色。补充价值：高——官方实验性角色，可进入自定义剧本，且带有多条相克规则与包容性设计说明，AI 说书人需要知道其夜间唤醒联动的特殊运作。
- **佛教徒**：阵营类别：传奇角色（说书人辅助角色，不属善恶阵营）。能力概括：让有经验的老玩家在每个白天前两分钟禁言，给新手玩家发言空间。来源：官方传奇角色（页面未列所属剧本）。补充价值：低——纯线下社交调节工具，无夜间结算和信息逻辑，对 AI 说书人引擎的自动化价值很小。
- **侏儒**：阵营类别：旅行者（初始阵营随分配，善恶皆可）。能力概括：入场时公告一名同阵营“同伴”，此后每当同伴被提名，侏儒可选择杀死提名者。来源：官方实验性角色（旅行者）。补充价值：中——官方实验性旅行者，线下中途加入场景常见，含进场公告与提名触发死亡的结算逻辑，仓库若支持旅行者中途加入则值得收录。
- **公爵夫人**：阵营类别：传奇角色。能力概括：每个白天恰好三名玩家可自愿拜访她，当晚各自得知三人中邪恶者数量，但其中一人得到错误数字。来源：官方传奇角色，用于信息量偏少的自定义剧本。补充价值：中——有明确的夜间信息结算规则（访客/错误信息标记），是少数会实际参与夜间流程的传奇角色，对 AI 说书人可自动化。
- **印度教教徒**：阵营类别：奇遇角色（说书人变体玩法角色）。能力概括：最先死亡的四名玩家立即以同阵营旅行者身份转世重生，旅行者角色由说书人指定；若恶魔位列其中则善良直接获胜（另有爪牙继任的可选规则）。来源：奇遇角色（页面未列所属剧本）。补充价值：低——颠覆常规死亡规则的变体玩法角色，使用场景少，且依赖说书人大量自由裁量。
- **园丁**：阵营类别：奇遇角色。能力概括：允许说书人在发牌前手动指定某些玩家获得特定角色（照顾玩家偏好或连续抽到邪恶的玩家）。来源：官方 app／在线魔典专用奇遇角色。补充价值：低——只影响发牌流程、无游戏内结算；AI 说书人本身就掌控发牌，收录仅有资料完整性意义。
- **地狱藏书员**：阵营类别：传奇角色。能力概括：说书人宣布安静后仍说话的玩家会遭受由说书人裁定的惩罚（死亡、失去能力或当天禁票等）。来源：官方传奇角色。补充价值：低——面向线下秩序管理的说书人工具，惩罚内容全凭裁量，几乎没有可自动化的结算逻辑。
- **天使**：阵营类别：传奇角色。能力概括：庇护一名或多名新手玩家，若其死亡，对其死负最大责任的玩家将遭受说书人裁定的惩罚。来源：官方传奇角色。补充价值：低——新手保护的社交性工具，触发与惩罚均靠说书人主观裁量，对自动化引擎价值有限。
- **失败的上帝**：阵营类别：传奇角色。能力概括：宣告本局说书人至少会犯一次错（可有意可无意），错误必须被纠正并公开承认，为说书人的失误提供“兜底”。来源：官方传奇角色。补充价值：低——专为人类说书人容错设计的元角色，对追求零失误的 AI 说书人几乎无实际用途，仅有图鉴完整性意义。
- **孟婆**：阵营类别：爪牙（邪恶阵营）。能力概括：每晚（首夜除外）可选一名存活玩家，令其在“永久失去能力”与“死亡但保留能力到下个黄昏”之间二选一。来源：中文社区角色合集《山雨欲来》（创意来源：卷饼）。补充价值：中——规则完整（含数学家、梼杌、郎中等互动及红唇女郎、罂粟种植者相克），若仓库计划收录山雨欲来合集则为必备爪牙；单独收录价值一般。
- **小提琴手**：阵营类别：传奇角色。能力概括：时间不足或僵局时强制终局——恶魔秘密挑一名对立阵营玩家进行“小提琴比赛”，全员表决定胜负，平票邪恶胜。来源：官方传奇角色。补充价值：中——有明确的终局表决结算流程，对线上/AI 主持的超时收尾场景有实际用途。
- **异术士**：阵营类别：奇遇角色。能力概括：说书人给一名或多名玩家私发“支线任务”目标，达成者获得一条不受醉酒中毒影响的正确信息。来源：奇遇角色（页面未列所属剧本）。补充价值：低——目标内容与达成判定完全依赖说书人自由发挥（甚至可以是游戏外行为），难以自动化。
- **戏子（改）**：阵营类别：镇民（善良阵营）。能力概括：其他善良玩家（旅行者除外）全程醉酒、善良玩家首夜互认且无法转变阵营，游戏结束时胜负结果对调。来源：中文社区合集《山雨欲来》，是华灯系列“戏子”的改版（Actor v2.0）。补充价值：中——对局影响极大且带大量相克规则（间谍/寡妇/召唤师/军团/无神论者等），若仓库要支持山雨欲来剧本则必须收录；注意与仓库已有的原版“戏子”互为克星。
- **末日预言者**：阵营类别：传奇角色。能力概括：存活人数不少于四人时，每名存活玩家每局一次可公开要求说书人杀死一名与自己同阵营的玩家，用于加速大人数对局。来源：官方传奇角色。补充价值：中——触发条件与结算规则明确（同阵营击杀、四人下限、每人限一次），可自动化，适合大人数局提速场景。
- **狂热者**：阵营类别：外来者（善良阵营）。能力概括：存活人数不少于五人时，必须对每次提名投票（流放除外），死亡后恢复自由投票。来源：官方实验性角色。补充价值：高——官方实验性外来者，常见于自定义剧本，规则明确（含存活人数阈值、旅行者计入、相克规则），是仓库官方角色覆盖上的实际缺口。
- **玩具匠**：阵营类别：传奇角色。能力概括：小型剧本（5-6人）辅助——恶魔每局至少一晚必须放弃攻击，且即使人数不足七人，首夜也照常进行爪牙信息与恶魔信息步骤。来源：官方传奇角色，配合剧本工具的小型剧本选项使用。补充价值：中——有明确的夜间流程改动（首夜信息、强制放弃攻击的判定），若仓库支持 5-6 人小型局则值得实现。
- **笑匠**：阵营类别：旅行者。能力概括：每个白天选定一名玩家免疫其能力，当晚由说书人让另一名玩家改变角色（新角色由说书人决定，可为在场或不在场角色）。来源：官方实验性角色（旅行者）。补充价值：中——官方实验性旅行者，涉及每晚角色变化的复杂结算，若仓库支持旅行者与角色变化机制则值得收录。
- **腹语师**：阵营类别：奇遇角色。能力概括：被提名者若“疯狂”地声称一个此前未声称过的角色，可能被处决而不死，是否达标由说书人裁定。来源：奇遇角色（页面未列所属剧本）。补充价值：低——核心依赖“疯狂”表现的主观裁量，AI 难以客观判定，属派对向变体。
- **讷神**：阵营类别：奇遇角色。能力概括：一顶“讷帽”在玩家间流转，戴帽者只能说单音节词但投票算两票，说出多音节词即失帽。来源：奇遇角色（官方，中文运作经本地化调整，另附全文“讷言讷语”单音节版规则）。补充价值：低——纯派对道具玩法，依赖线下语言监督，对 AI 说书人自动化价值很小。
- **诡诈杰克**：阵营类别：奇遇角色。能力概括：双说书人玩法——玩家每次获取信息时自选一位说书人，一位恒真一位恒假，每局限一次可在黄昏互换。来源：奇遇角色（页面未列所属剧本）。补充价值：低——前提是“两位说书人”，与单 AI 说书人的产品架构天然不符；除非专门做双说书人模式，否则无收录必要。
- **赦令承旨**：阵营类别：传奇角色。能力概括：解除所有角色能力选择时的限制条件（如“除你以外”“存活的”“与上晚不同”等），页面附逐角色的修改后能力文本清单。来源：中文社区合集《山雨欲来》（创意来源：Richard Black）。补充价值：低——需要改写大量既有角色的选择约束，落地成本高、使用面窄；仅在整体收录山雨欲来合集时才值得连带实现。
- **遗忘之门**：阵营类别：奇遇角色。能力概括：全员不知道自己的角色与阵营（恶魔爪牙也互不相认），能力照常生效，死亡时才得知自己的身份。来源：奇遇角色（页面未列所属剧本）。补充价值：低——彻底颠覆发牌与信息规则的变体玩法，实现要重构初始设置与夜间提示流程，受众小。
- **陌客**：阵营类别：外来者（善良阵营）。能力概括：被探查或被针对时可能被当作邪恶阵营、爪牙或恶魔角色，即使已死亡（Recluse）。来源：官方剧本《暗流涌动》。补充价值：低（作为新角色）——仓库已以“隐士”之名收录该角色，这不是真实覆盖缺口，而是译名差异：百科官方译名为“陌客”，“隐士”被页面标注为非官方称呼。真正有价值的动作是补充“陌客”作为角色别名/主名映射。
- **革命者**：阵营类别：传奇角色。能力概括：指定一对邻座玩家全局同阵营并公开（用于帮助弱势玩家或情侣搭档参与），每局限一次其中一人可被探查为其他角色/阵营。来源：官方传奇角色。补充价值：低——主要是无障碍/社交配对工具，仅“限一次误注册”有少量结算逻辑，对自动化引擎优先级低。
- **首席律师**：阵营类别：奇遇角色。能力概括：每名被提名者须指定一名“辩护律师”，投票前只有律师能发言且必须“疯狂”地证明被提名者善良，否则可能被说书人处死。来源：奇遇角色（页面未列所属剧本）。补充价值：低——发言管制与“疯狂”判定高度依赖线下主持裁量，派对向玩法，自动化价值低。
- **骗人精**：阵营类别：传奇角色。能力概括：每局限一次，说书人可让一名善良玩家获得“有问题”的信息（含把本应错误的信息变正确），用于信息过强、无错误信息来源的自定义剧本。来源：官方传奇角色。补充价值：中——触发一次即失去能力、只影响“获取信息类”能力，规则边界清晰（页面明确不影响贞洁者、僧侣这类非信息能力），是自定义剧本平衡工具中较易自动化的一个。

### 4.2 百科剧本页未入库（16 个）

一往巫前、七步成诗、亡灵议会、冥河邪渡、冲动消费、双子煞星、幽灵侦探、无名旅客、显我神通、灯神契约、狡兔三窟、猎巫行动、轮到你了、迟见分晓、错位时空、阴阳难辨（按标题精确匹配未命中，个别可能是别名，入库前请人工确认）

## 五、low 级备注（角色层 80 条 + 夜序 3 条 + 概念 4 条）

表述可优化但不影响结算的条目，全文见 `merged-results.json` 各 lane 的 `low` 数组。

## 七、修复状态（2026-08-04 更新）

本报告的确认发现已在分支 `fix/wiki-ground-truth-audit` 上修复，共 8 个 commit、422 处改动，
`npm run check`（lint + 851 测试 + 构建 + 架构校验）通过。

| commit | 范围 | 改动 |
| --- | --- | --- |
| `5732be0` | 译名统一 | 45 处（33 板子包改名 + 11 共享知识标题 + 文案/测试/验收文档同步）|
| `4335375` | `role-copy.ts` | 55 条中文能力文案按百科重写 |
| `bd936ba` | 板子包 | 92 个 `roles.ts` + 40 个 `setup-rules.ts`（abilityText 与 research 摘要）|
| `877e1af` | `complexRoleKnowledge.ts` | 44 条结算提示修正 + roleIdAliases 补连字符别名 |
| `38d272e` | 夜序 | 13 个包 33 处（刻度换算、字母序污染、缺失条目、note 矛盾）|
| `6c775c3` | 产品机制 | 处决门槛动态计算、处决与死亡解耦、已死玩家可被处决 |
| `365bd70` | 完整性补漏 | 半兽人中文变体旧版文本（8 个包）|

### 修复方法

19 个并行修复者按文件归属分工（role-copy / 板子包 13 组 / 共享知识 / 夜序 4 组），
每条发现要求先读百科原页核对再改，审计的 suggestion 仅作参考。
共应用 421 条、跳过 218 条；跳过的主要是同一发现被列给多个 lane 时的分工转交
（各 lane 只改自己文件）、已被其他修复覆盖、以及映射/撞名盘点类无文本可改。

修复过程中修正了 3 处锁定错误内容的测试断言（如断言舞蛇人文案含「新舞蛇人中毒」，
而百科规定为「永久中毒」；断言落难少女含「爪牙公开猜中你一次」，而百科有「每局限一次」上限）。

### 完整性复核

分工转交存在「两边都漏」的风险，因此对其中 18 条 high/medium 转交项做了独立复核：
16 条确认已被接收方修复，1 条确为遗漏（半兽人，已补修），1 条不适用。

### 已知未处理项

- **自创角色与官方角色 officialName 撞名**（梨园残梦「郡主」、颓败残局「公主」均标 Princess；
  另有自制酒保/教皇/巫师/弄臣等误配官方页）：属数据溯源问题，需核实社区剧本源 JSON 后再定，
  不宜按百科强改。
- **报丧女妖等角色未新增 complexKnowledge 条目**：该文件测试硬断言条目数为 74 且与
  `dev-docs/role-research/` 下 74 个文档一一对应，新增需同步补文档，超出本次范围；
  相关规则已在板子包 research 中落地。
- **覆盖缺口**（27 个百科独有角色、16 个未入库剧本页）：属功能新增，非缺陷修复。
- **旅行者「流放」独立记录通道**：需新增领域概念与 UI 流程，改动面大于本次修复批次，
  建议单独立项；当前已在报告第二节记录其与处决的规则差异。

## 六、审计边界

- 463 个仓库角色（多为武侠社区板子）在百科无对应页，无法用本 ground truth 审计；其原始来源是 GStone 剧本 JSON。
- 17 对剧本花名册对照零差异（同源于 GStone，符合预期）。
- 百科夜序总表自身对部分官方顺序做了「优化调整」，审计时仅在仓库与官方原序、百科推荐序都矛盾时才计为问题。
- 56 条被驳回的发现及驳回理由保留在 `merged-results.json` 的 `rejected` 数组，供复查。