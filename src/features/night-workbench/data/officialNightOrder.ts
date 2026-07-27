import nightsheet from './official/nightsheet.json'
import roleIndex from './official/role-index.json'
import type { NightOrderListItem, NightType } from '../types'

const roles = new Map(roleIndex.map((role) => [role.id, role]))

const systemSteps: Record<string, { name: string; initial: string }> = {
  dusk: { name: 'Dusk', initial: '暮' },
  dawn: { name: 'Dawn', initial: '晨' },
  minioninfo: { name: 'Minion Info', initial: '爪' },
  demoninfo: { name: 'Demon Info', initial: '魔' },
}

export function getOfficialNightOrder(nightType: NightType): NightOrderListItem[] {
  const ids = nightType === 'first' ? nightsheet.firstNight : nightsheet.otherNight

  return ids.map((roleId, index) => {
    const role = roles.get(roleId)
    const systemStep = systemSteps[roleId]
    const roleName = role?.name ?? systemStep?.name ?? roleId

    return {
      id: `official-${nightType}-${roleId}`,
      kind: 'reference',
      orderIndex: index + 1,
      roleId,
      roleName,
      roleInitial: systemStep?.initial ?? roleName.slice(0, 1).toUpperCase(),
      iconPath: role ? `/assets/characters/${roleId}.webp` : undefined,
      phaseMarker: Boolean(systemStep),
    }
  })
}
