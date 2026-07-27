import type { SetupRule } from '../../types'

const sourceUrl = "https://oss.gstonegames.com/data_file/clocktower/json/ct_edition_21286_26817.json"
const reviewedAt = '2026-07-21'

export const shiSanHangSetupRules: readonly SetupRule[] = [
  { id: "shi-san-hang-grandmother", roleId: "grandmother", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-sailor", roleId: "sailor", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-cannibal", roleId: "cannibal", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-yinluren", roleId: "yinluren", summary: "Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-preacher", roleId: "preacher", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-daoshi", roleId: "daoshi", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.; Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-simin", roleId: "simin", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.; Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-gossip", roleId: "gossip", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-fisherman", roleId: "fisherman", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-yishi", roleId: "yishi", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.; Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-banxian", roleId: "banxian", summary: "Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-heshang", roleId: "heshang", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.; Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-acrobat", roleId: "acrobat", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-goon", roleId: "goon", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-tinker", roleId: "tinker", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-damsel", roleId: "damsel", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-devilsadvocate", roleId: "devilsadvocate", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-huapi", roleId: "huapi", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.; Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-poisoner", roleId: "poisoner", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-godfather", roleId: "godfather", summary: "教父 has setup or composition impact; Storyteller confirms before play.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-pukka", roleId: "pukka", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-imp", roleId: "imp", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-taotie", roleId: "taotie", summary: "饕餮 has setup or composition impact; Storyteller confirms before play.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
  { id: "shi-san-hang-dianyuzhang", roleId: "dianyuzhang", summary: "Draft reminder only; authoritative state changes require explicit Storyteller confirmation.; Custom role from this script source; recheck against the source text before hosting.", knowledgeStatus: 'confirmed', sourceUrls: [sourceUrl], reviewedAt },
]
