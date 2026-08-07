/**
 * 魔典画布的「核」：坐在座位环正中央。底座是常驻五个数字的 Town Info，
 * 底座之上按相位换一块内容（夜序双 Disc / 计时 / 计票 / 黄昏回执 / 黎明座位号）。
 *
 * 三条硬约束写死在这个文件里：
 * 1. 零 dispatch。核只接受数据与回调，任何状态改变都发生在别处。
 *    「不可点」用行内 `pointer-events: none` 变成可测事实；本批第一次引入可点元素
 *    （顶行标识与 ‹ ›），因此每一个可点元素都要自己写 `pointerEvents: 'auto'`——
 *    默认不可点、逐个开，比默认可点、逐个关安全一个数量级。
 * 2. 处决门槛与计票三数「只显示不裁定」（裁决 10）：算式只在渲染路径上，核里没有 payload。
 * 3. 没有数据源的数字显示「—」，绝不编造。
 *
 * 遮蔽默认 L1：没接线时核绝不揭示角色面。默认值必须站在保密那一侧。
 */
import type { CSSProperties, ReactNode } from 'react'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { executionThresholdForAliveCount } from '../../day-workbench/state/voteRound'
import type { StorytellerSeatSummary } from '../../game-session/state/projectors'
import { coreBoxForRing, type GrimoireCoreLayout } from '../layout/coreBox'
import { shieldVisibility, type ShieldLevel } from '../shield/shieldLevel'
import {
  CORE_PENDING_LABEL,
  CORE_UNKNOWN,
  type GrimoireCorePhase,
  type GrimoireDawnRoll,
  type GrimoireDayTimer,
  type GrimoireDuskBrief,
  type GrimoireNightCursor,
  type GrimoireVoteTally,
} from './corePhase'
import { DawnRollCall } from './phases/DawnRollCall'
import { DayTimerReadout } from './phases/DayTimerReadout'
import { DuskBriefing } from './phases/DuskBriefing'
import { NightCursorDiscs } from './phases/NightCursorDiscs'
import { VoteTallyReadout } from './phases/VoteTallyReadout'
import './grimoire-core.css'

export interface GrimoireCoreProps {
  /** 直接来自 projectStorytellerSeatSummaries(session)，核不持有任何座位副本。 */
  seats: readonly StorytellerSeatSummary[]
  layout: GrimoireCoreLayout
  /** 幽灵票余量。没有数据源时传 null / 不传，显示「—」。 */
  ghostVotesRemaining?: number | null
  /** 本阶段待处理项数。没有数据源时传 null / 不传，显示「—」。 */
  pendingCount?: number | null
  /** 待处理这一格的措辞。不传则按相位取默认（夜里是「本夜待处理」）。 */
  pendingLabel?: string
  /** 相位决定核里多出哪一块内容；Town Info 五个数字在任何相位都不撤。 */
  phase?: GrimoireCorePhase
  /** 顶行标识「乌鸦渡口 · 12人」里的剧本名。 */
  scriptName?: string | null
  /**
   * 顶行标识的点击目标：本局信息浮层（剧本、人数、知识版本、切换板子、开场白，
   * 以及裁决 7 定下的模式切换入口）。浮层本身不在这一批，核只负责把这一下透出去。
   * 不传时标识退化成纯文本，而不是一个点了没反应的按钮。
   */
  onOpenSessionInfo?: () => void
  /** 遮蔽级别，决定角色名与角色图标进不进 DOM。默认 L1。 */
  shield?: ShieldLevel
  night?: GrimoireNightCursor
  timer?: GrimoireDayTimer
  vote?: GrimoireVoteTally
  dusk?: GrimoireDuskBrief
  dawn?: GrimoireDawnRoll
  className?: string
}

interface CoreStat {
  key: string
  label: string
  value: number | null
}

function statText(value: number | null) {
  return value === null ? CORE_UNKNOWN : String(value)
}

interface PhaseSlots {
  phase: GrimoireCorePhase
  roleVisible: boolean
  aliveCount: number
  night?: GrimoireNightCursor
  timer?: GrimoireDayTimer
  vote?: GrimoireVoteTally
  dusk?: GrimoireDuskBrief
  dawn?: GrimoireDawnRoll
}

/**
 * 相位块。没有对应数据时整块不渲染——画一个空壳等于告诉说书人「这里本该有东西，
 * 但工具坏了」，而真实情况通常只是这一相位还没开始。
 */
function phaseBlock(slots: PhaseSlots): ReactNode {
  const { phase, roleVisible } = slots
  if (phase === 'night' && slots.night) {
    return <NightCursorDiscs cursor={slots.night} roleVisible={roleVisible} />
  }
  if (phase === 'day-timer' && slots.timer) {
    return <DayTimerReadout timer={slots.timer} />
  }
  if (phase === 'day-vote' && slots.vote) {
    return <VoteTallyReadout tally={slots.vote} aliveCount={slots.aliveCount} />
  }
  if (phase === 'dusk' && slots.dusk) {
    return <DuskBriefing brief={slots.dusk} queueVisible={roleVisible} />
  }
  if (phase === 'dawn' && slots.dawn) {
    return <DawnRollCall roll={slots.dawn} />
  }
  return null
}

export function GrimoireCore({
  seats,
  layout,
  ghostVotesRemaining = null,
  pendingCount = null,
  pendingLabel,
  phase = 'idle',
  scriptName = null,
  onOpenSessionInfo,
  shield = 'L1',
  night,
  timer,
  vote,
  dusk,
  dawn,
  className = '',
}: GrimoireCoreProps) {
  const box = coreBoxForRing(layout)
  const isRing = layout.mode === 'ring' && box.width > 0 && box.height > 0
  // 整块核不接受指针：它是观察面。可点的那几个元素各自把 pointer-events 开回来。
  const style: CSSProperties = isRing
    ? { pointerEvents: 'none', left: box.left, top: box.top, width: box.width, height: box.height }
    : { pointerEvents: 'none' }

  const alive = seats.filter((seat) => seat.state.life === 'alive').length
  const dead = seats.length - alive

  const stats: CoreStat[] = [
    { key: 'alive', label: '存活', value: alive },
    { key: 'dead', label: '死亡', value: dead },
    { key: 'ghost-votes', label: '幽灵票余', value: ghostVotesRemaining },
    { key: 'threshold', label: '处决门槛', value: executionThresholdForAliveCount(alive) },
    { key: 'pending', label: pendingLabel ?? CORE_PENDING_LABEL[phase], value: pendingCount },
  ]

  const classes = [
    'grimoire-core',
    isRing ? '' : 'grimoire-core--flow',
    className,
  ].filter(Boolean).join(' ')

  // 空局时这一行是主入口（此时它几乎是核里唯一能做的事），所以给它一个醒目变体。
  const identityText = `${scriptName?.trim() || '未选剧本'} · ${seats.length}人`
  const identityClasses = [
    'grimoire-core__identity',
    seats.length === 0 ? 'grimoire-core__identity--primary' : '',
  ].filter(Boolean).join(' ')
  const identity = onOpenSessionInfo ? (
    <button
      type="button"
      className={identityClasses}
      style={{ pointerEvents: 'auto' }}
      aria-haspopup="dialog"
      aria-label={`本局信息：${identityText}`}
      // 空参调用：本局信息浮层不需要知道核里算出了什么，回调也就不该能捎带任何值。
      onClick={() => onOpenSessionInfo()}
    >
      {identityText}
    </button>
  ) : (
    <span className={`${identityClasses} grimoire-core__identity--static`}>{identityText}</span>
  )

  return (
    <Card
      as="div"
      surface="soft"
      eyebrow="Town Info"
      eyebrowTone="info"
      title={identity}
      className={classes}
      style={style}
      data-phase={phase}
    >
      {seats.length === 0 ? (
        <EmptyState
          compact
          title="尚未配座"
          description="确认配板后这里显示存活、死亡与处决门槛。"
        />
      ) : (
        <>
          {phaseBlock({
            phase,
            roleVisible: shieldVisibility(shield).roleIdentity,
            aliveCount: alive,
            night,
            timer,
            vote,
            dusk,
            dawn,
          })}
          <dl className="grimoire-core__stats">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className={`grimoire-core__stat grimoire-core__stat--${stat.key}`}
                data-stat={stat.key}
              >
                <dt className="grimoire-core__stat-label">{stat.label}</dt>
                <dd className="grimoire-core__stat-value" data-empty={stat.value === null}>
                  {statText(stat.value)}
                  {stat.value === null ? <span className="ui-visually-hidden">暂无数据源</span> : null}
                </dd>
              </div>
            ))}
          </dl>
          <p className="grimoire-core__note">
            <StatusBadge tone="info" size="sm">只显示 · 不裁定</StatusBadge>
            门槛按存活数算；是否处决仍由说书人判断。
          </p>
        </>
      )}
    </Card>
  )
}
