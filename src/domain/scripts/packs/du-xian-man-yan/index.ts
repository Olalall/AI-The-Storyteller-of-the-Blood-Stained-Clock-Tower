import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { baoZouGeBuLinRoles as source0 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { everyoneCanPlayRoles as source2 } from '../../role-library/everyone-can-play/roles'
import { huaWaiZhiMinRoles as source3 } from '../../role-library/hua-wai-zhi-min/roles'
import { sectsAndVioletsRoles as source4 } from '../../role-library/sects-and-violets/roles'
import { aoFaJiHuiRoles as source5 } from '../../role-library/ao-fa-ji-hui/roles'
import { longZhengHuDouRoles as source6 } from '../../role-library/long-zheng-hu-dou/roles'
import { devoutTheistsRoles as source7 } from '../../role-library/devout-theists/roles'
import { jiuRiShuShiRoles as source8 } from '../../role-library/jiu-ri-shu-shi/roles'
import { insanityAndIntuitionRoles as source9 } from '../../role-library/insanity-and-intuition/roles'
import { badMoonRisingRoles as source10 } from '../../role-library/bad-moon-rising/roles'
import { troubleBrewingRoles as source11 } from '../../role-library/trouble-brewing/roles'
import { yeBanKuangHuanRoles as source12 } from '../../role-library/ye-ban-kuang-huan/roles'
import { baoMengMiTuanRoles as source13 } from '../../role-library/bao-meng-mi-tuan/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "trouble-brewing", sourceVersion: "sha256:102dddc141da4e829de953563b5d9370c6c71482860c756474f7e55477c56ecb", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ye-ban-kuang-huan", sourceVersion: "sha256:f512be8087e3f0b2caa971adc8d9b789cc96315f4c8bffef44423380107b3077", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedDuXianManYanSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
