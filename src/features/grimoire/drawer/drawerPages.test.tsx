import { describe, expect, it } from 'vitest'
import { WORK_DRAWER_DETENTS } from './detents'
import { DRAWER_PAGES, DRAWER_PAGE_IDS, isDrawerHostedPage, type DrawerPageId } from './drawerPages'

describe('抽屉页注册表', () => {
  it('gives every registered page a title and a default detent', () => {
    // 缺默认档的页会沿用抽屉上一次的档位：说书人上一步把抽屉拖回 peek，
    // 下一步打开「本局记录」就只开出一条 96px 的缝，看起来像记录没了。
    expect(DRAWER_PAGE_IDS.length).toBeGreaterThan(0)
    for (const id of DRAWER_PAGE_IDS) {
      const page = DRAWER_PAGES[id]
      expect(page.title, `${id} 缺页名`).not.toBe('')
      expect(WORK_DRAWER_DETENTS, `${id} 的默认档不是三档之一`).toContain(page.defaultDetent)
    }
  })

  it('keeps DRAWER_PAGE_IDS in sync with the table itself', () => {
    // 两处各写一份 id 清单时，新加的页会在遍历里被漏掉而不报错——
    // 注册表完备性检查本身就失效了。
    expect([...DRAWER_PAGE_IDS].sort()).toEqual((Object.keys(DRAWER_PAGES) as DrawerPageId[]).sort())
  })

  it('opens every drawer-hosted page at full, the only detent that equals presentation="page"', () => {
    // full 档 = 视口高 − 48px，与既有全屏页尺寸相同，所以搬进来才是纯容器替换。
    // 开在 half 会把按整页排版的内容压进半屏，直接长出页内 + 抽屉两条滚动条。
    for (const id of DRAWER_PAGE_IDS.filter(isDrawerHostedPage)) {
      expect(DRAWER_PAGES[id].defaultDetent, `${id} 不该开在 full 之外的档`).toBe('full')
    }
  })

  it('keeps 发身份 off the drawer surface', () => {
    // 设计文档第 85 行把发身份算进「六个全屏页原样进抽屉」，
    // 但第 178 行的表格与防窥裁决要求它是整屏不透明的 spotlight。
    // 抽屉只盖住下半屏：玩家低头看自己身份时，上半屏整圈座位就在他眼前。
    // 这一条冲突按后者落地，且用类型挡住——泄密不该等到真桌上才发现。
    expect(DRAWER_PAGES['identity-deal'].surface).toBe('canvas-overlay')
    expect(isDrawerHostedPage('identity-deal')).toBe(false)
  })

  it('keeps 夜序总览 on the drawer surface, because the night row is about a different component', () => {
    // 第 168 行那一行讲的是 NightWorkbench 被拆进环与 core，全程没提 NightQueueSheet；
    // 顶栏「夜间顺序」按钮打开的这张本局/官方双 tab 总览没有被规定过别的形态。
    // 若把它误当成冲突而踢出抽屉，魔典模式就少了一个纯记录模式有的入口，
    // 下一步必然是有人在 grimoire 里重画一份夜序列表——文档明令这属于设计错误。
    expect(isDrawerHostedPage('night-queue')).toBe(true)
    expect(DRAWER_PAGES['night-queue'].defaultDetent).toBe('full')
  })

  it('hosts the other five existing pages', () => {
    // 这五页是「只换容器」的全部范围。多一页少一页都要先回文档，不能就地改。
    expect(DRAWER_PAGE_IDS.filter(isDrawerHostedPage).sort()).toEqual([
      'game-end',
      'night-queue',
      'role-change',
      'setup',
      'timeline-history',
    ])
  })
})
