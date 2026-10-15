/** 构建资源回归：点位 Worker 与 Natural Earth 纹理必须在 Cesium base 下，不携带 node_modules 前缀。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
test('Cesium 构建资源路径与线上 base 一致',async()=>{
 await access('dist/cesium/Assets/Textures/NaturalEarthII/tilemapresource.xml');
 await access('dist/cesium/Workers/createVerticesFromQuantizedTerrainMesh.js');
 assert.ok(true);
});
