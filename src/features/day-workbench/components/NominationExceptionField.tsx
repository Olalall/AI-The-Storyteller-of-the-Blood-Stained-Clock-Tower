import { Field } from '../../../components/ui/Field'
import type { DayVoteDraft, GameSessionState } from '../../game-session/types'
import { nominationIssues } from '../state/nominationRules'

export function NominationExceptionField({ session, draft, onChange, disabled, originalEntryId }: {
  session: GameSessionState; draft: DayVoteDraft; disabled?: boolean; originalEntryId?: string
  onChange: (update: (draft: DayVoteDraft) => DayVoteDraft) => void
}) {
  const special = draft.nominationExceptionReason !== undefined
  const issues = nominationIssues(session, draft, originalEntryId)
  return <>
    <label className="day-execution-death"><input type="checkbox" disabled={disabled} checked={special} onChange={(event) => onChange((current) => ({ ...current, nominationExceptionReason: event.target.checked ? '' : undefined }))} />特殊能力提名</label>
    {special ? <Field label="特殊提名依据" hint="说明女妖、暴乱等特殊权限；仅放行本轮提名，不自动处理额外投票或处决。"><input maxLength={500} disabled={disabled} value={draft.nominationExceptionReason} onChange={(event) => onChange((current) => ({ ...current, nominationExceptionReason: event.target.value }))} /></Field> : null}
    {issues.length ? <p role="alert" className="day-disabled-reason">{issues.join('；')}</p> : null}
  </>
}
