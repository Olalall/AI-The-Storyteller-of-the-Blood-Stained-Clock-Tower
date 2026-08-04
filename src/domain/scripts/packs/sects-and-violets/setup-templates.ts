import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'sects-and-violets'
const fangGuOutsiderAdjustment = {
  ruleId: 'fanggu-outsider',
  choiceId: 'add-outsider',
  compositionDelta: { townsfolk: -1, outsider: 1 },
  note: '方古：+1 外来者，通常替换 1 名镇民。',
} as const
const vigormortisOutsiderAdjustment = {
  ruleId: 'vigormortis-outsider',
  choiceId: 'remove-outsider',
  compositionDelta: { townsfolk: 1, outsider: -1 },
  note: '亡骨魔：-1 外来者，通常增加 1 名镇民。',
} as const

type TemplateInput = {
  id: string
  count: PlayerCount
  style: SetupTemplateStyle
  roles: readonly RoleId[]
  bluffs: readonly RoleId[]
  note: string
  fangGuAddsOutsider?: boolean
  vigormortisRemovesOutsider?: boolean
}

function template(input: TemplateInput): SetupTemplate {
  return {
    templateId: `sects-and-violets-${input.count}-${input.id}`,
    scriptId,
    playerCount: input.count,
    style: input.style,
    roles: input.roles,
    bluffs: input.bluffs,
    setupAdjustments: [
      ...(input.fangGuAddsOutsider ? [fangGuOutsiderAdjustment] : []),
      ...(input.vigormortisRemovesOutsider ? [vigormortisOutsiderAdjustment] : []),
    ],
    notes: [input.note],
    verified: true,
  }
}

export const sectsAndVioletsSetupTemplates: readonly SetupTemplate[] = [
  template({ id: "clear-info", count: 7, style: "beginner", roles: ["clockmaker","dreamer","flowergirl","artist","sage","witch","nodashii"], bluffs: ["mathematician","savant","juggler"], note: "Sects & Violets / 梦殒春宵 7 人新手友好模板。" }),
  template({ id: "madness-lite", count: 7, style: "balanced", roles: ["snakecharmer","towncrier","oracle","seamstress","juggler","cerenovus","vortox"], bluffs: ["clockmaker","artist","sage"], note: "Sects & Violets / 梦殒春宵 7 人均衡局模板。" }),
  template({ id: "fanggu-outsider", count: 7, style: "chaos", roles: ["clockmaker","mathematician","dreamer","philosopher","mutant","pithag","fanggu"], bluffs: ["flowergirl","seamstress","artist"], note: "Sects & Violets / 梦殒春宵 7 人混乱局模板；方古外来者修正。", fangGuAddsOutsider: true }),
  template({ id: "nodashii-entry", count: 8, style: "beginner", roles: ["clockmaker","dreamer","flowergirl","artist","sage","sweetheart","witch","nodashii"], bluffs: ["mathematician","oracle","juggler"], note: "Sects & Violets / 梦殒春宵 8 人新手友好模板。" }),
  template({ id: "vortox-puzzle", count: 8, style: "balanced", roles: ["snakecharmer","mathematician","towncrier","oracle","seamstress","barber","cerenovus","vortox"], bluffs: ["clockmaker","savant","artist"], note: "Sects & Violets / 梦殒春宵 8 人均衡局模板。" }),
  template({ id: "two-outsider-nodashii", count: 9, style: "balanced", roles: ["clockmaker","dreamer","flowergirl","savant","artist","sweetheart","klutz","witch","nodashii"], bluffs: ["mathematician","oracle","sage"], note: "Sects & Violets / 梦殒春宵 9 人均衡局模板。" }),
  template({ id: "fanggu-three-outsiders", count: 9, style: "chaos", roles: ["snakecharmer","mathematician","towncrier","philosopher","sweetheart","barber","mutant","pithag","fanggu"], bluffs: ["clockmaker","dreamer","artist"], note: "Sects & Violets / 梦殒春宵 9 人混乱局模板；方古外来者修正。", fangGuAddsOutsider: true }),
  template({ id: "no-outsider-info", count: 10, style: "beginner", roles: ["clockmaker","dreamer","flowergirl","towncrier","oracle","artist","sage","witch","cerenovus","nodashii"], bluffs: ["mathematician","savant","juggler"], note: "Sects & Violets / 梦殒春宵 10 人新手友好模板。" }),
  template({ id: "vortox-town", count: 10, style: "balanced", roles: ["snakecharmer","mathematician","savant","seamstress","philosopher","artist","juggler","pithag","eviltwin","vortox"], bluffs: ["clockmaker","dreamer","oracle"], note: "Sects & Violets / 梦殒春宵 10 人均衡局模板。" }),
  template({ id: "fanggu-ten", count: 10, style: "chaos", roles: ["clockmaker","dreamer","flowergirl","philosopher","artist","sage","sweetheart","witch","pithag","fanggu"], bluffs: ["mathematician","towncrier","oracle"], note: "Sects & Violets / 梦殒春宵 10 人混乱局模板；方古外来者修正。", fangGuAddsOutsider: true }),
  template({ id: "klutz-risk", count: 11, style: "balanced", roles: ["clockmaker","dreamer","flowergirl","towncrier","oracle","savant","sage","klutz","witch","cerenovus","nodashii"], bluffs: ["mathematician","artist","juggler"], note: "Sects & Violets / 梦殒春宵 11 人均衡局模板。" }),
  template({ id: "vigormortis-no-outsider", count: 11, style: "long-game", roles: ["snakecharmer","mathematician","dreamer","seamstress","philosopher","artist","juggler","sage","pithag","eviltwin","vigormortis"], bluffs: ["clockmaker","flowergirl","oracle"], note: "Sects & Violets / 梦殒春宵 11 人长线局模板；亡骨魔外来者修正。", vigormortisRemovesOutsider: true }),
  template({ id: "balanced", count: 12, style: "balanced", roles: ["clockmaker","dreamer","flowergirl","towncrier","oracle","artist","sage","sweetheart","barber","witch","cerenovus","nodashii"], bluffs: ["mathematician","savant","juggler"], note: "Sects & Violets / 梦殒春宵 12 人均衡局模板。" }),
  template({ id: "vortox-long", count: 12, style: "long-game", roles: ["snakecharmer","mathematician","savant","seamstress","philosopher","artist","juggler","klutz","mutant","pithag","eviltwin","vortox"], bluffs: ["clockmaker","dreamer","flowergirl"], note: "Sects & Violets / 梦殒春宵 12 人长线局模板。" }),
  template({ id: "fanggu-chaos", count: 12, style: "chaos", roles: ["clockmaker","dreamer","towncrier","oracle","philosopher","sage","sweetheart","barber","mutant","witch","pithag","fanggu"], bluffs: ["mathematician","flowergirl","artist"], note: "Sects & Violets / 梦殒春宵 12 人混乱局模板；方古外来者修正。", fangGuAddsOutsider: true }),
  template({ id: "triple-minion", count: 13, style: "balanced", roles: ["clockmaker","snakecharmer","mathematician","dreamer","flowergirl","towncrier","oracle","artist","sage","witch","cerenovus","eviltwin","nodashii"], bluffs: ["savant","seamstress","juggler"], note: "Sects & Violets / 梦殒春宵 13 人均衡局模板。" }),
  template({ id: "fanggu-thirteen", count: 13, style: "chaos", roles: ["clockmaker","dreamer","flowergirl","savant","seamstress","philosopher","artist","juggler","sweetheart","witch","cerenovus","pithag","fanggu"], bluffs: ["snakecharmer","mathematician","oracle"], note: "Sects & Violets / 梦殒春宵 13 人混乱局模板；方古外来者修正。", fangGuAddsOutsider: true }),
  template({ id: "vortox-wide", count: 14, style: "balanced", roles: ["clockmaker","snakecharmer","mathematician","dreamer","flowergirl","towncrier","oracle","artist","sage","barber","witch","cerenovus","eviltwin","vortox"], bluffs: ["savant","seamstress","juggler"], note: "Sects & Violets / 梦殒春宵 14 人均衡局模板。" }),
  template({ id: "vigormortis-wide", count: 14, style: "long-game", roles: ["clockmaker","snakecharmer","mathematician","dreamer","flowergirl","towncrier","oracle","savant","artist","sage","witch","pithag","eviltwin","vigormortis"], bluffs: ["seamstress","philosopher","juggler"], note: "Sects & Violets / 梦殒春宵 14 人长线局模板；亡骨魔外来者修正。", vigormortisRemovesOutsider: true }),
  template({ id: "max-nodashii", count: 15, style: "balanced", roles: ["clockmaker","snakecharmer","mathematician","dreamer","flowergirl","towncrier","oracle","artist","sage","sweetheart","barber","witch","cerenovus","eviltwin","nodashii"], bluffs: ["savant","seamstress","juggler"], note: "Sects & Violets / 梦殒春宵 15 人均衡局模板。" }),
  template({ id: "max-vortox", count: 15, style: "long-game", roles: ["clockmaker","dreamer","flowergirl","towncrier","savant","seamstress","philosopher","artist","juggler","klutz","mutant","witch","cerenovus","pithag","vortox"], bluffs: ["snakecharmer","mathematician","oracle"], note: "Sects & Violets / 梦殒春宵 15 人长线局模板。" }),
  template({ id: "max-fanggu", count: 15, style: "chaos", roles: ["snakecharmer","mathematician","dreamer","oracle","seamstress","philosopher","artist","sage","sweetheart","barber","mutant","witch","pithag","eviltwin","fanggu"], bluffs: ["clockmaker","flowergirl","juggler"], note: "Sects & Violets / 梦殒春宵 15 人混乱局模板；方古外来者修正。", fangGuAddsOutsider: true }),
]
