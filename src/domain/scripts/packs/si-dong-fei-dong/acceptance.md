# 似懂非懂 smart script import acceptance

- Source: https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21179_35934.json
- Source hash: sha256:9440c0157f79ecba0d6118d97f7ec390b0decdb4213e4feaae68196062505116
- Author: 靶子
- Roles: 41 (25 setup roles + 16 travelers)
- Supported player counts: 7-15
- Status: `needs-review`

## Confirmed

- GStone custom ids are mapped by Chinese role name to stable official ids.
- Traveler roles stay in role knowledge and night order, but normal setup templates use only seated setup roles.
- Bounty Hunter, Balloonist and Godfather setup modifiers are retained as reminders but excluded from the first normal template set.
- Barber, Pukka, Moonchild, No Dashii and Ojo produce reminders only. They do not auto-change identity, death or poison/drunk state.
