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
        "公开数据已覆盖至：SSD 与 DRAM/HBM 月度 HS 2026年4月、半导体月度 2026年5月、旬度高频 2026年6月1-10日；截至 2026-06-13 未配置 DATA_GO_KR_SERVICE_KEY，月度 HS 仍沿用 KCS TradeData/KITA 公开网页同源查询核验值，6 月旬度半导体同比/占比由 KCS 官网、Korea.kr/KDI 核验，精确金额为媒体转述的 KCS 表格值并单独标记。"
    },
    products: productConfigs,
    monthly,
    freshness: [
      {
        key: "monthly_hs",
        label: "SSD / DRAM-HBM HS 明细",
        latestPeriod: "2026年4月",
        latestReleaseDate: "2026-06-13 复核：公开 KITA/KCS-data.go.kr 可核验月度 HS 明细仍以 2026.04 为最新可用月份",
        nextExpectedDate: "2026年5月 HS 明细预计 2026年6月中旬随 KCS/data.go.kr/TRASS 更新",
        status: "official_public_web",
        note:
          "KCS TradeData 英文 By H.S Code 页面同源 JSON 与 KITA K-stat worker 查询均可取得月度出口金额和 KG。2026-06-13 复核，SSD HS 852351 与 DRAM/HBM proxy HS 854232 仍以 2026.04 为最后可用当年明细；KITA 页面 2026 年月份仅显示 1-4，强制查询 2026.05 时 KITA 返回去年同期列有值、当年列为 0，不能作为 5 月当年数据落库。"
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
        latestPeriod: "2026年6月1-10日",
        latestReleaseDate: "2026-06-11",
        nextExpectedDate: "2026-06-21 左右发布 2026年6月1-20日暂定值",
        status: "official_public_reported",
        note:
          "2026-06-13 复核：KCS 官网直接页面确认 6月1-10日暂定值，新闻列表最新出口跟踪简报仍为 2026-06-11；2026-06-12 新帖不是出口跟踪简报，尚未发布 6月1-20日。KCS/Korea.kr/KDI 核验总出口 286亿美元、进口 234亿美元、贸易顺差 53亿美元、半导体同比 +205.8%、半导体占比 38.7%，KCS 正文给出半导体约 111亿美元；精确半导体金额 11,068M 美元来自媒体对 KCS 表格的转述，已在数据点标为 reported。"
      },
      {
        key: "memory_provisional_detail",
        label: "存储细分明细",
        latestPeriod: "2026年5月全月官方细分；2026年5月1-20日价格/数量暂估",
        latestReleaseDate: "2026-06-11 复核",
        nextExpectedDate: "等待 TRASS/KITA 或市场转述公开 2026年5月全月数量/单价或 2026年6月旬度 DRAM/SSD/HBM 细分数据",
        status: "mixed_public_reported",
        note:
          "2026-06-11 复核：已补入 5月全月官方/月度发布转述中的 Memory、DRAM、NAND、Computer/SSD proxy 金额和 YoY；未发现可核验的 5月全月数量/单位价或 6月1-10日 DRAM/SSD/HBM 细分公开表。5月前20日价格/数量仍来自公开券商/市场 Telegram 镜像转述的 Korean customs/TRASS 暂估；KCS/TRASS 公开页不拆分 DRAM/SSD/HBM。"
      }
    ],
    sourceRegistry: [
      {
        key: "kcs_tradedata_hs_monthly",
        section: "monthly_hs",
        sourceName: "KCS TradeData English by H.S Code monthly statistics",
        sourceUrl: "https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000",
        status: "official_public_web_verified_2026_06_11_kita_rechecked_2026_06_13",
        note: "Browser-visible official KCS page provides monthly HS export value in thousand USD and export weight in KG through its same-site JSON query. Re-verified 2025.01-2026.04 for SSD HS 852351 and DRAM/HBM proxy HS 854232 on 2026-06-11. A 2026-06-13 direct local request to the same-site JSON endpoint returned an access-block message, so no new KCS TradeData value was landed from that path. KITA K-stat worker was rechecked on 2026-06-13: forced 2026.05 queries still return 2025.05 in LAST_* columns but 0 in THIS_* columns for both AMT and WGT, so 2026.05 HS values are not yet published."
      },
      {
        key: "data_go_kr_itemtrade",
        section: "monthly_hs",
        sourceName: "KCS/data.go.kr Itemtrade API",
        sourceUrl: "https://www.data.go.kr/data/15101609/openapi.do?recommendDataYn=Y",
        status: "requires_DATA_GO_KR_SERVICE_KEY",
        note: "Official API source for monthly HS export value and net weight. DATA_GO_KR_SERVICE_KEY was not present in the 2026-06-13 refresh environment, so the API path was not used by npm run fetch. Earlier no-key endpoint verification returned 401 Unauthorized. data.go.kr lists this API as modified 2026-05-22 and explains monthly data is refreshed around the 15th after corrections/cancellations. Use SSD HS 852351 and DRAM/HBM proxy HS 854232 when configured."
      },
      {
        key: "kcs_korea_kr_20260610",
        section: "ten_day_semiconductor",
        sourceName: "KCS official June 1-10 provisional import/export status, with Korea.kr/KDI reposts",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10166483&nttSnUrl=b1994d17533100b58e1d5ce5737ccd83",
        status: "official_public_verified_2026_06_13",
        note: "KCS official detail page and Korea.kr/KDI reposts identify the 2026-06-11 release for 2026년 6월 1일 ~ 6월 10일 수출입 현황 [잠정치]. They verify total exports USD 28.6B (+85.9%), imports USD 23.4B (+35.6%), trade surplus USD 5.3B, semiconductor export growth +205.8%, semiconductor export share 38.7%, and a rounded semiconductor export value of USD 11.1B. The dashboard's precise June 1-10 semiconductor amount is retained as a reported KCS-table value from media, not as a derived value from these rounded official totals.",
        koreaKrDocViewerUrl: "https://www.korea.kr/common/docViewer.do?fileId=198487131&tblKey=GMN",
        attachmentFileName: "R26060508.pdf",
        attachmentSourceUrl: "https://www.korea.kr/common/download.do?fileId=198487132&tblKey=GMN",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282517&pg=&pp=&topic=O",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891"
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
        status: "official_public_checked_2026_06_13",
        note: "KCS official press-release list page 1 was checked on 2026-06-13. The latest export-status release is 2026년 6월 1일 ~ 6월 10일 수출입 현황 [잠정치], registered 2026-06-11 with nttSn 10166483; the 2026-06-12 posts on the list were unrelated to export tracking, and no 6월1-20일 release was present."
      },
      {
        key: "taxtimes_20260610",
        section: "ten_day_semiconductor",
        sourceName: "Korea Tax Times repost of KCS June 1-10 provisional import/export status",
        sourceUrl: "https://www.taxtimes.co.kr/news/article.html?no=275489",
        status: "official_public_reported_2026_06_11",
        note: "Public article cites KCS June 1-10 provisional customs data: total exports USD 28,635M (+85.9%), imports USD 23,352M (+35.6%), trade surplus USD 5,282M, semiconductor exports about USD 11.1B (+205.8%), and semiconductor share of 38.7%."
      },
      {
        key: "ajunews_20260610",
        section: "ten_day_semiconductor",
        sourceName: "Aju Economy report of KCS June 1-10 provisional import/export status",
        sourceUrl: "https://www.ajunews.com/view/20260611090921842",
        status: "official_public_reported_2026_06_11",
        note: "Cross-check source with a more precise KCS-reported semiconductor export value for June 1-10: USD 11,068M (+205.8%), total exports USD 28,635M (+85.9%), imports USD 23,352M, trade surplus USD 5,282M, and semiconductor share 38.7%."
      },
      {
        key: "moneytoday_20260610",
        section: "ten_day_semiconductor",
        sourceName: "MoneyToday report of KCS June 1-10 provisional import/export status",
        sourceUrl: "https://www.mt.co.kr/amp/economy/2026/06/11/2026061108475185652",
        status: "media_cross_check_2026_06_11",
        note: "Cross-check source for the KCS June 1-10 release; reports total exports +85.9%, semiconductor exports +205.8%, semiconductor share 38.7%, and major region/item growth. Used to corroborate the same-day KCS-reported high-frequency direction."
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
        status: "partial_found_2026_06_11",
        note: "Korea.kr exposed a document viewer/PDF for the 2026-06-11 KCS June 1-10 provisional release and the 2026-05-11 KCS May 1-10 repost. Searches still did not expose Korea.kr repost pages for the 2026-05-21/2026-05-27 KCS May 1-20 provisional release or the 2026-06-01 KCS May full-month provisional release during this refresh."
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
        key: "electimes_202605_memory_detail",
        section: "memory_provisional_detail",
        sourceName: "Electimes report of MOTIE May 2026 Export-Import Trends",
        sourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652",
        status: "official_public_reported_2026_06_11",
        note: "Reports MOTIE May 2026 monthly semiconductor split: memory semiconductors USD 32.1B (+255%), DRAM USD 18.6B (+369.8%), NAND USD 1.7B (+206.8%), system semiconductors USD 4.5B (+6%), and computer exports USD 4.18B (+290.7%) driven by AI-server SSD demand."
      },
      {
        key: "newstomato_202605_memory_detail",
        section: "memory_provisional_detail",
        sourceName: "Newstomato report of MOTIE May 2026 Export-Import Trends",
        sourceUrl: "https://www.newstomato.com/readnews.aspx?no=1302690",
        status: "official_public_reported_2026_06_11",
        note: "Cross-checks the MOTIE May monthly split: memory semiconductors USD 32.1B (+255%), DRAM USD 18.6B (+369.8%), NAND USD 1.7B (+206.8%), system semiconductors USD 4.5B (+6%), and management commentary that memory prices rose versus April."
      },
      {
        key: "kita_kstat_hs_worker_20260613",
        section: "monthly_hs_context",
        sourceName: "KITA K-stat ItemImpExpList worker",
        sourceUrl: "https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen",
        status: "official_public_web_verified_2026_06_13",
        note: "Same-site XML worker endpoint /stat/kts/pum/ItemImpExpListWorker.screen was queried for HS 852351 and 854232, fields AMT and WGT, month mode. 2026.04 matches the dashboard values. Forced 2026.05 queries on 2026-06-13 return LAST_* 2025.05 comparison values but THIS_* values of 0 and -100% change, confirming the public K-stat monthly HS database had not released 2026.05 current-year rows."
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
        sourceUrl: "https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen",
        status: "official_public_page_checked_2026_06_13",
        note: "KITA K-stat public item trade page was accessible on 2026-06-13 and generated the 2026 month selector only through month 4. The same public worker rows are documented separately because they matched KCS TradeData through 2026.04 and showed no usable 2026.05 current-year HS rows."
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
        period: "2026.05",
        periodLabel: "2026年5月全月",
        category: "Memory semiconductors",
        exportValueUsd: 32_100_000_000,
        exportValueYoYPct: 255,
        exportValueMoMPct: null,
        unitPriceUsdPerKg: null,
        unitPriceYoYPct: null,
        unitPriceMoMPct: null,
        source: "official_public_reported",
        sourceName: "MOTIE May Export-Import Trends, reported by Electimes and cross-checked by Newstomato",
        sourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652",
        crossCheckSourceUrl: "https://www.newstomato.com/readnews.aspx?no=1302690"
      },
      {
        period: "2026.05",
        periodLabel: "2026年5月全月",
        category: "DRAM",
        exportValueUsd: 18_600_000_000,
        exportValueYoYPct: 369.8,
        exportValueMoMPct: null,
        unitPriceUsdPerKg: null,
        unitPriceYoYPct: null,
        unitPriceMoMPct: null,
        source: "official_public_reported",
        sourceName: "MOTIE May Export-Import Trends, reported by Electimes and cross-checked by Newstomato",
        sourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652",
        crossCheckSourceUrl: "https://www.newstomato.com/readnews.aspx?no=1302690"
      },
      {
        period: "2026.05",
        periodLabel: "2026年5月全月",
        category: "NAND",
        exportValueUsd: 1_700_000_000,
        exportValueYoYPct: 206.8,
        exportValueMoMPct: null,
        unitPriceUsdPerKg: null,
        unitPriceYoYPct: null,
        unitPriceMoMPct: null,
        source: "official_public_reported",
        sourceName: "MOTIE May Export-Import Trends, reported by Electimes and cross-checked by Newstomato",
        sourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652",
        crossCheckSourceUrl: "https://www.newstomato.com/readnews.aspx?no=1302690"
      },
      {
        period: "2026.05",
        periodLabel: "2026年5月全月",
        category: "Computer / SSD proxy",
        exportValueUsd: 4_180_000_000,
        exportValueYoYPct: 290.7,
        exportValueMoMPct: null,
        unitPriceUsdPerKg: null,
        unitPriceYoYPct: null,
        unitPriceMoMPct: null,
        source: "official_public_reported",
        sourceName: "MOTIE May Export-Import Trends, reported by Electimes and cross-checked by Newstomato",
        sourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652",
        crossCheckSourceUrl: "https://www.newstomato.com/readnews.aspx?no=1302690",
        note: "MOTIE May export trend reports computer exports of USD 4.18B, YoY +290.7%, driven by AI-server SSD demand. This is a monthly product-category proxy, not HS 852351 weight/unit-price data."
      },
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
      },
      {
        period: "2026.06-1~10",
        periodLabel: "6月前10日",
        valueUsd: 11_068_000_000,
        valueYoYPct: 205.8,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_reported",
        status: "preliminary",
        sourceName: "KCS June 1-10 provisional import/export status, precise table reported by Aju Economy",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10166483&nttSnUrl=b1994d17533100b58e1d5ce5737ccd83",
        officialRoundedSourceName: "KCS/Korea.kr June 1-10 provisional import/export status",
        officialRoundedSourceUrl: "https://www.korea.kr/common/docViewer.do?fileId=198487131&tblKey=GMN",
        officialRoundedValueUsd: 11_100_000_000,
        reportedPreciseSourceName: "Aju Economy report of KCS June 1-10 provisional import/export status",
        reportedPreciseSourceUrl: "https://www.ajunews.com/view/20260611090921842",
        attachmentSourceUrl: "https://www.korea.kr/common/download.do?fileId=198487132&tblKey=GMN",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282517&pg=&pp=&topic=O",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        crossCheckSourceName: "Korea Tax Times and MoneyToday reports of KCS June 1-10 provisional import/export status",
        crossCheckSourceUrl: "https://www.taxtimes.co.kr/news/article.html?no=275489",
        overallExportValueUsd: 28_635_000_000,
        overallExportYoYPct: 85.9,
        overallImportValueUsd: 23_352_000_000,
        overallImportYoYPct: 35.6,
        tradeBalanceUsd: 5_282_000_000,
        semiconductorSharePct: 38.7,
        workingDaysCurrent: 7,
        workingDaysPrevious: 5.5,
        dailyAverageExportValueUsd: 4_090_000_000,
        dailyAverageExportYoYPct: 46.1,
        note: "KCS official page plus Korea.kr/KDI reposts verify the release, rounded semiconductor value of about USD 11.1B, YoY +205.8%, share 38.7%, and rounded aggregate trade totals. The stored precise semiconductor value of USD 11,068M is a media-reported KCS table value cross-checked against Korea Tax Times and MoneyToday; it is not derived from share or total exports."
      }
    ]
  };
}
