import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleAbilityForScript, rolePromptForScript, smartScriptPacks } from './catalog'

const officialBasicScriptIds = ['trouble-brewing', 'bad-moon-rising', 'sects-and-violets']
const tpiRecommendedScriptIds = ['one-in-one-out', 'a-grimm-chorus', 'hide-and-seek', 'lunar-eclipse']
const carouselScriptIds = ['punchy', 'quick-maths', 'devout-theists']

describe('official basic script role copy', () => {
  it('projects Chinese ability copy for every role in the official basic scripts', () => {
    for (const scriptId of officialBasicScriptIds) {
      for (const role of getSmartScriptPack(scriptId).roles) {
        const ability = roleAbilityForScript(scriptId, role.id)

        expect(ability, `${scriptId}/${role.id}`).not.toContain('You ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('Each ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('Every ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('If ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('When ')
        expect(ability.length, `${scriptId}/${role.id}`).toBeGreaterThan(4)
      }
    }
  })

  it('projects Chinese ability copy for every role in imported TPI Recommended scripts', () => {
    for (const scriptId of tpiRecommendedScriptIds) {
      for (const role of getSmartScriptPack(scriptId).roles) {
        const ability = roleAbilityForScript(scriptId, role.id)

        expect(ability, `${scriptId}/${role.id}`).not.toContain('You ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('Each ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('Every ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('If ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('When ')
        expect(ability.length, `${scriptId}/${role.id}`).toBeGreaterThan(4)
      }
    }
  })

  it('projects Chinese ability copy for every role in imported Carousel scripts', () => {
    for (const scriptId of carouselScriptIds) {
      for (const role of getSmartScriptPack(scriptId).roles) {
        const ability = roleAbilityForScript(scriptId, role.id)

        expect(ability, `${scriptId}/${role.id}`).not.toContain('You ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('Each ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('Every ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('If ')
        expect(ability, `${scriptId}/${role.id}`).not.toContain('When ')
        expect(ability.length, `${scriptId}/${role.id}`).toBeGreaterThan(4)
      }
    }
  })

  it('keeps high-risk role prompts explicit without settling automatically', () => {
    expect(roleAbilityForScript('bad-moon-rising', 'gambler')).toContain('猜错')
    expect(rolePromptForScript('bad-moon-rising', 'gambler')).toContain('确认后再处理死亡')

    expect(roleAbilityForScript('sects-and-violets', 'snakecharmer')).toContain('新舞蛇人永久中毒')
    expect(rolePromptForScript('sects-and-violets', 'snakecharmer')).toContain('永久中毒')

    expect(roleAbilityForScript('sects-and-violets', 'cerenovus')).toContain('疯狂证明')
    expect(rolePromptForScript('sects-and-violets', 'cerenovus')).toContain('被洗脑成了该角色')

    expect(roleAbilityForScript('one-in-one-out', 'ogre')).toContain('即使醉酒或中毒')
    expect(rolePromptForScript('one-in-one-out', 'ogre')).toContain('说书人确认后追加')

    expect(roleAbilityForScript('one-in-one-out', 'kazali')).toContain('指定哪些玩家成为哪些爪牙')
    expect(rolePromptForScript('one-in-one-out', 'kazali')).toContain('不要自动改身份或杀人')

    expect(roleAbilityForScript('one-in-one-out', 'spiritofivory')).toContain('额外邪恶玩家不能超过一名')
    expect(rolePromptForScript('one-in-one-out', 'spiritofivory')).toContain('不进入座位身份')

    expect(roleAbilityForScript('a-grimm-chorus', 'summoner')).toContain('第 3 夜选择一名玩家')
    expect(rolePromptForScript('a-grimm-chorus', 'summoner')).toContain('说书人确认后再写入')

    expect(roleAbilityForScript('a-grimm-chorus', 'yaggababble')).toContain('当天每公开说出一次暗号')
    expect(rolePromptForScript('a-grimm-chorus', 'yaggababble')).toContain('不能自动根据聊天判断')

    expect(roleAbilityForScript('a-grimm-chorus', 'damsel')).toContain('每局游戏限一次')
    expect(rolePromptForScript('a-grimm-chorus', 'damsel')).toContain('胜负必须由说书人确认')

    expect(roleAbilityForScript('hide-and-seek', 'pixie')).toContain('首夜得知一个在场镇民')
    expect(rolePromptForScript('hide-and-seek', 'pixie')).toContain('是否获得能力由说书人确认')

    expect(roleAbilityForScript('hide-and-seek', 'preacher')).toContain('失去能力')
    expect(rolePromptForScript('hide-and-seek', 'preacher')).toContain('待确认状态')

    expect(roleAbilityForScript('hide-and-seek', 'huntsman')).toContain('开局加入落难少女')
    expect(rolePromptForScript('hide-and-seek', 'huntsman')).toContain('追加身份更正')

    expect(roleAbilityForScript('lunar-eclipse', 'lycanthrope')).toContain('恶魔今晚不杀人')
    expect(rolePromptForScript('lunar-eclipse', 'lycanthrope')).toContain('说书人确认')

    expect(roleAbilityForScript('lunar-eclipse', 'marionette')).toContain('与恶魔相邻')
    expect(rolePromptForScript('lunar-eclipse', 'marionette')).toContain('不自动重排座位')

    expect(roleAbilityForScript('lunar-eclipse', 'magician')).toContain('爪牙以为你是恶魔')
    expect(rolePromptForScript('lunar-eclipse', 'magician')).toContain('不改变真实身份或阵营')

    expect(roleAbilityForScript('lunar-eclipse', 'puzzlemaster')).toContain('猜错得假信息')
    expect(rolePromptForScript('lunar-eclipse', 'puzzlemaster')).toContain('由说书人确认')

    expect(roleAbilityForScript('quick-maths', 'xaan')).toContain('第 X 夜')
    expect(rolePromptForScript('quick-maths', 'xaan')).toContain('不批量自动改状态')

    expect(roleAbilityForScript('quick-maths', 'riot')).toContain('被提名者死亡')
    expect(rolePromptForScript('quick-maths', 'riot')).toContain('工具只记录和提醒')

    expect(roleAbilityForScript('devout-theists', 'lleech')).toContain('只有当宿主死亡时')
    expect(rolePromptForScript('devout-theists', 'lleech')).toContain('不要自动处理')

    expect(roleAbilityForScript('devout-theists', 'legion')).toContain('多数玩家是军团')
    expect(rolePromptForScript('devout-theists', 'legion')).toContain('不自动生成多名军团')
  })

  it('does not fall back to English for the remaining imported roles', () => {
    expect(roleAbilityForScript('church-of-spies', 'cultleader')).toContain('存活邻座')
    expect(roleAbilityForScript('insanity-and-intuition', 'poppygrower')).toContain('互相不认识')
    expect(roleAbilityForScript('insanity-and-intuition', 'plaguedoctor')).toContain('说书人获得一个爪牙能力')
    expect(roleAbilityForScript('insanity-and-intuition', 'boomdandy')).toContain('除三名玩家外')
  })

  it('keeps every catalog role ability readable in Chinese', () => {
    for (const pack of smartScriptPacks) {
      for (const role of pack.roles) {
        const ability = roleAbilityForScript(pack.scriptId, role.id)
        expect(ability, `${pack.scriptId}/${role.id}`).not.toMatch(/\b(You|Each|Every|If|When|The|Once|On|Only|Choose|May|Your|A|An)\b/i)
      }
    }
  })

  it('preserves the not-first-night marker in shared localized copy', () => {
    for (const roleId of [
      'assassin', 'flowergirl', 'gambler', 'imp', 'legion', 'lycanthrope',
      'monk', 'ojo', 'oracle', 'professor', 'towncrier', 'zombuul',
    ]) {
      const pack = smartScriptPacks.find((candidate) => candidate.roles.some((role) => role.id === roleId))
      if (!pack) throw new Error(`${roleId} is missing from the catalog`)
      expect(roleAbilityForScript(pack.scriptId, roleId), roleId).toContain('*')
    }
  })

  it('keeps the corrected high-risk role rules and official Chinese names', () => {
    expect(roleAbilityForScript('shi-san-hang', 'acrobat')).toContain('选择一名玩家')
    expect(roleAbilityForScript('shi-san-hang', 'acrobat')).not.toContain('与你邻近')
    expect(roleAbilityForScript('shi-yan-jiao-chi', 'acrobat')).toContain('与你邻近')
    expect(getSmartScriptPack('shi-san-hang').roles.find((role) => role.id === 'acrobat')?.team).toBe('townsfolk')
    expect(getSmartScriptPack('he-fang-jiao-zhong').roles.find((role) => role.id === 'stormcatcher')?.team).toBe('loric')
    expect(roleAbilityForScript('shi-yan-jiao-chi', 'acrobat')).not.toContain('选择一名玩家：如果他当晚醉酒或中毒')
    expect(roleAbilityForScript('shi-san-hang', 'acrobat')).toContain('包括之后变醉或中毒')
    expect(roleAbilityForScript('bad-moon-rising', 'exorcist')).toContain('本晚不会因自己的能力醒来')
    expect(roleAbilityForScript('sects-and-violets', 'pithag')).toContain('若该角色已在场，能力无效')
    expect(roleAbilityForScript('bad-moon-rising', 'fool')).toBe('第一次死亡时，你不会死亡。')
    expect(roleAbilityForScript('bad-moon-rising', 'godfather')).toContain('被处决并死亡')
    expect(rolePromptForScript('bad-moon-rising', 'godfather')).toContain('实际死亡')
    expect(roleAbilityForScript('bad-moon-rising', 'godfather')).toContain('[-1或+1外来者]')
    expect(roleAbilityForScript('sects-and-violets', 'sweetheart')).toContain('从此醉酒')
    expect(roleAbilityForScript('sects-and-violets', 'fanggu')).toContain('首次以此能力杀死外来者')
    expect(rolePromptForScript('sects-and-violets', 'fanggu')).toContain('之后外来者只按普通击杀处理')
    expect(roleAbilityForScript('trouble-brewing', 'drunk')).not.toContain('技能不会生效')
    expect(roleAbilityForScript('he-fang-jiao-zhong', 'king')).toContain('死亡玩家数量大于或等于存活玩家')
    expect(roleAbilityForScript('he-fang-jiao-zhong', 'choirboy')).toContain('恶魔杀死国王')
    expect(roleAbilityForScript('he-fang-jiao-zhong', 'fearmonger')).toContain('提名并处决')
    expect(roleAbilityForScript('he-fang-jiao-zhong', 'lilmonsta')).toContain('照看小怪宝')
    expect(roleAbilityForScript('si-dong-fei-dong', 'bountyhunter')).toContain('首夜得知一名邪恶玩家')
    expect(roleAbilityForScript('si-dong-fei-dong', 'gangster')).toContain('另一名相邻存活玩家同意')
    expect(roleAbilityForScript('wu-he-you-zhi-xiang', 'hatter')).toContain('新的同类型角色')
    expect(roleAbilityForScript('chou-hai-ni-xing', 'snakecharmer')).toContain('交换角色和阵营')
    expect(roleAbilityForScript('miao-shan-feng-xian', 'fanggu')).toContain('首次以此能力杀死外来者')

    const roleName = (scriptId: string, roleId: string) => getSmartScriptPack(scriptId).roles.find((role) => role.id === roleId)?.name
    expect(roleName('trouble-brewing', 'undertaker')).toBe('送葬者')
    expect(roleName('trouble-brewing', 'recluse')).toBe('陌客')
    expect(roleName('bad-moon-rising', 'gossip')).toBe('造谣者')
    expect(roleName('sects-and-violets', 'sweetheart')).toBe('心上人')
    expect(roleName('sects-and-violets', 'vigormortis')).toBe('亡骨魔')
  })
})
