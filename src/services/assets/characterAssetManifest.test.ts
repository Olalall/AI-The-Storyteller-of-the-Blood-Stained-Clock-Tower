/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { smartScriptPacks } from '../../domain/scripts'
import { characterAssetManifestPath, projectCharacterAssetPack } from './assetPackService'

interface CharacterAssetManifest {
  version: number
  assets: Record<string, { url: string; sha256: string; kind: 'official' | 'community' }>
}

describe('character asset source manifest', () => {
  it('covers every registered role icon with a verified source entry', () => {
    const projection = projectCharacterAssetPack(smartScriptPacks)
    const manifest = JSON.parse(
      readFileSync(resolve(process.cwd(), characterAssetManifestPath), 'utf8'),
    ) as CharacterAssetManifest
    const missing = projection.requirements
      .map((item) => item.path.replace('/assets/characters/', ''))
      .filter((file) => !manifest.assets[file])

    expect(manifest.version).toBe(2)
    expect(projection.remoteIconCount).toBe(0)
    expect(missing).toEqual([])
    expect(Object.keys(manifest.assets)).toHaveLength(projection.requirements.length)
    expect(Object.values(manifest.assets).every((asset) =>
      /^https:\/\//.test(asset.url) && /^sha256:[a-f0-9]{64}$/.test(asset.sha256),
    )).toBe(true)
  })
})
