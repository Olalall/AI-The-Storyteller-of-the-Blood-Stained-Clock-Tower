import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { baoZouGeBuLinRoles as source0 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { sectsAndVioletsRoles as source2 } from '../../role-library/sects-and-violets/roles'
import { churchOfSpiesRoles as source3 } from '../../role-library/church-of-spies/roles'
import { paXingDuShiRoles as source4 } from '../../role-library/pa-xing-du-shi/roles'
import { badMoonRisingRoles as source5 } from '../../role-library/bad-moon-rising/roles'
import { fengMaoZhiYanRoles as source6 } from '../../role-library/feng-mao-zhi-yan/roles'
import { jiuRiShuShiRoles as source7 } from '../../role-library/jiu-ri-shu-shi/roles'
import { devoutTheistsRoles as source8 } from '../../role-library/devout-theists/roles'
import { longZhengHuDouRoles as source9 } from '../../role-library/long-zheng-hu-dou/roles'
import { daChengXiaoZhenRoles as source10 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { yeBanKuangHuanRoles as source11 } from '../../role-library/ye-ban-kuang-huan/roles'
import { punchyRoles as source12 } from '../../role-library/punchy/roles'
import { troubleBrewingRoles as source13 } from '../../role-library/trouble-brewing/roles'
import { baoMengMiTuanRoles as source14 } from '../../role-library/bao-meng-mi-tuan/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ye-ban-kuang-huan", sourceVersion: "sha256:f512be8087e3f0b2caa971adc8d9b789cc96315f4c8bffef44423380107b3077", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "trouble-brewing", sourceVersion: "sha256:102dddc141da4e829de953563b5d9370c6c71482860c756474f7e55477c56ecb", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source14.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki6533660425b7a18bSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
