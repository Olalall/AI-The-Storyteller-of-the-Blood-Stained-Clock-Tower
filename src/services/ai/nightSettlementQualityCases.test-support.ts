import { initialNightWorkbenchState } from '../../features/night-workbench/data/initialNightWorkbenchState'
import { emptyWakeDraft } from '../../features/night-workbench/state/projectWakeDraft'
import type { RoleSnapshot, WakeItem } from '../../features/night-workbench/types'
import { roleAbilityForScript, rolePromptForScript } from '../../domain/scripts'
import type { NightSettlementProviderRequest } from '../../../server/ai/types'
import { createNightResultAdviceAsync } from './nightSettlementHttp'
import type { CreateNightResultAdviceInput } from './types'

export interface NightQualityCase {
  id: string
  makeInput: () => CreateNightResultAdviceInput
  expectedStatus: 'answer' | 'needs_input'
  expectedOutcomeId?: string
  context: object
  mustMention: RegExp[]
  mustNotMention?: RegExp[]
}

function role(id: string, name: string): RoleSnapshot {
  return { id, name, initial: name.slice(0, 1), iconPath: `/assets/characters/${id}.webp` }
}

function inputFor(roleId = 'gambler'): CreateNightResultAdviceInput {
  const state = structuredClone(initialNightWorkbenchState)
  const item = state.queue.find((entry) => entry.roleId === roleId)!
  item.id = `quality-${roleId}`
  item.progress = 'pending'
  item.history = undefined
  item.status = { life: 'alive', impairments: [], markers: [] }
  state.seatSnapshots[item.seatId].status = structuredClone(item.status)
  state.queue = [item]
  state.activeCursorId = state.previewEntryId = item.id
  const draft = { ...emptyWakeDraft(), targets: [9], roleChoice: 'lunatic', draftRevision: 2 }
  state.drafts = { [item.id]: draft }
  return { state, item, draft }
}

function pukkaInput(): CreateNightResultAdviceInput {
  const input = inputFor()
  input.state.scriptId = 'a-grimm-chorus'
  input.state.knowledgeVersion = 'quality-pukka/2026-10-16'
  const item: WakeItem = {
    ...input.item,
    id: 'quality-pukka', roleId: 'pukka', roleName: '普卡', roleInitial: '普', seatId: 12,
    playerLabel: '12号 · 玩家12', iconPath: '/assets/characters/pukka.webp',
    ability: roleAbilityForScript(input.state.scriptId, 'pukka'),
    storytellerPrompt: rolePromptForScript(input.state.scriptId, 'pukka'),
    roleChoices: undefined, roleLabel: undefined,
    outcomeOptions: [
      { id: 'poison', label: '中毒目标草稿', requiredInputs: ['targets'], resultTemplate: '{actor}选择{target}中毒；上一名目标另行核对。' },
      { id: 'no-effect', label: '未受影响', requiredInputs: ['targets'], resultTemplate: '{actor}本夜未生效，历史中毒另行核对。' },
    ],
  }
  const draft = { ...input.draft, targets: [3], roleChoice: '' }
  input.state.queue = [item]
  input.state.seatSnapshots[12].role = role('pukka', '普卡')
  input.state.seatSnapshots[12].status = structuredClone(item.status)
  input.state.activeCursorId = input.state.previewEntryId = item.id
  input.state.drafts = { [item.id]: draft }
  return { state: input.state, item, draft }
}

export const nightQualityCases: NightQualityCase[] = [
  {
    id: 'HISTORY-HEALTHY 当前健康与上夜毒醉分开',
    makeInput: () => {
      const input = inputFor()
      input.item.history = '第2夜：赌徒中毒；第3夜行动前说书人已确认恢复健康。'
      return input
    },
    expectedStatus: 'answer', expectedOutcomeId: 'correct',
    context: { wakeItem: { history: '第2夜：赌徒中毒；第3夜行动前说书人已确认恢复健康。', status: { impairments: [] } } },
    mustMention: [/正确|猜对/],
  },
  ...(['poisoned', 'drunk'] as const).map((impairment): NightQualityCase => ({
    id: `ACTOR-${impairment} 发动者当前毒醉`,
    makeInput: () => {
      const input = inputFor()
      input.item.status.impairments = [impairment]
      input.state.seatSnapshots[input.item.seatId].status = structuredClone(input.item.status)
      input.draft.roleChoice = 'balloonist'
      return input
    },
    expectedStatus: 'answer', expectedOutcomeId: 'no-effect',
    context: { wakeItem: { status: { impairments: [impairment] } }, selectedTargets: [{ seatId: 9, status: { impairments: [] } }] },
    mustMention: [impairment === 'poisoned' ? /中毒/ : /醉酒/],
  })),
  {
    id: 'TARGET-IMPAIRED 不把目标毒醉当发动者毒醉',
    makeInput: () => {
      const input = inputFor()
      input.state.seatSnapshots[9].status.impairments = ['poisoned', 'drunk']
      input.draft.roleChoice = 'balloonist'
      return input
    },
    expectedStatus: 'answer', expectedOutcomeId: 'wrong',
    context: { wakeItem: { status: { impairments: [] } }, selectedTargets: [{ seatId: 9, roleId: 'lunatic', status: { impairments: ['poisoned', 'drunk'] } }] },
    mustMention: [/死亡/, /草稿|确认/],
  },
  {
    id: 'PUKKA-MISSING-HISTORY 不编造上一名毒目标的死亡',
    makeInput: pukkaInput,
    expectedStatus: 'needs_input',
    context: { wakeItem: { roleId: 'pukka' }, draft: { targets: [3] }, roleKnowledge: { requiredContext: ['本晚中毒目标', '上一名成功普卡毒目标及状态', '当时与当前普卡是否有效', '恢复健康时点'] } },
    mustMention: [/上一|历史|前一/],
  },
  {
    id: 'PUKKA-CURRENT-DRUNK 历史有效不代表当夜继续致死',
    makeInput: () => {
      const input = pukkaInput()
      input.item.status.impairments = ['drunk']
      input.state.seatSnapshots[input.item.seatId].status = structuredClone(input.item.status)
      input.item.history = '第2夜：普卡清醒并成功使4号中毒。第3夜行动前普卡已醉酒；尚未恢复清醒。'
      return input
    },
    expectedStatus: 'answer', expectedOutcomeId: 'no-effect',
    context: { wakeItem: { status: { impairments: ['drunk'] }, history: '第2夜：普卡清醒并成功使4号中毒。第3夜行动前普卡已醉酒；尚未恢复清醒。' } },
    mustMention: [/醉酒/, /不.*死|暂.*死|未.*死|不结算死亡/],
    mustNotMention: [/4号(?:玩家)?(?:本夜)?(?:立即)?(?:应当|应|将)?死亡/],
  },
  {
    id: 'SNAKECHARMER-SWAP 身份阵营交换与中毒只做草稿',
    makeInput: () => {
      const input = inputFor('snakecharmer')
      input.draft.targets = [12]
      input.draft.roleChoice = ''
      input.draft.storytellerContext = '合成场景：说书人已核实5号当前善良、12号当前邪恶；这是本次明确提供的阵营事实，不是从角色类型推断。双方均健康，没有保留原阵营或阻止交换的其他影响。'
      return input
    },
    expectedStatus: 'answer', expectedOutcomeId: 'swap',
    context: { selectedTargets: [{ seatId: 12, roleId: 'fanggu' }], roleResearch: { roleId: 'snakecharmer', knowledgeStatus: 'confirmed' } },
    mustMention: [/身份|角色/, /阵营/, /中毒/],
    mustNotMention: [/(?:新|原恶魔.{0,12})(?:舞蛇人.{0,8})?醉酒/],
  },
  {
    id: 'ROLE-CHANGE 使用最新已确认身份而非开局身份',
    makeInput: () => {
      const input = inputFor()
      input.state.roleChangeEvents = [role('artist', '艺术家'), role('balloonist', '气球驾驶员')].map((toRole, index) => ({
        id: `quality-role-change-${index}`, seatId: 9, revision: index + 1,
        changedAt: `2026-10-16T00:0${index}:00.000Z`,
        nightRunId: input.state.nightRunId, originNightRunId: input.state.nightRunId,
        phaseLabel: input.state.nightLabel,
        fromRole: index === 0 ? role('lunatic', '疯子') : role('artist', '艺术家'),
        toRole, reason: 'gameplay', confirmedBy: 'storyteller',
      }))
      return input
    },
    expectedStatus: 'answer', expectedOutcomeId: 'wrong',
    context: { selectedTargets: [{ seatId: 9, roleId: 'balloonist' }] },
    mustMention: [/死亡/, /草稿|确认/],
  },
  {
    id: 'MISSING-IDENTITY 缺目标实际身份必须追问',
    makeInput: () => {
      const input = inputFor()
      input.state.seatSnapshots[9].role = null
      return input
    },
    expectedStatus: 'needs_input',
    context: { selectedTargets: [] },
    mustMention: [/身份|角色/],
  },
  {
    id: 'MISSING-ROLE 缺洗脑角色不能采用正向结果',
    makeInput: () => {
      const input = inputFor('cerenovus')
      input.draft.targets = [3]
      input.draft.roleChoice = ''
      return input
    },
    expectedStatus: 'needs_input',
    context: { draft: { roleChoice: '' }, availableOutcomes: [{ id: 'applied', ready: false }] },
    mustMention: [/角色/],
  },
]

// 通过真实 HTTP adapter 取请求，避免另写一份可能与生产脱节的 prompt 输入。
export async function captureNightQualityRequest(input: CreateNightResultAdviceInput) {
  let request: NightSettlementProviderRequest | undefined
  await createNightResultAdviceAsync(input, {
    runtimeSettings: { mode: 'http', baseUrl: 'https://backend.example.test', timeoutMs: 1000 },
    fetcher: async (_url, init) => {
      request = JSON.parse(String(init?.body)) as NightSettlementProviderRequest
      return new Response('{}', { status: 503 })
    },
  })
  if (!request) throw new Error('Night quality fixture did not reach the production HTTP adapter')
  return request
}
