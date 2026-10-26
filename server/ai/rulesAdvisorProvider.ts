import { AIProviderError, callOpenAICompatibleJSON, type OpenAICompatibleClientSettings } from './aiProviderClient'
import { rulesAdvisorContext } from './rulesAdvisorContext'
import { rulesAdvisorMessages } from './rulesAdvisorPrompt'
import { isRulesAdvisorAnswer, type RulesAdvisorAnswer, type RulesAdvisorRequest } from '../../src/services/ai/rulesAdvisorTypes'
import { contradictsNominationRules, nominationRuleFacts, nominationRulesSource } from './nominationAdvice'

export async function generateRulesAdvisorAnswer(input: RulesAdvisorRequest, settings: OpenAICompatibleClientSettings): Promise<RulesAdvisorAnswer> {
  const knowledge = await rulesAdvisorContext(input)
  const pixie = knowledge.context.roles.find(role => role.id === 'pixie')
  const questions = [input.question, ...input.history.map(turn => turn.question)].join(' ')
  // shortcut: 错误信息与小精灵继承尚无完整已核实裁定，先返回来源边界，补齐专门裁定后再开放自由回答。
  if (pixie?.reminders && (input.roleId === 'pixie' || /小精灵|pixie/iu.test(questions))
    && /涡流|vortox|错误|假信息|醉酒|中毒|毒醉/iu.test(questions)) {
    return { summary: '先分别记录实际 MAD 来源与实际告知。错误信息时，不能只按告知角色直接绑定来源或授予能力；这个组合的完整继承裁定仍需说书人核实。',
      ruleFacts: [...pixie.reminders.reminders], considerations: ['以上是已核实的来源和处理边界，不把未经核实的组合推断当作完整官方裁定。'],
      missingFacts: ['请核实本局采用的错误信息、疯狂与继承交互裁定，并在确认能力时填写依据。'],
      sources: knowledge.sources.filter(source => pixie.reminders!.sourceUrls?.includes(source.url)),
      knowledgeVersion: knowledge.knowledgeVersion, scopeLabel: knowledge.scopeLabel }
  }
  const baseRulesAnswer: RulesAdvisorAnswer = {
    summary: `已核实基础规则：${nominationRuleFacts[0]}${nominationRuleFacts[1]}`,
    ruleFacts: [...nominationRuleFacts], considerations: [], missingFacts: [],
    sources: knowledge.sources.filter(source => source.url === nominationRulesSource),
    knowledgeVersion: knowledge.knowledgeVersion, scopeLabel: knowledge.scopeLabel,
  }
  // shortcut: 仅直答明确的常规提名/死亡票问题，角色和复杂条件继续交给有依据的 AI 问答。
  const basicQuestion = !input.roleId && /普通(?:角色|玩家|死者)|常规提名|基础规则|死亡票|(?:每人|每天|同一天).{0,12}(?:提名|被提名)/u.test(input.question)
    && /提名|投票|死亡票/u.test(input.question) && !/如果|假如|中毒|醉酒|诅咒|复活|继承|发动|触发|相克|换角|获得/u.test(input.question)
    && !knowledge.context.roles.some(role => [role.name, role.id].some(name => input.question.toLowerCase().includes(name.toLowerCase())))
  if (basicQuestion) return baseRulesAnswer
  const payload = await callOpenAICompatibleJSON<Record<string, unknown>>(settings, rulesAdvisorMessages(input, knowledge))
  const lines = (key: string) => Array.isArray(payload?.[key])
    ? payload[key].filter((line): line is string => typeof line === 'string' && Boolean(line.trim())).slice(0, 8).map(line => line.trim().slice(0, 1200)) : []
  const ids = new Set(lines('sourceIds'))
  const answer = {
    summary: typeof payload?.summary === 'string' ? payload.summary.trim().slice(0, 3000) : '',
    ruleFacts: lines('ruleFacts'), considerations: lines('considerations'), missingFacts: lines('missingFacts'),
    sources: knowledge.sources.filter(source => ids.has(source.id)).slice(0, 8),
    knowledgeVersion: knowledge.knowledgeVersion, scopeLabel: knowledge.scopeLabel,
  }
  if (!isRulesAdvisorAnswer(answer)) throw new AIProviderError('AI_PROVIDER_BAD_RESPONSE', 502)
  if (contradictsNominationRules([answer.summary, ...answer.ruleFacts, ...answer.considerations].join('\n'))) {
    return { ...baseRulesAnswer, summary: `这次回答与已核实的基础规则冲突，已拦下。${nominationRuleFacts[0]}`,
      missingFacts: ['如涉及改变提名或投票规则的能力，请按角色原文核对发动条件与次数。'] }
  }
  return answer
}
