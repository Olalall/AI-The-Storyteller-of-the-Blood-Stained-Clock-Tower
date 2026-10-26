import { getSmartScriptPack } from '../../domain/scripts'
import type { SetupDraft } from '../game-session/types'
import { createSetupRulePackForScript } from './smartScriptSetupCandidates'
import { selectSetupRuleChoice } from './setupDraft'

export function SetupModifierChoices({ scriptId, draft, disabled, onChange }: {
  scriptId: string; draft: SetupDraft; disabled: boolean; onChange: (draft: SetupDraft) => void
}) {
  const sourceIds = new Set([...draft.assignments.map(a => a.role.id), ...(draft.openingChoices ?? []).filter(c => c.roleId === 'alchemist').flatMap(c => c.chosenRoleId ? [c.chosenRoleId] : [])])
  const modifiers = createSetupRulePackForScript(getSmartScriptPack(scriptId)).modifiers.filter(m => sourceIds.has(m.roleId))
  if (!modifiers.length) return null
  return <div className="setup-opening">{modifiers.map(m => <label key={m.id}>{m.label}
    {sourceIds.has('alchemist') && draft.openingChoices?.some(c => c.roleId === 'alchemist' && c.chosenRoleId === m.roleId) ? <small>包含炼金能力的开局修正；若有多个相同来源，此选项对各来源分别生效。</small> : null}
    <select disabled={disabled} value={draft.setupRuleSelections?.find(s => s.ruleId === m.id)?.choiceId ?? ''} onChange={e => onChange(selectSetupRuleChoice(draft, m.id, e.target.value, new Date().toISOString()))}>
      <option value="">请选择人数修正</option>{m.choices.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
    </select>
  </label>)}</div>
}
