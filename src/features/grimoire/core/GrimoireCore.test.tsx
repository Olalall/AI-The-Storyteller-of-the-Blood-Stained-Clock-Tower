import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GrimoireCore } from './GrimoireCore'
import type { GrimoireNightCursor } from './corePhase'
import type { StorytellerSeatSummary } from '../../game-session/state/projectors'

const RING = { mode: 'ring' as const, centerX: 400, centerY: 400, radiusX: 300, radiusY: 300 }

function seats(alive: number, dead: number): StorytellerSeatSummary[] {
  return [
    ...Array.from({ length: alive }, (_v, i) => ({ seatId: i + 1, nickname: '', role: null, state: { life: 'alive' as const, poisoned: false, drunk: false, markers: [] } })),
    ...Array.from({ length: dead }, (_v, i) => ({ seatId: alive + i + 1, nickname: '', role: null, state: { life: 'dead' as const, poisoned: false, drunk: false, markers: [] } })),
  ]
}

const NIGHT: GrimoireNightCursor = {
  current: { seatId: 3, role: { name: '僧侣', initial: '僧' } },
  next: { seatId: 7, role: { name: '洗衣妇', initial: '洗' } },
  previousSeatId: 1,
}

/** 核里所有「自己把 pointer-events 开回来」的元素。这是白名单的可测形式。 */
function clickable(core: HTMLElement) {
  return Array.from(core.querySelectorAll<HTMLElement>('*')).filter((el) => el.style.pointerEvents === 'auto')
}

describe('GrimoireCore', () => {
  it('shows the execution threshold without ever deciding it', () => {
    // 门槛是算得出的；是否处决是裁定。工具显示前者，绝不代替后者。
    const { container } = render(<GrimoireCore seats={seats(7, 0)} layout={RING} />)

    expect(container.querySelector('[data-stat="threshold"] dd')?.textContent).toBe('4')
    expect(screen.getByText('只显示 · 不裁定')).toBeVisible()
  })

  it('writes an em dash instead of inventing a number it has no source for', () => {
    const { container } = render(<GrimoireCore seats={seats(5, 1)} layout={RING} />)
    const ghost = container.querySelector('[data-stat="ghost-votes"] dd')

    expect(ghost?.textContent).toContain('—')
    expect(ghost).toHaveAttribute('data-empty', 'true')
  })

  it('uses the real number once a source exists', () => {
    const { container } = render(<GrimoireCore seats={seats(5, 1)} layout={RING} ghostVotesRemaining={2} />)
    expect(container.querySelector('[data-stat="ghost-votes"] dd')?.textContent).toBe('2')
  })

  it('accepts no pointer input — the core is an observation surface', () => {
    const { container } = render(<GrimoireCore seats={seats(7, 0)} layout={RING} />)
    const core = container.querySelector('.grimoire-core') as HTMLElement

    expect(core.style.pointerEvents).toBe('none')
    expect(core.querySelector('button')).toBeNull()
  })

  it('sits centred inside the ring', () => {
    const { container } = render(<GrimoireCore seats={seats(7, 0)} layout={RING} />)
    const core = container.querySelector('.grimoire-core') as HTMLElement

    const left = Number.parseFloat(core.style.left)
    const width = Number.parseFloat(core.style.width)
    expect(left + width / 2).toBeCloseTo(RING.centerX, 6)
  })

  it('stops positioning itself when the ring degrades to a grid', () => {
    const { container } = render(
      <GrimoireCore seats={seats(7, 0)} layout={{ ...RING, mode: 'grid', radiusX: 0, radiusY: 0 }} />,
    )
    const core = container.querySelector('.grimoire-core') as HTMLElement

    expect(core.className).toContain('grimoire-core--flow')
    expect(core.style.left).toBe('')
  })

  it('says the board is empty rather than showing five zeroes', () => {
    render(<GrimoireCore seats={[]} layout={RING} />)
    expect(screen.getByText('尚未配座')).toBeVisible()
  })
})

describe('GrimoireCore 顶行标识', () => {
  it('names the script and the player count in one line', () => {
    render(<GrimoireCore seats={seats(12, 0)} layout={RING} scriptName="乌鸦渡口" onOpenSessionInfo={vi.fn()} />)
    expect(screen.getByRole('button', { name: /乌鸦渡口 · 12人/ })).toBeVisible()
  })

  it('hands the tap to the session-info sheet and carries nothing with it', async () => {
    // 裁决 7 把模式切换放进这张浮层。核不知道浮层要做什么，也就不该能捎带任何值——
    // 回调一旦能收参数，下一个人就会把核里算出来的门槛塞进去，派生值就此出了渲染路径。
    const onOpenSessionInfo = vi.fn()
    render(<GrimoireCore seats={seats(12, 0)} layout={RING} scriptName="乌鸦渡口" onOpenSessionInfo={onOpenSessionInfo} />)

    await userEvent.click(screen.getByRole('button', { name: /乌鸦渡口/ }))

    expect(onOpenSessionInfo).toHaveBeenCalledTimes(1)
    expect(onOpenSessionInfo.mock.calls[0]).toEqual([])
  })

  it('degrades to plain text when nobody is listening', () => {
    // 没有浮层时仍画一个按钮，等于给说书人一个点下去毫无反应的键；
    // 暗光下他会以为是工具卡了，然后连点五次。
    const { container } = render(<GrimoireCore seats={seats(12, 0)} layout={RING} scriptName="乌鸦渡口" />)

    expect(container.querySelector('button')).toBeNull()
    expect(screen.getByText('乌鸦渡口 · 12人')).toBeVisible()
  })

  it('admits it has no script instead of printing an empty gap', () => {
    render(<GrimoireCore seats={seats(9, 0)} layout={RING} scriptName="   " onOpenSessionInfo={vi.fn()} />)
    expect(screen.getByRole('button', { name: /未选剧本 · 9人/ })).toBeVisible()
  })
})

describe('GrimoireCore 可点白名单', () => {
  it('opens pointer events for exactly the identity row and the two step keys', () => {
    // 核默认整块 pointer-events: none，可点元素逐个把它开回来。这条测试锁住白名单的长度：
    // 少了它，任何一个新加的元素只要恰好落在核里就会变成可点，而核是观察面——
    // 在魔典上误触一下的代价是说书人不知道自己刚刚改了什么。
    const { container } = render(
      <GrimoireCore
        seats={seats(12, 0)}
        layout={RING}
        phase="night"
        night={{ ...NIGHT, onStepBack: vi.fn(), onStepForward: vi.fn() }}
        scriptName="乌鸦渡口"
        onOpenSessionInfo={vi.fn()}
      />,
    )
    const core = container.querySelector('.grimoire-core') as HTMLElement

    expect(core.style.pointerEvents).toBe('none')
    expect(clickable(core)).toHaveLength(3)
    expect(core.querySelectorAll('button')).toHaveLength(3)
  })

  it('lets no button exist without opting back in', () => {
    // 反向锁：白名单长度对了，也可能是某个可点元素忘了写 pointerEvents: 'auto'——
    // 那个元素在真机上点不动，测试却一片绿。两条一起才能确定「可点的恰好就是这几个」。
    const { container } = render(
      <GrimoireCore
        seats={seats(12, 0)}
        layout={RING}
        phase="night"
        night={{ ...NIGHT, onStepBack: vi.fn(), onStepForward: vi.fn() }}
        onOpenSessionInfo={vi.fn()}
      />,
    )
    const core = container.querySelector('.grimoire-core') as HTMLElement

    for (const button of core.querySelectorAll<HTMLElement>('button')) {
      expect(button.style.pointerEvents).toBe('auto')
    }
  })

  it('keeps the Town Info numbers untouchable in every phase', () => {
    // 五个数字是核的底座，谁都不该能点它们：点一下没有任何语义，
    // 而一个「看起来能点」的数字会诱使说书人去戳它找菜单。
    for (const phase of ['idle', 'night', 'day-timer', 'day-vote', 'dusk', 'dawn'] as const) {
      const { container, unmount } = render(
        <GrimoireCore seats={seats(12, 0)} layout={RING} phase={phase} onOpenSessionInfo={vi.fn()} />,
      )
      const stats = container.querySelector('.grimoire-core__stats') as HTMLElement

      expect(stats.style.pointerEvents).toBe('')
      expect(stats.querySelector('button')).toBeNull()
      unmount()
    }
  })
})

describe('GrimoireCore 相位切换', () => {
  it('swaps the phase block while the Town Info base stays put', () => {
    // 相位换的是核里多出来的那一块，不是整块核。底座被换走过一次，
    // 说书人就再也不能靠「余光扫一眼中间」知道还剩几个人活着。
    const { container, rerender } = render(
      <GrimoireCore seats={seats(9, 3)} layout={RING} phase="night" night={NIGHT} />,
    )

    expect(screen.getByRole('group', { name: '夜序' })).toBeVisible()
    expect(container.querySelectorAll('.grimoire-core__stat')).toHaveLength(5)

    rerender(<GrimoireCore seats={seats(9, 3)} layout={RING} phase="day-vote" vote={{ raised: 4 }} />)

    expect(screen.queryByRole('group', { name: '夜序' })).toBeNull()
    expect(screen.getByRole('group', { name: '计票' })).toBeVisible()
    expect(container.querySelectorAll('.grimoire-core__stat')).toHaveLength(5)
  })

  it('marks the phase on the element so the canvas can style around it', () => {
    const { container } = render(<GrimoireCore seats={seats(9, 0)} layout={RING} phase="dawn" dawn={{ deaths: [4] }} />)
    expect(container.querySelector('.grimoire-core')).toHaveAttribute('data-phase', 'dawn')
  })

  it('shows only the Town Info base when idle', () => {
    render(
      <GrimoireCore
        seats={seats(9, 0)}
        layout={RING}
        night={NIGHT}
        timer={{ remainingSeconds: 60 }}
        vote={{ raised: 2 }}
        dusk={{ dayOutcome: '处决 5 号', nightQueue: ['僧侣'] }}
        dawn={{ deaths: [4] }}
      />,
    )

    // idle 是底座态：即使五种相位的数据全都递进来了，也一块都不画。
    // 相位由外部决定，核自己不去猜「现在大概是夜里吧」。
    for (const name of ['夜序', '白天计时', '计票', '黄昏交接', '黎明播报']) {
      expect(screen.queryByRole('group', { name })).toBeNull()
    }
    expect(screen.getByText('本阶段待处理')).toBeVisible()
  })

  it('draws nothing rather than an empty shell when the phase data has not arrived', () => {
    // 空壳会被读成「这里本该有东西，但工具坏了」，而真实情况通常只是这一相位还没开始。
    render(<GrimoireCore seats={seats(9, 0)} layout={RING} phase="day-timer" />)

    expect(screen.queryByRole('group', { name: '白天计时' })).toBeNull()
    expect(screen.getByText('本白天待处理')).toBeVisible()
  })

  it('renames the pending counter to the unit of work of the phase', () => {
    const { rerender } = render(<GrimoireCore seats={seats(9, 0)} layout={RING} phase="night" night={NIGHT} />)
    expect(screen.getByText('本夜待处理')).toBeVisible()

    rerender(<GrimoireCore seats={seats(9, 0)} layout={RING} phase="dawn" dawn={{ deaths: [] }} />)
    expect(screen.getByText('本白天待处理')).toBeVisible()
  })

  it('lets the caller override the pending wording without touching the count', () => {
    render(<GrimoireCore seats={seats(9, 0)} layout={RING} pendingLabel="待补录" pendingCount={3} />)

    expect(screen.getByText('待补录')).toBeVisible()
    expect(screen.getByText('3')).toBeVisible()
  })

  it('conceals roles by default, before anyone remembers to pass a shield level', () => {
    // 默认值必须站在保密那一侧：接线时漏传 shield 的后果是一屏身份被玩家看见，
    // 而漏传的默认若是 L2，这件事会在真桌上第一次发现。
    render(<GrimoireCore seats={seats(9, 0)} layout={RING} phase="night" night={NIGHT} />)

    expect(screen.queryByText('僧侣')).toBeNull()
    expect(screen.getAllByLabelText('角色已遮蔽')).toHaveLength(2)
  })
})
