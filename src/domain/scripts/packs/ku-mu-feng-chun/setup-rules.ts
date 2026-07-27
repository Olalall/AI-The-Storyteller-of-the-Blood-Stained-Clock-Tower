import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21365_21069.json"
const reviewedAt = '2026-07-22'

export const kuMuFengChunSetupRules: readonly SetupRule[] = [
  { id: "kazali-minion-outsider-setup", roleId: "kazali", summary: "Kazali assigns Minions and may add or remove Outsiders; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "vigormortis-minus-outsider", roleId: "vigormortis", summary: "Vigormortis removes 1 Outsider; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "snakecharmer-swap", roleId: "snakecharmer", summary: "Snake Charmer demon hit swaps character and alignment; new Snake Charmer is poisoned.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "pithag-character-change", roleId: "pithag", summary: "Pit-Hag can change a target into an out-of-play character; Demon creation affects night deaths by ST choice.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "barber-demon-swap", roleId: "barber", summary: "Barber death may let the Demon swap two non-Demon characters.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "harpy-madness-death", roleId: "harpy", summary: "Harpy creates a madness requirement and possible death penalty; ST discretion only.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "witch-nomination-death", roleId: "witch", summary: "Witch target may die on nomination; ability switches off with three living players.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "poisoner-poison-window", roleId: "poisoner", summary: "Poisoner target is poisoned tonight and tomorrow day.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "banshee-demon-kill-trigger", roleId: "banshee", summary: "Banshee only triggers when killed by the Demon and changes nomination/vote capacity manually.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "klutz-loss-choice", roleId: "klutz", summary: "Klutz public death choice can lose the game; win/loss is never automatic.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "recluse-registration", roleId: "recluse", summary: "Recluse may register as evil, Minion or Demon even dead; do not alter true team.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "philosopher-drunk-role", roleId: "philosopher", summary: "Philosopher gained ability and drunkness are manual confirmation paths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
