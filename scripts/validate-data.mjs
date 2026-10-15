/** 构建前检查快照和分片：路径、编号、坐标、照片署名均必须有效。 */
import {readFile} from 'node:fs/promises';
import {validateCatalog} from '../src/domain/catalog.ts';
const catalog=validateCatalog(JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url),'utf8')));
const shards=new Map();let photos=0;
for(const item of catalog.items){
 const prefix=item.id.slice(0,3);
 if(!shards.has(prefix))shards.set(prefix,JSON.parse(await readFile(new URL(`../public/data/details/${prefix}.json`,import.meta.url),'utf8')));
 const detail=shards.get(prefix)[item.id];
 if(!detail||detail.nameEn!==item.nameEn)throw new Error(`分片不一致 ${item.id}`);
 for(const photo of detail.photos){if(!photo.author||!photo.license||!photo.sourcePageUrl||!photo.licenseUrl)throw new Error(`图片署名缺失 ${item.id}`);photos++;}
}
console.log(`目录验证通过：${catalog.items.length} 座 / ${shards.size} 分片 / ${photos} 张署名照片`);
