import type {Entity,EntityCollection} from 'cesium';
/** 保持同 ID 实体的对象身份。不要在 suspendEvents 中 removeAll 后重新 add 同 ID：
 * Cesium 会抵消同批次的增删事件，visualizer 仍引用旧对象，造成选中标签不更新。
 * 原位更新属性会触发 definitionChanged；筛选只删除真正不再显示的实体。
 */
export function syncMapEntities(collection:EntityCollection,ids:string[],properties:(id:string)=>Partial<Pick<Entity,'name'|'position'|'billboard'|'label'>>):void{
 const wanted=new Set(ids);collection.suspendEvents();
 try{
  for(const entity of [...collection.values])if(!wanted.has(entity.id))collection.remove(entity);
  for(const id of ids){const entity=collection.getOrCreateEntity(id);Object.assign(entity,properties(id));}
 }finally{collection.resumeEvents();}
}
