import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPrototypeGameSession, gameSessionStorageKey } from '../../features/game-session/data/createPrototypeSession'
import {
  SNAPSHOT_INTERVAL_MS,
  SNAPSHOT_SLOTS,
  clearSnapshots,
  deleteSnapshot,
  listSnapshots,
  readSnapshot,
  shouldSnapshot,
  snapshotIndexKey,
  writeSnapshot,
} from './snapshotRotation'

const AT = (minute: number) => `2026-08-05T12:${String(minute).padStart(2, '0')}:00.000Z`

describe('快照轮转', () => {
  beforeEach(() => window.localStorage.clear())

  it('keeps a snapshot readable on its own', () => {
    const session = createPrototypeGameSession()
    writeSnapshot(session, 'interval', AT(0))

    const stored = readSnapshot(listSnapshots()[0].slot)

    expect(JSON.parse(stored!.raw).id).toBe(session.id)
    expect(stored!.reason).toBe('interval')
  })

  it('keeps the five most recent and drops only the oldest', () => {
    const session = createPrototypeGameSession()
    for (let minute = 0; minute <= SNAPSHOT_SLOTS; minute += 1) {
      writeSnapshot({ ...session, id: `game-${minute}` }, 'interval', AT(minute))
    }

    const snapshots = listSnapshots()
    expect(snapshots).toHaveLength(SNAPSHOT_SLOTS)
    expect(snapshots.map((entry) => entry.sessionId)).not.toContain('game-0')
    expect(snapshots[0].sessionId).toBe(`game-${SNAPSHOT_SLOTS}`)
  })

  it('throttles interval snapshots so a busy game does not flush the slots in seconds', () => {
    // 一局会产生上千次写入。每次都存的话，真正需要回退时只剩下十几秒前的状态。
    const now = Date.parse(AT(0))
    writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))

    expect(shouldSnapshot('interval', now + SNAPSHOT_INTERVAL_MS - 1)).toBe(false)
    expect(shouldSnapshot('interval', now + SNAPSHOT_INTERVAL_MS)).toBe(true)
  })

  it('always snapshots before something destructive, however recent the last one was', () => {
    const now = Date.parse(AT(0))
    writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))

    expect(shouldSnapshot('destructive', now)).toBe(true)
    expect(shouldSnapshot('import', now)).toBe(true)
    expect(shouldSnapshot('phase-close', now)).toBe(true)
  })

  it('rolls the slot back when the index write fails', () => {
    const originalSetItem = Storage.prototype.setItem
    const previous = createPrototypeGameSession()
    writeSnapshot(previous, 'interval', AT(0))
    const previousEntry = listSnapshots()[0]
    const previousRaw = readSnapshot(previousEntry.slot)!.raw
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === snapshotIndexKey) throw new DOMException('quota', 'QuotaExceededError')
      return originalSetItem.call(this, key, value)
    })

    const written = writeSnapshot({ ...previous, id: 'replacement' }, 'import', AT(1))

    expect(written).toBe(false)
    expect(readSnapshot(previousEntry.slot)?.raw).toBe(previousRaw)
    expect(listSnapshots()).toHaveLength(1)
    setItem.mockRestore()
  })

  it('deletes a consumed import snapshot from both the index and slot', () => {
    writeSnapshot(createPrototypeGameSession(), 'import', AT(0))
    const entry = listSnapshots()[0]

    expect(deleteSnapshot(entry.slot)).toBe(true)
    expect(listSnapshots()).toEqual([])
    expect(readSnapshot(entry.slot)).toBeNull()
  })

  it('takes the first snapshot immediately rather than after a minute of play', () => {
    expect(shouldSnapshot('interval', Date.parse(AT(0)))).toBe(true)
  })

  it('gives up quietly when storage is full instead of interrupting the game', () => {
    // 快照是安全网。它写失败绝不能连带让正在进行的一局中断。
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    expect(() => writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))).not.toThrow()
    expect(writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))).toBe(false)

    setItem.mockRestore()
  })

  it('survives a corrupted index without losing the game', () => {
    window.localStorage.setItem(snapshotIndexKey, 'not json')

    expect(listSnapshots()).toEqual([])
    expect(() => writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))).not.toThrow()
  })

  it('can restore a game three minutes back after the main key is wiped', () => {
    // 这条就是闸门的验收标准本身。
    const session = createPrototypeGameSession()
    writeSnapshot({ ...session, id: 'three-minutes-ago' }, 'interval', AT(0))
    writeSnapshot({ ...session, id: 'two-minutes-ago' }, 'interval', AT(1))
    writeSnapshot({ ...session, id: 'one-minute-ago' }, 'interval', AT(2))

    window.localStorage.removeItem(gameSessionStorageKey)

    const recovered = listSnapshots().map((entry) => readSnapshot(entry.slot)!)
    expect(recovered.map((snapshot) => JSON.parse(snapshot.raw).id)).toEqual([
      'one-minute-ago',
      'two-minutes-ago',
      'three-minutes-ago',
    ])
  })

  it('clears every slot on request', () => {
    writeSnapshot(createPrototypeGameSession(), 'interval', AT(0))
    clearSnapshots()
    expect(listSnapshots()).toEqual([])
  })
})
