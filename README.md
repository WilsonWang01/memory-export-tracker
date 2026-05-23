# 韩国存储出口量价 Dashboard

一个零依赖 Node dashboard，用来跟踪韩国存储相关品类的出口金额、出口净重和推算单价。

## 数据源

- 月度 HS 品类数据：KCS TradeData 英文 `By H.S Code` 公开页；配置密钥时也可调用 KCS/data.go.kr `관세청_품목별 수출입실적(GW)` 的 `http://apis.data.go.kr/1220000/Itemtrade/getItemtradeList`。
- 10 日高频窗口：KCS 官网、KCS TradeData 首页或 Korea.kr 每月 11 日/21 日附近发布/转载的 `수출입 현황` 简报；TRASS/KITA 仅在公开可访问时用于交叉核验。

## 运行

```bash
npm start
```

打开 `http://localhost:8787`。

## Cloudflare Worker

本项目的线上版由 Cloudflare Worker 托管：Worker 负责静态资源、`/api/dashboard`、`/data/trade-data.json`、KV 数据读取，以及定时触发更新。

```bash
npm run deploy:cf
```

Worker 配置在 `wrangler.memory-export.toml`，使用 `MEMORY_EXPORT_KV` 保存最新数据和历史快照。当前 Worker 项目名为 `memory-export-tracker`。

如果仍需发布静态 Pages 版本，可使用：

```bash
npm run deploy:pages
```

### Worker 定时更新

定时更新参照 RegimeAlpha 的 Worker 模式：

1. Cloudflare Worker 的 cron `35 6 * * *` 触发 `scheduled()`。
2. Worker 调用 GitHub Actions `update-memory-export-kv.yml` 的 `workflow_dispatch`。
3. GitHub workflow 执行 `npm run fetch` 和 `npm run check`。
4. workflow 将 `public/data/trade-data.json` POST 到 Worker 的 `/api/memory-export-update/publish`。
5. Worker 校验 JSON 后写入 KV，并由 `/api/dashboard` 与 `/data/trade-data.json` 对外提供最新数据。

Cloudflare Worker 需要这些 secrets：

- `GITHUB_DISPATCH_TOKEN`：可 dispatch GitHub workflow 的 token
- `UPDATE_TOKEN`：保护 `/api/memory-export-update/run` 与 `/publish`

Worker 的非敏感变量在 `wrangler.memory-export.toml` 中配置，默认 dispatch 到 `WilsonWang01/memory-export-tracker` 的 `main` 分支。

GitHub 仓库需要这些 secrets：

- `DATA_GO_KR_SERVICE_KEY`：可选；配置后使用 KCS/data.go.kr 官方接口刷新月度 HS 明细
- `MEMORY_EXPORT_WORKER_URL`：Worker 根地址
- `MEMORY_EXPORT_UPDATE_TOKEN`：与 Worker `UPDATE_TOKEN` 相同

## 配置官方 API

复制 `.env.example` 里的变量到运行环境：

```bash
export DATA_GO_KR_SERVICE_KEY="你的 data.go.kr 解码服务密钥"
export UPDATE_HOUR=15
export UPDATE_MINUTE=30
export UPDATE_TIMEZONE=Asia/Seoul
npm start
```

没有配置 `DATA_GO_KR_SERVICE_KEY` 时，应用会写入：

- KCS/政策简报公开旬度半导体出口实数
- 已通过浏览器核验的 SSD 与 DRAM/HBM 月度 HS 公开网页快照

配置密钥后，SSD 与 DRAM/HBM 月度 HS 明细会尝试由 data.go.kr 官方 API 自动替换。

## 指标口径

- SSD：HS `852351`，Solid-state non-volatile storage devices
- DRAM / HBM：HS `854232`
- 出口单价：`出口金额 / 出口净重`

注意：`854232` 是存储器类大项，不等同于纯 HBM。需要把单价变化理解为价格和产品结构的混合信号。

## 当前已手动核验并落库的公开旬度数据

- 2026 年 5 月 1-20 日：半导体出口 219.51 亿美元、同比 +202.1%，KCS TradeData 首页列示 2026-05-21 暂定值简报；TRASS 公开首页交叉核验同期总出口/进口暂定值，但未公开产品级暂定明细。
- 2026 年 5 月 1-10 日：半导体出口约 85 亿美元，来源为 KCS 经政策简报转载的 2026-05-11 简报。
- 2026 年 4 月 1-20 日：半导体出口约 183 亿美元，来源为 KCS 2026-04-21 简报。
- 2026 年 4 月 1-10 日：半导体出口约 86 亿美元，来源为 KCS 经政策简报转载的 2026-04-13 简报。
- 2026 年 3 月 1-20 日：半导体出口约 187 亿美元，来源为 KCS 经新闻转载的 2026-03-23 简报。

其中部分 1-20 日数据直接来自简报正文；部分 1-10/1-20 数据由简报披露的总出口额和半导体占比推算，并在 `data/trade-data.json` 的 `source` 字段标为 `official_public_derived`。截至 2026-05-22，本地环境未配置 `DATA_GO_KR_SERVICE_KEY`，但已通过浏览器核验 KCS TradeData 官方公开页并落库 2025.01-2026.04 的 SSD HS `852351` 与 DRAM/HBM HS `854232` 月度出口金额、净重和推算单价。Korea.kr 未找到 2026-05-21 KCS 5 月前 20 日简报转载；KCS 主站新闻列表截至核验时仍停在 2026-05-15 的 4 月月度确报。
