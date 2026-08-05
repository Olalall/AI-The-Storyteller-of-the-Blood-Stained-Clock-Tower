import { ArrowLeftRight, Bot, Check, PencilLine, RefreshCw, ShieldCheck, Shuffle, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState, type DragEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { Sheet } from '../../components/ui/Sheet'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { getSmartScriptPack, roleSnapshotsForScript, roleTeamByIdForScript } from '../../domain/scripts'
import type { PlayerCount, ScriptId } from '../../domain/scripts'
import { generateSetupCandidates, type AIContextSeat, type SetupBalanceMicroAdjustment } from '../../services/ai'
import { isPlayerCount, saveSetupRosterMemory, type SetupRosterSeatInput } from './setupRosterMemory'
import { projectCurrentAssignments } from '../game-session/state/projectors'
import type { GameSessionAction } from '../game-session/state/sessionReducer'
import type { GameSessionState, SetupDraft } from '../game-session/types'
import {
  createSetupDraftFromCandidate,
  evaluateSmartScriptSetup,
  hasBlockingSetupIssue,
  replaceDraftRole,
  replaceDraftDemonBluff,
  swapDraftSeats,
} from '.'
import { SetupCandidateBrowser } from './SetupCandidateBrowser'
import { SetupSeatEditorSheet, type SetupSeatEditorKind } from './SetupSeatEditorSheet'
import { SetupStartPanel } from './SetupStartPanel'
import { compactBluffHint } from './setupPresentation'
import { previewDraftMicroAdjustment } from './setupMicroAdjustmentPreview'
import { createDraftFromCurrent, currentConfirmedSetupId, sessionHasStarted } from './setupSession'
import type { SetupTeam } from './types'
import './setup.css'

interface SetupPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: GameSessionState
  dispatch: React.Dispatch<GameSessionAction>
  setupScriptId: ScriptId
  onSetupScriptChange: (scriptId: ScriptId) => void
}
type SeatAction = 'swap' | 'role' | 'nickname'

export function SetupPanel({ open, onOpenChange, session, dispatch, setupScriptId, onSetupScriptChange }: SetupPanelProps) {
  const activeScriptId = session.playerCount > 0 ? session.scriptId : setupScriptId
  const activeScriptPack = useMemo(() => getSmartScriptPack(activeScriptId), [activeScriptId])
  const rolesForScript = useMemo(() => roleSnapshotsForScript(activeScriptId), [activeScriptId])
  const roleTeamById = useMemo(() => roleTeamByIdForScript(activeScriptId), [activeScriptId])
  const profiles = useMemo(() => Object.values(session.seats)
    .sort((left, right) => left.seatId - right.seatId)
    .map((seat) => ({ seatId: seat.seatId, experience: seat.experience })), [session.seats])
  const adviceSeats = useMemo<AIContextSeat[]>(() => Object.values(session.seats)
    .sort((left, right) => left.seatId - right.seatId)
    .map((seat) => ({
      seatId: seat.seatId,
      nickname: seat.nickname,
      experience: seat.experience,
    })), [session.seats])
  const candidates = useMemo(() => (
    isPlayerCount(profiles.length) ? generateSetupCandidates({ scriptId: activeScriptId, seatProfiles: profiles }) : []
  ), [activeScriptId, profiles])
  const [draft, setDraft] = useState<SetupDraft | null>(null)
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null)
  const [swapSummary, setSwapSummary] = useState<string | null>(null)
  const [seatAction, setSeatAction] = useState<SeatAction>('swap')
  const [seatEditor, setSeatEditor] = useState<{ kind: SetupSeatEditorKind; seatId: number } | null>(null)
  const [showCandidates, setShowCandidates] = useState(false)
  const started = sessionHasStarted(session)
  const currentSetupId = currentConfirmedSetupId(session)
  const expectedSeatIds = profiles.map((profile) => profile.seatId)
  const effectiveDraft = draft ?? session.setupDraft ?? createDraftFromCurrent(session)
  const legalityReport = effectiveDraft
    ? evaluateSmartScriptSetup(
      activeScriptId,
      effectiveDraft.assignments,
      effectiveDraft.demonBluffs,
      expectedSeatIds,
      effectiveDraft.setupRuleSelections,
      effectiveDraft.repeatableRoleIds,
    )
    : null
  const legality = legalityReport?.checks ?? []
  const isStaleDraft = started && (!effectiveDraft?.baseSetupId || effectiveDraft.baseSetupId !== currentSetupId)
  const canConfirm = Boolean(effectiveDraft && legalityReport && !isStaleDraft && !hasBlockingSetupIssue(legalityReport))
  const candidateAdvice = effectiveDraft
    ? candidates.find((candidate) => candidate.id === effectiveDraft.candidateId)?.demonBluffAdvice
    : undefined
  const activeCandidate = effectiveDraft ? candidates.find((candidate) => candidate.id === effectiveDraft.candidateId) : undefined
  const modifierReminders = legality.filter((check) => check.id.startsWith('modifier-'))
  const visibleChecks = legality.filter((check) => check.status === 'fail' || check.status === 'needs_choice')
  const inPlayRoleIds = new Set(effectiveDraft?.assignments.map((assignment) => assignment.role.id) ?? [])
  const demonBluffOptions = effectiveDraft
    ? rolesForScript.filter((role) => roleTeamById[role.id] === 'townsfolk' && !inPlayRoleIds.has(role.id))
    : []
  const editorSeat = seatEditor ? session.seats[seatEditor.seatId] ?? null : null
  const editorRole = seatEditor
    ? effectiveDraft?.assignments.find((assignment) => assignment.seatId === seatEditor.seatId)?.role ?? null
    : null
  useEffect(() => {
    saveSetupRosterMemory(session)
  }, [session])
  function startSetupSession(input: { playerCount: PlayerCount; seats: readonly SetupRosterSeatInput[] }) {
    dispatch({
      type: 'start-setup-session',
      scriptId: activeScriptId,
      createdAt: new Date().toISOString(),
      playerCount: input.playerCount,
      seats: input.seats,
    })
  }

  function selectCandidateDraft(candidateId: string, adjustment?: SetupBalanceMicroAdjustment) {
    const candidate = candidates.find((item) => item.id === candidateId)
    if (!candidate) return
    const updatedAt = new Date().toISOString()
    const nextDraft = createSetupDraftFromCandidate(candidate, updatedAt)
    const adjusted = adjustment ? previewDraftMicroAdjustment(nextDraft, adjustment, rolesForScript, updatedAt) : null
    if (adjustment && !adjusted) return
    const draftToUse = adjusted?.draft ?? nextDraft
    setDraft(started && currentSetupId ? { ...draftToUse, baseSetupId: currentSetupId } : draftToUse)
    setSelectedSeatId(null)
    setSwapSummary(adjusted?.summary ?? null)
    setSeatAction('swap')
    setShowCandidates(false)
  }
  function reloadCurrentDraft() {
    setDraft(createDraftFromCurrent(session))
  }
  function swapRoles(firstSeatId: number, secondSeatId: number) {
    if (!effectiveDraft || firstSeatId === secondSeatId) return
    const firstAssignment = effectiveDraft.assignments.find((assignment) => assignment.seatId === firstSeatId)
    const secondAssignment = effectiveDraft.assignments.find((assignment) => assignment.seatId === secondSeatId)
    if (!firstAssignment || !secondAssignment) return
    setDraft(swapDraftSeats(effectiveDraft, firstSeatId, secondSeatId, new Date().toISOString()))
    setSelectedSeatId(null)
    setSwapSummary(`已交换 ${firstSeatId}号与${secondSeatId}号角色`)
  }

  function selectSeat(seatId: number) {
    if (seatAction === 'role') {
      setSeatEditor({ kind: 'role', seatId })
      return
    }
    if (seatAction === 'nickname') {
      setSeatEditor({ kind: 'nickname', seatId })
      return
    }
    if (selectedSeatId !== null && selectedSeatId !== seatId) {
      swapRoles(selectedSeatId, seatId)
      return
    }
    setSelectedSeatId(selectedSeatId === seatId ? null : seatId)
    setSwapSummary(null)
  }

  function startSeatDrag(event: DragEvent<HTMLButtonElement>, seatId: number) {
    if (seatAction !== 'swap') return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(seatId))
    setSelectedSeatId(seatId)
    setSwapSummary(null)
  }

  function allowSeatDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  function dropSeat(event: DragEvent<HTMLButtonElement>, targetSeatId: number) {
    event.preventDefault()
    const sourceSeatId = Number(event.dataTransfer.getData('text/plain'))
    if (Number.isInteger(sourceSeatId)) swapRoles(sourceSeatId, targetSeatId)
  }

  function selectSeatAction(nextAction: SeatAction) {
    setSeatAction(nextAction)
    setSelectedSeatId(null)
    setSwapSummary(null)
  }

  function replaceSeatRole(role: NonNullable<typeof editorRole>) {
    if (!effectiveDraft || !seatEditor) return
    setDraft(replaceDraftRole(effectiveDraft, seatEditor.seatId, role, new Date().toISOString()))
    setSwapSummary(`已替换${seatEditor.seatId}号角色为${role.name}`)
  }

  function saveSeatNickname(nickname: string) {
    if (!seatEditor) return
    dispatch({ type: 'update-seat-nickname', seatId: seatEditor.seatId, nickname })
    setSwapSummary(`已修改${seatEditor.seatId}号昵称`)
  }

  function updateDemonBluff(bluffIndex: number, roleId: string) {
    if (!effectiveDraft) return
    const role = rolesForScript.find((item) => item.id === roleId)
    if (role) setDraft(replaceDraftDemonBluff(effectiveDraft, bluffIndex, role, new Date().toISOString()))
  }

  function confirmDraft() {
    if (!effectiveDraft || !canConfirm) return
    if (started && (!currentSetupId || effectiveDraft.baseSetupId !== currentSetupId)) return
    if (!started) {
      dispatch({ type: 'set-setup-draft', draft: effectiveDraft })
      dispatch({ type: 'confirm-setup', id: `setup-${Date.now()}`, confirmedAt: new Date().toISOString() })
    } else {
      const currentAssignments = new Map(projectCurrentAssignments(session).map((assignment) => [assignment.seatId, assignment]))
      effectiveDraft.assignments.forEach((assignment) => {
        const current = currentAssignments.get(assignment.seatId)
        if (!current || current.role.id === assignment.role.id) return
        dispatch({
          type: 'append-setup-change',
          id: `setup-change-${assignment.seatId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          seatId: assignment.seatId,
          fromRole: current.role,
          toRole: assignment.role,
          reason: '说书人微调配板',
        })
      })
    }
    setDraft(null)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="AI配板与调整" description={started ? '后续生效' : activeScriptPack.displayName} contentClassName="sheet-content--setup" presentation="page">
      <div className="setup-panel">
        {session.playerCount === 0
          ? <SetupStartPanel scriptId={activeScriptId} scriptName={activeScriptPack.displayName} onScriptChange={onSetupScriptChange} onStart={startSetupSession} />
          : !effectiveDraft || showCandidates ? <SetupCandidateBrowser scriptId={activeScriptId} scriptName={activeScriptPack.displayName} knowledgeVersion={candidates[0]?.knowledgeVersion ?? session.knowledgeVersion} candidates={candidates} playerCount={session.playerCount} seats={adviceSeats} onUseCandidate={selectCandidateDraft} onPreviewMicroAdjustment={selectCandidateDraft} /> : <button type="button" className="setup-panel__advice-entry" onClick={() => setShowCandidates(true)}>
          <span><Bot aria-hidden="true" />AI配板建议</span>
          <strong>{activeCandidate?.title ?? '查看角色组合'}</strong>
          <em>打开</em>
        </button>}

        {effectiveDraft ? <section className="setup-panel__draft" aria-labelledby="setup-draft-title">
          <div className="setup-panel__section-heading">
            <div><span>说书人草稿</span><h3 id="setup-draft-title">角色与座位</h3></div>
            <StatusBadge tone={canConfirm ? 'success' : 'warning'}>{canConfirm ? '可确认' : '需调整'}</StatusBadge>
          </div>
          <section className="setup-panel__role-panel">
            <div className="setup-seat-grid" role="list" aria-label="配板座位">
              {effectiveDraft.assignments.map((assignment) => <div key={assignment.seatId} role="listitem"><button
                type="button"
                draggable={seatAction === 'swap'}
                aria-label={`${assignment.seatId}号 ${assignment.role.name}`}
                aria-pressed={seatAction === 'swap' && assignment.seatId === selectedSeatId}
                className={`${assignment.seatId === selectedSeatId ? 'is-selected ' : ''}is-action-${seatAction}`}
                onClick={() => selectSeat(assignment.seatId)}
                onDragStart={(event) => startSeatDrag(event, assignment.seatId)}
                onDragOver={allowSeatDrop}
                onDrop={(event) => dropSeat(event, assignment.seatId)}
              ><span>{assignment.seatId}号</span><strong>{assignment.role.name}</strong></button></div>)}
            </div>
            <div className="setup-panel__seat-action" aria-live="polite">
              <div className="setup-panel__seat-actions" role="group" aria-label="角色卡操作">
                <button type="button" className={seatAction === 'swap' ? 'is-active' : ''} aria-pressed={seatAction === 'swap'} onClick={() => selectSeatAction('swap')}><ArrowLeftRight aria-hidden="true" />交换角色</button>
                <button type="button" className={seatAction === 'role' ? 'is-active' : ''} aria-pressed={seatAction === 'role'} onClick={() => selectSeatAction('role')}><RefreshCw aria-hidden="true" />更换角色</button>
                <button type="button" className={seatAction === 'nickname' ? 'is-active' : ''} aria-pressed={seatAction === 'nickname'} onClick={() => selectSeatAction('nickname')}><PencilLine aria-hidden="true" />修改昵称</button>
              </div>
              {swapSummary ? <p className="setup-panel__swap-summary" role="status"><Check aria-hidden="true" />{swapSummary}</p> : null}
            </div>
            {effectiveDraft ? <section className="setup-panel__bluff-card" aria-labelledby="setup-bluff-title">
              <div className="setup-panel__section-heading">
                <div><span>恶魔</span><h4 id="setup-bluff-title">伪装建议</h4></div>
                <StatusBadge tone="info"><Sparkles aria-hidden="true" />未在场</StatusBadge>
              </div>
              <div className="setup-panel__bluff-grid">
                {effectiveDraft.demonBluffs.map((bluff, index) => {
                  const advice = candidateAdvice?.items.find((item) => item.role.id === bluff.id)
                  const selectedByOtherBluffs = new Set(effectiveDraft.demonBluffs
                    .filter((_item, otherIndex) => otherIndex !== index)
                    .map((item) => item.id))
                  const availableOptions = demonBluffOptions.filter((role) => role.id === bluff.id || !selectedByOtherBluffs.has(role.id))
                  return <label key={`${bluff.id}-${index}`}>
                    <span className="setup-panel__bluff-top"><b>伪装{index + 1}</b>{advice
                      ? <StatusBadge tone="current" size="sm">建议</StatusBadge>
                      : <StatusBadge tone="neutral" size="sm">可选</StatusBadge>}</span>
                    <select value={bluff.id} onChange={(event) => updateDemonBluff(index, event.target.value)}>
                      {availableOptions.map((role) => <option value={role.id} key={role.id}>{role.name}</option>)}
                    </select>
                    <small>{compactBluffHint(advice?.reason)}</small>
                  </label>
                })}
              </div>
            </section> : null}
          </section>
          {legalityReport ? <section className="setup-panel__rule-card" aria-labelledby="setup-rule-title">
            <div className="setup-panel__section-heading">
              <div><span>开局人数</span><h4 id="setup-rule-title">人数修正</h4></div>
              <StatusBadge tone={legalityReport.expectedCounts && legalityReport.actualCounts.outsider === legalityReport.expectedCounts.outsider && !hasBlockingSetupIssue(legalityReport) ? 'success' : 'warning'}>
                <ShieldCheck aria-hidden="true" />{legalityReport.expectedCounts ? '已核对' : '待核对'}
              </StatusBadge>
            </div>
            <dl className="setup-panel__count-strip">
              <div><dt>镇民</dt><dd>{legalityReport.actualCounts.townsfolk}{legalityReport.expectedCounts ? ` / ${legalityReport.expectedCounts.townsfolk}` : ''}</dd></div>
              <div><dt>外来者</dt><dd>{legalityReport.actualCounts.outsider}{legalityReport.expectedCounts ? ` / ${legalityReport.expectedCounts.outsider}` : ''}</dd></div>
              <div><dt>爪牙</dt><dd>{legalityReport.actualCounts.minion}{legalityReport.expectedCounts ? ` / ${legalityReport.expectedCounts.minion}` : ''}</dd></div>
              <div><dt>恶魔</dt><dd>{legalityReport.actualCounts.demon}{legalityReport.expectedCounts ? ` / ${legalityReport.expectedCounts.demon}` : ''}</dd></div>
            </dl>
            {modifierReminders.length ? <ul className="setup-panel__modifier-reminders">
              {modifierReminders.map((reminder) => <li key={reminder.id}><strong>{reminder.summary}</strong></li>)}
            </ul> : null}
          </section> : null}
          {visibleChecks.length || isStaleDraft ? <ul className="setup-panel__checks">
            {isStaleDraft ? <li className="is-failed" role="alert"><X aria-hidden="true" />配板已更新；请重新载入当前配板或重新采用候选。</li> : null}
            {visibleChecks.map((check) => <li className={`is-${check.status}`} key={check.id}>{check.passed ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}<span>{check.summary}</span></li>)}
          </ul> : null}
          <div className="setup-panel__footer">
            {isStaleDraft
              ? <Button variant="ghost" onClick={reloadCurrentDraft}><Shuffle aria-hidden="true" />重新载入</Button>
              : <Button variant="ghost" onClick={() => setDraft(null)}><Shuffle aria-hidden="true" />放弃草稿</Button>}
            <Button variant="primary" disabled={!canConfirm} onClick={confirmDraft}>{started ? '确认调整' : '确认配板'}</Button>
          </div>
        </section> : null}
      </div>
      <SetupSeatEditorSheet open={seatEditor !== null} onOpenChange={(nextOpen) => { if (!nextOpen) setSeatEditor(null) }} kind={seatEditor?.kind ?? null} seat={editorSeat} currentRole={editorRole} roles={rolesForScript} teamByRoleId={roleTeamById as Readonly<Record<string, SetupTeam>>} inPlayRoleIds={inPlayRoleIds} onReplaceRole={replaceSeatRole} onSaveNickname={saveSeatNickname} />
    </Sheet>
  )
}
