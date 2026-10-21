import { confirmedRoleFactsForScript } from '../../role-facts'

export const muHouCaoKongRoleIds = ["washerwoman", "librarian", "investigator", "chef", "empath", "fortuneteller", "undertaker", "monk", "ravenkeeper", "virgin", "slayer", "soldier", "mayor", "butler", "drunk", "recluse", "saint", "marionette", "poisoner", "spy", "scarletwoman", "baron", "imp"] as const

export const muHouCaoKongRoles = confirmedRoleFactsForScript(muHouCaoKongRoleIds)
