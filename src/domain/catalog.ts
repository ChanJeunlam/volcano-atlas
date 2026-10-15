/** 浏览器与 API 共用的数据契约；不依赖数据库或地图。 */
export interface Photo {thumbnailUrl:string;imageUrl:string;sourcePageUrl:string;author:string;license:string;licenseUrl:string;caption:string}
export interface Volcano {id:string;nameEn:string;nameZh:string|null;latitude:number;longitude:number;elevationM:number|null;countries:string[];landform:string;region:string;lastEruptionText:string;lastEruptionYear:number|null;sourceUrl:string;tectonicSetting:string;evidence:string;summary:string;photos:Photo[]}
export interface Catalog {metadata:{count:number;snapshotId:string;retrievedAt:string;source:string;sourceVersion:string;sourceUrl:string;sha256?:string;mode?:string};items:Volcano[]}
export interface Filters {query:string;country:string;landform:string}
/** 搜索忽略大小写；国家、类型与名称搜索使用 AND 关系。 */
export function filterVolcanoes(items:Volcano[],f:Filters):Volcano[]{
 const q=f.query.trim().toLocaleLowerCase();
 return items.filter(v=>(!q||`${v.nameEn} ${v.nameZh??''} ${v.id}`.toLocaleLowerCase().includes(q))&&(!f.country||v.countries.includes(f.country))&&(!f.landform||v.landform===f.landform));
}
/** 拒绝空坐标、重复编号和不完整目录；null 不能转成数值零。 */
export function validateCatalog(value:unknown):Catalog {
 const c=value as Catalog;
 if(!c?.metadata||!Array.isArray(c.items)||c.metadata.count!==c.items.length||!c.metadata.snapshotId)throw new Error('目录数量或版本无效');
 const ids=new Set<string>();
 for(const v of c.items){
  if(!/^\d{6}$/.test(v.id)||ids.has(v.id)||typeof v.nameEn!=='string'||typeof v.latitude!=='number'||!Number.isFinite(v.latitude)||Math.abs(v.latitude)>90||typeof v.longitude!=='number'||!Number.isFinite(v.longitude)||Math.abs(v.longitude)>180||!Array.isArray(v.countries)||!v.countries.every(x=>typeof x==='string')||typeof v.landform!=='string'||!Array.isArray(v.photos))throw new Error('火山记录无效或ID重复');
  ids.add(v.id);
 }
 return c;
}
/** 目录给出年份而非日期；未知、公元前和公元年份分别展示。 */
export function formatYear(year:number|null):string {return year===null||!Number.isFinite(year)?'未知':year<0?`公元前 ${Math.abs(year)} 年`:`${year} 年`}
export const landformLabels:Record<string,string>={Composite:'复合火山',Shield:'盾状火山',Caldera:'破火山口',Cluster:'火山群','Minor (Basaltic)':'小型玄武质火山',Minor:'小型火山','Minor (Silicic)':'小型硅质火山',Unknown:'未知形态'};
export const landformColors:Record<string,string>={Composite:'#ff8757',Shield:'#f5c56d',Caldera:'#bd9bff',Cluster:'#64cdbb',Minor:'#8caecc','Minor (Silicic)':'#91b1d3',Unknown:'#9aa9bc'};
