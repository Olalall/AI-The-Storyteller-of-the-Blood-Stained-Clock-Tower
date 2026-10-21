import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { churchOfSpiesRoles as source0 } from '../../role-library/church-of-spies/roles'
import { baoZouGeBuLinRoles as source1 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { paXingDuShiRoles as source2 } from '../../role-library/pa-xing-du-shi/roles'
import { everyoneCanPlayRoles as source3 } from '../../role-library/everyone-can-play/roles'
import { aoFaJiHuiRoles as source4 } from '../../role-library/ao-fa-ji-hui/roles'
import { fengMaoZhiYanRoles as source5 } from '../../role-library/feng-mao-zhi-yan/roles'
import { chuanQiZhiYeRoles as source6 } from '../../role-library/chuan-qi-zhi-ye/roles'
import { devoutTheistsRoles as source7 } from '../../role-library/devout-theists/roles'
import { longZhengHuDouRoles as source8 } from '../../role-library/long-zheng-hu-dou/roles'
import { insanityAndIntuitionRoles as source9 } from '../../role-library/insanity-and-intuition/roles'
import { badMoonRisingRoles as source10 } from '../../role-library/bad-moon-rising/roles'
import { heFangJiaoZhongRoles as source11 } from '../../role-library/he-fang-jiao-zhong/roles'
import { baoMengMiTuanRoles as source12 } from '../../role-library/bao-meng-mi-tuan/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "chuan-qi-zhi-ye", sourceVersion: "sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "he-fang-jiao-zhong", sourceVersion: "sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki045c469020bffd03SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
