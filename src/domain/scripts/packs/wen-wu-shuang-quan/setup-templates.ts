import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "wen-wu-shuang-quan"

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

export const wenWuShuangQuanSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["gambler", "lycanthrope", "soldier", "fool", "cannibal", "assassin", "shabaloth"], bluffs: ["librarian", "savant", "philosopher"], note: "Verified 7-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["soldier", "fool", "cannibal", "steward", "librarian", "pithag", "imp"], bluffs: ["professor", "mathematician", "sailor"], note: "Verified 7-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["cannibal", "steward", "librarian", "savant", "philosopher", "poisoner", "lleech"], bluffs: ["gambler", "lycanthrope", "soldier"], note: "Verified 7-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["lycanthrope", "soldier", "fool", "cannibal", "steward", "drunk", "pithag", "imp"], bluffs: ["librarian", "savant", "philosopher"], note: "Verified 8-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["fool", "cannibal", "steward", "librarian", "savant", "lunatic", "poisoner", "lleech"], bluffs: ["professor", "mathematician", "sailor"], note: "Verified 8-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["soldier", "fool", "cannibal", "steward", "librarian", "lunatic", "barber", "poisoner", "lleech"], bluffs: ["savant", "philosopher", "professor"], note: "Verified 9-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["cannibal", "steward", "librarian", "savant", "philosopher", "barber", "acrobat", "assassin", "pukka"], bluffs: ["professor", "mathematician", "sailor"], note: "Verified 9-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["fool", "cannibal", "steward", "librarian", "savant", "philosopher", "professor", "assassin", "pithag", "pukka"], bluffs: ["mathematician", "sailor", "gambler"], note: "Verified 10-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["steward", "librarian", "savant", "philosopher", "professor", "mathematician", "sailor", "pithag", "poisoner", "shabaloth"], bluffs: ["gambler", "lycanthrope", "soldier"], note: "Verified 10-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["savant", "philosopher", "professor", "mathematician", "sailor", "gambler", "lycanthrope", "poisoner", "assassin", "imp"], bluffs: ["soldier", "fool", "cannibal"], note: "Verified 10-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["cannibal", "steward", "librarian", "savant", "philosopher", "professor", "mathematician", "acrobat", "pithag", "poisoner", "shabaloth"], bluffs: ["sailor", "gambler", "lycanthrope"], note: "Verified 11-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["librarian", "savant", "philosopher", "professor", "mathematician", "sailor", "gambler", "drunk", "poisoner", "assassin", "imp"], bluffs: ["lycanthrope", "soldier", "fool"], note: "Verified 11-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["steward", "librarian", "savant", "philosopher", "professor", "mathematician", "sailor", "drunk", "lunatic", "poisoner", "assassin", "imp"], bluffs: ["gambler", "lycanthrope", "soldier"], note: "Verified 12-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["savant", "philosopher", "professor", "mathematician", "sailor", "gambler", "lycanthrope", "lunatic", "barber", "assassin", "pithag", "lleech"], bluffs: ["soldier", "fool", "cannibal"], note: "Verified 12-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["professor", "mathematician", "sailor", "gambler", "lycanthrope", "soldier", "fool", "barber", "acrobat", "pithag", "poisoner", "pukka"], bluffs: ["cannibal", "steward", "librarian"], note: "Verified 12-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["librarian", "savant", "philosopher", "professor", "mathematician", "sailor", "gambler", "lycanthrope", "soldier", "assassin", "pithag", "poisoner", "lleech"], bluffs: ["steward", "fool", "cannibal"], note: "Verified 13-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["philosopher", "professor", "mathematician", "sailor", "gambler", "lycanthrope", "soldier", "fool", "cannibal", "pithag", "poisoner", "assassin", "pukka"], bluffs: ["steward", "librarian", "savant"], note: "Verified 13-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["savant", "philosopher", "professor", "mathematician", "sailor", "gambler", "lycanthrope", "soldier", "fool", "barber", "pithag", "poisoner", "assassin", "pukka"], bluffs: ["librarian", "steward", "cannibal"], note: "Verified 14-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["professor", "mathematician", "sailor", "gambler", "lycanthrope", "soldier", "fool", "cannibal", "steward", "acrobat", "poisoner", "assassin", "pithag", "shabaloth"], bluffs: ["librarian", "savant", "philosopher"], note: "Verified 14-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["philosopher", "professor", "mathematician", "sailor", "gambler", "lycanthrope", "soldier", "fool", "cannibal", "acrobat", "drunk", "poisoner", "assassin", "pithag", "shabaloth"], bluffs: ["librarian", "savant", "steward"], note: "Verified 15-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["mathematician", "sailor", "gambler", "lycanthrope", "soldier", "fool", "cannibal", "steward", "librarian", "drunk", "lunatic", "assassin", "pithag", "poisoner", "imp"], bluffs: ["professor", "savant", "philosopher"], note: "Verified 15-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["gambler", "lycanthrope", "soldier", "fool", "cannibal", "steward", "librarian", "savant", "philosopher", "lunatic", "barber", "pithag", "poisoner", "assassin", "lleech"], bluffs: ["professor", "mathematician", "sailor"], note: "Verified 15-player setup. Balloonist and Godfather setup-changing paths stay out of first templates; Pit-Hag, Barber and Demon death chains remain manual reminders." }),
]
