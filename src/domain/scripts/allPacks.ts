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

import { preparedJiuRiChongXianSmartScriptPack } from './packs/jiu-ri-chong-xian'
import { preparedBuZhiZhiZhengSmartScriptPack } from './packs/bu-zhi-zhi-zheng'
import { preparedWangLingTongHaoHuiSmartScriptPack } from './packs/wang-ling-tong-hao-hui'
import { preparedYiCunDuanYiCunXianSmartScriptPack } from './packs/yi-cun-duan-yi-cun-xian'
import { preparedJiaFangFuChouJiSmartScriptPack } from './packs/jia-fang-fu-chou-ji'
import { preparedYouTouLaiGuoSmartScriptPack } from './packs/you-tou-lai-guo'
import { preparedFuShouChengChenSmartScriptPack } from './packs/fu-shou-cheng-chen'
import { preparedWenRunLiangYeSmartScriptPack } from './packs/wen-run-liang-ye'
import { preparedShenBuYouJiSmartScriptPack } from './packs/shen-bu-you-ji'
import { preparedQuanQiuJingSongSmartScriptPack } from './packs/quan-qiu-jing-song'

import { preparedBiYeDianLiSmartScriptPack } from './packs/bi-ye-dian-li'
import { preparedTianRuoYouQingSmartScriptPack } from './packs/tian-ruo-you-qing'
import { preparedChenKeNanFanSmartScriptPack } from './packs/chen-ke-nan-fan'
import { preparedFengKuangKeYanSmartScriptPack } from './packs/feng-kuang-ke-yan'
import { preparedDuShiShaShouHouSmartScriptPack } from './packs/du-shi-sha-shou-hou'
import { preparedHuanShouQiJingSmartScriptPack } from './packs/huan-shou-qi-jing'
import { preparedWuXianBoYiSmartScriptPack } from './packs/wu-xian-bo-yi'
import { preparedDuXianManYanSmartScriptPack } from './packs/du-xian-man-yan'
import { preparedShuXueJiaShaRenShiJianSmartScriptPack } from './packs/shu-xue-jia-sha-ren-shi-jian'

import { preparedWikiE1677e64744d2bb5SmartScriptPack } from './packs/wiki-e1677e64744d2bb5'
import { preparedWiki4a8f7390981cb0e9SmartScriptPack } from './packs/wiki-4a8f7390981cb0e9'
import { preparedWiki95b384783bb4b3d9SmartScriptPack } from './packs/wiki-95b384783bb4b3d9'
import { preparedWiki6ae3cc3d56a76434SmartScriptPack } from './packs/wiki-6ae3cc3d56a76434'
import { preparedWiki5b28e06eb2955d8eSmartScriptPack } from './packs/wiki-5b28e06eb2955d8e'
import { preparedWikiEa99f23804d8c9bbSmartScriptPack } from './packs/wiki-ea99f23804d8c9bb'
import { preparedWiki1eb0363e35dbd723SmartScriptPack } from './packs/wiki-1eb0363e35dbd723'
import { preparedWiki53b4df41d5a1079aSmartScriptPack } from './packs/wiki-53b4df41d5a1079a'
import { preparedWikiE89d6f6239a18c76SmartScriptPack } from './packs/wiki-e89d6f6239a18c76'
import { preparedWiki66ad0a0f1a38dee6SmartScriptPack } from './packs/wiki-66ad0a0f1a38dee6'
import { preparedWiki2c821085e5df4b96SmartScriptPack } from './packs/wiki-2c821085e5df4b96'
import { preparedWiki2e9bc84322f79c96SmartScriptPack } from './packs/wiki-2e9bc84322f79c96'
import { preparedWikiAdbaf66494661865SmartScriptPack } from './packs/wiki-adbaf66494661865'
import { preparedWiki6533660425b7a18bSmartScriptPack } from './packs/wiki-6533660425b7a18b'
import { preparedWikiE7f9d2e70b75b11dSmartScriptPack } from './packs/wiki-e7f9d2e70b75b11d'
import { preparedWikiB3845a927a7b48d1SmartScriptPack } from './packs/wiki-b3845a927a7b48d1'
import { preparedWiki9b83b6c53857fcf0SmartScriptPack } from './packs/wiki-9b83b6c53857fcf0'
import { preparedWikiEbf387f6f8945e24SmartScriptPack } from './packs/wiki-ebf387f6f8945e24'
import { preparedWiki208842d7c4a589adSmartScriptPack } from './packs/wiki-208842d7c4a589ad'

import { preparedWikiC7c02faa0f7569e4SmartScriptPack } from './packs/wiki-c7c02faa0f7569e4'
import { preparedWiki3eb2cb9590c7d0d5SmartScriptPack } from './packs/wiki-3eb2cb9590c7d0d5'
import { preparedWikiBed7e3ed354aaa0dSmartScriptPack } from './packs/wiki-bed7e3ed354aaa0d'
import { preparedWikiA708fb7d579e8adaSmartScriptPack } from './packs/wiki-a708fb7d579e8ada'
import { preparedWiki42c18a784ce689e9SmartScriptPack } from './packs/wiki-42c18a784ce689e9'
import { preparedWikiB96791b549a6f47aSmartScriptPack } from './packs/wiki-b96791b549a6f47a'
import { preparedWiki25a50a60d07a8b40SmartScriptPack } from './packs/wiki-25a50a60d07a8b40'
import { preparedWikiC3ac27c222a57353SmartScriptPack } from './packs/wiki-c3ac27c222a57353'
import { preparedWikiC53790b64239b119SmartScriptPack } from './packs/wiki-c53790b64239b119'
import { preparedWikiDc4a9065e297ffddSmartScriptPack } from './packs/wiki-dc4a9065e297ffdd'
import { preparedWiki2d964c6980972069SmartScriptPack } from './packs/wiki-2d964c6980972069'
import { preparedWikiD829da1a9b85c9cbSmartScriptPack } from './packs/wiki-d829da1a9b85c9cb'
import { preparedWikiDdb055dcbcca72f5SmartScriptPack } from './packs/wiki-ddb055dcbcca72f5'
import { preparedWikiBfae83e273882610SmartScriptPack } from './packs/wiki-bfae83e273882610'
import { preparedWikiFec05266799865eeSmartScriptPack } from './packs/wiki-fec05266799865ee'
import { preparedWikiAf7868116d747ac5SmartScriptPack } from './packs/wiki-af7868116d747ac5'
import { preparedWikiD313105b0e1c6424SmartScriptPack } from './packs/wiki-d313105b0e1c6424'
import { preparedWiki54608950449750c2SmartScriptPack } from './packs/wiki-54608950449750c2'
import { preparedWiki83d83637a80c8b35SmartScriptPack } from './packs/wiki-83d83637a80c8b35'
import { preparedWiki9e3516afe8c21785SmartScriptPack } from './packs/wiki-9e3516afe8c21785'
import { preparedWiki3cfb328313ddec82SmartScriptPack } from './packs/wiki-3cfb328313ddec82'
import { preparedWiki131c39f8148c7eecSmartScriptPack } from './packs/wiki-131c39f8148c7eec'
import { preparedWiki373affd84c855e0bSmartScriptPack } from './packs/wiki-373affd84c855e0b'
import { preparedWiki03b535cc7201464cSmartScriptPack } from './packs/wiki-03b535cc7201464c'
import { preparedWiki624f42be86e8de94SmartScriptPack } from './packs/wiki-624f42be86e8de94'
import { preparedWiki579c1e51159b889aSmartScriptPack } from './packs/wiki-579c1e51159b889a'
import { preparedWiki5c01c0cc12f5e4c0SmartScriptPack } from './packs/wiki-5c01c0cc12f5e4c0'
import { preparedWiki221e26eff16e4ac4SmartScriptPack } from './packs/wiki-221e26eff16e4ac4'
import { preparedWikiDd178a28103dbae2SmartScriptPack } from './packs/wiki-dd178a28103dbae2'
import { preparedWikiC1f67aadb9368a5bSmartScriptPack } from './packs/wiki-c1f67aadb9368a5b'
import { preparedWikiF7392bd0fec4cc6eSmartScriptPack } from './packs/wiki-f7392bd0fec4cc6e'
import { preparedWiki27ed3b4517d2d194SmartScriptPack } from './packs/wiki-27ed3b4517d2d194'
import { preparedWiki6cb94b3a25db5fb9SmartScriptPack } from './packs/wiki-6cb94b3a25db5fb9'
import { preparedWiki3d4ca1a93128c7d7SmartScriptPack } from './packs/wiki-3d4ca1a93128c7d7'
import { preparedWikiA488b4f1cf4eaeb7SmartScriptPack } from './packs/wiki-a488b4f1cf4eaeb7'
import { preparedWiki25af2829bee0ec08SmartScriptPack } from './packs/wiki-25af2829bee0ec08'
import { preparedWiki9efed422c2d1e88cSmartScriptPack } from './packs/wiki-9efed422c2d1e88c'
import { preparedWiki045c469020bffd03SmartScriptPack } from './packs/wiki-045c469020bffd03'
import { preparedWikiBac3d2dbc903f593SmartScriptPack } from './packs/wiki-bac3d2dbc903f593'

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
  preparedJiuRiChongXianSmartScriptPack,
  preparedBuZhiZhiZhengSmartScriptPack,
  preparedWangLingTongHaoHuiSmartScriptPack,
  preparedYiCunDuanYiCunXianSmartScriptPack,
  preparedJiaFangFuChouJiSmartScriptPack,
  preparedYouTouLaiGuoSmartScriptPack,
  preparedFuShouChengChenSmartScriptPack,
  preparedWenRunLiangYeSmartScriptPack,
  preparedShenBuYouJiSmartScriptPack,
  preparedQuanQiuJingSongSmartScriptPack,
  preparedBiYeDianLiSmartScriptPack,
  preparedTianRuoYouQingSmartScriptPack,
  preparedChenKeNanFanSmartScriptPack,
  preparedFengKuangKeYanSmartScriptPack,
  preparedDuShiShaShouHouSmartScriptPack,
  preparedHuanShouQiJingSmartScriptPack,
  preparedWuXianBoYiSmartScriptPack,
  preparedDuXianManYanSmartScriptPack,
  preparedShuXueJiaShaRenShiJianSmartScriptPack,
  preparedWikiE1677e64744d2bb5SmartScriptPack,
  preparedWiki4a8f7390981cb0e9SmartScriptPack,
  preparedWiki95b384783bb4b3d9SmartScriptPack,
  preparedWiki6ae3cc3d56a76434SmartScriptPack,
  preparedWiki5b28e06eb2955d8eSmartScriptPack,
  preparedWikiEa99f23804d8c9bbSmartScriptPack,
  preparedWiki1eb0363e35dbd723SmartScriptPack,
  preparedWiki53b4df41d5a1079aSmartScriptPack,
  preparedWikiE89d6f6239a18c76SmartScriptPack,
  preparedWiki66ad0a0f1a38dee6SmartScriptPack,
  preparedWiki2c821085e5df4b96SmartScriptPack,
  preparedWiki2e9bc84322f79c96SmartScriptPack,
  preparedWikiAdbaf66494661865SmartScriptPack,
  preparedWiki6533660425b7a18bSmartScriptPack,
  preparedWikiE7f9d2e70b75b11dSmartScriptPack,
  preparedWikiB3845a927a7b48d1SmartScriptPack,
  preparedWiki9b83b6c53857fcf0SmartScriptPack,
  preparedWikiEbf387f6f8945e24SmartScriptPack,
  preparedWiki208842d7c4a589adSmartScriptPack,
  preparedWikiC7c02faa0f7569e4SmartScriptPack,
  preparedWiki3eb2cb9590c7d0d5SmartScriptPack,
  preparedWikiBed7e3ed354aaa0dSmartScriptPack,
  preparedWikiA708fb7d579e8adaSmartScriptPack,
  preparedWiki42c18a784ce689e9SmartScriptPack,
  preparedWikiB96791b549a6f47aSmartScriptPack,
  preparedWiki25a50a60d07a8b40SmartScriptPack,
  preparedWikiC3ac27c222a57353SmartScriptPack,
  preparedWikiC53790b64239b119SmartScriptPack,
  preparedWikiDc4a9065e297ffddSmartScriptPack,
  preparedWiki2d964c6980972069SmartScriptPack,
  preparedWikiD829da1a9b85c9cbSmartScriptPack,
  preparedWikiDdb055dcbcca72f5SmartScriptPack,
  preparedWikiBfae83e273882610SmartScriptPack,
  preparedWikiFec05266799865eeSmartScriptPack,
  preparedWikiAf7868116d747ac5SmartScriptPack,
  preparedWikiD313105b0e1c6424SmartScriptPack,
  preparedWiki54608950449750c2SmartScriptPack,
  preparedWiki83d83637a80c8b35SmartScriptPack,
  preparedWiki9e3516afe8c21785SmartScriptPack,
  preparedWiki3cfb328313ddec82SmartScriptPack,
  preparedWiki131c39f8148c7eecSmartScriptPack,
  preparedWiki373affd84c855e0bSmartScriptPack,
  preparedWiki03b535cc7201464cSmartScriptPack,
  preparedWiki624f42be86e8de94SmartScriptPack,
  preparedWiki579c1e51159b889aSmartScriptPack,
  preparedWiki5c01c0cc12f5e4c0SmartScriptPack,
  preparedWiki221e26eff16e4ac4SmartScriptPack,
  preparedWikiDd178a28103dbae2SmartScriptPack,
  preparedWikiC1f67aadb9368a5bSmartScriptPack,
  preparedWikiF7392bd0fec4cc6eSmartScriptPack,
  preparedWiki27ed3b4517d2d194SmartScriptPack,
  preparedWiki6cb94b3a25db5fb9SmartScriptPack,
  preparedWiki3d4ca1a93128c7d7SmartScriptPack,
  preparedWikiA488b4f1cf4eaeb7SmartScriptPack,
  preparedWiki25af2829bee0ec08SmartScriptPack,
  preparedWiki9efed422c2d1e88cSmartScriptPack,
  preparedWiki045c469020bffd03SmartScriptPack,
  preparedWikiBac3d2dbc903f593SmartScriptPack,
] as const satisfies readonly SmartScriptPack[]

export const smartScriptPacks = sourceSmartScriptPacks.map((pack) => ({
  ...pack,
  roles: pack.roles.map((role) => ({
    ...role,
    iconPath: resolveCharacterIconPath(role),
  })),
})) satisfies readonly SmartScriptPack[]

