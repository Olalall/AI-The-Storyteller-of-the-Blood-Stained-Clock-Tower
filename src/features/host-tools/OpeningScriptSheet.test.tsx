import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { OpeningScriptSheet } from './OpeningScriptSheet'
import { defaultOpeningScript, openingScriptStorageKey } from '../../services/opening-script'

const sessionId = 'session-opening-script-test'
const defaultOpeningScriptText = defaultOpeningScript.replaceAll('\n', ' ')

function openSheet() {
  fireEvent.click(screen.getByRole('button', { name: '开场白' }))
}

describe('OpeningScriptSheet', () => {
  beforeEach(() => window.localStorage.clear())

  it('persists an edited local script for the same session after remounting', () => {
    const { unmount } = render(<OpeningScriptSheet sessionId={sessionId} />)
    openSheet()
    fireEvent.click(screen.getByRole('button', { name: '编辑文案' }))
    fireEvent.change(screen.getByLabelText('开场白文案'), { target: { value: '今晚请大家保持好奇。' } })
    fireEvent.click(screen.getByRole('button', { name: '保存文案' }))
    expect(window.localStorage.getItem(openingScriptStorageKey(sessionId))).toBe('今晚请大家保持好奇。')
    fireEvent.click(screen.getByRole('button', { name: '关闭开场白' }))
    unmount()

    render(<OpeningScriptSheet sessionId={sessionId} />)
    openSheet()
    expect(screen.getByLabelText('开场白预览')).toHaveTextContent('今晚请大家保持好奇。')
  })

  it('restores the stable default without touching another session key', () => {
    const otherSessionId = 'session-opening-script-other'
    window.localStorage.setItem(openingScriptStorageKey(otherSessionId), '另一局的开场白')
    render(<OpeningScriptSheet sessionId={sessionId} />)
    openSheet()
    fireEvent.click(screen.getByRole('button', { name: '编辑文案' }))
    fireEvent.change(screen.getByLabelText('开场白文案'), { target: { value: '临时文案' } })
    fireEvent.click(screen.getByRole('button', { name: '保存文案' }))
    fireEvent.click(screen.getByRole('button', { name: '恢复默认' }))

    expect(screen.getByLabelText('开场白预览')).toHaveTextContent(defaultOpeningScriptText)
    expect(window.localStorage.getItem(openingScriptStorageKey(sessionId))).toBeNull()
    expect(window.localStorage.getItem(openingScriptStorageKey(otherSessionId))).toBe('另一局的开场白')
  })

  it('uses a same-page large-text display mode and can exit it', () => {
    render(<OpeningScriptSheet sessionId={sessionId} />)
    openSheet()
    fireEvent.click(screen.getByRole('button', { name: '大字展示' }))
    expect(screen.getByLabelText('开场白大字展示')).toHaveTextContent(defaultOpeningScriptText)
    expect(screen.queryByRole('button', { name: '编辑文案' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '退出展示' }))
    expect(screen.getByLabelText('开场白预览')).toBeVisible()
  })
})
