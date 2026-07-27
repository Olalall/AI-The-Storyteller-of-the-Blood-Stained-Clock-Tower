import { FlaskConical, HeartPulse, Skull, Tag, Wine } from 'lucide-react'
import { storytellerStateLabel } from '../../game-session/seatPresentation'
import type { StorytellerSeatSummary } from '../../game-session/state/projectors'

interface PlayerStatusBoardProps {
  seats: StorytellerSeatSummary[]
  onSelectSeat: (seatId: number) => void
}

export function PlayerStatusBoard({ seats, onSelectSeat }: PlayerStatusBoardProps) {
  const alive = seats.filter(({ state }) => state.life === 'alive').length
  const dead = seats.length - alive
  return (
    <section className="dashboard-card dashboard-card--players" aria-labelledby="player-status-title">
      <div className="dashboard-card__header dashboard-card__header--players">
        <div><span>状态</span><h2 id="player-status-title">玩家状态</h2></div>
        <p><strong>{seats.length}人 · 存活{alive} · 死亡{dead}</strong><small>点卡核对</small></p>
      </div>
      {seats.length === 0 ? (
        <div className="dashboard__player-empty" role="status">
          <strong>暂无玩家</strong>
          <span>先进入 AI 配板或切换板子，录入人数和座位后再显示状态。</span>
        </div>
      ) : <div className="dashboard__player-grid">
        {seats.map(({ seatId, nickname, role, state }) => {
          const LifeIcon = state.life === 'alive' ? HeartPulse : Skull
          const dead = state.life === 'dead'
          const roleName = role?.name ?? '未分配角色'
          const displayNickname = nickname.trim() || '未填写昵称'
          const conditionBadges = [
            state.poisoned ? { key: 'poisoned', label: '中毒', icon: FlaskConical } : null,
            state.drunk ? { key: 'drunk', label: '醉酒', icon: Wine } : null,
            state.markers.length ? { key: 'marked', label: '标记', icon: Tag } : null,
          ].filter((item): item is { key: string; label: string; icon: typeof FlaskConical } => item !== null)
          const stateClasses = [
            `dashboard-player-seat--${state.life}`,
            state.poisoned ? 'dashboard-player-seat--poisoned' : '',
            state.drunk ? 'dashboard-player-seat--drunk' : '',
            state.poisoned && state.drunk ? 'dashboard-player-seat--impaired-stack' : '',
            state.markers.length ? 'dashboard-player-seat--marked' : '',
          ].filter(Boolean).join(' ')
          return (
            <button key={seatId} type="button" className={`dashboard-player-seat ${stateClasses}`} onClick={() => onSelectSeat(seatId)} aria-label={`查看${seatId}号 · ${displayNickname} · ${roleName}：${storytellerStateLabel(state)}`}>
              <span className="dashboard-player-seat__top">
                <strong>{seatId}号</strong>
                <span className="dashboard-player-seat__life">
                  <LifeIcon aria-hidden="true" />
                  {dead ? <em>死亡</em> : null}
                </span>
              </span>
              {conditionBadges.length ? <span className="dashboard-player-seat__status-stack" aria-hidden="true">
                {conditionBadges.map(({ key, label, icon: Icon }) => <span key={key} className={`dashboard-state-mark dashboard-state-mark--${key}`}><Icon />{label}</span>)}
              </span> : null}
              <b title={roleName}>{roleName}</b>
              <span className="dashboard-player-seat__nickname" title={displayNickname}>{displayNickname}</span>
              <span className="dashboard-player-seat__badges" aria-hidden="true" />
            </button>
          )
        })}
      </div>}
    </section>
  )
}
