# 龙争虎斗 / 2.0 待集成验收草稿

作者：追命丶。本板是社区剧本，不是官方发行剧本。

来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，索引627，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；目录 `民间创意剧本\不含华灯\包含私货\1-200期\#龙争虎斗-追命丶.json`。版本锁定 `2.0`，未标版本不猜最新版本。实际JSON在静态 `scripts-full.js` 内，未执行来源JS。`source.json` 保留原始文本UTF-8字节：18429 bytes，SHA256 `5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17`。

当前126板去除传奇后的完整角色ID集合逐一比较，无重复。本包复用已确认对象，缺共享池对象显式从既有包选择，不复制旧技能覆盖共享池。逐角色原始ID、原能力、阵营、官方事实及复用能力见 `source-lock.json`。

版本适配：

- balloonist:旧四类型一轮/固定+1→当前与上一晚不同/+0或+1
- fisherman:来源“说书⼈”异体字不构成规则变更
- djinn:复用通用角色，相克另列

角色：`librarian, balloonist, chambermaid, monk, ravenkeeper, philosopher, huntsman, tealady, courtier, slayer, sailor, undertaker, fisherman, damsel, drunk, recluse, moonchild, klutz, godfather, devilsadvocate, poisoner, pithag, pukka, po, fanggu, djinn`。

首夜：`philosopher, sailor, poisoner, courtier, godfather, devilsadvocate, pukka, huntsman, damsel, librarian, balloonist, chambermaid`。

后续夜：`philosopher, sailor, poisoner, courtier, monk, devilsadvocate, pithag, pukka, po, fanggu, godfather, huntsman, damsel, moonchild, ravenkeeper, undertaker, balloonist, chambermaid`。

夜序来自当前官方夜表过滤，不使用原JSON旧顺位；既有局不迁移。

规则、相克与边界：

- 社区剧本来源和原文hash已锁定；当前官方能力/夜表适配仅用于新局。三枚不在场善良角色伪装，传奇不进座位和伪装；旧局快照不迁移。
- 气球驾驶员使用当前官方“与上一晚不同角色类型、+0或+1外来者”；原版连续四类型一轮和固定+1已过时。本板模板明确保留0或添加1。
- 方古 +1 外来者，替换一名镇民；首次成功转化外来者时新方古为邪恶，原方古死亡，不重复触发。
- 教父设置必须 -1 或 +1 外来者，不能默认为0；当天外来者死亡才触发当晚选择死亡目标，首夜先获外来者角色信息。
- 巡山人在场时必须有落难少女；若基础分布已含落难少女，不额外加第二名。本批模板明确选择“已在分布内”0修正，或新增一名落难少女并替换镇民。
- 麻脸巫婆创造落难少女时，由说书人决定哪名玩家成为落难少女，不能让麻脸巫婆据此知道身份。
- 珀可不选择来蓄力，之后一次选择三人；普卡选择新目标中毒并处理上一名中毒者死亡和恢复健康。毒醉、保护和触发顺序需逐项确认，不自动算死。
- 侍臣使选中角色之一醉酒三天三夜；水手只在自身清醒健康时免死。茶艺师检查邻近的两名存活玩家阵营；醉酒来源及持续时间分别记录。
- 所有爪牙全局共一次公开猜落难少女机会；任一爪牙猜错即用掉，不是每名爪牙各一次。巡山人可救中醉毒的落难少女。

22套模板覆盖7–15人：3/2/2/3/2/3/2/2/3套；每项人数修正带choiceId。本包是“原库版本 → 2026-10-16官方规则适配版”，不是原版规则完全复刻。草稿本身不注册、不部署、不调用真实模型。本批行为测试位于父目录 `batch-b.regression.ts`，复制目标为 `src/services/ai/wikiBatch02B.test.ts`。

隔离草稿定向测试23/23通过：精确来源字节、当前夜表、88套规则校验、全部人数/常规与混合经验的生产候选可见、830实际后续夜0/1/2/3目标与健康/毒醉AI请求合同。两次测试夹具首失败已保留；全量检查、浏览器/真实AI/部署由root统一集成后记录实际结果。

真实AI待抽测题：**侍臣使普卡醉酒，新旧毒链暂停**。题目、完整前提和规则依据见 `ai-regression-oracle.json`；本子任务没有调用真实AI。
