import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScriptQualityPanel } from './ScriptQualityPanel'
import type { ScriptQualityReport, ScriptQualitySummary } from '../../domain/scripts'

function item(overrides: Partial<ScriptQualitySummary> = {}): ScriptQualitySummary {
  return {
    scriptId: 'ready-script',
    displayName: '可用板子',
    readiness: 'ready',
    readinessLabel: '可开局',
    aiQualityLabel: 'AI强',
    roleStatus: { confirmed: 20, needsReview: 0, missing: 0, total: 20 },
    setupRuleStatus: { confirmed: 1, needsReview: 0, missing: 0, total: 1 },
    nightOrderStatus: { confirmed: 12, needsReview: 0, missing: 0, total: 12 },
    roleResearch: { reviewed: 20, total: 20 },
    setupTemplates: { verified: 9, total: 9 },
    playerCounts: { covered: [7, 8, 9, 10, 11, 12, 13, 14, 15], missing: [] },
    warnings: [],
    ...overrides,
  }
}

function report(): ScriptQualityReport {
  const items = [
    item(),
    item({
      scriptId: 'review-script',
      displayName: '待复核板子',
      readiness: 'review',
      readinessLabel: '需复核',
      aiQualityLabel: 'AI可用',
      roleStatus: { confirmed: 18, needsReview: 2, missing: 0, total: 20 },
      roleResearch: { reviewed: 18, total: 20 },
      warnings: ['角色待复核 2', '调研 18/20'],
    }),
  ]
  return {
    totals: { scripts: 2, ready: 1, review: 1, blocked: 0, roles: 40, templates: 18 },
    items,
  }
}

describe('ScriptQualityPanel', () => {
  it('shows script quality metrics and warnings', () => {
    render(<ScriptQualityPanel report={report()} currentScriptId="ready-script" />)

    expect(screen.getByRole('heading', { name: '智能板子看板' })).toBeInTheDocument()
    expect(screen.getByText('已导入')).toBeInTheDocument()
    expect(screen.getAllByText('需复核').length).toBeGreaterThan(0)
    expect(screen.getByText('角色待复核 2')).toBeInTheDocument()
  })

  it('keeps the current script first', () => {
    render(<ScriptQualityPanel report={report()} currentScriptId="review-script" />)

    const list = screen.getByLabelText('板子质量清单')
    const cards = within(list).getAllByRole('article')
    expect(within(cards[0]).getByRole('heading', { name: '待复核板子' })).toBeInTheDocument()
    expect(within(cards[0]).getByText('当前')).toBeInTheDocument()
  })
})
