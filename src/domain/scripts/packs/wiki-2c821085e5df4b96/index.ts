import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { aoFaJiHuiRoles as source0 } from '../../role-library/ao-fa-ji-hui/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { badMoonRisingRoles as source2 } from '../../role-library/bad-moon-rising/roles'
import { baoZouGeBuLinRoles as source3 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { muHouCaoKongRoles as source4 } from '../../role-library/mu-hou-cao-kong/roles'
import { sectsAndVioletsRoles as source5 } from '../../role-library/sects-and-violets/roles'
import { gaiTouHuanMianRoles as source6 } from '../../role-library/gai-tou-huan-mian/roles'
import { erYuWoZhaRoles as source7 } from '../../role-library/er-yu-wo-zha/roles'
import { heFangJiaoZhongRoles as source8 } from '../../role-library/he-fang-jiao-zhong/roles'
import { devoutTheistsRoles as source9 } from '../../role-library/devout-theists/roles'
import { longZhengHuDouRoles as source10 } from '../../role-library/long-zheng-hu-dou/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "gai-tou-huan-mian", sourceVersion: "sha256:d7833ff494f68c1819ee9ae7c2841c2e3a5b2d8a153d9301e522ba871352c05f", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "er-yu-wo-zha", sourceVersion: "sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "he-fang-jiao-zhong", sourceVersion: "sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki2c821085e5df4b96SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
