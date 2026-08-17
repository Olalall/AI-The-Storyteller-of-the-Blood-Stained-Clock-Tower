import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { createEmptyGameSession } from '../game-session/data/createPrototypeSession'
import { PWAInstallProvider } from '../pwa/PWAInstallProvider'
import { SessionEntry } from './SessionEntry'

function renderEntry(overrides: Partial<ComponentProps<typeof SessionEntry>> = {}) {
  const props: ComponentProps<typeof SessionEntry> = {
    session: createEmptyGameSession(),
    onImportSession: vi.fn(),
    installIntroComplete: false,
    firstRun: true,
    onCompleteInstallIntro: vi.fn(),
    onStartSetup: vi.fn(),
    onOpenScriptLibrary: vi.fn(),
    onLoadDemo: vi.fn(),
    ...overrides,
  }
  render(<PWAInstallProvider><SessionEntry {...props} /></PWAInstallProvider>)
  return props
}

describe('SessionEntry onboarding', () => {
  it('moves a new user from optional install to an explicit hosting choice', async () => {
    const user = userEvent.setup()
    const props = renderEntry()

    expect(screen.getByRole('heading', { name: '安装到当前设备' })).toBeVisible()
    expect(screen.queryByRole('button', { name: '开始配板' })).toBeNull()

    await user.click(screen.getByRole('button', { name: '暂不安装，先试用' }))

    expect(props.onCompleteInstallIntro).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { name: '选择你的主持方式' })).toBeVisible()
    expect(screen.getByRole('button', { name: '开始配板' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '先浏览板子' })).toBeDisabled()

    const grimoireMode = screen.getByRole('radio', { name: /没有实体魔典/ })
    await waitFor(() => expect(grimoireMode).toBeEnabled())
    await user.click(grimoireMode)
    await user.click(screen.getByRole('button', { name: '开始配板' }))

    expect(props.onStartSetup).toHaveBeenCalledExactlyOnceWith('grimoire')
  })

  it('records the hosting choice before opening the script library', async () => {
    const user = userEvent.setup()
    const props = renderEntry({ installIntroComplete: true })
    const recordMode = screen.getByRole('radio', { name: /桌上有实体魔典/ })
    await user.click(recordMode)
    await user.click(screen.getByRole('button', { name: '先浏览板子' }))

    expect(props.onOpenScriptLibrary).toHaveBeenCalledExactlyOnceWith('record')
  })

  it('does not let a double click on continue choose a hosting mode on the next screen', async () => {
    const user = userEvent.setup()
    renderEntry()

    await user.dblClick(screen.getByRole('button', { name: '暂不安装，先试用' }))

    expect(screen.getByRole('radio', { name: /桌上有实体魔典/ })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: /没有实体魔典/ })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('button', { name: '开始配板' })).toBeDisabled()
  })

  it('sends a returning user straight to the compact start action', async () => {
    const user = userEvent.setup()
    const props = renderEntry({
      installIntroComplete: true,
      firstRun: false,
      defaultHostingMode: 'record',
    })

    expect(screen.getByRole('heading', { name: '开始一局新的主持' })).toBeVisible()
    expect(screen.getByLabelText('当前主持方式')).toHaveTextContent('实体魔典 + 工具记录')
    expect(screen.queryByRole('radio')).toBeNull()

    await user.click(screen.getByRole('button', { name: '开始配板' }))
    expect(props.onStartSetup).toHaveBeenCalledExactlyOnceWith('record')
  })

  it('keeps the install route available when Chromium has no prompt event', () => {
    renderEntry()
    expect(screen.getByText(/“安装应用”或“添加到主屏幕”/)).toBeVisible()
    expect(screen.getByText(/之后仍可在“应用设置”中找到安装入口/)).toBeVisible()
  })

  it('always renders the CSS-driven narrow-screen explanation without a viewport prop', () => {
    renderEntry({ installIntroComplete: true })

    const note = screen.getByText(/手机窄屏/)
    expect(note).toHaveAttribute('role', 'note')
    expect(note).toHaveClass('session-entry__narrow-note')
  })
})
