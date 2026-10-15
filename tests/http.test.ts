import test from 'node:test';
import assert from 'node:assert/strict';
import {responseHeaders,acceptMethod} from '../server/http.ts';
test('CORS白名单只允许origin，不按路径或任意后缀放行',()=>{
 const allowed=['https://chanjeunlam.github.io','http://localhost:5173'];
 assert.equal(responseHeaders('https://chanjeunlam.github.io',allowed)['Access-Control-Allow-Origin'],'https://chanjeunlam.github.io');
 assert.equal(responseHeaders('https://evil.github.io',allowed)['Access-Control-Allow-Origin'],undefined);
 assert.equal(responseHeaders('https://chanjeunlam.github.io',allowed).Vary,'Origin');
});
test('公开端点只允许GET和OPTIONS',()=>{
 assert.equal(acceptMethod('GET'),200);assert.equal(acceptMethod('OPTIONS'),204);assert.equal(acceptMethod('POST'),405);
});
