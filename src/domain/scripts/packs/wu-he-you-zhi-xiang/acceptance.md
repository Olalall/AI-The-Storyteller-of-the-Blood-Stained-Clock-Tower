# 无何有之乡 smart script import acceptance

- Source: https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21137_23248.json
- Source hash: sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87
- Author: 鸭镇
- Roles: 25
- Supported player counts: 7-15
- Status: `needs-review`

## Confirmed

- GStone ids are mapped to stable official ids: `scarletwoman`, `poppygrower`, `plaguedoctor`, `highpriestess`, `villageidiot`.
- Night order uses source JSON `firstNight` / `otherNight` values.
- Template library contains 22 verified 7-15 player drafts.
- Legion is retained as role knowledge and night-order reminder, but is not auto-used in normal templates.
- Kazali, Hatter, Drunk, Village Idiot, Poppy Grower and Plague Doctor produce reminders only. They do not auto-change identity, alignment, death or poison/drunk state.
