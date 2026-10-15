import test from 'node:test';
import assert from 'node:assert/strict';
import {effectScope,nextTick,ref} from 'vue';
import {usePhotoState} from '../src/composables/usePhotoState.ts';
test('同一火山从远程目录图切换为本地详情图后重新尝试加载',async()=>{
 const record=ref({id:'283030',photos:[{thumbnailUrl:'https://example.com/fuji.jpg'}]});
 const scope=effectScope();const state=scope.run(()=>usePhotoState(()=>record.value))!;
 state.broken.value=true;
 record.value={id:'283030',photos:[{thumbnailUrl:'local:images/283030.jpg'}]};
 await nextTick();assert.equal(state.broken.value,false);scope.stop();
});
