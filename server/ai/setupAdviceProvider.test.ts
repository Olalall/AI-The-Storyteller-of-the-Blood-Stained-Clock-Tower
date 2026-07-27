import { describe, expect, it } from 'vitest'
import type { FetchLike } from './aiProviderClient'
import { createOpenAICompatibleSetupAdviceProvider, fallbackSetupAdviceDraft } from './setupAdviceProvider'
import { buildSetupAdviceProviderMessages } from './setupAdvicePromptBuilder'
import type { SetupAdviceProviderRequest } from './types'

const secret = 'sk-setup-provider-secret'

function setupInput(): SetupAdviceProviderRequest {
  return {
    scriptId: 'catfishing',
    scriptName: 'Catfishing / 瓦釜雷鸣',
    knowledgeVersion: 'catfishing/test-v1',
    playerCount: 12,
    seats: [
      { seatId: 1, nickname: '玩家1', experience: 'new' },
      { seatId: 2, nickname: '玩家2', experience: 'regular' },
    ],
    rolePool: [
      {
        roleId: 'investigator',
        roleName: '调查员',
        team: 'townsfolk',
        abilityText: '首夜获得两个玩家中有爪牙的信息。',
        highRiskNotes: [],
      },
      {
        roleId: 'chef',
        roleName: '厨师',
        team: 'townsfolk',
        abilityText: '首夜得知相邻邪恶对数。',
        highRiskNotes: [],
      },
      {
        roleId: 'snake_charmer',
        roleName: '舞蛇人',
        team: 'townsfolk',
        abilityText: '每夜选择玩家；若是恶魔则交换身份和阵营。',
        highRiskNotes: ['身份变化必须人工确认。'],
      },
    ],
    candidates: [
      {
        id: 'candidate-a',
        title: '均衡局',
        style: 'balanced',
        summary: '信息源分散，适合标准桌。',
        playerFit: '新手拿低负担角色。',
        risk: '先核对人数修正。',
        roles: [{ seatId: 1, roleId: 'investigator', roleName: '调查员', team: 'townsfolk' }],
        demonBluffs: ['厨师', '祖母', '守鸦人'],
        legalityChecks: [{ id: 'count', status: 'pass', summary: '人数通过' }],
      },
      {
        id: 'candidate-b',
        title: '反转局',
        style: 'chaos',
        summary: '身份变化更多，适合熟练玩家。',
        roles: [{
          seatId: 2,
          roleId: 'snake_charmer',
          roleName: '舞蛇人',
          team: 'townsfolk',
          roleKnowledge: {
            roleId: 'snakecharmer',
            title: '舞蛇人',
            riskTags: ['identity', 'team', 'poison'],
            requiredContext: ['目标是否真恶魔', '舞蛇人是否有效'],
            reminders: ['命中恶魔时交换身份和阵营。', '新舞蛇人应标记中毒，不是醉酒。'],
            aiCannot: ['自动交换身份', '自动改阵营', '自动加中毒'],
          },
        }],
        demonBluffs: ['博学者', '守鸦人', '贤者'],
      },
    ],
  }
}

function response(content: unknown) {
  return new Response(JSON.stringify({
    choices: [{ message: { content: JSON.stringify(content) } }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

describe('setup advice provider', () => {
  it('builds setup advice context from candidate briefs only', () => {
    const messages = buildSetupAdviceProviderMessages(setupInput())
    const serialized = JSON.stringify(messages)

    expect(serialized).toContain('rank_setup_candidates')
    expect(serialized).toContain('candidate-a')
    expect(serialized).toContain('命中恶魔时交换身份和阵营')
    expect(serialized).toContain('不得据此自动改身份或状态')
    expect(serialized).not.toContain('"session"')
    expect(serialized).not.toContain('"timeline"')
    expect(serialized).not.toContain('BOTC_AI_API_KEY')
  })

  it('generates a draft through mock fetch and filters unknown candidate ids', async () => {
    const fetcher: FetchLike = async (_input, init) => {
      const headers = init?.headers as Record<string, string>
      expect(String(init?.body)).not.toContain(secret)
      expect(headers.Authorization).toBe(`Bearer ${secret}`)
      return response({
        confidence: 'medium',
        recommendedCandidateIds: ['candidate-b', 'missing-candidate'],
        warnings: ['舞蛇人身份变化要人工确认。'],
        reasons: ['反转局更适合当前熟练座。'],
        balanceSummary: ['反转局信息强度更高，但需要保留邪恶伪装空间。'],
        storytellerNotes: ['微调只作为人工复核建议。'],
        qualityTags: [{
          candidateId: 'candidate-b',
          label: '高反转',
          tone: 'swingy',
          reason: '身份变化更多。',
        }, {
          candidateId: 'missing-candidate',
          label: '坏标签',
          tone: 'danger',
          reason: 'bad',
        }],
        microAdjustments: [{
          candidateId: 'candidate-b',
          replaceOutRoleId: 'snake_charmer',
          replaceInRoleId: 'chef',
          reason: '降低身份交换裁量压力。',
          expectedEffect: '减少规则负担。',
          risk: '替换后重新核对信息密度。',
        }, {
          candidateId: 'candidate-b',
          replaceOutRoleId: 'snake_charmer',
          replaceInRoleId: 'missing-role',
          reason: 'bad',
          expectedEffect: 'bad',
          risk: 'bad',
        }],
        disclaimer: 'AI 只给配板草稿。',
      })
    }

    const provider = createOpenAICompatibleSetupAdviceProvider({
      baseUrl: 'https://ai.example.test/v1',
      model: 'setup-model',
      apiKey: secret,
      timeoutSeconds: 1,
      fetcher,
    })
    const result = await provider.generateSetupAdvice(setupInput())

    expect(result.draft.provider).toBe('openai-compatible')
    expect(result.draft.draftOnly).toBe(true)
    expect(result.draft.recommendedCandidateIds).toEqual(['candidate-b'])
    expect(result.draft.balanceSummary[0]).toContain('信息强度')
    expect(result.draft.qualityTags).toEqual([expect.objectContaining({ candidateId: 'candidate-b', label: '高反转', tone: 'swingy' })])
    expect(result.draft.microAdjustments).toEqual([expect.objectContaining({
      candidateId: 'candidate-b',
      candidateTitle: '反转局',
      replaceOutRoleName: '舞蛇人',
      replaceInRoleName: '厨师',
    })])
    expect(JSON.stringify(result)).not.toContain(secret)
  })

  it('falls back to local candidate order without inventing ids', () => {
    const draft = fallbackSetupAdviceDraft(setupInput())

    expect(draft.provider).toBe('fake')
    expect(draft.recommendedCandidateIds).toEqual(['candidate-a', 'candidate-b'])
    expect(draft.warnings.join(' ')).toContain('命中恶魔时交换身份和阵营')
    expect(draft.balanceSummary.join(' ')).toContain('角色池')
    expect(draft.qualityTags.length).toBeGreaterThan(0)
    expect(draft.microAdjustments[0]).toMatchObject({ candidateId: 'candidate-b', replaceOutRoleId: 'snake_charmer' })
    expect(draft.disclaimer).toContain('说书人确认')
  })
})
