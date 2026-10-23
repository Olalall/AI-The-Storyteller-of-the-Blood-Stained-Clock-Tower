import { describe, expect, it } from 'vitest'
import { createAIProxyHandlers } from './aiProxyHandlers'
import type { SetupAdviceProviderRequest } from './types'

function fixture(): SetupAdviceProviderRequest {
  return {
    scriptId: 'synthetic', scriptName: '资料复用测试', knowledgeVersion: 'test', playerCount: 7,
    seats: [{ seatId: 1, experience: 'regular' }],
    rolePool: [{ roleId: 'snakecharmer', roleName: '舞蛇人', team: 'townsfolk', abilityText: '测试能力',
      roleKnowledge: { roleId: 'snakecharmer', title: '舞蛇人', riskTags: ['identity'], requiredContext: [], reminders: ['身份变化需要确认'], aiCannot: ['自动换角'] },
      roleResearch: { roleId: 'snakecharmer', name: '舞蛇人', knowledgeStatus: 'confirmed', inputKinds: [], setupImpact: [], possibleOutcomes: ['交换身份'], stateChanges: [], identityChanges: ['身份变化'], teamChanges: [], playerMessageTemplates: [], highRiskNotes: ['人工确认'], sourceUrls: [] },
    }],
    candidates: [{ id: 'one', title: '测试方案', summary: '测试', roles: [{ seatId: 1, roleId: 'snakecharmer', roleName: '舞蛇人', team: 'townsfolk' }], demonBluffs: [] }],
  }
}

describe('setup advice reuses pooled character rules', () => {
  it('restores both rule briefs for the provider without mutating the request', async () => {
    const input = fixture()
    const before = JSON.stringify(input)
    let outgoing = ''
    const handlers = createAIProxyHandlers({ env: { BOTC_AI_ENABLED: 'true', BOTC_AI_BASE_URL: 'https://ai.example.test/v1', BOTC_AI_MODEL: 'fixture-model', BOTC_AI_API_KEY: 'fixture-only-key' },
      fetcher: async (_url, init) => {
        outgoing = String(init?.body)
        return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ recommendedCandidateIds: ['one'] }) } }] }))
      },
    })
    expect((await handlers.generateSetupAdvice(input)).provider).toBe('openai-compatible')
    const prompt = JSON.parse(JSON.parse(outgoing).messages[1].content).input
    const rule = prompt.roleRules.find((rule: { id: string }) => rule.id === prompt.candidates[0].roles[0].ruleRef)
    expect(rule.roleKnowledge.reminders).toContain('身份变化需要确认')
    expect(rule.roleResearch.possibleOutcomes).toContain('交换身份')
    expect(JSON.stringify(input)).toBe(before)
  })

  it('uses pooled rules in fallback warnings and preserves explicit legacy briefs', async () => {
    const input = fixture()
    const handlers = createAIProxyHandlers({ env: {} })
    expect((await handlers.generateSetupAdvice(input)).warnings).toContain('舞蛇人：身份变化需要确认')
    const old = { ...input, candidates: [{ ...input.candidates[0], roles: [{ ...input.candidates[0].roles[0], roleKnowledge: { ...input.rolePool![0].roleKnowledge!, reminders: ['旧请求的明确资料'] } }] }] }
    expect((await handlers.generateSetupAdvice(old)).warnings).toContain('舞蛇人：旧请求的明确资料')
    const missing = { ...input, rolePool: undefined }
    expect((await handlers.generateSetupAdvice(missing)).warnings).not.toContain('舞蛇人：身份变化需要确认')
  })
})
