# 07 旧项目位置和官方资料

## 已核验的旧项目

以下来自 2026-10-15 读取的 earthquake-atlas 仓库 README 和 package.json：

- 仓库：https://github.com/ChanJeunlam/earthquake-atlas
- 前端：https://chanjeunlam.github.io/earthquake-atlas/
- Vercel 项目：https://vercel.com/hugo1-3a2b/earthquake-atlas
- API：https://earthquake-atlas.vercel.app/api/earthquakes?year=2026&minmagnitude=2.5
- Supabase：https://supabase.com/dashboard/project/nofbidofzmoetzsdrhsi
- 原技术手册：https://github.com/ChanJeunlam/earthquake-atlas/blob/main/docs/TECHNICAL-GUIDE.md
- 前端为原生 HTML/CSS/JavaScript，CesiumJS；不是 Vue 工程。
- 原文件：index.html、styles.css、app.js、config.js、api/earthquakes.js、supabase/migrations/。

上列平台地址为仓库记录，不代表本次已经登录平台核实其运行状态。本次没有找到可靠的电脑本地文件夹路径。

## 在 Windows 找回本地文件夹

先在资源管理器搜索 `earthquake-atlas`，检查你常用的项目目录；再查看 VS Code File → Open Recent。
若只知道可能在 D:\projects，可在 PowerShell 执行：

```powershell
Get-ChildItem -Path 'D:\projects' -Directory -Filter '*earthquake*' -Recurse -ErrorAction SilentlyContinue
```

找到候选目录后运行 `git -C '实际候选目录' remote -v`，只有 remote 指向 ChanJeunlam/earthquake-atlas 才可确认。不要把旧 Vue mapshow 路径当成地震项目位置。
若本地找不到，可把仓库克隆到明确新位置：在 D:\projects 下运行 `git clone https://github.com/ChanJeunlam/earthquake-atlas.git`；已有目录则先检查，不覆盖。

## 官方参考与核验状态

2026-10-15 已查阅：

- GVP 全新世目录：https://volcano.si.edu/volcanolist_holocene.cfm
- GVP 数据版本/引用：https://volcano.si.edu/gvp_votw.cfm
- GVP 喷发查询：https://volcano.si.edu/search_eruption.cfm
- GVP FAQ/API 导航：https://volcano.si.edu/faq/index.cfm
- 周报：https://volcano.si.edu/reports_weekly.cfm
- USGS VHP：https://www.usgs.gov/programs/VHP
- USGS VNS：https://volcanoes.usgs.gov/vns2/
- MediaWiki Imageinfo：https://www.mediawiki.org/wiki/API:Imageinfo
- CommonsMetadata：https://www.mediawiki.org/wiki/Extension:CommonsMetadata
- Cesium 入门：https://cesium.com/learn/cesiumjs-learn/cesiumjs-quickstart/
- Cesium 地形：https://cesium.com/learn/cesiumjs-learn/cesiumjs-terrain/
- Cesium token：https://cesium.com/learn/ion/cesium-ion-access-tokens/
- Vite 发布：https://vite.dev/guide/static-deploy
- Pages workflow：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Vercel Functions：https://vercel.com/docs/functions
- Supabase RLS：https://supabase.com/docs/guides/database/postgres/row-level-security

待实施验证：GVP 官方 API 实际请求、源表格全部字段、每张图片许可、实际 Vercel 域名、依赖兼容版本、账户额度和登录连接权限。
Supabase changelog markdown 本次浏览通道无法读取；真正实施前须通过支持的文档通道检查相关变更并核对 SDK/权限文档。
