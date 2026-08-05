import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DrawerPageHost, type DrawerPageRenderers } from './DrawerPageHost'
import type { DrawerHostedPageId } from './drawerPages'

const pages: DrawerPageRenderers = {
  'timeline-history': () => <button type="button">更正这一条</button>,
  setup: () => <button type="button">确认配板</button>,
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
})
