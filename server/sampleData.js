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
  "2026.03"
];

function makeSeries(productKey, values, weights) {
  const product = productConfigs.find((item) => item.key === productKey);
  return periods.map((period, index) => {
    const weightKg = weights[index] * 1_000;
    const valueUsd = values[index] * 1_000_000;
    return {
      period,
      periodLabel: period.replace(".", "-"),
      valueUsd,
      weightKg,
      unitPriceUsdPerKg: weightKg > 0 ? valueUsd / weightKg : null,
      hsCode: product.hsCode,
      productKey,
      productName: product.name,
      source: "sample",
      status: "final"
    };
  });
}

export function buildSampleStore() {
  const monthly = [
    ...makeSeries(
      "ssd",
      [680, 705, 742, 771, 815, 836, 861, 902, 930, 975, 1016, 1054, 1098, 1162, 1238],
      [18.8, 18.4, 18.1, 17.8, 17.6, 17.2, 16.9, 16.7, 16.4, 16.0, 15.7, 15.3, 15.0, 14.8, 14.4]
    ),
    ...makeSeries(
      "dram_hbm",
      [5600, 5920, 6350, 6820, 7210, 7480, 7820, 8160, 8510, 9120, 9680, 10180, 10940, 11860, 12680],
      [92, 91, 89, 86, 84, 82, 79, 77, 74, 71, 69, 66, 63, 60, 58]
    )
  ];

  return {
    meta: {
      lastUpdated: new Date().toISOString(),
      nextScheduledUpdate: null,
      mode: "mixed_public",
      message:
        "公开数据已覆盖至：半导体月度 2026年4月、旬度 2026年5月1-20日；两处缺口已补充官方/可更新来源说明，SSD 与 DRAM/HBM 月度 HS 单价仍需 DATA_GO_KR_SERVICE_KEY 后自动替换。"
    },
    products: productConfigs,
    monthly,
    freshness: [
      {
        key: "monthly_hs",
        label: "SSD / DRAM-HBM HS 明细",
        latestPeriod: "样例至 2026年3月",
        latestReleaseDate: "DATA_GO_KR_SERVICE_KEY 未配置，待授权接口核验",
        nextExpectedDate: "配置 data.go.kr key 后拉取 2026年4月最终值",
        status: "needs_api_key",
        note:
          "真正可更新源是 KCS/data.go.kr Itemtrade API，可按 HS 8471704010 与 854232 拉取出口金额和净重并计算单价；KITA/K-stat 公开页可见 2026.04 更新和 854232 国家分布，但本轮未取得月度净重明细。Korea.kr 4 月 ICT 月报可核验 SSD 出口金额 38.4 亿美元，但不含净重/美元每公斤。"
      },
      {
        key: "monthly_semiconductor",
        label: "半导体月度总量",
        latestPeriod: "2026年4月",
        latestReleaseDate: "2026-05-15",
        nextExpectedDate: "2026-06-01 左右发布 2026年5月月度初值",
        status: "official_public",
        note: "4 月半导体出口约 319 亿美元，MOTIE 月初口径；KCS 5 月 15 日官网列表已发布 4 月月度确报。"
      },
      {
        key: "ten_day_semiconductor",
        label: "半导体旬度高频",
        latestPeriod: "2026年5月1-20日",
        latestReleaseDate: "2026-05-21",
        nextExpectedDate: "2026-06-01 左右发布 2026年5月月度初值",
        status: "official_repost_pending_primary",
        note: "5 月前 20 日值来自 2026-05-21 媒体转述的 KCS 暂定值；KCS 官网新闻列表截至核验时仍未显示该原始简报。"
      },
      {
        key: "memory_provisional_detail",
        label: "存储细分旬度暂估",
        latestPeriod: "2026年5月1-10日",
        latestReleaseDate: "2026-05-11",
        nextExpectedDate: "等待 TRASS/KITA 或市场转述公开 2026年5月1-20日细分数据",
        status: "market_repost_trass",
        note:
          "当前卡片仍是市场渠道转述 TRASS/Korean customs 的 5 月前 10 日存储细分暂估；KCS TradeData 已公开 5 月前 20 日半导体总量入口，但不拆分 DRAM/SSD/HBM。Korea.kr 4 月 ICT 月报可作为月度 SSD/存储背景参照，不能替代旬度细分。"
      }
    ],
    sourceRegistry: [
      {
        key: "data_go_kr_itemtrade",
        section: "monthly_hs",
        sourceName: "KCS/data.go.kr Itemtrade API",
        sourceUrl: "https://www.data.go.kr/data/15101609/openapi.do?recommendDataYn=Y",
        status: "requires_DATA_GO_KR_SERVICE_KEY",
        note: "Official API source for monthly HS export value and net weight. Required for SSD 8471704010 and DRAM/HBM proxy 854232 unit-price calculation."
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
        status: "official_public_aggregate",
        note: "Official KCS TradeData homepage exposes the May 1-20 provisional release entry and HWPX attachment; attachment reports semiconductor exports of USD 21,951M, YoY +202.1%, but does not provide the DRAM/SSD/HBM split used in memory detail cards."
      },
      {
        key: "kita_kstat_public",
        section: "monthly_hs_context",
        sourceName: "KITA K-stat public page",
        sourceUrl: "https://stat.kita.net/newMain.screen",
        status: "official_or_industry_public_partial",
        note: "Browser-visible public page showed Korea data updated to 2026.04 and an 854232 export-by-country widget, but not the monthly net-weight fields needed for USD/kg."
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
        note: "KCS official list verifies the April final release date; the dashboard keeps the rounded semiconductor value from the MOTIE monthly release."
      }
    ],
    memoryDetail: [
      {
        period: "2026.05-1~10",
        periodLabel: "2026年5月前10日",
        category: "Memory",
        exportValueUsd: 6_231_900_000,
        exportValueYoYPct: 253.7,
        exportValueMoMPct: 13.5,
        unitPriceUsdPerKg: 82_680,
        unitPriceYoYPct: 326.3,
        unitPriceMoMPct: 28.8,
        source: "market_repost_trass",
        sourceName: "Wccftech / market repost citing provisional Korean customs statistics",
        sourceUrl: "https://wccftech.com/koreas-dram-nand-export-massive-prices-bump-versus-last-month-ssd-memory-up-63-percent/"
      },
      {
        period: "2026.05-1~10",
        periodLabel: "2026年5月前10日",
        category: "DRAM incl. modules",
        exportValueUsd: 4_366_000_000,
        exportValueYoYPct: 375,
        exportValueMoMPct: 4,
        unitPriceUsdPerKg: 63_961,
        unitPriceYoYPct: 441,
        unitPriceMoMPct: 16,
        source: "market_repost_trass",
        sourceName: "Meritz Tech repost, via Telegram mirrors; cites May 1-10 provisional semiconductor export statistics",
        sourceUrl: "https://t.me/s/bornlupin?before=17995"
      },
      {
        period: "2026.05-1~10",
        periodLabel: "2026年5月前10日",
        category: "DRAM excl. modules",
        exportValueUsd: 3_492_000_000,
        exportValueYoYPct: 383,
        exportValueMoMPct: 18,
        unitPriceUsdPerKg: 89_498,
        unitPriceYoYPct: 497,
        unitPriceMoMPct: 21,
        source: "market_repost_trass",
        sourceName: "Meritz Tech repost, via Telegram mirrors; cross-checked by Wccftech unit-price table",
        sourceUrl: "https://www.teamblind.com/kr/post/%EB%AF%B8%EC%B3%A4%EB%8B%A4-%EB%82%B8%EB%93%9C%EA%B0%92-SSD%EA%B0%92-%ED%8F%AD%EB%93%B1%EC%9D%B4%EB%8B%A4-%EC%83%8C%EB%94%94%EC%8A%A4%ED%81%AC%EB%8F%84-%ED%8F%AD%EB%93%B1%EA%B0%81-5h82cb0c"
      },
      {
        period: "2026.05-1~10",
        periodLabel: "2026年5月前10日",
        category: "Flash memory",
        exportValueUsd: 462_000_000,
        exportValueYoYPct: 169,
        exportValueMoMPct: 1,
        unitPriceUsdPerKg: 67_307,
        unitPriceYoYPct: 352,
        unitPriceMoMPct: 63,
        source: "market_repost_trass",
        sourceName: "Meritz Tech repost, via Telegram mirrors; cross-checked by Wccftech unit-price table",
        sourceUrl: "https://www.teamblind.com/kr/post/%EB%AF%B8%EC%B3%A4%EB%8B%A4-%EB%82%B8%EB%93%9C%EA%B0%92-SSD%EA%B0%92-%ED%8F%AD%EB%93%B1%EC%9D%B4%EB%8B%A4-%EC%83%8C%EB%94%94%EC%8A%A4%ED%81%AC%EB%8F%84-%ED%8F%AD%EB%93%B1%EA%B0%81-5h82cb0c"
      },
      {
        period: "2026.05-1~10",
        periodLabel: "2026年5月前10日",
        category: "SSD",
        exportValueUsd: 1_061_000_000,
        exportValueYoYPct: 607,
        exportValueMoMPct: 172,
        unitPriceUsdPerKg: 45_055,
        unitPriceYoYPct: 865,
        unitPriceMoMPct: 313,
        source: "market_repost_trass",
        sourceName: "Meritz Tech repost, via Telegram mirrors; cites May 1-10 provisional semiconductor export statistics",
        sourceUrl: "https://t.me/s/bornlupin?before=17995"
      },
      {
        period: "2026.05-1~10",
        periodLabel: "2026年5月前10日",
        category: "MCP / HBM proxy",
        exportValueUsd: 1_809_197_568,
        exportValueYoYPct: 156.1,
        exportValueMoMPct: 12.8,
        unitPriceUsdPerKg: 78_752,
        unitPriceYoYPct: 165.5,
        unitPriceMoMPct: 18.7,
        source: "market_repost_trass",
        sourceName: "Mirae Asset IT hardware Telegram mirror; cross-checked by Wccftech MCP/HBM table",
        sourceUrl: "https://telemetr.io/uz/channels/2210862784"
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
        source: "official_public_repost",
        status: "preliminary",
        sourceName: "KCS TradeData May 1-20 provisional HWPX attachment",
        sourceUrl: "https://www.tradedata.go.kr/cts/index.do",
        attachmentFileName: "260521 26년 5월 1일 - 5월 20일 수출입현황.hwpx",
        attachmentValueUnit: "USD million",
        attachmentValue: 21_951,
        mirrorSourceUrl: "https://v.daum.net/v/20260521095100130",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        note: "KCS TradeData HWPX attachment table reports semiconductor exports of USD 21,951M and YoY +202.1%; the document has no DRAM/SSD/HBM split."
      }
    ]
  };
}
