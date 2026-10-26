import { normalizeRoleId } from './roleId'

/** 共享角色的开局交接清单；只收集说书人的选择，不推算技能结果。 */
export const openingPreparationRoles = {
  puzzlemaster: { kind: 'player', label: '固定醉酒玩家', hint: '首夜前确定；谜师死亡后仍保留。不要在猜测时临时改目标。' },
  alchemist: { kind: 'minion', label: '获得的爪牙能力', hint: '仍是善良镇民，不参加邪恶相认。通常选不在场爪牙，也允许重复在场能力；涉及人数修正时须先核对配板。' },
  lunatic: { kind: 'demon', label: '以为自己是', hint: '另定假的爪牙和三张善良伪装；假伪装可以在场。每次假选择先交给真恶魔，不产生真实死亡。' },
  pixie: { kind: 'townsfolk', label: '计划告知角色（夜间复核）', hint: '实际标记的镇民玩家与告知角色分开记录。遇涡流或毒醉需复核信息真假；疯狂、来源死亡与继承仍由说书人确认。' },
  amnesiac: { kind: 'text', label: '自定义能力与发动时点', hint: '写清条件、目标、时点及反馈；不要在过程中临时改变已约定的能力。' },
  mezepheles: { kind: 'text', label: '秘密关键词', hint: '首夜告诉灵言师；之后第一次善良玩家说出该词是否转阵营，需要说书人明确确认。' },
} as const

export type OpeningRoleId = keyof typeof openingPreparationRoles
export function openingRole(roleId: string) {
  return openingPreparationRoles[normalizeRoleId(roleId) as OpeningRoleId]
}
