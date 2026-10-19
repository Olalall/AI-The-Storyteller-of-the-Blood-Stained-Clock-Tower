import type { StorytellerRegistrationValue, WakeDraft, WakeRegistrationSpec } from '../types'

interface WakeRegistrationFieldsProps {
  spec: WakeRegistrationSpec
  draft: WakeDraft
  forbiddenValues?: readonly StorytellerRegistrationValue[]
  disabled: boolean
  onChange: (value: StorytellerRegistrationValue) => void
}

export function WakeRegistrationFields({ spec, draft, forbiddenValues = [], disabled, onChange }: WakeRegistrationFieldsProps) {
  return <fieldset disabled={disabled}>
    <legend className="choice-legend">
      <span>{spec.label}</span>
      <small>由说书人按本夜实际展示明确登记</small>
    </legend>
    <div className="choice-chips">
      {spec.choices.map((choice) => <button
        key={choice.id}
        type="button"
        className={draft.registration?.value === choice.id ? 'choice-chip choice-chip--selected' : 'choice-chip'}
        aria-pressed={draft.registration?.value === choice.id}
        disabled={forbiddenValues.includes(choice.id as StorytellerRegistrationValue)}
        onClick={() => onChange(choice.id as StorytellerRegistrationValue)}
      >{choice.label}</button>)}
    </div>
  </fieldset>
}
