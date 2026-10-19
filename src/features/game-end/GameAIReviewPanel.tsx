import { Bot, FileText, Sparkles, Star } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { createGameReviewDraft, createGameReviewDraftAsync } from '../../services/ai'
import { readArchiveRuntimeSettings, type GameArchiveRecord } from '../../services/archive'

interface GameAIReviewPanelProps {
  archive: GameArchiveRecord
}

export function GameAIReviewPanel({ archive }: GameAIReviewPanelProps) {
  return <GameAIReviewContent key={archive.id} archive={archive} />
}

function GameAIReviewContent({ archive }: GameAIReviewPanelProps) {
  const [review, setReview] = useState(() => createGameReviewDraft(archive))
  const [entertainment, setEntertainment] = useState(false)
  const [loading, setLoading] = useState(false)
  const generation = useRef(0)
  const backendConnected = readArchiveRuntimeSettings().mode === 'http'

  async function generateInterpretations() {
    const request = ++generation.current
    setLoading(true)
    const next = await createGameReviewDraftAsync(archive)
    if (request !== generation.current) return
    setReview(next)
    setLoading(false)
  }

  return <section className="game-ai-review" aria-label="AI复盘草稿">
    <div className="game-ai-review__header">
      <span><Bot aria-hidden="true" />AI复盘草稿</span>
      <small>{review.source === 'backend' ? '后端草稿' : '本地记录投影'} · 解释需核对</small>
    </div>
    {review.warning ? <p className="game-ai-review__warning">{review.warning}</p> : null}

    <div className="game-ai-review__cards">
      <article>
        <FileText aria-hidden="true" />
        <span>记录情况</span>
        <strong>{review.evaluation.density}</strong>
        <p>{review.evaluation.vote}；{review.evaluation.correction}</p>
      </article>
      <article>
        <Sparkles aria-hidden="true" />
        <span>复盘提纲</span>
        <strong>{archive.winnerLabel}</strong>
        <p>{review.fullReview.summary}</p>
      </article>
    </div>

    <div className="game-ai-review__full">
      <div className="game-ai-review__section-title">
        <span>关键事件与依据</span>
        <small>更正、处决与状态变化优先</small>
      </div>
      <ol aria-label="关键事件与依据">
        {review.keyEvents.map((event) => <li key={event.recordId}>
          <small>记录事实 · {event.phaseLabel}{event.voided ? ' · 已撤销' : event.superseded ? ' · 已被更正' : ''}</small>
          <strong>{event.fact}</strong>
          {event.details.map((detail, index) => <p key={`${index}-${detail}`}>{detail}</p>)}
          <small>记录 ID：{event.recordId}{event.correctionOf ? ` · 更正自 ${event.correctionOf}` : ''}</small>
        </li>)}
      </ol>
      {!review.keyEvents.length ? <p>暂无足够的已确认事件，不能判断关键转折。</p> : null}
      <p>{review.fullReview.suggestedReplayOrder.join(' → ')}</p>
    </div>

    <div className="game-ai-review__full">
      <div className="game-ai-review__section-title"><span>AI 解释（待核对）</span></div>
      {backendConnected ? <>
      <p>点击后将把以上归档记录摘录发给配置的 AI 服务生成草稿，请核对解释与原记录。</p>
      <Button onClick={generateInterpretations} disabled={loading || !review.keyEvents.some((event) => !event.superseded && !event.voided)}>
        {loading ? '正在生成 AI 解读…' : '生成 AI 解读'}
      </Button>
      </> : <p>当前使用本地记录，尚未连接后端 AI；连接后可生成带引用的解读。</p>}
      {review.interpretations.length ? <ol aria-label="AI 解释">
        {review.interpretations.map((item, index) => <li key={index}>
          <strong>{item.explanation}</strong><small>引用记录：{item.recordIds.join('、')}</small>
        </li>)}
      </ol> : <p>暂无带有效引用的 AI 解释。</p>}
      <div className="game-ai-review__section-title"><span>缺失信息</span></div>
      <ul>{review.missing.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>

    <Button aria-expanded={entertainment} onClick={() => setEntertainment(!entertainment)}>
      {entertainment ? '收起娱乐评分与吐槽' : '展开娱乐评分与吐槽'}
    </Button>
    {entertainment ? <>
    <p className="game-ai-review__warning">仅供娱乐：按日志关联次数与存活奖励估算，不代表玩家能力或贡献。日志不足时不作表现判断；展开不会调用模型。</p>
    <div className="game-ai-review__scoreboard">
      <div className="game-ai-review__section-title">
        <span>玩家评分草稿</span>
        <small>只按日志关联次数与存活奖励估算</small>
      </div>
      <div className="game-ai-review__players">
        {review.playerScores.map((player) => (
          <article key={player.seatId}>
            <div>
              <strong>{player.seatId}号 · {player.name}</strong>
              <span>{player.roleName} · 记录{player.activity}条</span>
            </div>
            <b>{player.score}</b>
            <p>{player.note}</p>
            {player.keyEvents.length ? (
              <ul className="game-ai-review__events" aria-label={`${player.seatId}号关键行为`}>
                {player.keyEvents.map((event) => <li key={event}>{event}</li>)}
              </ul>
            ) : null}
            <p className="game-ai-review__roast"><em>锐评</em>{player.roast}</p>
          </article>
        ))}
      </div>
    </div>

    <div className="game-ai-review__highlights">
      <div className="game-ai-review__section-title">
        <span>娱乐排行</span>
        <small>按同一启发式分数排序</small>
      </div>
      <ol>
        {review.topPlayers.map((player) => (
          <li key={player.seatId}>
            <Star aria-hidden="true" />
            <span>{player.seatId}号 {player.roleName}</span>
            <strong>{player.score}分草稿</strong>
          </li>
        ))}
      </ol>
    </div>
    </> : null}
  </section>
}
