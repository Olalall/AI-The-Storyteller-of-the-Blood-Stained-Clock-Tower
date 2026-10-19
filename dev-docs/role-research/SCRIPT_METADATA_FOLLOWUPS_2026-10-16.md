# 2026-10-16 导入角色研究字段补核

本次只补充已有剧本中缺失的结构化条件与风险说明，不改变角色能力、开局、夜序或权威状态。原始失败保留在 `.tmp/fixed-api-20261016/quality-before-fixes.log`：中文高风险识别补齐后，10 条缺结构摘要、29 条缺分类说明，共涉及 10 个剧本的 24 个角色条目。

官方角色沿用共享规则知识和本次核对的官方 Wiki：[Sage](https://wiki.bloodontheclocktower.com/Sage)、[Slayer](https://wiki.bloodontheclocktower.com/Slayer)、[Oracle](https://wiki.bloodontheclocktower.com/Oracle)、[Seamstress](https://wiki.bloodontheclocktower.com/Seamstress)、[Poisoner](https://wiki.bloodontheclocktower.com/Poisoner)、[Undertaker](https://wiki.bloodontheclocktower.com/Undertaker)、[Gossip](https://wiki.bloodontheclocktower.com/Gossip)、[Ravenkeeper](https://wiki.bloodontheclocktower.com/Ravenkeeper)、[Atheist](https://wiki.bloodontheclocktower.com/Atheist)、[Cannibal](https://wiki.bloodontheclocktower.com/Cannibal)、[Mutant](https://wiki.bloodontheclocktower.com/Mutant)、[Huntsman](https://wiki.bloodontheclocktower.com/Huntsman)、[Legion](https://wiki.bloodontheclocktower.com/Legion)。重点补实际死亡与仅处决的区别、死因和触发时点、醉毒起止、角色与当前阵营区别、登记例外、一次性能力和主持裁量。

自制角色于 2026-10-16 直接读取发行方的原始 JSON（HTTP 200），逐条核对能力、首夜与后续夜提醒；未借官方同名规则替代。

| 剧本 / 角色 | 原始来源与 ID | 本次锁定的关键条件 |
|---|---|---|
| 古道酒温 / 乾道 | [来源](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21225_32856.json)，`21225_10723` → `qian_dao` | 首夜不触发夜间选择死亡；选择来自邪恶玩家的能力；先死再得知在场恶魔角色。 |
| 古道酒温 / 欢梦 | 同上，`21225_10725` → `huan_meng` | 该白天全部外来者参与过提名后才通知；醉、毒、已死仍通知的明确例外。 |
| 古道酒温 / 蓑笠翁 | 同上，`21225_10732` → `suo_li_weng` | 初始不互认；首次指定提名事件的提名者在当晚获双次生效提醒，不能扩展成所有邪恶玩家都获益。 |
| 古道酒温 / 春秋笔 | 同上，`21225_10734` → `chun_qiu_bi` | 后续夜主持裁量死亡与每夜合格目标选择分开；主动选择最多两人、每人参与提名至少四次；来源元说明明确参与指发起或被提名。 |
| 秉公办事、浊月毕方 / 赶尸人 | [秉公办事](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21097_69653.json)，`21097_9941`；[浊月毕方](https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21096_69654.json) | 两名邻近镇民的首次死亡产生被当作存活的提醒，不等于复活；保留实际死亡来源与各自首次触发记录。 |

来源中的角色原始编号与项目稳定 ID 的映射沿用当前 pack；本次未改名或自动合并角色。pack 的 source hash 仍指向已锁定原始剧本，不用研究说明文本重算来源 hash。
