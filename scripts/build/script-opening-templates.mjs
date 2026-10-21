const rotate = (items, seed) => items.length ? [...items.slice(seed % items.length), ...items.slice(0, seed % items.length)] : []
export const specialOpeningRoleIds = new Set(['kazali', 'summoner', 'lordoftyphon', 'legion', 'lilmonsta'])
/** Each proposal uses a reviewed setup fact; the production validators remain authoritative. */
export function openingTemplateSelection(mode, pack, count, seed, choices, context) {
  const { baseCompositionForPlayerCount } = context.load(context.module('src/domain/setup-templates/composition.ts'))
  const base = baseCompositionForPlayerCount(count)
  const pool = team => pack.roles.filter(role => role.team === team).map(role => role.id)
  // Current Marionette jinx delays entry until after a Demon exists; these no-Demon bags do not preassign it.
  const minions = rotate(pool('minion').filter(id => id !== 'summoner' && (!['summoner','lilmonsta'].includes(mode) || id !== 'marionette')), count + seed)
  let evil, facts = [], repeatableRoles, outsiders, bluffCount = 3
  const choice = id => {
    const options = [...(choices.get(id)?.values() ?? [])]
    return options[(count + seed) % options.length]
  }
  if (mode === 'kazali') {
    evil = ['kazali']; outsiders = seed % (pool('outsider').length + 1)
  } else if (mode === 'legion') {
    const legion = Math.floor(count / 2) + 1
    const source = choice('legion')
    if (!source) return null
    evil = Array(legion).fill('legion'); repeatableRoles = ['legion']
    facts = [{ ...source, adjustment: { ...source.adjustment, choiceId:'majority-legion-' + count,
      compositionDelta:{ townsfolk:count-legion-base.townsfolk, outsider:-base.outsider, minion:-base.minion, demon:legion-1 },
      note:'多数玩家为军团；其余为善良镇民，采用三枚伪装方案。' } }]
  } else if (mode === 'lilmonsta') {
    evil = minions.slice(0, base.minion + 1); bluffCount = 0
    if (evil.length !== base.minion + 1) return null
    const rule = { id:'lilmonsta-extra-minion', roleId:'lilmonsta', knowledgeStatus:'confirmed',
      summary:'小怪宝不占玩家座位；移除恶魔并增加一名爪牙。首夜不发送普通爪牙/恶魔信息，不提供恶魔伪装；每晚由爪牙共同选择照看者，照看者保留原角色和阵营。',
      sourceUrls:["https://wiki.bloodontheclocktower.com/Lil%27_Monsta"], reviewedAt:'2026-10-21' }
    facts = [{ rule, sourceId:rule.sourceUrls[0], adjustment:{ ruleId:rule.id, choiceId:'extra-minion-no-demon',
      compositionDelta:{ minion:1, demon:-1 }, note:rule.summary } }]
  } else if (mode === 'summoner') {
    evil = ['summoner', ...minions.slice(0, base.minion - 1)]
    if (evil.length !== base.minion) return null
  } else if (mode === 'lordoftyphon') {
    evil = [...minions.slice(0, base.minion + 1), 'lordoftyphon']
    if (evil.length !== base.minion + 2) return null
  } else {
    const demons = pool('demon').filter(id => !specialOpeningRoleIds.has(id))
    evil = [...minions.slice(0, base.minion), ...rotate(demons, count + Math.floor(seed / 2)).slice(0, 1)]
    if (evil.length !== base.minion + 1) return null
  }
  const { isMandatorySetupCountRole } = context.load(context.module('src/domain/setup-templates/setupCountChanges.ts'))
  for (const id of evil.filter(isMandatorySetupCountRole)) {
    const fact = choice(id)
    if (!fact) return null
    facts.push(fact)
  }
  return { evil, facts, repeatableRoles, outsiders, bluffCount }
}
