import { BookPlus, Megaphone, Trash2, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { SeatButton } from '../../../components/ui/SeatButton'
import { Sheet } from '../../../components/ui/Sheet'
import type { GameSessionAction } from '../../game-session/state/sessionReducer'
import type { GameSessionState } from '../../game-session/types'
import { createDayActionDraft, hasDayActionDraftContent } from '../../game-session/state/dayActionDraft'
import { DaySkillRecordFields } from './DaySkillRecordFields'
import {
  buildDaySkillContext,
  canRecordDaySkill,
  summaryForDaySkillContext,
} from '../state/daySkill'

interface DayRecordSheetProps {
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
}

export function DayRecordSheet({ session, dispatch }: DayRecordSheetProps) {
  const [open, setOpen] = useState(false)
  const draft = session.dayActionDraft ?? createDayActionDraft()
  const isSkill = draft.category === 'skill'
  const skillDraft = draft.skill
  const eventDraft = draft.publicEvent
  const canRecord = isSkill ? canRecordDaySkill(skillDraft) : Boolean(eventDraft.note.trim())

  function updateDraft(update: typeof draft | ((current: typeof draft) => typeof draft)) {
    const next = typeof update === 'function' ? update(draft) : update
    dispatch({ type: 'set-day-action-draft', draft: next })
  }

  function toggleEventTarget(seatId: number) {
    updateDraft((current) => ({
      ...current,
      publicEvent: {
        ...current.publicEvent,
        targetSeatIds: current.publicEvent.targetSeatIds.includes(seatId)
          ? current.publicEvent.targetSeatIds.filter((item) => item !== seatId)
          : [...current.publicEvent.targetSeatIds, seatId],
      },
    }))
  }

  function record() {
    if (!canRecord) return
    const skillContext = isSkill ? buildDaySkillContext(session, skillDraft) : null
    if (isSkill && !skillContext) return
    const summary = isSkill
      ? summaryForDaySkillContext(skillContext, skillDraft)
      : `公开事件：${eventDraft.note.trim()}`
    dispatch({
      type: 'append-phase-entry',
      phaseKind: 'day',
      entry: {
        kind: 'day_action',
        category: draft.category,
        actorSeatId: isSkill ? skillDraft.actorSeatId : null,
        targetSeatIds: isSkill ? [...skillDraft.targetSeatIds] : [...eventDraft.targetSeatIds],
        skillContext: skillContext ?? undefined,
        summary,
        details: [],
      },
      input: { id: `day-action-${Date.now()}`, createdAt: new Date().toISOString() },
    })
    setOpen(false)
  }

  function clearDraft() {
    dispatch({ type: 'clear-day-action-draft' })
    setOpen(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="白天记录"
      description="未确认内容会暂存；确认后写入本日。"
      presentation="page"
      trigger={<Button variant="secondary" compact><BookPlus aria-hidden="true" />记技能/事件</Button>}
    >
      <div className="day-record-sheet">
        <div className="day-record-sheet__switch" role="tablist" aria-label="白天记录类型">
          <button type="button" role="tab" aria-selected={isSkill} className={isSkill ? 'is-active' : ''} onClick={() => updateDraft((current) => ({ ...current, category: 'skill' }))}><WandSparkles aria-hidden="true" />技能</button>
          <button type="button" role="tab" aria-selected={!isSkill} className={!isSkill ? 'is-active' : ''} onClick={() => updateDraft((current) => ({ ...current, category: 'public_event' }))}><Megaphone aria-hidden="true" />公开事件</button>
        </div>

        {isSkill ? <DaySkillRecordFields session={session} draft={skillDraft} onChange={(skill) => updateDraft((current) => ({ ...current, skill }))} /> : <>
          <fieldset>
            <legend>涉及玩家<span>可多选</span></legend>
            <div className="day-record-sheet__seats">
              {Array.from({ length: session.playerCount }, (_value, index) => {
                const seatId = index + 1
                return <SeatButton key={seatId} seat={seatId} selected={eventDraft.targetSeatIds.includes(seatId)} onClick={() => toggleEventTarget(seatId)} aria-label={`选择${seatId}号为涉及玩家`} />
              })}
            </div>
          </fieldset>
          <label className="day-record-sheet__note">公开内容
            <textarea value={eventDraft.note} maxLength={120} placeholder="必填" onChange={(event) => updateDraft((current) => ({ ...current, publicEvent: { ...current.publicEvent, note: event.target.value } }))} />
          </label>
        </>}
        <Button variant="primary" disabled={!canRecord} onClick={record}>{isSkill ? '记录技能' : '记录事件'}</Button>
        <Button variant="ghost" disabled={!hasDayActionDraftContent(session.dayActionDraft)} onClick={clearDraft}><Trash2 aria-hidden="true" />清空草稿</Button>
      </div>
    </Sheet>
  )
}
