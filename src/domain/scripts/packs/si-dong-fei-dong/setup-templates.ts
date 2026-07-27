import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'si-dong-fei-dong'

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

export const siDongFeiDongSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "seven-po-safe", count: 7, style: "beginner", roles: ["chef", "savant", "exorcist", "innkeeper", "mathematician", "harpy", "po"], bluffs: ["oracle", "virgin", "fisherman"], note: "Po with safety and misinformation anchors; no setup modifiers." }),
  template({ id: "seven-ojo-info", count: 7, style: "balanced", roles: ["knight", "chef", "gambler", "oracle", "fisherman", "mastermind", "ojo"], bluffs: ["savant", "exorcist", "virgin"], note: "Ojo with simple information spread and Mastermind day pressure." }),
  template({ id: "seven-pukka-death", count: 7, style: "long-game", roles: ["savant", "innkeeper", "gossip", "mathematician", "virgin", "scarletwoman", "pukka"], bluffs: ["chef", "oracle", "fisherman"], note: "Pukka delayed death needs careful notes but setup is stable." }),
  template({ id: "eight-tinker", count: 8, style: "balanced", roles: ["chef", "savant", "exorcist", "gambler", "oracle", "tinker", "harpy", "po"], bluffs: ["knight", "virgin", "fisherman"], note: "Tinker adds death uncertainty while Harpy adds day pressure." }),
  template({ id: "eight-barber-ojo", count: 8, style: "chaos", roles: ["knight", "innkeeper", "gossip", "mathematician", "virgin", "barber", "mastermind", "ojo"], bluffs: ["chef", "savant", "oracle"], note: "Barber swap risk and Ojo role-targeted kill create logic traps." }),
  template({ id: "nine-moonchild", count: 9, style: "balanced", roles: ["chef", "savant", "exorcist", "gambler", "oracle", "tinker", "moonchild", "harpy", "pukka"], bluffs: ["knight", "mathematician", "fisherman"], note: "Moonchild and Pukka both make death source important." }),
  template({ id: "nine-puzzle", count: 9, style: "long-game", roles: ["knight", "innkeeper", "gossip", "mathematician", "virgin", "puzzlemaster", "barber", "scarletwoman", "po"], bluffs: ["chef", "savant", "oracle"], note: "Puzzlemaster and Barber create hidden-state pressure." }),
  template({ id: "ten-po-core", count: 10, style: "balanced", roles: ["knight", "chef", "savant", "exorcist", "innkeeper", "gambler", "oracle", "harpy", "mastermind", "po"], bluffs: ["gossip", "virgin", "fisherman"], note: "Ten-player no-outsider structure with Po and two Minions." }),
  template({ id: "ten-ojo-safe", count: 10, style: "beginner", roles: ["chef", "savant", "exorcist", "innkeeper", "mathematician", "virgin", "fisherman", "harpy", "scarletwoman", "ojo"], bluffs: ["knight", "gambler", "oracle"], note: "Ojo role targeting with strong Townsfolk discussion anchors." }),
  template({ id: "ten-pukka-chaos", count: 10, style: "chaos", roles: ["knight", "chef", "gossip", "gambler", "oracle", "virgin", "fisherman", "harpy", "mastermind", "pukka"], bluffs: ["savant", "exorcist", "mathematician"], note: "Pukka poison chain plus Mastermind day tension." }),
  template({ id: "eleven-tinker", count: 11, style: "balanced", roles: ["knight", "chef", "savant", "exorcist", "innkeeper", "mathematician", "oracle", "tinker", "harpy", "scarletwoman", "po"], bluffs: ["gossip", "gambler", "fisherman"], note: "Tinker death uncertainty with a clean information core." }),
  template({ id: "eleven-barber", count: 11, style: "chaos", roles: ["chef", "savant", "gossip", "gambler", "virgin", "fisherman", "oracle", "barber", "harpy", "mastermind", "ojo"], bluffs: ["knight", "exorcist", "innkeeper"], note: "Barber and Mastermind create strong day/night logic traps." }),
  template({ id: "twelve-balanced", count: 12, style: "balanced", roles: ["knight", "chef", "savant", "exorcist", "innkeeper", "mathematician", "oracle", "tinker", "puzzlemaster", "harpy", "scarletwoman", "po"], bluffs: ["gossip", "gambler", "fisherman"], note: "Balanced twelve-player setup without setup-count modifiers." }),
  template({ id: "twelve-pukka-moon", count: 12, style: "long-game", roles: ["chef", "savant", "innkeeper", "gossip", "gambler", "virgin", "fisherman", "moonchild", "barber", "harpy", "mastermind", "pukka"], bluffs: ["knight", "exorcist", "oracle"], note: "Pukka, Moonchild and Barber require good death-source notes." }),
  template({ id: "twelve-ojo-social", count: 12, style: "chaos", roles: ["knight", "chef", "exorcist", "innkeeper", "mathematician", "oracle", "fisherman", "tinker", "moonchild", "harpy", "mastermind", "ojo"], bluffs: ["savant", "gossip", "virgin"], note: "Ojo plus Moonchild encourages discussion around why deaths happened." }),
  template({ id: "thirteen-po-info", count: 13, style: "balanced", roles: ["knight", "chef", "savant", "exorcist", "innkeeper", "gossip", "mathematician", "gambler", "oracle", "harpy", "mastermind", "scarletwoman", "po"], bluffs: ["virgin", "fisherman", "puzzlemaster"], note: "Thirteen-player no-outsider setup with Po and three Minions." }),
  template({ id: "thirteen-ojo-safe", count: 13, style: "chaos", roles: ["knight", "chef", "savant", "innkeeper", "gossip", "mathematician", "virgin", "fisherman", "oracle", "harpy", "mastermind", "scarletwoman", "ojo"], bluffs: ["exorcist", "gambler", "puzzlemaster"], note: "Ojo creates role-targeted kill uncertainty with a full evil team." }),
  template({ id: "fourteen-tinker", count: 14, style: "balanced", roles: ["knight", "chef", "savant", "exorcist", "innkeeper", "gossip", "mathematician", "gambler", "oracle", "tinker", "harpy", "mastermind", "scarletwoman", "pukka"], bluffs: ["virgin", "fisherman", "puzzlemaster"], note: "Fourteen-player Pukka setup with Tinker and three Minions." }),
  template({ id: "fourteen-barber-ojo", count: 14, style: "long-game", roles: ["chef", "savant", "exorcist", "innkeeper", "gossip", "mathematician", "virgin", "fisherman", "oracle", "barber", "harpy", "mastermind", "scarletwoman", "ojo"], bluffs: ["knight", "gambler", "puzzlemaster"], note: "Barber swap threat plus Ojo role deaths for a long social game." }),
  template({ id: "fifteen-balanced-po", count: 15, style: "balanced", roles: ["knight", "chef", "savant", "exorcist", "innkeeper", "gossip", "mathematician", "gambler", "oracle", "tinker", "puzzlemaster", "harpy", "mastermind", "scarletwoman", "po"], bluffs: ["virgin", "fisherman", "barber"], note: "Fifteen-player Po game with two Outsiders and three Minions." }),
  template({ id: "fifteen-pukka-barber", count: 15, style: "chaos", roles: ["knight", "chef", "savant", "innkeeper", "gossip", "mathematician", "virgin", "fisherman", "oracle", "moonchild", "barber", "harpy", "mastermind", "scarletwoman", "pukka"], bluffs: ["exorcist", "gambler", "puzzlemaster"], note: "Pukka with Moonchild and Barber puts pressure on death-source logging." }),
  template({ id: "fifteen-ojo-long", count: 15, style: "long-game", roles: ["chef", "savant", "exorcist", "innkeeper", "gossip", "mathematician", "gambler", "oracle", "fisherman", "tinker", "puzzlemaster", "harpy", "mastermind", "scarletwoman", "ojo"], bluffs: ["knight", "virgin", "barber"], note: "Ojo long-game template with stable info and two Outsiders." }),
]
