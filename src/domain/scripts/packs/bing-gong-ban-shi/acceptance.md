# 秉公办事 smart script import acceptance

- Source: https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21097_69653.json
- Source hash: sha256:e6ddad5ff318ef98a6f597bf34f0a8a8064675f250ff60b8c38a3f91b0e341ca
- Author: 清清Jungle
- Roles: 32 after collapsing repeated Djinn fabled reminders (29 setup roles + 3 fabled)
- Supported player counts: 7-15
- Status: `needs-review`

## Confirmed

- Source custom numeric ids are not used as primary ids; roles are mapped by source name to stable GStone/official role ids where available.
- Normal setup templates exclude the strongest composition-changing roles in this first pass: Godfather, Qiongqi, Ganshiren and Atheist remain setup/high-risk reminders.
- Djinn, Spirit of Ivory and Official Storyteller stay as fabled reminders and do not enter setup templates or demon bluffs.
- Pit-Hag, Al-Hadikhia, Vizier, Lunatic, Damsel and identity/death/edge-case roles produce AI reminders only; they do not automatically change identity, alignment, death or victory state.
