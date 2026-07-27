# He Fang Jiao Zhong smart script acceptance

Date: 2026-07-21.

## Source lock

- Script display name: 何方教众.
- Author: Zets.
- GStone source id: 21087.
- GStone game id: 41102.
- JSON: <https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21087_69602.json>.
- Content hash: `sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4`.
- Role facts: <https://release.botc.app/resources/data/roles.json> and GStone `grimoireRoleJson`.

## Role id mapping

GStone uses custom ids like `21087_xxxx`. This pack maps them to stable official role ids:

- 贵族 -> `noble`
- 小精灵 -> `pixie`
- 占卜师 -> `fortuneteller`
- 气球驾驶员 -> `balloonist`
- 国王 -> `king`
- 神谕者 -> `oracle`
- 异教领袖 -> `cultleader`
- 半兽人 -> `lycanthrope`
- 博学者 -> `savant`
- 女裁缝 -> `seamstress`
- 巡山人 -> `huntsman`
- 唱诗男孩 -> `choirboy`
- 食人族 -> `cannibal`
- 落难少女 -> `damsel`
- 畸形秀演员 -> `mutant`
- 陌客 -> `recluse`
- 解谜大师 -> `puzzlemaster`
- 女巫 -> `witch`
- 洗脑师 -> `cerenovus`
- 恐惧之灵 -> `fearmonger`
- 哥布林 -> `goblin`
- 方古 -> `fanggu`
- 小怪宝 -> `lilmonsta`
- 诺-达鲺 -> `nodashii`
- 涡流 -> `vortox`
- 暴风捕手 -> `stormcatcher`

## Boundaries

- Storm Catcher is fabled: rule reminder only, never in seat identities or Demon bluffs.
- Lil Monsta and Huntsman are documented, but not used in first setup templates to avoid babysitter / identity-change overload.
- Fang Gu and Balloonist templates carry explicit setup adjustments.
- Night resolution only produces advice and draft entries; no automatic death, identity, alignment or victory changes.

## Acceptance

- 7-15 players have verified templates.
- First-night and other-night orders follow the GStone JSON night-order numbers.
- High-risk roles have structured metadata for death, poison/drunk, madness, identity change, alignment change and win/loss reminders.
