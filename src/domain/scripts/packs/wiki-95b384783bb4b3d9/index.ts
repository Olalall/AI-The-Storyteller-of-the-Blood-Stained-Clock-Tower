import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { churchOfSpiesRoles as source0 } from '../../role-library/church-of-spies/roles'
import { baoZouGeBuLinRoles as source1 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source2 } from '../../role-library/ao-fa-ji-hui/roles'
import { huaWaiZhiMinRoles as source3 } from '../../role-library/hua-wai-zhi-min/roles'
import { badMoonRisingRoles as source4 } from '../../role-library/bad-moon-rising/roles'
import { devoutTheistsRoles as source5 } from '../../role-library/devout-theists/roles'
import { fengMaoZhiYanRoles as source6 } from '../../role-library/feng-mao-zhi-yan/roles'
import { insanityAndIntuitionRoles as source7 } from '../../role-library/insanity-and-intuition/roles'
import { quickMathsRoles as source8 } from '../../role-library/quick-maths/roles'
import { xinKouCiHuangRoles as source9 } from '../../role-library/xin-kou-ci-huang/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "quick-maths", sourceVersion: "sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "xin-kou-ci-huang", sourceVersion: "sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki95b384783bb4b3d9SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
