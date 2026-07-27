# 宝月初升 smart script acceptance

- Script ID: `bao-yue-chu-sheng`
- Source: `https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20726_52289.json`
- Version: `GStone edition 20726 / game 39395`
- Hash: `sha256:73a0d102934967b66a455b6d8f5e012bcfb9fbd720efc38c2340240a7d7a7893`
- Reviewed at: `2026-07-22`

## Scope

- Roles: 25 source roles.
- Night order: generated from source `firstNight` / `otherNight`.
- Templates: 22 verified normal setup templates for 7-15 players.

## Boundary

- Balloonist, Choirboy, Drunk, Godfather and Lil' Monsta setup or hidden-identity paths stay manual and are excluded from first normal templates.
- Pukka, Shabaloth, Po, Widow, Cerenovus, Goblin, Barber, Snake Charmer, Professor, Gambler and Mayor outcomes stay ST-confirmed.
- No automatic identity, alignment, death, poison, drunk or win/loss changes.

## Verification

- Targeted pack/quality/composition/AI projection tests.
- `npm run check`.
