import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "bing-gong-ban-shi"

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

export const bingGongBanShiSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["professor", "wudaozhe", "tealady", "pacifist", "alchemist", "psychopath", "taowu"], bluffs: ["investigator", "grandmother", "pixie"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["tealady", "pacifist", "alchemist", "poppygrower", "cannibal", "pithag", "alhadikhia"], bluffs: ["investigator", "grandmother", "pixie"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["alchemist", "poppygrower", "cannibal", "investigator", "grandmother", "vizier", "imp"], bluffs: ["pixie", "qianke", "general"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["wudaozhe", "tealady", "pacifist", "alchemist", "poppygrower", "nichen", "vizier", "imp"], bluffs: ["investigator", "grandmother", "pixie"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["pacifist", "alchemist", "poppygrower", "cannibal", "investigator", "drunk", "psychopath", "taowu"], bluffs: ["grandmother", "pixie", "qianke"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["tealady", "pacifist", "alchemist", "poppygrower", "cannibal", "damsel", "drunk", "pithag", "alhadikhia"], bluffs: ["investigator", "grandmother", "pixie"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["alchemist", "poppygrower", "cannibal", "investigator", "grandmother", "lunatic", "moonchild", "vizier", "imp"], bluffs: ["pixie", "qianke", "general"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["pacifist", "alchemist", "poppygrower", "cannibal", "investigator", "grandmother", "pixie", "psychopath", "vizier", "taowu"], bluffs: ["qianke", "general", "gambler"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["poppygrower", "cannibal", "investigator", "grandmother", "pixie", "qianke", "general", "pithag", "psychopath", "alhadikhia"], bluffs: ["gambler", "jinyiwei", "professor"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["investigator", "grandmother", "pixie", "qianke", "general", "gambler", "jinyiwei", "vizier", "pithag", "imp"], bluffs: ["professor", "wudaozhe", "tealady"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["alchemist", "poppygrower", "cannibal", "investigator", "grandmother", "pixie", "qianke", "lunatic", "vizier", "pithag", "imp"], bluffs: ["general", "gambler", "jinyiwei"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["cannibal", "investigator", "grandmother", "pixie", "qianke", "general", "gambler", "nichen", "psychopath", "vizier", "taowu"], bluffs: ["jinyiwei", "professor", "wudaozhe"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["poppygrower", "cannibal", "investigator", "grandmother", "pixie", "qianke", "general", "moonchild", "nichen", "pithag", "psychopath", "alhadikhia"], bluffs: ["gambler", "jinyiwei", "professor"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["investigator", "grandmother", "pixie", "qianke", "general", "gambler", "jinyiwei", "damsel", "drunk", "vizier", "pithag", "imp"], bluffs: ["professor", "wudaozhe", "tealady"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["pixie", "qianke", "general", "gambler", "jinyiwei", "professor", "wudaozhe", "lunatic", "moonchild", "psychopath", "vizier", "taowu"], bluffs: ["investigator", "grandmother", "tealady"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["cannibal", "investigator", "grandmother", "pixie", "qianke", "general", "gambler", "jinyiwei", "professor", "psychopath", "vizier", "pithag", "taowu"], bluffs: ["wudaozhe", "tealady", "pacifist"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["grandmother", "pixie", "qianke", "general", "gambler", "jinyiwei", "professor", "wudaozhe", "tealady", "pithag", "psychopath", "vizier", "alhadikhia"], bluffs: ["investigator", "pacifist", "alchemist"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["investigator", "grandmother", "pixie", "qianke", "general", "gambler", "jinyiwei", "professor", "wudaozhe", "damsel", "vizier", "pithag", "psychopath", "imp"], bluffs: ["tealady", "pacifist", "alchemist"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["pixie", "qianke", "general", "gambler", "jinyiwei", "professor", "wudaozhe", "tealady", "pacifist", "lunatic", "psychopath", "vizier", "pithag", "taowu"], bluffs: ["investigator", "grandmother", "alchemist"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["grandmother", "pixie", "qianke", "general", "gambler", "jinyiwei", "professor", "wudaozhe", "tealady", "drunk", "lunatic", "pithag", "psychopath", "vizier", "alhadikhia"], bluffs: ["investigator", "pacifist", "alchemist"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["qianke", "general", "gambler", "jinyiwei", "professor", "wudaozhe", "tealady", "pacifist", "alchemist", "moonchild", "nichen", "vizier", "pithag", "psychopath", "imp"], bluffs: ["investigator", "grandmother", "pixie"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["gambler", "jinyiwei", "professor", "wudaozhe", "tealady", "pacifist", "alchemist", "poppygrower", "cannibal", "damsel", "drunk", "psychopath", "vizier", "pithag", "taowu"], bluffs: ["investigator", "grandmother", "pixie"], note: "Verified seating mix. Death, madness, identity changes and outsider modifiers remain Storyteller-confirmed." }),
]
