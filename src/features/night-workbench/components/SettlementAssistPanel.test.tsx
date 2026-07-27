import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AIResultAdvice } from '../types'
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
    summary: '\u5148\u8865\u9f50\u672c\u9879\u9009\u62e9\u3002',
    facts: [],
    missing,
    journalDrafts: [],
    playerMessageDrafts: [],
    stateChangeDrafts: [],
    authorityWarnings: [],
    confidence: 'low',
  }
}

function answerAdvice(): AIResultAdvice {
  return {
    ...missingAdvice([]),
    status: 'answer',
    recommendedOutcomeId: 'applied',
    summary: '\u5efa\u8bae\u91c7\u7528\u751f\u6548\u8349\u7a3f\u3002',
    facts: ['\u6d17\u8111\u5e08\u53ea\u7ed9\u75af\u72c2\u63d0\u9192'],
    missing: [],
    journalDrafts: ['10\u53f7\u6d17\u8111\u5e08\u9009\u62e93\u53f7\u6210\u4e3a\u8c03\u67e5\u5458\u3002'],
    playerMessageDrafts: ['\u660e\u5929\u8bf7\u75af\u72c2\u5730\u58f0\u79f0\u81ea\u5df1\u662f\u8c03\u67e5\u5458\u3002'],
    stateChangeDrafts: ['\u6d89\u53ca\u75af\u72c2\uff1a\u4e0d\u5224\u65ad\u73a9\u5bb6\u662f\u5426\u7834\u75af\u72c2\u3002'],
    authorityWarnings: ['\u786e\u8ba4\u672c\u9879\u524d\u4e0d\u5199\u65e5\u5fd7\u3001\u4e0d\u6539\u72b6\u6001\u3002'],
    confidence: 'medium',
  }
}

describe('SettlementAssistPanel', () => {
  it('shows actionable guidance for missing AI inputs', () => {
    render(<SettlementAssistPanel aiAdvice={missingAdvice(['\u7f3a\u5c11\u73a9\u5bb6', '\u7f3a\u5c11\u58f0\u79f0\u89d2\u8272'])} />)

    const panel = screen.getByRole('region', { name: '\u672c\u9879\u8f85\u52a9' })
    expect(within(panel).getByText('AI\u7f3a\u5c11')).toBeInTheDocument()
    expect(within(panel).getByText('\u7f3a\u5c11\u73a9\u5bb6\u3001\u7f3a\u5c11\u58f0\u79f0\u89d2\u8272')).toBeInTheDocument()
    expect(within(panel).getByText('\u73a9\u5bb6')).toBeInTheDocument()
    expect(within(panel).getByText('\u5728\u4e0a\u65b9\u76ee\u6807\u533a\u70b9\u73a9\u5bb6\u53f7\u7801\u3002')).toBeInTheDocument()
    expect(within(panel).getByText('\u58f0\u79f0\u89d2\u8272')).toBeInTheDocument()
    expect(within(panel).getByText('\u5728\u89d2\u8272\u533a\u9009\u62e9\u672c\u6b21\u58f0\u660e\u6216\u731c\u6d4b\u3002')).toBeInTheDocument()
    expect(within(panel).getByText('\u8865\u9f50\u540e\u53ef\u91cd\u65b0\u63a8\u8350')).toBeInTheDocument()
  })

  it('shows AI draft previews without implying authority changes', () => {
    render(<SettlementAssistPanel aiAdvice={answerAdvice()} aiOutcomeLabel={'受到影响'} />)

    const panel = screen.getByRole('region', { name: '\u672c\u9879\u8f85\u52a9' })
    expect(within(panel).getByText('AI\u5efa\u8bae')).toBeInTheDocument()
    expect(within(panel).getByText('建议结果')).toBeInTheDocument()
    expect(within(panel).getAllByText('受到影响')).toHaveLength(2)
    expect(within(panel).getByText('\u5efa\u8bae\u8bb0\u5f55')).toBeInTheDocument()
    expect(within(panel).getByText('告知玩家')).toBeInTheDocument()
    expect(within(panel).getByText('状态确认')).toBeInTheDocument()
    expect(within(panel).getByText('风险提醒')).toBeInTheDocument()
    expect(within(panel).getByText(/\u786e\u8ba4\u672c\u9879\u524d/)).toBeInTheDocument()
  })
})
