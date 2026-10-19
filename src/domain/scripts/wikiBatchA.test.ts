import { describe, expect, it } from 'vitest'
import { validateTemplateComposition } from '../setup-templates/composition'
import { confirmedRoleFactsForScript } from './role-facts'
import { createScriptRegistry } from './registry'
import type { PlayerCount, SmartScriptPack } from './types'
import { yiGeXueBuSmartScriptPack } from './packs/yi-ge-xue-bu'
import { yeJingGengShenSmartScriptPack } from './packs/ye-jing-geng-shen'
import { shenShiXieMuSmartScriptPack } from './packs/shen-shi-xie-mu'
import { shiYuYuanWeiSmartScriptPack } from './packs/shi-yu-yuan-wei'
import { aoFaJiHuiSmartScriptPack } from './packs/ao-fa-ji-hui'
import { baoMengMiTuanRoles } from './packs/bao-meng-mi-tuan/roles'
import { jingHouJiaYinRoles } from './packs/jing-hou-jia-yin/roles'
import { baoYueChuShengRoles } from './packs/bao-yue-chu-sheng/roles'
import { createSmartScriptSetupCandidates } from '../../features/setup/smartScriptSetupCandidates'
import { smartScriptRegistry } from './catalog'

const packs: readonly SmartScriptPack[] = [yiGeXueBuSmartScriptPack, yeJingGengShenSmartScriptPack,
  shenShiXieMuSmartScriptPack, shiYuYuanWeiSmartScriptPack, aoFaJiHuiSmartScriptPack]
const counts: readonly PlayerCount[] = [7, 8, 9, 10, 11, 12, 13, 14, 15]
const minimumTemplates = [3, 2, 2, 3, 2, 3, 2, 2, 3]

describe('Clocktower Wiki first batch A', () => {
  it('makes every verified template visible through the real candidate and modifier path', () => {
    for (const pack of packs) {
      if (!smartScriptRegistry.get(pack.scriptId)) smartScriptRegistry.register(pack)
      for (const count of counts) {
        const profiles = Array.from({ length: count }, (_v, index) => ({
          seatId: index + 1, experience: (['new', 'regular', 'veteran'] as const)[index % 3],
        }))
        const candidates = createSmartScriptSetupCandidates(pack.scriptId, profiles, { count: 100, seed: 'wiki-batch-a' })
        expect(candidates, `${pack.scriptId}/${count}`).toHaveLength(minimumTemplates[counts.indexOf(count)])
      }
    }
  })
  it('pins five distinct community sources and preserves their raw byte hashes', () => {
    const expected = [
      ['yi-ge-xue-bu', 510, 26, 'd724d38959cb17486da1bb128d4ffcb9d815231d1f5bf3858691da405fdccb58'],
      ['ye-jing-geng-shen', 515, 25, 'a8ffa845e13d613c7fc63e6a29ce415ab8861cc08939214e901118465ca72161'],
      ['shen-shi-xie-mu', 526, 26, 'b5e2c3dc70aff5f7c069bee5a52eeb4cf15b4f7b3e1eca74a8a7a9192edbb2b5'],
      ['shi-yu-yuan-wei', 536, 25, '924f2b54859c84e2fa5bf704162067f12ed683a347ca1da7efe98dd25bc2e5c9'],
      ['ao-fa-ji-hui', 548, 25, 'f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca'],
    ] as const
    const registry = createScriptRegistry(packs)
    for (const [id, index, roleCount, hash] of expected) {
      const pack = registry.get(id)!
      expect(pack.source.url).toBe('https://kkovo550.github.io/clocktower-wiki/')
      expect(pack.source.version).toContain(`index ${index}`)
      expect(pack.source.version).toContain('原库版→2026-10-16 当前官方规则适配')
      expect(pack.source.contentHash).toBe(`sha256:${hash}`)
      expect(pack.roles).toHaveLength(roleCount)
      expect(new Set(pack.roles.map((r) => r.id)).size).toBe(roleCount)
      expect(pack.playerCounts).toEqual(counts)
      expect(pack.knowledgeStatus).toBe('confirmed')
    }
    expect(registry.playableFor(15)).toHaveLength(5)
  })

  it.each(packs)('$scriptId has valid 7–15 player templates and only out-of-play good bluffs', (pack) => {
    const byId = new Map(pack.roles.map((r) => [r.id, r]))
    expect(pack.setupTemplates).toHaveLength(22)
    expect(new Set(pack.setupTemplates.map((t) => t.templateId)).size).toBe(22)
    counts.forEach((count, index) => {
      expect(pack.setupTemplates.filter((t) => t.playerCount === count)).toHaveLength(minimumTemplates[index])
    })
    for (const template of pack.setupTemplates) {
      expect(template.verified, template.templateId).toBe(true)
      expect(template.scriptId).toBe(pack.scriptId)
      expect(template.roles).toHaveLength(template.playerCount)
      expect(new Set(template.roles).size).toBe(template.playerCount)
      expect(validateTemplateComposition(pack, template).valid, template.templateId).toBe(true)
      expect(template.roles.every((id) => ['townsfolk', 'outsider', 'minion', 'demon'].includes(byId.get(id)?.team ?? ''))).toBe(true)
      expect(template.bluffs).toHaveLength(3)
      expect(new Set(template.bluffs).size).toBe(3)
      for (const id of template.bluffs) {
        expect(template.roles).not.toContain(id)
        expect(['townsfolk', 'outsider']).toContain(byId.get(id)?.team)
      }
      for (const adjustment of template.setupAdjustments ?? []) {
        expect(pack.setupRules.some((r) => r.id === adjustment.ruleId), template.templateId).toBe(true)
      }
    }
  })

  it('reuses canonical facts including current Alchemist and the few existing extended-role objects', () => {
    const extendedIds = new Set(['djinn', 'sentinel', 'hatter', 'bountyhunter', 'lilmonsta'])
    for (const pack of packs) for (const role of pack.roles) {
      const extendedPool = role.id === 'hatter' ? jingHouJiaYinRoles : role.id === 'lilmonsta' ? baoYueChuShengRoles : baoMengMiTuanRoles
      const expected = extendedIds.has(role.id) ? extendedPool.find((r) => r.id === role.id) : confirmedRoleFactsForScript([role.id])[0]
      expect(role).toBe(expected)
      expect(role.knowledgeStatus).toBe('confirmed')
      expect(role.inputKinds.length).toBeGreaterThan(0)
      expect(role.research?.sourceUrls.length).toBeGreaterThan(0)
    }
    const alchemist = shenShiXieMuSmartScriptPack.roles.find((r) => r.id === 'alchemist')!
    expect(alchemist.abilityText).toContain('When using this')
    expect(alchemist.abilityText).not.toContain('not-in-play')
  })

  it('keeps current official first-night ordering across early setup, prevention, poisoning and information', () => {
    expect(yiGeXueBuSmartScriptPack.nightOrders.firstNight.map((r) => r.roleId)).toEqual([
      'boffin', 'lunatic', 'sailor', 'courtier', 'godfather', 'devilsadvocate', 'pukka', 'grandmother', 'chambermaid',
    ])
    expect(yeJingGengShenSmartScriptPack.nightOrders.firstNight.map((r) => r.roleId)).toEqual([
      'summoner', 'poisoner', 'pukka', 'pixie', 'librarian', 'empath', 'noble', 'spy',
    ])
    expect(shenShiXieMuSmartScriptPack.nightOrders.firstNight.map((r) => r.roleId)).toEqual([
      'alchemist', 'sailor', 'preacher', 'lleech', 'poisoner', 'courtier', 'devilsadvocate', 'harpy', 'chef',
      'empath', 'fortuneteller', 'seamstress', 'bountyhunter', 'nightwatchman',
    ])
    expect(shiYuYuanWeiSmartScriptPack.nightOrders.firstNight.map((r) => r.roleId)).toEqual([
      'lilmonsta', 'poisoner', 'harpy', 'mezepheles', 'huntsman', 'damsel', 'amnesiac', 'investigator',
      'chef', 'empath', 'fortuneteller', 'general',
    ])
    expect(aoFaJiHuiSmartScriptPack.nightOrders.firstNight.map((r) => r.roleId)).toEqual([
      'boffin', 'sailor', 'poisoner', 'godfather', 'devilsadvocate', 'fortuneteller', 'grandmother', 'noble',
    ])
  })

  it('keeps other-night role creation before Demon actions and follow-up deaths before information', () => {
    expect(yeJingGengShenSmartScriptPack.nightOrders.otherNight.map((r) => r.roleId)).toEqual([
      'poisoner', 'innkeeper', 'monk', 'summoner', 'imp', 'pukka', 'nodashii', 'vortox', 'assassin', 'gossip',
      'farmer', 'tinker', 'empath', 'undertaker', 'spy',
    ])
    expect(yiGeXueBuSmartScriptPack.nightOrders.otherNight.map((r) => r.roleId)).toEqual([
      'sailor', 'courtier', 'innkeeper', 'gambler', 'devilsadvocate', 'lunatic', 'exorcist', 'zombuul', 'pukka',
      'shabaloth', 'po', 'assassin', 'godfather', 'gossip', 'professor', 'tinker', 'moonchild', 'grandmother', 'chambermaid',
    ])
    for (const pack of packs) for (const entries of Object.values(pack.nightOrders)) {
      expect(entries.map((r) => r.order)).toEqual(entries.map((_r, i) => i + 1))
      expect(entries.every((r) => pack.roles.some((role) => role.id === r.roleId))).toBe(true)
    }
  })

  it('counts Summoner as a Minion and adds a Townsfolk instead of a Demon at every count', () => {
    for (const count of counts) {
      const templates = yeJingGengShenSmartScriptPack.setupTemplates.filter((t) => t.playerCount === count)
      const summoner = templates.find((t) => t.roles.includes('summoner'))!
      expect(summoner).toBeTruthy()
      expect(summoner.setupAdjustments).toEqual([expect.objectContaining({
        ruleId: 'summoner-no-demon', compositionDelta: { townsfolk: 1, demon: -1 },
      })])
      const byId = new Map(yeJingGengShenSmartScriptPack.roles.map((r) => [r.id, r]))
      expect(summoner.roles.filter((id) => byId.get(id)?.team === 'demon')).toHaveLength(0)
      expect(summoner.roles.filter((id) => byId.get(id)?.team === 'minion')).toHaveLength(count < 10 ? 1 : count < 13 ? 2 : 3)
    }
    expect(yeJingGengShenSmartScriptPack.setupRules.find((r) => r.roleId === 'summoner')?.summary).toContain('第 2 夜召唤普卡')
  })

  it('requires every forced count modifier and every Huntsman/Damsel pairing', () => {
    for (const pack of packs) for (const template of pack.setupTemplates) {
      for (const [role, rule] of [['godfather', 'godfather-outsiders'], ['baron', 'baron-outsiders'], ['vigormortis', 'vigormortis-outsiders']]) {
        const adjustment = template.setupAdjustments?.find((a) => a.ruleId === rule)
        expect(Boolean(adjustment), `${template.templateId}/${role}`).toBe(template.roles.includes(role))
      }
      if (template.roles.includes('huntsman')) expect(template.roles).toContain('damsel')
      expect(template.roles).not.toContain('lilmonsta')
      expect(template.roles).not.toContain('bountyhunter')
      expect(template.roles).not.toContain('amnesiac')
    }
    expect(shiYuYuanWeiSmartScriptPack.setupTemplates.some((t) => t.roles.includes('huntsman'))).toBe(true)
    expect(shiYuYuanWeiSmartScriptPack.setupTemplates.some((t) => t.roles.includes('baron') && t.roles.includes('vigormortis'))).toBe(true)
    for (const pack of [yiGeXueBuSmartScriptPack, aoFaJiHuiSmartScriptPack]) {
      const choices = new Set(pack.setupTemplates.flatMap((t) => t.setupAdjustments ?? []).map((a) => a.choiceId))
      expect(choices).toContain('add-one-outsider')
      expect(choices).toContain('remove-one-outsider')
    }
  })

  it('retains manual boundaries for fabled rules, Lil Monsta and copied abilities', () => {
    expect(yiGeXueBuSmartScriptPack.setupRules.find((r) => r.roleId === 'djinn')?.summary).toContain('恶魔不能通过此能力变成善良')
    expect(shenShiXieMuSmartScriptPack.setupRules.find((r) => r.roleId === 'sentinel')?.summary).toContain('不占玩家席位')
    expect(shenShiXieMuSmartScriptPack.setupRules.find((r) => r.roleId === 'alchemist')?.summary).toContain('在场或不在场')
    expect(shiYuYuanWeiSmartScriptPack.setupRules.find((r) => r.roleId === 'lilmonsta')?.summary).toContain('无恶魔伪装')
    expect(shenShiXieMuSmartScriptPack.setupRules.find((r) => r.roleId === 'hatter')?.summary).toContain('不能再攻击')
    expect(aoFaJiHuiSmartScriptPack.setupRules.find((r) => r.roleId === 'boffin')?.summary).toContain('额外唤醒')
  })
})
