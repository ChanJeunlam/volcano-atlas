# volcano-atlas 开发文档包

版本：规划稿 v1，2026-10-15。当前交付为开发前文档，不是已运行或已部署的软件。

目标：Vue 全球火山三维浏览网站；GitHub Pages 托管前端，Vercel 提供服务端接口，Supabase 存储目录、喷发和照片元数据。

阅读顺序：

1. [项目设计](docs/01-design.md)：范围、架构、界面和技术选择。
2. [数据与照片](docs/02-data.md)：官方来源、导入、身份匹配、许可与更新。
3. [数据库与接口](docs/03-contracts.md)：字段、响应、分页和访问边界。
4. [逐步开发](docs/04-development.md)：环境、目录、阶段任务、注释和验收。
5. [发布配置](docs/05-deployment.md)：GitHub 权限、Pages、Vercel、Supabase。
6. [测试和运维](docs/06-testing-operations.md)：验收、排错、恢复。
7. [旧项目与资料](docs/07-references.md)：旧项目真实地址和官方参考。

仓库名统一使用 ASCII `volcano-atlas`，避免输入不易识别的 Unicode 连字符。
GitHub 仓库：https://github.com/ChanJeunlam/volcano-atlas
当前仅提交开发文档；尚未创建数据库或部署产品。
本地工作目录：`/workspace/scratch/0b50a7d11424/volcano-atlas`。
