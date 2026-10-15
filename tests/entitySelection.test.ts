import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EntityCollection} from 'cesium';
import {syncMapEntities} from '../src/domain/syncMapEntities.ts';
test('switching selection updates the same entities observed by Cesium visualizers',()=>{
 const entities=new EntityCollection();
 const rows=[{id:'211080',name:'Marsili'},{id:'211090',name:'Other'}];
 const draw=(selected:string)=>syncMapEntities(entities,rows.map(v=>v.id),(id)=>({name:id===selected?'✓ selected':'normal'}));
 draw('211090');const marsili=entities.getById('211080')!,other=entities.getById('211090')!;
 draw('211080');assert.equal(entities.getById('211080'),marsili);assert.equal(marsili.name,'✓ selected');assert.equal(other.name,'normal');
 syncMapEntities(entities,['211080'],()=>({name:'still selected'}));assert.equal(entities.values.length,1);assert.equal(entities.getById('211080'),marsili);
});
