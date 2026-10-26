export const nominationRulesSource = 'https://wiki.bloodontheclocktower.com/Glossary'
export const nominationRuleFacts = [
  '常规提名只能由存活玩家发起。每位玩家每个游戏白天最多发起一次提名，也最多被提名一次；死者不能发起常规提名，但仍可以被提名。',
  '常规死亡票仍属于普通处决提名投票，与存活玩家的票一起计数。死亡后通常还有一次死亡票，实际使用后消耗；存活时普通投票不消耗死亡票。死亡不等于完全没有投票权。',
  '角色能力可能明确改变提名或投票规则，必须另核对原文、发动条件与次数。驱逐旅行者的支持不是处决投票，不消耗死亡票。',
] as const

// shortcut: 只拦截已复现的明确中文基础规则矛盾，其他措辞出现复现时再补充。
export function contradictsNominationRules(text: string) {
  return text.split(/[。\n]/u).some(clause => {
    if (/错误说法|不能说|不应说|不可说|[？?]/u.test(clause)) return false
    if (!/技能|能力|驱逐|流放|放逐/u.test(clause) && /死亡票.{0,120}(?:不属于|不算|并非|不是)(?:常规|普通|正常|处决)投票/u.test(clause)) return true
    if (/女妖|屠夫|特殊(?:能力|提名)|角色能力|驱逐|流放|放逐|错误说法|并非|不是|不能说|[？?]/u.test(clause)) return false
    const dead = '(?:死亡(?:的)?玩家|死者|已死(?:的)?玩家)'
    if (new RegExp(`${dead}.{0,12}(?<!不)(?:可以|能够|能)(?:正常|自由)?(?:发起|进行)?(?:常规)?提名`, 'u').test(clause)) return true
    if (/(?<!不)(?:可以|能够|允许).{0,12}(?:多次|无限|任意次).{0,6}提名|(?:不受|不限).{0,12}(?:提名次数|被提名次数)|(?:提名次数|被提名次数).{0,6}(?:不受|不限|没有限制)/u.test(clause)) return true
    return !/用掉|用过|用完|已使用|已消耗|耗尽|没有死亡票|无死亡票/u.test(clause)
      && new RegExp(`${dead}.{0,12}(?:没有|已失去|不能在.{0,6})(?:投票权|投票)`, 'u').test(clause)
  })
}
