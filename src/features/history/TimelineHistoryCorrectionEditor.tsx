import { ArrowLeft, Megaphone, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { SeatButton } from '../../components/ui/SeatButton'
import type { PhaseTimelineEntryInput } from '../game-session/state/timeline'
import type { DayActionEntry, GameSessionState, NightActionEntry, TimelineEntry } from '../game-session/types'
import { refreshNightRunHistoricalContext } from '../game-session/state/nightHistoricalContext'
import { normalizeRoleId } from '../../domain/scripts'
import { hasForbiddenRegistration, wakeTargetRange, wakeTargetsValid } from '../night-workbench/state/projectWakeDraft'
import type { WakeItem } from '../night-workbench/types'
import { DaySkillRecordFields } from '../day-workbench/components/DaySkillRecordFields'
import {
  buildDaySkillContext,
  canRecordDaySkill,
  createDaySkillDraft,
  summaryForDaySkillContext,
  type DaySkillDraft,
} from '../day-workbench/state/daySkill'

type EditableTimelineEntry = Extract<TimelineEntry, { kind: 'night_action' | 'day_action' }>

interface TimelineHistoryCorrectionEditorProps {
  entry: EditableTimelineEntry
  session: GameSessionState
  onCancel: () => void
  onConfirm: (entry: PhaseTimelineEntryInput) => void
}

export function TimelineHistoryCorrectionEditor({ entry, session, onCancel, onConfirm }: TimelineHistoryCorrectionEditorProps) {
  if (entry.kind === 'night_action') {
    return <NightActionCorrectionEditor key={entry.id} entry={entry} session={session} onCancel={onCancel} onConfirm={onConfirm} />
  }
  return <DayActionCorrectionEditor key={entry.id} entry={entry} session={session} onCancel={onCancel} onConfirm={onConfirm} />
}

interface NightActionCorrectionEditorProps {
  entry: NightActionEntry
  session: GameSessionState
  onCancel: () => void
  onConfirm: (entry: PhaseTimelineEntryInput) => void
}

function correctedWakeItem(session: GameSessionState, entry: NightActionEntry): WakeItem | null {
  const run = session.nightRuns[entry.nightRunId]
  return run
    ? refreshNightRunHistoricalContext(session, run).find((item) => item.id === entry.wakeItemId) ?? null
    : null
}

function fixedRange(count: number) {
  return { minimum: count, maximum: count }
}

function nightCorrectionTargetRange(entry: NightActionEntry, wakeItem: WakeItem | null, playerCount: number) {
  const roleId = normalizeRoleId(entry.roleId ?? '')
  const outcomeId = entry.record.snapshot.outcomeId
  if (roleId === 'pukka') {
    return outcomeId === 'pukka-old-resolved-no-new' ? fixedRange(0) : fixedRange(1)
  }
  if (roleId === 'po') {
    if (outcomeId === 'po-charge' || outcomeId === 'po-no-action') return fixedRange(0)
    if (outcomeId === 'po-rampage') return fixedRange(3)
    return fixedRange(1)
  }
  if (roleId === 'shabaloth') return fixedRange(2)
  if (['balloonist', 'exorcist', 'devilsadvocate', 'yanluo'].includes(roleId)) return fixedRange(1)
  return wakeItem ? wakeTargetRange(wakeItem) : { minimum: 0, maximum: playerCount }
}

function NightActionCorrectionEditor({ entry, session, onCancel, onConfirm }: NightActionCorrectionEditorProps) {
  const snapshot = entry.record.snapshot
  const wakeItem = correctedWakeItem(session, entry)
  const range = nightCorrectionTargetRange(entry, wakeItem, session.playerCount)
  const [targets, setTargets] = useState(snapshot.targets)
  const [choice, setChoice] = useState(snapshot.playerChoice)
  const [result, setResult] = useState(snapshot.storytellerResult || entry.summary)
  const [information, setInformation] = useState(snapshot.informationGiven)
  const [registration, setRegistration] = useState(snapshot.registration)
  const [reason, setReason] = useState('')
  const targetDraft = { ...snapshot, targets, registration, playerChoice: choice, storytellerResult: result, informationGiven: information }
  const targetsInCorrectionRange = targets.length >= range.minimum && targets.length <= range.maximum
  const correctionWakeItem = wakeItem ? { ...wakeItem, minimumTargetCount: range.minimum, targetCount: range.maximum } : null
  const canConfirm = Boolean(
    wakeItem &&
    result.trim() &&
    reason.trim() &&
    targetsInCorrectionRange &&
    (!snapshot.registration || registration) &&
    (!correctionWakeItem || (
      wakeTargetsValid(correctionWakeItem, targetDraft, session.playerCount) &&
      !hasForbiddenRegistration(correctionWakeItem, targetDraft)
    )),
  )

  function toggleTarget(seatId: number) {
    if (seatId < 1 || seatId > session.playerCount) return
    if (wakeItem?.forbiddenTargetSeatIds?.includes(seatId) && !targets.includes(seatId)) return
    if (range.maximum <= 0 && !targets.includes(seatId)) return
    setRegistration(undefined)
    setTargets((current) => current.includes(seatId)
      ? current.filter((item) => item !== seatId)
      : [...current, seatId].sort((left, right) => left - right).slice(-range.maximum))
  }

  function confirm() {
    if (!canConfirm) return
    onConfirm({
      kind: 'night_action',
      nightRunId: entry.nightRunId,
      wakeItemId: entry.wakeItemId,
      actorSeatId: entry.actorSeatId,
      roleId: entry.roleId,
      summary: result.trim(),
      details: [choice.trim(), information.trim()].filter(Boolean),
      record: {
        revision: entry.record.revision + 1,
        snapshot: {
          ...snapshot,
          targets,
          registration: registration && targets[0]
            ? { ...registration, seatId: targets[0] }
            : undefined,
          playerChoice: choice.trim(),
          storytellerResult: result.trim(),
          informationGiven: information.trim(),
          draftRevision: snapshot.draftRevision + 1,
          updatedAt: new Date().toISOString(),
        },
      },
      correctionReason: reason.trim(),
    })
  }

  return (
    <form className="timeline-correction" onSubmit={(event) => { event.preventDefault(); confirm() }}>
      <button type="button" className="timeline-history__back" onClick={onCancel}><ArrowLeft aria-hidden="true" />返回日记</button>
      <div className="timeline-correction__intro"><span>夜间行动</span><strong>原记录保留，新增一条更正。</strong></div>
      {!wakeItem ? <p className="timeline-history__notice" role="alert">缺少原夜晚队列，无法安全更正这条夜间行动记录。</p> : null}
      <fieldset disabled={!wakeItem}>
        <legend>目标<span>{range.minimum === range.maximum ? `${range.maximum} 个` : `${range.minimum}-${range.maximum} 个`}</span></legend>
        <div className="timeline-correction__seats">
          {Array.from({ length: session.playerCount }, (_value, index) => {
            const seatId = index + 1
            const selected = targets.includes(seatId)
            const blocked = Boolean(wakeItem?.forbiddenTargetSeatIds?.includes(seatId))
            return <SeatButton
              key={seatId}
              seat={seatId}
              selected={selected}
              disabled={!selected && (blocked || targets.length >= range.maximum)}
              onClick={() => toggleTarget(seatId)}
              aria-label={`更正目标${seatId}号`}
            />
          })}
        </div>
      </fieldset>
      {snapshot.registration ? <fieldset>
        <legend>{snapshot.registration.kind === 'role_type' ? '展示类型' : '选择时阵营'}</legend>
        <div className="choice-chips">
          {(snapshot.registration.kind === 'role_type'
            ? [['townsfolk', '镇民'], ['outsider', '外来者'], ['minion', '爪牙'], ['demon', '恶魔']]
            : [['good', '善良'], ['evil', '邪恶']]
          ).map(([value, label]) => <button
            key={value}
            type="button"
            className={registration?.value === value ? 'choice-chip choice-chip--selected' : 'choice-chip'}
            aria-pressed={registration?.value === value}
            disabled={wakeItem?.forbiddenRegistrationValues?.includes(value as typeof snapshot.registration.value)}
            onClick={() => setRegistration({ ...snapshot.registration!, seatId: targets[0] ?? snapshot.registration!.seatId, value: value as typeof snapshot.registration.value })}
          >{label}</button>)}
        </div>
      </fieldset> : null}
      <label>选择<textarea value={choice} maxLength={180} onChange={(event) => setChoice(event.target.value)} /></label>
      <label>结果<textarea value={result} maxLength={180} onChange={(event) => setResult(event.target.value)} /></label>
      <label>告知<textarea value={information} maxLength={240} onChange={(event) => setInformation(event.target.value)} /></label>
      <label>更正原因<textarea required value={reason} maxLength={120} placeholder="例如：目标手势看错" onChange={(event) => setReason(event.target.value)} /></label>
      <div className="timeline-correction__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
        <Button type="submit" variant="primary" disabled={!canConfirm}>确认追加</Button>
      </div>
    </form>
  )
}

interface DayActionCorrectionEditorProps {
  entry: DayActionEntry
  session: GameSessionState
  onCancel: () => void
  onConfirm: (entry: PhaseTimelineEntryInput) => void
}

function DayActionCorrectionEditor({ entry, session, onCancel, onConfirm }: DayActionCorrectionEditorProps) {
  const isSkill = entry.category === 'skill'
  const [skillDraft, setSkillDraft] = useState(() => skillDraftFromEntry(entry))
  const [targets, setTargets] = useState(entry.targetSeatIds)
  const [note, setNote] = useState(isSkill ? '' : entry.summary.replace(/^公开事件：/, ''))
  const [reason, setReason] = useState('')
  const canConfirm = isSkill ? canRecordDaySkill(skillDraft) && Boolean(reason.trim()) : Boolean(note.trim() && reason.trim())

  function toggleTarget(seatId: number) {
    setTargets((current) => current.includes(seatId)
      ? current.filter((item) => item !== seatId)
      : [...current, seatId].sort((left, right) => left - right))
  }

  function confirm() {
    if (!canConfirm) return
    const skillContext = isSkill ? buildDaySkillContext(session, skillDraft) : null
    if (isSkill && !skillContext) return
    const summary = isSkill
      ? summaryForDaySkillContext(skillContext, skillDraft)
      : `公开事件：${note.trim()}`
    onConfirm({
      kind: 'day_action',
      category: entry.category,
      actorSeatId: isSkill ? skillDraft.actorSeatId : null,
      targetSeatIds: isSkill ? [...skillDraft.targetSeatIds] : targets,
      skillContext: skillContext ?? undefined,
      summary,
      details: [],
      correctionReason: reason.trim(),
    })
  }

  const targetLabel = isSkill ? '目标' : '涉及玩家'
  return (
    <form className="timeline-correction" onSubmit={(event) => { event.preventDefault(); confirm() }}>
      <button type="button" className="timeline-history__back" onClick={onCancel}><ArrowLeft aria-hidden="true" />返回日记</button>
      <div className="timeline-correction__intro"><span>{isSkill ? <WandSparkles aria-hidden="true" /> : <Megaphone aria-hidden="true" />}{isSkill ? '白天技能' : '公开事件'}</span><strong>原记录保留，新增一条更正。</strong></div>
      {isSkill ? <DaySkillRecordFields session={session} draft={skillDraft} onChange={setSkillDraft} actionPrefix="更正" /> : <fieldset>
        <legend>{targetLabel}<span>可多选</span></legend>
        <div className="timeline-correction__seats">
          {Array.from({ length: session.playerCount }, (_value, index) => {
            const seatId = index + 1
            return <SeatButton key={seatId} seat={seatId} selected={targets.includes(seatId)} onClick={() => toggleTarget(seatId)} aria-label={`更正${targetLabel}${seatId}号`} />
          })}
        </div>
      </fieldset>}
      {!isSkill ? <label>公开内容<textarea required value={note} maxLength={180} onChange={(event) => setNote(event.target.value)} /></label> : null}
      <label>更正原因<textarea required value={reason} maxLength={120} placeholder="例如：漏记了一名目标" onChange={(event) => setReason(event.target.value)} /></label>
      <div className="timeline-correction__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>取消</Button>
        <Button type="submit" variant="primary" disabled={!canConfirm}>确认追加</Button>
      </div>
    </form>
  )
}

function skillDraftFromEntry(entry: DayActionEntry): DaySkillDraft {
  const context = entry.skillContext
  const fallback = createDaySkillDraft()
  return {
    ...fallback,
    actorSeatId: context?.actor?.seatId ?? entry.actorSeatId,
    actorActualRoleId: context?.actor?.actualRole?.id ?? '',
    abilityRoleId: context?.abilityRole?.id ?? '',
    claimedRoleId: context?.claimedRole?.id ?? '',
    targetSeatIds: context?.targets.map((target) => target.seatId) ?? entry.targetSeatIds,
    targetActualRoleIds: Object.fromEntries((context?.targets ?? []).flatMap((target) => target.actualRole ? [[target.seatId, target.actualRole.id]] : [])),
    targetAlignments: Object.fromEntries((context?.targets ?? []).flatMap((target) => {
      const registration = target.registration
      return registration?.kind === 'alignment' && (registration.value === 'good' || registration.value === 'evil')
        ? [[target.seatId, registration.value]]
        : []
    })) as Record<number, 'good' | 'evil'>,
    outcomeKind: context?.outcome.kind ?? null,
    outcomeNote: context?.outcome.note ?? '',
  }
}
