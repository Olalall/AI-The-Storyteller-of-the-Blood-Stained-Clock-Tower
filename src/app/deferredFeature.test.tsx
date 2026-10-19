import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { deferredPanel } from './deferredFeature'

function DraftPanel({ open }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [draft, setDraft] = useState('')
  return open ? <input aria-label="测试草稿" value={draft} onChange={(event) => setDraft(event.target.value)} /> : null
}
describe('deferred panels', () => {
  it('keeps the clicked action title and a truthful return label while loading', async () => {
    const Panel = deferredPanel<Parameters<typeof DraftPanel>[0] & { mode: string }>((props) => props.mode, () => new Promise(() => {}))
    const close = vi.fn()
    render(<Panel open mode="重置游戏" onOpenChange={close} />)
    expect(screen.getByRole('dialog', { name: '重置游戏' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '返回本局' })).not.toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole('button', { name: '返回上一步' }))
    expect(close).toHaveBeenCalledWith(false)
  })

  it('does not import a closed panel and preserves its local draft across closing', async () => {
    const load = vi.fn(async () => ({ default: DraftPanel }))
    const Panel = deferredPanel('测试面板', load)
    const props = { open: false, onOpenChange: vi.fn() }
    const view = render(<Panel {...props} />)
    expect(load).not.toHaveBeenCalled()
    view.rerender(<Panel {...props} open />)
    const input = await screen.findByLabelText('测试草稿')
    await userEvent.setup().type(input, '尚未确认的内容')
    view.rerender(<Panel {...props} />)
    expect(screen.queryByLabelText('测试草稿')).not.toBeInTheDocument()
    view.rerender(<Panel {...props} open />)
    expect(await screen.findByLabelText('测试草稿')).toHaveValue('尚未确认的内容')
    expect(load).toHaveBeenCalledTimes(1)
  })
  it('keeps the application available when a chunk cannot load', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      const Panel = deferredPanel<Parameters<typeof DraftPanel>[0]>('测试面板', async () => { throw new Error('Network failed') })
      const close = vi.fn()
      render(<><p>本局仍在</p><Panel open onOpenChange={close} /></>)
      expect(await screen.findByRole('alert')).toHaveTextContent('当前对局未被重置')
      await userEvent.setup().click(screen.getByRole('button', { name: '返回上一步' }))
      expect(close).toHaveBeenCalledWith(false)
      expect(screen.getByText('本局仍在')).toBeInTheDocument()
    } finally { error.mockRestore() }
  })
})
