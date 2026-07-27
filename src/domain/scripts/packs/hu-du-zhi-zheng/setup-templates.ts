import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = "hu-du-zhi-zheng"

const lilMonstaAdjustment = {
  ruleId: 'hu-du-zhi-zheng-lilmonsta-reminder',
  compositionDelta: { minion: 1, demon: -1 },
  choiceId: 'lil-monsta-no-demon-player',
  note: 'Lil Monsta setup: no Demon player and +1 Minion.',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `${scriptId}-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: [lilMonstaAdjustment],
    notes: [input.note],
    verified: true,
  }
}

export const huDuZhiZhengSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "steady", count: 7, style: "balanced", roles: ["towncrier", "gossip", "mayor", "cannibal", "soldier", "assassin", "gudiao"], bluffs: ["yinyangshi", "grandmother", "preacher"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 7, style: "long-game", roles: ["mayor", "cannibal", "soldier", "chef", "yinyangshi", "gudiao", "witch"], bluffs: ["cultleader", "lycanthrope", "flowergirl"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "pressure", count: 7, style: "chaos", roles: ["soldier", "chef", "yinyangshi", "grandmother", "preacher", "witch", "spy"], bluffs: ["towncrier", "gossip", "mayor"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 8, style: "balanced", roles: ["gossip", "mayor", "cannibal", "soldier", "chef", "saint", "gudiao", "witch"], bluffs: ["yinyangshi", "grandmother", "preacher"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 8, style: "long-game", roles: ["cannibal", "soldier", "chef", "yinyangshi", "grandmother", "klutz", "witch", "spy"], bluffs: ["cultleader", "lycanthrope", "flowergirl"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 9, style: "balanced", roles: ["mayor", "cannibal", "soldier", "chef", "yinyangshi", "klutz", "politician", "witch", "spy"], bluffs: ["grandmother", "preacher", "cultleader"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 9, style: "long-game", roles: ["soldier", "chef", "yinyangshi", "grandmother", "preacher", "politician", "barber", "spy", "assassin"], bluffs: ["cultleader", "lycanthrope", "flowergirl"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 10, style: "balanced", roles: ["cannibal", "soldier", "chef", "yinyangshi", "grandmother", "preacher", "cultleader", "spy", "assassin", "gudiao"], bluffs: ["lycanthrope", "flowergirl", "towncrier"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 10, style: "long-game", roles: ["chef", "yinyangshi", "grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "assassin", "gudiao", "witch"], bluffs: ["towncrier", "gossip", "mayor"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "pressure", count: 10, style: "chaos", roles: ["grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "gudiao", "witch", "spy"], bluffs: ["mayor", "cannibal", "soldier"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 11, style: "balanced", roles: ["soldier", "chef", "yinyangshi", "grandmother", "preacher", "cultleader", "lycanthrope", "barber", "assassin", "gudiao", "witch"], bluffs: ["flowergirl", "towncrier", "gossip"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 11, style: "long-game", roles: ["yinyangshi", "grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "snitch", "gudiao", "witch", "spy"], bluffs: ["gossip", "mayor", "cannibal"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 12, style: "balanced", roles: ["chef", "yinyangshi", "grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "snitch", "drunk", "gudiao", "witch", "spy"], bluffs: ["towncrier", "gossip", "mayor"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 12, style: "long-game", roles: ["grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "drunk", "saint", "witch", "spy", "assassin"], bluffs: ["mayor", "cannibal", "soldier"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "pressure", count: 12, style: "chaos", roles: ["cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "cannibal", "saint", "klutz", "spy", "assassin", "gudiao"], bluffs: ["soldier", "chef", "yinyangshi"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 13, style: "balanced", roles: ["yinyangshi", "grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "witch", "spy", "assassin", "gudiao"], bluffs: ["chef", "cannibal", "soldier"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 13, style: "long-game", roles: ["preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "cannibal", "soldier", "spy", "assassin", "gudiao", "witch"], bluffs: ["chef", "yinyangshi", "grandmother"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 14, style: "balanced", roles: ["grandmother", "preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "cannibal", "saint", "spy", "assassin", "gudiao", "witch"], bluffs: ["yinyangshi", "chef", "soldier"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 14, style: "long-game", roles: ["cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "cannibal", "soldier", "chef", "klutz", "assassin", "gudiao", "witch", "spy"], bluffs: ["yinyangshi", "grandmother", "preacher"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "steady", count: 15, style: "balanced", roles: ["preacher", "cultleader", "lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "cannibal", "soldier", "klutz", "politician", "assassin", "gudiao", "witch", "spy"], bluffs: ["yinyangshi", "grandmother", "chef"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "long", count: 15, style: "long-game", roles: ["lycanthrope", "flowergirl", "towncrier", "gossip", "mayor", "cannibal", "soldier", "chef", "yinyangshi", "politician", "barber", "gudiao", "witch", "spy", "assassin"], bluffs: ["cultleader", "grandmother", "preacher"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
  template({ id: "pressure", count: 15, style: "chaos", roles: ["towncrier", "gossip", "mayor", "cannibal", "soldier", "chef", "yinyangshi", "grandmother", "preacher", "barber", "snitch", "witch", "spy", "assassin", "gudiao"], bluffs: ["cultleader", "lycanthrope", "flowergirl"], note: "Verified Lil Monsta setup: no Demon player, +1 Minion. Storyteller manually assigns babysitter and deaths." }),
]
