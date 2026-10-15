# Volcano Atlas Implementation Plan

Goal：交付可构建、可在 Pages 展示的 Vue/Cesium 第一版，并提供可连接 Supabase 的 Vercel API。
Architecture：静态前端先读取同源已核验 GVP 快照；配置 API 后优先调用 Vercel，失败自动回退。API 与离线导入共享明确 DTO；照片需许可及实体匹配。
Tech Stack：Vue 3、Vite、TypeScript、CesiumJS、Node.js、Supabase、Python。
Spec：01-design.md、02-data.md、03-contracts.md。
执行：在当前会话由主执行者继续；不等待阶段确认。

## 全局约束

- 默认中文；公开官方英文名；详细中文模块/函数注释。
- Pages base `/volcano-atlas/`，Vercel base `/`；hash 深链接。
- 不向前端输出 Supabase secret；无公共写端点。
- 收录范围/来源时间可见；缺图、未知日期、地形降级如实展示。

## Review Focus

- 源目录被返回上限截断：API 与快照必须核对总量。
- 无效/空坐标：拒绝空值，保留合法负海拔。
- API 失败：静态目录仍可浏览，显示快照模式。
- 快速选点：最终详情必须与当前 ID 一致。
- Pages 子路径和 WebGL：资源不能根路径 404；列表可独立使用。

## Task 1 数据与核心模块

- [ ] 记录 GVP WFS 探测、原始文件 SHA、数量及清洗结果。
- [ ] 建立 Node 测试：过滤、坐标、完整分页、CORS/方法限制和快照校验；先观察缺实现失败。
- [ ] 实现共享纯函数与 Python 导入/验证模块。
- [ ] `npm test` / Python unittest 通过；提交数据和核心逻辑。

## Task 2 Vue/Cesium 可操作界面

Files：src/App.vue、src/components/VolcanoGlobe.vue、src/components/VolcanoDetails.vue、src/services/catalog.ts、src/domain/catalog.ts、src/style.css。
Interface：Catalog `{metadata,items}`；Volcano `{id,nameEn,nameZh,latitude,longitude,elevationM,countries,landform,lastEruptionText,sourceUrl}`。
- [ ] 锁定依赖；创建 Vite 构建与 Cesium 资源复制配置。
- [ ] 使用目录实现搜索、国家/类型过滤、列表及选点；详情采用同一目录 ID。
- [ ] 实现 hash 深链接、可访问详情、图例、恢复全局镜头及 WebGL 降级。
- [ ] `npm run typecheck`、`npm run build`；浏览器检查首页/筛选/详情/子路径。

## Task 3 只读 API 与数据库准备

Files：server/catalog.ts、server/http.ts、api/v1/catalog.ts、api/v1/health.ts、api/v1/volcanoes/[id].ts、scripts/import-supabase.mjs、supabase/。
Interface：API 输出与静态 Catalog 相同；Supabase 每次读取固定 snapshot 并按 id 排序分批查询。
- [ ] 测试 1000 行边界、数据库错误与不完整数据；实现 API 503/404/405。
- [ ] SQL 准备 RLS、快照指针、目录和审核照片；正式迁移通过 CLI 生成。
- [ ] 受控 ETL 完成新快照再切换；无前端导入入口。
- [ ] 测试 API 模块和本地路由；云端连接未配置时明确记录。

## Task 4 图片、发布与交付

- [ ] 核验首批 Commons/USGS 图片，建立固定火山 ID→图片/许可映射；缺许可不发布。
- [ ] 添加 Pages workflow、Vercel config、环境示例和每一步操作记录。
- [ ] 浏览器截图自检，修复布局；跑必要 suite/build/typecheck。
- [ ] 推送代码和文档，确认远程提交；外部平台未配置则报告实际阻塞及已可用静态版本。

## 执行记录

- 已读取旧项目与设计文档；GitHub 文档已在 main；本地实现隔离为 feat/vue-atlas 分支。
- Ruling：当前 scratch 项目本身是独立新项目，采用功能分支就地工作，避免额外 worktree/重复授权。
- Ruling：优先官方 WFS；XML 下载在当前环境 403，不将错误页解析为数据。
