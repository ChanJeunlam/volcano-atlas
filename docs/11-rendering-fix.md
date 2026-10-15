# 11 Cesium 渲染失败排查与修复

用户报告：An error occurred while rendering. Rendering has stopped；弹框附 [object Object] / undefined。

## 已确认原因

线上预期路径 `/volcano-atlas/cesium/Assets/Textures/NaturalEarthII/tilemapresource.xml` 与 Worker 路径返回404。
构建实际位置却是 `dist/cesium/node_modules/cesium/Build/Cesium/Assets/...`。
vite-plugin-static-copy 4.1.1 默认保留源目录结构，原配置缺少去除前缀的规则。build 通过不代表运行资源完整。

## 修复

vite.config.ts 的 src 明确匹配 `{Assets,Workers,Widgets,ThirdParty}/**/*`，rename.stripBase=4，去除 node_modules / cesium / Build / Cesium 四级前缀。
修复后目标为 dist/cesium/Assets、dist/cesium/Workers 等。
新增 tests/assets.build.ts：真正检查 NaturalEarthII 描述文件和 createVerticesFromQuantizedTerrainMesh.js；npm run test:build 在构建后、发布前执行。
回归测试先观察原配置下 ENOENT，再修正路径并构建验证通过。

关闭 Cesium 内置 showRenderLoopErrors 模态框，改为订阅 scene.renderError 显示中文提示并记录真实原因。图形故障不会让整个网站被英文弹框遮挡，列表和详情继续可用；这只是故障处理，资源复制修复才解决本次已确认的404。

## 浏览器环境限制

本次远程浏览器另有 WebGL 初始化失败，这属于该测试浏览器的图形能力，不能等同于用户设备上的错误。资源404为独立、已复现的部署问题，先修复并上线。
若修复后仍发生图形错误，应进一步读取真实控制台中的 shader/context 错误，检查硬件加速与显卡支持；不要简单把全部错误归咎于用户浏览器。
