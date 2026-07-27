import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "yi-yan-huan-yan"

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

export const yiYanHuanYanSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["savant", "slayer", "philosopher", "farmer", "poppygrower", "spy", "ojo"], bluffs: ["grandmother", "empath", "highpriestess"], note: "Verified 7-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["philosopher", "farmer", "poppygrower", "mayor", "steward", "assassin", "nodashii"], bluffs: ["preacher", "fortuneteller", "oracle"], note: "Verified 7-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["poppygrower", "mayor", "steward", "grandmother", "empath", "poisoner", "ojo"], bluffs: ["savant", "slayer", "philosopher"], note: "Verified 7-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["slayer", "philosopher", "farmer", "poppygrower", "mayor", "goon", "assassin", "nodashii"], bluffs: ["grandmother", "empath", "highpriestess"], note: "Verified 8-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["farmer", "poppygrower", "mayor", "steward", "grandmother", "saint", "poisoner", "ojo"], bluffs: ["preacher", "fortuneteller", "oracle"], note: "Verified 8-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["philosopher", "farmer", "poppygrower", "mayor", "steward", "saint", "recluse", "poisoner", "ojo"], bluffs: ["grandmother", "empath", "highpriestess"], note: "Verified 9-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["poppygrower", "mayor", "steward", "grandmother", "empath", "recluse", "drunk", "spy", "nodashii"], bluffs: ["preacher", "fortuneteller", "oracle"], note: "Verified 9-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["farmer", "poppygrower", "mayor", "steward", "grandmother", "empath", "highpriestess", "spy", "assassin", "nodashii"], bluffs: ["preacher", "fortuneteller", "oracle"], note: "Verified 10-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["mayor", "steward", "grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "assassin", "poisoner", "ojo"], bluffs: ["oracle", "savant", "slayer"], note: "Verified 10-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "oracle", "savant", "poisoner", "spy", "nodashii"], bluffs: ["slayer", "philosopher", "farmer"], note: "Verified 10-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["poppygrower", "mayor", "steward", "grandmother", "empath", "highpriestess", "preacher", "drunk", "assassin", "poisoner", "ojo"], bluffs: ["fortuneteller", "oracle", "savant"], note: "Verified 11-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["steward", "grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "oracle", "goon", "poisoner", "spy", "nodashii"], bluffs: ["savant", "slayer", "philosopher"], note: "Verified 11-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["mayor", "steward", "grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "goon", "saint", "poisoner", "spy", "nodashii"], bluffs: ["oracle", "savant", "slayer"], note: "Verified 12-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "oracle", "savant", "saint", "recluse", "spy", "assassin", "ojo"], bluffs: ["slayer", "philosopher", "farmer"], note: "Verified 12-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["highpriestess", "preacher", "fortuneteller", "oracle", "savant", "slayer", "philosopher", "recluse", "drunk", "assassin", "poisoner", "nodashii"], bluffs: ["farmer", "poppygrower", "mayor"], note: "Verified 12-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["steward", "grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "oracle", "savant", "slayer", "spy", "assassin", "poisoner", "ojo"], bluffs: ["philosopher", "farmer", "poppygrower"], note: "Verified 13-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["empath", "highpriestess", "preacher", "fortuneteller", "oracle", "savant", "slayer", "philosopher", "farmer", "assassin", "poisoner", "spy", "nodashii"], bluffs: ["poppygrower", "steward", "grandmother"], note: "Verified 13-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["grandmother", "empath", "highpriestess", "preacher", "fortuneteller", "oracle", "savant", "slayer", "philosopher", "recluse", "assassin", "poisoner", "spy", "nodashii"], bluffs: ["steward", "farmer", "poppygrower"], note: "Verified 14-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["highpriestess", "preacher", "fortuneteller", "oracle", "savant", "slayer", "philosopher", "farmer", "poppygrower", "drunk", "poisoner", "spy", "assassin", "ojo"], bluffs: ["steward", "grandmother", "empath"], note: "Verified 14-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["empath", "highpriestess", "preacher", "fortuneteller", "oracle", "savant", "slayer", "philosopher", "farmer", "drunk", "goon", "poisoner", "spy", "assassin", "ojo"], bluffs: ["grandmother", "steward", "poppygrower"], note: "Verified 15-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["preacher", "fortuneteller", "oracle", "savant", "slayer", "philosopher", "farmer", "poppygrower", "mayor", "goon", "saint", "spy", "assassin", "poisoner", "nodashii"], bluffs: ["steward", "grandmother", "empath"], note: "Verified 15-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["oracle", "savant", "slayer", "philosopher", "farmer", "poppygrower", "mayor", "steward", "grandmother", "saint", "recluse", "assassin", "poisoner", "spy", "ojo"], bluffs: ["empath", "highpriestess", "preacher"], note: "Verified 15-player setup. Legion, Vigormortis and Marionette setup patterns stay reminders in the first template set." }),
]
