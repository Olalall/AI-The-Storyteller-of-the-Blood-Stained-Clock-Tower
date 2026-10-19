import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NightSeatOverlay } from './NightSeatOverlay'
import { ordinalGlyph, type NightSeatBadge } from './nightRingCursor'

function badge(kind: NightSeatBadge['kind'], ordinal: 1 | 2 | null = null): NightSeatBadge {
  return { seatId: 5, kind, ordinal, label: '夜序' }
}

describe('夜间叠加层画什么', () => {
  it('当前项画焦点环 + 「当前」，后续两项画 ①②', () => {
    const focus = render(<NightSeatOverlay badge={badge('focus')} shield="L1" />)
    expect(focus.container.querySelector('.night-seat-overlay__focus-ring')).not.toBeNull()
    expect(focus.container.textContent).toContain('当前')

    expect(render(<NightSeatOverlay badge={badge('upcoming', 1)} shield="L1" />).container.textContent).toContain('①')
    expect(render(<NightSeatOverlay badge={badge('upcoming', 2)} shield="L1" />).container.textContent).toContain('②')
    // 后续项不画焦点环——全屏只能有一枚。
    expect(
      render(<NightSeatOverlay badge={badge('upcoming', 1)} shield="L2" />)
        .container.querySelector('.night-seat-overlay__focus-ring'),
    ).toBeNull()
  })

  it('已确认画 ✓、已暂缓画「缓」（L2 下）', () => {
    expect(render(<NightSeatOverlay badge={badge('confirmed')} shield="L2" />).container.textContent).toContain('✓')
    expect(render(<NightSeatOverlay badge={badge('deferred')} shield="L2" />).container.textContent).toContain('缓')
  })

  it('草稿目标是虚线描边 + 「目标」小字，与已落账的实线一眼分得开', () => {
    const { container } = render(<NightSeatOverlay targeted shield="L1" />)

    const outline = container.querySelector('.night-seat-overlay__target')
    expect(outline).not.toBeNull()
    expect(container.textContent).toContain('目标')
  })

  it('多目标项给目标编号，单目标项不编号', () => {
    expect(render(<NightSeatOverlay targeted targetOrdinal={2} shield="L1" />).container.textContent).toContain('目标②')
    expect(render(<NightSeatOverlay targeted shield="L1" />).container.textContent).toBe('目标')
  })

  it('整层 aria-hidden：读屏听的是可访问名里那句「点下去等于什么」，不是装饰', () => {
    const { container } = render(<NightSeatOverlay badge={badge('focus')} targeted shield="L1" />)
    expect(container.querySelector('.night-seat-overlay')?.getAttribute('aria-hidden')).toBe('true')
  })
})

describe('夜间叠加层的遮蔽：不渲染，不是不显示', () => {
  it('L0 下整层不进 DOM，连草稿目标也不留', () => {
    for (const kind of ['focus', 'upcoming', 'confirmed', 'deferred'] as const) {
      const { container } = render(<NightSeatOverlay badge={badge(kind, 1)} targeted shield="L0" />)
      expect(container.innerHTML, kind).toBe('')
    }
  })

  it('L1 下 ✓ 与「缓」不进 DOM——它们累积起来就是一张角色地图', () => {
    for (const kind of ['confirmed', 'deferred'] as const) {
      const { container } = render(<NightSeatOverlay badge={badge(kind)} shield="L1" />)
      expect(container.innerHTML, kind).toBe('')
    }
    // 前置：同一枚在 L2 下是画得出来的，否则上面只是证明这个组件什么都不画。
    expect(render(<NightSeatOverlay badge={badge('confirmed')} shield="L2" />).container.innerHTML).not.toBe('')
  })

  it('L1 下焦点与 ①② 照常画：它们是三座位的滑动窗口，而 L1 是默认态', () => {
    expect(render(<NightSeatOverlay badge={badge('focus')} shield="L1" />).container.innerHTML).not.toBe('')
    expect(render(<NightSeatOverlay badge={badge('upcoming', 1)} shield="L1" />).container.innerHTML).not.toBe('')
  })

  it('没有角标也没有目标时什么都不画', () => {
    expect(render(<NightSeatOverlay shield="L2" />).container.innerHTML).toBe('')
    expect(render(<NightSeatOverlay badge={null} targeted={false} shield="L2" />).container.innerHTML).toBe('')
  })
})

describe('序号字形', () => {
  it('1–9 用带圈数字，超出退回阿拉伯数字', () => {
    expect(ordinalGlyph(1)).toBe('①')
    expect(ordinalGlyph(9)).toBe('⑨')
    expect(ordinalGlyph(10)).toBe('10')
  })
})
