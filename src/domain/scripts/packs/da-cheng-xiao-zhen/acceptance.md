# 大诚小镇 / v2 待集成验收草稿

作者：Milk。本板是社区剧本，不是官方发行剧本。

来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，索引907，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；目录 `角色主题竞赛剧本\#大诚小镇-Milk.json`。版本锁定 `v2`，未标版本不猜最新版本。实际JSON在静态 `scripts-full.js` 内，未执行来源JS。`source.json` 保留原始文本UTF-8字节：17737 bytes，SHA256 `caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3`。

当前126板去除传奇后的完整角色ID集合逐一比较，无重复。本包复用已确认对象，缺共享池对象显式从既有包选择，不复制旧技能覆盖共享池。逐角色原始ID、原能力、阵营、官方事实及复用能力见 `source-lock.json`。

版本适配：

- 稳定原始ID按明确能力/阵营逐项对应官方；镇长夜死措辞与当前官方语义一致，不虚构版本改动

角色：`noble, librarian, pixie, general, fortuneteller, monk, oracle, seamstress, philosopher, magician, ravenkeeper, cannibal, mayor, drunk, recluse, lunatic, politician, godfather, cerenovus, mezepheles, marionette, imp, vigormortis`。

首夜：`philosopher, magician, lunatic, marionette, godfather, cerenovus, mezepheles, pixie, librarian, fortuneteller, seamstress, noble, general`。

后续夜：`philosopher, monk, cerenovus, mezepheles, lunatic, imp, vigormortis, godfather, ravenkeeper, fortuneteller, oracle, seamstress, general`。

夜序来自当前官方夜表过滤，不使用原JSON旧顺位；既有局不迁移。

规则、相克与边界：

- 社区剧本来源和原文hash已锁定；当前官方能力/夜表适配仅用于新局。三枚不在场善良角色伪装，传奇不进座位和伪装；旧局快照不迁移。
- 教父必须选择 -1 或 +1 外来者；本批显式记录其人数修正。当天外来者死亡才有当晚额外死亡目标，首夜只告知在场外来者角色。
- 亡骨魔最多移除一名外来者，确实移除后才增加镇民；零外来者时不增加镇民。本批7人第3模板覆盖5镇民0外来者1爪牙1恶魔的零O亡骨魔边界，显式选择移除但按实际可移除数核算；10/13人只用小恶魔，其余亡骨魔与教父修正一起核对。被亡骨魔杀死的爪牙保留能力并毒邻近镇民，身份和毒源须分开。
- 提线木偶邻座恶魔，使用不在场善良角色假身份；其真实类型仍是爪牙。候选生成和首次确认均检查邻座，既有局不自动重新排座。
- 魔术师存活时，恶魔不会知道哪位邻座是提线木偶；不要把普通木偶告知信息直接泄露。
- 灵言师首夜获得暗号，首个说出暗号的善良玩家在当晚转邪恶；先确认第一个符合者，不能立即变阵营或反复转化。
- 本板没有红唇女郎。小恶魔用能力自杀成功时一名爪牙变成小恶魔；不能在原恶魔死亡后立刻判善良胜，传位身份追加确认。
- 食人族只取得最近死于处决者的能力，不因其他死亡替换；若该玩家邪恶则中毒。政客是否负最大责任及结局转阵营由主持判定。

22套模板覆盖7–15人：3/2/2/3/2/3/2/2/3套；每项人数修正带choiceId。本包是“原库版本 → 2026-10-16官方规则适配版”，不是原版规则完全复刻。草稿本身不注册、不部署、不调用真实模型。本批行为测试位于父目录 `batch-b.regression.ts`，复制目标为 `src/services/ai/wikiBatch02B.test.ts`。

隔离草稿定向测试23/23通过：精确来源字节、当前夜表、88套规则校验、全部人数/常规与混合经验的生产候选可见、830实际后续夜0/1/2/3目标与健康/毒醉AI请求合同。两次测试夹具首失败已保留；全量检查、浏览器/真实AI/部署由root统一集成后记录实际结果。

真实AI待抽测题：**七人零外来者亡骨魔不凭空加镇民**。题目、完整前提和规则依据见 `ai-regression-oracle.json`；本子任务没有调用真实AI。

后续新增7人第3套零O亡骨魔边界，由根任务同步显式修正模板及共享有界计数；新增断言待联测，不把此前23项通过当成新增边界已通过。
