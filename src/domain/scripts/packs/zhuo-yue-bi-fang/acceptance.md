# 浊月毕方 smart script import acceptance

- Source: https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21096_69654.json
- Source hash: sha256:ffe246e86acbbd57f8c913d6ab04ac9798c2c80a34d9a8444ad60b73b3c7e18d
- Author: Lei的剧本钟楼
- Roles: 25 (25 setup roles)
- Supported player counts: 7-15
- Status: `needs-review`

## Confirmed

- Source numeric ids are not used as primary ids; roles are mapped by Chinese name to stable GStone/official role ids.
- Legion is retained as a special demon reminder but is not used in normal verified templates.
- Godfather is used only where the template explicitly carries a +1 Outsider setup adjustment; Ganshiren and Vigormortis remain reminders in this first pass.
- Dianyuzhang, Harpy, Gambler, Gossip, Mastermind and death/registration effects produce AI reminders only; they do not automatically change death, vote, identity, alignment or victory state.
