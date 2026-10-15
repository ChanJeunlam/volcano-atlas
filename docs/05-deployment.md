# 05 GitHub Pages、Vercel、Supabase 配置

> 当前第一版只需完成 GitHub Pages 配置；E/F 的 Supabase、Vercel 接入为可选扩展，无需执行才能上线。月度更新不需要 PAT、数据库密钥或 Vercel 账户，见 10-monthly-update.md。

## A. 创建 GitHub 仓库

1. 登录 GitHub，New repository；名称 `volcano-atlas`，所有者确认 `ChanJeunlam`。
2. 公开展示建议 Public。不要把任何密钥作为 README 内容。
3. 项目代码提交后，目标网址应为 `https://chanjeunlam.github.io/volcano-atlas/`；这是计划地址，当前未部署。
4. 若从本地新建 Git 仓库，先 `git init`，检查待提交内容和忽略规则，再提交并按 GitHub 页面给出的 remote 命令推送。不要对已有项目重复初始化/强推。

## B. 区分三个权限

**代码访问权限**：如果 ChatGPT/Codex 或 Vercel 无法看到新仓库，打开 GitHub Settings → Applications → Installed GitHub Apps，选择实际连接的应用 Configure，在 Repository access 加入 `volcano-atlas`。只改所需应用，不必开放全部仓库。OAuth 应用与 GitHub App 界面可能不同，以实际连接类型为准。

**Pages 发布来源**：仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。Vue/Vite 要发布构建产物，不是把 src 文件夹直接发布。

**Actions workflow 权限**：部署 workflow 的 GITHUB_TOKEN 至少需要 `contents: read`、`pages: write`、`id-token: write`，部署 job 使用 `github-pages` environment。无需为了 Pages 给所有工作流 write-all 或把个人 PAT 填入前端。

仓库 Settings → Actions → General 确认 Actions 可执行且官方发布 actions 未被组织规则禁止。若 environment 有保护规则，查看是否允许 main 部署。不能通过随意关闭所有保护解决问题。

## C. Vue 子路径和路由

Vite Pages 构建 base 为 `/volcano-atlas/`；Vercel 根路径前端预览构建 base 为 `/`。用公开构建变量 `VITE_BASE_PATH` 区分。
Vue Router 使用 hash history，分享地址如 `https://chanjeunlam.github.io/volcano-atlas/#/volcano/<id>`。直接刷新详情不会要求 Pages 回退重写。
Cesium 静态资源和 fallback JSON 均基于 `import.meta.env.BASE_URL` 拼接，不能写死 `/cesium/` 或 `/data/`。

## D. GitHub Pages workflow 设计

实施时生成 `.github/workflows/deploy-pages.yml` 并逐步中文注释：

1. main push / workflow_dispatch 触发。
2. checkout；设置已核验兼容的 Node LTS；npm ci。
3. typecheck、必要测试、build，注入 `VITE_BASE_PATH=/volcano-atlas/` 和实际 `VITE_API_BASE_URL`。
4. configure-pages；upload-pages-artifact 仅上传 dist；deploy-pages。
5. workflow 权限按前文配置；concurrency 防止多个 Pages 发布竞争。

Actions 引用实施时核对官方稳定版本，优先 pin 完整 SHA 并注释版本。先提交锁文件，否则 npm ci 无法运行。
在仓库 Settings → Secrets and variables → Actions 配置公开构建变量；敏感信息仅在受控 ETL workflow 使用 Secrets。即便 VITE_ 值放进 Secrets，构建后也会公开，不能用于数据库私钥。
Actions 全绿后在 Pages 查看实际 URL，验证 JS/CSS/Workers/Assets 200；不要只看到构建成功就认为地图工作。

## E. Supabase

1. 登录 https://supabase.com/dashboard ，新建独立项目，名称 volcano-atlas，选择合适区域，数据库密码安全保存。
2. 保存项目 URL；API 设置中区分 publishable 与 secret/legacy service_role。浏览器本架构不需要 Supabase 凭证。
3. 通过经过验证的迁移建立表、约束、索引和 RLS，匿名/普通登录身份无写权限；内部日志不暴露。
4. 使用受控导入脚本导入并切换快照，检查表行数、关系、目录数量和 API 字段。
5. 凭证仅存服务端平台环境或本地未提交环境文件。数据库迁移文件不包含密码。
6. 项目区域、限额、备份功能和当前计费以实际账户为准；本规划不承诺固定免费额度。

## F. Vercel

1. 登录 https://vercel.com ，Add New → Project → Import `ChanJeunlam/volcano-atlas`；看不到仓库先按 B 配置 Vercel GitHub App。
2. 首期推荐同仓库一个 Vercel 项目：根目录 Vite，Build `npm run build`，Output `dist`，根 `api/` 为 Functions；同时可作为预览站，主要公开入口仍是 Pages。
3. Vercel 构建 `VITE_BASE_PATH=/`；API 路由与 SPA 回退必须分开，不能用 catch-all rewrite 把 `/api` 返回成 index.html。
4. 设置服务端 `SUPABASE_URL`、`SUPABASE_SECRET_KEY`（或实现采用的 legacy service_role 命名）、`ALLOWED_ORIGINS`。实现时只采用一种明确凭证变量名。
5. Production/Preview 环境分别配置；Preview 优先用测试数据，不共享生产写凭证。首次部署确认 health 和 catalog 的 JSON 响应。
6. 记录实际分配的生产域名。`volcano-atlas.vercel.app` 只是候选，可能已被占用，不能预先当作实际部署结果。
7. 把真实 API 地址填入 Pages 构建变量，重新运行 Pages workflow。
8. 环境变量更新后重新部署，使新值生效。保留上一成功 commit/部署用于回退。

## 环境变量表

| 名称 | 环境 | 可公开 | 说明 |
|---|---|---|---|
| VITE_API_BASE_URL | Pages/Vercel 前端构建 | 是 | 实际 API origin，不能是 Pages 地址 |
| VITE_BASE_PATH | 构建 | 是 | Pages 子路径或 Vercel 根路径 |
| VITE_CESIUM_ION_TOKEN | 可选前端构建 | 是，需限制 | 仅地图读取 token |
| SUPABASE_URL | Vercel/ETL | URL 本身非秘密 | 独立火山项目地址 |
| SUPABASE_SECRET_KEY | Vercel/ETL | 否 | 高权限服务端凭证 |
| ALLOWED_ORIGINS | Vercel | 非秘密 | origin 白名单，不包含路径 |

若实施使用旧 SUPABASE_SERVICE_ROLE_KEY，在环境示例和部署说明同步替换命名，不能两边不一致。
