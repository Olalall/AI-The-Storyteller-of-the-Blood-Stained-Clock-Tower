import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VoteTallyReadout } from './VoteTallyReadout'

function cell(container: HTMLElement, key: string) {
  return container.querySelector(`[data-cell="${key}"] dd`)?.textContent
}

describe('VoteTallyReadout', () => {
  it('shows raised, threshold and the shortfall', () => {
    const { container } = render(<VoteTallyReadout tally={{ raised: 3 }} aliveCount={9} />)

    expect(cell(container, 'raised')).toBe('3')
    expect(cell(container, 'vote-threshold')).toBe('5')
    expect(cell(container, 'gap')).toBe('2')
  })

  it('never turns the three numbers into a verdict', () => {
    // 裁决 10：门槛只算不裁。核里一旦出现「已达标」「可处决」这类措辞，
    // 说书人就会把它读成工具的判断，而暂列处决必须始终是他自己的一次显式动作。
    const { container } = render(<VoteTallyReadout tally={{ raised: 9, nomineeSeatId: 4 }} aliveCount={9} />)

    expect(cell(container, 'gap')).toBe('0')
    for (const verdict of ['已达标', '达标', '可处决', '暂列', '通过']) {
      expect(container.textContent).not.toContain(verdict)
    }
  })

  it('stops the shortfall at zero instead of counting overshoot', () => {
    // 负数会被读成「超了几票」，那是另一个意思，而且是个没人需要的数。
    const { container } = render(<VoteTallyReadout tally={{ raised: 8 }} aliveCount={9} />)
    expect(cell(container, 'gap')).toBe('0')
  })

  it('defers to a threshold the storyteller changed by hand', () => {
    // 门槛是裁量（旅行者、特殊裁定都可能改它），核不许拿存活数去「修正」它。
    const { container } = render(<VoteTallyReadout tally={{ raised: 2, threshold: 3 }} aliveCount={9} />)

    expect(cell(container, 'vote-threshold')).toBe('3')
    expect(cell(container, 'gap')).toBe('1')
  })

  it('shows the threshold but admits it has no count before the tally starts', () => {
    // 举手数为 null 是「还没进计票子态」，不是「零人举手」。显示 0 会让说书人
    // 以为自己已经点过一轮、结果全场没人举手。
    const { container } = render(<VoteTallyReadout tally={{ raised: null }} aliveCount={7} />)

    expect(cell(container, 'raised')).toBe('—')
    expect(cell(container, 'gap')).toBe('—')
    expect(cell(container, 'vote-threshold')).toBe('4')
  })

  it('names the nominee, or says it does not know one', () => {
    const known = render(<VoteTallyReadout tally={{ raised: 1, nomineeSeatId: 6 }} aliveCount={7} />)
    expect(screen.getByText('被提名 6号')).toBeVisible()
    known.unmount()

    render(<VoteTallyReadout tally={{ raised: 1 }} aliveCount={7} />)
    expect(screen.getByText('被提名 —')).toBeVisible()
  })

  it('takes no input of any kind', () => {
    // 举手打卡发生在环上的 token 上，不在核里。核只汇总。
    const { container } = render(<VoteTallyReadout tally={{ raised: 3 }} aliveCount={9} />)
    expect(container.querySelector('button')).toBeNull()
    expect(container.querySelector('input')).toBeNull()
  })
})
