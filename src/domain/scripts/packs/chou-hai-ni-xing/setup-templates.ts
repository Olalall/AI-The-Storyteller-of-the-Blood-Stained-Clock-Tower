import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "chou-hai-ni-xing"

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

export const chouHaiNiXingSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["seamstress", "savant", "courtier", "amnesiac", "magician", "cerenovus", "leviathan"], bluffs: ["librarian", "investigator", "empath"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["courtier", "amnesiac", "magician", "librarian", "investigator", "goblin", "leviathan"], bluffs: ["empath", "dreamer", "snakecharmer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["magician", "librarian", "investigator", "empath", "dreamer", "pithag", "leviathan"], bluffs: ["snakecharmer", "towncrier", "slayer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["savant", "courtier", "amnesiac", "magician", "librarian", "lunatic", "cerenovus", "leviathan"], bluffs: ["investigator", "empath", "dreamer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["amnesiac", "magician", "librarian", "investigator", "empath", "mutant", "goblin", "leviathan"], bluffs: ["dreamer", "snakecharmer", "towncrier"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["courtier", "amnesiac", "magician", "librarian", "investigator", "lunatic", "mutant", "cerenovus", "leviathan"], bluffs: ["empath", "dreamer", "snakecharmer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["magician", "librarian", "investigator", "empath", "dreamer", "mutant", "politician", "goblin", "leviathan"], bluffs: ["snakecharmer", "towncrier", "slayer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["amnesiac", "magician", "librarian", "investigator", "empath", "dreamer", "snakecharmer", "cerenovus", "goblin", "leviathan"], bluffs: ["towncrier", "slayer", "seamstress"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["librarian", "investigator", "empath", "dreamer", "snakecharmer", "towncrier", "slayer", "goblin", "pithag", "leviathan"], bluffs: ["seamstress", "savant", "courtier"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["empath", "dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "savant", "pithag", "cerenovus", "leviathan"], bluffs: ["librarian", "investigator", "courtier"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["magician", "librarian", "investigator", "empath", "dreamer", "snakecharmer", "towncrier", "lunatic", "cerenovus", "goblin", "leviathan"], bluffs: ["slayer", "seamstress", "savant"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["investigator", "empath", "dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "mutant", "goblin", "pithag", "leviathan"], bluffs: ["librarian", "savant", "courtier"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["librarian", "investigator", "empath", "dreamer", "snakecharmer", "towncrier", "slayer", "lunatic", "mutant", "cerenovus", "goblin", "leviathan"], bluffs: ["seamstress", "savant", "courtier"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["empath", "dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "savant", "mutant", "politician", "goblin", "pithag", "leviathan"], bluffs: ["librarian", "investigator", "courtier"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["snakecharmer", "towncrier", "slayer", "seamstress", "savant", "courtier", "amnesiac", "politician", "damsel", "pithag", "cerenovus", "leviathan"], bluffs: ["librarian", "investigator", "empath"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["investigator", "empath", "dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "savant", "courtier", "cerenovus", "goblin", "pithag", "leviathan"], bluffs: ["librarian", "amnesiac", "magician"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "savant", "courtier", "amnesiac", "magician", "goblin", "pithag", "cerenovus", "leviathan"], bluffs: ["librarian", "investigator", "empath"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["empath", "dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "savant", "courtier", "amnesiac", "lunatic", "cerenovus", "goblin", "pithag", "leviathan"], bluffs: ["librarian", "investigator", "magician"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["snakecharmer", "towncrier", "slayer", "seamstress", "savant", "courtier", "amnesiac", "magician", "librarian", "mutant", "goblin", "pithag", "cerenovus", "leviathan"], bluffs: ["investigator", "empath", "dreamer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["dreamer", "snakecharmer", "towncrier", "slayer", "seamstress", "savant", "courtier", "amnesiac", "magician", "lunatic", "mutant", "cerenovus", "goblin", "pithag", "leviathan"], bluffs: ["librarian", "investigator", "empath"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["towncrier", "slayer", "seamstress", "savant", "courtier", "amnesiac", "magician", "librarian", "investigator", "mutant", "politician", "goblin", "pithag", "cerenovus", "leviathan"], bluffs: ["empath", "dreamer", "snakecharmer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["seamstress", "savant", "courtier", "amnesiac", "magician", "librarian", "investigator", "empath", "dreamer", "politician", "damsel", "pithag", "cerenovus", "goblin", "leviathan"], bluffs: ["snakecharmer", "towncrier", "slayer"], note: "Verified Leviathan seating mix. Balloonist, Baron, Atheist and Marionette setup changes stay out of first templates." }),
]
