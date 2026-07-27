import type { AIProviderChatMessage, SetupAdviceProviderRequest } from './types'

function compactArray<T>(value: readonly T[] | undefined, limit: number) {
  return (value ?? []).slice(0, limit)
}

function compactRoleKnowledge(role: SetupAdviceProviderRequest['candidates'][number]['roles'][number]) {
  if (!role.roleKnowledge) return undefined
  return {
    riskTags: compactArray(role.roleKnowledge.riskTags, 3),
    reminders: compactArray(role.roleKnowledge.reminders, 2),
    aiCannot: compactArray(role.roleKnowledge.aiCannot, 2),
  }
}

function compactRoleResearch(role: SetupAdviceProviderRequest['candidates'][number]['roles'][number]) {
  if (!role.roleResearch) return undefined
  return {
    knowledgeStatus: role.roleResearch.knowledgeStatus,
    setupImpact: compactArray(role.roleResearch.setupImpact, 2),
    possibleOutcomes: compactArray(role.roleResearch.possibleOutcomes, 3),
    highRiskNotes: compactArray(role.roleResearch.highRiskNotes, 3),
  }
}

function compactSetupInput(input: SetupAdviceProviderRequest) {
  return {
    scriptId: input.scriptId,
    scriptName: input.scriptName,
    knowledgeVersion: input.knowledgeVersion,
    playerCount: input.playerCount,
    seats: input.seats.map((seat) => ({
      seatId: seat.seatId,
      experience: seat.experience,
    })),
    rolePool: (input.rolePool ?? []).map((role) => ({
      roleId: role.roleId,
      roleName: role.roleName,
      team: role.team,
      abilityText: role.abilityText,
      setupImpact: compactArray(role.setupImpact, 2),
      highRiskNotes: compactArray(role.highRiskNotes, 2),
    })),
    candidates: input.candidates.map((candidate) => ({
      id: candidate.id,
      title: candidate.title,
      style: candidate.style,
      summary: candidate.summary,
      playerFit: candidate.playerFit,
      risk: candidate.risk,
      roles: candidate.roles.map((role) => ({
        seatId: role.seatId,
        roleId: role.roleId,
        roleName: role.roleName,
        team: role.team,
        abilityText: role.abilityText,
        roleKnowledge: compactRoleKnowledge(role),
        roleResearch: compactRoleResearch(role),
      })),
      demonBluffs: candidate.demonBluffs,
      legalityChecks: compactArray(candidate.legalityChecks, 6),
    })),
  }
}

export function buildSetupAdviceProviderMessages(input: SetupAdviceProviderRequest): AIProviderChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        '你是血染钟楼线下说书人的配板平衡顾问。',
        '你必须只使用输入里的候选、当前板子角色池、角色能力、roleKnowledge 和 roleResearch；不要凭记忆补角色机制。',
        '你可以排序现有候选，并给出最终平衡复核与角色池微调建议；微调只能是“建议替换方向”，不能自动应用。',
        '任何身份、座位、阵营、死亡、醉酒/中毒或开局状态，在说书人确认前都不生效。',
        '只返回 JSON 对象，不要 Markdown。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'rank_setup_candidates_with_balance_review_and_role_pool_tuning',
        outputShape: {
          confidence: 'low | medium | high',
          recommendedCandidateIds: ['candidate-id'],
          reasons: ['string'],
          balanceSummary: ['string'],
          qualityTags: [{
            candidateId: 'candidate-id',
            label: '稳定 | 偏红 | 偏邪 | 高反转 | 新手负担 | 裁量重',
            tone: 'stable | swingy | good_favored | evil_favored | new_player_heavy | storyteller_heavy',
            reason: 'short reason based only on input',
          }],
          microAdjustments: [{
            candidateId: 'candidate-id',
            replaceOutRoleId: 'role-id-in-that-candidate',
            replaceInRoleId: 'role-id-from-input-rolePool',
            reason: 'why this swap is worth considering',
            expectedEffect: 'what balance pressure it changes',
            risk: 'what storyteller must re-check before using it',
          }],
          storytellerNotes: ['string'],
          warnings: ['string'],
          disclaimer: 'string',
        },
        balanceHeuristics: [
          '看红方是否有足够可推理的信息链，但不要让首夜/早期硬信息过密。',
          '看邪恶是否有伪装和反制空间，包括假身份、干扰、死亡节奏和投票压力。',
          '看误导、中毒、醉酒、身份/阵营变化是否过量；复杂机制多时降低新手座负担。',
          '看恶魔生存压力、外来者修正、爪牙干扰和说书人裁量是否需要额外提醒。',
          '看当前人数下节奏：7-9 人避免过早锁死，12-15 人避免信息噪音失控。',
        ],
        constraints: [
          '输出必须短：reasons 最多 3 条；balanceSummary 最多 4 条；warnings/storytellerNotes 各最多 3 条；microAdjustments 最多 2 条；qualityTags 最多 6 条。',
          '每条文字尽量不超过 40 个中文字符；qualityTags[].label 不超过 6 个中文字符。',
          'recommendedCandidateIds 必须来自 input.candidates[].id。',
          '如果 roleKnowledge 或 roleResearch 存在，只能作为风险提醒，不得据此自动改身份或状态。',
          'microAdjustments[].candidateId 必须来自 input.candidates[].id。',
          'microAdjustments[].replaceOutRoleId 必须是该 candidate 的 roles[].roleId。',
          'microAdjustments[].replaceInRoleId 必须来自 input.rolePool[].roleId，且不能是 traveler/fabled。',
          '微调建议不需要追求完美，只给 0-4 条最值得人工考虑的替换方向。',
          'qualityTags 给每个重点候选 1-3 个短标签，帮助说书人快速扫风险；candidateId 必须来自 input.candidates[].id。',
          '如果替换会改变阵营、人数组成、外来者修正或恶魔伪装，必须在 risk 里提示重新核对。',
          '如果 roleResearch.knowledgeStatus 不是 confirmed，必须在 warnings 或 storytellerNotes 里提醒复核。',
          '不要生成全新配板，不要建议自动发送身份，不要声称已实战验证。',
        ],
        input: compactSetupInput(input),
      }),
    },
  ]
}
