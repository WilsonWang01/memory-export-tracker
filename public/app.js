const state = {
  data: null,
  selectedProduct: "ssd",
  metric: "unitPriceUsdPerKg",
  range: "12",
  visibleProducts: new Set(["ssd", "dram_hbm"]),
  selectedPeriod: null
};

const metricLabels = {
  valueUsd: "出口金额",
  weightKg: "出口净重",
  unitPriceUsdPerKg: "出口单价"
};

const colors = {
  ssd: "#2f6fdb",
  dram_hbm: "#118273",
  semiconductor: "#b45f17",
  valueUsd: "#2f6fdb",
  weightKg: "#118273",
  unitPriceUsdPerKg: "#b45f17"
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

const formatPct = (value) => `${value > 0 ? "+" : ""}${Number(value).toFixed(Math.abs(value) >= 100 ? 0 : 1)}%`;

const percentChange = (current, previous) => {
  if (!current || !previous) return "n/a";
  const change = (current / previous - 1) * 100;
  return `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
};

const deltaClass = (current, previous) => {
  if (!current || !previous) return "neutral";
  return current >= previous ? "positive" : "negative";
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

function filteredMonthly() {
  if (!state.data) return [];
  const periods = [...new Set(state.data.monthly.map((point) => point.period))].sort();
  const keptPeriods = state.range === "all" ? periods : periods.slice(-Number(state.range));
  return state.data.monthly.filter((point) => keptPeriods.includes(point.period));
}

function visibleProducts() {
  return state.data.products.filter((product) => state.visibleProducts.has(product.key));
}

function freshnessByKey(key) {
  return (state.data.freshness ?? []).find((item) => item.key === key);
}

function coverageSentence(item) {
  if (!item) return "";
  return `截止：${item.latestPeriod} · 预计更新：${item.nextExpectedDate}`;
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
            const x = scaleX(index) - (barWidth * series.length) / 2 + seriesIndex * barWidth;
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
        .map((point, index) => `${index === 0 ? "M" : "L"} ${scaleX(index)} ${scaleY(point.value)}`)
        .join(" ");
      const lastPoint = item.points[item.points.length - 1];
      const lastIndex = item.points.length - 1;
      return `<path d="${path}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
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
                const point = item.points[index];
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

function renderSummary() {
  const grid = document.querySelector("#summaryGrid");
  const monthly = filteredMonthly();
  grid.innerHTML = state.data.products
    .map((product) => {
      const point = latestPoint(monthly, product.key);
      const previous = latestPoint(monthly, product.key, 1);
      const delta = percentChange(point?.unitPriceUsdPerKg, previous?.unitPriceUsdPerKg);
      const changeClass = deltaClass(point?.unitPriceUsdPerKg, previous?.unitPriceUsdPerKg);
      const hsFreshness = freshnessByKey("monthly_hs");
      return `<button class="summary-card ${state.selectedProduct === product.key ? "active" : ""}" data-product="${product.key}">
        <div class="card-head">
          <span>${product.name}</span>
          <code>${product.hsCode}</code>
        </div>
        <div class="metric-label">最新出口单价</div>
        <strong>${unitPrice(point?.unitPriceUsdPerKg)}</strong>
        <div class="metric-row card-split">
          <span><small>金额</small>${compactUsd(point?.valueUsd ?? 0)}</span>
          <span><small>净重</small>${compactWeight(point?.weightKg ?? 0)}</span>
          <span class="delta ${changeClass}"><small>环比</small>${delta}</span>
        </div>
        <p class="card-freshness">${escapeHtml(coverageSentence(hsFreshness))}</p>
      </button>`;
    })
    .join("");

  grid.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedProduct = button.dataset.product;
      render();
    });
  });
}

function renderFreshness() {
  const rows = state.data.freshness ?? [];
  document.querySelector("#freshnessGrid").innerHTML = rows
    .map(
      (item) => `<article class="freshness-card ${escapeHtml(item.status)}">
        <span>${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.latestPeriod)}</strong>
        <dl>
          <div><dt>发布日期</dt><dd>${escapeHtml(item.latestReleaseDate)}</dd></div>
          <div><dt>预计更新</dt><dd>${escapeHtml(item.nextExpectedDate)}</dd></div>
        </dl>
        <p>${escapeHtml(item.note)}</p>
      </article>`
    )
    .join("");
}

function renderMemoryDetail() {
  const detail = state.data.memoryDetail ?? [];
  const freshness = freshnessByKey("memory_provisional_detail");
  document.querySelector("#memoryDetailCoverage").textContent = coverageSentence(freshness);
  document.querySelector("#memoryDetailGrid").innerHTML = detail
    .map(
      (item) => `<a class="memory-detail-card" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">
        <span>${escapeHtml(item.category)}</span>
        <strong>${compactUsd(item.exportValueUsd)}</strong>
        <div class="memory-kpis">
          <em><small>单价</small>${unitPrice(item.unitPriceUsdPerKg)}</em>
          <em><small>金额 YoY</small>${formatPct(item.exportValueYoYPct)}</em>
          <em><small>金额 MoM</small>${formatPct(item.exportValueMoMPct)}</em>
          <em><small>单价 MoM</small>${formatPct(item.unitPriceMoMPct)}</em>
        </div>
        <p>${escapeHtml(item.sourceName)}</p>
      </a>`
    )
    .join("");
}

function renderDetails() {
  const product = state.data.products.find((item) => item.key === state.selectedProduct);
  const monthly = filteredMonthly();
  const point =
    (state.selectedPeriod && monthly.find((item) => item.productKey === state.selectedProduct && item.period === state.selectedPeriod)) ||
    latestPoint(monthly, state.selectedProduct);
  const previous = latestPoint(
    monthly.filter((item) => item.period < (point?.period ?? "")),
    state.selectedProduct
  );
  document.querySelector("#activeProductName").textContent = product?.name ?? "--";
  document.querySelector("#activeProductNote").textContent = product?.note ?? "";
  document.querySelector("#latestPeriod").textContent = point?.periodLabel ?? "--";
  document.querySelector("#latestValue").textContent = compactUsd(point?.valueUsd ?? 0);
  document.querySelector("#latestWeight").textContent = compactWeight(point?.weightKg ?? 0);
  document.querySelector("#latestPriceChange").textContent = percentChange(point?.unitPriceUsdPerKg, previous?.unitPriceUsdPerKg);
}

function renderMainChart() {
  const hsFreshness = freshnessByKey("monthly_hs");
  document.querySelector("#mainCoverageBadge").innerHTML = `<span>数据口径</span><strong>SSD / DRAM-HBM HS 明细</strong><em>${escapeHtml(coverageSentence(hsFreshness))}</em>`;
  document.querySelector("#mainChartTitle").textContent = `${metricLabels[state.metric]}趋势`;
  const monthly = filteredMonthly();
  const periods = [...new Set(monthly.map((point) => point.period))].sort();
  const series = visibleProducts().map((product) => ({
    name: product.name,
    color: colors[product.key],
    points: periods.map((period) => {
      const point = monthly.find((item) => item.productKey === product.key && item.period === period);
      return { label: period, value: point?.[state.metric] ?? null };
    }).filter((point) => point.value !== null)
  }));
  document.querySelector("#mainChart").innerHTML = chartSvg({
    series,
    labels: periods,
    formatter: (value) => formatMetric(value, state.metric),
    selectedLabel: state.selectedPeriod
  });
  bindChartInteractions(document.querySelector("#mainChart"));
}

function renderSplitChart() {
  const hsFreshness = freshnessByKey("monthly_hs");
  document.querySelector("#splitCoverageBadge").innerHTML = `<span>选中品类 HS 明细</span><em>${escapeHtml(coverageSentence(hsFreshness))}</em>`;
  const points = filteredMonthly().filter((point) => point.productKey === state.selectedProduct);
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
    mixed_public: "公开简报+样例HS",
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
  document.querySelector("#selectedPeriod").textContent = state.selectedPeriod ? state.selectedPeriod.replace(".", "-") : "未选择";
  document.querySelector("#seriesToggles").innerHTML = state.data.products
    .map(
      (product) =>
        `<button class="series-chip ${state.visibleProducts.has(product.key) ? "active" : ""}" data-series="${product.key}">
          <i style="background:${colors[product.key]}"></i>${escapeHtml(product.name)}
        </button>`
    )
    .join("");
  document.querySelectorAll("[data-series]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.series;
      if (state.visibleProducts.has(key) && state.visibleProducts.size > 1) {
        state.visibleProducts.delete(key);
      } else {
        state.visibleProducts.add(key);
      }
      render();
    });
  });
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
  renderFreshness();
  renderMemoryDetail();
  document.querySelectorAll("[data-metric]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.metric === state.metric);
  });
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
  try {
    const response = await fetch("/api/refresh", { method: "POST" });
    if (!response.ok) throw new Error(`Refresh API ${response.status}`);
    state.data = await response.json();
    render();
  } finally {
    button.classList.remove("spinning");
  }
}

document.querySelectorAll("[data-metric]").forEach((button) => {
  button.addEventListener("click", () => {
    state.metric = button.dataset.metric;
    render();
  });
});

document.querySelectorAll("[data-range]").forEach((button) => {
  button.addEventListener("click", () => {
    state.range = button.dataset.range;
    state.selectedPeriod = null;
    render();
  });
});

document.querySelector("#refreshButton").addEventListener("click", refreshNow);

loadDashboard().catch((error) => {
  document.querySelector("#statusMessage").textContent = error.message;
});
