import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { exportSessionJson, sessionExportFilename } from './exportSession'

const NOW = '2026-08-06T01:23:45.678Z'

describe('导出本局 JSON', () => {
  let clicked: HTMLAnchorElement | null = null

  beforeEach(() => {
    clicked = null
    vi.stubGlobal('URL', { ...URL, createObjectURL: () => 'blob:stub', revokeObjectURL: () => undefined })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicked = this
    })
  })
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

  it('names the file by game and timestamp so repeated exports stay distinguishable', () => {
    // 说书人一晚上可能导出好几次；重名会让「哪份是新的」无从判断。
    const session = createPrototypeGameSession()
    const name = sessionExportFilename(session, NOW)

    expect(name).toContain(session.id)
    expect(name).not.toContain(':')
    expect(name.endsWith('.json')).toBe(true)
  })

  it('writes the session out and cleans up the anchor it created', () => {
    exportSessionJson(createPrototypeGameSession(), NOW)

    expect(clicked).not.toBeNull()
    expect(clicked!.download).toContain('botc-session-')
    // 锚点必须被移除，否则每导出一次页面上就多一个隐形链接。
    expect(document.querySelector('a[download]')).toBeNull()
  })

  it('needs no archive, no backend and no finished game', () => {
    // 它必须在最需要它的时刻可用：打到一半、后端连不上、刚看见「存档读不出」。
    const midGame = createPrototypeGameSession()
    expect(() => exportSessionJson(midGame, NOW)).not.toThrow()
  })

  it('exports the session verbatim rather than a summary', () => {
    const session = createPrototypeGameSession()
    let written = ''
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) { written = parts.join('') }
    })

    exportSessionJson(session, NOW)

    expect(JSON.parse(written)).toEqual(session)
  })

  it('keeps the JSON human-readable', () => {
    // 这份文件的用途之一是出问题时人来读；压缩掉换行会让它没法看。
    let written = ''
    vi.stubGlobal('Blob', class {
      constructor(parts: string[]) { written = parts.join('') }
    })

    exportSessionJson(createPrototypeGameSession(), NOW)

    expect(written).toContain('\n  ')
  })
})
