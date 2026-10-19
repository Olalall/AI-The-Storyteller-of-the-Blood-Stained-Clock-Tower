# 爬行都市 待集成验收草稿

作者：Aero。本板是社区剧本，不是官方发行剧本。

来源：[剧本库](https://kkovo550.github.io/clocktower-wiki/script_lib/%E5%89%A7%E6%9C%AC%E5%BA%93.html)，索引830，build `16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e`；目录 `海外社区推荐剧本\#爬行都市-Aero.json`。版本锁定 `来源未标版本`，未标版本不猜最新版本。实际JSON在静态 `scripts-full.js` 内，未执行来源JS。`source.json` 保留原始文本UTF-8字节：20244 bytes，SHA256 `73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac`。

当前126板去除传奇后的完整角色ID集合逐一比较，无重复。本包复用已确认对象，缺共享池对象显式从既有包选择，不复制旧技能覆盖共享池。逐角色原始ID、原能力、阵营、官方事实及复用能力见 `source-lock.json`。

版本适配：

- alhadikhia:来源“要选择”→当前“可以选择”；0目标不发动无需播报
- alhadikhia:以实际存活而非口头选项核对三人全活

角色：`chef, librarian, washerwoman, sailor, chambermaid, snakecharmer, general, flowergirl, innkeeper, undertaker, philosopher, fool, tealady, virgin, drunk, barber, sweetheart, saint, klutz, poisoner, spy, baron, devilsadvocate, psychopath, alhadikhia`。

首夜：`philosopher, sailor, poisoner, snakecharmer, devilsadvocate, washerwoman, librarian, chef, spy, general, chambermaid`。

后续夜：`philosopher, sailor, poisoner, innkeeper, snakecharmer, devilsadvocate, alhadikhia, barber, sweetheart, undertaker, flowergirl, spy, general, chambermaid`。

夜序来自当前官方夜表过滤，不使用原JSON旧顺位；既有局不迁移。

规则、相克与边界：

- 社区剧本来源和原文hash已锁定；当前官方能力/夜表适配仅用于新局。三枚不在场善良角色伪装，传奇不进座位和伪装；旧局快照不迁移。
- 男爵 +2 外来者并替换两名镇民；每个含男爵的模板都明确选择这项修正。
- 哈迪寂亚按当前官方可以不选择；不选择时不播报且无人因本能力死亡。原 JSON“要选择三人”不用于强迫发动。若选择，保留三人先后顺序并依次秘密收集生死决定。
- 哈迪寂亚判断三名目标在各自选择结算后是否都存活；不是只看三个口头选择。选择死亡但因保护存活也算存活；原本死亡者选活可复活。全部存活才再次处理三人死亡，仍核对保护。
- 哈迪寂亚醉酒或中毒时能力不生效，不因其虚假选择执行死亡、复活或向全场播报；健康状态先由主持核实。AI只给依据和草稿，不能强制发动。
- 旅店老板选两人，两人当晚免死，其中一人醉酒直到下个黄昏。保护与对他人的致醉依赖旅店当前能力：旅店死亡或换角立即结束，外来醉毒时暂时失效；自己因本能力醉酒则保持自醉到黄昏。其他独立来源分别核对，先前已被有效保护挡下的攻击不追溯重算。
- 舞蛇人选中恶魔才交换角色和阵营，原恶魔成为中毒舞蛇人。理发师死后恶魔可选两名非其他恶魔玩家交换角色；身份、阵营和死亡分开确认。
- 贞洁者触发立即处决，不等于提名目标死亡；精神病患者被处决后按猜拳决定是否死亡，圣徒只在死于处决时导致阵营落败。

22套模板覆盖7–15人：3/2/2/3/2/3/2/2/3套；每项人数修正带choiceId。本包是“原库版本 → 2026-10-16官方规则适配版”，不是原版规则完全复刻。草稿本身不注册、不部署、不调用真实模型。本批行为测试位于父目录 `batch-b.regression.ts`，复制目标为 `src/services/ai/wikiBatch02B.test.ts`。

隔离草稿定向测试23/23通过：精确来源字节、当前夜表、88套规则校验、全部人数/常规与混合经验的生产候选可见、830实际后续夜0/1/2/3目标与健康/毒醉AI请求合同。两次测试夹具首失败已保留；全量检查、浏览器/真实AI/部署由root统一集成后记录实际结果。

真实AI待抽测题：**哈迪寂亚明确不发动**。题目、完整前提和规则依据见 `ai-regression-oracle.json`；本子任务没有调用真实AI。
