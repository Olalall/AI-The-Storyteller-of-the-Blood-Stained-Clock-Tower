import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21086_69601.json"
const reviewedAt = '2026-07-21'

export const chouHaiNiXingSetupRules: readonly SetupRule[] = [
  {
    id: "chou-hai-ni-xing-balloonist-reminder",
    roleId: "balloonist",
    summary: "Balloonist may add +0 or +1 Outsider (storyteller decides at setup); excluded from first verified templates to keep base composition simple.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-baron-reminder",
    roleId: "baron",
    summary: "Baron adds 2 Outsiders; excluded from first verified templates to avoid implicit composition shifts.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-atheist-reminder",
    roleId: "atheist",
    summary: "Atheist has no evil characters and allows rule-breaking; this tool does not auto-build no-evil games.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-marionette-reminder",
    roleId: "marionette",
    summary: "Marionette must be adjacent to the Demon and thinks they are a good role; excluded from first templates.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-damsel-reminder",
    roleId: "damsel",
    summary: "Damsel is known to Minions and may lose by public guess; hidden information remains manual.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-snakecharmer-reminder",
    roleId: "snakecharmer",
    summary: "Snake Charmer demon hit swaps role and alignment; new Snake Charmer poisoned, all manually confirmed.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-leviathan-reminder",
    roleId: "leviathan",
    summary: "Leviathan is public and changes execution/victory pressure; do not auto-declare win/loss.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "chou-hai-ni-xing-pithag-reminder",
    roleId: "pithag",
    summary: "Pit-Hag role changes and Demon creation produce storyteller-chosen death outcomes only after confirmation.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
]
