import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DawnRollCall } from './DawnRollCall'

describe('DawnRollCall 显示什么', () => {
  it('lists the seat numbers in big type, which is the whole announcement', () => {
    // 黎明播报时说书人是照着核念的。号码要大到不用低头确认第二遍——
    // 念错一个座位号，全场的推理都建立在一条假事实上。
    const { container } = render(<DawnRollCall roll={{ deaths: [4, 9] }} />)
    const numbers = Array.from(container.querySelectorAll('.grimoire-core__dawn-seat')).map((el) => el.textContent)

    expect(numbers).toEqual(['4号', '9号'])
  })

  it('reports a revival only when there was one', () => {
    // 复活是罕见路径。常驻一行「复活 无」会让说书人每天早上都要读一遍空信息。
    const quiet = render(<DawnRollCall roll={{ deaths: [4] }} />)
    expect(screen.queryByText(/复活/)).toBeNull()
    quiet.unmount()

    render(<DawnRollCall roll={{ deaths: [], revivals: [2] }} />)
    expect(screen.getByText('复活 2号')).toBeVisible()
  })
})

describe('DawnRollCall 不显示什么', () => {
  it('tells an unrecorded night apart from a peaceful one', () => {
    // 前者是工具不知道，后者是说书人确认过。把漏记渲染成「平安夜」，
    // 会让一条看起来很确定的假事实被念给全场听。
    const unknown = render(<DawnRollCall roll={{ deaths: null }} />)
    expect(screen.getByText('昨夜生死尚未录入')).toBeInTheDocument()
    expect(screen.queryByText('平安夜')).toBeNull()
    unknown.unmount()

    render(<DawnRollCall roll={{ deaths: [] }} />)
    expect(screen.getByText('平安夜')).toBeVisible()
  })

  it('reports deaths without reporting why', () => {
    // 黎明的护栏是「只报生死，不报原因」，而核是全场最容易被玩家瞄到的一块。
    // 这里一旦出现死因或角色名，护栏就白立了。
    const { container } = render(<DawnRollCall roll={{ deaths: [4, 9], revivals: [2] }} />)

    expect(container.textContent).toBe('昨夜死亡4号9号复活 2号')
  })

  it('takes no input', () => {
    const { container } = render(<DawnRollCall roll={{ deaths: [4] }} />)
    expect(container.querySelector('button')).toBeNull()
  })
})
