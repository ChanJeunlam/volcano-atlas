<script setup lang="ts">
/** 原生 SVG 轮廓：参考上传图重绘；图例尺寸归一化，不能据此比较真实高度。 */
import type {ProfileType} from '../domain/volcanoProfiles';
defineProps<{type:ProfileType;label?:string}>();
</script>
<template>
 <svg class="volcano-profile" viewBox="0 0 180 76" role="img" :aria-label="label||type" xmlns="http://www.w3.org/2000/svg">
  <title>{{label||type}}</title>
  <path d="M5 66H175" stroke="currentColor" stroke-opacity=".25" stroke-width="1"/>
  <g v-if="type==='shield'">
   <path d="M7 65C23 63 37 61 53 57C68 53 76 51 84 50L89 51L95 50C112 52 119 56 137 59L173 63L174 66H7Z" fill="#aa8b5b" stroke="#d4b27c" stroke-width="1.2"/>
   <path d="M16 64C42 62 56 59 77 56L96 54L123 59L162 64M36 65L83 60L119 62L144 65" fill="none" stroke="#785e3b" stroke-width="1.5"/>
   <path d="M77 53L86 52L93 53L105 54" fill="none" stroke="#e6c58b" stroke-width="1.8"/>
  </g>
  <g v-else-if="type==='composite'">
   <path d="M12 66L33 58L53 47L69 32L82 14L87 17L93 13L105 31L119 43L143 57L169 66Z" fill="#a18150" stroke="#d4b27c" stroke-width="1.2"/>
   <path d="M82 15L75 35L64 44L82 36L87 23L94 29L108 40L99 26L93 14L88 18Z" fill="#cdb28b"/>
   <path d="M45 61L64 51L73 43M88 39L82 58L76 66M103 40L113 53L129 63M60 61L70 53M99 51L104 66" fill="none" stroke="#7e623b" stroke-width="1.5"/>
  </g>
  <g v-else>
   <path d="M25 66L48 51L75 29L82 24L88 29L97 25L105 30L132 51L155 66Z" fill="#a38351" stroke="#d4b27c" stroke-width="1.2"/>
   <path d="M75 29L82 25L88 30L97 26L106 31L96 34L87 34Z" fill="#4e3e2e"/>
   <path d="M48 57L67 45L77 36M84 38L77 54L68 65M102 38L113 50L126 64M95 48L98 65" fill="none" stroke="#7d613a" stroke-width="1.5"/>
   <path d="M48 53L76 32L82 29" fill="none" stroke="#d9ba89" stroke-width="1.5"/>
  </g>
 </svg>
</template>
