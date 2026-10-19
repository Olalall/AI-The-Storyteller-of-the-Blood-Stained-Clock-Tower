import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createSetupRulePackForScript, createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { evaluateSetupRules } from '../../features/setup/setupRuleEvaluator'
import type { SetupTeam } from '../../features/setup/types'
import { validateTemplateComposition } from '../setup-templates/composition'
import { smartScriptPacks } from './allPacks'
import { muHouCaoKongSmartScriptPack } from './packs/mu-hou-cao-kong'
import { yiZhiDuXiuSmartScriptPack } from './packs/yi-zhi-du-xiu'
import { meiYuLianZhuSmartScriptPack } from './packs/mei-yu-lian-zhu'
import { tongXiaoDaDanSmartScriptPack } from './packs/tong-xiao-da-dan'
import { douShiQiYuanLaoHuaDengRoles } from './packs/dou-shi-qi-yuan-lao-hua-deng/roles'
import { xinKouCiHuangRoles } from './packs/xin-kou-ci-huang/roles'
import { buildScriptQualitySummary } from './quality'
import { confirmedRoleFactsForScript } from './role-facts'
import type { SmartScriptPack } from './types'

const packs: readonly SmartScriptPack[] = [muHouCaoKongSmartScriptPack, yiZhiDuXiuSmartScriptPack,
  meiYuLianZhuSmartScriptPack, tongXiaoDaDanSmartScriptPack]
const counts = [7, 8, 9, 10, 11, 12, 13, 14, 15]
const minimum = [3, 2, 2, 3, 2, 3, 2, 2, 3]
const extraIds = ['lordoftyphon', 'king', 'djinn']
const expectedHashes = [
  'b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da',
  '1bf0a20cfcc8800bc41edb1bb36f6899795ec5d610528df9e115aa6d222316c2',
  'b684e45ffcb9df260e7bafd4a6a520350e49dac7ed83230d7702408a025075dd',
  'fee2ffdb6f3d8d6b403038c3de9deee923570bde3c9dc4207136cecbb86bcdf9',
]
const expectedNights = [
  ['marionette poisoner washerwoman librarian investigator chef empath fortuneteller butler spy',
    'poisoner monk scarletwoman imp ravenkeeper empath fortuneteller undertaker butler spy'],
  ['lordoftyphon marionette poisoner harpy pixie amnesiac chef butler balloonist shugenja spy general mathematician',
    'poisoner innkeeper harpy scarletwoman legion lordoftyphon vigormortis amnesiac ravenkeeper flowergirl balloonist butler spy general mathematician'],
  ['marionette cerenovus mezepheles pixie librarian chef empath dreamer noble spy highpriestess',
    'monk cerenovus mezepheles legion nodashii vortox vigormortis empath dreamer oracle juggler spy highpriestess'],
  ['magician lunatic king marionette widow fortuneteller butler dreamer seamstress steward knight mathematician',
    'monk scarletwoman lunatic legion imp nodashii vortox sweetheart sage fortuneteller dreamer seamstress king butler mathematician'],
]

function file(pack: SmartScriptPack, name: string) {
  return readFileSync(resolve('src/domain/scripts/packs', pack.scriptId, name))
}

describe('clocktower-wiki batch B source and legal setup regression', () => {
  for (const [index, pack] of packs.entries()) {
    it(`${pack.scriptId} locks the actual embedded bytes and explicit stable aliases`, () => {
      const raw = file(pack, 'source.json')
      const hash = createHash('sha256').update(raw).digest('hex')
      const source = JSON.parse(raw.toString())
      const lock = JSON.parse(file(pack, 'source-lock.json').toString())
      expect(hash).toBe(expectedHashes[index])
      expect(pack.source.contentHash).toBe(`sha256:${hash}`)
      expect(lock.rawJsonByteLength).toBe(raw.length)
      expect(lock.rawJsonSha256).toBe(hash)
      expect(lock.sourceBuild).toBe('16ad8f7c270dfc011aeb9fc412950304b68293fc5269c882c32b2e037fc5073e')
      expect(lock.roleAliases.map((row: { roleId: string }) => row.roleId)).toEqual(pack.roles.map((role) => role.id))
      for (const [roleIndex, role] of pack.roles.entries()) {
        const alias = lock.roleAliases[roleIndex]
        const sourceRole = source[roleIndex + 1]
        expect(alias.rawId).toBe(sourceRole.id)
        expect(alias.rawTeam).toBe(role.team)
        expect(alias.officialTeam).toBe(role.team)
        expect(alias.rawAbilitySha256).toBe(createHash('sha256').update(sourceRole.ability).digest('hex'))
        expect(alias.officialAbility).toBeTruthy()
      }
    })

    it(`${pack.scriptId} reuses verified base objects rather than copying source role abilities`, () => {
      for (const role of pack.roles.filter((candidate) => !extraIds.includes(candidate.id))) {
        expect(role).toBe(confirmedRoleFactsForScript([role.id])[0])
      }
      expect(buildScriptQualitySummary(pack).readiness).toBe('ready')
      expect(new Set(pack.roles.map((role) => role.id)).size).toBe(pack.roles.length)
    })

    it(`${pack.scriptId} keeps 2026-10-16 official first and other night order`, () => {
      expect(pack.nightOrders.firstNight.map((entry) => entry.roleId)).toEqual(expectedNights[index][0].split(' '))
      expect(pack.nightOrders.otherNight.map((entry) => entry.roleId)).toEqual(expectedNights[index][1].split(' '))
      for (const order of Object.values(pack.nightOrders)) {
        expect(order.map((entry) => entry.order)).toEqual(order.map((_entry, orderIndex) => orderIndex + 1))
        expect(order.every((entry) => entry.note?.includes('官方夜表原始顺位'))).toBe(true)
      }
    })

    it(`${pack.scriptId} covers every supported count with distinct verified legal templates`, () => {
      expect(pack.playerCounts).toEqual(counts)
      expect(pack.setupTemplates).toHaveLength(22)
      for (const [countIndex, count] of counts.entries()) {
        const templates = pack.setupTemplates.filter((template) => template.playerCount === count)
        expect(templates).toHaveLength(minimum[countIndex])
        expect(new Set(templates.map((template) => JSON.stringify(template.roles))).size).toBe(templates.length)
      }
      const roles = new Map(pack.roles.map((role) => [role.id, role]))
      for (const template of pack.setupTemplates) {
        expect(template.verified, template.templateId).toBe(true)
        expect(template.roles, template.templateId).toHaveLength(template.playerCount)
        expect(validateTemplateComposition(pack, template).problems, template.templateId).toEqual([])
        expect(template.bluffs, template.templateId).toHaveLength(3)
        expect(new Set(template.bluffs).size, template.templateId).toBe(3)
        for (const bluff of template.bluffs) {
          expect(template.roles, template.templateId).not.toContain(bluff)
          expect(['townsfolk', 'outsider'], template.templateId).toContain(roles.get(bluff)?.team)
        }
        for (const roleId of template.roles) {
          expect(['townsfolk', 'outsider', 'minion', 'demon'], template.templateId).toContain(roles.get(roleId)?.team)
          if (template.roles.filter((id) => id === roleId).length > 1) expect(template.repeatableRoles).toContain(roleId)
        }
      }
    })

    it(`${pack.scriptId} keeps hidden identities adjacent and Legion genuinely in the majority`, () => {
      const roleById = new Map(pack.roles.map((role) => [role.id, role]))
      for (const template of pack.setupTemplates) {
        const lord = template.roles.indexOf('lordoftyphon')
        const marionette = template.roles.indexOf('marionette')
        if (lord >= 0) {
          const evil = template.roles.flatMap((id, seat) => ['minion', 'demon'].includes(roleById.get(id)!.team) ? [seat] : [])
          expect(evil.at(-1)! - evil[0] + 1).toBe(evil.length)
          expect(evil.indexOf(lord)).toBeGreaterThan(0)
          expect(evil.indexOf(lord)).toBeLessThan(evil.length - 1)
        }
        if (marionette >= 0) {
          const size = template.roles.length
          const neighbors = [(marionette + size - 1) % size, (marionette + 1) % size]
          expect(neighbors.some((seat) => roleById.get(template.roles[seat])?.team === 'demon')).toBe(true)
        }
        if (template.roles.includes('legion')) {
          expect(template.roles.filter((id) => id === 'legion').length).toBeGreaterThan(template.playerCount / 2)
          expect(template.roles.filter((id) => roleById.get(id)?.team === 'minion')).toEqual([])
          expect(template.setupAdjustments?.some((adjustment) => adjustment.ruleId === 'legion-majority')).toBe(true)
        }
      }
    })

    it(`${pack.scriptId} passes the actual production rule-pack and evaluator for all special templates`, () => {
      const rulePack = createSetupRulePackForScript(pack)
      const roleById = new Map(pack.roles.map((role) => [role.id, role]))
      const snapshot = (id: string) => ({ id, name: roleById.get(id)!.name, initial: id[0], iconPath: '' })
      const teamForRole = Object.fromEntries(pack.roles.map((role) => [role.id, role.team])) as Record<string, SetupTeam>
      for (const template of pack.setupTemplates) {
        const expectedSeatIds = Array.from({ length: template.playerCount }, (_value, index) => index + 1)
        const report = evaluateSetupRules({
          assignments: template.roles.map((id, seat) => ({ seatId: seat + 1, role: snapshot(id) })),
          demonBluffs: template.bluffs.map(snapshot), expectedSeatIds, playerCount: template.playerCount,
          rulePack, teamForRole, repeatableRoleIds: template.repeatableRoles,
          selections: template.setupAdjustments?.map((adjustment) => ({ ruleId: adjustment.ruleId, choiceId: adjustment.choiceId! })),
        })
        expect(report.checks.filter((check) => !check.passed), template.templateId).toEqual([])
        expect(report.actualCounts, template.templateId).toEqual(report.expectedCounts)
      }
    })

    it(`${pack.scriptId} returns every template through production candidate generation`, () => {
      const roleById = new Map(pack.roles.map((role) => [role.id, role]))
      for (const [countIndex, count] of counts.entries()) {
        for (const mixedExperience of [false, true]) {
          const profiles = Array.from({ length: count }, (_value, seat) => ({
            seatId: seat + 1,
            experience: mixedExperience ? (['new', 'regular', 'veteran'] as const)[seat % 3] : 'regular' as const,
          }))
          const candidates = createSmartScriptSetupCandidates(pack.scriptId, profiles, { count: 99, random: () => 0.5 })
          expect(candidates, `${pack.scriptId}/${count}/${mixedExperience}`).toHaveLength(minimum[countIndex])
          for (const candidate of candidates) {
            expect(candidate.legalityChecks.filter((check) => !check.passed), candidate.id).toEqual([])
            const roles = candidate.assignments.map((assignment) => assignment.role.id)
            if (roles.includes('legion')) {
              expect(roles.filter((id) => id === 'legion').length, candidate.id).toBeGreaterThan(count / 2)
              expect(candidate.repeatableRoleIds, candidate.id).toContain('legion')
            }
            const lord = roles.indexOf('lordoftyphon')
            if (lord >= 0) {
              const evil = roles.flatMap((id, seat) => ['minion', 'demon'].includes(roleById.get(id)!.team) ? [seat] : [])
              const doubled = [...evil, ...evil.map((seat) => seat + count)]
              const consecutive = doubled.some((_seat, start) => {
                const line = doubled.slice(start, start + evil.length)
                if (line.length !== evil.length || line.at(-1)! - line[0] + 1 !== evil.length) return false
                const normalizedLord = lord < line[0] ? lord + count : lord
                return line.indexOf(normalizedLord) > 0 && line.indexOf(normalizedLord) < line.length - 1
              })
              expect(consecutive, candidate.id).toBe(true)
            }
            const marionette = roles.indexOf('marionette')
            if (marionette >= 0) {
              const neighbors = [(marionette + count - 1) % count, (marionette + 1) % count]
              expect(neighbors.some((seat) => roleById.get(roles[seat])?.team === 'demon'), candidate.id).toBe(true)
            }
          }
        }
      }
    })
  }

  it('maps the two nonstandard source IDs by confirmed ability and team', () => {
    const puppet = JSON.parse(file(packs[0], 'source-lock.json').toString()).roleAliases
      .find((row: { rawId: string }) => row.rawId === 'zheyeshigejiugui111')
    const noble = JSON.parse(file(packs[2], 'source-lock.json').toString()).roleAliases
      .find((row: { rawId: string }) => row.rawId === 'jingcaisanxuanyi111')
    expect(puppet).toMatchObject({ roleId: 'marionette', officialTeam: 'minion', officialName: 'Marionette' })
    expect(noble).toMatchObject({ roleId: 'noble', officialTeam: 'townsfolk', officialName: 'Noble' })
  })

  it('reuses current King, Djinn and Lord of Typhon without touching old packs', () => {
    const reused = [
      [packs[1], 'lordoftyphon', xinKouCiHuangRoles],
      [packs[3], 'king', douShiQiYuanLaoHuaDengRoles],
      [packs[3], 'djinn', douShiQiYuanLaoHuaDengRoles],
    ] as const
    for (const [pack, id, source] of reused) {
      const role = pack.roles.find((candidate) => candidate.id === id)
      expect(role).toBeTruthy()
      expect(role).toBe(source.find((candidate) => candidate.id === id))
    }
    expect(packs[3].roles.find((role) => role.id === 'king')?.abilityText).toContain('大于或等于')
    expect(packs[3].roles.find((role) => role.id === 'king')?.inputKinds).toEqual(['role'])
    expect(packs[3].roles.find((role) => role.id === 'djinn')?.team).toBe('fabled')
  })

  it('locks v1.2.0 source instead of silently mixing the v1.3 image roster', () => {
    expect(packs[2].displayName).toBe('魅语连珠 / v1.2.0')
    expect(packs[2].source.version).toContain('v1.2.0')
    expect(packs[2].setupRules.find((rule) => rule.id === 'source-version-1-2-0')?.summary).toContain('配图名称写 v1.3')
  })

  it('does not lose source-listed or current official jinxes in the new combinations', () => {
    expect(packs[1].setupRules.map((rule) => rule.id)).toEqual(expect.arrayContaining([
      'cannibal-butler-jinx', 'mathematician-hidden-good-jinx', 'balloonist-outsider',
    ]))
    expect(packs[3].setupRules.map((rule) => rule.id)).toEqual(expect.arrayContaining([
      'magician-legion-jinx', 'magician-marionette-jinx', 'magician-widow-jinx',
      'cannibal-butler-jinx', 'mathematician-lunatic-marionette-jinx', 'recluse-sage-jinx',
    ]))
  })

  it('keeps the Atheist script deferred until no-evil and zero-bluff setup is supported', () => {
    expect(smartScriptPacks.some((pack) => pack.scriptId === 'wu-xing-da-chu')).toBe(false)
  })
})
