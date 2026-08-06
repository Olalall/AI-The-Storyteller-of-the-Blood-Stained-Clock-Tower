import { beforeEach, describe, expect, it } from 'vitest'
import { createPrototypeGameSession } from '../../features/game-session/data/createPrototypeSession'
import { projectCurrentPlayerStates } from '../../features/game-session/state/projectors'
import { gameSessionReducer } from '../../features/game-session/state/sessionReducer'
import { archiveGame, createGameArchiveRecord, listArchives, resetArchiveAdapter } from './archiveService'
import { hydrateArchiveAnnotations, migrateArchiveRecord, migrateArchiveRecords } from './archiveMigration'
import { gameArchiveStorageKey } from './localArchiveAdapter'
import type { GameSessionState } from '../../features/game-session/types'
import type { GameArchiveRecord } from './types'

/** 一条按旧格式写下的归档：没有 schemaVersion，也没有三个标注字段。 */
function legacyArchiveBlob(session: GameSessionState) {
  const record = createGameArchiveRecord({ session, winner: 'good', archiveId: 'legacy-1', archivedAt: '2026-01-02T03:04:05.000Z' })
  const legacy = { ...record } as Partial<GameArchiveRecord>
  delete legacy.schemaVersion
  delete legacy.hostingMode
  delete legacy.hostingModeHistory
  delete legacy.grimoireCompleteness
  return legacy
}

/** 让完整度的四个数字全都不是 0，否则「有没有算」与「算出来是 0」分不开。 */
function sessionWithOneStateChange(): GameSessionState {
  const base = createPrototypeGameSession()
  const before = projectCurrentPlayerStates(base)[5]
  return gameSessionReducer(base, {
    type: 'confirm-player-state-change',
    seatId: 5,
    expectedBefore: before,
    after: { ...before, life: 'dead', markers: [{ id: 'm-1', label: '僧侣保护', placedInSegmentId: null }] },
    segmentId: null,
    entryId: 'state-change-1',
    confirmedAt: '2026-01-01T00:00:00.000Z',
    reason: '测试用的一次状态变更',
  })
}

describe('归档 1→2 迁移：旧归档补 record，不许猜成 grimoire', () => {
  beforeEach(() => {
    resetArchiveAdapter()
    window.localStorage.clear()
  })

  it('fills a pre-annotation archive with record, never grimoire', () => {
    // 这是整条迁移的要害。hostingMode 是随魔典模式一起加进来的字段，
    // 在它存在之前主持的每一局都只能是纯记录模式；把旧归档标成魔典局，
    // 等于给一批从没打开过魔典的对局发一张「开了魔典却只录三个座位」的成绩单。
    const migrated = migrateArchiveRecord(legacyArchiveBlob(createPrototypeGameSession()))

    expect(migrated?.hostingMode).toBe('record')
    expect(migrated?.hostingMode).not.toBe('grimoire')
    expect(migrated?.hostingModeHistory).toEqual([])
    expect(migrated?.schemaVersion).toBe(2)
  })

  it('recomputes completeness for a pre-annotation archive instead of leaving it blank', () => {
    // 补上模式却不补完整度，诚实条就只能说「这局是笔录局」而说不出「当时录了多少」，
    // 而后者才是「空白是没发生还是没记录」的判据。
    const migrated = migrateArchiveRecord(legacyArchiveBlob(sessionWithOneStateChange()))

    expect(migrated?.grimoireCompleteness).toEqual({
      seatsWithRole: 12,
      totalSeats: 12,
      stateChangeCount: 1,
      markerCount: 1,
    })
  })

  it('keeps a mode the embedded session actually recorded', () => {
    // 内嵌 session 自己带着 hostingMode 时，那是当时**记下来的事实**而不是推断。
    // 一律覆盖成 record 会把 G1 之后、归档字段之前那段时间的魔典局全部改写成笔录局。
    const session = createPrototypeGameSession()
    const blob = legacyArchiveBlob({
      ...session,
      hostingMode: 'grimoire',
      hostingModeHistory: [{ mode: 'grimoire', changedAt: '2026-01-01T00:00:00.000Z', phaseLabel: '第3夜' }],
    })

    const migrated = migrateArchiveRecord(blob)

    expect(migrated?.hostingMode).toBe('grimoire')
    expect(migrated?.hostingModeHistory).toEqual([
      { mode: 'grimoire', changedAt: '2026-01-01T00:00:00.000Z', phaseLabel: '第3夜' },
    ])
  })

  it('never overwrites annotations an archive already carries', () => {
    // 每读一次就重算一遍，等于让同一份归档在两个版本的工具里讲两个故事。
    // 这里故意存一份与内嵌 session 对不上的完整度：重算过就会被改回 12/12/0/0。
    const record = createGameArchiveRecord({ session: createPrototypeGameSession(), winner: 'evil' })
    const tampered: GameArchiveRecord = {
      ...record,
      hostingMode: 'grimoire',
      grimoireCompleteness: { seatsWithRole: 3, totalSeats: 9, stateChangeCount: 7, markerCount: 4 },
    }

    const migrated = migrateArchiveRecord(tampered)

    expect(migrated?.hostingMode).toBe('grimoire')
    expect(migrated?.grimoireCompleteness).toEqual({ seatsWithRole: 3, totalSeats: 9, stateChangeCount: 7, markerCount: 4 })
  })

  it('reads legacy archives straight out of localStorage with the mode filled in', () => {
    // 端到端那一遍：迁移必须发生在读盘路径上，而不是只在某个人记得调用的地方。
    window.localStorage.setItem(gameArchiveStorageKey, JSON.stringify([legacyArchiveBlob(createPrototypeGameSession())]))

    const loaded = listArchives()

    expect(loaded).toHaveLength(1)
    expect(loaded[0].hostingMode).toBe('record')
    expect(loaded[0].schemaVersion).toBe(2)
  })

  it('drops values that are not archives at all, one by one', () => {
    const good = createGameArchiveRecord({ session: createPrototypeGameSession(), winner: 'good', archiveId: 'ok' })

    // 坏的那条不该带走整份列表——归档列表是战绩，少一条没人会发现。
    expect(migrateArchiveRecords([null, 'nope', { id: 'no-session' }, good, { ...good, schemaVersion: 3 }]))
      .toHaveLength(1)
    expect(migrateArchiveRecord(undefined)).toBeNull()
  })
})

describe('补齐与迁移是两件事：版本号是写入方的自我声明', () => {
  it('hydrates the three fields without touching a version the backend stamped', () => {
    // HTTP 后端至今把落盘记录钉成 schemaVersion 1。客户端读回时擅自改写版本号，
    // 会让「服务端存的」与「客户端看到的」在一次往返后对不上。
    const blob = { ...legacyArchiveBlob(createPrototypeGameSession()), schemaVersion: 1 as const }

    const hydrated = hydrateArchiveAnnotations(blob)

    expect(hydrated?.schemaVersion, '补齐不动版本号').toBe(1)
    expect(hydrated?.hostingMode, '但字段必须补上').toBe('record')
    expect(migrateArchiveRecord(blob)?.schemaVersion, '本机迁移才推版本号').toBe(2)
  })
})

describe('归档时把模式与完整度固化下来', () => {
  beforeEach(() => {
    resetArchiveAdapter()
    window.localStorage.clear()
  })

  it('stamps the session mode, its history and the four completeness numbers', () => {
    const session: GameSessionState = {
      ...sessionWithOneStateChange(),
      hostingMode: 'grimoire',
      hostingModeHistory: [{ mode: 'grimoire', changedAt: '2026-01-01T00:00:00.000Z', phaseLabel: '第3夜' }],
    }

    const { archive } = archiveGame({ commandId: 'stamp', session, winner: 'good' })

    expect(archive.hostingMode).toBe('grimoire')
    expect(archive.hostingModeHistory).toHaveLength(1)
    expect(archive.grimoireCompleteness).toEqual({
      seatsWithRole: 12,
      totalSeats: 12,
      stateChangeCount: 1,
      markerCount: 1,
    })
  })

  it('falls back to record when the session never declared a mode', () => {
    // 从没选过模式 = 纯记录。这里回落成 grimoire 的话，
    // 每一局在工具里跑完却没碰过模式开关的对局都会被标成魔典局。
    const { archive } = archiveGame({ commandId: 'no-mode', session: createPrototypeGameSession(), winner: 'good' })

    expect(archive.hostingMode).toBe('record')
    expect(archive.hostingModeHistory).toEqual([])
  })
})
