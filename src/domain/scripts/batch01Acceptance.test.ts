import { describe, expect, it } from 'vitest'
import { smartScriptPacks } from './catalog'

const firstBatchScriptIds = [
  'trouble-brewing',
  'bad-moon-rising',
  'sects-and-violets',
  'one-in-one-out',
  'a-grimm-chorus',
  'hide-and-seek',
  'lunar-eclipse',
  'punchy',
  'quick-maths',
  'devout-theists',
] as const

const confirmedCommunityScriptIds = [
  'one-in-one-out',
  'a-grimm-chorus',
  'hide-and-seek',
  'lunar-eclipse',
  'punchy',
  'quick-maths',
  'devout-theists',
] as const

describe('batch 01 smart script acceptance', () => {
  it('keeps the first 10 imported scripts registered without replacing Catfishing', () => {
    const registeredIds = smartScriptPacks.map((pack) => pack.scriptId)

    expect(registeredIds).toContain('catfishing')
    expect(registeredIds.length).toBeGreaterThanOrEqual(firstBatchScriptIds.length + 1)
    expect(firstBatchScriptIds.every((scriptId) => registeredIds.includes(scriptId))).toBe(true)
  })

  it('keeps source verification status explicit for community scripts', () => {
    for (const scriptId of confirmedCommunityScriptIds) {
      const pack = smartScriptPacks.find((candidate) => candidate.scriptId === scriptId)

      expect(pack?.knowledgeStatus, scriptId).toBe('confirmed')
    }

  })

  it('keeps every first-batch script usable for 7-15 player setup and night workflow', () => {
    for (const scriptId of firstBatchScriptIds) {
      const pack = smartScriptPacks.find((candidate) => candidate.scriptId === scriptId)

      expect(pack?.playerCounts, scriptId).toEqual([7, 8, 9, 10, 11, 12, 13, 14, 15])
      expect(pack?.setupTemplates.length, scriptId).toBeGreaterThanOrEqual(22)
      expect((pack?.nightOrders.firstNight.length ?? 0) + (pack?.nightOrders.otherNight.length ?? 0), scriptId)
        .toBeGreaterThan(0)
    }
  })
})
