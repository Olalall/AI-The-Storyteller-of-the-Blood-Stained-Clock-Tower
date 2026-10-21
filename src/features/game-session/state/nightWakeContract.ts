import { normalizeRoleId } from '../../../domain/scripts'
import type { AbilityInputKind, SmartRoleDefinition } from '../../../domain/scripts'
import type { OutcomeInput, WakeItem } from '../../night-workbench/types'
import { nightInformationRoleId, projectFormalNightInformation } from './nightInformationContract'

/** 新夜序与旧局恢复共用表单合同；回答由主持选择，不根据身份或毒醉推算。 */
export function projectNightResultContract(item: WakeItem, playerCount = 15): WakeItem {
  item = projectFormalNightInformation(item, playerCount)
  if (nightInformationRoleId(item) !== 'fortuneteller') return item
  return {
    ...item, targetCount: 2, minimumTargetCount: undefined,
    interactionVersion: normalizeRoleId(item.roleId) === 'fortuneteller' ? 'fortuneteller/yes-no-v1' : item.interactionVersion,
    outcomeOptions: [
      { id: 'yes', label: '是', requiredInputs: ['targets'], resultTemplate: '{actor}选择{targets}，结果为“是”。', informationTemplate: '是。' },
      { id: 'no', label: '否', requiredInputs: ['targets'], resultTemplate: '{actor}选择{targets}，结果为“否”。', informationTemplate: '否。' },
      ...item.outcomeOptions.filter((option) => (option.id === 'skip' || option.id === 'hold') && !option.requiredInputs.length),
    ],
  }
}

function targetCountFor(inputKinds: readonly AbilityInputKind[]) {
  if (inputKinds.includes('players')) return 2
  if (inputKinds.includes('player')) return 1
  return 0
}
interface NightTargetContract {
  targetCount: number
  minimumTargetCount?: number
  targetLabel?: string
}
const threeTargetRoleIds = new Set([
  'noble',
  'alhadikhia',
  'pu_ren',
  'wu_ling_jun',
])
const twoTargetRoleIds = new Set([
  'seamstress',
  'fortuneteller',
  'barber',
  'investigator',
  'librarian',
  'washerwoman',
  'innkeeper',
  'chambermaid',
  'harpy',
  'shabaloth',
  'tian_ji_ge',
  'tou_ming_ren',
  'xi_mo_ren',
  'yi_zhen_huang_liang',
  'shi_mo',
])
const oneToThreeTargetRoleIds = new Set([
  'dianyuzhang',
])
const oneOrThreeTargetRoleIds = new Set([
  'wan_jun_zhi_li',
])
const anyNumberTargetRoleIds = new Set([
  'taotie',
  'zou_si_fan',
])
const atLeastThreeTargetRoleIds = new Set([
  'zhi_shi_fen_zi',
])
const oneOrTwoTargetRoleIds = new Set([
  'baojun',
  'shuangtoujiao',
  'zu_zhang',
])
const zeroOrOneTargetRoleIds = new Set([
  'wen_yi_zhi_yuan',
  'xue_zhi_nv',
  'ye_yan',
])
export function targetContractFor(role: SmartRoleDefinition, playerCount: number, localizedAbilityText: string): NightTargetContract {
  const roleId = normalizeRoleId(role.id)
  if (threeTargetRoleIds.has(roleId)) return { targetCount: 3, targetLabel: '三名目标' }
  if (twoTargetRoleIds.has(roleId)) return { targetCount: 2, targetLabel: '两名目标' }
  if (oneToThreeTargetRoleIds.has(roleId)) return { targetCount: 3, minimumTargetCount: 1, targetLabel: '1-3名目标' }
  if (oneOrThreeTargetRoleIds.has(roleId)) return { targetCount: 3, minimumTargetCount: 1, targetLabel: '一名或三名目标' }
  if (anyNumberTargetRoleIds.has(roleId)) return { targetCount: playerCount, minimumTargetCount: 0, targetLabel: '任意数量目标' }
  if (atLeastThreeTargetRoleIds.has(roleId)) return { targetCount: playerCount, minimumTargetCount: 3, targetLabel: '至少三名目标' }
  if (oneOrTwoTargetRoleIds.has(roleId)) return { targetCount: 2, minimumTargetCount: 1, targetLabel: '1-2名目标' }
  if (zeroOrOneTargetRoleIds.has(roleId)) return { targetCount: 1, minimumTargetCount: 0, targetLabel: '本夜选择' }
  const inferred = inferTargetContractFromAbility(localizedAbilityText, playerCount)
  if (inferred) return inferred
  return { targetCount: targetCountFor(role.inputKinds) }
}
function inferTargetContractFromAbility(abilityText: string, playerCount: number): NightTargetContract | undefined {
  if (/(任意名|任意数量|若干).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: playerCount, minimumTargetCount: 0, targetLabel: '任意数量目标' }
  if (/至少三名.{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: playerCount, minimumTargetCount: 3, targetLabel: '至少三名目标' }
  if (/(最多|至多).{0,4}(两名|2名|二名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 2, minimumTargetCount: 0, targetLabel: '至多两名目标' }
  if (/(一名|1名).{0,8}(或|或者).{0,8}(三名|3名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 3, minimumTargetCount: 1, targetLabel: '一名或三名目标' }
  if (/(一名|1名).{0,8}(或|或者).{0,8}(两名|2名|二名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 2, minimumTargetCount: 1, targetLabel: '一名或两名目标' }
  if (/(三名|3名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 3, targetLabel: '三名目标' }
  if (/(两名|2名|二名).{0,12}(玩家|目标)/.test(abilityText)) return { targetCount: 2, targetLabel: '两名目标' }
  return undefined
}
export function createRoleSpecificOutcomeOptions(roleId: string, targetContract: NightTargetContract, needsRole: boolean) {
  const canonicalRoleId = normalizeRoleId(roleId)
  if (canonicalRoleId === 'gambler') {
    return [
      {
        id: 'correct',
        label: '猜对 · 无事',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}并猜测为{role}；猜对，无死亡候选。',
      },
      {
        id: 'wrong',
        label: '猜错 · 待死亡',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}并猜测为{role}；猜错，仅生成赌徒死亡候选，仍需说书人确认状态。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}并猜测为{role}；因醉酒、中毒或其他原因未生效，不自动产生死亡。',
      },
    ]
  }
  if (canonicalRoleId === 'snakecharmer') {
    return [
      {
        id: 'swap',
        label: '选中恶魔 · 待交换',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；若目标确为恶魔，仅生成身份交换候选，仍需说书人确认。',
      },
      {
        id: 'miss',
        label: '未选中恶魔',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；未选中恶魔，不生成身份交换。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；因醉酒、中毒或其他原因未生效。',
      },
    ]
  }
  if (canonicalRoleId === 'fanggu') {
    return [
      {
        id: 'convert',
        label: '选中外来者 · 待转变',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；若目标登记为外来者，仅生成方古转变候选，仍需说书人确认。',
      },
      {
        id: 'kill',
        label: '普通击杀候选',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；未触发外来者转变时，仅生成死亡候选，仍需说书人确认。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；因醉酒、中毒或其他原因未生效。',
      },
    ]
  }
  if (canonicalRoleId === 'pithag') {
    return [
      {
        id: 'changed',
        label: '变更为新角色候选',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}变为{role}；仅生成身份变更候选，仍需说书人确认。',
      },
      {
        id: 'already-in-play',
        label: '目标角色已在场 · 能力无效',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}变为{role}；该角色当前已在场，麻脸巫婆能力无效，不产生其他结果。',
      },
      {
        id: 'no-effect',
        label: '未受影响',
        requiredInputs: ['targets', 'role'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}变为{role}；因醉酒、中毒或其他原因未生效。',
      },
    ]
  }
  if (needsRole) return undefined
  if (canonicalRoleId === 'wan_jun_zhi_li') {
    return [
      {
        id: 'one-target',
        label: '记录一名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1],
        resultTemplate: '{actor}本夜选择{targets}；按一名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'three-targets',
        label: '记录三名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [3],
        resultTemplate: '{actor}本夜选择{targets}；按三名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (targetContract.targetLabel === '一名或三名目标') {
    return [
      {
        id: 'one-target',
        label: '记录一名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1],
        resultTemplate: '{actor}本夜选择{targets}；按一名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'three-targets',
        label: '记录三名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [3],
        resultTemplate: '{actor}本夜选择{targets}；按三名目标分支记录候选效果，仍由说书人确认状态变化。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (targetContract.targetLabel === '一名或两名目标') {
    return [
      {
        id: 'record',
        label: '记录一名或两名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1, 2],
        resultTemplate: '{actor}本夜选择{targets}；条件和最终效果仍由说书人确认。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (oneOrTwoTargetRoleIds.has(canonicalRoleId)) {
    return [
      {
        id: 'record',
        label: '记录1-2名目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        targetCounts: [1, 2],
        resultTemplate: '{actor}本夜选择{targets}；条件和最终效果仍由说书人确认。',
      },
      {
        id: 'skip',
        label: '不发动',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜不发动。',
      },
    ]
  }
  if (targetContract.minimumTargetCount === 0 && targetContract.targetCount > 1) {
    return [
      {
        id: 'record',
        label: '记录目标',
        requiredInputs: ['targets'] as OutcomeInput[],
        resultTemplate: '{actor}本夜选择{targets}；任意数量分支仅记录候选，仍由说书人确认。',
      },
      {
        id: 'skip',
        label: '选择无人',
        requiredInputs: [] as OutcomeInput[],
        resultTemplate: '{actor}本夜明确选择无人。',
      },
    ]
  }
  return undefined
}
