import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadSmartScriptPack } from '../domain/scripts'
import { useScriptRequest } from './useScriptRequest'

vi.mock('../domain/scripts', () => ({ loadSmartScriptPack: vi.fn(), scriptDisplayName: () => '目标板子' }))
const currentSession = {}
function Harness({ onReady }: { onReady: () => void }) {
  const request = useScriptRequest(currentSession)
  return <><p>原配板仍在</p><button onClick={() => { void request.run('target', onReady, '返回配板') }}>选择目标板</button>{request.feedback}</>
}

describe('script loading navigation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can return to the original panel and ignores the late completion', async () => {
    let finish!: () => void
    vi.mocked(loadSmartScriptPack).mockReturnValue(new Promise((resolve) => { finish = () => resolve(undefined as never) }))
    const ready = vi.fn()
    render(<Harness onReady={ready} />)
    fireEvent.click(screen.getByRole('button', { name: '选择目标板' }))
    expect(screen.getByRole('dialog', { name: '加载剧本：目标板子' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '返回配板' }))
    await act(async () => finish())
    expect(ready).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('原配板仍在')).toBeInTheDocument()
  })

  it('keeps a return path on load failure without running the navigation callback', async () => {
    vi.mocked(loadSmartScriptPack).mockRejectedValue(new Error('Offline'))
    const ready = vi.fn()
    render(<Harness onReady={ready} />)
    fireEvent.click(screen.getByRole('button', { name: '选择目标板' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '返回配板' }))
    expect(ready).not.toHaveBeenCalled()
    expect(screen.getByText('原配板仍在')).toBeInTheDocument()
  })

  it('navigates once only after the chosen script has loaded', async () => {
    vi.mocked(loadSmartScriptPack).mockResolvedValue(undefined as never)
    const ready = vi.fn()
    render(<Harness onReady={ready} />)
    fireEvent.click(screen.getByRole('button', { name: '选择目标板' }))
    await waitFor(() => expect(ready).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
