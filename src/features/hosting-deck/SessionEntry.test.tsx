import { render, screen } from '@testing-library/react'
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
  it('shows the hosting choice immediately and keeps installation optional', async () => {
    const user = userEvent.setup()
    const props = renderEntry()

    expect(screen.getByRole('heading', { name: '先选择主持方式' })).toBeVisible()
    expect(screen.getByText('安装到主屏幕（可稍后）')).toBeVisible()
    expect(screen.getByRole('button', { name: '继续：选择板子和人数' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '浏览全部板子' })).toBeDisabled()

    const grimoireMode = screen.getByRole('radio', { name: /没有实体魔典/ })
    await user.click(grimoireMode)
    await user.click(screen.getByRole('button', { name: '继续：选择板子和人数' }))

    expect(props.onCompleteInstallIntro).toHaveBeenCalledTimes(1)
    expect(props.onStartSetup).toHaveBeenCalledExactlyOnceWith('grimoire')
  })

  it('records the hosting choice before opening the script library', async () => {
    const user = userEvent.setup()
    const props = renderEntry({ installIntroComplete: true })
    const recordMode = screen.getByRole('radio', { name: /桌上有实体魔典/ })
    await user.click(recordMode)
    await user.click(screen.getByRole('button', { name: '浏览全部板子' }))

    expect(props.onOpenScriptLibrary).toHaveBeenCalledExactlyOnceWith('record')
  })

  it('does not start until the user explicitly chooses a hosting mode', async () => {
    const user = userEvent.setup()
    const props = renderEntry()

    await user.dblClick(screen.getByRole('button', { name: '继续：选择板子和人数' }))

    expect(screen.getByRole('radio', { name: /桌上有实体魔典/ })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: /没有实体魔典/ })).toHaveAttribute('aria-checked', 'false')
    expect(props.onStartSetup).not.toHaveBeenCalled()
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

    await user.click(screen.getByRole('button', { name: '继续：选择板子和人数' }))
    expect(props.onStartSetup).toHaveBeenCalledExactlyOnceWith('record')
  })

  it('keeps the optional install route available when Chromium has no prompt event', async () => {
    const user = userEvent.setup()
    renderEntry()
    await user.click(screen.getByText('安装到主屏幕（可稍后）'))
    expect(screen.getByText(/“安装应用”或“添加到主屏幕”/)).toBeVisible()
    expect(screen.getByRole('button', { name: '以后再说' })).toBeVisible()
  })

  it('opens the full beginner tutorial from the start page', async () => {
    const user = userEvent.setup()
    const props = renderEntry({ installIntroComplete: true })

    await user.click(screen.getByRole('button', { name: '新手教学 · 2分钟看懂一局' }))
    expect(screen.getByRole('heading', { name: '新手教学' })).toBeVisible()
    expect(screen.getByRole('heading', { name: '先选择主持方式' })).toBeVisible()
    expect(screen.getByText('这一步只改变界面，不会创建角色、发送身份或开始夜晚。')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '下一步：生成配板' }))
    expect(props.onStartSetup).not.toHaveBeenCalled()
    expect(props.onOpenScriptLibrary).not.toHaveBeenCalled()
    expect(props.onLoadDemo).not.toHaveBeenCalled()
  })
})
