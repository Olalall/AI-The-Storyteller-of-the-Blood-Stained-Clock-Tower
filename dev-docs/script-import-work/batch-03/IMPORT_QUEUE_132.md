# batch-03 官方魔典 132 板导入队列

日期：2026-07-21。

来源：官方魔典 `grimoire_edition_list` 接口的三个页面分类。本文只记录导入队列，不代表已导入。

统计：官方剧本 8，缝合剧本 77，原创角色剧本 47，合计 132。

已接入或对应：按当前 registry 已有板子名称和常见译名对照粗标，后续单板还要复核来源是否同版本。

导入原则：按单板小闭环推进；每个板子都要先做角色事实、夜序、setup 和高风险规则复核，然后才能进 registry。

导入状态说明：`已接入或对应` 表示项目已有同名或对应板子；`待导入` 进入后续单板闭环；`角色池候选` 不直接当开局板子。

## 官方剧本 (8)

| 序号 | 名称 | 作者 | 角色数 | 来源 ID | 状态 | 下一步 |
|---:|---|---|---:|---:|---|---|
| 1 | 暗流涌动 | The Pandemonium Institute | 27 | 1 | 已接入或对应 | 复核现有 pack |
| 2 | 黯月初升 | The Pandemonium Institute | 30 | 2 | 已接入或对应 | 复核现有 pack |
| 3 | 梦殒春宵 | The Pandemonium Institute | 30 | 3 | 已接入或对应 | 复核现有 pack |
| 4 | 无上愉悦 | The Pandemonium Institute | 11 | 4 | 需人工分类 | 先判断是小板、角色池还是特殊玩法 |
| 5 | 窃窃私语 | The Pandemonium Institute | 11 | 5 | 需人工分类 | 先判断是小板、角色池还是特殊玩法 |
| 6 | 实验性角色（非剧本） | The Pandemonium Institute | 68 | 20073 | 角色池候选 | 只拆角色知识，不直接当开局板子 |
| 7 | 华灯初上（非剧本） | The Pandemonium Institute | 27 | 20181 | 角色池候选 | 只拆角色知识，不直接当开局板子 |
| 8 | 山雨欲来（非剧本） | The Pandemonium Institute | 33 | 21136 | 角色池候选 | 只拆角色知识，不直接当开局板子 |

## 缝合剧本 (77)

| 序号 | 名称 | 作者 | 角色数 | 来源 ID | 状态 | 下一步 |
|---:|---|---|---:|---:|---|---|
| 1 | 何方教众 | Zets | 26 | 21087 | 已接入或对应 | 已建 `src/domain/scripts/packs/he-fang-jiao-zhong/`，后续做浏览器抽查 |
| 2 | 黑人抬棺 | 刘中奇 | 21 | 21204 | 需人工分类 | 角色数低于当前智能板子质量门，且大量原创角色；先归入特殊/小板复核，不硬注册 |
| 3 | 似懂非懂 | 靶子 | 41 | 21179 | 已接入或对应 | 已建 `src/domain/scripts/packs/si-dong-fei-dong/`；16 个旅行者仅保留知识/夜序，不进普通模板 |
| 4 | 无何有之乡 | 鸭镇 | 25 | 21137 | 已接入或对应 | 已建 `src/domain/scripts/packs/wu-he-you-zhi-xiang/`；军团保留特殊提醒，未进普通模板 |
| 5 | 秉公办事 | 清清Jungle | 34 | 21097 | 已接入或对应 | 已建 `src/domain/scripts/packs/bing-gong-ban-shi/`；教父/穷奇/赶尸人/无神论者等人数修正先保留为提醒 |
| 6 | 浊月毕方 | Lei的剧本钟楼 | 25 | 21096 | 已接入或对应 | 已建 `src/domain/scripts/packs/zhuo-yue-bi-fang/`；军团保留特殊提醒，教父模板显式带人数修正 |
| 7 | 将错就错 | 刘中奇 | 17 | 21093 | 需人工分类 | 角色数低于当前智能板子质量门；先归入特殊/小板复核，不硬注册 |
| 8 | 大哥刀我 | 钢棍屑师傅 | 17 | 21092 | 需人工分类 | 角色数低于当前智能板子质量门；先归入特殊/小板复核，不硬注册 |
| 9 | 夜幕降临 | 贾卡Jaques | 24 | 21091 | 已接入或对应 | 已建 `src/domain/scripts/packs/ye-mu-jiang-lin/`；教父人数修正保留提醒，未进首批普通模板 |
| 10 | 堕落天使 | Zets | 16 | 21090 | 需人工分类 | 角色数低于当前智能板子质量门；先归入特殊/小板复核，不硬注册 |
| 11 | 心理博弈v9.0.0 | Habby | 28 | 21206 | 已接入或对应 | 已建 `src/domain/scripts/packs/xin-li-bo-yi/`；圣洁之魂、灯神和私货商人仅作传奇提醒 |
| 12 | 仇海溺行 | Theo | 24 | 21086 | 已接入或对应 | 已建 `src/domain/scripts/packs/chou-hai-ni-xing/`；利维坦单恶魔模板，气球/男爵/无神论者/提线木偶保留提醒 |
| 13 | 以眼还眼 | The Good Couch | 26 | 20970 | 已接入或对应 | Added `src/domain/scripts/packs/yi-yan-huan-yan/`; Legion/Vigormortis/Marionette setup or special paths stay reminders; death, poison and win/loss remain ST-confirmed |
| 14 | 喃喃低语 | 驯鹿 | 26 | 20949 | 已接入或对应 | 已建 `src/domain/scripts/packs/nan-nan-di-yu/`；巡山人/方古人数与身份变化路径先保留提醒 |
| 15 | 护犊之征 | 陌上叶 | 27 | 20943 | 已接入或对应 | 已建 `src/domain/scripts/packs/hu-du-zhi-zheng/`；小怪宝用“无恶魔玩家 +1 爪牙”模板修正，保姆与死亡只提醒 |
| 16 | 我是火车王！ | Cam | 22 | 20942 | 已接入或对应 | Added `src/domain/scripts/packs/jiao-huan-ren-sheng/`; Villager/Drunk/Vigormortis/Fang Gu setup paths stay reminders; death/poison/identity/alignment/madness/redirection/win-loss outcomes remain ST-confirmed |
| 17 | 妙山封仙 | Jams | 26 | 20941 | 已接入或对应 | Added `src/domain/scripts/packs/sheng-dan-ye-jing-hun/`; Fabled stays outside normal templates; Balloonist/Mystic/Drunk/Mr. Hostage/Kazali setup paths stay reminders; death/poison/identity/alignment/madness/redirection/win-loss outcomes remain ST-confirmed |
| 18 | 保护我方小怪宝 | 驯鹿 | 26 | 20940 | 需人工分类 | 含小怪宝保护法等自定义传奇规则；先不按普通板子硬注册 |
| 19 | 文武双全 | 晓辰 | 25 | 20908 | 已接入或对应 | 已建 `src/domain/scripts/packs/wen-wu-shuang-quan/`；气球驾驶员/教父 setup 路径先保留提醒 |
| 20 | 十三行 | Lei的剧本钟楼 | 25 | 21286 | 已接入或对应 | 已建 `src/domain/scripts/packs/shi-san-hang/`；司民/驿使/画皮等来源自定义角色映射为稳定 ID，教父/饕餮 setup 路径先保留提醒 |
| 21 | 信口雌黄 | 努力努力 | 25 | 21685 | 已接入或对应 | 已建 `src/domain/scripts/packs/xin-kou-ci-huang/`；来源数字 ID 已映射为稳定角色 ID，科学怪人/堤丰之首/卡扎力 setup 路径先保留提醒 |
| 22 | 势焰交炽 | 我不认出 | 26 | 21531 | 已接入或对应 | 已建 `src/domain/scripts/packs/shi-yan-jiao-chi/`；来源重复食人族已折叠，召唤师/饕餮 setup 路径先保留提醒，教父模板显式携带外来者修正 |
| 23 | 日月偕亡 | 闻人 | 25 | 21530 | 已接入或对应 | 已建 `src/domain/scripts/packs/ri-yue-xie-wang/`；来源数字 ID 已映射为稳定角色 ID，提线木偶邻座约束先保留提醒，暴君/奥赫/涡流等高风险结果只生成待确认草稿 |
| 24 | 雾隐苍生 | 新仔辣椒酱 | 26 | 21529 | 已接入或对应 | 已建 `src/domain/scripts/packs/wu-yin-cang-sheng/`；来源数字 ID 已映射为稳定角色 ID，卡扎力 setup 路径和圣洁之魂传奇规则先保留提醒，麻脸巫婆/理发师/灵言师/入殓师等高风险结果只生成待确认草稿 |
| 25 | 子规泣鸣 | 泽渡哥摧毁停车场 | 25 | 21506 | 已接入或对应 | 已建 `src/domain/scripts/packs/zi-gui-qi-ming/`；来源数字 ID 已映射为稳定角色 ID，小怪宝/教父 setup 路径先保留提醒，阎罗/典狱长/鸩/蛊雕等延迟死亡或毒醉结果只生成待确认草稿 |
| 26 | 王不见王 | Ekin | 24 | 21493 | 已接入或对应 | 已建 `src/domain/scripts/packs/wang-bu-jian-wang/`；`al-hadikhia`、`plague_doctor`、`bounty_hunter` 已归一为稳定 ID，男爵/气球驾驶员/赏金猎人 setup 路径先保留提醒，哈迪寂亚/戏法师等胜负或多目标结果只生成待确认草稿 |
| 27 | 静候佳音 | Richard Black&花曲 | 26 | 21489 | 已接入或对应 | 已建 `src/domain/scripts/packs/jing-hou-jia-yin/`；修行者保留为自定义稳定 ID，戏法师/瘟疫医生/帽匠已归一；气球驾驶员/巡山人/军团/灯神特殊 setup 路径先保留提醒 |
| 28 | 莫逆之交 | 板 | 25 | 21481 | 已接入或对应 | 已建 `src/domain/scripts/packs/mo-ni-zhi-jiao/`；修行者/食人魔/瘟疫医生/鹰身女妖/奥赫已建稳定 ID，男爵/小怪宝/亡骨魔 setup 路径先保留提醒 |
| 29 | 枯木逢春 | Cody | 24 | 21365 | 已接入或对应 | 已建 `src/domain/scripts/packs/ku-mu-feng-chun/`；修行者/报丧女妖/鹰身女妖/卡扎力已归一，卡扎力/亡骨魔 setup 路径先保留提醒 |
| 30 | 沸反盈天 |  | 25 | 20783 | 已接入或对应 | 已建 `src/domain/scripts/packs/fei-fan-ying-tian/`；`fang_gu`/`devils_advocate`/`tea_lady`/`high_priestess` 已归一，赏金猎人/方古/教父/巡山人 setup 路径先保留提醒 |
| 31 | 白昼为市 | 寒水 | 25 | 21285 | 已接入或对应 | 已建 `src/domain/scripts/packs/bai-zhou-wei-shi/`；`fortune_teller`/`scarlet_woman` 与数字 ID 已归一为稳定 ID，刀客/秉笔/痴人/卡扎力/牙噶巴卜已建立稳定 ID；无神论者/卡扎力 setup 路径先保留提醒，灵言师/红唇女郎/蛊雕/混沌/牙噶巴卜等结果只做 AI/夜序提醒 |
| 32 | 九泉颂歌 | Cody | 25 | 21271 | 已接入或对应 | 已建 `src/domain/scripts/packs/jiu-quan-song-ge/`；来源数字 ID 已归一为 `simin`/`limao`/`yongjiang`/`bingbi`/`yanluo`/`jinweijun2`/`aohe`；教父/饥餮 setup 路径先保留提醒，阎罗/狸猫/理发师/蛊雕/珀/奥赫等结果只做 AI/夜序提醒 |
| 33 | 胡言乱语 | 刘中奇 | 26 | 21266 | 已接入或对应 | 已建 `src/domain/scripts/packs/hu-yan-luan-yu/`；村夫/方古/提线木偶 setup 路径先保留提醒，灯神仅作传奇提醒，罂粟种植者/洗脑师/赌徒/牙噶巴卜/诺-达鲺/典狱长等结果只做 AI/夜序提醒 |
| 34 | 移花接木 | 刘中奇 | 26 | 21265 | 已接入或对应 | 已建 `src/domain/scripts/packs/yi-hua-jie-mu/`；村夫/饕餮/提线木偶 setup 路径先保留提醒，灯神仅作传奇提醒；13-15 人模板显式采用教父 +1 外来者修正；掮客/半仙/使节/莽夫/蛊雕/鹰身女妖/普卡/典狱长/混沌等结果只做 AI/夜序提醒 |
| 35 | 满堂红 | Sui染钟楼 | 26 | 21264 | 已接入或对应 | 已建 `src/domain/scripts/packs/man-tang-hong/`；教父/小怪宝 setup 路径先保留提醒，偃师/入殓师/麻脸巫婆/赌徒/判官/奸佞等结果只做 AI/夜序提醒 |
| 36 | 寄梦他乡 | 鸭木布拉夫钟楼小镇 | 26 | 21263 | 已接入或对应 | 已建 `src/domain/scripts/packs/ji-meng-ta-xiang/`；村夫/赶尸人/卡扎力 setup 路径先保留提醒，逆臣/理发师/卡扎力/洗脑师/蛊雕/混沌等结果只做 AI/夜序提醒 |
| 37 | 懦夫救星 | Cody | 27 | 21232 | 已接入或对应 | 已建 `src/domain/scripts/packs/nuo-fu-jiu-xing/`；卡扎力 setup 路径先保留提醒，痢蛭/鹰身女妖/奥赫/牙噶巴卜/狐媚娘/哥布林等结果只做 AI/夜序提醒 |
| 38 | 全员谜语人 |  | 151 | 21218 | 特殊/暂不注册 | 151 角色，含大量镇民/外来者/爪牙/恶魔/旅行者/传奇；判断为角色池/特殊谜语集合，不按普通 7-15 智能板子注册 |
| 39 | 传奇之夜 | Sui | 25 | 20771 | 已接入或对应 | 已建 `src/domain/scripts/packs/chuan-qi-zhi-ye/`；赏金猎人/亡骨魔 setup 路径先保留提醒，麻脸巫婆/红唇女郎/普卡/诺-达鲺/珀等结果只做 AI/夜序提醒 |
| 40 | 盛世奇闻（测试中） |  | 27 | 20254 | 已接入或对应 | 已建 `src/domain/scripts/packs/sheng-shi-qi-wen/`；戏子/梼杌/食梦貘/酿酒师 setup 路径先保留提醒，典狱长/掮客/和尚/店小二/入殓师等结果只做 AI/夜序提醒 |
| 41 | 诡谲异象（测试中） |  | 27 | 20255 | 已接入或对应 | 已建 `src/domain/scripts/packs/gui-jue-yi-xiang/`；混沌/饕餮/酿酒师 setup 路径先保留提醒，逆臣/蛊雕/悟道者/典狱长/道士/锦衣卫等结果只做 AI/夜序提醒 |
| 42 | 身份危机 |  | 25 | 20285 | 已接入或对应 | 已建 `src/domain/scripts/packs/shen-fen-wei-ji/`；方古/小怪宝/赏金猎人/气球驾驶员 setup 路径先保留提醒，舞蛇人/痢蛭/麻脸巫婆/洗脑师/理发师/提线木偶等结果只做 AI/夜序提醒 |
| 43 | 说书人之怒 |  | 25 | 20287 | 已接入或对应 | 已建 `src/domain/scripts/packs/shuo-shu-ren-zhi-nu/`；军团/小怪宝/赏金猎人/无神论者特殊 setup 路径先保留提醒，涡流/僵怖/舞蛇人/哲学家/麻脸巫婆/洗脑师等结果只做 AI/夜序提醒 |
| 44 | 愚者欢宴 |  | 25 | 20438 | 已接入或对应 | 已建 `src/domain/scripts/packs/yu-zhe-huan-yan/`；亡骨魔/男爵/赏金猎人/气球驾驶员 setup 路径先保留提醒，街头风琴手/涡流/小恶魔/恐惧之灵/哥布林/理发师/异端分子/贞洁者/舞蛇人等结果只做 AI/夜序提醒 |
| 45 | 只手遮天 |  | 25 | 20514 | 已接入或对应 | Added `src/domain/scripts/packs/zhi-shou-zhe-tian/`; Godfather setup path stays manual; Vizier/Boomdandy/No Dashii/Al-Hadikhia/Lleech/Pukka/Damsel/Klutz/Moonchild/Farmer/Philosopher/Gambler/Innkeeper/Gossip/Sailor outcomes remain AI/night-order reminders only |
| 46 | 天堂花园 | Tyler Nafe | 24 | 20725 | 已接入或对应 | Added `src/domain/scripts/packs/tian-tang-hua-yuan/`; Choirboy/Drunk/Baron/Marionette setup or hidden-identity paths stay manual; Al-Hadikhia/Vizier/Witch/Barber/Goon/Gambler/Innkeeper/Philosopher/Pixie/Slayer/Klutz outcomes remain AI/night-order reminders only |
| 47 | 宝月初升 | Chiz | 25 | 20726 | 已接入或对应 | Added `src/domain/scripts/packs/bao-yue-chu-sheng/`; Balloonist/Choirboy/Drunk/Godfather/Lil' Monsta setup or hidden-identity paths stay manual; Pukka/Shabaloth/Po/Widow/Cerenovus/Goblin/Barber/Snake Charmer/Professor/Gambler/Mayor outcomes remain AI/night-order reminders only |
| 48 | 宝梦谜团 | Chiz | 33 | 20727 | 已接入或对应 | Added `src/domain/scripts/packs/bao-meng-mi-tuan/`; Travelers/Fabled stay as reminders and never enter templates/bluffs; Bounty Hunter/Drunk/Marionette/Lil' Monsta/Legion setup paths stay manual; Vortox/Evil Twin/Pit-Hag/Witch/Assassin/Farmer/Engineer/Alchemist outcomes remain AI/night-order reminders only |
| 49 | 火山教团 | Khinoe | 25 | 20729 | 已接入或对应 | Added `src/domain/scripts/packs/huo-shan-jiao-tuan/`; Balloonist/Choirboy/Drunk/Fang Gu/Legion setup, hidden-identity or special Demon paths stay manual; Snake Charmer/Vortox/Lleech/Cerenovus/Devil's Advocate/Poisoner/Goblin/Pacifist/Farmer/Cannibal outcomes remain AI/night-order reminders only |
| 50 | 九转千层 | Henrik | 30 | 20744 | 已接入或对应 | Added `src/domain/scripts/packs/jiu-zhuan-qian-ceng/`; Travelers stay as reminders and never enter templates/bluffs; Balloonist/Snitch/Drunk/Godfather/Vigormortis setup or hidden/special paths stay manual; Philosopher/Innkeeper/Gossip/Farmer/Mezepheles/Witch/Cerenovus/Assassin/Pukka/Imp outcomes remain AI/night-order reminders only |
| 51 | 偷天换日 | TPI | 25 | 20745 | 已接入或对应 | Added `src/domain/scripts/packs/tou-tian-huan-ri/`; Drunk/Lunatic/Goon/Fang Gu hidden, alignment or setup paths stay manual; Lycanthrope/Fortune Teller/Cerenovus/Poisoner/Scarlet Woman/Witch/Imp/Pukka outcomes remain AI/night-order reminders only |
| 52 | 全面肃清 | Soup | 27 | 20746 | 已接入或对应 | Added `src/domain/scripts/packs/quan-mian-su-qing/`; Fabled stay as reminders and never enter templates/bluffs; Balloonist/Drunk/Fang Gu/Lil' Monsta setup or hidden/special paths stay manual; Widow/Mezepheles/Cerenovus/Scarlet Woman/No Dashii/Barber/Klutz/Cannibal/Sage outcomes remain AI/night-order reminders only |
| 53 | 回旋迷阵 | Kyle J | 30 | 20747 | 已接入或对应 | Added `src/domain/scripts/packs/hui-xuan-mi-zhen/`; Travelers stay as reminders and never enter templates/bluffs; Drunk/Godfather/Lil' Monsta/Vigormortis/Legion setup or hidden/special paths stay manual; high-player Marionette templates require ST adjacency check; Widow/Cerenovus/Vortox/Philosopher/Farmer/Cannibal outcomes remain AI/night-order reminders only |
| 54 | 好事多磨 | TPI | 31 | 20749 | 已接入或对应 | Added `src/domain/scripts/packs/hao-shi-duo-mo/`; Travelers and Sentinel stay as reminders and never enter templates/bluffs; Drunk/Heretic/Fang Gu setup, reversal, hidden or jump paths stay manual; Snake Charmer/Cerenovus/Gambler/Poppy Grower/Lleech/Imp/Boomdandy outcomes remain AI/night-order reminders only |
| 55 | 银河漫步 | Ekin | 25 | 20761 | 已接入或对应 | Added `src/domain/scripts/packs/yin-he-man-bu/`; Godfather/Fang Gu/Vigormortis setup paths stay manual; Fortune Teller/Recluse/Puzzlemaster/Cannibal registration, drunk or ability-source paths stay manual; Pit-Hag/Barber/Imp/Fang Gu/Vigormortis identity, poisoning or death outcomes remain AI/night-order reminders only |
| 56 | 醉歌乱舞 | TPI | 25 | 20760 | 已接入或对应 | Added `src/domain/scripts/packs/zui-ge-luan-wu/`; Bounty Hunter/Huntsman/Drunk/Godfather/Vigormortis/Fang Gu setup or hidden paths stay manual; Philosopher/Cerenovus/Pit-Hag/No Dashii/Goon/Minstrel/Damsel identity, alignment, poison, drunk or madness outcomes remain AI/night-order reminders only |
| 57 | 觅影寻踪 | Narninian & Zaba | 24 | 20759 | 已接入或对应 | Added `src/domain/scripts/packs/mi-ying-xun-zong/`; Huntsman/Drunk/Godfather/Vigormortis setup or hidden paths stay manual; Mezepheles/Cerenovus/Pukka/Preacher/Goon/Virgin/Damsel alignment, poison, death, madness or identity outcomes remain AI/night-order reminders only |
| 58 | 蓝榭街区 | TPI | 31 | 20758 | 已接入或对应 | Added `src/domain/scripts/packs/lan-xie-jie-qu/`; Drunk/Godfather/Vigormortis hidden or setup-changing paths stay out of first normal templates; 13-15 player templates that use Marionette require ST adjacency check; Barber/Imp/Cannibal/Lunatic/Magician identity or viewpoint changes and Poisoner/No Dashii/Vigormortis poison/death outcomes remain ST-confirmed |
| 59 | 瞒天过海 | Lau | 25 | 20757 | 已接入或对应 | Added `src/domain/scripts/packs/man-tian-guo-hai/`; Balloonist/Huntsman/Drunk/Baron/Fang Gu setup or hidden-identity paths stay out of first normal templates; Marionette templates require ST adjacency check; Cerenovus/Pixie/Damsel/Klutz/Golem madness, death, identity, alignment or win/loss outcomes remain ST-confirmed |
| 60 | 生日宴会！ | TPI | 25 | 20756 | 已接入或对应 | Added `src/domain/scripts/packs/sheng-ri-yan-hui/`; Choirboy/Drunk/Godfather/Vigormortis/Fang Gu setup or hidden-identity paths stay out of first normal templates; Sailor/Innkeeper/Courtier/Sweetheart/Acrobat/Lleech poison, drunk or death effects remain ST-confirmed; Marionette/Cannibal/Imp/Fang Gu identity or alignment changes remain ST-confirmed |
| 61 | 欲盖弥彰 | Milk | 24 | 20755 | 已接入或对应 | Added `src/domain/scripts/packs/yu-gai-mi-zhang/`; Balloonist/Drunk/Fang Gu/Lil Monsta setup or hidden/special paths stay out of first normal templates; Evil Twin/Goblin/Fearmonger win/loss triggers and Widow/Sailor/Sweetheart/Lleech poison, drunk or death chains remain ST-confirmed |
| 62 | 横行霸道 | Manny | 25 | 20754 | 已接入或对应 | Added `src/domain/scripts/packs/heng-xing-ba-dao/`; Huntsman/Damsel, Heretic and Poppy Grower hidden/reversal/team-info paths stay out of first normal templates; Snake Charmer/Goon/Barber/Imp/Lleech identity, alignment, poison or death chains and Goblin/Fearmonger/Damsel/Heretic win-loss triggers remain ST-confirmed |
| 63 | 杳无音信 | OJ | 25 | 20753 | 已接入或对应 | Added `src/domain/scripts/packs/yao-wu-yin-xin/`; Godfather setup and Snitch evil-bluff path stay out of first normal templates; Pit-Hag/Scarlet Woman/Pukka/No Dashii/Lleech/Vortox identity, poison, death, false-info or win-loss pressure and Klutz/Moonchild/Gossip/Acrobat triggers remain ST-confirmed |
| 64 | 恶魔谜城 | Cosmo | 25 | 20752 | 已接入或对应 | Added `src/domain/scripts/packs/e-mo-mi-cheng/`; Huntsman/Damsel, Drunk, Godfather, Vigormortis and Choirboy paths stay out of first normal templates; Cerenovus/Pit-Hag/Scarlet Woman/Pukka/No Dashii/Lleech/Vortox poison, madness, identity, death or false-info chains remain ST-confirmed |
| 65 | 心理博弈 | Habby | 25 | 20751 | 已接入或对应 | Refreshed `src/domain/scripts/packs/xin-li-bo-yi/` to GStone row 65; Bounty Hunter/Godfather/Vigormortis/Leviathan paths stay out of first normal templates; Gambler/Lycanthrope/Goon/Pit-Hag/Po death, alignment, identity or multi-kill chains and Leviathan/Mayor/Gossip/Moonchild/Tinker/Acrobat triggers remain ST-confirmed |
| 66 | 尔虞我诈 | TPI | 26 | 20750 | 已接入或对应 | Added `src/domain/scripts/packs/er-yu-wo-zha/`; Drunk/Heretic/Fang Gu/Vigormortis/Djinn stay out of first normal templates; Snake Charmer/Philosopher/Goon/Pit-Hag/Imp/Fang Gu identity, alignment or ability changes and Cerenovus/Fearmonger/Saint/Heretic/Djinn high-risk outcomes remain ST-confirmed |
| 67 | 大权在握 | TPI | 25 | 20748 | 已接入或对应 | Added `src/domain/scripts/packs/da-quan-zai-wo/`; Bounty Hunter/Balloonist/Drunk/Lunatic/Godfather stay out of first normal templates; Snake Charmer/Pit-Hag/Puzzlemaster/Lunatic identity, drunk or false-Demon paths and Pukka/No Dashii/Shabaloth/Lleech poison, death, revive or host chains remain ST-confirmed |
| 68 | 上帝缺席 |  | 25 | 20284 | 已接入或对应 | Added `src/domain/scripts/packs/shang-di-que-xi/`; Drunk/Marionette/Vigormortis stay out of first normal templates; 13-15 player templates use explicit Godfather +1 Outsider adjustment; Imp/Scarlet Woman/Vigormortis succession, poison, drunk, death, registration and win/loss effects remain ST-confirmed |
| 69 | 死罪忏悔日 | Ben | 21 | 20001 | 已接入或对应 | Added `src/domain/scripts/packs/si-zui-chan-hui-ri/`; compact 21-role source accepted by playable lower-bound quality gate; all templates carry Lil Monsta +1 Minion adjustment; 13-15 player templates also carry Baron +2 Outsiders; Bounty Hunter/Cult Leader/Politician/Saint/Barber/Witch/Assassin/Lil Monsta effects remain ST-confirmed |
| 70 | 险象环生 | Zets | 21 | 20004 | 已接入或对应 | Added `src/domain/scripts/packs/xian-xiang-huan-sheng/`; Riot templates explicitly allow repeated `riot` seats via `repeatableRoles` and convert Minion slots with Riot setup correction; Marionette/Sentinel stay out of first normal templates; Riot nomination/death/win timing, Balloonist information, Choirboy/King trigger, and Puzzlemaster drunk paths remain ST-confirmed |
| 71 | 过界信仰 | Zets | 22 | 20006 | 已接入或对应 | Added `src/domain/scripts/packs/guo-jie-xin-yang/`; Balloonist and Baron setup effects use explicit composition adjustments; Atheist/Marionette stay out of first normal templates; Leviathan execution/day-five win pressure, Snake Charmer swap, Cult Leader alignment, Widow poison, Drunk/Lunatic hidden identity and Mutant madness remain ST-confirmed |
| 72 | 罂粟花开 | Dan | 25 | 20005 | 已接入或对应 | Added `src/domain/scripts/packs/ying-su-hua-kai/`; Baron setup uses explicit +2 Outsiders adjustment; Legion/Marionette/Drunk/Bounty Hunter stay out of first normal templates; Poppy Grower evil-info timing, Evil Twin/Vortox/Mayor win-loss, Cerenovus/Mutant madness, Vigormortis poison/death and Imp succession remain ST-confirmed |
| 73 | 宿脑谜团 | OJ | 12 | 20007 | 需人工分类 | 先判断是小板、角色池还是特殊玩法 |
| 74 | 要赢了吗？ | 我相 | 12 | 20009 | 需人工分类 | 先判断是小板、角色池还是特殊玩法 |
| 75 | 瓦釜雷鸣 | Emliy | 30 | 20002 | 已接入或对应 | 复核现有 pack |
| 76 | 夜半狂欢 | Zets | 25 | 20003 | 已接入或对应 | Added `src/domain/scripts/packs/ye-ban-kuang-huan/`; Balloonist and Vigormortis setup effects use explicit adjustments; Atheist/Huntsman/Drunk/Sentinel/Spirit of Ivory stay out of first normal templates; Professor revival, Engineer/Pit-Hag character changes, Snake Charmer swap, Farmer change, Poppy Grower evil-info timing, Damsel loss, Mezepheles alignment, Psychopath death and Al-Hadikhia death choices remain ST-confirmed |
| 77 | 暗度陈仓 | 小猴子1 | 24 | 20705 | 已接入或对应 | Added `src/domain/scripts/packs/an-du-chen-cang/`; Fang Gu, Balloonist and Baron setup effects use explicit adjustments; Drunk/Godfather stay out of first normal templates; Scarlet Woman succession, Fang Gu jump, Klutz loss, Sweetheart drunk, Mutant madness, Snake Charmer swap, Psychopath death, Tinker death and Exorcist demon block remain ST-confirmed |

## 原创角色剧本 (47)

| 序号 | 名称 | 作者 | 角色数 | 来源 ID | 状态 | 下一步 |
|---:|---|---|---:|---:|---|---|
| 1 | 无人生还 | Aero | 30 | 21222 | 已接入或对应 | Added `src/domain/scripts/packs/wu-ren-sheng-huan/`; Zu Zhang, You Ling and Ye Yan setup effects use explicit adjustments; Travelers and Jing Du variable setup path stay out of first normal templates; madness, death, execution, win/loss, alignment, identity, registration and secret-count effects remain ST-confirmed |
| 2 | 六宫粉黛 | 驯鹿 | 28 | 20950 | 已接入或对应 | Added `src/domain/scripts/packs/liu-gong-fen-dai/`; Legion, Chang An Hong Cha, Traveler and Fabled roles stay out of first normal templates; death, execution, win/loss, alignment, identity, poison/drunk, grimoire-view and madness-like effects remain ST-confirmed |
| 3 | 精绝古国（神话） | Lei的剧本钟楼 | 26 | 20973 | 已接入或对应 | Added `src/domain/scripts/packs/jing-jue-gu-guo-shen-hua/`; setup count changes are explicit reminders; Feng/Marionette/Evil Twin/Rebel Minister high-risk outcomes stay ST-confirmed |
| 4 | 信任试炼 | Lei的剧本钟楼 | 27 | 21005 | 已接入或对应 | Added `src/domain/scripts/packs/xin-ren-shi-lian/`; Mystic Scholar/Balloonist/Baron/Drunk/Plague Doctor/custom jinx paths stay explicit reminders; Pit-Hag/Shabaloth/Friend Game outcomes stay ST-confirmed |
| 5 | 酬神纳吉 | 痴愚 | 29 | 21007 | 已接入或对应 | Added `src/domain/scripts/packs/chou-shen-na-ji/`; Nuo Opera Troupe no-Minion setup uses explicit composition adjustments; Demon bluff policy allows out-of-play Townsfolk or Outsiders for high-player counts; Pit-Hag/Cerenovus/Harpy/He Bo/Shadow Play death, madness, identity and team effects remain ST-confirmed |
| 6 | 灯下绘影 | 痴愚 | 30 | 21050 | 已接入或对应 | Added `src/domain/scripts/packs/deng-xia-hui-ying/`; first normal templates use Corpse Buddha path with standard composition; Ghost/Shadow Play Proprietor/Remnant/Puppeteer special setup paths stay manual reminders; Cerenovus/Lamp Granny/Gu Keeper/Snake Charmer/Shadow Play death, madness, team and identity effects remain ST-confirmed |
| 7 | 梨园残梦 | 痴愚＆鸭镇、lei | 31 | 21095 | 已接入或对应 | Added `src/domain/scripts/packs/li-yuan-can-meng/`; custom play/partner/lead-villain/Sheng-Dan-Jing-Chou rules stay as storyteller-confirmed reminders; 7-15 templates use standard count candidates; fabled play cards stay out of normal seats and bluffs; death, poison/drunk, identity, team and win/loss effects remain ST-confirmed |
| 8 | 血色风华 | 苏通染 | 26 | 21099 | 已接入或对应 | Added `src/domain/scripts/packs/xue-se-feng-hua/`; 染血、往生之路、看守者的钥匙保留全局提醒；看守者 `+1恶魔，-1爪牙` 暂不进首批普通模板；死亡、处决、身份/能力、阵营和胜负结果 remain ST-confirmed |
| 9 | 试胆大会 | Lei的剧本钟楼 | 12 | 21100 | 特殊/小板暂缓 | 12 角色且无常规恶魔；依赖传奇「凶宅」生成恶魔，见 `SPECIAL_CLASSIFICATION_NOTES.md` |
| 10 | 礼崩乐坏 | 摸鱼学徒 | 29 | 21219 | 已接入或对应 | Added `src/domain/scripts/packs/li-beng-le-huai/`; 教父人数修正、圣洁之魂/私货商人/灯神传奇规则先保留提醒；灵言师、鹰身女妖、主谋、焦尾、典狱长、珀等高风险结果 remain ST-confirmed |
| 11 | 信念解离 + | Cake & David L | 28 | 21220 | 已接入或对应 | Added `src/domain/scripts/packs/xin-nian-jie-li-plus/`; 认知错位/精神扭曲/嗜血传奇规则先保留提醒；煤气灯人、代行邪魔、幕后黑手、二重身和各恶魔高风险结果 remain ST-confirmed |
| 12 | 谍影重重 | emptyset | 30 | 21221 | 已接入或对应 | Added `src/domain/scripts/packs/die-ying-chong-chong/`; 经纪人四伪装规则先按工具 3 伪装展示并保留提醒；擦鞋匠、毒蛇、三威之力 setup 路径和延迟/替代死亡、身份、阵营、胜负结果 remain ST-confirmed |
| 13 | 笼中金雀 | Luis S | 25 | 20947 | 已接入或对应 | Added `src/domain/scripts/packs/long-zhong-jin-que/`; Coal Miner/Drunk/Baron/Marionette/Legion/Lil Monsta setup or hidden/special paths stay reminders; No Dashii/Snake Charmer/Barber/Fearmonger/Goblin/Witch outcomes remain ST-confirmed |
| 14 | 命定灾祸 | Stitchface & Bra1n | 27 | 21223 | 已接入或对应 | Added `src/domain/scripts/packs/ming-ding-zai-huo/`; fate pointer, wound and blessing statuses stay reminders; Chieftain/Tragedian setup paths stay out of first normal templates; death/poison/alignment/vote/win-loss outcomes remain ST-confirmed |
| 15 | 古道酒温 | 陌上叶 | 30 | 21225 | 已接入或对应 | Added `src/domain/scripts/packs/gu-dao-jiu-wen/`; Travelers stay outside normal templates; Bamboo Childhood/Joy Dream/Qian Dao/Solo Fisherman/Spring-Autumn Brush setup paths stay reminders; death/poison/identity/alignment/nomination/win-loss outcomes remain ST-confirmed |
| 16 | 交换人生 | 靶子 | 27 | 21227 | 已接入或对应 | Added `src/domain/scripts/packs/jiao-huan-ren-sheng/`; Villager/Drunk/Vigormortis/Fang Gu setup paths stay reminders; death/poison/identity/alignment/madness/redirection/win-loss outcomes remain ST-confirmed |
| 17 | 圣诞夜惊魂 | Lei的剧本钟楼 | 26 | 21229 | 已接入或对应 | Added `src/domain/scripts/packs/sheng-dan-ye-jing-hun/`; Fabled stays outside normal templates; Balloonist/Mystic/Drunk/Mr. Hostage/Kazali setup paths stay reminders; death/poison/identity/alignment/madness/redirection/win-loss outcomes remain ST-confirmed |
| 18 | 颓败残局 | Subdog&Sionar | 30 | 21233 | 已接入或对应 | Added `src/domain/scripts/packs/tui-bai-can-ju/`; Travelers/Fabled stay outside templates/bluffs; False King/Usurper/Nightmare Demon/Morgana/Fabled setup paths stay reminders; death/poison/identity/alignment/vote/registration/win-loss outcomes remain ST-confirmed |
| 19 | 魃罗之夜 | Zets | 27 | 21234 | 已接入或对应 | Added `src/domain/scripts/packs/ba-luo-zhi-ye/`; Fabled stays outside templates/bluffs; Huntsman/Choirboy/Drunk/Damsel/Marionette/Baron setup paths stay reminders; death/poison/identity/alignment/madness/registration/vote/win-loss outcomes remain ST-confirmed |
| 20 | 暮色村庄 | 调和师 | 30 | 21247 | 已接入或对应 | Added `src/domain/scripts/packs/mu-se-cun-zhuang/`; Travelers/Fabled stay outside templates/bluffs; Ferryman/Addict/Freak Show Heroine/Stranger/Red Moon Pope/Plague Source setup paths stay reminders; death/poison/plague/identity/alignment/seat/vote/win-loss outcomes remain ST-confirmed |
| 21 | 华府雷鸣 | 寒水 | 33 | 21450 | 已接入或对应 | Added `src/domain/scripts/packs/hua-fu-lei-ming/`; Travelers/Fabled stay outside templates/bluffs; Drunk/Godfather/Marionette/Fang Gu/Vigormortis setup paths stay reminders; death/poison/drunk/identity/alignment/redirection/vote/win-loss outcomes remain ST-confirmed |
| 22 | 小二，上酒！ | 刘中奇 | 30 | 21589 | 已接入或对应 | Added `src/domain/scripts/packs/xiao-er-shang-jiu/`; Travelers stay outside templates/bluffs; Shaolin/Tangmen/Zhongyuan Miaojia/Qitu/Riyue Shenjiao/Tianlongjiao setup or hidden paths stay reminders; death/poison/drunk/identity/alignment/redirection/vote/win-loss outcomes remain ST-confirmed |
| 23 | 古老魔法 | Stellarium | 25 | 21652 | 已接入或对应 | Added `src/domain/scripts/packs/gu-lao-mo-fa/`; Diwang/Fengdi Shou setup paths stay reminders; upgrade/death/poison/drunk/identity/alignment/redirection/vote/win-loss outcomes remain ST-confirmed |
| 24 | 童言无忌 | Aaron | 26 | 20946 | 已接入或对应 | Added `src/domain/scripts/packs/tong-yan-wu-ji/`; Fabled stays outside templates/bluffs; Drunk/Yaoseng/Fang Gu/Taotie/Qiongqi setup paths stay reminders; death/poison/drunk/madness/identity/alignment/vote/day-end/win-loss outcomes remain ST-confirmed |
| 25 | 一夜鱼龙舞 | 驯鹿&痴愚 | 27 | 20707 | 已接入或对应 | Added `src/domain/scripts/packs/yi-ye-yu-long-wu/`; Dragon Head/Tail/Body, Zhu Yan, Gui Mei Ren, Chang An Hong Cha, Yuan and Feng setup/death/identity/alignment paths stay ST-confirmed; no automatic skill execution |
| 26 | 黄粱一梦（老华灯） | dd | 26 | 20709 | 已接入或对应 | Added `src/domain/scripts/packs/huang-liang-yi-meng-lao-hua-deng/`; Drunk/Wu Dao Zhe/Niang Jiu Shi/Fang Gu/Ru Meng Ren and Marionette hidden/setup paths stay manual; death/poison/drunk/identity/alignment/madness/win-loss outcomes remain ST-confirmed |
| 27 | 窦氏奇冤（老华灯） | 周六有染小队 | 32 | 20721 | 已接入或对应 | Added `src/domain/scripts/packs/dou-shi-qi-yuan-lao-hua-deng/`; Travelers/Fabled stay reminders only; Choirboy/Balloonist/Gan Shi Ren/Fang Gu/Taowu setup paths stay manual; death/poison/drunk/identity/alignment/madness/win-loss outcomes remain ST-confirmed |
| 28 | 一出好戏（老华灯） | 刘中奇 | 28 | 20722 | 已接入或对应 | Added `src/domain/scripts/packs/yi-chu-hao-xi-lao-hua-deng/`; Atheist/Xi Zi/Drunk/Balloonist/Marionette/Legion/Hun Dun setup paths stay manual; death/poison/drunk/identity/alignment/madness/win-loss outcomes remain ST-confirmed |
| 29 | 初出茅庐（老华灯） | 刘中奇 | 27 | 20723 | 已接入或对应 | Added `src/domain/scripts/packs/chu-chu-mao-lu-lao-hua-deng/`; Drunk/Godfather/Taowu setup paths and Fabled reminders stay manual; death/poison/drunk/identity/alignment/madness/win-loss outcomes remain ST-confirmed |
| 30 | 歌剧魅影-新 | 泽度哥摧毁停车场 | 31 | 20724 | 已接入或对应 | Added `src/domain/scripts/packs/ge-ju-mei-ying-xin/`; mask scenes, marks, death/exile, poison, alignment registration and win/loss outcomes remain ST-confirmed; hidden/setup modifier roles stay out of first normal templates |
| 31 | 追钗奇缘（老华灯） | 鸭镇 | 30 | 20730 | 已接入或对应 | Added `src/domain/scripts/packs/zhui-chai-qi-yuan-lao-hua-deng/`; drunk/poison, treated-as registration, death, ability gain and setup paths remain ST-confirmed; setup modifier roles stay out of first normal templates |
| 32 | 诡异童话-新 | AstralZucchinii;翻译:鸭镇 | 31 | 20734 | 已接入或对应 | Added `src/domain/scripts/packs/gui-yi-tong-hua-xin/`; setup/decree, bad-thing, curse, madness/task, death, registration and ability-copy outcomes remain ST-confirmed; setup/decree roles stay out of first normal templates |
| 33 | 扭转乾坤 | 面哥&苏通染&馈馈 | 34 | 20768 | 已接入或对应 | Added `src/domain/scripts/packs/niu-zhuan-qian-kun/`; duplicate Townsfolk, setup count corrections, Atheist, Pit-Hag, Vigormortis and resurrection/death paths remain ST-confirmed; Atheist/Balloonist are bluff-only where needed, not in first normal templates |
| 34 | 改头换面 | 苏通染 | 25 | 20769 | 已接入或对应 | Added `src/domain/scripts/packs/gai-tou-huan-mian/`; Ear/Eyes misinformation, Qianmianren/Shuangtoujiao transformations, Atheist, Pit-Hag, Baron, Fang Gu, Vigormortis and death/revival/identity/alignment paths remain ST-confirmed; setup modifiers are explicit where used |
| 35 | 唯你独尊 | 苏通染 | 26 | 20770 | 已接入或对应 | Added `src/domain/scripts/packs/wei-ni-du-zun/`; Mirror Demon duplicate setup, Atheist, Pixie/Cerenovus madness, Cailianjun alignment/death question, Ganshiren treated-alive path and death/poison/identity outcomes remain ST-confirmed |
| 36 | 柳暗花明（老华灯） | 爱4宝宝 | 25 | 20772 | 已接入或对应 | Added `src/domain/scripts/packs/liu-an-hua-ming-lao-hua-deng/`; Vortox false information, Pukka poison/death chain, Vigormortis/Godfather setup modifiers, Imp/Scarlet Woman demon transfer, Klutz loss and Widow/Gudiao poison paths remain ST-confirmed |
| 37 | 雾海同行 | 鸭镇 | 38 | 20774 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 38 | 精挑细选（老华灯） | 刘中奇 | 29 | 20775 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 39 | 罗马陨落 | Alex S;翻译:鸭镇 | 32 | 20826 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 40 | 惊天大案 | SUI染钟楼 | 37 | 20827 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 41 | 桃之夭夭（老华灯） | 驯鹿 | 25 | 20944 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 42 | 积尸瘟疫（老华灯） | Jamhot | 28 | 20945 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 43 | 诡镇疑云 | 木木木 | 32 | 20042 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 44 | 德古拉宫殿 | Nichael | 25 | 20041 | 待导入 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |
| 47 | 三教九流 | 痴愚 | 34 | 20096 | 已接入或对应 | 来源锁定 -> 角色复核 -> 模板 -> 注册 |


