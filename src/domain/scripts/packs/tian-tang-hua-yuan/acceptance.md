# 天堂花园 智能板子验收记录

- Script ID: `tian-tang-hua-yuan`
- Source: `https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20725_52289.json`
- Version: `GStone edition 20725 / game 39396`
- Hash: `sha256:f70ddd0ffebd64bbfcc04b30ae9b6d54a91e5da61f55f20b4b8cec379486de39`
- Reviewed at: `2026-07-22`

## 导入范围

- 角色：24 个来源角色。
- 夜序：按来源 `firstNight` / `otherNight` 排序生成。
- 模板：7-15 人共 22 套普通开局模板。

## 边界

- 唱诗男孩、酒鬼、男爵、提线木偶属于 setup/隐藏身份路径，首批普通模板先排除，只保留提醒。
- 哈迪寂亚、维齐尔、女巫、理发师、莽夫、赌徒、旅店老板、哲学家、小精灵、猎手、呆瓜等结果只作为 AI/夜序建议。
- 不自动改身份、阵营、死亡、毒醉或胜负。

## 验证

- 定向 pack/质量门/模板构成/AI 投影测试。
- `npm run check`。
