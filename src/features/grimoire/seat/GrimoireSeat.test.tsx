import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PlayerState } from '../../game-session/model/playerTypes'
import { GrimoireSeat, SEAT_HIT_TARGET, type GrimoireSeatRole } from './GrimoireSeat'

const ALIVE: PlayerState = { life: 'alive', poisoned: false, drunk: false, markers: [] }
const ROLE: GrimoireSeatRole = {
  roleId: 'monk',
  name: '僧侣',
  initial: '僧',
  imageSrc: '/roles/monk.webp',
}

function renderSeat(props: Partial<Parameters<typeof GrimoireSeat>[0]> = {}) {
  return render(
    <GrimoireSeat
      seatId={3}
      state={ALIVE}
      role={ROLE}
      shield="L1"
      centerX={200}
      centerY={200}
      tokenSize={96}
      radialAngle={0}
      {...props}
    />,
  )
}

describe('GrimoireSeat 的遮蔽契约', () => {
  it('keeps the role name, initial and icon out of the DOM at L1', () => {
    // 遮蔽必须是「不渲染」而不是「盖住」：CSS 覆盖挡不住截屏、屏读器和 devtools。
    const { container } = renderSeat({ shield: 'L1' })

    expect(container.innerHTML).not.toContain('僧侣')
    expect(container.innerHTML).not.toContain('monk')
    expect(container.querySelector('img')).toBeNull()
  })

  it('keeps marker labels out at L1 but still shows how many there are', () => {
    // 「僧侣保护」这个 label 本身就暴露了场上有僧侣以及今晚保了谁。
    const { container } = renderSeat({
      shield: 'L1',
      state: { ...ALIVE, markers: [{ id: 'm1', label: '僧侣保护' }] },
    })

    expect(container.innerHTML).not.toContain('僧侣保护')
    expect(container.querySelectorAll('.grimoire-seat__chip')).toHaveLength(1)
  })

  it('does not leak marker labels through the accessible name either', () => {
    renderSeat({ shield: 'L1', state: { ...ALIVE, markers: [{ id: 'm1', label: '是酒鬼' }] } })

    const name = screen.getByRole('button').getAttribute('aria-label') ?? ''
    expect(name).not.toContain('是酒鬼')
    expect(name).toContain('1枚标记')
  })

  it('reveals the role only at L2', () => {
    renderSeat({ shield: 'L2' })
    expect(screen.getByRole('button').getAttribute('aria-label')).toContain('僧侣')
  })

  it('renders nothing at all at L0', () => {
    const { container } = renderSeat({ shield: 'L0' })
    expect(container.querySelector('.grimoire-seat')).toBeNull()
  })
})

describe('GrimoireSeat 的状态表达', () => {
  it('marks death with icon, text and colour rather than colour alone', () => {
    // 只靠颜色在暗光和色觉差异下会失效，所以图标、文字、语义色三重编码。
    renderSeat({ state: { ...ALIVE, life: 'dead' } })

    const button = screen.getByRole('button')
    expect(button.className).toContain('grimoire-seat--dead')
    expect(button.querySelector('.grimoire-seat__shroud svg')).not.toBeNull()
    expect(button.querySelector('.grimoire-seat__shroud-text')?.textContent).toBe('亡')
    expect(button.getAttribute('aria-label')).toContain('已死亡')
  })

  it('orders chips 中毒 → 醉酒 → 具名标记 so position alone identifies them', () => {
    const { container } = renderSeat({
      shield: 'L2',
      state: { ...ALIVE, poisoned: true, drunk: true, markers: [{ id: 'm1', label: '红鲱鱼' }] },
    })

    const kinds = [...container.querySelectorAll('.grimoire-seat__chip')].map((chip) => chip.getAttribute('data-chip'))
    expect(kinds).toEqual(['poisoned', 'drunk', 'marker'])
  })

  it('folds the fourth chip onward into a +N', () => {
    const { container } = renderSeat({
      shield: 'L2',
      state: {
        ...ALIVE,
        poisoned: true,
        markers: [
          { id: 'a', label: '甲' },
          { id: 'b', label: '乙' },
          { id: 'c', label: '丙' },
        ],
      },
    })

    const chips = [...container.querySelectorAll('.grimoire-seat__chip')]
    expect(chips).toHaveLength(3)
    expect(chips.at(-1)?.textContent).toBe('+2')
  })

  it('shares the selection contract with SeatButton instead of inventing one', () => {
    renderSeat({ selected: true })
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps the hit target at 56px or more at every token tier', () => {
    // 命中区靠 ::before 外扩，不靠把 token 画大——放大 token 会吃掉弧距、把环挤崩。
    for (const tokenSize of [96, 84, 72, 64, 40]) {
      const { container, unmount } = renderSeat({ tokenSize })
      const style = container.querySelector('.grimoire-seat')?.getAttribute('style') ?? ''
      const hit = Number(/--seat-hit: (\d+)px/.exec(style)?.[1])
      expect(hit, `${tokenSize}px 档`).toBeGreaterThanOrEqual(SEAT_HIT_TARGET)
      unmount()
    }
  })

  it('tells the storyteller what tapping does right now', () => {
    // 暗光下只有余裕记「点下去 = 做当前这一步」，所以手势语义要进可访问名。
    renderSeat({ actionHint: '点此选为目标' })
    expect(screen.getByRole('button').getAttribute('aria-label')).toContain('点此选为目标')
  })

  it('reports the seat it was tapped on and nothing else', async () => {
    const onSelect = vi.fn()
    renderSeat({ onSelect })

    await userEvent.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledExactlyOnceWith(3)
  })

  it('drops absolute positioning in flow mode so a grid can lay it out', () => {
    renderSeat({ flow: true })
    const style = screen.getByRole('button').getAttribute('style') ?? ''
    expect(style).not.toContain('left')
    expect(style).not.toContain('top')
  })
})
