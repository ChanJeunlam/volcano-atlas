/** 数据仓储：固定快照分页读取；未配置 Supabase 时提供随部署的官方快照。 */
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {validateCatalog,type Catalog,type Volcano} from '../src/domain/catalog.ts';
import {readAllPages} from './pagination.ts';
const root=()=>path.join(process.cwd(),'public','data');
/** Secret 会绕过 RLS，因此只在本模块读取、投影公开数据，不开放写操作。 */
function database(){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
 if(!url&&!key)return null;
 if(!url||!key)throw new Error('Supabase 配置不完整');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(10000)})}});
}
export async function getCatalog():Promise<Catalog>{
 const db=database();
 if(!db)return validateCatalog(JSON.parse(await readFile(path.join(root(),'catalog.json'),'utf8')));
 const {data:active,error:aError}=await db.from('active_dataset').select('snapshot_id').eq('singleton',true).single();
 if(aError||!active)throw new Error('没有活动快照');
 const {data:snapshot,error:sError}=await db.from('dataset_snapshots').select('metadata,row_count').eq('id',active.snapshot_id).single();
 if(sError||!snapshot)throw new Error('快照不存在');
 const items=await readAllPages<Volcano>(async(from,to)=>{
  const {data,error}=await db.from('volcanoes').select('data').eq('snapshot_id',active.snapshot_id).order('id').range(from,to);
  if(error)throw error;return (data??[]).map(r=>({...r.data,summary:''}) as Volcano);
 },snapshot.row_count);
 return validateCatalog({metadata:{...snapshot.metadata,mode:'api'},items});
}
/** 编号严格为六位数字，静态路径不接受任意用户输入。 */
export async function getVolcano(id:string):Promise<Volcano|null>{
 if(!/^\d{6}$/.test(id))return null;
 const db=database();
 if(!db){try{const shard=JSON.parse(await readFile(path.join(root(),'details',`${id.slice(0,3)}.json`),'utf8'));return shard[id]??null;}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;}}
 const {data:active,error:aError}=await db.from('active_dataset').select('snapshot_id').eq('singleton',true).single();
 if(aError||!active)throw new Error('没有活动快照');
 const {data,error}=await db.from('volcanoes').select('data').eq('snapshot_id',active.snapshot_id).eq('id',id).maybeSingle();
 if(error)throw error;return data?.data as Volcano??null;
}
