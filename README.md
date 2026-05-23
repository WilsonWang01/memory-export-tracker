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

## Cloudflare Pages

本项目的线上版按静态站点发布，入口目录为 `public/`：

```bash
npm run deploy:cf
```

生产项目名为 `memory-export-tracker`。当前部署地址：

- `https://df007533.memory-export-tracker.pages.dev`
- `https://memory-export-tracker.pages.dev`（Cloudflare 新建项目后可能需要等待 DNS 生效）

### 定时更新

`.github/workflows/cloudflare-pages.yml` 会在每天 `06:35 UTC`（韩国时间 15:35）运行：

1. 执行 `npm run fetch` 刷新 `data/trade-data.json` 与 `public/data/trade-data.json`
2. 执行 `npm run check`
3. 只有数据文件发生变化时才提交 `Refresh trade data`
4. 只有 push 或数据发生变化时才部署 Cloudflare Pages

GitHub 仓库需要配置这些 Secrets：

- `DATA_GO_KR_SERVICE_KEY`：可选；配置后使用 KCS/data.go.kr 官方接口刷新月度 HS 明细
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare 账号 ID
- `CLOUDFLARE_API_TOKEN`：具备 Cloudflare Pages 写权限的 API token

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
