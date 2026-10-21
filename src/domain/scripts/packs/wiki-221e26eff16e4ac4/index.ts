import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { baoZouGeBuLinRoles as source0 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { insanityAndIntuitionRoles as source2 } from '../../role-library/insanity-and-intuition/roles'
import { chuanQiZhiYeRoles as source3 } from '../../role-library/chuan-qi-zhi-ye/roles'
import { huaWaiZhiMinRoles as source4 } from '../../role-library/hua-wai-zhi-min/roles'
import { devoutTheistsRoles as source5 } from '../../role-library/devout-theists/roles'
import { fengMaoZhiYanRoles as source6 } from '../../role-library/feng-mao-zhi-yan/roles'
import { daChengXiaoZhenRoles as source7 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { gaiTouHuanMianRoles as source8 } from '../../role-library/gai-tou-huan-mian/roles'
import { churchOfSpiesRoles as source9 } from '../../role-library/church-of-spies/roles'
import { erYuWoZhaRoles as source10 } from '../../role-library/er-yu-wo-zha/roles'
import { aGrimmChorusRoles as source11 } from '../../role-library/a-grimm-chorus/roles'
import { yuZheHuanYanRoles as source12 } from '../../role-library/yu-zhe-huan-yan/roles'
import { xinKouCiHuangRoles as source13 } from '../../role-library/xin-kou-ci-huang/roles'
import { baoMengMiTuanRoles as source14 } from '../../role-library/bao-meng-mi-tuan/roles'
import { punchyRoles as source15 } from '../../role-library/punchy/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "chuan-qi-zhi-ye", sourceVersion: "sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "gai-tou-huan-mian", sourceVersion: "sha256:d7833ff494f68c1819ee9ae7c2841c2e3a5b2d8a153d9301e522ba871352c05f", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "er-yu-wo-zha", sourceVersion: "sha256:7f808685e84f16b77b34a486fcf2548efbc5ef9feaa9215010ff563d742aca63", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "a-grimm-chorus", sourceVersion: "sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "yu-zhe-huan-yan", sourceVersion: "sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "xin-kou-ci-huang", sourceVersion: "sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-meng-mi-tuan", sourceVersion: "sha256:ae0069938104af40ca1b8b9bfc842293c15e68e212b0c93a5014d23bbe40486f", roles: source14.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source15.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki221e26eff16e4ac4SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
