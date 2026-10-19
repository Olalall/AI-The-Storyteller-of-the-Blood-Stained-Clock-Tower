// 完整资料入口仅供离线生成与全量验收；浏览器使用 catalog 的按需接口。
import type { SmartScriptPack } from './types'
import { fengMaoZhiYanSmartScriptPack } from './packs/feng-mao-zhi-yan'
import { tanHuSeBianSmartScriptPack } from './packs/tan-hu-se-bian'
import { yanBuYouZhongSmartScriptPack } from './packs/yan-bu-you-zhong'
import { jiuRiShuShiSmartScriptPack } from './packs/jiu-ri-shu-shi'
import { zhuiFengZhuRiSmartScriptPack } from './packs/zhui-feng-zhu-ri'
import { xiongGuiNanBianSmartScriptPack } from './packs/xiong-gui-nan-bian'
import { weiWangGuiLaiSmartScriptPack } from './packs/wei-wang-gui-lai'
import { huaWaiZhiMinSmartScriptPack } from './packs/hua-wai-zhi-min'
import { baoZouGeBuLinSmartScriptPack } from './packs/bao-zou-ge-bu-lin'
import { longZhengHuDouSmartScriptPack } from './packs/long-zheng-hu-dou'
import { paXingDuShiSmartScriptPack } from './packs/pa-xing-du-shi'
import { daChengXiaoZhenSmartScriptPack } from './packs/da-cheng-xiao-zhen'
import { yiGeXueBuSmartScriptPack } from './packs/yi-ge-xue-bu'
import { yeJingGengShenSmartScriptPack } from './packs/ye-jing-geng-shen'
import { shenShiXieMuSmartScriptPack } from './packs/shen-shi-xie-mu'
import { shiYuYuanWeiSmartScriptPack } from './packs/shi-yu-yuan-wei'
import { aoFaJiHuiSmartScriptPack } from './packs/ao-fa-ji-hui'
import { muHouCaoKongSmartScriptPack } from './packs/mu-hou-cao-kong'
import { yiZhiDuXiuSmartScriptPack } from './packs/yi-zhi-du-xiu'
import { meiYuLianZhuSmartScriptPack } from './packs/mei-yu-lian-zhu'
import { tongXiaoDaDanSmartScriptPack } from './packs/tong-xiao-da-dan'
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
  yiGeXueBuSmartScriptPack,
  yeJingGengShenSmartScriptPack,
  shenShiXieMuSmartScriptPack,
  shiYuYuanWeiSmartScriptPack,
  aoFaJiHuiSmartScriptPack,
  muHouCaoKongSmartScriptPack,
  yiZhiDuXiuSmartScriptPack,
  meiYuLianZhuSmartScriptPack,
  tongXiaoDaDanSmartScriptPack,
  jiuRiShuShiSmartScriptPack,
  zhuiFengZhuRiSmartScriptPack,
  xiongGuiNanBianSmartScriptPack,
  weiWangGuiLaiSmartScriptPack,
  huaWaiZhiMinSmartScriptPack,
  baoZouGeBuLinSmartScriptPack,
  longZhengHuDouSmartScriptPack,
  paXingDuShiSmartScriptPack,
  daChengXiaoZhenSmartScriptPack,
  fengMaoZhiYanSmartScriptPack,
  tanHuSeBianSmartScriptPack,
  yanBuYouZhongSmartScriptPack,
] as const satisfies readonly SmartScriptPack[]

export const smartScriptPacks = sourceSmartScriptPacks.map((pack) => ({
  ...pack,
  roles: pack.roles.map((role) => ({
    ...role,
    iconPath: resolveCharacterIconPath(role),
  })),
})) satisfies readonly SmartScriptPack[]

