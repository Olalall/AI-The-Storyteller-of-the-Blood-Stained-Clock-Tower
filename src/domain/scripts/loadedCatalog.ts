import { catfishingSmartScriptPack } from './packs/catfishing'
import { scriptManifest } from './scriptManifest.generated'
import { scriptLoaders } from './scriptLoaders.generated'
import { createPackLoader } from './packLoader'

const catalog = createPackLoader(scriptManifest.map((entry) => entry.scriptId), scriptLoaders, [catfishingSmartScriptPack])
/** Only loaded packs. Use scriptManifest when browsing every available script. */
export const smartScriptPacks = catalog.packs
export const smartScriptRegistry = catalog.registry
export const getSmartScriptPack = catalog.get
export const loadSmartScriptPack = catalog.load
/** Offline tools and full-catalog test fixtures only; not a browser startup dependency. */
export const loadAllSmartScriptPacks = catalog.loadAll
