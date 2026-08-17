import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PWAInstallCard } from './PWAInstallCard'
import { PWAInstallProvider } from './PWAInstallProvider'

describe('PWAInstallCard', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

  it('consumes a dismissed beforeinstallprompt event only once', async () => {
    const user = userEvent.setup()
    const prompt = vi.fn(async () => {})
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'dismissed'; platform: string }>
    }
    event.prompt = prompt
    event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
    render(<PWAInstallProvider><PWAInstallCard /></PWAInstallProvider>)

    act(() => window.dispatchEvent(event))
    await user.click(await screen.findByRole('button', { name: '安装' }))

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: '安装' })).not.toBeInTheDocument()
    expect(await screen.findByText('已取消安装；之后可从浏览器菜单再次选择“安装应用”。')).toBeVisible()
  })

  it('explains the browser-menu fallback when no install prompt is available', () => {
    render(<PWAInstallProvider><PWAInstallCard /></PWAInstallProvider>)

    expect(screen.queryByRole('button', { name: '安装' })).toBeNull()
    expect(screen.getByText(/“安装应用”或“添加到主屏幕”/)).toBeVisible()
  })

  it('keeps an early install event until the install card opens later', async () => {
    const prompt = vi.fn(async () => {})
    const event = new Event('beforeinstallprompt', { cancelable: true }) as Event & {
      prompt: () => Promise<void>
      userChoice: Promise<{ outcome: 'accepted'; platform: string }>
    }
    event.prompt = prompt
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    const view = render(<PWAInstallProvider><span>主持中</span></PWAInstallProvider>)

    act(() => window.dispatchEvent(event))
    view.rerender(<PWAInstallProvider><PWAInstallCard /></PWAInstallProvider>)
    await userEvent.click(await screen.findByRole('button', { name: '安装' }))

    expect(prompt).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('已安装到本机')).toBeVisible()
  })

  it('shows the browser-menu add-to-home-screen path on iPhone Safari', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1')
    render(<PWAInstallProvider><PWAInstallCard /></PWAInstallProvider>)

    expect(screen.getByText(/浏览器的“分享”或菜单，选择“添加到主屏幕”/)).toBeVisible()
    expect(screen.queryByRole('button', { name: '安装' })).toBeNull()
  })

  it('does not claim iPhone Chrome must be replaced with Safari', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/140.0 Mobile/15E148 Safari/604.1')
    render(<PWAInstallProvider><PWAInstallCard /></PWAInstallProvider>)

    expect(screen.getByText(/浏览器的“分享”或菜单，选择“添加到主屏幕”/)).toBeVisible()
    expect(screen.getByText(/没有入口可再尝试 Safari/)).toBeVisible()
    expect(screen.queryByText('请改用 Safari')).toBeNull()
  })

  it('only shows a compact installed status in standalone mode', () => {
    const matchMedia = vi.fn((query: string) => ({
      matches: query === '(display-mode: standalone)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
    vi.stubGlobal('matchMedia', matchMedia)
    render(<PWAInstallProvider><PWAInstallCard compact /></PWAInstallProvider>)

    expect(screen.getByText('已安装到本机')).toBeVisible()
    expect(screen.queryByRole('button', { name: '安装' })).toBeNull()
  })
})
