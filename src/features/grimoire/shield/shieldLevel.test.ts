import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SHIELD_LEVEL,
  levelAfterBlindCover,
  levelAfterIdle,
  levelForPlayerFacing,
  shieldVisibility,
} from './shieldLevel'

describe('三级遮蔽的可见性', () => {
  it('defaults to L1 rather than the revealed view', () => {
    // 默认掀开等于「递给玩家看之前必须记得盖上」，那是一个迟早会忘的动作。
    expect(DEFAULT_SHIELD_LEVEL).toBe('L1')
  })

  it('lets nothing through at L0', () => {
    expect(Object.values(shieldVisibility('L0')).every((allowed) => allowed === false)).toBe(true)
  })

  it('shows seat, life and impairment at L1 but never role identity', () => {
    const visible = shieldVisibility('L1')
    expect(visible.seatIdentity).toBe(true)
    expect(visible.impairments).toBe(true)
    expect(visible.roleIdentity).toBe(false)
  })

  it('keeps marker labels out at L1 while still admitting the count', () => {
    // 「僧侣保护」暴露场上有僧侣及其今晚保了谁，「是酒鬼」直接暴露一个玩家的真实身份。
    const visible = shieldVisibility('L1')
    expect(visible.markerCount).toBe(true)
    expect(visible.markerDetail).toBe(false)
  })

  it('keeps storyteller annotations out until L2', () => {
    // 注记层在实体魔典上根本不存在；间谍查魔典时它必须跟着一起消失。
    expect(shieldVisibility('L1').annotations).toBe(false)
    expect(shieldVisibility('L2').annotations).toBe(true)
  })

  it('drops to L1 — not L0 — when the device is handed to a player', () => {
    // 间谍要求魔典可查看而私有笔记不可见，所以是压到 L1 并锁住，不是整块盖掉。
    expect(levelForPlayerFacing()).toBe('L1')
  })

  it('covers everything on the blind two-finger gesture', () => {
    expect(levelAfterBlindCover()).toBe('L0')
  })

  it('falls back from L2 on idle but never re-opens a covered grimoire', () => {
    expect(levelAfterIdle('L2')).toBe('L1')
    expect(levelAfterIdle('L0')).toBe('L0')
    expect(levelAfterIdle('L1')).toBe('L1')
  })
})
