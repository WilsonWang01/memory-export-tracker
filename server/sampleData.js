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
        "公开数据已覆盖至：半导体月度 2026年4月、旬度 2026年5月1-10日；SSD 与 DRAM/HBM 月度 HS 明细仍需 DATA_GO_KR_SERVICE_KEY 后自动替换。"
    },
    products: productConfigs,
    monthly,
    freshness: [
      {
        key: "monthly_hs",
        label: "SSD / DRAM-HBM HS 明细",
        latestPeriod: "2026年3月",
        latestReleaseDate: "DATA_GO_KR_SERVICE_KEY 未配置，待授权接口核验",
        nextExpectedDate: "data.go.kr / TRASS 授权后可拉取 2026年4月最终值",
        status: "needs_api_key",
        note: "看板主图当前仍是 HS 明细样例序列，不作为真实 4 月 SSD/DRAM-HBM 数据。"
      },
      {
        key: "monthly_semiconductor",
        label: "半导体月度总量",
        latestPeriod: "2026年4月",
        latestReleaseDate: "2026-05-15",
        nextExpectedDate: "2026-06-01 左右发布 2026年5月月度初值",
        status: "official_public",
        note: "4 月半导体出口约 319 亿美元，MOTIE 月初口径；KCS 5 月 15 日已发布 4 月月度确报。"
      },
      {
        key: "ten_day_semiconductor",
        label: "半导体旬度高频",
        latestPeriod: "2026年5月1-10日",
        latestReleaseDate: "2026-05-11",
        nextExpectedDate: "2026-05-21 左右发布 2026年5月1-20日",
        status: "official_public",
        note: "KCS 通常在每月 11 日和 21 日附近发布前 10 日、前 20 日初值。"
      },
      {
        key: "memory_provisional_detail",
        label: "存储细分旬度暂估",
        latestPeriod: "2026年5月1-10日",
        latestReleaseDate: "2026-05-11",
        nextExpectedDate: "2026-05-21 左右尝试补 2026年5月1-20日细分数据",
        status: "market_repost_trass",
        note: "券商/市场渠道转述 TRASS/Korean customs 暂估，已交叉核验多处转述；未等同于本站直连 TRASS 官方接口。"
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
        sourceName: "MOTIE April 2026 Export-Import Trends; KCS final April release posted 2026-05-15",
        sourceUrl: "https://www.asiae.co.kr/en/article/IT/2026050109205280402",
        finalSourceName: "KCS 2026 April monthly import/export status [final], reposted by NLIC",
        finalSourceUrl: "https://www.nlic.go.kr/nlic/logpolDt.action?command=VIEW&fldLogpolRefSeq=1941",
        note: "KCS final public HTML verifies the April final release headline; the dashboard keeps the rounded semiconductor value from the MOTIE monthly release."
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
        sourceName: "KCS / Korea.kr 2026-04-10 brief",
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
        sourceName: "KCS / Korea.kr 2026-05-10 brief",
        sourceUrl: "https://m.korea.kr/briefing/pressReleaseView.do?newsId=156760738&pWise=mSub&pWiseSub=C7"
      }
    ]
  };
}
