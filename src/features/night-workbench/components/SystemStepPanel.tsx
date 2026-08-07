/**
 * 首夜系统步骤（爪牙互认、恶魔获知）的名单与逐项确认。
 *
 * 从 CurrentWakeCard 拆出来的原因不只是行数：这两块只在系统步骤出现，
 * 而 CurrentWakeCard 的其余部分是所有唤醒项共用的。混在一起时，
 * 改一个普通角色的唤醒卡要先跳过一百行与它无关的系统步骤分支。
 */
import { Check, ListChecks } from 'lucide-react'
import { StatusBadge } from '../../../components/ui/StatusBadge'
import { systemStepBluffs, systemStepChecks } from '../state/systemSteps'
import type { SystemStepSpec, WakeDraft } from '../types'

/** 首夜系统步骤的只读名单。名单不可点，多座位指认只在下方留勾选痕迹。 */
export function SystemStepRoster({ step }: { step: SystemStepSpec }) {
  if (step.recipientLabels) {
    return (
      <section className="system-step-roster" aria-label="本步骤名单">
        <strong>名单</strong>
        <dl>
          <div>
            <dt>{step.audienceLabel ?? '接收者'}</dt>
            <dd>{step.recipientLabels.length ? step.recipientLabels.join(' / ') : '无 · 本步骤无需通知'}</dd>
          </div>
        </dl>
        <StatusBadge tone="neutral">只读 · 不自动结算</StatusBadge>
      </section>
    )
  }
  return (
    <section className="system-step-roster" aria-label="本步骤名单">
      <strong>名单</strong>
      <dl>
        <div>
          <dt>爪牙</dt>
          <dd>{step.minionLabels.join(' / ')}</dd>
        </div>
        <div>
          <dt>恶魔</dt>
          <dd>{step.demonLabel}</dd>
        </div>
      </dl>
      <StatusBadge tone="neutral">只读 · 不自动结算</StatusBadge>
    </section>
  )
}

export function SystemStepFields({
  step,
  draft,
  disabled,
  onToggleCheck,
  onToggleBluff,
}: {
  step: SystemStepSpec
  draft: WakeDraft
  disabled: boolean
  onToggleCheck: (checkId: string) => void
  onToggleBluff: (roleId: string) => void
}) {
  const checked = systemStepChecks(draft)
  const bluffs = systemStepBluffs(draft)

  return (
    <>
      <fieldset disabled={disabled}>
        <legend className="choice-legend">
          <span>逐项确认</span>
          <small>勾选后才能记录本步骤</small>
        </legend>
        <ul className="system-step-checks">
          {step.checks.map((check) => (
            <li key={check.id}>
              <label className="system-step-check">
                <input
                  type="checkbox"
                  checked={checked.includes(check.id)}
                  onChange={() => onToggleCheck(check.id)}
                />
                <span>{check.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {step.bluffChoices && step.bluffCount ? (
        <fieldset disabled={disabled}>
          <legend className="choice-legend">
            <span>不在场善良角色</span>
            <small>{bluffs.length}/{step.bluffCount} · 建议两镇民一外来者 · 仅记录不校验</small>
          </legend>
          <div className="choice-chips">
            {step.bluffChoices.map((role) => {
              const selected = bluffs.includes(role.id)
              return (
                <button
                  key={role.id}
                  type="button"
                  className={selected ? 'choice-chip choice-chip--selected' : 'choice-chip'}
                  onClick={() => onToggleBluff(role.id)}
                  aria-pressed={selected}
                  aria-label={`${role.label}（${role.teamLabel}${role.suggested ? ' · 配板预设' : ''}）${selected ? '，已选' : ''}`}
                >
                  {selected ? <Check aria-hidden="true" /> : null}
                  <span>{role.label}</span>
                  <small>{role.teamLabel}{role.suggested ? ' · 预设' : ''}</small>
                </button>
              )
            })}
          </div>
          {bluffs.length === step.bluffCount ? (
            <p className="system-step-bluff-summary">
              <ListChecks aria-hidden="true" />
              本夜给出：{bluffs.map((id) => step.bluffChoices?.find((role) => role.id === id)?.label ?? id).join('、')}
            </p>
          ) : null}
        </fieldset>
      ) : null}
    </>
  )
}
