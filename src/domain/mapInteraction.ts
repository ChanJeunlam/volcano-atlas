import type {Volcano} from './catalog.ts';
/** Natural Earth 是全球底图：选中保持区域视野，避免飞到模糊的山脚。 */
export function selectionHeight(current:number):number{return Math.max(2500000,Math.min(5000000,current));}
/** drillPick 会同时返回地球、标签与图标；只接收目录格式的实体编号并去重。 */
export function pickedIds(picks:unknown[]):string[]{
 const ids=new Set<string>();
 for(const p of picks){const id=(p as {id?:{id?:unknown}})?.id?.id;if(typeof id==='string'&&/^\d{6}$/.test(id))ids.add(id);}
 return [...ids];
}
const shapes:Record<string,string>={
 Composite:'M7 43 31 9 57 43Z M23 21 31 9 40 22 34 20 30 24Z',
 Shield:'M5 43Q15 38 24 32Q31 27 39 32Q49 39 59 43Z',
 Caldera:'M5 43 18 20 25 26 39 26 46 20 59 43Z M25 26Q32 32 39 26',
 Cluster:'M3 43 18 21 31 43Z M22 43 36 13 53 43Z M42 43 51 28 62 43Z',
 Minor:'M13 43 25 25 38 25 51 43Z M25 25Q31 31 38 25',
 Unknown:'M6 43 20 27 29 33 40 19 58 43Z'
};
const colors:Record<string,string>={Composite:'#ff8757',Shield:'#f5c56d',Caldera:'#bd9bff',Cluster:'#64cdbb',Minor:'#8caecc',Unknown:'#9aa9bc'};
const cache=new Map<string,string>();
/** 地图、列表、图例共用同一 SVG。全部路径内嵌，避免 SVG 内引用图片导致 WebGL 纹理加载失败。
 * 相机徽章代表目录中有已核验照片；金色四角独立表达选中状态，不依赖颜色识别。
 */
export function markerImage(type:string,photo=false,selected=false):string{
 const kind=type.startsWith('Minor')?'Minor':shapes[type]?type:'Unknown';const key=`${kind}:${photo}:${selected}`;
 if(cache.has(key))return cache.get(key)!;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56"><path d="${shapes[kind]}" fill="${selected?'#fff3a0':colors[kind]}" stroke="${selected?'#ffffff':'#101826'}" stroke-width="${selected?4:3}" stroke-linejoin="round"/>${photo?'<rect x="43" y="4" width="19" height="15" rx="3" fill="#f8fafc" stroke="#101826" stroke-width="2"/><circle cx="52" cy="11.5" r="4" fill="#18354a"/>':''}${selected?'<path d="M3 17V3H17M47 3H61V17M3 39V53H17M47 53H61V39" fill="none" stroke="#fff4a3" stroke-width="3"/>':''}</svg>`;
 const image=`data:image/svg+xml,${encodeURIComponent(svg)}`;cache.set(key,image);return image;
}

/** 照片优先；两个分组内部都按 GVP 编号升序，避免依赖上游文件顺序。 */
export function compareVolcanoes(a:Volcano,b:Volcano):number{return Number(b.photos.length>0)-Number(a.photos.length>0)||a.id.localeCompare(b.id);}
