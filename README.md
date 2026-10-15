# 火山图谱 · volcano-atlas

版本：静态网站第一版，2026-10-15。默认 Vue + CesiumJS + 静态数据 + GitHub Pages，无需数据库或后端。保留可选 Vercel API / Supabase 实现供将来扩展。

Vue 全球火山三维浏览网站：GitHub Pages 托管前端和官方快照。初始收录 1,214 座全新世火山、20 张署名照片；支持中英文名称搜索、国家/形态筛选、地图选点、详情和分享链接。运行时不依赖后端。

**网站：https://chanjeunlam.github.io/volcano-atlas/**

每月 1 日北京时间 09:17，GitHub Actions 从官方 GVP 下载目录 → 校验 → 缓存署名照片 → 构建 → 提交数据 → 发布网站。可在 Actions → Monthly GVP Data Refresh → Run workflow 手动更新。
详见 [每月更新运维手册](docs/10-monthly-update.md)。数据下载失败、数量下降超过10%或构建失败时停止更新，保留上一次发布。

## 本地启动

安装 Node.js 24 和 Git，克隆仓库后运行：

```bash
npm ci
npm run dev
```

若受限环境报 uv_interface_addresses 错误，使用 `npm run dev -- --host 127.0.0.1`。
首次需缓存图片：`node scripts/cache-photos.mjs`。图片失败时显示来源链接。

```bash
npm test
npm run test:data
npm run data:validate
npm run build
npm run test:build
```

数据库服务端配置见 `.env.server.example`；前端公开配置见 `.env.example`。不要把数据库私钥放入 VITE_ 环境变量。
GitHub Pages 需在仓库 Settings → Pages 选择 GitHub Actions；工作流构建 `/volcano-atlas/` 子路径。

阅读顺序：

新增：[三类火山对照表与轮廓图例](docs/12-volcano-types-guide.md)，支持盾状火山、复合火山和火山渣锥教学对比，SVG 轮廓可缩放。

1. [项目设计](docs/01-design.md)：范围、架构、界面和技术选择。
2. [数据与照片](docs/02-data.md)：官方来源、导入、身份匹配、许可与更新。
3. [数据库与接口](docs/03-contracts.md)：字段、响应、分页和访问边界。
4. [逐步开发](docs/04-development.md)：环境、目录、阶段任务、注释和验收。
5. [发布配置](docs/05-deployment.md)：GitHub 权限、Pages、Vercel、Supabase。
6. [测试和运维](docs/06-testing-operations.md)：验收、排错、恢复。
7. [旧项目与资料](docs/07-references.md)：旧项目真实地址和官方参考。

仓库名统一使用 ASCII `volcano-atlas`，避免输入不易识别的 Unicode 连字符。
GitHub 仓库：https://github.com/ChanJeunlam/volcano-atlas
当前采用纯静态发布；数据库与 Vercel 为可选模块。Cesium 资源复制路径修复及复核见 [渲染问题记录](docs/11-rendering-fix.md)。
本地工作目录：`/workspace/scratch/0b50a7d11424/volcano-atlas`。
