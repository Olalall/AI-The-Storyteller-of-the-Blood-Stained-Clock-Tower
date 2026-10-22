import type { WakeDraft, WakeItem } from '../types'

interface Props {
  item: WakeItem
  draft: WakeDraft
  disabled: boolean
  onRoleChoice: (roleId: string) => void
  onSecondRoleChoice: (roleId: string) => void
  onAdditionalRoleChoice?: (index: 0 | 1, roleId: string) => void
}

export function NightRoleChoices({ item, draft, disabled, onRoleChoice, onSecondRoleChoice, onAdditionalRoleChoice }: Props) {
  if (!item.roleChoices) return null
  const dual = item.roleCount === 2 || item.roleCount === 4
  const groups = dual
    ? [{ title: '善良角色', value: draft.roleChoice, choices: item.roleChoices.filter((choice) => choice.alignment === 'good'), change: onRoleChoice },
      { title: '邪恶角色', value: draft.secondRoleChoice, choices: item.roleChoices.filter((choice) => choice.alignment === 'evil'), change: onSecondRoleChoice }]
    : [{ title: roleChoiceTitle(item), value: draft.roleChoice, choices: item.roleChoices, change: onRoleChoice }]
  if (item.roleCount === 4) groups.push(
    { title: '第二个善良角色', value: draft.additionalRoleChoices?.[0], choices: item.roleChoices.filter((choice) => choice.alignment === 'good'), change: (id) => onAdditionalRoleChoice?.(0, id) },
    { title: '第二个邪恶角色', value: draft.additionalRoleChoices?.[1], choices: item.roleChoices.filter((choice) => choice.alignment === 'evil'), change: (id) => onAdditionalRoleChoice?.(1, id) },
  )
  if (item.roleCount === 3) groups.splice(0, groups.length,
    { title: '第一个伪装角色', value: draft.roleChoice, choices: item.roleChoices, change: onRoleChoice },
    { title: '第二个伪装角色', value: draft.secondRoleChoice, choices: item.roleChoices, change: onSecondRoleChoice },
    { title: '第三个伪装角色', value: draft.additionalRoleChoices?.[0], choices: item.roleChoices, change: id => onAdditionalRoleChoice?.(0, id) },
  )
  return <>
    {groups.map((group) => <fieldset disabled={disabled} key={group.title}>
      <legend className="choice-legend"><span>{group.title}</span><small>{dual ? `记录告知玩家的角色${item.roleCount === 4 ? '；四个角色须互不相同' : ''}，不改变任何人的身份或阵营` : roleChoiceHint(item)}</small></legend>
      <div className="choice-chips">
        {group.choices.map((role) => <button
          key={role.id} type="button" className={group.value === role.id ? 'choice-chip choice-chip--selected' : 'choice-chip'}
          onClick={() => group.change(role.id)} aria-pressed={group.value === role.id}
        >{role.label}</button>)}
      </div>
    </fieldset>)}
  </>
}

function roleChoiceTitle(item: WakeItem) {
  if (item.roleId === 'cerenovus') return '洗脑师要求声称'
  if (item.roleId === 'gambler') return '赌徒猜测身份'
  if (item.roleId === 'philosopher') return '哲学家获得能力'
  if (item.roleId === 'pithag') return '麻脸巫婆变成'
  return item.roleLabel ?? '角色'
}

function roleChoiceHint(item: WakeItem) {
  if (item.roleId === 'cerenovus') return '仅本技能出现 · 可选善良角色'
  if (item.roleId === 'gambler') return '仅本技能出现 · 猜错则死亡'
  if (item.roleId === 'philosopher') return '仅本技能出现 · 获得对应能力'
  if (item.roleId === 'pithag') return '仅本技能出现 · 改为目标角色'
  return '本项专属选项'
}
