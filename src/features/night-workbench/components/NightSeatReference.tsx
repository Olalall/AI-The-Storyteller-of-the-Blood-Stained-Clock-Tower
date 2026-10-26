import { RoleDisc } from '../../../components/ui/RoleDisc'
import type { GameSessionState } from '../../game-session/types'
import { projectStorytellerSeatSummaries } from '../../game-session/state/projectors'
import './night-seat-reference.css'

export function NightSeatReference({ session, concealed }: { session: GameSessionState; concealed: boolean }) {
  if (concealed) return null
  return <details className="night-seat-reference">
    <summary>座位核对 · 角色与当前状态</summary>
    <div className="night-seat-reference__grid">{projectStorytellerSeatSummaries(session).map(({ seatId, nickname, role, state }) =>
      <article key={seatId} aria-label={`${seatId}号 ${role?.name ?? '未配角色'} ${state.life === 'dead' ? '死亡' : '存活'}`}>
        <RoleDisc size="tiny" initial={role?.initial ?? '?'} roleName={role?.name ?? '未配角色'} imageSrc={role?.iconPath} />
        <div><strong>{seatId}号 · {role?.name ?? '未配角色'}</strong><small>{nickname}</small>
          <span>{[state.life === 'dead' ? '死亡' : '存活', ...(state.poisoned ? ['中毒'] : []), ...(state.drunk ? ['醉酒'] : [])].join(' · ')}</span>
          {state.markers.length ? <small>{state.markers.map(m => m.label).join('；')}</small> : null}</div>
      </article>)}</div>
  </details>
}
