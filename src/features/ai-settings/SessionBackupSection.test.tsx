import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../game-session/data/createPrototypeSession'
import { SessionBackupSection } from './SessionBackupSection'

function jsonFile(name: string, raw: string) {
  const file = new File([raw], name, { type: 'application/json' })
  Object.defineProperty(file, 'text', { value: async () => raw })
  return file
}

function deferredJsonFile(name: string) {
  let resolveText!: (raw: string) => void
  const text = new Promise<string>((resolve) => { resolveText = resolve })
  const file = new File(['pending'], name, { type: 'application/json' })
  Object.defineProperty(file, 'text', { value: () => text })
  return { file, resolveText }
}

describe('SessionBackupSection', () => {
  it('previews an imported session before the explicit replacement confirmation', async () => {
    const user = userEvent.setup()
    const current = createPrototypeGameSession()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const onImportSession = vi.fn()
    render(<SessionBackupSection session={current} onImportSession={onImportSession} />)

    await user.upload(screen.getByLabelText('选择备份文件'), jsonFile('backup.json', JSON.stringify(imported)))

    expect(await screen.findByLabelText('待恢复对局摘要')).toBeVisible()
    expect(screen.getByText('尚未写入')).toBeVisible()
    expect(onImportSession).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: '确认恢复这份对局' }))

    expect(onImportSession).toHaveBeenCalledWith(imported)
  })

  it('shows a readable error and never replaces the session for a damaged file', async () => {
    const user = userEvent.setup()
    const onImportSession = vi.fn()
    render(<SessionBackupSection session={createPrototypeGameSession()} onImportSession={onImportSession} />)

    await user.upload(screen.getByLabelText('选择备份文件'), jsonFile('broken.json', '{broken'))

    expect(await screen.findByText('文件不是有效的 JSON，可能已损坏或未完整下载。')).toBeVisible()
    expect(onImportSession).not.toHaveBeenCalled()
  })

  it('does not show false success when the durable import callback fails', async () => {
    const user = userEvent.setup()
    const imported = { ...createPrototypeGameSession(), id: 'imported-session' }
    const onImportSession = vi.fn(() => { throw new Error('本机空间不足，当前对局没有被替换。') })
    render(<SessionBackupSection session={createPrototypeGameSession()} onImportSession={onImportSession} />)

    await user.upload(screen.getByLabelText('选择备份文件'), jsonFile('backup.json', JSON.stringify(imported)))
    await user.click(await screen.findByRole('button', { name: '确认恢复这份对局' }))

    expect(screen.getByText('本机空间不足，当前对局没有被替换。')).toBeVisible()
    expect(screen.queryByText('已恢复这份对局备份。')).not.toBeInTheDocument()
    expect(screen.getByLabelText('待恢复对局摘要')).toBeVisible()
  })

  it('keeps the newest file when an older slow read finishes last', async () => {
    const user = userEvent.setup()
    const first = deferredJsonFile('first.json')
    const second = deferredJsonFile('second.json')
    const firstSession = { ...createPrototypeGameSession(), id: 'first-session', scriptId: 'first-script' }
    const secondSession = { ...createPrototypeGameSession(), id: 'second-session', scriptId: 'second-script' }
    const onImportSession = vi.fn()
    render(<SessionBackupSection session={createPrototypeGameSession()} onImportSession={onImportSession} />)
    const input = screen.getByLabelText('选择备份文件')

    await user.upload(input, first.file)
    await user.upload(input, second.file)
    second.resolveText(JSON.stringify(secondSession))
    expect(await screen.findByLabelText('待恢复对局摘要')).toBeVisible()
    expect(screen.getByText('second-script')).toBeVisible()
    first.resolveText(JSON.stringify(firstSession))
    await new Promise((resolve) => window.setTimeout(resolve, 0))
    await waitFor(() => expect(screen.getByText('second-script')).toBeVisible())
    expect(screen.queryByText('first-script')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '确认恢复这份对局' }))
    expect(onImportSession).toHaveBeenCalledWith(secondSession)
  })
})
