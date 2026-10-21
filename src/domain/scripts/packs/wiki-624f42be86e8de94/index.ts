import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { fengMaoZhiYanRoles as source0 } from '../../role-library/feng-mao-zhi-yan/roles'
import { churchOfSpiesRoles as source1 } from '../../role-library/church-of-spies/roles'
import { paXingDuShiRoles as source2 } from '../../role-library/pa-xing-du-shi/roles'
import { badMoonRisingRoles as source3 } from '../../role-library/bad-moon-rising/roles'
import { heFangJiaoZhongRoles as source4 } from '../../role-library/he-fang-jiao-zhong/roles'
import { shiSanHangRoles as source5 } from '../../role-library/shi-san-hang/roles'
import { baoZouGeBuLinRoles as source6 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source7 } from '../../role-library/ao-fa-ji-hui/roles'
import { kuMuFengChunRoles as source8 } from '../../role-library/ku-mu-feng-chun/roles'
import { jiuRiShuShiRoles as source9 } from '../../role-library/jiu-ri-shu-shi/roles'
import { insanityAndIntuitionRoles as source10 } from '../../role-library/insanity-and-intuition/roles'
import { yuZheHuanYanRoles as source11 } from '../../role-library/yu-zhe-huan-yan/roles'
import { devoutTheistsRoles as source12 } from '../../role-library/devout-theists/roles'
import { xinKouCiHuangRoles as source13 } from '../../role-library/xin-kou-ci-huang/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "he-fang-jiao-zhong", sourceVersion: "sha256:63e5b87f8058d6c25041fca52652806a894e24ad883e7a97fe07bc4925601da4", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "shi-san-hang", sourceVersion: "sha256:4537cee40664d86345fa1b20af1858768df3be233db1d41081e184dece91f0e5", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ku-mu-feng-chun", sourceVersion: "sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "yu-zhe-huan-yan", sourceVersion: "sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "xin-kou-ci-huang", sourceVersion: "sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki624f42be86e8de94SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
