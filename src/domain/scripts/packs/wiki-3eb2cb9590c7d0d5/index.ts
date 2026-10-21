import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { aoFaJiHuiRoles as source0 } from '../../role-library/ao-fa-ji-hui/roles'
import { everyoneCanPlayRoles as source1 } from '../../role-library/everyone-can-play/roles'
import { badMoonRisingRoles as source2 } from '../../role-library/bad-moon-rising/roles'
import { paXingDuShiRoles as source3 } from '../../role-library/pa-xing-du-shi/roles'
import { baoZouGeBuLinRoles as source4 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { longZhengHuDouRoles as source5 } from '../../role-library/long-zheng-hu-dou/roles'
import { fengMaoZhiYanRoles as source6 } from '../../role-library/feng-mao-zhi-yan/roles'
import { kuMuFengChunRoles as source7 } from '../../role-library/ku-mu-feng-chun/roles'
import { wuHeYouZhiXiangRoles as source8 } from '../../role-library/wu-he-you-zhi-xiang/roles'
import { aGrimmChorusRoles as source9 } from '../../role-library/a-grimm-chorus/roles'
import { insanityAndIntuitionRoles as source10 } from '../../role-library/insanity-and-intuition/roles'
import { zhiShouZheTianRoles as source11 } from '../../role-library/zhi-shou-zhe-tian/roles'
import { quickMathsRoles as source12 } from '../../role-library/quick-maths/roles'
import { punchyRoles as source13 } from '../../role-library/punchy/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "pa-xing-du-shi", sourceVersion: "sha256:73f3f88be9401010c713ef346a8fe3ef98369e40735f0b679cde287a4c5cedac", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ku-mu-feng-chun", sourceVersion: "sha256:219a954bddff7d34db1947d630200fedb2e40e7475d809f20a435fc76943e810", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "wu-he-you-zhi-xiang", sourceVersion: "sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "a-grimm-chorus", sourceVersion: "sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "zhi-shou-zhe-tian", sourceVersion: "sha256:4238810a6fb68f2daa965e332d1be23dd5f61299b49bd179a6937dd2692e68d2", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "quick-maths", sourceVersion: "sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source13.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki3eb2cb9590c7d0d5SmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
