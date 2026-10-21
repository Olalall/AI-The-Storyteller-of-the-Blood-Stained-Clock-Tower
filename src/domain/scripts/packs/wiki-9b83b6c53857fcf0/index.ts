import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { muHouCaoKongRoles as source0 } from '../../role-library/mu-hou-cao-kong/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { baoZouGeBuLinRoles as source2 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { badMoonRisingRoles as source3 } from '../../role-library/bad-moon-rising/roles'
import { fengMaoZhiYanRoles as source4 } from '../../role-library/feng-mao-zhi-yan/roles'
import { devoutTheistsRoles as source5 } from '../../role-library/devout-theists/roles'
import { insanityAndIntuitionRoles as source6 } from '../../role-library/insanity-and-intuition/roles'
import { sectsAndVioletsRoles as source7 } from '../../role-library/sects-and-violets/roles'
import { churchOfSpiesRoles as source8 } from '../../role-library/church-of-spies/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki9b83b6c53857fcf0SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
