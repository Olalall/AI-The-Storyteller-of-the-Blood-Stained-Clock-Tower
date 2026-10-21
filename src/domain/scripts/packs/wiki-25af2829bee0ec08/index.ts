import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { yeBanKuangHuanRoles as source0 } from '../../role-library/ye-ban-kuang-huan/roles'
import { baoZouGeBuLinRoles as source1 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { churchOfSpiesRoles as source2 } from '../../role-library/church-of-spies/roles'
import { huaWaiZhiMinRoles as source3 } from '../../role-library/hua-wai-zhi-min/roles'
import { everyoneCanPlayRoles as source4 } from '../../role-library/everyone-can-play/roles'
import { aoFaJiHuiRoles as source5 } from '../../role-library/ao-fa-ji-hui/roles'
import { devoutTheistsRoles as source6 } from '../../role-library/devout-theists/roles'
import { insanityAndIntuitionRoles as source7 } from '../../role-library/insanity-and-intuition/roles'
import { gaiTouHuanMianRoles as source8 } from '../../role-library/gai-tou-huan-mian/roles'
import { daChengXiaoZhenRoles as source9 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { badMoonRisingRoles as source10 } from '../../role-library/bad-moon-rising/roles'
import { longZhengHuDouRoles as source11 } from '../../role-library/long-zheng-hu-dou/roles'
import { sectsAndVioletsRoles as source12 } from '../../role-library/sects-and-violets/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "ye-ban-kuang-huan", sourceVersion: "sha256:f512be8087e3f0b2caa971adc8d9b789cc96315f4c8bffef44423380107b3077", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "gai-tou-huan-mian", sourceVersion: "sha256:d7833ff494f68c1819ee9ae7c2841c2e3a5b2d8a153d9301e522ba871352c05f", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki25af2829bee0ec08SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
