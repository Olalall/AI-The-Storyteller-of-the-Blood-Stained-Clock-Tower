import { describe, expect, it } from 'vitest'
import { getSmartScriptPack, roleAbilityForScript, rolePromptForScript } from './catalog'

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
})
