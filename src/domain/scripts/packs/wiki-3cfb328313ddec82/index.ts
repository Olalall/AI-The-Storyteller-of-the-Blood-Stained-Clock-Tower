import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { punchyRoles as source0 } from '../../role-library/punchy/roles'
import { baoMengMiTuanRoles as source1 } from '../../role-library/bao-meng-mi-tuan/roles'
import { muHouCaoKongRoles as source2 } from '../../role-library/mu-hou-cao-kong/roles'
import { baoZouGeBuLinRoles as source3 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source4 } from '../../role-library/ao-fa-ji-hui/roles'
import { huaWaiZhiMinRoles as source5 } from '../../role-library/hua-wai-zhi-min/roles'
import { churchOfSpiesRoles as source6 } from '../../role-library/church-of-spies/roles'
import { daChengXiaoZhenRoles as source7 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { longZhengHuDouRoles as source8 } from '../../role-library/long-zheng-hu-dou/roles'
import { erYuWoZhaRoles as source9 } from '../../role-library/er-yu-wo-zha/roles'
import { devoutTheistsRoles as source10 } from '../../role-library/devout-theists/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "er-yu-wo-zha", sourceVersion: "sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki3cfb328313ddec82SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
