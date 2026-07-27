import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'trouble-brewing'
const baronOutsiderAdjustment = {
  ruleId: 'baron-outsiders',
  choiceId: 'add-two-outsiders',
  compositionDelta: { townsfolk: -2, outsider: 2 },
  note: '男爵：+2 外来者，通常替换 2 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  baron?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `trouble-brewing-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: input.baron ? [baronOutsiderAdjustment] : undefined,
    notes: [input.note],
    verified: true,
  }
}

export const troubleBrewingSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "first-info", count: 7, style: "beginner", roles: ["washerwoman","librarian","chef","empath","slayer","poisoner","imp"], bluffs: ["investigator","monk","mayor"], note: "Trouble Brewing / 暗流涌动 7 人新手友好模板。" }),
  template({ id: "protected-read", count: 7, style: "balanced", roles: ["investigator","fortuneteller","monk","soldier","ravenkeeper","spy","imp"], bluffs: ["chef","undertaker","virgin"], note: "Trouble Brewing / 暗流涌动 7 人均衡局模板。" }),
  template({ id: "baron-outsiders", count: 7, style: "chaos", roles: ["washerwoman","empath","undertaker","butler","recluse","baron","imp"], bluffs: ["librarian","mayor","slayer"], note: "Trouble Brewing / 暗流涌动 7 人混乱局模板；男爵外来者修正。", baron: true }),
  template({ id: "social-balance", count: 8, style: "beginner", roles: ["washerwoman","librarian","empath","monk","slayer","butler","poisoner","imp"], bluffs: ["investigator","chef","mayor"], note: "Trouble Brewing / 暗流涌动 8 人新手友好模板。" }),
  template({ id: "spy-pressure", count: 8, style: "balanced", roles: ["chef","investigator","fortuneteller","soldier","ravenkeeper","recluse","spy","imp"], bluffs: ["washerwoman","undertaker","virgin"], note: "Trouble Brewing / 暗流涌动 8 人均衡局模板。" }),
  template({ id: "execution-read", count: 9, style: "balanced", roles: ["washerwoman","librarian","chef","empath","undertaker","butler","saint","poisoner","imp"], bluffs: ["investigator","monk","mayor"], note: "Trouble Brewing / 暗流涌动 9 人均衡局模板。" }),
  template({ id: "red-herring", count: 9, style: "long-game", roles: ["investigator","fortuneteller","monk","soldier","mayor","drunk","recluse","spy","imp"], bluffs: ["washerwoman","chef","virgin"], note: "Trouble Brewing / 暗流涌动 9 人长线局模板。" }),
  template({ id: "classic-pressure", count: 10, style: "beginner", roles: ["washerwoman","librarian","investigator","chef","empath","monk","slayer","poisoner","scarletwoman","imp"], bluffs: ["fortuneteller","undertaker","mayor"], note: "Trouble Brewing / 暗流涌动 10 人新手友好模板。" }),
  template({ id: "death-and-cover", count: 10, style: "balanced", roles: ["washerwoman","fortuneteller","undertaker","soldier","ravenkeeper","mayor","virgin","poisoner","spy","imp"], bluffs: ["librarian","chef","monk"], note: "Trouble Brewing / 暗流涌动 10 人均衡局模板。" }),
  template({ id: "baron-fog", count: 10, style: "chaos", roles: ["investigator","chef","empath","monk","ravenkeeper","drunk","recluse","baron","poisoner","imp"], bluffs: ["washerwoman","fortuneteller","virgin"], note: "Trouble Brewing / 暗流涌动 10 人混乱局模板；男爵外来者修正。", baron: true }),
  template({ id: "first-night-web", count: 11, style: "balanced", roles: ["washerwoman","librarian","chef","empath","fortuneteller","undertaker","slayer","butler","poisoner","scarletwoman","imp"], bluffs: ["investigator","monk","mayor"], note: "Trouble Brewing / 暗流涌动 11 人均衡局模板。" }),
  template({ id: "virgin-saint-risk", count: 11, style: "long-game", roles: ["investigator","chef","monk","soldier","ravenkeeper","mayor","virgin","saint","spy","poisoner","imp"], bluffs: ["washerwoman","librarian","fortuneteller"], note: "Trouble Brewing / 暗流涌动 11 人长线局模板。" }),
  template({ id: "balanced", count: 12, style: "balanced", roles: ["washerwoman","librarian","investigator","chef","empath","fortuneteller","undertaker","butler","recluse","poisoner","scarletwoman","imp"], bluffs: ["monk","slayer","mayor"], note: "Trouble Brewing / 暗流涌动 12 人均衡局模板。" }),
  template({ id: "long-game", count: 12, style: "long-game", roles: ["washerwoman","empath","monk","slayer","soldier","ravenkeeper","mayor","drunk","saint","poisoner","spy","imp"], bluffs: ["librarian","investigator","undertaker"], note: "Trouble Brewing / 暗流涌动 12 人长线局模板。" }),
  template({ id: "baron-vote-risk", count: 12, style: "chaos", roles: ["librarian","investigator","fortuneteller","undertaker","virgin","butler","drunk","recluse","saint","baron","spy","imp"], bluffs: ["chef","empath","monk"], note: "Trouble Brewing / 暗流涌动 12 人混乱局模板；男爵外来者修正。", baron: true }),
  template({ id: "wide-info", count: 13, style: "balanced", roles: ["washerwoman","librarian","investigator","chef","empath","fortuneteller","undertaker","monk","slayer","poisoner","spy","scarletwoman","imp"], bluffs: ["soldier","ravenkeeper","mayor"], note: "Trouble Brewing / 暗流涌动 13 人均衡局模板。" }),
  template({ id: "public-pressure", count: 13, style: "long-game", roles: ["washerwoman","librarian","chef","empath","monk","soldier","ravenkeeper","mayor","virgin","poisoner","spy","scarletwoman","imp"], bluffs: ["investigator","fortuneteller","undertaker"], note: "Trouble Brewing / 暗流涌动 13 人长线局模板。" }),
  template({ id: "full-classic", count: 14, style: "balanced", roles: ["washerwoman","librarian","investigator","chef","empath","fortuneteller","undertaker","monk","slayer","butler","poisoner","spy","scarletwoman","imp"], bluffs: ["soldier","ravenkeeper","mayor"], note: "Trouble Brewing / 暗流涌动 14 人均衡局模板。" }),
  template({ id: "saint-table", count: 14, style: "long-game", roles: ["washerwoman","librarian","chef","empath","monk","soldier","ravenkeeper","mayor","virgin","saint","poisoner","spy","scarletwoman","imp"], bluffs: ["investigator","fortuneteller","undertaker"], note: "Trouble Brewing / 暗流涌动 14 人长线局模板。" }),
  template({ id: "max-info", count: 15, style: "balanced", roles: ["washerwoman","librarian","investigator","chef","empath","fortuneteller","undertaker","monk","slayer","butler","recluse","poisoner","spy","scarletwoman","imp"], bluffs: ["soldier","ravenkeeper","mayor"], note: "Trouble Brewing / 暗流涌动 15 人均衡局模板。" }),
  template({ id: "long-table", count: 15, style: "long-game", roles: ["washerwoman","librarian","chef","empath","monk","soldier","ravenkeeper","mayor","virgin","drunk","saint","poisoner","spy","scarletwoman","imp"], bluffs: ["investigator","fortuneteller","undertaker"], note: "Trouble Brewing / 暗流涌动 15 人长线局模板。" }),
  template({ id: "baron-max", count: 15, style: "chaos", roles: ["washerwoman","librarian","investigator","empath","fortuneteller","undertaker","virgin","butler","drunk","recluse","saint","baron","poisoner","spy","imp"], bluffs: ["chef","monk","mayor"], note: "Trouble Brewing / 暗流涌动 15 人混乱局模板；男爵外来者修正。", baron: true }),
]
