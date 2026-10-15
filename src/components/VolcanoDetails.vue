<script setup lang="ts">
/** 图片及作者元数据以纯文本渲染；不将上游 HTML 注入 DOM。 */
import {ref,watch} from 'vue';
import {formatYear,landformLabels,type Volcano} from '../domain/catalog';
const props=defineProps<{volcano:Volcano;loading:boolean;error:string}>();
const emit=defineEmits<{close:[]}>();const broken=ref(false);const photoIndex=ref(0);
/** CI 图片以 local: 标记，按当前部署 base 解析；避免 Pages 子路径 404。 */
function photoUrl(url:string){return url.startsWith('local:')?`${import.meta.env.BASE_URL}${url.slice(6)}`:url;}
watch(()=>props.volcano.id,()=>{broken.value=false;photoIndex.value=0});
</script>
<template>
 <aside class="detail-panel" aria-label="火山详情">
  <div class="detail-top"><span>VOLCANO PROFILE / 火山档案</span><button class="icon-button" aria-label="关闭详情" @click="emit('close')">×</button></div>
  <div class="photo-frame">
   <img v-if="volcano.photos[photoIndex]&&!broken" :src="photoUrl(volcano.photos[photoIndex]!.thumbnailUrl)" :alt="volcano.photos[photoIndex]!.caption||volcano.nameEn" @error="broken=true">
   <div v-else class="photo-empty"><span class="mountain-symbol">△</span><span>{{broken?'照片暂时无法加载':'暂无已核验照片'}}</span><a :href="volcano.sourceUrl" target="_blank" rel="noopener noreferrer">查看 GVP 官方图库 ↗</a></div>
   <span class="photo-id">GVP {{volcano.id}}</span>
  </div>
  <div class="detail-body">
   <span class="eyebrow">{{volcano.countries.join(' / ')}}</span>
   <h2>{{volcano.nameZh||volcano.nameEn}}</h2><p v-if="volcano.nameZh" class="english-name">{{volcano.nameEn}}</p>
   <span class="type-pill">{{landformLabels[volcano.landform]||volcano.landform}}</span>
   <dl class="facts"><div><dt>海拔</dt><dd>{{volcano.elevationM===null?'未知':volcano.elevationM.toLocaleString()+' m'}}</dd></div><div><dt>最近已知喷发</dt><dd>{{formatYear(volcano.lastEruptionYear)}}</dd></div><div><dt>纬度</dt><dd>{{Math.abs(volcano.latitude).toFixed(3)}}° {{volcano.latitude<0?'S':'N'}}</dd></div><div><dt>经度</dt><dd>{{Math.abs(volcano.longitude).toFixed(3)}}° {{volcano.longitude<0?'W':'E'}}</dd></div></dl>
   <section class="detail-section"><h3>地质背景 <span>GEOLOGICAL CONTEXT</span></h3><p>{{volcano.region||'区域信息未知'}}</p><p class="muted">{{volcano.tectonicSetting}}</p><p v-if="loading" role="status">正在读取地质说明…</p><p v-else-if="error" class="muted">{{error}}</p><p v-else class="geology-text">{{volcano.summary||'详见官方资料页。'}}</p><small>地质说明保留官方英文，避免自动翻译改变科学含义。</small></section>
   <section v-if="volcano.photos[photoIndex]" class="attribution"><p>{{volcano.photos[photoIndex]!.caption}}</p><p>作者：{{volcano.photos[photoIndex]!.author}}</p><a :href="volcano.photos[photoIndex]!.licenseUrl" target="_blank" rel="noopener noreferrer">{{volcano.photos[photoIndex]!.license}}</a><span> · </span><a :href="volcano.photos[photoIndex]!.sourcePageUrl" target="_blank" rel="noopener noreferrer">原图与来源 ↗</a></section>
   <a class="source-button" :href="volcano.sourceUrl" target="_blank" rel="noopener noreferrer">阅读 Smithsonian GVP 档案 <span>↗</span></a>
   <p class="detail-note">最近喷发年份不代表当前活动状态或危险等级。全新世目录约覆盖过去 12,000 年。</p>
  </div>
 </aside>
</template>
