import type { SetupRule } from '../../types'

const sourceUrls = [
  "https://release.botc.app/resources/data/roles.json",
  "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21179_35934.json",
]

export const siDongFeiDongSetupRules: readonly SetupRule[] = [
  { id: "bounty-hunter-evil-townsfolk", roleId: "bountyhunter", summary: "Bounty Hunter makes one Townsfolk evil (no Outsider count change); current templates avoid automatic use.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "balloonist-outsider", roleId: "balloonist", summary: "Balloonist can add one Outsider; templates avoid automatic adjustment unless storyteller chooses it.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "godfather-outsider", roleId: "godfather", summary: "Godfather can modify Outsider count and has a death trigger; templates avoid automatic adjustment.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "barber-swap", roleId: "barber", summary: "Barber death can allow Demon to swap two characters; identity changes are confirmation-only.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "moonchild-death", roleId: "moonchild", summary: "Moonchild death choice can kill a good player that night; source and target must be confirmed.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "pukka-poison-death", roleId: "pukka", summary: "Pukka poison and delayed death must be tracked manually.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "no-dashii-neighbor-poison", roleId: "nodashii", summary: "No Dashii poisons Townsfolk neighbors; seating and current role snapshot must be checked manually.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
]
