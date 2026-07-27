import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21271_25016.json"
const reviewedAt = '2026-07-22'

export const jiuQuanSongGeSetupRules: readonly SetupRule[] = [
  { id: "godfather-outsider-setup", roleId: "godfather", summary: "Godfather may add/remove one Outsider and can kill after Outsider day death; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "taotie-outsider-setup", roleId: "taotie", summary: "Taotie adds one Outsider and has multi-kill character-type condition; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "marionette-adjacent-demon", roleId: "marionette", summary: "Marionette must neighbor Demon and has false good identity; only use with ST-confirmed setup.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "yanluo-delayed-death", roleId: "yanluo", summary: "Yanluo view/selection and rolling delayed death chain are manual reminders.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "limao-swap-drunk", roleId: "limao", summary: "Limao night death trigger can swap characters and make self drunk; never automatic.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "barber-demon-swap", roleId: "barber", summary: "Barber death can allow Demon to swap two non-Demon characters that night.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gudiao-poison-registration", roleId: "gudiao", summary: "Gudiao marker poison and false registration are manual paths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "jinweijun2-madness-execution", roleId: "jinweijun2", summary: "Jinweijun II chosen living/dead madness pressure can lead to immediate execution.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "po-charge-three-kill", roleId: "po", summary: "Po charge state and three-kill night must be explicitly tracked.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "aohe-absent-role-kill", roleId: "aohe", summary: "Aohe role choice may kill role holder or storyteller-chosen fallback if absent.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "dagengren-distance-prevention", roleId: "dagengren", summary: "Dagengren distance guess can prevent deaths and maybe kill self; timing-sensitive.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "politician-team-change", roleId: "politician", summary: "Politician alignment/win judgment is endgame ST discretion only.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
