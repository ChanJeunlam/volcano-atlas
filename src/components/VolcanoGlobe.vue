<script setup lang="ts">
/** 三维地球仅负责展示和拾取；搜索/资料由父组件管理，卸载时释放 WebGL 资源。 */
import {onMounted,onBeforeUnmount,ref,watch} from 'vue';
import type {Volcano} from '../domain/catalog';
import {markerImage,pickedIds,selectionHeight,compareVolcanoes} from '../domain/mapInteraction';
const props=defineProps<{items:Volcano[];selected:Volcano|null}>();
const emit=defineEmits<{select:[id:string];terrain:[enabled:boolean]}>();
const container=ref<HTMLElement|null>(null);const error=ref('');
const candidates=ref<Volcano[]>([]);const hover=ref('');
function choose(id:string){candidates.value=[];hover.value='';emit('select',id);}
let viewer:import('cesium').Viewer|undefined;
let handler:import('cesium').ScreenSpaceEventHandler|undefined;
let C:typeof import('cesium')|undefined;
let disposed=false;
/** 目录约千级，批量挂起 entity 事件再更新，避免每点触发一次重绘。 */
function redraw(){
 if(!viewer||!C)return;viewer.entities.suspendEvents();viewer.entities.removeAll();
 // 选中的火山即使被筛选隐藏，也保留在地图中，保证档案与地图一致。
 const visible=props.selected&&!props.items.some(v=>v.id===props.selected!.id)?[...props.items,props.selected]:props.items;
 for(const v of visible){const active=v.id===props.selected?.id;
 viewer.entities.add({id:v.id,position:C.Cartesian3.fromDegrees(v.longitude,v.latitude),billboard:{image:markerImage(v.landform,v.photos.length>0,active),width:active?54:40,height:active?47:35,heightReference:C.HeightReference.CLAMP_TO_GROUND,disableDepthTestDistance:0},label:active?{text:`✓ ${v.nameZh||v.nameEn}`,font:'bold 15px sans-serif',fillColor:C.Color.WHITE,showBackground:true,backgroundColor:C.Color.fromCssColorString('#101826'),pixelOffset:new C.Cartesian2(0,-36),heightReference:C.HeightReference.CLAMP_TO_GROUND}:undefined});
 }
 viewer.entities.resumeEvents();viewer.scene.requestRender();
}
/** 镜头以火山为目标；负海拔不用于把相机放到海底。 */
function focus(v:Volcano|null){
 if(!viewer||!C)return;
 if(v)viewer.camera.flyTo({destination:C.Cartesian3.fromDegrees(v.longitude,v.latitude,selectionHeight(viewer.camera.positionCartographic.height)),orientation:{heading:0,pitch:-Math.PI/2,roll:0},duration:0.9});
 else home();
}
function home(){if(viewer&&C)viewer.camera.flyTo({destination:C.Cartesian3.fromDegrees(118,20,23000000),duration:1.3})}
defineExpose({home});
watch(()=>props.items,()=>{candidates.value=[];redraw()});watch(()=>props.selected,v=>{candidates.value=[];redraw();focus(v)});
onMounted(async()=>{
 try{
  C=await import('cesium');await import('cesium/Build/Cesium/Widgets/widgets.css');
  if(disposed||!container.value)return;
  // 自带 Natural Earth 影像可离线显示，不依赖 OSM 公共瓦片或商业默认 token。
  const imagery=await C.TileMapServiceImageryProvider.fromUrl(`${import.meta.env.BASE_URL}cesium/Assets/Textures/NaturalEarthII`);
  if(disposed)return;
  viewer=new C.Viewer(container.value,{baseLayer:new C.ImageryLayer(imagery),baseLayerPicker:false,geocoder:false,homeButton:false,sceneModePicker:false,navigationHelpButton:false,animation:false,timeline:false,fullscreenButton:false,selectionIndicator:false,infoBox:false,showRenderLoopErrors:false,requestRenderMode:true,maximumRenderTimeChange:Infinity});
  // 真正的 GPU/运行时故障保留日志与中文提示；不让内置英文模态框阻断资料浏览。
  viewer.scene.renderError.addEventListener((_scene:unknown,reason:unknown)=>{
   error.value='三维渲染暂时不可用，火山列表和资料仍可浏览。请刷新页面；若持续发生，请检查浏览器图形加速。';
   if(viewer)viewer.useDefaultRenderLoop=false;
   console.error('Cesium rendering failed',reason);
  });
  viewer.scene.backgroundColor=C.Color.fromCssColorString('#080e19');viewer.scene.globe.baseColor=C.Color.fromCssColorString('#18354a');
  viewer.scene.globe.enableLighting=false;viewer.scene.screenSpaceCameraController.minimumZoomDistance=1500000;
  viewer.camera.setView({destination:C.Cartesian3.fromDegrees(118,20,23000000)});
  handler=new C.ScreenSpaceEventHandler(viewer.scene.canvas);
  // 32px 容错窗口覆盖图标附近，重叠时展示候选而非任意取最上层。
  const hits=(position:import('cesium').Cartesian2)=>pickedIds(viewer?.scene.drillPick(position,30,32,32)??[]).map(id=>props.items.find(v=>v.id===id)??(props.selected?.id===id?props.selected:undefined)).filter((v):v is Volcano=>!!v).sort(compareVolcanoes);
  handler.setInputAction((event:{position:import('cesium').Cartesian2})=>{const found=hits(event.position);hover.value='';if(found.length===1)choose(found[0]!.id);else candidates.value=found;},C.ScreenSpaceEventType.LEFT_CLICK);
  let lastHover=0;
  handler.setInputAction((event:{endPosition:import('cesium').Cartesian2})=>{if(Date.now()-lastHover<100)return;lastHover=Date.now();const found=hits(event.endPosition);hover.value=found.length>1?`${found.length} 座相邻火山 · 点击选择`:found[0]?`${found[0].nameZh||found[0].nameEn} · ${found[0].photos.length?'有照片':'基础档案'}`:'';if(viewer)viewer.scene.canvas.style.cursor=found.length?'pointer':'';},C.ScreenSpaceEventType.MOUSE_MOVE);
  redraw();if(props.selected)focus(props.selected);
  const token=import.meta.env.VITE_CESIUM_ION_TOKEN;
  if(token){try{C.Ion.defaultAccessToken=token;const terrain=await C.createWorldTerrainAsync();if(!disposed&&viewer){viewer.terrainProvider=terrain;emit('terrain',true);viewer.scene.requestRender();}}catch{emit('terrain',false)}}
 }catch(e){error.value='当前浏览器无法显示三维地球，请使用左侧火山列表浏览资料。';console.error('Globe initialization failed',e);}
});
onBeforeUnmount(()=>{disposed=true;handler?.destroy();if(viewer&&!viewer.isDestroyed())viewer.destroy();});
</script>
<template><div class="globe-surface" ref="container" aria-label="全球火山三维地球"></div><div v-if="hover&&!candidates.length" class="map-hover" role="status">{{hover}}</div><div v-if="candidates.length" class="map-candidates"><header><strong>这里有 {{candidates.length}} 座火山</strong><button @click="candidates=[]" aria-label="关闭候选火山">×</button></header><p>选择要查看的档案 · 有照片的优先</p><button v-for="v in candidates" :key="v.id" @click="choose(v.id)"><img :src="markerImage(v.landform,!!v.photos.length)" alt=""><span>{{v.nameZh||v.nameEn}}<small>{{v.photos.length?'▣ 有照片':'基础档案 · 暂无照片'}} · {{v.id}}</small></span></button></div><div v-if="error" class="globe-error" role="status">{{error}}</div></template>
