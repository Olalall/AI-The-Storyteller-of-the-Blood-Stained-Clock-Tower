import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createEmptyGameSession } from '../game-session/data/createPrototypeSession'
import { ScriptLibrarySheet } from './ScriptLibrarySheet'

function renderLibrary() {
  const onSelectScript = vi.fn()
  render(
    <ScriptLibrarySheet
      open
      onOpenChange={vi.fn()}
      session={createEmptyGameSession()}
      onSelectScript={onSelectScript}
    />,
  )
  return onSelectScript
}

describe('ScriptLibrarySheet search', () => {
  it('filters by display name and keeps the matching primary action available', async () => {
    const user = userEvent.setup()
    const onSelectScript = renderLibrary()

    await user.type(screen.getByRole('searchbox', { name: '搜索板子' }), '瓦釜雷鸣')

    expect(screen.getByRole('heading', { name: '瓦釜雷鸣 / Catfishing', level: 4 })).toBeVisible()
    expect(screen.queryByRole('heading', { name: '暗流涌动 / Trouble Brewing', level: 4 })).toBeNull()
    await user.click(screen.getByRole('button', { name: '选择人数开局' }))
    expect(onSelectScript).toHaveBeenCalledExactlyOnceWith('catfishing')
  })

  it('finds scripts by author or stable id', async () => {
    const user = userEvent.setup()
    renderLibrary()
    const search = screen.getByRole('searchbox', { name: '搜索板子' })

    await user.type(search, 'Emily')
    expect(screen.getByRole('heading', { name: '瓦釜雷鸣 / Catfishing', level: 4 })).toBeVisible()

    await user.clear(search)
    await user.type(search, 'trouble-brewing')
    expect(screen.getByRole('heading', { name: '暗流涌动 / Trouble Brewing', level: 4 })).toBeVisible()
  })

  it('shows a clear empty result instead of an empty card list', async () => {
    const user = userEvent.setup()
    renderLibrary()

    await user.type(screen.getByRole('searchbox', { name: '搜索板子' }), '不存在的板子-xyz')

    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('没有找到匹配的板子')
    expect(screen.queryByRole('button', { name: '选择人数开局' })).toBeNull()
  })
})
