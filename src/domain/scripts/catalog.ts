import type { AIRoleResearchBrief, RoleId, RoleTeam, ScriptId, SmartRoleDefinition, SmartScriptPack } from './types'
import { createScriptRegistry } from './registry'
import { resolveCharacterIconPath } from './roleIconPaths'
import { aGrimmChorusSmartScriptPack } from './packs/a-grimm-chorus'
import { anDuChenCangSmartScriptPack } from './packs/an-du-chen-cang'
import { badMoonRisingSmartScriptPack } from './packs/bad-moon-rising'
import { baLuoZhiYeSmartScriptPack } from './packs/ba-luo-zhi-ye'
import { baiZhouWeiShiSmartScriptPack } from './packs/bai-zhou-wei-shi'
import { baoMengMiTuanSmartScriptPack } from './packs/bao-meng-mi-tuan'
import { baoYueChuShengSmartScriptPack } from './packs/bao-yue-chu-sheng'
import { bingGongBanShiSmartScriptPack } from './packs/bing-gong-ban-shi'
import { catfishingSmartScriptPack } from './packs/catfishing'
import { chuanQiZhiYeSmartScriptPack } from './packs/chuan-qi-zhi-ye'
import { chouHaiNiXingSmartScriptPack } from './packs/chou-hai-ni-xing'
import { chouShenNaJiSmartScriptPack } from './packs/chou-shen-na-ji'
import { churchOfSpiesSmartScriptPack } from './packs/church-of-spies'
import { daQuanZaiWoSmartScriptPack } from './packs/da-quan-zai-wo'
import { dengXiaHuiYingSmartScriptPack } from './packs/deng-xia-hui-ying'
import { dieYingChongChongSmartScriptPack } from './packs/die-ying-chong-chong'
import { devoutTheistsSmartScriptPack } from './packs/devout-theists'
import { eMoMiChengSmartScriptPack } from './packs/e-mo-mi-cheng'
import { erYuWoZhaSmartScriptPack } from './packs/er-yu-wo-zha'
import { everyoneCanPlaySmartScriptPack } from './packs/everyone-can-play'
import { feiFanYingTianSmartScriptPack } from './packs/fei-fan-ying-tian'
import { hideAndSeekSmartScriptPack } from './packs/hide-and-seek'
import { heFangJiaoZhongSmartScriptPack } from './packs/he-fang-jiao-zhong'
import { hengXingBaDaoSmartScriptPack } from './packs/heng-xing-ba-dao'
import { guiJueYiXiangSmartScriptPack } from './packs/gui-jue-yi-xiang'
import { guLaoMoFaSmartScriptPack } from './packs/gu-lao-mo-fa'
import { haoShiDuoMoSmartScriptPack } from './packs/hao-shi-duo-mo'
import { huDuZhiZhengSmartScriptPack } from './packs/hu-du-zhi-zheng'
import { huYanLuanYuSmartScriptPack } from './packs/hu-yan-luan-yu'
import { huaFuLeiMingSmartScriptPack } from './packs/hua-fu-lei-ming'
import { huiXuanMiZhenSmartScriptPack } from './packs/hui-xuan-mi-zhen'
import { huangLiangYiMengLaoHuaDengSmartScriptPack } from './packs/huang-liang-yi-meng-lao-hua-deng'
import { douShiQiYuanLaoHuaDengSmartScriptPack } from './packs/dou-shi-qi-yuan-lao-hua-deng'
import { huoShanJiaoTuanSmartScriptPack } from './packs/huo-shan-jiao-tuan'
import { insanityAndIntuitionSmartScriptPack } from './packs/insanity-and-intuition'
import { jiMengTaXiangSmartScriptPack } from './packs/ji-meng-ta-xiang'
import { jingHouJiaYinSmartScriptPack } from './packs/jing-hou-jia-yin'
import { jiuQuanSongGeSmartScriptPack } from './packs/jiu-quan-song-ge'
import { jingJueGuGuoShenHuaSmartScriptPack } from './packs/jing-jue-gu-guo-shen-hua'
import { jiuZhuanQianCengSmartScriptPack } from './packs/jiu-zhuan-qian-ceng'
import { kuMuFengChunSmartScriptPack } from './packs/ku-mu-feng-chun'
import { lanXieJieQuSmartScriptPack } from './packs/lan-xie-jie-qu'
import { liBengLeHuaiSmartScriptPack } from './packs/li-beng-le-huai'
import { liYuanCanMengSmartScriptPack } from './packs/li-yuan-can-meng'
import { liuGongFenDaiSmartScriptPack } from './packs/liu-gong-fen-dai'
import { longZhongJinQueSmartScriptPack } from './packs/long-zhong-jin-que'
import { mingDingZaiHuoSmartScriptPack } from './packs/ming-ding-zai-huo'
import { guDaoJiuWenSmartScriptPack } from './packs/gu-dao-jiu-wen'
import { jiaoHuanRenShengSmartScriptPack } from './packs/jiao-huan-ren-sheng'
import { shengDanYeJingHunSmartScriptPack } from './packs/sheng-dan-ye-jing-hun'
import { tuiBaiCanJuSmartScriptPack } from './packs/tui-bai-can-ju'
import { lunarEclipseSmartScriptPack } from './packs/lunar-eclipse'
import { manTangHongSmartScriptPack } from './packs/man-tang-hong'
import { manTianGuoHaiSmartScriptPack } from './packs/man-tian-guo-hai'
import { miYingXunZongSmartScriptPack } from './packs/mi-ying-xun-zong'
import { miaoShanFengXianSmartScriptPack } from './packs/miao-shan-feng-xian'
import { moNiZhiJiaoSmartScriptPack } from './packs/mo-ni-zhi-jiao'
import { muSeCunZhuangSmartScriptPack } from './packs/mu-se-cun-zhuang'
import { nanNanDiYuSmartScriptPack } from './packs/nan-nan-di-yu'
import { nuoFuJiuXingSmartScriptPack } from './packs/nuo-fu-jiu-xing'
import { oneInOneOutSmartScriptPack } from './packs/one-in-one-out'
import { punchySmartScriptPack } from './packs/punchy'
import { quickMathsSmartScriptPack } from './packs/quick-maths'
import { quanMianSuQingSmartScriptPack } from './packs/quan-mian-su-qing'
import { riYueXieWangSmartScriptPack } from './packs/ri-yue-xie-wang'
import { sectsAndVioletsSmartScriptPack } from './packs/sects-and-violets'
import { shiSanHangSmartScriptPack } from './packs/shi-san-hang'
import { shiYanJiaoChiSmartScriptPack } from './packs/shi-yan-jiao-chi'
import { shengShiQiWenSmartScriptPack } from './packs/sheng-shi-qi-wen'
import { shengRiYanHuiSmartScriptPack } from './packs/sheng-ri-yan-hui'
import { siZuiChanHuiRiSmartScriptPack } from './packs/si-zui-chan-hui-ri'
import { shangDiQueXiSmartScriptPack } from './packs/shang-di-que-xi'
import { shenFenWeiJiSmartScriptPack } from './packs/shen-fen-wei-ji'
import { shuoShuRenZhiNuSmartScriptPack } from './packs/shuo-shu-ren-zhi-nu'
import { siDongFeiDongSmartScriptPack } from './packs/si-dong-fei-dong'
import { tianTangHuaYuanSmartScriptPack } from './packs/tian-tang-hua-yuan'
import { touTianHuanRiSmartScriptPack } from './packs/tou-tian-huan-ri'
import { tongYanWuJiSmartScriptPack } from './packs/tong-yan-wu-ji'
import { troubleBrewingSmartScriptPack } from './packs/trouble-brewing'
import { uncertainDeathSmartScriptPack } from './packs/uncertain-death'
import { wangBuJianWangSmartScriptPack } from './packs/wang-bu-jian-wang'
import { wenWuShuangQuanSmartScriptPack } from './packs/wen-wu-shuang-quan'
import { wuHeYouZhiXiangSmartScriptPack } from './packs/wu-he-you-zhi-xiang'
import { wuRenShengHuanSmartScriptPack } from './packs/wu-ren-sheng-huan'
import { wuYinCangShengSmartScriptPack } from './packs/wu-yin-cang-sheng'
import { wuHaiTongXingSmartScriptPack } from './packs/wu-hai-tong-xing'
import { guoJieXinYangSmartScriptPack } from './packs/guo-jie-xin-yang'
import { xianXiangHuanShengSmartScriptPack } from './packs/xian-xiang-huan-sheng'
import { xinKouCiHuangSmartScriptPack } from './packs/xin-kou-ci-huang'
import { xinRenShiLianSmartScriptPack } from './packs/xin-ren-shi-lian'
import { xinLiBoYiSmartScriptPack } from './packs/xin-li-bo-yi'
import { xueSeFengHuaSmartScriptPack } from './packs/xue-se-feng-hua'
import { xiaoErShangJiuSmartScriptPack } from './packs/xiao-er-shang-jiu'
import { xinNianJieLiPlusSmartScriptPack } from './packs/xin-nian-jie-li-plus'
import { yingSuHuaKaiSmartScriptPack } from './packs/ying-su-hua-kai'
import { yiYeYuLongWuSmartScriptPack } from './packs/yi-ye-yu-long-wu'
import { yiYanHuanYanSmartScriptPack } from './packs/yi-yan-huan-yan'
import { yiHuaJieMuSmartScriptPack } from './packs/yi-hua-jie-mu'
import { yinHeManBuSmartScriptPack } from './packs/yin-he-man-bu'
import { yiChuHaoXiLaoHuaDengSmartScriptPack } from './packs/yi-chu-hao-xi-lao-hua-deng'
import { chuChuMaoLuLaoHuaDengSmartScriptPack } from './packs/chu-chu-mao-lu-lao-hua-deng'
import { geJuMeiYingXinSmartScriptPack } from './packs/ge-ju-mei-ying-xin'
import { zhuiChaiQiYuanLaoHuaDengSmartScriptPack } from './packs/zhui-chai-qi-yuan-lao-hua-deng'
import { guiYiTongHuaXinSmartScriptPack } from './packs/gui-yi-tong-hua-xin'
import { niuZhuanQianKunSmartScriptPack } from './packs/niu-zhuan-qian-kun'
import { gaiTouHuanMianSmartScriptPack } from './packs/gai-tou-huan-mian'
import { weiNiDuZunSmartScriptPack } from './packs/wei-ni-du-zun'
import { liuAnHuaMingLaoHuaDengSmartScriptPack } from './packs/liu-an-hua-ming-lao-hua-deng'
import { yeMuJiangLinSmartScriptPack } from './packs/ye-mu-jiang-lin'
import { yeBanKuangHuanSmartScriptPack } from './packs/ye-ban-kuang-huan'
import { yaoWuYinXinSmartScriptPack } from './packs/yao-wu-yin-xin'
import { yuGaiMiZhangSmartScriptPack } from './packs/yu-gai-mi-zhang'
import { yuZheHuanYanSmartScriptPack } from './packs/yu-zhe-huan-yan'
import { zhiShouZheTianSmartScriptPack } from './packs/zhi-shou-zhe-tian'
import { zuiGeLuanWuSmartScriptPack } from './packs/zui-ge-luan-wu'
import { ziGuiQiMingSmartScriptPack } from './packs/zi-gui-qi-ming'
import { zhuoYueBiFangSmartScriptPack } from './packs/zhuo-yue-bi-fang'
import { localizedRoleAbility, localizedRolePrompt } from './role-copy'

const setupTeams = new Set<RoleTeam>(['townsfolk', 'outsider', 'minion', 'demon'])
const roleIdAliases: Readonly<Record<RoleId, RoleId>> = {
  snake_charmer: 'snakecharmer',
  pit_hag: 'pithag',
  poppy_grower: 'poppygrower',
  fang_gu: 'fanggu',
  scarlet_woman: 'scarletwoman',
  tea_lady: 'tealady',
  fortune_teller: 'fortuneteller',
  undertaker: 'undertaker',
  devils_advocate: 'devilsadvocate',
  devil_s_advocate: 'devilsadvocate',
  bounty_hunter: 'bountyhunter',
  town_crier: 'towncrier',
  evil_twin: 'eviltwin',
  'pit-hag': 'pithag',
  lil_monsta: 'lilmonsta',
  bone_collector: 'bonecollector',
  no_dashii: 'nodashii',
  al_hadikhia: 'alhadikhia',
  spirit_of_ivory: 'spiritofivory',
  high_priestess: 'highpriestess',
}

const sourceSmartScriptPacks = [
  catfishingSmartScriptPack,
  anDuChenCangSmartScriptPack,
  wuRenShengHuanSmartScriptPack,
  liuGongFenDaiSmartScriptPack,
  jingJueGuGuoShenHuaSmartScriptPack,
  xinRenShiLianSmartScriptPack,
  chouShenNaJiSmartScriptPack,
  dengXiaHuiYingSmartScriptPack,
  liYuanCanMengSmartScriptPack,
  xueSeFengHuaSmartScriptPack,
  liBengLeHuaiSmartScriptPack,
  xinNianJieLiPlusSmartScriptPack,
  dieYingChongChongSmartScriptPack,
  longZhongJinQueSmartScriptPack,
  mingDingZaiHuoSmartScriptPack,
  guDaoJiuWenSmartScriptPack,
  jiaoHuanRenShengSmartScriptPack,
  shengDanYeJingHunSmartScriptPack,
  tuiBaiCanJuSmartScriptPack,
  baLuoZhiYeSmartScriptPack,
  muSeCunZhuangSmartScriptPack,
  huaFuLeiMingSmartScriptPack,
  xiaoErShangJiuSmartScriptPack,
  guLaoMoFaSmartScriptPack,
  tongYanWuJiSmartScriptPack,
  yiYeYuLongWuSmartScriptPack,
  huangLiangYiMengLaoHuaDengSmartScriptPack,
  douShiQiYuanLaoHuaDengSmartScriptPack,
  yiChuHaoXiLaoHuaDengSmartScriptPack,
  chuChuMaoLuLaoHuaDengSmartScriptPack,
  geJuMeiYingXinSmartScriptPack,
  zhuiChaiQiYuanLaoHuaDengSmartScriptPack,
  guiYiTongHuaXinSmartScriptPack,
  niuZhuanQianKunSmartScriptPack,
  gaiTouHuanMianSmartScriptPack,
  weiNiDuZunSmartScriptPack,
  liuAnHuaMingLaoHuaDengSmartScriptPack,
  bingGongBanShiSmartScriptPack,
  troubleBrewingSmartScriptPack,
  badMoonRisingSmartScriptPack,
  sectsAndVioletsSmartScriptPack,
  oneInOneOutSmartScriptPack,
  aGrimmChorusSmartScriptPack,
  hideAndSeekSmartScriptPack,
  heFangJiaoZhongSmartScriptPack,
  hengXingBaDaoSmartScriptPack,
  guiJueYiXiangSmartScriptPack,
  haoShiDuoMoSmartScriptPack,
  siDongFeiDongSmartScriptPack,
  lunarEclipseSmartScriptPack,
  punchySmartScriptPack,
  quickMathsSmartScriptPack,
  quanMianSuQingSmartScriptPack,
  devoutTheistsSmartScriptPack,
  eMoMiChengSmartScriptPack,
  erYuWoZhaSmartScriptPack,
  everyoneCanPlaySmartScriptPack,
  uncertainDeathSmartScriptPack,
  churchOfSpiesSmartScriptPack,
  insanityAndIntuitionSmartScriptPack,
  wuHeYouZhiXiangSmartScriptPack,
  zhuoYueBiFangSmartScriptPack,
  yeMuJiangLinSmartScriptPack,
  xinLiBoYiSmartScriptPack,
  chouHaiNiXingSmartScriptPack,
  daQuanZaiWoSmartScriptPack,
  shangDiQueXiSmartScriptPack,
  siZuiChanHuiRiSmartScriptPack,
  xianXiangHuanShengSmartScriptPack,
  guoJieXinYangSmartScriptPack,
  yingSuHuaKaiSmartScriptPack,
  yeBanKuangHuanSmartScriptPack,
  yiYanHuanYanSmartScriptPack,
  nanNanDiYuSmartScriptPack,
  huDuZhiZhengSmartScriptPack,
  miaoShanFengXianSmartScriptPack,
  wenWuShuangQuanSmartScriptPack,
  riYueXieWangSmartScriptPack,
  shiSanHangSmartScriptPack,
  shiYanJiaoChiSmartScriptPack,
  shengRiYanHuiSmartScriptPack,
  shengShiQiWenSmartScriptPack,
  shenFenWeiJiSmartScriptPack,
  shuoShuRenZhiNuSmartScriptPack,
  xinKouCiHuangSmartScriptPack,
  wuYinCangShengSmartScriptPack,
  wuHaiTongXingSmartScriptPack,
  ziGuiQiMingSmartScriptPack,
  wangBuJianWangSmartScriptPack,
  jingHouJiaYinSmartScriptPack,
  moNiZhiJiaoSmartScriptPack,
  kuMuFengChunSmartScriptPack,
  feiFanYingTianSmartScriptPack,
  baiZhouWeiShiSmartScriptPack,
  jiuQuanSongGeSmartScriptPack,
  jiuZhuanQianCengSmartScriptPack,
  huYanLuanYuSmartScriptPack,
  huiXuanMiZhenSmartScriptPack,
  huoShanJiaoTuanSmartScriptPack,
  yiHuaJieMuSmartScriptPack,
  yinHeManBuSmartScriptPack,
  yaoWuYinXinSmartScriptPack,
  manTangHongSmartScriptPack,
  miYingXunZongSmartScriptPack,
  manTianGuoHaiSmartScriptPack,
  jiMengTaXiangSmartScriptPack,
  nuoFuJiuXingSmartScriptPack,
  chuanQiZhiYeSmartScriptPack,
  yuGaiMiZhangSmartScriptPack,
  yuZheHuanYanSmartScriptPack,
  zhiShouZheTianSmartScriptPack,
  zuiGeLuanWuSmartScriptPack,
  tianTangHuaYuanSmartScriptPack,
  touTianHuanRiSmartScriptPack,
  lanXieJieQuSmartScriptPack,
  baoYueChuShengSmartScriptPack,
  baoMengMiTuanSmartScriptPack,
] as const satisfies readonly SmartScriptPack[]

export const smartScriptPacks = sourceSmartScriptPacks.map((pack) => ({
  ...pack,
  roles: pack.roles.map((role) => ({
    ...role,
    iconPath: resolveCharacterIconPath(role),
  })),
})) satisfies readonly SmartScriptPack[]

export const smartScriptRegistry = createScriptRegistry(smartScriptPacks)

export function getSmartScriptPack(scriptId: ScriptId) {
  return smartScriptRegistry.get(scriptId) ?? smartScriptPacks[0]
}

export function scriptDisplayName(scriptId: ScriptId) {
  return getSmartScriptPack(scriptId).displayName
}

export function scriptKnowledgeVersion(pack: SmartScriptPack) {
  return `${pack.scriptId}/${pack.source.version ?? pack.source.contentHash}`
}

export function isSetupRole(role: SmartRoleDefinition) {
  return setupTeams.has(role.team)
}

export function setupRolesForScript(scriptId: ScriptId) {
  return getSmartScriptPack(scriptId).roles.filter(isSetupRole)
}

export function roleSnapshotsForScript(scriptId: ScriptId) {
  return setupRolesForScript(scriptId).map((role) => ({
    id: role.id,
    name: role.name,
    initial: role.name.slice(0, 1),
    iconPath: resolveCharacterIconPath(role),
  }))
}

export function roleTeamByIdForScript(scriptId: ScriptId) {
  return Object.fromEntries(setupRolesForScript(scriptId).map((role) => [role.id, role.team]))
}

export function roleAbilityForScript(scriptId: ScriptId, roleId: string) {
  const role = findRoleForScript(scriptId, roleId)
  return role ? localizedRoleAbility(role) : '角色能力待接入知识库。'
}

export function rolePromptForScript(scriptId: ScriptId, roleId: string) {
  const role = findRoleForScript(scriptId, roleId)
  return role ? localizedRolePrompt(role) : '记录选择与告知信息；不自动结算。'
}

export function roleResearchForAI(scriptId: ScriptId, roleId: RoleId): AIRoleResearchBrief | undefined {
  const role = findRoleForScript(scriptId, roleId)
  if (!role?.research) return undefined

  return {
    roleId: role.id,
    name: role.name,
    officialName: role.officialName,
    knowledgeStatus: role.knowledgeStatus,
    inputKinds: role.inputKinds.slice(0, 4),
    setupImpact: role.research.setupImpact.slice(0, 3),
    possibleOutcomes: role.research.possibleOutcomes.slice(0, 5),
    stateChanges: role.research.stateChanges.slice(0, 4),
    identityChanges: role.research.identityChanges.slice(0, 4),
    teamChanges: role.research.teamChanges.slice(0, 4),
    playerMessageTemplates: role.research.playerMessageTemplates.slice(0, 4),
    highRiskNotes: role.research.highRiskNotes.slice(0, 5),
    sourceUrls: role.research.sourceUrls.slice(0, 4),
    reviewedAt: role.research.reviewedAt,
  }
}

function findRoleForScript(scriptId: ScriptId, roleId: RoleId) {
  const canonicalRoleId = roleIdAliases[roleId] ?? roleId
  return getSmartScriptPack(scriptId).roles.find((candidate) => (
    candidate.id === roleId || candidate.id === canonicalRoleId
  ))
}
