# Hide & Seek 智能板子包验收记录

状态：`needs-review`。  
完成日期：2026-07-20。  
导入阶段：12.8。

## 来源

- TPI Recommended 页面：https://bloodontheclocktower.com/pages/custom-scripts
- Script Tool 链接：https://script.bloodontheclocktower.com/?script=H4sIAAAAAAAACo2Tu07FMAxAf%2BXKc7%2BgKwssLGwghNzGbU0TO3Kc8hL%2Fji5cwYjHJMdHfuXhAzjBCE%2BFHGEA7L6pwQi3aMLCKCeUdLrH6fwqWAhGuOZE39d3RDsMMGXV1BztpuBKV2pGs7MKjKDyI9Wm5jAumBsN4G%2F17Fl6zvA5XFIQnTLBAOum7Q%2BtLELpcvxlM0%2BGxihBvvIrR93VCOeNLIi7vshsHObVcA7X2SWROe5hezLCEqYbYWlu1FowAM25eRDeungr4RkZHiQ7UQ2nf7CtHNUnLI1yuI1d9iBbuqNEe7KqRhNeNS3o8UUs9E51o0zRYVblphL2z2QkevSwvu87hie5qhU9b1cwgkuNfrhn%2FYd8%2FAKDMcBoBgUAAA%3D%3D
- Script Tool 内容 SHA-256：`d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823`
- 官方角色数据：https://release.botc.app/resources/data/roles.json
- 官方夜序数据：https://release.botc.app/resources/data/nightsheet.json

Script Tool `_meta.author` 为 `Narninian and Zaba`。本包只把来源、角色、夜序和模板作为可维护事实源，不把 TPI 推荐社区板标成官方基础剧本。

## 已接入内容

- 25 个角色事实：13 镇民、4 外来者、4 爪牙、4 恶魔。
- 首夜/其他夜顺序来自官方 `nightsheet.json` 过滤。
- 6 条 setup/高风险规则：
  - 猎人开局加入落难少女。
  - 教父外来者增减。
  - 维格莫提斯减少外来者。
  - 小精灵得知在场镇民和疯狂获得能力链路。
  - 灵言师暗号触发阵营变化。
  - 落难少女爪牙公开猜测。
- 22 套 7-15 人 verified 模板。

## 高风险边界

- `pixie`：得知的在场镇民和是否获得能力只做私密提醒，不向非相关玩家泄漏。
- `damsel`：爪牙猜测是否成功和善良是否失败必须由说书人确认。
- `huntsman`：救援成功后只生成身份更正草稿；不自动替换身份。
- `preacher`：目标若为爪牙会得知并失去能力；失能状态只写成待确认提醒。
- `mezepheles`：暗号触发的阵营变化必须走说书人确认后的更正记录。
- `pukka`、`vigormortis`、`ojo`：死亡、中毒和不在场角色目标只做记录和建议，不自动结算。

## 验收命令

```powershell
npx vitest run src/domain/scripts/packs/hide-and-seek/index.test.ts src/domain/setup-templates/composition.test.ts src/domain/scripts/role-copy.test.ts
npm run check
```

## 未做

- 未接真实 AI 配板 live 调用。
- 未做自动技能结算、自动胜负、自动昼夜、玩家端或官方魔典同步。
- 未把 `pixie`、`damsel`、`huntsman` 的私密信息做成玩家端发送链路；当前只作为说书人提醒和日志草稿来源。
