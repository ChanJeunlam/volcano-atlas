/** GET /api/v1/volcanoes/:id：单座火山的公开档案。 */
import {getVolcano} from '../../../server/catalog.ts';
import {prepare,type RequestLike,type ResponseLike} from '../../../server/http.ts';
export default async function handler(req:RequestLike,res:ResponseLike){
 if(!prepare(req,res))return;
 const id=req.query.id;
 if(typeof id!=='string'||!/^\d{6}$/.test(id)){res.status(400).json({error:{code:'INVALID_ID',message:'火山编号应为六位数字'}});return;}
 try{const data=await getVolcano(id);if(!data){res.status(404).json({error:{code:'NOT_FOUND',message:'目录中没有这座火山'}});return;}
  res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');res.status(200).json(data);
 }catch{res.status(503).json({error:{code:'DETAIL_UNAVAILABLE',message:'资料服务暂时不可用'}});}
}
