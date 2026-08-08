# WOWFOOD 简易下单系统

给小摊、小店使用的轻量预订取餐 PWA。顾客提前点餐、到摊自提、现场付款；商家在手机上管理菜单和订单。

## 功能概览

### 顾客端

- 手机号识别（本地 `localStorage` 保存，展示脱敏号码）
- 分类菜单、购物车、售罄不可加购
- 确认下单：取货时间、辣度、备注
- 取餐凭证与订单列表
- 暂停接单时仍可浏览菜单，但无法提交

### 商家端（姐姐端）

- 4 位 PIN 进入后台（默认 `1666`）
- 营业中 / 暂停接单切换
- 订单看板：按取货时间排序，一键推进状态
- 分类与商品管理：增删改、排序、在售 / 已售罄

### 订单号规则

- 每天从 `#01` 起递增，次日自动重置

## 快速开始

### 环境要求

- Node.js 18+
- npm

### 安装

```bash
npm install
```

### 本地开发

需要同时启动本地数据服务、顾客端和商家端，才能在两个端口之间同步菜单与订单：

```bash
npm run dev:data
npm run dev:customer
npm run dev:admin
```

| 服务 | 地址 | 说明 |
| --- | --- | --- |
| 顾客端 | http://localhost:1888/ | 点餐、下单、取餐凭证 |
| 商家端 | http://localhost:1666/ | 自动跳转 `/admin`，PIN 默认 `1666` |
| 本地数据服务 | http://127.0.0.1:1777/ | 开发环境同步状态，数据写入 `data/wowfood-store.json` |

单端口开发（不跨端同步）：

```bash
npm run dev
```

### 构建与预览

```bash
npm run build
npm run preview:customer   # http://localhost:1888
npm run preview:admin      # http://localhost:1666
```

## 页面路由

| 路径 | 说明 |
| --- | --- |
| `/` | 顾客点餐页 |
| `/orders` | 顾客订单列表 |
| `/checkout` | 确认下单 |
| `/ticket/:orderId` | 取餐凭证 |
| `/admin` | 商家订单看板 |
| `/admin/menu` | 商家菜品管理 |

端口 `1666` 访问 `/` 会自动重定向到 `/admin`。

## 技术栈

| 层级 | 选型 |
| --- | --- |
| 前端 | Vite + React 19 + TypeScript |
| 样式 | Tailwind CSS |
| 路由 | React Router |
| 状态 | Zustand（`localStorage` 持久化） |
| PWA | vite-plugin-pwa |
| 图标 | lucide-react |

## 项目结构

```
wowfood/
├── public/icons/          # PWA 图标
├── server/
│   └── local-data-server.mjs   # 本地开发数据同步服务
├── src/
│   ├── components/        # 通用组件（AdminGuard、TabBar 等）
│   ├── data/seed.ts       # 初始分类、商品、店铺配置
│   ├── hooks/             # useSharedDataSync 等
│   ├── pages/             # 顾客端与商家端页面
│   ├── store/             # Zustand 全局状态
│   ├── utils/             # 格式化、订单号等工具
│   ├── App.tsx
│   └── main.tsx
└── data/                  # 本地数据文件（gitignore，运行时生成）
```

## 数据与同步

当前第一版采用**前端优先 + 本地开发同步**方案：

1. **Zustand + localStorage**：购物车、手机号、订单、菜单等保存在浏览器本地。
2. **本地数据服务**（`server/local-data-server.mjs`）：开发时通过 `/api/state` 在顾客端与商家端之间同步共享数据（分类、商品、订单、店铺设置）。
3. Vite 开发服务器将 `/api` 代理到 `127.0.0.1:1777`。

无数据服务时应用仍可离线使用，但两个浏览器端口之间不会自动同步。

### 共享数据 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET | `/api/state` | 读取当前状态 |
| PUT | `/api/state` | 写入状态（带 revision 递增） |

## PWA

- `display: standalone`，支持添加到手机桌面
- 商品图片使用 CacheFirst 策略缓存
- 下单需网络请求成功后才算提交成功

viewport 已配置 `viewport-fit=cover`，底部固定栏预留安全区域。

## 暂不包含

- 线上支付、配送
- 优惠券、会员、多门店
- 复杂账号体系与企业级权限
- 生产环境后端（后续可接入 Supabase 等）

## 参考项目

视觉与交互可参考 [guchengwuyue/yshop-drink](https://github.com/guchengwuyue/yshop-drink) 的 H5 移动端，但 WOWFOOD 不采用其 Java / UniApp 架构。若复用其代码或样式片段，需保留 MIT License 说明。

## License

MIT
