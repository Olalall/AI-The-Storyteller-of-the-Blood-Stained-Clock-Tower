/**
 * 这一组测试记录的是「原样换容器」这句话在当前代码里能兑现到什么程度。
 *
 * 设计文档第 85 行说六个全屏页「几乎零改动搬进抽屉，只换容器」。实测下来这句话不成立：
 * 六个页组件的根都是 `<Sheet presentation="page">`，而 Sheet 内部是 Radix 的
 * `Dialog.Portal`——它把内容挂到 document.body，不在调用点的 DOM 位置里。
 * 也就是说把 SetupPanel 直接塞进抽屉，抽屉里是空的，页照旧全屏盖在抽屉上面。
 *
 * 这不是可以绕过去的细节：抽屉的三档高度、inert、peek 占用者全部依赖「页在抽屉的 DOM 里」。
 * 所以宿主的契约只能是「渲染函数交出脱壳后的内容」，而脱壳必须由页组件那一侧完成
 * （给 Sheet 加 container，或把 Sheet 外壳提到调用点）——那些文件不在本批的改动范围内。
 *
 * 这两条断言就是那份契约的可执行版本。第一条哪天红了不是坏事：
 * 它意味着 Sheet 不再无条件 portal 出去，此时应回头把五个页真正接进注册表，并改写这条测试。
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from '../../../components/ui/Sheet'
import { DrawerPageHost } from './DrawerPageHost'

describe('抽屉承接既有全屏页的边界', () => {
  it('cannot hold a Sheet-rooted page: Radix portals it to body, leaving the drawer empty', () => {
    const { container } = render(
      <DrawerPageHost
        pageId="setup"
        pages={{
          setup: () => (
            <Sheet open onOpenChange={vi.fn()} title="AI配板与调整" description="占位" presentation="page">
              <button type="button">确认配板</button>
            </Sheet>
          ),
        }}
        gestureContract="点座位 = 打开座位卡"
        onClose={vi.fn()}
      />,
    )

    const drawer = container.querySelector('.work-drawer')
    const sheet = document.querySelector('.sheet-content')
    expect(sheet, 'Sheet 本身照常渲染，问题不在它没渲染').not.toBeNull()
    // 页跑到了 body 下面：抽屉的高度、inert、peek 占用者对它一概无效。
    expect(sheet?.parentElement?.tagName).toBe('BODY')
    expect(drawer?.contains(sheet)).toBe(false)
    expect(container.querySelector('.work-drawer__body')?.textContent).not.toContain('确认配板')
  })

  it('holds a page whose renderer hands over de-shelled content', () => {
    // 宿主这一侧是好的：只要渲染函数交出的不是 Sheet，页就实实在在落在抽屉的 DOM 里，
    // 因此三档高度与 peek 档 inert 才对它生效。等页组件那侧脱壳后即可直接接上。
    const { container } = render(
      <DrawerPageHost
        pageId="setup"
        pages={{ setup: () => <button type="button">确认配板</button> }}
        gestureContract="点座位 = 打开座位卡"
        onClose={vi.fn()}
      />,
    )

    const body = container.querySelector('.work-drawer__body')
    expect(body?.contains(screen.getByRole('button', { name: '确认配板' }))).toBe(true)
  })
})
