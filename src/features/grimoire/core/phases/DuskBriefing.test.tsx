import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DuskBriefing } from './DuskBriefing'

function row(container: HTMLElement, name: string) {
  return container.querySelector(`[data-row="${name}"] dd`)?.textContent
}

describe('DuskBriefing 显示什么', () => {
  it('gives back yesterday\'s conclusion before the irreversible door', () => {
    // 黄昏是相位门的前一步。说书人要在推门之前看见自己上一天到底记成了什么，
    // 而不是凭记忆推门——推完了才发现记错，就只能走更正路径。
    const { container } = render(
      <DuskBriefing brief={{ dayOutcome: '处决 5 号', nightQueue: ['僧侣', '下毒者'] }} queueVisible />,
    )

    expect(row(container, 'outcome')).toBe('处决 5 号')
    expect(row(container, 'queue')).toBe('僧侣 · 下毒者')
  })

  it('folds a long queue instead of bursting the core', () => {
    // 核只有椭圆内接矩形那么大；队列铺开会把 Town Info 的五个数字挤出可视区。
    const { container } = render(
      <DuskBriefing brief={{ dayOutcome: null, nightQueue: ['僧侣', '下毒者', '占卜师', '守鸦人', '士兵'] }} queueVisible />,
    )
    expect(row(container, 'queue')).toBe('僧侣 · 下毒者 · 占卜师 另2项')
  })

  it('says nothing was recorded rather than inventing a quiet day', () => {
    // 「昨天没有处决」与「昨天的结论没人录」是两件事。把后者写成前者，
    // 是核在替说书人签字。
    const { container } = render(<DuskBriefing brief={{ dayOutcome: null, nightQueue: [] }} queueVisible />)

    expect(row(container, 'outcome')).toBe('—')
    expect(row(container, 'queue')).toBe('—')
  })
})

describe('DuskBriefing 不显示什么', () => {
  it('keeps the queue\'s role names out of the DOM while shielded', () => {
    // 裁决 6：谁在场本身就是身份信息。夜间队列逐字就是一串角色名——
    // 玩家瞄一眼核就知道这局有没有下毒者，那是整局最贵的一次泄密。
    const { container } = render(
      <DuskBriefing brief={{ dayOutcome: '处决 5 号', nightQueue: ['僧侣', '下毒者'] }} queueVisible={false} />,
    )

    expect(container.textContent).not.toContain('僧侣')
    expect(container.textContent).not.toContain('下毒者')
    // 枚数不是身份，且是说书人排本夜进度唯一需要的量，所以它留下。
    expect(screen.getByText('2项 · 揭示后可见')).toBeVisible()
  })

  it('carries no phase-advancing key', () => {
    // 相位推进的唯一门是黄昏交接卡本身，不是核。核只是那张卡的回执面。
    const { container } = render(
      <DuskBriefing brief={{ dayOutcome: '无人被处决', nightQueue: ['僧侣'] }} queueVisible />,
    )
    expect(container.querySelector('button')).toBeNull()
  })
})
