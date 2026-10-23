import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
import { createSetupAdviceDraftAsync, type SetupAdviceRuntimeDraft } from '../../services/ai'
import { SetupCandidateBrowser } from './SetupCandidateBrowser'
import { createSmartScriptSetupCandidates } from './smartScriptSetupCandidates'

vi.mock('../../services/ai', () => ({ createSetupAdviceDraftAsync: vi.fn() }))
const seats = Array.from({ length: 12 }, (_, i) => ({ seatId: i + 1, nickname: `玩家${i + 1}`, experience: 'regular' as const }))
const candidates = createSmartScriptSetupCandidates('shuo-shu-ren-zhi-nu', seats, { count: 8, seed: 'paging', expand: true })
function mount() {
  const onUseCandidate = vi.fn()
  render(<SetupCandidateBrowser scriptId="shuo-shu-ren-zhi-nu" scriptName="说书人之怒" knowledgeVersion="test" candidates={candidates} playerCount={12} seats={seats} onUseCandidate={onUseCandidate} />)
  return onUseCandidate
}
const cardTitles = () => screen.getAllByRole('article').map(card => card.querySelector('h4')?.textContent)
beforeEach(() => vi.resetAllMocks())

it('browses unique batches, appends more, explains exhaustion and never applies a candidate while browsing', async () => {
  const user = userEvent.setup()
  const onUse = mount()
  const first = cardTitles()
  expect(first).toHaveLength(3)
  expect(screen.getAllByRole('list', { name: /角色组合/ })).toHaveLength(3)
  await user.click(screen.getByRole('button', { name: '换一批' }))
  expect(cardTitles()).toHaveLength(3)
  expect(cardTitles().every(title => !first.includes(title))).toBe(true)
  await user.click(screen.getByRole('button', { name: '更多方案' }))
  expect(cardTitles()).toHaveLength(5)
  expect(screen.getByText(/共 8 个不同组合，本批已到底/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '更多方案' })).toBeDisabled()
  expect(onUse).not.toHaveBeenCalled()
  await user.click(screen.getAllByRole('button', { name: '查看详情' })[0])
  await user.click(screen.getByRole('button', { name: '选择这套配板' }))
  expect(onUse).toHaveBeenCalledExactlyOnceWith(candidates[3].id)
})

it('only asks AI about the visible batch and discards a reply after the user changes it', async () => {
  const user = userEvent.setup()
  let resolve!: (draft: SetupAdviceRuntimeDraft) => void
  vi.mocked(createSetupAdviceDraftAsync).mockImplementation(() => new Promise(done => { resolve = done }))
  const onUse = mount()
  await user.click(screen.getByRole('button', { name: 'AI推荐' }))
  expect(createSetupAdviceDraftAsync).toHaveBeenCalledWith(expect.objectContaining({ candidates: candidates.slice(0, 3) }))
  await user.click(screen.getByRole('button', { name: '换一批' }))
  await act(async () => resolve({ recommendedCandidateIds: [candidates[0].id], qualityTags: [], microAdjustments: [], reasons: ['过期推荐不应显示'], warnings: [], balanceSummary: [], storytellerNotes: [] } as unknown as SetupAdviceRuntimeDraft))
  expect(screen.queryByText('过期推荐不应显示')).not.toBeInTheDocument()
  expect(screen.queryByText('AI首选')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'AI推荐' })).toBeEnabled()
  expect(onUse).not.toHaveBeenCalled()
})
