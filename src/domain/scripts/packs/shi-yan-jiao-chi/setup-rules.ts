import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21531_71622.json"
const reviewedAt = '2026-07-22'

export const shiYanJiaoChiSetupRules: readonly SetupRule[] = [
  { id: 'godfather-outsider', roleId: 'godfather', summary: 'Godfather may add or remove 1 Outsider; templates using it must carry explicit count adjustment.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'summoner-no-demon', roleId: 'summoner', summary: 'Summoner starts with no Demon in play and creates an evil Demon on night three.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'taotie-extra-outsider', roleId: 'taotie', summary: 'Taotie adds 1 Outsider; first normal templates keep this path as a reminder only.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'snakecharmer-swap', roleId: 'snakecharmer', summary: 'Snake Charmer hitting Demon swaps role and alignment; old Demon becomes poisoned new Snake Charmer.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'qianke-retarget', roleId: 'qianke', summary: 'Qianke may redirect later choices between two same-alignment living targets; ST must resolve manually.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'source-duplicate-cannibal', summary: 'Source JSON lists Cannibal twice; this smart pack collapses it to stable roleId cannibal.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
