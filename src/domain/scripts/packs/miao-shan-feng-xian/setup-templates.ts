import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "miao-shan-feng-xian"

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

export const miaoShanFengXianSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["monk", "savant", "oracle", "seamstress", "engineer", "harpy", "vortox"], bluffs: ["knight", "pixie", "sailor"], note: "Verified 7-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["oracle", "seamstress", "engineer", "cannibal", "shugenja", "scarletwoman", "lleech"], bluffs: ["mathematician", "highpriestess", "fortuneteller"], note: "Verified 7-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["engineer", "cannibal", "shugenja", "knight", "pixie", "spy", "vortox"], bluffs: ["monk", "savant", "oracle"], note: "Verified 7-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["savant", "oracle", "seamstress", "engineer", "cannibal", "mutant", "scarletwoman", "lleech"], bluffs: ["knight", "pixie", "sailor"], note: "Verified 8-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["seamstress", "engineer", "cannibal", "shugenja", "knight", "barber", "spy", "vortox"], bluffs: ["mathematician", "highpriestess", "fortuneteller"], note: "Verified 8-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["oracle", "seamstress", "engineer", "cannibal", "shugenja", "barber", "drunk", "spy", "vortox"], bluffs: ["knight", "pixie", "sailor"], note: "Verified 9-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["engineer", "cannibal", "shugenja", "knight", "pixie", "drunk", "plaguedoctor", "psychopath", "lleech"], bluffs: ["mathematician", "highpriestess", "fortuneteller"], note: "Verified 9-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["seamstress", "engineer", "cannibal", "shugenja", "knight", "pixie", "sailor", "psychopath", "harpy", "lleech"], bluffs: ["mathematician", "highpriestess", "fortuneteller"], note: "Verified 10-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["cannibal", "shugenja", "knight", "pixie", "sailor", "mathematician", "highpriestess", "harpy", "scarletwoman", "vortox"], bluffs: ["fortuneteller", "monk", "savant"], note: "Verified 10-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["knight", "pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "scarletwoman", "spy", "lleech"], bluffs: ["savant", "oracle", "seamstress"], note: "Verified 10-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["engineer", "cannibal", "shugenja", "knight", "pixie", "sailor", "mathematician", "plaguedoctor", "harpy", "scarletwoman", "vortox"], bluffs: ["highpriestess", "fortuneteller", "monk"], note: "Verified 11-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["shugenja", "knight", "pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "mutant", "scarletwoman", "spy", "lleech"], bluffs: ["monk", "savant", "oracle"], note: "Verified 11-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["cannibal", "shugenja", "knight", "pixie", "sailor", "mathematician", "highpriestess", "mutant", "barber", "scarletwoman", "spy", "lleech"], bluffs: ["fortuneteller", "monk", "savant"], note: "Verified 12-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["knight", "pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "barber", "drunk", "spy", "psychopath", "vortox"], bluffs: ["savant", "oracle", "seamstress"], note: "Verified 12-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "savant", "oracle", "drunk", "plaguedoctor", "psychopath", "harpy", "lleech"], bluffs: ["seamstress", "engineer", "cannibal"], note: "Verified 12-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["shugenja", "knight", "pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "savant", "spy", "psychopath", "harpy", "vortox"], bluffs: ["oracle", "seamstress", "engineer"], note: "Verified 13-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "savant", "oracle", "seamstress", "psychopath", "harpy", "scarletwoman", "lleech"], bluffs: ["engineer", "shugenja", "knight"], note: "Verified 13-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["knight", "pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "savant", "oracle", "drunk", "psychopath", "harpy", "scarletwoman", "lleech"], bluffs: ["shugenja", "seamstress", "engineer"], note: "Verified 14-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "savant", "oracle", "seamstress", "engineer", "plaguedoctor", "harpy", "scarletwoman", "spy", "vortox"], bluffs: ["shugenja", "knight", "pixie"], note: "Verified 14-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["pixie", "sailor", "mathematician", "highpriestess", "fortuneteller", "monk", "savant", "oracle", "seamstress", "plaguedoctor", "mutant", "harpy", "scarletwoman", "spy", "vortox"], bluffs: ["knight", "shugenja", "engineer"], note: "Verified 15-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["mathematician", "highpriestess", "fortuneteller", "monk", "savant", "oracle", "seamstress", "engineer", "cannibal", "mutant", "barber", "scarletwoman", "spy", "psychopath", "lleech"], bluffs: ["shugenja", "knight", "pixie"], note: "Verified 15-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["fortuneteller", "monk", "savant", "oracle", "seamstress", "engineer", "cannibal", "shugenja", "knight", "barber", "drunk", "spy", "psychopath", "harpy", "vortox"], bluffs: ["pixie", "sailor", "mathematician"], note: "Verified 15-player setup. Vigormortis and Fang Gu setup-changing demons stay out of first templates; Engineer, Barber and Plague Doctor remain manual reminders." }),
]
