import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { huaWaiZhiMinRoles as source0 } from '../../role-library/hua-wai-zhi-min/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { everyoneCanPlayRoles as source2 } from '../../role-library/everyone-can-play/roles'
import { paXingDuShiRoles as source3 } from '../../role-library/pa-xing-du-shi/roles'
import { baoZouGeBuLinRoles as source4 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { devoutTheistsRoles as source5 } from '../../role-library/devout-theists/roles'
import { churchOfSpiesRoles as source6 } from '../../role-library/church-of-spies/roles'
import { wuHeYouZhiXiangRoles as source7 } from '../../role-library/wu-he-you-zhi-xiang/roles'
import { baoMengMiTuanRoles as source8 } from '../../role-library/bao-meng-mi-tuan/roles'
import { liBengLeHuaiRoles as source9 } from '../../role-library/li-beng-le-huai/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "wu-he-you-zhi-xiang", sourceVersion: "sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "li-beng-le-huai", sourceVersion: "sha256:af0f4ab26df993c8f6d68c422e12c5a87c8d063d9d06d95d2bab171f65a2d985", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWenRunLiangYeSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
