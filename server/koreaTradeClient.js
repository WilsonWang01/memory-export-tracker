import { env } from "./config.js";

function toNumber(value) {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return value;
  return Number(String(value).replaceAll(",", "")) || 0;
}

function monthToken(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getLookbackRange(lookbackMonths) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const start = new Date(end.getFullYear(), end.getMonth() - lookbackMonths + 1, 1);
  return { start: monthToken(start), end: monthToken(end) };
}

function periodsInRange(range) {
  const startYear = Number(range.start.slice(0, 4));
  const startMonth = Number(range.start.slice(4, 6));
  const endYear = Number(range.end.slice(0, 4));
  const endMonth = Number(range.end.slice(4, 6));
  const periods = [];
  let cursor = new Date(startYear, startMonth - 1, 1);
  const end = new Date(endYear, endMonth - 1, 1);

  while (cursor <= end) {
    periods.push(`${cursor.getFullYear()}.${String(cursor.getMonth() + 1).padStart(2, "0")}`);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return periods;
}

function tagValue(block, tagName) {
  const match = block.match(new RegExp(`<${tagName}>(.*?)</${tagName}>`, "s"));
  return match ? match[1].trim() : "";
}

function parseXmlItems(xml) {
  return [...xml.matchAll(/<item>(.*?)<\/item>/gs)].map((match) => ({
    year: tagValue(match[1], "year"),
    hsCd: tagValue(match[1], "hsCd"),
    statKor: tagValue(match[1], "statKor"),
    expWgt: tagValue(match[1], "expWgt"),
    expDlr: tagValue(match[1], "expDlr")
  }));
}

function unwrapJsonItems(json) {
  const item = json?.response?.body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function parseKitaRows(xml) {
  return [...xml.matchAll(/<TR[^>]*>([\s\S]*?)<\/TR>/gi)].map((match) =>
    [...match[1].matchAll(/<TD[^>]*>([\s\S]*?)<\/TD>/gi)].map((cell) =>
      cell[1]
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<[^>]+>/g, "")
        .trim()
    )
  );
}

async function fetchKitaMetric(product, period, field) {
  const [year, month] = period.split(".");
  const endpoint = "https://stat.kita.net/stat/kts/pum/ItemImpExpListWorker.screen";
  const params = new URLSearchParams({
    event_udap: "Search",
    sheet_col_length: "16",
    searchType: "SHEET",
    pageNum: "1",
    viewType: "SHEET",
    chartType: "bar",
    p_cond_unit: "6",
    HS_YN: "Y",
    ITEM_YN: "Y",
    MTI_YN: "Y",
    SITC_YN: "Y",
    stat_yn: "Y",
    CTR_GB: "KTS",
    s_url: "/stat/kts/pum/ItemImpExpList",
    s_cond_gb: "HS",
    s_cond_unit: "6",
    s_cond_unit_num: product.hsCode,
    s_trade_gb: "s_suji",
    s_year: year,
    s_month: month,
    s_field: field,
    s_monthsum_gb: "1",
    s_measure: field === "AMT" ? "1000" : "1",
    s_sort: "ROW_CODE",
    s_sort_val: "ASC",
    s_language: "eng_name",
    listCount: "100"
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "user-agent": "Mozilla/5.0"
    },
    body: params
  });
  if (!response.ok) {
    throw new Error(`KITA K-stat request failed: ${response.status} ${response.statusText}`);
  }

  const row = parseKitaRows(await response.text()).find((cells) => cells[1] === product.hsCode);
  if (!row) return 0;
  return toNumber(row[9]);
}

export async function fetchKitaMonthlyProductSeries(product, range = getLookbackRange(env.lookbackMonths)) {
  const periods = periodsInRange(range);
  const points = [];

  for (const period of periods) {
    const [valueThousandUsd, weightKg] = await Promise.all([
      fetchKitaMetric(product, period, "AMT"),
      fetchKitaMetric(product, period, "WGT")
    ]);
    const valueUsd = valueThousandUsd * 1000;
    if (valueUsd <= 0 || weightKg <= 0) continue;
    points.push({
      period,
      periodLabel: period.replace(".", "-"),
      valueUsd,
      weightKg,
      unitPriceUsdPerKg: valueUsd / weightKg,
      hsCode: product.hsCode,
      productKey: product.key,
      productName: product.name,
      source: "official_kita_kstat",
      sourceName: "KITA K-stat ItemImpExpList worker",
      sourceUrl: "https://stat.kita.net/stat/kts/pum/ItemImpExpList.screen",
      status: "final"
    });
  }

  return points.sort((a, b) => a.period.localeCompare(b.period));
}

export async function fetchMonthlyProductSeries(product, range = getLookbackRange(env.lookbackMonths)) {
  if (!env.serviceKey) {
    throw new Error("DATA_GO_KR_SERVICE_KEY is not configured.");
  }

  const endpoint = "http://apis.data.go.kr/1220000/Itemtrade/getItemtradeList";
  const params = new URLSearchParams({
    strtYymm: range.start,
    endYymm: range.end,
    hsSgn: product.hsCode,
    numOfRows: "200",
    _type: "json"
  });
  const response = await fetch(`${endpoint}?serviceKey=${env.serviceKey}&${params.toString()}`);
  if (!response.ok) {
    throw new Error(`KCS itemtrade request failed: ${response.status} ${response.statusText}`);
  }

  const raw = await response.text();
  let items = [];
  try {
    const parsed = JSON.parse(raw);
    const resultCode = String(parsed?.response?.header?.resultCode ?? "");
    if (resultCode && resultCode !== "00") {
      throw new Error(`${resultCode}: ${parsed?.response?.header?.resultMsg ?? "unknown error"}`);
    }
    items = unwrapJsonItems(parsed);
  } catch (jsonError) {
    if (!raw.trim().startsWith("<")) throw jsonError;
    items = parseXmlItems(raw);
  }

  return items
    .map((item) => {
      const valueUsd = toNumber(item.expDlr);
      const weightKg = toNumber(item.expWgt);
      const period = String(item.year ?? "");
      return {
        period,
        periodLabel: period.replace(".", "-"),
        valueUsd,
        weightKg,
        unitPriceUsdPerKg: weightKg > 0 ? valueUsd / weightKg : null,
        hsCode: String(item.hsCd ?? product.hsCode),
        productKey: product.key,
        productName: product.name,
        source: "official_api",
        status: "final"
      };
    })
    .filter((point) => point.period && point.valueUsd > 0)
    .sort((a, b) => a.period.localeCompare(b.period));
}
