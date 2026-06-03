import { productConfigs } from "./config.js";

const periods = [
  "2025.01",
  "2025.02",
  "2025.03",
  "2025.04",
  "2025.05",
  "2025.06",
  "2025.07",
  "2025.08",
  "2025.09",
  "2025.10",
  "2025.11",
  "2025.12",
  "2026.01",
  "2026.02",
  "2026.03",
  "2026.04"
];

const monthlyHsSource = {
  source: "official_tradedata_web",
  sourceName: "KCS TradeData English by H.S Code monthly statistics",
  sourceUrl: "https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000"
};

function makeSeries(productKey, valuesUsd, weightsKg) {
  const product = productConfigs.find((item) => item.key === productKey);
  return periods.map((period, index) => {
    const weightKg = weightsKg[index];
    const valueUsd = valuesUsd[index];
    return {
      period,
      periodLabel: period.replace(".", "-"),
      valueUsd,
      weightKg,
      unitPriceUsdPerKg: weightKg > 0 ? valueUsd / weightKg : null,
      hsCode: product.hsCode,
      productKey,
      productName: product.name,
      ...monthlyHsSource,
      status: "final"
    };
  });
}

export function buildSampleStore() {
  const monthly = [
    ...makeSeries(
      "ssd",
      [
        640_157_000,
        622_804_000,
        1_001_625_000,
        472_586_000,
        906_047_000,
        1_133_937_000,
        751_929_000,
        1_031_464_000,
        1_069_137_000,
        823_519_000,
        1_203_535_000,
        1_796_519_000,
        1_365_724_000,
        2_417_571_000,
        3_190_956_000,
        3_836_678_000
      ],
      [
        144_646,
        133_970,
        198_385,
        114_107,
        185_466,
        219_753,
        183_961,
        235_401,
        264_206,
        194_641,
        228_411,
        266_224,
        207_161,
        218_033,
        253_531,
        202_057
      ]
    ),
    ...makeSeries(
      "dram_hbm",
      [
        4_765_687_000,
        4_725_937_000,
        6_694_284_000,
        5_761_054_000,
        7_337_464_000,
        8_230_251_000,
        7_560_781_000,
        8_504_645_000,
        9_345_975_000,
        8_886_616_000,
        10_163_661_000,
        12_636_910_000,
        12_111_963_000,
        15_810_750_000,
        20_758_802_000,
        20_829_061_000
      ],
      [
        229_221,
        253_709,
        333_624,
        282_830,
        341_367,
        378_326,
        331_549,
        325_040,
        369_663,
        310_323,
        306_192,
        359_384,
        302_637,
        287_910,
        375_392,
        319_349
      ]
    )
  ];

  return {
    meta: {
      lastUpdated: new Date().toISOString(),
      nextScheduledUpdate: null,
      mode: "mixed_public",
      message:
        "公开数据已覆盖至：SSD 与 DRAM/HBM 月度 HS 2026年4月、半导体月度/高频 2026年5月全月；截至 2026-06-03 未配置 DATA_GO_KR_SERVICE_KEY，月度 HS 仍沿用 KCS TradeData 官方网页同源 JSON 查询核验值，5 月半导体全月值标记为 MOTIE/KCS 发布的媒体转述值并附 KCS 官方页面核验链接。"
    },
    products: productConfigs,
    monthly,
    freshness: [
      {
        key: "monthly_hs",
        label: "SSD / DRAM-HBM HS 明细",
        latestPeriod: "2026年4月",
        latestReleaseDate: "2026-05-31 复核：KCS TradeData 官方网页同源 JSON 查询仍更新至 2026.04，2026.05 月度 HS 尚未释放",
        nextExpectedDate: "2026年5月最终值预计 2026年6月中旬随 KCS/data.go.kr/TRASS 更新",
        status: "official_public_web",
        note:
          "KCS TradeData 英文 By H.S Code 页面同源 JSON 查询可取得月度出口金额和 KG。2026-05-31 使用 2025.01-2026.05 区间复核，SSD HS 852351 与 DRAM/HBM proxy HS 854232 均仅返回 16 个明细月度行，最后一期为 2026.04，未返回 2026.05 明细；已落库数值与官方响应一致。"
      },
      {
        key: "monthly_semiconductor",
        label: "半导体月度总量",
        latestPeriod: "2026年5月",
        latestReleaseDate: "2026-06-01",
        nextExpectedDate: "2026年5月 KCS 确报预计 2026年6月中旬；2026年6月初值预计 2026-07-01 左右",
        status: "official_public_reported",
        note:
          "KCS 2026-06-01 官方页面和 HWPX/PDF 附件确认 5 月总出口 87,747M 美元、同比 +53.2%，并以“반도체 수출 역대 최대”为标题；页面正文和附件未公开产品表精确金额。已落库半导体全月值 37,160M 美元、同比 +169.4%，来源为多家公开媒体对 MOTIE 5 月 수출입 동향的转述，并标记为 reported。"
      },
      {
        key: "ten_day_semiconductor",
        label: "半导体旬度高频",
        latestPeriod: "2026年5月全月",
        latestReleaseDate: "2026-06-01",
        nextExpectedDate: "2026-06-11 左右发布 2026年6月1-10日初值",
        status: "official_public_reported",
        note:
          "KCS 5月1~20日官方 PDF 附件仍为最新可直接读取精确半导体表的 KCS 附件，已落库半导体出口 21,951M 美元、同比 +202.1%。2026-06-01 KCS 发布 5 月全月初值，确认半导体出口创历史新高和总贸易口径；全月半导体金额 37,160M 美元、同比 +169.4% 来自 MOTIE/KCS 发布的媒体转述，因 KCS 页面/HWPX/PDF 未公开精确产品表而单独标记。"
      },
      {
        key: "memory_provisional_detail",
        label: "存储细分旬度暂估",
        latestPeriod: "2026年5月1-20日",
        latestReleaseDate: "2026-05-21",
        nextExpectedDate: "等待 TRASS/KITA 或市场转述公开 2026年5月全月细分数据",
        status: "market_repost_trass",
        note:
          "2026-05-30 复核：未发现 5月21日后新的公开存储细分暂估。5 月前 20 日细分来自公开券商/市场 Telegram 镜像转述的 Korean customs/TRASS 暂估；KCS TradeData 官方 HWPX 已核验 5 月前 20 日半导体总量，但不拆分 DRAM/SSD/HBM。Memory 总额为 DRAM incl. modules + Flash memory + SSD 的派生值，MCP/HBM proxy 本轮公开源未给单位价。"
      }
    ],
    sourceRegistry: [
      {
        key: "kcs_tradedata_hs_monthly",
        section: "monthly_hs",
        sourceName: "KCS TradeData English by H.S Code monthly statistics",
        sourceUrl: "https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000",
        status: "official_public_web_verified_2026_05_31",
        note: "Browser-visible official KCS page provides monthly HS export value in thousand USD and export weight in KG through its same-site JSON query. Re-verified 2025.01-2026.04 for SSD HS 852351 and DRAM/HBM proxy HS 854232 on 2026-05-31; querying through 2026.05 returned 16 monthly rows ending at 2026.04 and no May monthly HS row. Latest official rows remain SSD 2026.04 value 3,836,678 thousand USD / 202,057 kg and HS 854232 2026.04 value 20,829,061 thousand USD / 319,349 kg, matching the local store."
      },
      {
        key: "data_go_kr_itemtrade",
        section: "monthly_hs",
        sourceName: "KCS/data.go.kr Itemtrade API",
        sourceUrl: "https://www.data.go.kr/data/15101609/openapi.do?recommendDataYn=Y",
        status: "requires_DATA_GO_KR_SERVICE_KEY",
        note: "Official API source for monthly HS export value and net weight. DATA_GO_KR_SERVICE_KEY was not present in the 2026-06-03 refresh environment, so the API path was not used by npm run fetch. Earlier no-key endpoint verification returned 401 Unauthorized. data.go.kr lists this API as modified 2026-05-22 and explains monthly data is refreshed around the 15th after corrections/cancellations. Use SSD HS 852351 and DRAM/HBM proxy HS 854232 when configured."
      },
      {
        key: "kcs_official_202605_monthly",
        section: "monthly_semiconductor,ten_day_semiconductor",
        sourceName: "KCS official May 2026 provisional import/export status",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165743&nttSnUrl=b1fd44a499e5b2484a5de5bd2ef5fc25",
        status: "official_public_verified_2026_06_03",
        note: "KCS official release registered 2026-06-01. Browser text and HWPX/PDF attachment extraction verify May provisional exports of USD 87,747M (+53.2%), imports of USD 60,798M (+20.8%), trade surplus of USD 26,949M, average daily exports of USD 4.28B (+60.7%), and the record-high semiconductor-export headline. The KCS browser-readable files did not expose the precise semiconductor product table, so the stored semiconductor amount uses a separately labeled media-reported MOTIE/KCS value.",
        attachmentFileName: "260601 26년 5월 수출입현황(잠정치).hwpx",
        attachmentSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=dcb1462095cc58ed24a732abdba22096"
      },
      {
        key: "motie_reported_202605_semiconductor",
        section: "monthly_semiconductor,ten_day_semiconductor",
        sourceName: "MOTIE May 2026 Export-Import Trends, reported by Kyunghyang Shinmun",
        sourceUrl: "https://www.khan.co.kr/article/202606011552011",
        status: "media_reported_official_release_2026_06_03",
        note: "Used only for the precise May 2026 semiconductor product value because the KCS official release text and attachments did not include the product table. The article reports MOTIE's 2026-06-01 release with May semiconductor exports of USD 37.16B, YoY +169.4%, and share of total exports at 42.3%; the same value was cross-checked against multiple contemporaneous Korean reports."
      },
      {
        key: "kcs_official_20260520",
        section: "ten_day_semiconductor",
        sourceName: "KCS official May 1-20 provisional import/export status",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165324&nttSnUrl=25f1515a1723a16d1aaea2ff9d6f3a6a",
        status: "official_public_verified_2026_05_31",
        note: "KCS official page was registered 2026-05-27 and includes PDF/HWPX attachments named 260521. The page verifies the May 1-20 aggregate total and rounded semiconductor figure; the official PDF attachment URL remained reachable on 2026-05-31. The stored exact semiconductor export value remains USD 21,951M and YoY +202.1% from the official PDF attachment."
      },
      {
        key: "kcs_official_press_list_20260601",
        section: "ten_day_semiconductor",
        sourceName: "KCS official press-release list",
        sourceUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        status: "official_public_checked_2026_06_03",
        note: "KCS official press-release list page 1 was checked on 2026-06-03. The latest export-status release after the May 1-20 briefing is 2026년 5월 수출입 현황 [잠정치], registered 2026-06-01 with nttSn 10165743."
      },
      {
        key: "korea_ict_202604",
        section: "memory_provisional_detail,monthly_hs_context",
        sourceName: "Korea.kr / MSIT April 2026 ICT export-import trends",
        sourceUrl: "https://m.korea.kr/news/pressReleaseView.do?newsId=156761512&pWise=mSub&pWiseSub=C2",
        status: "official_public_context",
        note: "Official public context for April ICT exports, including SSD export value of USD 3.84B and semiconductor/memory market-price commentary; it does not provide HS net weight or USD/kg."
      },
      {
        key: "kcs_tradedata_20260520",
        section: "memory_provisional_detail,ten_day_semiconductor",
        sourceName: "KCS TradeData press-release list, May 1-20 provisional import/export status",
        sourceUrl: "https://www.tradedata.go.kr/cts/index.do",
        status: "official_public_list_verified_2026_05_31",
        note: "Official KCS TradeData homepage exposes the May 1-20 provisional aggregate table: exports USD 52,652M (+64.8%) and imports USD 41,618M (+29.3%). The KCS main-site detail page and attachment remain the primary source for the exact semiconductor high-frequency point. No official public page found with a DRAM/SSD/HBM split."
      },
      {
        key: "trass_public_20260520",
        section: "ten_day_semiconductor",
        sourceName: "TRASS public homepage, provisional trade summary",
        sourceUrl: "https://www.bandtrass.or.kr/index.do",
        status: "public_aggregate_only",
        note: "Public homepage rechecked 2026-05-31 shows 2026 May 1-20 provisional total exports of USD 52,652M (+64.78%) and imports of USD 41,618M (+29.28%). Public notices show 2026 April final data built on 2026-05-15. Public widgets do not expose export values for semiconductor/memory splits; product-level provisional lookup is marked premium and was not publicly accessible."
      },
      {
        key: "korea_kr_20260520",
        section: "ten_day_semiconductor",
        sourceName: "Korea.kr repost search for May 1-20 KCS provisional release",
        sourceUrl: "https://www.korea.kr/",
        status: "not_found_2026_06_03",
        note: "Korea.kr search did not expose a repost of the 2026-05-21/2026-05-27 KCS May 1-20 provisional release or the 2026-06-01 KCS May full-month provisional release during this refresh; the May 1-10 KCS repost is available and was used only for the May 1-10 point."
      },
      {
        key: "sk_securities_20260520_memory_detail",
        section: "memory_provisional_detail",
        sourceName: "SK Securities Semiconductor Telegram mirror, May 1-20 provisional semiconductor exports",
        sourceUrl: "https://t.me/s/skitteam/3951",
        status: "market_repost_trass",
        note: "Public mirror reports May 1-20 DRAM, DRAM module, NAND, MCP, and SSD export values with MoM/QoQ, and states the content is a public release. Used where official KCS source does not disclose product splits."
      },
      {
        key: "market_mirror_20260520_unit_price",
        section: "memory_provisional_detail",
        sourceName: "Market Telegram mirror of May 1-20 Korean semiconductor export table",
        sourceUrl: "https://t.me/s/bornlupin/18175",
        status: "market_repost_trass",
        note: "Public mirror reports May 1-20 DRAM incl./excl. modules, flash memory, and SSD export value, YoY, MoM, and USD/kg unit-price changes."
      },
      {
        key: "kita_kstat_public",
        section: "monthly_hs_context",
        sourceName: "KITA K-stat public page",
        sourceUrl: "https://stat.kita.net/newMain.screen",
        status: "public_home_accessible_not_used_for_new_values",
        note: "KITA K-stat public homepage was accessible during the 2026-05-31 refresh, but no KITA figure was needed or added because KCS official pages and attachments supplied the high-frequency data and KCS TradeData remains the primary monthly HS source."
      }
    ],
    officialMonthly: [
      {
        period: "2026.03",
        periodLabel: "2026年3月",
        valueUsd: 32_829_000_000,
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "MOTIE March 2026 Export-Import Trends, reported by Seoul Economic Daily",
        sourceUrl: "https://en.sedaily.com/news/2026/04/01/semiconductor-power-defies-war-monthly-exports-toward"
      },
      {
        period: "2026.04",
        periodLabel: "2026年4月",
        valueUsd: 31_900_000_000,
        valueYoYPct: 173.5,
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "MOTIE April 2026 Export-Import Trends; KCS final April release listed 2026-05-15",
        sourceUrl: "https://www.asiae.co.kr/en/article/IT/2026050109205280402",
        finalSourceName: "KCS 2026 April monthly import/export status [final], reposted by NLIC",
        finalSourceUrl: "https://www.nlic.go.kr/nlic/logpolDt.action?command=VIEW&fldLogpolRefSeq=1941",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        note: "KCS official page verifies the April final release date and total export context; the dashboard keeps the rounded semiconductor value from the MOTIE monthly release."
      },
      {
        period: "2026.05",
        periodLabel: "2026年5月",
        valueUsd: 37_160_000_000,
        valueYoYPct: 169.4,
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_reported",
        status: "preliminary",
        sourceName: "MOTIE May 2026 Export-Import Trends, reported by Kyunghyang Shinmun",
        sourceUrl: "https://www.khan.co.kr/article/202606011552011",
        officialKcsSourceName: "KCS official May 2026 provisional import/export status",
        officialKcsSourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165743&nttSnUrl=b1fd44a499e5b2484a5de5bd2ef5fc25",
        note:
          "KCS official page verifies the May full-month provisional release, overall trade totals, and record-high semiconductor-export headline. The precise product amount is retained as a reported MOTIE/KCS-release value because the KCS page and HWPX/PDF attachment did not expose the product table."
      }
    ],
    memoryDetail: [
      {
        period: "2026.05-1~20",
        periodLabel: "2026年5月前20日",
        category: "Memory ex-MCP (derived)",
        exportValueUsd: 14_705_000_000,
        exportValueYoYPct: 450.0,
        exportValueMoMPct: 23.4,
        unitPriceUsdPerKg: 46_822,
        unitPriceYoYPct: 388.1,
        unitPriceMoMPct: 14.3,
        source: "market_repost_trass_derived",
        sourceName: "Derived from May 1-20 DRAM incl. modules + Flash memory + SSD values and unit prices in public market mirrors",
        sourceUrl: "https://t.me/s/bornlupin/18175"
      },
      {
        period: "2026.05-1~20",
        periodLabel: "2026年5月前20日",
        category: "DRAM incl. modules",
        exportValueUsd: 11_527_000_000,
        exportValueYoYPct: 498,
        exportValueMoMPct: 27,
        unitPriceUsdPerKg: 60_319,
        unitPriceYoYPct: 432,
        unitPriceMoMPct: 5,
        source: "market_repost_trass",
        sourceName: "Market Telegram mirror; cites May 1-20 Korean semiconductor export table",
        sourceUrl: "https://t.me/s/bornlupin/18175"
      },
      {
        period: "2026.05-1~20",
        periodLabel: "2026年5月前20日",
        category: "DRAM excl. modules",
        exportValueUsd: 7_488_000_000,
        exportValueYoYPct: 431,
        exportValueMoMPct: 26,
        unitPriceUsdPerKg: 82_820,
        unitPriceYoYPct: 497,
        unitPriceMoMPct: 13,
        source: "market_repost_trass",
        sourceName: "Market Telegram mirror; cites May 1-20 Korean semiconductor export table",
        sourceUrl: "https://t.me/s/bornlupin/18175"
      },
      {
        period: "2026.05-1~20",
        periodLabel: "2026年5月前20日",
        category: "Flash memory",
        exportValueUsd: 954_000_000,
        exportValueYoYPct: 178,
        exportValueMoMPct: 7,
        unitPriceUsdPerKg: 54_716,
        unitPriceYoYPct: 280,
        unitPriceMoMPct: 23,
        source: "market_repost_trass",
        sourceName: "Market Telegram mirror; cites May 1-20 Korean semiconductor export table",
        sourceUrl: "https://t.me/s/bornlupin/18175"
      },
      {
        period: "2026.05-1~20",
        periodLabel: "2026年5月前20日",
        category: "SSD",
        exportValueUsd: 2_224_000_000,
        exportValueYoYPct: 452,
        exportValueMoMPct: 14.1,
        unitPriceUsdPerKg: 21_075,
        unitPriceYoYPct: 344,
        unitPriceMoMPct: 22,
        source: "market_repost_trass",
        sourceName: "SK Securities value table and market Telegram unit-price mirror; cites May 1-20 Korean semiconductor export table",
        sourceUrl: "https://t.me/s/bornlupin/18175",
        crossCheckSourceUrl: "https://t.me/s/skitteam/3951"
      },
      {
        period: "2026.05-1~20",
        periodLabel: "2026年5月前20日",
        category: "MCP / HBM proxy",
        exportValueUsd: 4_860_000_000,
        exportValueYoYPct: null,
        exportValueMoMPct: 30,
        unitPriceUsdPerKg: null,
        unitPriceYoYPct: null,
        unitPriceMoMPct: null,
        source: "market_repost_trass",
        sourceName: "SK Securities Semiconductor Telegram mirror; May 1-20 MCP provisional value table",
        sourceUrl: "https://t.me/s/skitteam/3951"
      }
    ],
    preliminary: [
      {
        period: "2026.01-1~20",
        periodLabel: "1月前20日",
        valueUsd: 10_732_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_derived",
        status: "preliminary",
        sourceName: "KCS 2026-01-20 brief, reposted by Yonhap/Investing",
        sourceUrl: "https://kr.investing.com/news/economy-news/article-1791872"
      },
      {
        period: "2026.02-1~20",
        periodLabel: "2月前20日",
        valueUsd: 15_115_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_derived",
        status: "preliminary",
        sourceName: "KCS 2026-02-20 brief, reported by YTN/Daum",
        sourceUrl: "https://v.daum.net/v/3mrUUCqFTp"
      },
      {
        period: "2026.03-1~10",
        periodLabel: "3月前10日",
        valueUsd: 7_600_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "KCS 2026-03-10 brief",
        sourceUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10157444&nttSnUrl=fe825dff8cfc646ef2cc339174b85d9d"
      },
      {
        period: "2026.03-1~20",
        periodLabel: "3月前20日",
        valueUsd: 18_700_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "KCS 2026-03-20 brief",
        sourceUrl: "https://news.nate.com/view/20260323n07476"
      },
      {
        period: "2026.04-1~10",
        periodLabel: "4月前10日",
        valueUsd: 8_600_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "KCS / Korea.kr 2026-04-13 April 1-10 brief",
        sourceUrl: "https://m.korea.kr/news/pressReleaseView.do?newsId=156754147&pWise=mSub&pWiseSub=C5"
      },
      {
        period: "2026.04-1~20",
        periodLabel: "4月前20日",
        valueUsd: 18_300_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "KCS 2026-04-20 brief",
        sourceUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10161842&nttSnUrl=08ddacd727036284aa6c92dcbc73ada5"
      },
      {
        period: "2026.05-1~10",
        periodLabel: "5月前10日",
        valueUsd: 8_500_000_000,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public",
        status: "preliminary",
        sourceName: "KCS / Korea.kr 2026-05-11 May 1-10 brief",
        sourceUrl: "https://m.korea.kr/briefing/pressReleaseView.do?newsId=156760738&pWise=mSub&pWiseSub=C7"
      },
      {
        period: "2026.05-1~20",
        periodLabel: "5月前20日",
        valueUsd: 21_951_000_000,
        valueYoYPct: 202.1,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_crosschecked",
        status: "preliminary",
        sourceName: "KCS TradeData May 1-20 provisional release listing",
        sourceUrl: "https://www.tradedata.go.kr/cts/index.do",
        attachmentFileName: "260521 26년 5월 1일 - 5월 20일 수출입현황.hwpx",
        attachmentValueUnit: "USD million",
        attachmentValue: 21_951,
        mirrorSourceUrl:
          "https://biz.chosun.com/policy/policy_sub/2026/05/21/E7LOYAUUORGTDMCJBAWY7HCZHI/?outputType=amp",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        note: "KCS official page summary gives rounded semiconductor exports of USD 22.0B; the downloadable official PDF attachment provides the exact semiconductor value of USD 21,951M and YoY +202.1%. TRASS public homepage cross-checks the overall May 1-20 provisional trade totals. The publicly visible official/TRASS pages do not provide a DRAM/SSD/HBM split."
      },
      {
        period: "2026.05",
        periodLabel: "5月全月",
        valueUsd: 37_160_000_000,
        valueYoYPct: 169.4,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_reported",
        status: "preliminary",
        sourceName: "MOTIE May 2026 Export-Import Trends, reported by Kyunghyang Shinmun",
        sourceUrl: "https://www.khan.co.kr/article/202606011552011",
        officialKcsSourceName: "KCS official May 2026 provisional import/export status",
        officialKcsSourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165743&nttSnUrl=b1fd44a499e5b2484a5de5bd2ef5fc25",
        attachmentFileName: "260601 26년 5월 수출입현황(잠정치).hwpx",
        attachmentSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=dcb1462095cc58ed24a732abdba22096",
        overallExportValueUsd: 87_747_000_000,
        overallExportYoYPct: 53.2,
        overallImportValueUsd: 60_798_000_000,
        overallImportYoYPct: 20.8,
        tradeBalanceUsd: 26_949_000_000,
        averageDailyExportValueUsd: 4_280_000_000,
        averageDailyExportYoYPct: 60.7,
        note:
          "KCS official detail and attachment extraction verify the May full-month release, overall trade totals, and record-high semiconductor headline; exact semiconductor amount and YoY are marked as reported because the KCS browser-readable files did not include the product table."
      }
    ]
  };
}
