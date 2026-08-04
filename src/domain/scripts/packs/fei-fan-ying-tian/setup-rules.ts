import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_20783_90331.json"
const reviewedAt = '2026-07-22'

export const feiFanYingTianSetupRules: readonly SetupRule[] = [
  { id: "bountyhunter-evil-townsfolk", roleId: "bountyhunter", summary: "Bounty Hunter adds one evil Townsfolk; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "fanggu-plus-outsider", roleId: "fanggu", summary: "Fang Gu adds 1 Outsider and can transform first killed Outsider.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "godfather-outsider-delta", roleId: "godfather", summary: "Godfather may add or remove 1 Outsider; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "huntsman-adds-damsel", roleId: "huntsman", summary: "Huntsman adds the Damsel and can transform her into an out-of-play Townsfolk.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "alchemist-minion-ability", roleId: "alchemist", summary: "Alchemist receives a Minion ability (usually out-of-play); if it changes setup (e.g. Baron), it applies at setup; effects remain ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "philosopher-drunk-role", roleId: "philosopher", summary: "Philosopher ability gain and drunkenness require manual confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "po-charge-kill", roleId: "po", summary: "Po no-kill choice can enable a three-kill night; previous choice must be recorded.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "zombuul-death-registration", roleId: "zombuul", summary: "Zombuul wake and fake-death registration depend on confirmed daytime deaths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "psychopath-day-kill", roleId: "psychopath", summary: "Psychopath day kill and roshambo execution survival are manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "devilsadvocate-execution-protection", roleId: "devilsadvocate", summary: "Devil's Advocate protects a living target from execution death tomorrow.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "harpy-madness-death", roleId: "harpy", summary: "Harpy madness and possible death penalty are ST discretion.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "damsel-minion-guess-loss", roleId: "damsel", summary: "Damsel minion guess can lose the game; win/loss is storyteller-declared.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "puzzlemaster-drunk-guess", roleId: "puzzlemaster", summary: "Puzzlemaster drunk player and once-per-game guess result remain manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "sailor-innkeeper-drunk-safe", roleId: "sailor", summary: "Sailor/Innkeeper drunkenness and death prevention are manual state paths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
