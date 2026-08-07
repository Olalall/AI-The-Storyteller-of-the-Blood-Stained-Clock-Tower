import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21091_69606.json"
const reviewedAt = '2026-07-21'

export const yeMuJiangLinSetupRules: readonly SetupRule[] = [
  {
    id: "ye-mu-jiang-lin-alchemist-setup",
    roleId: "alchemist",
    summary: "If the Alchemist's gained Minion ability adds or removes characters during setup (e.g. Godfather's Outsider change), that effect applies during setup.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-godfather-reminder",
    roleId: "godfather",
    summary: "Godfather can add or remove 1 Outsider and may get an extra night kill after an Outsider dies by day.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-scarletwoman-reminder",
    roleId: "scarletwoman",
    summary: "Scarlet Woman demon replacement is identity/demon continuity reminder only; no automatic role change.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-devilsadvocate-reminder",
    roleId: "devilsadvocate",
    summary: "Devils Advocate protects from execution death only after storyteller confirms the selected player.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-vortox-reminder",
    roleId: "vortox",
    summary: "Vortox false information and no-execution loss must be storyteller-confirmed, not auto-judged.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-psychopath-reminder",
    roleId: "psychopath",
    summary: "Psychopath daytime kill and roshambo death are manual public events.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-assassin-reminder",
    roleId: "assassin",
    summary: "Assassin may kill despite protection, but death is still a confirmed result draft.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-mutant-reminder",
    roleId: "mutant",
    summary: "Mutant madness execution is optional storyteller pressure, never automatic.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "ye-mu-jiang-lin-klutz-reminder",
    roleId: "klutz",
    summary: "Klutz public choice and win/loss consequence must be manually confirmed.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
]
