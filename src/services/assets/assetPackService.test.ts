import { describe, expect, it, vi } from 'vitest'
import type { SmartScriptPack } from '../../domain/scripts'
import { checkCharacterAssetAvailability, projectCharacterAssetPack } from './assetPackService'

function pack(overrides: Partial<SmartScriptPack> = {}): SmartScriptPack {
  return {
    scriptId: 'test-script',
    displayName: '测试板子',
    source: { contentHash: 'hash', verifiedAt: '2026-07-27' },
    playerCounts: [7],
    roles: [
      {
        id: 'washerwoman',
        name: '洗衣妇',
        team: 'townsfolk',
        abilityText: '测试能力',
        iconPath: '/assets/characters/washerwoman.webp',
        inputKinds: ['none'],
        knowledgeStatus: 'confirmed',
      },
      {
        id: 'chef',
        name: '厨师',
        team: 'townsfolk',
        abilityText: '测试能力',
        iconPath: '/assets/characters/chef.webp',
        inputKinds: ['none'],
        knowledgeStatus: 'confirmed',
      },
      {
        id: 'remote-role',
        name: '远程素材',
        team: 'outsider',
        abilityText: '测试能力',
        iconPath: 'https://example.com/remote.webp',
        inputKinds: ['none'],
        knowledgeStatus: 'confirmed',
      },
    ],
    nightOrders: { firstNight: [], otherNight: [] },
    setupTemplates: [],
    setupRules: [],
    knowledgeStatus: 'confirmed',
    ...overrides,
  }
}

describe('assetPackService', () => {
  it('projects local character asset requirements without treating remote icons as bundled assets', () => {
    const projection = projectCharacterAssetPack([pack()])

    expect(projection.requirements).toHaveLength(2)
    expect(projection.remoteIconCount).toBe(1)
    expect(projection.requirements.map((item) => item.path)).toEqual([
      '/assets/characters/chef.webp',
      '/assets/characters/washerwoman.webp',
    ])
  })

  it('checks missing local character assets through HEAD requests', async () => {
    const fetcher = vi.fn(async (path: string) => ({ ok: !path.includes('chef') }))
    const projection = projectCharacterAssetPack([pack()])

    const availability = await checkCharacterAssetAvailability(projection.requirements, fetcher)

    expect(fetcher).toHaveBeenCalledWith('/assets/characters/chef.webp', { method: 'HEAD' })
    expect(availability).toMatchObject({
      status: 'missing',
      checked: 2,
      available: 1,
      missing: 1,
      missingPaths: ['/assets/characters/chef.webp'],
    })
  })

  it('does not treat the SPA HTML fallback as an installed image', async () => {
    const fetcher = vi.fn(async () => ({
      ok: true,
      headers: { get: () => 'text/html; charset=utf-8' },
    }))

    const availability = await checkCharacterAssetAvailability(projectCharacterAssetPack([pack()]).requirements, fetcher)

    expect(availability).toMatchObject({ status: 'missing', available: 0, missing: 2 })
  })

  it('counts duplicate remote icon URLs once', () => {
    const projection = projectCharacterAssetPack([pack(), pack({ scriptId: 'second-script' })])

    expect(projection.remoteIconCount).toBe(1)
  })

  it('reports unknown when the browser cannot fetch asset status', async () => {
    const availability = await checkCharacterAssetAvailability(projectCharacterAssetPack([pack()]).requirements, null)

    expect(availability.status).toBe('unknown')
    expect(availability.checked).toBe(0)
  })
})
