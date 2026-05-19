# 韩国存储出口量价 Dashboard

一个零依赖 Node dashboard，用来跟踪韩国存储相关品类的出口金额、出口净重和推算单价。

## 数据源

- 月度 HS 品类数据：KCS/data.go.kr `관세청_품목별 수출입실적(GW)`，代码默认调用 `http://apis.data.go.kr/1220000/itemtrade/getItemtradeList`。
- 10 日高频窗口：KCS 官网每月 11 日/21 日附近发布的 `수출입 현황` 简报，目前 dashboard 保留展示位，默认用样例数据占位。

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
- SSD 与 DRAM/HBM 的月度 HS 样例数据

配置密钥后，SSD 与 DRAM/HBM 月度 HS 明细会尝试由官方 API 自动替换。

## 指标口径

- SSD：HSK `8471704010`
- DRAM / HBM：HS `854232`
- 出口单价：`出口金额 / 出口净重`

注意：`854232` 是存储器类大项，不等同于纯 HBM。需要把单价变化理解为价格和产品结构的混合信号。

## 当前已手动核验并落库的公开旬度数据

- 2026 年 5 月 1-10 日：半导体出口约 85 亿美元，来源为 KCS 经政策简报转载的 2026-05-11 简报。
- 2026 年 4 月 1-20 日：半导体出口约 183 亿美元，来源为 KCS 2026-04-21 简报。
- 2026 年 4 月 1-10 日：半导体出口约 86 亿美元，来源为 KCS 经政策简报转载的 2026-04-13 简报。
- 2026 年 3 月 1-20 日：半导体出口约 187 亿美元，来源为 KCS 经新闻转载的 2026-03-23 简报。

其中部分 1-20 日数据直接来自简报正文；部分 1-10/1-20 数据由简报披露的总出口额和半导体占比推算，并在 `data/trade-data.json` 的 `source` 字段标为 `official_public_derived`。截至 2026-05-19，本地环境未配置 `DATA_GO_KR_SERVICE_KEY`，SSD 与 DRAM/HBM 的月度 HS 明细仍保留样例序列。
