/** 少数技能自带一次角色选择；标题与提示按 roleId 分流，避免在渲染里堆三元。 */
import type { WakeItem } from '../types'

export function roleChoiceTitle(item: WakeItem) {
  if (item.roleId === 'cerenovus') return '洗脑师要求声称'
  if (item.roleId === 'gambler') return '赌徒猜测身份'
  if (item.roleId === 'philosopher') return '哲学家获得能力'
  if (item.roleId === 'pithag') return '麻脸巫婆变成'
  return item.roleLabel ?? '角色'
}

export function roleChoiceHint(item: WakeItem) {
  if (item.roleId === 'cerenovus') return '仅本技能出现 · 可选善良角色'
  if (item.roleId === 'gambler') return '仅本技能出现 · 猜错则死亡'
  if (item.roleId === 'philosopher') return '仅本技能出现 · 获得对应能力'
  if (item.roleId === 'pithag') return '仅本技能出现 · 改为目标角色'
  return '本项专属选项'
}
