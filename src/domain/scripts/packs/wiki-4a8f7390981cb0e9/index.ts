import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { insanityAndIntuitionRoles as source0 } from '../../role-library/insanity-and-intuition/roles'
import { hideAndSeekRoles as source1 } from '../../role-library/hide-and-seek/roles'
import { baoZouGeBuLinRoles as source2 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { churchOfSpiesRoles as source3 } from '../../role-library/church-of-spies/roles'
import { aoFaJiHuiRoles as source4 } from '../../role-library/ao-fa-ji-hui/roles'
import { punchyRoles as source5 } from '../../role-library/punchy/roles'
import { devoutTheistsRoles as source6 } from '../../role-library/devout-theists/roles'
import { kuMuFengChunRoles as source7 } from '../../role-library/ku-mu-feng-chun/roles'
import { daChengXiaoZhenRoles as source8 } from '../../role-library/da-cheng-xiao-zhen/roles'
import { quickMathsRoles as source9 } from '../../role-library/quick-maths/roles'
import { badMoonRisingRoles as source10 } from '../../role-library/bad-moon-rising/roles'
import { xinKouCiHuangRoles as source11 } from '../../role-library/xin-kou-ci-huang/roles'
import { zhiShouZheTianRoles as source12 } from '../../role-library/zhi-shou-zhe-tian/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hide-and-seek", sourceVersion: "sha256:d50e711952349f51adc87356c2a3a1e29991bc131b906a5c49a795fd50f9c823", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "devout-theists", sourceVersion: "sha256:fbf82db75ccfdcf0c211c0aa9318faacb29fbe3a5e967a45dc162c624b465683", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ku-mu-feng-chun", sourceVersion: "sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "da-cheng-xiao-zhen", sourceVersion: "sha256:caffb90244367ea48d6c11a921f108feb109d2e396b6a375748df8b6f05ff6f3", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "quick-maths", sourceVersion: "sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "xin-kou-ci-huang", sourceVersion: "sha256:4397c0506ab8e254b135a0610c1b096a8304925c86694e953514adf67ab1cd69", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "zhi-shou-zhe-tian", sourceVersion: "sha256:4238810a6fb68f2daa965e332d1be23dd5f61299b49bd179a6937dd2692e68d2", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki4a8f7390981cb0e9SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
