import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21264_94932.json"
const reviewedAt = "2026-07-22"

export const manTangHongSetupRules: readonly SetupRule[] = [
  { id: "tixingguan-registration", roleId: "tixingguan", summary: "Tixingguan treats Outsiders as Minion or Demon roles for its role information; use ST-confirmed registration.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "yanshi-minion-swap", roleId: "yanshi", summary: "Yanshi night death can swap roles with a living Minion; identity changes remain manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "chongfei-rule-break", roleId: "chongfei", summary: "Chongfei authorizes one deliberate ST rule break about herself and then receives a private explanation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "cannibal-evil-poison", roleId: "cannibal", summary: "Cannibal gains last executed-dead ability; if that player is evil, Cannibal is poisoned until a good player dies by execution.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gossip-night-death", roleId: "gossip", summary: "True Gossip statement may cause one night death chosen by the Storyteller.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "slayer-demon-death", roleId: "slayer", summary: "Slayer public shot may kill a Demon; death remains ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gambler-wrong-guess-death", roleId: "gambler", summary: "Wrong Gambler character guess causes Gambler death; tool only drafts the result.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "rulianshi-demon-execution", roleId: "rulianshi", summary: "Rulianshi can become evil Demon after nominating and executing the Demon; loses ability at four or fewer living players.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "recluse-registration", roleId: "recluse", summary: "Recluse may register as evil, Minion, or Demon, even when dead.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "drunk-hidden-identity", roleId: "drunk", summary: "Drunk receives a false Townsfolk identity and must not be revealed through player projection.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "mutant-madness-execution", roleId: "mutant", summary: "Mutant madness execution is ST discretion and never automatic.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "niangjiushi-info-replacement", roleId: "niangjiushi", summary: "Niangjiushi replaces the next self-ability information for a chosen Townsfolk role with her provided information.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "godfather-outsider-setup", roleId: "godfather", summary: "Godfather adds or removes one Outsider and can kill after an Outsider dies during the day; templates avoid this setup path for now.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "pithag-demon-creation", roleId: "pithag", summary: "Pit-Hag can create a Demon; if that happens, deaths that night are storyteller-decided.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "assassin-unstoppable-death", roleId: "assassin", summary: "Assassin once-per-game night kill can bypass protection, but death remains ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "panguan-keyword-day-end", roleId: "panguan", summary: "Panguan keyword can end a non-final day when first spoken by an evil player; do not auto-advance phase.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "jianning-double-action", roleId: "jianning", summary: "Jianning can act twice at night if she did not vote today; availability and deaths remain ST-confirmed.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "lilmonsta-special-setup", roleId: "lilmonsta", summary: "Lil Monsta has no fixed Demon player and adds one Minion; excluded from first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "jiaohuazi-traveler-copy", roleId: "jiaohuazi", summary: "Jiaohuazi is a Traveler and may temporarily gain a non-Demon ability until dawn; not part of normal setup templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
