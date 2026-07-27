import type { PlayerCount, RoleId, SetupTemplate, SetupTemplateStyle } from '../../types'

const scriptId = 'everyone-can-play'

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
    templateId: `everyone-can-play-${input.count}-${input.id}`,
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

export const everyoneCanPlaySetupTemplates: readonly SetupTemplate[] = [
  template({
    id: 'teaching-core',
    count: 7,
    style: 'beginner',
    roles: ['librarian', 'empath', 'monk', 'slayer', 'fool', 'poisoner', 'imp'],
    bluffs: ['undertaker', 'mayor', 'artist'],
    note: '新手友好：信息、保护和一次性能力清晰。',
  }),
  template({
    id: 'execution-read',
    count: 7,
    style: 'balanced',
    roles: ['grandmother', 'fortuneteller', 'undertaker', 'artist', 'ravenkeeper', 'spy', 'imp'],
    bluffs: ['librarian', 'monk', 'mayor'],
    note: '处决信息链较清楚，适合练习日志记录。',
  }),
  template({
    id: 'baron-outsiders',
    count: 7,
    style: 'chaos',
    roles: ['clockmaker', 'empath', 'slayer', 'drunk', 'recluse', 'baron', 'imp'],
    bluffs: ['librarian', 'undertaker', 'mayor'],
    note: '男爵外来者局，适合制造身份误判。',
    baron: true,
  }),
  template({
    id: 'soft-start',
    count: 8,
    style: 'beginner',
    roles: ['librarian', 'grandmother', 'empath', 'monk', 'slayer', 'drunk', 'poisoner', 'imp'],
    bluffs: ['clockmaker', 'artist', 'mayor'],
    note: '信息密度适中，适合第一局或教学局。',
  }),
  template({
    id: 'spy-table',
    count: 8,
    style: 'balanced',
    roles: ['clockmaker', 'fortuneteller', 'undertaker', 'gambler', 'fool', 'saint', 'spy', 'imp'],
    bluffs: ['librarian', 'monk', 'mayor'],
    note: '间谍给邪恶方更多操作空间。',
  }),
  template({
    id: 'classic-nine',
    count: 9,
    style: 'balanced',
    roles: ['librarian', 'clockmaker', 'empath', 'undertaker', 'artist', 'drunk', 'recluse', 'poisoner', 'imp'],
    bluffs: ['grandmother', 'monk', 'mayor'],
    note: '九人均衡局，信息真假都有空间。',
  }),
  template({
    id: 'baron-four-outsiders',
    count: 9,
    style: 'chaos',
    roles: ['grandmother', 'fortuneteller', 'ravenkeeper', 'drunk', 'recluse', 'saint', 'moonchild', 'baron', 'imp'],
    bluffs: ['librarian', 'empath', 'undertaker'],
    note: '四外来者压力局，适合长一点的社交推理。',
    baron: true,
  }),
  template({
    id: 'ten-teaching',
    count: 10,
    style: 'beginner',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'monk', 'artist', 'fool', 'poisoner', 'scarletwoman', 'imp'],
    bluffs: ['fortuneteller', 'undertaker', 'mayor'],
    note: '十人教学局，恶魔传递提醒要留意。',
  }),
  template({
    id: 'ten-execution',
    count: 10,
    style: 'balanced',
    roles: ['grandmother', 'fortuneteller', 'undertaker', 'gambler', 'slayer', 'ravenkeeper', 'mayor', 'assassin', 'devilsadvocate', 'imp'],
    bluffs: ['librarian', 'empath', 'monk'],
    note: '死亡和处决免死都在场，适合练日终核对。',
  }),
  template({
    id: 'ten-baron-fog',
    count: 10,
    style: 'chaos',
    roles: ['clockmaker', 'empath', 'monk', 'artist', 'fool', 'drunk', 'recluse', 'baron', 'spy', 'imp'],
    bluffs: ['librarian', 'undertaker', 'mayor'],
    note: '男爵和间谍同场，真假身份更混乱。',
    baron: true,
  }),
  template({
    id: 'eleven-wide-info',
    count: 11,
    style: 'balanced',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'artist', 'recluse', 'poisoner', 'scarletwoman', 'imp'],
    bluffs: ['monk', 'fool', 'mayor'],
    note: '信息角色较多，适合标准玩家。',
  }),
  template({
    id: 'eleven-saint-risk',
    count: 11,
    style: 'long-game',
    roles: ['clockmaker', 'fortuneteller', 'monk', 'gambler', 'slayer', 'fool', 'mayor', 'saint', 'assassin', 'devilsadvocate', 'imp'],
    bluffs: ['librarian', 'empath', 'undertaker'],
    note: '圣徒和保护类角色同场，日终选择更有张力。',
  }),
  template({
    id: 'twelve-balanced',
    count: 12,
    style: 'balanced',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'gambler', 'drunk', 'moonchild', 'poisoner', 'scarletwoman', 'imp'],
    bluffs: ['monk', 'artist', 'mayor'],
    note: '十二人标准局，死亡与信息都容易形成讨论。',
  }),
  template({
    id: 'twelve-long-game',
    count: 12,
    style: 'long-game',
    roles: ['grandmother', 'fortuneteller', 'monk', 'artist', 'slayer', 'fool', 'ravenkeeper', 'recluse', 'saint', 'assassin', 'devilsadvocate', 'imp'],
    bluffs: ['librarian', 'empath', 'undertaker'],
    note: '长线局，保护和死亡后信息都值得记录。',
  }),
  template({
    id: 'twelve-baron-max',
    count: 12,
    style: 'chaos',
    roles: ['librarian', 'clockmaker', 'empath', 'undertaker', 'mayor', 'drunk', 'recluse', 'saint', 'moonchild', 'baron', 'spy', 'imp'],
    bluffs: ['grandmother', 'fortuneteller', 'monk'],
    note: '男爵四外来者局，身份混乱但仍可控。',
    baron: true,
  }),
  template({
    id: 'thirteen-pressure',
    count: 13,
    style: 'balanced',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'monk', 'artist', 'mayor', 'poisoner', 'assassin', 'scarletwoman', 'imp'],
    bluffs: ['gambler', 'slayer', 'fool'],
    note: '十三人均衡局，邪恶方有多种操作点。',
  }),
  template({
    id: 'thirteen-baron',
    count: 13,
    style: 'chaos',
    roles: ['librarian', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'fool', 'mayor', 'drunk', 'recluse', 'baron', 'poisoner', 'devilsadvocate', 'imp'],
    bluffs: ['clockmaker', 'monk', 'artist'],
    note: '十三人男爵局，外来者压力和免死压力并存。',
    baron: true,
  }),
  template({
    id: 'fourteen-full',
    count: 14,
    style: 'balanced',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'monk', 'gambler', 'artist', 'recluse', 'poisoner', 'assassin', 'scarletwoman', 'imp'],
    bluffs: ['slayer', 'fool', 'mayor'],
    note: '十四人标准局，适合稳定长桌。',
  }),
  template({
    id: 'fourteen-saint',
    count: 14,
    style: 'long-game',
    roles: ['librarian', 'clockmaker', 'empath', 'fortuneteller', 'monk', 'gambler', 'slayer', 'fool', 'mayor', 'saint', 'poisoner', 'spy', 'devilsadvocate', 'imp'],
    bluffs: ['grandmother', 'undertaker', 'artist'],
    note: '圣徒和魔鬼代言人同场，处决核对要谨慎。',
  }),
  template({
    id: 'fifteen-balanced',
    count: 15,
    style: 'balanced',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'monk', 'gambler', 'artist', 'drunk', 'moonchild', 'poisoner', 'assassin', 'scarletwoman', 'imp'],
    bluffs: ['slayer', 'fool', 'mayor'],
    note: '十五人均衡局，信息链完整。',
  }),
  template({
    id: 'fifteen-long',
    count: 15,
    style: 'long-game',
    roles: ['clockmaker', 'grandmother', 'empath', 'fortuneteller', 'monk', 'undertaker', 'slayer', 'fool', 'mayor', 'recluse', 'saint', 'poisoner', 'spy', 'devilsadvocate', 'imp'],
    bluffs: ['librarian', 'gambler', 'artist'],
    note: '十五人长局，真假信息和处决风险都较强。',
  }),
  template({
    id: 'fifteen-baron',
    count: 15,
    style: 'chaos',
    roles: ['librarian', 'clockmaker', 'grandmother', 'empath', 'fortuneteller', 'undertaker', 'mayor', 'drunk', 'recluse', 'saint', 'moonchild', 'baron', 'poisoner', 'spy', 'imp'],
    bluffs: ['monk', 'gambler', 'artist'],
    note: '十五人男爵局，四外来者制造足够社交张力。',
    baron: true,
  }),
]
