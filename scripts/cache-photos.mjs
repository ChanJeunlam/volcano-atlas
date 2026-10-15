/** CI 缓存已审核照片，访客优先读取 Pages 同源图片；失败时保留远程链接和界面降级。 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const photos=JSON.parse(await readFile(new URL('data/curated-photos.json',root),'utf8'));
await mkdir(new URL('public/images/',root),{recursive:true});
let success=0;
for(const [id,entries] of Object.entries(photos)){
 const photo=entries[0];
 try{
  const r=await fetch(photo.imageUrl,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'VolcanoAtlas/0.1 (educational atlas; github.com/ChanJeunlam/volcano-atlas)'}});
  if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw new Error(`HTTP ${r.status}`);
  const bytes=Buffer.from(await r.arrayBuffer());if(bytes.length<1000)throw new Error('image too small');
  await writeFile(new URL(`public/images/${id}.jpg`,root),bytes);
  // 保留原始图页与许可；仅替换 UI 图片地址。使用相对标记让前端按 BASE_URL 解析。
  const shardPath=new URL(`public/data/details/${id.slice(0,3)}.json`,root);
  const shard=JSON.parse(await readFile(shardPath,'utf8'));
  shard[id].photos[0].thumbnailUrl=`local:images/${id}.jpg`;
  await writeFile(shardPath,JSON.stringify(shard));success++;
 }catch(e){console.warn(`Photo ${id}: not cached (${e.message})`);}
}
console.log(`Cached ${success}/${Object.keys(photos).length} curated photos`);
