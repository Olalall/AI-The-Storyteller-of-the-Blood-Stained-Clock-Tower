import { describe, expect, it } from 'vitest'
import { roleResearchForAI, smartScriptPacks } from './catalog'

describe('role research AI projection', () => {
  it('projects imported smart-script role research into AI-safe briefs', () => {
    for (const pack of smartScriptPacks) {
      for (const role of pack.roles) {
        const brief = roleResearchForAI(pack.scriptId, role.id)

        expect(brief, `${pack.scriptId}/${role.id}`).toBeTruthy()
        expect(brief?.roleId, `${pack.scriptId}/${role.id}`).toBe(role.id)
        expect(brief?.name, `${pack.scriptId}/${role.id}`).toBe(role.name)
        expect(brief?.knowledgeStatus, `${pack.scriptId}/${role.id}`).toBe(role.knowledgeStatus)
        expect(brief?.sourceUrls.length, `${pack.scriptId}/${role.id}`).toBeGreaterThan(0)
        expect(brief?.reviewedAt, `${pack.scriptId}/${role.id}`).toBeTruthy()
        expect(JSON.stringify(brief), `${pack.scriptId}/${role.id}`).not.toContain('timeline')
        expect(JSON.stringify(brief), `${pack.scriptId}/${role.id}`).not.toContain('session')
      }
    }
  })

  it('accepts common role id aliases used by imported script JSON', () => {
    expect(roleResearchForAI('catfishing', 'snake_charmer')?.roleId).toBe('snakecharmer')
    expect(roleResearchForAI('catfishing', 'pit_hag')?.roleId).toBe('pithag')
    expect(roleResearchForAI('catfishing', 'fortune_teller')?.roleId).toBe('fortuneteller')
  })
})
