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

- 2026 年 5 月全月：半导体出口 371.6 亿美元、同比 +169.4%。KCS 官网 2026-06-01 `2026년 5월 수출입 현황 [잠정치]` 页面和 HWPX/PDF 附件可核验 5 月总出口 877.47 亿美元、同比 +53.2%，总进口 607.98 亿美元、贸易顺差 269.49 亿美元，并确认“半导体出口创历史新高”的官方标题；但 KCS 页面正文和附件未公开可读取的产品级精确表。半导体金额和同比来自公开媒体对 MOTIE/KCS 2026-06-01 `5월 수출입 동향` 发布的转述，已在数据中标为 `official_public_reported`，并保留 KCS 官方链接作为发布和总量核验来源。
- 2026 年 5 月 1-20 日：半导体出口 219.51 亿美元、同比 +202.1%，KCS 官网 2026-05-27 登记的 2026-05-21 暂定值简报 PDF 附件第 4 页给出精确值；KCS 页面正文和 TRASS 公开首页交叉核验同期总出口/进口暂定值，但未公开产品级暂定明细。
- 2026 年 5 月 1-10 日：半导体出口约 85 亿美元，来源为 KCS 经政策简报转载的 2026-05-11 简报。
- 2026 年 4 月 1-20 日：半导体出口约 183 亿美元，来源为 KCS 2026-04-21 简报。
- 2026 年 4 月 1-10 日：半导体出口约 86 亿美元，来源为 KCS 经政策简报转载的 2026-04-13 简报。
- 2026 年 3 月 1-20 日：半导体出口约 187 亿美元，来源为 KCS 经新闻转载的 2026-03-23 简报。

其中部分 1-20 日数据直接来自简报正文；部分 1-10/1-20 数据由简报披露的总出口额和半导体占比推算，并在 `data/trade-data.json` 的 `source` 字段标为 `official_public_derived`。截至 2026-06-03，本地环境未配置 `DATA_GO_KR_SERVICE_KEY`，`npm run fetch` 未走 data.go.kr Itemtrade API；此前无密钥调用返回 401 Unauthorized。已通过 KCS TradeData 官方公开页同源 JSON 查询复核 2025.01-2026.04 的 SSD HS `852351` 与 DRAM/HBM HS `854232` 月度出口金额、净重和推算单价，查询至 2026.05 时两个品类均仅返回 16 个明细月度行且最后一期为 2026.04，未返回 5 月月度 HS 明细，已落库值与官方响应一致。Korea.kr 可核验 2026-05-11 KCS 5 月前 10 日简报转载，但截至 2026-06-03 未找到 2026-05-21 KCS 5 月前 20 日简报或 2026-06-01 KCS 5 月全月简报转载；TRASS 公开首页仅提供总出口/进口暂定值，产品级暂定查询未公开可用；KITA K-stat 本次未提供需要替代 KCS 月度数据的新公开值。
