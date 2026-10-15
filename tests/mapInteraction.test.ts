import {test} from 'node:test';
import assert from 'node:assert/strict';
import {selectionHeight,pickedIds,markerImage,compareVolcanoes} from '../src/domain/mapInteraction.ts';
test('low resolution imagery keeps a regional view',()=>{assert.equal(selectionHeight(23000000),5000000);assert.equal(selectionHeight(120000),2500000);});
test('picking handles overlapping entities and ignores globe primitives',()=>{assert.deepEqual(pickedIds([{id:{id:'283030'}},{id:{id:'283030'}},{id:{id:'123456'}},{id:'ground'}]),['283030','123456']);});
test('map categories use distinct self-contained SVG silhouettes',()=>{const icons=['Composite','Shield','Caldera','Cluster','Unknown'].map(t=>markerImage(t));assert.equal(new Set(icons).size,5);assert.ok(icons.every(x=>x.startsWith('data:image/svg+xml,')));assert.notEqual(markerImage('Shield'),markerImage('Shield',true,true));});

test('photos first and GVP ascending within both groups',()=>{const rows=[{id:'300000',photos:[]},{id:'400000',photos:[{}]},{id:'100000',photos:[]},{id:'200000',photos:[{}]}];assert.deepEqual(rows.sort((a,b)=>compareVolcanoes(a as never,b as never)).map(v=>v.id),['200000','400000','100000','300000']);});
