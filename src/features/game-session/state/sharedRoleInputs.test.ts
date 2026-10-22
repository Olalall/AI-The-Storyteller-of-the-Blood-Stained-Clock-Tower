import { describe, expect, it } from 'vitest'
import { smartScriptRegistry, roleSnapshotsForScript, roleTeamByIdForScript } from '../../../domain/scripts'
import { createSmartScriptSetupSession } from '../data/createPrototypeSession'
import { createSmartScriptNightQueue } from './createNextNightRun'
import { projectCurrentPlayerStates } from './projectors'
import { roleInputsSatisfied, emptyWakeDraft } from '../../night-workbench/state/projectWakeDraft'
import { projectNightInteraction } from '../../night-workbench/state/projectNightInteraction'

function wake(scriptId: string, roleId: string, first = true) {
  const session = createSmartScriptSetupSession(scriptId, '2026-10-22T00:00:00Z', { playerCount: 13 })
  const role = roleSnapshotsForScript(scriptId).find(r => r.id === roleId)!
  return createSmartScriptNightQueue(session, [{ seatId: 1, role }], projectCurrentPlayerStates(session), 'shared-contract', first ? 1 : 2).find(i => i.roleId === roleId)!
}

describe('shared character input contracts across every registered script', () => {
  it.each(['grandmother', 'ravenkeeper', 'clockmaker', 'shugenja', 'general', 'summoner'])('%s has the same typed input regardless of source language', roleId => {
    const packs = smartScriptRegistry.all().filter(p => p.roles.some(r => r.id === roleId))
    expect(packs.length).toBeGreaterThan(0)
    for (const pack of packs) {
      const item = wake(pack.scriptId, roleId, roleId !== 'ravenkeeper')
      expect(item, pack.scriptId).toBeDefined()
      if (roleId === 'grandmother' || roleId === 'ravenkeeper') {
        expect(item.targetCount, pack.scriptId).toBe(1)
        expect(item.roleChoices?.length, pack.scriptId).toBeGreaterThan(0)
        expect(item.outcomeOptions.find(o => o.id === 'record')?.requiredInputs, pack.scriptId).toEqual(expect.arrayContaining(['targets', 'role']))
      } else if (roleId === 'summoner') {
        expect(item.targetCount, pack.scriptId).toBe(0)
        expect(item.roleCount, pack.scriptId).toBe(3)
        const ids = item.roleChoices!.slice(0, 3).map(r => r.id)
        expect(roleInputsSatisfied(item, { ...emptyWakeDraft(), roleChoice: ids[0] })).toBe(false)
        expect(roleInputsSatisfied(item, { ...emptyWakeDraft(), roleChoice: ids[0], secondRoleChoice: ids[1], additionalRoleChoices: [ids[2]] })).toBe(true)
        expect(wake(pack.scriptId, roleId, false).roleChoices?.every(r => roleTeamByIdForScript(pack.scriptId)[r.id] === 'demon')).toBe(true)
      } else if (roleId === 'clockmaker') expect(item.informationInput?.kind, pack.scriptId).toBe('number')
      else expect(item.outcomeOptions.filter(o => !['skip', 'hold'].includes(o.id)), pack.scriptId).toHaveLength(roleId === 'general' ? 3 : 2)
    }
  })
  it.each(['philosopher', 'alchemist', 'boffin', 'cerenovus', 'pixie'])('%s restricts role choices, preserving legal Goblin and impairment exceptions', roleId => {
    for (const pack of smartScriptRegistry.all().filter(p => p.roles.some(r => r.id === roleId))) {
      const item = wake(pack.scriptId, roleId)
      expect(item?.roleChoices?.length, pack.scriptId).toBeGreaterThan(0)
      const teams = roleTeamByIdForScript(pack.scriptId)
      const allowed = roleId === 'alchemist' ? ['minion'] : roleId === 'pixie' ? ['townsfolk'] : ['townsfolk', 'outsider']
      expect(item.roleChoices?.every(r => allowed.includes(teams[r.id]) || roleId === 'cerenovus' && r.id === 'goblin'), pack.scriptId).toBe(true)
      if (roleId === 'pixie') expect(projectNightInteraction(item, pack.scriptId, { nightType: 'first', playerCount: 13, status: { ...item.status, impairments: ['poisoned'] } }).roleChoices?.length).toBe(roleSnapshotsForScript(pack.scriptId).length)
    }
  })
})
