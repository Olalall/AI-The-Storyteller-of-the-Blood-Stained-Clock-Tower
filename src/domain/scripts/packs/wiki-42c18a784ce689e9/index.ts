import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { baoMengMiTuanRoles as source0 } from '../../role-library/bao-meng-mi-tuan/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { badMoonRisingRoles as source2 } from '../../role-library/bad-moon-rising/roles'
import { baoZouGeBuLinRoles as source3 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source4 } from '../../role-library/ao-fa-ji-hui/roles'
import { quickMathsRoles as source5 } from '../../role-library/quick-maths/roles'
import { everyoneCanPlayRoles as source6 } from '../../role-library/everyone-can-play/roles'
import { huaWaiZhiMinRoles as source7 } from '../../role-library/hua-wai-zhi-min/roles'
import { hideAndSeekRoles as source8 } from '../../role-library/hide-and-seek/roles'
import { aGrimmChorusRoles as source9 } from '../../role-library/a-grimm-chorus/roles'
import { fengMaoZhiYanRoles as source10 } from '../../role-library/feng-mao-zhi-yan/roles'
import { devoutTheistsRoles as source11 } from '../../role-library/devout-theists/roles'
import { wuHeYouZhiXiangRoles as source12 } from '../../role-library/wu-he-you-zhi-xiang/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "quick-maths", sourceVersion: "sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hide-and-seek", sourceVersion: "sha256:d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "a-grimm-chorus", sourceVersion: "sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "wu-he-you-zhi-xiang", sourceVersion: "sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki42c18a784ce689e9SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
