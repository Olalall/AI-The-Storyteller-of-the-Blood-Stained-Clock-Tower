/**
 * 魔典画布的「核」：坐在座位环正中央、常驻五个数字的 Town Info。
 *
 * 两条硬约束写死在这个文件里：
 * 1. 零 dispatch、零回调、零可点元素——环与核是纯观察面，状态编辑一律回 PlayerStatusSheet。
 *    这里用行内 `pointer-events: none` 把「不可点」变成可测事实，而不是只靠不绑 onClick。
 * 2. 处决门槛「只显示不裁定」：数字由 executionThresholdForAliveCount 算，是否处决仍由说书人判断。
 *
 * 没有现成数据源的数字（幽灵票余、本阶段待处理）显示「—」，绝不编造。
 */
import type { CSSProperties } from 'react'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { executionThresholdForAliveCount } from '../../day-workbench/state/voteRound'
import type { StorytellerSeatSummary } from '../../game-session/state/projectors'
import { coreBoxForRing, type GrimoireCoreLayout } from '../layout/coreBox'
import './grimoire-core.css'

export interface GrimoireCoreProps {
  /** 直接来自 projectStorytellerSeatSummaries(session)，核不持有任何座位副本。 */
  seats: readonly StorytellerSeatSummary[]
  layout: GrimoireCoreLayout
  /** 幽灵票余量。没有数据源时传 null / 不传，显示「—」。 */
  ghostVotesRemaining?: number | null
  /** 本阶段待处理项数。没有数据源时传 null / 不传，显示「—」。 */
  pendingCount?: number | null
  /** 待处理这一格的措辞随阶段变化（例如「本夜待处理」）。 */
  pendingLabel?: string
  className?: string
}

const UNKNOWN = '—'

interface CoreStat {
  key: string
  label: string
  value: number | null
}

function statText(value: number | null) {
  return value === null ? UNKNOWN : String(value)
}


export function GrimoireCore({
  seats,
  layout,
  ghostVotesRemaining = null,
  pendingCount = null,
  pendingLabel = '本阶段待处理',
  className = '',
}: GrimoireCoreProps) {
  const box = coreBoxForRing(layout)
  const isRing = layout.mode === 'ring' && box.width > 0 && box.height > 0
  // 整块 Town Info 不接受指针：核是观察面，任何编辑都得回 PlayerStatusSheet。
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
    { key: 'pending', label: pendingLabel, value: pendingCount },
  ]

  const classes = [
    'grimoire-core',
    isRing ? '' : 'grimoire-core--flow',
    className,
  ].filter(Boolean).join(' ')

  return (
    <Card
      as="div"
      surface="soft"
      eyebrow="Town Info"
      eyebrowTone="info"
      title={`${seats.length} 人局`}
      className={classes}
      style={style}
    >
      {seats.length === 0 ? (
        <EmptyState
          compact
          title="尚未配座"
          description="确认配板后这里显示存活、死亡与处决门槛。"
        />
      ) : (
        <>
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
