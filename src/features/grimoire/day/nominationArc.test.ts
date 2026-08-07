import { describe, expect, it } from 'vitest'
import { NOMINATION_MARKER_SIZE, markerPoints, nominationArc, seatRadialAngle } from './nominationArc'

/**
 * 期待值一律由**独立的**几何式子算出来（椭圆方程、点积、到 token 圆心的距离），
 * 不复用被测函数的任何中间量。抄一遍实现来当期待值，等于把 bug 也抄进断言。
 */
const RING = { centerX: 400, centerY: 300, radiusX: 300, radiusY: 200, tokenSize: 80 }
const SEATS = 12
/** 弧所在同心椭圆的比例：1 − (token 半径 + 8) / 较短半轴。手算一遍，不问实现要。 */
const EXPECTED_FACTOR = 1 - (80 / 2 + 8) / 200

function tokenCentre(seatIndex: number) {
  const theta = seatRadialAngle(seatIndex, SEATS)
  return {
    x: RING.centerX + RING.radiusX * Math.cos(theta),
    y: RING.centerY + RING.radiusY * Math.sin(theta),
  }
}

function arcFor(nominatorIndex: number | null, nomineeIndex: number | null) {
  return nominationArc({
    ...RING,
    nominatorAngle: nominatorIndex === null ? null : seatRadialAngle(nominatorIndex, SEATS),
    nomineeAngle: nomineeIndex === null ? null : seatRadialAngle(nomineeIndex, SEATS),
  })
}

/** rotation（度）指向的单位向量。 */
function heading(rotation: number) {
  const radians = (rotation * Math.PI) / 180
  return { x: Math.cos(radians), y: Math.sin(radians) }
}

describe('提名弧的几何', () => {
  it('两端都落在同一条同心椭圆上，并给 token 让出半径 + 呼吸量', () => {
    // 落在椭圆上：把端点代回椭圆方程应当得到 1。若有人把 x/y 用了不同比例，这里立刻裂开。
    const arc = arcFor(0, 3)
    const rx = RING.radiusX * EXPECTED_FACTOR
    const ry = RING.radiusY * EXPECTED_FACTOR

    for (const end of [arc.from, arc.to]) {
      expect(end).not.toBeNull()
      const nx = (end!.x - RING.centerX) / rx
      const ny = (end!.y - RING.centerY) / ry
      expect(nx * nx + ny * ny).toBeCloseTo(1, 6)
    }

    // 让位量：较短半轴那一头正好是 token 半径 + 8，长轴那一头只会更多，绝不更少。
    const centre = tokenCentre(3)
    const clearance = Math.hypot(arc.to!.x - centre.x, arc.to!.y - centre.y)
    expect(clearance).toBeGreaterThanOrEqual(RING.tokenSize / 2 + 8 - 1e-6)
  })

  it('永远走短边：顺时针一格是 sweep 1，逆时针一格是 sweep 0，两者都不走大弧', () => {
    // large-arc-flag 恒 0 是「短边」这条规矩在 path 字符串里的唯一体现。
    const clockwise = arcFor(0, 1)
    const anticlockwise = arcFor(0, 11)

    expect(clockwise.path).toMatch(/ 0 1 /)
    expect(anticlockwise.path).toMatch(/ 0 0 /)
    expect(clockwise.path).not.toMatch(/ 1 [01] /)
    expect(anticlockwise.path).not.toMatch(/ 1 [01] /)
  })

  it('终点三角径向朝外扎进被提名人的 token，起点三角改指弧的去向', () => {
    // 12 点方向提名 3 点方向：终点该正指 +x，起点该正指顺时针切线（也是 +x），
    // 但两者的**依据不同**——把它们互换会让下面第二条断言失败。
    const arc = arcFor(0, 3)
    const nomineeCentre = tokenCentre(3)
    const toTarget = {
      x: nomineeCentre.x - arc.to!.x,
      y: nomineeCentre.y - arc.to!.y,
    }
    const toHeading = heading(arc.to!.rotation)
    const norm = Math.hypot(toTarget.x, toTarget.y)
    // 单位化后点积 ≈ 1：完全对准 token 圆心。
    expect((toHeading.x * toTarget.x + toHeading.y * toTarget.y) / norm).toBeCloseTo(1, 6)

    // 起点在 12 点，径向朝外是 -90°（向上）；它必须**不是**这个值，而是切线 0°。
    const fromHeading = heading(arc.from!.rotation)
    expect(fromHeading.x).toBeCloseTo(1, 6)
    expect(fromHeading.y).toBeCloseTo(0, 6)
  })

  it('只选了提名人时不画弧，三角退回径向朝外', () => {
    const arc = arcFor(0, null)
    expect(arc.path).toBeNull()
    expect(arc.to).toBeNull()
    // 12 点方向的径向朝外 = 向上 = -90°。
    expect(arc.from!.rotation).toBeCloseTo(-90, 6)
  })

  it('自我提名只留一枚标记，不画一条通向自己的弧', () => {
    const arc = arcFor(4, 4)
    expect(arc.selfNomination).toBe(true)
    expect(arc.path).toBeNull()
    expect(arc.to).toBeNull()
    expect(arc.from).not.toBeNull()
  })

  it('token 变大时弧向内收，净空守恒', () => {
    const small = nominationArc({ ...RING, tokenSize: 64, nominatorAngle: 0, nomineeAngle: Math.PI / 2 })
    const large = nominationArc({ ...RING, tokenSize: 96, nominatorAngle: 0, nomineeAngle: Math.PI / 2 })
    // θ=0 时端点在 x 轴上，横坐标直接就是弧的 x 半轴。
    expect(large.from!.x).toBeLessThan(small.from!.x)
  })

  it('半轴为 0（还没量到舞台）时安静返回空，不吐出 NaN 的 path', () => {
    const arc = nominationArc({
      centerX: 0, centerY: 0, radiusX: 0, radiusY: 0, tokenSize: 80,
      nominatorAngle: 0, nomineeAngle: 1,
    })
    expect(arc).toEqual({ from: null, to: null, path: null, selfNomination: false })
  })

  it('三角标的三个顶点尖端朝 +x，且不超出声明的边长', () => {
    const points = markerPoints().split(' ').map((pair) => pair.split(',').map(Number))
    expect(points).toHaveLength(3)
    const xs = points.map(([x]) => x)
    const ys = points.map(([, y]) => y)
    expect(Math.max(...xs)).toBeGreaterThan(0)
    expect(Math.max(...xs)).toBeLessThanOrEqual(NOMINATION_MARKER_SIZE / 2)
    expect(Math.max(...ys) - Math.min(...ys)).toBeLessThanOrEqual(NOMINATION_MARKER_SIZE)
  })
})

describe('座位角度', () => {
  it('1 号在正上方，编号顺时针递增', () => {
    expect(seatRadialAngle(0, 12)).toBeCloseTo(-Math.PI / 2, 10)
    // 顺时针 = y 轴向下时极角递增。3/12 圈之后正好落在 +x。
    expect(seatRadialAngle(3, 12)).toBeCloseTo(0, 10)
  })

  it('startOffset 只是整体旋转，不改变相邻两座的间隔', () => {
    const gap = seatRadialAngle(1, 8) - seatRadialAngle(0, 8)
    const rotatedGap = seatRadialAngle(1, 8, 90) - seatRadialAngle(0, 8, 90)
    expect(rotatedGap).toBeCloseTo(gap, 10)
    expect(seatRadialAngle(0, 8, 90) - seatRadialAngle(0, 8)).toBeCloseTo(Math.PI / 2, 10)
  })
})
