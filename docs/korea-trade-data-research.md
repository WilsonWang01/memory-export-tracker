# Korea Trade Data Research Notes

Last checked: 2026-06-11.

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

2026-06-11 verification:

- `2026.04`, HS `852351`, AMT returns `THIS_EXP_AMT=3836678` thousand USD and WGT returns `THIS_EXP_AMT=202057` kg.
- `2026.04`, HS `854232`, AMT returns `THIS_EXP_AMT=20829061` thousand USD and WGT returns `THIS_EXP_AMT=319349` kg.
- Forced `2026.05` queries are not usable: the worker returns `LAST_*` values for 2025.05, but `THIS_*` values are `0` with `-100` change. This means the public K-stat monthly HS database had not released current-year May rows as of 2026-06-11.
- The K-stat page itself also generated the 2026 month dropdown only through `04`, and the total-trade page used hidden `s_yymm=202604`.

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
