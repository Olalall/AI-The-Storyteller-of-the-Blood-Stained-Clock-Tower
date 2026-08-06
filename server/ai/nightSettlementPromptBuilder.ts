import { unknownSeatGap, unknownSeatQuestion } from './nightUnknownSeats'
import type { AIProviderChatMessage, NightSettlementProviderRequest } from './types'

/**
 * 「未列出等于未知，不是正常」分支。
 *
 * 不加这一段时，模型看到的是一份没有缺口标记的输入，默认读法是「没提到的座位都正常」——
 * 那正好是最危险的一种默认：一个中毒了但工具没记的座位，会被当成健康座位参与推理，
 * 而结论看起来和信息齐全时一模一样。
 */
function contextGapConstraints(input: NightSettlementProviderRequest): string[] {
  const gap = unknownSeatGap(input)
  if (!gap.length) {
    return input.contextLevel === 'standard'
      ? ['input.contextLevel = standard：工具里全部座位的身份都已录入，本次输入的座位状态可以当作完整局面使用']
      : []
  }
  return [
    `input.contextLevel = minimal：工具只知道部分座位的身份，${gap.join('、')} 号座位的身份工具里没有`,
    '未在输入中列出的座位状态一律视为**未知**，不得视为正常、健康、存活或未中毒',
    `本次必须返回 needs_input，并在 missing 里点名这些座位：${unknownSeatQuestion(gap)}`,
    '不要因为缺信息就给一个「保守的」结果草稿——保守的错误结论和自信的错误结论一样会被采用',
  ]
}

export function buildNightSettlementProviderMessages(input: NightSettlementProviderRequest): AIProviderChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        '你是血染钟楼线下说书人的夜间技能顾问。',
        '你只能基于输入里的当前唤醒项、当前草稿和可选结果，生成结算建议草稿。',
        '你不能修改玩家身份、阵营、存活、毒醉、日志、昼夜或夜序。',
        '如果缺少目标、角色、实际身份或关键历史，不要编造；返回 needs_input 和 missing。',
        'recommendedOutcomeId 必须来自 ready=true 的 availableOutcomes；没有可选结果时不要返回 recommendedOutcomeId。',
        'input.roleResearch 是导入智能板子时人工复核过的角色规则摘要；它优先于模型记忆。',
        'input.selectedTargets 只包含本步已选择目标的身份和状态，用于核对本步，不代表完整魔典。',
        'input.statusFacts 是把发动者和目标状态展开后的短句，优先用于核对中毒、醉酒、死亡和自定义标记。',
        '只返回 JSON 对象，不要 Markdown。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: 'draft_night_settlement_advice',
        outputShape: {
          status: 'answer | needs_input',
          confidence: 'low | medium | high',
          recommendedOutcomeId: 'ready outcome id or omitted',
          summary: 'string',
          ruleFacts: ['string'],
          missing: ['string'],
          warnings: ['string'],
          journalDrafts: ['string'],
          playerMessageDrafts: ['string'],
          stateChangeDrafts: [{
            text: 'string，必填，给说书人看的一句人话',
            seatId: 'number，可选，必须是本次输入里出现过的座位号',
            change: {
              field: 'life | poisoned | drunk | marker',
              to: 'life 用 alive|dead；poisoned/drunk 用 true|false；marker 用 add|remove',
              markerLabel: 'string，field 为 marker 时必填，其它 field 一律不要带',
            },
          }],
          authorityWarnings: ['string'],
          disclaimer: 'string',
        },
        constraints: [
          '不要自动判定死亡、身份变化或阵营变化',
          '不要新增可选结果',
          '说书人确认本项前，草稿不生效',
          '如果目标、角色等 requiredInputs 已补齐，且 availableOutcomes 里有 ready=true 的常规正向结果，即使 draft.outcomeId 为空，也可以推荐该 ready 结果；不要只因为没点结果按钮就返回 needs_input',
          '只有缺少目标、角色、发动者状态、目标状态、关键历史或异常原因时，才返回 needs_input',
          'input.wakeItem.status 是发动者当前状态；input.selectedTargets[].status 是本步已选目标状态；判断醉酒、中毒、死亡、标记时必须区分二者',
          '如果 input.statusFacts 中显示发动者中毒、醉酒或死亡，必须在 warnings 或 authorityWarnings 中提示说书人核对；不要把“受到影响”当成已自动改状态',
          '如果 input.roleKnowledge 存在，优先引用其中 reminders 和 aiCannot，但仍不得自动执行',
          '如果 input.roleResearch 存在，必须用 possibleOutcomes、stateChanges、identityChanges、teamChanges、highRiskNotes 交叉核对当前建议',
          '如果 input.selectedTargets 不足以判断实际身份、阵营、毒醉或历史，必须要求说书人补充，不要自行推断',
          '如果 input.roleResearch.knowledgeStatus 不是 confirmed，降低置信度并写入 warnings',
          '如果技能可能导致身份、阵营、死亡、毒醉、疯狂或延迟结算，只能写入 stateChangeDrafts 或 authorityWarnings，等待说书人单独确认',
          'journalDrafts 只写“本项如何记录”；playerMessageDrafts 只写“可以给玩家看的私密信息”；stateChangeDrafts 只写“需要另行确认的状态/身份/阵营/死亡变化”；authorityWarnings 只写“为什么不能直接当权威结果”',
          'stateChangeDrafts 的每一条最多对应一个座位的一个字段；需要改两个字段就写两条，不要在一条里塞多个改动',
          'stateChangeDrafts 里不确定座位或不确定字段时，只写 text，不要写 seatId 和 change；写错一个座位号比不写代价大得多',
          'stateChangeDrafts 只是给说书人看的建议，说书人不点确认就什么都不会发生；不要写成“已改为”“已标记”',
          ...contextGapConstraints(input),
          '不要猜测未提供的隐藏身份、阵营或历史；缺信息时优先返回 needs_input',
          'journalDrafts 和 playerMessageDrafts 必须与 recommendedOutcomeId 的语义一致，不得扩写成权威结果',
          '优先指出缺失信息，其次给出可采用的结果草稿',
        ],
        input,
      }),
    },
  ]
}
