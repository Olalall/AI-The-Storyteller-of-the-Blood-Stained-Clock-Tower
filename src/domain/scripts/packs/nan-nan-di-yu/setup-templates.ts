import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "nan-nan-di-yu"

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `${scriptId}-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    notes: [input.note],
    verified: true,
  }
}

export const nanNanDiYuSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["undertaker", "towncrier", "chambermaid", "ravenkeeper", "soldier", "scarletwoman", "nodashii"], bluffs: ["investigator", "chef", "seamstress"], note: "Verified 7-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["chambermaid", "ravenkeeper", "soldier", "steward", "investigator", "spy", "imp"], bluffs: ["slayer", "monk", "fortuneteller"], note: "Verified 7-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["soldier", "steward", "investigator", "chef", "seamstress", "poisoner", "pukka"], bluffs: ["undertaker", "towncrier", "chambermaid"], note: "Verified 7-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["towncrier", "chambermaid", "ravenkeeper", "soldier", "steward", "drunk", "spy", "imp"], bluffs: ["investigator", "chef", "seamstress"], note: "Verified 8-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["ravenkeeper", "soldier", "steward", "investigator", "chef", "klutz", "poisoner", "pukka"], bluffs: ["slayer", "monk", "fortuneteller"], note: "Verified 8-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["chambermaid", "ravenkeeper", "soldier", "steward", "investigator", "klutz", "recluse", "poisoner", "pukka"], bluffs: ["chef", "seamstress", "slayer"], note: "Verified 9-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["soldier", "steward", "investigator", "chef", "seamstress", "recluse", "damsel", "goblin", "nodashii"], bluffs: ["slayer", "monk", "fortuneteller"], note: "Verified 9-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["ravenkeeper", "soldier", "steward", "investigator", "chef", "seamstress", "slayer", "goblin", "scarletwoman", "nodashii"], bluffs: ["monk", "fortuneteller", "undertaker"], note: "Verified 10-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["steward", "investigator", "chef", "seamstress", "slayer", "monk", "fortuneteller", "scarletwoman", "spy", "imp"], bluffs: ["undertaker", "towncrier", "chambermaid"], note: "Verified 10-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["chef", "seamstress", "slayer", "monk", "fortuneteller", "undertaker", "towncrier", "spy", "poisoner", "pukka"], bluffs: ["chambermaid", "ravenkeeper", "soldier"], note: "Verified 10-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["soldier", "steward", "investigator", "chef", "seamstress", "slayer", "monk", "damsel", "scarletwoman", "spy", "imp"], bluffs: ["fortuneteller", "undertaker", "towncrier"], note: "Verified 11-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["investigator", "chef", "seamstress", "slayer", "monk", "fortuneteller", "undertaker", "drunk", "spy", "poisoner", "pukka"], bluffs: ["towncrier", "chambermaid", "ravenkeeper"], note: "Verified 11-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["steward", "investigator", "chef", "seamstress", "slayer", "monk", "fortuneteller", "drunk", "klutz", "spy", "poisoner", "pukka"], bluffs: ["undertaker", "towncrier", "chambermaid"], note: "Verified 12-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["chef", "seamstress", "slayer", "monk", "fortuneteller", "undertaker", "towncrier", "klutz", "recluse", "poisoner", "goblin", "nodashii"], bluffs: ["chambermaid", "ravenkeeper", "soldier"], note: "Verified 12-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["slayer", "monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "ravenkeeper", "recluse", "damsel", "goblin", "scarletwoman", "imp"], bluffs: ["soldier", "steward", "investigator"], note: "Verified 12-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["investigator", "chef", "seamstress", "slayer", "monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "poisoner", "goblin", "scarletwoman", "nodashii"], bluffs: ["steward", "ravenkeeper", "soldier"], note: "Verified 13-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["seamstress", "slayer", "monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "ravenkeeper", "soldier", "goblin", "scarletwoman", "spy", "imp"], bluffs: ["steward", "investigator", "chef"], note: "Verified 13-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["chef", "seamstress", "slayer", "monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "ravenkeeper", "recluse", "goblin", "scarletwoman", "spy", "imp"], bluffs: ["investigator", "steward", "soldier"], note: "Verified 14-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["slayer", "monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "ravenkeeper", "soldier", "steward", "damsel", "scarletwoman", "spy", "poisoner", "pukka"], bluffs: ["investigator", "chef", "seamstress"], note: "Verified 14-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["seamstress", "slayer", "monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "ravenkeeper", "soldier", "damsel", "drunk", "scarletwoman", "spy", "poisoner", "pukka"], bluffs: ["investigator", "chef", "steward"], note: "Verified 15-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["monk", "fortuneteller", "undertaker", "towncrier", "chambermaid", "ravenkeeper", "soldier", "steward", "investigator", "drunk", "klutz", "spy", "poisoner", "goblin", "nodashii"], bluffs: ["slayer", "chef", "seamstress"], note: "Verified 15-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["undertaker", "towncrier", "chambermaid", "ravenkeeper", "soldier", "steward", "investigator", "chef", "seamstress", "klutz", "recluse", "poisoner", "goblin", "scarletwoman", "imp"], bluffs: ["slayer", "monk", "fortuneteller"], note: "Verified 15-player setup. Huntsman and Fang Gu setup-changing paths stay reminders in the first template set." }),
]
