# Korea Trade Data Research Notes

Last checked: 2026-06-13.

This dashboard uses two different data families and they should not be mixed:

- Monthly HS detail: export value plus weight for SSD `852351` and DRAM/HBM proxy `854232`. This is the only source family suitable for USD/kg.
- Monthly or 10-day semiconductor/product releases: semiconductor, memory, DRAM, NAND, computer or SSD-related values. These are useful for direction, but usually do not publish product weight, so they cannot produce USD/kg.

## Official HS Detail Path

Primary page:

- KCS TradeData English By H.S Code: `https://www.tradedata.go.kr/cts/hmpgEng/openETS0200013Q.do?menuId=ETS_MNE_10200000`
- Query endpoint found in page JS: `/cts/hmpgEng/retrieveTradeHsCodeEng.do`

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
- A direct local request to the KCS same-site JSON endpoint returned an access-block message on 2026-06-13. That blocked request was not used to land or reject numeric data; the June 13 May-HS availability check relies on the public data.go.kr catalog status and KITA public page/worker cross-checks below.

## KITA K-stat Cross-check Path

Public page:

- `https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen`

The page uses an IBSheet XML worker:

- `POST https://stat.kita.net/stat/kts/pum/ItemImpExpListWorker.screen`

Working form fields for a focused HS query:

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
s_month=04
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

2026-06-11 / 2026-06-12 / 2026-06-13 verification:

- `2026.04`, HS `852351`, AMT returns `THIS_EXP_AMT=3836678` thousand USD and WGT returns `THIS_EXP_AMT=202057` kg.
- `2026.04`, HS `854232`, AMT returns `THIS_EXP_AMT=20829061` thousand USD and WGT returns `THIS_EXP_AMT=319349` kg.
- Forced `2026.05` queries are not usable: the worker returns `LAST_*` values for 2025.05, but `THIS_*` values are `0` with `-100` change. This means the public K-stat monthly HS database had not released current-year May rows as of 2026-06-13.
- The K-stat page itself generated the 2026 month dropdown only through `04` on 2026-06-13, and the total-trade page used hidden `s_yymm=202604` in earlier checks.

## data.go.kr API Check

`DATA_GO_KR_SERVICE_KEY` was not present in the 2026-06-13 refresh environment, so the official KCS itemtrade API path could not be used by `npm run fetch`.

The public data.go.kr catalog page for `관세청_품목별 수출입실적(GW)` remains the correct official API source. It states that item trade statistics are aggregated by HS code, export value is the declared USD amount, weight is net weight in kg, and prior-month data is refreshed around the 15th after corrections/cancellations. The catalog was modified on 2026-05-22.

## Product Release Path

Official and reported monthly product data is still useful when HS weight data is absent.

Current May 2026 product values in the dashboard:

- Semiconductor exports: USD 37.16B, YoY +169.4%.
- Memory semiconductors: USD 32.1B, YoY +255%.
- DRAM: USD 18.6B, YoY +369.8%.
- NAND: USD 1.7B, YoY +206.8%.
- Computer / SSD proxy: USD 4.18B, YoY +290.7%, reported as driven by AI-server SSD demand.

Source chain:

- KCS official May 2026 provisional release verifies the release event and total trade context: `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?bbsId=1362&mi=2891&nttSn=10165743&nttSnUrl=b1fd44a499e5b2484a5de5bd2ef5fc25`
- MOTIE May trend article page with PDF/HWP attachment listing: `https://www.motie.go.kr/kor/article/ATCL3f49a5a8c/171880/view`
- Electimes report of the MOTIE May product split: `https://www.electimes.com/news/articleView.html?idxno=368652`
- Newstomato cross-check of the same product split: `https://www.newstomato.com/readnews.aspx?no=1302690`

Do not use these product-release rows to calculate USD/kg unless a source explicitly publishes matching export weight or quantity for the same product and period.

## High-Frequency June 2026 Check

Latest official high-frequency release as of 2026-06-13:

- KCS official release page: `https://www.customs.go.kr/kcs/na/ntt/selectNttInfo.do?nttSn=10166483&nttSnUrl=b1994d17533100b58e1d5ce5737ccd83`
- KCS official press-release list: `https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?bbsId=1362&mi=2891`
- KDI repost: `https://eiec.kdi.re.kr/policy/materialView.do?num=282517&pg=&pp=&topic=O`
- Korea.kr PDF/document viewer: `https://www.korea.kr/common/docViewer.do?fileId=198487131&tblKey=GMN`
- Korea.kr PDF download: `https://www.korea.kr/common/download.do?fileId=198487132&tblKey=GMN`

Verified official values for 2026-06-01 through 2026-06-10:

- Total exports: USD 28,635M, YoY +85.9%.
- Total imports: USD 23,352M, YoY +35.6%.
- Trade balance: USD 5,282M surplus.
- Working days: 7.0 in 2026 versus 5.5 in 2025.
- Average daily exports: USD 4.09B, YoY +46.1%.
- Semiconductor export growth: +205.8%.
- Semiconductor export share: 38.7%, up 15.1 percentage points.
- Rounded semiconductor export value in the KCS body: about USD 11.1B.

The direct KCS page body and KDI repost verify the rounded semiconductor value, growth rate, share, and aggregate trade totals. The dashboard keeps the precise semiconductor value of USD 11,068M only as a reported KCS-table value from Aju Economy and keeps it separate from the official rounded value. Do not derive a precise semiconductor amount from total exports and share.

KCS list page check on 2026-06-13:

- The two 2026-06-12 KCS posts on page 1 were not export tracking releases.
- The newest export-status release remains the 2026-06-11 June 1-10 provisional release.
- No 2026-06-13 KCS export-status release was present in the official list. The next expected high-frequency release remains the June 1-20 provisional briefing around 2026-06-21.

TRASS public homepage check on 2026-06-13:

- The public homepage showed June 1-10 provisional aggregate totals: exports USD 28,635M (+85.93%) and imports USD 23,352M (+35.64%).
- Notices showed 2026 April final data built on 2026-05-15.
- Public widgets did not expose semiconductor/memory product-level provisional values; the provisional-statistics lookup is marked premium, so no TRASS product split was landed.

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
