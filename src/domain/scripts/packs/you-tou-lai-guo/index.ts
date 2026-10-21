import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { baoZouGeBuLinRoles as source0 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { badMoonRisingRoles as source2 } from '../../role-library/bad-moon-rising/roles'
import { aGrimmChorusRoles as source3 } from '../../role-library/a-grimm-chorus/roles'
import { churchOfSpiesRoles as source4 } from '../../role-library/church-of-spies/roles'
import { punchyRoles as source5 } from '../../role-library/punchy/roles'
import { sectsAndVioletsRoles as source6 } from '../../role-library/sects-and-violets/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "a-grimm-chorus", sourceVersion: "sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedYouTouLaiGuoSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
