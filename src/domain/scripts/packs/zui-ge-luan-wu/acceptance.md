# Zui Ge Luan Wu / 醉歌乱舞

## Source lock

- Source: `https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20760_59924.json`
- Author: TPI
- Version: GStone edition 20760 / game 39433
- Content hash: `sha256:1d1b6109849cce24c4b48e0dbb4564900d65f13b8f3e588710d5d60f0915f08e`
- Reviewed at: 2026-07-22

## Imported facts

- 25 source roles imported from the locked GStone JSON.
- Stable IDs normalize common source IDs: `bounty_hunter -> bountyhunter`, `pit-hag -> pithag`, `no_dashii -> nodashii`, `fang_gu -> fanggu`.
- Source first-night and other-night reminders are preserved in `night-orders.ts`.

## Smart setup boundary

- 22 verified templates cover 7-15 players.
- Templates use base BOTC composition and avoid Bounty Hunter/Huntsman/Drunk/Godfather/Vigormortis/Fang Gu setup or hidden paths in the first normal candidate pool.
- Setup modifications from Bounty Hunter, Huntsman, Godfather, Vigormortis and Fang Gu remain setup reminders for storyteller review.
- Demon bluffs are selected from out-of-play good roles in this script pack.

## High-risk reminders

- Philosopher, Pit-Hag and Huntsman identity or ability changes are candidate reminders only.
- Cerenovus madness, Goon alignment/drunkenness, Minstrel drunkenness, No Dashii/Vigormortis poisoning and Fang Gu jump remain storyteller-confirmed.
- Damsel, Bounty Hunter evil Townsfolk, Drunk perceived identity and Amnesiac/Savant authored info are AI-safe prompts only.

## Verification

- Targeted pack/quality/composition/AI projection tests: passed in this closure.
- `npm run check`: passed in this closure.
