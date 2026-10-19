import type { GameSessionState } from '../types'
import { followupSource } from '../state/followupSource'

export function FollowupSourceDetails({ session, sourceEntryId }: { session: GameSessionState; sourceEntryId: string }) {
  const source = followupSource(session, sourceEntryId)
  const phase = session.phaseSegments.find((entry) => entry.id === source?.original.segmentId)?.label ?? '夜晚'
  return <>
    {source?.corrected ? <p className="followup-source-warning">来源已更正，请核对最新记录；已有状态不会自动撤销。</p> : null}
    <details><summary>{source?.corrected ? '核对更正前后' : '来源记录'}</summary>
      <p>{phase} · {source?.original.summary ?? '来源记录不可用'}</p>
      {source?.corrected ? <><strong>最新更正</strong><p>{source.latest.summary}</p></> : null}
    </details>
  </>
}
