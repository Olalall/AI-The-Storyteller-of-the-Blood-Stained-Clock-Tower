import { describe, expect, it } from 'vitest'
import { complexRoleKnowledge, getComplexRoleKnowledge, roleKnowledgeForAI } from './complexRoleKnowledge'

describe('complex role knowledge', () => {
  it('keeps the researched complex roles in a shared index', () => {
    expect(complexRoleKnowledge).toHaveLength(74)
    expect(getComplexRoleKnowledge('snakecharmer')).toMatchObject({
      title: '舞蛇人',
      riskTags: expect.arrayContaining(['identity', 'team', 'poison']),
    })
    expect(getComplexRoleKnowledge('snakecharmer')?.reminders.join(' ')).toContain('新舞蛇人中毒')
    expect(getComplexRoleKnowledge('pithag')?.reminders.join(' ')).toContain('创造新恶魔')
    expect(getComplexRoleKnowledge('fanggu')?.reminders.join(' ')).toContain('目标变邪恶方古')
    expect(getComplexRoleKnowledge('gambler')?.aiCan.join(' ')).toContain('猜对/猜错草稿')
    expect(getComplexRoleKnowledge('nodashii')?.aiCannot.join(' ')).toContain('自动批量中毒')
    expect(getComplexRoleKnowledge('alchemist')?.requiredContext.join(' ')).toContain('获得的爪牙能力')
    expect(getComplexRoleKnowledge('mathematician')?.aiCan.join(' ')).toContain('异常事件候选')
    expect(getComplexRoleKnowledge('zombuul')?.aiCannot.join(' ')).toContain('登记死亡')
    expect(getComplexRoleKnowledge('kazali')?.reminders.join(' ')).toContain('指定哪些玩家成为哪些爪牙')
    expect(getComplexRoleKnowledge('goblin')?.aiCannot.join(' ')).toContain('自动判胜负')
  })

  it('projects a bounded AI brief instead of full research notes', () => {
    const brief = roleKnowledgeForAI('cerenovus')

    expect(brief).toMatchObject({
      roleId: 'cerenovus',
      title: '洗脑师',
    })
    expect(brief?.reminders.length).toBeLessThanOrEqual(3)
    expect(brief?.aiCannot.join(' ')).toContain('自动处决')
    expect(JSON.stringify(brief)).not.toContain('sourceDoc')
  })

  it('normalizes legacy role id aliases before projecting AI briefs', () => {
    const brief = roleKnowledgeForAI('snake_charmer')

    expect(brief).toMatchObject({
      roleId: 'snakecharmer',
      title: '舞蛇人',
    })
  })

})
