# Korea Trade Data Research Notes

Last checked: 2026-07-12.

2026-07-12 update: no new semiconductor numeric data point was landed. KCS, Korea.kr, and KDI still show the June 2026 monthly customs/product releases as the newest official semiconductor export sources, and the KITA K-stat worker still returns no positive current-year June 2026 HS rows for SSD `852351` or DRAM/HBM proxy `854232`. The official KCS press-release list shows newer non-export-status releases through 2026-07-10, but no 2026년 7월 1일~10일 `수출입 현황 [잠정치]` release. TRASS public widgets now show July 1-10 aggregate exports/imports, but remain aggregate-only and do not expose semiconductor or memory product splits.

This dashboard uses two different data families and they should not be mixed:

- Monthly HS detail: export value plus weight for SSD `852351` and DRAM/HBM proxy `854232`. This is the only source family suitable for USD/kg.
- Monthly or 10-day semiconductor/product releases: semiconductor, memory, DRAM, NAND, computer or SSD-related values. These are useful for direction, but usually do not publish product weight, so they cannot produce USD/kg.

## Official HS Detail Path

Primary pages:

- KCS TradeData English By H.S Code: `https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000`
- Query endpoint found in page JS: `/cts/hmpgEng/retrieveTradeHsCodeEng.do`
- KITA K-stat ItemImpExpList: `https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen`
- KITA worker endpoint: `POST https://stat.kita.net/stat/kts/pum/ItemImpExpListWorker.screen`

Useful request parameters:

```text
priodKind=MON
priodFr=2025.01
priodTo=2026.05
langTpcd=ENG
ttwgTpcd=1
selectPaging=1
showPagingLine=100
hsSgnGrpCol=HS6_SGN
hsSgnWhrCol=HS6_SGN
hsSgn=852351,854232
subHsSgn=
isAllExcel=NO
```

Important quirks:

- Use undotted six-digit HS values such as `852351` and `854232`. Dotted codes like `8523.51` can return zero rows.
- Use `ttwgTpcd=1` for kilograms. `1000` changes the weight unit.
- Treat `expUsdAmt` from the TradeData page as thousand USD when converting to dashboard USD.
- Always page through or use a focused date range. Wide ranges can hide the month you want behind pagination.
- A direct local request to the KCS same-site JSON endpoint returned an access-block message on 2026-06-13. That blocked request was not used to land or reject numeric data; the June 14 May-HS availability check relies on the public data.go.kr catalog status and KITA public worker cross-checks below.

## KITA K-stat Cross-check Path

Public page:

- `https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen`

The page uses an IBSheet XML worker:

- `POST https://stat.kita.net/stat/kts/pum/ItemImpExpListWorker.screen`

Working form fields for a focused HS query. The dashboard now uses this path when
`DATA_GO_KR_SERVICE_KEY` is unavailable or data.go.kr fails:

```text
event_udap=Search
sheet_col_length=16
searchType=SHEET
pageNum=1
viewType=SHEET
chartType=bar
p_cond_unit=6
HS_YN=Y
ITEM_YN=Y
MTI_YN=Y
SITC_YN=Y
stat_yn=Y
CTR_GB=KTS
s_url=/stat/kts/pum/ItemImpExpList
s_cond_gb=HS
s_cond_unit=6
s_cond_unit_num=852351
s_trade_gb=s_suji
s_year=2026
s_month=05
s_field=AMT
s_monthsum_gb=1
s_measure=1000
s_sort=ROW_CODE
s_sort_val=ASC
s_language=eng_name
listCount=100
```

Use `s_field=AMT` for export value and `s_field=WGT` for weight. For AMT, `s_measure=1000` returns thousand USD. For WGT, use `s_measure=1`.

Column order in the first data row is:

```text
RN, ROW_CODE, KOR_NAME, QTY_UNIT,
LAST_EXP_AMT, LAST_EXP_RATE, LAST_IMP_AMT, LAST_IMP_RATE, PROFIT,
THIS_EXP_AMT, THIS_EXP_RATE, THIS_IMP_AMT, THIS_IMP_RATE, THIS_PROFIT,
COND_GB, ORDER_NM
```

2026-07-12 verification:

- `2026.05`, HS `852351`, `AMT` returns `THIS_EXP_AMT=3973455` thousand USD and `WGT` returns `THIS_EXP_AMT=177484` kg.
- `2026.05`, HS `854232`, `AMT` returns `THIS_EXP_AMT=24950563` thousand USD and `WGT` returns `THIS_EXP_AMT=326954` kg.
- These are current-year `THIS_*` values, not previous-year `LAST_*` comparison values, so they are valid monthly HS rows.
- Focused `2026.06` queries for both HS codes still returned no positive current-year rows on 2026-07-12, so June monthly HS data was not landed.
- The KCS TradeData English same-site endpoint did not return `2026.05` rows during the same 2026-06-15 check, so the dashboard records the latest HS source as KITA K-stat for this refresh.
- TRASS public homepage shows `2026년 05월 확정치 구축완료` dated 2026-06-15.
- KITA may show a default UI month that lags direct worker availability. Trust the worker only when the exact HS row has non-zero `THIS_EXP_AMT` for both `AMT` and `WGT`.

## data.go.kr API Check

`DATA_GO_KR_SERVICE_KEY` was not present in the 2026-07-12 refresh environment, so the official KCS itemtrade API path could not be used by `npm run fetch`.

The public data.go.kr catalog page for `관세청_품목별 수출입실적(GW)` remains the correct official API source. It states that item trade statistics are aggregated by HS code, export value is the declared USD amount, weight is net weight in kg, and prior-month data is refreshed around the 15th after corrections/cancellations. The catalog was modified on 2026-05-22.

## Product Release Path

Official and reported monthly product data is still useful when HS weight data is absent.

Current June 2026 product values in the dashboard:

- Semiconductor exports: USD 44.82B, YoY +199.5%.
- Computer / SSD proxy exports: USD 5.41B, YoY +308.8%, reported as driven by AI-infrastructure SSD demand.
- Overall exports: USD 102.25B, YoY +70.9%.
- Overall imports: USD 66.10B, YoY +30.1%.
- Trade balance: USD 36.15B surplus.
- Average daily exports: USD 4.54B, YoY +59.5%.
- First-half semiconductor exports: USD 192.4B, YoY +162.6%.

Source chain:

- Korea.kr / MOTIE June 2026 policy-news repost: `https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2`
- Korea.kr / MOTIE June 2026 briefing transcript: `https://www.korea.kr/briefing/policyBriefingView.do?newsId=156769112`
- MOTIE indexed PDF URL: `https://www.motir.go.kr/attach/down/095a2dda9c864e1d90d751f7668a1117/c92b70725392eb00d72a0441fcdfbd30/778bdbf5db9ced7c8fd52756c00bf0cd`

2026-07-12 notes:

- The Korea.kr policy-news repost exposes the exact June semiconductor value, YoY, computer/SSD proxy value, aggregate trade values, and first-half semiconductor value used in the dashboard.
- The Korea.kr briefing transcript corroborates the rounded June total export, semiconductor export, import, trade-balance, and first-half values.
- The MOTIE PDF is publicly indexed, but direct local download returned a 404/error page from this environment. No PDF-only values were landed.
- KCS official detail page exposes `2026년 6월 수출입 현황 [잠정치]`, registered 2026-07-02. KDI reposts the same KCS material as policy material `283757`.
- The browser-readable KDI/KCS summary verifies June 1-30 aggregate customs totals: exports USD 1,023B, imports USD 661B, and trade balance USD 361B, and the KCS list/search snippets state that semiconductor exports first exceeded USD 40B.
- The browser-readable KCS/KDI summary does not expose an exact semiconductor dollar value, so the dashboard continues to use the Korea.kr/MOTIE exact monthly product value of USD 44.82B (+199.5%) and labels the KCS/KDI full-month customs release as corroboration only.
- The KDI PDF (`R26070158.pdf`) downloaded locally after a short wait, but this environment has no PDF text utility and simple `strings` extraction did not reveal usable table text. No PDF-only values were landed.

Current May 2026 product values still used for memory splits:

- Semiconductor exports: USD 37.16B, YoY +169.4%.
- Memory semiconductors: USD 32.1B, YoY +255%.
- DRAM: USD 18.6B, YoY +369.8%.
- NAND: USD 1.7B, YoY +206.8%.
- Computer / SSD proxy: USD 4.18B, YoY +290.7%, reported as driven by AI-server SSD demand.

Source chain:

- KCS/Korea.kr/KDI May 2026 final monthly release verifies final aggregate trade context and semiconductor YoY, but not an exact final semiconductor dollar value in the HTML summary:
  - Korea.kr doc viewer: `https://www.korea.kr/common/docViewer.do?fileId=198489233&tblKey=GMN`
  - Korea.kr PDF download: `https://www.korea.kr/common/download.do?fileId=198489234&tblKey=GMN`
  - KDI repost: `https://eiec.kdi.re.kr/policy/materialView.do?num=282640`
  - Verified summary values: total exports about USD 87.8B (+53.4%), total imports about USD 60.8B (+20.7%), trade surplus about USD 27.0B, semiconductor export growth +167.7%.
  - TRASS public homepage gives exact aggregate final totals: exports USD 87,821M (+53.37%) and imports USD 60,785M (+20.74%).
- KCS official May 2026 provisional release verifies the release event and total trade context: `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165743&nttSnUrl=b1fd44a499e5b2484a5de5bd2ef5fc25`
- MOTIE May trend PDF mirrored through Korea.kr: `https://www.korea.kr/common/download.do?fileId=198479305&tblKey=GMN`
- MOTIE May trend text reposted by KITA FTA integrated platform: `https://okfta.kita.net/nttCntnt/view/10124?mnSn=38`
- Electimes and Newstomato are retained only as media cross-checks of the same MOTIE product split.

The dashboard keeps the May semiconductor product value at USD 37.16B and YoY +169.4% from MOTIE's product table because the June 15 final KCS/Korea.kr/KDI summary exposes the final semiconductor YoY but not an exact final product amount. Do not derive a final dollar value from the final YoY.

Do not use these product-release rows to calculate USD/kg unless a source explicitly publishes matching export weight or quantity for the same product and period.

## High-Frequency June/July 2026 Check

Latest official KCS full-month release as of 2026-07-12:

- KCS official release page: `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10168488&nttSnUrl=17797181bd6178913682c340f7b8b5c2`
- KCS official press-release list for newer-release checks: `https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891`
- KDI repost: `https://eiec.kdi.re.kr/policy/materialView.do?num=283757&pg=&pp=&topic=O`
- KDI PDF download reached locally: `https://eiec.kdi.re.kr/policy/callDownload.do?dtime=20260705181006&filenum=1&num=283757`
- Korea.kr/MOTIE exact product-value source retained for semiconductor and computer/SSD proxy: `https://www.korea.kr/news/policyNewsView.do?newsId=148967445&pWise=sub&pWiseSub=C2`

Verified official values for 2026-06-01 through 2026-06-30:

- KCS/KDI rounded aggregate totals: total exports USD 1,023B, YoY +70.9%; total imports USD 661B, YoY +30.1%; trade balance USD 361B surplus.
- KCS/KDI public summary confirms the semiconductor milestone: monthly semiconductor exports first exceeded USD 40B.
- Korea.kr/MOTIE gives the precise monthly product value landed in the dashboard: semiconductor exports USD 44.82B, YoY +199.5%.
- Korea.kr/MOTIE also verifies the dashboard's computer/SSD proxy row: computer exports USD 5.41B, YoY +308.8%, driven by AI-infrastructure SSD demand.

Landing rule applied:

- The 2026.06 full-month semiconductor point remains `official_public_repost` with the exact Korea.kr/MOTIE value. KCS/KDI is recorded as an official customs corroboration because its browser-readable text does not expose an exact semiconductor dollar amount.
- No value was derived from total exports, semiconductor share, or prior-year YoY.
- The KCS full-month row supersedes June 1-20 as the latest high-frequency/customs status check, but June 1-10 and June 1-20 rows remain in the dashboard as intra-month tracking points.

Latest official KCS intra-month high-frequency release as of 2026-07-12:

- KCS official June 1-20 release page: `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10167371&nttSnUrl=d3dc345ca30751d2b28d06b45adfbc2b`
- KCS official June 1-20 HWPX attachment: `https://www.customs.go.kr/common/nttFileDownload.do?fileKey=fe919b2b9b338d42e83308686682506a`
- KCS official June 1-20 PDF attachment: `https://www.customs.go.kr/common/nttFileDownload.do?fileKey=d51492519866191204a83adb182915ae`
- KDI repost: `https://eiec.kdi.re.kr/policy/materialView.do?num=282993`
- Korea Tax Times cross-check: `https://www.taxtimes.co.kr/news/article.html?no=275623`

Verified official values for 2026-06-01 through 2026-06-20:

- Total exports: USD 61,991M, YoY +60.4%.
- Total imports: USD 44,495M, YoY +23.2%.
- Trade balance: USD 17,496M surplus.
- Working days: 15.0 in 2026 versus 14.0 in 2025.
- Average daily exports: USD 4.13B, YoY +49.7%.
- Semiconductor export growth: +188.4%.
- Semiconductor export share: 41.2%, up 18.3 percentage points.
- Rounded semiconductor export value in the KCS body/HWPX text: USD 25.5B.

The dashboard stores the June 1-20 semiconductor point as `official_public_rounded`: USD 25.5B. It is an official rounded value disclosed by KCS, not a value derived from total exports and share. The HWPX text did not expose a more precise semiconductor dollar amount because the major-item chart is embedded as images, so no exact value was landed.

The prior June 1-10 release remains useful because it exposed an exact attachment value:

- KCS official release page: `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10166483&nttSnUrl=b1994d17533100b58e1d5ce5737ccd83`
- KCS official press-release list: `https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891`
- KDI repost: `https://eiec.kdi.re.kr/policy/materialView.do?num=282517&pg=&pp=&topic=O`
- Korea.kr PDF/document viewer: `https://www.korea.kr/common/docViewer.do?fileId=198487131&tblKey=GMN`
- Korea.kr PDF download: `https://www.korea.kr/common/download.do?fileId=198487132&tblKey=GMN`
- KCS official HWPX attachment: `https://www.customs.go.kr/common/nttFileDownload.do?fileKey=495388d1ba9818048949c9799cb2edda`

Verified official values for 2026-06-01 through 2026-06-10:

- Total exports: USD 28,635M, YoY +85.9%.
- Total imports: USD 23,352M, YoY +35.6%.
- Trade balance: USD 5,282M surplus.
- Working days: 7.0 in 2026 versus 5.5 in 2025.
- Average daily exports: USD 4.09B, YoY +46.1%.
- Semiconductor export growth: +205.8%.
- Semiconductor export share: 38.7%, up 15.1 percentage points.
- Rounded semiconductor export value in the KCS body: about USD 11.1B.
- Precise semiconductor export value in the KCS official HWPX attachment main-items table: USD 11,068M.

The direct KCS page body and KDI repost verify the rounded June 1-10 semiconductor value, growth rate, share, and aggregate trade totals. The KCS official HWPX attachment's main-items table verifies the precise June 1-10 semiconductor value of USD 11,068M (+205.8%), so the dashboard labels that point as official attachment data. Do not derive a precise semiconductor amount from total exports and share.

KCS list/search check on 2026-07-12:

- Official KCS press-release list page 1 shows 2026-07-10 non-export-status releases; the newest export-status release found in official/repost searches remains the 2026-07-02 `2026년 6월 수출입 현황 [잠정치]` release.
- No 2026년 7월 1일 ~ 7월 10일 `수출입 현황 [잠정치]` release was visible on KCS, Korea.kr, or KDI searches on 2026-07-12 KST; continue checking from 2026-07-13 because 2026-07-11 fell on a Saturday.
- TRASS public widgets show July 1-10 aggregate exports of USD 29,839M (+53.93%) and imports of USD 23,480M (+17.41%), but not semiconductor or memory values, so no high-frequency semiconductor point was landed from TRASS.
- KDI reposted the same June 1-30 KCS release as policy material num `283757`.
- The June full-month product value remains sourced from Korea.kr/MOTIE because KCS/KDI expose the semiconductor-over-USD-40B milestone but not an exact browser-readable semiconductor dollar value.
- KDI reposted the June 1-20 release as policy material num `282993`.
- Korea.kr search did not expose a separate June 1-20 repost during this refresh; KDI served as the accessible official-policy repost.

TRASS public homepage check on 2026-07-12:

- The public homepage showed May final aggregate totals: exports USD 87,821M (+53.37%) and imports USD 60,785M (+20.74%).
- It also showed July 1-10 provisional aggregate totals: exports USD 29,839M (+53.93%) and imports USD 23,480M (+17.41%).
- Notices showed 2026 May final data built on 2026-06-15.
- Public widgets did not expose semiconductor/memory product-level provisional values for landing; product-level provisional lookup remains outside the free public widget surface, so no TRASS product split was landed.

KITA monthly HS worker check on 2026-07-12:

- `2026.05`, HS `852351`, still returns `THIS_EXP_AMT=3973455` thousand USD and `WGT` `THIS_EXP_AMT=177484` kg.
- `2026.05`, HS `854232`, still returns `THIS_EXP_AMT=24950563` thousand USD and `WGT` `THIS_EXP_AMT=326954` kg.
- A focused `2026.06` query returned no positive current-year rows for either HS code, so June monthly HS data was not landed.
- `DATA_GO_KR_SERVICE_KEY` was not present in the 2026-07-12 refresh environment, so the KCS/data.go.kr itemtrade API path could not be used by `npm run fetch`.

## Update Cadence

- Around the 1st of each month: KCS/MOTIE full previous-month provisional release and semiconductor/product headline data.
- Around the 11th: KCS current-month 1-10 day provisional release.
- Around the 15th: previous-month final HS/monthly detail is expected to become available in KCS/data.go.kr/TRASS/KITA.
- Around the 21st: KCS current-month 1-20 day provisional release.

The GitHub Actions workflow should therefore run on `1,11,15,21`, not daily.

## Rules For Landing Data

- Land monthly HS rows only when a source has non-zero current-year values for value and weight for the exact HS code and period.
- If a forced future month returns previous-year comparison values but current-year zeros, record it as "not released"; do not turn the previous-year values into current-year data.
- Product-category releases can update the provisional/detail cards, but should be labelled as reported/provisional and not used for HS unit-price charts.
