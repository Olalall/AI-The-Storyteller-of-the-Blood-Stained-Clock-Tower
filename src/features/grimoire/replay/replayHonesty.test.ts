import { describe, expect, it } from 'vitest'
import { replayHonestyNotice } from './replayHonesty'
import type { ReplaySubject } from './writeAccess'

function subject(overrides: Partial<ReplaySubject> = {}): ReplaySubject {
  return {
    hostingMode: 'record',
    hostingModeHistory: [],
    grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 0 },
    ...overrides,
  }
}

describe('诚实条只在会看多的那个方向出现', () => {
  it('stays quiet while the game is still running', () => {
    // 进行中的对局没有「当时」，空白就是此刻的空白，说书人自己知道。
    expect(replayHonestyNotice({ archive: null, viewMode: 'grimoire' })).toBeNull()
  })

  it('stays quiet when a grimoire game is reviewed through the record view', () => {
    // 这个方向只会看得更少，不会看起来更多，没有任何东西需要免责。
    expect(replayHonestyNotice({
      archive: subject({ hostingMode: 'grimoire' }),
      viewMode: 'record',
    })).toBeNull()
  })
})

describe('用魔典视图看笔录局：常驻诚实条', () => {
  const notice = replayHonestyNotice({ archive: subject(), viewMode: 'grimoire' })

  it('says the grimoire was rebuilt after the fact', () => {
    expect(notice?.kind).toBe('cross-mode')
    expect(notice?.title).toContain('事后按记录重建')
  })

  it('separates 没记录 from 没发生 in so many words', () => {
    // 整块诚实条的存在理由就是这一句。它被改成「这局记录不全」之类的笼统说法时，
    // 读的人仍然会把空座位当成「那一夜他没中毒」的证据。
    expect(notice?.body).toContain('当时没有录入')
    expect(notice?.body).toContain('不表示当时没有这个状态')
  })

  it('shows how much was recorded back then, not a vague warning', () => {
    expect(notice?.ledger).toBe('当时录进工具的：12/12 个座位的身份 · 0 次状态变更 · 0 枚标记')
  })

  it('never offers a way to write, and says so', () => {
    expect(notice?.readOnlyNote).toContain('补不了录')
  })
})

describe('混合局：说清哪一段是笔录的', () => {
  const notice = replayHonestyNotice({
    archive: subject({
      hostingMode: 'grimoire',
      hostingModeHistory: [
        { mode: 'record', changedAt: '2026-01-01T00:00:00.000Z', phaseLabel: '开局前' },
        { mode: 'grimoire', changedAt: '2026-01-01T02:00:00.000Z', phaseLabel: '第3夜' },
      ],
      grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 6, markerCount: 2 },
    }),
    viewMode: 'grimoire',
  })

  it('names the phase the grimoire was opened', () => {
    // 混合局最容易被误读：后半局的魔典是真的，于是前半局的空白特别像
    // 「说书人后来才开始认真记」，而不是「前半局本来就不在工具里」。
    expect(notice?.kind).toBe('cross-mode')
    expect(notice?.title).toContain('第3夜起开魔典')
    expect(notice?.body).toContain('当时没有录入')
  })
})

describe('全程魔典局：只剩下只读那一层意思', () => {
  const notice = replayHonestyNotice({
    archive: subject({
      hostingMode: 'grimoire',
      hostingModeHistory: [{ mode: 'grimoire', changedAt: '2026-01-01T00:00:00.000Z', phaseLabel: '开局前' }],
      grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 31, markerCount: 8 },
    }),
    viewMode: 'grimoire',
  })

  it('does not accuse a fully recorded game of hiding anything', () => {
    expect(notice?.kind).toBe('read-only')
    expect(notice?.body).toContain('看到的就是当时录进工具的样子')
    expect(notice?.ledger).toContain('31 次状态变更')
  })
})
