import type { PlayerCount, RoleId, SetupAdjustment, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'he-fang-jiao-zhong'

const balloonistOutsiderAdjustment = {
  ruleId: 'balloonist-outsider',
  choiceId: 'add-one-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: 'Balloonist: +1 Outsider, usually replacing one Townsfolk.',
} as const

const fangGuOutsiderAdjustment = {
  ruleId: 'fanggu-outsider',
  choiceId: 'add-one-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: 'Fang Gu: +1 Outsider, usually replacing one Townsfolk.',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  balloonist?: boolean
  fanggu?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  const setupAdjustments = adjustmentsFor(input)
  return {
    templateId: `${scriptId}-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: setupAdjustments.length > 0 ? setupAdjustments : undefined,
    notes: [input.note],
    verified: true,
  }
}

function adjustmentsFor(input: TemplateInput): SetupAdjustment[] {
  const adjustments: SetupAdjustment[] = []
  if (input.balloonist) adjustments.push(balloonistOutsiderAdjustment)
  if (input.fanggu) adjustments.push(fangGuOutsiderAdjustment)
  return adjustments
}

export const heFangJiaoZhongSetupTemplates: readonly SetupTemplate[] = [
  template({ id: 'noble-king', count: 7, style: 'beginner', roles: ['noble', 'pixie', 'king', 'choirboy', 'oracle', 'witch', 'nodashii'], bluffs: ['fortuneteller', 'seamstress', 'cannibal'], note: 'King and Choirboy are paired; Noble gives a clean opening anchor.' }),
  template({ id: 'fanggu-outsider', count: 7, style: 'balanced', roles: ['noble', 'fortuneteller', 'savant', 'seamstress', 'recluse', 'cerenovus', 'fanggu'], bluffs: ['king', 'oracle', 'cannibal'], note: 'Fang Gu outsider pressure with a controllable night record.', fanggu: true }),
  template({ id: 'balloonist-core', count: 7, style: 'long-game', roles: ['balloonist', 'king', 'choirboy', 'cannibal', 'mutant', 'fearmonger', 'vortox'], bluffs: ['noble', 'oracle', 'seamstress'], note: 'Balloonist outsider setup plus Vortox false info pressure.', balloonist: true }),
  template({ id: 'oracle-thread', count: 8, style: 'balanced', roles: ['noble', 'pixie', 'fortuneteller', 'oracle', 'seamstress', 'puzzlemaster', 'witch', 'nodashii'], bluffs: ['king', 'choirboy', 'cannibal'], note: 'Oracle and Fortune Teller create death-count and Demon-info lines.' }),
  template({ id: 'balloonist-vortox', count: 8, style: 'chaos', roles: ['balloonist', 'king', 'choirboy', 'savant', 'recluse', 'damsel', 'cerenovus', 'vortox'], bluffs: ['noble', 'oracle', 'seamstress'], note: 'Balloonist with two Outsiders; Vortox makes information handling sharp.', balloonist: true }),
  template({ id: 'cult-social', count: 9, style: 'balanced', roles: ['noble', 'cultleader', 'oracle', 'seamstress', 'cannibal', 'mutant', 'recluse', 'goblin', 'nodashii'], bluffs: ['pixie', 'fortuneteller', 'king'], note: 'Cult Leader and Goblin increase day-table pressure.' }),
  template({ id: 'fanggu-three-outsiders', count: 9, style: 'chaos', roles: ['noble', 'king', 'choirboy', 'savant', 'damsel', 'mutant', 'puzzlemaster', 'fearmonger', 'fanggu'], bluffs: ['pixie', 'oracle', 'seamstress'], note: 'Fang Gu with three Outsiders; strong jump tension for a longer game.', fanggu: true }),
  template({ id: 'ten-info', count: 10, style: 'beginner', roles: ['noble', 'pixie', 'fortuneteller', 'oracle', 'cultleader', 'seamstress', 'cannibal', 'witch', 'cerenovus', 'nodashii'], bluffs: ['king', 'choirboy', 'savant'], note: 'Ten-player information core with Witch and Cerenovus pressure.' }),
  template({ id: 'ten-king-vortox', count: 10, style: 'long-game', roles: ['noble', 'king', 'choirboy', 'savant', 'seamstress', 'lycanthrope', 'oracle', 'fearmonger', 'goblin', 'vortox'], bluffs: ['pixie', 'fortuneteller', 'cannibal'], note: 'King, Choirboy, Lycanthrope and Vortox require careful storyteller notes.' }),
  template({ id: 'ten-fanggu', count: 10, style: 'balanced', roles: ['pixie', 'fortuneteller', 'oracle', 'cultleader', 'seamstress', 'cannibal', 'recluse', 'witch', 'goblin', 'fanggu'], bluffs: ['noble', 'king', 'choirboy'], note: 'Fang Gu adjustment with enough misinformation for both teams.', fanggu: true }),
  template({ id: 'eleven-choirboy', count: 11, style: 'balanced', roles: ['noble', 'pixie', 'king', 'choirboy', 'oracle', 'seamstress', 'savant', 'mutant', 'witch', 'cerenovus', 'nodashii'], bluffs: ['fortuneteller', 'cultleader', 'cannibal'], note: 'Full King and Choirboy pair; good for practicing death-source records.' }),
  template({ id: 'eleven-social', count: 11, style: 'chaos', roles: ['pixie', 'fortuneteller', 'cultleader', 'lycanthrope', 'savant', 'seamstress', 'cannibal', 'puzzlemaster', 'fearmonger', 'goblin', 'vortox'], bluffs: ['noble', 'king', 'oracle'], note: 'High social pressure; Vortox and Puzzlemaster sharpen true/false info.' }),
  template({ id: 'twelve-balanced', count: 12, style: 'balanced', roles: ['noble', 'pixie', 'fortuneteller', 'oracle', 'cultleader', 'seamstress', 'cannibal', 'mutant', 'recluse', 'witch', 'cerenovus', 'nodashii'], bluffs: ['king', 'choirboy', 'savant'], note: 'Balanced twelve-player template with information, madness and registration.' }),
  template({ id: 'twelve-fanggu', count: 12, style: 'long-game', roles: ['king', 'choirboy', 'lycanthrope', 'savant', 'seamstress', 'cannibal', 'damsel', 'recluse', 'puzzlemaster', 'fearmonger', 'goblin', 'fanggu'], bluffs: ['noble', 'pixie', 'oracle'], note: 'Fang Gu plus three Outsiders; long-game jump pressure.', fanggu: true }),
  template({ id: 'twelve-balloonist', count: 12, style: 'chaos', roles: ['noble', 'balloonist', 'oracle', 'cultleader', 'seamstress', 'cannibal', 'damsel', 'mutant', 'recluse', 'witch', 'cerenovus', 'vortox'], bluffs: ['pixie', 'king', 'choirboy'], note: 'Balloonist with three Outsiders and Vortox false-info reminders.', balloonist: true }),
  template({ id: 'thirteen-full-info', count: 13, style: 'balanced', roles: ['noble', 'pixie', 'fortuneteller', 'king', 'choirboy', 'oracle', 'cultleader', 'lycanthrope', 'savant', 'witch', 'cerenovus', 'fearmonger', 'nodashii'], bluffs: ['seamstress', 'cannibal', 'balloonist'], note: 'Thirteen-player no-outsider pressure with three Minions.' }),
  template({ id: 'thirteen-fanggu', count: 13, style: 'chaos', roles: ['noble', 'pixie', 'fortuneteller', 'king', 'choirboy', 'oracle', 'savant', 'cannibal', 'recluse', 'witch', 'cerenovus', 'goblin', 'fanggu'], bluffs: ['cultleader', 'lycanthrope', 'seamstress'], note: 'Large Fang Gu setup with one Outsider and strong chase pressure.', fanggu: true }),
  template({ id: 'fourteen-vortox', count: 14, style: 'balanced', roles: ['noble', 'pixie', 'fortuneteller', 'king', 'choirboy', 'oracle', 'cultleader', 'seamstress', 'cannibal', 'mutant', 'witch', 'cerenovus', 'fearmonger', 'vortox'], bluffs: ['balloonist', 'lycanthrope', 'savant'], note: 'Large Vortox game with King line and false-info line together.' }),
  template({ id: 'fourteen-balloonist', count: 14, style: 'long-game', roles: ['noble', 'pixie', 'balloonist', 'oracle', 'lycanthrope', 'savant', 'seamstress', 'cannibal', 'damsel', 'puzzlemaster', 'witch', 'fearmonger', 'goblin', 'nodashii'], bluffs: ['fortuneteller', 'king', 'choirboy'], note: 'Balloonist with two Outsiders; No Dashii poison coexists with info chains.', balloonist: true }),
  template({ id: 'fifteen-balanced', count: 15, style: 'balanced', roles: ['noble', 'pixie', 'fortuneteller', 'king', 'choirboy', 'oracle', 'cultleader', 'seamstress', 'cannibal', 'mutant', 'recluse', 'witch', 'cerenovus', 'fearmonger', 'nodashii'], bluffs: ['balloonist', 'lycanthrope', 'savant'], note: 'Stable fifteen-player setup with King, Choirboy, Oracle and No Dashii.' }),
  template({ id: 'fifteen-chaos', count: 15, style: 'chaos', roles: ['noble', 'pixie', 'fortuneteller', 'oracle', 'cultleader', 'lycanthrope', 'savant', 'seamstress', 'cannibal', 'damsel', 'puzzlemaster', 'witch', 'cerenovus', 'goblin', 'vortox'], bluffs: ['king', 'choirboy', 'balloonist'], note: 'Fifteen-player Vortox chaos with Lycanthrope and Puzzlemaster checks.' }),
  template({ id: 'fifteen-fanggu', count: 15, style: 'long-game', roles: ['noble', 'pixie', 'oracle', 'cultleader', 'lycanthrope', 'savant', 'seamstress', 'cannibal', 'damsel', 'recluse', 'puzzlemaster', 'witch', 'fearmonger', 'goblin', 'fanggu'], bluffs: ['fortuneteller', 'king', 'choirboy'], note: 'Fifteen-player Fang Gu long game with three Outsiders.', fanggu: true }),
]
