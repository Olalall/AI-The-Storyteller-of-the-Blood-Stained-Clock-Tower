import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from '../../../components/ui/Sheet'
import { DrawerPageHost, type DrawerPageRenderers } from './DrawerPageHost'
import type { DrawerHostedPageId } from './drawerPages'

const pages: DrawerPageRenderers = {
  'timeline-history': () => <button type="button">更正这一条</button>,
  setup: () => <button type="button">确认配板</button>,
}

/** 这一页长得和真页一样：根是 `<Sheet presentation="page">`，页头与副标题都由它自己出。 */
function sheetRootedPage(onOpenChange = vi.fn(), extra?: ReactNode) {
  return () => (
    <Sheet open onOpenChange={onOpenChange} title="本局记录" description="共23条 · 只读回放" presentation="page">
      <button type="button">更正这一条</button>
      {extra}
    </Sheet>
  )
}

function renderHosted(onClose = vi.fn(), page = sheetRootedPage()) {
  return render(<DrawerPageHost pageId="timeline-history" pages={{ 'timeline-history': page }} gestureContract="x" onClose={onClose} />)
}

function renderHost(pageId: DrawerHostedPageId | null, onClose = vi.fn()) {
  return render(
    <DrawerPageHost pageId={pageId} pages={pages} gestureContract="点座位 = 打开座位卡" onClose={onClose}>
      <button type="button">步骤台</button>
    </DrawerPageHost>,
  )
}

describe('DrawerPageHost', () => {
  it('shows the step deck and stays at peek while no page is open', () => {
    // 用 getByText 而不是 getByRole：peek 档下 body 是 inert 的，
    // 整块内容都不在无障碍树上——这正是 peek 该有的样子，不是缺陷。
    renderHost(null)

    expect(screen.getByText('步骤台')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '窥视')
  })

  it('jumps to the page default detent when a page opens', () => {
    // 页是按整页排版的；开在 peek 或 half 会把它压进一条缝，说书人以为页坏了。
    const { rerender } = renderHost(null)
    rerender(
      <DrawerPageHost pageId="timeline-history" pages={pages} gestureContract="x" onClose={vi.fn()}>
        <button type="button">步骤台</button>
      </DrawerPageHost>,
    )

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '全屏')
    expect(screen.getByRole('button', { name: '更正这一条' })).toBeInTheDocument()
  })

  it('re-applies the default detent on every page switch, not just the first open', async () => {
    // 说书人在 A 页把抽屉拖矮过；切到 B 页时如果沿用那一档，
    // B 页就会开成一条缝——「上一页留下的高度」不是任何一页的属性。
    const { rerender } = renderHost('timeline-history')
    const handle = screen.getByRole('slider')
    handle.focus()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    expect(handle).toHaveAttribute('aria-valuetext', '窥视')

    rerender(
      <DrawerPageHost pageId="setup" pages={pages} gestureContract="x" onClose={vi.fn()}>
        <button type="button">步骤台</button>
      </DrawerPageHost>,
    )

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '全屏')
  })

  it('gives the drawer back the detent it had before the page opened', () => {
    // 关掉本局记录之后抽屉若留在 full，整块画布继续被挡着，
    // 而说书人刚做完的动作是「关掉」——他要的正是重新看见环。
    const { rerender } = renderHost(null)
    const openWith = (pageId: DrawerHostedPageId | null) => rerender(
      <DrawerPageHost pageId={pageId} pages={pages} gestureContract="x" onClose={vi.fn()}>
        <button type="button">步骤台</button>
      </DrawerPageHost>,
    )

    openWith('timeline-history')
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '全屏')
    openWith(null)

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '窥视')
    expect(screen.getByText('步骤台')).toBeInTheDocument()
  })

  it('does not fight the storyteller who drags the drawer while a page is open', async () => {
    // 定档只发生在换页那一下。每次渲染都复位的话，页里任何一次 setState
    // 都会把手动拖矮的抽屉弹回 full。
    renderHost('setup')
    const handle = screen.getByRole('slider')
    handle.focus()

    await userEvent.keyboard('{ArrowDown}')

    expect(handle).toHaveAttribute('aria-valuetext', '半屏')
  })

  it('supplies the page name and a close key the drawer itself has no place for', async () => {
    // Sheet 头部原来提供页名与关闭键；换成抽屉后这两样必须由容器补上，
    // 否则页进了抽屉就没有出口，而页组件本身不许改。
    const onClose = vi.fn()
    renderHost('timeline-history', onClose)

    expect(screen.getByRole('heading', { name: '本局记录' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: '关闭本局记录' }))

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('still closes on Escape after the page leaves the Radix dialog behind', async () => {
    // Esc 关页是 Sheet 白给的，页搬进抽屉后会静默消失——没有报错、没有视觉变化，
    // 只是键盘用户按 Esc 没反应，然后得用 Tab 一路找到关闭键。
    const onClose = vi.fn()
    renderHost('timeline-history', onClose)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not swallow Escape while the drawer holds no page', async () => {
    // 没开页时 Esc 属于画布（双指遮蔽的键盘等价路径之类），抽屉不该抢。
    const onClose = vi.fn()
    renderHost(null, onClose)
    screen.getByRole('slider').focus()

    await userEvent.keyboard('{Escape}')

    expect(onClose).not.toHaveBeenCalled()
  })

  it('lets a seat-specific page keep its seat number in the title', () => {
    // 「更换角色」丢了座位号就不知道在改谁，而这一页写出去的是不可逆的角色变更。
    render(
      <DrawerPageHost pageId="role-change" pages={pages} gestureContract="x" title="更换5号角色" onClose={vi.fn()} />,
    )

    expect(screen.getByRole('heading', { name: '更换5号角色' })).toBeInTheDocument()
  })

  it('says so out loud when a page has no renderer wired up', () => {
    // 静默空白会被当成「这一页坏了」；真实原因是调用方漏挂了一页，两者修法完全不同。
    render(<DrawerPageHost pageId="game-end" pages={pages} gestureContract="x" onClose={vi.fn()} />)

    // 缺页提示与手势契约都是 role="status"，按角色取会撞上；按文字取的同时
    // 顺带断言它确实挂在 status 上，否则读屏不会播报这条。
    const missing = screen.getByText(/还没有接进抽屉/)
    expect(missing).toHaveAttribute('role', 'status')
    expect(missing.textContent).toContain('结束与复盘')
  })

  it('moves focus into the page, because the drawer is not a modal with a focus trap', () => {
    // 页从 Radix Dialog 搬进抽屉后就失去了焦点陷阱；不主动移焦，
    // 键盘用户会留在画布上，读屏也不会播报刚打开的是哪一页。
    renderHost('setup')

    expect(document.activeElement).toHaveAttribute('aria-label', 'AI配板与调整')
  })

  it('keeps page content out of the tab order once the drawer is back at peek', async () => {
    // peek 档下页内容还留在焦点序列里，等于键盘能操作一块看不见的面。
    const { container } = renderHost('setup')
    const handle = screen.getByRole('slider')
    handle.focus()
    await userEvent.keyboard('{Home}')

    expect(handle).toHaveAttribute('aria-valuetext', '窥视')
    expect(container.querySelector('.work-drawer__body')).toHaveAttribute('inert')
    // 页里那颗按钮既要在 DOM 里（页没被卸载，档位一升回来就在），又要在 inert 里面。
    expect(screen.getByText('确认配板').closest('[inert]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: '确认配板' })).toBeNull()
  })

  it('gives the focus back to whatever opened the page', async () => {
    // Radix Dialog 白给这一条。抽屉不是 Dialog：不还焦点，键盘用户关掉本局记录之后
    // 会被丢回 document.body，得从轨道最左边重新 Tab 一遍才回到自己刚才那颗键。
    const { rerender } = render(
      <>
        <button type="button">本局记录</button>
        <DrawerPageHost pageId={null} pages={pages} gestureContract="x" onClose={vi.fn()} />
      </>,
    )
    const opener = screen.getByRole('button', { name: '本局记录' })
    opener.focus()

    const show = (pageId: DrawerHostedPageId | null) => rerender(
      <>
        <button type="button">本局记录</button>
        <DrawerPageHost pageId={pageId} pages={pages} gestureContract="x" onClose={vi.fn()} />
      </>,
    )
    show('timeline-history')
    expect(document.activeElement).not.toBe(opener)
    show(null)

    expect(document.activeElement).toBe(opener)
  })
})

describe('DrawerPageHost 承接根是 Sheet 的既有全屏页', () => {
  it('holds the page inside the drawer DOM instead of letting Radix portal it onto the ring', () => {
    // 这一条是整批的验收点。页 portal 到 body 时截图上一切正常——页显示着、
    // 抽屉也在——但抽屉的高度、overflow、inert 对它全部失效，
    // 而 .sheet-overlay 是 fixed 铺满视口，座位环被整块糊掉。
    const { container } = renderHosted()

    const body = container.querySelector('.work-drawer__body')
    const page = document.querySelector('.sheet-content')
    expect(page).not.toBeNull()
    expect(body?.contains(page)).toBe(true)
    expect(document.querySelector('.sheet-overlay')).toBeNull()
  })

  it('puts the page under the drawer height and the drawer scroll container', async () => {
    // 「抽屉的高度与滚动对它生效」不是修辞：高度写在 .work-drawer 的行内样式上，
    // 滚动写在 .work-drawer__body 的 overflow 上。页必须落在这两层里面。
    // 不比对具体数值（那是 detents 的事），比对的是**改档真的改到了包着页的那个盒子**——
    // portal 出去时那个盒子照样会变高变矮，只是页不在里面。
    const { container } = renderHosted()
    const page = document.querySelector('.sheet-content')
    const boxAroundPage = page?.closest('.work-drawer') as HTMLElement | null

    expect(page?.closest('.work-drawer__body')).toBe(container.querySelector('.work-drawer__body'))
    const atFull = boxAroundPage?.style.height
    screen.getByRole('slider').focus()
    await userEvent.keyboard('{Home}')

    expect(atFull).toBeTruthy()
    expect(boxAroundPage?.style.height).not.toBe(atFull)
  })

  it('freezes the page along with the drawer at peek', async () => {
    // portal 出去的页不会被 inert 盖到：抽屉收到 96px 之后，
    // 一块看不见的整页仍然可以 Tab、可以点、可以落账。
    renderHosted()
    const handle = screen.getByRole('slider')
    handle.focus()
    await userEvent.keyboard('{Home}')

    expect(handle).toHaveAttribute('aria-valuetext', '窥视')
    expect(document.querySelector('.sheet-content')?.closest('[inert]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: '更正这一条' })).toBeNull()
  })

  it('shows exactly one page head, the one the page brought with it', () => {
    // 宿主再画一份就是两个标题两颗关闭键，读屏把同一页念两遍。
    // 而副标题只有页自己知道（「共23条 · 只读回放」随子态变），宿主画不出来。
    renderHosted()

    expect(screen.getAllByRole('heading', { name: '本局记录' })).toHaveLength(1)
    expect(screen.getAllByRole('button', { name: /^关闭/ })).toHaveLength(1)
    expect(screen.getByText('共23条 · 只读回放')).toBeInTheDocument()
  })

  it('still draws a head for a page that is not Sheet-rooted', () => {
    // 兜底不能丢：渲染函数交出的不是 Sheet 时没人出页名与关闭键，
    // 页进了抽屉就没有出口。
    const onClose = vi.fn()
    render(<DrawerPageHost pageId="setup" pages={pages} gestureContract="x" onClose={onClose} />)

    expect(screen.getByRole('heading', { name: 'AI配板与调整' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '关闭AI配板与调整' })).toBeInTheDocument()
  })

  it('lands focus on the named page root, not on an anonymous container', () => {
    // 焦点落在匿名容器上时读屏只念一个空盒子，用户不知道自己进了哪一页。
    renderHosted()

    expect(document.activeElement).toBe(screen.getByRole('region', { name: '本局记录' }))
  })

  it('names the page exactly once for screen readers', () => {
    // 宿主容器与页内联根同名的话，读屏会连着念两个同名区域，
    // 用户以为自己开了两页，也不知道该在哪一层找关闭键。
    renderHosted()

    expect(screen.getAllByRole('region', { name: '本局记录' })).toHaveLength(1)
  })

  it('closes on Escape pressed inside the page', async () => {
    const onClose = vi.fn()
    renderHosted(onClose)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not close the page when Escape dismisses a modal opened from inside it', async () => {
    // 嵌套 Sheet 被 portal 到 body，但 React 合成事件仍沿组件树冒回宿主，
    // 这个 handler 确实会收到它。唯一拦住它的是 Radix 在捕获阶段打的 defaultPrevented——
    // 那句判断一删，在座位编辑器里按一下 Esc 就会连带关掉整张页，
    // 而说书人想撤的永远是最内层刚打开的那一个。
    const onClose = vi.fn()
    const onNestedOpenChange = vi.fn()
    const nested = (
      <Sheet open onOpenChange={onNestedOpenChange} title="更换5号角色" description="当前：僧侣" layer="nested">
        <button type="button">圣徒</button>
      </Sheet>
    )
    renderHosted(onClose, sheetRootedPage(vi.fn(), nested))
    screen.getByRole('button', { name: '圣徒' }).focus()

    await userEvent.keyboard('{Escape}')

    expect(onNestedOpenChange, '最内层那一个必须关掉').toHaveBeenCalledWith(false)
    expect(onClose, '整张页不该跟着一起关').not.toHaveBeenCalled()
  })
})
