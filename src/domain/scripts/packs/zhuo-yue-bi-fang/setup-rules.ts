import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21096_69654.json"
const reviewedAt = '2026-07-21'

export const zhuoYueBiFangSetupRules: readonly SetupRule[] = [
  {
    id: "zhuo-yue-bi-fang-godfather-reminder",
    roleId: "godfather",
    summary: "Godfather may add or remove 1 Outsider and may get an extra kill after an Outsider dies by day.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "zhuo-yue-bi-fang-ganshiren-reminder",
    roleId: "ganshiren",
    summary: "Ganshiren removes 1 Outsider and changes first-death registration for adjacent Townsfolk.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "zhuo-yue-bi-fang-vigormortis-reminder",
    roleId: "vigormortis",
    summary: "Vigormortis removes 1 Outsider; Minions killed by it keep abilities and adjacent Townsfolk poison is manual.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "zhuo-yue-bi-fang-legion-reminder",
    roleId: "legion",
    summary: "Legion requires a majority-Legion setup and vote-validity reminders; not used in normal templates.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "zhuo-yue-bi-fang-dianyuzhang-reminder",
    roleId: "dianyuzhang",
    summary: "Dianyuzhang chooses one to three players and creates delayed death pressure tied to tomorrow execution.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "zhuo-yue-bi-fang-harpy-reminder",
    roleId: "harpy",
    summary: "Harpy madness and possible deaths are reminders only; do not auto-punish or kill.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
  {
    id: "zhuo-yue-bi-fang-mastermind-reminder",
    roleId: "mastermind",
    summary: "Mastermind extra day and win/loss consequences must be announced and confirmed by the Storyteller.",
    knowledgeStatus: 'confirmed',
    sourceUrls: [sourceUrl],
    reviewedAt,
  },
]
