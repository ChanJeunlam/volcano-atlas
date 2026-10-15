# 09 第一版开发与验证记录

日期：2026-10-15。

更新：GitHub Pages 首次发布已成功；默认架构改为纯静态。月更见 10-monthly-update.md，资源路径回归修复见 11-rendering-fix.md。

## 已实现

- Vue 3 + TypeScript + CesiumJS；中文界面、名称/GVP ID 搜索、国家/形态组合筛选。
- 可旋转地球、颜色图例、选点飞行、全球镜头、Hash 分享路由；手机详情面板。
- GVP 官方 WFS 返回 1,214 条，与 numberMatched、numberReturned 一致；112 条负海拔保留，366 条未知最近喷发不编造日期。
- 目录/详情分离：轻量目录 + 103 个前三位编号分片；详细地质文字按分片读取。
- 20 张 GVP 官方照片，限明确署名美国政府机构员工、无第三方版权/转交标记的记录；保留作者、原文说明、资料页和许可条款链接。
- 缓存照片后使用同源图片；缓存失败时 UI 显示占位与官方资料链接。
- Vercel GET/OPTIONS API、CORS 白名单、400/404/405/503；未配置数据库可读取打包快照。
- Supabase 快照表、目录 JSONB、唯一活动指针、RLS；受控导入完整核验后再切换。
- Pages workflow、Vercel 配置、环境示例、lockfile、中文模块/核心函数注释。

## 执行与结果

| 操作 | 实际结果 |
|---|---|
| 官方 WFS 下载/清洗 | 1,214 条，重复/截断校验通过；源哈希见 data/import-report.json |
| npm test | 9 项通过 |
| npm run test:data | 5 项通过 |
| npm run data:validate | 1,214 座、103 分片、20 张署名照片，通过 |
| npm run typecheck | 通过 |
| VITE_BASE_PATH=/volcano-atlas/ npm run build | 通过；Cesium Worker/影像资源已复制 |
| node scripts/cache-photos.mjs | 20/20 成功下载 |
| Supabase 连接读取项目 | 成功；仅旧 earthquake-atlas，状态 INACTIVE；未创建火山项目 |
| Playwright 浏览器验收 | 未完成：环境无 Chromium，安装包下载损坏；未声称截图或交互已验收 |

Cesium 动态包约 4.93 MB（gzip 1.36 MB），构建有 chunk size 警告。应用壳已独立约 106 KB，地图按需加载；首期接受地图引擎体积，后续可优化。

## 设计落实调整

- 首期数据库用 3 张快照/目录/指针表，公开 DTO 存 JSONB；国家/照片元数据包含在已核验 DTO 内。独立别名/喷发表延后，不创建空置表。
- 前端状态规模小，当前使用 Vue refs/computed；暂不引入 Pinia。
- GVP 官方照片条款已核验，可先采用官方政府员工作品；Commons API 在当前环境受限，未把自动搜索结果冒充审核照片。
- 默认自带 Natural Earth 影像与椭球；真正地形需要可选只读 Cesium token。界面区分两种模式。
- 本地功能分支与远程 main 提交哈希不同，内容通过 GitHub API 同步；不强制覆盖远程历史。

## 平台接入下一步

1. 在 Supabase 组织 `hugo chen` 下创建独立 volcano-atlas 项目：创建工具要求先明确组织及费用确认，因此尚未自动创建。
2. 审核并运行 `supabase/migrations/20261015015454_create_volcano_catalog.sql`；迁移文件由 Supabase CLI 2.121.0 migration new 生成。
3. 受控终端配置 `.env.local` 的 SUPABASE_URL / SUPABASE_SECRET_KEY，执行 `npm run data:import`。
4. Vercel Import GitHub 仓库；配置服务端变量，验证 /api/v1/catalog 和真实详情。
5. Pages Actions variables 配置实际 VITE_API_BASE_URL，再发布。
6. 完成桌面、手机、WebGL、深链接与照片浏览器验收。

不必等待云端数据库才能运行静态网站；生产后端未接通时页面会如实显示快照模式。
