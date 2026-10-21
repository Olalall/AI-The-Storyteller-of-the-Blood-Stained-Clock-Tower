import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { huaWaiZhiMinRoles as source0 } from '../../role-library/hua-wai-zhi-min/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { baoZouGeBuLinRoles as source2 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source3 } from '../../role-library/ao-fa-ji-hui/roles'
import { shiSanHangRoles as source4 } from '../../role-library/shi-san-hang/roles'
import { badMoonRisingRoles as source5 } from '../../role-library/bad-moon-rising/roles'
import { muHouCaoKongRoles as source6 } from '../../role-library/mu-hou-cao-kong/roles'
import { jiuRiShuShiRoles as source7 } from '../../role-library/jiu-ri-shu-shi/roles'
import { insanityAndIntuitionRoles as source8 } from '../../role-library/insanity-and-intuition/roles'
import { devoutTheistsRoles as source9 } from '../../role-library/devout-theists/roles'
import { quickMathsRoles as source10 } from '../../role-library/quick-maths/roles'
import { yuZheHuanYanRoles as source11 } from '../../role-library/yu-zhe-huan-yan/roles'
import { xinKouCiHuangRoles as source12 } from '../../role-library/xin-kou-ci-huang/roles'
import { xinRenShiLianRoles as source13 } from '../../role-library/xin-ren-shi-lian/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "shi-san-hang", sourceVersion: "sha256:4537cee40664d86345fa1b20af1858768df3be233db1d41081e184dece91f0e5", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "quick-maths", sourceVersion: "sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "yu-zhe-huan-yan", sourceVersion: "sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "xin-kou-ci-huang", sourceVersion: "sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "xin-ren-shi-lian", sourceVersion: "sha256:f603b4fa9757330b5f9865fa87dfacc7435232fc17f5804638ac1c31571f1d75", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki1eb0363e35dbd723SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
