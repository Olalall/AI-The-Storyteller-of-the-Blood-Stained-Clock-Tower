import { describe, expect, it } from 'vitest'
import { baseDistributionFor } from './baseDistribution'

describe('基础阵营人数', () => {
  it('覆盖7至15人且每组总数等于玩家数', () => {
    for (let playerCount = 7; playerCount <= 15; playerCount += 1) {
      const counts = baseDistributionFor(playerCount)
      expect(counts).not.toBeNull()
      expect((counts?.townsfolk ?? 0) + (counts?.outsider ?? 0) + (counts?.minion ?? 0) + (counts?.demon ?? 0)).toBe(playerCount)
    }
  })

  it('不接受标准范围外的人数', () => {
    expect(baseDistributionFor(6)).toBeNull()
    expect(baseDistributionFor(16)).toBeNull()
  })
})
