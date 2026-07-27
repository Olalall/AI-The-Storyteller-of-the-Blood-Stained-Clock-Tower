# Mi Ying Xun Zong / 觅影寻踪

## Source lock

- Source: `https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20759_59924.json`
- Author: Narninian & Zaba
- Version: GStone edition 20759 / game 39432
- Content hash: `sha256:4a44da87af812886d77d55628a4b1f169e98ed1116df511e0e9bae5067191a61`
- Reviewed at: 2026-07-22

## Imported facts

- 24 source roles imported from the locked GStone JSON.
- Stable IDs normalize common source IDs: `town_crier -> towncrier`.
- Source first-night and other-night reminders are preserved in `night-orders.ts`.

## Smart setup boundary

- 22 verified templates cover 7-15 players.
- Templates use base BOTC composition and avoid Huntsman/Drunk/Godfather/Vigormortis setup or hidden paths in the first normal candidate pool.
- Setup modifications from Huntsman, Godfather and Vigormortis remain setup reminders for storyteller review.
- Demon bluffs are selected from out-of-play good roles in this script pack.

## High-risk reminders

- Mezepheles alignment change, Cerenovus madness, Pukka poison/death cycle, Preacher minion disable and Goon interactions remain storyteller-confirmed.
- Damsel/Huntsman transformation, Drunk perceived identity, Virgin execution trigger and Imp handoff are AI-safe prompts only.

## Verification

- Targeted pack/quality/composition/AI projection tests: passed in this closure.
- `npm run check`: passed in this closure.
