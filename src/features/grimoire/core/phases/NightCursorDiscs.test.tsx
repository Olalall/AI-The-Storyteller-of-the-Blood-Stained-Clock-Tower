import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { NightCursorDiscs } from './NightCursorDiscs'
import type { GrimoireNightCursor } from '../corePhase'

const CURSOR: GrimoireNightCursor = {
  current: { seatId: 3, role: { name: '僧侣', initial: '僧' } },
  next: { seatId: 7, role: { name: '洗衣妇', initial: '洗' } },
  previousSeatId: 1,
}

/** 默认接好两个回调：夜序在真实使用里总是接线的，「没接线」是单独一条测试的题目。 */
function renderNight(cursor: Partial<GrimoireNightCursor> = {}, roleVisible = true) {
  const wired = { ...CURSOR, onStepBack: vi.fn(), onStepForward: vi.fn(), ...cursor }
  return render(<NightCursorDiscs cursor={wired} roleVisible={roleVisible} />)
}

describe('NightCursorDiscs 显示什么', () => {
  it('answers only "who am I calling now, and who is next"', () => {
    // 250px 转盘降级进核之后，空间定位交给环（当前项座位是全屏唯一暖金焦点环）。
    // 核里这两枚盘只回答另一个问题，多画一枚「上一位」就又变回一个占屏的转盘了。
    const { container } = renderNight()

    expect(container.querySelectorAll('.grimoire-core__disc')).toHaveLength(2)
    expect(screen.getByText('当前')).toBeVisible()
    expect(screen.getByText('下一位')).toBeVisible()
    expect(screen.getByText('3号')).toBeVisible()
  })

  it('labels the step keys with the seat they will land on', () => {
    // 「下一位是谁」写在键上，说书人才不用先按一下再看结果。
    // 暗光下按错一格意味着叫醒了不该醒的人，那是不可撤销的。
    renderNight()

    expect(screen.getByRole('button', { name: '上一位：1号' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '下一位：7号' })).toBeEnabled()
  })

  it('keeps a disabled key in place instead of removing it at the ends of the queue', () => {
    // 队列到头时抽走按钮，剩下的那个键会横向平移到手指刚才按的位置——
    // 于是「再按一下」按到了相反方向。位置恒定比少一个键重要。
    renderNight({ previousSeatId: null, next: null })

    expect(screen.getByRole('button', { name: '上一位：—' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一位：—' })).toBeDisabled()
  })

  it('disables the keys when nobody wired a handler', () => {
    // 没接线时按键长得能按却什么都不做，说书人会以为夜序卡住了。
    renderNight({ onStepBack: undefined, onStepForward: undefined })

    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled()
  })
})

describe('NightCursorDiscs 不显示什么', () => {
  it('keeps role names out of the DOM while shielded', () => {
    // 遮蔽是「不进 DOM」而不是盖一层：CSS 覆盖挡不住截屏、屏读器和 devtools，
    // 而核在环正中央，是全场最容易被玩家瞄到的一块。
    const { container } = renderNight({}, false)

    expect(container.textContent).not.toContain('僧侣')
    expect(container.textContent).not.toContain('洗衣妇')
    expect(screen.getAllByLabelText('角色已遮蔽')).toHaveLength(2)
    // 座位号不是秘密，遮蔽态下仍要能读——不然说书人自己也不知道该看环上哪一个。
    expect(screen.getByText('3号')).toBeVisible()
  })

  it('reveals the role only once the shield says so', () => {
    renderNight({}, true)
    expect(screen.getByLabelText('僧侣')).toBeVisible()
  })

  it('tells "no such item" apart from "hidden" apart from "never dealt"', () => {
    // 三种画不出角色的情况必须长得不一样：队列到头、遮蔽、这局没在工具里配过板。
    // 对后两者之外的情况画「隐」态盘，等于宣称「有个角色藏在这里」——那是编造。
    const { container } = render(
      <NightCursorDiscs
        cursor={{ current: { seatId: 3, role: null }, next: null }}
        roleVisible
      />,
    )

    expect(container.querySelectorAll('.grimoire-core__disc-blank')).toHaveLength(2)
    expect(screen.queryByLabelText('角色已遮蔽')).toBeNull()
  })
})

describe('NightCursorDiscs 的 ‹ ›', () => {
  it('calls back and carries nothing with it', async () => {
    // 回调签名一旦能收东西，早晚有人往里塞核里算出来的值，派生值就此出了渲染路径。
    const onStepForward = vi.fn()
    renderNight({ onStepForward })

    await userEvent.click(screen.getByRole('button', { name: '下一位：7号' }))

    expect(onStepForward).toHaveBeenCalledTimes(1)
    expect(onStepForward.mock.calls[0]).toEqual([])
  })

  it('does not move the cursor by itself', async () => {
    // 核不持有夜序光标。它若自己往前走一格，屏幕上的「当前」与夜序状态机里的「当前」
    // 就成了两个真值，而它们迟早不一致——说书人会照着核叫人，照着抽屉记录。
    const { container } = renderNight({ onStepBack: vi.fn(), onStepForward: vi.fn() })
    const before = container.innerHTML

    await userEvent.click(screen.getByRole('button', { name: '下一位：7号' }))
    await userEvent.click(screen.getByRole('button', { name: '上一位：1号' }))

    expect(container.innerHTML).toBe(before)
  })

  it('opts itself back into pointer events, one element at a time', () => {
    // 核整块 pointer-events: none。可点元素必须自己写 auto——
    // 默认不可点、逐个开，比默认可点、逐个关安全一个数量级。
    renderNight({ onStepBack: vi.fn(), onStepForward: vi.fn() })

    for (const button of screen.getAllByRole('button')) {
      expect(button.style.pointerEvents).toBe('auto')
    }
  })
})
