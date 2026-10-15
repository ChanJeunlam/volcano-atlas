# 10 每月更新与自动发布

## 配置与范围

项目现在采用纯静态模式，无需 Supabase、Vercel 或个人 PAT。网址：https://chanjeunlam.github.io/volcano-atlas/。
`.github/workflows/update-data.yml` 每月1日北京时间09:17（UTC 01:17，cron `17 1 1 * *`）在默认 main 分支运行。GitHub 可能延迟启动；这不是精确实时调度。
更新 GVP 全新世目录、坐标/海拔/类型/最近已知喷发/地质说明；不是全球实时预警。照片只使用 data/curated-photos.json 中已核验的映射，需人工审核后增加。

## 流程与权限

1. 月更 workflow 直接调用 deploy-pages.yml 的 workflow_call，传入 refresh_data=true。
2. 安装 lockfile 依赖，下载官方 WFS，核对 numberMatched 与实际条数。
3. 检查空目录、重复 ID、坐标、数量下降阈值；降幅超过10%时默认失败。
4. 在隔离临时目录生成全部分片，成功后替换快照，不混用新旧版本。
5. 运行纯逻辑、Python、目录验证，缓存照片并构建 Pages 子路径。
6. 运行 test:build 检查实际 Worker/纹理文件；验证通过后提交 public/data 和 data/import-report.json。
7. 同一个运行上传 dist 并 deploy-pages，最后可在运行页面查看网站 URL。

contents:write 用于提交数据；pages:write 和 id-token:write 用于发布。GITHUB_TOKEN 自动提供，不需要自己创建 token。bot 的 push 不会自动启动普通 push workflow，所以必须在当前 workflow 里继续发布，不能指望另一个运行接力。
发布与月更共用 pages concurrency，不互相取消正在进行的发布。main 若新增分支保护禁止 bot 直推，数据提交步骤会失败，需改为 PR 更新流程，不能静默绕过保护。

## 手动更新

1. 打开仓库 Actions。
2. 选择 Monthly GVP Data Refresh。
3. 点击 Run workflow，选择 main，再确认运行。
4. 查看 download、verify、build、save、deploy 步骤；最终全部成功才表示更新已发布。

只发布现有数据：选择 Deploy Volcano Atlas to Pages，refresh_data 保持 false。
本地复现：`npm ci` → `npm run data:download` → `node scripts/cache-photos.mjs` → `npm run data:validate` → `npm test` → `npm run test:data` → `npm run build` → `npm run test:build`。

## 失败与恢复

- 上游下载/解析/总量异常：不替换公开快照；workflow 失败，旧网站仍在线。
- 新目录较旧目录下降超过10%：先检查官方收录修订和请求截断，人工确认后才可本地使用 --allow-large-drop。月更不自动放行。
- 图片缓存失败：保留远程图片/占位/来源链接，核心目录仍可构建。
- 构建或资源检查失败：不提交新目录、不发布。
- bot push 与其他提交冲突：不强推，失败后基于新 main 重新运行。
- 数据已提交但 Pages 发布失败：旧网站继续在线，修复 Pages 后运行普通发布即可，无需再下载数据。
- 公共仓库长期无活动时，GitHub 可能在60天后禁用 schedule；在 Actions 查看停用横幅并重新启用。监控运行历史，不能把没有运行误认为没有新数据。

上次抓取时间和源内容 hash 保存在 data/import-report.json。sourceVersion 仅在源 hash 相同且旧版本已核验时沿用；源变化而官方版本未重新核实时显示 WFS snapshot 日期，不虚构版本号。

## About 网站地址

仓库首页右侧 About → 齿轮 → Edit repository details → Website 填入 `https://chanjeunlam.github.io/volcano-atlas/` → Save changes。
也可勾选 Use your GitHub Pages website（如果界面提供）；保留原描述，不必把 URL 填进 Description。
