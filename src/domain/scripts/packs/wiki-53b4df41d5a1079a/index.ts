import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { churchOfSpiesRoles as source0 } from '../../role-library/church-of-spies/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { chuanQiZhiYeRoles as source2 } from '../../role-library/chuan-qi-zhi-ye/roles'
import { sectsAndVioletsRoles as source3 } from '../../role-library/sects-and-violets/roles'
import { baoZouGeBuLinRoles as source4 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { everyoneCanPlayRoles as source5 } from '../../role-library/everyone-can-play/roles'
import { huaWaiZhiMinRoles as source6 } from '../../role-library/hua-wai-zhi-min/roles'
import { fengMaoZhiYanRoles as source7 } from '../../role-library/feng-mao-zhi-yan/roles'
import { jiuRiShuShiRoles as source8 } from '../../role-library/jiu-ri-shu-shi/roles'
import { muHouCaoKongRoles as source9 } from '../../role-library/mu-hou-cao-kong/roles'
import { insanityAndIntuitionRoles as source10 } from '../../role-library/insanity-and-intuition/roles'
import { quickMathsRoles as source11 } from '../../role-library/quick-maths/roles'
import { punchyRoles as source12 } from '../../role-library/punchy/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "chuan-qi-zhi-ye", sourceVersion: "sha256:cc4c9bb6509aed6544f4cd7964ebb93bf092a5f6f31b57c0dca7913c7aeecb1d", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "sects-and-violets", sourceVersion: "sha256:3b02f7bd81d30d2e866a8cb1ca14486f01d2a73a62da62ac17bff6f0438b3656", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "hua-wai-zhi-min", sourceVersion: "sha256:92d35caa93ce60d9845432078da0dddfca65e0e6d1faf4aa9db12ac6c857203c", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "jiu-ri-shu-shi", sourceVersion: "sha256:e277ec1aad9583021771d4654d542eb9cefb83426f388e18e19b04bf4256ebe7", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "insanity-and-intuition", sourceVersion: "sha256:0cbfe67652eff77cf336c2d68532d0a87ae46ce44b9e873a93cde22a4d02de6f", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "quick-maths", sourceVersion: "sha256:2960bb5ebba764e8cc812500a4cba1c759ef6817859e836db7121f4b89e4ae03", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "punchy", sourceVersion: "sha256:2db376682e56699246b43b787ae0f3ddef03ab3c28f678e0373fc35b08b0036c", roles: source12.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedWiki53b4df41d5a1079aSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
