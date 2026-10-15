<script setup lang="ts">
/** 教学对照表：原生 dialog 提供焦点约束、Esc 关闭；不改变当前火山详情路由。 */
import {onMounted,ref} from 'vue';
import VolcanoProfile from './VolcanoProfile.vue';
import {volcanoProfiles,type ProfileType} from '../domain/volcanoProfiles';
defineProps<{active:ProfileType}>();
const emit=defineEmits<{close:[]}>();const panel=ref<HTMLDialogElement|null>(null);
onMounted(()=>panel.value?.showModal());
</script>
<template>
 <dialog ref="panel" class="comparison-dialog" aria-labelledby="comparison-title" @close="emit('close')" @click="($event.target===panel)&&panel?.close()">
  <div class="comparison-header"><div><span class="eyebrow">VOLCANO MORPHOLOGY</span><h2 id="comparison-title">认识三种典型火山</h2><p>从山体轮廓、坡度和物质组成，读懂火山的形态差异。</p></div><button class="icon-button" aria-label="关闭火山对照表" autofocus @click="panel?.close()">×</button></div>
  <div class="profile-cards"><article v-for="p in volcanoProfiles" :key="p.key" :class="{'profile-highlight':active===p.key}"><VolcanoProfile :type="p.key" :label="p.label"/><h3 :style="{color:p.color}">{{p.label}}</h3><small>{{p.english}}</small><p>{{p.shape}}</p></article></div>
  <div class="comparison-scroll"><table><caption>三种火山形态对照 · 根据提供的 Table 10.2 整理</caption><thead><tr><th scope="col">对比维度</th><th v-for="p in volcanoProfiles" :key="p.key" scope="col">{{p.label}}</th></tr></thead><tbody><tr><th scope="row">典型坡度</th><td v-for="p in volcanoProfiles" :key="p.key">{{p.slope}}</td></tr><tr><th scope="row">主要组成</th><td v-for="p in volcanoProfiles" :key="p.key">{{p.composition}}</td></tr><tr><th scope="row">图中尺度</th><td v-for="p in volcanoProfiles" :key="p.key">{{p.scale}}</td></tr></tbody></table></div>
  <p class="comparison-note">轮廓图为归一化示意，并非同一比例尺。坡度和尺寸是教学参考，不是所有火山的固定范围。地图仍保留 GVP 的破火山口、火山群等分类，不强制归入这三类。</p>
  <p class="comparison-reference">参考：用户提供的 Table 10.2。中文表格重新整理，SVG 轮廓重新绘制；原书名与作者未提供。</p>
 </dialog>
</template>
