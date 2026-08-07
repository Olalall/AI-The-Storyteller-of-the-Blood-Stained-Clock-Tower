/**
 * 抽屉页注册表：哪些既有全屏页由三档抽屉承接、各自开在哪一档、叫什么名字。
 *
 * 为什么要一张表而不是让每个调用点自己传档位：档位是**页的属性**，不是抽屉的遗留状态。
 * 散在调用点之后，「打开本局记录」会因为上一次有人把抽屉拖回 peek 而只开出一条 96px 的缝，
 * 说书人看到的是「记录没了」——而这正是这一批要消灭的四个别名问题的同一类失败。
 *
 * 表里存的只有元数据。渲染函数由调用方在运行时给（见 DrawerPageHost）：
 * 抽屉不认识 SetupPanel 的 props，让它认识就等于把 features/grimoire/drawer
 * 变成配板/记录/收尾/夜序四个功能域的下游，一个页改 props 就要动抽屉。
 */
import type { WorkDrawerDetent } from './detents'

/**
 * 这一页落在哪个面上。
 *
 * drawer：抽屉承接。full 档尺寸恰好等于既有 `presentation="page"`（铺满宽度、只留 48px 阶段轨道），
 *   所以是纯容器替换，页组件本身一行不改。落地方式是 Sheet 的内联呈现分支：
 *   宿主套一层 SheetInlineSurfaceProvider，页根上那句 `<Sheet presentation="page">`
 *   自己改成就地渲染，页头（页名 + 副标题 + 关闭键）随页一起进来。
 *   因此这一列写 drawer 的前提是**这一页的根确实是 Sheet**；
 *   若将来加一页不是，它在抽屉里会退回宿主兜底的页头，副标题那行内容会丢。
 * canvas-overlay：必须是覆盖整屏的不透明面，抽屉不得承接。抽屉只盖住下半屏，
 *   上半屏的座位环仍在——把一次只该露一个人的面放进抽屉，等于把整圈身份摆在它旁边。
 */
export type DrawerPageSurface = 'drawer' | 'canvas-overlay'

export interface DrawerPageMeta {
  /** 抽屉容器头部与读屏播报用的页名。一页一个名字，不再有别名。 */
  title: string
  /** 打开这一页时抽屉自动切到的档位。 */
  defaultDetent: WorkDrawerDetent
  surface: DrawerPageSurface
}

/**
 * 「六个全屏页」的清单（文档第 85 / 1074 行）与第三章表格（第 168 / 178 行）对其中两页说法不一致。
 * 逐条核对下来，两处的不一致不是同一回事，因此处理方式也不同：
 *
 * - **发身份是真冲突**。第 178 行点名 IdentityDealSheet，把它的魔典形态写成
 *   「画布切 data-mode="deal" + 点座位打开现有 spotlight（全屏、不透明、只有这一位）」，
 *   与「原样进抽屉 full 档」互斥。按表格 + 裁决 6 + 风险「整屏一次性泄密」落地为 canvas-overlay，
 *   理由写在条目上。
 * - **夜序是假冲突**。第 168 行那一行的纯记录列写的是 **NightWorkbench**（96–160px 页头 +
 *   250px NightPlayerCarousel 转盘 + CurrentWakeCard），描述的是把那张工作台拆进环与 core；
 *   它自始至终没提 NightQueueSheet。NightQueueSheet 是另一个组件——顶栏「夜间顺序」按钮打开的
 *   本局/官方双 tab 夜序总览，表格没有为它规定任何别的形态。所以清单对它有效，留在抽屉。
 *   把这一条误读成冲突而把夜序总览踢出抽屉，魔典模式就会缺一个纯记录模式有的入口，
 *   而那正是文档反复禁止的「在 grimoire 里重新实现一遍纯记录已有功能」的前一步。
 */
const PAGES = {
  setup: {
    // 表格：开局态画布进配板环，抽屉 full 渲染现有 SetupPanel。
    title: 'AI配板与调整',
    defaultDetent: 'full',
    surface: 'drawer',
  },
  'night-queue': {
    // 指 NightQueueSheet 这张夜序总览（本局 / 官方双 tab 的长列表），不是被拆进环与 core 的
    // NightWorkbench。半屏放不下一夜十几项，所以照清单开 full。
    title: '夜间顺序',
    defaultDetent: 'full',
    surface: 'drawer',
  },
  'role-change': {
    // 表格：SeatActionBar 第五格 →「抽屉 full 原样渲染现有 RoleChangeSheet」。
    title: '更换角色',
    defaultDetent: 'full',
    surface: 'drawer',
  },
  'timeline-history': {
    // 文档钦定的唯一名是「本局记录」；现有 Sheet 里那个「日记」正是要消灭的四个别名之一。
    title: '本局记录',
    defaultDetent: 'full',
    surface: 'drawer',
  },
  'game-end': {
    // 表格：收尾交接卡 → 抽屉 full 渲染现有 GameEndSheet 三步。
    title: '结束与复盘',
    defaultDetent: 'full',
    surface: 'drawer',
  },
  'identity-deal': {
    // 唯一不归抽屉的一页。发身份要把屏幕交给**一个**玩家，而抽屉只盖住下半屏：
    // 玩家低头看自己身份的同时，上半屏整圈座位就在他眼前。这一页必须整屏不透明。
    // defaultDetent 描述的是「这一页开着时抽屉自己待在哪一档」——让位给 spotlight，退到 peek。
    title: '发身份',
    defaultDetent: 'peek',
    surface: 'canvas-overlay',
  },
} as const satisfies Record<string, DrawerPageMeta>

export type DrawerPageId = keyof typeof PAGES

/**
 * 抽屉真正能承接的那几页。
 * 用类型而不是运行时判断挡住 identity-deal：把它塞进抽屉是一次泄密，
 * 这种错误应该在编译期就被拒绝，而不是等到有人在真桌上发身份时才发现。
 */
export type DrawerHostedPageId = {
  [K in DrawerPageId]: (typeof PAGES)[K]['surface'] extends 'drawer' ? K : never
}[DrawerPageId]

export const DRAWER_PAGES: Record<DrawerPageId, DrawerPageMeta> = PAGES

export const DRAWER_PAGE_IDS = Object.keys(PAGES) as readonly DrawerPageId[]

export function isDrawerHostedPage(id: DrawerPageId): id is DrawerHostedPageId {
  return DRAWER_PAGES[id].surface === 'drawer'
}
