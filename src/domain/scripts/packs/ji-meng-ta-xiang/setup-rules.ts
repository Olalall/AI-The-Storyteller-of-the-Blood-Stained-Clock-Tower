import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21263_10294.json"
const reviewedAt = "2026-07-22"

export const jiMengTaXiangSetupRules: readonly SetupRule[] = [
  { id: "villageidiot-count-setup", roleId: "villageidiot", summary: "Village Idiot can add 0-2 extra copies and one is drunk if multiple; excluded from first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "dianxiaoer-drunk-good", roleId: "dianxiaoer", summary: "Dianxiaoer names two good players and one is drunk even if Dianxiaoer is dead; track drunk manually.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "exorcist-demon-block", roleId: "exorcist", summary: "Exorcist can stop the Demon from waking due to its own ability; do not auto-skip without ST confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gossip-night-death", roleId: "gossip", summary: "True Gossip statement may cause one night death chosen by the Storyteller.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "geling-demon-audience-death", roleId: "geling", summary: "If Demon attends Geling performance, Geling dies that night; audience list and death are manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "nichen-execution-alignment", roleId: "nichen", summary: "Nichen linked execution death may turn the other linked player evil; alignment remains manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "acrobat-poison-drunk-death", roleId: "acrobat", summary: "Acrobat may die if a living good neighbor is drunk or poisoned; death is ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "plaguedoctor-st-minion-ability", roleId: "plaguedoctor", summary: "When Plague Doctor dies, ST gains a Minion ability (in-play or out-of-play, ST's choice); not a player state mutation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "barber-death-swap", roleId: "barber", summary: "Barber death can allow Demon to swap two characters that night (not another Demon; the acting Demon may choose itself); identity changes are manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gudiao-poison-registration", roleId: "gudiao", summary: "Gudiao marker poisons the next living Townsfolk clockwise, who may register as the evil Gudiao until dusk; marker/status are manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "cerenovus-madness-execution", roleId: "cerenovus", summary: "Cerenovus madness and possible execution remain ST discretion.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "ganshiren-outsider-setup", roleId: "ganshiren", summary: "Ganshiren reduces Outsider count by one and has fake-alive neighbor handling; excluded from first templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "jianning-double-action", roleId: "jianning", summary: "Jianning kills nightly; on the night a Minion dies (by any cause), that Minion chooses a player who dies if good. Availability and deaths remain ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "hundun-mass-poison", roleId: "hundun", summary: "Hundun killing neighboring Townsfolk poisons all good players except Travellers until next dusk; status remains manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "dianyuzhang-delayed-death", roleId: "dianyuzhang", summary: "Dianyuzhang choices may cause delayed or immediate death; track previous selections manually.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "djinn-fabled-only", roleId: "djinn", summary: "Djinn jinxes are public fabled rules and not part of normal setup templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "kazali-special-setup", roleId: "kazali", summary: "Kazali chooses Minions and may change Outsider count; excluded from first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
