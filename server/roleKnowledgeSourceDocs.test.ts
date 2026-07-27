import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { complexRoleKnowledge } from '../src/domain/role-knowledge/complexRoleKnowledge'

describe('complex role source documents', () => {
  it('keeps source documents for structured complex role summaries', () => {
    for (const knowledge of complexRoleKnowledge) {
      expect(existsSync(knowledge.sourceDoc), knowledge.roleId).toBe(true)
    }
  })
})
