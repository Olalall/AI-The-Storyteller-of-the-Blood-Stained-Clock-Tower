import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21529_04125.json"
const reviewedAt = '2026-07-22'

export const wuYinCangShengSetupRules: readonly SetupRule[] = [
  { id: 'kazali-minion-outsider-setup', roleId: 'kazali', summary: 'Kazali assigns Minions and may add or remove any number of Outsiders; keep out of first normal templates.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'pithag-demon-creation', roleId: 'pithag', summary: 'Pit-Hag can create a Demon; if that happens, deaths that night are storyteller-decided.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'barber-demon-swap', roleId: 'barber', summary: 'Barber death lets Demon swap two non-Demon players roles that night.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'mezepheles-keyword', roleId: 'mezepheles', summary: 'Mezepheles keyword can turn the first good speaker evil at night.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'rulianshi-demon-execution', roleId: 'rulianshi', summary: 'Rulianshi can become evil Demon after nominating and executing the Demon; loses ability at four or fewer living players.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: 'spirit-ivory-evil-cap', roleId: 'spiritofivory', summary: 'Spirit of Ivory limits evil count growth to at most one above setup count; fabled reminder only.', knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
