import { Bot, FileText, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createGameReviewDraft, createGameReviewDraftAsync } from '../../services/ai'
import type { GameArchiveRecord } from '../../services/archive'

interface GameAIReviewPanelProps {
  archive: GameArchiveRecord
}

export function GameAIReviewPanel({ archive }: GameAIReviewPanelProps) {
  const [review, setReview] = useState(() => createGameReviewDraft(archive))

  useEffect(() => {
    let active = true
    setReview(createGameReviewDraft(archive))
    createGameReviewDraftAsync(archive).then((next) => {
      if (active) setReview(next)
    })
    return () => {
      active = false
    }
  }, [archive])

  return <section className="game-ai-review" aria-label="AI复盘草稿">
    <div className="game-ai-review__header">
      <span><Bot aria-hidden="true" />AI复盘草稿</span>
      <small>{review.source === 'backend' ? '后端草稿' : '本地草稿'} · 非客观评分</small>
    </div>
    {review.warning ? <p className="game-ai-review__warning">{review.warning}</p> : null}

    <div className="game-ai-review__cards">
      <article>
        <FileText aria-hidden="true" />
        <span>当局评价</span>
        <strong>{review.evaluation.density}</strong>
        <p>{review.evaluation.vote}；{review.evaluation.correction}</p>
      </article>
      <article>
        <Sparkles aria-hidden="true" />
        <span>整局复盘</span>
        <strong>{archive.winnerLabel}</strong>
        <p>{review.fullReview.summary}</p>
      </article>
    </div>

    <div className="game-ai-review__full">
      <div className="game-ai-review__section-title">
        <span>关键转折</span>
        <small>先按这些节点复盘</small>
      </div>
      <ol>
        {review.fullReview.turningPoints.map((point) => <li key={point}>{point}</li>)}
      </ol>
      <p>{review.fullReview.suggestedReplayOrder.join(' → ')}</p>
    </div>

    <div className="game-ai-review__scoreboard">
      <div className="game-ai-review__section-title">
        <span>玩家评分草稿</span>
        <small>只按日志活跃度、存活状态和记录完整度估算</small>
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
        <span>优先回看</span>
        <small>给说书人的复盘索引</small>
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
  </section>
}
