import { badMoonRisingRoles } from './role-library/bad-moon-rising/roles'
import { aGrimmChorusRoles } from './role-library/a-grimm-chorus/roles'
import { devoutTheistsRoles } from './role-library/devout-theists/roles'
import { hideAndSeekRoles } from './role-library/hide-and-seek/roles'
import { lunarEclipseRoles } from './role-library/lunar-eclipse/roles'
import { oneInOneOutRoles } from './role-library/one-in-one-out/roles'
import { punchyRoles } from './role-library/punchy/roles'
import { quickMathsRoles } from './role-library/quick-maths/roles'
import { sectsAndVioletsRoles } from './role-library/sects-and-violets/roles'
import { troubleBrewingRoles } from './role-library/trouble-brewing/roles'
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

export function confirmedRoleFactsList(): readonly SmartRoleDefinition[] {
  return [...confirmedRoleFacts.values()]
}

export function confirmedRoleFactsForScript(roleIds: readonly RoleId[]): readonly SmartRoleDefinition[] {
  return roleIds.map((roleId) => {
    const role = confirmedRoleFacts.get(roleId)
    if (!role) throw new Error(`Missing confirmed role fact: ${roleId}`)
    return role
  })
}
