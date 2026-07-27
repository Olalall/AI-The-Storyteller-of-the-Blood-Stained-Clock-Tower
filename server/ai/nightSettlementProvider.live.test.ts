import { describe, expect, it } from 'vitest'
import { createOpenAICompatibleNightSettlementProvider } from './nightSettlementProvider'
import type { NightSettlementAdviceDraft, NightSettlementProviderRequest, RoleResearchProviderBrief } from './types'

const shouldRunLive = process.env.BOTC_RUN_REAL_AI_NIGHT_QUALITY_SMOKE === '1'
const describeLive = shouldRunLive ? describe : describe.skip

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing ${name}. Live smoke never reads API keys from source files.`)
  return value
}

function timeoutSeconds() {
  const explicitSeconds = Number(process.env.BOTC_AI_TIMEOUT_SECONDS)
  if (Number.isFinite(explicitSeconds) && explicitSeconds > 0) return explicitSeconds
  const timeoutMs = Number(process.env.BOTC_AI_TIMEOUT_MS)
  if (Number.isFinite(timeoutMs) && timeoutMs > 0) return Math.ceil(timeoutMs / 1000)
  return 90
}

function research(patch: Partial<RoleResearchProviderBrief> & Pick<RoleResearchProviderBrief, 'roleId' | 'name'>): RoleResearchProviderBrief {
  return {
    officialName: patch.name,
    knowledgeStatus: 'confirmed',
    inputKinds: [],
    setupImpact: [],
    possibleOutcomes: [],
    stateChanges: [],
    identityChanges: [],
    teamChanges: [],
    playerMessageTemplates: [],
    highRiskNotes: [],
    sourceUrls: ['local-smart-script-research'],
    reviewedAt: '2026-07-27',
    ...patch,
  }
}

function baseInput(
  patch: Partial<NightSettlementProviderRequest> & {
    wakeItem: NightSettlementProviderRequest['wakeItem']
    draft: NightSettlementProviderRequest['draft']
    availableOutcomes: NightSettlementProviderRequest['availableOutcomes']
    roleResearch: RoleResearchProviderBrief
  },
): NightSettlementProviderRequest {
  return {
    scriptId: 'catfishing',
    knowledgeVersion: 'live-night-quality/2026-07-27',
    nightRunId: `live-${patch.wakeItem.roleId}`,
    phaseLabel: '第3夜',
    playerCount: 12,
    selectedTargets: [],
    statusFacts: [`发动者：${patch.wakeItem.seatId}号${patch.wakeItem.roleName}，状态：存活`],
    roleKnowledge: {
      roleId: patch.wakeItem.roleId,
      title: patch.wakeItem.roleName,
      riskTags: ['draft-only'],
      requiredContext: [],
      reminders: ['只给说书人草稿；确认前不写日志、不改状态。'],
      aiCannot: ['自动改身份', '自动改阵营', '自动杀人', '自动判胜负'],
    },
    ...patch,
  }
}

const liveCases: Array<{
  id: string
  expectedOutcomeId: string
  mustMention: string[]
  input: NightSettlementProviderRequest
}> = [
  {
    id: 'GAMBLER-LIVE wrong guess',
    expectedOutcomeId: 'wrong',
    mustMention: ['死亡', '草稿'],
    input: baseInput({
      wakeItem: {
        id: 'live-gambler',
        orderIndex: 3,
        seatId: 6,
        playerLabel: '6号 · 阿乐',
        roleId: 'gambler',
        roleName: '赌徒',
        ability: '每个夜晚，选择一名玩家并猜测其角色；如果猜错，你死亡。',
        storytellerPrompt: '记录赌徒目标和猜测角色。',
        targetCount: 1,
        targetLabel: '玩家',
        roleLabel: '猜测角色',
        status: { life: 'alive', impairments: [], markers: [] },
      },
      draft: {
        targets: [8],
        roleChoice: 'artist',
        outcomeId: '',
        playerChoice: '6号赌徒猜8号是艺术家。',
        draftRevision: 1,
      },
      selectedTargets: [{
        seatId: 8,
        playerLabel: '8号 · 小鱼',
        roleId: 'outsider',
        roleName: '陌客',
        status: { life: 'alive', impairments: [], markers: [] },
      }],
      statusFacts: [
        '发动者：6号赌徒，状态：存活。',
        '目标：8号陌客，状态：存活。',
        '赌徒猜测：艺术家；目标实际角色：陌客。',
      ],
      availableOutcomes: [
        { id: 'correct', label: '猜对', ready: true, requiredInputs: ['targets', 'role'] },
        { id: 'wrong', label: '猜错，死亡待确认', ready: true, requiredInputs: ['targets', 'role'] },
        { id: 'no-effect', label: '未受影响', ready: true, requiredInputs: ['targets', 'role'] },
      ],
      roleResearch: research({
        roleId: 'gambler',
        name: '赌徒',
        inputKinds: ['player', 'role'],
        possibleOutcomes: ['猜测与目标实际角色一致：无事发生。', '猜测与目标实际角色不一致：赌徒死亡，仍需说书人确认。'],
        stateChanges: ['可能产生死亡草稿。'],
        highRiskNotes: ['AI 不得自动杀死赌徒。'],
      }),
    }),
  },
  {
    id: 'SNAKECHARMER-LIVE demon target',
    expectedOutcomeId: 'swap',
    mustMention: ['身份', '阵营', '中毒'],
    input: baseInput({
      wakeItem: {
        id: 'live-snakecharmer',
        orderIndex: 4,
        seatId: 5,
        playerLabel: '5号 · 小周',
        roleId: 'snakecharmer',
        roleName: '舞蛇人',
        ability: '每个夜晚，选择一名玩家：如果他是恶魔，你们交换角色和阵营，他成为醉酒的舞蛇人。',
        storytellerPrompt: '记录舞蛇人目标并核对目标是否为恶魔。',
        targetCount: 1,
        targetLabel: '玩家',
        status: { life: 'alive', impairments: [], markers: [] },
      },
      draft: {
        targets: [12],
        roleChoice: '',
        outcomeId: '',
        playerChoice: '5号舞蛇人选择12号。',
        draftRevision: 1,
      },
      selectedTargets: [{
        seatId: 12,
        playerLabel: '12号 · 阿北',
        roleId: 'fanggu',
        roleName: '方古',
        status: { life: 'alive', impairments: [], markers: [] },
      }],
      statusFacts: [
        '发动者：5号舞蛇人，状态：存活。',
        '目标：12号方古，状态：存活。',
        '目标实际角色是恶魔。',
      ],
      availableOutcomes: [
        { id: 'miss', label: '未选中恶魔', ready: true, requiredInputs: ['targets'] },
        { id: 'swap', label: '发生交换，身份阵营待确认', ready: true, requiredInputs: ['targets'] },
        { id: 'no-effect', label: '未受影响', ready: true, requiredInputs: ['targets'] },
      ],
      roleResearch: research({
        roleId: 'snakecharmer',
        name: '舞蛇人',
        inputKinds: ['player'],
        possibleOutcomes: ['目标不是恶魔：无事发生。', '目标是恶魔：双方交换角色和阵营；新的舞蛇人醉酒。'],
        stateChanges: ['旧恶魔成为醉酒舞蛇人。'],
        identityChanges: ['舞蛇人与目标恶魔交换角色。'],
        teamChanges: ['舞蛇人与目标恶魔交换阵营。'],
        highRiskNotes: ['身份、阵营和醉酒都必须作为待确认草稿，不得自动改状态。'],
      }),
    }),
  },
  {
    id: 'CERENOVUS-LIVE target and role filled',
    expectedOutcomeId: 'applied',
    mustMention: ['疯狂', '确认'],
    input: baseInput({
      wakeItem: {
        id: 'live-cerenovus',
        orderIndex: 6,
        seatId: 10,
        playerLabel: '10号 · 阿宁',
        roleId: 'cerenovus',
        roleName: '洗脑师',
        ability: '每个夜晚，选择一名玩家和一个善良角色：该玩家明天要疯狂地声称自己是该角色，否则可能被处决。',
        storytellerPrompt: '记录被洗脑玩家和需要声称的善良角色。',
        targetCount: 1,
        targetLabel: '玩家',
        roleLabel: '声称角色',
        status: { life: 'alive', impairments: [], markers: [] },
      },
      draft: {
        targets: [3],
        roleChoice: 'investigator',
        outcomeId: '',
        playerChoice: '10号洗脑师选择3号，要求声称调查员。',
        draftRevision: 1,
      },
      selectedTargets: [{
        seatId: 3,
        playerLabel: '3号 · 可可',
        roleId: 'dreamer',
        roleName: '筑梦师',
        status: { life: 'alive', impairments: [], markers: [] },
      }],
      statusFacts: [
        '发动者：10号洗脑师，状态：存活。',
        '目标：3号筑梦师，状态：存活。',
        '声称角色：调查员。',
      ],
      availableOutcomes: [
        { id: 'applied', label: '受到影响', ready: true, requiredInputs: ['targets', 'role'] },
        { id: 'no-effect', label: '未受影响', ready: true, requiredInputs: ['targets', 'role'] },
      ],
      roleResearch: research({
        roleId: 'cerenovus',
        name: '洗脑师',
        inputKinds: ['player', 'role'],
        possibleOutcomes: ['目标明天需要疯狂地证明自己是指定善良角色。'],
        playerMessageTemplates: ['你被洗脑成了 {role}；明天需要疯狂地证明自己是该角色。'],
        highRiskNotes: ['AI 不得判断玩家是否破疯狂，也不得自动处决。'],
      }),
    }),
  },
]

function visibleText(draft: NightSettlementAdviceDraft) {
  return [
    draft.summary,
    ...draft.ruleFacts,
    ...draft.warnings,
    ...draft.journalDrafts,
    ...draft.playerMessageDrafts,
    ...draft.stateChangeDrafts,
    ...draft.authorityWarnings,
    draft.disclaimer,
  ].join('\n')
}

function expectDraftBoundary(draft: NightSettlementAdviceDraft) {
  const text = visibleText(draft)
  expect(draft.provider).toBe('openai-compatible')
  expect(draft.draftOnly).toBe(true)
  expect(text).toMatch(/草稿|说书人|确认/)
  expect(text).not.toMatch(/已写入|已经写入|已修改状态|已经修改状态|胜负已判定/)
}

describeLive('real model night settlement quality smoke', () => {
  it.each(liveCases)('$id', async ({ expectedOutcomeId, input, mustMention }) => {
    const provider = createOpenAICompatibleNightSettlementProvider({
      baseUrl: requiredEnv('BOTC_AI_BASE_URL'),
      model: requiredEnv('BOTC_AI_MODEL'),
      apiKey: requiredEnv('BOTC_AI_API_KEY'),
      timeoutSeconds: timeoutSeconds(),
    })

    const { draft } = await provider.generateNightSettlementAdvice(input)

    expect(draft.status).toBe('answer')
    expect(draft.recommendedOutcomeId).toBe(expectedOutcomeId)
    expectDraftBoundary(draft)
    const text = visibleText(draft)
    for (const keyword of mustMention) expect(text).toContain(keyword)
  }, 180_000)
})
