import { baseDistributionByPlayerCount } from './baseDistribution'
import type { ScriptSetupRulePack } from './types'

/**
 * Catfishing 原型的已核对开局事实。
 * 这份表只表达角色说明中明确的开局人数修正；没有来源的 Jinx/冲突不在此猜测。
 */
export const catfishingSetupRulePack: ScriptSetupRulePack = {
  scriptId: 'catfishing',
  version: 'catfishing-11.1.1/prototype-setup-rules-v1',
  baseDistributionByPlayerCount,
  modifiers: [
    {
      id: 'balloonist-outsider',
      roleId: 'balloonist',
      label: '气球驾驶员人数修正',
      requiresStorytellerChoice: true,
      choices: [
        { id: 'no-extra-outsider', label: '不增加外来者', delta: {} },
        { id: 'add-outsider', label: '增加1名外来者', delta: { townsfolk: -1, outsider: 1 } },
      ],
      source: 'Balloonist [+0 or +1 Outsider]',
    },
    {
      id: 'godfather-outsider',
      roleId: 'godfather',
      label: '教父人数修正',
      requiresStorytellerChoice: true,
      choices: [
        { id: 'remove-outsider', label: '减少1名外来者', delta: { townsfolk: 1, outsider: -1 } },
        { id: 'add-outsider', label: '增加1名外来者', delta: { townsfolk: -1, outsider: 1 } },
      ],
      source: 'Godfather [-1 or +1 Outsider]',
    },
    {
      id: 'vigormortis-outsider',
      roleId: 'vigormortis',
      label: '亡骨魔人数修正',
      requiresStorytellerChoice: false,
      choices: [
        { id: 'remove-outsider', label: '减少1名外来者', delta: { townsfolk: 1, outsider: -1 } },
      ],
      source: 'Vigormortis [-1 Outsider]',
    },
    {
      id: 'fanggu-outsider',
      roleId: 'fanggu',
      label: '方古人数修正',
      requiresStorytellerChoice: false,
      choices: [
        { id: 'add-outsider', label: '增加1名外来者', delta: { townsfolk: -1, outsider: 1 } },
      ],
      source: 'Fang Gu [+1 Outsider]',
    },
  ],
  /** 当前原型没有可追溯来源的 Catfishing 专项冲突，宁可提示人工核对，也不猜。 */
  conflicts: [],
  demonBluffPolicy: {
    count: 3,
    eligibleTeam: 'townsfolk',
    requireNotInPlay: true,
  },
}
