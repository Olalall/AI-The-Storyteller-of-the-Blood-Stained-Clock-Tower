import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "xin-kou-ci-huang"

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

export const xinKouCiHuangSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["philosopher", "slayer", "nightwatchman", "courtier", "banshee", "scarletwoman", "ojo"], bluffs: ["farmer", "grandmother", "dreamer"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["nightwatchman", "courtier", "banshee", "farmer", "grandmother", "psychopath", "yaggababble"], bluffs: ["dreamer", "undertaker", "lycanthrope"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["banshee", "farmer", "grandmother", "dreamer", "undertaker", "poisoner", "ojo"], bluffs: ["lycanthrope", "gossip", "virgin"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["slayer", "nightwatchman", "courtier", "banshee", "farmer", "hatter", "psychopath", "yaggababble"], bluffs: ["grandmother", "dreamer", "undertaker"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["courtier", "banshee", "farmer", "grandmother", "dreamer", "tinker", "poisoner", "ojo"], bluffs: ["undertaker", "lycanthrope", "gossip"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["nightwatchman", "courtier", "banshee", "farmer", "grandmother", "tinker", "mutant", "poisoner", "ojo"], bluffs: ["dreamer", "undertaker", "lycanthrope"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["banshee", "farmer", "grandmother", "dreamer", "undertaker", "mutant", "golem", "scarletwoman", "yaggababble"], bluffs: ["lycanthrope", "gossip", "virgin"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["courtier", "banshee", "farmer", "grandmother", "dreamer", "undertaker", "lycanthrope", "scarletwoman", "psychopath", "yaggababble"], bluffs: ["gossip", "virgin", "cannibal"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["farmer", "grandmother", "dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "psychopath", "poisoner", "ojo"], bluffs: ["cannibal", "philosopher", "slayer"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "poisoner", "scarletwoman", "yaggababble"], bluffs: ["slayer", "nightwatchman", "courtier"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["banshee", "farmer", "grandmother", "dreamer", "undertaker", "lycanthrope", "gossip", "golem", "psychopath", "poisoner", "ojo"], bluffs: ["virgin", "cannibal", "philosopher"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["grandmother", "dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "hatter", "poisoner", "scarletwoman", "yaggababble"], bluffs: ["philosopher", "slayer", "nightwatchman"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["farmer", "grandmother", "dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "hatter", "tinker", "poisoner", "scarletwoman", "yaggababble"], bluffs: ["cannibal", "philosopher", "slayer"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "tinker", "mutant", "scarletwoman", "psychopath", "ojo"], bluffs: ["slayer", "nightwatchman", "courtier"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "slayer", "nightwatchman", "mutant", "golem", "psychopath", "poisoner", "yaggababble"], bluffs: ["courtier", "banshee", "farmer"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["grandmother", "dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "slayer", "scarletwoman", "psychopath", "poisoner", "ojo"], bluffs: ["nightwatchman", "courtier", "banshee"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "slayer", "nightwatchman", "courtier", "psychopath", "poisoner", "scarletwoman", "yaggababble"], bluffs: ["banshee", "farmer", "grandmother"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["dreamer", "undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "slayer", "nightwatchman", "mutant", "psychopath", "poisoner", "scarletwoman", "yaggababble"], bluffs: ["courtier", "banshee", "farmer"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "slayer", "nightwatchman", "courtier", "banshee", "golem", "poisoner", "scarletwoman", "psychopath", "ojo"], bluffs: ["farmer", "grandmother", "dreamer"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["undertaker", "lycanthrope", "gossip", "virgin", "cannibal", "philosopher", "slayer", "nightwatchman", "courtier", "golem", "hatter", "poisoner", "scarletwoman", "psychopath", "ojo"], bluffs: ["banshee", "farmer", "grandmother"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["gossip", "virgin", "cannibal", "philosopher", "slayer", "nightwatchman", "courtier", "banshee", "farmer", "hatter", "tinker", "scarletwoman", "psychopath", "poisoner", "yaggababble"], bluffs: ["grandmother", "dreamer", "undertaker"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["cannibal", "philosopher", "slayer", "nightwatchman", "courtier", "banshee", "farmer", "grandmother", "dreamer", "tinker", "mutant", "psychopath", "poisoner", "scarletwoman", "ojo"], bluffs: ["undertaker", "lycanthrope", "gossip"], note: "Verified setup. Boffin/Lord of Typhon/Kazali setup-changing paths stay out of first templates; Banshee, Hatter and Demon outcomes remain manual reminders." }),
]
