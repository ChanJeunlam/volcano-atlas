# 03 数据库与接口约定

## 数据表设计

| 表 | 主键及主要字段 | 用途 |
|---|---|---|
| dataset_snapshots | UUID；source、source_version、retrieved_at、sha256、row_count、status | 导入版本和发布状态 |
| volcanoes | (snapshot_id, gvp_id)；name_en、name_zh nullable、latitude、longitude、elevation_m nullable、landform、last_eruption_text、last_eruption_year nullable、source_url | 版本化火山目录 |
| active_dataset | 固定 singleton ID；snapshot_id | 唯一活动快照指针 |
| countries | code、name_en、name_zh | 已确认国家代码映射 |
| volcano_countries | (snapshot_id, gvp_id, country_code) | 多国关系 |
| volcano_aliases | UUID；gvp_id、alias、language、source_url | 经验证别名 |
| volcano_photos | UUID；gvp_id、URL/署名/许可字段、sort_order、verification_status | 跨目录版本的图片元数据 |
| eruptions（二期） | UUID；gvp_id、source_record_id、日期原文、精度、VEI nullable、confirmation、source_url | 喷发历史 |
| activity_reports（二期） | UUID；gvp_id、source、published_at、observed_period、status_text、source_url | 有明确来源的活动记录 |
| ingestion_runs | UUID；开始/结束、结果、统计、错误摘要 | 内部导入日志 |

`gvp_id` 不包含隐式数值运算；坐标使用 double precision，范围约束 latitude [-90,90]、longitude [-180,180]。GeoJSON 坐标为 `[经度,纬度]`；海拔与地形贴地点分开处理。
`volcanoes` 外键关联快照，国家关系关联复合主键；照片通过 GVP ID 逻辑关联，服务端仅对当前有效火山返回照片。
第一期不引入 PostGIS，约千级点位可在前端筛选；后续真实空间查询需求出现时再增加。

## 访问设计

浏览器只调用 Vercel，不直接调用 Supabase。前端只需公开 API 根地址和受限制的地图 token。
所有暴露 schema 表启用 RLS；匿名和普通 authenticated 角色不获得写权限；内部日志不公开。
服务端使用 secret/service-role 凭证时会绕过 RLS，因此每个公共接口必须限制投影字段和查询范围；RLS 不是这类后端接口的输入校验替代品。
优先后续分离只读 API 数据库身份与导入身份；首期如果使用同一个服务端凭证，代码路径不提供任何公共写端点。
不允许公网 `/api/import` 或无鉴权刷新按钮。导入只在受控脚本/CI 中执行。

## API v1

统一前缀 `/api/v1`，公开只读 GET；支持 OPTIONS；拒绝其他方法。

| 路径 | 参数 | 响应 |
|---|---|---|
| `/health` | 无 | 可用状态、版本；不输出密钥或连接串 |
| `/catalog` | 首期无 | 当前快照全部轻量点位、国家、形态和元数据 |
| `/volcanoes/:id` | GVP ID 严格匹配当前编号格式 | 单个火山、公开照片和来源 |
| `/volcanoes/:id/eruptions` | limit 1–100，cursor（二期） | 历史及 next_cursor |

Vercel 实施时以其支持的文件路由实现动态段；不得仅把目录字符串写进文档就假定运行。
后端目录读取按稳定排序分批取完，校验总数和快照 ID。Supabase/PostgREST 返回行上限不能被误当成目录总量；源目录数量与 API 响应数量必须一致。
分页历史使用稳定的 `(日期排序字段,id)` 游标；不确定日期另行归类，不能随机顺序分页。

示例（仅接口形状，值为占位，不是实际火山数据）：

```json
{"metadata":{"snapshotId":"example","source":"GVP","sourceVersion":"source-version","retrievedAt":"ISO-8601 UTC","count":1,"stale":false},"items":[{"id":"gvp-id","nameEn":"Official name","nameZh":null,"longitude":0,"latitude":0,"elevationM":null,"countryCodes":[],"landform":"Unknown","lastEruptionText":"Unknown"}]}
```

错误结构：`{"error":{"code":"INVALID_ID","message":"火山编号格式不正确","requestId":"..."}}`。
状态码：400 参数非法；404 当前目录无此 ID；405 方法错误；429 限流；503 服务不可用。错误日志保留内部原因，响应不泄露数据库细节。

## 缓存和跨域

目录建议 CDN 缓存 1 小时、stale-while-revalidate 24 小时；详情 1 小时。活动信息另定更短策略。ETag 包含快照/照片版本；更新后明确刷新路径或等待 TTL。
CORS 允许明确 origin：`https://chanjeunlam.github.io` 和开发 origin；origin 不包含 `/volcano-atlas/` 路径。若提供 Vercel 前端预览，仅增加实际受控预览 origin，勿对任意后缀放行。
返回 `Vary: Origin`，不使用 Cookie 凭证；缓存策略和动态 origin 头需一起测试，防止缓存错误 origin 的响应。
CORS 只能约束浏览器，不能防止其他客户端调用；接口需要查询上限、缓存和适合平台的限流策略。
