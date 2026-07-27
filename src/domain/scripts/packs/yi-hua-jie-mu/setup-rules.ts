import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21265_94933.json"
const reviewedAt = "2026-07-22"

export const yiHuaJieMuSetupRules: readonly SetupRule[] = [
  { id: "villageidiot-count-setup", roleId: "villageidiot", summary: "Village Idiot can add 0-2 extra Village Idiots; if multiple, one Village Idiot is drunk.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "godfather-outsider-setup", roleId: "godfather", summary: "Godfather adds or removes one Outsider; templates using Godfather explicitly choose +1 Outsider.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "taotie-outsider-setup", roleId: "taotie", summary: "Taotie adds one Outsider and has multi-kill character-type condition; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "marionette-adjacent-demon", roleId: "marionette", summary: "Marionette must neighbor Demon and has false good identity; only use with ST-confirmed setup.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "qianke-target-redirect", roleId: "qianke", summary: "Qianke same-alignment pair can redirect later ability choices between those two players.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "banxian-evil-retarget", roleId: "banxian", summary: "Banxian retargets night choices that hit self toward another evil player.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shijie-global-retarget", roleId: "shijie", summary: "Shijie can redirect the first evil-targeting ability choice each night toward self.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "goon-drunk-alignment", roleId: "goon", summary: "Goon first chooser becomes drunk and Goon changes alignment; both are manual status changes.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gudiao-poison-registration", roleId: "gudiao", summary: "Gudiao marker poison and false registration are manual paths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "harpy-madness-death", roleId: "harpy", summary: "Harpy madness requirement and possible death penalty remain ST discretion.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "pukka-poison-death-chain", roleId: "pukka", summary: "Pukka rolling poison/death/recovery chain must be tracked manually.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "dianyuzhang-delayed-death", roleId: "dianyuzhang", summary: "Dianyuzhang previous choice and execution condition can create delayed deaths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "hundun-neighbor-poison", roleId: "hundun", summary: "Hundun kill can poison all good players if a neighboring Townsfolk dies.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "djinn-fabled-only", roleId: "djinn", summary: "Djinn is fabled-only and never appears in setup templates or demon bluffs.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
