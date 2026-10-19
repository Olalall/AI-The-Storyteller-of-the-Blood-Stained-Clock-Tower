/**
 * peek 档的两个既定占用者：座位状态确认条与白天倒计时横条。
 * 它们的共同点只有「出现在 peek 档」，其余全都不同，所以在类型上分开而不是合成一个。
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorkDrawer } from './WorkDrawer'
import { DAY_TIMER_BAR_HEIGHT, PEEK_SLOT_MIN_HEIGHT, WORK_DRAWER_PEEK_HEIGHT } from './detents'

describe('peek 档占用者', () => {
  it('keeps the 88px timer bar and the 96px peek detent as two separate numbers', () => {
    // 合成一个常量之后，任何一次为了摆下第五枚控制键而抬高横条，
    // 都会同时抬高抽屉、多吃掉环的下半弧——而 96 的来源（Mac 宽而矮）与横条毫无关系。
    expect(DAY_TIMER_BAR_HEIGHT).toBe(88)
    expect(WORK_DRAWER_PEEK_HEIGHT).toBe(96)
    expect(DAY_TIMER_BAR_HEIGHT).not.toBe(WORK_DRAWER_PEEK_HEIGHT)
  })

  it('gives the timer bar a floor and lets the confirm bar be sized by its content', () => {
    // 倒计时横条是常驻控件，高度抖动会让整个抽屉跟着跳；
    // 确认条随草稿出现即走，设计没给过它高度，硬塞一个下限只会在只有一颗按钮时留出空洞。
    expect(PEEK_SLOT_MIN_HEIGHT['day-timer']).toBe(DAY_TIMER_BAR_HEIGHT)
    expect(PEEK_SLOT_MIN_HEIGHT['seat-state-confirm']).toBe(0)
  })

  it('leaves the peek occupant reachable while the drawer body is inert', () => {
    // 这是把它放在 body 之外的全部理由：peek 档下 body 整块退出焦点序列，
    // 而「确认 5号 状态」正是那一档唯一要按的东西。放进 body 就等于按不到。
    const { container } = render(
      <WorkDrawer
        gestureContract="点座位 = 打开座位卡"
        detent="peek"
        peekSlot={{
          kind: 'seat-state-confirm',
          label: '确认 5号 状态',
          content: <button type="button">确认 5号 状态</button>,
        }}
      >
        <button type="button">抽屉内容</button>
      </WorkDrawer>,
    )

    // 抽屉内容用 DOM 查询而不是 getByRole：inert 会把整块从无障碍树上摘掉，
    // 而「摘掉了」正是这里要断言的事——用 getByRole 找它只会得到一句「找不到」。
    expect(container.querySelector('.work-drawer__body')).toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: '确认 5号 状态' }).closest('[inert]')).toBeNull()
    expect(screen.getByText('抽屉内容').closest('[inert]')).not.toBeNull()
  })

  it('tells the two occupants apart in the DOM and announces the one on screen', () => {
    // 两者的语义色与消失条件不同，样式与读屏都得能区分；
    // 混成一个「peek 内容」之后，「按了确认之后倒计时条要不要回来」在类型上就无法表达。
    const { container } = render(
      <WorkDrawer
        gestureContract="x"
        detent="peek"
        peekSlot={{ kind: 'day-timer', label: '白天计时', content: <button type="button">开始</button> }}
      />,
    )

    const slot = container.querySelector('.work-drawer__peek-slot')
    expect(slot).toHaveAttribute('data-slot', 'day-timer')
    expect(slot).toHaveStyle({ minHeight: `${DAY_TIMER_BAR_HEIGHT}px` })
    expect(screen.getByRole('group', { name: '白天计时' })).toBe(slot)
  })
})
