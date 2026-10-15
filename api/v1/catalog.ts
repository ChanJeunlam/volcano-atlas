/** GET /api/v1/catalog：CDN缓存的公开轻量目录，错误绝不输出数据库细节。 */
import {getCatalog} from '../../server/catalog.ts';
import {prepare,type RequestLike,type ResponseLike} from '../../server/http.ts';
export default async function handler(req:RequestLike,res:ResponseLike){
 if(!prepare(req,res))return;
 try{const data=await getCatalog();res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');res.status(200).json(data);}
 catch{res.setHeader('Cache-Control','no-store');res.status(503).json({error:{code:'CATALOG_UNAVAILABLE',message:'目录服务暂时不可用'}});}
}
