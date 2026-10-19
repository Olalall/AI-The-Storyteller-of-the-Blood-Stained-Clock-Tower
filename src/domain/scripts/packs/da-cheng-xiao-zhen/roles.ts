import { confirmedRoleFactsForScript } from '../../role-facts'

export const daChengXiaoZhenRoleIds = ["noble", "librarian", "pixie", "general", "fortuneteller", "monk", "oracle", "seamstress", "philosopher", "magician", "ravenkeeper", "cannibal", "mayor", "drunk", "recluse", "lunatic", "politician", "godfather", "cerenovus", "mezepheles", "marionette", "imp", "vigormortis"] as const

export const daChengXiaoZhenRoles = confirmedRoleFactsForScript(daChengXiaoZhenRoleIds)
