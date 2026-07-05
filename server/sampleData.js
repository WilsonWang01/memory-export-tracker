import { productConfigs } from "./config.js";

const periods = [
  "2024.12",
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
  "2026.04",
  "2026.05"
];

const monthlyHsSource = {
  source: "official_kita_kstat",
  sourceName: "KITA K-stat ItemImpExpList worker",
  sourceUrl: "https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen"
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
        1_254_068_000,
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
        3_835_074_000,
        3_973_455_000
      ],
      [
        215_349,
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
        202_057,
        177_484
      ]
    ),
    ...makeSeries(
      "dram_hbm",
      [
        7_444_170_000,
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
        20_759_011_000,
        20_829_752_000,
        24_950_563_000
      ],
      [
        285_751,
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
        319_349,
        326_954
      ]
    )
  ];

  return {
    meta: {
      lastUpdated: new Date().toISOString(),
      nextScheduledUpdate: null,
      mode: "mixed_public",
      message:
        "公开数据已覆盖至：SSD 与 DRAM/HBM 月度 HS 2026年5月、半导体月度 2026年6月、KCS 海关高频/暂定值 2026年6月1-30日；2026-07-06 复核，DATA_GO_KR_SERVICE_KEY 未配置，月度 HS 使用 KITA K-stat 官方公开 worker 当年金额与 KG。KCS 官网 보도자료 列表和 KDI 转发已出现 6月全月 수출입 현황 [잠정치]，验证总出口/进口/顺差及半导体首次超过 400 亿美元；Korea.kr/MOTIE 提供 6月全月半导体 448.2 亿美元、同比 +199.5%，电脑/SSD proxy 54.1 亿美元、同比 +308.8%。未发现可公开落库的 2026.06 月度 HS 当前年行。"
    },
    products: productConfigs,
    monthly,
    freshness: [
      {
        key: "monthly_hs",
        label: "SSD / DRAM-HBM HS 明细",
        latestPeriod: "2026年5月",
        latestReleaseDate: "2026-07-06 复核：KITA K-stat worker 仍只返回 2026.05 当前年 HS 金额与 KG；DATA_GO_KR_SERVICE_KEY 未配置",
        nextExpectedDate: "2026年6月 HS 明细预计 2026年7月中旬随 KCS/data.go.kr/TRASS/KITA 更新",
        status: "official_public_web",
        note:
          "2026-07-06 复核，KITA K-stat ItemImpExpList worker 对 SSD HS 852351 返回 2026.05 出口金额 3,973,455 thousand USD、重量 177,484 kg；对 DRAM/HBM proxy HS 854232 返回出口金额 24,950,563 thousand USD、重量 326,954 kg。强制查询 2026.06 对两个 HS code 均未返回可落库当前年 HS 行。KCS TradeData 英文页同源接口未作为本次落库来源；DATA_GO_KR_SERVICE_KEY 未配置，未调用 KCS/data.go.kr API。"
      },
      {
        key: "monthly_semiconductor",
        label: "半导体月度总量",
        latestPeriod: "2026年6月",
        latestReleaseDate: "2026-07-01 Korea.kr/MOTIE 6月 수출입 동향 初值；2026-07-02 KCS 官网同步 6月 수출입 현황 [잠정치]",
        nextExpectedDate: "2026年6月确报预计 2026年7月中旬；2026年7月全月初值预计 2026-08-01 左右",
        status: "official_public_repost",
        note:
          "Korea.kr/MOTIE 2026-07-01 公开 6月 수출입 동향，KCS/KDI 公开 6月 수출입 현황 [잠정치]：总出口 102.25B 美元、同比 +70.9%，进口 66.10B 美元、贸易顺差 36.15B 美元；半导体出口 44.82B 美元、同比 +199.5%，电脑/SSD proxy 出口 5.41B 美元、同比 +308.8%。该 6月半导体值为官方月度初值；未用半导体占比或同比倒推。"
      },
      {
        key: "ten_day_semiconductor",
        label: "半导体旬度高频",
        latestPeriod: "2026年6月1-30日",
        latestReleaseDate: "2026-07-02 KCS 官网列表 / 2026-07-01 KDI 转发",
        nextExpectedDate: "2026-07-11 左右发布 2026年7月1-10日暂定值",
        status: "official_public_repost",
        note:
          "2026-07-06 复核：KCS 官网 보도자료 列表显示 2026-07-02 发布的 2026年6月 수출입 현황 [잠정치]，KDI 转发同一 KCS 6月1-30日简报并验证总出口 1,023 亿美元、进口 661 亿美元、贸易顺差 361 亿美元。KCS/KDI HTML 摘要只披露半导体首次超过 400 亿美元，未给出可落库的精确半导体金额；精确 6月半导体金额仍使用 Korea.kr/MOTIE 的 448.2 亿美元。"
      },
      {
        key: "memory_provisional_detail",
        label: "存储细分明细",
        latestPeriod: "2026年6月全月电脑/SSD proxy；2026年5月全月官方存储细分；2026年5月1-20日价格/数量暂估",
        latestReleaseDate: "2026-07-06 复核",
        nextExpectedDate: "等待 TRASS/KITA 或市场转述公开 2026年6月 DRAM/SSD/HBM 细分数据；6月月度 HS 明细预计 2026年7月中旬",
        status: "mixed_public_reported",
        note:
          "2026-07-06 复核：Korea.kr/MOTIE 6月 수출입 동향核验半导体总量和电脑/SSD proxy 金额及 YoY，KCS/KDI 全月海关简报验证半导体首次超过 400 亿美元，但二者未公开 DRAM/NAND/HBM 数量或重量；MOTIE 5月 수출입 동향公开转发文本仍是最新可核验 Memory、DRAM、NAND 细分金额来源。HS 月度图已用 KITA K-stat 补入 2026.05 SSD 与 DRAM/HBM proxy 金额、KG、单价；2026.06 HS 行尚不可落库。"
      }
    ],
    sourceRegistry: [
      {
        key: "kcs_tradedata_hs_monthly",
        section: "monthly_hs",
        sourceName: "KCS TradeData English by H.S Code monthly statistics",
        sourceUrl: "https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000",
        status: "official_public_web_verified_2026_06_11_2026_04_only",
        note: "Browser-visible official KCS page provides monthly HS export value in thousand USD and export weight in KG through its same-site JSON query. Re-verified 2025.01-2026.04 for SSD HS 852351 and DRAM/HBM proxy HS 854232 on 2026-06-11. A 2026-06-13 direct local request to the same-site JSON endpoint returned an access-block message, and the 2026-06-15 KCS English same-site check did not return 2026.05 rows. The latest 2026.05 monthly HS rows are therefore sourced from KITA K-stat instead."
      },
      {
        key: "data_go_kr_itemtrade",
        section: "monthly_hs",
        sourceName: "KCS/data.go.kr Itemtrade API",
        sourceUrl: "https://www.data.go.kr/data/15101609/openapi.do?recommendDataYn=Y",
        status: "requires_DATA_GO_KR_SERVICE_KEY",
        note: "Official API source for monthly HS export value and net weight. DATA_GO_KR_SERVICE_KEY was not present in the 2026-07-06 refresh environment, so the API path was not used by npm run fetch. Earlier no-key endpoint verification returned 401 Unauthorized. data.go.kr lists this API as modified 2026-05-22, REST/XML, free, with automatic approval for development use. Use SSD HS 852351 and DRAM/HBM proxy HS 854232 when configured."
      },
      {
        key: "korea_kr_motie_202606",
        section: "monthly_semiconductor,memory_provisional_detail",
        sourceName: "Korea.kr / MOTIE June 2026 Export-Import Trends",
        sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2",
        status: "official_public_repost_verified_2026_07_01",
        briefingUrl: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156769112",
        motiePdfUrl:
          "https://www.motir.go.kr/attach/down/095a2dda9c864e1d90d751f7668a1117/c92b70725392eb00d72a0441fcdfbd30/778bdbf5db9ced7c8fd52756c00bf0cd",
        note:
          "Korea.kr policy-news repost of MOTIE 2026-07-01 release verifies June exports of USD 102.25B (+70.9%), imports USD 66.10B (+30.1%), trade surplus USD 36.15B, average daily exports USD 4.54B (+59.5%), semiconductor exports USD 44.82B (+199.5%), computer exports USD 5.41B (+308.8%) driven by AI-infrastructure SSD demand, and first-half semiconductor exports USD 192.4B (+162.6%). The linked MOTIE PDF is indexed publicly, but direct local download returned an error page, so no PDF-only product values were landed."
      },
      {
        key: "kcs_kdi_202606_monthly_prelim",
        section: "monthly_semiconductor,ten_day_semiconductor",
        sourceName: "KCS official June 2026 monthly import/export status [preliminary], with KDI repost",
        sourceUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        status: "official_public_repost_verified_2026_07_06",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=283757&pg=&pp=&topic=O",
        kdiPdfUrl: "https://eiec.kdi.re.kr/policy/callDownload.do?dtime=20260705181006&filenum=1&num=283757",
        koreaKrMotieSourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2",
        note:
          "KCS official press-release list shows 2026년 6월 수출입 현황 [잠정치] registered 2026-07-02. KDI repost of the KCS material verifies the 2026-07-01 release for June 1-30 and the rounded aggregate figures: exports USD 102.3B (+70.9%), imports USD 66.1B (+30.1%), and trade surplus USD 36.1B. The browser-readable KCS/KDI text confirms semiconductor exports first exceeded USD 40B but does not expose an exact semiconductor dollar value, so the stored exact semiconductor amount remains the Korea.kr/MOTIE value of USD 44.82B (+199.5%) and is not derived from totals or share."
      },
      {
        key: "kcs_kdi_20260620",
        section: "ten_day_semiconductor",
        sourceName: "KCS official June 1-20 provisional import/export status, with KDI repost",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10167371&nttSnUrl=d3dc345ca30751d2b28d06b45adfbc2b",
        status: "official_public_rounded_verified_2026_06_29",
        note: "KCS official page registered 2026-06-22 and KDI repost num=282993 verify June 1-20 provisional exports of USD 61,991M (+60.4%), imports of USD 44,495M (+23.2%), trade surplus of USD 17,496M, working days 15.0 versus 14.0, average daily exports of USD 4.13B (+49.7%), semiconductor exports up +188.4%, semiconductor share 41.2%, and rounded semiconductor exports of USD 25.5B. The HWPX text exposes the same rounded semiconductor value; its major-item chart is embedded as an image, so no more precise semiconductor dollar amount was landed.",
        attachmentFileName: "260622 26년 6월 1일 - 6월 20일 수출입현황.hwpx",
        attachmentSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=fe919b2b9b338d42e83308686682506a",
        pdfSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=d51492519866191204a83adb182915ae",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282993",
        kitaTaxTimesCrossCheckUrl: "https://www.taxtimes.co.kr/news/article.html?no=275623"
      },
      {
        key: "kcs_korea_kr_20260610",
        section: "ten_day_semiconductor",
        sourceName: "KCS official June 1-10 provisional import/export status, with Korea.kr/KDI reposts",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10166483&nttSnUrl=b1994d17533100b58e1d5ce5737ccd83",
        status: "official_public_attachment_verified_2026_06_19",
        note: "KCS official detail page and Korea.kr/KDI reposts identify the 2026-06-11 release for 2026년 6월 1일 ~ 6월 10일 수출입 현황 [잠정치]. They verify total exports USD 28.6B (+85.9%), imports USD 23.4B (+35.6%), trade surplus USD 5.3B, semiconductor export growth +205.8%, semiconductor export share 38.7%, and a rounded semiconductor export value of USD 11.1B. The KCS official HWPX attachment's main-items table gives the precise semiconductor export value of USD 11,068M (+205.8%), so the dashboard no longer relies on media for that exact point.",
        koreaKrDocViewerUrl: "https://www.korea.kr/common/docViewer.do?fileId=198487131&tblKey=GMN",
        attachmentFileName: "260611 26년 6월 1일 - 6월 10일 수출입현황.hwpx",
        attachmentSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=495388d1ba9818048949c9799cb2edda",
        koreaKrPdfUrl: "https://www.korea.kr/common/download.do?fileId=198487132&tblKey=GMN",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282517&pg=&pp=&topic=O",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891"
      },
      {
        key: "kcs_korea_kr_202605_final",
        section: "monthly_semiconductor,monthly_hs_context",
        sourceName: "KCS/Korea.kr/KDI May 2026 monthly import/export status [final]",
        sourceUrl: "https://www.korea.kr/common/docViewer.do?fileId=198489233&tblKey=GMN",
        status: "official_public_repost_verified_2026_06_16",
        koreaKrPdfUrl: "https://www.korea.kr/common/download.do?fileId=198489234&tblKey=GMN",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282640",
        officialListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        note: "KCS official press-release list shows 2026년 5월 월간 수출입 현황 [확정치] registered 2026-06-15. Korea.kr/KDI reposts verify May final exports of about USD 87.8B (+53.4%), imports of about USD 60.8B (+20.7%), trade surplus of about USD 27.0B, and semiconductor export growth of +167.7%. The repost summary does not expose an exact final semiconductor dollar value, so the dashboard keeps the MOTIE value as a separately sourced provisional product amount rather than deriving a value from YoY."
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
        key: "motie_202605_semiconductor",
        section: "monthly_semiconductor,ten_day_semiconductor",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
        status: "official_public_repost_verified_2026_06_16",
        koreaKrPdfUrl: "https://www.korea.kr/common/download.do?fileId=198479305&tblKey=GMN",
        koreaKrDocViewerUrl: "https://www.korea.kr/common/docViewer.do?fileId=198479306&tblKey=GMN",
        note: "Used for the precise May 2026 semiconductor and memory product values because the KCS official customs release verifies the release context but not the full product table. The MOTIE repost reports semiconductor exports of USD 37.16B (+169.4%), memory semiconductors USD 32.1B (+255%), DRAM USD 18.6B (+369.8%), NAND USD 1.7B (+206.8%), and computer exports USD 4.18B (+290.7%) driven by AI-server SSD demand."
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
        key: "kcs_official_press_list_20260701",
        section: "ten_day_semiconductor",
        sourceName: "KCS official press-release list",
        sourceUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        status: "official_public_checked_2026_07_06",
        note: "KCS official press-release list was checked on 2026-07-06. Page 1 shows 2026년 6월 수출입 현황 [잠정치], registered 2026-07-02, as the newest export-status release, along with non-export-status releases dated 2026-07-02 through 2026-07-03."
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
        status: "media_cross_check_2026_06_11",
        note: "Media cross-check for the KCS June 1-10 release. The same precise semiconductor value is now verified directly from the KCS official HWPX attachment; this article is retained only as a secondary cross-check."
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
        key: "trass_public_20260630",
        section: "ten_day_semiconductor,monthly_hs_context",
        sourceName: "TRASS public homepage, final/provisional trade summary",
        sourceUrl: "https://www.bandtrass.or.kr/index.do",
        status: "public_aggregate_only_checked_2026_06_30",
        note: "Public search/homepage check on 2026-06-30 shows 2026 May final data built on 2026-06-15 and public aggregate widgets only. TRASS public snippets show 2026 May final total exports of USD 87,821M (+53.37%), imports of USD 60,785M (+20.74%), and June 1-20 provisional exports of USD 61,991M (+60.35%) and imports of USD 44,495M (+23.17%). Public widgets do not expose export values for semiconductor/memory splits; product-level provisional lookup is outside the free public widget surface and was not used."
      },
      {
        key: "korea_kr_search_20260630",
        section: "ten_day_semiconductor",
        sourceName: "Korea.kr repost search for KCS high-frequency releases",
        sourceUrl: "https://www.korea.kr/",
        status: "partial_found_checked_2026_06_30",
        note: "Korea.kr exposed a document viewer/PDF for the 2026-06-11 KCS June 1-10 provisional release and the 2026-05-11 KCS May 1-10 repost. Searches on 2026-06-30 still did not expose a separate Korea.kr repost for the 2026-06-22 KCS June 1-20 provisional release; KCS official and KDI repost remain the primary accessible official-policy sources for that point."
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
        status: "media_cross_check_2026_06_11",
        note: "Cross-checks MOTIE May 2026 monthly semiconductor split: memory semiconductors USD 32.1B (+255%), DRAM USD 18.6B (+369.8%), NAND USD 1.7B (+206.8%), system semiconductors USD 4.5B (+6%), and computer exports USD 4.18B (+290.7%) driven by AI-server SSD demand. The KITA/MOTIE repost is now the primary public source for these rows."
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
        key: "kita_kstat_hs_worker_20260701",
        section: "monthly_hs_context",
        sourceName: "KITA K-stat ItemImpExpList worker",
        sourceUrl: "https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen",
        status: "official_public_web_verified_2026_07_06",
        note: "Same-site XML worker endpoint /stat/kts/pum/ItemImpExpListWorker.screen was queried for HS 852351 and 854232, fields AMT and WGT, month mode. It returned current-year 2026.05 rows: SSD 3,973,455 thousand USD / 177,484 kg and HS 854232 24,950,563 thousand USD / 326,954 kg. A focused 2026.06 query returned no positive current-year rows for either HS code on 2026-07-06, so 2026.05 remains the latest monthly HS source."
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
        status: "official_public_page_checked_2026_06_16",
        note: "KITA K-stat browser page can lag direct worker availability, but the same-site public XML worker remained accessible. Trust the worker only when the exact HS row has non-zero current-year THIS_EXP_AMT for both AMT and WGT; that condition was met for 2026.05 on 2026-06-17."
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
        source: "official_public_repost",
        status: "preliminary",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
        koreaKrPdfUrl: "https://www.korea.kr/common/download.do?fileId=198479305&tblKey=GMN",
        koreaKrDocViewerUrl: "https://www.korea.kr/common/docViewer.do?fileId=198479306&tblKey=GMN",
        officialKcsSourceName: "KCS official May 2026 provisional import/export status",
        officialKcsSourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165743&nttSnUrl=b1fd44a499e5b2484a5de5bd2ef5fc25",
        finalKcsSourceName: "KCS/Korea.kr/KDI May 2026 monthly import/export status [final]",
        finalKcsSourceUrl: "https://www.korea.kr/common/docViewer.do?fileId=198489233&tblKey=GMN",
        finalKcsPdfUrl: "https://www.korea.kr/common/download.do?fileId=198489234&tblKey=GMN",
        finalKdiSourceUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282640",
        finalSemiconductorYoYPct: 167.7,
        finalOverallExportValueUsd: 87_821_000_000,
        finalOverallExportYoYPct: 53.37,
        finalOverallImportValueUsd: 60_785_000_000,
        finalOverallImportYoYPct: 20.74,
        note:
          "KCS/Korea.kr/KDI 2026-06-15 final release verifies May total trade and semiconductor YoY +167.7%, while TRASS public homepage verifies final aggregate totals. The precise product amount remains from the MOTIE May export-trends public repost because the final repost summary does not expose an exact semiconductor dollar value; no value is derived from the final YoY."
      },
      {
        period: "2026.06",
        periodLabel: "2026年6月",
        valueUsd: 44_820_000_000,
        valueYoYPct: 199.5,
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_repost",
        status: "preliminary",
        sourceName: "Korea.kr / MOTIE June 2026 Export-Import Trends; KCS/KDI June customs preliminary corroboration",
        sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2",
        briefingUrl: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156769112",
        motiePdfUrl:
          "https://www.motir.go.kr/attach/down/095a2dda9c864e1d90d751f7668a1117/c92b70725392eb00d72a0441fcdfbd30/778bdbf5db9ced7c8fd52756c00bf0cd",
        officialKcsListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        officialKdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=283757&pg=&pp=&topic=O",
        officialKdiPdfUrl: "https://eiec.kdi.re.kr/policy/callDownload.do?dtime=20260705181006&filenum=1&num=283757",
        officialKcsRoundedSemiconductorText: "반도체 수출 400억 달러 최초 돌파",
        overallExportValueUsd: 102_250_000_000,
        overallExportYoYPct: 70.9,
        overallImportValueUsd: 66_100_000_000,
        overallImportYoYPct: 30.1,
        tradeBalanceUsd: 36_150_000_000,
        averageDailyExportValueUsd: 4_540_000_000,
        averageDailyExportYoYPct: 59.5,
        firstHalfSemiconductorExportValueUsd: 192_400_000_000,
        firstHalfSemiconductorYoYPct: 162.6,
        note:
          "Korea.kr/MOTIE 2026-07-01 release gives the exact June semiconductor amount and YoY used here. KCS official press-release list and KDI repost now verify the June 1-30 customs preliminary release and rounded aggregate totals, and state that semiconductor exports first exceeded USD 40B, but their browser-readable summary does not expose an exact semiconductor dollar amount. The stored value is not derived from share, total exports, or prior-year data."
      }
    ],
    memoryDetail: [
      {
        period: "2026.06",
        periodLabel: "2026年6月全月",
        category: "Computer / SSD proxy",
        exportValueUsd: 5_410_000_000,
        exportValueYoYPct: 308.8,
        exportValueMoMPct: null,
        unitPriceUsdPerKg: null,
        unitPriceYoYPct: null,
        unitPriceMoMPct: null,
        source: "official_public_repost",
        sourceName: "Korea.kr / MOTIE June 2026 Export-Import Trends",
        sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2",
        note:
          "MOTIE June export trend reports computer exports of USD 5.41B, YoY +308.8%, driven by AI-infrastructure SSD demand. This is a monthly product-category proxy, not HS 852351 weight/unit-price data."
      },
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
        source: "official_public_repost",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
        crossCheckSourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652"
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
        source: "official_public_repost",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
        crossCheckSourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652"
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
        source: "official_public_repost",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
        crossCheckSourceUrl: "https://www.electimes.com/news/articleView.html?idxno=368652"
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
        source: "official_public_repost",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
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
        source: "official_public_repost",
        status: "preliminary",
        sourceName: "MOTIE May 2026 Export-Import Trends, reposted by KITA FTA integrated platform",
        sourceUrl: "https://okfta.kita.net/nttCntnt/view/10124?mnSn=38",
        koreaKrPdfUrl: "https://www.korea.kr/common/download.do?fileId=198479305&tblKey=GMN",
        koreaKrDocViewerUrl: "https://www.korea.kr/common/docViewer.do?fileId=198479306&tblKey=GMN",
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
        finalKcsSourceName: "KCS/Korea.kr/KDI May 2026 monthly import/export status [final]",
        finalKcsSourceUrl: "https://www.korea.kr/common/docViewer.do?fileId=198489233&tblKey=GMN",
        finalKcsPdfUrl: "https://www.korea.kr/common/download.do?fileId=198489234&tblKey=GMN",
        finalKdiSourceUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282640",
        finalSemiconductorYoYPct: 167.7,
        finalOverallExportValueUsd: 87_821_000_000,
        finalOverallExportYoYPct: 53.37,
        finalOverallImportValueUsd: 60_785_000_000,
        finalOverallImportYoYPct: 20.74,
        finalTradeBalanceUsd: 27_036_000_000,
        note:
          "KCS/Korea.kr/KDI 2026-06-15 final release verifies May total trade and semiconductor YoY +167.7%, while TRASS public homepage verifies final aggregate totals. The stored exact semiconductor amount and displayed YoY remain from the MOTIE May export-trends public repost because the final repost summary does not expose an exact semiconductor dollar value; no value is derived from the final YoY."
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
        source: "official_public_attachment",
        status: "preliminary",
        sourceName: "KCS June 1-10 provisional import/export status official HWPX attachment",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10166483&nttSnUrl=b1994d17533100b58e1d5ce5737ccd83",
        officialRoundedSourceName: "KCS/Korea.kr June 1-10 provisional import/export status",
        officialRoundedSourceUrl: "https://www.korea.kr/common/docViewer.do?fileId=198487131&tblKey=GMN",
        officialRoundedValueUsd: 11_100_000_000,
        officialPreciseSourceName: "KCS official HWPX attachment main-items table",
        officialPreciseSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=495388d1ba9818048949c9799cb2edda",
        reportedPreciseSourceName: "Aju Economy report retained as secondary cross-check",
        reportedPreciseSourceUrl: "https://www.ajunews.com/view/20260611090921842",
        attachmentFileName: "260611 26년 6월 1일 - 6월 10일 수출입현황.hwpx",
        attachmentSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=495388d1ba9818048949c9799cb2edda",
        koreaKrPdfUrl: "https://www.korea.kr/common/download.do?fileId=198487132&tblKey=GMN",
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
        note: "KCS official page plus Korea.kr/KDI reposts verify the release, rounded semiconductor value of about USD 11.1B, YoY +205.8%, share 38.7%, and rounded aggregate trade totals. The KCS official HWPX attachment's main-items table gives the stored precise semiconductor value of USD 11,068M (+205.8%); it is not derived from share or total exports."
      },
      {
        period: "2026.06-1~20",
        periodLabel: "6月前20日",
        valueUsd: 25_500_000_000,
        valueYoYPct: 188.4,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_rounded",
        status: "preliminary",
        sourceName: "KCS June 1-20 provisional import/export status official page and HWPX text",
        sourceUrl:
          "https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10167371&nttSnUrl=d3dc345ca30751d2b28d06b45adfbc2b",
        officialRoundedValueUsd: 25_500_000_000,
        officialRoundedUnit: "USD 100 million",
        officialRoundedText: "반도체(255억 달러)",
        attachmentFileName: "260622 26년 6월 1일 - 6월 20일 수출입현황.hwpx",
        attachmentSourceUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=fe919b2b9b338d42e83308686682506a",
        officialPdfUrl: "https://www.customs.go.kr/common/nttFileDownload.do?fileKey=d51492519866191204a83adb182915ae",
        kdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=282993",
        crossCheckSourceName: "Korea Tax Times report of KCS June 1-20 provisional import/export status",
        crossCheckSourceUrl: "https://www.taxtimes.co.kr/news/article.html?no=275623",
        trassAggregateSourceUrl: "https://www.bandtrass.or.kr/index.do",
        overallExportValueUsd: 61_991_000_000,
        overallExportYoYPct: 60.4,
        overallImportValueUsd: 44_495_000_000,
        overallImportYoYPct: 23.2,
        tradeBalanceUsd: 17_496_000_000,
        semiconductorSharePct: 41.2,
        workingDaysCurrent: 15,
        workingDaysPrevious: 14,
        dailyAverageExportValueUsd: 4_130_000_000,
        dailyAverageExportYoYPct: 49.7,
        note: "KCS official page and HWPX text disclose semiconductor exports as a rounded USD 25.5B and YoY +188.4%, with share 41.2%. This point is not derived from share or total exports; no more precise public semiconductor amount was landed because the HWPX major-item chart is embedded as an image. TRASS public homepage cross-checks the aggregate export/import totals only."
      },
      {
        period: "2026.06",
        periodLabel: "6月全月",
        valueUsd: 44_820_000_000,
        valueYoYPct: 199.5,
        weightKg: 0,
        unitPriceUsdPerKg: null,
        hsCode: "semiconductor",
        productKey: "semiconductor",
        productName: "半导体出口",
        source: "official_public_repost",
        status: "preliminary",
        sourceName: "Korea.kr / MOTIE June 2026 Export-Import Trends; KCS/KDI June customs preliminary corroboration",
        sourceUrl: "https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2",
        briefingUrl: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156769112",
        motiePdfUrl:
          "https://www.motir.go.kr/attach/down/095a2dda9c864e1d90d751f7668a1117/c92b70725392eb00d72a0441fcdfbd30/778bdbf5db9ced7c8fd52756c00bf0cd",
        officialKcsListUrl: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891",
        officialKdiRepostUrl: "https://eiec.kdi.re.kr/policy/materialView.do?num=283757&pg=&pp=&topic=O",
        officialKdiPdfUrl: "https://eiec.kdi.re.kr/policy/callDownload.do?dtime=20260705181006&filenum=1&num=283757",
        officialKcsRoundedSemiconductorText: "반도체 수출 400억 달러 최초 돌파",
        overallExportValueUsd: 102_250_000_000,
        overallExportYoYPct: 70.9,
        overallImportValueUsd: 66_100_000_000,
        overallImportYoYPct: 30.1,
        tradeBalanceUsd: 36_150_000_000,
        averageDailyExportValueUsd: 4_540_000_000,
        averageDailyExportYoYPct: 59.5,
        firstHalfSemiconductorExportValueUsd: 192_400_000_000,
        firstHalfSemiconductorYoYPct: 162.6,
        computerSsdProxyExportValueUsd: 5_410_000_000,
        computerSsdProxyYoYPct: 308.8,
        note:
          "Korea.kr/MOTIE 2026-07-01 release gives June semiconductor exports of USD 44.82B and YoY +199.5%, plus computer exports of USD 5.41B (+308.8%) driven by AI-infrastructure SSD demand. KCS/KDI now corroborate the June 1-30 customs preliminary release and the semiconductor-over-USD-40B milestone, but no exact semiconductor dollar value is exposed in the browser-readable KCS/KDI summary. This full-month point is a monthly product-release value, not HS unit-price data, and is not derived from total exports or share."
      }
    ]
  };
}
