<script setup lang="ts">
/** 原图轮廓视口：clipPath 同时裁切内容，避免等比缩放留白处露出英文标签。 */
import {useId} from 'vue';
import type {ProfileType} from '../domain/volcanoProfiles';
defineProps<{type:ProfileType;label?:string}>();
const boxes:Record<ProfileType,[number,number,number,number]>={shield:[96,120,291,35],composite:[138,238,250,61],cinder:[183,386,161,61]};
const referenceUrl=`${import.meta.env.BASE_URL}images/volcano-types-reference.png`;
const clipId=`profile-${useId()}`;
</script>
<template>
 <svg class="volcano-profile" :viewBox="boxes[type].join(' ')" role="img" :aria-label="label||type" xmlns="http://www.w3.org/2000/svg">
  <title>{{label||type}}</title>
  <defs><clipPath :id="clipId" clipPathUnits="userSpaceOnUse"><rect :x="boxes[type][0]" :y="boxes[type][1]" :width="boxes[type][2]" :height="boxes[type][3]"/></clipPath></defs>
  <image :href="referenceUrl" width="894" height="634" :clip-path="`url(#${clipId})`"/>
 </svg>
</template>
