# 暴揍哥布林 待集成验收草稿

作者：太一。本板是社区剧本，不是官方发行剧本。

来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，索引602，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；目录 `民间创意剧本\不含华灯\不含私货\201-400期\#暴揍哥布林-太一.json`。版本锁定 `来源未标版本`，未标版本不猜最新版本。实际JSON在静态 `scripts-full.js` 内，未执行来源JS。`source.json` 保留原始文本UTF-8字节：22671 bytes，SHA256 `ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f`。

当前126板去除传奇后的完整角色ID集合逐一比较，无重复。本包复用已确认对象，缺共享池对象显式从既有包选择，不复制旧技能覆盖共享池。逐角色原始ID、原能力、阵营、官方事实及复用能力见 `source-lock.json`。

版本适配：

- balloonist:旧四类型一轮/固定+1→当前与上一晚不同/+0或+1
- investigator:删除来源额外无爪牙分支
- djinn:复用通用角色，相克另列

角色：`djinn, investigator, clockmaker, balloonist, gambler, towncrier, seamstress, juggler, alsaahir, philosopher, tealady, fool, banshee, gossip, golem, recluse, ogre, drunk, goblin, witch, devilsadvocate, widow, cerenovus, fanggu, yaggababble, vortox`。

首夜：`philosopher, yaggababble, widow, devilsadvocate, witch, cerenovus, investigator, clockmaker, seamstress, balloonist, ogre`。

后续夜：`philosopher, gambler, devilsadvocate, witch, cerenovus, fanggu, vortox, yaggababble, gossip, banshee, towncrier, seamstress, juggler, balloonist`。

夜序来自当前官方夜表过滤，不使用原JSON旧顺位；既有局不迁移。

规则、相克与边界：

- 社区剧本来源和原文hash已锁定；当前官方能力/夜表适配仅用于新局。三枚不在场善良角色伪装，传奇不进座位和伪装；旧局快照不迁移。
- 气球驾驶员采用当前官方规则：只要求今晚告知玩家的角色类型不同于上一晚，可重复更早的类型；可 +0 或 +1 外来者，明确替换镇民。来源旧版“四类型一轮、固定+1”不适用于本包新局。
- 方古 +1 外来者；第一次由此能力杀死的外来者变成邪恶方古，原方古死亡；每局只成功转化一次。
- 调查员首夜得知两名玩家和一个爪牙角色，其中一名玩家是该爪牙。原 JSON 额外“无爪牙”中文扩写不作为授权；只有图书管理员有无外来者信息分支。
- 洗脑师可以指定玩家疯狂证明自己是哥布林；本条公开相克允许这个特殊邪恶角色。疯狂后果、哥布林声明与处决胜利分别由说书人确认。
- 若陌客对食人魔登记为邪恶，食人魔会得知自己为邪恶；普通食人魔转换仍不告知阵营。不能把此相克遗漏为永远不知道阵营。
- 涡流杀死报丧女妖时，所有玩家得知报丧女妖死亡；不能因涡流要求镇民假信息而隐去这个公开事实。女妖提名与投票资格仍核对触发时及之后的毒醉。
- 魔像提名造成的死亡不是处决；哥布林需要当日声明并被处决，魔鬼代言人保护可使处决不死亡。涡流要求白天发生处决，不要求处决一定导致死亡。
- 牙噶巴卜首夜只获秘密短语；公开说出短语只提供之后可能死亡的机会，可在白天或夜晚处理，由说书人记录次数和时机，不能强制当晚必杀或自动造死。

22套模板覆盖7–15人：3/2/2/3/2/3/2/2/3套；每项人数修正带choiceId。本包是“原库版本 → 2026-10-16官方规则适配版”，不是原版规则完全复刻。草稿本身不注册、不部署、不调用真实模型。本批行为测试位于父目录 `batch-b.regression.ts`，复制目标为 `src/services/ai/wikiBatch02B.test.ts`。

隔离草稿定向测试23/23通过：精确来源字节、当前夜表、88套规则校验、全部人数/常规与混合经验的生产候选可见、830实际后续夜0/1/2/3目标与健康/毒醉AI请求合同。两次测试夹具首失败已保留；全量检查、浏览器/真实AI/部署由root统一集成后记录实际结果。

真实AI待抽测题：**哥布林被处决但被代言人保命**。题目、完整前提和规则依据见 `ai-regression-oracle.json`；本子任务没有调用真实AI。
