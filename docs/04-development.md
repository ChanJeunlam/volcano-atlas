# 04 逐步开发手册

本章为待执行开发步骤；命令不可理解为本包已经完成安装、数据库或部署。

## 第 0 步：确定路径和软件

Windows 建议统一路径 `D:\projects\volcano-atlas`，并在 README 记录。它是新项目建议位置，不是查到的旧项目路径。
安装 Git：https://git-scm.com/downloads；Node.js：https://nodejs.org/，选择实施时与 Vite 支持范围兼容的 LTS；VS Code：https://code.visualstudio.com/。
安装后重新打开 PowerShell，依次运行 `git --version`、`node --version`、`npm --version`。找不到命令时检查安装和 PATH，不继续执行后续步骤。
创建父目录后在终端 `cd D:\projects`。现有同名目录先查看，不覆盖。

## 第 1 步：文档和目录入库

先保存本包，创建 GitHub 的 `volcano-atlas` 仓库，提交规划和 README。产品代码从设计确认后开始。
建议单仓库根目录为 Vite 项目，`api/` 为 Vercel Functions，`supabase/` 为迁移，`scripts/` 为离线导入任务。

| 路径 | 职责 |
|---|---|
| src/components/globe/VolcanoGlobe.vue | 只负责地球容器与交互事件 |
| src/composables/useCesiumViewer.ts | Viewer 初始化、资源释放、镜头 |
| src/components/volcano/VolcanoDetails.vue | 火山详情和资料链接 |
| src/components/volcano/PhotoGallery.vue | 图片、署名和失败占位 |
| src/stores/catalog.ts | 目录、筛选和选中 ID |
| src/services/api.ts | 超时、取消、响应和错误转换 |
| src/types/volcano.ts | 公开 DTO，避免数据库原始对象进入界面 |
| src/router/index.ts | hash 路由 |
| api/v1/ | 公开只读接口 |
| server/ | 数据访问、验证、CORS 和日志 |
| scripts/ | 数据下载、清洗、导入、快照导出 |
| public/data/ | 已核验静态目录和说明 |
| public/cesium/ | 构建时复制的 Cesium 静态资源 |
| supabase/migrations/ | 实施后生成和验证的 SQL 迁移 |
| tests/ | 转换/API/关键交互验证 |
| docs/ | 每阶段操作与结果文档 |

## 第 2 步：环境和 Vue 工程

在一个临时空目录生成 Vue TypeScript Vite 模板，再合并到已含文档的仓库，避免模板命令覆盖文档。
采用实施时核实的 create-vite 模板版本；记录 Node/npm 版本，明确依赖版本，提交 package-lock.json。
安装 Vue Router、Pinia、CesiumJS、构建资源复制工具；后端安装 Supabase SDK 和验证库；版本逐个核验兼容性，不盲目全部用 latest。
编写 npm scripts：`dev`、`build`、`preview`、`typecheck`、`test`、`test:e2e`、`data:validate`、`data:import`、`data:export`；实施时记录每个实际命令。
前端与 API 本地联调使用独立开发终端或 Vercel 本地环境；Vite 本身不会执行根目录 api 函数。配置 VITE_API_BASE_URL 指向实际开发 API 服务。
产出：可打开的空 Vue 页面、锁文件、环境示例、实际执行记录。验收：build 和 typecheck 成功。

## 第 3 步：先数据后界面

验证 GVP 入口和首个源文件，完成字段映射、清洗、拒绝报告和快照。挑选至少三座不同区域火山逐字段人工核对。
设计确认后用 Supabase CLI 实际生成迁移文件；CLI 操作先查 `--help`，不可手写一个日期文件名当成已验证迁移。
执行数据库迁移、导入 staging、切换快照、导出静态目录。记录 SQL、行数、迁移版本和回滚方式。
产出：`docs/DATA-IMPORT-RUN.md`；验收：输入数量、有效数量、拒绝数量能对上，重复导入不制造重复数据。

## 第 4 步：后端接口

先实现 health，再 catalog，再详情；接口固定 DTO 字段，输入校验、超时、CORS、批量查询和错误码齐全。
在本地或测试环境验证有效编号、非法编号、缺失编号、数据库失败和完整目录数量。
照片字段只返回审核通过的记录，导入日志绝不返回。
产出：接口示例和调试手册；验收：返回数与活动快照一致，无密钥输出。

## 第 5 步：三维地图

先用三条真实已核验坐标验证经纬度顺序，再接完整目录。
配置 CESIUM_BASE_URL 与 Vite base 一致，复制 Cesium Workers、Assets、Widgets、ThirdParty；验证子路径下资源 200 且 MIME 类型正确。
首期允许椭球地球；真实地形需配置授权供应商和 token。使用 Cesium ion 时限制 token 权限、资源和允许域名，公开客户端 token 不应拥有上传/账户管理权限。
Viewer 不进入深度响应式状态；卸载时 destroy，清理拾取 handler 和监听。
产出：`docs/MAP-INTEGRATION.md`；验收：拖动、缩放、选点、飞行、筛选及错误降级均有效。

## 第 6 步：资料与照片

接入详情抽屉和 hash 深链接；20 座首批照片审核，每张完整署名。
连续快速点击验证请求取消；无照片和图片失效都保留资料可读性。
产出：`docs/PHOTO-CURATION.md`，记录匹配理由、来源和许可；验收：详情 ID 与地图选择一致。

## 第 7 步：发布与运维

按第 05 章发布 API、确认 CORS 后再发布 Pages。每次发布记录 commit SHA、构建结果、部署地址、配置变化和验收结果。
产出：`docs/RELEASE-RUNBOOK.md`；验收：公开 URL 打开、详情刷新、后台异常降级、移动端基本操作均通过。

## 代码详细注释约定

中文注释说明“为什么、输入输出、单位、边界、失败处理”；名称保持标准英文。模块文件头说明职责；公共函数有 JSDoc；重要数据转换和权限点有就地注释。
重点：经纬度顺序、海拔单位、未知/公元前日期、来源版本、分页上限、RLS bypass、公开环境变量、请求取消、资源销毁和资源路径。
不为每个自明赋值写重复注释，也不把密钥和真实连接串放进注释。每个模块配使用说明，让用户能跟随函数入口理解执行流程。

注释风格示例（说明范例，不是本包可运行产品代码）：

```ts
/** 把官方坐标转为地图坐标；源经纬度以度为单位。
 *  必须先校验有效性，避免空值被转换成 0 后错误落到几内亚湾。
 *  海拔可能为负；地图贴地点高度与官方海拔分别保存。
 */
// 前端公开配置只能包含 API 地址，不能包含 Supabase 服务端密钥。
// 详情请求可能乱序返回；只有返回 ID 仍等于当前选中 ID 时才更新抽屉。
```

每阶段文档统一填写：目标 → 前提 → 文件 → 操作命令 → 预期结果 → 实际验证 → 常见错误 → 回滚。没有实际执行的步骤写“待执行”，不能写“已通过”。
