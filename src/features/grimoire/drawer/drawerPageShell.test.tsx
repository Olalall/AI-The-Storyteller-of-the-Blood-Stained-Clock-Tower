/**
 * 「原样换容器」这句话现在真的成立了，这一组测试守的就是它。
 *
 * 一度不成立：六个页组件的根都是 `<Sheet presentation="page">`，而 Sheet 内部是
 * Radix 的 `Dialog.Portal`，无条件把内容挂到 document.body。把 SetupPanel 塞进抽屉，
 * 抽屉里是空的，页照旧全屏盖在抽屉上面——**看起来成功**（页显示出来了），
 * 实际环被整块糊掉。这是最容易被误判为完成的失败形态。
 *
 * 解法是给 Sheet 加内联呈现分支：宿主在外面提供一个 context，Sheet 检测到就地渲染
 * 而不 portal。六个页组件因此一行代码都不用改——这正是「原样」二字的兑现方式。
 *
 * 下面第一条断言以前是反过来写的（断言「进不去」），它变红那天就是这个缺陷被修好那天。
 * 现在它正着写：页必须落在抽屉的 DOM 里，否则抽屉的三档高度、inert、peek 占用者
 * 对它一概无效。
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from '../../../components/ui/Sheet'
import { DrawerPageHost } from './DrawerPageHost'

describe('抽屉承接既有全屏页的边界', () => {
  it('holds a Sheet-rooted page inside the drawer instead of portaling it to body', () => {
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
    expect(sheet, 'Sheet 本身照常渲染').not.toBeNull()
    // 关键三条：不在 body 下、在抽屉里、内容真的可见。
    expect(sheet?.parentElement?.tagName).not.toBe('BODY')
    expect(drawer?.contains(sheet), '页必须落在抽屉的 DOM 里，否则三档高度与 inert 对它无效').toBe(true)
    expect(container.querySelector('.work-drawer__body')?.textContent).toContain('确认配板')
    // 铺满视口的遮罩会把环整块糊掉，内联态一定不能有。
    expect(document.querySelector('.sheet-overlay')).toBeNull()
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
