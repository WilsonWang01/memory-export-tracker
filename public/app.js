const state = {
  data: null,
  selectedProduct: "dram_hbm",
  selectedMemoryCategory: null,
  metric: "valueUsd",
  range: "12",
  selectedPeriod: null
};

const metricLabels = {
  valueUsd: "出口金额",
  weightKg: "出口净重",
  unitPriceUsdPerKg: "出口单价"
};

const colors = {
  ssd: "#315f9d",
  dram_hbm: "#15756b",
  semiconductor: "#a8601f",
  valueUsd: "#315f9d",
  weightKg: "#15756b",
  unitPriceUsdPerKg: "#a8601f"
};

const memoryCategoryLabels = {
  "Memory ex-MCP (derived)": "Memory ex-MCP",
  "DRAM incl. modules": "DRAM",
  "DRAM excl. modules": "DRAM excl.",
  "Flash memory": "NAND",
  SSD: "SSD",
  "MCP / HBM proxy": "MCP / HBM"
};

const displaySegments = [
  { key: "dram", label: "DRAM", category: "DRAM incl. modules", productKey: "dram_hbm", hsCode: "854232" },
  { key: "ssd", label: "SSD", category: "SSD", productKey: "ssd", hsCode: "852351" },
  { key: "nand", label: "NAND", category: "Flash memory", productKey: null, hsCode: "暂估" }
];

const memoryCategoryMonthlyProducts = {
  SSD: "ssd",
  "DRAM incl. modules": "dram_hbm"
};

const compactUsd = (value) => {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
};

const compactWeight = (value) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}kt`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}t`;
  return `${value.toFixed(0)}kg`;
};

const unitPrice = (value) => (value ? `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}/kg` : "n/a");

const formatMetric = (value, metric) => {
  if (value === null || value === undefined) return "n/a";
  if (metric === "valueUsd") return compactUsd(value);
  if (metric === "weightKg") return compactWeight(value);
  return unitPrice(value);
};

const formatPct = (value) =>
  Number.isFinite(value) ? `${value > 0 ? "+" : ""}${Number(value).toFixed(Math.abs(value) >= 100 ? 0 : 1)}%` : "n/a";

const percentChangeValue = (current, previous) => {
  if (!current || !previous) return null;
  return (current / previous - 1) * 100;
};

const formatChange = (value) => (Number.isFinite(value) ? formatPct(value) : "n/a");

const deltaClassFromValue = (value) => {
  if (!Number.isFinite(value)) return "neutral";
  return value >= 0 ? "positive" : "negative";
};

const formatDateTime = (value) => {
  if (!value) return "尚未更新";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function latestPoint(points, key, offset = 0) {
  return points
    .filter((point) => point.productKey === key)
    .sort((a, b) => b.period.localeCompare(a.period))[offset];
}

function shiftPeriod(period, monthOffset) {
  const [year, month] = period.split(".").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + monthOffset, 1));
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function filteredMonthly() {
  if (!state.data) return [];
  const periods = [...new Set(state.data.monthly.map((point) => point.period))].sort();
  const keptPeriods = state.range === "all" ? periods : periods.slice(-Number(state.range));
  return state.data.monthly.filter((point) => keptPeriods.includes(point.period));
}

function freshnessByKey(key) {
  return (state.data.freshness ?? []).find((item) => item.key === key);
}

function memoryLabel(category) {
  return memoryCategoryLabels[category] ?? category;
}

function selectedMemoryItem() {
  const detail = state.data.memoryDetail ?? [];
  const preferredCategory = state.selectedProduct === "ssd" ? "SSD" : "DRAM incl. modules";
  const preferred = detail.find((item) => item.category === preferredCategory) ?? detail[0];
  if (!state.selectedMemoryCategory && preferred) state.selectedMemoryCategory = preferred.category;
  return detail.find((item) => item.category === state.selectedMemoryCategory) ?? preferred;
}

function activeMonthlyProductKey() {
  const active = selectedMemoryItem();
  if (!active) return state.selectedProduct;
  return memoryCategoryMonthlyProducts[active.category] ?? null;
}

function displaySegmentForCategory(category) {
  return displaySegments.find((segment) => segment.category === category);
}

function displaySegmentForProduct(productKey) {
  return displaySegments.find((segment) => segment.productKey === productKey);
}

function selectDisplaySegment(segment) {
  if (!segment) return;
  state.selectedMemoryCategory = segment.category;
  if (segment.productKey) state.selectedProduct = segment.productKey;
  state.selectedPeriod = null;
}

function syncMemoryCategoryForProduct(productKey) {
  const segment = displaySegmentForProduct(productKey);
  if (segment) state.selectedMemoryCategory = segment.category;
}

function syncProductForMemoryCategory(category) {
  const productKey = memoryCategoryMonthlyProducts[category];
  if (productKey) state.selectedProduct = productKey;
  state.selectedPeriod = null;
}

function coverageSentence(item) {
  if (!item) return "";
  return `截止：${item.latestPeriod} · 预计更新：${item.nextExpectedDate}`;
}

function volumePriceSignal(valuePct, weightPct, pricePct) {
  if (![valuePct, weightPct, pricePct].every(Number.isFinite)) return "样本不足";
  if (valuePct >= 0 && weightPct >= 0 && pricePct >= 0) return "量价共振";
  if (valuePct >= 0 && pricePct > 0 && weightPct < 0) return "价格驱动";
  if (valuePct >= 0 && weightPct > 0 && pricePct < 0) return "出货驱动";
  if (valuePct < 0 && pricePct > 0 && weightPct < 0) return "量缩抵消";
  if (valuePct < 0 && weightPct > 0 && pricePct < 0) return "价格拖累";
  if (valuePct < 0 && weightPct < 0 && pricePct < 0) return "量价双弱";
  return Math.abs(pricePct) >= Math.abs(weightPct) ? "价格主导" : "出货主导";
}

function tooltipHtml(label, rows) {
  return `<strong>${escapeHtml(label)}</strong>${rows
    .map((row) => `<span><i style="background:${row.color}"></i>${escapeHtml(row.name)}: ${escapeHtml(row.value)}</span>`)
    .join("")}`;
}

function tooltipText(label, rows) {
  return `${label}\n${rows.map((row) => `${row.name}: ${row.value}`).join("\n")}`;
}

function chartSvg({ series, labels, formatter, height = 360, chartType = "line", selectedLabel = null }) {
  if (!series.length || !series.some((item) => item.points.length)) {
    return `<div class="chart-empty">暂无可用数据</div>`;
  }

  const width = 900;
  const padding = { top: 22, right: 26, bottom: 42, left: 74 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const allValues = series.flatMap((item) => item.points.map((point) => point.value).filter((value) => Number.isFinite(value)));
  const max = Math.max(...allValues, 1);
  const min = chartType === "line" ? Math.min(0, ...allValues) : 0;
  const scaleY = (value) => padding.top + plotHeight - ((value - min) / (max - min || 1)) * plotHeight;
  const ticks = Array.from({ length: 5 }, (_, index) => min + ((max - min) / 4) * index);
  const count = Math.max(...series.map((item) => item.points.length), labels.length, 1);
  const scaleX = (index) => padding.left + (count === 1 ? plotWidth / 2 : (plotWidth / (count - 1)) * index);

  const grid = ticks
    .map((tick) => {
      const y = scaleY(tick);
      return `<line class="gridline" x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}"></line>
        <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatter(tick)}</text>`;
    })
    .join("");

  const xLabels = labels
    .map((label, index) => {
      if (labels.length > 10 && index % 2) return "";
      return `<text x="${scaleX(index)}" y="${height - 12}" text-anchor="middle">${label}</text>`;
    })
    .join("");

  const body = series
    .map((item, seriesIndex) => {
      if (chartType === "bar") {
        const barWidth = Math.min(46, plotWidth / Math.max(count, 1) / (series.length + 0.8));
        return item.points
          .map((point, index) => {
            const pointIndex = point.index ?? index;
            const x = scaleX(pointIndex) - (barWidth * series.length) / 2 + seriesIndex * barWidth;
            const y = scaleY(point.value);
            const tooltip = tooltipHtml(point.label ?? labels[index], [
              { color: item.color, name: item.name, value: formatter(point.value) },
              ...(point.sourceName ? [{ color: "#6b7280", name: "来源", value: point.sourceName }] : [])
            ]);
            const title = tooltipText(point.label ?? labels[index], [
              { name: item.name, value: formatter(point.value) },
              ...(point.sourceName ? [{ name: "来源", value: point.sourceName }] : [])
            ]);
            return `<rect class="bar-mark" x="${x}" y="${y}" width="${barWidth - 2}" height="${height - padding.bottom - y}" rx="4" fill="${item.color}" data-label="${escapeHtml(point.label ?? labels[index])}" data-tooltip="${escapeHtml(tooltip)}" data-source-url="${escapeHtml(point.sourceUrl ?? "")}"><title>${escapeHtml(title)}</title></rect>`;
          })
          .join("");
      }

      const path = item.points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(point.index ?? index)} ${scaleY(point.value)}`)
        .join(" ");
      const lastPoint = item.points[item.points.length - 1];
      const lastIndex = lastPoint.index ?? item.points.length - 1;
      const dash = item.dash ? ` stroke-dasharray="${escapeHtml(item.dash)}"` : "";
      return `<path d="${path}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${dash}></path>
        <circle cx="${scaleX(lastIndex)}" cy="${scaleY(lastPoint.value)}" r="4" fill="#fff" stroke="${item.color}" stroke-width="2"></circle>`;
    })
    .join("");

  const selectedLine = selectedLabel && labels.includes(selectedLabel)
    ? `<line class="focus-line" x1="${scaleX(labels.indexOf(selectedLabel))}" x2="${scaleX(labels.indexOf(selectedLabel))}" y1="${padding.top}" y2="${height - padding.bottom}"></line>`
    : "";
  const hitZones =
    chartType === "line"
      ? labels
          .map((label, index) => {
            const x = scaleX(index);
            const start = index === 0 ? padding.left : (scaleX(index - 1) + x) / 2;
            const end = index === labels.length - 1 ? width - padding.right : (x + scaleX(index + 1)) / 2;
            const rows = series
              .map((item) => {
                const point = item.points.find((candidate, pointIndex) => (candidate.index ?? pointIndex) === index);
                return point ? { color: item.color, name: item.name, value: formatter(point.value) } : null;
              })
              .filter(Boolean);
            return `<rect class="hit-zone" x="${start}" y="${padding.top}" width="${end - start}" height="${plotHeight}" data-label="${escapeHtml(label)}" data-tooltip="${escapeHtml(tooltipHtml(label, rows))}"><title>${escapeHtml(tooltipText(label, rows))}</title></rect>`;
          })
          .join("")
      : "";

  const legend = `<div class="legend">${series
    .map((item) => `<span><i style="background:${item.color}"></i>${item.name}</span>`)
    .join("")}</div>`;

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img">
      ${grid}
      <line class="axis" x1="${padding.left}" x2="${width - padding.right}" y1="${height - padding.bottom}" y2="${height - padding.bottom}"></line>
      ${xLabels}
      ${selectedLine}
      ${body}
      ${hitZones}
    </svg>${legend}`;
}

function lineSegments(points, scaleX, scaleY) {
  const segments = [];
  let current = [];
  points.forEach((point, index) => {
    if (Number.isFinite(point.value)) {
      current.push({ ...point, index });
      return;
    }
    if (current.length) segments.push(current);
    current = [];
  });
  if (current.length) segments.push(current);
  return segments
    .map((segment) => {
      if (segment.length === 1) {
        const point = segment[0];
        return `<circle cx="${scaleX(point.index)}" cy="${scaleY(point.value)}" r="3.5" fill="#fff" stroke="${point.color}" stroke-width="2"></circle>`;
      }
      const path = segment
        .map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(point.index)} ${scaleY(point.value)}`)
        .join(" ");
      const lastPoint = segment[segment.length - 1];
      return `<path d="${path}" fill="none" stroke="${lastPoint.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"${lastPoint.dash ? ` stroke-dasharray="${escapeHtml(lastPoint.dash)}"` : ""}></path>
        <circle cx="${scaleX(lastPoint.index)}" cy="${scaleY(lastPoint.value)}" r="4" fill="#fff" stroke="${lastPoint.color}" stroke-width="2"></circle>`;
    })
    .join("");
}

function amountGrowthDualAxisSvg({ points, labels, metric, selectedLabel = null, height = 360 }) {
  if (!points.length) return `<div class="chart-empty">暂无可用数据</div>`;

  const width = 900;
  const padding = { top: 26, right: 84, bottom: 42, left: 74 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const count = Math.max(points.length, 1);
  const scaleX = (index) => padding.left + (count === 1 ? plotWidth / 2 : (plotWidth / (count - 1)) * index);

  const metricMax = Math.max(...points.map((point) => point.value).filter(Number.isFinite), 1);
  const metricScaleMax = metricMax * 1.08;
  const metricScaleY = (value) => padding.top + plotHeight - (value / metricScaleMax) * plotHeight;
  const pctValues = points.flatMap((point) => [point.yoyPct, point.sequentialPct]).filter(Number.isFinite);
  const pctMinBase = pctValues.length ? Math.min(0, ...pctValues) : -10;
  const pctMaxBase = pctValues.length ? Math.max(0, ...pctValues) : 10;
  const pctPadding = Math.max((pctMaxBase - pctMinBase) * 0.12, 4);
  const pctMin = pctMinBase - pctPadding;
  const pctMax = pctMaxBase + pctPadding;
  const pctScaleY = (value) => padding.top + plotHeight - ((value - pctMin) / (pctMax - pctMin || 1)) * plotHeight;
  const metricTicks = Array.from({ length: 5 }, (_, index) => (metricScaleMax / 4) * index);
  const pctTicks = Array.from({ length: 5 }, (_, index) => pctMin + ((pctMax - pctMin) / 4) * index);

  const grid = metricTicks
    .map((tick) => {
      const y = metricScaleY(tick);
      return `<line class="gridline" x1="${padding.left}" x2="${width - padding.right}" y1="${y}" y2="${y}"></line>
        <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end">${formatMetric(tick, metric)}</text>`;
    })
    .join("");
  const rightAxis = pctTicks
    .map((tick) => `<text x="${width - padding.right + 10}" y="${pctScaleY(tick) + 4}" text-anchor="start">${formatPct(tick)}</text>`)
    .join("");
  const xLabels = labels
    .map((label, index) => {
      if (labels.length > 10 && index % 2) return "";
      return `<text x="${scaleX(index)}" y="${height - 12}" text-anchor="middle">${escapeHtml(label)}</text>`;
    })
    .join("");
  const barWidth = Math.min(34, plotWidth / Math.max(count, 1) * 0.44);
  const bars = points
    .map((point, index) => {
      const x = scaleX(index) - barWidth / 2;
      const y = metricScaleY(point.value);
      return `<rect class="amount-bar" x="${x}" y="${y}" width="${barWidth}" height="${height - padding.bottom - y}" rx="4" fill="#dbe3dc"></rect>`;
    })
    .join("");
  const yoyPoints = points.map((point) => ({ value: point.yoyPct, color: colors.unitPriceUsdPerKg, dash: "" }));
  const sequentialPoints = points.map((point) => ({ value: point.sequentialPct, color: colors.weightKg, dash: "6 5" }));
  const selectedLine = selectedLabel && labels.includes(selectedLabel)
    ? `<line class="focus-line" x1="${scaleX(labels.indexOf(selectedLabel))}" x2="${scaleX(labels.indexOf(selectedLabel))}" y1="${padding.top}" y2="${height - padding.bottom}"></line>`
    : "";
  const hitZones = points
    .map((point, index) => {
      const x = scaleX(index);
      const start = index === 0 ? padding.left : (scaleX(index - 1) + x) / 2;
      const end = index === labels.length - 1 ? width - padding.right : (x + scaleX(index + 1)) / 2;
      const rows = [
        { color: colors[metric], name: metricLabels[metric], value: formatMetric(point.value, metric) },
        { color: "#b45f17", name: "YoY", value: formatChange(point.yoyPct) },
        { color: "#118273", name: "MoM", value: formatChange(point.sequentialPct) }
      ];
      return `<rect class="hit-zone" x="${start}" y="${padding.top}" width="${end - start}" height="${plotHeight}" data-label="${escapeHtml(point.period)}" data-tooltip="${escapeHtml(tooltipHtml(point.periodLabel, rows))}"><title>${escapeHtml(tooltipText(point.periodLabel, rows))}</title></rect>`;
    })
    .join("");
  const legend = `<div class="legend dual-axis-legend">
    <span><i style="background:#dbe3dc"></i>${metricLabels[metric]}（左轴）</span>
    <span><i style="background:${colors.unitPriceUsdPerKg}"></i>YoY（右轴）</span>
    <span><i class="dashed" style="background:${colors.weightKg}"></i>MoM（右轴）</span>
  </div>`;

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${metricLabels[metric]}与增长率双轴图">
      ${grid}
      ${rightAxis}
      <text class="axis-label" x="${padding.left}" y="14" text-anchor="start">${metricLabels[metric]}</text>
      <text class="axis-label" x="${width - padding.right}" y="14" text-anchor="end">增长率</text>
      <line class="axis" x1="${padding.left}" x2="${width - padding.right}" y1="${height - padding.bottom}" y2="${height - padding.bottom}"></line>
      <line class="axis" x1="${width - padding.right}" x2="${width - padding.right}" y1="${padding.top}" y2="${height - padding.bottom}"></line>
      ${xLabels}
      ${bars}
      ${selectedLine}
      ${lineSegments(yoyPoints, scaleX, pctScaleY)}
      ${lineSegments(sequentialPoints, scaleX, pctScaleY)}
      ${hitZones}
    </svg>${legend}`;
}

function memorySnapshotHtml(item, compact = false) {
  if (!item) return `<div class="chart-empty">暂无可用数据</div>`;
  const rows = [
    {
      label: "出口金额",
      value: compactUsd(item.exportValueUsd),
      delta: `YoY ${formatPct(item.exportValueYoYPct)} · MoM ${formatPct(item.exportValueMoMPct)}`,
      width: Math.min(Math.max(Math.abs(item.exportValueMoMPct ?? 0) * 3, 14), 100),
      className: deltaClassFromValue(item.exportValueMoMPct)
    },
    {
      label: "单位价格",
      value: unitPrice(item.unitPriceUsdPerKg),
      delta: `YoY ${formatPct(item.unitPriceYoYPct)} · MoM ${formatPct(item.unitPriceMoMPct)}`,
      width: Math.min(Math.max(Math.abs(item.unitPriceMoMPct ?? 0) * 3, 14), 100),
      className: deltaClassFromValue(item.unitPriceMoMPct)
    }
  ];
  return `<div class="provisional-snapshot ${compact ? "compact" : ""}">
    <div class="snapshot-copy">
      <span>${escapeHtml(item.periodLabel)}</span>
      <strong>${escapeHtml(memoryLabel(item.category))} 暂估快照</strong>
      <p>当前公开源只给这一期细分金额和单价，没有连续月度 HS 净重序列；所以这里显示暂估快照，不再误切到 SSD/DRAM 月度线。</p>
    </div>
    <div class="snapshot-bars">
      ${rows
        .map(
          (row) => `<div class="snapshot-row">
            <div><span>${escapeHtml(row.label)}</span><strong>${escapeHtml(row.value)}</strong></div>
            <div class="snapshot-track"><i class="${row.className}" style="width:${row.width}%"></i></div>
            <em>${escapeHtml(row.delta)}</em>
          </div>`
        )
        .join("")}
    </div>
    <a class="memory-source-link" href="${escapeHtml(item.sourceUrl ?? "#")}" target="_blank" rel="noreferrer">${escapeHtml(item.sourceName ?? "source")}</a>
  </div>`;
}

function monthlyPointsForProduct(productKey) {
  const allProductPoints = state.data.monthly
    .filter((point) => point.productKey === productKey)
    .sort((a, b) => a.period.localeCompare(b.period));
  const byPeriod = new Map(allProductPoints.map((point) => [point.period, point]));
  return filteredMonthly()
    .filter((point) => point.productKey === productKey)
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((point) => {
      const previousMonth = byPeriod.get(shiftPeriod(point.period, -1));
      const previousYear = byPeriod.get(shiftPeriod(point.period, -12));
      return {
        period: point.period,
        periodLabel: point.periodLabel,
        value: point[state.metric],
        sequentialPct: percentChangeValue(point[state.metric], previousMonth?.[state.metric]),
        yoyPct: percentChangeValue(point[state.metric], previousYear?.[state.metric])
      };
    });
}

function monthlyChartCard(segment) {
  const points = monthlyPointsForProduct(segment.productKey);
  return `<section class="flat-chart-card" data-segment="${segment.key}">
    <div class="flat-chart-head">
      <span>${escapeHtml(segment.label)}</span>
      <code>${escapeHtml(segment.hsCode)}</code>
    </div>
    ${amountGrowthDualAxisSvg({
      points,
      labels: points.map((point) => point.period),
      metric: state.metric,
      selectedLabel: state.selectedPeriod,
      height: 250
    })}
  </section>`;
}

function nandChartCard() {
  const item = (state.data.memoryDetail ?? []).find((detail) => detail.category === "Flash memory");
  return `<section class="flat-chart-card" data-segment="nand">
    <div class="flat-chart-head">
      <span>NAND</span>
      <code>暂估</code>
    </div>
    ${memorySnapshotHtml(item, true)}
  </section>`;
}

function renderSummary() {
  const grid = document.querySelector("#summaryGrid");
  const monthly = filteredMonthly();
  const activeSegment = displaySegmentForCategory(selectedMemoryItem()?.category);
  grid.innerHTML = displaySegments
    .map((segment) => {
      const product = state.data.products.find((item) => item.key === segment.productKey);
      const memoryItem = (state.data.memoryDetail ?? []).find((item) => item.category === segment.category);
      const point = segment.productKey ? latestPoint(monthly, segment.productKey) : null;
      const previous = segment.productKey ? latestPoint(monthly, segment.productKey, 1) : null;
      const valuePct = segment.productKey ? percentChangeValue(point?.valueUsd, previous?.valueUsd) : memoryItem?.exportValueMoMPct;
      const weightPct = segment.productKey ? percentChangeValue(point?.weightKg, previous?.weightKg) : null;
      const pricePct = segment.productKey ? percentChangeValue(point?.unitPriceUsdPerKg, previous?.unitPriceUsdPerKg) : memoryItem?.unitPriceMoMPct;
      const signal = segment.productKey ? volumePriceSignal(valuePct, weightPct, pricePct) : "暂估快照";
      const hsFreshness = freshnessByKey("monthly_hs");
      return `<button class="summary-card ${activeSegment?.key === segment.key ? "active" : ""}" data-segment="${segment.key}">
        <div class="card-head">
          <span>${escapeHtml(segment.label)}</span>
          <code>${escapeHtml(segment.hsCode)}</code>
        </div>
        <div class="metric-label">${segment.productKey ? "最新出口单价" : "暂估出口单价"}</div>
        <strong>${unitPrice(segment.productKey ? point?.unitPriceUsdPerKg : memoryItem?.unitPriceUsdPerKg)}</strong>
        <div class="summary-analysis">
          <span class="analysis-cell delta ${deltaClassFromValue(valuePct)}">
            <small>金额 MoM</small>
            <b>${formatChange(valuePct)}</b>
            <em>${compactUsd(segment.productKey ? point?.valueUsd ?? 0 : memoryItem?.exportValueUsd ?? 0)}</em>
          </span>
          <span class="analysis-cell delta ${deltaClassFromValue(weightPct)}">
            <small>${segment.productKey ? "净重 MoM" : "净重"}</small>
            <b>${segment.productKey ? formatChange(weightPct) : "未披露"}</b>
            <em>${segment.productKey ? compactWeight(point?.weightKg ?? 0) : "n/a"}</em>
          </span>
          <span class="analysis-cell delta ${deltaClassFromValue(pricePct)}">
            <small>单价 MoM</small>
            <b>${formatChange(pricePct)}</b>
            <em>${unitPrice(segment.productKey ? point?.unitPriceUsdPerKg : memoryItem?.unitPriceUsdPerKg)}</em>
          </span>
          <span class="analysis-cell signal">
            <small>量价判断</small>
            <b>${signal}</b>
            <em>${escapeHtml(segment.productKey ? point?.periodLabel ?? "--" : memoryItem?.periodLabel ?? "--")}</em>
          </span>
        </div>
        <p class="card-freshness">${escapeHtml(segment.productKey ? coverageSentence(hsFreshness) : "NAND 当前为 5 月前 20 日公开暂估")}</p>
      </button>`;
    })
    .join("");

  grid.querySelectorAll("[data-segment]").forEach((button) => {
    button.addEventListener("click", () => {
      selectDisplaySegment(displaySegments.find((segment) => segment.key === button.dataset.segment));
      render();
    });
  });
}

function renderMemoryDetail() {
  const detail = state.data.memoryDetail ?? [];
  const visibleDetail = displaySegments
    .map((segment) => detail.find((item) => item.category === segment.category))
    .filter(Boolean);
  const freshness = freshnessByKey("memory_provisional_detail");
  const active = selectedMemoryItem();
  document.querySelector("#memoryDetailCoverage").textContent = `${coverageSentence(freshness)} · 非直连官方接口`;
  document.querySelector("#memoryDetailMethod").textContent = freshness?.note ?? "";
  document.querySelector("#memoryDetailSwitch").innerHTML = displaySegments
    .map(
      (segment) => `<button class="${segment.category === active?.category ? "selected" : ""}" data-memory-category="${escapeHtml(segment.category)}">
        ${escapeHtml(segment.label)}
      </button>`
    )
    .join("");
  document.querySelector("#memoryDetailFocus").innerHTML = active
    ? `<div class="memory-focus-main">
        <span>${escapeHtml(active.periodLabel)}</span>
        <h3>${escapeHtml(memoryLabel(active.category))}</h3>
        <strong>${compactUsd(active.exportValueUsd)}</strong>
      </div>
      <div class="memory-focus-kpis">
        <span><small>出口金额 YoY</small><b>${formatPct(active.exportValueYoYPct)}</b></span>
        <span><small>出口金额 MoM</small><b>${formatPct(active.exportValueMoMPct)}</b></span>
        <span><small>单价</small><b>${unitPrice(active.unitPriceUsdPerKg)}</b></span>
        <span><small>单价 MoM</small><b>${formatPct(active.unitPriceMoMPct)}</b></span>
      </div>
      <a class="memory-source-link" href="${escapeHtml(active.sourceUrl ?? "#")}" target="_blank" rel="noreferrer">${escapeHtml(active.sourceName ?? "source")}</a>`
    : `<div class="chart-empty">暂无可用数据</div>`;
  document.querySelector("#memoryDetailGrid").innerHTML = visibleDetail
    .map(
      (item) => `<button class="memory-detail-card ${item.category === active?.category ? "active" : ""}" data-memory-category="${escapeHtml(item.category)}">
        <span>${escapeHtml(memoryLabel(item.category))}</span>
        <strong>${compactUsd(item.exportValueUsd)}</strong>
        <div class="memory-kpis">
          <em><small>单价</small>${unitPrice(item.unitPriceUsdPerKg)}</em>
          <em><small>金额 YoY</small>${formatPct(item.exportValueYoYPct)}</em>
          <em><small>金额 MoM</small>${formatPct(item.exportValueMoMPct)}</em>
          <em><small>单价 MoM</small>${formatPct(item.unitPriceMoMPct)}</em>
        </div>
        <p>${escapeHtml(item.sourceName)}</p>
      </button>`
    )
    .join("");
  document.querySelectorAll("[data-memory-category]").forEach((button) => {
    button.addEventListener("click", () => {
      selectDisplaySegment(displaySegmentForCategory(button.dataset.memoryCategory));
      render();
    });
  });
}

function renderDetails() {
  const productKey = activeMonthlyProductKey();
  const product = state.data.products.find((item) => item.key === productKey);
  const hsFreshness = freshnessByKey("monthly_hs");
  const monthly = filteredMonthly();
  if (!product) {
    const active = selectedMemoryItem();
    document.querySelector("#activeProductName").textContent = memoryLabel(active?.category ?? "当前分段");
    document.querySelector("#sideCoverageNote").textContent = "暂估细分来自公开市场镜像；KCS 官方月度 HS 数据当前没有这一分段的连续量价序列。";
    document.querySelector("#activeProductNote").textContent = active?.sourceName ?? "";
    document.querySelector("#latestPeriod").textContent = active?.periodLabel ?? "--";
    document.querySelector("#latestValue").textContent = compactUsd(active?.exportValueUsd ?? 0);
    document.querySelector("#latestValueChange").textContent = formatPct(active?.exportValueMoMPct);
    document.querySelector("#latestWeight").textContent = "未披露";
    document.querySelector("#latestWeightChange").textContent = "n/a";
    document.querySelector("#latestPriceChange").textContent = formatPct(active?.unitPriceMoMPct);
    document.querySelector("#latestSignal").textContent = "暂估快照";
    return;
  }
  const point =
    (state.selectedPeriod && monthly.find((item) => item.productKey === productKey && item.period === state.selectedPeriod)) ||
    latestPoint(monthly, productKey);
  const previous = latestPoint(
    monthly.filter((item) => item.period < (point?.period ?? "")),
    productKey
  );
  const valuePct = percentChangeValue(point?.valueUsd, previous?.valueUsd);
  const weightPct = percentChangeValue(point?.weightKg, previous?.weightKg);
  const pricePct = percentChangeValue(point?.unitPriceUsdPerKg, previous?.unitPriceUsdPerKg);
  document.querySelector("#activeProductName").textContent = product?.name ?? "--";
  document.querySelector("#sideCoverageNote").textContent = `${coverageSentence(hsFreshness)}。${hsFreshness?.note ?? ""}`;
  document.querySelector("#activeProductNote").textContent = product?.note ?? "";
  document.querySelector("#latestPeriod").textContent = point?.periodLabel ?? "--";
  document.querySelector("#latestValue").textContent = compactUsd(point?.valueUsd ?? 0);
  document.querySelector("#latestValueChange").textContent = formatChange(valuePct);
  document.querySelector("#latestWeight").textContent = compactWeight(point?.weightKg ?? 0);
  document.querySelector("#latestWeightChange").textContent = formatChange(weightPct);
  document.querySelector("#latestPriceChange").textContent = formatChange(pricePct);
  document.querySelector("#latestSignal").textContent = volumePriceSignal(valuePct, weightPct, pricePct);
}

function renderMainChart() {
  const hsFreshness = freshnessByKey("monthly_hs");
  document.querySelector("#mainCoverageBadge").innerHTML = `<span>三段式结构</span><strong>DRAM · SSD · NAND</strong><em>DRAM/SSD：${escapeHtml(coverageSentence(hsFreshness))}；NAND：公开暂估快照</em>`;
  document.querySelector("#mainChartTitle").textContent = `DRAM / SSD / NAND：三图平铺`;
  document.querySelector("#mainChart").innerHTML = `<div class="three-chart-grid">
    ${monthlyChartCard(displaySegments[0])}
    ${monthlyChartCard(displaySegments[1])}
    ${nandChartCard()}
  </div>`;
  bindChartInteractions(document.querySelector("#mainChart"));
}

function renderSplitChart() {
  const hsFreshness = freshnessByKey("monthly_hs");
  const productKey = activeMonthlyProductKey();
  if (!productKey) {
    const active = selectedMemoryItem();
    document.querySelector("#splitCoverageBadge").innerHTML = `<span>暂估细分</span><em>没有连续月度 HS 量价序列</em>`;
    document.querySelector("#splitChart").innerHTML = memorySnapshotHtml(active, true);
    return;
  }
  document.querySelector("#splitCoverageBadge").innerHTML = `<span>选中品类 HS 明细</span><em>${escapeHtml(coverageSentence(hsFreshness))}</em>`;
  const points = filteredMonthly().filter((point) => point.productKey === productKey);
  const labels = points.map((point) => point.period);
  const series = [
    { name: "出口金额", color: colors.valueUsd, metric: "valueUsd" },
    { name: "出口净重", color: colors.weightKg, metric: "weightKg" },
    { name: "出口单价", color: colors.unitPriceUsdPerKg, metric: "unitPriceUsdPerKg" }
  ].map((item) => {
    const max = Math.max(...points.map((point) => point[item.metric] ?? 0), 1);
    return {
      name: item.name,
      color: item.color,
      points: points.map((point) => ({ label: point.periodLabel, value: ((point[item.metric] ?? 0) / max) * 100 }))
    };
  });
  document.querySelector("#splitChart").innerHTML = chartSvg({
    series,
    labels,
    formatter: (value) => `${value.toFixed(0)}`,
    height: 280,
    selectedLabel: state.selectedPeriod
  });
  bindChartInteractions(document.querySelector("#splitChart"));
}

function renderPrelimChart() {
  const monthlyFreshness = freshnessByKey("monthly_semiconductor");
  const tenDayFreshness = freshnessByKey("ten_day_semiconductor");
  document.querySelector("#officialCoverageBadge").innerHTML = `<span>半导体总量</span><em>月度${escapeHtml(coverageSentence(monthlyFreshness))}；旬度${escapeHtml(coverageSentence(tenDayFreshness))}</em>`;
  const monthlyOfficial = state.data.officialMonthly ?? [];
  document.querySelector("#monthlyOfficial").innerHTML = monthlyOfficial
    .map(
      (point) => `<a href="${escapeHtml(point.sourceUrl)}" target="_blank" rel="noreferrer">
        <span>${escapeHtml(point.periodLabel)}</span>
        <strong>${compactUsd(point.valueUsd)}</strong>
        <small>${escapeHtml(point.productName)}</small>
      </a>`
    )
    .join("");
  const labels = state.data.preliminary.map((point) => point.periodLabel);
  const latest = state.data.preliminary[state.data.preliminary.length - 1];
  document.querySelector("#prelimCaption").textContent = latest?.sourceName
    ? `最新：${latest.periodLabel} 半导体出口 ${compactUsd(latest.valueUsd)}。来源：${latest.sourceName}`
    : "用于观察 KCS 旬度简报口径下的半导体出口节奏。";
  const series = [
    {
      name: "半导体出口金额",
      color: colors.semiconductor,
      points: state.data.preliminary.map((point) => ({
        label: point.periodLabel,
        value: point.valueUsd,
        sourceName: point.sourceName,
        sourceUrl: point.sourceUrl
      }))
    }
  ];
  document.querySelector("#prelimChart").innerHTML = chartSvg({
    series,
    labels,
    formatter: compactUsd,
    height: 280,
    chartType: "bar"
  });
  document.querySelector("#sourceList").innerHTML = state.data.preliminary
    .map(
      (point) =>
        `<a href="${escapeHtml(point.sourceUrl ?? "#")}" target="_blank" rel="noreferrer">
          <span>${escapeHtml(point.periodLabel)}</span>
          <strong>${compactUsd(point.valueUsd)}</strong>
        </a>`
    )
    .join("");
  bindChartInteractions(document.querySelector("#prelimChart"));
}

function renderMeta() {
  const sourcePill = document.querySelector("#sourcePill");
  const sourceText = {
    official_api: "官方接口",
    mixed_public: "公开简报+官方HS",
    sample: "样例数据"
  };
  sourcePill.textContent = sourceText[state.data.meta.mode] ?? "数据已载入";
  sourcePill.className = `source-pill ${state.data.meta.mode === "official_api" ? "official" : state.data.meta.mode === "mixed_public" ? "mixed" : "sample"}`;
  document.querySelector("#lastUpdated").textContent = formatDateTime(state.data.meta.lastUpdated);
  document.querySelector("#statusMessage").textContent = state.data.meta.message;
}

function renderControls() {
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.range === state.range);
  });
  document.querySelectorAll("[data-metric]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.metric === state.metric);
  });
  document.querySelector("#selectedPeriod").textContent = state.selectedPeriod ? state.selectedPeriod.replace(".", "-") : "未选择";
}

function bindChartInteractions(container) {
  const tooltip = document.querySelector("#chartTooltip");
  container.querySelectorAll("[data-tooltip]").forEach((mark) => {
    const showTooltip = () => {
      tooltip.innerHTML = mark.dataset.tooltip;
      tooltip.hidden = false;
      mark.classList.add("hovered");
    };
    const moveTooltip = (event) => {
      tooltip.style.left = `${event.clientX + 14}px`;
      tooltip.style.top = `${event.clientY + 14}px`;
    };
    const hideTooltip = () => {
      tooltip.hidden = true;
      mark.classList.remove("hovered");
    };
    mark.addEventListener("pointerenter", showTooltip);
    mark.addEventListener("mouseenter", showTooltip);
    mark.addEventListener("pointermove", moveTooltip);
    mark.addEventListener("mousemove", moveTooltip);
    mark.addEventListener("pointerleave", hideTooltip);
    mark.addEventListener("mouseleave", hideTooltip);
    mark.addEventListener("click", () => {
      if (mark.dataset.sourceUrl) {
        window.open(mark.dataset.sourceUrl, "_blank", "noopener,noreferrer");
        return;
      }
      state.selectedPeriod = mark.dataset.label;
      render();
    });
  });
}

function render() {
  if (!state.data) return;
  renderControls();
  renderMemoryDetail();
  renderMeta();
  renderSummary();
  renderDetails();
  renderMainChart();
  renderSplitChart();
  renderPrelimChart();
}

async function loadDashboard() {
  const candidates = ["/api/dashboard", "data/trade-data.json"];
  let lastError = null;
  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok || !contentType.includes("application/json")) {
        throw new Error(`${url} returned ${response.status} ${contentType || "unknown content type"}`);
      }
      state.data = await response.json();
      render();
      return;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("Dashboard data unavailable");
}

async function refreshNow() {
  const button = document.querySelector("#refreshButton");
  button.classList.add("spinning");
  button.disabled = true;
  try {
    const response = await fetch("/api/refresh", { method: "POST" });
    if (!response.ok) throw new Error(`Refresh API ${response.status}`);
    state.data = await response.json();
    render();
  } catch {
    await loadDashboard();
    document.querySelector("#statusMessage").textContent = "已重新载入静态数据；实时刷新需在本地 Node 服务中运行。";
  } finally {
    button.classList.remove("spinning");
    button.disabled = false;
  }
}

document.querySelectorAll("[data-range]").forEach((button) => {
  button.addEventListener("click", () => {
    state.range = button.dataset.range;
    state.selectedPeriod = null;
    render();
  });
});

document.querySelectorAll("[data-metric]").forEach((button) => {
  button.addEventListener("click", () => {
    state.metric = button.dataset.metric;
    state.selectedPeriod = null;
    render();
  });
});

document.querySelector("#refreshButton").addEventListener("click", refreshNow);

loadDashboard().catch((error) => {
  document.querySelector("#statusMessage").textContent = error.message;
});
