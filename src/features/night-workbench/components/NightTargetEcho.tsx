/**
 * 魔典模式下抽屉里的目标区：一行「已选：5号 ✕」回显 + 一个**折叠的**号码网格。
 *
 * 为什么抽屉里只剩一行：目标选择已经搬到环上——指着真人点，与说书人在实体桌上
 * 「玩家指目标、我同步指回去确认」的手势一一对应。抽屉里再摆一张 6 列网格，
 * 就又变回「在一张号码表里找座位号」，环白搬了。
 *
 * 为什么那张网格还必须在：
 * 1. **键盘与读屏**。环上的 token 是绝对定位的一圈按钮，Tab 序是环上的物理顺序，
 *    而读屏用户拿不到「谁坐在哪」这个空间信息——对他们来说号码网格才是主路径。
 * 2. **上半弧够不到**。iPad 竖屏单手持机时环的上半圈在拇指弧之外，
 *    环上的 12 号可能物理上按不到。
 * 这不是「可选的第二条路」，是无障碍通道；所以它折叠但恒在，不随屏宽或模式消失。
 *
 * 它与环共用同一个 onTarget：两条入口产生的是同一条 dispatch、同一份草稿。
 * 抄成两份之后，键盘用户与触摸用户会在同一局里写出两种形状的记录。
 */
import { X } from 'lucide-react'
import { SeatButton } from '../../../components/ui/SeatButton'

interface NightTargetEchoProps {
  playerCount: number
  /** 当前行动者本人，网格里给一枚「本人」角标。 */
  selfSeatId: number
  targetLabel: string
  targetCount: number
  /** 已选目标，顺序即点击顺序。 */
  targets: readonly number[]
  /** 自上而下的写入闸门。禁用时回显仍然显示，只是点不动。 */
  disabled: boolean
  /** 与环上点座位走的是同一个回调：切换选中，由 reducer 决定顶掉谁。 */
  onTarget: (seat: number) => void
}

export function NightTargetEcho({
  playerCount,
  selfSeatId,
  targetLabel,
  targetCount,
  targets,
  disabled,
  onTarget,
}: NightTargetEchoProps) {
  const remaining = Math.max(0, targetCount - targets.length)

  return (
    <fieldset disabled={disabled} className="night-target-echo">
      <legend>
        {targetLabel} <span>{targets.length}/{targetCount}</span>
      </legend>

      {targets.length === 0 ? (
        <p className="night-target-echo__empty">
          点环上的座位选{targetLabel}。死亡座位照样可以选。
        </p>
      ) : (
        <ul className="night-target-echo__chips">
          {targets.map((seat) => (
            <li key={seat}>
              <span>已选：{seat}号</span>
              <button
                type="button"
                onClick={() => onTarget(seat)}
                aria-label={`取消选择${seat}号`}
              >
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {remaining > 0 && targets.length > 0 ? (
        <p className="night-target-echo__empty">还差 {remaining} 个{targetLabel}。</p>
      ) : null}

      {/* 折叠但恒在。open 不受屏宽或选中数控制——一个「有时候不在」的无障碍通道
          等于没有通道，而它不在的那一次正好是够不到上半弧的那一次。 */}
      <details className="night-target-echo__fallback">
        <summary>用号码网格选（键盘 / 读屏 / 够不到上半弧时）</summary>
        <div className="seat-grid">
          {Array.from({ length: playerCount }, (_value, index) => index + 1).map((seat) => (
            <SeatButton
              key={seat}
              seat={seat}
              selected={targets.includes(seat)}
              self={seat === selfSeatId}
              onClick={() => onTarget(seat)}
              aria-label={`选择${seat}号玩家`}
            />
          ))}
        </div>
      </details>
    </fieldset>
  )
}
