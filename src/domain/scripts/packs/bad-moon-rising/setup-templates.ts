import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'bad-moon-rising'
const godfatherAddOutsiderAdjustment = {
  ruleId: 'godfather-outsider',
  choiceId: 'add-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '教父：+1 外来者，通常替换 1 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  godfatherAddsOutsider?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `bad-moon-rising-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: input.godfatherAddsOutsider ? [godfatherAddOutsiderAdjustment] : undefined,
    notes: [input.note],
    verified: true,
  }
}

export const badMoonRisingSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "first-deaths", count: 7, style: "beginner", roles: ["grandmother","sailor","chambermaid","gambler","fool","devilsadvocate","pukka"], bluffs: ["innkeeper","professor","tealady"], note: "Bad Moon Rising / 黯月初升 7 人新手友好模板。" }),
  template({ id: "public-death", count: 7, style: "balanced", roles: ["sailor","innkeeper","gossip","tealady","pacifist","assassin","shabaloth"], bluffs: ["grandmother","chambermaid","fool"], note: "Bad Moon Rising / 黯月初升 7 人均衡局模板。" }),
  template({ id: "godfather-outsider", count: 7, style: "chaos", roles: ["grandmother","chambermaid","professor","fool","tinker","godfather","zombuul"], bluffs: ["sailor","innkeeper","gambler"], note: "Bad Moon Rising / 黯月初升 7 人混乱局模板；教父外来者修正。", godfatherAddsOutsider: true }),
  template({ id: "protective-core", count: 8, style: "beginner", roles: ["grandmother","sailor","chambermaid","gambler","tealady","moonchild","devilsadvocate","pukka"], bluffs: ["innkeeper","professor","fool"], note: "Bad Moon Rising / 黯月初升 8 人新手友好模板。" }),
  template({ id: "po-charge", count: 8, style: "balanced", roles: ["innkeeper","exorcist","gossip","professor","pacifist","lunatic","assassin","po"], bluffs: ["grandmother","sailor","chambermaid"], note: "Bad Moon Rising / 黯月初升 8 人均衡局模板。" }),
  template({ id: "death-web", count: 9, style: "balanced", roles: ["grandmother","sailor","chambermaid","fool","pacifist","goon","tinker","devilsadvocate","shabaloth"], bluffs: ["innkeeper","gambler","professor"], note: "Bad Moon Rising / 黯月初升 9 人均衡局模板。" }),
  template({ id: "pukka-thread", count: 9, style: "long-game", roles: ["innkeeper","gambler","exorcist","gossip","professor","lunatic","moonchild","assassin","pukka"], bluffs: ["sailor","chambermaid","fool"], note: "Bad Moon Rising / 黯月初升 9 人长线局模板。" }),
  template({ id: "no-outsider-pressure", count: 10, style: "beginner", roles: ["grandmother","sailor","chambermaid","innkeeper","gambler","tealady","fool","devilsadvocate","assassin","pukka"], bluffs: ["exorcist","professor","pacifist"], note: "Bad Moon Rising / 黯月初升 10 人新手友好模板。" }),
  template({ id: "mastermind-day", count: 10, style: "balanced", roles: ["sailor","chambermaid","exorcist","gossip","courtier","professor","pacifist","assassin","mastermind","po"], bluffs: ["grandmother","innkeeper","fool"], note: "Bad Moon Rising / 黯月初升 10 人均衡局模板。" }),
  template({ id: "godfather-tinker", count: 10, style: "chaos", roles: ["grandmother","innkeeper","gambler","professor","tealady","fool","tinker","godfather","devilsadvocate","zombuul"], bluffs: ["sailor","chambermaid","gossip"], note: "Bad Moon Rising / 黯月初升 10 人混乱局模板；教父外来者修正。", godfatherAddsOutsider: true }),
  template({ id: "shabaloth-table", count: 11, style: "balanced", roles: ["grandmother","sailor","chambermaid","innkeeper","gambler","exorcist","fool","goon","devilsadvocate","assassin","shabaloth"], bluffs: ["gossip","professor","tealady"], note: "Bad Moon Rising / 黯月初升 11 人均衡局模板。" }),
  template({ id: "pukka-minstrel", count: 11, style: "long-game", roles: ["sailor","gossip","courtier","professor","minstrel","tealady","pacifist","moonchild","godfather","mastermind","pukka"], bluffs: ["grandmother","chambermaid","innkeeper"], note: "Bad Moon Rising / 黯月初升 11 人长线局模板。" }),
  template({ id: "balanced", count: 12, style: "balanced", roles: ["grandmother","sailor","chambermaid","innkeeper","gambler","professor","fool","goon","moonchild","devilsadvocate","assassin","pukka"], bluffs: ["exorcist","courtier","tealady"], note: "Bad Moon Rising / 黯月初升 12 人均衡局模板。" }),
  template({ id: "po-long-game", count: 12, style: "long-game", roles: ["sailor","exorcist","gossip","courtier","minstrel","tealady","pacifist","lunatic","tinker","assassin","mastermind","po"], bluffs: ["grandmother","chambermaid","professor"], note: "Bad Moon Rising / 黯月初升 12 人长线局模板。" }),
  template({ id: "godfather-death-fog", count: 12, style: "chaos", roles: ["grandmother","chambermaid","innkeeper","gambler","professor","pacifist","goon","lunatic","moonchild","godfather","devilsadvocate","shabaloth"], bluffs: ["sailor","exorcist","fool"], note: "Bad Moon Rising / 黯月初升 12 人混乱局模板；教父外来者修正。", godfatherAddsOutsider: true }),
  template({ id: "triple-minion-classic", count: 13, style: "balanced", roles: ["grandmother","sailor","chambermaid","innkeeper","gambler","exorcist","gossip","tealady","fool","devilsadvocate","assassin","mastermind","pukka"], bluffs: ["courtier","professor","pacifist"], note: "Bad Moon Rising / 黯月初升 13 人均衡局模板。" }),
  template({ id: "godfather-zombuul", count: 13, style: "chaos", roles: ["grandmother","sailor","chambermaid","courtier","professor","minstrel","tealady","pacifist","tinker","godfather","devilsadvocate","assassin","zombuul"], bluffs: ["innkeeper","gambler","gossip"], note: "Bad Moon Rising / 黯月初升 13 人混乱局模板；教父外来者修正。", godfatherAddsOutsider: true }),
  template({ id: "shabaloth-wide", count: 14, style: "balanced", roles: ["grandmother","sailor","chambermaid","innkeeper","gambler","exorcist","gossip","professor","fool","moonchild","devilsadvocate","assassin","mastermind","shabaloth"], bluffs: ["courtier","minstrel","tealady"], note: "Bad Moon Rising / 黯月初升 14 人均衡局模板。" }),
  template({ id: "po-vote-endgame", count: 14, style: "long-game", roles: ["sailor","chambermaid","gossip","courtier","professor","minstrel","tealady","fool","pacifist","goon","godfather","assassin","mastermind","po"], bluffs: ["grandmother","innkeeper","gambler"], note: "Bad Moon Rising / 黯月初升 14 人长线局模板。" }),
  template({ id: "max-pukka", count: 15, style: "balanced", roles: ["grandmother","sailor","chambermaid","innkeeper","gambler","exorcist","gossip","professor","fool","goon","moonchild","devilsadvocate","assassin","mastermind","pukka"], bluffs: ["courtier","minstrel","tealady"], note: "Bad Moon Rising / 黯月初升 15 人均衡局模板。" }),
  template({ id: "max-po", count: 15, style: "long-game", roles: ["sailor","chambermaid","gossip","courtier","professor","minstrel","tealady","fool","pacifist","lunatic","tinker","devilsadvocate","assassin","mastermind","po"], bluffs: ["grandmother","innkeeper","gambler"], note: "Bad Moon Rising / 黯月初升 15 人长线局模板。" }),
  template({ id: "max-zombuul", count: 15, style: "chaos", roles: ["grandmother","sailor","innkeeper","gambler","exorcist","professor","tealady","pacifist","goon","lunatic","moonchild","godfather","devilsadvocate","assassin","zombuul"], bluffs: ["chambermaid","gossip","fool"], note: "Bad Moon Rising / 黯月初升 15 人混乱局模板；教父外来者修正。", godfatherAddsOutsider: true }),
]
