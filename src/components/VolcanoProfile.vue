<script setup lang="ts">
/** 直接使用用户原图中的三种轮廓；SVG 仅作为视口裁切，不修改原始 PNG。 */
import type {ProfileType} from '../domain/volcanoProfiles';
defineProps<{type:ProfileType;label?:string}>();
// 坐标以原图 894×634 像素为基准，仅框住山体，排除英文标签和比例尺。
const boxes:Record<ProfileType,string>={shield:'96 120 291 35',composite:'138 238 250 61',cinder:'183 386 161 61'};
const referenceUrl=`${import.meta.env.BASE_URL}images/volcano-types-reference.png`;
</script>
<template>
 <svg class="volcano-profile" :viewBox="boxes[type]" role="img" :aria-label="label||type" xmlns="http://www.w3.org/2000/svg">
  <title>{{label||type}}</title>
  <image :href="referenceUrl" width="894" height="634"/>
 </svg>
</template>
