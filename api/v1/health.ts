/** 存活检查仅表示函数可运行，不假称数据库已连通。 */
import {prepare,type RequestLike,type ResponseLike} from '../../server/http.ts';
export default function handler(req:RequestLike,res:ResponseLike){if(prepare(req,res)){res.setHeader('Cache-Control','no-store');res.status(200).json({status:'ok',version:'0.1.0',mode:process.env.SUPABASE_URL?'database-configured':'snapshot',databaseVerified:false});}}
