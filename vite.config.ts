/** Pages 与 Vercel 共用构建；Cesium 的 Worker/纹理必须随 base 路径部署。 */
import {defineConfig,loadEnv} from 'vite';
import vue from '@vitejs/plugin-vue';
import {viteStaticCopy} from 'vite-plugin-static-copy';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');const base=env.VITE_BASE_PATH||'/';
 return {base,plugins:[vue(),viteStaticCopy({targets:[{src:'node_modules/cesium/Build/Cesium/{Assets,Workers,Widgets,ThirdParty}',dest:'cesium'}]})],
   define:{CESIUM_BASE_URL:JSON.stringify(`${base}cesium/`)},build:{chunkSizeWarningLimit:1600},server:{host:'0.0.0.0'}};
});
