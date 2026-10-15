/** 目录先显示、详情后到达时，火山 ID 可能不变但图源会改变，必须重新加载图片。 */
import {ref,watch} from 'vue';
export function usePhotoState(record:()=>{id:string;photos:{thumbnailUrl:string}[]}){
 const broken=ref(false),photoIndex=ref(0);
 watch(()=>record().id,()=>{photoIndex.value=0;broken.value=false;});
 watch(()=>record().photos[photoIndex.value]?.thumbnailUrl,()=>{broken.value=false;});
 return {broken,photoIndex};
}
