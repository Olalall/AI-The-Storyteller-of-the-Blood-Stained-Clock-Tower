import { describe, expect, it } from 'vitest'
import { aGrimmChorusSmartScriptPack } from '../scripts/packs/a-grimm-chorus'
import { badMoonRisingSmartScriptPack } from '../scripts/packs/bad-moon-rising'
import { catfishingSmartScriptPack } from '../scripts/packs/catfishing'
import { churchOfSpiesSmartScriptPack } from '../scripts/packs/church-of-spies'
import { hideAndSeekSmartScriptPack } from '../scripts/packs/hide-and-seek'
import { insanityAndIntuitionSmartScriptPack } from '../scripts/packs/insanity-and-intuition'
import { lunarEclipseSmartScriptPack } from '../scripts/packs/lunar-eclipse'
import { oneInOneOutSmartScriptPack } from '../scripts/packs/one-in-one-out'
import { devoutTheistsSmartScriptPack } from '../scripts/packs/devout-theists'
import { everyoneCanPlaySmartScriptPack } from '../scripts/packs/everyone-can-play'
import { punchySmartScriptPack } from '../scripts/packs/punchy'
import { quickMathsSmartScriptPack } from '../scripts/packs/quick-maths'
import { sectsAndVioletsSmartScriptPack } from '../scripts/packs/sects-and-violets'
import { troubleBrewingSmartScriptPack } from '../scripts/packs/trouble-brewing'
import { uncertainDeathSmartScriptPack } from '../scripts/packs/uncertain-death'
import { baseCompositionForPlayerCount, validateTemplateComposition } from './composition'

describe('setup template composition validation', () => {
  it('uses Blood on the Clocktower base counts for 7, 12, and 15 players', () => {
    expect(baseCompositionForPlayerCount(7)).toEqual({ townsfolk: 5, outsider: 0, minion: 1, demon: 1 })
    expect(baseCompositionForPlayerCount(12)).toEqual({ townsfolk: 7, outsider: 2, minion: 2, demon: 1 })
    expect(baseCompositionForPlayerCount(15)).toEqual({ townsfolk: 9, outsider: 2, minion: 3, demon: 1 })
  })

  it('keeps every verified Catfishing template composition-valid after setup adjustments', () => {
    const checks = catfishingSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(catfishingSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('catfishing-12-reversal-prototype')
  })


  it('keeps every verified Bad Moon Rising template composition-valid after setup adjustments', () => {
    const checks = badMoonRisingSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(badMoonRisingSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('bad-moon-rising-15-max-zombuul')
  })


  it('keeps every verified Sects & Violets template composition-valid after setup adjustments', () => {
    const checks = sectsAndVioletsSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(sectsAndVioletsSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('sects-and-violets-15-max-fanggu')
  })

  it('keeps every verified Trouble Brewing template composition-valid after setup adjustments', () => {
    const checks = troubleBrewingSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(troubleBrewingSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('trouble-brewing-15-baron-max')
  })

  it('keeps every verified One in one out template composition-valid after setup adjustments', () => {
    const checks = oneInOneOutSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(oneInOneOutSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('one-in-one-out-15-fifteen-fanggu-max')
  })

  it('keeps every verified A Grimm Chorus template composition-valid after setup adjustments', () => {
    const checks = aGrimmChorusSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(aGrimmChorusSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('a-grimm-chorus-15-fifteen-summoner')
  })

  it('keeps every verified Hide & Seek template composition-valid after setup adjustments', () => {
    const checks = hideAndSeekSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(hideAndSeekSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('hide-and-seek-15-fifteen-vigormortis-hunt')
  })

  it('keeps every verified Lunar Eclipse template composition-valid after setup adjustments', () => {
    const checks = lunarEclipseSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(lunarEclipseSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('lunar-eclipse-15-fifteen-vigormortis')
  })

  it('keeps every verified Punchy template composition-valid after setup adjustments', () => {
    const checks = punchySmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(punchySmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('punchy-15-fifteen-vigor')
  })

  it('keeps every verified Quick Maths template composition-valid after setup adjustments', () => {
    const checks = quickMathsSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(quickMathsSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('quick-maths-15-xaan-two-large')
  })

  it('keeps every verified Devout Theists template composition-valid after setup adjustments', () => {
    const checks = devoutTheistsSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(devoutTheistsSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('devout-theists-15-kazali-magician')
  })

  it('keeps every verified Everyone Can Play template composition-valid after setup adjustments', () => {
    const checks = everyoneCanPlaySmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(everyoneCanPlaySmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('everyone-can-play-15-fifteen-baron')
  })

  it('keeps every verified Uncertain Death template composition-valid after setup adjustments', () => {
    const checks = uncertainDeathSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(uncertainDeathSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('uncertain-death-15-godfather-plus-fifteen')
  })

  it('keeps every verified Church of Spies template composition-valid after setup adjustments', () => {
    const checks = churchOfSpiesSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(churchOfSpiesSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('church-of-spies-15-baron-fifteen')
  })

  it('keeps every verified Insanity and Intuition template composition-valid after setup adjustments', () => {
    const checks = insanityAndIntuitionSmartScriptPack.setupTemplates.map((template) =>
      validateTemplateComposition(insanityAndIntuitionSmartScriptPack, template),
    )

    expect(checks.every((check) => check.valid)).toBe(true)
    expect(checks.map((check) => check.templateId)).toContain('insanity-and-intuition-15-fanggu-fifteen')
  })
})
