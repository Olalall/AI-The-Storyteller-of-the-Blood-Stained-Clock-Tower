import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { insanityAndIntuitionRoles as source0 } from '../../role-library/insanity-and-intuition/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { huaWaiZhiMinRoles as source2 } from '../../role-library/hua-wai-zhi-min/roles'
import { heFangJiaoZhongRoles as source3 } from '../../role-library/he-fang-jiao-zhong/roles'
import { paXingDuShiRoles as source4 } from '../../role-library/pa-xing-du-shi/roles'
import { everyoneCanPlayRoles as source5 } from '../../role-library/everyone-can-play/roles'
import { aoFaJiHuiRoles as source6 } from '../../role-library/ao-fa-ji-hui/roles'
import { baoZouGeBuLinRoles as source7 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { badMoonRisingRoles as source8 } from '../../role-library/bad-moon-rising/roles'
import { devoutTheistsRoles as source9 } from '../../role-library/devout-theists/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "he-fang-jiao-zhong", sourceVersion: "sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWikiFec05266799865eeSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
