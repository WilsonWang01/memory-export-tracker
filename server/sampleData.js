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
        "公开数据已覆盖至：SSD 与 DRAM/HBM 月度 HS 2026年4月、半导体月度 2026年4月、旬度 2026年5月1-20日；截至 2026-05-26 未配置 DATA_GO_KR_SERVICE_KEY，月度 HS 来自 KCS TradeData 官方网页核验。"
    },
    products: productConfigs,
    monthly,
    freshness: [
      {
        key: "monthly_hs",
        label: "SSD / DRAM-HBM HS 明细",
        latestPeriod: "2026年4月",
        latestReleaseDate: "KCS TradeData 官方网页已更新至 2026.04",
        nextExpectedDate: "2026年5月最终值预计 2026年6月中旬随 KCS/data.go.kr/TRASS 更新",
        status: "official_public_web",
        note:
          "Chrome 可访问 KCS TradeData 英文 By H.S Code 页面，并通过页面同源查询取得月度出口金额和 KG。SSD 改用 HS 852351（Solid-state non-volatile storage devices），旧 HSK 8471704010 在当前官方查询中无结果；DRAM/HBM 继续用 HS 854232（Memories）。"
      },
      {
        key: "monthly_semiconductor",
        label: "半导体月度总量",
        latestPeriod: "2026年4月",
        latestReleaseDate: "2026-05-15",
        nextExpectedDate: "2026-06-01 左右发布 2026年5月月度初值",
        status: "official_public",
        note: "4 月半导体出口约 319 亿美元，MOTIE 月初口径；KCS 5 月 15 日官网已发布 4 月月度确报，总出口 858.67 亿美元、同比 +48.0%，并说明半导体为主要增长驱动。"
      },
      {
        key: "ten_day_semiconductor",
        label: "半导体旬度高频",
        latestPeriod: "2026年5月1-20日",
        latestReleaseDate: "2026-05-21",
        nextExpectedDate: "2026-06-01 左右发布 2026年5月月度初值",
        status: "official_public_crosschecked",
        note:
          "KCS 官网首页与 TradeData 官方首页均显示 2026-05-21 的 5 月前 20 日暂定总量窗口；KCS 官网首页同步列示 5月1~20日总出口 52,652M 美元、总进口 41,618M 美元。官方公开文本只显示约 220 亿美元和同比 +202.1%；半导体精确金额 21,951M 美元来自多家媒体对该 KCS 简报的同日转述交叉核验。Korea.kr 与 KCS 主站新闻列表截至 2026-05-26 核验时仍未显示该原始简报。"
      },
      {
        key: "memory_provisional_detail",
        label: "存储细分旬度暂估",
        latestPeriod: "2026年5月1-20日",
        latestReleaseDate: "2026-05-21",
        nextExpectedDate: "等待 TRASS/KITA 或市场转述公开 2026年5月全月细分数据",
        status: "market_repost_trass",
        note:
          "5 月前 20 日细分来自公开券商/市场 Telegram 镜像转述的 Korean customs/TRASS 暂估；公开可核验的官方/TRASS 页面只支持总量和半导体总项，不拆分 DRAM/SSD/HBM。Memory 总额为 DRAM incl. modules + Flash memory + SSD 的派生值，MCP/HBM proxy 本轮公开源未给单位价。"
      }
    ],
    sourceRegistry: [
      {
        key: "kcs_tradedata_hs_monthly",
        section: "monthly_hs",
        sourceName: "KCS TradeData English by H.S Code monthly statistics",
        sourceUrl: "https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000",
        status: "official_public_web_verified",
        note: "Browser-visible official KCS page provides monthly HS export value in thousand USD and export weight in KG through its same-site query. Verified 2025.01-2026.04 for SSD HS 852351 and DRAM/HBM proxy HS 854232."
      },
      {
        key: "data_go_kr_itemtrade",
        section: "monthly_hs",
        sourceName: "KCS/data.go.kr Itemtrade API",
        sourceUrl: "https://www.data.go.kr/data/15101609/openapi.do?recommendDataYn=Y",
        status: "requires_DATA_GO_KR_SERVICE_KEY",
        note: "Official API source for monthly HS export value and net weight. DATA_GO_KR_SERVICE_KEY was not present in the 2026-05-26 refresh environment; data.go.kr lists this API as modified 2026-05-22 and explains monthly data is refreshed around the 15th after corrections/cancellations. Use SSD HS 852351 and DRAM/HBM proxy HS 854232 when configured."
      },
      {
        key: "kcs_home_20260520",
        section: "ten_day_semiconductor",
        sourceName: "KCS official homepage, this-month customs clearance result",
        sourceUrl: "https://www.customs.go.kr/kcs/main.do",
        status: "official_public_aggregate_verified_2026_05_26",
        note: "KCS homepage showed the current provisional clearance window as 2026-05-01 to 2026-05-20, with exports of USD 52,652M (+64.8%) and imports of USD 41,618M (+29.3%). This verifies the aggregate window used for the May 1-20 semiconductor high-frequency point but does not provide the product-level semiconductor value or memory split."
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
        key: "korea_kr_20260510",
        section: "ten_day_semiconductor",
        sourceName: "Korea.kr repost of KCS May 1-10 provisional import/export status",
        sourceUrl: "https://m.korea.kr/briefing/pressReleaseView.do?newsId=156760738&pWise=mSub&pWiseSub=C7",
        status: "official_public",
        note: "Official Korea.kr repost confirms the KCS May 1-10 provisional briefing dated 2026-05-11, including total exports of USD 18,434M (+43.7%), imports of USD 16,737M (+14.9%), and a summary statement that semiconductor exports were about USD 8.5B."
      },
      {
        key: "kcs_tradedata_20260520",
        section: "memory_provisional_detail,ten_day_semiconductor",
        sourceName: "KCS TradeData press-release list, May 1-20 provisional import/export status",
        sourceUrl: "https://www.tradedata.go.kr/cts/index.do",
        status: "official_public_aggregate",
        note: "Official KCS TradeData homepage exposes the May 1-20 provisional release entry dated 2026-05-21, and public copied text of that release shows rounded semiconductor exports of about USD 22.0B with YoY +202.1%. TRASS public homepage verifies total exports/imports; same-day media reports quoting KCS provide the exact semiconductor value of USD 21,951M. No official public page found with a DRAM/SSD/HBM split."
      },
      {
        key: "trass_public_20260520",
        section: "ten_day_semiconductor",
        sourceName: "TRASS public homepage, provisional trade summary",
        sourceUrl: "https://www.bandtrass.or.kr/index.do",
        status: "public_aggregate_only",
        note: "Public homepage shows 2026 May 1-20 provisional total exports of USD 52,652M (+64.78%) and imports of USD 41,618M (+29.28%), plus April final totals, but product-level provisional lookup is marked premium and was not publicly accessible."
      },
      {
        key: "korea_kr_20260520",
        section: "ten_day_semiconductor",
        sourceName: "Korea.kr repost search for May 1-20 KCS provisional release",
        sourceUrl: "https://www.korea.kr/",
        status: "not_found_2026_05_26",
        note: "Korea.kr search did not expose a repost of the 2026-05-21 KCS May 1-20 provisional release during the 2026-05-26 refresh; the May 1-10 KCS repost is available and was used only for the May 1-10 point."
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
        status: "temporarily_unavailable_2026_05_26",
        note: "KITA K-stat redirected to a TRACER waiting/block page from this environment during the 2026-05-26 refresh, so no KITA figures were added. KCS/data.go.kr remains the primary source for monthly HS values, and no public KITA page was available to verify a newer May monthly HS point."
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
        finalSourceName: "KCS 2026 April monthly import/export status [final]",
        finalSourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10164144&nttSnUrl=ed8853d2c2f355cc44a0d74fc1e1da7b",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        note: "KCS official page verifies the April final release date and total export context; the dashboard keeps the rounded semiconductor value from the MOTIE monthly release."
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
        sourceUrl: "https://m.korea.kr/briefing/pressReleaseView.do?newsId=156760738&pWise=mSub&pWiseSub=C7",
        attachmentFileName: "260511 26년 5월 1일 - 5월 10일 수출입현황.pdf",
        attachmentValueUnit: "USD billion rounded",
        attachmentValue: 8.5,
        overallExportValueUsd: 18_434_000_000,
        overallExportYoYPct: 43.7,
        overallImportValueUsd: 16_737_000_000,
        overallImportYoYPct: 14.9,
        tradeBalanceUsd: 1_698_000_000,
        note:
          "Official Korea.kr repost confirms the KCS May 1-10 briefing and summary semiconductor value rounded to USD 8.5B; exact semiconductor table values were not exposed in the browser-readable public text."
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
        sourceName: "KCS TradeData/TRASS May 1-20 provisional release; exact semiconductor value cross-checked via media quoting KCS",
        sourceUrl: "https://www.tradedata.go.kr/cts/index.do",
        attachmentFileName: "260521 26년 5월 1일 - 5월 20일 수출입현황.hwpx",
        attachmentValueUnit: "USD million",
        attachmentValue: 21_951,
        attachmentValueSource: "media_quote_kcs_exact",
        officialRoundedValueUsd: 22_000_000_000,
        officialRoundedValueSourceName: "Public text copy of KCS TradeData May 1-20 provisional release",
        officialRoundedValueSourceUrl: "https://richstock.tistory.com/2751",
        overallExportValueUsd: 52_652_000_000,
        overallExportYoYPct: 64.78,
        overallImportValueUsd: 41_618_000_000,
        overallImportYoYPct: 29.28,
        trassPublicSourceName: "TRASS public homepage, provisional trade summary",
        trassPublicSourceUrl: "https://www.bandtrass.or.kr/index.do",
        kcsHomepageSourceName: "KCS official homepage, this-month customs clearance result",
        kcsHomepageSourceUrl: "https://www.customs.go.kr/kcs/main.do",
        mirrorSourceUrl:
          "https://biz.chosun.com/policy/policy_sub/2026/05/21/E7LOYAUUORGTDMCJBAWY7HCZHI/?outputType=amp",
        exactValueCrossCheckSourceUrl: "https://v.daum.net/v/20260521091230243?f=p",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        note: "KCS TradeData homepage lists the 2026-05-21 provisional release and public copied text of that release gives rounded semiconductor exports of USD 22.0B with YoY +202.1%. KCS homepage and TRASS public homepage confirm the overall May 1-20 provisional trade totals. Same-day media reports quoting KCS provide the exact semiconductor value of USD 21,951M. The publicly visible official/TRASS pages do not provide a DRAM/SSD/HBM split."
      }
    ]
  };
}
