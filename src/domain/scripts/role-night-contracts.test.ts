import { describe, expect, it } from 'vitest'
import officialNightSheet from '../../features/night-workbench/data/official/nightsheet.json' with { type: 'json' }
import { normalizeRoleId, smartScriptPacks } from './catalog'

const lycanthropeTargetPacks = [
  'gai-tou-huan-mian',
  'hu-du-zhi-zheng',
  'tou-tian-huan-ri',
  'wei-ni-du-zun',
  'wen-wu-shuang-quan',
] as const

const organGrinderPacks = [
  'chuan-qi-zhi-ye',
  'xin-ren-shi-lian',
  'yi-chu-hao-xi-lao-hua-deng',
  'yu-zhe-huan-yan',
] as const

function nightNote(entry: { roleId: string; note?: string }): string {
  return entry.note ?? ''
}

describe('role, night-order and AI research contracts', () => {
  it('wakes every Organ Grinder on both night types with a player-owned boolean choice', () => {
    for (const scriptId of organGrinderPacks) {
      const pack = smartScriptPacks.find((candidate) => candidate.scriptId === scriptId)
      const role = pack?.roles.find((candidate) => ['organgrinder', 'organ_grinder'].includes(candidate.id))
      const firstEntries = pack?.nightOrders.firstNight.filter((entry) => ['organgrinder', 'organ_grinder'].includes(entry.roleId)) ?? []
      const otherEntries = pack?.nightOrders.otherNight.filter((entry) => ['organgrinder', 'organ_grinder'].includes(entry.roleId)) ?? []

      expect(role?.inputKinds, scriptId).toContain('boolean')
      expect(firstEntries, scriptId).toHaveLength(1)
      expect(otherEntries, scriptId).toHaveLength(1)
      expect(firstEntries[0].note, scriptId).toContain('只记录选择，不自动改变醉酒状态')
      expect(otherEntries[0].note, scriptId).toContain('只记录选择，不自动改变醉酒状态')

      for (const [nightType, entries] of [
        ['firstNight', pack?.nightOrders.firstNight ?? []],
        ['otherNight', pack?.nightOrders.otherNight ?? []],
      ] as const) {
        const officialOrder = new Map(officialNightSheet[nightType].map((roleId, index) => [roleId, index]))
        const organIndex = entries.findIndex((entry) => normalizeRoleId(entry.roleId) === 'organgrinder')
        const organOrder = officialOrder.get('organgrinder')
        if (organOrder === undefined) throw new Error('official Organ Grinder order is missing')
        entries.forEach((entry, index) => {
          const candidateOrder = officialOrder.get(normalizeRoleId(entry.roleId))
          if (candidateOrder === undefined || index === organIndex) return
          if (candidateOrder < organOrder) expect(index, `${scriptId}/${nightType}/${entry.roleId}`).toBeLessThan(organIndex)
          if (candidateOrder > organOrder) expect(index, `${scriptId}/${nightType}/${entry.roleId}`).toBeGreaterThan(organIndex)
        })
      }
    }
  })

  it('marks every first-night Damsel entry as a sensitive sequential Minion notice', () => {
    for (const pack of smartScriptPacks) {
      const entries = pack.nightOrders.firstNight.filter((entry) => entry.roleId === 'damsel')
      for (const entry of entries) {
        expect(entry.delivery?.kind, pack.scriptId).toBe('audience_notice')
        expect(entry.delivery?.audience.team, pack.scriptId).toBe('minion')
        expect(entry.delivery?.audience.excludeRoleIds, pack.scriptId).toContain('marionette')
        expect(entry.delivery?.mode, pack.scriptId).toBe('sequential')
        expect(entry.delivery?.sensitive, pack.scriptId).toBe(true)
      }
    }
  })

  it('requires a player target for every repaired Lycanthrope definition', () => {
    for (const scriptId of lycanthropeTargetPacks) {
      const pack = smartScriptPacks.find((candidate) => candidate.scriptId === scriptId)
      const role = pack?.roles.find((candidate) => candidate.id === 'lycanthrope')

      expect(role?.inputKinds, scriptId).toContain('player')
    }
  })

  it('requires a player target for every Exorcist and Devil\'s Advocate definition', () => {
    for (const pack of smartScriptPacks) {
      for (const roleId of ['exorcist', 'devilsadvocate']) {
        const role = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === roleId)
        if (role) expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('player')
      }
    }
  })

  it('normalizes the four delayed-effect roles before building their dynamic night contracts', () => {
    for (const pack of smartScriptPacks) {
      for (const roleId of ['pukka', 'yanluo', 'po']) {
        const role = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === roleId)
        if (role) expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toEqual(['player'])
      }
      const shabaloth = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === 'shabaloth')
      if (shabaloth) expect(shabaloth.inputKinds, `${pack.scriptId}/shabaloth`).toEqual(['players'])
    }
  })

  it('normalizes recurring night target metadata that imported packs often leave as none', () => {
    const oneTargetRoles = [
      'godfather',
      'imp',
      'poisoner',
      'snakecharmer',
      'vortox',
      'assassin',
      'ravenkeeper',
      'widow',
      'fanggu',
      'nodashii',
    ]
    const multiTargetRoles = [
      'seamstress',
      'fortuneteller',
      'barber',
      'noble',
      'alhadikhia',
      'dianyuzhang',
      'taotie',
      'wan_jun_zhi_li',
      'zhi_shi_fen_zi',
    ]
    const playerAndRoleRoles = ['gambler', 'cerenovus', 'pithag']
    const playersAndRoleRoles = ['investigator', 'librarian', 'washerwoman']

    for (const pack of smartScriptPacks) {
      for (const roleId of oneTargetRoles) {
        const role = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === roleId)
        if (role) expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('player')
      }
      for (const roleId of multiTargetRoles) {
        const role = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === roleId)
        if (role) expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('players')
      }
      for (const roleId of playerAndRoleRoles) {
        const role = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === roleId)
        if (role) {
          expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('player')
          expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('role')
        }
      }
      for (const roleId of playersAndRoleRoles) {
        const role = pack.roles.find((candidate) => normalizeRoleId(candidate.id) === roleId)
        if (role) {
          expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('players')
          expect(role.inputKinds, `${pack.scriptId}/${roleId}`).toContain('role')
        }
      }
    }
  })

  it('does not retain the obsolete Lycanthrope all-deaths suppression rule', () => {
    for (const pack of smartScriptPacks) {
      const notes = [
        ...pack.nightOrders.firstNight.map(nightNote),
        ...pack.nightOrders.otherNight.map(nightNote),
        ...pack.roles.flatMap((role) => role.research?.highRiskNotes ?? []),
      ]
      expect(notes.join('\n'), pack.scriptId).not.toContain('今夜不会再有玩家死亡')
    }
  })

  it('uses the current Balloonist previous-night contract in every night note', () => {
    for (const pack of smartScriptPacks) {
      const notes = [
        ...pack.nightOrders.firstNight,
        ...pack.nightOrders.otherNight,
      ].filter((entry) => entry.roleId === 'balloonist').map(nightNote)

      for (const note of notes) {
        expect(note, pack.scriptId).not.toContain('尚未被气球驾驶员知晓')
        expect(note, pack.scriptId).not.toContain('所有类型均已被知晓')
      }
    }
  })

  it('includes the equality boundary in every conditional King wake note', () => {
    for (const pack of smartScriptPacks) {
      const notes = pack.nightOrders.otherNight
        .filter((entry) => entry.roleId === 'king')
        .map(nightNote)

      for (const note of notes.filter((value) => value.includes('死亡玩家人数'))) {
        expect(note, pack.scriptId).toContain('大于或等于存活玩家')
      }
    }
  })

  it('resolves Al-Hadikhia after each choice and only wipes all three if all survive', () => {
    const pack = smartScriptPacks.find((candidate) => candidate.scriptId === 'bing-gong-ban-shi')
    const entry = pack?.nightOrders.otherNight.find((candidate) => candidate.roleId === 'alhadikhia')
    const note = entry ? nightNote(entry) : ''
    const research = pack?.roles.find((role) => role.id === 'alhadikhia')?.research?.highRiskNotes.join('\n') ?? ''

    expect(note).toContain('每次选择立即结算')
    expect(note).toContain('三次结算后三人全部存活')
    expect(`${note}\n${research}`).not.toContain('若所有玩家都选择存活')
  })

  it('keeps the Butler exile exception visible when a pack overrides the shared prompt', () => {
    for (const pack of smartScriptPacks) {
      const entries = [
        ...pack.nightOrders.firstNight,
        ...pack.nightOrders.otherNight,
      ].filter((entry) => entry.roleId === 'butler' && nightNote(entry))

      for (const entry of entries) {
        expect(nightNote(entry), pack.scriptId).toContain('流放表决不受主人限制')
      }
    }
  })
})
