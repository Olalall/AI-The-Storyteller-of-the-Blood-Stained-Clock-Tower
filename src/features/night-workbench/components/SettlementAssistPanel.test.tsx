import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PlayerState } from '../../game-session/model/playerTypes'
import type { StateChangeAdoptionContext } from '../../../services/ai/stateChangeAdoption'
import type { AIResultAdvice, AIStateChangeDraft } from '../types'
import { SettlementAssistPanel } from './SettlementAssistPanel'

function missingAdvice(missing: string[]): AIResultAdvice {
  return {
    id: 'advice-1',
    adviceId: 'advice-1',
    kind: 'result',
    nightRunId: 'night-1',
    wakeItemId: 'wake-1',
    contextRevision: 1,
    sourceDraftRevision: 1,
    knowledgeVersion: 'test',
    status: 'needs_input',
    summary: '先补齐本项选择。',
    facts: [],
    missing,
    journalDrafts: [],
    playerMessageDrafts: [],
    stateChangeDrafts: [],
    authorityWarnings: [],
    confidence: 'low',
  }
}

function answerAdvice(stateChangeDrafts: AIStateChangeDraft[] = [{ text: '涉及疯狂：不判断玩家是否破疯狂。' }]): AIResultAdvice {
  return {
    ...missingAdvice([]),
    status: 'answer',
    recommendedOutcomeId: 'applied',
    summary: '建议采用生效草稿。',
    facts: ['洗脑师只给疯狂提醒'],
    missing: [],
    journalDrafts: ['10号洗脑师选择3号成为调查员。'],
    playerMessageDrafts: ['明天请疯狂地声称自己是调查员。'],
    stateChangeDrafts,
    authorityWarnings: ['确认本项前不写日志、不改状态。'],
    confidence: 'medium',
  }
}

function alive(overrides: Partial<PlayerState> = {}): PlayerState {
  return { life: 'alive', poisoned: false, drunk: false, markers: [], ...overrides }
}

function adoptionContext(playerStates: Record<number, PlayerState>): StateChangeAdoptionContext {
  return { playerStates, segmentId: 'segment-night-1' }
}

describe('SettlementAssistPanel', () => {
  it('shows actionable guidance for missing AI inputs', () => {
    render(<SettlementAssistPanel aiAdvice={missingAdvice(['缺少玩家', '缺少声称角色'])} />)

    const panel = screen.getByRole('region', { name: '本项辅助' })
    expect(within(panel).getByText('AI缺少')).toBeInTheDocument()
    expect(within(panel).getByText('缺少玩家、缺少声称角色')).toBeInTheDocument()
    expect(within(panel).getByText('玩家')).toBeInTheDocument()
    expect(within(panel).getByText('在上方目标区点玩家号码。')).toBeInTheDocument()
    expect(within(panel).getByText('声称角色')).toBeInTheDocument()
    expect(within(panel).getByText('在角色区选择本次声明或猜测。')).toBeInTheDocument()
    expect(within(panel).getByText('补齐后可重新推荐')).toBeInTheDocument()
  })

  it('shows AI draft previews without implying authority changes', () => {
    render(<SettlementAssistPanel aiAdvice={answerAdvice()} aiOutcomeLabel={'受到影响'} />)

    const panel = screen.getByRole('region', { name: '本项辅助' })
    expect(within(panel).getByText('AI建议')).toBeInTheDocument()
    expect(within(panel).getByText('建议结果')).toBeInTheDocument()
    expect(within(panel).getAllByText('受到影响')).toHaveLength(2)
    expect(within(panel).getByText('建议记录')).toBeInTheDocument()
    expect(within(panel).getByText('告知玩家')).toBeInTheDocument()
    expect(within(panel).getByText('状态确认')).toBeInTheDocument()
    expect(within(panel).getByText('风险提醒')).toBeInTheDocument()
    expect(within(panel).getByText(/确认本项前/)).toBeInTheDocument()
  })

  /*
   * 没有落盘上下文时不许出现任何写入入口。
   * 违反的后果：夜间工作台上会出现一枚点了没反应、或者拿不到 expectedBefore 就往下写的按钮。
   */
  it('renders plain state-change text with no write affordance when no adoption context is supplied', () => {
    render(<SettlementAssistPanel
      aiAdvice={answerAdvice([{ text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } }])}
      aiOutcomeLabel={'受到影响'}
    />)

    const panel = screen.getByRole('region', { name: '本项辅助' })
    expect(within(panel).getByText('给3号加中毒')).toBeInTheDocument()
    expect(within(panel).queryByRole('button')).toBeNull()
  })

  /*
   * 纯文本建议（本地降级路径给的就是这种）永远不该长出落盘键。
   * 违反的后果：一句「可能涉及中毒」会变成一枚可点的按钮，而它并不知道该改谁。
   */
  it('keeps text-only drafts unclickable even with a full adoption context', () => {
    render(<SettlementAssistPanel
      aiAdvice={answerAdvice([{ text: '可能涉及中毒：确认后在玩家状态中标记。' }])}
      aiOutcomeLabel={'受到影响'}
      adoption={adoptionContext({ 3: alive() })}
      onAdoptStateChange={vi.fn()}
    />)

    const panel = screen.getByRole('region', { name: '本项辅助' })
    expect(within(panel).getByText('可能涉及中毒：确认后在玩家状态中标记。')).toBeInTheDocument()
    expect(within(panel).queryByRole('button')).toBeNull()
  })

  /*
   * 采纳按钮的三件事一次钉死：文案用第三段式、点击派发的是组件自造的
   * confirm-player-state-change、expectedBefore 取自当前局面而不是建议。
   */
  it('dispatches a self-built confirm-player-state-change when the storyteller commits', async () => {
    const onAdopt = vi.fn()
    render(<SettlementAssistPanel
      aiAdvice={answerAdvice([{ text: '给3号加中毒', seatId: 3, change: { field: 'poisoned', to: 'true' } }])}
      aiOutcomeLabel={'受到影响'}
      adoption={adoptionContext({ 3: alive({ life: 'dead' }) })}
      onAdoptStateChange={onAdopt}
    />)

    const button = screen.getByRole('button', { name: /确认落盘/ })
    expect(button.textContent).toContain('3号 中毒→是')
    // 边界禁用词：写着「已应用」的按钮会让说书人跳过确认，而跳过那一次不会有任何报错。
    expect(button.textContent).not.toMatch(/应用|执行|AI 已处理|已自动/)

    await userEvent.click(button)

    expect(onAdopt).toHaveBeenCalledTimes(1)
    const action = onAdopt.mock.calls[0][0]
    expect(action.type).toBe('confirm-player-state-change')
    expect(action.seatId).toBe(3)
    expect(action.expectedBefore).toEqual(alive({ life: 'dead' }))
    expect(action.after).toEqual(alive({ life: 'dead', poisoned: true }))
    expect(action.ops).toEqual([{ op: 'impairment_set', seatId: 3, impairment: 'poisoned', value: true }])
    expect(action.reason).toContain('advice-1')
  })
})
