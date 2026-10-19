import { describe, expect, it } from 'vitest'
import { archiveHostingTag, archiveLifeSummary } from './archiveHosting'
import type { HostingModeChange } from '../../features/game-session/types'

function change(mode: 'record' | 'grimoire', phaseLabel: string): HostingModeChange {
  return { mode, changedAt: `2026-01-01T00:0${phaseLabel.length}:00.000Z`, phaseLabel }
}

describe('归档卡片上的模式标签', () => {
  it('calls a never-switched game by its one mode', () => {
    expect(archiveHostingTag({ hostingMode: 'record', hostingModeHistory: [] }))
      .toEqual({ id: 'record', label: '笔录局', detail: null })
    expect(archiveHostingTag({ hostingMode: 'grimoire', hostingModeHistory: [] }))
      .toEqual({ id: 'grimoire', label: '魔典局', detail: null })
  })

  it('does not call a game mixed just because choosing a mode left a record', () => {
    // 开局前显式选一次魔典也会写进 hostingModeHistory。按「有历史 = 切换过」判的话，
    // 每一局全程魔典的对局都会被标成混合，这枚标签也就没有任何用处了。
    expect(archiveHostingTag({
      hostingMode: 'grimoire',
      hostingModeHistory: [change('grimoire', '开局前')],
    })).toEqual({ id: 'grimoire', label: '魔典局', detail: null })
  })

  it('names the phase the game settled into its final mode', () => {
    expect(archiveHostingTag({
      hostingMode: 'grimoire',
      hostingModeHistory: [change('record', '开局前'), change('grimoire', '第3夜')],
    })).toEqual({
      id: 'mixed',
      label: '混合 · 第3夜起开魔典',
      detail: '开局前起改回笔录 → 第3夜起开魔典',
    })
  })

  it('follows the last switch, not the first time the grimoire was opened', () => {
    // 来回切过的局里，只有最后那一次说得出「从这里到终局是什么样」，
    // 而那正是回看的人要知道的。取第一次开魔典会说成「第2夜起开魔典」——
    // 而第 2 夜之后它又被关掉了。
    expect(archiveHostingTag({
      hostingMode: 'record',
      hostingModeHistory: [change('grimoire', '第2夜'), change('record', '第3天')],
    })).toMatchObject({ id: 'mixed', label: '混合 · 第3天起改回笔录' })
  })
})

describe('一次状态变更都没录过时，存活/死亡不许假装是对局事实', () => {
  const summary = { alive: 12, dead: 0, phases: 1, records: 4, nightActions: 3, dayActions: 0, votes: 0, executions: 0, corrections: 0 }

  it('says 未录入 instead of echoing the opening state back as a result', () => {
    // 一局死了六个人、说书人全程在实体魔典上记生死的对局，
    // 会因为 projectCurrentPlayerStates 原样返回建局初值而在战绩里显示「无人死亡」。
    expect(archiveLifeSummary({
      summary,
      grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 0, markerCount: 0 },
    })).toEqual({ recorded: false, aliveLabel: '未录入', deadLabel: '未录入' })
  })

  it('shows the real numbers once anything was recorded', () => {
    expect(archiveLifeSummary({
      summary: { ...summary, alive: 7, dead: 5 },
      grimoireCompleteness: { seatsWithRole: 12, totalSeats: 12, stateChangeCount: 5, markerCount: 0 },
    })).toEqual({ recorded: true, aliveLabel: '7', deadLabel: '5' })
  })
})
