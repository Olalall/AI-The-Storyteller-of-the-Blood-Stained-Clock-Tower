/**
 * Sheet 的两条呈现路径。
 *
 * 第一组锁 portal 态零回归：全站十几处 Sheet 用法都走这条，内联分支是加出来的，
 * 不是改出来的。第二组锁内联态——它替换掉的是 Radix Dialog 的一整套行为，
 * 无障碍与「不糊住背后那块画布」这两件事没有任何框架在兜底，只能靠这些断言。
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Sheet, SheetInlineSurfaceProvider, type SheetInlineSurface } from './Sheet'

function renderInline(ui: ReactNode, surface: Partial<SheetInlineSurface> = {}) {
  return render(
    <div data-testid="host">
      <SheetInlineSurfaceProvider surface={{ claimRoot: () => {}, ...surface }}>{ui}</SheetInlineSurfaceProvider>
    </div>,
  )
}

describe('Sheet 默认的 portal 呈现', () => {
  it('keeps portalling to body so every existing full-screen page is untouched', () => {
    // 内联分支是加出来的：没有宿主时必须与改动前逐字节一致，
    // 否则「给抽屉加个开关」会变成「把全站十几张页搬了家」。
    const { container } = render(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <button type="button">更正这一条</button>
      </Sheet>,
    )

    const content = document.querySelector('.sheet-content')
    expect(content?.parentElement?.tagName).toBe('BODY')
    expect(container.contains(content)).toBe(false)
    expect(screen.getByRole('dialog')).toBe(content)
    expect(document.querySelector('.sheet-overlay')).not.toBeNull()
  })

  it('still renders the trigger and opens from it', async () => {
    // NightQueueSheet 恒传 trigger，顶栏那颗「夜间顺序」就是它。
    const onOpenChange = vi.fn()
    render(
      <Sheet
        open={false}
        onOpenChange={onOpenChange}
        title="夜间顺序"
        description="本局 · 12项"
        trigger={<button type="button">夜间顺序</button>}
      >
        <p>队列</p>
      </Sheet>,
    )

    await userEvent.click(screen.getByRole('button', { name: '夜间顺序' }))

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })
})

describe('Sheet 的内联呈现', () => {
  it('renders in place instead of portalling, which is the whole point', () => {
    // portal 出去之后抽屉的高度、overflow、inert 对页一概无效，
    // 而 .sheet-overlay 是 fixed 铺满视口——页照常显示，环被整块糊掉。
    // 这条红了就说明那个「截图上一切正常」的失败形态回来了。
    const { getByTestId } = renderInline(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <button type="button">更正这一条</button>
      </Sheet>,
    )

    const content = document.querySelector('.sheet-content')
    expect(content).not.toBeNull()
    expect(getByTestId('host').contains(content)).toBe(true)
    expect(content?.parentElement?.tagName).not.toBe('BODY')
  })

  it('lays down no full-viewport overlay', () => {
    // 抽屉只该盖住下半屏。铺一层 fixed inset:0 的遮罩等于把整块画布连同座位环一起糊掉，
    // 而它是半透明的，看上去只是「暗了一点」，不会有人当成 bug。
    renderInline(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <p>内容</p>
      </Sheet>,
    )

    expect(document.querySelector('.sheet-overlay')).toBeNull()
  })

  it('does not lock the page behind it: no body scroll lock, no pointer-events kill', () => {
    // Radix 的模态会把 document.body 的 pointer-events 关掉并锁滚动。
    // 抽屉不是模态：页开着的时候环仍然要能点、轨道仍然要能按。
    const portal = render(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <p>内容</p>
      </Sheet>,
    )
    expect(document.body.style.pointerEvents, 'portal 态本来就锁，这里只是对照组').toBe('none')
    portal.unmount()

    renderInline(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <p>内容</p>
      </Sheet>,
    )

    expect(document.body.style.pointerEvents).not.toBe('none')
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('is a named region rather than a dialog, and can take focus from its host', () => {
    // 不走 Dialog 就没有 role/名字/焦点这些白给的东西，得自己补齐。
    // 说「不是 dialog」同样重要：抽屉外面的环仍可点，宣告成对话框是对读屏撒谎。
    renderInline(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条 · 只读回放" presentation="page">
        <p>内容</p>
      </Sheet>,
    )

    const region = screen.getByRole('region', { name: '本局记录' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(region).toHaveAttribute('tabindex', '-1')
    expect(region).toHaveAccessibleDescription('共23条 · 只读回放')
    expect(screen.getByRole('button', { name: '关闭本局记录' })).toBeInTheDocument()
  })

  it('hands its root to the host, because the host must move focus onto the named node', () => {
    // 宿主自己的容器是匿名的；焦点落在那上面读屏只念一个空盒子，
    // 用户不知道自己刚进了哪一页。
    const claimRoot = vi.fn()
    renderInline(
      <Sheet open onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <p>内容</p>
      </Sheet>,
      { claimRoot },
    )

    expect(claimRoot).toHaveBeenCalledWith(screen.getByRole('region', { name: '本局记录' }))
  })

  it('lets the host override the page name, seat number included', () => {
    // 「更换角色」丢了座位号就不知道在改谁，而这一页写出去的是不可逆的角色变更。
    renderInline(
      <Sheet open onOpenChange={vi.fn()} title="更换角色" description="当前：僧侣" presentation="page">
        <p>内容</p>
      </Sheet>,
      { title: '更换5号角色' },
    )

    expect(screen.getByRole('region', { name: '更换5号角色' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '关闭更换5号角色' })).toBeInTheDocument()
  })

  it('closes through the page own onOpenChange, exactly like the portal branch does', async () => {
    // 关闭键的语义必须两态一致，否则「只换容器」这句话就不成立了。
    const onOpenChange = vi.fn()
    renderInline(
      <Sheet open onOpenChange={onOpenChange} title="本局记录" description="共23条" presentation="page">
        <p>内容</p>
      </Sheet>,
    )

    await userEvent.click(screen.getByRole('button', { name: '关闭本局记录' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('leaves nothing behind when closed', () => {
    // portal 态由 Radix 卸载。内联态若还留着 DOM，抽屉里会叠着一堆关掉的页，
    // 而 peek 档的 inert 会一并盖到它们头上——表现为「上一页的按钮点不动」。
    renderInline(
      <Sheet open={false} onOpenChange={vi.fn()} title="本局记录" description="共23条" presentation="page">
        <button type="button">更正这一条</button>
      </Sheet>,
    )

    expect(screen.queryByText('更正这一条')).toBeNull()
    expect(document.querySelector('.sheet-content')).toBeNull()
  })

  it('drops the trigger, which without a Dialog is a dead key pointing at itself', () => {
    // 夜序总览恒传 trigger。渲染出来就是在这一页里放一个「进入这一页」的按钮，
    // 而且它是 Dialog.Trigger，没有 Dialog 就什么也不会发生。
    renderInline(
      <Sheet
        open
        onOpenChange={vi.fn()}
        title="夜间顺序"
        description="本局 · 12项"
        presentation="page"
        trigger={<button type="button">夜间顺序</button>}
      >
        <p>队列</p>
      </Sheet>,
    )

    expect(screen.queryByRole('button', { name: '夜间顺序' })).toBeNull()
  })

  it('is a one-shot switch: sheets opened from inside the page are still real modals', () => {
    // 这是内联分支最危险的漏法。配板页里的座位编辑器若跟着内联，
    // 它会长在配板页正中间、没有遮罩、盖不住下面的内容，
    // 而说书人以为自己打开了一个模态对话框。
    renderInline(
      <Sheet open onOpenChange={vi.fn()} title="AI配板与调整" description="暗流涌动" presentation="page">
        <Sheet open onOpenChange={vi.fn()} title="更换5号角色" description="当前：僧侣" layer="nested">
          <p>角色列表</p>
        </Sheet>
      </Sheet>,
    )

    const nested = screen.getByRole('dialog')
    expect(nested).toHaveAccessibleName('更换5号角色')
    expect(nested.parentElement?.tagName).toBe('BODY')
    expect(document.querySelector('.sheet-overlay--nested')).not.toBeNull()
  })
})
