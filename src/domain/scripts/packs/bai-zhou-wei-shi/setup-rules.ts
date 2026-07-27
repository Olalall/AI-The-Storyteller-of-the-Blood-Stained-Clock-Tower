import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21285_26731.json"
const reviewedAt = '2026-07-22'

export const baiZhouWeiShiSetupRules: readonly SetupRule[] = [
  { id: "atheist-special-setup", roleId: "atheist", summary: "Atheist means no evil characters and ST can break rules; keep out of normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "kazali-minion-outsider-setup", roleId: "kazali", summary: "Kazali assigns Minions and may add/remove Outsiders; keep out of first normal templates.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "mezepheles-keyword-evil", roleId: "mezepheles", summary: "Mezepheles keyword can turn first good speaker evil that night.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "scarletwoman-demon-pass", roleId: "scarletwoman", summary: "Scarlet Woman can become the Demon if Demon dies with five or more alive.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "jinyiwei-replacement-death", roleId: "jinyiwei", summary: "Jinyiwei may die instead of protected target before next dusk.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "gudiao-poison-registration", roleId: "gudiao", summary: "Gudiao poison and evil/Minion registration are marker-driven manual paths.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "hundun-mass-poison", roleId: "hundun", summary: "Hundun killing neighboring Townsfolk can poison all good players until next dusk.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "yaggababble-secret-phrase", roleId: "yaggababble", summary: "Yaggababble phrase count and deaths are manually recorded, never audio-detected.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "chiren-madness-loss", roleId: "chiren", summary: "Chiren madness and loss condition are ST discretion.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "golem-nomination-death", roleId: "golem", summary: "Golem once-only nomination and non-Demon death are manual.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "daoke-minion-shot", roleId: "daoke", summary: "Daoke learns an in-play Minion and can make one public shot against that role.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "chongfei-rule-break", roleId: "chongfei", summary: "Chongfei rule break is ST-authored and then privately explained.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
