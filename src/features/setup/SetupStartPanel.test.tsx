import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { scriptManifest, type ScriptId } from '../../domain/scripts'
import { SetupStartPanel } from './SetupStartPanel'
import { chineseDisplayName } from './setupPresentation'

function renderStartPanel() {
  const onScriptChange = vi.fn()
  const onStart = vi.fn()
  function Harness() {
    const [scriptId, setScriptId] = useState<ScriptId>('catfishing')
    const scriptName = chineseDisplayName(scriptManifest.find((pack) => pack.scriptId === scriptId)!.displayName)
    return <SetupStartPanel scriptId={scriptId} scriptName={scriptName} onScriptChange={(nextId) => { setScriptId(nextId); onScriptChange(nextId) }} onStart={onStart} />
  }
  render(<Harness />)
  return { onScriptChange, onStart, search: screen.getByRole('searchbox', { name: '搜索板子' }), select: screen.getByRole('combobox', { name: '开局板子' }) }
}

describe('SetupStartPanel script search', () => {
  beforeEach(() => window.localStorage.clear())

  it('lists the full catalog and filters Chinese names without changing the chosen script', () => {
    const { search, select, onScriptChange, onStart } = renderStartPanel()
    expect(within(select).getAllByRole('option')).toHaveLength(scriptManifest.length)
    expect(screen.getByRole('status')).toHaveTextContent(`共 ${scriptManifest.length} 个板子`)
    fireEvent.change(search, { target: { value: '疯帽' } })
    expect(within(select).getByRole('option', { name: '疯帽之宴' })).toHaveValue('feng-mao-zhi-yan')
    expect(within(select).getAllByRole('option')).toHaveLength(2)
    expect(select).toHaveValue('catfishing')
    expect(screen.getByRole('status')).toHaveTextContent('找到 1 个板子 · 当前选择仍为瓦釜雷鸣')
    expect(onScriptChange).not.toHaveBeenCalled()
    expect(onStart).not.toHaveBeenCalled()
  })

  it('matches existing English names case-insensitively and ignores surrounding spaces', () => {
    const { search, select } = renderStartPanel()
    fireEvent.change(search, { target: { value: '  cAtFiShInG  ' } })
    expect(within(select).getAllByRole('option')).toHaveLength(1)
    expect(within(select).getByRole('option', { name: '瓦釜雷鸣' })).toHaveValue('catfishing')
    expect(select).toHaveValue('catfishing')
  })

  it('also accepts stable English IDs without changing them into display names', () => {
    const { search, select, onScriptChange } = renderStartPanel()
    fireEvent.change(search, { target: { value: 'YAN-BU-YOU-ZHONG' } })
    fireEvent.change(select, { target: { value: 'yan-bu-you-zhong' } })
    expect(onScriptChange).toHaveBeenCalledExactlyOnceWith('yan-bu-you-zhong')
    expect(select).toHaveValue('yan-bu-you-zhong')
    expect(within(select).getAllByRole('option')).toHaveLength(1)
    expect(within(select).getByRole('option', { name: '言不由衷' })).toBeInTheDocument()
  })

  it('announces no results, keeps the current choice, and restores the catalog when cleared', () => {
    const { search, select, onScriptChange } = renderStartPanel()
    fireEvent.change(search, { target: { value: '不存在的板子XYZ' } })
    expect(screen.getByRole('status')).toHaveTextContent('没有匹配的板子，请换个关键词或清除搜索。')
    expect(select).toBeDisabled()
    expect(select).toHaveValue('catfishing')
    expect(within(select).getByRole('option', { name: '当前选择：瓦釜雷鸣' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '清除搜索' }))
    expect(search).toHaveValue('')
    expect(search).toHaveFocus()
    expect(select).toBeEnabled()
    expect(within(select).getAllByRole('option')).toHaveLength(scriptManifest.length)
    expect(select).toHaveValue('catfishing')
    expect(onScriptChange).not.toHaveBeenCalled()
  })

  it('preserves player inputs while searching and starts only after the explicit action', () => {
    const { search, select, onStart } = renderStartPanel()
    fireEvent.click(screen.getByRole('button', { name: '15人' }))
    fireEvent.change(screen.getByRole('textbox', { name: '1号昵称' }), { target: { value: '保留昵称' } })
    fireEvent.change(screen.getByRole('combobox', { name: '1号经验' }), { target: { value: 'new' } })
    fireEvent.change(search, { target: { value: '疯帽' } })
    fireEvent.change(select, { target: { value: 'feng-mao-zhi-yan' } })
    fireEvent.click(screen.getByRole('button', { name: '清除搜索' }))
    expect(screen.getByRole('textbox', { name: '1号昵称' })).toHaveValue('保留昵称')
    expect(screen.getByRole('combobox', { name: '1号经验' })).toHaveValue('new')
    expect(onStart).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '开始配板' }))
    expect(onStart).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ playerCount: 15, seats: expect.arrayContaining([{ seatId: 1, nickname: '保留昵称', experience: 'new' }]) }))
  })
})
