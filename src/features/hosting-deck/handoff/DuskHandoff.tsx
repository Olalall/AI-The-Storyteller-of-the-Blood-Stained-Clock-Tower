import { useState } from 'react'
import { Lightbulb, ListChecks, ScrollText } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge, type BadgeTone } from '../../../components/ui/StatusBadge'
import { StickyActionBar } from '../../../components/ui/StickyActionBar'
import { projectConfirmedSetup, projectCurrentPlayerStates } from '../../game-session/state/projectors'
import { projectEffectiveTimelineEntries } from '../../game-session/state/projectTimelineHistory'
import type { GameSessionState, PhaseSegment, TimelineEntry, VoteRoundEntry } from '../../game-session/types'
import './dusk-handoff.css'

interface DuskHandoffProps {
  session: GameSessionState
  /** 即将开始的那一夜，例如「第3夜」；本卡不推导夜编号，只显示上层给的标签。 */
  nightLabel: string
  isFirstNight: boolean
  onStartNight: () => void
}

interface DayRecap {
  segmentLabel: string
  badge: string
  tone: BadgeTone
  headline: string
  lines: string[]
}

interface ChecklistItem {
  id: string
  title: string
  hint: string
  candidates?: string[]
  emptyCandidateText?: string
}

function seatText(session: GameSessionState, seatId: number) {
  const nickname = session.seats[seatId]?.nickname?.trim()
  return nickname ? `${seatId}号 · ${nickname}` : `${seatId}号`
}

function lastClosedDaySegment(session: GameSessionState): PhaseSegment | null {
  return [...session.phaseSegments]
    .filter((segment) => segment.kind === 'day' && segment.closedAt)
    .sort((left, right) => left.sequence - right.sequence)
    .at(-1) ?? null
}

function segmentEntries(session: GameSessionState, segmentId: string): TimelineEntry[] {
  return projectEffectiveTimelineEntries(session.timeline)
    .filter((entry) => entry.segmentId === segmentId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id))
}

function voteRoundsOf(entries: readonly TimelineEntry[]): VoteRoundEntry[] {
  return entries.filter((entry): entry is VoteRoundEntry => entry.kind === 'vote_round')
}

function voteCount(round: VoteRoundEntry) {
  return new Set(round.raisedSeatIds).size
}

function voteLineFor(rounds: readonly VoteRoundEntry[], nomineeSeatId: number) {
  const round = rounds.filter((item) => item.nomineeSeatId === nomineeSeatId).at(-1)
  if (!round) return '这一天没有对应的票型记录'
  return `${voteCount(round)}票 / 门槛${round.threshold}票`
}

function highestVoteLine(rounds: readonly VoteRoundEntry[]) {
  if (rounds.length === 0) return '这一天没有记录任何投票'
  const highest = [...rounds].sort((left, right) => voteCount(right) - voteCount(left))[0]
  return `${rounds.length}轮投票 · 最高 ${voteCount(highest)}票 / 门槛${highest.threshold}票`
}

/**
 * 只回执白天段里已确认的处决结论，不由票型自行判定谁该死。
 * 「造成死亡」取 causedDeath，字段缺失的历史归档按 true 读，与 ExecutionEntry 注释一致。
 */
function projectDayRecap(session: GameSessionState, segment: PhaseSegment): DayRecap {
  const entries = segmentEntries(session, segment.id)
  const rounds = voteRoundsOf(entries)
  const outcome = entries.filter((entry) => entry.kind === 'execution' || entry.kind === 'no_execution').at(-1)

  if (outcome?.kind === 'execution' && typeof outcome.executedSeatId === 'number') {
    const causedDeath = outcome.causedDeath ?? true
    return {
      segmentLabel: segment.label,
      badge: causedDeath ? '处决 · 已死亡' : '处决 · 未死亡',
      tone: causedDeath ? 'danger' : 'warning',
      headline: `处决 ${seatText(session, outcome.executedSeatId)}`,
      lines: [voteLineFor(rounds, outcome.executedSeatId), causedDeath ? '该玩家已死亡' : '该玩家仍存活'],
    }
  }
  if (outcome?.kind === 'no_execution') {
    return {
      segmentLabel: segment.label,
      badge: '无处决',
      tone: 'neutral',
      headline: '这一天没有人被处决',
      lines: [highestVoteLine(rounds)],
    }
  }
  return {
    segmentLabel: segment.label,
    badge: '结论缺失',
    tone: 'warning',
    headline: '这一天没有记录处决结论',
    lines: [highestVoteLine(rounds), '如需补记，请到本局记录处理；本卡不会替你补。'],
  }
}

function expiryCandidates(session: GameSessionState) {
  const states = projectCurrentPlayerStates(session)
  return Object.entries(states)
    .map(([key, state]) => ({ seatId: Number(key), state }))
    .sort((left, right) => left.seatId - right.seatId)
    .flatMap(({ seatId, state }) => [
      state.poisoned ? `${seatText(session, seatId)} · 中毒` : '',
      state.drunk ? `${seatText(session, seatId)} · 醉酒` : '',
      ...state.markers.map((marker) => `${seatText(session, seatId)} · ${marker.label}`),
    ].filter(Boolean))
}

function buildChecklist(session: GameSessionState, isFirstNight: boolean): ChecklistItem[] {
  return [
    {
      id: 'night-order-sheet',
      title: `请核对：夜序表已翻到「${isFirstNight ? '首夜' : '其他夜'}」一面`,
      hint: isFirstNight
        ? '首夜含仅首夜生效的角色，顺序与其他夜完全不同。'
        : '其他夜顺序与首夜不同，不要沿用首夜那一面。',
    },
    {
      id: 'reminder-tokens',
      title: '请核对：提示标记已按上一段结果增删',
      hint: isFirstNight
        ? '开局标记（酒鬼、隐士等按配板）先摆好，再开始叫醒。'
        : '上一夜与上一天产生的标记，该加的加、该撤的撤。',
    },
    {
      id: 'dusk-expiry',
      title: '请核对：持续到黄昏的效果是否到期',
      hint: '以下是登记在案的状态；到期与否由你判断，本卡不会自动清除，也不会写入记录。',
      candidates: expiryCandidates(session),
      emptyCandidateText: '当前没有登记在案的中毒、醉酒或人工标记。',
    },
  ]
}

function upfrontThoughts(session: GameSessionState) {
  const bluffs = projectConfirmedSetup(session)?.draft.demonBluffs ?? []
  return [
    bluffs.length
      ? `恶魔的三张伪装：${bluffs.map((role) => role.name).join(' / ')}`
      : '恶魔的三张伪装：配板里没有记录，开始前先想好',
    '今夜可能要给的错误信息：给谁、给什么、和白天已公开的说法是否冲突',
    '今夜若有人死亡：黎明只报生死不报原因，先想好被追问时怎么回应',
  ]
}

/**
 * 白天 → 夜的页内交接卡，是相位推进的唯一门。
 *
 * 它只读：不 dispatch、不创建或关闭记录段、不改队列。清单勾选纯属本地备忘，
 * 卸载即丢弃——所以文案一律是「请核对」而不是「已处理」，避免被当成待办系统，
 * 让说书人误以为勾了就已经在魔典上做过了。推进只经由 onStartNight 交给上层。
 */
export function DuskHandoff({ session, nightLabel, isFirstNight, onStartNight }: DuskHandoffProps) {
  const [checkedIds, setCheckedIds] = useState<readonly string[]>([])
  const closedDay = lastClosedDaySegment(session)
  const recap = closedDay ? projectDayRecap(session, closedDay) : null
  const checklist = buildChecklist(session, isFirstNight)

  const toggle = (id: string) => setCheckedIds((current) =>
    current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return (
    <div className="dusk-handoff">
      <Card
        eyebrow="黄昏 · 交接"
        title={`准备${nightLabel}`}
        titleId="dusk-handoff-title"
        actions={<StatusBadge tone="info">{isFirstNight ? '首夜' : '其他夜'}</StatusBadge>}
      >
        <section className="dusk-handoff__block" aria-labelledby="dusk-handoff-recap">
          <h3 className="dusk-handoff__block-title" id="dusk-handoff-recap">
            <ScrollText aria-hidden="true" />上一白天结论
          </h3>
          {recap ? (
            <div className="dusk-recap">
              <div className="dusk-recap__head">
                <span className="dusk-recap__segment">{recap.segmentLabel}</span>
                <StatusBadge tone={recap.tone} size="sm">{recap.badge}</StatusBadge>
              </div>
              <strong className="dusk-recap__headline">{recap.headline}</strong>
              <ul className="dusk-recap__lines">
                {recap.lines.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </div>
          ) : (
            <EmptyState
              compact
              title={isFirstNight ? '首夜之前没有白天' : '还没有已关闭的白天段'}
              description={isFirstNight
                ? '开始前先确认配板已确认、身份已发放、恶魔伪装已给出。'
                : '上一天可能仍开着；结论请到本局记录里补记，本卡只做回执。'}
            />
          )}
        </section>

        <section className="dusk-handoff__block" aria-labelledby="dusk-handoff-checklist">
          <h3 className="dusk-handoff__block-title" id="dusk-handoff-checklist">
            <ListChecks aria-hidden="true" />黄昏准备清单
          </h3>
          <p className="dusk-handoff__note">勾选只是本地备忘：不写入本局记录，离开本卡即清空。</p>
          <ul className="dusk-checklist">
            {checklist.map((item) => (
              <li key={item.id}>
                <label className="dusk-check">
                  <input
                    type="checkbox"
                    className="dusk-check__box"
                    checked={checkedIds.includes(item.id)}
                    onChange={() => toggle(item.id)}
                  />
                  <span className="dusk-check__body">
                    <strong>{item.title}</strong>
                    <small>{item.hint}</small>
                  </span>
                </label>
                {item.candidates ? (
                  <ul className="dusk-check__candidates">
                    {item.candidates.length
                      ? item.candidates.map((candidate) => <li key={candidate}>{candidate}</li>)
                      : <li className="dusk-check__candidates-empty">{item.emptyCandidateText}</li>}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="dusk-handoff__block" aria-labelledby="dusk-handoff-thoughts">
          <h3 className="dusk-handoff__block-title" id="dusk-handoff-thoughts">
            <Lightbulb aria-hidden="true" />需要预先想好
          </h3>
          <ul className="dusk-thoughts">
            {upfrontThoughts(session).map((thought) => <li key={thought}>{thought}</li>)}
          </ul>
        </section>
      </Card>

      <StickyActionBar>
        <span className="dusk-handoff__bar-hint">所有玩家闭眼后再开始 · 本卡不写任何记录</span>
        <Button variant="primary" onClick={onStartNight}>开始{nightLabel}</Button>
      </StickyActionBar>
    </div>
  )
}
