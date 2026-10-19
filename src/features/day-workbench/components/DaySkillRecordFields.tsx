import { useMemo } from 'react'
import { SeatButton } from '../../../components/ui/SeatButton'
import { daySkillOutcomeLabels } from '../../game-session/daySkillPresentation'
import type { GameSessionState } from '../../game-session/types'
import type { DaySkillOutcomeKind } from '../../game-session/types'
import {
  buildDaySkillContext,
  currentRoleBySeat,
  roleOptionsForSession,
  summaryForDaySkillContext,
  type DaySkillDraft,
} from '../state/daySkill'

interface DaySkillRecordFieldsProps {
  session: GameSessionState
  draft: DaySkillDraft
  onChange: (draft: DaySkillDraft) => void
  actionPrefix?: string
}

const outcomeKinds: DaySkillOutcomeKind[] = ['no_effect', 'applied', 'custom']

export function DaySkillRecordFields({ session, draft, onChange, actionPrefix = '选择' }: DaySkillRecordFieldsProps) {
  const roleOptions = useMemo(() => roleOptionsForSession(session), [session])
  const currentRoles = useMemo(() => currentRoleBySeat(session), [session])
  const context = buildDaySkillContext(session, draft, roleOptions)

  function selectActor(seatId: number) {
    if (draft.actorSeatId === seatId) {
      onChange({ ...draft, actorSeatId: null, actorActualRoleId: '' })
      return
    }
    const actualRoleId = currentRoles.get(seatId)?.id ?? ''
    onChange({
      ...draft,
      actorSeatId: seatId,
      actorActualRoleId: actualRoleId,
      abilityRoleId: draft.abilityRoleId || actualRoleId,
    })
  }

  function toggleTarget(seatId: number) {
    if (draft.targetSeatIds.includes(seatId)) {
      const { [seatId]: _removed, ...targetActualRoleIds } = draft.targetActualRoleIds
      const { [seatId]: _alignment, ...targetAlignments } = draft.targetAlignments ?? {}
      onChange({ ...draft, targetSeatIds: draft.targetSeatIds.filter((item) => item !== seatId), targetActualRoleIds, targetAlignments })
      return
    }
    onChange({
      ...draft,
      targetSeatIds: [...draft.targetSeatIds, seatId].sort((left, right) => left - right),
      targetActualRoleIds: { ...draft.targetActualRoleIds, [seatId]: currentRoles.get(seatId)?.id ?? '' },
    })
  }

  return <div className="day-skill-fields">
    <fieldset>
      <legend>发动者</legend>
      <div className="day-record-sheet__seats">
        {Array.from({ length: session.playerCount }, (_value, index) => {
          const seatId = index + 1
          return <SeatButton key={seatId} seat={seatId} selected={draft.actorSeatId === seatId} onClick={() => selectActor(seatId)} aria-label={`${actionPrefix}${seatId}号为发动者`} />
        })}
      </div>
      {draft.actorSeatId !== null ? <RoleSelect
        label="发动者实际身份"
        value={draft.actorActualRoleId}
        roles={roleOptions}
        onChange={(actorActualRoleId) => onChange({ ...draft, actorActualRoleId })}
      /> : null}
    </fieldset>

    <div className="day-skill-fields__roles">
      <RoleSelect label="按此技能结算" value={draft.abilityRoleId} roles={roleOptions} onChange={(abilityRoleId) => onChange({ ...draft, abilityRoleId })} required />
      <RoleSelect label="公开声称" value={draft.claimedRoleId} roles={roleOptions} onChange={(claimedRoleId) => onChange({ ...draft, claimedRoleId })} />
    </div>

    <fieldset>
      <legend>目标<span>可多选</span></legend>
      <div className="day-record-sheet__seats">
        {Array.from({ length: session.playerCount }, (_value, index) => {
          const seatId = index + 1
          return <SeatButton key={seatId} seat={seatId} selected={draft.targetSeatIds.includes(seatId)} onClick={() => toggleTarget(seatId)} aria-label={`${actionPrefix}${seatId}号为目标`} />
        })}
      </div>
      {draft.targetSeatIds.length ? <div className="day-skill-fields__targets">
        {draft.targetSeatIds.map((seatId) => <RoleSelect
          key={seatId}
          label={`${seatId}号实际身份`}
          value={draft.targetActualRoleIds[seatId] ?? ''}
          roles={roleOptions}
          onChange={(roleId) => onChange({ ...draft, targetActualRoleIds: { ...draft.targetActualRoleIds, [seatId]: roleId } })}
        />)}
        {draft.abilityRoleId === 'moonchild' ? draft.targetSeatIds.map((seatId) => <fieldset key={`alignment-${seatId}`}>
          <legend>{seatId}号选择时阵营</legend>
          <div className="day-skill-fields__outcomes" role="group" aria-label={`${seatId}号选择时阵营`}>
            {(['good', 'evil'] as const).map((alignment) => <button
              type="button"
              key={alignment}
              className={draft.targetAlignments?.[seatId] === alignment ? 'is-active' : ''}
              aria-pressed={draft.targetAlignments?.[seatId] === alignment}
              onClick={() => onChange({
                ...draft,
                targetAlignments: { ...(draft.targetAlignments ?? {}), [seatId]: alignment },
              })}
            >{alignment === 'good' ? '善良' : '邪恶'}</button>)}
          </div>
        </fieldset>) : null}
      </div> : null}
    </fieldset>

    <fieldset>
      <legend>结果</legend>
      <div className="day-skill-fields__outcomes" role="group" aria-label="选择结果">
        {outcomeKinds.map((kind) => <button
          type="button"
          key={kind}
          className={draft.outcomeKind === kind ? 'is-active' : ''}
          aria-pressed={draft.outcomeKind === kind}
          onClick={() => onChange({ ...draft, outcomeKind: kind, outcomeNote: kind === 'custom' ? draft.outcomeNote : '' })}
        >{daySkillOutcomeLabels[kind]}</button>)}
      </div>
      {draft.outcomeKind === 'custom' ? <label className="day-record-sheet__note">其他结果<textarea value={draft.outcomeNote} maxLength={120} placeholder="简短记录结果" onChange={(event) => onChange({ ...draft, outcomeNote: event.target.value })} /></label> : null}
    </fieldset>

    {context ? <p className="day-skill-fields__preview" aria-live="polite">{summaryForDaySkillContext(context, draft)}</p> : null}
  </div>
}

interface RoleSelectProps {
  label: string
  value: string
  roles: readonly { id: string; name: string }[]
  onChange: (roleId: string) => void
  required?: boolean
}

function RoleSelect({ label, value, roles, onChange, required = false }: RoleSelectProps) {
  return <label className="day-skill-fields__role-select">{label}
    <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{required ? '请选择角色' : '未记录'}</option>
      {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
    </select>
  </label>
}
