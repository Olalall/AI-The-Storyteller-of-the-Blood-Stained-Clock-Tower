import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21266_81492.json"
const reviewedAt = "2026-07-22"

export const huYanLuanYuSetupRules: readonly SetupRule[] = [
  { id: "villageidiot-count-setup", roleId: "villageidiot", summary: "Village Idiot can add 0-2 extra Village Idiots; if multiple, one Village Idiot is drunk.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "fanggu-outsider-setup", roleId: "fanggu", summary: "Fang Gu adds one Outsider and can jump to an Outsider; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "marionette-adjacent-demon", roleId: "marionette", summary: "Marionette must neighbor Demon and has false good identity; only use with ST-confirmed setup.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "poppygrower-evil-info", roleId: "poppygrower", summary: "Poppy Grower blocks evil starting information until death; evil info reveal is manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "cerenovus-madness", roleId: "cerenovus", summary: "Cerenovus madness target and character require private wording and ST-confirmed execution.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gambler-wrong-guess-death", roleId: "gambler", summary: "Gambler wrong guess can kill self; AI may compare known role but ST confirms exceptions.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "yaggababble-secret-phrase", roleId: "yaggababble", summary: "Yaggababble phrase count can allow night deaths; track phrase count manually.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "nodashii-neighbor-poison", roleId: "nodashii", summary: "No Dashii poisons nearest Townsfolk neighbors and chooses deaths; no automatic status changes.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "scarletwoman-demon-pass", roleId: "scarletwoman", summary: "Scarlet Woman can become Demon if Demon dies with five or more players alive.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "bianlianshi-gained-ability", roleId: "bianlianshi", summary: "Bianlianshi madness may gain a good character ability until next dusk; does not change character.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "courtier-drunk-duration", roleId: "courtier", summary: "Courtier chosen character is drunk for three nights and days; duration is manually tracked.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gossip-true-statement-death", roleId: "gossip", summary: "True Gossip statement can create an extra night death; target is ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "golem-first-nomination", roleId: "golem", summary: "Golem first nomination can kill a non-Demon and then cannot nominate again.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "dianyuzhang-custom-demon", roleId: "dianyuzhang", summary: "Dianyuzhang custom demon effects stay as AI/ST reminders, never automatic.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
