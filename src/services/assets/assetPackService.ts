import type { SmartScriptPack } from '../../domain/scripts'

export const characterAssetDirectory = 'public/assets/characters/'
export const characterAssetUrlPrefix = '/assets/characters/'
export const characterAssetManifestPath = 'public/assets/characters/source-manifest.json'

export type AssetAvailabilityStatus = 'checking' | 'ready' | 'missing' | 'unknown'

export interface CharacterAssetRequirement {
  roleId: string
  roleName: string
  path: string
}

export interface CharacterAssetPackProjection {
  requirements: readonly CharacterAssetRequirement[]
  remoteIconCount: number
  localDirectory: string
  manifestPath: string
}

export interface CharacterAssetAvailability {
  status: Exclude<AssetAvailabilityStatus, 'checking'>
  checked: number
  available: number
  missing: number
  missingPaths: readonly string[]
}

export type AssetFetch = (input: string, init?: { method?: 'HEAD' }) => Promise<{ ok: boolean }>

export function projectCharacterAssetPack(packs: readonly SmartScriptPack[]): CharacterAssetPackProjection {
  const requirements = new Map<string, CharacterAssetRequirement>()
  let remoteIconCount = 0

  for (const pack of packs) {
    for (const role of pack.roles) {
      const iconPath = role.iconPath ?? `${characterAssetUrlPrefix}${role.id}.webp`
      if (iconPath.startsWith(characterAssetUrlPrefix)) {
        requirements.set(iconPath, { roleId: role.id, roleName: role.name, path: iconPath })
      } else if (/^https?:\/\//.test(iconPath)) {
        remoteIconCount += 1
      }
    }
  }

  return {
    requirements: [...requirements.values()].sort((left, right) => left.path.localeCompare(right.path)),
    remoteIconCount,
    localDirectory: characterAssetDirectory,
    manifestPath: characterAssetManifestPath,
  }
}

export async function checkCharacterAssetAvailability(
  requirements: readonly CharacterAssetRequirement[],
  fetcher: AssetFetch | null | undefined = typeof fetch === 'function' ? fetch : undefined,
): Promise<CharacterAssetAvailability> {
  if (requirements.length === 0) {
    return { status: 'ready', checked: 0, available: 0, missing: 0, missingPaths: [] }
  }

  if (!fetcher) {
    return { status: 'unknown', checked: 0, available: 0, missing: 0, missingPaths: [] }
  }

  const checks = await Promise.all(requirements.map(async (item) => {
    try {
      const response = await fetcher(item.path, { method: 'HEAD' })
      return { path: item.path, ok: response.ok }
    } catch {
      return { path: item.path, ok: false }
    }
  }))

  const missingPaths = checks.filter((item) => !item.ok).map((item) => item.path)
  return {
    status: missingPaths.length > 0 ? 'missing' : 'ready',
    checked: checks.length,
    available: checks.length - missingPaths.length,
    missing: missingPaths.length,
    missingPaths,
  }
}
