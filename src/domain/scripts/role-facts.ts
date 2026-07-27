import { badMoonRisingRoles } from './packs/bad-moon-rising/roles'
import { aGrimmChorusRoles } from './packs/a-grimm-chorus/roles'
import { devoutTheistsRoles } from './packs/devout-theists/roles'
import { hideAndSeekRoles } from './packs/hide-and-seek/roles'
import { lunarEclipseRoles } from './packs/lunar-eclipse/roles'
import { oneInOneOutRoles } from './packs/one-in-one-out/roles'
import { punchyRoles } from './packs/punchy/roles'
import { quickMathsRoles } from './packs/quick-maths/roles'
import { sectsAndVioletsRoles } from './packs/sects-and-violets/roles'
import { troubleBrewingRoles } from './packs/trouble-brewing/roles'
import type { RoleId, SmartRoleDefinition } from './types'

const confirmedRoleFacts = new Map<RoleId, SmartRoleDefinition>()

for (const role of [
  ...oneInOneOutRoles,
  ...aGrimmChorusRoles,
  ...hideAndSeekRoles,
  ...lunarEclipseRoles,
  ...punchyRoles,
  ...quickMathsRoles,
  ...devoutTheistsRoles,
  ...troubleBrewingRoles,
  ...badMoonRisingRoles,
  ...sectsAndVioletsRoles,
]) {
  confirmedRoleFacts.set(role.id, role)
}

export function confirmedRoleFactsForScript(roleIds: readonly RoleId[]): readonly SmartRoleDefinition[] {
  return roleIds.map((roleId) => {
    const role = confirmedRoleFacts.get(roleId)
    if (!role) throw new Error(`Missing confirmed role fact: ${roleId}`)
    return role
  })
}
