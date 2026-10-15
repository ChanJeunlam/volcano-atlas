# 12 三类火山对照表与轮廓图例

## 用户需求与来源

用户提供了一张题为 Table 10.2 — Comparison of the Three Types of Volcanoes 的截图，要求加入对照表并使用三种火山图作图例。
参考图包括 Shield Volcano、Composite Volcano、Cinder Cone。
用户已确认书籍为 **Physical Geology: Earth Revealed**，作者 **Diane H. Carlson、Charles C. Plummer、David McGeary**；对应 **Table 10.2 — Comparison of the Three Types of Volcanoes**。
版次、出版年份和页码尚未提供，不根据作者名单推断。页面保留既有中文介绍与对照内容，只补充已确认书名和作者。
用户已明确要求公开上传原图。原始截图保存在 public/images/volcano-types-reference.png；网页可展开查看，也可单独打开。

## 页面入口与交互

- 顶部“火山类型图解”打开中文对照面板。
- 地图底部增加盾状火山、复合火山、火山渣锥三种轮廓按钮；点击后突出对应卡片。
- 对照表按坡度、组成与图中尺度比较三种形态。
- 原生 dialog 支持键盘焦点、Esc、关闭按钮及点击外侧关闭；关闭后原有地图筛选与详情保持。
- 手机可横向滚动表格；三幅轮廓仍同时可见。

## 绘制与科学边界

src/components/VolcanoProfile.vue 直接采用用户原图中的宽缓盾状、分层高锥和带顶口的小型陡锥。以 SVG viewBox 分别取山体区域，排除英文小字和坐标轴；不修改 PNG。图例仍受原图像素分辨率限制，不声称是真正的矢量山体。
SVG 视口使用 overflow:hidden，并以每个实例独立的 clipPath 精确裁切山体区域。前者防止整图溢出遮挡，后者防止等比缩放的留白处露出原图标签和坐标轴；保持火山轮廓的真实宽高比。
三个图标的显示尺寸归一化，用于识别轮廓，不是同一真实比例尺。原图底部同一比例尺示意保留在展开区，不以归一化图标替代真实尺度比较。
表中2°–10°、约25°、约33°和高度范围均注明教学参考；不是全球火山固定阈值。
夏威夷约10 km高度指从海底起算，不能和地面海拔混用；截图中尺寸只作为图中示例说明。
GVP 的 landform/Primary_Volcano_Type 体系比三种教学形态更细，不把 Minor、Cluster、Caldera 或 Pyroclastic cone 自动改成 Cinder cone。原有地图色标和官方类别保持，形态图解独立一行。

## 文件与维护

- src/domain/volcanoProfiles.ts：中文教学文案、形态名称和源图数值。
- src/components/VolcanoProfile.vue：原图三种轮廓的 SVG 视口。
- src/components/VolcanoComparison.vue：中文对照表、原图和来源说明。
- public/images/volcano-types-reference.png：用户授权公开的原始图片。
- src/App.vue、src/style.css：入口、图例和响应式布局。

月更 workflow 更新官方目录，不会覆盖以上教学文案、图例、原图或书籍署名。未来若取得版次、年份与页码，再补充完整引文。

验证：类型检查、现有测试、Pages子路径构建和资源回归检查；发布后检查三种入口、对照表和关闭交互。
