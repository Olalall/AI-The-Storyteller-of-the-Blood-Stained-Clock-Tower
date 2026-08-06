/**
 * 提名弧的 SVG 层。
 *
 * 整层 aria-hidden：三角与弧是给眼睛的，读屏那一份由 DayRingOverlay 用一句
 * 「3号提名 7号」的可见隐藏文本承担。把几何图形塞进无障碍树只会得到一串
 * 「图形 图形 路径」，比没有更糟。
 *
 * ## 焦点色纪律
 *
 * 一屏最多两类 accent 语义。这一层用掉的是：
 * - **暖金 = 此刻的焦点对象**。夜里它是当前夜序项，白天它就是提名双方；
 *   两者永不同屏（环在夜与白天各只有一种相位内容），所以暖金始终只有一个意思。
 *   与「选中态也是暖金」的区分靠**形状而非颜色**：描边环 = 我刚点中的座位，
 *   三角 = 这一次提名的两端。
 * - **冷青 = 关系与索引**，这条弧和举手序号都属于它，与本局记录高亮同一族。
 *
 * 提名落定进入计票子态后，三角降为空心（emphasis="settled"）：
 * 此时被点中的是举手的人，实心暖金该让给他们。同一颜色、不同填充，
 * 表达的是「同一类语义里的主次」，而不是第三种语义。
 */
import { markerPoints, type NominationArc } from './nominationArc'

export interface NominationArcLayerProps {
  arc: NominationArc
  /** 舞台尺寸，与 solveRingLayout 的输入同源（centerX/Y 的两倍）。 */
  width: number
  height: number
  /** active = 提名步（正在选人）；settled = 计票步（提名已定）。 */
  emphasis: 'active' | 'settled'
}

function markerTransform(marker: { x: number; y: number; rotation: number }) {
  return `translate(${marker.x} ${marker.y}) rotate(${marker.rotation})`
}

export function NominationArcLayer({ arc, width, height, emphasis }: NominationArcLayerProps) {
  if (!arc.from && !arc.to) return null

  return (
    <svg
      className="day-ring-overlay__arc"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      data-emphasis={emphasis}
      aria-hidden="true"
      focusable="false"
    >
      {arc.path ? <path className="day-ring-overlay__arc-line" d={arc.path} /> : null}
      {arc.from ? (
        <polygon
          className="day-ring-overlay__marker"
          data-role="nominator"
          points={markerPoints()}
          transform={markerTransform(arc.from)}
        />
      ) : null}
      {arc.to ? (
        <polygon
          className="day-ring-overlay__marker"
          data-role="nominee"
          points={markerPoints()}
          transform={markerTransform(arc.to)}
        />
      ) : null}
    </svg>
  )
}
