import type { RulesAdvisorAnswer as Answer } from '../../services/ai/rulesAdvisorTypes'

export function RulesAdvisorAnswer({ answer }: { answer: Answer }) {
  return <div className="rules-advisor__answer">
    <p>{answer.summary}</p>
    {answer.missingFacts.length ? <section aria-label="还需确认"><h4>还需确认</h4><ul>{answer.missingFacts.map((line, index) => <li key={index}>{line}</li>)}</ul></section> : null}
    <details><summary>依据与注意事项{answer.sources.length ? ` · ${answer.sources.length}份资料` : ''}</summary>
      {([['规则依据', answer.ruleFacts], ['推断与建议', answer.considerations]] as const).map(([title, lines]) => lines.length ? <section key={title} aria-label={title}>
        <h4>{title}</h4><ul>{lines.map((line, index) => <li key={index}>{line}</li>)}</ul>
      </section> : null)}
      {answer.sources.length ? <ul>{answer.sources.map(source => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul> : <p className="rules-advisor__note">未附引用，请先核对角色原文。</p>}
      <p className="rules-advisor__note">{answer.knowledgeVersion}</p>
    </details>
  </div>
}
