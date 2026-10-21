import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { churchOfSpiesRoles as source0 } from '../../role-library/church-of-spies/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { daChengXiaoZhenRoles as source2 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { paXingDuShiRoles as source3 } from '../../role-library/pa-xing-du-shi/roles'
import { everyoneCanPlayRoles as source4 } from '../../role-library/everyone-can-play/roles'
import { baoZouGeBuLinRoles as source5 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { badMoonRisingRoles as source6 } from '../../role-library/bad-moon-rising/roles'
import { erYuWoZhaRoles as source7 } from '../../role-library/er-yu-wo-zha/roles'
import { sectsAndVioletsRoles as source8 } from '../../role-library/sects-and-violets/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "er-yu-wo-zha", sourceVersion: "sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWikiE89d6f6239a18c76SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
