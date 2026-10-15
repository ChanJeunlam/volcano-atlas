<script setup lang="ts">
/** 页面状态集中于一个入口；地图、列表和详情共享同一选中 ID，避免状态分叉。 */
import {computed,onMounted,onBeforeUnmount,ref,watch} from 'vue';
import {useRoute,useRouter} from 'vue-router';
import VolcanoGlobe from './components/VolcanoGlobe.vue';
import VolcanoDetails from './components/VolcanoDetails.vue';
import VolcanoProfile from './components/VolcanoProfile.vue';
import VolcanoComparison from './components/VolcanoComparison.vue';
import {volcanoProfiles,type ProfileType} from './domain/volcanoProfiles';
import {filterVolcanoes,landformColors,landformLabels,type Catalog,type Volcano} from './domain/catalog';
import {loadCatalog,loadDetail} from './services/catalog';
const route=useRoute(),router=useRouter();
const catalog=ref<Catalog|null>(null),loading=ref(true),failure=ref('');
const query=ref(''),country=ref(''),landform=ref('');
const selectedId=computed(()=>typeof route.params.id==='string'?route.params.id:'');
const detail=ref<Volcano|null>(null),detailLoading=ref(false),detailError=ref('');
const terrain=ref(false),showFilters=ref(false),copied=ref(false);
const comparisonType=ref<ProfileType|null>(null);
const globe=ref<InstanceType<typeof VolcanoGlobe>|null>(null);
let controller:AbortController|undefined;
const items=computed(()=>catalog.value?.items??[]);
const filtered=computed(()=>filterVolcanoes(items.value,{query:query.value,country:country.value,landform:landform.value}));
const selected=computed(()=>items.value.find(v=>v.id===selectedId.value)??null);
const countries=computed(()=>[...new Set(items.value.flatMap(v=>v.countries))].sort());
const types=computed(()=>[...new Set(items.value.map(v=>v.landform))].sort());
const shown=computed(()=>filtered.value.slice(0,80));
const profile=computed(()=>detail.value?.id===selectedId.value?detail.value:selected.value);
const selectedMissing=computed(()=>!!selectedId.value&&!selected.value&&!loading.value);
const dataDate=computed(()=>catalog.value?new Date(catalog.value.metadata.retrievedAt).toLocaleDateString('zh-CN'):'');
function select(id:string){router.push(`/volcano/${id}`);showFilters.value=false;}
function close(){router.push('/');}
function reset(){query.value='';country.value='';landform.value='';}
/** 每次选中取消旧请求，并再次核对 ID；网络乱序不会覆盖当前详情。 */
watch(selected,async v=>{
 controller?.abort();detail.value=null;detailError.value='';detailLoading.value=false;
 if(!v)return;const id=v.id;controller=new AbortController();const current=controller;detailLoading.value=true;
 try{const result=await loadDetail(id,current.signal);if(!current.signal.aborted&&selectedId.value===id)detail.value=result;}
 catch{if(!current.signal.aborted)detailError.value='详细资料暂时无法读取，基础信息仍可浏览。';}
 finally{if(!current.signal.aborted)detailLoading.value=false;}
});
async function share(){try{await navigator.clipboard.writeText(location.href);copied.value=true;setTimeout(()=>copied.value=false,1800);}catch{copied.value=false;}}
onMounted(async()=>{try{catalog.value=await loadCatalog();}catch{failure.value='火山目录加载失败，请检查网络后重试。';}finally{loading.value=false;}});
onBeforeUnmount(()=>controller?.abort());
</script>
<template>
 <main class="atlas">
  <header class="topbar"><a class="brand" href="#/" aria-label="火山图谱首页"><span class="brand-mark">▲</span><div><strong>火山图谱</strong><span>VOLCANO ATLAS</span></div></a><div class="header-center"><span class="live-dot"></span>地球深处的故事，始于这里</div><nav><button class="learn-button" @click="comparisonType='shield'">火山类型图解</button><a href="https://github.com/ChanJeunlam/volcano-atlas" target="_blank" rel="noopener noreferrer">项目文档 ↗</a><button class="mobile-toggle" @click="showFilters=!showFilters">搜索 / 筛选</button></nav></header>
  <div class="workspace" :class="{'has-detail':!!profile}">
   <section class="sidebar" :class="{'mobile-open':showFilters}">
    <div class="intro"><span class="eyebrow">A LIVING PLANET</span><h1>探索全球<br><em>火山地貌</em></h1><p>从环太平洋到大洋深处，<br>在三维地球上发现火山的踪迹。</p></div>
    <div class="catalog-stat"><strong>{{items.length.toLocaleString()||'—'}}</strong><div><span>全新世火山</span><small>SMITHSONIAN GVP</small></div></div>
    <label class="search-box"><span aria-hidden="true">⌕</span><input v-model="query" aria-label="搜索火山" placeholder="搜索名称、中文名或 GVP 编号"><kbd>⌕</kbd></label>
    <div class="filter-grid"><label>国家 / 区域<select v-model="country" aria-label="国家或区域"><option value="">全部国家 / 区域</option><option v-for="c in countries" :key="c">{{c}}</option></select></label><label>火山形态<select v-model="landform" aria-label="火山形态"><option value="">全部形态</option><option v-for="t in types" :key="t" :value="t">{{landformLabels[t]||t}}</option></select></label></div>
    <div class="list-heading"><span>{{filtered.length.toLocaleString()}} 个结果</span><button v-if="query||country||landform" @click="reset">清除筛选</button><span v-else>按 GVP 编号排序</span></div>
    <div class="volcano-list" aria-label="火山列表"><p v-if="loading" class="list-message" role="status">正在加载官方目录…</p><p v-if="failure" class="list-message" role="alert">{{failure}}</p><p v-if="!loading&&!failure&&!filtered.length" class="list-message">没有匹配的火山，请调整筛选。</p><button v-for="v in shown" :key="v.id" class="volcano-row" :class="{active:v.id===selectedId}" @click="select(v.id)"><span class="row-dot" :style="{background:landformColors[v.landform]||'#9aa9bc'}"></span><span class="row-copy"><strong>{{v.nameZh||v.nameEn}}</strong><small>{{v.countries.join(' / ')}} · {{landformLabels[v.landform]||v.landform}}</small></span><span class="row-arrow">↗</span></button><p v-if="filtered.length>shown.length" class="list-foot">列表展示前 {{shown.length}} 座，地图展示全部筛选结果。<br>搜索名称可定位更多火山。</p></div>
    <footer class="sidebar-footer"><span class="status-dot"></span>{{catalog?.metadata.mode==='api'?'API 数据模式':'官方快照模式'}}<span>{{dataDate}}</span></footer>
   </section>
   <section class="map-panel" aria-label="地图区域"><VolcanoGlobe ref="globe" :items="filtered" :selected="selected" @select="select" @terrain="terrain=$event"/><div class="map-heading"><span class="eyebrow">GLOBAL VOLCANIC LANDSCAPE</span><h2>一颗仍在塑造自己的星球</h2><p>旋转地球 · 滚轮缩放 · 点击火山点位</p></div><div class="map-tools"><button class="map-tool" @click="globe?.home()" aria-label="恢复全球视角" title="恢复全球视角">◎</button><button class="map-tool" @click="share" aria-label="复制页面链接" title="复制页面链接">{{copied?'✓':'↗'}}</button></div><div v-if="selectedMissing" class="map-notice" role="alert">目录中未找到此火山编号。<button @click="close">返回全球</button></div><div class="legend-shell"><div class="morphology-legend"><span class="morphology-label">形态图解</span><button v-for="p in volcanoProfiles" :key="p.key" @click="comparisonType=p.key" :aria-label="`查看${p.label}对照表`"><VolcanoProfile :type="p.key" :label="p.label"/><span>{{p.label}}</span></button></div><div class="legend"><span v-for="t in ['Composite','Shield','Caldera','Cluster']" :key="t"><i :style="{background:landformColors[t]}"></i>{{landformLabels[t]}}</span><span><i style="background:#8caecc"></i>其他</span></div></div><div class="map-bottom"><span>{{terrain?'真实地形模式':'全球椭球 · 自带 Natural Earth 影像'}}</span><span>WGS 84 · GVP {{catalog?.metadata.sourceVersion}}</span></div></section>
   <VolcanoDetails v-if="profile" :volcano="profile" :loading="detailLoading" :error="detailError" @close="close"/>
  </div>
  <VolcanoComparison v-if="comparisonType" :active="comparisonType" @close="comparisonType=null"/>
 </main>
</template>
