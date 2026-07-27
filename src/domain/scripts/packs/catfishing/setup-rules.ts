import type { SetupRule } from '../../types'

export const catfishingSetupRules = [
  {
    "id": "balloonist-outsider",
    "roleId": "balloonist",
    "summary": "Balloonist: setup may add +0 or +1 Outsider; template/storyteller must choose one.",
    "knowledgeStatus": "confirmed",
    "sourceUrls": [
      "https://release.botc.app/resources/data/roles.json"
    ],
    "reviewedAt": "2026-07-19"
  },
  {
    "id": "godfather-outsider",
    "roleId": "godfather",
    "summary": "Godfather: setup may remove 1 Outsider or add 1 Outsider; starts knowing in-play Outsiders.",
    "knowledgeStatus": "confirmed",
    "sourceUrls": [
      "https://release.botc.app/resources/data/roles.json"
    ],
    "reviewedAt": "2026-07-19"
  },
  {
    "id": "vigormortis-outsider",
    "roleId": "vigormortis",
    "summary": "Vigormortis: setup removes 1 Outsider.",
    "knowledgeStatus": "confirmed",
    "sourceUrls": [
      "https://release.botc.app/resources/data/roles.json"
    ],
    "reviewedAt": "2026-07-19"
  },
  {
    "id": "fanggu-outsider",
    "roleId": "fanggu",
    "summary": "Fang Gu: setup adds 1 Outsider.",
    "knowledgeStatus": "confirmed",
    "sourceUrls": [
      "https://release.botc.app/resources/data/roles.json"
    ],
    "reviewedAt": "2026-07-19"
  },
  {
    "id": "drunk-cover",
    "roleId": "drunk",
    "summary": "Drunk: needs a Townsfolk cover identity; the player does not know they are the Drunk.",
    "knowledgeStatus": "confirmed",
    "sourceUrls": [
      "https://release.botc.app/resources/data/roles.json"
    ],
    "reviewedAt": "2026-07-19"
  }
] as const satisfies readonly SetupRule[]
