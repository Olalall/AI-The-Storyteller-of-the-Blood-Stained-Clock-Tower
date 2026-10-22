import type { RulesAdvisorAnswer as Answer } from '../../services/ai/rulesAdvisorTypes'

export function RulesAdvisorAnswer({ answer }: { answer: Answer }) {
  return <div className="rules-advisor__answer">
    <p>{answer.summary}</p>
    {([['规则依据', answer.ruleFacts], ['推断与建议', answer.considerations], ['还需确认', answer.missingFacts]] as const).map(([title, lines]) => lines.length ? <section key={title} aria-label={title}>
      <h4>{title}</h4><ul>{lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
    </section> : null)}
    {answer.sources.length ? <details><summary>查看资料来源 · {answer.sources.length}</summary><ul>{answer.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></details> : <p className="rules-advisor__note">本次回答未附可核对的引用，请先查看角色原文。</p>}
    <p className="rules-advisor__note">{answer.scopeLabel} · {answer.knowledgeVersion}</p>
  </div>
}
