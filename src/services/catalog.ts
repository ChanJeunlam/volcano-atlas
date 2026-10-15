/** 浏览器数据访问。API 不可用时回退同源快照；绝不持有 Supabase secret。 */
import {validateCatalog,type Catalog,type Volcano} from '../domain/catalog';
const api=(import.meta.env.VITE_API_BASE_URL||'').replace(/\/$/,'');
const base=import.meta.env.BASE_URL;
async function json(url:string,signal?:AbortSignal):Promise<unknown>{
 const response=await fetch(url,{signal:signal?AbortSignal.any([signal,AbortSignal.timeout(10000)]):AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error(`请求失败 ${response.status}`);return response.json();
}
/** metadata.mode 区分当前 API 与静态快照，防止用户误读数据实时性。 */
export async function loadCatalog():Promise<Catalog>{
 if(api){try {const c=validateCatalog(await json(`${api}/api/v1/catalog`));c.metadata.mode=c.metadata.mode==='snapshot'?'snapshot':'api';return c;}catch{ /* 网络和配置错误不妨碍公开目录浏览。 */ }}
 const c=validateCatalog(await json(`${base}data/catalog.json`));c.metadata.mode='snapshot';return c;
}
const shards=new Map<string,Record<string,Volcano>>();
/** 按前三位 GVP 编号分片加载地质说明；每片只下载一次，不在首屏拉取全部长文。 */
export async function loadDetail(id:string,signal:AbortSignal):Promise<Volcano>{
 if(!/^\d{6}$/.test(id))throw new Error('火山编号无效');
 if(api){try{return await json(`${api}/api/v1/volcanoes/${id}`,signal) as Volcano;}catch(e){if(signal.aborted)throw e;}}
 const prefix=id.slice(0,3);
 let shard=shards.get(prefix);
 if(!shard){shard=await json(`${base}data/details/${prefix}.json`,signal) as Record<string,Volcano>;shards.set(prefix,shard);}
 if(!shard[id])throw new Error('目录中没有这座火山');return shard[id];
}
