import { describe, expect, it } from 'vitest'
import { setupRolesForScript } from '../../catalog'
import { createScriptRegistry } from '../../registry'
import { validateTemplateComposition } from '../../../setup-templates'
import { aGrimmChorusSmartScriptPack } from '.'

const travelerRoleIds = ['thief', 'harlot', 'judge', 'beggar', 'scapegoat']

describe('A Grimm Chorus smart script pack', () => {
  it('registers as a playable TPI Recommended pack with a verified source', () => {
    const registry = createScriptRegistry([aGrimmChorusSmartScriptPack])

    expect(registry.get('a-grimm-chorus')).toBe(aGrimmChorusSmartScriptPack)
    expect(registry.playableFor(12)).toEqual([aGrimmChorusSmartScriptPack])
    expect(aGrimmChorusSmartScriptPack.knowledgeStatus).toBe('confirmed')
    expect(aGrimmChorusSmartScriptPack.source.contentHash).toBe(
      'sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d',
    )
    expect(aGrimmChorusSmartScriptPack.playerCounts).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
  })

  it('keeps role facts confirmed while excluding travellers from standard setup roles', () => {
    expect(aGrimmChorusSmartScriptPack.roles).toHaveLength(30)
    expect(aGrimmChorusSmartScriptPack.roles.every((role) => role.knowledgeStatus === 'confirmed')).toBe(true)

    const byId = new Map(aGrimmChorusSmartScriptPack.roles.map((role) => [role.id, role]))
    expect(travelerRoleIds.map((roleId) => byId.get(roleId)?.team)).toEqual([
      'traveler',
      'traveler',
      'traveler',
      'traveler',
      'traveler',
    ])
    expect(setupRolesForScript('a-grimm-chorus').map((role) => role.id)).not.toEqual(
      expect.arrayContaining(travelerRoleIds),
    )
    expect(byId.get('summoner')?.research?.setupImpact[0]).toContain('开局无恶魔')
    expect(byId.get('yaggababble')?.research?.highRiskNotes[0]).toContain('不能根据聊天自动判断杀人')
    expect(byId.get('damsel')?.research?.highRiskNotes[0]).toContain('胜负必须由说书人确认')
  })

  it('uses the official filtered night sheet order', () => {
    expect(aGrimmChorusSmartScriptPack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual([
      'thief',
      'yaggababble',
      'summoner',
      'godfather',
      'pukka',
      'damsel',
      'amnesiac',
      'villageidiot',
      'nightwatchman',
      'general',
    ])
    expect(aGrimmChorusSmartScriptPack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual([
      'thief',
      'harlot',
      'innkeeper',
      'gambler',
      'scarletwoman',
      'summoner',
      'exorcist',
      'pukka',
      'po',
      'ojo',
      'yaggababble',
      'assassin',
      'godfather',
      'damsel',
      'amnesiac',
      'towncrier',
      'villageidiot',
      'nightwatchman',
      'general',
    ])
  })

  it('provides verified composition-valid templates for every 7-15 player count', () => {
    const checks = aGrimmChorusSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(aGrimmChorusSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(aGrimmChorusSmartScriptPack.setupTemplates.every((template) => template.verified)).toBe(true)
    expect(aGrimmChorusSmartScriptPack.setupTemplates.map((template) => template.playerCount)).toEqual([
      7,
      7,
      7,
      8,
      8,
      9,
      9,
      10,
      10,
      10,
      11,
      11,
      12,
      12,
      12,
      13,
      13,
      14,
      14,
      15,
      15,
      15,
    ])
  })

  it('keeps travellers out of templates and bluffs', () => {
    const roleIds = new Set(aGrimmChorusSmartScriptPack.roles.map((role) => role.id))

    for (const template of aGrimmChorusSmartScriptPack.setupTemplates) {
      const inPlay = new Set(template.roles)
      expect(template.roles).not.toEqual(expect.arrayContaining(travelerRoleIds))
      expect(template.bluffs).toHaveLength(3)
      expect(template.bluffs.every((roleId) => roleIds.has(roleId))).toBe(true)
      expect(template.bluffs).not.toEqual(expect.arrayContaining(travelerRoleIds))
      expect(template.bluffs.every((roleId) => !inPlay.has(roleId))).toBe(true)
    }
  })

  it('marks Summoner and Godfather setup adjustments explicitly', () => {
    const summonerTemplates = aGrimmChorusSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('summoner'),
    )
    const godfatherTemplates = aGrimmChorusSmartScriptPack.setupTemplates.filter((template) =>
      template.roles.includes('godfather'),
    )

    expect(summonerTemplates).toHaveLength(4)
    expect(
      summonerTemplates.every((template) =>
        template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'summoner-no-demon'),
      ),
    ).toBe(true)
    expect(godfatherTemplates.length).toBeGreaterThan(0)
    expect(
      godfatherTemplates.every((template) =>
        template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'godfather-outsider'),
      ),
    ).toBe(true)
    expect(aGrimmChorusSmartScriptPack.setupRules.map((rule) => rule.id)).toEqual([
      'village-idiot-extra',
      'godfather-outsider',
      'summoner-no-demon',
      'damsel-minion-guess',
      'yaggababble-secret-phrase',
      'traveler-template-exclusion',
    ])
  })
})
