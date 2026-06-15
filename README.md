# 韩国存储出口量价 Dashboard

一个零依赖 Node dashboard，用来跟踪韩国存储相关品类的出口金额、出口净重和推算单价。

## 数据源

- 月度 HS 品类数据：优先使用 KCS/data.go.kr `관세청_품목별 수출입실적(GW)`（需 `DATA_GO_KR_SERVICE_KEY`）；无密钥或接口不可用时，使用 KITA K-stat `ItemImpExpListWorker` 官方公开 worker；KCS TradeData 英文 `By H.S Code` 公开页作为交叉核验来源。
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
export UPDATE_DAYS=1,11,15,21
export UPDATE_TIMEZONE=Asia/Seoul
npm start
```

没有配置 `DATA_GO_KR_SERVICE_KEY` 时，应用会写入：

- KCS/政策简报公开旬度半导体出口实数
- KITA K-stat 官方公开 worker 拉取的 SSD 与 DRAM/HBM 月度 HS 金额、净重和推算单价

配置密钥后，SSD 与 DRAM/HBM 月度 HS 明细会尝试由 data.go.kr 官方 API 自动替换；若 API 失败，会自动回退到 KITA K-stat。

## 云端更新节奏

GitHub Actions 不做每日空跑，而是按 KCS/TRASS 数据窗口固定刷新并部署 GitHub Pages：

- 每月 1 日 15:35 KST：月度进出口初值窗口
- 每月 11 日 15:35 KST：当月 1-10 日高频窗口
- 每月 15 日 15:35 KST：上月月度 HS / 最终明细窗口
- 每月 21 日 15:35 KST：当月 1-20 日高频窗口

对应 workflow cron 为 `35 6 1,11,15,21 * *`，其中 GitHub Actions 使用 UTC。

## 指标口径

- SSD：HS `852351`，Solid-state non-volatile storage devices
- DRAM / HBM：HS `854232`
- 出口单价：`出口金额 / 出口净重`

注意：`854232` 是存储器类大项，不等同于纯 HBM。需要把单价变化理解为价格和产品结构的混合信号。

## 当前已手动核验并落库的公开旬度数据

- 2026 年 5 月 HS 月度明细已于 2026-06-15 通过 KITA K-stat 官方 worker 复核并落库：SSD HS `852351` 出口金额 39.73455 亿美元、净重 177,484 kg、单价约 22,388 美元/kg；DRAM/HBM proxy HS `854232` 出口金额 249.50563 亿美元、净重 326,954 kg、单价约 76,312 美元/kg。对应 worker 的 `THIS_EXP_AMT` 当前年列非零，满足金额和重量同月同 HS 的落库标准。
- 2026 年 6 月 1-10 日：半导体出口 110.68 亿美元、同比 +205.8%，总出口 286.35 亿美元、同比 +85.9%，总进口 233.52 亿美元、贸易顺差 52.82 亿美元。KCS 官网直接页面确认 2026-06-11 发布 `2026년 6월 1일 ~ 6월 10일 수출입 현황 [잠정치]`；Korea.kr/PDF 与 KDI 转发可核验总出口约 286 亿美元、总进口约 234 亿美元、贸易顺差约 53 亿美元、半导体同比 +205.8%、占比 38.7%，并披露半导体约 111 亿美元。精确半导体金额 110.68 亿美元来自公开媒体对 KCS 表格的转述，已在数据中标为 `official_public_reported`，并用 Korea Tax Times / MoneyToday 同日报道交叉核验。
- 2026 年 5 月全月官方/月度细分：Memory semiconductor 321 亿美元、同比 +255%；DRAM 186 亿美元、同比 +369.8%；NAND 17 亿美元、同比 +206.8%；Computer / SSD proxy 41.8 亿美元、同比 +290.7%，报道称由 AI 服务器 SSD 需求拉动。来源为公开媒体对 MOTIE `2026년 5월 수출입 동향` 的转述，并用 Electimes / Newstomato 交叉核验；未发现可公开核验的 5 月全月 DRAM/SSD/HBM 数量、净重或出口单价表。
- 2026 年 5 月全月：半导体出口 371.6 亿美元、同比 +169.4%。KCS 官网 2026-06-01 `2026년 5월 수출입 현황 [잠정치]` 页面和 HWPX/PDF 附件可核验 5 月总出口 877.47 亿美元、同比 +53.2%，总进口 607.98 亿美元、贸易顺差 269.49 亿美元，并确认“半导体出口创历史新高”的官方标题；但 KCS 页面正文和附件未公开可读取的产品级精确表。半导体金额和同比来自公开媒体对 MOTIE/KCS 2026-06-01 `5월 수출입 동향` 发布的转述，已在数据中标为 `official_public_reported`，并保留 KCS 官方链接作为发布和总量核验来源。
- 2026 年 5 月 1-20 日：半导体出口 219.51 亿美元、同比 +202.1%，KCS 官网 2026-05-27 登记的 2026-05-21 暂定值简报 PDF 附件第 4 页给出精确值；KCS 页面正文和 TRASS 公开首页交叉核验同期总出口/进口暂定值，但未公开产品级暂定明细。
- 2026 年 5 月 1-10 日：半导体出口约 85 亿美元，来源为 KCS 经政策简报转载的 2026-05-11 简报。
- 2026 年 4 月 1-20 日：半导体出口约 183 亿美元，来源为 KCS 2026-04-21 简报。
- 2026 年 4 月 1-10 日：半导体出口约 86 亿美元，来源为 KCS 经政策简报转载的 2026-04-13 简报。
- 2026 年 3 月 1-20 日：半导体出口约 187 亿美元，来源为 KCS 经新闻转载的 2026-03-23 简报。

其中部分 1-20 日数据直接来自简报正文；部分 1-10/1-20 数据由简报披露的总出口额和半导体占比推算，并在 `data/trade-data.json` 的 `source` 字段标为 `official_public_derived` 或 `official_public_reported`。截至 2026-06-15，本地环境未配置 `DATA_GO_KR_SERVICE_KEY`，`npm run fetch` 会优先尝试 KITA K-stat 官方 worker 并已自动拉取 2024.12-2026.05 的 SSD HS `852351` 与 DRAM/HBM HS `854232` 月度出口金额、净重和推算单价。KCS TradeData 英文同源接口当日未返回 2026.05 行，因此本次月度 HS 最新值以 KITA K-stat 为准。TRASS 公开首页仅复核 6月1-10日总出口/进口暂定总量和 4月确报构建公告，产品级暂定查询标为 premium，未提供公开半导体/存储拆分。详细接口和判断方法保存在 [`docs/korea-trade-data-research.md`](docs/korea-trade-data-research.md)。
