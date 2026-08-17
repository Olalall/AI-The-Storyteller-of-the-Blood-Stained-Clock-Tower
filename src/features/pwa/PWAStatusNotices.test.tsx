import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PWAStatusNotices } from './PWAStatusNotices'

const sw = vi.hoisted(() => ({
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}))

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [false, sw.setOfflineReady],
    needRefresh: [true, sw.setNeedRefresh],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}))

describe('PWAStatusNotices safe update gate', () => {
  it('defers the prompt during a game and offers the same waiting update after the game ends', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<PWAStatusNotices hasStarted />)

    expect(screen.getByText('为避免打断本局，请在本局结束后更新。')).toBeVisible()
    expect(screen.queryByRole('button', { name: '更新并重开' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '本局暂不更新' }))
    expect(screen.queryByText('新版本已准备好')).not.toBeInTheDocument()

    rerender(<PWAStatusNotices hasStarted={false} />)
    expect(screen.getByRole('button', { name: '更新并重开' })).toBeVisible()
    expect(sw.setNeedRefresh).not.toHaveBeenCalled()
  })

  it('only applies the waiting update after an explicit click before a game', async () => {
    const user = userEvent.setup()
    render(<PWAStatusNotices hasStarted={false} />)

    await user.click(screen.getByRole('button', { name: '更新并重开' }))

    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true)
  })
})
