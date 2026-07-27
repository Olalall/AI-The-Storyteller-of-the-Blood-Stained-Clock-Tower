import { describe, expect, it } from 'vitest'
import type { SetupPrototypeCandidate } from '../../features/setup'
import { createSetupAdviceDraftAsync, type CreateSetupAdviceDraftAsyncInput } from './setupAdviceHttp'

function candidates(): SetupPrototypeCandidate[] {
  return [
    {
      id: 'setup-a',
      title: '均衡局',
      style: 'balanced',
      scriptId: 'catfishing',
      playerCount: 12,
      knowledgeVersion: 'test-v1',
      assignments: [{ seatId: 1, role: { id: 'investigator', name: '调查员', initial: '调', iconPath: '' } }],
      demonBluffs: [{ id: 'chef', name: '厨师', initial: '厨', iconPath: '' }],
      rationale: {
        summary: '信息源分散。',
        pace: 'steady',
        playerFit: '新手负担低。',
        risk: '核对人数修正。',
      },
      source: 'prototype',
      legalityChecks: [{ id: 'count', status: 'pass', passed: true, summary: '人数通过' }],
    },
    {
      id: 'setup-b',
      title: '反转局',
      style: 'reversal',
      scriptId: 'catfishing',
      playerCount: 12,
      knowledgeVersion: 'test-v1',
      assignments: [{ seatId: 2, role: { id: 'snake_charmer', name: '舞蛇人', initial: '舞', iconPath: '' } }],
      demonBluffs: [{ id: 'grandmother', name: '祖母', initial: '祖', iconPath: '' }],
      rationale: {
        summary: '身份变化更多。',
        pace: 'swingy',
        playerFit: '适合熟练座。',
        risk: '核对交换后状态。',
      },
      source: 'prototype',
      legalityChecks: [],
    },
  ]
}

function inputFixture(): CreateSetupAdviceDraftAsyncInput {
  return {
    scriptId: 'catfishing',
    scriptName: 'Catfishing / 瓦釜雷鸣',
    knowledgeVersion: 'test-v1',
    playerCount: 12,
    seats: [
      { seatId: 1, nickname: '玩家1', experience: 'new' },
      { seatId: 2, nickname: '玩家2', experience: 'regular' },
    ],
    candidates: candidates(),
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('setup advice HTTP adapter', () => {
  it('uses local setup advice without calling backend in local mode', async () => {
    let called = false
    const draft = await createSetupAdviceDraftAsync(inputFixture(), {
      runtimeSettings: { mode: 'local', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => {
        called = true
        return jsonResponse({})
      },
    })

    expect(called).toBe(false)
    expect(draft.provider).toBe('fake')
    expect(draft.source).toBe('local')
    expect(draft.recommendedCandidateIds).toEqual(['setup-a', 'setup-b'])
  })

  it('maps backend setup advice into front-end draft shape', async () => {
    const draft = await createSetupAdviceDraftAsync(inputFixture(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async (_input, init) => {
        const body = JSON.parse(String(init?.body)) as Record<string, unknown>
        const serializedBody = JSON.stringify(body)
        expect(serializedBody).toContain('setup-a')
        expect(serializedBody).toContain('rolePool')
        expect(serializedBody).toContain('abilityText')
        expect(serializedBody).toContain('roleKnowledge')
        expect(serializedBody).toContain('roleResearch')
        expect(serializedBody).toContain('舞蛇人')
        expect(serializedBody).toContain('swap characters')
        expect(serializedBody).toContain('新舞蛇人中毒')
        return jsonResponse({
          accepted: true,
          data: {
            draft: {
              provider: 'openai-compatible',
              confidence: 'medium',
              draftOnly: true,
              recommendedCandidateIds: ['setup-b'],
              warnings: ['人工核对身份变化。'],
              reasons: ['熟练座更多。'],
              balanceSummary: ['信息量适中，邪恶仍有伪装空间。'],
              storytellerNotes: ['采用前重新核对阵营分布。'],
              qualityTags: [{
                candidateId: 'setup-b',
                label: '高反转',
                tone: 'swingy',
                reason: '身份变化较多。',
              }],
              microAdjustments: [{
                candidateId: 'setup-b',
                candidateTitle: '反转局',
                replaceOutRoleId: 'snake_charmer',
                replaceOutRoleName: '舞蛇人',
                replaceInRoleId: 'dreamer',
                replaceInRoleName: '筑梦师',
                reason: '降低身份交换裁量。',
                expectedEffect: '减少新手误解。',
                risk: '替换后重跑人数核对。',
              }],
              disclaimer: 'AI 只给草稿。',
            },
          },
        })
      },
    })

    expect(draft.provider).toBe('openai-compatible')
    expect(draft.source).toBe('backend')
    expect(draft.recommendedCandidateIds).toEqual(['setup-b'])
    expect(draft.warnings[0]).toContain('人工')
    expect(draft.balanceSummary[0]).toContain('信息量')
    expect(draft.qualityTags[0]).toMatchObject({ candidateId: 'setup-b', label: '高反转' })
    expect(draft.microAdjustments[0]).toMatchObject({ candidateId: 'setup-b', replaceInRoleId: 'dreamer' })
  })

  it('falls back to local setup advice when backend route fails', async () => {
    const draft = await createSetupAdviceDraftAsync(inputFixture(), {
      runtimeSettings: { mode: 'http', baseUrl: 'http://127.0.0.1:8787', timeoutMs: 2000 },
      fetcher: async () => jsonResponse({ accepted: false }, 503),
    })

    expect(draft.provider).toBe('fake')
    expect(draft.source).toBe('local')
    expect(draft.warning).toContain('后端配板建议不可用')
  })
})
