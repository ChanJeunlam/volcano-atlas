import test from 'node:test';
import assert from 'node:assert/strict';
import catalogHandler from '../api/v1/catalog.ts';
import detailHandler from '../api/v1/volcanoes/[id].ts';
import type {ResponseLike,RequestLike} from '../server/http.ts';
function response(){const result={status:200,data:undefined as any,headers:{} as Record<string,string>};const res:ResponseLike={setHeader(k,v){result.headers[k]=v},status(c){result.status=c;return res},json(d){result.data=d},end(){}};return {result,res}}
const request=(id?:string,method='GET'):RequestLike=>({method,headers:{origin:'https://chanjeunlam.github.io'},query:{id}});
test('静态 API 返回真实完整目录，跨域允许 Pages',async()=>{const {result,res}=response();await catalogHandler(request(),res);assert.equal(result.status,200);assert.equal(result.data.metadata.count,result.data.items.length);assert.ok(result.data.items.length>1000);assert.equal(result.headers['Access-Control-Allow-Origin'],'https://chanjeunlam.github.io');});
test('详情编号合法性、404和真实火山',async()=>{for(const [id,status] of [['../secret',400],['999999',404],['283030',200]] as const){const {result,res}=response();await detailHandler(request(id),res);assert.equal(result.status,status);if(status===200)assert.equal(result.data.nameEn,'Fujisan');}});
test('公开API不能用POST写入',async()=>{const {result,res}=response();await catalogHandler(request(undefined,'POST'),res);assert.equal(result.status,405);});
