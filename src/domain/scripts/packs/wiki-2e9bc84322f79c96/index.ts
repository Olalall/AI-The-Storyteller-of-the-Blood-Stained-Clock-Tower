import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { aoFaJiHuiRoles as source0 } from '../../role-library/ao-fa-ji-hui/roles'
import { sectsAndVioletsRoles as source1 } from '../../role-library/sects-and-violets/roles'
import { aGrimmChorusRoles as source2 } from '../../role-library/a-grimm-chorus/roles'
import { churchOfSpiesRoles as source3 } from '../../role-library/church-of-spies/roles'
import { badMoonRisingRoles as source4 } from '../../role-library/bad-moon-rising/roles'
import { shiSanHangRoles as source5 } from '../../role-library/shi-san-hang/roles'
import { devoutTheistsRoles as source6 } from '../../role-library/devout-theists/roles'
import { kuMuFengChunRoles as source7 } from '../../role-library/ku-mu-feng-chun/roles'
import { jiuRiShuShiRoles as source8 } from '../../role-library/jiu-ri-shu-shi/roles'
import { baoZouGeBuLinRoles as source9 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { longZhengHuDouRoles as source10 } from '../../role-library/long-zheng-hu-dou/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "a-grimm-chorus", sourceVersion: "sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "shi-san-hang", sourceVersion: "sha256:4537cee40664d86345fa1b20af1858768df3be233db1d41081e184dece91f0e5", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ku-mu-feng-chun", sourceVersion: "sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki2e9bc84322f79c96SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
