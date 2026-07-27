# Yin He Man Bu / 银河漫步

## Source lock

- Source: `https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20761_59924.json`
- Author: Ekin
- Version: GStone edition 20761 / game 39431
- Content hash: `sha256:edb443b035e3ceb1cd1dd2e9a6decc570369ef8eec5e17f6f3532122ad2f098c`
- Reviewed at: 2026-07-22

## Imported facts

- 25 source roles imported from the locked GStone JSON.
- Stable IDs normalize common source IDs: `fortune_teller -> fortuneteller`, `pit-hag -> pithag`, `fang_gu -> fanggu`.
- Source first-night and other-night reminders are preserved in `night-orders.ts`.

## Smart setup boundary

- 22 verified templates cover 7-15 players.
- Templates use base BOTC composition and avoid Godfather/Fang Gu/Vigormortis setup-modifying paths in the first normal candidate pool.
- Godfather, Fang Gu and Vigormortis outsider modifications remain setup reminders for storyteller review.
- Demon bluffs are selected from out-of-play good roles in this script pack.

## High-risk reminders

- Pit-Hag and Barber identity changes are candidate reminders only; no role or team state is changed automatically.
- Fang Gu jump, Imp handoff, Vigormortis minion retention/neighbor poisoning and Godfather extra kill are storyteller-confirmed.
- Fortune Teller red herring, Recluse registration, Cannibal ability source, Puzzlemaster drunk choice and death-triggered roles remain AI-safe prompts only.

## Verification

- Targeted pack/quality/composition/AI projection tests: passed in this closure.
- `npm run check`: passed in this closure.
