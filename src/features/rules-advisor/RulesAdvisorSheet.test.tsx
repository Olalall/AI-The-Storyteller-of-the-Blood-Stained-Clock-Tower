import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RulesAdvisorSheet } from './RulesAdvisorSheet'
import { askRulesAdvisor } from '../../services/ai/rulesAdvisorHttp'
import { readBackendAIStatus, setBackendAIAccess } from '../ai-settings/backendAIStatus'
import type { RulesAdvisorAnswer } from '../../services/ai/rulesAdvisorTypes'

vi.mock('../../services/ai/rulesAdvisorHttp', () => ({ askRulesAdvisor: vi.fn() }))
vi.mock('../ai-settings/backendAIStatus', () => ({ readBackendAIStatus: vi.fn(), setBackendAIAccess: vi.fn() }))
const answer: RulesAdvisorAnswer = { summary: '获得能力不改变真实身份。', ruleFacts: ['以本板能力原文为准。'], considerations: [], missingFacts: [], sources: [], knowledgeVersion: 'catfishing/test', scopeLabel: '瓦釜雷鸣 · 哲学家' }
const props = { open: true, onOpenChange: vi.fn(), initialScriptId: 'catfishing', concealed: false }

beforeEach(() => {
  vi.clearAllMocks(); localStorage.clear()
  Element.prototype.scrollIntoView = vi.fn()
  vi.mocked(readBackendAIStatus).mockResolvedValue({ tone: 'success', state: 'ready', message: 'ready' })
  vi.mocked(askRulesAdvisor).mockResolvedValue(answer)
})
async function send(question: string) {
  await userEvent.type(screen.getByRole('textbox', { name: '规则问题' }), question)
  await waitFor(() => expect(screen.getByRole('button', { name: '发送' })).toBeEnabled())
  await userEvent.click(screen.getByRole('button', { name: '发送' }))
  await screen.findByText(answer.summary)
}

describe('rules side conversation', () => {
  it('sends only explicit rules context, preserves the game and retains conversation across closing', async () => {
    localStorage.setItem('botc-copilot-session-v1', '{"secretIdentity":"private-player"}')
    const before = JSON.stringify(localStorage)
    const view = render(<RulesAdvisorSheet {...props} />)
    await userEvent.click(screen.getByRole('button', { name: '问答范围' }))
    await waitFor(() => expect(screen.getByLabelText('关注角色')).toBeEnabled())
    await userEvent.selectOptions(screen.getByLabelText('关注角色'), 'philosopher')
    await send('哲学家获得能力是换角吗？')
    expect(vi.mocked(askRulesAdvisor).mock.calls[0][0]).toEqual({ scriptId: 'catfishing', roleId: 'philosopher', question: '哲学家获得能力是换角吗？', history: [] })
    expect(JSON.stringify(vi.mocked(askRulesAdvisor).mock.calls)).not.toContain('private-player')
    expect(JSON.stringify(localStorage)).toBe(before)
    view.rerender(<RulesAdvisorSheet {...props} open={false} />)
    view.rerender(<RulesAdvisorSheet {...props} />)
    expect(screen.getByText(answer.summary)).toBeVisible()
  })

  it('preserves a failed question for retry and never adds a failed turn to history', async () => {
    vi.mocked(askRulesAdvisor).mockRejectedValueOnce(new Error('网络失败，问题已保留。'))
    render(<RulesAdvisorSheet {...props} />)
    await userEvent.type(screen.getByRole('textbox', { name: '规则问题' }), '首夜有什么注意事项？')
    await userEvent.click(await screen.findByRole('button', { name: '发送' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('网络失败')
    expect(screen.getByRole('textbox', { name: '规则问题' })).toHaveValue('首夜有什么注意事项？')
    await userEvent.click(screen.getByRole('button', { name: '发送' }))
    expect(await screen.findByText(answer.summary)).toBeVisible()
    expect(vi.mocked(askRulesAdvisor).mock.calls[1][0].history).toEqual([])
  })

  it('keeps previous answers visibly labeled but does not reuse another script or role history', async () => {
    render(<RulesAdvisorSheet {...props} />)
    await send('这块板怎么开局？')
    await userEvent.click(screen.getByRole('button', { name: '问答范围' }))
    fireEvent.change(screen.getByLabelText('搜索问答板子'), { target: { value: '黯月' } })
    await userEvent.selectOptions(screen.getByLabelText('问答板子'), 'bad-moon-rising')
    await userEvent.type(screen.getByRole('textbox', { name: '规则问题' }), '僵怖如何处理？')
    await waitFor(() => expect(screen.getByRole('button', { name: '发送' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: '发送' }))
    expect(vi.mocked(askRulesAdvisor).mock.calls[1][0]).toMatchObject({ scriptId: 'bad-moon-rising', history: [] })
  })

  it('hides existing conversation during a privacy shield and ignores a late response on unmount', async () => {
    let resolve!: (value: RulesAdvisorAnswer) => void
    vi.mocked(askRulesAdvisor).mockImplementation(() => new Promise(done => { resolve = done }))
    const view = render(<RulesAdvisorSheet {...props} />)
    await userEvent.type(screen.getByRole('textbox', { name: '规则问题' }), '待回答的问题')
    await waitFor(() => expect(screen.getByRole('button', { name: '发送' })).toBeEnabled())
    await userEvent.click(screen.getByRole('button', { name: '发送' }))
    const signal = vi.mocked(askRulesAdvisor).mock.calls[0][1]
    view.rerender(<RulesAdvisorSheet {...props} concealed />)
    expect(screen.queryByRole('textbox', { name: '规则问题' })).not.toBeInTheDocument()
    expect(signal.aborted).toBe(true)
    view.unmount()
    await act(async () => { resolve(answer) })
    expect(screen.queryByText(answer.summary)).not.toBeInTheDocument()
  })

  it('keeps send disabled until backend access is ready', async () => {
    vi.mocked(readBackendAIStatus).mockResolvedValue({ tone: 'warning', state: 'off', message: '后端 AI 未启用' })
    render(<RulesAdvisorSheet {...props} />)
    await screen.findByText('后端 AI 未启用')
    await userEvent.type(screen.getByRole('textbox', { name: '规则问题' }), '问题')
    expect(screen.getByRole('button', { name: '发送' })).toBeDisabled()
    expect(askRulesAdvisor).not.toHaveBeenCalled()
  })

  it('starts with conversation space and reveals context only on request without discarding the draft', async () => {
    render(<RulesAdvisorSheet {...props} />)
    expect(screen.queryByLabelText('搜索问答板子')).not.toBeInTheDocument()
    const scope = screen.getByRole('button', { name: '问答范围' })
    expect(scope).toHaveAttribute('aria-expanded', 'false')
    await userEvent.type(screen.getByRole('textbox', { name: '规则问题' }), '尚未发送')
    await userEvent.click(scope)
    expect(scope).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByLabelText('搜索问答板子')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: '完成' }))
    expect(screen.queryByLabelText('搜索问答板子')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '规则问题' })).toHaveValue('尚未发送')
    expect(askRulesAdvisor).not.toHaveBeenCalled()
  })

  it('keeps missing facts visible and makes evidence, cautions and source links expandable', async () => {
    vi.mocked(askRulesAdvisor).mockResolvedValue({ ...answer, considerations: ['先确认毒醉条件。'], missingFacts: ['还缺技能获得时点。'], sources: [{ id: 'S1', title: '规则原文', url: 'https://example.test/rules' }] })
    render(<RulesAdvisorSheet {...props} />)
    await send('当晚发动吗？')
    expect(screen.getByText('还缺技能获得时点。')).toBeVisible()
    expect(screen.getByText('先确认毒醉条件。')).not.toBeVisible()
    await userEvent.click(screen.getByText('依据与注意事项 · 1份资料'))
    expect(screen.getByText('先确认毒醉条件。')).toBeVisible()
    expect(screen.getByRole('link', { name: '规则原文' })).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('uses the invitation gate without a second composer and opens the composer after authorization', async () => {
    const locked = { tone: 'warning', state: 'locked', message: '需要验证', accessRequired: true } as const
    vi.mocked(readBackendAIStatus).mockResolvedValueOnce(locked)
    vi.mocked(setBackendAIAccess).mockResolvedValue({ tone: 'success', state: 'ready', message: '已验证' })
    render(<RulesAdvisorSheet {...props} />)
    const input = await screen.findByLabelText('AI 访问口令', { exact: true })
    expect(input).toHaveAttribute('type', 'password')
    expect(screen.queryByRole('textbox', { name: '规则问题' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'AI 访问保护' })).not.toBeInTheDocument()
    await userEvent.type(input, 'synthetic-invitation-passcode')
    await userEvent.click(screen.getByRole('button', { name: '验证并记住此设备' }))
    expect(await screen.findByRole('textbox', { name: '规则问题' })).toHaveValue('')
    expect(askRulesAdvisor).not.toHaveBeenCalled()
    expect(JSON.stringify(localStorage)).not.toContain('synthetic-invitation-passcode')
  })
})
