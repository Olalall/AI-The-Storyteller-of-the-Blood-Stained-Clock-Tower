# Hao Shi Duo Mo / 好事多磨

## Source lock

- Source: `https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20749_59939.json`
- Author: TPI
- Version: GStone edition 20749 / game 39443
- Content hash: `sha256:2ad57e09ee5edc0523bea8979d42431922e09cbf68182cd0ad041320d98657a5`
- Reviewed at: 2026-07-22

## Imported facts

- 31 source roles imported from the locked GStone JSON.
- Stable IDs normalize common GStone underscore IDs: `snake_charmer -> snakecharmer`, `poppy_grower -> poppygrower`, `fang_gu -> fanggu`.
- Travelers (`barista`, `harlot`, `judge`, `scapegoat`, `thief`) and Fabled `sentinel` remain reminders only; they do not enter setup templates or demon bluffs.
- Source first-night and other-night reminders are preserved in `night-orders.ts`.

## Smart setup boundary

- 22 verified templates cover 7-15 players.
- Templates use base BOTC composition and avoid Drunk/Heretic/Fang Gu in the first normal candidate pool.
- Fang Gu and Sentinel outsider modifications remain setup reminders for storyteller review.
- Demon bluffs are selected from out-of-play good roles in this script pack.

## High-risk reminders

- Snake Charmer/Demon identity and alignment swap is never auto-applied; the new Snake Charmer drunk state must be confirmed manually.
- Cerenovus madness target and role are reminders; consequences stay storyteller-confirmed.
- Gambler death is a suggested result only after the storyteller confirms the guessed role is wrong.
- Imp self-kill handoff, Fang Gu jump, Lleech host/death, Boomdandy vote and Heretic win reversal are never automatic.

## Verification

- Targeted pack/quality/composition/AI projection tests: passed in this closure.
- `npm run check`: passed in this closure.
