import { createRoleDefinitionLibrary } from '../../roleDefinitionLibrary'
import { createReferencedScriptPack, type ReferencedScriptDefinition } from '../../referencedScriptPack'
import { resolveCharacterIconPath } from '../../roleIconPaths'
import definition from './definition.json' with { type: 'json' }
import { baoZouGeBuLinRoles as source0 } from '../../role-library/bao-zou-ge-bu-lin/roles'
import { aoFaJiHuiRoles as source1 } from '../../role-library/ao-fa-ji-hui/roles'
import { churchOfSpiesRoles as source2 } from '../../role-library/church-of-spies/roles'
import { everyoneCanPlayRoles as source3 } from '../../role-library/everyone-can-play/roles'
import { aGrimmChorusRoles as source4 } from '../../role-library/a-grimm-chorus/roles'
import { fengMaoZhiYanRoles as source5 } from '../../role-library/feng-mao-zhi-yan/roles'
import { shiSanHangRoles as source6 } from '../../role-library/shi-san-hang/roles'
import { muHouCaoKongRoles as source7 } from '../../role-library/mu-hou-cao-kong/roles'
import { badMoonRisingRoles as source8 } from '../../role-library/bad-moon-rising/roles'
import { wuHeYouZhiXiangRoles as source9 } from '../../role-library/wu-he-you-zhi-xiang/roles'
import { longZhengHuDouRoles as source10 } from '../../role-library/long-zheng-hu-dou/roles'
import { yuZheHuanYanRoles as source11 } from '../../role-library/yu-zhe-huan-yan/roles'
const library = createRoleDefinitionLibrary([{ sourceId: "bao-zou-ge-bu-lin", sourceVersion: "sha256:ec718ff385087b6789a7b0c177f4a3fe8da78858048b37f4836044ba6f7f494f", roles: source0.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "ao-fa-ji-hui", sourceVersion: "sha256:f0dec4f76dcdfc9064d0ce2ce38eee58535688bd1ecb689f67bfc52ab64958ca", roles: source1.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "church-of-spies", sourceVersion: "sha256:e5f565d2db1ab4ff5c4485bbf5ba84fb33829a18c53b8f081e87be6d8609a5cc", roles: source2.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "everyone-can-play", sourceVersion: "sha256:0dc9c76e31a2de5dc3b1038de16aac854f263e3134bdadead2607d0709e2eb35", roles: source3.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "a-grimm-chorus", sourceVersion: "sha256:1700a2c15bba5d993f429b6f5d9e5715aeb0dd2cfb0fc2d495078ec9d3dfb22d", roles: source4.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "feng-mao-zhi-yan", sourceVersion: "sha256:66abd567cdb4622ba5ece7aef64d70ccc324a2f3537eefda92457d5cbdb2f1ab", roles: source5.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "shi-san-hang", sourceVersion: "sha256:4537cee40664d86345fa1b20af1858768df3be233db1d41081e184dece91f0e5", roles: source6.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "mu-hou-cao-kong", sourceVersion: "sha256:b77d9ce8594bfccaf5faaec7e935aa05d633d60f0fe0919af9ea37d3460428da", roles: source7.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "bad-moon-rising", sourceVersion: "sha256:948647c614fae6c5a0c05c979ae72b466995d9ee9ffc36800f88ef3d22585a3d", roles: source8.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "wu-he-you-zhi-xiang", sourceVersion: "sha256:2339a029e70a71b16a7ecad56a64051f0852b7336b9e26d1708a046ed7b30a87", roles: source9.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "long-zheng-hu-dou", sourceVersion: "sha256:5c54906cd8dd44c78f0fc1aa7050ba8e922e527c5a471eb4f167d42d3aaedb17", roles: source10.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) },
{ sourceId: "yu-zhe-huan-yan", sourceVersion: "sha256:4571db2ca9cfb548f5357a82e87a05a7c29b128678d43d4be427aa444b897e06", roles: source11.map((role) => ({ ...role, iconPath: resolveCharacterIconPath(role) })) }])
export const preparedBiYeDianLiSmartScriptPack = createReferencedScriptPack(definition as ReferencedScriptDefinition, library)
