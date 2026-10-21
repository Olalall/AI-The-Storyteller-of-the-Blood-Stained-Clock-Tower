import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { fengMaoZhiYanRoles as source0 } from '../../role-library/feng-mao-zhi-yan/roles'
import { muHouCaoKongRoles as source1 } from '../../role-library/mu-hou-cao-kong/roles'
import { churchOfSpiesRoles as source2 } from '../../role-library/church-of-spies/roles'
import { everyoneCanPlayRoles as source3 } from '../../role-library/everyone-can-play/roles'
import { aoFaJiHuiRoles as source4 } from '../../role-library/ao-fa-ji-hui/roles'
import { badMoonRisingRoles as source5 } from '../../role-library/bad-moon-rising/roles'
import { paXingDuShiRoles as source6 } from '../../role-library/pa-xing-du-shi/roles'
import { chuanQiZhiYeRoles as source7 } from '../../role-library/chuan-qi-zhi-ye/roles'
import { hideAndSeekRoles as source8 } from '../../role-library/hide-and-seek/roles'
import { daChengXiaoZhenRoles as source9 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { jiuRiShuShiRoles as source10 } from '../../role-library/jiu-ri-shu-shi/roles'
import { devoutTheistsRoles as source11 } from '../../role-library/devout-theists/roles'
import { heFangJiaoZhongRoles as source12 } from '../../role-library/he-fang-jiao-zhong/roles'
import { baoZouGeBuLinRoles as source13 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { baoMengMiTuanRoles as source14 } from '../../role-library/bao-meng-mi-tuan/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "chuan-qi-zhi-ye", sourceVersion: "sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hide-and-seek", sourceVersion: "sha256:d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "he-fang-jiao-zhong", sourceVersion: "sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source14.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWikiBed7e3ed354aaa0dSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
