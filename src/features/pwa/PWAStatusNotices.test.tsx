import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PWAStatusNotices } from './PWAStatusNotices'

const sw = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: true,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [sw.offlineReady, sw.setOfflineReady],
    needRefresh: [sw.needRefresh, sw.setNeedRefresh],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

describe('PWAStatusNotices safe update gate', () => {
  beforeEach(() => { sw.offlineReady = false; sw.needRefresh = true; vi.clearAllMocks() })

  it('keeps its first-install slot mounted before and after a late offline-ready notice', async () => {
    sw.needRefresh = false
    const { rerender } = render(<PWAStatusNotices hasStarted={false} />)
    const slot = screen.getByRole('region', { name: '应用运行状态' })
    expect(slot).toBeEmptyDOMElement()
    sw.offlineReady = true
    rerender(<PWAStatusNotices hasStarted={false} />)
    expect(screen.getByRole('region', { name: '应用运行状态' })).toBe(slot)
    expect(screen.getByText('已缓存页面可离线使用，未缓存内容仍需联网。')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: '关闭离线提示' }))
    expect(sw.setOfflineReady).toHaveBeenCalledWith(false)
    sw.offlineReady = false
    rerender(<PWAStatusNotices hasStarted={false} />)
    expect(slot).toBeEmptyDOMElement()
  })

  it('keeps simultaneous offline, ready and protected-update messages complete', () => {
    sw.offlineReady = true
    render(<PWAStatusNotices hasStarted={false} canReload={false} />)
    fireEvent(window, new Event('offline'))
    for (const title of ['当前离线', '离线版本已准备好', '新版本已准备好']) expect(screen.getByText(title)).toBeVisible()
    expect(screen.getByText('本机存档保留，已缓存的页面可继续使用；未缓存资料、AI与云端归档需要联网。')).toBeVisible()
    expect(screen.getByText('请先完成保存并处理编辑保护，再更新应用。')).toBeVisible()
    expect(screen.queryByRole('button', { name: '更新并重开' })).not.toBeInTheDocument()
    expect(sw.updateServiceWorker).not.toHaveBeenCalled()
  })

  it('defers the prompt during a game and offers the same waiting update after the game ends', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<PWAStatusNotices hasStarted />)

    expect(screen.getByText('为避免打断本局，请在本局结束后更新。')).toBeVisible()
    expect(screen.queryByRole('button', { name: '更新并重开' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '本局暂不更新' }))
    expect(screen.queryByText('新版本已准备好')).not.toBeInTheDocument()

    rerender(<PWAStatusNotices hasStarted={false} canReload />)
    expect(screen.getByRole('button', { name: '更新并重开' })).toBeVisible()
    expect(sw.setNeedRefresh).not.toHaveBeenCalled()
  })

  it('blocks updates until pending saves and edit protection have cleared', async () => {
    const { rerender } = render(<PWAStatusNotices hasStarted={false} canReload={false} />)
    expect(screen.queryByRole('button', { name: '更新并重开' })).not.toBeInTheDocument()
    expect(screen.getByText('请先完成保存并处理编辑保护，再更新应用。')).toBeVisible()
    rerender(<PWAStatusNotices hasStarted={false} canReload />)
    expect(screen.getByRole('button', { name: '更新并重开' })).toBeVisible()
  })

  it('only applies the waiting update after an explicit click before a game', async () => {
    const user = userEvent.setup()
    render(<PWAStatusNotices hasStarted={false} canReload />)

    await user.click(screen.getByRole('button', { name: '更新并重开' }))

    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
