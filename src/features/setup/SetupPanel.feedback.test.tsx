import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createSmartScriptSetupSession } from '../game-session/data/createPrototypeSession'
import { SetupPanel } from './SetupPanel'
import type { SetupPrototypeCandidate } from './types'
import type { SetupBalanceMicroAdjustment } from '../../services/ai'

vi.mock('./SetupCandidateBrowser', () => ({ SetupCandidateBrowser: ({ candidates, onPreviewMicroAdjustment }: { candidates: SetupPrototypeCandidate[]; onPreviewMicroAdjustment: (id: string, adjustment: SetupBalanceMicroAdjustment) => void }) => <button onClick={() => {
  const candidate = candidates[0]
  onPreviewMicroAdjustment(candidate.id, { candidateId: candidate.id, replaceOutRoleId: candidate.assignments[0].role.id, replaceInRoleId: candidate.assignments[1].role.id, reason: '测试重复角色', expectedEffect: '', risk: '' })
}}>预览调整</button> }))

describe('invalid AI micro adjustment feedback', () => {
  it('explains a duplicate role and leaves the current session untouched', async () => {
    const session = createSmartScriptSetupSession('trouble-brewing', '2026-10-21T01:00:00Z', { playerCount: 7 })
    const text = JSON.stringify(session)
    const dispatch = vi.fn()
    render(<SetupPanel open onOpenChange={vi.fn()} session={session} dispatch={dispatch} setupScriptId="trouble-brewing" onSetupScriptChange={vi.fn()} />)
    await userEvent.setup().click(screen.getByRole('button', { name: '预览调整' }))
    expect(screen.getByRole('status')).toHaveTextContent('这条 AI 微调无法预览')
    expect(screen.getByRole('status')).toHaveTextContent('原配板已保留')
    expect(dispatch).not.toHaveBeenCalled()
    expect(JSON.stringify(session)).toBe(text)
  })
})
