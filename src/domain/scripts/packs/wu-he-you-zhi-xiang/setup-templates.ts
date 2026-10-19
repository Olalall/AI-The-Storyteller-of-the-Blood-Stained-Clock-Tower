import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'wu-he-you-zhi-xiang'

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

export const wuHeYouZhiXiangSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "seven-ojo-clear", count: 7, style: "beginner", roles: ["pixie", "poppygrower", "seamstress", "oracle", "shugenja", "poisoner", "ojo"], bluffs: ["cannibal", "farmer", "highpriestess"], note: "Simple Ojo kill line with distributed good information." }),
  template({ id: "seven-kazali-social", count: 7, style: "balanced", roles: ["cannibal", "juggler", "philosopher", "savant", "monk", "poppygrower", "kazali"], bluffs: ["pixie", "oracle", "shugenja"], note: "卡扎力 7 人开局：初始袋子只有卡扎力与善良角色；首夜选择 1 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "seven-poppy-hidden", count: 7, style: "long-game", roles: ["pixie", "poppygrower", "farmer", "oracle", "highpriestess", "spy", "ojo"], bluffs: ["seamstress", "monk", "shugenja"], note: "Poppy Grower hides evil recognition while Spy gives evil counterplay." }),
  template({ id: "eight-politician", count: 8, style: "balanced", roles: ["cannibal", "pixie", "juggler", "seamstress", "savant", "politician", "poisoner", "ojo"], bluffs: ["farmer", "monk", "highpriestess"], note: "Politician adds endgame tension while Poisoner destabilizes information." }),
  template({ id: "eight-hatter-kazali", count: 8, style: "chaos", roles: ["poppygrower", "philosopher", "monk", "oracle", "shugenja", "hatter", "cannibal", "kazali"], bluffs: ["pixie", "seamstress", "savant"], note: "卡扎力 8 人开局：初始袋子只有卡扎力与善良角色；首夜选择 1 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "nine-drunk-info", count: 9, style: "balanced", roles: ["cannibal", "pixie", "juggler", "seamstress", "oracle", "drunk", "plaguedoctor", "harpy", "ojo"], bluffs: ["poppygrower", "monk", "shugenja"], note: "Drunk and Plague Doctor add hidden noise without removing all info anchors." }),
  template({ id: "nine-hatter-spy", count: 9, style: "chaos", roles: ["poppygrower", "farmer", "philosopher", "savant", "highpriestess", "hatter", "politician", "cannibal", "kazali"], bluffs: ["pixie", "seamstress", "oracle"], note: "卡扎力 9 人开局：初始袋子只有卡扎力与善良角色；首夜选择 1 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "ten-clean-kazali", count: 10, style: "balanced", roles: ["cannibal", "pixie", "poppygrower", "juggler", "seamstress", "savant", "shugenja", "philosopher", "highpriestess", "kazali"], bluffs: ["farmer", "monk", "oracle"], note: "卡扎力 10 人开局：初始袋子只有卡扎力与善良角色；首夜选择 2 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "ten-ojo-madness", count: 10, style: "chaos", roles: ["pixie", "farmer", "philosopher", "monk", "oracle", "highpriestess", "villageidiot", "harpy", "mezepheles", "ojo"], bluffs: ["cannibal", "seamstress", "savant"], note: "Harpy and Mezepheles raise day-expression pressure." }),
  template({ id: "ten-poppy-spy", count: 10, style: "long-game", roles: ["cannibal", "poppygrower", "juggler", "seamstress", "savant", "oracle", "shugenja", "spy", "poisoner", "ojo"], bluffs: ["pixie", "farmer", "monk"], note: "Poppy Grower delays evil recognition; Spy compensates with visibility." }),
  template({ id: "eleven-hatter", count: 11, style: "balanced", roles: ["cannibal", "pixie", "poppygrower", "farmer", "juggler", "seamstress", "savant", "hatter", "scarletwoman", "harpy", "ojo"], bluffs: ["philosopher", "oracle", "shugenja"], note: "Hatter change window and Scarlet Woman demon-continuity pressure." }),
  template({ id: "eleven-kazali-politician", count: 11, style: "chaos", roles: ["pixie", "philosopher", "monk", "oracle", "highpriestess", "villageidiot", "shugenja", "politician", "poppygrower", "juggler", "kazali"], bluffs: ["cannibal", "farmer", "seamstress"], note: "卡扎力 11 人开局：初始袋子只有卡扎力与善良角色；首夜选择 2 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "twelve-balanced-ojo", count: 12, style: "balanced", roles: ["cannibal", "pixie", "poppygrower", "juggler", "seamstress", "savant", "oracle", "hatter", "drunk", "scarletwoman", "poisoner", "ojo"], bluffs: ["farmer", "monk", "shugenja"], note: "Balanced twelve-player setup with Drunk, poison and Hatter tracking." }),
  template({ id: "twelve-kazali-plague", count: 12, style: "long-game", roles: ["pixie", "farmer", "philosopher", "monk", "highpriestess", "villageidiot", "shugenja", "politician", "plaguedoctor", "poppygrower", "juggler", "kazali"], bluffs: ["cannibal", "seamstress", "oracle"], note: "卡扎力 12 人开局：初始袋子只有卡扎力与善良角色；首夜选择 2 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "twelve-social", count: 12, style: "chaos", roles: ["cannibal", "poppygrower", "juggler", "seamstress", "savant", "oracle", "shugenja", "hatter", "politician", "spy", "harpy", "ojo"], bluffs: ["pixie", "farmer", "monk"], note: "Spy and Harpy push social pressure while Politician adds endgame tension." }),
  template({ id: "thirteen-poppy-kazali", count: 13, style: "balanced", roles: ["cannibal", "pixie", "poppygrower", "farmer", "juggler", "philosopher", "seamstress", "savant", "oracle", "villageidiot", "politician", "hatter", "kazali"], bluffs: ["monk", "highpriestess", "shugenja"], note: "卡扎力 13 人开局：初始袋子只有卡扎力与善良角色；首夜选择 3 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "thirteen-ojo-harpy", count: 13, style: "chaos", roles: ["pixie", "poppygrower", "farmer", "juggler", "monk", "oracle", "highpriestess", "villageidiot", "shugenja", "spy", "harpy", "poisoner", "ojo"], bluffs: ["cannibal", "philosopher", "seamstress"], note: "Ojo with Harpy and Poisoner needs careful night notes." }),
  template({ id: "fourteen-balanced", count: 14, style: "balanced", roles: ["cannibal", "pixie", "poppygrower", "farmer", "juggler", "philosopher", "seamstress", "savant", "oracle", "hatter", "scarletwoman", "spy", "poisoner", "ojo"], bluffs: ["monk", "highpriestess", "shugenja"], note: "Stable fourteen-player setup with Hatter and Spy counterplay." }),
  template({ id: "fourteen-kazali-meze", count: 14, style: "long-game", roles: ["pixie", "poppygrower", "farmer", "juggler", "seamstress", "monk", "oracle", "highpriestess", "shugenja", "politician", "villageidiot", "hatter", "plaguedoctor", "kazali"], bluffs: ["cannibal", "philosopher", "savant"], note: "卡扎力 14 人开局：初始袋子只有卡扎力与善良角色；首夜选择 3 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "fifteen-balanced-ojo", count: 15, style: "balanced", roles: ["cannibal", "pixie", "poppygrower", "farmer", "juggler", "philosopher", "seamstress", "savant", "monk", "hatter", "plaguedoctor", "scarletwoman", "spy", "poisoner", "ojo"], bluffs: ["oracle", "highpriestess", "shugenja"], note: "Fifteen-player balanced setup with Plague Doctor and Hatter variables." }),
  template({ id: "fifteen-kazali-chaos", count: 15, style: "chaos", roles: ["pixie", "poppygrower", "farmer", "juggler", "seamstress", "savant", "oracle", "highpriestess", "villageidiot", "politician", "drunk", "shugenja", "hatter", "plaguedoctor", "kazali"], bluffs: ["cannibal", "philosopher", "monk"], note: "卡扎力 15 人开局：初始袋子只有卡扎力与善良角色；首夜选择 3 组玩家与不同爪牙，模板不预定人选。" }),
  template({ id: "fifteen-long-game", count: 15, style: "long-game", roles: ["cannibal", "pixie", "poppygrower", "farmer", "philosopher", "seamstress", "savant", "monk", "shugenja", "hatter", "plaguedoctor", "scarletwoman", "poisoner", "mezepheles", "ojo"], bluffs: ["juggler", "oracle", "highpriestess"], note: "Long-game setup where death source and evil continuity matter." }),
]
