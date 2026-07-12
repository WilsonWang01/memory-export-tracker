import { productConfigs } from "../config.js";
import { fetchKitaMonthlyProductSeries, fetchMonthlyProductSeries } from "../koreaTradeClient.js";
import { buildSampleStore } from "../sampleData.js";
import { writeStore } from "../storage.js";

async function buildStoreFromMonthly(monthlyResponses, metaPatch) {
  const sample = buildSampleStore();
  const store = {
    ...sample,
    meta: {
      ...sample.meta,
      lastUpdated: new Date().toISOString(),
      nextScheduledUpdate: null,
      ...metaPatch
    },
    products: productConfigs,
    monthly: monthlyResponses.flat()
  };
  await writeStore(store);
  return store;
}

export async function refreshTradeData() {
  if (process.env.DATA_GO_KR_SERVICE_KEY) {
    try {
      const monthlyResponses = await Promise.all(productConfigs.map((product) => fetchMonthlyProductSeries(product)));
      return await buildStoreFromMonthly(monthlyResponses, {
        mode: "official_api",
        message: "已通过 KCS/data.go.kr 官方接口更新月度 HS 品类出口金额、净重与单位价格。"
      });
    } catch (error) {
      console.warn(`[refresh] KCS/data.go.kr failed, trying KITA K-stat: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  try {
    const monthlyResponses = await Promise.all(productConfigs.map((product) => fetchKitaMonthlyProductSeries(product)));
    return await buildStoreFromMonthly(monthlyResponses, {
      mode: "official_kita_kstat",
      message:
        "已通过 KITA K-stat 官方公开 worker 更新月度 HS 品类出口金额、净重与单位价格；DATA_GO_KR_SERVICE_KEY 缺失或 KCS/data.go.kr 接口不可用时使用该路径。2026-07-12 复核：当前公开月度 HS 最新可落库期仍为 2026年5月；KCS/KDI 已公开 2026年6月全月海关暂定值，Korea.kr/MOTIE 仍提供 6月半导体与电脑/SSD proxy 精确品类金额；KCS/Korea.kr/KDI 尚未发布 2026年7月1-10日暂定值，TRASS 仅公开 7月1-10日总出口/进口暂定值而无半导体拆分。"
    });
  } catch (error) {
    const sample = buildSampleStore();
    sample.meta.lastUpdated = new Date().toISOString();
    sample.meta.message = `官方接口拉取失败，当前回落到内置公开核验数据：${error instanceof Error ? error.message : "unknown error"}`;
    await writeStore(sample);
    return sample;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  refreshTradeData()
    .then((store) => {
      console.log(`[refresh] ${store.meta.mode}: ${store.monthly.length} monthly points`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
