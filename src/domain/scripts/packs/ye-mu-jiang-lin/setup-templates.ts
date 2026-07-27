import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "ye-mu-jiang-lin"

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

export const yeMuJiangLinSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["seamstress", "fisherman", "slayer", "undertaker", "ravenkeeper", "assassin", "vortox"], bluffs: ["alchemist", "washerwoman", "chef"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["slayer", "undertaker", "ravenkeeper", "soldier", "alchemist", "scarletwoman", "imp"], bluffs: ["washerwoman", "chef", "fortuneteller"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["ravenkeeper", "soldier", "alchemist", "washerwoman", "chef", "devilsadvocate", "vortox"], bluffs: ["fortuneteller", "monk", "gambler"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["fisherman", "slayer", "undertaker", "ravenkeeper", "soldier", "saint", "assassin", "imp"], bluffs: ["alchemist", "washerwoman", "chef"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["undertaker", "ravenkeeper", "soldier", "alchemist", "washerwoman", "mutant", "scarletwoman", "vortox"], bluffs: ["chef", "fortuneteller", "monk"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["slayer", "undertaker", "ravenkeeper", "soldier", "alchemist", "saint", "mutant", "assassin", "vortox"], bluffs: ["washerwoman", "chef", "fortuneteller"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["ravenkeeper", "soldier", "alchemist", "washerwoman", "chef", "mutant", "klutz", "scarletwoman", "imp"], bluffs: ["fortuneteller", "monk", "gambler"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["undertaker", "ravenkeeper", "soldier", "alchemist", "washerwoman", "chef", "fortuneteller", "assassin", "scarletwoman", "imp"], bluffs: ["monk", "gambler", "towncrier"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["soldier", "alchemist", "washerwoman", "chef", "fortuneteller", "monk", "gambler", "scarletwoman", "devilsadvocate", "vortox"], bluffs: ["towncrier", "seamstress", "fisherman"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["washerwoman", "chef", "fortuneteller", "monk", "gambler", "towncrier", "seamstress", "devilsadvocate", "psychopath", "imp"], bluffs: ["alchemist", "fisherman", "slayer"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["ravenkeeper", "soldier", "alchemist", "washerwoman", "chef", "fortuneteller", "monk", "saint", "assassin", "scarletwoman", "vortox"], bluffs: ["gambler", "towncrier", "seamstress"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["alchemist", "washerwoman", "chef", "fortuneteller", "monk", "gambler", "towncrier", "mutant", "scarletwoman", "devilsadvocate", "imp"], bluffs: ["seamstress", "fisherman", "slayer"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["soldier", "alchemist", "washerwoman", "chef", "fortuneteller", "monk", "gambler", "saint", "mutant", "assassin", "scarletwoman", "imp"], bluffs: ["towncrier", "seamstress", "fisherman"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["washerwoman", "chef", "fortuneteller", "monk", "gambler", "towncrier", "seamstress", "mutant", "klutz", "scarletwoman", "devilsadvocate", "vortox"], bluffs: ["alchemist", "fisherman", "slayer"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["fortuneteller", "monk", "gambler", "towncrier", "seamstress", "fisherman", "slayer", "klutz", "moonchild", "devilsadvocate", "psychopath", "imp"], bluffs: ["alchemist", "washerwoman", "chef"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["alchemist", "washerwoman", "chef", "fortuneteller", "monk", "gambler", "towncrier", "seamstress", "fisherman", "assassin", "scarletwoman", "devilsadvocate", "vortox"], bluffs: ["slayer", "undertaker", "ravenkeeper"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["chef", "fortuneteller", "monk", "gambler", "towncrier", "seamstress", "fisherman", "slayer", "undertaker", "scarletwoman", "devilsadvocate", "psychopath", "imp"], bluffs: ["alchemist", "washerwoman", "ravenkeeper"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["washerwoman", "chef", "fortuneteller", "monk", "gambler", "towncrier", "seamstress", "fisherman", "slayer", "saint", "assassin", "scarletwoman", "devilsadvocate", "imp"], bluffs: ["alchemist", "undertaker", "ravenkeeper"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["fortuneteller", "monk", "gambler", "towncrier", "seamstress", "fisherman", "slayer", "undertaker", "ravenkeeper", "mutant", "scarletwoman", "devilsadvocate", "psychopath", "vortox"], bluffs: ["alchemist", "washerwoman", "chef"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["chef", "fortuneteller", "monk", "gambler", "towncrier", "seamstress", "fisherman", "slayer", "undertaker", "saint", "mutant", "assassin", "scarletwoman", "devilsadvocate", "vortox"], bluffs: ["alchemist", "washerwoman", "ravenkeeper"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["monk", "gambler", "towncrier", "seamstress", "fisherman", "slayer", "undertaker", "ravenkeeper", "soldier", "mutant", "klutz", "scarletwoman", "devilsadvocate", "psychopath", "imp"], bluffs: ["alchemist", "washerwoman", "chef"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["towncrier", "seamstress", "fisherman", "slayer", "undertaker", "ravenkeeper", "soldier", "alchemist", "washerwoman", "klutz", "moonchild", "devilsadvocate", "psychopath", "assassin", "vortox"], bluffs: ["chef", "fortuneteller", "monk"], note: "Verified seating mix. Godfather setup changes and Vortox/no-execution loss stay as storyteller-confirmed reminders." }),
]
