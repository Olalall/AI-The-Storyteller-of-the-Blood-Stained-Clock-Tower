import type { SetupRule } from '../../types'

const sourceUrls = [
  "https://release.botc.app/resources/data/roles.json",
  "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21137_23248.json",
]

export const wuHeYouZhiXiangSetupRules: readonly SetupRule[] = [
  { id: "kazali-minion-choice", roleId: "kazali", summary: "Kazali chooses in-play Minions on the first night; outsider count stays at base count unless storyteller changes it.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "legion-special-setup", roleId: "legion", summary: "Legion uses a special most-players-are-Legion setup and is not auto-used by normal templates.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "village-idiot-extra", roleId: "villageidiot", summary: "Village Idiot may add extra Village Idiots, with one extra drunk; current templates use one Village Idiot.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "poppy-grower-evil-hidden", roleId: "poppygrower", summary: "Poppy Grower hides evil team recognition until Poppy Grower dies.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "drunk-false-identity", roleId: "drunk", summary: "Drunk sees a Townsfolk identity but is truly the Drunk; player projection and storyteller check are separate.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "hatter-change-window", roleId: "hatter", summary: "After Hatter death, evil players may choose new same-type characters; never batch-change identities automatically.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "plague-doctor-storyteller-minion", roleId: "plaguedoctor", summary: "When Plague Doctor dies, the Storyteller gains a Minion ability (usually out-of-play, but may be an in-play Minion's ability) — reminder only.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
  { id: "politician-endgame", roleId: "politician", summary: "Politician responsibility and win change are endgame judgment candidates only.", knowledgeStatus: 'confirmed', sourceUrls, reviewedAt: "2026-07-21" },
]
