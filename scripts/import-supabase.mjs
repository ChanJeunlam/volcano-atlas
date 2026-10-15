/** 仅在受控终端执行：导入新版本，完整校验后切换；不修改已有活动版本。 */
import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {validateCatalog} from '../src/domain/catalog.ts';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
if(!url||!key)throw new Error('请在未提交的 .env.local 中配置 SUPABASE_URL 与 SUPABASE_SECRET_KEY');
const root=new URL('../public/data/',import.meta.url);
const c=validateCatalog(JSON.parse(await readFile(new URL('catalog.json',root),'utf8')));
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
// 每次新快照使用新 ID；避免重新导入相同源文件时部分修改当前活动版本。
const snapshotId=randomUUID(),metadata={...c.metadata,snapshotId,mode:'api'};
const shardCache=new Map();const rows=[];
for(const v of c.items){const prefix=v.id.slice(0,3);if(!shardCache.has(prefix))shardCache.set(prefix,JSON.parse(await readFile(new URL(`details/${prefix}.json`,root),'utf8')));const full=shardCache.get(prefix)[v.id];if(!full)throw new Error(`缺少详情 ${v.id}`);rows.push({snapshot_id:snapshotId,id:v.id,data:full});}
function ensure(result){if(result.error)throw new Error(result.error.message);return result;}
ensure(await db.from('dataset_snapshots').insert({id:snapshotId,metadata,row_count:rows.length}));
for(let i=0;i<rows.length;i+=200)ensure(await db.from('volcanoes').insert(rows.slice(i,i+200)));
const count=ensure(await db.from('volcanoes').select('id',{head:true,count:'exact'}).eq('snapshot_id',snapshotId)).count;
if(count!==rows.length)throw new Error(`导入不完整，未切换活动版本：${count}/${rows.length}`);
// 指针只更新一个主键行；前面的任一步失败，旧活动目录仍保留。
ensure(await db.from('active_dataset').upsert({singleton:true,snapshot_id:snapshotId},{onConflict:'singleton'}));
console.log(JSON.stringify({snapshotId,count,sourceHash:createHash('sha256').update(JSON.stringify(c)).digest('hex'),published:true},null,2));
