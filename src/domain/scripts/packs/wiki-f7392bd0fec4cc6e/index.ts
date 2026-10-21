import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { muHouCaoKongRoles as source0 } from '../../role-library/mu-hou-cao-kong/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { fengMaoZhiYanRoles as source2 } from '../../role-library/feng-mao-zhi-yan/roles'
import { aoFaJiHuiRoles as source3 } from '../../role-library/ao-fa-ji-hui/roles'
import { everyoneCanPlayRoles as source4 } from '../../role-library/everyone-can-play/roles'
import { kuMuFengChunRoles as source5 } from '../../role-library/ku-mu-feng-chun/roles'
import { baoZouGeBuLinRoles as source6 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { daChengXiaoZhenRoles as source7 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { devoutTheistsRoles as source8 } from '../../role-library/devout-theists/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ku-mu-feng-chun", sourceVersion: "sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWikiF7392bd0fec4cc6eSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
