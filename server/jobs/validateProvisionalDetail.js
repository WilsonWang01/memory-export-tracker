import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const requiredCategories = ["DRAM incl. modules", "SSD", "Flash memory"];
const numericFields = [
  "exportValueUsd",
  "exportValueYoYPct",
  "exportValueMoMPct",
  "unitPriceUsdPerKg",
  "unitPriceYoYPct",
  "unitPriceMoMPct"
];

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const provisionalPath = path.join(rootDir, "data", "provisional-memory-detail.json");

function fail(message) {
  throw new Error(`[provisional-memory-detail] ${message}`);
}

function isNumberOrNull(value) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

export async function validateProvisionalDetail() {
  const raw = await fs.readFile(provisionalPath, "utf8");
  const rows = JSON.parse(raw);
  if (!Array.isArray(rows) || rows.length === 0) fail("expected a non-empty array");

  const categories = new Set(rows.map((row) => row.category));
  for (const category of requiredCategories) {
    if (!categories.has(category)) fail(`missing required category: ${category}`);
  }

  for (const [index, row] of rows.entries()) {
    const label = row.category || `row ${index + 1}`;
    for (const field of ["period", "periodLabel", "category", "source", "sourceName", "sourceUrl"]) {
      if (typeof row[field] !== "string" || !row[field].trim()) fail(`${label} missing ${field}`);
    }
    for (const field of numericFields) {
      if (!isNumberOrNull(row[field])) fail(`${label} has invalid ${field}`);
    }
    if (row.exportValueUsd !== null && row.exportValueUsd <= 0) fail(`${label} exportValueUsd must be positive`);
    if (row.unitPriceUsdPerKg !== null && row.unitPriceUsdPerKg <= 0) fail(`${label} unitPriceUsdPerKg must be positive`);
  }

  const periods = new Set(rows.map((row) => row.period));
  if (periods.size !== 1) fail(`expected one provisional period, got: ${[...periods].join(", ")}`);

  return { rows: rows.length, period: [...periods][0], categories: [...categories] };
}

if (fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  validateProvisionalDetail()
    .then((result) => {
      console.log(`[provisional-memory-detail] ok: ${result.rows} rows for ${result.period}`);
    })
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
